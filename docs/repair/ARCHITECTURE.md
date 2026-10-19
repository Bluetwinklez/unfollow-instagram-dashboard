# Teknik inceleme ve onarım kaydı

## Başlangıç ve kanıt

Değişiklik öncesi Git revizyonu ve orijinal 2.8.12 ZIP dosya özetleri `BASELINE.json` içindedir. Orijinal ZIP değiştirilmedi. Bu belge canlı Instagram ağ kaydı değildir.

Kaynakta doğrulanan hatalar:

- Varsayılan `continueOnFailure=true`, sonucu belirsiz olan POST/GET hatalarından sonra kuyruğu sürdürebiliyordu. Testler bu seçeneği kapatarak varsayılan davranışı gizliyordu.
- Sıfır doğrulanmış işlemin bulunduğu kuyruk genel tamamlandı durumuna girebiliyordu.
- İşlem niyeti kalıcı yazılmadan POST gönderilebiliyor; yeniden başlatma belirsiz hedefin tekrar gönderilmesini engellemiyordu.
- Tek abort referansı eşzamanlı isteklerin tamamını iptal etmiyordu.
- Derleyicide metne bağlı ekleme bir çekirdek değişikliğinde sessizce eşleşmiyordu. Kritik gönderim sınırı artık eşleşmezse build hata verir.
- OAuth yardımcısında state/PKCE, loopback bağlama ve doğrulanmış başarı yanıtı eksikti.
- Windows satır sonları özel günlük yardımcısının mağaza worker'ından çıkarılmasını bozabiliyordu. Derlemeden önce satır sonları normalize edilir.
- Sürüm/metin/test sayıları ve gizlilik belgeleri tutarsızdı.

## Kanıtlanmamış entegrasyon açıklamaları

`/web/friendships/.../unfollow/` HTML 404 ve `/api/v1/friendships/destroy/.../` HTML 200 gözlemleri kullanıcının önceki raporundan gelir. Bu onarım turunda gerçek hesapta tekrar üretilmedi. Boş gövdenin SPA yanıtının tek nedeni olduğu veya belli bir başlığın her hesapta çözüm olduğu kanıtlanmadı. Kimlik, oturum, dağıtım ve uç nokta davranışı ayrıca etkileyebilir.

Mevcut gönderim form gövdesiyle API destroy yolunu kullanır. Öncesi ve sonrası show ilişki okuması gerekir; bu okuma desteklenmiyorsa işlem güvenli biçimde durur. Tahminî GraphQL fallback eklenmedi. QuickPromotion sorgusu mutasyon kanıtı kabul edilmedi.

## Çağrı zinciri ve sınırlar

```text
Kullanıcı onayı
  → extension wrapper: depoyu yenile / korumayı ayır / sekme kilidini edin
  → startUnfollow: hedefleri dondur, run kimliği oluştur
  → unfollowUser: kimlik + ön ilişki kontrolü
  → recordDispatchIntent: belirsiz işlem kaydı oluştur
  → storage.flush / sahiplik / koruma / iptal / CSRF tekrar kontrol
  → sendUnfollowRequest: tek POST, sınırlı yanıt okuma
  → evaluateUnfollowPayload: HTTP + tür + JSON şeması
  → verifyFollowing: bağımsız GET
  → kalıcı işlem geçmişi + güvenli günlük + dört gruplu rapor
```

İç fazlar: pending, prechecking, ready, dispatching, awaiting_response, verifying ve terminal sonuçlar. Yasadışı geçiş reddedilir. Kullanıcıya gösterilen not_processed, gönderim öncesi iptal/atlama dahil alt durumları kapsar. Gönderim sonrası iptal sunucuyu geri alamaz; sonuç belirsiz kalabilir.

Sekme sahipliği fail-closed çalışır: donmuş sahibin yanıt vermemesi kilidin kendiliğinden çalınmasına neden olmaz. Hesap kimliği değişirse devam edilmez. Gönderim niyetinin yazılması başarısızsa POST yoktur. Belirsiz hedef için otomatik tekrar yoktur; yeni liste okuması gerekir.

## Yerel çalışma alanının veri modeli

`iu_workspace_v1`: schemaVersion, revision, accounts. Hesaplar sayısal viewer ID ile ayrılır. Hesap altında snapshots, meta, sessions, selections, review, workflows, runs, tasks, preferences tutulur. İstek sırları veya avatar URL'si snapshot'a yazılmaz.

Worker bütün değişiklikleri sıraya alır ve expectedRevision ile eski yazmayı reddeder. İçe alma schema/type/ID/collection sınırlarını doğrular. Bozuk kayıt otomatik boş veriyle değiştirilmez. Depolama hatası önceki veriyi korur. Varsayılan beş snapshot, ayarlanabilir 1–20; boyut sınırında en eski kayıtlar azaltılır. Tam yedek şifreli değildir ve kişisel liste/not içerebilir.

Kurallar üç değerli değerlendirilir: true/false/bilinmiyor. AND/OR/NOT için derinlik/düğüm sınırı; iş akışında düğüm sayısı, bağlantı, erişilebilirlik ve döngü denetimi vardır. Simülasyon kayıtlı veri üzerinde saf fonksiyondur; Instagram'a gönderim yetkisi yoktur. Yerel etkiler ayrıca onayla uygulanır.

## Kabul durumu

| İstek | Durum ve sınır |
|---|---|
| Hata sınıflandırma, güvenli durma, iptal/kimlik/kilit | Uygulandı; otomatik güvenlik ve MV3 testleri geçti. |
| Kalıcı niyet ve yeniden başlatmada tekrar koruması | Uygulandı; otomatik test edildi. |
| Koruma/favori/not/etiket, seçim, inceleme | Uygulandı; gerçek Chromium, sentetik verilerle test edildi. |
| Oturum/görev/yerel hatırlatma | Uygulandı; tarayıcı süreç yeniden başlatma ve offline test edildi. OS bildirim izni eklenmedi. |
| Kural/iş akışı/simülasyon | Uygulandı. Görsel yerleşim sürüklenir; bağlantılar Çıkış/Giriş ile kurulur. Basit kurallar formdan, iç içe/öncelikli kurallar gelişmiş JSON ile düzenlenir. |
| Analitik/tarama kıyaslama/dışa aktarma | Uygulandı; eksik veriler sıfır kabul edilmez. |
| Yedek/içe alma/veri yalıtımı | Uygulandı; şema, kota, bozuk veri ve eşzamanlı yazma test edildi. |
| Sağlık, destek, başlangıç rehberi, yardım | Uygulandı; sağlık testi yerel worker içindir, Instagram erişim testi değildir. |
| Chrome/Brave | Playwright Chromium geçti. Yüklü Chrome worker'ı gözlenemedi; Brave kurulu değil. Başarılı uyumluluk iddiası yok. |
| 10.000 hesap | Gerçek Chromium'da 200 satır sayfalama; ölçüm PERFORMANCE.json. Cihaz bağımsız süre garantisi yok. |
| Gerçek hesapta yeni POST+doğrulama | Bekliyor. Otomatik test sonucu bu kanıtın yerine geçmez. |
| Asistanın otomatik canlı izlemesi | Mağaza paketinde yok. Tarayıcı günlüğü ve indirilebilir rapor var. |
| Google'da herkese açık yayın | Mağaza incelemesine ve kaynak kullanım hakkının doğrulanmasına bağlı. GitHub sürümü mağaza onayı değildir. |

## Son kontrol ve canlı kabul adımları

1. Tamamlanan tek bir taramada doğru viewer ID ve hedef ID'yi doğrula.
2. Kullanıcının açıkça seçtiği tek hedef için önce takip edildiğini gör.
3. POST gövdesi, hedef ve yanıt türünü sırları kaydetmeden gözle.
4. Bağımsız ilişki okumasını ve Instagram arayüzünü karşılaştır.
5. HTML/belirsiz/ret durumunda durmayı doğrula; alternatif mutation tahmin etme.
6. Başarılı tek hedef kanıtı olmadan büyük kuyrukla deneme yapma.

Bu turda bu canlı adımlar yapılmadı. Var olan kullanıcı hesabında toplu işlem başlatılmadı.

## Geri dönüş

2.8.12 arşivi ve BASELINE.json başlangıcı korur. Önce yeni yerel veriyi yedekle. Eklentiyi devre dışı bırakıp test edilmiş eski klasörü ayrı kurulumda kullanabilirsin; yeni workspace şemasını eski sürümün okuyacağı varsayılmamalıdır. Git geçmişi ve eski sürüm etiketleri silinmez.

## Güvenlik kapsamı

Dağıtım yalnızca activeTab/scripting/storage ister. Public paket özel loopback yardımcısı/config/token içermez. Anahtar örüntüsü taraması bütün bilinen sır türlerini yakalama garantisi vermez; paket allowlist, kaynak inceleme ve Git ignore ile birlikte kullanılır. GitHub Secrets değerleri okunmadı. Kaynak atıfları lisans bildirimi olarak korundu; kişisel reklam imzası eklenmedi.


## İkinci tamamlama turu

2.10.0 değişiklikleri, yeni test kapsamı ve dış engeller [COMPLETION-AUDIT.md](COMPLETION-AUDIT.md) içinde listelenir. Kurtarmada bozuk asıl kayıt tek kopya karantinada korunur; Ayarlar üzerinden indirilebilir veya açık onayla silinebilir. İşlem geçmişi temizleme, worker üzerinde aktif kilit kontrolü yapar ve belirsiz kayıtları korur.
