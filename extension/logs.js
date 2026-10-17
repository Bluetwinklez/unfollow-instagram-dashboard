"use strict";
let entries=[];
let refreshRevision=0;
const labels={"request.start":"İstek başladı","request.end":"Yanıt alındı","request.error":"Bağlantı hatası","operation.start":"İşlem başladı","operation.end":"İşlem bitti","operation.error":"İşlem beklenmedik biçimde durdu","operation.busy":"Diğer sekmede işlem var","scan.page":"Liste sayfası alındı","scan.error":"Tarama durdu","scan.pause":"Tarama duraklatıldı","scan.resume":"Taramaya devam","scan.cancel":"Tarama iptali","unfollow.pause":"İşlem duraklatıldı","unfollow.resume":"İşleme devam","unfollow.cancel":"İşlem iptali","unfollow.result":"Takip bırakma doğrulama sonucu","panel.close":"Panel kapatıldı","storage.error":"Kayıt yazılamadı"};
const routes={following:"Takip edilen listesi",followers:"Takipçi listesi",unfollow:"Takip bırakma",verify:"Takip doğrulaması",other:"Diğer"};
const outcomes={complete:"Doğrulandı / tamamlandı",cancelled:"İptal edildi",stopped:"Durduruldu / doğrulanamadı",results:"Tarama tamamlandı",idle:"İşlem bekleniyor",running:"Sürüyor"};
function render(){
 const body=document.getElementById("rows");const fragment=document.createDocumentFragment();
 const visible=entries.filter(e=>!document.getElementById("errors").checked||e.level==="error"||e.level==="warn");
 for(const entry of visible){const row=document.createElement("tr");row.className=entry.level;
  const detail=[entry.method,routes[entry.route],entry.status?"HTTP "+entry.status:"",entry.responseKind,entry.redirected?"Yönlendirildi":"",entry.durationMs!=null?entry.durationMs+" ms":"",entry.reason,outcomes[entry.outcome]].filter(Boolean).join(" · ");
  const progress=[entry.loaded!=null?entry.loaded+(entry.total!=null?" / "+entry.total:""):"",entry.confirmed!=null?entry.confirmed+" doğrulandı":""].filter(Boolean).join(" · ");
  for(const value of [new Date(entry.at).toLocaleTimeString("tr-TR"),String(entry.tabId),labels[entry.event]||entry.event,detail,progress]){const cell=document.createElement("td");cell.textContent=value;row.appendChild(cell)}fragment.appendChild(row);
 }
 body.replaceChildren(fragment);document.getElementById("empty").hidden=visible.length>0;
 if(document.getElementById("follow").checked)body.lastElementChild?.scrollIntoView({block:"nearest"});
}
function renderBridge(){document.getElementById("bridge").textContent="Yalnızca tarayıcı içi günlük açık. Asistana otomatik aktarım yok. Günlük Chrome oturumu kapanınca silinir; paylaşmak için Günlüğü indir düğmesini kullan.";}
async function refresh(){
 const revision=++refreshRevision;
 try{
  const data=await chrome.storage.session.get(["iu_live_log_v1"]);
  if(revision!==refreshRevision)return;
  entries=Array.isArray(data.iu_live_log_v1)?data.iu_live_log_v1:[];render();renderBridge(data);
  document.getElementById("status").textContent="Tarayıcı günlüğü bağlı · "+entries.length+" olay · Son okuma "+new Date().toLocaleTimeString("tr-TR");
 }catch{
  if(revision!==refreshRevision)return;
  document.getElementById("status").textContent="Canlı günlük okunamadı. Gösterilen kayıtlar eski olabilir; eklentiyi kontrol et veya bu sayfayı yenile.";
 }
}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==="session"&&(changes.iu_live_log_v1))void refresh();});
document.getElementById("errors").addEventListener("change",render);
document.getElementById("follow").addEventListener("change",render);
document.getElementById("clear").addEventListener("click",async()=>{
 const button=document.getElementById("clear");button.disabled=true;
 try{
  const result=await chrome.runtime.sendMessage({type:"IU_LOG_CLEAR"});
  if(!result?.ok)throw new Error("clear failed");
  await refresh();
 }catch{document.getElementById("status").textContent="Günlük temizlenemedi. Kayıtlar korunuyor; yeniden dene.";}
 finally{button.disabled=false;}
});
document.getElementById("download").addEventListener("click",()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify({extensionVersion:chrome.runtime.getManifest().version,exportedAt:new Date().toISOString(),entries},null,2)],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="instagram-canli-gunluk.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
// Polling also recovers after a missed storage event or a temporary read failure.
setInterval(()=>void refresh(),5000);
void refresh();
