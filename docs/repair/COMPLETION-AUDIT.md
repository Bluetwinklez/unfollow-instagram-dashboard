# Önceki isteklerin ikinci incelemesi ve tamamlanan eksikler

Tarih: 18 Ekim 2026. Başlangıç: 2.9.0 / eaca1bc. Bu belge yapılan işlemleri dış doğrulamalardan ayırır.

## Önceki incelemedeki düzeltme

Tarih ve metrik seçiminin tamamen eksik olduğu ifadesi doğru değildi: 2.9.0 Tarama Geçmişi ekranında bu kontroller vardı. Genel Bakış ekranında yoktu. İki ekran artık ortak kontrol bileşenini kullanır; görünür etiketlerden bağımsız metrik değerleri, tarih aralığı ve boş aralık davranışı gerçek Chromium testinde doğrulanır.

## Kodla tamamlananlar

| İstek / bulgu | Sonuç |
|---|---|
| Krea AI ile görsel tasarım | Krea 2 Medium ile özgün mor cam illüstrasyon üretildi, görsel incelendi ve dashboard'a yerel PNG olarak eklendi. Uzaktan resim yüklenmez. |
| Genel Bakış grafik kontrolleri | Tarih ve dört metrik kontrolü iki ekranda ortak; testte takipçi değeri ve boş tarih aralığı denendi. |
| Son işlem önizlemesi | Seçilen, korumalı, önceden doğrulanan, önceki belirsiz ve uygun hedefler; son hedef listesi. Tahminî bitiş saati üretilmez. |
| Önceki belirsiz hedef | Taze tarama olmadan onay ekranından dışlanır; gönderim sınırındaki ikinci koruma sürer. Yeni taramadan sonra ayrıca ön ilişki kontrolü yapılır. |
| Önceden işlenen ama yeniden takip edilen hesap | Eski başarı kaydı, daha yeni tam taramadan sonra tek başına yeni seçimi engellemez. Güncel ilişki okunur. |
| Arama | Kullanıcı adı/isim/etiket/not vurgusu, açık temizleme düğmesi; sonuçlara ok tuşlarıyla geçiş. Unicode küçük harfe dönüşürken uzunluğu değişen karakterler güvenli eşlenir. |
| Kısayollar | / arama, S görünenleri seç, X temizle, R inceleme, oklarla inceleme, P yerel koruma. Yazı alanında devre dışı; ayarlardan kapatılabilir. |
| Kalıcı tercihler | Varsayılan filtre/sıralama/dışa aktarma, gösterilecek dashboard kartları ve kısayollar hesap bazlı saklanır. Varsayılana dönme açık görünümü de sıfırlar. |
| Görsel iş akışı | Kart sürükleme yanında Çıkış → Giriş ile bağlantı ekleme, bağlantı/adım silme. Döngü ve geçersiz bağlantılar reddedilir. Düğüm eklemek özel bağlantıları topluca değiştirmez. |
| Kural düzenleme | Basit AND/OR kuralları için form; iç içe gruplar/NOT ve öncelikli kural kümeleri için gelişmiş JSON korunur. Öncelikli bir düğümün kuralları basit düzenleyiciyle sessizce kaybolmaz. |
| Hazır şablonlar | Hızlı, ilişki, koruma, temizlik, tanı ve dışa aktarma hazırlığı. Temizlik/tanı/dışa aktarma şablonları mevcut yerel araca yönlendirir; kendiliğinden silme veya Instagram işlemi yok. |
| Öneriler | Yerel ilişki, belirsiz işlem, eski seçim, 30 günden eski tarama ve keep/remove etiket çakışması. Dayanak, etkilenen kayıt, geri alma ve onay bilgisi gösterilir. |
| Bildirimler | İsteğe bağlı sayfa içi görev, inceleme hazır ve dışa aktarma geri bildirimi. OS bildirimi/arka plan zamanlayıcısı izni eklenmedi. |
| Güncelleme deneyimi | Sürüm/şema, değişiklikler, veri koruma ve yeniden işlem başlatılmayacağı açıklanır; Yardım'dan yeniden açılır. |
| Bozuk veri kurtarma | Mevcut veri otomatik silinmez. Ham kayıt indirilir, geçerli yedek önizlenir; eski kayıt karantinada korunarak atomik değişim yapılır. Yedek olmadan kayıp bilgiyi yeniden üretmez. |
| Kayıt sırasında hesap değiştirme | Kaydetme başlayan hesap kimliği ve revizyonuna bağlandı; sonradan seçilen hesaba yazılmaz. |
| Geçmiş temizleme güvenliği | Worker üzerinde güncel kayıt okunur; etkin işlemde temizleme reddedilir. Belirsiz kayıtların tekrar koruması korunur. |
| Asistanın yerel log okuyabilmesi | scripts/live-log-monitor.py, özel yardımcı dosyasını sınırlı ve redakte edilmiş özetle okur. --seconds 0..60. Testler ham alanların sızmadığını doğrular. Gerçek dosya şu anda bağlı değil. |
| Gerileme kapsamı | Yeni gerçek tarayıcı ve Python testleri eklenir; mevcut testler yeni önizleme/tekrar korumasına göre gerçekçi takip listesi yanıtlarıyla güncellenir. |

## Dış bağımlılık nedeniyle tamamlanmayanlar

- Gerçek Instagram hesabında tek hedef üzerinde POST ve bağımsız ilişki doğrulaması. Bu turda gerçek hesaba POST gönderilmedi.
- Yüklü kişisel Chrome üzerinde eklenti kurulumu: Windows kontrolü erişim hatası verdi; tarayıcı güvenlik politikası chrome://extensions adresini engelledi. Engel başka yüzeyle aşılmadı. Temiz test Chromium'undaki doğrulama bu kontrolün yerine geçtiği iddia edilmez.
- Brave kurulu değil; Brave'e özgü canlı kabul testi yok.
- Kesintisiz/asistan kapalıyken izleme: mağaza paketi otomatik dışarı aktarım içermez. Yerel okuyucunun çalışabilmesi için özel yardımcıdan gerçek veri gelmesi gerekir. Şu anda bu akış bağlı değil.
- Başlangıç projesinin dağıtım izni: kaynak depo yeniden kontrol edildi; lisans izni uydurulmadı veya atıflar silinmedi. https://github.com/cobanov/instagram
- Google'ın herkese açık mağaza yayını/inceleme kararı ve yayıncı hesabının kişisel doğrulama alanları.

## Testlerin sınırı

Otomatik test başarısı yukarıdaki dış maddeleri tamamlanmış saymaz. Kayıtlı veride bulunmayan nitelik, kullanıcı niyeti, takip tarihi veya hesap riski türetilmez. Gelişmiş kural JSON'u tamamen görsel, iç içe bir kural oluşturucu olarak tanıtılmaz.
