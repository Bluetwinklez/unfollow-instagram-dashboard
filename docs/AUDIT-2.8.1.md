# 2.8.1 denetimi — 18 Ekim 2026

## Düzeltilen bulgular

- Tarama hatasının günlük olayına dönüştürüldüğü derleme adımı eski bir kod parçasını aradığı için sessizce çalışmıyordu. Güncel sınır düzeltildi; bulunamazsa derleme artık hata verir. HTTP 429 için tarayıcı testi gerçek hata türünü ve durumunu günlükte doğrular.
- Her takip bırakmanın bağımsız doğrulama sonucu günlükte eksikti. Yeni `unfollow.result` olayı işlenen/toplam/doğrulanan sayılarını ve yanıt türünü gösterir. HTTP 200 HTML yanıtı doğrulanmış sayılmaz; kullanıcı adları ve ham yanıtlar günlüğe eklenmez.
- Yanıt vermeyen bir sekmenin sahiplik sorgusu ortak işlem ve günlük kuyruğunu bekletebiliyordu. Sorgu iki saniyeyle sınırlanır; zaman aşımında sahip meşgul sayılır, başka sekmeye işlem hakkı verilmez. Yeni test eski sürümde başarısız, düzeltilmiş sürümde başarılıdır.
- Günlük depolaması okunamadığında veya temizleme reddedildiğinde görünür hata eksikti. Hatalar gösterilir; beş saniyelik yeniden okuma geçici bağlantı hatasından toparlanır. Geç gelen eski bir okuma güncel verinin üzerine yazamaz.
- Günlük ekranı tarayıcı içi kayıtla yerel dosya aktarımını ayırır. Özel yardımcıdaki eski başarılı aktarım sürekli bağlantı veya asistan izlemesi olarak sunulmaz.

## Doğrulanan kapsam

16 test paketi ve 28 Chromium özellik grubu geçti. Kapsam: iki tarama modu, yarım taramaya devam, eksik/kısıtlı liste, hesap değişimi, sayfalama döngüsü, seçim ve arama, kopyalama, onay, duraklatma/iptal, gönderim öncesi iptal yarışı, bağımsız doğrulama, rapor, günlüğe yazma/filtre/temizleme/dışa aktarma, ayar doğrulaması, mobil görünüm, klavye erişimi, sekmeler arası kilit ve uzantı izinleri. İsteğe bağlı Python yardımcısının kimlik doğrulaması ve dosya yazımı geçici test sunucusunda doğrulandı.

Instagram ağ istekleri taklit edildi. Testler gerçek hesapta takip bırakmadı. Ayrıntılı sonuçlar [test raporunda](TEST-REPORT.md).

## Canlı izlemenin kapsamı

Hazır Releases ZIP'i tarayıcı içi günlüğü içerir. Otomatik asistan aktarımı, uzaktan kontrol veya sürekli çalışan asistan servisi içermez. Günlük ekranı açılıp okunabildiğinde tarayıcı günlüğünün bağlantı durumu gösterilir. Kayıtlar Chrome oturumu boyunca tutulur; en fazla 500 olay saklanır.

Bu denetimde 127.0.0.1:18765 üzerinde üretim yardımcısı dinleyicisi görülmedi. İsteğe bağlı yardımcı için ayrı, yerel kurulum gerekir. Başka bilgisayardaki dosyaya asistanın kendiliğinden erişimi yoktur; JSON dışa aktarımı paylaşılabilir.

## Henüz doğrulanmayanlar

- Kullanıcının gerçek Chrome profilinde son sürümün yüklü oluşu ve gerçek Instagram hesabında önceki belirsiz yanıt sorununun çözümü.
- Chrome Web Mağazası gönderimi/onayı; gizlilik metninin yayıncı iletişimi ve nihai herkese açık adresi.
- İlk kaynak kodun yeniden dağıtım izni.

Bu sonuçlar hatasızlık veya Instagram'ın her isteği kabul edeceği garantisi değildir.
