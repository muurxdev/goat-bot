/**
 * Testes do interactionService (resposta livre a jogos) + quiz end-to-end.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const interactionService = require('../src/services/interactionService')

let pass = 0, fail = 0
async function test(name, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

async function main() {
    console.log('🧪 Testes de interação (resposta livre)...\n')

    await test('register + consume: handler recebe o texto e consome', async () => {
        let got = null
        interactionService.register('chatA', { type: 't', onText: (text) => { got = text; return true } })
        const consumed = await interactionService.consume('chatA', 'u1', 'ola')
        assert.strictEqual(consumed, true)
        assert.strictEqual(got, 'ola')
    })

    await test('consume retorna false quando não há interação', async () => {
        const consumed = await interactionService.consume('chatSemJogo', 'u1', 'oi')
        assert.strictEqual(consumed, false)
    })

    await test('handler que retorna false NÃO consome', async () => {
        interactionService.register('chatB', { onText: () => false })
        assert.strictEqual(await interactionService.consume('chatB', 'u1', 'x'), false)
    })

    await test('owner scoping: só o dono da partida responde', async () => {
        interactionService.register('chatC', { owner: 'dono@x', onText: () => true })
        assert.strictEqual(await interactionService.consume('chatC', 'outro@x', 'a'), false)
        assert.strictEqual(await interactionService.consume('chatC', 'dono@x', 'a'), true)
    })

    await test('TTL: interação expira', async () => {
        interactionService.register('chatD', { ttlMs: -1, onText: () => true })
        assert.strictEqual(interactionService.has('chatD'), false)
        assert.strictEqual(await interactionService.consume('chatD', 'u1', 'a'), false)
    })

    await test('quiz: resposta livre correta premia e encerra', async () => {
        const origRandom = Math.random
        Math.random = () => 0 // fixa QUESTIONS[0] (resposta SOMBRIA, opção 2)
        try {
            const quiz = require('../src/commands/fun/quiz')
            const replies = []
            const reply = (t) => { replies.push(t); return Promise.resolve() }
            const from = 'grupoQuiz@g.us', sender = '55199@s.whatsapp.net'
            await quiz.execute({ from, sender, args: [], reply })
            assert.ok(replies[0].includes('QUIZ'), 'mostrou a pergunta')
            assert.ok(interactionService.has(from), 'registrou a interação')
            // responde livre (sem prefixo) com a opção correta
            const consumed = await interactionService.consume(from, sender, 'sombria', { reply })
            assert.strictEqual(consumed, true, 'consumiu a resposta')
            assert.ok(replies.some(r => /CORRETA/i.test(r)), 'confirmou acerto')
            assert.strictEqual(interactionService.has(from), false, 'encerrou a partida')
        } finally { Math.random = origRandom }
    })

    await test('quiz: texto aleatório não é consumido como resposta', async () => {
        const origRandom = Math.random
        Math.random = () => 0
        try {
            const quiz = require('../src/commands/fun/quiz')
            const reply = () => Promise.resolve()
            const from = 'grupoQuiz2@g.us', sender = '55199@s.whatsapp.net'
            await quiz.execute({ from, sender, args: [], reply })
            const consumed = await interactionService.consume(from, sender, 'oi pessoal tudo bem', { reply })
            assert.strictEqual(consumed, false, 'conversa normal não vira resposta')
            interactionService.clear(from)
        } finally { Math.random = origRandom }
    })

    // A forca antiga virou o tema "saga" do .forca por tema em 2026-09-18, e a
    // resposta livre veio junto (src/services/jogoUnificadoService.js).
    await test('forca: letra correta por resposta livre', async () => {
        const orig = Math.random; Math.random = () => 0 // FORCA.saga[0] = GOAT
        try {
            const forca = require('../src/commands/fun/jogo-forca')
            const replies = []; const reply = (t) => { replies.push(t); return Promise.resolve() }
            const from = 'grpForca@g.us', sender = 'u@x'
            await forca.execute({ from, sender, args: ['mestre'], commandName: 'forca', reply })
            assert.ok(interactionService.has(from), 'registrou forca')
            const consumed = await interactionService.consume(from, sender, 'M', { reply })
            assert.strictEqual(consumed, true)
            assert.ok(replies.some(r => /Tem \*M\* sim|acert/i.test(r)), `não processou a letra: ${replies.slice(-1)[0]?.slice(0, 160)}`)
            const conversa = await interactionService.consume(from, sender, 'kkkk', { reply })
            assert.strictEqual(conversa, false, 'risada no chat não pode virar chute')
            const outro = await interactionService.consume(from, 'outra@x', 'E', { reply })
            assert.strictEqual(outro, false, 'só quem abriu a partida responde de forma livre')
            interactionService.clear(from)
        } finally { Math.random = orig }
    })

    await test('termo: palpite de 5 letras por resposta livre', async () => {
        const orig = Math.random; Math.random = () => 0 // PALAVRAS[0] = AMIGO
        try {
            const termo = require('../src/commands/fun/termo')
            const replies = []; const reply = (t) => { replies.push(t); return Promise.resolve() }
            const from = 'grpTermo@g.us', sender = 'u@x'
            await termo.execute({ from, sender, args: [], reply })
            const consumed = await interactionService.consume(from, sender, 'AMIGO', { reply })
            assert.strictEqual(consumed, true)
            assert.ok(replies.some(r => /ACERTOU/i.test(r)), 'venceu o termo')
        } finally { Math.random = orig }
    })

    await test('adivinheonumero: número por resposta livre (corrigido)', async () => {
        const orig = Math.random; Math.random = () => 0 // secret = 1
        try {
            const adiv = require('../src/commands/fun/adivinheonumero')
            const replies = []; const reply = (t) => { replies.push(t); return Promise.resolve() }
            const from = 'grpNum@g.us', sender = '55199@s.whatsapp.net'
            await adiv.execute({ from, sender, args: [], reply })
            const consumed = await interactionService.consume(from, sender, '1', { reply })
            assert.strictEqual(consumed, true)
            assert.ok(replies.some(r => /ACERTOU/i.test(r)), 'acertou o número')
        } finally { Math.random = orig }
    })

    console.log('\n========================================')
    console.log('📊 RESULTADO — Interação:')
    console.log('   ✅ Passaram: ' + pass)
    console.log('   ❌ Falharam: ' + fail)
    console.log('========================================')
    if (fail > 0) process.exit(1)
}

main()
