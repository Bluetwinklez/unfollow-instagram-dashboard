# Takip Paneli 2.10.0 — eksik özelliklerin tamamlanması

**Güncel geliştirme durumu — 19 Ekim 2026:** Henüz nihai release oluşturulmadı. Yerel son koşu 21/26; beş tarayıcı testi Windows süreç başlatma hatasına takıldı. Aşağıdaki 25/25 ifadesi önceki koşuya aittir. Polaris protokolü, filtrelenmiş ağ ayrıntıları ve uzun onay listesi kaydırması sonradan eklendi. [Güncel kanıt ve sınırlar](repair/POLARIS-UNFOLLOW-EVIDENCE.md).

Önceki istekler yeniden kodla karşılaştırıldı; eksik ayrıntılar tamamlandı ve kapsam yeni testlerle genişletildi. Ara release oluşturulmadı. Gerçek Instagram entegrasyonu ve mağaza incelemesi ayrı kaldığı için bu sürüm **ön sürümdür**.

## Tamamlananlar

- Krea 2 Medium ile özgün mor illüstrasyon; dashboard içinde yerel PNG. Çalışma sırasında Krea bağlantısı yok.
- Genel Bakış ve Tarama Geçmişi için ortak tarih/metrik kontrolleri. Önceki incelemenin aksine tarih kontrolleri Tarama Geçmişi'nde zaten vardı; şimdi iki ekran ve davranışları test ediliyor.
- Vurgulu arama, temizleme, sonuçlara ok tuşlarıyla geçiş; seçim/inceleme/koruma kısayolları ve ayarları.
- Hesap bazlı varsayılan filtre, sıralama, dışa aktarma biçimi ve dashboard kart görünürlüğü.
- İş akışında Çıkış → Giriş ile görsel bağlantı kurma, bağlantı/adım silme; döngü reddi. Düğüm ekleme özel bağlantıları topluca değiştirmez.
- Basit koşullar için AND/OR formu. İç içe/NOT ve öncelikli kural kümeleri için gelişmiş JSON korunur.
- Hızlı, ilişki, koruma, temizlik, tanı ve dışa aktarma hazırlığı şablonları; veri dayanağı açıklanan yerel öneriler.
- Güncelleme açıklamaları ve bozuk veri kurtarma. Ham asıl kayıt önce korunur; geçerli yedek önizlenip atomik yüklenir. Karantina indirilebilir/silinebilir.
- Son işlem önizlemesi: seçili, korumalı, önceden doğrulanan, belirsiz ve uygun hedefler; son inceleme listesi. Bitiş saati uydurulmaz.
- Belirsiz hedefler taze tarama olmadan yeniden onaya sunulmaz. Yeni tarama ve güncel ilişki kontrolü hâlâ gerekir.

## Ek hata düzeltmeleri

Kayıt devam ederken hesap değiştirmek, yazmayı yeni seçilen hesaba yönlendiremez. Geçmiş temizleme etkin işlem sırasında reddedilir; belirsiz kayıtların tekrar koruması silinmez. Tercih doğrulaması ve varsayılana dönüş güçlendirildi. Sürüm bilgisi package.json üzerinden üretilir. Özel log okuyucusu, hem kaynak kurulum hem yan klasör kurulumundaki dosyayı bulabilir.

## Testler ve güvenlik

25/25 otomatik test paketi geçti. Yeni gerçek Chromium testi grafik, vurgulama, klavye koruması, görsel bağlantılar, şablonlar, kalıcı tercihler, hesap değişimi ve kurtarma/karantina akışını test eder. Instagram yanıtları sentetiktir; gerçek hesaba POST gönderilmedi. Anahtar taraması ve ZIP bütünlüğü kontrol edildi. İzinler hâlâ activeTab, scripting, storage.

## İndir

- takip-paneli-chrome-2.10.0.zip: ayıkla → chrome://extensions → Geliştirici modu → Paketlenmemiş öğe yükle → manifest.json bulunan klasör.
- takip-paneli-source-2.10.0.zip: kaynak, testler, yerel log okuyucusu ve belgeler.
- SHA256SUMS.txt: ZIP doğrulama değerleri.

Güncellemeden önce yerel yedek al; aynı klasörde dosyaları değiştir, eklentiyi ve Instagram sekmesini yenile.

## Açık dış doğrulamalar

Gerçek hesapta tek hedef POST+doğrulama; kişisel Chrome/Brave kabulü; kaynak yeniden dağıtım izni; Google mağaza incelemesi. Windows kontrolü erişim hatası verdi; tarayıcı güvenlik denetimi chrome://extensions erişimini reddetti ve engel aşılmadı. Özel yerel log okuyucusu hazırdır ancak gerçek yardımcı akışı bağlı değildir; asistana otomatik sürekli aktarım mağaza paketinde yoktur.

[README](https://github.com/Bluetwinklez/unfollow-instagram-dashboard#readme) · [İstek denetimi](https://github.com/Bluetwinklez/unfollow-instagram-dashboard/blob/main/docs/repair/COMPLETION-AUDIT.md) · [Gizlilik](https://bluetwinklez.github.io/unfollow-instagram-dashboard/privacy.html)
