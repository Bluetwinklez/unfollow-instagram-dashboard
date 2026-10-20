const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),W=require('./instagram-chrome-eklentisi/workspace-core.js');
(async()=>{
 const extension=path.resolve('extension'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'iu-completion-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,acceptDownloads:true,viewport:{width:1360,height:1000},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 let requests=0;const errors=[];await context.route('https://www.instagram.com/**',r=>{requests++;return r.abort()});
 try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker'),db=W.empty();
 W.capture(db,{viewerId:'99',scope:'nonfollowers',followingDone:true,followersDone:true,following:[{id:'1',username:'alpha',full_name:'ALPHA Person'},{id:'2',username:'beta',full_name:'Beta Person'},{id:'3',username:'gamma'}],followerIds:['2']});
 W.capture(db,{viewerId:'100',scope:'all',followingDone:true,following:[{id:'8',username:'different'}]});
 for(const a of Object.values(db.accounts)){a.onboarded=true;a.lastVersion=JSON.parse(fs.readFileSync('extension/manifest.json')).version}
 for (const account of Object.values(db.accounts)) account.preferences.language='tr';
 await worker.evaluate(async value=>chrome.storage.local.set({iu_workspace_v1:JSON.stringify(value)}),db);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(new URL('workspace.html',worker.url()).href);
 await page.locator('#chart-metric').selectOption('followers');await page.locator('[data-action="chart-range"]').click();assert.match(await page.locator('circle title').textContent(),/1$/);
 await page.locator('#range-from').fill('2099-01-01');await page.locator('[data-action="chart-range"]').click();assert.equal(await page.locator('.chart circle').count(),0);
 await page.locator('#range-from').fill('');await page.locator('[data-action="chart-range"]').click();
 await page.keyboard.press('/');await page.locator('#search').fill('ALP');await page.waitForTimeout(250);assert.equal(await page.locator('[data-select]').count(),1);assert.equal(await page.locator('mark').count(),2);
 await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement.dataset.select),'1');await page.keyboard.press('Space');assert.equal(await page.locator('[data-select="1"]').isChecked(),true);
 await page.locator('[data-action="search-clear"]').click();await page.locator('#title').click();await page.keyboard.press('x');assert.equal(await page.locator('[data-select]:checked').count(),0);await page.keyboard.press('s');assert.equal(await page.locator('[data-select]:checked').count(),3);
 await page.keyboard.press('p');await page.locator('#dialog-confirm').click();assert.equal(await page.locator('[data-select]:disabled').count(),3);await page.locator('#undo').click();await page.waitForFunction(()=>document.querySelectorAll('[data-select]:disabled').length===0);assert.equal(await page.locator('[data-select]:disabled').count(),0);
 await page.locator('[data-action="filter"]').click();assert.equal(await page.locator('.rule-row').count(),2);await page.locator('#dialog-confirm').click();assert.equal(await page.locator('[data-select]').count(),2);
 await page.locator('[data-action="filter"]').click();await page.locator('#rule-clear').check();await page.locator('#dialog-confirm').click();
 await page.locator('[data-action="nav"][data-id="workflows"]').click();const count=await page.locator('[data-action="remove-edge"]').count();await page.locator('[data-action="remove-edge"]').first().click();
 await page.locator('[data-action="connect-from"][data-id="n0"]').click();await page.locator('[data-action="connect-to"][data-id="n1"]').click();assert.equal(await page.locator('[data-action="remove-edge"]').count(),count);
 await page.locator('[data-action="simulate"]').click();await page.getByText('0 Instagram isteği',{exact:true}).waitFor();
 await page.locator('[data-action="connect-from"][data-id="n3"]').click();await page.locator('[data-action="connect-to"][data-id="n1"]').click();assert.match(await page.locator('#error').innerText(),/CYCLIC/);
 for(const type of ['cleanup','diagnostic','export','quick','relationship']){await page.locator('[data-action="new-workflow"]').click();await page.locator('#template').selectOption(type);await page.locator('#dialog-confirm').click();await page.locator('[data-action="simulate"]').click();await page.getByText('0 Instagram isteği',{exact:true}).waitFor()}
 await page.locator('[data-action="nav"][data-id="settings"]').click();await page.locator('#pref-sort').selectOption('username-desc');await page.locator('#pref-filter').selectOption('nonfollowers');await page.locator('#pref-export').selectOption('CSV');await page.locator('[data-card="5"]').uncheck();await page.locator('[data-action="save-settings"]').click();await page.reload();
 await page.locator('[data-action="nav"][data-id="accounts"]').click();assert.equal(await page.locator('#sort').inputValue(),'username-desc');assert.equal(await page.locator('#category').inputValue(),'nonfollowers');
 await page.locator('[data-action="export"]').click();assert.equal(await page.locator('#export-format').inputValue(),'CSV');await page.locator('#dialog-cancel').click();
 await page.evaluate(()=>{const original=chrome.runtime.sendMessage.bind(chrome.runtime);chrome.runtime.sendMessage=async m=>{if(m.type==='IU_WORKSPACE_COMMIT')await new Promise(resolve=>window.releaseCommit=resolve);return original(m)}});
 await page.locator('[data-action="note"][data-id="1"]').click();await page.locator('#note').fill('belongs only to 99');await page.locator('#dialog-confirm').click();await page.waitForFunction(()=>!!window.releaseCommit);await page.locator('#account').selectOption('100');await page.evaluate(()=>window.releaseCommit());await page.locator('#dialog[open]').waitFor({state:'hidden'});
 const stored=await worker.evaluate(async()=>JSON.parse((await chrome.storage.local.get('iu_workspace_v1')).iu_workspace_v1));assert.equal(stored.accounts['99'].meta['1'].notes,'belongs only to 99');assert.equal(stored.accounts['100'].meta['1'],undefined);
 // A fresh page removes the synthetic delayed messaging test shim.
 await page.reload();await page.locator('#account').selectOption('99');
 await worker.evaluate(async()=>chrome.storage.local.set({iu_workspace_v1:'corrupt original'}));await page.reload();await page.locator('[data-action="recovery-export"]').waitFor();
 const [raw]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action="recovery-export"]').click()]);assert.equal(JSON.parse(fs.readFileSync(await raw.path(),'utf8')).raw,'corrupt original');
 // Select the recovery route before setting the input, as the native picker would.
 await page.evaluate(()=>document.getElementById('import-file').dataset.kind='recovery');await page.locator('#import-file').setInputFiles({name:'recovery.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(stored))});await page.locator('#dialog[open]').waitFor();await page.locator('#dialog-confirm').click();await page.locator('[data-action="nav"][data-id="settings"]').waitFor();
 const quarantine=await worker.evaluate(async()=> (await chrome.storage.local.get('iu_workspace_quarantine_v1')).iu_workspace_quarantine_v1);assert.equal(quarantine.raw,'corrupt original');await page.locator('[data-action="nav"][data-id="settings"]').click();const [quarantineExport]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action="export-quarantine"]').click()]);assert.equal(JSON.parse(fs.readFileSync(await quarantineExport.path(),'utf8')).raw,'corrupt original');await page.locator('[data-action="delete-quarantine"]').click();await page.locator('#dialog-confirm').click();assert.equal(await worker.evaluate(async()=> (await chrome.storage.local.get('iu_workspace_quarantine_v1')).iu_workspace_quarantine_v1),undefined);assert.ok(await worker.evaluate(async()=> (await chrome.storage.local.get('iu_workspace_v1')).iu_workspace_v1));
 assert.equal(requests,0);assert.deepEqual(errors,[]);await page.screenshot({path:'instagram-magaza-hazirlik/gorseller/08-completion.png'});
 console.log('PASS: chart ranges/metrics, highlights, keyboard protection, visual graph editing/cycle rejection, five templates, persisted defaults, export preference, cross-account in-flight write isolation and corrupt-store recovery/quarantine. Zero Instagram requests.');
 }finally{await context.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
