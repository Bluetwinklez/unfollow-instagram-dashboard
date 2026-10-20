const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),W=require('./instagram-chrome-eklentisi/workspace-core.js');
(async()=>{
 const ext=path.resolve('extension'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'iu-workspace-browser-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,acceptDownloads:true,viewport:{width:1280,height:900},args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
 let network=0,workspaceURL;const errors=[];
 await context.route('https://www.instagram.com/**',route=>{network++;return route.abort()});
 try{
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const db=W.empty();W.capture(db,{viewerId:'99',scope:'nonfollowers',followingDone:true,followersDone:true,following:[{id:'1',username:'first',full_name:'First'},{id:'2',username:'mutual',full_name:'Mutual'},{id:'3',username:'third',full_name:'Third'}],followerIds:['2']});
  W.capture(db,{viewerId:'100',scope:'all',followingDone:true,following:[{id:'7',username:'other_account'}]});
  for (const account of Object.values(db.accounts)) account.preferences.language='tr';
 await worker.evaluate(async data=>chrome.storage.local.set({iu_workspace_v1:JSON.stringify(data)}),db);
  workspaceURL=new URL('workspace.html',worker.url()).href;const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(new URL('workspace.html',worker.url()).href);
  await page.locator('#dialog[open]').waitFor();await page.locator('#dialog-confirm').click();await page.locator('#dialog[open]').waitFor({state:'hidden'});
  assert.match(await page.locator('#view').innerText(),/Yerel gözlem/);assert.ok(!await page.locator('#toast').isVisible() || !/another tab|başka sekmede/.test(await page.locator('#toast').innerText()),'Own writes must not appear as another tab change');await page.screenshot({path:'instagram-magaza-hazirlik/gorseller/06-workspace-overview.png'});
  await page.locator('[data-action="nav"][data-id="accounts"]').click();await page.locator('[data-select="1"]').check();
  await page.locator('[data-action="protect"][data-id="1"]').click();await page.locator('[data-select="1"]').waitFor();assert.equal(await page.locator('[data-select="1"]').isDisabled(),true);
  await page.locator('[data-action="select-all"]').click();assert.equal(await page.locator('[data-select]:checked').count(),2);
  await page.locator('[data-action="note"][data-id="2"]').click();await page.locator('#note').fill('<script>synthetic</script>');await page.locator('#labels').fill('creator, review');await page.locator('#dialog-confirm').click();
  assert.equal(await page.locator('#error').isVisible(),false);
  await page.locator('#search').fill('MUTU');await page.waitForTimeout(250);assert.equal(await page.locator('[data-select]').count(),1);
  await page.locator('[data-action="clear"]').click();await page.locator('#search').fill('');await page.waitForTimeout(250);
  await page.locator('[data-action="select-all"]').click();await page.locator('[data-action="save-selection"]').click();await page.locator('#selection-name').fill('Synthetic selection');await page.locator('#dialog-confirm').click();
  await page.locator('[data-action="queue"]').click();await page.locator('[data-action="nav"][data-id="review"]').click();await page.locator('[data-action="reviewed"]').click();
  await page.locator('[data-action="nav"][data-id="sessions"]').click();await page.locator('[data-action="new-session"]').click();await page.locator('#session-name').fill('Synthetic session');await page.locator('#session-note').fill('Local only');await page.locator('#dialog-confirm').click();await page.locator('[data-action="resume-session"]').click();await page.locator('[data-action="reviewed"]').waitFor();
  await page.keyboard.press('Control+k');await page.locator('#command-search').fill('Görev');await page.keyboard.press('Enter');await page.locator('[data-action="new-task"]').waitFor();
  await page.locator('[data-action="new-task"]').click();await page.locator('#task-title').fill('Synthetic task');await page.locator('#dialog-confirm').click();await page.getByText('Synthetic task',{exact:true}).waitFor();await page.locator('[data-action="task-done"]').click();
  await page.locator('[data-action="nav"][data-id="workflows"]').click();await page.locator('[data-action="save-workflow"]').click();await page.locator('[data-action="simulate"]').click();await page.getByText('0 Instagram isteği',{exact:true}).waitFor();await page.screenshot({path:'instagram-magaza-hazirlik/gorseller/07-workspace-workflow.png'});
  await page.locator('[data-action="apply-simulation"]').click();await page.locator('#dialog-confirm').click();
  await page.locator('[data-action="nav"][data-id="settings"]').click();await page.locator('#pref-theme').selectOption('light');await page.locator('#pref-compact').check();await page.locator('[data-action="save-settings"]').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('light')),true);
  const [backup]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action="backup"]').click()]);const data=JSON.parse(fs.readFileSync(await backup.path(),'utf8'));assert.equal(data.accountId,'99');assert.equal(data.account.tasks.length,1);assert.equal(data.account.meta['1'].protected,true);
  await page.locator('[data-action="nav"][data-id="health"]').click();await page.locator('[data-action="support"]').click();await page.locator('[data-support="taskCount"]').uncheck();const [support]=await Promise.all([page.waitForEvent('download'),page.locator('#dialog-confirm').click()]);const supportData=JSON.parse(fs.readFileSync(await support.path(),'utf8'));assert.equal(supportData.taskCount,undefined);assert.ok(!JSON.stringify(supportData).includes('first'));
  await page.screenshot({path:'instagram-magaza-hazirlik/gorseller/05-workspace-health.png'});
  await page.locator('#account').selectOption('100');await page.locator('[data-action="nav"][data-id="accounts"]').click();assert.equal(await page.locator('[data-select="7"]').count(),1);assert.equal(await page.locator('[data-select="1"]').count(),0);
  await page.reload();await page.locator('#dialog[open]').waitFor({state:'hidden'});await page.locator('[data-action="nav"][data-id="tasks"]').click();await page.getByText('✓ Synthetic task',{exact:true}).waitFor();
  await page.locator('#lang').click();await page.locator('[data-action="nav"][data-id="accounts"]').click();assert.match(await page.locator('#title').innerText(),/Accounts/);
  await page.setViewportSize({width:375,height:812});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  const beforePerformance=await worker.evaluate(async()=> (await chrome.storage.local.get('iu_workspace_v1')).iu_workspace_v1);
  const large=W.empty();W.capture(large,{viewerId:'99',scope:'all',followingDone:true,following:Array.from({length:10000},(_,i)=>({id:String(i+1),username:'synthetic_'+i,full_name:'Synthetic '+i}))});large.accounts['99'].onboarded=true;large.accounts['99'].lastVersion=JSON.parse(fs.readFileSync(path.join(ext,'manifest.json'))).version;
  await worker.evaluate(async value=>chrome.storage.local.set({iu_workspace_v1:JSON.stringify(value)}),large);
  const started=Date.now();await page.reload();await page.locator('[data-action="nav"][data-id="accounts"]').click();await page.locator('[data-select="1"]').waitFor();assert.equal(await page.locator('[data-select]').count(),200);assert.ok(Date.now()-started<10000,'Large-list initial rendering must stay bounded');
  await page.locator('[data-action="table-next"]').click();await page.locator('[data-select]').first().waitFor();assert.equal(await page.locator('[data-select]').count(),200);
  fs.writeFileSync('docs/repair/PERFORMANCE.json',JSON.stringify({accounts:10000,renderedRows:200,initialNavigationMs:Date.now()-started,realInstagram:false},null,2));
  await worker.evaluate(async value=>chrome.storage.local.set({iu_workspace_v1:value}),beforePerformance);
  assert.equal(network,0,'Every workspace feature must remain local-only');assert.deepEqual(errors,[]);
  console.log('PASS: actual MV3 workspace onboarding, snapshot persistence, protection, notes/labels XSS safety, selection, review, sessions, palette, tasks, workflow simulation, backup, support redaction, account isolation, restart, TR/EN, theme and mobile layout. Zero Instagram requests.');
 }finally{await context.close()}
 const restarted=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
 try{await restarted.setOffline(true);const page=await restarted.newPage();await page.goto(workspaceURL);await page.locator('[data-action="nav"][data-id="tasks"]').click();await page.getByText('✓ Synthetic task',{exact:true}).waitFor();assert.equal(network,0);console.log('PASS: local workspace tasks survive a full Chromium process restart and remain usable offline.');}finally{await restarted.close()}

})().catch(error=>{console.error(error);process.exitCode=1});
