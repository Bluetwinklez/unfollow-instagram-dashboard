# Takip Paneli 2.9.0 — onarım ve yerel çalışma alanı

Bu tek sürüm, ara release oluşturmadan tamamlanan onarım ve geliştirmeleri toplar. **Canlı Instagram entegrasyonu henüz doğrulanmadığı için geliştirme/ön sürümdür.** Mağaza onayı değildir.

## Düzeltilenler

- Belirsiz POST veya doğrulama yanıtından sonra kuyruk artık devam etmez. Varsayılan hata davranışı güvenli duruştur.
- HTTP 200, HTML, bozuk JSON ve ilgisiz GraphQL yanıtları başarı sayılmaz.
- İşlem öncesi güncel ilişki kontrolü ve işlem sonrası bağımsız doğrulama eklendi. Zaten takip edilmeyen hesap yeni başarı sayılmaz; POST gönderilmez.
- Kalıcı işlem niyeti, hedef/hesap kontrolü, sekme sahipliği, koruma ve iptal gönderim sınırında yeniden denetlenir.
- Doğrulandı / başarısız / belirsiz / işlenmedi sayıları ayrı raporlanır. Sıfır doğrulanan işlem toplu başarı gibi gösterilmez.
- OAuth yardımcısı state, PKCE, loopback bağlama ve geçerli token sonrası başarı ile onarıldı.
- Windows satır sonlarının temiz mağaza derlemesini bozması düzeltildi.

## Eklenenler

Mor yerel dashboard, hesap koruma/favori/etiket/notları, kayıtlı seçimler, inceleme kuyruğu ve oturumlar; görevler, tarama karşılaştırması ve gerçek yerel geçmiş grafikleri; kural ve iş akışı düzenleyicisi, sıfır Instagram isteğiyle simülasyon; JSON yedek/içe alma, CSV/TXT dışa aktarma; yerel sağlık/tanı sihirbazı ve alan seçmeli destek raporu; TR/EN, açık/koyu, kompakt görünüm, komut paleti ve çevrimdışı kullanım.

İş akışı görevleri Instagram'da arka planda otomatik toplu işlem yapmaz. Hazır ZIP asistana otomatik günlük göndermez.

## Test ve paket güvenliği

23/23 otomatik test paketi geçti. Gerçek Chromium'da kurulu MV3 eklentisi, oturum yeniden başlatma, offline kullanım, koruma/veri yalıtımı ve 10.000 hesapta 200 satırlık sayfalama test edildi. Instagram yanıtları sentetiktir. Test girdileri SHA-256 ile paketleme revizyonuna bağlandı.

Hazır ZIP yalnızca activeTab/scripting/storage ister. Özel log sunucusu, yerel token/config, .env veya bağımlılık klasörü içermez. Kaynak anahtar örüntüsü denetiminde sızıntı bulunmadı; bu tarama bütün olası sırları yakalama garantisi değildir.

## İndir / kur

- `takip-paneli-chrome-2.9.0.zip`: ayıkla → chrome://extensions → Geliştirici modu → Paketlenmemiş öğe yükle → manifest.json bulunan klasör.
- `takip-paneli-source-2.9.0.zip`: kaynak, testler ve belgeler.
- `SHA256SUMS.txt`: ZIP doğrulama değerleri.

Güncellemeden önce yerel yedek al. Aynı klasörde dosyaları değiştirip eklentiyi ve Instagram sekmesini yenile.

## Açık kalan dış doğrulamalar

Gerçek hesapta tek hedef POST + bağımsız doğrulama; yüklü Chrome/Brave tam uyumluluğu; kaynak yeniden dağıtım hakkı; Google mağaza hesap beyanları ve inceleme sonucu. Önceki HTML sorununun tek kök nedeninin boş gövde olduğu kanıtlanmış değildir. Tahminî GraphQL mutasyonu eklenmedi.

[Ayrıntılı README](https://github.com/Bluetwinklez/unfollow-instagram-dashboard/blob/main/README.md) · [Teknik inceleme](https://github.com/Bluetwinklez/unfollow-instagram-dashboard/blob/main/docs/repair/ARCHITECTURE.md) · [Gizlilik](https://bluetwinklez.github.io/unfollow-instagram-dashboard/privacy.html)
