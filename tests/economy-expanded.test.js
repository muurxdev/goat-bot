/**
 * tests/economy-expanded.test.js
 * Testes unitários e de integração das novas engines da Fase 2 de Economia:
 * Bolsa de Valores, Empresas, Imobiliária, Banco e Blackjack.
 */

process.env.NODE_ENV = 'test'
process.env.STRICT_COMMANDS = '1'

const assert = require('assert')
const stockMarketService = require('../src/services/stockMarketService')
const companyService = require('../src/services/companyService')
const realEstateService = require('../src/services/realEstateService')
const bankingService = require('../src/services/bankingService')
const blackjackService = require('../src/services/blackjackService')
const dataService = require('../src/services/dataService')

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

console.log('🧪 Testando Engines Expandidas de Economia (Fase 2)...\n')

const testUser = `551199999${Date.now()}@s.whatsapp.net`
const user = dataService.initializeUser(testUser)
user.coins = 500000 // Inicia com saldo suficiente para testes
dataService.saveUser(user)

// 1. Bolsa de Valores
console.log('--- 1. Bolsa de Valores & Tickers ---')
test('getQuote retorna cotação válida e determinística', () => {
    const q = stockMarketService.getQuote('MELI3')
    assert.ok(q)
    assert.strictEqual(q.code, 'MELI3')
    assert.ok(q.price > 0)
    assert.ok(typeof q.variation === 'number')
})

test('buyStock debita moedas e adiciona ao portfólio', () => {
    const res = stockMarketService.buyStock(testUser, 'MELI3', 10)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.shares, 10)
    
    const pf = stockMarketService.getPortfolio(testUser)
    assert.ok(pf.items.length > 0)
    const item = pf.items.find(i => i.ticker === 'MELI3')
    assert.ok(item)
    assert.ok(item.shares >= 10)
})

test('sellStock vende ações e credita receita', () => {
    const res = stockMarketService.sellStock(testUser, 'MELI3', 5)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.shares, 5)
    assert.ok(res.totalRevenue > 0)
})

// 2. Sistema Empresarial
console.log('\n--- 2. Sistema Empresarial & Magnata ---')
test('createCompany funda nova empresa com sucesso', () => {
    const res = companyService.createCompany(testUser, 'Taverna do GOAT Teste', 'taberna')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.name, 'Taverna do GOAT Teste')
    
    const comp = companyService.getCompany(testUser)
    assert.ok(comp)
    assert.strictEqual(comp.level, 1)
})

test('hireEmployees contrata novos funcionários', () => {
    const res = companyService.hireEmployees(testUser, 2)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.hired, 2)
})

test('upgradeMarketing evolui notoriedade da empresa', () => {
    const res = companyService.upgradeMarketing(testUser)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.newMarketing, 2)
})

// 3. Setor Imobiliário
console.log('\n--- 3. Mercado Imobiliário ---')
test('buyProperty compra imóvel e registra matrícula', () => {
    const res = realEstateService.buyProperty(testUser, 'apartamento')
    assert.strictEqual(res.success, true)
    assert.ok(res.dbId.startsWith('IMO-'))

    const props = realEstateService.getUserProperties(testUser)
    assert.ok(props.length > 0)
    assert.strictEqual(props[0].name, 'Apartamento no Centro Central')
})

// 4. Sistema Bancário
console.log('\n--- 4. Sistema Bancário & CDB ---')
test('depositSavings e withdrawSavings operam sem perdas', () => {
    const dep = bankingService.depositSavings(testUser, 1000)
    assert.strictEqual(dep.success, true)
    assert.ok(dep.savingsBalance >= 1000)

    const withdr = bankingService.withdrawSavings(testUser, 500)
    assert.strictEqual(withdr.success, true)
    assert.ok(withdr.savingsBalance >= 500)
})

test('investCDB aplica em renda fixa', () => {
    const res = bankingService.investCDB(testUser, 'cdb1', 200)
    assert.strictEqual(res.success, true)
    assert.ok(res.estimatedTotal > 200)
})

test('requestLoan e payLoan gerenciam score e quitação', () => {
    const loan = bankingService.requestLoan(testUser, 2000, 2)
    assert.strictEqual(loan.success, true)
    assert.ok(loan.totalDue > 2000)

    const pay = bankingService.payLoan(testUser, loan.totalDue)
    assert.strictEqual(pay.success, true)
    assert.strictEqual(pay.cleared, true)
    assert.ok(pay.scoreBonus > 0)
})

// 5. Blackjack
console.log('\n--- 5. Cassino & Blackjack Engine ---')
test('calculateHand calcula pontuação com Ás dinâmico', () => {
    const hand1 = [{ val: 'A', suit: '♠️' }, { val: 'K', suit: '♥️' }]
    assert.strictEqual(blackjackService.calculateHand(hand1), 21)

    const hand2 = [{ val: 'A', suit: '♠️' }, { val: '9', suit: '♥️' }, { val: '5', suit: '♦️' }]
    assert.strictEqual(blackjackService.calculateHand(hand2), 15) // Ás vira 1
})

test('startGame inicia mesa contra a banca', () => {
    const res = blackjackService.startGame(testUser, 50)
    assert.ok(res.playerHand)
    assert.ok(res.dealerHand)
    if (!res.finished) {
        const stand = blackjackService.stand(testUser)
        assert.strictEqual(stand.finished, true)
    }
})

console.log(`\n========================================`)
console.log(`📊 RESULTADO FASE 2: ✅ ${pass}  ❌ ${fail}`)
console.log(`========================================`)

if (fail > 0) process.exit(1)
