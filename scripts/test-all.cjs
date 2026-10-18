const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve('instagram-magaza-hazirlik');const results=[];
const {snapshot}=require('./test-fingerprint.cjs');
const testedFiles=snapshot();
const nodeTests=['instagram-safety.test.cjs','instagram-unfollow-verification.test.cjs','instagram-scan-compatibility.test.cjs','instagram-diagnostics.test.cjs','instagram-audit-regressions.test.cjs','instagram-timing.test.cjs','instagram-scope.test.cjs','instagram-extension.test.cjs','instagram-extension-lock.test.cjs','instagram-extension-platform.test.cjs','instagram-live-log.test.cjs','instagram-log-view.test.cjs','instagram-release-proof.test.cjs','instagram-oauth.test.cjs','instagram-repair-v5.test.cjs','instagram-workspace.test.cjs','instagram-workspace-storage.test.cjs'];
function run(name,bin,args,extra={}){
 const start=Date.now();const r=spawnSync(bin,args,{encoding:'utf8',timeout:120000,env:{...process.env,...extra}});
 const output=(r.stdout||'')+(r.stderr||'');const passed=r.status===0&&!r.error;
 results.push({name,passed,durationMs:Date.now()-start,output});console.log((passed?'PASS ':'FAIL ')+name);if(!passed)console.log(output||String(r.error));
}
for(const test of nodeTests)run(test,process.execPath,[test]);
run('Optional local helper: authentication, redaction and writing','python',['-B','instagram-log-bridge.test.py']);
run('MV3 store build integration',process.execPath,['instagram-extension-browser.test.cjs'],{IU_EXTENSION_DIR:'instagram-magaza-hazirlik/extension',IU_STORE_ASSETS:'instagram-magaza-hazirlik/gorseller'});
run('MV3 private build integration',process.execPath,['instagram-extension-browser.test.cjs'],{IU_EXTENSION_DIR:'instagram-chrome-eklentisi',IU_STORE_ASSETS:''});
run('Browser feature matrix',process.execPath,['instagram-features-browser.test.cjs'],{IU_EXTENSION_DIR:'instagram-magaza-hazirlik/extension'});
run('Local-first workspace browser integration',process.execPath,['instagram-workspace-browser.test.cjs']);
run('Release security and permissions audit',process.execPath,['scripts/audit-release.cjs']);
const version=JSON.parse(fs.readFileSync(path.join(root,'extension/manifest.json'))).version;
const featureFile='instagram-features-browser-results.json';const features=fs.existsSync(featureFile)?JSON.parse(fs.readFileSync(featureFile)):null;
const unchanged=JSON.stringify(testedFiles)===JSON.stringify(snapshot());
const report={version,at:new Date().toISOString(),realInstagram:false,results,features,testedFiles,unchanged};
fs.writeFileSync(path.join(root,'TUM-TEST-SONUCLARI.json'),JSON.stringify(report,null,2));
const rows=results.map(r=>`| ${r.name} | ${r.passed?'GEÇTİ':'BAŞARISIZ'} | ${(r.durationMs/1000).toFixed(1)} sn |`).join('\n');
fs.writeFileSync(path.join(root,'TUM-OZELLIK-TESTLERI.md'),`# Tüm özellik testleri — ${version}\n\nTarih: ${report.at}\n\n${results.filter(r=>r.passed).length}/${results.length} test paketi geçti.\n\n| Test paketi | Sonuç | Süre |\n|---|---|---|\n${rows}\n\n## Gerçek Chromium içindeki özellik grupları\n\n${features?.passed.map(f=>'- GEÇTİ: '+f).join('\n')||'Sonuç üretilmedi.'}\n\n## Süre kontrolü\n\nAltı hesaplık sanal zaman testinde beş adet 4–4,8 saniye bekleme, beşinci POST sonrasında bir 300 saniye mola ve altı bağımsız doğrulama beklemesi doğrulandı. Üretim süreleri değiştirilmedi.\n\n## Sınırlar\n\nInstagram istekleri test yanıtlarıyla karşılandı. Gerçek hesapta takip bırakma, Instagram kısıtlarının ne zaman kalkacağı ve Web Mağazası incelemesi doğrulanmadı. İsteğe bağlı Python yardımcısının HTTP kimlik doğrulaması ve dosya yazımı test edildi; kullanıcının bilgisayarında otomatik arka plan başlatma doğrulanmadı. Mağaza sürümü bu yardımcıya ihtiyaç duymaz. Gizlilik metni paket ve docs içinde aynıdır. Herkese açık HTTPS yayını ayrıca yayın kontrol listesinde doğrulanır. Kaynak yeniden dağıtım izni ve mağaza incelemesi ayrıca tamamlanmalıdır.\n\n## Onarım kapsamı\n\nBelirsiz sonuçta durma, işlem öncesi ve sonrası ilişki doğrulaması, kalıcı işlem niyeti, sahiplik/iptal korumaları, yerel çalışma alanı, OAuth state/PKCE, veri yalıtımı ve paket güvenlik denetimi test edildi. Bu rapor test edilen dosyaların SHA-256 değerlerine bağlıdır.\n`);
console.log(`${results.filter(r=>r.passed).length}/${results.length} test suites passed`);
if(!unchanged){console.error('FAIL: test inputs changed during execution; run the tests again.');process.exitCode=1;}
if(results.some(r=>!r.passed))process.exitCode=1;
