#!/usr/bin/env node
/**
 * Chrome Web Store OAuth2 Refresh Token Yardımcısı
 * 
 * Bu betik, Google Cloud Console'dan aldığınız Client ID ve Client Secret ile
 * Chrome Web Store API için süresiz 'Refresh Token' elde etmenizi sağlar.
 * 
 * Kullanım:
 *   node scripts/cws-auth-helper.mjs
 * veya:
 *   node scripts/cws-auth-helper.mjs <CLIENT_ID> <CLIENT_SECRET>
 */

import http from 'node:http';
import { URL } from 'node:url';
import readline from 'node:readline';

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore';

async function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, answer => {
        rl.close();
        resolve(answer.trim());
    }));
}

async function main() {
    console.log('\n============================================================');
    console.log('🚀 Chrome Web Store API — OAuth2 Refresh Token Alıcı');
    console.log('============================================================\n');

    let clientId = process.argv[2] || process.env.CWS_CLIENT_ID;
    let clientSecret = process.argv[3] || process.env.CWS_CLIENT_SECRET;

    if (!clientId) {
        clientId = await prompt('🔑 Google OAuth Client ID girin: ');
    }
    if (!clientSecret) {
        clientSecret = await prompt('🔒 Google OAuth Client Secret girin: ');
    }

    if (!clientId || !clientSecret) {
        console.error('❌ Hata: Client ID ve Client Secret zorunludur!');
        process.exit(1);
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    console.log('\n🌐 Yerel dinleyici başlatılıyor: ' + REDIRECT_URI);
    console.log('\n👉 Lütfen tarayıcınızda şu adresi açıp Chrome Web Store hesabınızla giriş yapın:\n');
    console.log(authUrl.toString());
    console.log('\n⏳ Giriş yapıp izin verdikten sonra bu konsol otomatik olarak jetonu yakalayacaktır...\n');

    const server = http.createServer(async (req, res) => {
        const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
        if (reqUrl.pathname !== '/oauth2callback') {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Bulunamadı');
            return;
        }

        const code = reqUrl.searchParams.get('code');
        const error = reqUrl.searchParams.get('error');

        if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h2>❌ Hata: ${error}</h2><p>Yetkilendirme iptal edildi.</p>`);
            console.error('\n❌ Google yetkilendirme hatası:', error);
            server.close();
            process.exit(1);
        }

        if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h2>Kod bulunamadı</h2>');
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #10b981;">✅ Başarılı!</h1>
                <p>Google yetkilendirmesi tamamlandı. Terminale geri dönebilirsiniz.</p>
            </div>
        `);

        console.log('✅ Yetkilendirme kodu alındı! Token takas ediliyor...');

        try {
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI
                })
            });

            const tokenData = await tokenRes.json();

            if (tokenData.error) {
                console.error('\n❌ Token hatası:', tokenData.error_description || tokenData.error);
                server.close();
                process.exit(1);
            }

            console.log('\n============================================================');
            console.log('🎉 REFRESH TOKEN BAŞARIYLA ÜRETİLDİ!');
            console.log('============================================================');
            console.log('\nGitHub Repository > Settings > Secrets and variables > Actions bölümüne şu secret\'ları ekleyin:\n');
            console.log(`CWS_CLIENT_ID:      ${clientId}`);
            console.log(`CWS_CLIENT_SECRET:  ${clientSecret}`);
            console.log(`CWS_REFRESH_TOKEN:  ${tokenData.refresh_token}`);
            console.log('\n------------------------------------------------------------');
            console.log('💡 Not: Ayrıca Developer Dashboard\'dan alacağınız şu iki değeri de ekleyin:');
            console.log('CWS_EXTENSION_ID:  (Mağazaya elle ilk taslak yüklendiğinde oluşan 32 karakterlik ID)');
            console.log('CWS_PUBLISHER_ID:  (Geliştirici Paneli > Hesap Ayarları > Yayıncı Kimliği)');
            console.log('============================================================\n');

        } catch (err) {
            console.error('\n❌ Token takas hatası:', err.message);
        } finally {
            server.close();
        }
    });

    server.listen(PORT);
}

main().catch(err => {
    console.error('Beklenmeyen hata:', err);
    process.exit(1);
});
