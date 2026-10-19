# Chrome Web Store — listeleme metni ve yayın notları

Sürüm: 2.10.0. Durum: entegrasyon doğrulaması gereken geliştirme sürümü. Bu metin mağaza kabulü veya canlı takip bırakma başarısı kanıtı değildir.

## Kısa açıklama

Takip listeni incele; hesapları koru, not al ve yerel çalışma alanında düzenle.

## Ayrıntılı açıklama

Instagram'da takip ettiğin hesapları Türkçe veya İngilizce arayüzde incele. Tüm takip ettiklerini ya da geri takip etmeyenleri listele. Koruma, favori, etiket ve notlarla listeni düzenle.

Yerel çalışma alanında tarama geçmişini karşılaştır, inceleme kuyruğu ve görevler oluştur, kuralları kayıtlı veriler üzerinde simüle et. JSON yedekleme ve liste dışa aktarma kullan. Bu yerel görevler Instagram'da arka planda otomatik işlem başlatmaz.

Takip bırakma yalnızca açık seçim ve onaydan sonra çalışır. Ön kontrol ve bağımsız sonuç kontrolü kullanılır; doğrulanmayan yanıt başarı sayılmaz. Belirsizlikte işlem durur. Instagram erişimi ve kısıtlanmama garantisi verilmez.

Veriler Chrome profilinde yerel tutulur; geliştiriciye/asistana otomatik aktarım yoktur. İndirilen yedek ve raporları kendin paylaşırsın. Instagram şifresi istenmez; açık sekmenin mevcut oturumu kullanılır.

## İzin gerekçeleri

- activeTab: kullanıcı tarafından açılan Instagram sekmesine geçici erişim.
- scripting: yerel panelin bu sekmede çalıştırılması.
- storage: hesap bazlı tercihler, koruma, tarama, çalışma alanı ve günlük.

Kalıcı host izni ve uzaktan kod yoktur. Store ZIP Python veya yerel günlük sunucusu içermez.

## Listeleme alanları

Ad: Instagram Takip Yönetimi / Takip Paneli. Kategori ve zorunlu alanların güncel karşılığını Developer Dashboard içinde seç.

Gizlilik: https://bluetwinklez.github.io/unfollow-instagram-dashboard/privacy.html
Destek: https://github.com/Bluetwinklez/unfollow-instagram-dashboard/issues

Görseller: çalışma alanı genel bakış, iş akışı ve sağlık ekranları. Görsellerin sentetik test hesabı verisi olduğunu belirt. Gerçek olmayan başarı/analitik iddiası ekleme.

## Göndermeden önce

Gerçek tek hedef kabul testi, kaynak yeniden dağıtım hakkı ve yayıncı hesap/iletişim doğrulamaları tamamlanmalıdır. Güncel mağaza veri beyanlarını gerçek saklama davranışıyla karşılaştır. Yeni sürüm gönderimi için manifest numarası mevcut mağaza sürümünden büyük olmalıdır. GitHub otomasyonu varsayılan olarak taslak yükler; inceleme otomatik onay değildir.
