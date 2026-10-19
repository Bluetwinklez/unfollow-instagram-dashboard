"use strict";
let entries=[];
let refreshRevision=0;
const labels={"request.start":"İstek başladı","request.end":"Yanıt alındı","request.error":"Bağlantı hatası","operation.start":"İşlem başladı","operation.end":"İşlem bitti","operation.error":"İşlem beklenmedik biçimde durdu","operation.busy":"Diğer sekmede işlem var","scan.page":"Liste sayfası alındı","scan.error":"Tarama durdu","scan.pause":"Tarama duraklatıldı","scan.resume":"Taramaya devam","scan.cancel":"Tarama iptali","unfollow.pause":"İşlem duraklatıldı","unfollow.resume":"İşleme devam","unfollow.cancel":"İşlem iptali","unfollow.result":"Takip bırakma doğrulama sonucu","panel.close":"Panel kapatıldı","storage.error":"Kayıt yazılamadı"};
const routes={following:"Takip edilen listesi",followers:"Takipçi listesi",unfollow:"Takip bırakma",verify:"Takip doğrulaması",other:"Diğer"};
const outcomes={complete:"Doğrulandı / tamamlandı",cancelled:"İptal edildi",stopped:"Durduruldu / doğrulanamadı",results:"Tarama tamamlandı",idle:"İşlem bekleniyor",running:"Sürüyor",completed_with_errors:"Tamamlandı; başarısız işlemler var",complete_no_changes:"Yeni takip bırakma yapılmadı"};
const stages={precheck:"İşlem öncesi ilişki kontrolü",mutation:"Takip bırakma POST isteği",verification:"İşlem sonrası bağımsız doğrulama",scan:"Liste taraması"};
const destinations={graphql:"Instagram GraphQL yolu",destroy:"Takip bırakma API yolu",show:"İlişki kontrol API yolu",login:"Giriş sayfası",challenge:"Güvenlik kontrolü yolu",home:"Instagram ana sayfası","other-instagram":"Diğer Instagram yolu","other-origin":"Farklı kaynak",unavailable:"Son adres bilgisi yok"};
const signalLabels={"login-form":"Giriş formu işareti","challenge-form":"Güvenlik formu işareti","instagram-app-shell":"Instagram uygulama sayfası işareti","not-found-title":"Bulunamayan sayfa başlığı işareti"};
function explainEntry(entry){
 const lines=[];
 if(entry.operationName)lines.push("İşlem adı: "+entry.operationName);
 if(stages[entry.stage])lines.push("Aşama: "+stages[entry.stage]);
 if(entry.requestPath)lines.push("Adres şablonu: "+entry.requestPath);
 if(entry.requestId)lines.push("İstek eşleştirme kimliği: "+entry.requestId);
 if(entry.credentialsIncluded!=null)lines.push("Oturum çerezleri için credentials: "+(entry.credentialsIncluded?"include (gönderim ayarı; sunucunun kabul ettiğini kanıtlamaz)":"dahil değil"));
 if(entry.method==="POST"){
  if(entry.csrfHeaderPresent!=null)lines.push("CSRF başlığı: "+(entry.csrfHeaderPresent?"var; değeri kaydedilmedi":"yok"));
  if(entry.formBodyPresent!=null)lines.push("user_id form alanı: "+(entry.formBodyPresent?"var; hedef değeri kaydedilmedi":"yok"));
 }
 if(entry.contentType)lines.push("Sunucunun Content-Type bilgisi: "+entry.contentType);
 for(const [field,label]of [["requestHeaders","İstek başlıkları"],["responseHeaders","Yanıt başlıkları"]])if(entry[field])lines.push(label+": "+JSON.stringify(entry[field]));
 if(entry.htmlStructure)lines.push("HTML yapı önizlemesi (ilk 200 etiket; metin, nitelik ve script içeriği çıkarıldı): "+entry.htmlStructure);
 if(entry.finalRoute)lines.push("Yanıtın son adres sınıfı: "+destinations[entry.finalRoute]);
 if(entry.redirected!=null)lines.push("Fetch yönlendirme bildirdi: "+(entry.redirected?"evet":"hayır"));
 if(entry.responseLength!=null)lines.push("Okunan yanıt: "+entry.responseLength+" karakter (ağdaki sıkıştırılmış bayt sayısı değildir)");
 if(entry.responseKind==="html"){
  lines.push("JSON beklenirken HTML geldi; takip bırakıldığı doğrulanamaz. HTTP 200 tek başına işlem başarısı değildir.");
  lines.push("HTML işaretleri: "+((entry.htmlSignals||[]).map(value=>signalLabels[value]).filter(Boolean).join(", ")||"tanınan işaret yok / eski kayıtta incelenmedi"));
  lines.push("Bu işaretler sayfa türüne dair ipucudur; oturum kaybını veya hesap engelini tek başına kanıtlamaz.");
 }
 if(entry.errorKind)lines.push("Bağlantı/okuma hata türü: "+entry.errorKind+". Ham hata mesajı ve stack, kişisel URL içerebileceği için kaydedilmedi.");
 if(entry.event==="unfollow.result"&&entry.outcome==="stopped")lines.push("İşlem güvenli biçimde durdu. Belirsiz POST otomatik tekrarlanmaz ve sonraki hedefe geçilmez. Kesin aşama, bu olaydan önceki istek kayıtlarından okunmalıdır.");
 return lines.join("\n");
}
function diagnosticReport(){
 const requestEnds=entries.filter(entry=>entry.event==="request.end");
 const lastMutation=requestEnds.filter(entry=>entry.stage==="mutation"||(entry.method==="POST"&&entry.route==="unfollow")).at(-1);
 return {schemaVersion:2,extensionVersion:chrome.runtime.getManifest().version,exportedAt:new Date().toISOString(),
  diagnosticSummary:{retainedEvents:entries.length,scope:"Son 500 olay; oturumdaki bütün denemelerin eksiksiz kaydı olduğu garanti edilmez.",
   lastMutation:lastMutation?{at:lastMutation.at,requestId:lastMutation.requestId,status:lastMutation.status,responseKind:lastMutation.responseKind,contentType:lastMutation.contentType,finalRoute:lastMutation.finalRoute,redirected:lastMutation.redirected,htmlSignals:lastMutation.htmlSignals}:null,
   rootCause:"Kesin kök neden bu günlükten otomatik belirlenmez; kanıtlar aşağıdaki olaylarda listelenir.",
   privacy:"Cookie, token, gerçek hedef ID, kullanıcı adı, ham HTML/JSON gövdesi ve tam URL kaydedilmez. Başlık değerleri izin listesiyle filtrelenir; diğerleri REDACTED olarak gösterilir. HTML yalnızca sabit etiket adlarından oluşan yapı önizlemesidir.",
   captureLimits:"Başlıklar fetch API'sinin erişebildikleriyle sınırlıdır. Tarayıcının eklediği Cookie ve bazı ağ başlıkları JavaScript'e açılmaz. DevTools Network'ün tam kopyası değildir. Önceki kayıtlar eksik alanlarla kalabilir.",
   missingEvidence:"Sunucunun neden bu yanıtı ürettiği ve Instagram'ın yerel arayüzündeki karşılık gelen mutation sözleşmesi bu günlükte bulunmayabilir."},
  entries:entries.map(entry=>({...entry,explanation:explainEntry(entry)}))};
}
function render(){
 const body=document.getElementById("rows");const fragment=document.createDocumentFragment();
 const visible=entries.filter(e=>!document.getElementById("errors").checked||e.level==="error"||e.level==="warn");
 for(const entry of visible){const row=document.createElement("tr");row.className=entry.level;
  const detail=[entry.method,routes[entry.route],entry.status?"HTTP "+entry.status:"",entry.responseKind,entry.redirected?"Yönlendirildi":"",entry.durationMs!=null?entry.durationMs+" ms":"",entry.code,entry.reason,outcomes[entry.outcome]].filter(Boolean).join(" · ");
  const progress=[entry.loaded!=null?entry.loaded+(entry.total!=null?" / "+entry.total:""):"",entry.confirmed!=null?entry.confirmed+" doğrulandı":""].filter(Boolean).join(" · ");
  for(const value of [new Date(entry.at).toLocaleTimeString("tr-TR"),String(entry.tabId),labels[entry.event]||entry.event,[detail,explainEntry(entry)].filter(Boolean).join("\n"),progress]){const cell=document.createElement("td");cell.textContent=value;row.appendChild(cell)}fragment.appendChild(row);
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
 const url=URL.createObjectURL(new Blob([JSON.stringify(diagnosticReport(),null,2)],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="instagram-canli-gunluk.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
// Polling also recovers after a missed storage event or a temporary read failure.
setInterval(()=>void refresh(),5000);
void refresh();
