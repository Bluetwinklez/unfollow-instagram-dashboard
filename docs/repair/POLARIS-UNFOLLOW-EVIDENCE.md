# Polaris takip bırakma sözleşmesi — deneysel düzeltme

## Yeni kaynak kanıtı

İncelenen kaynak: https://github.com/aryasarukkai/instagram-fast-react-client/blob/416053996d99b394ce0c10a19ba23aec1fbaa1c0/speedgram/docs/web-api-surface.md

Kaynak, sözleşmeyi giriş yapılmış oturumların HAR kayıtlarından türettiğini bildirir. `usePolarisUnfollowMutation`, POST `/api/graphql`, doc_id `27789106940691111`, `target_user_id`, `container_module`, `nav_chain` alanlarını ve `xdt_destroy_friendship.friendship_status` yanıtını belgeliyor. İlgili kaynak revizyonunun tarihi 31 Temmuz 2026'dır. Bu üçüncü taraf kanıtı kullanıcının Ekim 2026 oturumunda geçerlilik veya başarı kanıtı değildir. QuickPromotion kimliği kullanılmaz; başka mutation ID'si tahmin edilmez.

## Uygulama

Gönderimden önce mevcut sayfanın DTSG/LSD bağlamı okunur. İkisi de yoksa mevcut REST uyumluluk yolu korunur; kısmi bağlamda gönderim reddedilir. İkisi varsa, oturumdaki viewer için ayrı profil GET'i ile pk ve FBID doğrulanır; istek bu FBID ve yerel oturum değerleriyle hazırlanır. Kaynaktaki oturum değerleri kopyalanmaz veya sabitlenmez. Sayfa tokenları loga, depoya veya rapora eklenmez.

Protokol POST'tan önce seçilir. GraphQL yanıtı HTML, hata, alakasız şema veya belirsizlikse eski REST'e geçiş ve otomatik tekrar yoktur. Yalnızca `data.xdt_destroy_friendship.friendship_status.following === false` kabul edilebilir mutation yanıtıdır. Ardından eski bağımsız ilişki GET'i yine gerekir. Ön kontrol, gönderim niyeti, kalıcı yazma, kimlik/sahiplik/koruma, duraklatma/iptal ve tekrar korumaları korunur.

## Doğrulama sınırı

Yeni sentetik test; başarılı sözleşme, HTML, QuickPromotion, GraphQL hatası, eksik/yanlış türde ilişki, ağ/rate hatası, bağımsız kontrolde hâlâ following:true, kısmi oturum bağlamı, yanlış actor, iptal ve hesap değişimini kapsar. Gerçek hesaba test POST'u gönderilmemiştir. Güncel test toplamı TEST-RESULTS dosyalarındadır; Chromium başlatma sorunu ayrıca açıktır.

Bu bir deneysel düzeltmedir; nihai release veya gerçek hesap kabulü değildir. Sabit doc_id'nin değişmesi mümkündür. Yeni paketi denemeden önce eklenti ve Instagram sekmesi yenilenmelidir. Aynı belirsiz hedefe otomatik yeniden gönderim yapılmamalıdır.

## İkinci deneme paketi
Kullanıcı denemesi actor kontrolünde mutation gönderilmeden durdu. Bu genel mesaj tek başına hangi alanın eksik olduğunu kanıtlamıyor. Kontrol pk/pk_id/id alanlarını kabul edecek şekilde genişletildi; açık status:fail reddi korunurken status alanı yokluğu tek başına ret nedeni olmaktan çıkarıldı. Profil viewer kimliği eşleştiğinde, FBID alanları eksikse CurrentUserInitialData.NON_FACEBOOK_USER_ID kullanılır; belirsiz veya eksik bağlamda gönderim reddedilir. Hata metni artık alan varlığı/eşleşmesi için yalnızca boolean kanıtlar içerir; gerçek kimlikler içermez. 18 Polaris sentetik senaryosu geçti. Canlı kabul hâlâ tamamlanmadı.

## Üçüncü deneme paketi — profil GET kaldırıldı
Kullanıcı kanıtında profil GET'i 429 alırken sayfa actor bilgisi mevcut ve sayısal olarak geçerliydi. r3 bu ek profil isteğini tamamen kaldırır. Tekil CurrentUserInitialData.NON_FACEBOOK_USER_ID, eklenti enjeksiyonu sırasında yakalanan ds_user_id ve güncel viewer/cookie eşleşmesiyle kullanılır. Eksik/çelişkili actor veya hesap değişiminde POST reddedilir. Ön ve son ilişki kontrolü korunur. 15 Polaris senaryosu bütün modlarda sıfır profil isteği, tek mutation, iptal/hesap değişimi ve belirsizlikte durmayı doğrular. Bu, mevcut bir sunucu kısıtının kalktığı veya gerçek mutation'ın başarıyla çalıştığı iddiası değildir.

## Kullanıcı bildirimi ve r4 görünüm düzeltmesi
Kullanıcı 19 Ekim 2026'da r3 ile takip bırakma başarı bildirimi gördüğünü söyledi. Bu kullanıcı bildirimidir; bağımsız gerçek hesap raporu bu turda incelenmedi. Gönderdiği görsel 949 hedeflik onay listesinin ekran dışına taşmasını gösteriyor. Önizleme stilinin instagram-dashboard.css içinde olup üretilmiş content.js'e girmediği bulundu. Gerekli stiller ortak çekirdeğe eklendi; modal ekran yüksekliğiyle sınırlandı, içerik ve hedef listesi kaydırılabilir, eylem düğmeleri kaydırılan alanın dışında tutuldu. Dar ekranda uzun kullanıcı adları kırılır. Tarayıcı testleri ortamda başlatılamadığından bu görsel düzeltmenin tarayıcı kabulü açıktır.
