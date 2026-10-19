const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),W=require('./instagram-chrome-eklentisi/workspace-core.js');let listener;
const store={},session={};let failWrites=false;
const chrome={runtime:{id:'test',getURL:f=>'chrome-extension://test/'+f,onMessage:{addListener:fn=>listener=fn},onInstalled:{addListener(){}}},action:{onClicked:{addListener(){}}},tabs:{onRemoved:{addListener(){}},async create(){}},storage:{local:{async get(k){return {[k]:store[k]}},async set(value){if(failWrites)throw Error('quota');Object.assign(store,value)}},session:{async get(k){return {[k]:session[k]}},async set(v){Object.assign(session,v)}}}};
vm.runInNewContext(fs.readFileSync('instagram-chrome-eklentisi/service-worker.js','utf8'),{chrome,IUWorkspace:W,URL,Date,console,setTimeout,clearTimeout,importScripts(){}});
const send=(message,url='chrome-extension://test/workspace.html')=>new Promise(resolve=>listener(message,{id:'test',url,tab:{id:1},frameId:0},resolve));
(async()=>{
 const db=W.empty(),a=W.account(db,'99');const first=W.copy(a),second=W.copy(a);first.meta['1']={protected:true};second.meta['2']={protected:true};
 const results=await Promise.all([send({type:'IU_WORKSPACE_COMMIT',accountId:'99',account:first,expectedRevision:0}),send({type:'IU_WORKSPACE_COMMIT',accountId:'99',account:second,expectedRevision:0})]);
 assert.equal(results.filter(r=>r.ok).length,1);assert.equal(results.filter(r=>r.reason==='conflict').length,1);
 const before=store[W.KEY];assert.equal((await send({type:'IU_WORKSPACE_COMMIT',accountId:'99',account:second,expectedRevision:1},'https://www.instagram.com/')).ok,false);assert.equal(store[W.KEY],before);
 assert.equal((await send({type:'IU_WORKSPACE_CAPTURE',snapshot:{viewerId:'100',followingDone:true,scope:'all',following:[{id:'5',username:'synthetic'}]}},'https://www.instagram.com/')).ok,true);
 const saved=W.parse(store[W.KEY]);assert.equal(saved.accounts['99'].meta['1'].protected,true);assert.equal(saved.accounts['100'].snapshots.length,1);
 failWrites=true;const current=store[W.KEY];assert.equal((await send({type:'IU_WORKSPACE_COMMIT',accountId:'99',account:second,expectedRevision:2})).ok,false);assert.equal(store[W.KEY],current);
 failWrites=false;
 store.iu_operation_history_v1=JSON.stringify([{accountId:'99',category:'confirmed'},{accountId:'99',category:'uncertain'},{accountId:'100',category:'confirmed'}]);
 // The active owner key is read from the implementation, not assumed by the test.
 const operationKey=fs.readFileSync('instagram-chrome-eklentisi/service-worker.js','utf8').match(/const OPERATION_KEY = "([^"]+)"/)[1];session[operationKey]={tabId:1};
 assert.equal((await send({type:'IU_OPERATION_HISTORY_CLEAR',accountId:'99'})).reason,'busy');delete session[operationKey];
 assert.equal((await send({type:'IU_OPERATION_HISTORY_CLEAR',accountId:'99'},'https://www.instagram.com/')).ok,false);
 assert.equal((await send({type:'IU_OPERATION_HISTORY_CLEAR',accountId:'99'})).ok,true);const ledger=JSON.parse(store.iu_operation_history_v1);assert.equal(ledger.length,2);assert.ok(ledger.some(e=>e.accountId==='99'&&e.category==='uncertain'));
 const valid=store[W.KEY];assert.equal((await send({type:'IU_WORKSPACE_RESTORE',expectedRaw:valid,replacement:db})).reason,'not-corrupt');
 store[W.KEY]='broken';assert.equal((await send({type:'IU_WORKSPACE_RESTORE',expectedRaw:'broken',replacement:db},'https://www.instagram.com/')).ok,false);
 assert.equal((await send({type:'IU_WORKSPACE_RESTORE',expectedRaw:'older',replacement:db})).reason,'conflict');
 failWrites=true;assert.equal((await send({type:'IU_WORKSPACE_RESTORE',expectedRaw:'broken',replacement:db})).ok,false);assert.equal(store[W.KEY],'broken');
 failWrites=false;assert.equal((await send({type:'IU_WORKSPACE_RESTORE',expectedRaw:'broken',replacement:db})).ok,true);assert.equal(store.iu_workspace_quarantine_v1.raw,'broken');W.parse(store[W.KEY]);
 console.log('PASS: serialized workspace commits, stale revision rejection, trusted-page checks, account isolation and storage failure preserve existing data.');
})().catch(e=>{console.error(e);process.exitCode=1});
