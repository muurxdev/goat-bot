/**
 * BotXP — Suíte de Testes de Dev Tools & Dev Hub (ETAPA 5)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { createMockSocket, createMockContext } = require('../src/dev/mockFactory')
const { seedDatabase } = require('../scripts/seed')
const { processJson, generateHash, encodeBase64, decodeBase64, generateUUID, decodeJWT, testRegex } = require('../src/services/devService')
const userRepo = require('../src/database/repositories/userRepository')
const dispatcher = require('../src/handlers/commandDispatcher')

console.log('🧪 Iniciando suíte de testes de Dev Tools & Dev Hub (ETAPA 5)...\n')

let passCount = 0
let failCount = 0

function test(name, fn) {
    try {
        fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

async function testAsync(name, fn) {
    try {
        await fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

async function runDevToolsTests() {
    dispatcher.loadCommands()
    // Camada opt-in nasce OFF; libera tudo para testar o comportamento dos comandos.
    // Camada opt-in é POR AMBIENTE; libera os escopos usados nos testes.
    {
        const _ms = require('../src/services/moduleStateService')
        _ms.enableAll(_ms.PV_SCOPE)
        _ms.enableAll(_ms.GLOBAL_SCOPE)
        for (const g of ['5511999990001-1234@g.us', '120363000000000000@g.us', 'grupo@g.us']) _ms.enableAll(g)

        const rentalService = require('../src/services/rentalService')
        await rentalService.setRentalMode(false)
        rentalService.setLifetimeRental({ targetJid: '120363000000000000@g.us' })
    }

    // ══════════════════════════════════════════
    // 1. DEV SERVICE UTILITIES
    // ══════════════════════════════════════════
    console.log('--- 1. Dev Service Utilities (JSON, Hash, Base64, JWT, UUID, Regex) ---')

    test('processJson formata e minifica JSON validamente', () => {
        const raw = '{"b":2,"a":1}'
        const formatted = processJson(raw, 'format')
        assert(formatted.includes('\n  "b": 2'))

        const minified = processJson(formatted, 'minify')
        assert.strictEqual(minified, '{"b":2,"a":1}')

        assert.throws(() => processJson('{invalido}'), /Sintaxe JSON inválida/)
    })

    test('generateHash calcula hashes MD5, SHA256 e SHA512 com precisão', () => {
        const md5 = generateHash('md5', 'goat')
        assert.strictEqual(md5, 'a94aa000f9a94cc51775bd5eac97c926')

        const sha256 = generateHash('sha256', 'goat')
        assert.strictEqual(sha256, '5480f08f35968440ebe8135a8bf9e58c8c944bf4e3ba0f45acb141e474bd0c9c')
    })

    test('encodeBase64 e decodeBase64 codificam e decodificam perfeitamente', () => {
        const original = 'BotXP v2.0'
        const b64 = encodeBase64(original)
        assert.strictEqual(b64, 'Qm90WFAgdjIuMA==')

        const decoded = decodeBase64(b64)
        assert.strictEqual(decoded, original)
    })

    test('generateUUID produz UUIDs v4 válidos e únicos', () => {
        const u1 = generateUUID()
        const u2 = generateUUID()
        assert.strictEqual(typeof u1, 'string')
        assert(u1.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
        assert.notStrictEqual(u1, u2)
    })

    test('decodeJWT extrai Header e Payload corretamente', () => {
        // Token JWT de teste: { alg: "HS256", typ: "JWT" } . { user: "goat", role: "admin" }
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ29hdCIsInJvbGUiOiJhZG1pbiJ9.dummy_signature'
        const decoded = decodeJWT(testToken)

        assert.strictEqual(decoded.header.alg, 'HS256')
        assert.strictEqual(decoded.payload.user, 'goat')
        assert.strictEqual(decoded.payload.role, 'admin')
        assert.strictEqual(decoded.signaturePresent, true)
    })

    test('testRegex executa expressões regulares com grupos de captura', () => {
        const res = testRegex('([a-z]+)@([a-z]+)', 'i', 'contato@dev.com')
        assert.strictEqual(res.matched, true)
        assert.strictEqual(res.firstMatch, 'contato@dev')
    })

    test('convertTimestamp converte timestamp UNIX e datas para ISO, UTC e BRT', () => {
        const { convertTimestamp } = require('../src/services/devService')
        const res = convertTimestamp('1700000000')
        assert.strictEqual(res.unixSeconds, 1700000000)
        assert.strictEqual(typeof res.iso, 'string')
        assert.strictEqual(typeof res.brt, 'string')
    })

    // ══════════════════════════════════════════
    // 2. DISPATCHER & COMANDOS ATIVOS DO DEV HUB
    // ══════════════════════════════════════════
    console.log('\n--- 2. Execução dos Comandos Ativos (.json, .hash, .b64, .jwt, .uuid, .regex) ---')

    await testAsync('dispatch executa .json format com sucesso', async () => {
        const ctx = createMockContext('.json format {"status":"ok","code":200}', { isOwner: true })
        await dispatcher.dispatch(ctx)
        assert(ctx.capturedReplies.length >= 1)
        assert(ctx.capturedReplies[0].msg.includes('JSON FORMATADO'))
    })

    await testAsync('dispatch executa .sha256 e .b64 com sucesso', async () => {
        const ctxHash = createMockContext('.sha256 teste_seguranca', { isOwner: true })
        await dispatcher.dispatch(ctxHash)
        assert(ctxHash.capturedReplies[0].msg.includes('HASH CRIPTOGRÁFICO'))

        const ctxB64 = createMockContext('.b64 encode Hello World', { isOwner: true })
        await dispatcher.dispatch(ctxB64)
        assert(ctxB64.capturedReplies[0].msg.includes('SGVsbG8gV29ybGQ='))
    })

    await testAsync('dispatch executa .uuid e .regex com sucesso', async () => {
        const ctxUuid = createMockContext('.uuid', { isOwner: true })
        await dispatcher.dispatch(ctxUuid)
        assert(ctxUuid.capturedReplies[0].msg.includes('GERADOR DE UUID'))

        const ctxRegex = createMockContext('.regex /[0-9]+/g meu id e 456', { isOwner: true })
        await dispatcher.dispatch(ctxRegex)
        assert(ctxRegex.capturedReplies[0].msg.includes('MATCH ENCONTRADO'))
    })

    // ══════════════════════════════════════════
    // 3. MOCKS & SEEDER
    // ══════════════════════════════════════════
    console.log('\n--- 3. Mocks e Seeder de Testes ---')

    test('createMockSocket registra mensagens e atualizações de grupo', async () => {
        const mockSock = createMockSocket()
        await mockSock.sendMessage('123@g.us', { text: 'Olá teste' })
        assert.strictEqual(mockSock.sentMessages.length, 1)
        assert.strictEqual(mockSock.sentMessages[0].content.text, 'Olá teste')
    })

    test('seedDatabase popula usuários sintéticos no SQLite', () => {
        seedDatabase(5)
        const seeded = userRepo.getUser('5511999000001@s.whatsapp.net')
        assert(seeded !== null, 'Usuário semeado deve existir no banco de dados')
        assert(seeded.level >= 1)
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE DEV TOOLS:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runDevToolsTests().catch(err => {
    console.error('Erro na execução dos testes de dev tools:', err)
    process.exit(1)
})
