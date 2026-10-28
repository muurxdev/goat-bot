/**
 * Testes da teoria musical (services/musicService).
 *
 * O que precisa continuar verdadeiro:
 *  - Transposição preserva sufixo do acorde e baixo invertido.
 *  - A grafia da saída segue a ARMADURA do tom de destino, não o índice
 *    cromático: em Fá se escreve Bb, nunca A#. Isto já quebrou uma vez —
 *    descer "G D Em C" um tom devolvia "F C Dm A#".
 *  - Campo harmônico e círculo das quintas batem com os valores conhecidos.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const M = require('../src/services/musicService')

let pass = 0, fail = 0
function test(nome, fn) {
    try { fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes de teoria musical...\n')

test('transposição preserva sufixo e baixo invertido', () => {
    const r = M.transpor('C Am F G7 C/E', 2)
    assert.deepStrictEqual(r.transposta, ['D', 'Bm', 'G', 'A7', 'D/F#'])
})

test('grafia segue a armadura do tom de destino', () => {
    const casos = [
        ['G D Em C', -2, ['F', 'C', 'Dm', 'Bb']],   // destino Fá: bemol
        ['E A B', 1, ['F', 'Bb', 'C']],             // destino Fá: bemol
        ['C Am F G', -1, ['B', 'G#m', 'E', 'F#']],  // destino Si: sustenido
        ['Am F C G', 3, ['Cm', 'Ab', 'Eb', 'Bb']]   // destino Dó menor: bemol
    ]
    for (const [cifra, passo, esperado] of casos) {
        const r = M.transpor(cifra, passo)
        assert.deepStrictEqual(r.transposta, esperado,
            `"${cifra}" ${passo} deu ${r.transposta.join(' ')}, esperado ${esperado.join(' ')}`)
    }
})

test('transpor por 12 semitons devolve a mesma cifra', () => {
    const r = M.transpor('C Am F G', 12)
    assert.deepStrictEqual(r.transposta, ['C', 'Am', 'F', 'G'])
})

test('transposição de ida e volta é reversível', () => {
    const ida = M.transpor('D A Bm G', 5)
    const volta = M.transpor(ida.transposta.join(' '), -5)
    assert.deepStrictEqual(volta.transposta, ['D', 'A', 'Bm', 'G'])
})

test('campo harmônico maior bate com os valores conhecidos', () => {
    const esperado = {
        C: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bm(b5)'],
        F: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Em(b5)'],
        G: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#m(b5)']
    }
    for (const [tom, acordes] of Object.entries(esperado)) {
        const r = M.campoHarmonico(tom)
        assert.deepStrictEqual(r.graus.map(g => g.acorde), acordes, `campo de ${tom}`)
    }
})

test('círculo das quintas anda de quinta em quinta', () => {
    const r = M.circuloQuintas('C')
    assert.deepStrictEqual(r.horario, ['G', 'D', 'A', 'E'])
    assert.deepStrictEqual(r.antihorario, ['F', 'Bb', 'Eb', 'Ab'])
})

test('nota inválida não derruba a transposição', () => {
    const r = M.transpor('C H% Am', 2)
    assert.strictEqual(r.transposta[0], 'D')
    assert.strictEqual(r.transposta[1], 'H%', 'token irreconhecível deve passar intacto')
    assert.strictEqual(r.transposta[2], 'Bm')
})

test('entradas inválidas devolvem null em vez de quebrar', () => {
    assert.strictEqual(M.transpor('C Am', 'abc'), null)
    assert.strictEqual(M.campoHarmonico('X'), null)
    assert.strictEqual(M.circuloQuintas(''), null)
})

console.log('\n========================================')
console.log(`📊 RESULTADO — Música: ${pass} passaram, ${fail} falharam`)
console.log('========================================\n')
process.exit(fail > 0 ? 1 : 0)
