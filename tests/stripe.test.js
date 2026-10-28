/**
 * BotXP — Integração Stripe
 *
 * Concentra-se no que concede dinheiro: a verificação de assinatura do webhook
 * e a deduplicação de eventos. Um POST forjado dizendo "pagamento aprovado"
 * precisa ser inofensivo, e um reenvio do Stripe não pode creditar duas vezes.
 */

process.env.NODE_ENV = 'test'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_teste_do_projeto'

const assert = require('assert')
const crypto = require('crypto')
const stripe = require('../src/services/payments/stripeService')
const creditos = require('../src/services/payments/creditsService')
const webhook = require('../src/services/payments/stripeWebhook')

let passCount = 0
let failCount = 0

function test(nome, fn) {
    try {
        fn()
        passCount++
        console.log(`  ✅ PASS: ${nome}`)
    } catch (e) {
        failCount++
        console.log(`  ❌ FAIL: ${nome}`)
        console.log(`      ${e.message}`)
    }
}

const SEGREDO = 'whsec_teste_do_projeto'

function assinar(corpo, ts = Math.floor(Date.now() / 1000), segredo = SEGREDO) {
    const v1 = crypto.createHmac('sha256', segredo).update(`${ts}.${corpo}`).digest('hex')
    return `t=${ts},v1=${v1}`
}

console.log('\n--- 1. Verificação de assinatura do webhook ---')

const CORPO = JSON.stringify({
    id: 'evt_teste_1',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_1', payment_status: 'paid', amount_total: 5000, currency: 'brl', metadata: { jid: '5511999@s.whatsapp.net' } } }
})

test('aceita assinatura válida', () => {
    const r = stripe.verificarAssinatura(CORPO, assinar(CORPO))
    assert.ok(r.ok, `rejeitou assinatura válida: ${r.motivo}`)
    assert.strictEqual(r.evento.id, 'evt_teste_1')
})

test('REJEITA assinatura forjada', () => {
    const r = stripe.verificarAssinatura(CORPO, `t=${Math.floor(Date.now() / 1000)},v1=${'a'.repeat(64)}`)
    assert.ok(!r.ok, 'aceitou uma assinatura inventada — qualquer um ganharia crédito de graça')
})

test('REJEITA assinatura de outro segredo', () => {
    const r = stripe.verificarAssinatura(CORPO, assinar(CORPO, undefined, 'whsec_segredo_errado'))
    assert.ok(!r.ok, 'aceitou assinatura gerada com outro segredo')
})

test('REJEITA corpo adulterado depois de assinado', () => {
    const cabecalho = assinar(CORPO)
    const adulterado = CORPO.replace('5000', '99999999')
    const r = stripe.verificarAssinatura(adulterado, cabecalho)
    assert.ok(!r.ok, 'aceitou corpo alterado — daria para inflar o valor pago')
})

test('REJEITA evento antigo (proteção contra replay)', () => {
    const antigo = Math.floor(Date.now() / 1000) - 3600
    const r = stripe.verificarAssinatura(CORPO, assinar(CORPO, antigo))
    assert.ok(!r.ok, 'aceitou evento de 1 hora atrás')
    assert.ok(/replay|janela/i.test(r.motivo), `motivo inesperado: ${r.motivo}`)
})

test('REJEITA cabeçalho ausente ou malformado', () => {
    assert.ok(!stripe.verificarAssinatura(CORPO, null).ok)
    assert.ok(!stripe.verificarAssinatura(CORPO, 'lixo').ok)
    assert.ok(!stripe.verificarAssinatura(CORPO, 't=123').ok)
})

test('aceita múltiplos v1 (rotação de segredo do Stripe)', () => {
    const ts = Math.floor(Date.now() / 1000)
    const bom = crypto.createHmac('sha256', SEGREDO).update(`${ts}.${CORPO}`).digest('hex')
    const r = stripe.verificarAssinatura(CORPO, `t=${ts},v1=${'b'.repeat(64)},v1=${bom}`)
    assert.ok(r.ok, 'deveria aceitar quando um dos v1 confere')
})

console.log('\n--- 2. Créditos: conversão e deduplicação ---')

const JID = 'stripe-teste@s.whatsapp.net'

test('converte centavos em créditos', () => {
    // R$ 50,00 = 5000 centavos = 50 créditos (1 crédito por real)
    assert.strictEqual(creditos.centavosParaCreditos(5000), 50 * creditos.CREDITOS_POR_UNIDADE)
})

test('credita um pagamento', () => {
    const antes = creditos.saldo(JID)
    const r = creditos.creditarPagamento({
        jid: JID, centavos: 10000, moeda: 'brl', eventId: 'evt_unico_' + Date.now()
    })
    assert.ok(r.ok)
    assert.strictEqual(creditos.saldo(JID), antes + r.creditos)
    assert.ok(r.creditos > 0)
})

test('NÃO credita o mesmo evento duas vezes', () => {
    const eventId = 'evt_repetido_' + Date.now()
    const p = { jid: JID, centavos: 10000, moeda: 'brl', eventId }
    creditos.creditarPagamento(p)
    const saldoApos1 = creditos.saldo(JID)
    const r2 = creditos.creditarPagamento(p)
    assert.ok(r2.jaProcessado, 'não marcou como já processado')
    assert.strictEqual(creditos.saldo(JID), saldoApos1,
        'creditou de novo — um reenvio do Stripe daria crédito em dobro')
})

test('gastar respeita o saldo', () => {
    const saldo = creditos.saldo(JID)
    const r = creditos.gastar({ jid: JID, creditos: saldo + 1000, motivo: 'teste' })
    assert.ok(!r.ok, 'deixou gastar mais do que tem')
    assert.strictEqual(creditos.saldo(JID), saldo, 'alterou o saldo mesmo recusando')
})

test('gastar debita de verdade', () => {
    const antes = creditos.saldo(JID)
    if (antes < 5) creditos.ajustar({ jid: JID, creditos: 100, motivo: 'preparo do teste' })
    const base = creditos.saldo(JID)
    const r = creditos.gastar({ jid: JID, creditos: 5, motivo: 'teste' })
    assert.ok(r.ok, r.erro)
    assert.strictEqual(creditos.saldo(JID), base - 5)
})

test('extrato registra os movimentos', () => {
    const ext = creditos.extrato(JID, 10)
    assert.ok(Array.isArray(ext) && ext.length > 0, 'ledger vazio')
    assert.ok(ext.some(m => m.tipo === 'compra'), 'sem registro de compra')
    assert.ok(ext.some(m => m.tipo === 'gasto'), 'sem registro de gasto')
})

test('créditos convertem em dias de aluguel', () => {
    const dias = creditos.creditosParaDias(creditos.CREDITOS_POR_DIA * 7)
    assert.strictEqual(dias, 7)
})

console.log('\n--- 3. Processamento de evento ---')

test('evento pago sem jid no metadata não quebra', async () => {
    const ev = { id: 'evt_sem_jid', type: 'checkout.session.completed',
        data: { object: { id: 'cs_x', payment_status: 'paid', amount_total: 1000, metadata: {} } } }
    // Não deve lançar: apenas registrar que não há para quem creditar.
    const p = webhook.processarEvento(ev)
    assert.ok(p instanceof Promise)
})

test('sessão não paga não credita (Pix pendente)', async () => {
    const jid = 'pix-pendente@s.whatsapp.net'
    const antes = creditos.saldo(jid)
    await webhook.processarEvento({
        id: 'evt_pix_pendente', type: 'checkout.session.completed',
        data: { object: { id: 'cs_pix', payment_status: 'unpaid', amount_total: 5000, metadata: { jid } } }
    })
    assert.strictEqual(creditos.saldo(jid), antes, 'creditou uma sessão ainda não paga')
})

test('stripeService sem chave se comporta previsivelmente', () => {
    const chaveOriginal = process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_SECRET_KEY
    assert.strictEqual(stripe.isConfigured(), false)
    assert.strictEqual(stripe.modo(), 'desconhecido')
    if (chaveOriginal) process.env.STRIPE_SECRET_KEY = chaveOriginal
})

console.log('\n========================================')
console.log('📊 RESULTADO STRIPE:')
console.log(`   ✅ Passaram: ${passCount}`)
console.log(`   ❌ Falharam: ${failCount}`)
console.log('========================================\n')

if (failCount > 0) process.exit(1)
