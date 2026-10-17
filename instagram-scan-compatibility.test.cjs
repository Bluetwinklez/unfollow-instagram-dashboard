const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let code=fs.readFileSync('instagram-tum-takipleri-birak.js','utf8');
function setup(handler){
 let api;const calls=[];
 const context={location:{hostname:'www.instagram.com',origin:'https://www.instagram.com'},navigator:{language:'tr'},document:{cookie:'ds_user_id=99; csrftoken=fake',hidden:false,querySelector(){return null},getElementById(){return null}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},AbortController,URL,console,
 setTimeout(fn,ms){if(ms===30000)return 1;queueMicrotask(fn);return 1},clearTimeout(){},
 async fetch(url,init){calls.push(url);return handler(url,init)},__IU_TEST__(x){api=x}};
 vm.runInNewContext(code,context);return{api,calls};
}
const response=(data,status=200)=>({status,ok:status>=200&&status<300,headers:{get(){return null}},text:async()=>typeof data==='string'?data:JSON.stringify(data)});
(async()=>{
 const {api,calls}=setup(url=>url.includes('/info/')?response({message:'Please wait a few minutes'},429):response({status:'ok',users:[{pk:'1',username:'example'}],has_more:false}));
 await api.startScan();assert.equal(api.state.mode,'results','Working list endpoint must not be blocked by unsupported metadata endpoint');assert.equal(calls.length,1);assert.ok(calls[0].includes('/friendships/99/following/'));assert.equal(api.state.users.length,1);assert.ok(api.state.coverage,'Unknown profile total must be disclosed');
 const limited=setup(()=>response({status:'fail',message:'Please wait a few minutes'},429));await limited.api.startScan();assert.equal(limited.api.state.mode,'idle');assert.match(limited.api.state.error,/429/);assert.equal(limited.calls.length,1);
 const html=setup(()=>response('<html><script>const translatedMessage="Please wait a few minutes";</script></html>',200));await html.api.startScan();assert.equal(html.api.state.mode,'idle');assert.match(html.api.state.error,/okunamayan/);assert.ok(!html.api.state.error.includes(html.api.t('sessionExpired')),'Unknown HTML must not be classified as confirmed sign-out');
 console.log('PASS: original list-only scan works when metadata endpoint rejects, unknown total disclosed, real 429 preserved, HTML not misclassified.');
})().catch(e=>{console.error(e);process.exit(1)});
