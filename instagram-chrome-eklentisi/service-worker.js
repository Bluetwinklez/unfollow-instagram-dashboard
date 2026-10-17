"use strict";
importScripts("log-bridge-config.js");

async function showHelp(tabId, reason = "site") {
  if (Number.isInteger(tabId)) {
    await chrome.action.setBadgeBackgroundColor({ tabId, color: "#bd3838" });
    await chrome.action.setBadgeText({ tabId, text: "IG" });
    await chrome.action.setTitle({ tabId, title: reason === "site" ? "Instagram sekmesini açıp tekrar tıkla" : "Panel açılamadı — kullanım sayfasını kontrol et" });
  }
  await chrome.tabs.create({ url: chrome.runtime.getURL("help.html") + "?reason=" + reason });
}

async function openInstagramTool(tab) {
  if (!Number.isInteger(tab?.id)) return;
  try {
    const [check] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "ISOLATED",
      func: () => location.origin === "https://www.instagram.com"
    });
    if (check?.result !== true) {
      await showHelp(tab.id);
      return;
    }
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "ISOLATED",
      files: ["platform.js", "content.js"]
    });
    if (!injection?.result?.ok) {
      await showHelp(tab.id, injection?.result?.reason === "storage" ? "storage" : "launch");
      return;
    }
    await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
    await chrome.action.setTitle({ tabId: tab.id, title: "Instagram takip listesini göster" });
  } catch (error) {
    console.error("[Instagram Takip Yönetimi] Panel açılamadı:", error?.message || "Bilinmeyen hata");
    try { await showHelp(tab.id, "launch"); }
    catch { console.error("[Instagram Takip Yönetimi] Yardım sayfası açılamadı."); }
  }
}

chrome.action.onClicked.addListener(openInstagramTool);
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;
  try { await chrome.tabs.create({ url: chrome.runtime.getURL("help.html") }); }
  catch { console.error("[Instagram Takip Yönetimi] Kullanım sayfası açılamadı."); }
});

// Only short-lived synchronization jobs live in memory. The operation owner is
// stored in storage.session so a service-worker restart cannot reset the lock.
const operationJobs = [];
let drainingOperations = false;
const OPERATION_KEY = "iu_active_operation_v1";

function queueOperation(task) {
  return new Promise(resolve => {
    operationJobs.push({ task, resolve });
    void drainOperations();
  });
}

async function drainOperations() {
  if (drainingOperations) return;
  drainingOperations = true;
  try {
    while (operationJobs.length) {
      const { task, resolve } = operationJobs.shift();
      try { resolve(await task()); }
      catch { resolve({ ok: false, reason: "connection" }); }
    }
  } finally { drainingOperations = false; }
}

function validSender(sender) {
  if (sender.id !== chrome.runtime.id || sender.frameId !== 0 || !Number.isInteger(sender.tab?.id)) return false;
  try { return new URL(sender.url).origin === "https://www.instagram.com"; }
  catch { return false; }
}

async function handleOperation(message, sender) {
  if (!validSender(sender) || typeof message.token !== "string" || !message.token || message.token.length > 100) return { ok: false, reason: "sender" };
  const stored = await chrome.storage.session.get(OPERATION_KEY);
  const owner = stored[OPERATION_KEY];
  const owns = owner?.tabId === sender.tab.id && owner?.token === message.token;
  if (message.type === "IU_OPERATION_RELEASE") {
    if (owns) await chrome.storage.session.remove(OPERATION_KEY);
    return { ok: owns };
  }
  if (message.type === "IU_OPERATION_CHECK") return { ok: owns };
  if (!/^\d{1,30}$/.test(String(message.viewerId)) || !["scan", "unfollow"].includes(message.kind)) return { ok: false, reason: "request" };
  if (owner) {
    let active = false;
    try {
      const reply = await chrome.tabs.sendMessage(owner.tabId, { type: "IU_OPERATION_PROBE", token: owner.token }, { frameId: 0 });
      active = reply?.active === true;
    } catch { /* The owning page closed or navigated. */ }
    if (active) return { ok: false, reason: "busy" };
  }
  await chrome.storage.session.set({ [OPERATION_KEY]: { tabId: sender.tab.id, token: message.token, viewerId: String(message.viewerId), kind: message.kind } });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (["IU_LOG_APPEND", "IU_LOG_CLEAR", "IU_LOG_OPEN"].includes(message?.type)) {
    void (async () => { sendResponse(await queueOperation(() => handleLogMessage(message, sender))); })();
    return true;
  }
  if (!["IU_OPERATION_CLAIM", "IU_OPERATION_CHECK", "IU_OPERATION_RELEASE"].includes(message?.type)) return false;
  void (async () => { sendResponse(await queueOperation(() => handleOperation(message, sender))); })();
  return true;
});

const LOG_KEY = "iu_live_log_v1";
const LOG_EVENTS = new Set(["request.start","request.end","request.error","operation.start","operation.end","operation.busy","scan.page","scan.error","scan.pause","scan.resume","scan.cancel","unfollow.pause","unfollow.resume","unfollow.cancel","panel.close","storage.error"]);

function cleanLog(raw, tabId) {
  if (!raw || !LOG_EVENTS.has(raw.event)) return null;
  const entry = { at: new Date().toISOString(), tabId, event: raw.event, level:"info" };
  for (const field of ["status","durationMs","loaded","total","confirmed"]) {
    if (Number.isFinite(raw[field]) && raw[field] >= 0) entry[field] = Math.min(1e9, Math.round(raw[field]));
  }
  if (["GET","POST"].includes(raw.method)) entry.method = raw.method;
  if (["following","followers","unfollow","verify","other"].includes(raw.route)) entry.route = raw.route;
  if (["json","html","empty","text"].includes(raw.responseKind)) entry.responseKind = raw.responseKind;
  if (typeof raw.redirected === "boolean") entry.redirected = raw.redirected;
  if (["complete","cancelled","stopped","results","idle","running"].includes(raw.outcome)) entry.outcome = raw.outcome;
  if (["rate","session","blocked","network","http","cancelled","incomplete","account","unknown","aborted","response"].includes(raw.reason)) entry.reason = raw.reason;
  if (typeof raw.requestId === "string" && /^[a-zA-Z0-9-]{1,40}$/.test(raw.requestId)) entry.requestId = raw.requestId;
  if (entry.status >= 400 || raw.event.endsWith("error")) entry.level="error";
  else if (raw.event.endsWith("cancel") || raw.event === "operation.busy" || raw.outcome === "stopped") entry.level="warn";
  return entry;
}

async function forwardLog(entry) {
  let connected = false;
  try {
    const response = await fetch("http://127.0.0.1:18765/events", {
      method:"POST", headers:{"content-type":"application/json","authorization":"Bearer " + IU_LOG_BRIDGE.token},
      body:JSON.stringify(entry), signal:AbortSignal.timeout(1000)
    });
    connected = response.ok;
  } catch { /* Local bridge is optional; the in-browser log remains available. */ }
  try { await chrome.storage.session.set({iu_log_bridge_state:{connected,at:new Date().toISOString()}}); }
  catch { /* Diagnostic delivery cannot affect the account operation. */ }
}

async function handleLogMessage(message, sender) {
  if (message.type === "IU_LOG_CLEAR") {
    if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("logs.html")) return {ok:false};
    await chrome.storage.session.set({[LOG_KEY]:[]});
    return {ok:true};
  }
  if (!validSender(sender)) return {ok:false};
  if (message.type === "IU_LOG_OPEN") {
    await chrome.tabs.create({url:chrome.runtime.getURL("logs.html")});return {ok:true};
  }
  const entry=cleanLog(message.entry,sender.tab.id);
  if (!entry) return {ok:false};
  const stored=await chrome.storage.session.get(LOG_KEY);
  const entries=Array.isArray(stored[LOG_KEY])?stored[LOG_KEY]:[];
  await chrome.storage.session.set({[LOG_KEY]:[...entries,entry].slice(-500)});
  void forwardLog(entry);
  return {ok:true};
}

chrome.tabs.onRemoved.addListener(tabId => {
  void queueOperation(async () => {
    const stored = await chrome.storage.session.get(OPERATION_KEY);
    if (stored[OPERATION_KEY]?.tabId === tabId) await chrome.storage.session.remove(OPERATION_KEY);
    return { ok: true };
  });
});
