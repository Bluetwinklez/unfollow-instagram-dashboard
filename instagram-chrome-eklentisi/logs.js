"use strict";
let entries=[];
const labels={"request.start":"İstek başladı","request.end":"Yanıt alındı","request.error":"Bağlantı hatası","operation.start":"İşlem başladı","operation.end":"İşlem bitti","operation.busy":"Diğer sekmede işlem var","scan.page":"Liste sayfası alındı","scan.error":"Tarama durdu","scan.pause":"Tarama duraklatıldı","scan.resume":"Taramaya devam","scan.cancel":"Tarama iptali","unfollow.pause":"İşlem duraklatıldı","unfollow.resume":"İşleme devam","unfollow.cancel":"İşlem iptali","panel.close":"Panel kapatıldı","storage.error":"Kayıt yazılamadı"};
const routes={following:"Takip edilen listesi",followers:"Takipçi listesi",unfollow:"Takip bırakma",verify:"Takip doğrulaması",other:"Diğer"};
function render(){
 const body=document.getElementById("rows");const fragment=document.createDocumentFragment();
 const visible=entries.filter(e=>!document.getElementById("errors").checked||e.level==="error"||e.level==="warn");
 for(const entry of visible){const row=document.createElement("tr");row.className=entry.level;
  const detail=[entry.method,routes[entry.route],entry.status?"HTTP "+entry.status:"",entry.responseKind,entry.redirected?"Yönlendirildi":"",entry.durationMs!=null?entry.durationMs+" ms":"",entry.reason,entry.outcome].filter(Boolean).join(" · ");
  const progress=entry.loaded!=null?entry.loaded+(entry.total!=null?" / "+entry.total:""):entry.confirmed!=null?entry.confirmed+" doğrulandı":"";
  for(const value of [new Date(entry.at).toLocaleTimeString("tr-TR"),String(entry.tabId),labels[entry.event]||entry.event,detail,progress]){const cell=document.createElement("td");cell.textContent=value;row.appendChild(cell)}fragment.appendChild(row);
 }
 body.replaceChildren(fragment);document.getElementById("empty").hidden=visible.length>0;
 document.getElementById("status").textContent=entries.length+" olay · Son güncelleme "+new Date().toLocaleTimeString("tr-TR");
 if(document.getElementById("follow").checked)body.lastElementChild?.scrollIntoView({block:"nearest"});
}
async function refresh(){
 const data=await chrome.storage.session.get(["iu_live_log_v1","iu_log_bridge_state"]);entries=Array.isArray(data.iu_live_log_v1)?data.iu_live_log_v1:[];render();
 const bridge=data.iu_log_bridge_state;
 document.getElementById("bridge").textContent=bridge?.connected?"● Yerel dosyaya kayıt açık. Asistan instagram-canli-log.jsonl dosyasından izleyebilir.":"○ Yerel kayıt bağlantısı henüz yok. Paketteki CANLI-LOG-BASLAT.cmd dosyasını çalıştır; tarayıcı günlüğü burada çalışmaya devam eder.";
}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==="session"&&(changes.iu_live_log_v1||changes.iu_log_bridge_state))void refresh();});
document.getElementById("errors").addEventListener("change",render);
document.getElementById("clear").addEventListener("click",async()=>{await chrome.runtime.sendMessage({type:"IU_LOG_CLEAR"});await refresh();});
document.getElementById("download").addEventListener("click",()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({exportedAt:new Date().toISOString(),entries},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="instagram-canli-gunluk.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
void refresh();
