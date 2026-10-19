const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('instagram-tum-takipleri-birak.js','utf8');
function fixture(mode='success'){
 let api;const calls=[],store=new Map();
 const secret='synthetic-page-token',lsd='synthetic-lsd-token';
 let script=mode==='partial'?'["LSD",[],{"token":"'+lsd+'"}]':'["DTSGInitialData",[],{"token":"'+secret+'"}],["LSD",[],{"token":"'+lsd+'"}]';
 if(mode!=='missing-actor')script+='["CurrentUserInitialData",[],{"NON_FACEBOOK_USER_ID":"17840000000000099","IS_INSTAGRAM_USER":1},270]';
 if(mode==='conflicting-actor')script+='["CurrentUserInitialData",[],{"NON_FACEBOOK_USER_ID":"17840000000000100","IS_INSTAGRAM_USER":1},270]';
 const document={cookie:'ds_user_id=99; csrftoken=synthetic-csrf',querySelectorAll(){if(mode==='switch')document.cookie='ds_user_id=100; csrftoken=synthetic-csrf';if(mode==='cancel')api.state.unfollowCancelled=true;return [{textContent:script}]},querySelector(){return null},getElementById(){return null}};
 const response=(payload,status=200)=>({status,ok:status>=200&&status<300,redirected:false,headers:{get(){return 'application/json'}},text:async()=>typeof payload==='string'?payload:JSON.stringify(payload)});
 vm.runInNewContext(source,{URL,location:{hostname:'www.instagram.com'},navigator:{language:'tr'},document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},console:{warn(){},error(){}},AbortController,setTimeout(fn,ms){if(ms!==30000)queueMicrotask(fn);return 1},clearTimeout(){},async fetch(url,init={}){
  calls.push({url,...init});
  assert.ok(!url.includes('/users/'),'No profile request is allowed');
  if(init.method==='POST'){
   assert.equal(url,'/api/graphql');const body=new URLSearchParams(init.body);
   assert.equal(body.get('fb_api_req_friendly_name'),'usePolarisUnfollowMutation');assert.equal(body.get('doc_id'),'27789106940691111');
   assert.equal(body.get('av'),'17840000000000099');assert.equal(body.get('fb_dtsg'),secret);assert.equal(body.get('lsd'),lsd);
   assert.equal(JSON.parse(body.get('variables')).target_user_id,'1');assert.equal(init.headers['x-csrftoken'],'synthetic-csrf');
   assert.equal(body.get('jazoest'),'2'+Array.from(secret).reduce((sum,ch)=>sum+ch.charCodeAt(0),0));
   if(mode==='network')throw new Error('offline');
   if(mode==='html')return response('<html>Polaris app</html>');
   if(mode==='promotion')return response({data:{ig_quick_promotion_batch_fetch_root:[]}});
   if(mode==='errors')return response({errors:[{message:'private error'}],data:{xdt_destroy_friendship:{friendship_status:{following:false}}}});
   if(mode==='missing-status')return response({data:{xdt_destroy_friendship:{}}});
   if(mode==='string-false')return response({data:{xdt_destroy_friendship:{friendship_status:{following:'false'}}}});
   if(mode==='rate')return response({message:'Please wait'},429);
   return response({data:{xdt_destroy_friendship:{friendship_status:{following:false}}}});
  }
  if(url.includes('/show/')){
   const after=calls.some(call=>call.method==='POST');
   return response({status:'ok',following:!after||mode==='still-following'});
  }
  throw new Error('Unexpected request '+url);
 },__IU_TEST__(value){api=value}});
 api.state.viewerId='99';api.state.users=[{id:'1',username:'first',follows_viewer:false},{id:'2',username:'second',follows_viewer:false}];api.state.selected=new Set(['1']);
 return {api,calls,store};
}
(async()=>{
 for(const mode of ['success','page-actor','missing-actor','conflicting-actor','html','promotion','errors','missing-status','string-false','network','rate','still-following','partial','cancel','switch']){
  const f=fixture(mode);await f.api.startUnfollow();const posts=f.calls.filter(call=>call.method==='POST');
  const notSent=['partial','cancel','switch','missing-actor','conflicting-actor'].includes(mode);
  assert.equal(posts.length,notSent?0:1,mode+': exactly one selected mutation, no fallback or retry');
  assert.equal(f.api.state.log.filter(entry=>entry.ok).length,['success','page-actor'].includes(mode)?1:0,mode+': require independent verification');
  assert.ok(f.calls.every(call=>!call.url.includes('/destroy/')),mode+': no REST fallback');
  assert.ok(!JSON.stringify(f.api.state.log).includes('synthetic-page-token'));assert.ok(!JSON.stringify([...f.store.values()]).includes('synthetic-lsd-token'));
  if(mode==='success')assert.equal(f.calls.filter(call=>call.url.includes('/show/')).length,2);
  if(['html','promotion','errors','missing-status','string-false','network','rate'].includes(mode))assert.equal(f.calls.filter(call=>call.url.includes('/show/')).length,1,mode+': no success verification after invalid mutation response');
 }
 console.log('PASS: 15 Polaris scenarios; page session binding, missing/conflicting actor, ZERO profile requests, strict response verification, one mutation, no fallback/retry and no secret persistence. Synthetic network only.');
})().catch(error=>{console.error(error);process.exitCode=1});
