"use strict";
importScripts("workspace-core.js");


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

async function ownerIsActive(owner) {
  let timer;
  try {
    const reply = await Promise.race([
      chrome.tabs.sendMessage(owner.tabId, { type: "IU_OPERATION_PROBE", token: owner.token }, { frameId: 0 }),
      new Promise(resolve => { timer = setTimeout(() => resolve({ active: true }), 2000); })
    ]);
    // A frozen owner is treated as busy: never transfer its right to send POSTs.
    return reply?.active === true;
  } catch { return false; /* Closed/navigated tabs have no active owner. */ }
  finally { clearTimeout(timer); }
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
    if (await ownerIsActive(owner)) return { ok: false, reason: "busy" };
  }
  await chrome.storage.session.set({ [OPERATION_KEY]: { tabId: sender.tab.id, token: message.token, viewerId: String(message.viewerId), kind: message.kind } });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
 if(message?.type==="IU_OPERATION_HISTORY_CLEAR"){
  void(async()=>sendResponse(await queueOperation(async()=>{
   if(sender.id!==chrome.runtime.id||sender.url!==chrome.runtime.getURL("workspace.html")||!/^\d+$/.test(String(message.accountId)))return {ok:false};
   const owner=(await chrome.storage.session.get(OPERATION_KEY))[OPERATION_KEY];if(owner)return {ok:false,reason:"busy"};
   const raw=(await chrome.storage.local.get("iu_operation_history_v1")).iu_operation_history_v1;let history;try{history=JSON.parse(raw||"[]")}catch{return {ok:false,reason:"invalid-history"}}if(!Array.isArray(history))return {ok:false};
   const keep=history.filter(e=>e.accountId!==message.accountId||e.category==="uncertain");await chrome.storage.local.set({iu_operation_history_v1:JSON.stringify(keep)});return {ok:true,retainedUncertain:keep.filter(e=>e.accountId===message.accountId).length};
  })))();return true;
 }
 if(message?.type==="IU_HEALTH_PING"){sendResponse({ok:sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL("workspace.html")});return false;}
  if(["IU_WORKSPACE_OPEN","IU_WORKSPACE_CAPTURE","IU_WORKSPACE_COMMIT","IU_WORKSPACE_RESTORE"].includes(message?.type)){
   void(async()=>sendResponse(await queueOperation(()=>handleWorkspace(message,sender))))();return true;
  }

  if (["IU_LOG_APPEND", "IU_LOG_CLEAR", "IU_LOG_OPEN"].includes(message?.type)) {
    void (async () => { sendResponse(await queueOperation(() => handleLogMessage(message, sender))); })();
    return true;
  }
  if (!["IU_OPERATION_CLAIM", "IU_OPERATION_CHECK", "IU_OPERATION_RELEASE"].includes(message?.type)) return false;
  void (async () => { sendResponse(await queueOperation(() => handleOperation(message, sender))); })();
  return true;
});

const LOG_CODES=new Set(["NETWORK_FAILURE","NETWORK_TIMEOUT","REQUEST_ABORTED","HTTP_UNAUTHORIZED","HTTP_FORBIDDEN","HTTP_NOT_FOUND","HTTP_RATE_LIMITED","HTTP_SERVER_ERROR","HTTP_ERROR","UNEXPECTED_HTML","INVALID_JSON","EMPTY_RESPONSE","GRAPHQL_APPLICATION_ERROR","GRAPHQL_PARTIAL_RESULT","UNEXPECTED_RESPONSE_SCHEMA","UNSUPPORTED_INTEGRATION","ACCOUNT_CONTEXT_CHANGED","TARGET_ID_MISMATCH","MUTATION_RESULT_UNCERTAIN","VERIFICATION_UNAVAILABLE","VERIFICATION_INCONCLUSIVE","OPERATION_LOCK_LOST","STORAGE_WRITE_FAILURE","RESPONSE_TOO_LARGE","APPLICATION_REJECTED","CURRENT_STATE_VERIFIED","CANCELLED_BEFORE_DISPATCH","VERIFIED_STILL_FOLLOWING","ALREADY_NOT_FOLLOWING"]);
const LOG_KEY = "iu_live_log_v1";
const LOG_EVENTS = new Set(["request.start","request.end","request.error","operation.start","operation.end","operation.error","operation.busy","scan.page","scan.error","scan.pause","scan.resume","scan.cancel","unfollow.pause","unfollow.resume","unfollow.cancel","unfollow.result","panel.close","storage.error"]);

function safeNetworkHeaders(headers){
 const result={};
 const rules={"content-type":/^(?:application\/(?:json|javascript|x-www-form-urlencoded)|text\/(?:html|plain|javascript))(?:;\s*charset=[a-z0-9-]+)?$/i,"content-length":/^\d{1,12}$/,"content-encoding":/^(?:gzip|br|zstd|deflate|identity)(?:,\s*(?:gzip|br|zstd|deflate|identity))*$/i,"x-ig-app-id":/^\d{1,20}[:,]?$/,"x-asbd-id":/^\d{1,10}$/,"accept":/^(?:\*\/\*|application\/json)$/,"retry-after":/^\d{1,8}$/,"x-content-type-options":/^nosniff$/i,"x-frame-options":/^(?:DENY|SAMEORIGIN)$/i,"cache-control":/^(?:(?:private|public|no-cache|no-store|must-revalidate|immutable|no-transform|s-maxage=\d+|max-age=\d+)(?:,\s*)?)+$/i};
 const add=(value,name)=>{name=String(name).toLowerCase();if(!/^[a-z0-9-]{1,64}$/.test(name)||Object.keys(result).length>=80)return;result[name]=typeof value==="string"&&value.length<=160&&Object.prototype.hasOwnProperty.call(rules,name)&&rules[name].test(value)?value:"[REDACTED]";};
 if(typeof headers?.forEach==="function")headers.forEach(add);else if(headers&&typeof headers==="object")for(const [name,value]of Object.entries(headers))add(value,name);
 return result;
}

function cleanLog(raw, tabId) {
  if (!raw || !LOG_EVENTS.has(raw.event)) return null;
  const entry = { at: new Date().toISOString(), tabId, event: raw.event, level:"info" }; if(LOG_CODES.has(raw.code))entry.code=raw.code;
  for (const field of ["status","durationMs","loaded","total","confirmed","responseLength"]) {
    if (Number.isFinite(raw[field]) && raw[field] >= 0) entry[field] = Math.min(1e9, Math.round(raw[field]));
  }
  for(const field of ["requestHeaders","responseHeaders"])if(raw[field]&&typeof raw[field]==="object")entry[field]=safeNetworkHeaders(raw[field]);
  if(typeof raw.htmlStructure==="string"&&raw.htmlStructure.length<=4000&&/^(?:<\/?(?:html|head|title|meta|link|body|script|style|div|span|form|input|button|a|h1|h2|p|noscript|other)>)*$/.test(raw.htmlStructure))entry.htmlStructure=raw.htmlStructure;
  if (["GET","POST"].includes(raw.method)) entry.method = raw.method;
  if (["following","followers","unfollow","verify","other"].includes(raw.route)) entry.route = raw.route;
  if (["json","html","empty","text"].includes(raw.responseKind)) entry.responseKind = raw.responseKind;
  if (typeof raw.redirected === "boolean") entry.redirected = raw.redirected;
  if (["application/json","text/html","text/javascript","application/javascript","text/plain","other"].includes(raw.contentType)) entry.contentType = raw.contentType;
  if (["unavailable","graphql","destroy","show","login","challenge","home","other-instagram","other-origin"].includes(raw.finalRoute)) entry.finalRoute = raw.finalRoute;
  if(raw.operationName==="usePolarisUnfollowMutation")entry.operationName=raw.operationName;
  if (["precheck","mutation","verification","scan"].includes(raw.stage)) entry.stage=raw.stage;
  if (["/api/graphql","/api/v1/friendships/destroy/{id}/","/api/v1/friendships/show/{id}/","/api/v1/friendships/{id}/following/","/api/v1/friendships/{id}/followers/","other"].includes(raw.requestPath)) entry.requestPath=raw.requestPath;
  for(const field of ["credentialsIncluded","csrfHeaderPresent","formBodyPresent"])if(typeof raw[field]==="boolean")entry[field]=raw[field];
  if(["timeout","response-too-large","account-changed","aborted","network"].includes(raw.errorKind))entry.errorKind=raw.errorKind;
  if(Array.isArray(raw.htmlSignals))entry.htmlSignals=[...new Set(raw.htmlSignals.filter(value=>["login-form","challenge-form","instagram-app-shell","not-found-title"].includes(value)))];
  if (["complete","cancelled","stopped","results","idle","running","completed_with_errors","complete_no_changes"].includes(raw.outcome)) entry.outcome = raw.outcome;
  if (["rate","session","blocked","network","http","cancelled","incomplete","account","unknown","aborted","response"].includes(raw.reason)) entry.reason = raw.reason;
  if (typeof raw.requestId === "string" && /^[a-zA-Z0-9-]{1,40}$/.test(raw.requestId)) entry.requestId = raw.requestId;
  if (entry.status >= 400 || raw.event.endsWith("error")) entry.level="error";
  else if (raw.event.endsWith("cancel") || raw.event === "operation.busy" || raw.outcome === "stopped" || raw.outcome === "completed_with_errors") entry.level="warn";
  return entry;
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

  return {ok:true};
}

chrome.tabs.onRemoved.addListener(tabId => {
  void queueOperation(async () => {
    const stored = await chrome.storage.session.get(OPERATION_KEY);
    if (stored[OPERATION_KEY]?.tabId === tabId) await chrome.storage.session.remove(OPERATION_KEY);
    return { ok: true };
  });
});

async function handleWorkspace(message,sender){
 const fromPage=sender.id===chrome.runtime.id && sender.url===chrome.runtime.getURL("workspace.html");
 if(message.type==="IU_WORKSPACE_OPEN"){
  if(!validSender(sender))return {ok:false};
  await chrome.tabs.create({url:chrome.runtime.getURL("workspace.html")});return {ok:true};
 }
 if(message.type==="IU_WORKSPACE_CAPTURE"&&!validSender(sender))return {ok:false};
 if(message.type==="IU_WORKSPACE_COMMIT"&&!fromPage)return {ok:false};
 const key=IUWorkspace.KEY;
 if(message.type==="IU_WORKSPACE_RESTORE"){
  if(!fromPage)return {ok:false};
  const old=(await chrome.storage.local.get(key))[key];
  if(old!==message.expectedRaw)return {ok:false,reason:"conflict"};
  try{IUWorkspace.parse(old);return {ok:false,reason:"not-corrupt"}}catch{}
  const replacement=IUWorkspace.parse(message.replacement);if(JSON.stringify(replacement).length>5_000_000)return {ok:false,reason:"quota"};
  // One atomic storage call retains the corrupt original alongside the replacement.
  await chrome.storage.local.set({iu_workspace_quarantine_v1:{at:new Date().toISOString(),raw:old},[key]:JSON.stringify(replacement)});
  return {ok:true,revision:replacement.revision};
 }
 const stored=await chrome.storage.local.get(key);const db=IUWorkspace.parse(stored[key]);
 if(message.type==="IU_WORKSPACE_CAPTURE")IUWorkspace.capture(db,message.snapshot);
 else{
  if(message.expectedRevision!==db.revision)return {ok:false,reason:"conflict"};
  const backup=IUWorkspace.validateBackup({schemaVersion:1,accountId:message.accountId,account:message.account});
  db.accounts[backup.accountId]=backup.account;db.revision++;
 }
 const encoded=JSON.stringify(db);if(encoded.length>7_000_000)return {ok:false,reason:"quota"};
 await chrome.storage.local.set({[key]:encoded});return {ok:true,revision:db.revision};
}
