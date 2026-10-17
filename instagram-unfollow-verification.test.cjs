const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const source = fs.readFileSync('instagram-tum-takipleri-birak.js','utf8');
async function scenario(verification, expectedOK, status = 200, targetCount = 1) {
 let api;
 const calls=[];
 const context={
  location:{hostname:'www.instagram.com'},navigator:{language:'tr'},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  document:{cookie:'csrftoken=test; ds_user_id=123',getElementById(){return null},querySelector(){return null}},
  console:{error(){},warn(){}},AbortController,
  setTimeout(fn){queueMicrotask(fn);return 1},clearTimeout(){},
  async fetch(url,init={}) {
   calls.push({url,method:init.method||'GET',cache:init.cache});
   if(init.method==='POST') return {status:200,text:async()=>JSON.stringify({status:'ok',friendship_status:{following:false}})};
   if(verification instanceof Error) throw verification;
   return {status,ok:status>=200&&status<300,text:async()=>JSON.stringify(verification)};
  },
  __IU_TEST__(value){api=value}
 };
 vm.runInNewContext(source,context);
 api.state.viewerId='123';
 api.state.users=[{id:'42',username:'example',follows_viewer:false}];
 api.state.selected.add('42');
 if (targetCount === 2) {
  api.state.users.push({id:'43',username:'second',follows_viewer:false});
  api.state.selected.add('43');
 }
 api.state.timings.continueOnFailure=false; await api.startUnfollow();
 assert.equal(api.state.log[0].ok,expectedOK,'POST success must not override verification');
 assert.equal(api.state.users.length,expectedOK?0:targetCount,'Keep unverified accounts in results');
 assert.equal(api.state.log.length,1,'Stop before processing more accounts on uncertain outcome');
 assert.equal(api.state.selected.has('42'),!expectedOK);
 assert.equal(calls.filter(x=>x.method==='POST').length,1,'Do not repeat mutation');
 assert.equal(calls.filter(x=>x.method==='GET').length,1,'Verify relationship independently');
 assert.equal(calls[1].cache,'no-store');
 return {api,calls};
}
(async()=>{
 await scenario({status:'ok',following:true},false);
 await scenario({status:'ok',following:true},false,200,2);
 await scenario({status:'ok',following:false},true);
 await scenario({status:'ok',friendship_status:{following:false}},true);
 await scenario({status:'ok'},false);
 await scenario({status:'fail',following:false},false);
 await scenario({status:'ok',following:'false'},false);
 await scenario(new Error('offline'),false);
 const limited=await scenario({message:'Please wait'},false,429);
 assert.equal(limited.api.state.log[0].ok,false);
 console.log('PASS: 9 scenarios; independently verified success, retained accounts, stop on uncertainty. No real network.');
})().catch(error=>{console.error(error);process.exit(1)});
