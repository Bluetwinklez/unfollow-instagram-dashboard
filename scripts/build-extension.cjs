const fs=require('fs');
const path=require('path');
const dir=path.resolve('instagram-chrome-eklentisi');
const bridgeSettings=path.join(dir,'log-bridge-settings.json');
if(!fs.existsSync(bridgeSettings))fs.writeFileSync(bridgeSettings,JSON.stringify({token:require('crypto').randomBytes(32).toString('hex')})+'\n');
const bridge=JSON.parse(fs.readFileSync(bridgeSettings,'utf8'));
fs.writeFileSync(path.join(dir,'log-bridge-config.js'),'globalThis.IU_LOG_BRIDGE=Object.freeze('+JSON.stringify(bridge)+');\n');
let source=fs.readFileSync('instagram-tum-takipleri-birak.js','utf8').replace(/\r\n/g,'\n');
const testStart=source.indexOf('if (globalThis.__IU_TEST__)');
const boot=source.indexOf('cleanupExisting(); injectStyles(); mount();',testStart);
if(testStart<0||boot<0)throw new Error('Test-hook boundary missing');
source=source.slice(0,testStart)+source.slice(boot);
source=source.replaceAll('localStorage.', 'extensionStorage.');
// Keep the standalone console version intact; extension-specific coordination
// and reporting are bundled here from the same reviewed request implementation.
source=source.replace('async function startScan(options = {})', 'async function runScan(options = {})');
source=source.replace('async function startUnfollow()', 'async function runUnfollow()');
source=source.replace('async function igRequest(url, init = {}) {','async function rawIgRequest(url, init = {}) {');
const requestLogging=`async function igRequest(url, init = {}) {
 const requestId=crypto.randomUUID();const started=Date.now();
 const route=url.includes("/following/")?"following":url.includes("/followers/")?"followers":(url.includes("/destroy/")||url.includes("/unfollow/"))?"unfollow":url.includes("/show/")?"verify":"other";
 const method=init.method||"GET";
 void globalThis.__iuPlatform.log({event:"request.start",requestId,route,method});
 try {
  const result=await rawIgRequest(url,init);
  let responseKind=result.text.trim()?"text":"empty";
  try{JSON.parse(result.text);responseKind="json";}catch{if(/^\\s*</.test(result.text))responseKind="html";}
  void globalThis.__iuPlatform.log({event:"request.end",requestId,route,method,status:result.response.status,responseKind,redirected:Boolean(result.response.redirected),durationMs:Date.now()-started});
  return result;
 }catch(error){void globalThis.__iuPlatform.log({event:"request.error",requestId,route,method,reason:error?.name==="AbortError"?"aborted":"network",durationMs:Date.now()-started});throw error;}
}
`;
source=source.replace('async function rawIgRequest(url, init = {}) {',requestLogging+'async function rawIgRequest(url, init = {}) {');
const scanErrorBoundary='const message=error?.message||t("scanFailed");';
if(!source.includes(scanErrorBoundary))throw new Error('Scan error logging boundary missing');
source=source.replace(scanErrorBoundary,'void globalThis.__iuPlatform.log({event:"scan.error",reason:error?.kind||"unknown",status:error?.status}); '+scanErrorBoundary);
const unfollowResultBoundary='state.log.push({ user, ok: outcome.ok, reason: outcome.reason, diagnostics:outcome.diagnostics });';
if(!source.includes(unfollowResultBoundary))throw new Error('Unfollow result logging boundary missing');
source=source.replace(unfollowResultBoundary,unfollowResultBoundary+` void globalThis.__iuPlatform.log({event:"unfollow.result",route:"unfollow",outcome:outcome.ok?"complete":"stopped",reason:outcome.ok?undefined:"response",confirmed:state.log.filter(entry=>entry.ok).length,loaded:state.log.length,total:targets.length,status:(outcome.diagnostics?.verification||outcome.diagnostics?.mutation)?.httpStatus,responseKind:(outcome.diagnostics?.verification||outcome.diagnostics?.mutation)?.responseKind});`);
source=source.replace('checkpoint[cursorKey] = nextCursor; saveCheckpoint(checkpoint);','checkpoint[cursorKey] = nextCursor; saveCheckpoint(checkpoint); void globalThis.__iuPlatform.log({event:"scan.page",loaded:results.length,total});');
for(const kind of ['scan','unfollow']){
 source=source.replace('state.'+kind+'Paused = !state.'+kind+'Paused;', 'state.'+kind+'Paused = !state.'+kind+'Paused; void globalThis.__iuPlatform.log({event:state.'+kind+'Paused?"'+kind+'.pause":"'+kind+'.resume"});');
 source=source.replace('state.'+kind+'Cancelled = true; state.'+kind+'Paused = false; activeRequest?.abort();','void globalThis.__iuPlatform.log({event:"'+kind+'.cancel"}); state.'+kind+'Cancelled = true; state.'+kind+'Paused = false; activeRequest?.abort();');
}
const logButton='<button type="button" data-action="live-log" aria-label="Canlı günlük" title="Canlı günlük">≡</button> ';
source=source.replace('<button type="button" data-action="settings"',logButton+'<button type="button" data-action="settings"');
source=source.replace('function bindHeader(root) {','function bindHeader(root) {root.querySelector("[data-action=\'live-log\']")?.addEventListener("click",()=>void globalThis.__iuPlatform.openLog());');
// Response diagnostics and localized explanations are shared with the core.
const operations=`let operationStarting = false;
async function withExtensionOperation(kind, task) {
 if (destroyed || operationStarting || state.mode === "scanning" || state.mode === "unfollowing") return;
 operationStarting = true;
 let claimed = false;
 try {
  const viewerId = getCookie("ds_user_id");
  if (!viewerId) {toast(t("cookieMissing"));return;}
  const result = await globalThis.__iuPlatform.claim(viewerId, kind);
  if (!result?.ok) {void globalThis.__iuPlatform.log({event:"operation.busy"});toast(t(result?.reason === "busy" ? "otherOperation" : "lockLost"));return;}
  claimed = true;
  void globalThis.__iuPlatform.log({event:"operation.start",route:kind==="scan"?"following":"unfollow"});
  if (destroyed) return;
  if (kind === "scan") {
   extensionStorage = await globalThis.__iuPlatform.createStorage([STORAGE_KEY,CHECKPOINT_KEY], showStorageWarning);
   state.checkpoint = loadCheckpoint();
  }
  if (!destroyed) await task();
  void globalThis.__iuPlatform.log({event:"operation.end",outcome:kind==="scan"?(state.error?"stopped":state.scanCancelled?"cancelled":state.mode):state.unfollowOutcome,confirmed:state.log.filter(e=>e.ok).length});
 } catch {
  void globalThis.__iuPlatform.log({event:"operation.error",reason:"unknown",outcome:"stopped"});
  if (!destroyed) toast(t("lockLost"));
 } finally {
  try { if (claimed) await extensionStorage.flush(); }
  finally { if (claimed) await globalThis.__iuPlatform.release(); operationStarting = false; }
 }
}
async function startScan(options = {}) {return withExtensionOperation("scan", () => runScan(options));}
async function startUnfollow() {return withExtensionOperation("unfollow", () => runUnfollow());}
function downloadRunReport() {
 const confirmed = state.log.filter(entry => entry.ok);
 const logged = new Set(state.log.map(entry => entry.user.id));
 const skipped = state.users.filter(user => state.selected.has(user.id) && !logged.has(user.id));
 const report = {
  schemaVersion:2, extensionVersion:VERSION, scanScope:state.scanScope, exportedAt:new Date().toISOString(), accountId:state.viewerId,
  outcome:state.unfollowOutcome, planned:state.progress.total,
  confirmed:confirmed.length, notConfirmed:state.log.length-confirmed.length,
  notProcessed:skipped.length,
  accounts:[...state.log.map(entry => ({id:entry.user.id, username:entry.user.username, status:entry.ok?"confirmed":"not-confirmed", reason:entry.reason||"",diagnostics:entry.diagnostics||null})),
    ...skipped.map(user => ({id:user.id,username:user.username,status:"not-processed",reason:""}))]
 };
 const url = URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json;charset=utf-8"}));
 const link = document.createElement("a"); link.href = url;
 link.download = "instagram-takip-raporu-" + new Date().toISOString().replace(/[:.]/g,"-") + ".json";
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(() => URL.revokeObjectURL(url),1000);
}
`;
source=source.replace('async function runScan(options = {})',operations+'async function runScan(options = {})');
const postGuard='assertViewer();\n  const currentCsrf = getCookie("csrftoken");';
if(!source.includes(postGuard))throw new Error('POST ownership guard boundary missing');
source=source.replace(postGuard,`if (!await globalThis.__iuPlatform.assertOwnership()) throw Object.assign(new Error(t("lockLost")),{kind:"operation"});
  await waitWhile(() => state.unfollowPaused && !state.unfollowCancelled && !destroyed);
  if (destroyed || state.unfollowCancelled) return failed(t("cancelledUncertain"));
  assertViewer();
  const currentCsrf = getCookie("csrftoken");`);
source=source.replace('error?.kind === "account" ? error.message', '(error?.kind === "account" || error?.kind === "operation") ? error.message');
source=source.replace('function bindUnfollow(body) {', 'function bindUnfollow(body) { body.querySelector("[data-action=\'download-report\']")?.addEventListener("click", downloadRunReport);');
const backButton='<button type="button" class="iu-btn iu-btn--primary" data-action="back-results">${escapeHTML(t("goBack"))}</button>';
if(!source.includes(backButton))throw new Error('Report action boundary missing');
source=source.replace(backButton,backButton+' <button type="button" class="iu-btn" data-action="download-report">${escapeHTML(t("downloadReport"))}</button>');
source=source.replace('fail: state.log.filter((e) => !e.ok).length });','fail: state.log.filter((e) => !e.ok).length, remaining: Math.max(0,state.progress.total-state.log.length) });');
source=source.replace('const persisted = loadStored();',`Object.assign(I18N.tr,{otherOperation:"Başka bir Instagram sekmesinde işlem sürüyor. Önce o işlemi durdur veya bitmesini bekle.",lockLost:"Eklenti bağlantısı veya işlem izni kayboldu. Sayfayı yenileyip yeniden aç.",downloadReport:"Raporu indir",unfollowDoneBody:"{ok} doğrulandı · {fail} doğrulanamadı · {remaining} işlenmedi"});
Object.assign(I18N.en,{otherOperation:"Another Instagram tab is busy. Stop that operation or wait for it to finish.",lockLost:"Extension connection or operation ownership was lost. Reload the page and reopen the tool.",downloadReport:"Download report",unfollowDoneBody:"{ok} confirmed · {fail} unconfirmed · {remaining} not processed"});
const persisted = loadStored();`);
source=source.replace(/const VERSION = "[^"]+";/,'const VERSION = "2.8.4-extension";');
// Settings are a draft until Save, and success is shown only after storage flush.
const restore='Object.assign(state.timings, DEFAULT_TIMINGS); dialog.querySelectorAll("[data-setting]").forEach((input) => { const key = input.getAttribute("data-setting"); input.value = state.timings[key]; });';
if(!source.includes(restore))throw new Error('Settings restore boundary missing');
source=source.replace(restore,'dialog.querySelectorAll("[data-setting]").forEach((input) => { const key = input.getAttribute("data-setting"); input.value = DEFAULT_TIMINGS[key]; });');
source=source.replace('step="${step}" data-setting=', 'required step="1" data-setting=');
const settingsSave='dialog.querySelectorAll("[data-setting]").forEach((input) => { const key = input.getAttribute("data-setting"); const val = Number(input.value); const min = Number(input.min || 0); const max = input.max ? Number(input.max) : Infinity; if (Number.isFinite(val) && val >= min && val <= max) state.timings[key] = val; }); persist(); toast(t("saved"));';
if(!source.includes(settingsSave))throw new Error('Settings save boundary missing');
source=source.replace(settingsSave,`const inputs=[...dialog.querySelectorAll("[data-setting]")];
const draft={...state.timings};
for(const input of inputs){input.setCustomValidity("");const value=Number(input.value);if(!Number.isSafeInteger(value)||value>2147483647)input.setCustomValidity(state.language==="tr"?"0–2147483647 arasında bir tam sayı gir.":"Enter an integer from 0 to 2147483647.");if(!input.reportValidity())return false;draft[input.getAttribute("data-setting")]=value;}
for(const [minKey,maxKey] of [["scanDelayMin","scanDelayMax"],["unfollowDelayMin","unfollowDelayMax"]]){
 if(draft[minKey]>draft[maxKey]){const input=inputs.find(el=>el.getAttribute("data-setting")===maxKey);input.setCustomValidity(state.language==="tr"?"Maksimum süre minimum süreden küçük olamaz.":"Maximum delay cannot be less than minimum delay.");input.reportValidity();return false;}
}
Object.assign(state.timings,draft);persist();void(async()=>{if(await extensionStorage.flush())toast(t("saved"));})();`);
source=source.replace('try { onConfirm?.(dialog); } finally { close(); }', 'try { if (onConfirm?.(dialog) !== false) close(); } catch (error) { close(); console.error("[iu] Dialog action failed."); }');
source=source.replace(' onerror="this.style.visibility=\'hidden\'"', '');
source=source.replace('function mount() {',`function mount() {
 document.addEventListener("error", onAvatarError, true);`);
source=source.replace('function unmount() { if (destroyed) return;', 'function unmount() { if (destroyed) return; document.removeEventListener("error", onAvatarError, true);');
source=source.replace('function unmount() { if (destroyed) return;', 'function unmount() { if (destroyed) return; void globalThis.__iuPlatform.log({event:"panel.close"});');
source=source.replace('function mount() {',`function onAvatarError(event) {
 const target = event.target;
 if (target?.matches?.("#iu-app img.iu-avatar")) target.style.visibility="hidden";
}
function mount() {`);
source=source.replace('cleanupExisting(); injectStyles(); mount();', `cleanupExisting(); injectStyles(); mount();
globalThis.__iuExtensionOpen = () => {
 if (destroyed || !document.getElementById(APP_ID)) return false;
 if (state.minimized) setMinimized(false);
 return true;
};`);
const wrapper=`// Bundled local script. Runs only after an explicit extension action.
(async () => {
 "use strict";
 if (location.origin !== "https://www.instagram.com") return {ok:false};
 if (globalThis.__iuExtensionOpen?.()) return {ok:true};
 if (globalThis.__iuExtensionLoading) return {ok:true};
 globalThis.__iuExtensionLoading = true;
 try {
  function showStorageWarning() {
   void globalThis.__iuPlatform.log({event:"storage.error"});
   const root = document.getElementById("iu-app");
   if (!root || root.querySelector("#iu-storage-warning")) return;
   const warning=document.createElement("div");warning.id="iu-storage-warning";warning.setAttribute("role","alert");
   warning.textContent=String(navigator.language).startsWith("tr") ? "İlerleme veya ayarlar kaydedilemedi. Sayfayı yenilersen kayıtlar eksik olabilir." : "Could not save progress or settings. Reloading may lose progress.";
   warning.style.cssText="position:absolute;top:110px;right:20px;max-width:min(420px,calc(100vw - 40px));padding:14px 18px;background:#6b2424;color:#fff;border-radius:10px;pointer-events:auto;z-index:3";
   root.appendChild(warning);
  }
  let extensionStorage = await globalThis.__iuPlatform.createStorage(["iu_all_following_state_v1","iu_all_following_scan_v1"],showStorageWarning);
  ${source}
  return {ok:Boolean(document.getElementById("iu-app"))};
 } catch {
  return {ok:false,reason:"storage"};
 } finally {globalThis.__iuExtensionLoading = false;}
})();
`;
fs.writeFileSync(path.join(dir,'content.js'),wrapper);
console.log('Bundled v2.8.4 with redacted live diagnostics and optional authenticated loopback file logging.');
