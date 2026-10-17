const fs=require('fs'),path=require('path');
const root=path.resolve('instagram-magaza-hazirlik');
const out=path.join(root,'extension');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(root,'gorseller'),{recursive:true});
const source=path.resolve('instagram-chrome-eklentisi');
const files=['manifest.json','service-worker.js','platform.js','content.js','help.html','help.css','help.js','logs.html','logs.css','logs.js','CREDITS.md'];
for(const name of files)fs.copyFileSync(path.join(source,name),path.join(out,name));
fs.cpSync(path.join(source,'icons'),path.join(out,'icons'),{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
manifest.version='2.8.6';delete manifest.host_permissions;
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
let sw=fs.readFileSync(path.join(out,'service-worker.js'),'utf8');
sw=sw.replace('importScripts("log-bridge-config.js");','');
sw=sw.replace(/async function forwardLog\(entry\) \{[\s\S]*?\n\}\n\nasync function handleLogMessage/,'async function handleLogMessage');
sw=sw.replace('  void forwardLog(entry);','');
if(/IU_LOG_BRIDGE|127\.0\.0\.1|forwardLog/.test(sw))throw Error('Bridge remains');
fs.writeFileSync(path.join(out,'service-worker.js'),sw);
let logs=fs.readFileSync(path.join(out,'logs.js'),'utf8');
const bridgeView=/function renderBridge\(data\)\{[\s\S]*?\n\}/;
if(!bridgeView.test(logs))throw Error('Log bridge view boundary missing');
logs=logs.replace(bridgeView,'function renderBridge(){document.getElementById("bridge").textContent="Yalnızca tarayıcı içi günlük açık. Asistana otomatik aktarım yok. Günlük Chrome oturumu kapanınca silinir; paylaşmak için Günlüğü indir düğmesini kullan.";}');
logs=logs.replaceAll('["iu_live_log_v1","iu_log_bridge_state"]','["iu_live_log_v1"]').replace('changes.iu_live_log_v1||changes.iu_log_bridge_state','changes.iu_live_log_v1');
fs.writeFileSync(path.join(out,'logs.js'),logs);
let help=fs.readFileSync(path.join(out,'help.html'),'utf8');
help=help.replace(/ Paketteki <strong>CANLI-LOG-BASLAT\.cmd<\/strong>[\s\S]*?Python 3 gerektirir\./,' Günlüğü indir düğmesiyle tanı kaydını dışa aktarabilirsin.');
help=help.replace(/ İsteğe bağlı günlük yardımcısı[\s\S]*?alır\./,'');
help=help.replace(/Özel kullanım sürümü · [\d.]+/,'Mağaza sürümü · 2.8.6');
help=help.replace('</footer>',' · <a href="privacy.html">Gizlilik politikası</a></footer>');
fs.writeFileSync(path.join(out,'help.html'),help);
let content=fs.readFileSync(path.join(out,'content.js'),'utf8').replaceAll('2.8.6-extension','2.8.6-extension');
fs.writeFileSync(path.join(out,'content.js'),content);
const policy=`# Instagram Takip Yönetimi — Gizlilik Politikası

Son güncelleme: 18 Ekim 2026. Kapsam: 2.8.6 mağaza sürümü.

## İşlenen bilgiler ve amaç
Eklenti, kullanıcı başlattığında Instagram'da takip edilen ve isteğe bağlı olarak takipçi hesaplarının kimliklerini, kullanıcı adlarını, görünen adlarını, profil fotoğrafı adreslerini ve takip durumlarını işler. Bu bilgiler listeleme, arama, seçim ve onaylanan takip bırakma işlemleri için kullanılır. Başka sekmelerin geçmişini, mesajları, konum, sağlık veya finans bilgilerini okumaz.

## Oturum ve bağlantılar
Şifrenizi istemez veya kaydetmez. Açık Instagram oturumu kullanılır. Hesap kimliği ve CSRF değeri Instagram çerezlerinden yalnızca işlem sırasında okunur; CSRF değeri yetkili Instagram isteğinin güvenlik başlığında kullanılır. Tarayıcı ilgili oturum çerezlerini Instagram isteklerine ekler. Oturum bilgileri geliştiriciye gönderilmez veya günlüğe yazılmaz.
Takip edilen/takipçi listeleri ve takip işlemleri için Instagram'a istek gönderilir; profil fotoğrafları Instagram'ın sağladığı adreslerden yüklenir. Bu hizmetler Meta'nın kendi gizlilik politikasına tabidir: https://privacycenter.instagram.com/policy/

## Yerel saklama
Ayarlar, dil, gizlenen hesap kimlikleri ve yarım kalan tarama (hesap kimliği, liste ve sayfalama bilgileri) chrome.storage.local içinde saklanır. Yarım kalan kayıtlar 24 saatten eskiyse devam etmek için kullanılmaz; bu süre otomatik fiziksel silme garantisi değildir. Tamamlanan taramanın kontrol noktası temizlenir. Diğer yerel kayıtlar eklenti kaldırılınca silinir.
Tanı günlüğü, zaman, sekme numarası, olay, HTTP durumu, yanıt türü, süre ve ilerleme gibi en fazla 500 olayı Chrome oturumu boyunca saklar. Çerezler, şifreler, kullanıcı adları, istek başlıkları ve ham yanıt gövdeleri tanı günlüğüne dahil edilmez. Günlük ekrandan temizlenebilir ve Chrome oturumu sona erdiğinde silinir.

## Dışa aktarma ve paylaşım
Kullanıcı isterse tanı günlüğünü veya hesap adları/kimlikleri içeren işlem raporunu kendi cihazına indirir; kullanıcı adlarını panoya kopyalayabilir. Bu dosyalar eklenti kaldırılınca silinmez; kullanıcı tarafından silinir. Destek için bir dosyayı paylaşmak kullanıcının tercihidir.
Bu sürüm geliştirici sunucusuna tanı kaydı göndermez, uzaktan kontrol sağlamaz, analiz veya reklam hizmeti içermez. Veriler satılmaz; reklam, kredi değerlendirmesi veya eklentinin tek amacı dışındaki işler için kullanılmaz. Verilerin kullanımı Chrome Web Store User Data Policy ve Limited Use koşullarıyla sınırlıdır.

## Kontrol ve değişiklikler
Tarama ve takip bırakma kullanıcı tarafından başlatılır. Takip bırakmak ayrıca onay gerektirir. Kullanıcı duraklatabilir veya iptal edebilir; gönderilmiş bir istek tamamlanmış olabilir. Eklentiyi kaldırmak eklentinin yerel verilerini siler. Veri uygulamaları değişirse politika ve mağaza açıklaması güncellenir.

## İletişim
YAYINDAN ÖNCE DOLDURULACAK: Yayıncı adı ve destek e-posta adresi.
Bu metin yayıncının iletişim bilgileri eklenip herkese açık bir HTTPS adresinde yayımlandıktan sonra mağaza formuna bağlanmalıdır.
`;
fs.writeFileSync(path.join(root,'GIZLILIK-POLITIKASI.md'),policy);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.writeFileSync(path.join(out,'privacy.html'),'<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gizlilik Politikası</title><link rel="stylesheet" href="help.css"><main><pre style="white-space:pre-wrap;font:inherit;line-height:1.7">'+esc(policy)+'</pre></main></html>');
fs.copyFileSync(path.join(out,'privacy.html'),path.join(root,'privacy.html'));
const listing=`# Chrome Web Store — Instagram Takip Yönetimi

Son güncelleme: 2026-10-18. Sürüm: 2.8.6. Durum: HAZIRLIK TASLAĞI; mağazaya gönderilmedi.

## Mağaza bilgileri
Ad: Instagram Takip Yönetimi
Kısa açıklama: Takip ettiklerini tam sayfa listele; seçtiğin hesapların takibini onaylayarak bırak.
Dil: Türkçe (arayüz İngilizceyi de destekler).
Kategori: Sosyal ve İletişim (paneldeki karşılığı).
Tek amaç: Instagram'da takip edilen hesapları listelemek ve kullanıcının seçip onayladığı hesapların takibini yönetmek.

### Ayrıntılı açıklama — kopyalanacak metin
Instagram'da takip ettiğin hesapları tek ekranda gör, ara ve seçtiğin hesapların takibini onaylayarak bırak.

İki isteğe bağlı tarama: tüm takip ettiklerin veya seni geri takip etmeyenler.
Açık lila dashboard, liste istatistikleri ve kullanıcı adıyla arama.
Tek tek seçim veya tümünü seçme.
Duraklatma, iptal ve ayarlanabilir bekleme süreleri.
Olumlu işlem yanıtından sonra ayrıca takip durumu kontrolü.
Doğrulanan, doğrulanamayan ve işlenmeyen hesapları gösteren indirilebilir rapor.
Hata incelemesi için indirilebilir yerel canlı günlük.
Türkçe ve İngilizce arayüz.

Kullanım: Instagram hesabına giriş yap, eklenti simgesine tıkla ve taramayı başlat. Önce tarama seçeneğini belirle. Listeden hesapları seç, Takibi bırak düğmesine bas ve işlemi onayla. Tüm takip ettiklerim modunda seni geri takip eden hesaplar da seçime dahildir. Geri takip etmeyenler modunda iki liste tamamlanmadan sonuçlar gösterilmez. Önce bir hesapla dene.

Şifreni istemez. Mevcut Instagram oturumunu kullanır. Liste ve ayarlar tarayıcında saklanır; geliştiriciye otomatik veri veya tanı kaydı gönderilmez.

Instagram istekleri reddedebilir veya sınırlandırabilir; işlem tamamlama ya da hesap kısıtlanmaması garantisi verilmez. Sekmeyi açık tut. Gönderilmiş veya tamamlanmış takip bırakma işlemleri geri alınmaz. Liste, Instagram'ın sağladığı verilerle sınırlıdır ve profil toplamıyla ayrıca karşılaştırılmaz.

Bu bağımsız araç Instagram veya Meta tarafından geliştirilmemiş ve onaylanmamıştır.

## İzin gerekçeleri — inceleme paneli
activeTab: Kullanıcının araç çubuğu simgesine tıkladığı Instagram sekmesine geçici erişerek takip yönetimi panelini açar. Diğer sitelerde panel çalışmaz.
scripting: Paket içindeki takip listesi ve seçim arayüzünü kullanıcı isteğiyle ilgili Instagram sekmesine ekler.
storage: Dil, bekleme ayarları, tarama ilerlemesi, sekmeler arası işlem kilidi ve yerel tanı günlüğünü saklar.
Kalıcı site izni: yok. Uzaktan kod: yok. Yerel sunucu/Python yardımcısı: mağaza sürümünde yok.

## Gizlilik formu — kodla eşleşen beyan
Geliştiriciye otomatik veri aktarımı: yok. 'Hiçbir veri işlenmez' beyanı kullanılmamalı.
Kişiyi tanımlayan bilgiler: Instagram hesap kimlikleri, kullanıcı/görünen adları ve profil resimleri yerelde işlenir.
Kimlik doğrulama bilgileri: Instagram oturumu ve CSRF değeri yalnızca Instagram'a yetkili istek göndermek için kullanılır; geliştiriciye aktarılmaz.
Web sitesi içeriği: Takip edilen hesap listesi ve takip durumları işlenir.
Kullanıcı etkinliği: Eklenti içindeki başlatma/duraklatma/iptal ve istek tanı olayları yerelde tutulur.
Sağlık, finans, kişisel mesajlar, konum, genel web geçmişi: işlenmez.
Formda 'toplama' açıklamasını okuyup yukarıdaki yerel işleme/Instagram'a gönderimle tutarlı seçim yap. Çerez veya hesap bilgilerini yok sayan genel 'veri yok' beyanı verme.
Veri satışı yok; tek amaç dışında kullanım yok; kredi değerlendirmesi yok. Bu üç sertifikasyon kodla uyumludur.

## Görseller
gorseller/01-takip-listesi.png: 1280×800; gerçek arayüz, örnek hesaplarla.
gorseller/02-onay.png: 1280×800; onay ekranı, örnek hesaplarla.
gorseller/03-canli-gunluk.png: 1280×800; gerçek günlük ekranı, test olaylarıyla.
gorseller/promo-440x280.png: 440×280 tanıtım görseli.
extension/icons/icon-128.png: 128×128 mağaza ikonu.
Ek görseller: 00-dashboard-purple.png ve 04-nonfollowers-purple.png (1280×800).
Görseller gerçek kullanıcı veya başarı iddiası içermez; örnek veriler testte üretilmiştir.

## Yayıncı ve dağıtım
Yayıncı adı: KULLANICIDAN BEKLENİYOR.
Destek e-posta: KULLANICIDAN BEKLENİYOR.
Gizlilik HTTPS URL: GIZLILIK-POLITIKASI.md veya privacy.html iletişim bilgisiyle yayımlanmalı; henüz URL yok.
Görünürlük önerisi: İlk doğrulama için liste dışı (Unlisted). Herkese açık dağıtım kararı yayıncıda.
Bölge: Yayıncı seçer. Hesap şifresi veya kişisel oturum bilgisi inceleme notlarına yazılmamalı.

## İnceleyici notları — İngilizce
Open https://www.instagram.com/ and sign in with your own test account. Click the extension toolbar icon, then Scan. Select a single followed account and click Unfollow. A confirmation dialog is required before any mutation. Pause/cancel are available. A positive mutation response is independently checked before it is marked confirmed. Requests rejected by Instagram or ambiguous responses stop the operation. The Live log button opens local diagnostic events and supports JSON export. All executable code is bundled. No developer backend, analytics, remote code or companion program is used by this store build.

## Bilinen sınırlar / gönderim öncesi kalanlar
1. Instagram Web üzerinde takip bırakma isteği /web/friendships/{id}/unfollow/ uç noktasına yönlendirildi; mobil destroy uç noktasının HTML 200 dönme sorunu çözüldü ve friendship_status durumu bağımsız show doğrulamasıyla teyit edilir.
2. Temel kaynak cobanov/instagram; lisans/yeniden dağıtım izni doğrulanamadı. Kaynak atfı korunuyor. Yayıncı kaynak sahibinin uygun dağıtım iznini doğrulamalı; bu paket izin belgesi sayılmaz.
3. Yayıncı/destek bilgileri ve erişilebilir gizlilik URL'si doldurulmalı. İncelemeye gönderim yapılmadı.

## Sürüm geçmişi
2.8.6 — 2026-10-18 — Web unfollow uç noktası ve yanıt doğrulama düzeltmesi.
2.8.2 — 2026-10-18 — Mağaza taslağı: yerel sunucu bağlantısı ve ilgili izin çıkarıldı; tarayıcı içi günlük korundu, gizlilik sayfası eklendi.
2.5.0 — Yerel tanı günlüğü ve isteğe bağlı bilgisayar yardımcısı (özel kullanım paketi).

## Kaynaklar
https://developer.chrome.com/docs/webstore/images
https://developer.chrome.com/docs/webstore/program-policies/policies
https://github.com/cobanov/instagram
`;
fs.writeFileSync(path.join(root,'CHROMEWEBSTORE.md'),listing);
fs.writeFileSync(path.resolve('CHROMEWEBSTORE.md'),listing);
fs.writeFileSync(path.join(root,'BASLA.txt'),`MAĞAZA HAZIRLIK DOSYALARI — 2.8.6\n\nChrome Developer Dashboard'a yalnızca instagram-magaza-2.8.6.zip dosyasını yükle. Hazırlık klasörünün tamamını yükleme. Manifest ZIP kökündedir.\n\nCHROMEWEBSTORE.md: açıklamalar, izin gerekçeleri, gizlilik beyanı ve kalan işler.\nGorseller: mağaza ekran görüntüleri ve tanıtım görseli.\nGIZLILIK-POLITIKASI.md / privacy.html: iletişim bilgisi eklenip herkese açık HTTPS adresinde yayımlanacak.\n\nDurum: taslak hazır; gönderim yapılmadı. Gerçek hesaptaki belirsiz yanıt, kaynak dağıtım izni ve yayıncı/iletişim/URL tamamlanmadan yayın onayı verilmiş sayılmaz.\nMağaza sürümü Python gerektirmez, kayıtları otomatik asistana göndermez. Canlı günlük JSON olarak indirilebilir.\n`);
const improvements=`\n\n## 2.8.6 geliştirmeleri\n- Web unfollow uç noktası (/web/friendships/{id}/unfollow/) kullanılarak HTML 200 yanıt sorunu giderildi.\n- friendship_status alanı boş veya eksik dönen {status: "ok"} yanıtları kabul edilir ve bağımsız show isteğiyle doğrulanır.\n`;
for(const file of [path.join(root,'CHROMEWEBSTORE.md'),path.resolve('CHROMEWEBSTORE.md')])fs.appendFileSync(file,improvements);
const audit=`\n\n## 2.8.6 hata denetimi\n- Bozuk ayar kayıtları ve geçersiz tarama kayıtları açılışı engellemez.\n- Aynı kullanıcıları yeni imleçlerle tekrarlayan sayfalar durdurulur.\n- Geçerli devam imleci yoksa eski listeyle birleştirmek yerine tarama baştan alınır.\n- Tarayıcı zamanlayıcısının sınırını aşan ayarlar reddedilir; kayıtlı süreler sınırlandırılır.\n- Okunamayan HTTP 200 liste yanıtı kesin oturum kapanması olarak etiketlenmez.\n- İşlem izni kontrolü sırasında iptal/duraklatma gelirse POST öncesi yeniden kontrol edilir.\n- Yedi yeni hata senaryosu ve gerçek Chromium içinde iptal yarışı testi geçti. Tüm Instagram istekleri testte taklit edildi.\n`;
for(const file of [path.join(root,'CHROMEWEBSTORE.md'),path.resolve('CHROMEWEBSTORE.md')])fs.appendFileSync(file,audit);
fs.copyFileSync(path.join(out,'help.css'),path.join(root,'help.css'));
fs.appendFileSync(path.join(root,'CHROMEWEBSTORE.md'),'\n\n## 2.8.6\nİki tarama modu, açık lila dashboard, mod değiştirmek için Yeni tarama düğmesi, scope alanlı rapor ve GitHub hazırlığı. Görünür arayüzde üçüncü kişi imzası veya watermark yoktur; kaynak atfı CREDITS.md içinde korunur.\n');
fs.appendFileSync(path.join(root,'CHROMEWEBSTORE.md'),'\n\n## 2.8.6 canlı günlük düzeltmeleri\nTarama hatalarının ve her hesabın doğrulama sonucunun günlüğe yazılması; donmuş sekme kontrolünün süreyle sınırlanması; günlük okuma/temizleme hatalarının ve otomatik asistan aktarımı bulunmadığının açık gösterilmesi. İzinler ve veri aktarımı değişmedi.\n');
fs.appendFileSync(path.join(root,'CHROMEWEBSTORE.md'),'\n\n## 2.8.6 bakım\nÇalışan kodun tasarım yorumlarından üretici adı ve kurulum açıklamasından gereksiz kişisel referans kaldırıldı. Kaynak ve lisans bildirimleri korundu; izinler ve işlevler değişmedi.\n');
fs.copyFileSync(path.join(root,'CHROMEWEBSTORE.md'),path.resolve('CHROMEWEBSTORE.md'));
console.log('Store draft generated:',root);
