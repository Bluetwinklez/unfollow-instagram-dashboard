const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),cp=require('child_process');
const {snapshot}=require('./scripts/test-fingerprint.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'iu-fingerprint-'));
const write=(name,body)=>{const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body)};
try{
 write('scripts/test-fingerprint.cjs',fs.readFileSync('scripts/test-fingerprint.cjs'));
 write('scripts/package-release.py',fs.readFileSync('scripts/package-release.py'));
 write('extension/manifest.json',JSON.stringify({version:'1.0.0',permissions:['activeTab','scripting','storage']}));
 write('extension/content.js','const value=1;\n');
 const first=snapshot(root);
 write('instagram-chrome-eklentisi/log-bridge-settings.json','{"token":"secret"}');
 write('README.md','Documentation update');assert.deepEqual(snapshot(root),first);
 write('extension/content.js','const value=1;\r\n');assert.deepEqual(snapshot(root),first,'Equivalent line endings must not invalidate tests');
 write('instagram-magaza-hazirlik/TUM-TEST-SONUCLARI.json',JSON.stringify({version:'1.0.0',results:[{passed:true}],unchanged:true,testedFiles:first}));
 write('extension/content.js','const value=2;\n');assert.notDeepEqual(snapshot(root),first,'Same-version changes must invalidate test proof');
 const result=cp.spawnSync('python',[path.join(root,'scripts/package-release.py')],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,/Files have changed/,'Packaging must reject a stale successful report before attempting publication');
 console.log('PASS: same-version runtime changes invalidate test proof; ignored credentials/docs and equivalent line endings do not; stale reports cannot package.');
}finally{fs.rmSync(root,{recursive:true,force:true})}
