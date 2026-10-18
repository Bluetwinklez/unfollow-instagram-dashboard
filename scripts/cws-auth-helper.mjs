import http from 'node:http';
import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import readline from 'node:readline/promises';

export async function createOAuthSession({clientId,clientSecret,port=3456,fetchImpl=fetch,onToken=()=>{}}){
 if(!clientId||!clientSecret)throw Error('Client ID and secret are required');
 const state=randomBytes(32).toString('base64url');
 const verifier=randomBytes(32).toString('base64url');
 let busy=false,redirectUri;
 const equal=(a,b)=>typeof a==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
 const server=http.createServer(async(req,res)=>{
  const send=(status,text)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'"});res.end(text)};
  const url=new URL(req.url,'http://127.0.0.1');
  if(req.method!=='GET'||url.pathname!=='/oauth2callback')return send(404,'Not found');
  if(!equal(url.searchParams.get('state'),state))return send(400,'Invalid authorization state. Return to the original authorization link.');
  if(url.searchParams.has('error')){send(400,'Authorization was declined.');server.close();return;}
  const code=url.searchParams.get('code');if(!code||code.length>4096)return send(400,'Missing authorization code');
  if(busy)return send(409,'Authorization already being processed');busy=true;
  try{
   const response=await fetchImpl('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,code,grant_type:'authorization_code',redirect_uri:redirectUri,code_verifier:verifier}),signal:AbortSignal.timeout(15000)});
   const data=await response.json();
   if(!response.ok||data.error||typeof data.refresh_token!=='string'||!data.refresh_token)throw Error('Token exchange failed');
   await onToken(data.refresh_token);
   send(200,'Authorization completed. Return to your terminal. Keep the token private.');
  }catch{send(400,'Token exchange failed. Authorization was not completed. Restart the helper.');}
  finally{server.close();}
 });
 server.on('clientError',(_error,socket)=>socket.destroy());
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});
 redirectUri=`http://127.0.0.1:${server.address().port}/oauth2callback`;
 const authUrl=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 for(const [key,value] of Object.entries({client_id:clientId,response_type:'code',redirect_uri:redirectUri,scope:'https://www.googleapis.com/auth/chromewebstore',access_type:'offline',prompt:'consent',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'}))authUrl.searchParams.set(key,value);
 const expiry=setTimeout(()=>server.close(),300000);expiry.unref();server.on('close',()=>clearTimeout(expiry));
 return {server,authUrl:authUrl.toString(),redirectUri};
}
async function main(){
 const prompt=readline.createInterface({input:process.stdin,output:process.stdout});
 try{
  const clientId=process.env.CWS_CLIENT_ID||await prompt.question('Google OAuth Client ID: ');
  const clientSecret=process.env.CWS_CLIENT_SECRET||await prompt.question('Google OAuth Client Secret (local input only): ');
  const session=await createOAuthSession({clientId:clientId.trim(),clientSecret:clientSecret.trim(),onToken:token=>console.log('Store this value only in GitHub Actions secret CWS_REFRESH_TOKEN:\n'+token)});
  console.log('Register redirect URI: '+session.redirectUri+'\nOpen this link in your browser:\n'+session.authUrl);
 }finally{prompt.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('Authorization helper could not start. Check the configuration and local port.');process.exitCode=1});
