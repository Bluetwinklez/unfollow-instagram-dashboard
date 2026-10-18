const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function fixture(post,verification){let api;const calls=[];
 const document={cookie:'ds_user_id=99; csrftoken=secret',getElementById(){return null},querySelector(){return null}};
 vm.runInNewContext(fs.readFileSync('instagram-tum-takipleri-birak.js','utf8'),{location:{hostname:'www.instagram.com'},navigator:{language:'tr'},document,localStorage:{getItem(){return null},setItem(){},removeItem(){}},console:{error(){},warn(){}},AbortController,setTimeout(fn){queueMicrotask(fn);return 1},clearTimeout(){},async fetch(url,init={}){calls.push(init.method||'GET');if(init.method!=='POST'&&!calls.includes('POST'))return {status:200,ok:true,text:async()=>JSON.stringify({status:'ok',following:true})};const value=init.method==='POST'?post:verification;return {status:value.status||200,ok:true,text:async()=>value.body}},__IU_TEST__(x){api=x}});
 api.state.viewerId='99';api.state.users=[{id:'1',username:'bir',follows_viewer:false},{id:'2',username:'iki',follows_viewer:false}];api.state.selected.add('1');api.state.selected.add('2');return{api,calls};
}
(async()=>{
 for(const [body,kind] of [['<html>login</html>','html'],['','empty'],['not json','text'],['null','json']]){
  const {api,calls}=fixture({body});await api.startUnfollow();
  assert.equal(api.state.log[0].ok,false);assert.equal(api.state.log[0].diagnostics.mutation.httpStatus,200);assert.equal(api.state.log[0].diagnostics.mutation.responseKind,kind);
  assert.match(api.state.log[0].reason,/HTTP 200/);assert.deepEqual(calls,['GET','POST']);assert.equal(api.state.unfollowOutcome,'stopped');assert.ok(!JSON.stringify(api.state.log).includes('login'));
 }
 const {api,calls}=fixture({body:'{"status":"ok","friendship_status":{"following":false}}'},{body:'<html>private response</html>'});
 await api.startUnfollow();assert.equal(api.state.log[0].ok,false);assert.equal(api.state.log[0].diagnostics.verification.responseKind,'html');assert.deepEqual(calls,['GET','POST','GET']);assert.ok(!JSON.stringify(api.state.log).includes('private response'));
 api.state.search='iki';api.pruneSelectionToDisplayed();assert.deepEqual([...api.state.selected],['2']);
 api.state.search='yok';api.pruneSelectionToDisplayed();assert.equal(api.state.selected.size,0);
 console.log('PASS: ambiguous HTML/empty/text/null preserve HTTP metadata, stop without repeated POST, redact bodies; search prunes invisible selection.');
})().catch(e=>{console.error(e);process.exit(1)});
