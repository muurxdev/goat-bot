/**
 * Testes dos helpers puros do resolvedor Pinterest via Chromium.
 * (A navegação real precisa de Chromium — verificada na VPS.)
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const pb = require('../src/services/media/providers/pinterestBrowser')

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}
async function testAsync(name, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

async function main() {
    console.log('🧪 Testes do resolvedor Pinterest (Chromium) — helpers...\n')

    test('pickBestVideo escolhe a maior resolução', () => {
        const urls = [
            'https://v.pinimg.com/videos/mc/720p/a/x.mp4',
            'https://v.pinimg.com/videos/mc/1080p/a/x.mp4',
            'https://v.pinimg.com/videos/mc/480p/a/x.mp4'
        ]
        assert.strictEqual(pb.pickBestVideo(urls), 'https://v.pinimg.com/videos/mc/1080p/a/x.mp4')
    })

    test('pickBestVideo ignora HLS (.m3u8)', () => {
        assert.strictEqual(pb.pickBestVideo(['https://x/a.m3u8']), null)
    })

    test('pickBestVideo retorna null sem vídeos', () => {
        assert.strictEqual(pb.pickBestVideo([]), null)
    })

    test('parseNetscapeCookies extrai campos corretos', () => {
        const line = '.pinterest.com\tTRUE\t/\tTRUE\t9999999999\tsessid\tABC123'
        const [c] = pb.parseNetscapeCookies(line)
        assert.strictEqual(c.name, 'sessid')
        assert.strictEqual(c.value, 'ABC123')
        assert.strictEqual(c.domain, '.pinterest.com')
        assert.strictEqual(c.secure, true)
    })

    test('parseNetscapeCookies ignora comentários e linhas inválidas', () => {
        const content = '# comentário\n\nlinha-invalida\n.pinterest.com\tTRUE\t/\tFALSE\t0\tk\tv'
        const cookies = pb.parseNetscapeCookies(content)
        assert.strictEqual(cookies.length, 1)
        assert.strictEqual(cookies[0].name, 'k')
    })

    await testAsync('resolvePinterestMedia falha graciosamente sem Chromium (BROWSER_UNAVAILABLE)', async () => {
        process.env.CHROMIUM_PATH = '/caminho/inexistente/chromium'
        delete process.env.PUPPETEER_EXECUTABLE_PATH
        let code = null
        try { await pb.resolvePinterestMedia('https://pinterest.com/pin/1/') }
        catch (e) { code = e.code }
        assert.strictEqual(code, 'BROWSER_UNAVAILABLE')
    })

    console.log('\n========================================')
    console.log('📊 RESULTADO — Pinterest Chromium (helpers):')
    console.log('   ✅ Passaram: ' + pass)
    console.log('   ❌ Falharam: ' + fail)
    console.log('========================================')
    if (fail > 0) process.exit(1)
}

main()
