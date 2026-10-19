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
 const diagnosticSource=fs.readFileSync('instagram-tum-takipleri-birak.js','utf8');
 for(const [url,expected] of [['https://www.instagram.com/api/v1/friendships/destroy/1/?token=private','destroy'],['https://www.instagram.com/accounts/login/?next=private','login'],['https://www.instagram.com/challenge/secret/','challenge'],['https://www.instagram.com/','home'],['https://example.com/private','other-origin']]) {
  let transport;
  vm.runInNewContext(diagnosticSource,{URL,location:{hostname:'www.instagram.com'},navigator:{language:'tr'},document:{cookie:'',getElementById(){return null}},localStorage:{getItem(){return null}},__IU_TEST__(x){transport=x.responseTransportDiagnostics}});
  const detail=transport({url,redirected:false,headers:{get(){return 'text/html; charset=utf-8'}}});
  assert.equal(detail.finalRoute,expected);assert.equal(detail.contentType,'text/html');assert.ok(!JSON.stringify(detail).includes('private'));assert.ok(!JSON.stringify(detail).includes('secret'));
  const html='<html><form action="/accounts/login/?token=secret"><input name="password" value="private"></form><script>PolarisProfileRoot</script></html>';
  const hints=transport({url,headers:{get(){return 'text/html'}}},html);
  assert.deepEqual(Array.from(hints.htmlSignals),['login-form','instagram-app-shell']);assert.equal(hints.responseLength,html.length);
  assert.ok(!JSON.stringify(hints).includes('secret'));assert.ok(!JSON.stringify(hints).includes('private'));
  assert.ok(hints.htmlStructure.includes('<form><input></form>'));assert.ok(!hints.htmlStructure.includes('token'));
  const headers=transport({url,headers:{'content-type':'text/html','set-cookie':'secret','x-fb-lsd':'private','x-asbd-id':'359341','constructor':'private'}}).responseHeaders;
  assert.equal(headers['content-type'],'text/html');assert.equal(headers['x-asbd-id'],'359341');assert.equal(headers['set-cookie'],'[REDACTED]');assert.equal(headers['x-fb-lsd'],'[REDACTED]');assert.equal(headers.constructor,'[REDACTED]');assert.ok(!JSON.stringify(headers).includes('secret'));assert.ok(!JSON.stringify(headers).includes('private'));
  assert.equal(transport({url},'{"text":"Polaris login private"}').htmlSignals.length,0,'JSON text must not become HTML evidence');
 }
 console.log('PASS: ambiguous responses stop without repeated POST; transport diagnostics classify final routes and content type without storing URLs, bodies or secrets.');
})().catch(e=>{console.error(e);process.exit(1)});
