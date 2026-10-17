const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function setup(followerOverride){let api;let refuse=false;const calls=[];const data={};
 vm.runInNewContext(fs.readFileSync('instagram-tum-takipleri-birak.js','utf8'),{location:{hostname:'www.instagram.com'},navigator:{language:'tr'},document:{cookie:'ds_user_id=99; csrftoken=fake',hidden:false,getElementById(){return null},querySelector(){return null}},localStorage:{getItem(k){return data[k]??null},setItem(k,v){data[k]=v},removeItem(k){delete data[k]}},console:{error(){},warn(){}},AbortController,setTimeout(fn,ms){if(ms!==30000)queueMicrotask(fn);return 1},clearTimeout(){},async fetch(url){calls.push(url);const followers=url.includes('/followers/');const status=followers&&refuse?429:200;const users=followers?(followerOverride??[{pk:'2',username:'mutual'}]):[{pk:'1',username:'first'},{pk:'2',username:'mutual'},{pk:'3',username:'third'}];return {status,ok:status===200,headers:{get(){return null}},text:async()=>JSON.stringify(status===429?{message:'Please wait a few minutes'}:{status:'ok',users,has_more:false})}},__IU_TEST__(x){api=x}});
 return {api,calls,data,setRefuse(v){refuse=v}};
}
(async()=>{
 const all=setup();await all.api.startScan();assert.equal(all.api.getDisplayUsers().length,3);assert.equal(all.calls.length,1);assert.ok(!all.calls[0].includes('/followers/'));
 const back=setup();back.api.state.scanScope='nonfollowers';await back.api.startScan();assert.equal(back.api.getDisplayUsers().map(x=>x.id).join(','),'1,3');assert.equal(back.calls.length,2);assert.ok(back.calls[1].includes('/followers/'));
 back.api.state.selected.add('2');const before=back.calls.length;await back.api.startUnfollow();assert.equal(back.calls.length,before,'Mutual follower must never enter mutation targets in nonfollowers scope');
 const partial=setup();partial.api.state.scanScope='nonfollowers';partial.setRefuse(true);await partial.api.startScan();assert.equal(partial.api.state.mode,'idle');assert.equal(partial.api.state.users.length,0);assert.equal(partial.api.state.checkpoint.followingDone,true);assert.equal(partial.api.state.checkpoint.scope,'nonfollowers');
 partial.setRefuse(false);partial.api.state.scanScope='all';await partial.api.startScan({resume:true});assert.equal(partial.api.state.scanScope,'nonfollowers');assert.equal(partial.api.getDisplayUsers().length,2);assert.equal(partial.calls.filter(u=>u.includes('/following/')).length,1);assert.equal(partial.calls.filter(u=>u.includes('/followers/')).length,2);assert.equal(partial.data.iu_all_following_scan_v1,undefined);
 const noName=setup([{pk:'2'}]);noName.api.state.scanScope='nonfollowers';await noName.api.startScan();
 assert.equal(noName.api.state.mode,'results');assert.equal(noName.api.state.followersCount,1);assert.equal(noName.api.getDisplayUsers().some(u=>u.id==='2'),false,'A follower ID must exclude the mutual account even without a username');
 for(const record of [{username:'missing_id'},null,[]]){
  const broken=setup([record]);broken.api.state.scanScope='nonfollowers';await broken.api.startScan();
  assert.equal(broken.api.state.mode,'idle');assert.equal(broken.api.state.users.length,0,'Malformed follower records must never unlock mutation targets');
 }
 console.log('PASS: all-following scan, full nonfollowers comparison, mutual exclusion from mutation, partial follower failure hides results, scope-bound resume skips completed following list.');
})().catch(e=>{console.error(e);process.exit(1)});
