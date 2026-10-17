const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const tests=[];const test=(name,run)=>tests.push({name,run});
function setup(stored={},handler=()=>({users:[],has_more:false,status:'ok'})){
 let api;const calls=[];
 vm.runInNewContext(fs.readFileSync('instagram-tum-takipleri-birak.js','utf8'),{location:{hostname:'www.instagram.com'},navigator:{language:'tr'},document:{cookie:'ds_user_id=99; csrftoken=fake',hidden:false,getElementById(){return null},querySelector(){return null}},localStorage:{getItem(k){return stored[k]??null},setItem(){},removeItem(){}},console:{error(){},warn(){}},AbortController,setTimeout(fn,ms){if(ms!==30000)queueMicrotask(fn);return 1},clearTimeout(){},async fetch(url){calls.push(url);const value=handler(url,calls.length);return {status:200,ok:true,headers:{get(){return null}},text:async()=>typeof value==='string'?value:JSON.stringify(value)}},__IU_TEST__(x){api=x}});
 api.state.viewerId='99';return{api,calls};
}
test('null settings cannot prevent startup',()=>{assert.equal(setup({iu_all_following_state_v1:'null'}).api.state.mode,'idle')});
test('non-array hidden list cannot prevent startup',()=>{assert.equal(setup({iu_all_following_state_v1:'{"hidden":42}'}).api.state.hidden.size,0)});
test('invalid checkpoint timestamp and user records are ignored',()=>{
 for(const patch of [{savedAt:'bad'},{following:[null]},{followingCursor:42}]){
  const cp={viewerId:'99',savedAt:Date.now(),following:[{id:'1',username:'one'}],followerIds:[],followingCursor:'next',followingDone:false,followingTotal:null,...patch};
  assert.equal(setup({iu_all_following_scan_v1:JSON.stringify(cp)}).api.state.checkpoint,null);
 }
});
test('duplicate users under changing cursors stop after second page',async()=>{
 const {api,calls}=setup({},(_url,n)=>{if(n>2)throw Error('duplicate-page-loop');return {users:[{pk:'1',username:'one'}],has_more:true,next_max_id:'cursor-'+n,status:'ok'}});
 await assert.rejects(api.fetchFriendshipList('99','following',()=>{}),e=>e.kind==='incomplete');assert.equal(calls.length,2);
});
test('unusable saved cursor restarts without retaining stale seeds',async()=>{
 const cp={viewerId:'99',savedAt:Date.now(),following:[{id:'old',username:'stale'}],followerIds:[],followingCursor:'',followingDone:false,followingTotal:null};
 const {api}=setup({iu_all_following_scan_v1:JSON.stringify(cp)},()=>({users:[{pk:'1',username:'one'}],has_more:false,status:'ok'}));
 await api.startScan({resume:true});assert.equal(api.state.mode,'results');assert.equal(api.state.users.length,1);assert.equal(api.state.users[0].id,'1');
});
test('timer-overflow settings cannot turn long waits into immediate actions',()=>{
 const {api}=setup();const settings=api.loadTimings({unfollowDelayMin:3e12,unfollowDelayMax:9e12,unfollowPauseEvery:2.5});
 assert.ok(settings.unfollowDelayMax<=2147483647);assert.ok(Number.isInteger(settings.unfollowPauseEvery));assert.ok(settings.unfollowDelayMax>=settings.unfollowDelayMin);
});
test('HTTP 200 HTML is an unknown response, not proven sign-out',async()=>{
 const {api}=setup({},()=>'<html>unknown page</html>');
 await assert.rejects(api.igFetch('/api/v1/friendships/99/following/'),e=>e.kind==='response'&&e.status===200);
});
(async()=>{let failed=0;for(const t of tests){try{await t.run();console.log('PASS',t.name)}catch(e){failed++;console.log('FAIL',t.name,':',e.message)}}console.log(`${tests.length-failed}/${tests.length} audit regressions passed`);if(failed)process.exitCode=1})();
