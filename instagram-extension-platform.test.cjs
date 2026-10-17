const fs=require('fs');
const vm=require('vm');
const assert=require('assert/strict');
function setupPlatform(storage){
 const listeners=[];
 const context={console,crypto:require('crypto').webcrypto,chrome:{storage:{local:storage},runtime:{onMessage:{addListener:fn=>listeners.push(fn)},async sendMessage(m){return {ok:true}}}}};
 vm.runInNewContext(fs.readFileSync('instagram-chrome-eklentisi/platform.js','utf8'),context);
 return {platform:context.__iuPlatform,listeners,context};
}
(async()=>{
 let releaseFirst;const order=[];const data={};
 const storage={async get(){return{}},async set(v){order.push('set');await new Promise(r=>releaseFirst=r);Object.assign(data,v)},async remove(k){order.push('remove');delete data[k]}};
 const {platform,listeners,context}=setupPlatform(storage);
 const adapter=await platform.createStorage(['scan'],()=>{});
 adapter.setItem('scan','old');adapter.removeItem('scan');
 await new Promise(r=>setImmediate(r));assert.deepEqual(order,['set']);
 releaseFirst();await adapter.flush();assert.deepEqual(order,['set','remove']);assert.equal(data.scan,undefined);
 vm.runInNewContext(fs.readFileSync('instagram-chrome-eklentisi/platform.js','utf8'),context);assert.equal(listeners.length,1,'Do not duplicate message handlers on re-open');
 let warnings=0;
 const broken=setupPlatform({async get(){return{}},async set(){throw Error('quota')},async remove(){}});
 const adapter2=await broken.platform.createStorage([],()=>warnings++);adapter2.setItem('scan','progress');assert.equal(await adapter2.flush(),false);assert.equal(warnings,1);
 const lease=await platform.claim('99','scan');assert.equal(lease.ok,true);await platform.release();
 console.log('PASS: ordered writes, remove-after-set, visible storage failure, singleton listener and lock lifecycle.');
})().catch(e=>{console.error(e);process.exit(1)});
