const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('instagram-chrome-eklentisi/service-worker.js','utf8');
const state={};const live=new Map();let frozen=false;
const watchdog=setTimeout(()=>{console.error('FAIL: operation lock test stalled');process.exit(1)},3000);
function boot(){
 let listener;
 const chrome={runtime:{id:'extension-test',getURL:f=>'chrome-extension://extension-test/'+f,onMessage:{addListener:f=>listener=f},onInstalled:{addListener(){}}},storage:{session:{async get(k){return {[k]:state[k]}},async set(v){Object.assign(state,v)},async remove(k){delete state[k]}}},action:{onClicked:{addListener(){}}},tabs:{onRemoved:{addListener(){}},async sendMessage(tab,m){if(frozen)return new Promise(()=>{});return {active:live.get(tab)===m.token}}}};
 vm.runInNewContext(code,{chrome,console,URL,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,20)),clearTimeout,importScripts(){}});
 assert.equal(typeof listener,'function','Worker must register operation lock listener');
 return (message,tab=1,url='https://www.instagram.com/')=>new Promise(resolve=>listener(message,{id:chrome.runtime.id,url,frameId:0,tab:{id:tab}},resolve));
}
const claim=(token)=>({type:'IU_OPERATION_CLAIM',viewerId:'99',kind:'scan',token});
(async()=>{
 let send=boot();live.set(1,'one');live.set(2,'two');
 const replies=await Promise.all([send(claim('one'),1),send(claim('two'),2)]);
 assert.equal(replies.filter(x=>x.ok).length,1,'Concurrent claims must have one winner');
 await send({type:'IU_OPERATION_RELEASE',token:'one'},2);
 assert.equal((await send(claim('two'),2)).ok,false,'Another tab cannot release owner lock');
 send=boot();assert.equal((await send(claim('two'),2)).ok,false,'Worker restart must not lose active lock');
 live.delete(1);assert.equal((await send(claim('two'),2)).ok,true,'A navigated or closed owner cannot leave a permanent lock');
 assert.equal((await send(claim('evil'),3,'https://example.com/')).ok,false);
 assert.equal((await send({type:'IU_OPERATION_RELEASE',token:'two'},2)).ok,true);
 live.set(1,'next');assert.equal((await send(claim('next'),1)).ok,true);
 frozen=true;
 assert.equal((await send(claim('frozen-requester'),2)).reason,'busy','A frozen tab must retain ownership without hanging the request queue');
 const readable=await send({type:'IU_LOG_APPEND',entry:{event:'scan.error',reason:'network'}},2);
 assert.equal(readable.ok,true,'Live logs must remain available after an unresponsive owner probe');
 assert.equal(state.iu_active_operation_v1.token,'next','Timeout must not steal operation ownership');
 console.log('PASS: concurrent tab lock, owner-only release, worker restart, stale lock recovery, origin validation.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>clearTimeout(watchdog));
