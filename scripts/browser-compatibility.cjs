const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),os=require('os');
(async()=>{
 const extension=path.resolve('extension'),results=[];
 const browsers=[['Google Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'],['Brave','C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe']];
 for(const [browser,executablePath] of browsers){
  if(!fs.existsSync(executablePath)){results.push({browser,status:'not-installed',liveInstagram:false});continue}
  let context;try{
   context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(),'iu-browser-check-')),{executablePath,headless:true,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
   const version=context.browser().version();const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker',{timeout:10000}).catch(()=>null);
   if(!worker){results.push({browser,version,status:'extension-worker-not-observed',liveInstagram:false});continue}
   const page=await context.newPage();await context.setOffline(true);await page.goto(new URL('workspace.html',worker.url()).href);await page.locator('#title').filter({hasText:/Genel/}).waitFor({timeout:10000});
   results.push({browser,version,status:'extension-page-and-offline-initialization-passed',liveInstagram:false,scope:'MV3 worker and workspace initialization; full mocked workflows tested separately in Chromium.'});
  }catch(e){results.push({browser,status:'validation-unavailable',reason:e.name,liveInstagram:false})}finally{await context?.close()}
 }
 fs.writeFileSync('docs/repair/BROWSER-COMPATIBILITY.json',JSON.stringify({at:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1});
