const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function fixture(mode,settings={}){
 let api;const calls=[],store=new Map(),controllers=[];
 const document={cookie:'ds_user_id=99; csrftoken=synthetic',getElementById(){return null},querySelector(){return null},removeEventListener(){}};
 vm.runInNewContext(fs.readFileSync('instagram-tum-takipleri-birak.js','utf8'),{location:{hostname:'www.instagram.com'},navigator:{language:'en'},document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},console:{warn(){},error(){}},AbortController,setTimeout(fn,ms){if(ms!==30000)queueMicrotask(fn);return 1},clearTimeout(){},async fetch(url,init={}){
  calls.push({url,...init});controllers.push(init.signal);
  const id=url.match(/\/show\/(\d+)/)?.[1];if(id&&!calls.some(c=>c.method==='POST'&&c.url.endsWith('/'+id+'/')))return {status:200,ok:true,text:async()=>JSON.stringify({status:'ok',following:mode!=='already-not-following'})};if(mode==='network')throw Error('offline');
  let status=200,body;
  if(init.method==='POST'){
   assert.match(url,/^\/api\/v1\/friendships\/destroy\/\d+\/$/);
   assert.equal(init.body,'user_id='+url.split('/').at(-2));assert.equal(init.headers['x-asbd-id'],'129477');assert.equal(init.headers['x-csrftoken'],'synthetic');
   body=mode==='html'?'<html>SPA</html>':mode==='empty'?'':mode==='promotion'?JSON.stringify({data:{ig_quick_promotion_batch_fetch_root:[]}}):mode==='graphql-errors'?JSON.stringify({errors:[{message:'synthetic'}]}):mode==='reject'?JSON.stringify({status:'fail',message:'Request rejected'}):JSON.stringify({status:'ok'});
  }else body=JSON.stringify({status:'ok',following:mode==='still-following'});
  return {status,ok:true,headers:{get(){return 'text/javascript'}},text:async()=>body};
 },__IU_TEST__(x){api=x}});
 api.state.viewerId='99';api.state.users=[{id:'1',username:'first',follows_viewer:false},{id:'2',username:'second',follows_viewer:false}];api.state.selected=new Set(['1','2']);Object.assign(api.state.timings,settings);
 return {api,calls,store,controllers};
}
(async()=>{
 for(const mode of ['html','empty','network','promotion','graphql-errors','still-following'])for(const continueOnFailure of [undefined,true,false]){
  const f=fixture(mode,continueOnFailure===undefined?{}:{continueOnFailure});await f.api.startUnfollow();
  assert.equal(f.calls.filter(c=>c.method==='POST').length,1,mode+' must stop after uncertainty, regardless of continue preference');
  assert.equal(f.api.state.log.filter(e=>e.ok).length,0);assert.equal(f.api.state.unfollowOutcome,'stopped');assert.equal(f.api.state.log[0].category,mode==='still-following'?'failed':'uncertain');
 }
 const rejected=fixture('reject',{continueOnFailure:true});await rejected.api.startUnfollow();assert.equal(rejected.api.state.log.length,2);assert.equal(rejected.api.state.unfollowOutcome,'completed_with_errors');assert.equal(rejected.api.state.log[0].category,'failed');
 const unknown=fixture('html');await unknown.api.startUnfollow();const before=unknown.calls.length;await unknown.api.startUnfollow();assert.equal(unknown.calls.filter(c=>c.method==='POST'&&c.url.endsWith('/1/')).length,1,'An unresolved dispatch intent cannot be automatically resent');
 const success=fixture('success');await success.api.startUnfollow();assert.equal(success.api.state.log.filter(e=>e.ok).length,2);assert.equal(success.calls.filter(c=>c.method==='POST').length,2);assert.equal(success.calls.filter(c=>c.method!=='POST').length,4);
 assert.ok(!JSON.stringify([...success.store.values()]).includes('synthetic'));
 const html404=success.api.evaluateUnfollowResponse(404,'<html>Not found</html>');assert.equal(html404.code,'UNEXPECTED_HTML');assert.ok(!/Account not found/.test(html404.reason));
 const json404=success.api.evaluateUnfollowResponse(404,'{"status":"fail"}');assert.equal(json404.code,'HTTP_NOT_FOUND');assert.ok(!/Account not found/.test(json404.reason));
 const already=fixture('already-not-following');await already.api.startUnfollow();assert.equal(already.calls.filter(c=>c.method==='POST').length,0);assert.equal(already.api.state.log.filter(e=>e.ok).length,0);assert.equal(already.api.state.log[0].code,'ALREADY_NOT_FOLLOWING');assert.equal(already.api.state.unfollowOutcome,'complete_no_changes');
 const phase={phase:'pending',version:0};for(const next of ['prechecking','ready','dispatching','awaiting_response','verifying','confirmed'])success.api.transitionOperation(phase,next);assert.equal(phase.version,6);assert.throws(()=>success.api.transitionOperation(phase,'dispatching'));
 for(const status of [400,401,403,404,429,500]){const result=success.api.evaluateUnfollowResponse(status,'{"status":"fail"}');assert.equal(result.ok,false);}
 console.log('PASS: default/explicit preference safety, HTML/empty/network/promotion/errors, text/javascript JSON, exact POST payload/headers, no blind retry, operation history and distinct failed/uncertain outcomes.');
})().catch(e=>{console.error(e);process.exitCode=1});
