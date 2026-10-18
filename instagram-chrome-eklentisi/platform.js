// One coordinator per isolated content-script world, including panel reopenings.
(() => {
  "use strict";
  if (globalThis.__iuPlatform) return;
  let activeClaim = null;
  const writes = [];
  const waiters = [];
  let writing = false;

  async function drainWrites() {
    if (writing) return;
    writing = true;
    try {
      while (writes.length) {
        const job = writes.shift();
        try {
          if (job.remove) await chrome.storage.local.remove(job.key);
          else await chrome.storage.local.set({ [job.key]: job.value });
        } catch {
          job.failed();
        }
      }
    } finally {
      writing = false;
      for (const resolve of waiters.splice(0)) resolve();
    }
  }

  function flushWrites() {
    if (!writing && !writes.length) return Promise.resolve();
    return new Promise(resolve => waiters.push(resolve));
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "IU_OPERATION_PROBE") return false;
    if (sender.id !== chrome.runtime.id) return false;
    sendResponse({ active: Boolean(activeClaim && activeClaim.token === message.token) });
    return false;
  });

  globalThis.__iuPlatform = {
    async openWorkspace(){try{await chrome.runtime.sendMessage({type:"IU_WORKSPACE_OPEN"})}catch{}},
    async saveSnapshot(snapshot){try{const result=await chrome.runtime.sendMessage({type:"IU_WORKSPACE_CAPTURE",snapshot});if(!result?.ok)await this.log({event:"storage.error"});}catch{await this.log({event:"storage.error"});}},
    async protectedIds(viewer){const stored=await chrome.storage.local.get("iu_workspace_v1");const value=JSON.parse(stored.iu_workspace_v1||"{}");return Object.entries(value.accounts?.[viewer]?.meta||{}).filter(([,meta])=>meta.protected===true).map(([id])=>id);},
    async isProtected(viewer,id){const stored=await chrome.storage.local.get("iu_workspace_v1");let value;try{value=JSON.parse(stored.iu_workspace_v1||"{}")}catch{throw Error("Invalid workspace protection data")};return value.accounts?.[viewer]?.meta?.[id]?.protected===true;},
    async log(entry) {
      try { await chrome.runtime.sendMessage({type:"IU_LOG_APPEND",entry}); }
      catch { /* Diagnostics must never retry or interrupt account actions. */ }
    },
    async openLog() {
      try { await chrome.runtime.sendMessage({type:"IU_LOG_OPEN"}); }
      catch { console.error("[iu] Canlı günlük açılamadı."); }
    },
    async createStorage(keys, onError) {
      await flushWrites();
      const values = await chrome.storage.local.get(keys);
      let failed = false;
      const warn = () => {
        failed = true;
        try { onError?.(); } catch { /* Error reporting must not break the writer. */ }
      };
      return {
        getItem(key) { return values[key] ?? null; },
        setItem(key, value) {
          values[key] = value;
          writes.push({ key, value, failed: warn });
          void drainWrites();
        },
        removeItem(key) {
          delete values[key];
          writes.push({ key, remove: true, failed: warn });
          void drainWrites();
        },
        async flush() { await flushWrites(); return !failed; }
      };
    },
    async claim(viewerId, kind) {
      if (activeClaim) return { ok: false, reason: "busy" };
      const claim = { type: "IU_OPERATION_CLAIM", viewerId, kind, token: crypto.randomUUID() };
      activeClaim = claim;
      try {
        const result = await chrome.runtime.sendMessage(claim);
        if (!result?.ok) activeClaim = null;
        return result || { ok: false, reason: "connection" };
      } catch {
        activeClaim = null;
        return { ok: false, reason: "connection" };
      }
    },
    async assertOwnership() {
      const claim = activeClaim;
      if (!claim) return false;
      try {
        const result = await chrome.runtime.sendMessage({ type: "IU_OPERATION_CHECK", token: claim.token });
        return result?.ok === true;
      } catch { return false; }
    },
    async release() {
      const claim = activeClaim;
      if (!claim) return;
      activeClaim = null;
      try { await chrome.runtime.sendMessage({ type: "IU_OPERATION_RELEASE", token: claim.token }); }
      catch { /* A stale lock is recovered by probing the owning tab. */ }
    }
  };
})();
