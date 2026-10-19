(() => { "use strict"; if (location.hostname !== "www.instagram.com") { alert("Open https://www.instagram.com first, then paste this script again."); return; } const APP_ID = "iu-app"; const VERSION = "2.10.0"; const CLEANUP_EVENT = "iu-cleanup"; const STYLE_ID = "iu-style"; const STORAGE_KEY = "iu_all_following_state_v1"; const CHECKPOINT_KEY = "iu_all_following_scan_v1"; const CHECKPOINT_TTL = 24 * 60 * 60 * 1000; const IG_HEADERS = { "x-ig-app-id": "936619743392459", "x-requested-with": "XMLHttpRequest" }; const DEFAULT_TIMINGS = { scanDelayMin: 1000, scanDelayMax: 1300, scanPauseEveryPages: 7, scanPauseMs: 10000, usersPerRequest: 50, unfollowDelayMin: 4000, unfollowDelayMax: 4800, unfollowPauseEvery: 5, unfollowPauseMs: 300000, continueOnFailure: false }; const SCAN_MICRO_DELAY_MIN = 500; const SCAN_MICRO_DELAY_MAX = 2000; const SCAN_PAUSE_JITTER_MS = 5000; const PROGRESS_TITLE_ID = "iu-progress-title"; const PANEL_WIDTH = 380; const PANEL_MARGIN = 18; const MAX_RETRIES = 3; const I18N = { en: { title: "Instagram Unfollow All", subtitle: "List ALL accounts you follow", welcomeTitle: "Ready when you are", welcomeBody: "Lists ALL accounts you follow, including mutual followers. Scanning changes nothing. Select all and confirm to unfollow everyone.", scanBtn: "Scan now", scanning: "Scanning", loadingFollowing: "Loading the people you follow", loadingFollowers: "Loading your followers", paused: "Paused", pause: "Pause", resume: "Resume", cancel: "Cancel", ofTotal: "{current} of {total}", ofUnknown: "{current} so far", scanCompletedToast: "{count} followed accounts found", scanFailed: "Scan failed", retry: "Try again", goBack: "Back to results", search: "Search by name or username", filterVerified: "Verified", filterPrivate: "Private", filterNoAvatar: "No profile picture", filterShowHidden: "Hidden users", foundCount: "{count} followed accounts", foundOne: "1 followed account", foundNone: "No followed accounts to display.", noMatches: "No users match your filters.", hide: "Hide", unhide: "Unhide", hideTooltip: "Hide from this list", unhideTooltip: "Show again", openProfile: "Open profile", copy: "Copy", copyAll: "Copy all", copiedToast: "Copied {count} usernames", selectAll: "Select all", selectNone: "Clear", selectedCount: "{count} selected", unfollow: "Unfollow", unfollowConfirmTitle: "Unfollow {count} users?", unfollowConfirmBody: "This will run slowly to protect your account from rate limiting. You can pause at any time, but already-completed unfollows cannot be reversed from this tool.", unfollowConfirmBtn: "Yes, unfollow {count}", unfollowing: "Unfollowing", currently: "Currently", nextActionIn: "Next action in {seconds}s", cooldownIn: "Cooldown — {seconds}s", scanPause: "Long pause — {seconds}s", unfollowDoneTitle: "Done", unfollowDoneBody: "{ok} unfollowed, {fail} failed", unfollowBlocked: "Instagram blocked this action, so {count} remaining users were skipped. Wait a few hours before trying again.", continueOnFailure: "Continue on failure", settings: "Settings", settingsTitle: "Timing settings", settingsBody: "Lower delays make Instagram more likely to throttle or block your account. Keep these conservative.", minScanDelay: "Min scan delay (ms)", maxScanDelay: "Max scan delay (ms)", scanPauseEvery: "Long pause every N pages", scanPauseLength: "Long pause length (ms)", usersPerRequest: "Users requested per page", minUnfollowDelay: "Min unfollow delay (ms)", maxUnfollowDelay: "Max unfollow delay (ms)", unfollowPauseEvery: "Cooldown every N unfollows", unfollowPauseLength: "Cooldown length (ms)", restoreDefaults: "Restore defaults", save: "Save", saved: "Settings saved", cookieMissing: "Could not read your login cookie. Make sure you are signed in.", csrfMissing: "Could not read csrftoken cookie.", requestFailed: "Request failed: {status}", tooManyRequests: "Instagram is rate-limiting requests. Try again later or increase delays in settings.", sessionExpired: "Instagram signed you out. Sign in again, paste the script again and press Resume. The scan continues where it stopped.", scanBlocked: "Instagram temporarily refused list requests for this account. Wait a few hours, paste the script again and press Resume.", networkError: "The connection dropped. Check the network and press Resume.", keepTabVisible: "Keep this tab in front. Chrome slows background tabs down to one step per minute.", resumeScan: "Resume scan", startOver: "Start over", resumeHint: "A previous scan stopped at {loaded} of {total} followers. Continue from there instead of starting again.", resumeHintUnknown: "A previous scan stopped partway. Continue from there instead of starting again.", partialTitle: "Follower list incomplete", partialBody: "{loaded} of {total} followers were loaded. Results and unfollowing stay unavailable until the full list is checked. Your progress is saved.", partialBodyUnknown: "{loaded} followers were loaded before the scan stopped. Results and unfollowing stay unavailable until the full list is checked. Your progress is saved.", incompleteList: "Instagram returned an incomplete list ({loaded} of {total}). No followed account results can be confirmed. Your progress is saved; wait before resuming.", limitedList: "Instagram is limiting this list. No followed account results can be confirmed. Wait before trying again.", scanNotice: "Large accounts can take 20 minutes or more. Instagram may still interrupt a scan. If it does, wait before resuming; repeating the scan immediately can prolong restrictions.", close: "Close", langSwitch: "Switch to Turkish", minimize: "Minimize", expand: "Expand", langCode: "TR", pillScanning: "Scanning {current}/{total}", pillUnfollowing: "Unfollowing {current}/{total}", pillResults: "{count} followed accounts", pillIdle: "Open" }, tr: { title: "Instagram Tüm Takip Edilenler", subtitle: "Takip ettiğin TÜM hesapları listele", welcomeTitle: "Hazır olduğunda başlat", welcomeBody: "Geri takip edenler dahil TÜM takip ettiklerin listelenir. Tarama hesabını değiştirmez. Hepsini bırakmak için Tümünü seç ve Takibi bırak düğmelerini kullan.", scanBtn: "Taramayı başlat", scanning: "Taranıyor", loadingFollowing: "Takip ettiklerin yükleniyor", loadingFollowers: "Takipçilerin yükleniyor", paused: "Duraklatıldı", pause: "Duraklat", resume: "Devam et", cancel: "İptal", ofTotal: "{current} / {total}", ofUnknown: "Şu ana kadar {current}", scanCompletedToast: "{count} takip edilen bulundu", scanFailed: "Tarama başarısız", retry: "Tekrar dene", goBack: "Sonuçlara dön", search: "İsim veya kullanıcı adı ara", filterVerified: "Onaylı", filterPrivate: "Gizli", filterNoAvatar: "Profil resmi yok", filterShowHidden: "Gizlenen kullanıcılar", foundCount: "{count} takip edilen", foundOne: "1 takip edilen", foundNone: "Listelenecek takip edilen hesap yok.", noMatches: "Filtrelerinle eşleşen kullanıcı yok.", hide: "Gizle", unhide: "Göster", hideTooltip: "Bu listeden gizle", unhideTooltip: "Tekrar göster", openProfile: "Profili aç", copy: "Kopyala", copyAll: "Tümünü kopyala", copiedToast: "{count} kullanıcı adı kopyalandı", selectAll: "Tümünü seç", selectNone: "Temizle", selectedCount: "{count} seçili", unfollow: "Takibi bırak", unfollowConfirmTitle: "{count} kullanıcının takibi bırakılsın mı?", unfollowConfirmBody: "Seni geri takip edenler de buna dahildir. İşlem yavaş çalışır; Instagram yine de hesabını kısıtlayabilir. İstediğin zaman duraklatabilirsin, ama tamamlanan işlemler bu araçtan geri alınamaz.", unfollowConfirmBtn: "Evet, {count} kişiyi bırak", unfollowing: "Takip bırakılıyor", currently: "Şu an", nextActionIn: "Sonraki işlem {seconds} sn sonra", cooldownIn: "Mola — {seconds} sn", scanPause: "Uzun mola — {seconds} sn", unfollowDoneTitle: "Tamamlandı", unfollowDoneBody: "{ok} başarılı, {fail} başarısız", unfollowBlocked: "Instagram bu işlemi engelledi, kalan {count} kişi atlandı. Tekrar denemeden önce birkaç saat bekle.", continueOnFailure: "Hata olunca devam et", settings: "Ayarlar", settingsTitle: "Hız ayarları", settingsBody: "Düşük gecikmeler Instagram'ın hesabını kısıtlamasına neden olabilir. Yavaş tut.", minScanDelay: "Min tarama gecikmesi (ms)", maxScanDelay: "Maks tarama gecikmesi (ms)", scanPauseEvery: "Her N sayfada uzun mola", scanPauseLength: "Uzun mola süresi (ms)", usersPerRequest: "Sayfa başına istenen kullanıcı", minUnfollowDelay: "Min takip bırakma gecikmesi (ms)", maxUnfollowDelay: "Maks takip bırakma gecikmesi (ms)", unfollowPauseEvery: "Her N takip bırakmada mola", unfollowPauseLength: "Mola süresi (ms)", restoreDefaults: "Varsayılana dön", save: "Kaydet", saved: "Ayarlar kaydedildi", cookieMissing: "Giriş çerezi okunamadı. Giriş yaptığından emin ol.", csrfMissing: "csrftoken çerezi okunamadı.", requestFailed: "İstek başarısız: {status}", tooManyRequests: "Instagram istekleri kısıtlıyor. Sonra dene veya ayarlardan gecikmeleri artır.", sessionExpired: "Instagram oturumunu kapattı. Tekrar giriş yap, kodu yeniden yapıştır ve Devam et'e bas. Tarama kaldığı yerden sürer.", scanBlocked: "Instagram bu hesap için liste isteklerini geçici olarak reddetti. Birkaç saat bekle, kodu yeniden yapıştır ve Devam et'e bas.", networkError: "Bağlantı koptu. Ağı kontrol et ve Devam et'e bas.", keepTabVisible: "Bu sekmeyi önde tut. Chrome arka plandaki sekmeleri dakikada bir adıma yavaşlatır.", resumeScan: "Taramaya devam et", startOver: "Baştan başla", resumeHint: "Önceki tarama {total} takipçinin {loaded} tanesinde durdu. Baştan başlamak yerine oradan devam edebilirsin.", resumeHintUnknown: "Önceki tarama yarıda kaldı. Baştan başlamak yerine oradan devam edebilirsin.", partialTitle: "Takipçi listesi eksik", partialBody: "{total} takipçinin {loaded} tanesi yüklendi. Listenin tamamı kontrol edilene kadar sonuçlar ve takip bırakma kapalı. İlerlemen kaydedildi.", partialBodyUnknown: "Tarama durmadan önce {loaded} takipçi yüklendi. Listenin tamamı kontrol edilene kadar sonuçlar ve takip bırakma kapalı. İlerlemen kaydedildi.", incompleteList: "Instagram eksik liste döndürdü ({loaded} / {total}). Takip edilenler henüz doğrulanamadı. İlerlemen kaydedildi; devam etmeden önce bekle.", limitedList: "Instagram bu listeyi kısıtlıyor. Takip edilenler henüz doğrulanamadı. Tekrar denemeden önce bekle.", scanNotice: "Büyük hesaplarda tarama 20 dakika veya daha uzun sürebilir. Instagram yine de taramayı kesebilir. Böyle olursa devam etmeden önce bekle; hemen tekrarlamak kısıtlamayı uzatabilir.", close: "Kapat", langSwitch: "İngilizce'ye geç", minimize: "Küçült", expand: "Aç", langCode: "EN", pillScanning: "Taranıyor {current}/{total}", pillUnfollowing: "Bırakılıyor {current}/{total}", pillResults: "{count} takip edilen", pillIdle: "Aç" } }; const SVG = { minimize: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="7.25" width="10" height="1.5" rx="0.75" fill="currentColor"/></svg>', close: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>', gear: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm6.7 2.5a6.7 6.7 0 0 0-.1-1.1l1.4-1.1-1.5-2.6-1.7.7a6.6 6.6 0 0 0-1.9-1.1L10.5 1h-3l-.4 1.8a6.6 6.6 0 0 0-1.9 1.1l-1.7-.7L1.9 5.8 3.3 6.9a6.7 6.7 0 0 0 0 2.2L1.9 10.2l1.5 2.6 1.7-.7a6.6 6.6 0 0 0 1.9 1.1L7.5 15h3l.4-1.8a6.6 6.6 0 0 0 1.9-1.1l1.7.7 1.5-2.6-1.4-1.1c.1-.4.1-.7.1-1.1z"/></svg>', open: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M6 3h7v7M13 3L6.5 9.5M9 13H3V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>', sparkle: '<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zm6 11l1 2.8L22 17l-3 .8L18 21l-1-3.2L14 17l3-1.2 1-2.8z"/></svg>', alert: '<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M12 2 1 21h22L12 2zm0 6 7.5 13h-15L12 8zm-1 4v4h2v-4h-2zm0 5v2h2v-2h-2z"/></svg>', check: '<svg viewBox="0 0 16 16" width="36" height="36" aria-hidden="true"><path fill="currentColor" d="M14 4.5L6 12.5l-4-4L3 7.5l3 3 7-7z"/></svg>' }; for (const [lang, values] of Object.entries({"en":{"accountChanged":"The signed-in account changed. Scan again before continuing.","totalUnknown":"Could not verify the total following count. Bulk actions remain disabled.","listChanged":"The list or total changed during scanning. Start a new scan.","mutationUncertain":"Unfollow result uncertain. Stopped without retrying the action.","cancelledUncertain":"Cancelled. An already-sent action may have completed; unverified accounts remain listed.","stillFollowing":"This account is still followed. Stopped.","stoppedTitle":"Stopped — check the reason below","cancelledTitle":"Cancelled"},"tr":{"accountChanged":"Açık Instagram hesabı değişti. Devam etmeden önce yeniden tara.","totalUnknown":"Toplam takip edilen sayısı doğrulanamadı. Toplu işlem kapalı.","listChanged":"Tarama sırasında liste veya toplam sayı değişti. Baştan tara.","mutationUncertain":"Takip bırakma sonucu belirsiz. İstek tekrarlanmadan işlem durduruldu.","cancelledUncertain":"İptal edildi. Gönderilmiş işlem uygulanmış olabilir; doğrulanamayan hesaplar listede kaldı.","stillFollowing":"Bu hesap hâlâ takip ediliyor. İşlem durduruldu.","stoppedTitle":"Durduruldu — aşağıdaki nedeni kontrol et","cancelledTitle":"İptal edildi"}})) Object.assign(I18N[lang], values); Object.assign(I18N.tr,{coverageUnverified:"Liste, Instagram’ın döndürdüğü son sayfaya kadar alındı. Profildeki toplam takip edilen sayısıyla ayrıca karşılaştırılmadı; burada görünen hesaplar üzerinde işlem yapılır.",tooManyRequests:"Instagram bu liste isteğini kısıtladı. HTTP durumunu kontrol et; bu yanıt tek başına hesabın engellendiği anlamına gelmez."});
Object.assign(I18N.en,{coverageUnverified:"Loaded through the last page returned by Instagram. The list was not independently compared with the profile total; actions apply to the accounts shown here.",tooManyRequests:"Instagram limited this list request. Check the HTTP status; this response alone does not establish an account-wide block."});
Object.assign(I18N.tr,{title:"Takip Paneli",subtitle:"Listele, seç ve kontrol et",welcomeTitle:"Takip listen. Kontrol sende.",welcomeBody:"Nasıl bir liste görmek istediğini seç. Tarama hesabında değişiklik yapmaz; takip bırakma ayrıca onayını ister.",scopeChoose:"TARAMA SEÇENEĞİ",scopeAll:"Tüm takip ettiklerim",scopeAllBody:"Seni geri takip edenler dahil, takip ettiğin tüm hesaplar.",scopeNonfollowers:"Beni geri takip etmeyenler",scopeNonfollowersBody:"İki listeyi karşılaştır; yalnızca seni takip etmeyen hesapları göster.",workspace:"ÇALIŞMA ALANI",overview:"Genel bakış",liveLog:"Canlı günlük",localOnly:"Veriler bu cihazda",statFollowing:"Takip edilen",statNonfollowers:"Geri takip etmeyen",statInList:"Listelenen",statSelected:"Seçili"});
Object.assign(I18N.en,{title:"Follow Panel",subtitle:"Review, select and manage",welcomeTitle:"Your following. Your control.",welcomeBody:"Choose a list to review. Scanning changes nothing; unfollowing always requires your confirmation.",scopeChoose:"SCAN OPTIONS",scopeAll:"Everyone I follow",scopeAllBody:"All accounts you follow, including mutual followers.",scopeNonfollowers:"People not following me back",scopeNonfollowersBody:"Compare both lists and show only accounts that do not follow you.",workspace:"WORKSPACE",overview:"Overview",liveLog:"Live log",localOnly:"Data stays on this device",statFollowing:"Following",statNonfollowers:"Not following back",statInList:"Listed",statSelected:"Selected"});
Object.assign(I18N.tr,{completedWithErrorsTitle:"Sıra bitti; başarısız işlemler var",noChangesTitle:"Yeni takip bırakma yapılmadı"});Object.assign(I18N.en,{completedWithErrorsTitle:"Queue ended with unsuccessful operations",noChangesTitle:"No new unfollows performed"}); const persisted = loadStored(); const state = { scanScope:persisted.scanScope === "nonfollowers" ? "nonfollowers" : "all", mode: "idle", viewerId: null, unfollowOutcome: "", scanPaused: false, scanCancelled: false, unfollowPaused: false, unfollowBlocked: 0, progress: { current: 0, total: 0, label: "scanning", note: "" }, waitUntil: 0, waitReason: "", users: [], followingCount: 0, followersCount: 0, selected: new Set(), hidden: new Set(persisted.hidden || []), log: [], search: "", filters: persisted.filters || { verified: true, private: true, noAvatar: true, showHidden: false }, timings: loadTimings(persisted.timings), panelPos: persisted.panelPos || null, minimized: Boolean(persisted.minimized), language: persisted.language === "tr" || persisted.language === "en" ? persisted.language : (String(navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en"), error: "", checkpoint: loadCheckpoint(), partial: false, coverage: "" }; let countdownTimer = null; let toastTimer = null; let dialogCounter = 0; let closeActiveDialog = null; let wakeSleep = null; let destroyed = false; const activeRequests = new Set(); const activeRequest = { abort() { for (const controller of activeRequests) controller.abort(); } }; function loadTimings(saved = {}) { const timings = { ...DEFAULT_TIMINGS }; for (const key of Object.keys(timings)) { if (Number.isFinite(saved?.[key]) && saved[key] >= 0) timings[key] = saved[key]; } const scanKeys = ["scanDelayMin", "scanDelayMax", "scanPauseEveryPages", "scanPauseMs"]; const oldPresets = [ [700, 1500, 5, 8000], [1500, 3000, 5, 20000], [1500, 3300, 7, 10000] ]; if (oldPresets.some((preset) => scanKeys.every((key, index) => saved?.[key] === preset[index]))) { for (const key of scanKeys) timings[key] = DEFAULT_TIMINGS[key]; } const oldUnfollowPreset = [5000, 9000, 5, 300000]; const unfollowKeys = ["unfollowDelayMin", "unfollowDelayMax", "unfollowPauseEvery", "unfollowPauseMs"]; if (unfollowKeys.every((key, index) => saved?.[key] === oldUnfollowPreset[index])) { for (const key of unfollowKeys) timings[key] = DEFAULT_TIMINGS[key]; } if (saved?.continueOnFailure !== undefined) timings.continueOnFailure = Boolean(saved.continueOnFailure); for(const key of Object.keys(timings)) if(typeof timings[key]==="number") timings[key]=Math.min(2147483647,Math.round(timings[key]));
 timings.scanDelayMax=Math.max(timings.scanDelayMin,timings.scanDelayMax);
 timings.unfollowDelayMax=Math.max(timings.unfollowDelayMin,timings.unfollowDelayMax);
 timings.usersPerRequest = Math.min(200, Math.max(1, Math.round(timings.usersPerRequest))); return timings; } function loadStored() {
 try {
  const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const filters={verified:true,private:true,noAvatar:true,showHidden:false};
  for(const key of Object.keys(filters)) if(typeof parsed.filters?.[key] === "boolean")filters[key]=parsed.filters[key];
  return {...parsed,hidden:Array.isArray(parsed.hidden)?parsed.hidden.filter(id=>typeof id === "string"):[],filters};
 } catch { return {}; }
} function createCheckpoint(viewerId, scope = "all") { return { scope, viewerId: String(viewerId), savedAt: Date.now(), following: [], followingCursor: "", followingDone: false, followerIds: [], followersCursor: "", followersDone: false, stopReason: "" }; } function loadCheckpoint() { try { const raw = localStorage.getItem(CHECKPOINT_KEY); if (!raw) return null; const parsed = JSON.parse(raw); if (!parsed || typeof parsed !== "object" || !parsed.viewerId) return null; if (!Array.isArray(parsed.following) || !Array.isArray(parsed.followerIds)) return null; if(parsed.scope != null && !["all","nonfollowers"].includes(parsed.scope))return null; if (!Number.isFinite(parsed.savedAt) || parsed.savedAt <= 0 || parsed.savedAt > Date.now()+300000 || Date.now()-parsed.savedAt > CHECKPOINT_TTL) return null;
 if (!parsed.following.every(user=>user && typeof user === "object" && typeof user.id === "string" && user.id && typeof user.username === "string" && user.username)) return null;
 if (!parsed.followerIds.every(id=>typeof id === "string")) return null;
 for(const key of ["followingCursor","followersCursor"]) if(parsed[key] != null && typeof parsed[key] !== "string") return null;
 for(const key of ["followingDone","followersDone"]) if(parsed[key] != null && typeof parsed[key] !== "boolean") return null; if (parsed.followingDone && parsed.followersDone) return null; if (!parsed.following.length && !parsed.followerIds.length) return null; return { ...createCheckpoint(parsed.viewerId), ...parsed }; } catch { return null; } } function saveCheckpoint(checkpoint) { if (!checkpoint) return; checkpoint.savedAt = Date.now(); try { localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint)); } catch { } } function clearCheckpoint() { state.checkpoint = null; state.partial = false; try { localStorage.removeItem(CHECKPOINT_KEY); } catch { } } function resumeHintText(checkpoint) {
 const followers=checkpoint.scope === "nonfollowers" && checkpoint.followingDone;
 const loaded=followers?checkpoint.followerIds.length:checkpoint.following.length;
 return (state.language === "tr" ? "Önceki tarama: " : "Previous scan: ")+t(checkpoint.scope === "nonfollowers"?"scopeNonfollowers":"scopeAll")+" · "+formatCount(loaded)+" "+t(followers?"loadingFollowers":"loadingFollowing");
}
function formatCount(value) { const number = Number(value) || 0; try { return number.toLocaleString(state.language === "tr" ? "tr-TR" : "en-US"); } catch { return String(number); } } function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scanScope:state.scanScope, hidden: [...state.hidden], timings: state.timings, filters: state.filters, panelPos: state.panelPos, minimized: state.minimized, language: state.language })); } catch { } } function t(key, vars) { const dict = I18N[state.language] || I18N.en; const template = dict[key] ?? I18N.en[key] ?? key; if (!vars) return template; return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? ""); } function cleanupExisting() { document.dispatchEvent(new Event(CLEANUP_EVENT)); if (typeof window.__iuCleanup === "function") { try { window.__iuCleanup(); } catch {   } } document.getElementById(APP_ID)?.remove(); document.getElementById(STYLE_ID)?.remove(); } function injectStyles() { const style = document.createElement("style"); style.id = STYLE_ID; style.textContent = CSS; document.head.appendChild(style); } function mount() { const root = document.createElement("div"); root.id = APP_ID; document.body.appendChild(root); window.__iuCleanup = unmount; document.addEventListener(CLEANUP_EVENT, unmount); document.addEventListener("visibilitychange", onVisibilityChange); renderShell(); } function unmount() { if (destroyed) return; destroyed = true; state.scanCancelled = true; state.unfollowCancelled = true; state.scanPaused = false; state.unfollowPaused = false; activeRequest?.abort(); wakeUp(); stopCountdown(); document.removeEventListener(CLEANUP_EVENT, unmount); document.removeEventListener("visibilitychange", onVisibilityChange); closeActiveDialog?.(); if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; } document.getElementById(APP_ID)?.remove(); document.getElementById(STYLE_ID)?.remove(); if (window.__iuCleanup === unmount) window.__iuCleanup = null; } function renderShell() { const root = document.getElementById(APP_ID); if (!root) return; if (state.minimized) { root.innerHTML = ` <button class="iu-pill" data-action="expand" type="button" aria-label="${escapeAttr(t("expand"))}"> <span class="iu-pill-dot ${pillStateClass()}"></span> <span data-pill-label>${escapeHTML(pillLabel())}</span> </button> `; root.querySelector("[data-action='expand']")?.addEventListener("click", () => setMinimized(false)); applyPanelPosition(); return; } root.innerHTML = ` <section class="iu-panel" role="dialog" aria-label="${escapeAttr(t("title"))}"> <aside class="iu-sidebar"><div class="iu-side-mark">◎</div><strong>${escapeHTML(t("title"))}</strong><span class="iu-side-caption">${escapeHTML(t("workspace"))}</span><div class="iu-side-active">◉ ${escapeHTML(t("overview"))}</div><button type="button" data-nav-log>≡ ${escapeHTML(t("liveLog"))}</button><button type="button" data-nav-settings>⚙ ${escapeHTML(t("settings"))}</button><div class="iu-side-footer">${escapeHTML(t("localOnly"))}</div></aside><header class="iu-header" data-drag> <div class="iu-brand"> <span class="iu-brand-dot"></span> <div class="iu-brand-text"> <strong>${escapeHTML(t("title"))}</strong> <span data-subtitle>v${VERSION} · ${escapeHTML(t("subtitle"))}</span> </div> </div> <div class="iu-header-actions"> <button type="button" data-action="settings" aria-label="${escapeAttr(t("settings"))}" title="${escapeAttr(t("settings"))}">${SVG.gear}</button> <button type="button" data-action="language" aria-label="${escapeAttr(t("langSwitch"))}" title="${escapeAttr(t("langSwitch"))}"><span data-lang aria-hidden="true">${escapeHTML(t("langCode"))}</span></button> <button type="button" data-action="minimize" aria-label="${escapeAttr(t("minimize"))}" title="${escapeAttr(t("minimize"))}">${SVG.minimize}</button> <button type="button" data-action="close" aria-label="${escapeAttr(t("close"))}" title="${escapeAttr(t("close"))}">${SVG.close}</button> </div> </header> <div class="iu-body" data-body></div><aside class="iu-inspector" data-inspector aria-label="İşlem paneli"></aside> </section> `; bindHeader(root); bindDrag(root.querySelector("[data-drag]")); applyPanelPosition(); renderBody(); } function bindHeader(root) { root.querySelector("[data-nav-log]")?.addEventListener("click",()=>void globalThis.__iuPlatform?.openLog());root.querySelector("[data-nav-settings]")?.addEventListener("click",showSettings); root.querySelector("[data-action='close']")?.addEventListener("click", () => unmount()); root.querySelector("[data-action='minimize']")?.addEventListener("click", () => setMinimized(true)); root.querySelector("[data-action='settings']")?.addEventListener("click", showSettings); root.querySelector("[data-action='language']")?.addEventListener("click", toggleLanguage); } function applyPanelPosition() { const root = document.getElementById(APP_ID); if (!root) return; const node = root.querySelector(".iu-panel") || root.querySelector(".iu-pill"); if (!node) return; const pos = state.panelPos; if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) { const max = panelBounds(node); node.style.left = clamp(pos.x, 0, max.x) + "px"; node.style.top = clamp(pos.y, 0, max.y) + "px"; node.style.right = "auto"; node.style.bottom = "auto"; } else { node.style.left = "auto"; node.style.top = "auto"; node.style.right = PANEL_MARGIN + "px"; node.style.bottom = PANEL_MARGIN + "px"; } } function panelBounds(node) { const rect = node.getBoundingClientRect(); return { x: Math.max(0, window.innerWidth - rect.width), y: Math.max(0, window.innerHeight - rect.height) }; } function bindDrag(handle) { if (!handle) return; const panel = handle.closest(".iu-panel"); if (!panel) return; let startX = 0; let startY = 0; let originX = 0; let originY = 0; let dragging = false; handle.addEventListener("pointerdown", (event) => { if (event.target.closest("button")) return; dragging = true; const rect = panel.getBoundingClientRect(); originX = rect.left; originY = rect.top; startX = event.clientX; startY = event.clientY; panel.style.left = originX + "px"; panel.style.top = originY + "px"; panel.style.right = "auto"; panel.style.bottom = "auto"; handle.setPointerCapture(event.pointerId); handle.classList.add("iu-dragging"); }); handle.addEventListener("pointermove", (event) => { if (!dragging) return; const max = panelBounds(panel); const x = clamp(originX + (event.clientX - startX), 0, max.x); const y = clamp(originY + (event.clientY - startY), 0, max.y); panel.style.left = x + "px"; panel.style.top = y + "px"; }); const stop = (event) => { if (!dragging) return; dragging = false; handle.releasePointerCapture?.(event.pointerId); handle.classList.remove("iu-dragging"); const rect = panel.getBoundingClientRect(); state.panelPos = { x: rect.left, y: rect.top }; persist(); }; handle.addEventListener("pointerup", stop); handle.addEventListener("pointercancel", stop); } function setMinimized(value) { state.minimized = Boolean(value); persist(); renderShell(); } function pillLabel() { if(state.mode === "unfollowDone")return unfollowTitle(); if (state.mode === "scanning") { return t("pillScanning", { current: formatCount(state.progress.current), total: state.progress.total ? formatCount(state.progress.total) : "?" }); } if (state.mode === "unfollowing") { return t("pillUnfollowing", { current: state.progress.current, total: state.progress.total }); } if (state.mode === "results") { if (state.partial) return t("partialTitle"); return t("pillResults", { count: state.users.filter((u) => u.follows_viewer === false).length }); } return t("pillIdle"); } function pillStateClass() { if (state.mode === "scanning" || state.mode === "unfollowing") return "iu-pill-dot--active"; if (state.error) return "iu-pill-dot--error"; return ""; } function updateInspector() {
 const host=document.querySelector('#'+APP_ID+' [data-inspector]');if(!host)return;
 const busy=state.mode === "scanning" || state.mode === "unfollowing";
 const results=state.mode === "results";
 const eligible=state.users.filter(user=>user.follows_viewer===false).length;
 const value=busy?state.progress.current:state.selected.size;
 const total=busy?state.progress.total:eligible;
 const tr=state.language === "tr";
 const label=state.mode === "scanning"?t("scanning"):state.mode === "unfollowing"?t("unfollowing"):t("statSelected");
 const paused=state.mode === "scanning"?state.scanPaused:state.unfollowPaused;
 const action=busy?(paused?t("resume"):t("pause")):results?t("unfollow"):state.mode==="unfollowDone"?t("goBack"):state.checkpoint?t("resumeScan"):t("scanBtn");
 host.innerHTML='<div class="iu-inspector-tabs"><strong>'+(tr?'İşlem paneli':'Control panel')+'</strong><span>'+escapeHTML(t("overview"))+'</span></div><div class="iu-gauge"><div class="iu-gauge-text"><strong>'+formatCount(value)+'</strong><span>'+escapeHTML(label)+(total?' / '+formatCount(total):'')+'</span></div></div><div class="iu-inspector-info"><label>'+escapeHTML(t("scopeChoose"))+'</label><div class="iu-inspector-value">'+escapeHTML(t(state.scanScope === "nonfollowers"?'scopeNonfollowers':'scopeAll'))+'</div></div><div><div class="iu-inspector-row"><span>'+(tr?'İşlemler arası':'Between actions')+'</span><strong>'+formatCount(state.timings.unfollowDelayMin/1000)+'–'+formatCount(state.timings.unfollowDelayMax/1000)+' '+(tr?'sn':'s')+'</strong></div><div class="iu-inspector-row"><span>'+(tr?'Her '+formatCount(state.timings.unfollowPauseEvery)+' işlemde mola':'Pause every '+formatCount(state.timings.unfollowPauseEvery)+' actions')+'</span><strong>'+formatCount(state.timings.unfollowPauseMs/60000)+' '+(tr?'dk':'min')+'</strong></div><div class="iu-inspector-row"><span>'+escapeHTML(t("localOnly"))+'</span><strong>●</strong></div></div><button type="button" class="iu-inspector-primary" data-inspector-primary '+(results&&!state.selected.size?'disabled':'')+'>'+escapeHTML(action)+'</button>'+(busy?'<div class="iu-inspector-secondary"><button type="button" data-inspector-cancel>'+escapeHTML(t("cancel"))+'</button></div>':'');
 host.querySelector('[data-inspector-primary]')?.addEventListener('click',()=>{
  if(busy)document.querySelector('#'+APP_ID+' [data-action="'+(state.mode==='scanning'?'pause-scan':'pause-unfollow')+'"]')?.click();
  else if(results)confirmUnfollow();
  else if(state.mode==='unfollowDone')document.querySelector('#'+APP_ID+' [data-action="back-results"]')?.click();
  else startScan({resume:Boolean(state.checkpoint)});
  updateInspector();
 });
 host.querySelector('[data-inspector-cancel]')?.addEventListener('click',()=>document.querySelector('#'+APP_ID+' [data-action="'+(state.mode==='scanning'?'cancel-scan':'cancel-unfollow')+'"]')?.click());
}
function renderBody() { updateInspector();
 if (state.minimized) {
  updatePillDOM();
  if(state.mode === "scanning" || state.mode === "unfollowing")startCountdown();else stopCountdown();
  return;
 }
 const oldBody = document.querySelector(`#${APP_ID} [data-body]`);
 if (!oldBody) return;
 // Replacing the container releases delegated listeners from the previous render.
 const body = oldBody.cloneNode(false);
 oldBody.replaceWith(body);
 if (state.mode === "scanning") { body.innerHTML = renderScanView(); bindScan(body); }
 else if (state.mode === "results") { body.innerHTML = renderResultsView(); bindResults(body); }
 else if (state.mode === "unfollowing" || state.mode === "unfollowDone") { body.innerHTML = renderUnfollowView(); bindUnfollow(body); }
 else { body.innerHTML = renderIdleView(); bindIdle(body); }
 if (state.mode === "scanning" || state.mode === "unfollowing") startCountdown(); else stopCountdown();
} function renderScopeChoices() {
 return '<fieldset class="iu-scope"><legend>'+escapeHTML(t("scopeChoose"))+'</legend>'+["all","nonfollowers"].map(value=>'<label class="iu-scope-card '+(state.scanScope===value?'is-active':'')+'"><input type="radio" name="iu-scope" value="'+value+'" '+(state.scanScope===value?'checked':'')+'><span><strong>'+escapeHTML(t(value==='all'?'scopeAll':'scopeNonfollowers'))+'</strong><small>'+escapeHTML(t(value==='all'?'scopeAllBody':'scopeNonfollowersBody'))+'</small></span></label>').join('')+'</fieldset>';
}
function renderDashboardStats() {
 const eligible=state.users.filter(user=>user.follows_viewer===false).length;
 const unknown=state.mode === "idle";
 return '<div class="iu-stats"><div><small>'+escapeHTML(t("statFollowing"))+'</small><strong>'+(unknown?'—':formatCount(state.followingCount))+'</strong></div><div><small>'+escapeHTML(t(state.scanScope==='nonfollowers'?'statNonfollowers':'statInList'))+'</small><strong>'+(unknown?'—':formatCount(eligible))+'</strong></div><div><small>'+escapeHTML(t("statSelected"))+'</small><strong data-stat-selected>'+formatCount(state.selected.size)+'</strong></div></div>';
}
function renderIdleView() { const checkpoint = state.checkpoint; const resumeActions = checkpoint ? ` <div class="iu-welcome-actions"> <button type="button" class="iu-btn iu-btn--primary iu-btn--lg" data-action="resume-scan">${escapeHTML(t("resumeScan"))}</button> <button type="button" class="iu-btn iu-btn--ghost" data-action="restart-scan">${escapeHTML(t("startOver"))}</button> </div>` : ""; if (state.error) { return ` <div class="iu-welcome"> <div class="iu-welcome-icon iu-welcome-icon--error">${SVG.alert}</div> <h2>${escapeHTML(t("scanFailed"))}</h2> <p>${escapeHTML(state.error)}</p> ${checkpoint ? resumeActions : ` <button type="button" class="iu-btn iu-btn--primary" data-action="scan">${escapeHTML(t("retry"))}</button>`} </div> `; } if (checkpoint) { return ` <div class="iu-welcome"><div class="iu-welcome-top"><span>${escapeHTML(t("overview"))} / Dashboard</span><small>● ${escapeHTML(t("localOnly"))}</small></div> <div class="iu-welcome-icon">${SVG.sparkle}</div><div class="iu-idle-metrics">${renderDashboardStats()}</div> <h2>${escapeHTML(t("welcomeTitle"))}</h2> <p>${escapeHTML(resumeHintText(checkpoint))}</p> ${checkpoint.stopReason ? `<p>${escapeHTML(checkpoint.stopReason)}</p>` : ""} ${resumeActions} </div> `; } return ` <div class="iu-welcome"><div class="iu-welcome-top"><span>${escapeHTML(t("overview"))} / Dashboard</span><small>● ${escapeHTML(t("localOnly"))}</small></div> <div class="iu-welcome-icon">${SVG.sparkle}</div><div class="iu-idle-metrics">${renderDashboardStats()}</div> <h2>${escapeHTML(t("welcomeTitle"))}</h2> <p>${escapeHTML(t("welcomeBody"))}</p> <p>${escapeHTML(t("scanNotice"))}</p> ${renderScopeChoices()} <button type="button" class="iu-btn iu-btn--primary iu-btn--lg" data-action="scan">${escapeHTML(t("scanBtn"))}</button> </div> `; } function bindIdle(body) { body.querySelectorAll("[name=iu-scope]").forEach(input=>input.addEventListener("change",()=>{state.scanScope=input.value;persist();renderBody();})); body.querySelector("[data-action='scan']")?.addEventListener("click", () => startScan()); bindScanResume(body); } function bindScanResume(body) { body.querySelector("[data-action='resume-scan']")?.addEventListener("click", () => startScan({ resume: true })); body.querySelector("[data-action='restart-scan']")?.addEventListener("click", () => { clearCheckpoint(); startScan(); }); } function renderBar(percent, valueText, known) { const now = known ? ` aria-valuenow="${percent}"` : ""; return ` <div class="iu-bar" role="progressbar" aria-labelledby="${PROGRESS_TITLE_ID}" aria-valuemin="0" aria-valuemax="100"${now} aria-valuetext="${escapeAttr(valueText)}" data-bar> <span data-progress-bar style="width:${percent}%"></span> </div>`; } function renderScanView() { const { current, total, label, note } = state.progress; const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0; const counter = progressCounter(current, total); return ` <div class="iu-progress"> <div class="iu-progress-head"> <h2 id="${PROGRESS_TITLE_ID}" data-progress-label>${escapeHTML(state.scanPaused ? t("paused") : t(label))}</h2> <p data-progress-note>${escapeHTML(note)}</p> </div> ${renderBar(percent, counter, Boolean(total))} <div class="iu-progress-meta"> <span data-progress-counter>${escapeHTML(counter)}</span> <span data-countdown class="iu-muted"></span> </div> <div class="iu-progress-actions"> <button type="button" class="iu-btn" data-action="pause-scan">${escapeHTML(t(state.scanPaused ? "resume" : "pause"))}</button> <button type="button" class="iu-btn iu-btn--ghost" data-action="cancel-scan">${escapeHTML(t("cancel"))}</button> </div> </div> `; } function bindScan(body) { body.querySelector("[data-action='pause-scan']")?.addEventListener("click", () => { state.scanPaused = !state.scanPaused; const btn = body.querySelector("[data-action='pause-scan']"); if (btn) btn.textContent = t(state.scanPaused ? "resume" : "pause"); const label = body.querySelector("[data-progress-label]"); if (label) label.textContent = state.scanPaused ? t("paused") : t(state.progress.label); wakeUp(); updateInspector(); }); body.querySelector("[data-action='cancel-scan']")?.addEventListener("click", () => { state.scanCancelled = true; state.scanPaused = false; activeRequest?.abort(); wakeUp(); updateInspector(); }); } function renderPartialNotice() { const checkpoint = state.checkpoint; if (!state.partial || !checkpoint) return ""; const loaded = formatCount(checkpoint.followerIds.length); const body = checkpoint.followersTotal ? t("partialBody", { loaded, total: formatCount(checkpoint.followersTotal) }) : t("partialBodyUnknown", { loaded }); return ` <div class="iu-notice" role="status"> <strong>${escapeHTML(t("partialTitle"))}</strong> <p>${escapeHTML(body)}</p> ${checkpoint.stopReason ? `<p class="iu-notice-reason">${escapeHTML(checkpoint.stopReason)}</p>` : ""} <div class="iu-notice-actions"> <button type="button" class="iu-btn iu-btn--primary iu-btn--small" data-action="resume-scan">${escapeHTML(t("resumeScan"))}</button> <button type="button" class="iu-btn iu-btn--ghost iu-btn--small" data-action="restart-scan">${escapeHTML(t("startOver"))}</button> </div> </div> `; } function renderResultsView() { if (state.partial) return `<div class="iu-results">${renderPartialNotice()}</div>`; const display = getDisplayUsers(); const totalNonFollowers = state.users.filter((u) => u.follows_viewer === false).length; const allSelected = display.length > 0 && display.every((u) => state.selected.has(u.id)); let summary; if (totalNonFollowers === 0) summary = t("foundNone"); else if (totalNonFollowers === 1) summary = t("foundOne"); else summary = t("foundCount", { count: totalNonFollowers }); return ` <div class="iu-results"> ${renderPartialNotice()} ${state.coverage ? `<div class="iu-notice" role="status"><p>${escapeHTML(state.coverage)}</p></div>` : ""} ${renderDashboardStats()} <div class="iu-results-summary"><span>${escapeHTML(t(state.scanScope === "nonfollowers" ? "scopeNonfollowers" : "scopeAll"))}</span> · ${escapeHTML(summary)} <button type="button" class="iu-btn iu-new-scan" data-action="new-scan">${state.language === "tr" ? "Yeni tarama" : "New scan"}</button></div> <div class="iu-search-row"> <input class="iu-search" type="search" data-search placeholder="${escapeAttr(t("search"))}" value="${escapeAttr(state.search)}" autocomplete="off" spellcheck="false" > </div> <div class="iu-list" data-list>${renderUserList(display)}</div> <div class="iu-actionbar"> <div class="iu-actionbar-left"> <button type="button" class="iu-btn iu-btn--small" data-action="select-all" ${display.length ? "" : "disabled"}> ${escapeHTML(allSelected ? t("selectNone") : t("selectAll"))} </button> <span class="iu-muted" data-selected-label>${escapeHTML(t("selectedCount", { count: state.selected.size }))}</span> </div> <div class="iu-actionbar-right"> <button type="button" class="iu-btn iu-btn--small" data-action="copy" ${display.length ? "" : "disabled"}>${escapeHTML(state.selected.size ? t("copy") : t("copyAll"))}</button> <button type="button" class="iu-btn iu-btn--danger iu-btn--small" data-action="unfollow" ${state.selected.size ? "" : "disabled"}>${escapeHTML(t("unfollow"))}${state.selected.size ? " (" + state.selected.size + ")" : ""}</button> </div> </div> </div> `; } function filterChip(key, label, visible = true) { if (!visible && key === "showHidden") return ""; const active = state.filters[key]; return ` <button type="button" class="iu-chip ${active ? "iu-chip--on" : ""}" data-filter="${escapeAttr(key)}" aria-pressed="${active ? "true" : "false"}"> <span class="iu-chip-tick">${active ? SVG.check : ""}</span> ${escapeHTML(label)} </button> `; } function renderUserList(display) { if (!display.length) { return `<div class="iu-list-empty">${escapeHTML(t("noMatches"))}</div>`; } return display.map(renderUserRow).join(""); } function renderUserRow(user) { const hidden = false; const checked = state.selected.has(user.id); const tags = []; if (user.is_verified) tags.push(`<span class="iu-tag iu-tag--blue">${escapeHTML(t("filterVerified"))}</span>`); if (user.is_private) tags.push(`<span class="iu-tag">${escapeHTML(t("filterPrivate"))}</span>`); return ` <div class="iu-row ${hidden ? "iu-row--hidden" : ""} ${checked ? "iu-row--selected" : ""}" data-row="${escapeAttr(user.id)}" role="button" tabindex="0"> <input type="checkbox" class="iu-row-check" data-select="${escapeAttr(user.id)}" ${checked ? "checked" : ""} aria-label="${escapeAttr(user.username)}"> <img class="iu-avatar" src="${escapeAttr(user.profile_pic_url || "")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"> <div class="iu-row-text"> <div class="iu-row-name"> <a href="/${encodeURIComponent(user.username)}/" target="_blank" rel="noopener noreferrer" data-stop>@${escapeHTML(user.username)}</a> ${tags.join(" ")} </div> <div class="iu-row-sub">${escapeHTML(user.full_name || "")}</div> </div> <div class="iu-row-actions"> <a class="iu-icon-btn" href="/${encodeURIComponent(user.username)}/" target="_blank" rel="noopener noreferrer" data-stop title="${escapeAttr(t("openProfile"))}" aria-label="${escapeAttr(t("openProfile"))}">${SVG.open}</a>  </div> </div> `; } function bindResults(body) { body.querySelector("[data-action='new-scan']")?.addEventListener("click",()=>{state.mode="idle";state.users=[];state.selected.clear();state.search="";state.error="";renderBody();}); const search = body.querySelector("[data-search]"); if (search) { search.addEventListener("input", (event) => { state.search = event.target.value; pruneSelectionToDisplayed(); const list = body.querySelector("[data-list]"); if (list) list.innerHTML = renderUserList(getDisplayUsers()); updateActionBar(body); }); } body.querySelectorAll("[data-filter]").forEach((el) => { el.addEventListener("click", () => { const key = el.getAttribute("data-filter"); state.filters[key] = !state.filters[key]; pruneSelectionToDisplayed(); persist(); renderBody(); }); }); body.addEventListener("change", (event) => { const checkbox = event.target.closest("[data-select]"); if (!checkbox) return; const id = checkbox.getAttribute("data-select"); if (checkbox.checked) state.selected.add(id); else state.selected.delete(id); const row = checkbox.closest("[data-row]"); if (row) row.classList.toggle("iu-row--selected", checkbox.checked); updateActionBar(body); }); body.addEventListener("click", (event) => { const hideBtn = event.target.closest("[data-hide]"); if (hideBtn) { event.preventDefault(); event.stopPropagation(); const id = hideBtn.getAttribute("data-hide"); if (state.hidden.has(id)) state.hidden.delete(id); else { state.hidden.add(id); state.selected.delete(id); } persist(); renderBody(); return; } if (event.target.closest("[data-stop]")) { event.stopPropagation(); return; } const row = event.target.closest("[data-row]"); if (!row || event.target.closest(".iu-row-check")) return; const id = row.getAttribute("data-row"); const checkbox = row.querySelector("[data-select]"); if (!checkbox) return; if (state.selected.has(id)) { state.selected.delete(id); checkbox.checked = false; } else { state.selected.add(id); checkbox.checked = true; } row.classList.toggle("iu-row--selected", checkbox.checked); updateActionBar(body); }); body.addEventListener("keydown", (event) => { if (event.key !== " " && event.key !== "Enter") return; const row = event.target.closest("[data-row]"); if (!row || event.target.tagName === "INPUT" || event.target.tagName === "A" || event.target.tagName === "BUTTON") return; event.preventDefault(); row.click(); }); body.querySelector("[data-action='select-all']")?.addEventListener("click", () => { const display = getDisplayUsers(); const allSelected = display.length && display.every((u) => state.selected.has(u.id)); if (allSelected) display.forEach((u) => state.selected.delete(u.id)); else display.forEach((u) => state.selected.add(u.id)); renderBody(); }); body.querySelector("[data-action='copy']")?.addEventListener("click", copyUsernames); body.querySelector("[data-action='unfollow']")?.addEventListener("click", confirmUnfollow); bindScanResume(body); } function updateActionBar(body) { const root = body || document.querySelector(`#${APP_ID} [data-body]`); if (!root) return; const display = getDisplayUsers(); const allSelected = display.length > 0 && display.every((u) => state.selected.has(u.id)); const selectAllBtn = root.querySelector("[data-action='select-all']"); if (selectAllBtn) { selectAllBtn.disabled = display.length === 0; selectAllBtn.textContent = allSelected ? t("selectNone") : t("selectAll"); } const copyBtn = root.querySelector("[data-action='copy']"); if (copyBtn) copyBtn.disabled = display.length === 0; updateSelectedLabel(root); } function updateSelectedLabel(body) { updateInspector(); const stat=document.querySelector(`#${APP_ID} [data-stat-selected]`);if(stat)stat.textContent=formatCount(state.selected.size); const root = body || document.querySelector(`#${APP_ID} [data-body]`); if (!root) return; const label = root.querySelector("[data-selected-label]"); if (label) label.textContent = t("selectedCount", { count: state.selected.size }); const unfollowBtn = root.querySelector("[data-action='unfollow']"); if (unfollowBtn) { unfollowBtn.disabled = state.selected.size === 0; unfollowBtn.textContent = t("unfollow") + (state.selected.size ? " (" + state.selected.size + ")" : ""); } const copyBtn = root.querySelector("[data-action='copy']"); if (copyBtn) copyBtn.textContent = state.selected.size ? t("copy") : t("copyAll"); } function renderUnfollowView() { const total = state.progress.total; const done = state.progress.current; const percent = total ? Math.round((done / total) * 100) : 0; const last = state.log[state.log.length - 1]; const summary = unfollowSummary(); return ` <div class="iu-progress"> <div class="iu-progress-head"> <h2 id="${PROGRESS_TITLE_ID}" data-progress-label>${escapeHTML(unfollowTitle())}</h2> <p data-progress-note>${escapeHTML(state.progress.note || "")}</p> </div> ${renderBar(percent, summary, Boolean(total))} <div class="iu-progress-meta"> <span data-progress-counter>${escapeHTML(summary)}</span> <span data-countdown class="iu-muted"></span> </div> <div class="iu-current" data-current ${last ? "" : "hidden"}> <span class="iu-muted">${escapeHTML(t("currently"))}</span> <strong data-current-user>${last ? "@" + escapeHTML(last.user.username) : ""}</strong> <span class="iu-tag ${last && !last.ok ? "iu-tag--red" : "iu-tag--green"}" data-current-tag title="${escapeAttr(last?.reason || "")}">${last && !last.ok ? "✕" : "✓"}</span> </div> ${state.unfollowBlocked ? ` <div class="iu-blocked">${escapeHTML(t("unfollowBlocked", { count: state.unfollowBlocked }))}</div>` : ""} <div class="iu-progress-actions"> ${state.mode === "unfollowing" ? ` <button type="button" class="iu-btn" data-action="pause-unfollow">${escapeHTML(t(state.unfollowPaused ? "resume" : "pause"))}</button> <button type="button" class="iu-btn iu-btn--ghost" data-action="cancel-unfollow">${escapeHTML(t("cancel"))}</button> ` : ` <button type="button" class="iu-btn iu-btn--primary" data-action="back-results">${escapeHTML(t("goBack"))}</button> `} </div> </div> `; } function unfollowTitle() { if (state.mode === "unfollowDone") return t(state.unfollowOutcome === "cancelled" ? "cancelledTitle" : state.unfollowOutcome === "stopped" ? "stoppedTitle" : state.unfollowOutcome === "completed_with_errors" ? "completedWithErrorsTitle" : state.unfollowOutcome === "complete_no_changes" ? "noChangesTitle" : "unfollowDoneTitle"); return state.unfollowPaused ? t("paused") : t("unfollowing"); } function unfollowSummary() { if (state.mode === "unfollowDone") { return t("unfollowDoneBody", { ok: state.log.filter((e) => e.ok).length, fail:state.log.filter(e=>e.category==="failed"||e.category==="uncertain").length,failed:state.log.filter(e=>e.category==="failed").length,uncertain:state.log.filter(e=>e.category==="uncertain").length,remaining:Math.max(0,state.progress.total-state.log.filter(e=>e.category!=="not_processed").length) }); } return t("ofTotal", { current: state.progress.current, total: state.progress.total }); } function bindUnfollow(body) { body.querySelector("[data-action='pause-unfollow']")?.addEventListener("click", () => { state.unfollowPaused = !state.unfollowPaused; const btn = body.querySelector("[data-action='pause-unfollow']"); if (btn) btn.textContent = t(state.unfollowPaused ? "resume" : "pause"); const label = body.querySelector("[data-progress-label]"); if (label) label.textContent = unfollowTitle(); wakeUp(); updateInspector(); }); body.querySelector("[data-action='cancel-unfollow']")?.addEventListener("click", () => { state.unfollowCancelled = true; state.unfollowPaused = false; activeRequest?.abort(); wakeUp(); updateInspector(); }); body.querySelector("[data-action='back-results']")?.addEventListener("click", () => { state.mode = "results"; state.log = []; state.unfollowCancelled = false; renderBody(); }); } function assertViewer(expected = state.viewerId) {
 if (!expected || getCookie("ds_user_id") !== String(expected)) throw scanError("account", t("accountChanged"));
}
async function igRequest(url, init = {}) {
 const controller = new AbortController();
 activeRequests.add(controller);
 let timedOut=false; const timeout = setTimeout(() => {timedOut=true;controller.abort();}, 30000);
 try {
  const response = await fetch(url, {...init, credentials:"include", signal:controller.signal});
  let text;
  if(response.body?.getReader){
   const reader=response.body.getReader(),decoder=new TextDecoder();let size=0;const parts=[];
   try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>2_000_000){controller.abort();throw Object.assign(new Error("Response too large"),{kind:"response",code:"RESPONSE_TOO_LARGE"})}parts.push(decoder.decode(part.value,{stream:true}));}parts.push(decoder.decode());text=parts.join("");}finally{reader.releaseLock();}
  }else{text=await response.text();if(text.length>2_000_000)throw Object.assign(new Error("Response too large"),{kind:"response",code:"RESPONSE_TOO_LARGE"});}
  return {response, text};
 } catch(error) { if(timedOut)throw Object.assign(new Error("Request timeout"),{kind:"timeout",code:"NETWORK_TIMEOUT"});throw error;
 } finally {
  clearTimeout(timeout);
  activeRequests.delete(controller);
 }
}
async function startScan(options = {}) {
 if (destroyed || state.mode === "scanning" || state.mode === "unfollowing") return;
 state.error="";state.mode="scanning";state.scanPaused=false;state.scanCancelled=false;state.unfollowCancelled=false;
 state.partial=false;state.coverage="";state.users=[];state.followingCount=0;state.followersCount=0;state.selected.clear();state.log=[];
 state.progress={current:0,total:0,label:"loadingFollowing",note:visibilityNote()};renderBody();
 let checkpoint=null;
 try {
  const viewerId=getCookie("ds_user_id");if(!viewerId)throw new Error(t("cookieMissing"));state.viewerId=String(viewerId);
  const previous=options.resume?state.checkpoint:null;
  checkpoint=previous && previous.viewerId === String(viewerId)?previous:createCheckpoint(viewerId,state.scanScope);
  checkpoint.scope=checkpoint.scope === "nonfollowers"?"nonfollowers":"all";state.scanScope=checkpoint.scope;
  checkpoint.followingTotal=null;checkpoint.followersTotal=null;checkpoint.stopReason="";state.checkpoint=checkpoint;saveCheckpoint(checkpoint);
  if(!checkpoint.followingDone){
   const following=await scanList(checkpoint,viewerId,"following");
   if(destroyed||state.scanCancelled)return resetToIdle();assertViewer(viewerId);
   checkpoint.following=following;checkpoint.followingCursor="";checkpoint.followingDone=true;checkpoint.followingCapturedAt=Date.now();saveCheckpoint(checkpoint);
  }
  if(checkpoint.scope === "nonfollowers" && !checkpoint.followersDone){
   const followers=await scanList(checkpoint,viewerId,"followers");
   if(destroyed||state.scanCancelled)return resetToIdle();assertViewer(viewerId);
   checkpoint.followerIds=followers.map(user=>user.id);checkpoint.followersCursor="";checkpoint.followersDone=true;saveCheckpoint(checkpoint);
  }
  if(destroyed||state.scanCancelled)return resetToIdle();assertViewer(viewerId);
  checkpoint.followersDone=true;showResults(checkpoint,true);clearCheckpoint();
 }catch(error){
  if(destroyed)return;if(state.scanCancelled)return resetToIdle();
  const message=error?.message||t("scanFailed");if(checkpoint){checkpoint.stopReason=message;saveCheckpoint(checkpoint);}
  state.error=message;state.mode="idle";state.users=[];state.selected.clear();renderBody();
 }
}
function showResults(checkpoint, complete) { state.scanCollectedAt=Number(checkpoint.followingCapturedAt)||0; state.viewerId = String(checkpoint.viewerId); state.followingCount = checkpoint.following.length; state.followersCount = checkpoint.followerIds.length; state.scanScope=checkpoint.scope === "nonfollowers"?"nonfollowers":"all"; state.users = state.scanScope === "nonfollowers" ? addFollowBackStatus(checkpoint.following,checkpoint.followerIds,complete) : checkpoint.following.map((user) => ({ ...user, follows_viewer: complete ? false : null })); state.coverage = complete && !Number.isSafeInteger(checkpoint.followingTotal) ? (state.scanScope === "nonfollowers" ? (state.language === "tr" ? "İki liste Instagram’ın döndürdüğü son sayfaya kadar karşılaştırıldı; profil toplamlarıyla ayrıca doğrulanmadı." : "Both returned lists were compared through their last page; profile totals were not independently verified.") : t("coverageUnverified")) : ""; state.partial = !complete; state.mode = "results"; if (complete) { const nonFollowers = state.users.filter((u) => !u.follows_viewer).length; toast(t("scanCompletedToast", { count: nonFollowers })); } renderBody(); } function resetToIdle() { if (destroyed) return; state.mode = "idle"; state.users = []; state.scanCancelled = false; state.error = ""; renderBody(); } async function scanList(checkpoint, viewerId, kind) { const isFollowing = kind === "following"; const cursorKey = isFollowing ? "followingCursor" : "followersCursor"; const total = isFollowing ? checkpoint.followingTotal : checkpoint.followersTotal; const label = isFollowing ? "loadingFollowing" : "loadingFollowers"; const seed = checkpoint[cursorKey] ? (isFollowing ? checkpoint.following : checkpoint.followerIds.map((id) => ({ id }))) : []; const onPage = (results, nextCursor) => { if (isFollowing) checkpoint.following = results; else checkpoint.followerIds = results.map((user) => user.id); checkpoint[cursorKey] = nextCursor; saveCheckpoint(checkpoint); state.progress = { current: results.length, total, label, note: visibilityNote() }; updateProgressDOM(); }; state.progress = { current: seed.length, total, label, note: visibilityNote() }; updateProgressDOM(); try { return await fetchFriendshipList(viewerId, kind, onPage, { cursor: checkpoint[cursorKey], seed, total }); } catch (error) { if (error?.kind !== "http" || error?.status !== 400 || !checkpoint[cursorKey]) throw error; console.warn(`[iu] stored ${kind} cursor was rejected, restarting that list`); checkpoint[cursorKey] = ""; if (isFollowing) checkpoint.following = []; else checkpoint.followerIds = []; return fetchFriendshipList(viewerId, kind, onPage, { total }); } } async function fetchFriendshipList(viewerId, kind, onPage, options = {}) {
 const total = options.total;
 const totalKnown = Number.isSafeInteger(total) && total >= 0;
 if (total != null && !totalKnown) throw scanError("incomplete", t("totalUnknown"));
 const results = Array.isArray(options.seed) ? [...options.seed] : [];
 let cursor = options.cursor || ""; let page = 0;
 const seenCursors = new Set(cursor ? [cursor] : []);
 while (true) {
  if (state.scanPaused) await waitWhile(() => state.scanPaused && !state.scanCancelled && !destroyed);
  if (state.scanCancelled || destroyed) return dedupe(results);
  assertViewer(viewerId);
  const json = await igFetch(friendshipListUrl(viewerId, kind, cursor, state.timings.usersPerRequest));
  if (state.scanCancelled || destroyed) return dedupe(results);
  assertViewer(viewerId);
  if (!Array.isArray(json?.users)) throw new Error(t("scanFailed"));
  if (json.should_limit_list_of_followers === true || json.should_limit_list_of_followings === true) throw scanError("incomplete", t("limitedList"));
  const users = [];
  for (const raw of json.users) {
   if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw scanError("incomplete", t("listChanged"));
   const user = normalizeUser(raw);
   // Matching followers needs their ID, even when Instagram omits a username.
   // A missing ID can change the comparison, so never silently discard it.
   if (!user.id || (kind === "following" && !user.username)) throw scanError("incomplete", t("listChanged"));
   users.push(user);
  }
  const previousCount=dedupe(results).length;
  results.push(...users);
  const unique = dedupe(results);
  if (users.length && unique.length === previousCount) throw scanError("incomplete", t("listChanged"));
  const nextCursor = json.next_max_id == null ? "" : String(json.next_max_id);
  if (json.has_more === true && !nextCursor) throw scanError("incomplete", t("listChanged"));
  // Match the working reference: an explicit end flag wins over a leftover cursor.
  const finished = json.has_more === false || !nextCursor;
  if (!finished && (!users.length || seenCursors.has(nextCursor))) throw scanError("incomplete", t("listChanged"));
  if (totalKnown && unique.length > total) throw scanError("incomplete", t("listChanged"));
  onPage(unique, finished ? "" : nextCursor);
  if (finished) {
   if (totalKnown && unique.length !== total) throw scanError("incomplete", t("incompleteList", {loaded:formatCount(unique.length),total:formatCount(total)}));
   return unique;
  }
  seenCursors.add(nextCursor); cursor = nextCursor; page += 1;
  await waitBeforeNextScanPage(page);
 }
} async function waitBeforeNextScanPage(page) { await sleepWithCountdown(randomBetween(SCAN_MICRO_DELAY_MIN, SCAN_MICRO_DELAY_MAX), "scanPause"); await sleepWithCountdown(randomBetween(state.timings.scanDelayMin, state.timings.scanDelayMax), "scanPause"); if (state.timings.scanPauseEveryPages > 0 && page % state.timings.scanPauseEveryPages === 0) { await sleepWithCountdown(Math.max( 0, state.timings.scanPauseMs + (Math.random() * SCAN_PAUSE_JITTER_MS * 2 - SCAN_PAUSE_JITTER_MS) ), "scanPause"); } } function friendshipListUrl(viewerId, kind, cursor = "", count = DEFAULT_TIMINGS.usersPerRequest) { if (kind !== "following" && kind !== "followers") throw new Error("Unknown friendship list"); const safeCount = Math.min(200, Math.max(1, Math.round(Number(count) || DEFAULT_TIMINGS.usersPerRequest))); const base = `/api/v1/friendships/${encodeURIComponent(viewerId)}/${kind}/?count=${safeCount}`; return cursor ? `${base}&max_id=${encodeURIComponent(cursor)}` : base; } function addFollowBackStatus(following, followers, complete = true) { const followerIds = new Set(followers.map((entry) => String(entry && typeof entry === "object" ? entry.id : entry))); return following.map((user) => ({ ...user, follows_viewer: followerIds.has(String(user.id)) ? true : (complete ? false : null) })); } function scanError(kind, message, status) { const error = new Error(message); error.kind = kind; error.status = status; return error; } async function igFetch(url, init = {}) {
 try { return await igFetchJson(url, init); }
 catch (error) {
  if (error?.kind !== "cancelled" && Number.isInteger(error?.status) && error.status > 0) {
   error.message += " (HTTP " + error.status + ")";
  }
  throw error;
 }
}
async function igFetchJson(url, init = {}) { let attempt = 0; while (true) { if (destroyed || state.scanCancelled) throw scanError("cancelled", "Scan cancelled"); let response; let body; try { ({response, text:body} = await igRequest(url, {...init, headers:{...IG_HEADERS,...(init.headers || {})}})); } catch (error) { if (destroyed || state.scanCancelled) throw scanError("cancelled", "Scan cancelled"); if(error?.kind === "response")throw error; if (attempt >= MAX_RETRIES) throw scanError("network", t("networkError"), 0); await sleepWithCountdown(Math.min(30000, 3000 * Math.pow(2, attempt)), "cooldownIn"); attempt += 1; continue; } if (destroyed || state.scanCancelled) throw scanError("cancelled", "Scan cancelled"); let json; try { json = JSON.parse(body); } catch {   } const message = json && typeof json === "object" ? String(json.message || json.error_type || "") : ""; if (response.status === 401 || json?.require_login || /login_required/i.test(message)) { throw scanError("session", t("sessionExpired"), response.status); } if (response.status === 429 || /rate_limit|too many requests|please wait a few minutes/i.test(message)) { throw scanError("rate", t("tooManyRequests"), response.status); } if (response.status === 403 || json?.spam || json?.challenge || json?.checkpoint_url || json?.feedback_required || /feedback_required|checkpoint_required|challenge_required/i.test(message)) { throw scanError("blocked", t("scanBlocked"), response.status); } if (response.status >= 500 && response.status < 600) { if (attempt >= MAX_RETRIES) { throw scanError("http", t("requestFailed", { status: response.status }), response.status); } const retryAfter = parseRetryAfter(response.headers?.get?.("retry-after")); const wait = retryAfter || Math.min(60000, 5000 * Math.pow(2, attempt)); await sleepWithCountdown(wait, "cooldownIn"); attempt += 1; continue; } if (response.ok) { if (!json || typeof json !== "object" || Array.isArray(json)) throw scanError("response", state.language === "tr" ? "Instagram liste yerine okunamayan bir yanıt döndürdü. Canlı günlük veya raporu kontrol et." : "Instagram returned an unreadable list response. Check the live log or report.", response.status); if (json.status && json.status !== "ok") throw scanError("http", t("scanFailed"), response.status); return json; } throw scanError("http", t("requestFailed", { status: response.status }), response.status); } } function parseRetryAfter(value) { if (!value) return 0; const seconds = Number(value); if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000); const date = Date.parse(value); if (!Number.isNaN(date)) return Math.max(0, date - Date.now()); return 0; } function responseDiagnostics(status, bodyText) {
 const text=typeof bodyText === "string" ? bodyText : "";
 let responseKind=text.trim()?"text":"empty";
 try { JSON.parse(text); responseKind="json"; } catch { if (/^\s*</.test(text)) responseKind="html"; }
 return {httpStatus:Number(status)||0,responseKind};
}
function safeNetworkHeaders(headers){
 const result={};
 const rules={"content-type":/^(?:application\/(?:json|javascript|x-www-form-urlencoded)|text\/(?:html|plain|javascript))(?:;\s*charset=[a-z0-9-]+)?$/i,"content-length":/^\d{1,12}$/,"content-encoding":/^(?:gzip|br|zstd|deflate|identity)(?:,\s*(?:gzip|br|zstd|deflate|identity))*$/i,"x-ig-app-id":/^\d{1,20}[:,]?$/,"x-asbd-id":/^\d{1,10}$/,"accept":/^(?:\*\/\*|application\/json)$/,"retry-after":/^\d{1,8}$/,"x-content-type-options":/^nosniff$/i,"x-frame-options":/^(?:DENY|SAMEORIGIN)$/i,"cache-control":/^(?:(?:private|public|no-cache|no-store|must-revalidate|immutable|no-transform|s-maxage=\d+|max-age=\d+)(?:,\s*)?)+$/i};
 const add=(value,name)=>{name=String(name).toLowerCase();if(!/^[a-z0-9-]{1,64}$/.test(name)||Object.keys(result).length>=80)return;result[name]=typeof value==="string"&&value.length<=160&&Object.prototype.hasOwnProperty.call(rules,name)&&rules[name].test(value)?value:"[REDACTED]";};
 if(typeof headers?.forEach==="function")headers.forEach(add);else if(headers&&typeof headers==="object")for(const [name,value]of Object.entries(headers))add(value,name);
 return result;
}
function responseTransportDiagnostics(response,bodyText="") {
 const rawType=String(response.headers?.get?.("content-type")||"").split(";")[0].trim().toLowerCase();
 const contentType=["application/json","text/html","text/javascript","application/javascript","text/plain"].includes(rawType)?rawType:"other";
 let finalRoute="unavailable";
 try {
  const url=new URL(response.url);
  finalRoute=url.origin!=="https://www.instagram.com"?"other-origin":/^\/api\/v1\/friendships\/destroy\/\d+\/$/.test(url.pathname)?"destroy":/^\/api\/v1\/friendships\/show\/\d+\/$/.test(url.pathname)?"show":/^\/accounts\/login(?:\/|$)/.test(url.pathname)?"login":/^\/(?:challenge|checkpoint)(?:\/|$)/.test(url.pathname)?"challenge":url.pathname==="/api/graphql"?"graphql":url.pathname==="/"?"home":"other-instagram";
 } catch {}
 const text=String(bodyText).slice(0,2_000_000);
 const htmlSignals=[];
 if(/^\s*</.test(text)){
  if(/<form\b[^>]*action=["'][^"']*\/accounts\/login\b|<input\b[^>]*name=["'](?:username|password)["']/i.test(text))htmlSignals.push("login-form");
  if(/<form\b[^>]*action=["'][^"']*\/(?:challenge|checkpoint)\b/i.test(text))htmlSignals.push("challenge-form");
  if(/Polaris\w+|id=["']mount_0_0_/i.test(text))htmlSignals.push("instagram-app-shell");
  if(/<title[^>]*>\s*(?:Page Not Found|Page isn't available|Sorry, this page isn't available)/i.test(text))htmlSignals.push("not-found-title");
 }
 const knownTags=new Set(["html","head","title","meta","link","body","script","style","div","span","form","input","button","a","h1","h2","p","noscript"]);
 const htmlStructure=/^\s*</.test(text)?Array.from(text.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi)).slice(0,200).map(match=>knownTags.has(match[1].toLowerCase())?"<"+(match[0][1]==="/"?"/":"")+match[1].toLowerCase()+">":"<other>").join(""):"";
 return {redirected:Boolean(response.redirected),contentType,finalRoute,responseLength:typeof bodyText==="string"?bodyText.length:0,htmlSignals,responseHeaders:safeNetworkHeaders(response.headers),htmlStructure};
}
function evaluateUnfollowResponse(status, bodyText) {
 const result=evaluateUnfollowPayload(status,bodyText);
 const diagnostics=responseDiagnostics(status,bodyText);
 if (result.reason === "unexpected response") {
  const names=state.language === "tr" ? {html:"HTML sayfası",empty:"boş yanıt",text:"JSON olmayan yanıt",json:"geçersiz JSON yapısı"} : {html:"HTML page",empty:"empty response",text:"non-JSON response",json:"invalid JSON structure"};
  result.reason=(state.language === "tr" ? "Sonuç doğrulanamadı: " : "Result unconfirmed: ")+names[diagnostics.responseKind]+" (HTTP "+diagnostics.httpStatus+").";
 }
 return {...result,diagnostics};
}
const OPERATION_TRANSITIONS={pending:["prechecking","cancelled_before_dispatch"],prechecking:["ready","failed","not_processed","cancelled_before_dispatch"],ready:["dispatching","failed","not_processed","cancelled_before_dispatch"],dispatching:["awaiting_response","uncertain"],awaiting_response:["verifying","failed","uncertain"],verifying:["confirmed","failed","uncertain"]};
function transitionOperation(record,next){if(!record)return;if(!OPERATION_TRANSITIONS[record.phase]?.includes(next))throw new Error("Illegal operation transition: "+record.phase+" -> "+next);record.phase=next;record.version++;}
function finishOperation(outcome){const op=state.activeOperation;if(!op)return;const category=outcome.ok?"confirmed":outcome.category||"uncertain";const next=category==="not_processed"?"cancelled_before_dispatch":category;if(op.phase!==next)transitionOperation(op,next);}
function recordDispatchIntent(id){
 try{
  const key="iu_operation_history_v1",raw=JSON.parse(localStorage.getItem(key)||"[]");
  if(!Array.isArray(raw))return false;
  const unresolved=raw.find(e=>e&&e.accountId===state.viewerId&&e.targetId===String(id)&&e.category==="uncertain"&&(!state.scanCollectedAt||state.scanCollectedAt<=Date.parse(e.at)));
  if(unresolved)return false;
  state.runId=state.runId||globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
  const row={operationId:state.runId+":"+id,accountId:state.viewerId,targetId:String(id),username:state.users.find(u=>u.id===String(id))?.username||"",at:new Date().toISOString(),category:"uncertain",code:"DISPATCH_INTENT"};
  localStorage.setItem(key,JSON.stringify([...raw.filter(e=>e.operationId!==row.operationId),row].slice(-300)));return true;
 }catch{return false;}
}
function persistOperationHistory(){
 try{
  const key="iu_operation_history_v1";
  const old=JSON.parse(localStorage.getItem(key)||"[]");
  const rows=Array.isArray(old)?old:[];
  const current=state.log.map(e=>({operationId:e.operationId,accountId:state.viewerId,targetId:e.user.id,username:e.user.username,at:new Date().toISOString(),category:e.category,code:e.code,phase:e.phase,stateVersion:e.stateVersion,diagnostics:e.diagnostics}));
  const ids=new Set(current.map(e=>e.operationId));
  localStorage.setItem(key,JSON.stringify([...rows.filter(e=>e&& !ids.has(e.operationId)),...current].slice(-300)));
 }catch{state.historyWriteFailed=true;}
}
function evaluateUnfollowPayload(status, bodyText) {
 const text=typeof bodyText === "string" ? bodyText : "";
 const fail=(code,reason,category="uncertain",blocked=false,stop=true)=>({ok:false,code,reason,category,blocked,stop});
 let payload=null;try{if(text.length<=2_000_000)payload=JSON.parse(text);}catch{}
 const message=payload && typeof payload === "object" ? String(payload.message||payload.error_type||"") : "";
 if(status===401)return fail("HTTP_UNAUTHORIZED",`HTTP ${status}`,"failed",true);
 if(status===403)return fail("HTTP_FORBIDDEN",`HTTP ${status}`,"failed",true);
 if(status===429 || /rate_limit|too many requests|please wait/i.test(message))return fail("HTTP_RATE_LIMITED",`HTTP ${status}`,"failed",true);
 if(payload?.require_login||payload?.spam||payload?.challenge||payload?.checkpoint_url||payload?.feedback_required||/login_required|challenge_required|checkpoint_required|feedback_required/i.test(message))return fail("HTTP_FORBIDDEN",`HTTP ${status}`,"failed",true);
 if(payload===null){
  const kind=responseDiagnostics(status,text).responseKind;
  return fail(kind==="html"?"UNEXPECTED_HTML":kind==="empty"?"EMPTY_RESPONSE":"INVALID_JSON","unexpected response");
 }
 if(status===404)return fail("HTTP_NOT_FOUND","Request endpoint returned HTTP 404","failed");
 if(status>=500)return fail("HTTP_SERVER_ERROR",`HTTP ${status}`);
 if(status<200||status>=300)return fail("HTTP_ERROR",`HTTP ${status}`,"failed");
 if(!payload||typeof payload!=="object"||Array.isArray(payload))return fail("UNEXPECTED_RESPONSE_SCHEMA","unexpected response");
 if(payload.errors)return fail(payload.data?"GRAPHQL_PARTIAL_RESULT":"GRAPHQL_APPLICATION_ERROR",t("mutationUncertain"));
 if(payload.data||payload.ig_quick_promotion_batch_fetch_root)return fail("UNSUPPORTED_INTEGRATION",t("mutationUncertain"));
 if(payload.status==="ok"&&(payload.friendship_status?.following===false||payload.friendship_status==null))return {ok:true,category:"accepted",blocked:false,code:"MUTATION_ACCEPTED",reason:""};
 if(payload.status==="fail")return fail("APPLICATION_REJECTED",t("mutationUncertain"),"failed",false,false);
 return fail("UNEXPECTED_RESPONSE_SCHEMA",t("mutationUncertain"));
}
function confirmUnfollow() { if (destroyed || state.partial || !state.selected.size) return; const count = state.selected.size; showDialog({ title: t("unfollowConfirmTitle", { count }), body: t("unfollowConfirmBody"), confirmLabel: t("unfollowConfirmBtn", { count }), destructive: true, onConfirm: () => startUnfollow() }); } async function startUnfollow() { if (destroyed || state.partial || state.mode === "scanning" || state.mode === "unfollowing") return; try { assertViewer(); } catch (error) {state.error=error.message;state.mode="idle";state.users=[];state.selected.clear();clearCheckpoint();renderBody();return;} const targets = state.users.filter((u) => u.follows_viewer === false && state.selected.has(u.id)); if (!targets.length) return; const csrf = getCookie("csrftoken"); if (!csrf) { toast(t("csrfMissing")); return; } state.runId=globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2); state.mode = "unfollowing"; state.unfollowOutcome = "running"; state.unfollowPaused = false; state.unfollowCancelled = false; state.unfollowBlocked = 0; state.log = []; state.progress = { current: 0, total: targets.length, label: "unfollowing", note: "" }; renderBody(); let processed = 0; for (let i = 0; i < targets.length; i += 1) { await waitWhile(() => state.unfollowPaused && !state.unfollowCancelled); if (state.unfollowCancelled) break; const user = targets[i]; state.activeOperation={id:state.runId+":"+user.id,accountId:state.viewerId,targetId:user.id,phase:"pending",version:0};transitionOperation(state.activeOperation,"prechecking"); let outcome = { ok: false, blocked: false, reason: "" }; try { outcome = await unfollowUser(user.id, csrf); } catch (error) { console.error("[iu] unfollow failed for", user.username, error); outcome = { ok: false, blocked: false, stop:true, reason: error?.message || t("mutationUncertain") }; } if (destroyed) return; finishOperation(outcome); state.log.push({ user, ok: outcome.ok, reason: outcome.reason, diagnostics:outcome.diagnostics, category:outcome.ok?"confirmed":(outcome.category||"uncertain"),code:outcome.code||"MUTATION_RESULT_UNCERTAIN",operationId:state.runId+":"+user.id,phase:state.activeOperation.phase,stateVersion:state.activeOperation.version }); persistOperationHistory(); if (outcome.ok || outcome.code==="ALREADY_NOT_FOLLOWING") { state.selected.delete(user.id); const userRef = state.users.find((u) => u.id === user.id); if (userRef) userRef.unfollowed = true; } processed += 1; state.progress = { current: processed, total: targets.length, label: "unfollowing", note: outcome.ok ? "" : outcome.reason }; updateUnfollowDOM(); if (outcome.blocked) { state.unfollowOutcome = "stopped"; state.unfollowBlocked = targets.length - processed; console.warn("[iu] Instagram blocked the unfollow action:", outcome.reason); break; } if (outcome.stop || (!outcome.ok && outcome.code!=="ALREADY_NOT_FOLLOWING" && state.timings.continueOnFailure !== true)) {state.unfollowOutcome="stopped";break;} const isLast = i === targets.length - 1; if (!isLast) { await sleepWithCountdown(randomBetween(state.timings.unfollowDelayMin, state.timings.unfollowDelayMax), "nextActionIn"); if (state.timings.unfollowPauseEvery > 0 && (i + 1) % state.timings.unfollowPauseEvery === 0) { await sleepWithCountdown(state.timings.unfollowPauseMs, "cooldownIn"); } } } if (destroyed) return; if (state.unfollowCancelled) {state.unfollowOutcome="cancelled";state.progress.note=t("cancelledUncertain");} else if (state.unfollowOutcome === "running") state.unfollowOutcome=state.log.every(e=>e.category==="not_processed")?"complete_no_changes":state.log.some(e=>!e.ok)?"completed_with_errors":"complete"; state.users = state.users.filter((u) => !u.unfollowed); state.mode = "unfollowDone"; state.waitUntil = 0; state.waitReason = ""; renderBody(); } async function unfollowUser(id, csrf) {
 const notSent=(code,reason,diagnostics)=>({ok:false,stop:true,blocked:false,category:"not_processed",code,reason,diagnostics});
 try{
  assertViewer();
  if(!/^\d+$/.test(String(id))||String(id)===String(state.viewerId)||!state.users.some(u=>u.id===String(id)&&state.selected.has(u.id)))return notSent("TARGET_ID_MISMATCH",t("mutationUncertain"));
  const {response,text}=await igRequest(`/api/v1/friendships/show/${encodeURIComponent(id)}/`,{headers:{...IG_HEADERS,accept:"application/json"},cache:"no-store"});
  assertViewer();if(destroyed||state.unfollowCancelled)return notSent("CANCELLED_BEFORE_DISPATCH",t("cancelledUncertain"));
  let payload;try{payload=JSON.parse(text)}catch{}
  const relation=payload?.friendship_status??payload,identity=payload?.target_id??payload?.user_id??relation?.user_id;
  if(identity!=null&&String(identity)!==String(id))return notSent("TARGET_ID_MISMATCH",t("mutationUncertain"));
  if(!response.ok||response.redirected||!payload||payload.status&&payload.status!=="ok"||typeof relation?.following!=="boolean"){
   const detail=evaluateUnfollowResponse(response.status,text);
   return notSent("VERIFICATION_UNAVAILABLE",(state.language==="tr"?"Ön ilişki kontrolü başarısız; istek gönderilmedi. ":"Relationship precheck failed; no mutation sent. ")+(detail.reason||`HTTP ${response.status}`),{precheck:{...responseDiagnostics(response.status,text),...responseTransportDiagnostics(response,text)}});
  }
  if(!relation.following)return {ok:false,stop:false,blocked:false,category:"not_processed",code:"ALREADY_NOT_FOLLOWING",reason:state.language==="tr"?"Zaten takip edilmiyor; yeni işlem gönderilmedi.":"Already not following; no new mutation sent."};
 }catch(error){return notSent(error?.kind==="account"?"ACCOUNT_CONTEXT_CHANGED":"VERIFICATION_UNAVAILABLE",t("mutationUncertain"));}
 transitionOperation(state.activeOperation,"ready");
 const sent = await sendUnfollowRequest(id, csrf);
 const outcome = {...sent,reason:sent.reason?((state.language==="tr"?"Takip bırakma isteği: ":"Unfollow request: ")+sent.reason):"",diagnostics:{mutation:sent.diagnostics}};
 if (!outcome.ok) return outcome;
 transitionOperation(state.activeOperation,"verifying");
 const failed = (reason, blocked = false) => ({ok:false, blocked, stop:true, category:"uncertain",code:"VERIFICATION_INCONCLUSIVE", reason,diagnostics:outcome.diagnostics});
 const message = (tr, en) => state.language === "tr" ? tr : en;
 if (destroyed || state.unfollowCancelled) return failed(message("İşlem iptal edildi; sonuç doğrulanamadı.", "Cancelled; result not verified."));
 await interruptibleSleep(1000);
 await waitWhile(() => state.unfollowPaused && !state.unfollowCancelled && !destroyed);
 if (destroyed || state.unfollowCancelled) return failed(message("İşlem iptal edildi; sonuç doğrulanamadı.", "Cancelled; result not verified."));
 try {
  assertViewer();
  const {response, text} = await igRequest(`/api/v1/friendships/show/${encodeURIComponent(id)}/`, {
   headers:{...IG_HEADERS, "accept":"application/json"}, cache:"no-store"
  });
  assertViewer();
  if (destroyed || state.unfollowCancelled) return failed(message("Sonuç doğrulanmadan iptal edildi.", "Cancelled before verification."));
  outcome.diagnostics.verification={...responseDiagnostics(response.status,text),...responseTransportDiagnostics(response,text)};
  if(response.redirected)return {...failed(t("mutationUncertain")),code:"VERIFICATION_UNAVAILABLE"};
  const refusal = evaluateUnfollowResponse(response.status, text);
  if (refusal.blocked) return failed(message("Instagram doğrulama isteğini engelledi. İşlem durduruldu.", "Instagram blocked verification. Stopped."), true);
  let payload;
  try { payload = JSON.parse(text); } catch (error) {
  if (error?.kind === "account") return failed(error.message); payload = null; }
  const relation = payload?.friendship_status ?? payload;
  const identity=payload?.target_id??payload?.user_id??relation?.user_id;
  if(identity!=null&&String(identity)!==String(id))return {...failed(t("mutationUncertain")),code:"TARGET_ID_MISMATCH"};
  if (!response.ok || !payload || (payload.status && payload.status !== "ok") || typeof relation?.following !== "boolean") {
   return failed(message("Son ilişki doğrulaması başarısız. Başarılı sayılmadı; işlem durduruldu. ", "Final relationship verification failed. Not counted as success; stopped. ")+(refusal.reason||`HTTP ${response.status}`));
  }
  if (relation.following === true) return {...failed(message("Hesap hâlâ takip ediliyor. Başarılı sayılmadı; işlem durduruldu.", "Account is still followed. Not counted as success; stopped.")),category:"failed",code:"VERIFIED_STILL_FOLLOWING"};
  return {ok:true, category:"confirmed", code:"CURRENT_STATE_VERIFIED",attribution:"not_independently_established",blocked:false,reason:"",diagnostics:outcome.diagnostics};
 } catch {
  return failed(message("Doğrulama bağlantısı başarısız. Sonuç belirsiz; işlem durduruldu.", "Verification connection failed. Result uncertain; stopped."));
 }
}
// Protocol evidence: speedgram/docs/web-api-surface.md at
// aryasarukkai/instagram-fast-react-client, revision 416053996d99b394ce0c10a19ba23aec1fbaa1c0.
// This is a captured third-party contract, not a live acceptance result for this account.
const PAGE_CONTEXT_VIEWER_ID=getCookie("ds_user_id");
async function prepareUnfollowRequest(id,csrf){
 const legacy={url:`/api/v1/friendships/destroy/${encodeURIComponent(id)}/`,init:{method:"POST",headers:{...IG_HEADERS,accept:"*/*","content-type":"application/x-www-form-urlencoded","x-asbd-id":"129477","x-csrftoken":csrf},body:`user_id=${encodeURIComponent(id)}`},protocol:"rest"};
 const scripts=Array.from(document.querySelectorAll?.('script:not([src])')||[]);
 let html="";for(const script of scripts){if(html.length>5_000_000)break;html+=String(script.textContent||"").slice(0,1_000_000)+"\n";}
 const dtsg=html.match(/\["DTSGInitialData",\[\],\{"token":"([^"\\]{1,1024})"/)?.[1];
 const lsd=html.match(/\["LSD",\[\],\{"token":"([^"\\]{1,1024})"/)?.[1];
 // Select one protocol before dispatch; never try another mutation after a response.
 if(!dtsg&&!lsd)return legacy;
 if(!dtsg||!lsd)throw Object.assign(new Error(state.language==="tr"?"GraphQL oturum bağlamı eksik; istek gönderilmedi. Instagram sekmesini yenile.":"Incomplete GraphQL session context; no mutation sent. Reload Instagram."),{kind:"operation",code:"UNSUPPORTED_INTEGRATION"});
 assertViewer();
 const pageActors=new Set();
 for(const match of html.matchAll(/\["CurrentUserInitialData",\[\],(\{[^\n]{0,12000}?\})\s*[,\]]/g)){
  try{const current=JSON.parse(match[1]);const candidate=current.NON_FACEBOOK_USER_ID;if(current.IS_INSTAGRAM_USER&&/^\d+$/.test(String(candidate||""))&&String(candidate)!=="0")pageActors.add(String(candidate));}catch{}
 }
 const actor=pageActors.size===1?[...pageActors][0]:null;
 const identityOK=Boolean(PAGE_CONTEXT_VIEWER_ID)&&String(PAGE_CONTEXT_VIEWER_ID)===String(state.viewerId)&&getCookie("ds_user_id")===String(state.viewerId);
 const actorOK=/^\d+$/.test(String(actor||""))&&String(actor)!=="0"&&(typeof actor!=="number"||Number.isSafeInteger(actor));
 if(!identityOK||!actorOK){
  const evidence={viewerIdMatches:identityOK,actorPresent:actor!=null,actorValid:actorOK,pageActorAvailable:pageActors.size===1,profileRequestSent:false};
  throw Object.assign(new Error(state.language==="tr"?"Sayfanın oturum kimliği eksik veya değişmiş; istek gönderilmedi. Instagram sekmesini yenile.":"Page session identity is missing or changed; no mutation sent. Reload Instagram."),{kind:"operation",code:"ACCOUNT_CONTEXT_CHANGED",diagnostics:{actorCheck:evidence}});
 }
 const fields={av:String(actor),__a:"1",__comet_req:"7",fb_dtsg:dtsg,jazoest:"2"+Array.from(dtsg).reduce((sum,ch)=>sum+ch.charCodeAt(0),0),lsd,fb_api_caller_class:"RelayModern",fb_api_req_friendly_name:"usePolarisUnfollowMutation",server_timestamps:"true",doc_id:"27789106940691111",variables:JSON.stringify({target_user_id:String(id),container_module:"profile",nav_chain:"PolarisProfilePostsTabRoot:profilePage:1:via_cold_start"})};
 return {url:"/api/graphql",protocol:"polaris",init:{method:"POST",headers:{...IG_HEADERS,accept:"*/*","content-type":"application/x-www-form-urlencoded","x-csrftoken":csrf,"x-fb-lsd":lsd,"x-fb-friendly-name":"usePolarisUnfollowMutation"},body:Object.entries(fields).map(([key,value])=>encodeURIComponent(key)+"="+encodeURIComponent(value)).join("&")}};
}
function evaluatePolarisUnfollowResponse(status,text){
 const checked=evaluateUnfollowResponse(status,text);
 if(status<200||status>=300||checked.blocked)return checked;
 let payload;try{payload=JSON.parse(text)}catch{return checked;}
 const relation=payload?.data?.xdt_destroy_friendship?.friendship_status;
 if(payload.errors||(payload.status&&payload.status!=="ok")||!relation||relation.following!==false)return {...checked,ok:false,category:"uncertain",stop:true,code:payload.errors?"GRAPHQL_APPLICATION_ERROR":"UNEXPECTED_RESPONSE_SCHEMA",reason:t("mutationUncertain")};
 return {ok:true,blocked:false,category:"accepted",code:"MUTATION_ACCEPTED",reason:""};
}
async function sendUnfollowRequest(id, csrf) {
 let dispatched=false; const failed = (reason, blocked = false, stop = true) => ({ok:false, blocked, stop, reason,category:dispatched?"uncertain":"not_processed",code:dispatched?"MUTATION_RESULT_UNCERTAIN":"CANCELLED_BEFORE_DISPATCH"});
 try {
  if (destroyed || state.unfollowCancelled) return failed(t("cancelledUncertain"));
  assertViewer();
  let currentCsrf = getCookie("csrftoken");
  if (!currentCsrf) return failed(t("csrfMissing"));
  if(!/^\d+$/.test(String(id))||String(id)===String(state.viewerId)||!state.users.some(u=>u.id===String(id)&&state.selected.has(u.id)))return failed(t("mutationUncertain"));
  const request=await prepareUnfollowRequest(id,currentCsrf);
  assertViewer();if(destroyed||state.unfollowCancelled)return failed(t("cancelledUncertain"));
  if(!state.users.some(u=>u.id===String(id)&&state.selected.has(u.id)))return failed(t("mutationUncertain"));
  if(!recordDispatchIntent(id))return failed(state.language==="tr"?"Önceki belirsiz işlem veya kayıt hatası var. Yeni tarama ve manuel inceleme gerekli.":"Previous uncertainty or storage failure; a fresh scan and manual review are required.");
  transitionOperation(state.activeOperation,"dispatching"); dispatched=true; transitionOperation(state.activeOperation,"awaiting_response");
  request.init.headers["x-csrftoken"]=currentCsrf;
  const {response, text} = await igRequest(request.url,request.init);
  if (destroyed || state.unfollowCancelled) return failed(t("cancelledUncertain"));
  assertViewer();
  const diagnostics={...responseDiagnostics(response.status,text),...responseTransportDiagnostics(response,text)};
  if(response.redirected)return {...failed(t("mutationUncertain")),code:"UNSUPPORTED_INTEGRATION",diagnostics};
  let identity;try{const parsed=JSON.parse(text);identity=parsed?.target_id??parsed?.user_id??parsed?.friendship_status?.user_id??parsed?.data?.xdt_destroy_friendship?.target_user_id??parsed?.data?.xdt_destroy_friendship?.user_id;}catch{}
  if(identity!=null&&String(identity)!==String(id))return {...failed(t("mutationUncertain")),code:"TARGET_ID_MISMATCH"};
  const outcome = request.protocol==="polaris"?evaluatePolarisUnfollowResponse(response.status,text):evaluateUnfollowResponse(response.status, text);
  return {...outcome,diagnostics,...(outcome.ok?{}:{stop:outcome.stop!==false})};
 } catch (error) {
  return {...failed(destroyed || state.unfollowCancelled ? t("cancelledUncertain") : error?.kind === "account" || error?.kind === "operation" ? error.message : t("mutationUncertain")),blocked:error?.code==="HTTP_RATE_LIMITED",diagnostics:error?.diagnostics,code:error?.code || (error?.kind === "account"?"ACCOUNT_CONTEXT_CHANGED":error?.kind === "operation"?"OPERATION_LOCK_LOST":error?.name === "AbortError"?"REQUEST_ABORTED":"NETWORK_FAILURE")};
 }
} async function copyUsernames() { const display = getDisplayUsers(); const target = state.selected.size ? display.filter((u) => state.selected.has(u.id)) : display; if (!target.length) return; const text = target.map((u) => u.username).sort().join("\n"); try { await navigator.clipboard.writeText(text); toast(t("copiedToast", { count: target.length })); } catch (error) { console.error("[iu] copy failed:", error); const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(t("copiedToast", { count: target.length })); } catch {   } ta.remove(); } } function showSettings() { const fields = [ ["scanDelayMin", "minScanDelay", 100, 0], ["scanDelayMax", "maxScanDelay", 100, 0], ["scanPauseEveryPages", "scanPauseEvery", 1, 0], ["scanPauseMs", "scanPauseLength", 1000, 0], ["usersPerRequest", "usersPerRequest", 1, 1, 200], ["unfollowDelayMin", "minUnfollowDelay", 1000, 0], ["unfollowDelayMax", "maxUnfollowDelay", 1000, 0], ["unfollowPauseEvery", "unfollowPauseEvery", 1, 0], ["unfollowPauseMs", "unfollowPauseLength", 1000, 0] ]; const formHTML = fields.map(([key, label, step, min, max]) => ` <label class="iu-field"> <span>${escapeHTML(t(label))}</span> <input type="number" min="${min}"${max ? ` max="${max}"` : ""} step="${step}" data-setting="${escapeAttr(key)}" value="${Number(state.timings[key])}"> </label> `).join("") + ` <label class="iu-field" style="margin-top:6px;"> <span>${escapeHTML(t("continueOnFailure"))}</span> <input type="checkbox" data-setting="continueOnFailure" style="width:18px;height:18px;accent-color:var(--iu-accent);cursor:pointer;" ${state.timings.continueOnFailure ? "checked" : ""}> </label> `; showDialog({ title: t("settingsTitle"), body: t("settingsBody"), contentHTML: `<div class="iu-form">${formHTML}</div>`, confirmLabel: t("save"), extraButton: { label: t("restoreDefaults"), action: "restore" }, onConfirm: (dialog) => { dialog.querySelectorAll("[data-setting]").forEach((input) => { const key = input.getAttribute("data-setting"); const val = Number(input.value); const min = Number(input.min || 0); const max = input.max ? Number(input.max) : Infinity; if (input.type === "checkbox") state.timings[key] = input.checked; else if (Number.isFinite(val) && val >= min && val <= max) state.timings[key] = val; }); persist(); toast(t("saved")); }, onExtra: (dialog) => { Object.assign(state.timings, DEFAULT_TIMINGS); dialog.querySelectorAll("[data-setting]").forEach((input) => { const key = input.getAttribute("data-setting"); if (input.type === "checkbox") input.checked = Boolean(state.timings[key]); else input.value = state.timings[key]; }); } }); } function showDialog({ title, body, contentHTML, confirmLabel, destructive, extraButton, onConfirm, onExtra }) { dialogCounter += 1; const titleId = `${APP_ID}-dialog-title-${dialogCounter}`; const previouslyFocused = document.activeElement; const overlay = document.createElement("div"); overlay.className = "iu-overlay"; overlay.innerHTML = ` <div class="iu-dialog" role="dialog" aria-modal="true" aria-labelledby="${titleId}" tabindex="-1"> <h3 id="${titleId}">${escapeHTML(title)}</h3> <div class="iu-dialog-content">${body ? `<p>${escapeHTML(body)}</p>` : ""} ${contentHTML || ""}</div> <div class="iu-dialog-actions"> ${extraButton ? `<button type="button" class="iu-btn iu-btn--ghost iu-btn--small" data-extra>${escapeHTML(extraButton.label)}</button>` : ""} <button type="button" class="iu-btn iu-btn--small" data-cancel>${escapeHTML(t("cancel"))}</button> <button type="button" class="iu-btn iu-btn--small ${destructive ? "iu-btn--danger" : "iu-btn--primary"}" data-confirm>${escapeHTML(confirmLabel)}</button> </div> </div> `; document.getElementById(APP_ID).appendChild(overlay); const dialog = overlay.querySelector(".iu-dialog"); const close = () => { document.removeEventListener("keydown", onKeyDown, true); if (closeActiveDialog === close) closeActiveDialog = null; overlay.remove(); if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus(); }; const focusables = () => Array.from( dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ).filter((el) => !el.disabled && el.getClientRects().length > 0); function onKeyDown(event) { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); return; } if (event.key !== "Tab") return; const items = focusables(); if (!items.length) return; const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } document.addEventListener("keydown", onKeyDown, true); closeActiveDialog = close; overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); }); overlay.querySelector("[data-cancel]").addEventListener("click", close); overlay.querySelector("[data-confirm]").addEventListener("click", () => { try { onConfirm?.(dialog); } finally { close(); } }); if (extraButton && onExtra) { overlay.querySelector("[data-extra]").addEventListener("click", () => onExtra(dialog)); } (dialog.querySelector("input") || (destructive ? dialog.querySelector("[data-cancel]") : dialog)).focus(); } function toggleLanguage() { state.language = state.language === "tr" ? "en" : "tr"; persist(); renderShell(); } function getDisplayUsers() {
 const query = state.search.trim().toLowerCase();
 return state.users.filter((u) => u.follows_viewer === false)
  .filter((u) => !query || (u.username + " " + (u.full_name || "")).toLowerCase().includes(query))
  .sort((a, b) => a.username.localeCompare(b.username));
} function pruneSelectionToDisplayed() { if (!state.selected.size) return; const visible = new Set(getDisplayUsers().map((u) => u.id)); state.selected.forEach((id) => { if (!visible.has(id)) state.selected.delete(id); }); } function safeProfilePicture(value){const url=String(value||"");return /^https:\/\/(?:[a-z0-9-]+\.)*(?:cdninstagram\.com|fbcdn\.net|instagram\.com)(?::443)?\//i.test(url)?url.slice(0,4096):"";}
function normalizeUser(raw) { return { id: String(raw.id || raw.pk || raw.pk_id || ""), username: String(raw.username || ""), full_name: String(raw.full_name || ""), profile_pic_url: safeProfilePicture(raw.profile_pic_url || raw.profile_pic_url_hd || ""), is_verified: typeof raw.is_verified === "boolean"?raw.is_verified:null, is_private: typeof raw.is_private === "boolean"?raw.is_private:null, follows_viewer: Boolean(raw.follows_viewer ?? raw.friendship_status?.followed_by ?? raw.followed_by) }; } function dedupe(list) { const seen = new Set(); return list.filter((u) => { if (!u.id || seen.has(u.id)) return false; seen.add(u.id); return true; }); } function isDefaultAvatar(user) { const url = user.profile_pic_url || ""; return /44884218_345707102882519|464760996_1254146839119862/.test(url); } function getCookie(name) { const match = document.cookie.match(new RegExp("(^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")); return match ? decodeURIComponent(match[2]) : null; } function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms))); } function interruptibleSleep(ms) { return new Promise((resolve) => { let timer = null; let settled = false; const finish = (expired) => { if (settled) return; settled = true; if (timer) clearTimeout(timer); if (wakeSleep === finish) wakeSleep = null; resolve(expired); }; wakeSleep = finish; timer = setTimeout(() => finish(true), Math.max(0, ms)); }); } function wakeUp() { if (typeof wakeSleep === "function") wakeSleep(false); } function visibilityNote() { return typeof document !== "undefined" && document.hidden ? t("keepTabVisible") : ""; } function onVisibilityChange() { if (state.mode !== "scanning") return; state.progress.note = visibilityNote(); updateProgressDOM(); } function randomBetween(min, max) { const lo = Math.min(min, max); const hi = Math.max(min, max); return Math.floor(Math.random() * (hi - lo)) + lo; } async function waitWhile(predicate, interval = 1000) { while (predicate()) await interruptibleSleep(interval); } async function sleepWithCountdown(ms, reasonKey) { state.waitReason = reasonKey; let remaining = Math.max(0, ms); while (remaining > 0) { if (state.scanCancelled || state.unfollowCancelled) break; if (state.scanPaused || state.unfollowPaused) { state.waitUntil = 0; updateCountdownDOM(); await waitWhile(() => (state.scanPaused || state.unfollowPaused) && !state.scanCancelled && !state.unfollowCancelled); continue; } state.waitUntil = Date.now() + remaining; updateCountdownDOM(); const before = Date.now(); const expired = await interruptibleSleep(remaining); remaining = expired ? 0 : Math.max(0, remaining - (Date.now() - before)); } state.waitUntil = 0; state.waitReason = ""; updateCountdownDOM(); } function startCountdown() { if (countdownTimer) return; countdownTimer = setInterval(updateCountdownDOM, 500); } function stopCountdown() { if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; } } function updateCountdownDOM() { const node = document.querySelector(`#${APP_ID} [data-countdown]`); if (!node) return; if (!state.waitUntil) { node.textContent = ""; return; } const remaining = Math.max(0, Math.ceil((state.waitUntil - Date.now()) / 1000)); const reason = state.waitReason || "nextActionIn"; node.textContent = t(reason, { seconds: remaining }); } function progressCounter(current, total) { if (total) return t("ofTotal", { current: formatCount(current), total: formatCount(total) }); return t("ofUnknown", { current: formatCount(current) }); } function setBar(root, percent, valueText, known) { const bar = root.querySelector("[data-progress-bar]"); if (bar) bar.style.width = percent + "%"; const box = root.querySelector("[data-bar]"); if (!box) return; if (known) box.setAttribute("aria-valuenow", String(percent)); else box.removeAttribute("aria-valuenow"); box.setAttribute("aria-valuetext", valueText); } function updatePillDOM() { if (!state.minimized) return; const pillLabelEl = document.querySelector(`#${APP_ID} [data-pill-label]`); if (pillLabelEl) pillLabelEl.textContent = pillLabel(); const dot=document.querySelector(`#${APP_ID} .iu-pill-dot`);if(dot)dot.className="iu-pill-dot "+pillStateClass(); } function updateProgressDOM() { updateInspector(); if(state.minimized){updatePillDOM();return;} const root = document.querySelector(`#${APP_ID} [data-body]`); if (!root) return; const { current, total, label, note } = state.progress; const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0; const counter = progressCounter(current, total); setBar(root, percent, counter, Boolean(total)); const counterEl = root.querySelector("[data-progress-counter]"); if (counterEl) counterEl.textContent = counter; const labelEl = root.querySelector("[data-progress-label]"); if (labelEl) labelEl.textContent = state.scanPaused ? t("paused") : t(label); const noteEl = root.querySelector("[data-progress-note]"); if (noteEl) noteEl.textContent = note || ""; updatePillDOM(); } function updateUnfollowDOM() { updateInspector(); if(state.minimized){updatePillDOM();return;} const root = document.querySelector(`#${APP_ID} [data-body]`); if (!root) return; const { current, total, note } = state.progress; const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0; const summary = unfollowSummary(); setBar(root, percent, summary, Boolean(total)); const counterEl = root.querySelector("[data-progress-counter]"); if (counterEl) counterEl.textContent = summary; const labelEl = root.querySelector("[data-progress-label]"); if (labelEl) labelEl.textContent = unfollowTitle(); const noteEl = root.querySelector("[data-progress-note]"); if (noteEl) noteEl.textContent = note || ""; const last = state.log[state.log.length - 1]; const currentEl = root.querySelector("[data-current]"); if (currentEl) { currentEl.hidden = !last; if (last) { const userEl = currentEl.querySelector("[data-current-user]"); if (userEl) userEl.textContent = "@" + last.user.username; const tagEl = currentEl.querySelector("[data-current-tag]"); if (tagEl) { tagEl.textContent = last.ok ? "✓" : "✕"; tagEl.title = last.reason || ""; tagEl.classList.toggle("iu-tag--green", last.ok); tagEl.classList.toggle("iu-tag--red", !last.ok); } } } updatePillDOM(); } function toast(message) { const root = document.getElementById(APP_ID); if (!root) return; root.querySelector(".iu-toast")?.remove(); if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; } const node = document.createElement("div"); node.className = "iu-toast"; node.setAttribute("role", "status"); node.setAttribute("aria-live", "polite"); node.textContent = message; root.appendChild(node); toastTimer = setTimeout(() => { node.remove(); toastTimer = null; }, 3500); } function clamp(value, min, max) { return Math.min(Math.max(value, min), max); } function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); } function escapeAttr(value) { return escapeHTML(value); } const CSS = `
#${APP_ID}, #${APP_ID} * { box-sizing: border-box; margin: 0; padding: 0; }
#${APP_ID} {
  --iu-bg: #141219;
  --iu-bg-2: #1e1926;
  --iu-bg-3: #2a2336;
  --iu-line: rgba(255, 255, 255, 0.08);
  --iu-line-strong: rgba(255, 255, 255, 0.16);
  --iu-text: #f7f5fa;
  --iu-muted: #a39baa;
  --iu-accent: #a855f7;
  --iu-accent-2: #c084fc;
  --iu-gradient: linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%);
  --iu-danger: #e11d48;
  --iu-danger-text: #fb7185;
  --iu-success: #10b981;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483647;
  color: var(--iu-text);
  color-scheme: dark;
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
#${APP_ID} > * { pointer-events: auto; }
#${APP_ID} button, #${APP_ID} input, #${APP_ID} a { font: inherit; color: inherit; }
#${APP_ID} a { text-decoration: none; }
#${APP_ID} button { cursor: pointer; }
#${APP_ID} [hidden] { display: none !important; }

#${APP_ID} .iu-list, #${APP_ID} .iu-form, #${APP_ID} .iu-welcome {
  scrollbar-width: thin;
  scrollbar-color: var(--iu-line-strong) transparent;
}
#${APP_ID} .iu-list::-webkit-scrollbar, #${APP_ID} .iu-form::-webkit-scrollbar, #${APP_ID} .iu-welcome::-webkit-scrollbar {
  width: 6px;
}
#${APP_ID} .iu-list::-webkit-scrollbar-track, #${APP_ID} .iu-form::-webkit-scrollbar-track, #${APP_ID} .iu-welcome::-webkit-scrollbar-track {
  background: transparent;
}
#${APP_ID} .iu-list::-webkit-scrollbar-thumb, #${APP_ID} .iu-form::-webkit-scrollbar-thumb, #${APP_ID} .iu-welcome::-webkit-scrollbar-thumb {
  background: var(--iu-line-strong);
  border-radius: 3px;
}

#${APP_ID} :focus-visible { outline: 2px solid var(--iu-accent); outline-offset: 2px; }

#${APP_ID} .iu-panel {
  position: fixed !important;
  inset: 0 !important;
  margin: auto !important;
  width: 780px !important;
  max-width: calc(100vw - 32px) !important;
  height: 580px !important;
  max-height: calc(100vh - 32px) !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 230px !important;
  grid-template-rows: 56px minmax(0, 1fr) !important;
  background: var(--iu-bg) !important;
  border: 1px solid var(--iu-line-strong) !important;
  border-radius: 16px !important;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3) !important;
  overflow: hidden !important;
  animation: iu-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

#${APP_ID} .iu-sidebar { display: none !important; }

#${APP_ID} .iu-header {
  grid-column: 1 / 3 !important;
  grid-row: 1 !important;
  height: 56px !important;
  padding: 0 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  border-bottom: 1px solid var(--iu-line) !important;
  background: var(--iu-bg) !important;
  cursor: grab;
  user-select: none;
}
#${APP_ID} .iu-header.iu-dragging { cursor: grabbing; }
#${APP_ID} .iu-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
#${APP_ID} .iu-brand-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--iu-gradient); flex-shrink: 0; }
#${APP_ID} .iu-brand-text { min-width: 0; }
#${APP_ID} .iu-brand-text strong { display: block; font-size: 14px; font-weight: 700; color: var(--iu-text); }
#${APP_ID} .iu-brand-text span { display: block; font-size: 11px; color: var(--iu-muted); }
#${APP_ID} .iu-header-actions { display: flex; gap: 6px; flex-shrink: 0; }
#${APP_ID} .iu-header-actions button {
  width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid var(--iu-line); background: var(--iu-bg-2); border-radius: 8px; color: var(--iu-muted); transition: all 0.15s; font-size: 11px; font-weight: 600;
}
#${APP_ID} .iu-header-actions button:hover { background: var(--iu-bg-3); color: var(--iu-text); border-color: var(--iu-line-strong); }
#${APP_ID} .iu-header-actions svg { display: block; }

#${APP_ID} .iu-body {
  grid-column: 1 !important;
  grid-row: 2 !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  background: var(--iu-bg) !important;
}

#${APP_ID} .iu-inspector {
  grid-column: 2 !important;
  grid-row: 2 !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 16px 14px !important;
  background: var(--iu-bg-2) !important;
  border-left: 1px solid var(--iu-line) !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  gap: 12px !important;
}
#${APP_ID} .iu-inspector-tabs {
  display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--iu-muted);
}
#${APP_ID} .iu-inspector-tabs strong {
  font-size: 12px; color: var(--iu-text); font-weight: 600;
}
#${APP_ID} .iu-gauge {
  width: 110px; height: 110px; margin: 4px auto; flex: none; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(20,18,24,0.5) 70%); border: 2px solid var(--iu-accent); box-shadow: 0 0 16px rgba(168, 85, 247, 0.2);
}
#${APP_ID} .iu-gauge-text {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px;
}
#${APP_ID} .iu-gauge-text strong {
  font-size: 30px; font-weight: 700; color: #ffffff; line-height: 1; letter-spacing: -1px;
}
#${APP_ID} .iu-gauge-text span {
  font-size: 10px; color: var(--iu-muted); font-weight: 500;
}
#${APP_ID} .iu-inspector-info {
  display: flex; flex-direction: column; gap: 4px; padding-top: 8px; border-top: 1px solid var(--iu-line);
}
#${APP_ID} .iu-inspector-info label {
  font-size: 10px; font-weight: 600; color: var(--iu-muted); text-transform: uppercase; letter-spacing: 0.5px;
}
#${APP_ID} .iu-inspector-value {
  font-size: 11px; padding: 6px 10px; border: 1px solid var(--iu-line); border-radius: 8px; color: var(--iu-text); background: var(--iu-bg-3);
}
#${APP_ID} .iu-inspector-row {
  display: flex; justify-content: space-between; gap: 6px; font-size: 10px; padding: 5px 0; border-bottom: 1px solid var(--iu-line); color: var(--iu-muted);
}
#${APP_ID} .iu-inspector-row strong {
  font-weight: 600; color: var(--iu-text);
}
#${APP_ID} .iu-inspector-primary {
  margin-top: auto !important;
  background: var(--iu-gradient) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 10px !important;
  padding: 10px 14px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  box-shadow: 0 4px 14px rgba(168, 85, 247, 0.3) !important;
  transition: opacity 0.15s, transform 0.15s !important;
  min-height: 38px !important;
}
#${APP_ID} .iu-inspector-primary:hover:not(:disabled) {
  opacity: 0.92 !important;
  transform: translateY(-1px) !important;
}
#${APP_ID} .iu-inspector-primary:disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}
#${APP_ID} .iu-inspector-secondary {
  display: flex; gap: 6px;
}
#${APP_ID} .iu-inspector-secondary button {
  flex: 1; background: var(--iu-bg-3); border: 1px solid var(--iu-line); color: var(--iu-muted); padding: 7px; border-radius: 8px; font-size: 10px; font-weight: 500; cursor: pointer;
}
#${APP_ID} .iu-inspector-secondary button:hover {
  background: var(--iu-bg); color: var(--iu-text);
}

#${APP_ID} .iu-welcome {
  padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; min-height: 0; overflow-y: auto;
}
#${APP_ID} .iu-welcome-top {
  display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--iu-muted);
}
#${APP_ID} .iu-welcome-top small {
  padding: 2px 8px; border-radius: 999px; background: var(--iu-bg-2); border: 1px solid var(--iu-line); font-size: 10px; color: var(--iu-muted);
}
#${APP_ID} .iu-welcome-icon {
  width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; background: rgba(168, 85, 247, 0.12); color: var(--iu-accent); margin: 0 auto;
}
#${APP_ID} .iu-welcome-icon--error { background: rgba(225, 29, 72, 0.12); color: var(--iu-danger-text); }
#${APP_ID} .iu-welcome h2 {
  font-size: 18px; font-weight: 700; color: var(--iu-text); letter-spacing: -0.4px;
}
#${APP_ID} .iu-welcome p {
  font-size: 12px; color: var(--iu-muted); line-height: 1.5;
}
#${APP_ID} .iu-welcome-actions {
  display: flex; gap: 8px; margin-top: 4px;
}
#${APP_ID} .iu-stats {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 4px 0 6px;
}
#${APP_ID} .iu-stats > div {
  background: var(--iu-bg-2); border: 1px solid var(--iu-line); border-radius: 10px; padding: 10px 12px;
}
#${APP_ID} .iu-stats small {
  font-size: 10px; font-weight: 600; color: var(--iu-muted); text-transform: uppercase; letter-spacing: 0.5px;
}
#${APP_ID} .iu-stats strong {
  display: block; font-size: 20px; font-weight: 700; color: var(--iu-text); margin-top: 3px;
}
#${APP_ID} .iu-scope {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; border: none; margin: 0; padding: 0;
}
#${APP_ID} .iu-scope legend {
  font-size: 10px; font-weight: 600; color: var(--iu-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
}
#${APP_ID} .iu-scope-card {
  display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; background: var(--iu-bg-2); border: 1px solid var(--iu-line); border-radius: 10px; cursor: pointer; transition: all 0.15s;
}
#${APP_ID} .iu-scope-card:hover {
  background: var(--iu-bg-3); border-color: var(--iu-line-strong);
}
#${APP_ID} .iu-scope-card.is-active {
  background: rgba(168, 85, 247, 0.08); border-color: var(--iu-accent); box-shadow: inset 0 0 0 1px var(--iu-accent);
}
#${APP_ID} .iu-scope-card strong {
  display: block; font-size: 12px; font-weight: 600; color: var(--iu-text);
}
#${APP_ID} .iu-scope-card small {
  display: block; font-size: 10px; color: var(--iu-muted); margin-top: 2px; line-height: 1.35;
}
#${APP_ID} .iu-scope-card input {
  accent-color: var(--iu-accent); margin-top: 2px;
}

#${APP_ID} .iu-results {
  flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow: hidden;
}
#${APP_ID} .iu-results-summary {
  display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 6px; font-size: 12px; color: var(--iu-muted);
}
#${APP_ID} .iu-results-summary span {
  font-weight: 600; color: var(--iu-text);
}
#${APP_ID} .iu-new-scan {
  font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: var(--iu-bg-2); border: 1px solid var(--iu-line); color: var(--iu-accent-2); cursor: pointer; transition: all 0.15s;
}
#${APP_ID} .iu-new-scan:hover {
  background: var(--iu-bg-3); border-color: var(--iu-accent);
}
#${APP_ID} .iu-search-row {
  padding: 6px 16px;
}
#${APP_ID} .iu-search {
  width: 100%; height: 34px; padding: 0 12px; border: 1px solid var(--iu-line); border-radius: 8px; background: var(--iu-bg-2); color: var(--iu-text); font-size: 12px; transition: all 0.15s;
}
#${APP_ID} .iu-search:focus {
  border-color: var(--iu-accent); background: var(--iu-bg-3); outline: none; box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
}
#${APP_ID} .iu-list {
  flex: 1 1 auto; min-height: 100px; overflow-y: auto; overscroll-behavior: contain; border-top: 1px solid var(--iu-line); border-bottom: 1px solid var(--iu-line);
}
#${APP_ID} .iu-list-empty {
  padding: 30px 20px; text-align: center; color: var(--iu-muted); font-size: 13px;
}
#${APP_ID} .iu-row {
  display: grid; grid-template-columns: 18px 32px minmax(0, 1fr) auto; gap: 10px; padding: 8px 16px; align-items: center; cursor: pointer; border-bottom: 1px solid var(--iu-line); transition: background 0.1s;
}
#${APP_ID} .iu-row:hover { background: var(--iu-bg-2); }
#${APP_ID} .iu-row--selected { background: rgba(168, 85, 247, 0.12); box-shadow: inset 3px 0 0 var(--iu-accent); }
#${APP_ID} .iu-row--selected:hover { background: rgba(168, 85, 247, 0.18); }
#${APP_ID} .iu-row-check { width: 15px; height: 15px; accent-color: var(--iu-accent); cursor: pointer; }
#${APP_ID} .iu-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: var(--iu-bg-3); }
#${APP_ID} .iu-row-text { min-width: 0; }
#${APP_ID} .iu-row-name { font-size: 12px; font-weight: 600; color: var(--iu-text); display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${APP_ID} .iu-row-name a { color: var(--iu-text); text-decoration: none; }
#${APP_ID} .iu-row-name a:hover { color: var(--iu-accent-2); }
#${APP_ID} .iu-row-sub { font-size: 11px; color: var(--iu-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#${APP_ID} .iu-row-actions { display: flex; gap: 4px; align-items: center; }
#${APP_ID} .iu-icon-btn {
  display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 6px; border: none; background: transparent; color: var(--iu-muted); transition: all 0.15s;
}
#${APP_ID} .iu-icon-btn:hover { background: var(--iu-bg-3); color: var(--iu-text); }
#${APP_ID} .iu-tag {
  display: inline-flex; align-items: center; flex-shrink: 0; padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: 600; background: var(--iu-bg-3); color: var(--iu-muted);
}
#${APP_ID} .iu-tag--blue { background: rgba(168, 85, 247, 0.15); color: var(--iu-accent-2); }
#${APP_ID} .iu-tag--green { background: rgba(16, 185, 129, 0.15); color: var(--iu-success); }
#${APP_ID} .iu-tag--red { background: rgba(225, 29, 72, 0.15); color: var(--iu-danger-text); }

#${APP_ID} .iu-actionbar {
  flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 16px; background: var(--iu-bg-2); border-top: 1px solid var(--iu-line);
}
#${APP_ID} .iu-actionbar-left, #${APP_ID} .iu-actionbar-right { display: flex; align-items: center; gap: 8px; }

#${APP_ID} .iu-progress {
  padding: 24px; display: flex; flex-direction: column; gap: 14px;
}
#${APP_ID} .iu-progress-head h2 { font-size: 16px; font-weight: 600; color: var(--iu-text); }
#${APP_ID} .iu-progress-head p { font-size: 12px; color: var(--iu-muted); margin-top: 2px; }
#${APP_ID} .iu-bar { height: 6px; border-radius: 3px; background: rgba(255, 255, 255, 0.1); overflow: hidden; }
#${APP_ID} .iu-bar > span { display: block; height: 100%; background: var(--iu-gradient); transition: width 0.3s ease; }
#${APP_ID} .iu-progress-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--iu-muted); }
#${APP_ID} .iu-current { display: flex; align-items: center; gap: 8px; padding: 10px; background: var(--iu-bg-2); border-radius: 8px; font-size: 12px; }
#${APP_ID} .iu-current strong { color: var(--iu-text); }
#${APP_ID} .iu-blocked { padding: 10px; border-radius: 8px; font-size: 12px; color: var(--iu-danger-text); background: rgba(225, 29, 72, 0.12); border: 1px solid rgba(225, 29, 72, 0.3); }
#${APP_ID} .iu-progress-actions { display: flex; gap: 8px; }

#${APP_ID} .iu-notice {
  margin: 8px 16px; padding: 10px 12px; border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; background: rgba(245, 158, 11, 0.08); font-size: 12px;
}
#${APP_ID} .iu-notice strong { display: block; margin-bottom: 2px; color: #fbbf24; font-weight: 600; }
#${APP_ID} .iu-notice p { margin: 0; color: var(--iu-muted); font-size: 11px; line-height: 1.4; }
#${APP_ID} .iu-notice-actions { display: flex; gap: 6px; margin-top: 8px; }

#${APP_ID} .iu-btn {
  border: 1px solid var(--iu-line); background: var(--iu-bg-2); color: var(--iu-text); padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s;
}
#${APP_ID} .iu-btn:hover:not(:disabled) { background: var(--iu-bg-3); border-color: var(--iu-line-strong); }
#${APP_ID} .iu-btn:disabled { opacity: 0.4; cursor: not-allowed; }
#${APP_ID} .iu-btn--primary { background: var(--iu-accent); border-color: var(--iu-accent); color: #ffffff; }
#${APP_ID} .iu-btn--primary:hover:not(:disabled) { background: var(--iu-accent-2); border-color: var(--iu-accent-2); }
#${APP_ID} .iu-btn--danger { background: var(--iu-danger); border-color: var(--iu-danger); color: #ffffff; }
#${APP_ID} .iu-btn--danger:hover:not(:disabled) { background: #be123c; border-color: #be123c; }
#${APP_ID} .iu-btn--ghost { background: transparent; }
#${APP_ID} .iu-btn--lg { padding: 9px 18px; font-size: 13px; font-weight: 600; }
#${APP_ID} .iu-btn--small { padding: 5px 9px; font-size: 11px; }

#${APP_ID} .iu-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65); display: grid; place-items: center; padding: 16px; z-index: 2147483647; backdrop-filter: blur(2px);
}
#${APP_ID} .iu-dialog {
  width: 100%; max-width: 380px; max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px); min-height: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--iu-bg); border: 1px solid var(--iu-line-strong); border-radius: 14px; padding: 18px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); animation: iu-pop 0.18s ease-out;
}
#${APP_ID} .iu-dialog-content { min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
#${APP_ID} .iu-dialog > h3, #${APP_ID} .iu-dialog-actions { flex-shrink: 0; }
#${APP_ID} .iu-operation-preview { font-size: 12px; }
#${APP_ID} .iu-operation-preview dl { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 4px 12px; margin-bottom: 12px; }
#${APP_ID} .iu-operation-preview dd { margin: 0; }
#${APP_ID} .iu-final-review { max-height: 160px; max-height: min(160px,30dvh); overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; border: 1px solid var(--iu-line); border-radius: 8px; padding: 8px; overflow-wrap: anywhere; }
#${APP_ID} .iu-dialog h3 { color: var(--iu-text); margin: 0 0 8px; font-size: 15px; font-weight: 600; }
#${APP_ID} .iu-dialog p { margin: 0 0 12px; color: var(--iu-muted); font-size: 12px; line-height: 1.45; }
#${APP_ID} .iu-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
#${APP_ID} .iu-dialog-actions [data-extra] { margin-right: auto; }
#${APP_ID} .iu-form { display: grid; gap: 8px; max-height: 50vh; overflow-y: auto; padding-right: 4px; }
#${APP_ID} .iu-field { display: grid; grid-template-columns: 1fr 110px; align-items: center; gap: 10px; font-size: 12px; color: var(--iu-muted); }
#${APP_ID} .iu-field input { height: 32px; padding: 0 10px; border: 1px solid var(--iu-line); border-radius: 6px; background: var(--iu-bg-2); color: var(--iu-text); }
#${APP_ID} .iu-field input:focus { border-color: var(--iu-accent); }

#${APP_ID} .iu-toast {
  position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); padding: 8px 16px; background: var(--iu-bg-3); border: 1px solid var(--iu-line-strong); border-radius: 999px; font-size: 12px; color: var(--iu-text); box-shadow: 0 6px 20px rgba(0,0,0,0.4); z-index: 2147483647; animation: iu-pop 0.18s ease-out;
}
#${APP_ID} .iu-pill {
  position: fixed; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--iu-bg); border: 1px solid var(--iu-line-strong); color: var(--iu-text); border-radius: 999px; box-shadow: 0 12px 30px rgba(0,0,0,0.5); font-size: 12px; font-weight: 500; cursor: pointer; z-index: 2147483647;
}
#${APP_ID} .iu-pill:hover { background: var(--iu-bg-2); }
#${APP_ID} .iu-pill-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--iu-muted); }
#${APP_ID} .iu-pill-dot--active { background: var(--iu-accent); animation: iu-pulse 1.4s infinite; }
#${APP_ID} .iu-pill-dot--error { background: var(--iu-danger-text); }
@keyframes iu-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes iu-pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

@media (max-width: 768px) {
  #${APP_ID} .iu-panel {
    inset: 8px !important; margin: 0 !important; width: calc(100vw - 16px) !important; height: calc(100vh - 16px) !important; display: flex !important; flex-direction: column !important; border-radius: 14px !important;
  }
  #${APP_ID} .iu-sidebar { display: none !important; }
  #${APP_ID} .iu-inspector { display: none !important; }
  #${APP_ID} .iu-body { flex: 1 1 auto !important; min-height: 0 !important; }
  #${APP_ID} .iu-scope { grid-template-columns: 1fr !important; }
}

@media (prefers-reduced-motion: reduce) {
  #${APP_ID} *, #${APP_ID} *::before, #${APP_ID} *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important;
  }
}

`; if (globalThis.__IU_TEST__) { globalThis.__IU_TEST__({ responseTransportDiagnostics, transitionOperation, addFollowBackStatus, evaluateUnfollowResponse, responseDiagnostics, pruneSelectionToDisplayed, fetchFriendshipList, friendshipListUrl, igFetch, createCheckpoint, loadCheckpoint, loadTimings, waitBeforeNextScanPage, startScan, showResults, renderResultsView, getDisplayUsers, startUnfollow, unmount, state, interruptibleSleep, sleepWithCountdown, unfollowUser, normalizeUser, isDefaultAvatar, parseRetryAfter, I18N, t }); return; } cleanupExisting(); injectStyles(); mount(); })();
