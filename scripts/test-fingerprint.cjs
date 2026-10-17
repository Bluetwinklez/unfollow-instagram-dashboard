const fs=require('fs'),path=require('path'),crypto=require('crypto');
function snapshot(root=path.resolve(__dirname,'..')){
 const files=new Set();
 const skip=new Set(['log-bridge-settings.json','log-bridge-config.js','__pycache__']);
 function walk(relative){
  const absolute=path.join(root,relative);if(!fs.existsSync(absolute))return;
  for(const item of fs.readdirSync(absolute,{withFileTypes:true})){
   if(skip.has(item.name)||item.name.endsWith('.pyc'))continue;
   const name=path.posix.join(relative,item.name);
   if(item.isDirectory())walk(name);else if(item.isFile())files.add(name);
  }
 }
 for(const dir of ['scripts','extension','instagram-chrome-eklentisi','instagram-magaza-hazirlik/extension'])walk(dir);
 for(const name of fs.readdirSync(root)){
  if(/^instagram-.*\.test\.(cjs|py)$/.test(name)||['package.json','package-lock.json','instagram-tum-takipleri-birak.js','instagram-dashboard.css'].includes(name))files.add(name);
 }
 const result={};
 for(const name of [...files].sort()){
  let bytes=fs.readFileSync(path.join(root,name));
  if(!name.endsWith('.png'))bytes=Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'));
  result[name]=crypto.createHash('sha256').update(bytes).digest('hex');
 }
 return result;
}
module.exports={snapshot};
if(require.main===module)process.stdout.write(JSON.stringify(snapshot()));
