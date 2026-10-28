/**
 * Tamanho de arquivo exibido ao usuário.
 *
 * Regressão: um vídeo de 110 MB (como o WhatsApp mostra) aparecia como
 * "104.87 MB" no card do bot, porque a conta era 1024×1024 com rótulo "MB".
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const { formatarTamanho, emMb } = require('../src/utils/tamanho')
const { formatBytes } = require('../src/services/media/formatResolver')

let pass = 0, fail = 0
function test(nome, fn) {
    try { fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes de tamanho de arquivo...\n')

// Bytes reais do vídeo do caso: 104.87 MiB.
const VIDEO_DO_CASO = Math.round(104.87 * 1024 * 1024)

test('vídeo de 104,87 MiB aparece como 110,0 MB, igual ao WhatsApp', () => {
    assert.strictEqual(formatarTamanho(VIDEO_DO_CASO), '110,0 MB')
    assert.strictEqual(formatBytes(VIDEO_DO_CASO), '110,0 MB')
    assert.strictEqual(emMb(VIDEO_DO_CASO), '110,0')
})

test('livro de 61 MiB aparece como 64,0 MB', () => {
    assert.strictEqual(formatarTamanho(61 * 1024 * 1024), '64,0 MB')
})

test('faixas B / KB / MB / GB', () => {
    assert.strictEqual(formatarTamanho(999), '999 B')
    assert.strictEqual(formatarTamanho(1500), '1,5 KB')
    assert.strictEqual(formatarTamanho(5_000_000), '5,0 MB')
    assert.strictEqual(formatarTamanho(2_500_000_000), '2,50 GB')
})

test('valores inválidos não viram "NaN MB"', () => {
    assert.strictEqual(formatarTamanho(undefined), '')
    assert.strictEqual(formatarTamanho(-1), '')
    assert.strictEqual(formatBytes(0), null)
})

console.log('\n========================================')
console.log(`📊 RESULTADO — Tamanho: ${pass} passaram, ${fail} falharam`)
console.log('========================================\n')
process.exit(fail > 0 ? 1 : 0)
