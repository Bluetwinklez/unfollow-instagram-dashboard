# Ayrıntılı canlı hata günlüğü

Günlük ekranı ve indirilen JSON şema 2; istek başlangıcı, yanıtı ve hata olaylarını requestId ile eşleştirir. Ön ilişki kontrolü, mutation POST, bağımsız son doğrulama ve liste taraması ayrı aşamalardır.

Kaydedilen yeni kanıtlar: hedef kimliği içermeyen sabit adres şablonu, credentials ayarı, CSRF başlığı ve user_id form alanının varlığı, HTTP kodu, içerik türü, okunan karakter sayısı, süre, fetch yönlendirme bilgisi ve son URL'nin sabit yol sınıfı. Ağdaki sıkıştırılmış bayt sayısı ölçülmez. CSRF varlığı geçerlilik, credentials ayarı sunucu kabulü kanıtı değildir.

HTML içinde yalnızca giriş formu, güvenlik formu, Instagram uygulama kabuğu ve bulunamayan sayfa başlığı için sabit işaretler aranır. Bu sezgisel işaretler kesin kök neden veya hesap engeli teşhisi değildir. Ham gövde, URL, çerez, token, hedef kimliği ve kullanıcı adı bu yeni alanlara yazılmaz. Worker izin listesi tanınmayan alan/değerleri reddeder.

Ekranda her olay için Türkçe açıklama; JSON içinde aynı explanation alanı, son mutation özeti, kapsam ve eksik kanıt açıklamaları bulunur. Önceki kayıtlar sonradan zenginleştirilemez. Yeni build yeniden yüklendikten sonraki olaylar bu bilgileri içerir. Son 500 olay tutulur; bu pencere tam bir işlem geçmişi garantisi değildir.

Bu değişiklik takip bırakma endpoint/gövde/başlık sözleşmesini değiştirmez. Belirsiz POST tekrarlanmaz; gerçek hesapta HTML 200 hatasının düzeldiği iddia edilmez. Tanı, günlük filtreleme ve ekran/JSON açıklamaları sentetik testlerle doğrulanır. Tam koşunun güncel sonucu TEST-RESULTS dosyalarındadır; Chromium başlatma sorunu nedeniyle tarayıcı kabulü ayrıca açıktır.
