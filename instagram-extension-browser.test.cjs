const {chromium}=require('playwright');
const path=require('path');
const fs=require('fs');
const assert=require('assert/strict');
(async()=>{
 const extension=path.resolve(process.env.IU_EXTENSION_DIR||'instagram-chrome-eklentisi');
 const storeAssets=process.env.IU_STORE_ASSETS;
 const context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(require('os').tmpdir(),'iu-extension-test-')),{channel:'chromium',headless:true,acceptDownloads:true,locale:'tr-TR',viewport:storeAssets?{width:1280,height:800}:{width:1440,height:1000},args:["--enable-unsafe-extension-debugging",`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 const requests=[];const mutated=new Set();
 let releaseScan;let scanBegan;
 const scanStarted=new Promise(resolve=>scanBegan=resolve);
 const scanGate=new Promise(resolve=>releaseScan=resolve);
 let holdScan=true;
 let rateLimitList=false;
 let mutationHTML=false;
 try {
 await context.route('https://www.instagram.com/**',async route=>{
  const request=route.request();const url=request.url();requests.push({url,method:request.method()});
  let json;
  if(url.includes('/api/v1/users/99/info/')) return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({message:'Please wait a few minutes'})});
  else if(url.includes('/api/v1/friendships/99/following/')) {
   if(rateLimitList)return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({message:'Please wait a few minutes'})});
   if(holdScan){scanBegan();await scanGate;holdScan=false;}
   json={status:'ok',users:[{pk:'1',username:'ornek_hesap',full_name:'Örnek Hesap'},{pk:'2',username:'gezgin_notlari',full_name:'Gezgin Notları'}].filter(u=>!mutated.has(String(u.pk))),has_more:false,next_max_id:'terminal-cursor'};
  }
  else if(url.includes('/api/v1/friendships/destroy/') || url.includes('/web/friendships/')){
   assert.ok(url.includes('/api/v1/friendships/destroy/'));assert.equal(request.postData(),'user_id='+url.split('/').at(-2));assert.equal(request.headers()['x-asbd-id'],'129477');
   if(mutationHTML)return route.fulfill({contentType:'text/html',body:'<html>private-test-response</html>'});
   mutated.add(url.split('/').at(-2));json={status:'ok',friendship_status:{following:false}};
  }
  else if(url.includes('/api/v1/friendships/show/'))json={status:'ok',following:!mutated.has(url.split('/').at(-2))};
  if(json)return route.fulfill({contentType:'application/json',body:JSON.stringify(json)});
  return route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:"></head><body>Mock Instagram — no real account</body></html>'});
 });
 await context.addCookies([{name:'ds_user_id',value:'99',url:'https://www.instagram.com'},{name:'csrftoken',value:'fake-test-token',url:'https://www.instagram.com'}]);
 const page=await context.newPage();
 page.on('console',msg=>console.log('Page:',msg.type(),msg.text()));
 page.on('pageerror',error=>console.log('Page error:',error.message));
 await page.goto('https://www.instagram.com/');
 let worker=context.serviceWorkers()[0];if(!worker)worker=await context.waitForEvent('serviceworker');
 console.log('Loaded:',worker.url());
 // First-install help can steal activeTab focus; finish that UI before triggering the action.
 await worker.evaluate(async()=>{
  for(let n=0;n<60;n++){
   const tabs=await chrome.tabs.query({});const help=tabs.find(t=>t.url?.startsWith(chrome.runtime.getURL('help.html')));
   if(help){await chrome.tabs.remove(help.id);return;}
   await new Promise(r=>setTimeout(r,50));
  }
  // Some Chromium test distributions do not dispatch onInstalled for --load-extension.
 });
 worker.on('console',msg=>console.log('Worker:',msg.type(),msg.text()));
 const cdp=await context.newCDPSession(page);
 const browserCdp=await context.browser().newBrowserCDPSession();
 const {targetInfo}=await cdp.send('Target.getTargetInfo');
 const extensionId=new URL(worker.url()).hostname;
 const allTargets=await browserCdp.send('Target.getTargets',{filter:[{type:'tab',exclude:false}]});
 const tabTarget=allTargets.targetInfos.find(t=>t.url==='https://www.instagram.com/');
 console.log('Tab target:',tabTarget?.type,tabTarget?.targetId);
 const trigger=async()=>{await page.bringToFront();await browserCdp.send('Extensions.triggerAction',{id:extensionId,targetId:tabTarget?.targetId||targetInfo.targetId});};
 await trigger();
 try{await page.locator('.iu-panel').waitFor({timeout:6000});}catch(error){console.log('Launch diagnostics:',await worker.evaluate(async()=>({tabs:(await chrome.tabs.query({})).map(t=>({id:t.id,url:t.url})),action:typeof openInstagramTool,logEvents:typeof LOG_EVENTS})));throw error;}
 assert.equal(requests.filter(r=>r.method==='POST').length,0,'Opening must not mutate account');
 await page.locator('[data-action="settings"]').click();
 await page.locator('[data-setting="unfollowDelayMin"]').fill('4500');
 await page.locator('[data-confirm]').click();
 await page.locator('.iu-toast').waitFor();
 await page.locator('[data-action="settings"]').click();
 await page.locator('[data-extra]').click();
 assert.equal(await page.locator('[data-setting="unfollowDelayMin"]').inputValue(),'4000');
 await page.locator('[data-cancel]').click();
 await page.locator('[data-action="settings"]').click();
 assert.equal(await page.locator('[data-setting="unfollowDelayMin"]').inputValue(),'4500','Cancel must not apply restored defaults');
 await page.locator('[data-extra]').click();
 await page.locator('[data-setting="scanDelayMax"]').fill('500');
 await page.locator('[data-confirm]').click();
 assert.equal(await page.locator('.iu-dialog').count(),1,'Invalid min/max must keep settings open');
 await page.locator('[data-setting="scanDelayMax"]').fill('1300');
 await page.locator('[data-setting="unfollowDelayMax"]').fill('3000000000000');
 await page.locator('[data-confirm]').click();
 assert.equal(await page.locator('.iu-dialog').count(),1,'Browser timer overflow values must be rejected');
 await page.locator('[data-setting="unfollowDelayMax"]').fill('4800');
 assert.equal(await page.locator('[data-setting="unfollowPauseMs"]').inputValue(),'300000');
 await page.locator('[data-confirm]').click();
 assert.equal(await page.locator('.iu-dialog').count(),0);
 await page.locator('[data-action="scan"]').click();
 await scanStarted;
 const secondPage=await context.newPage();await secondPage.goto('https://www.instagram.com/?iu-test=second');
 await secondPage.bringToFront();
 const targets2=await browserCdp.send('Target.getTargets',{filter:[{type:'tab',exclude:false}]});
 const secondTarget=targets2.targetInfos.find(t=>t.url===secondPage.url());
 await browserCdp.send('Extensions.triggerAction',{id:extensionId,targetId:secondTarget.targetId});
 await secondPage.locator('[data-action="scan"]').waitFor();
 await secondPage.locator('[data-action="scan"]').click();
 await secondPage.locator('.iu-toast').waitFor();
 assert.match(await secondPage.locator('.iu-toast').innerText(),/Başka bir Instagram sekmesinde/);
 assert.equal(requests.filter(r=>r.url.includes('/friendships/99/following/')).length,1,'Second tab must not start another scan');
 releaseScan();
 await page.locator('[data-action="select-all"]').waitFor();
 assert.equal(await page.locator('[data-row]').count(),2);
 await page.locator('[data-action="select-all"]').click();
 await page.locator('[data-search]').fill('gezgin');
 assert.equal(await page.locator('[data-row]').count(),1);
 assert.match(await page.locator('[data-selected-label]').innerText(),/1/);
 await page.locator('[data-search]').fill('');
 assert.equal(await page.locator('[data-select="1"]').isChecked(),false,'Search must clear selection of hidden rows');
 assert.equal(requests.filter(r=>r.url.includes('/info/')).length,0,'No profile metadata request may block the original list scan');
 await page.locator('[data-action="select-all"]').click();
 await page.locator('[data-row="1"] .iu-row-sub').click();
 assert.equal(await page.locator('[data-select="1"]').isChecked(),false);
 await trigger();
 assert.equal(await page.locator('[data-row]').count(),2,'Reopen preserves results');
 assert.equal(await page.locator('[data-select="2"]').isChecked(),true);
 await page.screenshot({path:storeAssets?path.join(storeAssets,'01-takip-listesi.png'):'instagram-eklenti-arayuz.png'});
 await page.locator('[data-action="unfollow"]').click();
 await page.locator('.iu-operation-preview').waitFor();assert.match(await page.locator('.iu-operation-preview').innerText(),/Eligible remaining targets|Uygun ve kalan hedef/);assert.ok(await page.locator('.iu-final-review').innerText());
 if(storeAssets)await page.screenshot({path:path.join(storeAssets,'02-onay.png')});
 assert.equal(requests.filter(r=>r.method==='POST').length,0,'Confirmation is mandatory');
 await page.locator('[data-confirm]').click();
 await page.locator('[data-action="back-results"]').waitFor({timeout:10000});
 assert.equal(requests.filter(r=>r.method==='POST').length,1);
 assert.equal(requests.filter(r=>r.url.includes('/friendships/show/')).length,2);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action="download-report"]').click()]);
 const reportText=fs.readFileSync(await download.path(),'utf8');
 const report=JSON.parse(reportText);
 assert.equal(report.planned,report.confirmed+report.failed+report.uncertain+report.notProcessed);assert.equal(report.confirmed,1);assert.equal(report.notConfirmed,0);assert.equal(report.notProcessed,0);assert.equal(report.planned,1);
 assert.equal(report.accounts[0].status,'confirmed');assert.ok(!reportText.includes('fake-test-token'));
 assert.equal(report.schemaVersion,2);
 assert.equal(report.accounts[0].diagnostics.mutation.httpStatus,200);
 assert.equal(report.accounts[0].diagnostics.verification.responseKind,'json');
 await page.locator('[data-action="back-results"]').click();
 assert.equal(await page.locator('[data-row]').count(),1);
 mutationHTML=true;
 await page.locator('[data-action="select-all"]').click();
 await page.locator('[data-action="unfollow"]').click();
 await page.locator('[data-confirm]').click();
 await page.locator('[data-action="download-report"]').waitFor();
 assert.match(await page.locator('[data-progress-note]').innerText(),/HTML.*HTTP 200/);
 const [failureDownload]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action="download-report"]').click()]);
 const failureText=fs.readFileSync(await failureDownload.path(),'utf8');const failureReport=JSON.parse(failureText);
 assert.equal(failureReport.planned,failureReport.confirmed+failureReport.failed+failureReport.uncertain+failureReport.notProcessed);assert.equal(failureReport.uncertain,1);assert.equal(failureReport.confirmed,0);assert.equal(failureReport.accounts[0].diagnostics.mutation.responseKind,'html');
 assert.ok(!failureText.includes('private-test-response'));
 assert.equal(requests.filter(r=>r.method==='POST').length,2,'Ambiguous mutation must not be retried');
 await page.locator('[data-action="back-results"]').click();
 // A previous uncertain target must be excluded before any second confirmation.
 await page.locator('[data-action="unfollow"]').click();
 await page.waitForFunction(()=>document.querySelector('.iu-toast')?.textContent.includes('Uygun hedef yok')||document.querySelector('.iu-toast')?.textContent.includes('No eligible targets'));
 assert.equal(await page.locator('.iu-dialog').count(),0);assert.equal(requests.filter(r=>r.method==='POST').length,2);
 // A new completed scan makes an explicit retry reviewable; use only the still-followed uncertain target 1 for the cancellation race.
 await page.locator('[data-action="new-scan"]').click();await page.locator('[data-action="scan"]').click();await page.locator('[data-row="1"]').waitFor();await page.locator('[data-select="1"]').check();
 await worker.evaluate(async()=>{for(let n=0;n<200;n++){if(!(await chrome.storage.session.get(OPERATION_KEY))[OPERATION_KEY])return;await new Promise(r=>setTimeout(r,10))}throw Error('Scan ownership was not released')});
 // Cancel while the worker is checking ownership, before a POST can be sent.
 await worker.evaluate(()=>{
  const original=handleOperation;
  globalThis.auditCheckHeld=false;
  const gate=new Promise(resolve=>globalThis.auditReleaseCheck=resolve);
  handleOperation=async(message,sender)=>{
   if(message.type==='IU_OPERATION_CHECK'){globalThis.auditCheckHeld=true;await gate;}
   return original(message,sender);
  };
 });
 mutationHTML=false;
 await page.locator('[data-action="unfollow"]').click();
 await page.locator('[data-confirm]').click();
 await page.locator('[data-action="cancel-unfollow"]').waitFor({timeout:10000}).catch(async error=>{console.log('Cancellation test UI:',await page.locator('[data-body]').innerText());console.log('Cancellation test requests:',JSON.stringify(requests.slice(-8)));throw error});
 const ownershipHeld=await worker.evaluate(async()=>{for(let n=0;n<300&&!globalThis.auditCheckHeld;n++)await new Promise(r=>setTimeout(r,10));return globalThis.auditCheckHeld});assert.ok(ownershipHeld,'Ownership check was not held; UI: '+await page.locator('[data-body]').innerText());
 await page.locator('[data-action="cancel-unfollow"]').click();
 await worker.evaluate(()=>globalThis.auditReleaseCheck());
 await page.locator('[data-action="back-results"]').waitFor();
 assert.equal(requests.filter(r=>r.method==='POST').length,2,'Cancel during ownership check must prevent mutation');
 await page.locator('[data-action="back-results"]').click();
 await page.locator('[data-action="minimize"]').click();
 await trigger();
 await page.locator('.iu-panel').waitFor();
 assert.equal(await page.locator('[data-row]').count(),1,'Reopening a minimized panel preserves results');
 await page.locator('[data-action="close"]').click();
 await trigger();
 await page.locator('[data-action="scan"]').waitFor();
 rateLimitList=true;
 await page.locator('[data-action="scan"]').click();
 await page.getByText(/HTTP 429/).waitFor();
 const [logPage]=await Promise.all([context.waitForEvent('page'),page.locator('[data-action="live-log"]').click()]);
 await logPage.waitForURL('**/logs.html');
 await logPage.getByText('HTTP 429',{exact:false}).first().waitFor();
 if(storeAssets)await logPage.screenshot({path:path.join(storeAssets,'03-canli-gunluk.png')});
 const logs=await worker.evaluate(async()=>(await chrome.storage.session.get('iu_live_log_v1')).iu_live_log_v1);
 assert.ok(logs.some(e=>e.status===429&&e.route==='following'));
 assert.ok(logs.some(e=>e.method==='POST'&&e.responseKind==='json'));
 assert.ok(logs.some(e=>e.event==='scan.error'&&e.reason==='rate'&&e.status===429),'Scan failures must be logged with their actual reason');
 assert.ok(logs.some(e=>e.event==='unfollow.result'&&e.outcome==='complete'&&e.confirmed===1),'Only independently verified success is logged as confirmed');
 assert.ok(logs.some(e=>e.event==='unfollow.result'&&e.outcome==='stopped'&&e.responseKind==='html'&&e.status===200),'An HTTP 200 HTML response must remain unconfirmed in the live log');
 assert.ok(!JSON.stringify(logs).includes('fake-test-token'));
 const [logDownload]=await Promise.all([logPage.waitForEvent('download'),logPage.locator('#download').click()]);
 const logExport=JSON.parse(fs.readFileSync(await logDownload.path(),'utf8'));
 assert.ok(logExport.entries.some(e=>e.status===429));
 assert.equal(logExport.extensionVersion,JSON.parse(fs.readFileSync(path.join(extension,'manifest.json'))).version);
 await logPage.locator('#errors').check();
 assert.ok(await logPage.locator('tbody tr.error').count()>0);
 const storage=await worker.evaluate(async()=>({permissions:await chrome.permissions.getAll(),keys:Object.keys(await chrome.storage.local.get(null))}));
 assert.ok(storage.permissions.permissions.includes('activeTab'));
 const expectedOrigins=JSON.parse(fs.readFileSync(path.join(extension,'manifest.json'),'utf8')).host_permissions||[];
 assert.deepEqual(storage.permissions.origins,expectedOrigins);
 assert.ok(storage.keys.includes('iu_all_following_state_v1'));
 const lock=await worker.evaluate(async()=>await chrome.storage.session.get('iu_active_operation_v1'));
 assert.equal(lock.iu_active_operation_v1,undefined,'Finished operation releases lock');
 rateLimitList=false;
 await page.locator('[data-action="scan"],[data-action="resume-scan"]').first().click();await page.locator('[data-row="1"]').waitFor();
 await worker.evaluate(async()=>{const key=IUWorkspace.KEY,stored=await chrome.storage.local.get(key),db=IUWorkspace.parse(stored[key]),a=IUWorkspace.account(db,'99');a.meta['1']={protected:true};a.meta['2']={protected:true};db.revision++;await chrome.storage.local.set({[key]:JSON.stringify(db)})});
 const postsBeforeProtection=requests.filter(r=>r.method==='POST').length;
 await page.locator('[data-action="select-all"]').click();await page.locator('[data-action="unfollow"]').click();
 await page.locator('.iu-toast').filter({hasText:/korumalı|Koruma ve önceki|protected|No eligible/}).waitFor();assert.equal(await page.locator('.iu-dialog').count(),0);assert.equal(requests.filter(r=>r.method==='POST').length,postsBeforeProtection,'Workspace protection must prevent actual mutation dispatch');
 console.log('PASS: real MV3 install, settings, scan, cross-tab lock, verification, report, live HTTP log UI/export, redaction, minimize and close. All Instagram requests intercepted.');
 }finally{await context.close();}
})().catch(error=>{console.error(error);process.exit(1)});
