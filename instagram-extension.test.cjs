const fs=require('fs');
const vm=require('vm');
const path=require('path');
const assert=require('assert/strict');
const dir=path.resolve('instagram-chrome-eklentisi');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.deepEqual([...manifest.permissions].sort(),['activeTab','scripting','storage'].sort());
assert.deepEqual(manifest.host_permissions,['http://127.0.0.1/*']);
assert.equal(manifest.action.default_popup,undefined);
for(const f of [manifest.background.service_worker,'platform.js',...Object.values(manifest.icons)])assert.ok(fs.existsSync(path.join(dir,f)),f);
for(const [size,file] of Object.entries(manifest.icons)){const b=fs.readFileSync(path.join(dir,file));assert.equal(b.readUInt32BE(16),Number(size));assert.equal(b.readUInt32BE(20),Number(size));}
const content=fs.readFileSync(path.join(dir,'content.js'),'utf8');
assert.ok(!/\b(?:krea|cobanov|claude|codex)\b/i.test(content),'Runtime bundle must not contain personal signatures or generator branding');
assert.ok(!/\bonerror=/.test(content));
assert.ok(!content.includes('__IU_TEST__'));
assert.ok(!/\beval\s*\(|new Function\s*\(/.test(content));
assert.ok(!content.includes('localStorage.'));
assert.ok(fs.readFileSync(path.join(dir,'platform.js'),'utf8').includes('chrome.storage.local'));
async function workerScenario(allowed,throws=false){
 let action;const scripts=[],tabs=[],badges=[];
 const chrome={runtime:{getURL:f=>'chrome-extension://test/'+f,onMessage:{addListener(){}},onInstalled:{addListener(){}}},action:{onClicked:{addListener:fn=>action=fn},async setBadgeText(x){badges.push(x)},async setBadgeBackgroundColor(){},async setTitle(){}},tabs:{onRemoved:{addListener(){}},async create(x){tabs.push(x)}},scripting:{async executeScript(x){scripts.push(x);if(throws)throw Error('restricted');return [{result:x.files?{ok:true}:allowed}]}}};
 vm.runInNewContext(fs.readFileSync(path.join(dir,manifest.background.service_worker),'utf8'),{chrome,console,importScripts(){}});
 await action({id:7});return{scripts,tabs,badges};
}
(async()=>{
 const yes=await workerScenario(true);assert.equal(yes.scripts.length,2);assert.equal(yes.scripts[1].world,'ISOLATED');assert.equal(yes.scripts[1].files[1],'content.js');assert.equal(yes.tabs.length,0);
 const no=await workerScenario(false);assert.equal(no.scripts.length,1);assert.equal(no.tabs.length,1);assert.ok(no.tabs[0].url.includes('help.html'));
 const restricted=await workerScenario(false,true);assert.equal(restricted.tabs.length,1);
 console.log('PASS: MV3, permissions, PNG sizes, CSP-safe bundle, isolated injection, wrong/restricted-page handling.');
})().catch(e=>{console.error(e);process.exit(1)});
