# Takip Paneli 2.10.0 — Polaris ve yerel çalışma alanı

Kullanıcı takip bırakma başarı bildirimi gördüğünü bildirdi; bağımsız gerçek hesap kabulü ve mağaza incelemesi ayrıca açıktır.

## Değişiklikler

- Sayfanın mevcut oturumuyla Polaris takip bırakma akışı; ek profil GET'i kaldırıldı. Eksik/çelişkili bağlam ve hesap değişiminde gönderim durur.
- Ön ilişki kontrolü, tek mutation ve bağımsız son doğrulama. Belirsiz POST otomatik tekrarlanmaz; başka endpoint denenmez.
- Ayrıntılı canlı günlük: aşama, istek kimliği, filtrelenmiş başlıklar, yanıt türü/uzunluğu, yönlendirme, HTML yapı işaretleri ve açıklamalı JSON. Cookie/token ve ham yanıt gövdeleri kaydedilmez.
- Uzun hedef listesi kaydırılır; İptal/Onayla düğmeleri ekran içinde kalır.
- Yerel dashboard görseli, tarih/metrik grafikleri, arama vurguları ve kısayollar.
- Hesap bazlı tercihler, görsel workflow bağlantıları, altı şablon ve gerekçeli yerel öneriler.
- Yedek doğrulaması, kurtarma/karantina ve hesap değişiminde kayıt güvenliği.

## Test ve güvenlik

GitHub Actions üzerinde **26/26 test paketi geçti**; test parmak izleri kaynakla eşleşiyor. Instagram yanıtları sentetiktir. Yerel Windows'ta başlatılamayan beş tarayıcı testi CI'da geçti. Güvenlik/izin denetimi başarılı; yalnızca activeTab, scripting ve storage izinleri vardır.

[CI kanıtı](https://github.com/Bluetwinklez/unfollow-instagram-dashboard/blob/main/docs/repair/CI-VERIFICATION.json) · [Test raporu](https://github.com/Bluetwinklez/unfollow-instagram-dashboard/blob/main/docs/repair/TEST-RESULTS.md)

## Paketler ve kurulum

- takip-paneli-chrome-2.10.0.zip: ayıkla → chrome://extensions → Geliştirici modu → Paketlenmemiş öğe yükle → manifest.json bulunan klasör.
- takip-paneli-source-2.10.0.zip: kaynak, testler ve belgeler; kurulabilir klasör extension/ içindedir.
- SHA256SUMS.txt: ZIP bütünlük değerleri.

Önce yerel veriyi yedekle; çalışan işlemi bitir/iptal et. Güncellemeden sonra eklentiyi yeniden yükle ve Instagram sekmesini yenile. Aynı anda birden çok kopyayı etkinleştirme.

## Açık sınırlar

Özel Instagram sözleşmeleri değişebilir. Kullanıcı başarı bildirimi bütün hesaplar için garanti değildir. Kişisel Chrome/Brave kabulü, bağımsız canlı rapor, kaynak yeniden dağıtım hakkı ve mağaza beyanları/incelemesi ayrıca açıktır. Lisans ve atıflar korunmuştur. 429 için kesin bekleme süresi veya kısıtlanmama garantisi yoktur.