const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const tracked=cp.execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const patterns=[['github-token',/\bgh[pousr]_[A-Za-z0-9]{30,}\b/],['github-fine-grained-token',/\bgithub_pat_[A-Za-z0-9_]{40,}\b/],['google-api-key',/\bAIza[0-9A-Za-z_-]{35}\b/],['aws-access-key',/\bAKIA[A-Z0-9]{16}\b/],['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/]];
const findings=[];
for(const name of tracked){
 if(/(?:^|\/)\.env(?:\.|$)|log-bridge-settings\.json$|log-bridge-config\.js$|instagram-canli-log.*\.jsonl$/.test(name)){findings.push({file:name,type:'private-file-tracked'});continue}
 const file=path.join(root,name);if(!fs.existsSync(file)||fs.statSync(file).size>5_000_000||/\.(png|jpg|zip|jpeg)$/i.test(name))continue;
 const text=fs.readFileSync(file,'utf8');for(const [type,regex] of patterns){const match=regex.exec(text);if(match)findings.push({file:name,line:text.slice(0,match.index).split('\n').length,type})}
}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'extension/manifest.json')));
if(JSON.stringify([...manifest.permissions].sort())!==JSON.stringify(['activeTab','scripting','storage'].sort())||manifest.host_permissions)findings.push({file:'extension/manifest.json',type:'unexpected-release-permissions'});
for(const name of fs.readdirSync(path.join(root,'extension'))){
 if(/settings\.json$|config\.js$|\.env/.test(name))findings.push({file:'extension/'+name,type:'private-file-packaged'});
}
if(findings.length){console.error(JSON.stringify({passed:false,findings},null,2));process.exitCode=1}else console.log(JSON.stringify({passed:true,trackedFiles:tracked.length,manifestVersion:manifest.version,permissions:manifest.permissions,scope:'Current tracked source and browser-only extension; token values are never printed.'}));
