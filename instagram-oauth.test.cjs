const assert=require('assert/strict');
(async()=>{
 const {createOAuthSession}=await import('./scripts/cws-auth-helper.mjs');
 let exchanges=0,received;
 const s=await createOAuthSession({clientId:'synthetic',clientSecret:'synthetic-secret',port:0,fetchImpl:async(_url,init)=>{exchanges++;assert.equal(init.body.get('code_verifier').length>40,true);return {ok:true,json:async()=>({refresh_token:'test-only-token'})}},onToken:t=>received=t});
 try{
  assert.equal(s.server.address().address,'127.0.0.1');const state=new URL(s.authUrl).searchParams.get('state');assert.ok(state.length>40);
  assert.equal((await fetch(s.redirectUri+'?code=example&state=wrong')).status,400);assert.equal(exchanges,0);
  const response=await fetch(s.redirectUri+'?code=example&state='+state);assert.equal(response.status,200);assert.equal(received,'test-only-token');assert.equal(exchanges,1);
 }finally{s.server.close()}
 const failed=await createOAuthSession({clientId:'synthetic',clientSecret:'synthetic-secret',port:0,fetchImpl:async()=>({ok:false,json:async()=>({error:'invalid_grant'})}),onToken:()=>{throw Error('must not claim success')}});
 try{
  const state=new URL(failed.authUrl).searchParams.get('state');const response=await fetch(failed.redirectUri+'?code=example&state='+state);
  assert.equal(response.status,400);assert.match(await response.text(),/not completed/);
 }finally{failed.server.close()}
 console.log('PASS: OAuth loopback binding, state rejection, PKCE, single token exchange and failed exchange cannot display success.');
})().catch(error=>{console.error(error);process.exitCode=1});
