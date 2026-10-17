# Chrome Web Store Otomasyonu & GitHub Actions Rehberi

Bu belge, **Instagram Takip Yönetimi (Takip Paneli)** eklentisini GitHub Actions üzerinden Chrome Web Mağazası'na (Chrome Web Store) otomatik olarak yüklemek ve yayınlamak için gereken tüm adımları içerir.

---

## 📌 Mimariye Genel Bakış

```
[ Git Push (Tag v2.8.2) / Actions Dispatch ]
                  │
                  ▼
   [ GitHub Actions: cws-publish.yml ]
                  │
        ├── 1. npm test (16/16 test paketi + Playwright)
        ├── 2. npm run build (Temiz mağaza paketi)
        ├── 3. ZIP oluşturma (takip-paneli-webstore.zip)
        └── 4. Chrome Web Store API (v2)
                  │
                  ▼
 [ Chrome Web Store Developer Dashboard ]
        ├── Draft (Taslak Güncelleme)
        └── Submit for Review (İncelemeye Gönder)
```

---

## 🔑 Bölüm 1: Tek Seferlik Google Yetkilendirme Kurulumu

Otomasyonun çalışabilmesi için Google Cloud ve Chrome Web Store hesabınızdan 5 anahtar almanız gerekir:

| GitHub Secret Adı | Açıklama | Nereden Alınır? |
|---|---|---|
| `CWS_CLIENT_ID` | Google OAuth2 İstemci Kimliği | Google Cloud Console |
| `CWS_CLIENT_SECRET` | Google OAuth2 İstemci Gizli Anahtarı | Google Cloud Console |
| `CWS_REFRESH_TOKEN` | Süresiz API Erişim Jetonu | `node scripts/cws-auth-helper.mjs` betiği ile |
| `CWS_EXTENSION_ID` | Mağazadaki Eklenti Kimliği (32 karakter) | Chrome Web Store Developer Dashboard |
| `CWS_PUBLISHER_ID` | Geliştirici Yayıncı Kimliği | Chrome Web Store Developer Dashboard > Hesap Ayarları |

---

### Adım 1: Chrome Web Store Geliştirici Hesabı ve İlk Taslak

1. [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/) adresine gidin.
2. 5$'lık tek seferlik geliştirici kayıt ücretini tamamlayın.
3. Sağ üstteki **Dişli (Ayarlar) > Hesap Ayarları** bölümünden **Yayıncı Kimliği'nizi (`Publisher ID`)** kopyalayın.
4. **"Yeni Öğe Ekle" (Add New Item)** butonuna basarak ilk ZIP dosyanızı (örneğin projedeki `instagram-magaza-hazirlik/extension` klasörünü sıkıştırarak) **bir defaya mahsus manuel yükleyin**.
5. Yükleme tamamlandığında tarayıcı URL'sinde veya öğe sayfasında görünen 32 karakterlik **Eklenti Kimliği'ni (`Extension ID`)** kopyalayın (Örn: `abcdefghijklmnopabcdefghijklmnop`).

---

### Adım 2: Google Cloud Console Projesi ve API

1. [Google Cloud Console](https://console.cloud.google.com/) adresine girin.
2. Yeni bir proje oluşturun (Örn: `Chrome-Web-Store-Publish`).
3. Sol menüden **APIs & Services > Library** (Kütüphane) bölümüne gidin.
4. Arama kutusuna **"Chrome Web Store API"** yazıp API'yi bulun ve **Enable (Etkinleştir)** butonuna basın.

---

### Adım 3: OAuth İstemci Kimliği (Credentials) Oluşturma

1. **APIs & Services > OAuth consent screen (OAuth izin ekranı)** sekmesine gidin:
   - Kullanıcı türü olarak **External (Harici)** seçip *Create* deyin.
   - Uygulama adı: `Takip Paneli Deployer`, Kullanıcı destek e-postası: kendi e-postanız.
   - Test kullanıcıları bölümüne Chrome Web Store hesabınızın e-posta adresini ekleyin.
2. **APIs & Services > Credentials (Kimlik Bilgileri)** sekmesine gidin:
   - **Create Credentials > OAuth client ID** seçin.
   - Uygulama türü: **Web application** (Web uygulaması).
   - Ad: `CWS GitHub Actions`.
   - **Authorized redirect URIs (Yetkili yönlendirme URI'leri)** bölümüne şu adresi ekleyin:
     ```
     http://localhost:3456/oauth2callback
     ```
   - **Create** butonuna basın ve ekranda beliren **Client ID** ile **Client Secret** değerlerini kaydedin.

---

### Adım 4: Refresh Token Alıcı Betiğini Çalıştırma

Projede sizin için sıfır bağımlılıkla çalışan yerel bir yetkilendirme betiği hazırlanmıştır:

Terminalde projenin kök klasöründeyken şu komutu çalıştırın:
```bash
node scripts/cws-auth-helper.mjs
```

1. Betik sizden az önce aldığınız `Client ID` ve `Client Secret` değerlerini isteyecektir.
2. Konsolda beliren Google yetkilendirme linkini tarayıcınızda açıp izin verin.
3. Betik localhost üzerinden yönlendirmeyi otomatik yakalayacak ve size **`REFRESH_TOKEN`** değerini verecektir!

---

### Adım 5: GitHub Secrets Ekleme

GitHub deponuzda:
1. **Settings > Secrets and variables > Actions** sayfasına gidin.
2. **New repository secret** butonuna basarak 5 gizli anahtarı ekleyin:
   - `CWS_CLIENT_ID`
   - `CWS_CLIENT_SECRET`
   - `CWS_REFRESH_TOKEN`
   - `CWS_EXTENSION_ID`
   - `CWS_PUBLISHER_ID`

---

## 🚀 Bölüm 2: Dağıtımı Başlatma

### Yöntem A: Etiket (Tag) ile Otomatik Yayınlama
Yeni bir sürüm yayınlamak istediğinizde versiyon etiketi atmanız yeterlidir:
```bash
git tag v2.8.3
git push origin v2.8.3
```
GitHub Actions otomatik olarak tüm testleri çalıştıracak, temiz mağaza paketini derleyecek ve Chrome Web Store'a yükleyecektir.

### Yöntem B: GitHub Actions Arayüzünden Manuel Tetikleme
1. GitHub deponuzda **Actions** sekmesine tıklayın.
2. Sol taraftan **"Chrome Web Store Dağıtım Otomasyonu"** iş akışını seçin.
3. **Run workflow** butonuna basın.
4. *"Google incelemesine otomatik gönderilsin mi?"* seçeneğini belirleyin:
   - `false` (Önerilen varsayılan): ZIP'i yalnızca **Taslak** olarak yükler. Panelden açıklamaları son kez gözden geçirip tek tıkla incelemeye gönderirsiniz.
   - `true`: ZIP'i yükler ve doğrudan Google moderasyon incelemesine gönderir.

---

## 🌐 Bölüm 3: Gizlilik Politikası ve GitHub Pages

Google Web Store incelemesi için zorunlu olan HTTPS Gizlilik Politikası adresi projenizin `docs/` klasöründe hazır durumdadır:

1. Deponuzda **Settings > Pages** sekmesine gidin.
2. **Build and deployment > Source** seçeneğini **GitHub Actions** olarak ayarlayın (Depoya eklenen `.github/workflows/pages.yml` otomatik olarak devreye girer).
3. Sayfanız şu adreslerde yayında olacaktır:
   - **Ana Sayfa:** `https://bluetwinklez.github.io/unfollow-instagram-dashboard/`
   - **Gizlilik Politikası (CWS formuna girilecek URL):** `https://bluetwinklez.github.io/unfollow-instagram-dashboard/privacy.html`
