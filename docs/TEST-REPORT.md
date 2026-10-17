# Tüm özellik testleri — 2.8.2

Tarih: 2026-10-17T21:24:26.521Z

16/16 test paketi geçti.

| Test paketi | Sonuç | Süre |
|---|---|---|
| instagram-safety.test.cjs | GEÇTİ | 0.1 sn |
| instagram-unfollow-verification.test.cjs | GEÇTİ | 0.1 sn |
| instagram-scan-compatibility.test.cjs | GEÇTİ | 0.1 sn |
| instagram-diagnostics.test.cjs | GEÇTİ | 0.1 sn |
| instagram-audit-regressions.test.cjs | GEÇTİ | 0.1 sn |
| instagram-timing.test.cjs | GEÇTİ | 0.1 sn |
| instagram-scope.test.cjs | GEÇTİ | 0.1 sn |
| instagram-extension.test.cjs | GEÇTİ | 0.1 sn |
| instagram-extension-lock.test.cjs | GEÇTİ | 0.1 sn |
| instagram-extension-platform.test.cjs | GEÇTİ | 0.1 sn |
| instagram-live-log.test.cjs | GEÇTİ | 0.1 sn |
| instagram-log-view.test.cjs | GEÇTİ | 0.1 sn |
| Optional local helper: authentication, redaction and writing | GEÇTİ | 0.8 sn |
| MV3 store build integration | GEÇTİ | 15.8 sn |
| MV3 private build integration | GEÇTİ | 16.1 sn |
| Browser feature matrix | GEÇTİ | 22.3 sn |

## Gerçek Chromium içindeki özellik grupları

- GEÇTİ: TR/EN language switch survives reload
- GEÇTİ: Both optional scan choices are visible
- GEÇTİ: Mobile viewport fits screen without horizontal panel overflow
- GEÇTİ: Settings persist across reload; Escape closes dialog
- GEÇTİ: Headings stay readable under conflicting site CSS
- GEÇTİ: Reference dashboard side panel starts scan
- GEÇTİ: Scan pause prevents next page request
- GEÇTİ: Side panel pause and resume operate the active scan
- GEÇTİ: Minimized panel updates from scan progress to completed result
- GEÇTİ: Interrupted scan persists and resumes after reload without reloading first page; checkpoint clears on completion
- GEÇTİ: Side gauge reflects actual selected accounts
- GEÇTİ: Nonfollowers mode lists and selects only non-mutual accounts
- GEÇTİ: New scan can switch back to all-following mode
- GEÇTİ: No removed filters reappear
- GEÇTİ: Keyboard Enter and Space toggle row selection
- GEÇTİ: Copy all and copy selected write expected usernames to clipboard
- GEÇTİ: Profile links point to intended account in new tab
- GEÇTİ: Select all and clear selection
- GEÇTİ: Side panel unfollow requires the same confirmation dialog
- GEÇTİ: Destructive confirmation starts on cancel and traps keyboard focus
- GEÇTİ: Dismiss confirmation sends no mutation
- GEÇTİ: Unfollow pause holds independent verification and next account
- GEÇTİ: Resume verifies first account; cancel prevents next account; report counts remaining correctly
- GEÇTİ: Minimize and expand preserve remaining results
- GEÇTİ: Live log filters, autoscroll toggle and clearing
- GEÇTİ: Bundled privacy page opens
- GEÇTİ: Close removes panel
- GEÇTİ: Live log updates after clearing when new events arrive

## Süre kontrolü

Altı hesaplık sanal zaman testinde beş adet 4–4,8 saniye bekleme, beşinci POST sonrasında bir 300 saniye mola ve altı bağımsız doğrulama beklemesi doğrulandı. Üretim süreleri değiştirilmedi.

## Sınırlar

Instagram istekleri test yanıtlarıyla karşılandı. Gerçek hesapta takip bırakma, Instagram kısıtlarının ne zaman kalkacağı ve Web Mağazası incelemesi doğrulanmadı. İsteğe bağlı Python yardımcısının HTTP kimlik doğrulaması ve dosya yazımı test edildi; kullanıcının bilgisayarında otomatik arka plan başlatma doğrulanmadı. Mağaza sürümü bu yardımcıya ihtiyaç duymaz. Gizlilik sayfası yerelde açıldı; iletişim bilgileri ve herkese açık URL hâlâ yayın öncesi eksiktir.

## Bu turda düzeltilen hata

2.8.1: Eksik tarama hatası olayları ve hesap başına doğrulama sonuçları günlüğe eklenir. Donmuş sekmenin kilit sorgusu süreyle sınırlanır; işlem sahipliği devredilmez. Günlük okuma/temizleme hataları gösterilir, eski okuma sonucu yeni veriyi ezmez. Yeni günlük görünümü testleri ve eski sürümde hatayı yakalayan donmuş sekme testi geçti.
