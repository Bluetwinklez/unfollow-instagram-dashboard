# Chrome Web Store: manuel yükleme ve GitHub otomasyonu

GitHub deposu mağaza değildir. İlk mağaza öğesi, listeleme ve yayıncı doğrulamaları Developer Dashboard içinde tamamlanır. API sonraki paket yüklemelerini otomatikleştirebilir; Google incelemesini atlamaz.

## Manuel yol

1. Developer Dashboard içinde mevcut öğeyi aç veya yeni öğe ekle.
2. Son GitHub sürümündeki takip-paneli-chrome-SÜRÜM.zip dosyasını yükle.
3. Açıklama, dil, kategori, görseller, destek bağlantısı ve test adımlarını doldur.
4. Gizlilik: https://bluetwinklez.github.io/unfollow-instagram-dashboard/privacy.html
5. İzin gerekçeleri: activeTab kullanıcı tarafından açılan Instagram sekmesi; scripting yerel panel; storage ayar, koruma, tarama ve günlük.
6. Veri beyanlarını gerçek davranışla eşleştir; uzaktaki asistana otomatik aktarım olmadığını belirt.
7. Kaynak kullanım hakkı, canlı tek hedef testi ve yayıncı doğrulamaları tamamlandıktan sonra incelemeye gönder. İnceleme kabul garantisi yoktur.

## GitHub Actions

Akış: checkout → npm ci → Chromium kurulumu → build → 26 test paketi → güvenlik taraması → temiz ZIP → Web Store API yükleme.

`cws-publish.yml`, v* etiketi veya Actions menüsünden çalışır. Varsayılan publish=false yalnızca taslak yükler. publish=true inceleme gönderimi ister. Aynı sürüm numarasıyla tekrar yükleme kabul edilmeyebilir; yayımlanmış sürümü yerinde değiştirmek yerine son tamamlanmış sürüm numarası artırılır. Ara geliştirme adımlarında release açılmaz.

Depoda gerekli beş Secret isminin mevcut olduğu kontrol edildi:

| Secret | İçerik |
|---|---|
| CWS_EXTENSION_ID | Mevcut mağaza öğesi kimliği |
| CWS_PUBLISHER_ID | Yayıncı kimliği |
| CWS_CLIENT_ID | OAuth istemci kimliği |
| CWS_CLIENT_SECRET | OAuth istemci sırrı |
| CWS_REFRESH_TOKEN | Yenilenebilir erişim yetkisi; süresiz çalışma garantisi yok |

Değerleri dosyaya/README'ye yazma. Actions günlüklerindeki yükleme sonucunu kontrol et; Secret isminin mevcut olması yetkinin hâlâ geçerli olduğunu kanıtlamaz.

## OAuth yenileme

Google Cloud projesinde Chrome Web Store API etkin olmalı. Uygun OAuth istemcisinin yetkili yönlendirme URI'si tam olarak:

```text
http://127.0.0.1:3456/oauth2callback
```

`npm run auth:cws` ile yerel yardımcıyı çalıştır. İstemci bilgilerini yerelde gir, Google izin ekranını aç, çıkan refresh token'ı yalnızca GitHub Secrets'e kaydet. Yardımcı state ve PKCE kullanır, 127.0.0.1'e bağlanır, süre sınırı uygular ve geçerli token alınmadan başarı göstermez. Gerçek OAuth yetkilendirmesi otomatik testlerde yapılmaz; test sunucusu sentetik yanıt kullanır.

## Pages

`pages.yml` docs/ içeriğini GitHub Pages'e dağıtır. Repository Settings → Pages → Source: GitHub Actions. Gizlilik sayfasının HTTP 200 verdiğini ve kurulu paketteki metinle aynı olduğunu yayın sonrası doğrula.

## Resmî kaynaklar

- https://developer.chrome.com/docs/webstore/publish
- https://developer.chrome.com/docs/webstore/using-api
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Mağaza inceleme koşulları zamanla değişebilir. Paneldeki güncel zorunlu alanlar esas alınır.
