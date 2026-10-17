const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');
const source=fs.readFileSync('instagram-tum-takipleri-birak.js','utf8');
const response=(data,status=200)=>({status,ok:status>=200&&status<300,headers:{get(){return null}},text:async()=>typeof data==='string'?data:JSON.stringify(data)});
function setup(handler) {
 let api;
 const calls=[];
 const store=new Map();
 const document={cookie:'csrftoken=test; ds_user_id=99',hidden:false,getElementById(){return null},querySelector(){return null},removeEventListener(){}};
 const sandbox={location:{hostname:'www.instagram.com'},navigator:{language:'tr'},document,window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},console:{error(){},warn(){}},AbortController,
  setTimeout(fn,ms){if(ms>=30000)return 1;queueMicrotask(fn);return 1},clearTimeout(){},
  async fetch(url,init={}){calls.push({url,init});return handler(url,init,{api,document,calls})},
  __IU_TEST__(x){api=x}};
 vm.runInNewContext(source,sandbox);
 api.state.viewerId='99';
 return {api,calls,document,store};
}
function targets(api,count=2){api.state.users=Array.from({length:count},(_,i)=>({id:String(i+1),username:'u'+i,follows_viewer:false}));api.state.selected=new Set(api.state.users.map(u=>u.id));}
const tests=[];
function test(name,fn){tests.push({name,fn})}
test('ambiguous POST stops without fallback or next account',async()=>{
 const {api,calls}=setup(()=>response({status:'uncertain'}));targets(api);api.state.timings.continueOnFailure=false;await api.startUnfollow();
 assert.equal(calls.length,1);assert.equal(api.state.log.length,1);assert.equal(api.state.users.length,2);
});
test('network failure does not retry mutation',async()=>{
 const {api,calls}=setup(()=>{throw new Error('offline')});targets(api);api.state.timings.continueOnFailure=false;await api.startUnfollow();assert.equal(calls.length,1);
});
test('changed account before starting sends nothing',async()=>{
 const {api,calls,document}=setup(()=>response({status:'ok'}));targets(api);document.cookie='ds_user_id=100; csrftoken=new';await api.startUnfollow();assert.equal(calls.length,0);
});
test('changed account after first POST cannot produce success or next POST',async()=>{
 const {api,calls}=setup((url,init,{document})=>{document.cookie='ds_user_id=100; csrftoken=new';return response({status:'ok',friendship_status:{following:false}})});targets(api);await api.startUnfollow();assert.equal(calls.filter(c=>c.init.method==='POST').length,1);assert.equal(api.state.log.filter(l=>l.ok).length,0);
});
test('closing aborts pending mutation and retains uncertainty',async()=>{
 let signal;let began;const started=new Promise(r=>began=r);
 const {api}=setup((url,init)=>new Promise((resolve,reject)=>{signal=init.signal;began();signal?.addEventListener('abort',()=>reject(new Error('aborted')))}));targets(api);const running=api.startUnfollow();await started;api.unmount();assert.ok(signal?.aborted);await running;
});
test('short list with known total is not accepted as complete',async()=>{
 const {api}=setup(()=>response({status:'ok',users:[{pk:'1',username:'one'}],has_more:false}));await assert.rejects(api.fetchFriendshipList('99','following',()=>{},{total:100}));
});
test('server-limited lists never enable results',async()=>{
 const {api,calls}=setup(()=>response({status:'ok',users:[{pk:'1',username:'one'}],has_more:false,should_limit_list_of_followings:true}));await api.startScan();assert.ok(!calls.some(c=>c.url.includes('/info/')));assert.notEqual(api.state.mode,'results');
});
test('complete matching scan succeeds with viewer binding',async()=>{
 const {api}=setup(url=>url.includes('/info/')?response({status:'ok',user:{pk:'99',following_count:1}}):response({status:'ok',users:[{pk:'1',username:'one'}],has_more:false}));await api.startScan();assert.equal(api.state.mode,'results');assert.equal(api.state.viewerId,'99');assert.equal(api.getDisplayUsers().length,1);
});
test('repeated cursor prevents scan completion',async()=>{
 const {api}=setup(()=>response({status:'ok',users:[{pk:'1',username:'one'}],has_more:true,next_max_id:'repeat'}));await api.startScan();assert.notEqual(api.state.mode,'results');
});
test('missing profile total does not require unsupported metadata endpoint',async()=>{
 const {api}=setup(()=>response({status:'ok',users:[{pk:'1',username:'one'}],has_more:false}));await api.startScan();assert.equal(api.state.mode,'results');assert.ok(api.state.coverage);
});
test('server refusal stops at first account',async()=>{
 const {api,calls}=setup(()=>response({message:'feedback_required'},403));targets(api);await api.startUnfollow();assert.equal(calls.length,1);assert.equal(api.state.log.filter(l=>l.ok).length,0);
});
test('account switch during verification never counts success',async()=>{
 const {api,calls}=setup((url,init,{document})=>{
  if(init.method==='POST') return response({status:'ok',friendship_status:{following:false}});
  document.cookie='ds_user_id=100; csrftoken=new';
  return response({status:'ok',following:false});
 });targets(api);await api.startUnfollow();assert.equal(api.state.log.filter(l=>l.ok).length,0);assert.equal(calls.filter(c=>c.init.method==='POST').length,1);
});
test('count check also supports empty following list',async()=>{
 const {api}=setup(url=>url.includes('/info/')?response({status:'ok',user:{pk:'99',following_count:0}}):response({status:'ok',users:[],has_more:false}));await api.startScan();assert.equal(api.state.mode,'results');assert.equal(api.getDisplayUsers().length,0);
});
test('missing cursor while more pages are promised cannot unlock results',async()=>{
 const {api}=setup(()=>response({status:'ok',users:[{pk:'1',username:'one'}],has_more:true}));await assert.rejects(api.fetchFriendshipList('99','following',()=>{},{total:1}));
});
test('confirmed success removes only confirmed account',async()=>{
 const {api,calls}=setup((url,init)=>response(init.method==='POST'?{status:'ok',friendship_status:{following:false}}:{status:'ok',following:false}));targets(api,1);await api.startUnfollow();assert.equal(api.state.users.length,0);assert.equal(calls.length,2);
});
(async()=>{let failures=0;for(const {name,fn} of tests){try{await fn();console.log('PASS '+name)}catch(e){failures++;console.error('FAIL '+name+': '+e.message)}}if(failures)process.exitCode=1;console.log(`${tests.length-failures}/${tests.length} passed; no real network`);})();
