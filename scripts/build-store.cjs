const fs=require('fs'),path=require('path');
const root=path.resolve('instagram-magaza-hazirlik');
const out=path.join(root,'extension');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(root,'gorseller'),{recursive:true});
const source=path.resolve('instagram-chrome-eklentisi');
const files=['manifest.json','service-worker.js','platform.js','content.js','help.html','help.css','help.js','logs.html','logs.css','logs.js','workspace.html','workspace.js','workspace.css','workspace-core.js','workspace-art.png','CREDITS.md'];
for(const name of files)fs.copyFileSync(path.join(source,name),path.join(out,name));
fs.cpSync(path.join(source,'icons'),path.join(out,'icons'),{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
manifest.version=require('../package.json').version;delete manifest.host_permissions;
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
let sw=fs.readFileSync(path.join(out,'service-worker.js'),'utf8').replace(/\r\n/g,'\n');
sw=sw.replace('importScripts("log-bridge-config.js");','');
sw=sw.replace(/async function forwardLog\(entry\) \{[\s\S]*?\n\}\n\nasync function handleLogMessage/,'async function handleLogMessage');
sw=sw.replace('  void forwardLog(entry);','');
if(/IU_LOG_BRIDGE|127\.0\.0\.1|forwardLog/.test(sw))throw Error('Bridge remains');
fs.writeFileSync(path.join(out,'service-worker.js'),sw);
let logs=fs.readFileSync(path.join(out,'logs.js'),'utf8').replace(/\r\n/g,'\n');
const bridgeView=/function renderBridge\(data\)\{[\s\S]*?\n\}/;
if(!bridgeView.test(logs))throw Error('Log bridge view boundary missing');
logs=logs.replace(bridgeView,'function renderBridge(){document.getElementById("bridge").textContent="Yalnızca tarayıcı içi günlük açık. Asistana otomatik aktarım yok. Günlük Chrome oturumu kapanınca silinir; paylaşmak için Günlüğü indir düğmesini kullan.";}');
logs=logs.replaceAll('["iu_live_log_v1","iu_log_bridge_state"]','["iu_live_log_v1"]').replace('changes.iu_live_log_v1||changes.iu_log_bridge_state','changes.iu_live_log_v1');
fs.writeFileSync(path.join(out,'logs.js'),logs);
let help=fs.readFileSync(path.join(out,'help.html'),'utf8');
help=help.replace(/ Paketteki <strong>CANLI-LOG-BASLAT\.cmd<\/strong>[\s\S]*?Python 3 gerektirir\./,' Günlüğü indir düğmesiyle tanı kaydını dışa aktarabilirsin.');
help=help.replace(/ İsteğe bağlı günlük yardımcısı[\s\S]*?alır\./,'');
help=help.replace(/Özel kullanım sürümü · [\d.]+/,'Mağaza sürümü · '+manifest.version);
help=help.replace('</footer>',' · <a href="privacy.html">Gizlilik politikası</a></footer>');
fs.writeFileSync(path.join(out,'help.html'),help);
let content=fs.readFileSync(path.join(out,'content.js'),'utf8');
fs.writeFileSync(path.join(out,'content.js'),content);
const policy=`# Instagram Takip Yönetimi — Gizlilik Politikası

Son güncelleme: 18 Ekim 2026. Kapsam: ${manifest.version} mağaza sürümü.

## İşlenen bilgiler ve amaç
Eklenti, kullanıcı başlattığında Instagram'da takip edilen ve isteğe bağlı olarak takipçi hesaplarının kimliklerini, kullanıcı adlarını, görünen adlarını, profil fotoğrafı adreslerini ve takip durumlarını işler. Bu bilgiler listeleme, arama, seçim ve onaylanan takip bırakma işlemleri için kullanılır. Başka sekmelerin geçmişini, mesajları, konum, sağlık veya finans bilgilerini okumaz.

## Oturum ve bağlantılar
Şifrenizi istemez veya kaydetmez. Açık Instagram oturumu kullanılır. Hesap kimliği ve CSRF değeri Instagram çerezlerinden yalnızca işlem sırasında okunur; CSRF değeri yetkili Instagram isteğinin güvenlik başlığında kullanılır. Tarayıcı ilgili oturum çerezlerini Instagram isteklerine ekler. Oturum bilgileri geliştiriciye gönderilmez veya günlüğe yazılmaz.
Takip edilen/takipçi listeleri ve takip işlemleri için Instagram'a istek gönderilir; profil fotoğrafları Instagram'ın sağladığı adreslerden yüklenir. Bu hizmetler Meta'nın kendi gizlilik politikasına tabidir: https://privacycenter.instagram.com/policy/

## Yerel saklama
Ayarlar, dil, gizlenen hesap kimlikleri ve yarım kalan tarama (hesap kimliği, liste ve sayfalama bilgileri) chrome.storage.local içinde saklanır. Yarım kalan kayıtlar 24 saatten eskiyse devam etmek için kullanılmaz; bu süre otomatik fiziksel silme garantisi değildir. Tamamlanan taramanın kontrol noktası temizlenir. Diğer yerel kayıtlar eklenti kaldırılınca silinir.
Çalışma alanı tamamlanan taramaları, hesap kimliklerini/kullanıcı adlarını, isteğe bağlı koruma/favori/etiket/notları, kayıtlı seçimleri, inceleme oturumlarını, görevleri ve yerel iş akışlarını cihazda saklar. Tarama saklama sayısı ayarlanabilir. Bu veriler Ayarlar ekranından yedeklenebilir veya hesap bazında temizlenebilir. İşlem geçmişi en fazla 300 kaydı cihazda saklar; belirsiz işlemler otomatik yeniden başlatılmaz. Görevler ve simülasyonlar Instagram işlemi göndermez.
Kurtarma sırasında bozuk ham kayıt tek bir yerel karantina kopyası olarak korunur. Ayarlar’dan indirilebilir veya açık onayla silinebilir; eklenti kaldırıldığında yerel kopya silinir. Kesinleşmiş işlem geçmişi temizlenebilir; belirsiz kayıtlar tekrar gönderim koruması için saklanır. Etkin işlem sırasında geçmiş temizleme reddedilir.
Tanı günlüğü, zaman, sekme numarası, olay, HTTP durumu, yanıt türü, süre ve ilerleme gibi en fazla 500 olayı Chrome oturumu boyunca saklar. Çerezler, şifreler, token değerleri, kullanıcı adları ve ham yanıt gövdeleri tanı günlüğüne dahil edilmez. İstek/yanıt başlıklarının yalnızca izin listesindeki teknik değerleri kaydedilir; diğer değerler gizlenir. HTML için metin ve nitelik içermeyen sınırlı etiket yapısı ve sabit sayfa işaretleri saklanabilir. Günlük ekrandan temizlenebilir ve Chrome oturumu sona erdiğinde silinir.

## Dışa aktarma ve paylaşım
Kullanıcı isterse tanı günlüğünü veya hesap adları/kimlikleri içeren işlem raporunu kendi cihazına indirir; kullanıcı adlarını panoya kopyalayabilir. Bu dosyalar eklenti kaldırılınca silinmez; kullanıcı tarafından silinir. Destek için bir dosyayı paylaşmak kullanıcının tercihidir.
Bu sürüm geliştirici sunucusuna tanı kaydı göndermez, uzaktan kontrol sağlamaz, analiz veya reklam hizmeti içermez. Veriler satılmaz; reklam, kredi değerlendirmesi veya eklentinin tek amacı dışındaki işler için kullanılmaz. Verilerin kullanımı Chrome Web Store User Data Policy ve Limited Use koşullarıyla sınırlıdır.

## Kontrol ve değişiklikler
Tarama ve takip bırakma kullanıcı tarafından başlatılır. Takip bırakmak ayrıca onay gerektirir. Kullanıcı duraklatabilir veya iptal edebilir; gönderilmiş bir istek tamamlanmış olabilir. Eklentiyi kaldırmak eklentinin yerel verilerini siler. Veri uygulamaları değişirse politika ve mağaza açıklaması güncellenir.

## İletişim
Proje ve destek: https://github.com/Bluetwinklez/unfollow-instagram-dashboard/issues
Yayıncı hesabının Chrome Web Mağazası iletişim ve doğrulama bilgileri geliştirici panelinden ayrıca yönetilir.
`;
fs.writeFileSync(path.join(root,'GIZLILIK-POLITIKASI.md'),policy);
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.writeFileSync(path.join(out,'privacy.html'),'<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gizlilik Politikası</title><link rel="stylesheet" href="help.css"><main><pre style="white-space:pre-wrap;font:inherit;line-height:1.7">'+esc(policy)+'</pre></main></html>');
fs.copyFileSync(path.join(out,'privacy.html'),path.join(root,'privacy.html'));
fs.copyFileSync(path.join(out,'privacy.html'),path.resolve('docs/privacy.html'));
fs.copyFileSync(path.join(out,'help.css'),path.resolve('docs/help.css'));
fs.writeFileSync(path.resolve('docs/PRIVACY-DRAFT.md'),policy);
const listing=fs.readFileSync(path.resolve('docs/STORE-LISTING.md'),'utf8');
fs.writeFileSync(path.join(root,'CHROMEWEBSTORE.md'),listing);
fs.writeFileSync(path.resolve('CHROMEWEBSTORE.md'),listing);
fs.writeFileSync(path.join(root,'BASLA.txt'),`MAĞAZA HAZIRLIK DOSYALARI — ${manifest.version}\n\nSon sürümdeki takip-paneli-chrome-${manifest.version}.zip dosyasını kullan. Kaynak ZIP veya hazırlık klasörünün tamamını yükleme. Manifest ZIP kökündedir.\n\nCHROMEWEBSTORE.md: güncel açıklama, izin gerekçeleri ve yayın sınırları.\nGörseller sentetik test verileridir. Gerçek hesap kabul testi ve kaynak kullanım hakkı ayrıca doğrulanmalıdır.\nMağaza sürümü Python gerektirmez; asistana otomatik aktarım yapmaz.\n`);
fs.copyFileSync(path.join(out,'help.css'),path.join(root,'help.css'));
console.log('Store draft generated:',root);
