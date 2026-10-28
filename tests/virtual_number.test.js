/**
 * Testes Automatizados do Sistema de Números Virtuais e SMS (.numfake)
 * 
 * Cobertura:
 * 1. Resolução inteligente de DDDs brasileiros e internacionais
 * 2. Geração procedural de números válidos (Anatel 9 dígitos e FCC EUA)
 * 3. Privilégio ilimitado para Donos (Custo 0, sem débito)
 * 4. Cobrança de créditos para usuários comuns com verificação de saldo
 * 5. Prevenção contra múltiplos pedidos simultâneos
 * 6. Cancelamento com estorno automático de créditos para usuários comuns
 * 7. Entrega e consulta de código SMS (transição para RECEIVED)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const virtualNumberService = require('../src/services/virtualNumberService')
const virtualNumberRepo = require('../src/database/repositories/virtualNumberRepository')
const creditsService = require('../src/services/payments/creditsService')
const { getDatabase } = require('../src/database/connection')

let pass = 0
let fail = 0

async function test(name, fn) {
    try {
        await fn()
        pass++
        console.log(`  ✅ PASS: ${name}`)
    } catch (e) {
        fail++
        console.log(`  ❌ FAIL: ${name}`)
        console.log(`      ${e.stack || e.message}`)
    }
}

async function run() {
    console.log('\n--- 1. Resolução Inteligente de DDD e Região (resolveDdd) ---')

    await test('Resolve DDD 11 (São Paulo) corretamente', () => {
        const res = virtualNumberService.resolveDdd('11')
        assert.strictEqual(res.ddi, '55')
        assert.strictEqual(res.ddd, '11')
        assert.strictEqual(res.countryCode, 'BR')
        assert.ok(res.regionName.includes('São Paulo'))
    })

    await test('Resolve DDD 21 (Rio de Janeiro) corretamente', () => {
        const res = virtualNumberService.resolveDdd('21')
        assert.strictEqual(res.ddi, '55')
        assert.strictEqual(res.ddd, '21')
        assert.strictEqual(res.countryCode, 'BR')
        assert.ok(res.regionName.includes('Rio de Janeiro'))
    })

    await test('Resolve DDD Internacional 415 (San Francisco / EUA)', () => {
        const res = virtualNumberService.resolveDdd('415')
        assert.strictEqual(res.ddi, '1')
        assert.strictEqual(res.ddd, '415')
        assert.strictEqual(res.countryCode, 'US')
        assert.ok(res.regionName.includes('San Francisco'))
    })

    await test('Resolve palavras-chave como "sp", "brasil", "eua", "miami"', () => {
        const sp = virtualNumberService.resolveDdd('sp')
        assert.strictEqual(sp.ddd, '11')

        const eua = virtualNumberService.resolveDdd('eua')
        assert.strictEqual(eua.ddd, '305')

        const miami = virtualNumberService.resolveDdd('miami')
        assert.strictEqual(miami.ddd, '305')
    })

    await test('Resolve +1, 1, usa e números com DDI 1 (ex: +1415) como Estados Unidos', () => {
        const plusOne = virtualNumberService.resolveDdd('+1')
        assert.strictEqual(plusOne.ddi, '1')
        assert.strictEqual(plusOne.countryCode, 'US')
        assert.strictEqual(plusOne.countryName, 'Estados Unidos')

        const one = virtualNumberService.resolveDdd('1')
        assert.strictEqual(one.ddi, '1')
        assert.strictEqual(one.countryCode, 'US')

        const usa = virtualNumberService.resolveDdd('usa')
        assert.strictEqual(usa.ddi, '1')
        assert.strictEqual(usa.countryCode, 'US')

        const one415 = virtualNumberService.resolveDdd('+1415')
        assert.strictEqual(one415.ddi, '1')
        assert.strictEqual(one415.ddd, '415')
        assert.strictEqual(one415.countryCode, 'US')
    })

    console.log('\n--- 2. Geração Procedural de Números Telefônicos ---')

    await test('Gera celular brasileiro no padrão Anatel (+55 DD 9XXXX-XXXX)', () => {
        const resolved = virtualNumberService.resolveDdd('11')
        const gen = virtualNumberService.generateProceduralNumber(resolved)
        
        assert.ok(gen.formatted.startsWith('+55 (11) 9'), `Número deve iniciar com +55 (11) 9: ${gen.formatted}`)
        assert.strictEqual(gen.rawNumber.length, 13, `Raw BR deve ter 13 dígitos (55 + 2 DDD + 9 dígitos): ${gen.rawNumber}`)
        assert.match(gen.formatted, /^\+55 \(11\) 9\d{4}-\d{4}$/)
    })

    await test('Gera telefone americano no padrão FCC (+1 DDD XXX-XXXX)', () => {
        const resolved = virtualNumberService.resolveDdd('415')
        const gen = virtualNumberService.generateProceduralNumber(resolved)

        assert.ok(gen.formatted.startsWith('+1 (415) '), `Número deve iniciar com +1 (415): ${gen.formatted}`)
        assert.strictEqual(gen.rawNumber.length, 11, `Raw US deve ter 11 dígitos: ${gen.rawNumber}`)
        assert.match(gen.formatted, /^\+1 \(415\) \d{3}-\d{4}$/)
    })

    console.log('\n--- 3. Fluxo de Dono do Bot (Ilimitado & 0 Créditos) ---')

    const ownerJid = '5511999998888@s.whatsapp.net'
    
    // Limpa ordens antigas de teste se existirem
    const db = getDatabase()
    db.prepare("DELETE FROM virtual_numbers WHERE user_jid LIKE '%@test%' OR user_jid = ?").run(ownerJid)

    await test('Dono solicita número virtual com custo 0', async () => {
        const res = await virtualNumberService.requestVirtualNumber({
            sender: ownerJid,
            dddInput: '11',
            isOwner: true
        })

        assert.strictEqual(res.success, true, 'Pedido deve ter sucesso')
        assert.strictEqual(res.order.cost_credits, 0, 'Custo deve ser 0 para dono')
        assert.strictEqual(res.order.is_owner, 1, 'is_owner deve ser 1')
        assert.strictEqual(res.order.status, 'PENDING')
        assert.ok(res.numberFormatted.includes('(11)'))
    })

    await test('Impede segundo pedido concorrente enquanto houver ativo (autoReplace: false)', async () => {
        const res = await virtualNumberService.requestVirtualNumber({
            sender: ownerJid,
            dddInput: '21',
            isOwner: true,
            autoReplace: false
        })

        assert.strictEqual(res.success, false)
        assert.strictEqual(res.code, 'ALREADY_HAS_ACTIVE')
    })

    await test('Substitui pedido ativo anterior automaticamente quando autoReplace: true', async () => {
        const res = await virtualNumberService.requestVirtualNumber({
            sender: ownerJid,
            dddInput: '305',
            isOwner: true,
            autoReplace: true
        })

        assert.strictEqual(res.success, true)
        assert.strictEqual(res.order.ddd, '305')
        assert.ok(res.numberFormatted.includes('(305)'))
    })

    await test('Entrega de código SMS no número ativo do Dono', async () => {
        const statusBefore = await virtualNumberService.checkVirtualNumberStatus(ownerJid)
        assert.strictEqual(statusBefore.hasActive, true)

        const smsRes = virtualNumberService.deliverSmsCode(statusBefore.order.activation_id, '789-123')
        assert.ok(smsRes)
        assert.strictEqual(smsRes.code, '789-123')

        const statusAfter = await virtualNumberService.checkVirtualNumberStatus(ownerJid)
        assert.strictEqual(statusAfter.order.status, 'RECEIVED')
        assert.strictEqual(statusAfter.order.sms_code, '789-123')
    })

    console.log('\n--- 4. Fluxo de Usuário Comum (Cobrança & Estorno) ---')

    const userJid = '5521999997777@s.whatsapp.net'
    db.prepare("DELETE FROM virtual_numbers WHERE user_jid = ?").run(userJid)

    // Ajusta saldo inicial para 0
    const currentSaldo = creditsService.saldo(userJid)
    if (currentSaldo > 0) {
        creditsService.ajustar({ jid: userJid, creditos: -currentSaldo, motivo: 'reset de teste' })
    }

    await test('Usuário comum sem saldo é rejeitado com mensagem explicativa', async () => {
        const res = await virtualNumberService.requestVirtualNumber({
            sender: userJid,
            dddInput: '21',
            isOwner: false
        })

        assert.strictEqual(res.success, false)
        assert.strictEqual(res.code, 'INSUFFICIENT_CREDITS')
        assert.ok(res.message.includes('SALDO INSUFICIENTE'))
    })

    await test('Usuário comum com saldo é debitado e recebe número', async () => {
        creditsService.ajustar({ jid: userJid, creditos: 10, motivo: 'Recarga teste' })
        assert.strictEqual(creditsService.saldo(userJid), 10)

        const res = await virtualNumberService.requestVirtualNumber({
            sender: userJid,
            dddInput: '21',
            isOwner: false
        })

        assert.strictEqual(res.success, true)
        assert.strictEqual(res.order.cost_credits, 5)
        assert.strictEqual(creditsService.saldo(userJid), 5, 'Saldo deve ter diminuído de 10 para 5')
    })

    await test('Cancelamento da ativação estorna 100% dos créditos para o usuário comum', async () => {
        assert.strictEqual(creditsService.saldo(userJid), 5)

        const cancelRes = await virtualNumberService.cancelVirtualNumber({
            sender: userJid,
            isOwner: false
        })

        assert.strictEqual(cancelRes.success, true)
        assert.strictEqual(cancelRes.refundedCredits, 5)
        assert.strictEqual(creditsService.saldo(userJid), 10, 'Saldo deve ter voltado para 10 após o estorno')

        const statusNow = await virtualNumberService.checkVirtualNumberStatus(userJid)
        assert.strictEqual(statusNow.hasActive, false, 'Não deve mais possuir ordem ativa')
    })

    console.log('\n--- 5. Gerenciamento de Chave SMS-Activate (setApiKey & getApiKey) ---')

    await test('Configura e recupera chave de API do SMS-Activate', async () => {
        const originalKey = virtualNumberService.getApiKey()
        
        await virtualNumberService.setApiKey('test_key_goat_12345')
        assert.strictEqual(virtualNumberService.getApiKey(), 'test_key_goat_12345')

        // Limpa chave
        await virtualNumberService.setApiKey(originalKey || '')
        assert.strictEqual(virtualNumberService.getApiKey(), originalKey || null)
    })

    console.log('\n--- 6. Sistema de Números Públicos Gratuitos (Free Scraper) ---')

    const freeUserJid = '5511888887777@s.whatsapp.net'
    db.prepare("DELETE FROM virtual_numbers WHERE user_jid = ?").run(freeUserJid)

    await test('Solicita número público gratuito com custo 0 (requestFreeVirtualNumber)', async () => {
        const res = await virtualNumberService.requestFreeVirtualNumber({
            sender: freeUserJid,
            isOwner: false,
            autoReplace: true
        })

        assert.strictEqual(res.success, true)
        assert.strictEqual(res.isFree, true)
        assert.strictEqual(res.order.cost_credits, 0)
        assert.ok(res.numberRaw.length >= 8)
        assert.ok(res.order.activation_id.startsWith('free_'))
        assert.ok(res.url.includes('anonymsms.com'))
    })

    await test('Filtra número público por país/DDI (ex: us / 1 ou uk / 44)', async () => {
        const resUs = await virtualNumberService.requestFreeVirtualNumber({
            sender: freeUserJid,
            countryFilter: 'us',
            isOwner: false,
            autoReplace: true
        })

        assert.strictEqual(resUs.success, true)
        assert.ok(resUs.selected.country === 'US' || resUs.selected.ddi === '1')

        const resUk = await virtualNumberService.requestFreeVirtualNumber({
            sender: freeUserJid,
            countryFilter: '44',
            isOwner: false,
            autoReplace: true
        })

        assert.strictEqual(resUk.success, true)
        assert.ok(resUk.selected.country === 'GB' || resUk.selected.ddi === '44')
    })

    await test('Consulta status e inspeciona inbox do número público ativo', async () => {
        const status = await virtualNumberService.checkVirtualNumberStatus(freeUserJid)
        assert.strictEqual(status.hasActive, true)
        assert.strictEqual(status.isFree, true)
        assert.ok(status.inboxUrl.includes('anonymsms.com'))
        assert.ok(Array.isArray(status.recentMessages))
    })

    await test('Cancelamento de número público não debita nem gera erro', async () => {
        const cancel = await virtualNumberService.cancelVirtualNumber({
            sender: freeUserJid,
            isOwner: false
        })
        assert.strictEqual(cancel.success, true)
        assert.strictEqual(cancel.refundedCredits, 0)

        const statusAfter = await virtualNumberService.checkVirtualNumberStatus(freeUserJid)
        assert.strictEqual(statusAfter.hasActive, false)
    })

    console.log('\n--- 7. Execução do Comando .numfake (free e free lista) ---')
    const numfakeCmd = require('../src/commands/general/numfake')

    await test('Executa .numfake free lista com sucesso', async () => {
        let repliedMsg = ''
        await numfakeCmd.execute({
            client: {},
            from: 'test@s.whatsapp.net',
            sender: freeUserJid,
            args: ['free', 'lista'],
            reply: (msg) => { repliedMsg = msg },
            isOwner: false,
            prefix: '.'
        })

        assert.ok(repliedMsg.includes('NÚMEROS PÚBLICOS GRÁTIS'))
        assert.ok(repliedMsg.includes('.numfake free'))
    })

    await test('Executa .numfake free gerando número público com sucesso', async () => {
        let repliedMsg = ''
        await numfakeCmd.execute({
            client: {},
            from: 'test@s.whatsapp.net',
            sender: freeUserJid,
            args: ['free'],
            reply: (msg) => { repliedMsg = msg },
            isOwner: false,
            prefix: '.'
        })

        assert.ok(repliedMsg.includes('NÚMERO PÚBLICO GRÁTIS'))
        assert.ok(repliedMsg.includes('100% Grátis'))
        assert.ok(repliedMsg.includes('.numfake cod'))
    })

    await test('Executa .numfake cod no número público ativo', async () => {
        let repliedMsg = ''
        await numfakeCmd.execute({
            client: {},
            from: 'test@s.whatsapp.net',
            sender: freeUserJid,
            args: ['cod'],
            reply: (msg) => { repliedMsg = msg },
            isOwner: false,
            prefix: '.'
        })

        assert.ok(repliedMsg.includes('AGUARDANDO SMS') || repliedMsg.includes('CÓDIGO SMS RECEBIDO'))
    })

    console.log(`\n========================================`)
    console.log(`Resultados dos Testes: ${pass} PASSOU | ${fail} FALHOU`)
    console.log(`========================================\n`)

    if (fail > 0) {
        process.exit(1)
    }
}

run().catch(err => {
    console.error('Erro fatal nos testes:', err)
    process.exit(1)
})
