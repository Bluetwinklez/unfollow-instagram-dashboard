# Tüm özellik testleri — 2.10.0

Tarih: 2026-10-19T10:21:09.868Z

21/26 test paketi geçti.

| Test paketi | Sonuç | Süre |
|---|---|---|
| instagram-safety.test.cjs | GEÇTİ | 0.1 sn |
| instagram-unfollow-verification.test.cjs | GEÇTİ | 0.1 sn |
| instagram-polaris-unfollow.test.cjs | GEÇTİ | 0.1 sn |
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
| instagram-release-proof.test.cjs | GEÇTİ | 0.3 sn |
| instagram-oauth.test.cjs | GEÇTİ | 0.2 sn |
| instagram-repair-v5.test.cjs | GEÇTİ | 0.1 sn |
| instagram-workspace.test.cjs | GEÇTİ | 0.1 sn |
| instagram-workspace-storage.test.cjs | GEÇTİ | 0.1 sn |
| Privacy-safe local log monitor | GEÇTİ | 0.2 sn |
| Optional local helper: authentication, redaction and writing | GEÇTİ | 0.8 sn |
| MV3 store build integration | BAŞARISIZ | 0.4 sn |
| MV3 private build integration | BAŞARISIZ | 0.4 sn |
| Browser feature matrix | BAŞARISIZ | 0.5 sn |
| Local-first workspace browser integration | BAŞARISIZ | 0.4 sn |
| Missing feature completion browser regression | BAŞARISIZ | 0.4 sn |
| Release security and permissions audit | GEÇTİ | 0.1 sn |

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

Instagram istekleri test yanıtlarıyla karşılandı. Gerçek hesapta takip bırakma, Instagram kısıtlarının ne zaman kalkacağı ve Web Mağazası incelemesi doğrulanmadı. İsteğe bağlı Python yardımcısının HTTP kimlik doğrulaması ve dosya yazımı test edildi; kullanıcının bilgisayarında otomatik arka plan başlatma doğrulanmadı. Mağaza sürümü bu yardımcıya ihtiyaç duymaz. Gizlilik metni paket ve docs içinde aynıdır. Herkese açık HTTPS yayını ayrıca yayın kontrol listesinde doğrulanır. Kaynak yeniden dağıtım izni ve mağaza incelemesi ayrıca tamamlanmalıdır.

## Onarım kapsamı

Belirsiz sonuçta durma, işlem öncesi ve sonrası ilişki doğrulaması, kalıcı işlem niyeti, sahiplik/iptal korumaları, yerel çalışma alanı, OAuth state/PKCE, veri yalıtımı ve paket güvenlik denetimi test edildi. Bu rapor test edilen dosyaların SHA-256 değerlerine bağlıdır.
