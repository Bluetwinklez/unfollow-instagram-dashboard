const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let listener;const data={};
const chrome={runtime:{id:'test',getURL:f=>'chrome-extension://test/'+f,onInstalled:{addListener(){}},onMessage:{addListener:fn=>listener=fn}},action:{onClicked:{addListener(){}}},tabs:{onRemoved:{addListener(){}},async create(){return{}}},storage:{session:{async get(k){return{[k]:data[k]}},async set(v){Object.assign(data,v)},async remove(k){delete data[k]}}}};
vm.runInNewContext(fs.readFileSync('instagram-chrome-eklentisi/service-worker.js','utf8'),{chrome,console,URL,Date,importScripts(){}});
const send=(message,url='https://www.instagram.com/')=>new Promise(resolve=>{const held=listener(message,{id:'test',frameId:0,tab:{id:7},url},resolve);if(held!==true)resolve({ok:false})});
(async()=>{
 const r=await send({type:'IU_LOG_APPEND',entry:{event:'request.end',method:'GET',route:'following',status:429,durationMs:35,headers:{cookie:'secret'},body:'secret',url:'https://www.instagram.com/private?token=secret'}});
 assert.equal(r.ok,true);assert.equal(data.iu_live_log_v1.length,1);assert.equal(data.iu_live_log_v1[0].status,429);assert.ok(!JSON.stringify(data).includes('secret'));
 assert.equal((await send({type:'IU_LOG_APPEND',entry:{event:'request.end',status:200}},'https://evil.example/')).ok,false);
 for(let i=0;i<505;i++)await send({type:'IU_LOG_APPEND',entry:{event:'scan.page',loaded:i}});
 assert.equal(data.iu_live_log_v1.length,500);assert.equal(data.iu_live_log_v1.at(-1).loaded,504);
 assert.equal((await send({type:'IU_LOG_CLEAR'})).ok,false);assert.equal((await send({type:'IU_LOG_CLEAR'},'chrome-extension://test/logs.html')).ok,true);assert.equal(data.iu_live_log_v1.length,0);
 console.log('PASS: live logs preserve HTTP status, redact undeclared fields, reject other origins, cap at 500 and restrict clearing.');
})().catch(e=>{console.error(e);process.exit(1)});
