/**
 * tests/education-expanded.test.js
 * Testes unitários das novas engines da Fase 4 de Educação e Ciências:
 * Tabela Periódica, Atlas Geográfico, Dev Cheatsheets e Solvers Matemáticos.
 */

process.env.NODE_ENV = 'test'
process.env.STRICT_COMMANDS = '1'

const assert = require('assert')
const educationService = require('../src/services/educationService')

let pass = 0, fail = 0
function test(name, fn) {
    try {
        fn()
        console.log(`  ✅ PASS: ${name}`)
        pass++
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n     ${e.message}`)
        fail++
    }
}

console.log('🧪 Testando Engines de Educação & Ciências (Fase 4)...\n')

// 1. Tabela Periódica
console.log('--- 1. Tabela Periódica & Química ---')
test('PERIODIC_TABLE possui elementos fundamentais catalogados', () => {
    assert.ok(educationService.PERIODIC_TABLE['H'])
    assert.strictEqual(educationService.PERIODIC_TABLE['H'].num, 1)
    assert.strictEqual(educationService.PERIODIC_TABLE['O'].num, 8)
    assert.strictEqual(educationService.PERIODIC_TABLE['AU'].name, 'Ouro')
})

// 2. Atlas Geográfico
console.log('\n--- 2. Atlas Geográfico & Países ---')
test('COUNTRIES_DATA retorna dados de nações com capitais e moedas', () => {
    const br = educationService.COUNTRIES_DATA['brasil']
    assert.ok(br)
    assert.strictEqual(br.capital, 'Brasília')
    assert.strictEqual(br.continent, 'América do Sul')

    const jp = educationService.COUNTRIES_DATA['japao']
    assert.ok(jp)
    assert.strictEqual(jp.capital, 'Tóquio')
})

// 3. Dev Cheatsheets
console.log('\n--- 3. Dev Hub & Cheatsheets ---')
test('DEV_CHEATSHEETS contém linguagens com dicas de engenharia', () => {
    const js = educationService.DEV_CHEATSHEETS['javascript']
    assert.ok(js)
    assert.ok(js.sample.includes('async function'))

    const py = educationService.DEV_CHEATSHEETS['python']
    assert.ok(py)
    assert.ok(py.sample.includes('def soma'))
})

// 4. Solvers Matemáticos
console.log('\n--- 4. Solvers de Matemática ---')
test('resolverBhaskara calcula raízes reais corretamente', () => {
    // x² - 5x + 6 = 0 -> raízes 3 e 2
    const res = educationService.resolverBhaskara(1, -5, 6)
    assert.strictEqual(res.delta, 1)
    assert.strictEqual(res.x1, 3)
    assert.strictEqual(res.x2, 2)
})

test('resolverBhaskara detecta delta negativo', () => {
    // x² + 1 = 0 -> delta = -4
    const res = educationService.resolverBhaskara(1, 0, 1)
    assert.strictEqual(res.delta, -4)
    assert.strictEqual(res.roots.length, 0)
})

test('calcularJurosCompostos calcula montante e juros com precisão', () => {
    // R$ 1000 a 10% a.m. por 2 meses = 1000 * 1.21 = 1210
    const res = educationService.calcularJurosCompostos(1000, 10, 2)
    assert.strictEqual(res.montante, 1210)
    assert.strictEqual(res.juros, 210)
})

console.log(`\n========================================`)
console.log(`📊 RESULTADO FASE 4: ✅ ${pass}  ❌ ${fail}`)
console.log(`========================================`)

if (fail > 0) process.exit(1)
