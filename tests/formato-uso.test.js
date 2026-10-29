/**
 * Testes da base de apresentação (utils/formato + services/usoService).
 *
 * O que precisa continuar verdadeiro:
 *  - A formatação nasce em moldura bem formada (caixas de volta por decisão do
 *    dono em 2026-09-18; antes, desde 2026-09-15, eram proibidas).
 *  - Pedido de uso seco é reconhecido; resposta de conteúdo NUNCA é.
 *  - Ao passar pelo dispatcher, o pedido seco vira ajuda com descrição, sintaxe e
 *    exemplos — era o que tornava ~617 comandos "secos" (auditoria de 2026-09-17).
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const F = require('../src/utils/formato')
const U = require('../src/services/usoService')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const { molduraQuebrada } = require('./helpers/moldura')

;(async () => {
    console.log('🧪 Testes da base de apresentação...\n')

    await test('tela sai em moldura, com cabeçalho, seções, dica, próximos passos e assinatura', () => {
        const t = F.tela({
            emoji: '🎯', titulo: 'Título', intro: 'Frase.',
            secoes: [{ emoji: '📋', titulo: 'Dados', linhas: [F.campo('Nível', 5), '• um item'] }, { emoji: '🙈', titulo: 'Vazia', linhas: [] }],
            dica: 'Uma dica.', proximos: [{ nome: 'menu', oque: 'ver tudo' }]
        })
        assert.strictEqual(molduraQuebrada(t), null, 'moldura quebrada')
        assert.ok(t.startsWith('╔'), 'começa pelo cabeçalho em caixa')
        assert.ok(t.includes('║   🎯 *TÍTULO* 🎯   ║'), 'título em maiúsculas com o emoji dos dois lados')
        assert.ok(t.includes('╭━〔 📋 DADOS 〕━⬣'))
        assert.ok(t.includes('┃ *Nível:* 5'))
        assert.ok(t.includes('┃ ➤ um item'), 'item de lista vira "┃ ➤"')
        assert.ok(!t.includes('VAZIA'), 'seção vazia deve sumir')
        // Desde 2026-10-26 (aa8e5ca2) o bloco de próximos passos se chama COMANDOS PARA AJUDAR.
        assert.ok(t.includes('╭━〔 🧭 COMANDOS PARA AJUDAR 〕━⬣') && t.includes('┃ ➤ `.menu` — ver tudo'))
        assert.ok(/👑 \*.+\*$/.test(t), 'termina com a assinatura do bot')
        assert.ok(!/\n{3,}/.test(t), 'sem linhas em branco sobrando')
    })

    await test('tela sem assinatura quando pedida assim', () => {
        const t = F.tela({ emoji: '🎯', titulo: 'X', intro: 'Y', assinatura: false })
        assert.ok(!t.includes('👑'))
    })

    await test('título em crase não vira maiúscula na moldura', () => {
        const t = F.tela({ emoji: '📘', titulo: 'Como usar `.play`' })
        assert.ok(t.includes('*COMO USAR `.play`*'), t.split('\n')[1])
    })

    await test('tempo de espera legível', () => {
        assert.strictEqual(F.tempo(0), 'sem espera')
        assert.strictEqual(F.tempo(2000), '2 s')
        assert.strictEqual(F.tempo(7200000), '2 h')
        assert.strictEqual(F.tempo(5400000), '1 h 30 min')
    })

    await test('reconhece os seis formatos de pedido de uso seco', () => {
        for (const t of [
            '❌ Digite o peso em kg.',
            '🔗 `.validarurl <url>`',
            '❌ Use: .vender loot',
            '✅ 📌 Uso: `.lido 1`',
            '📌 Uso: `.pay @pessoa <valor>`',
            'Uso: .kg2libras <peso>'
        ]) assert.ok(U.ehPedidoDeUso(t), `deveria reconhecer: ${t}`)
    })

    await test('não confunde conteúdo com pedido de uso', () => {
        for (const t of [
            '🔢 *Potência*\n0^0 = *1*',
            '🎉 *Doação recebida!*\n\n💰 Você doou 500 moedas',
            'Olá! Seu saldo é 300 moedas.',
            '⚔️ *Dungeon*\n\nVocê venceu o goblin!\n+50 XP\n+20 moedas'
        ]) assert.ok(!U.ehPedidoDeUso(t), `não deveria reconhecer: ${t}`)
    })

    await test('"Digite…" com argumento presente não é tratado como uso', () => {
        assert.ok(!U.ehPedidoDeUso('❌ Digite um número maior que zero.', { semArgumentos: false }))
    })

    await test('ajuda enriquecida traz descrição, orientação, sintaxe e exemplos', () => {
        const cmd = { name: 'kg2libras', description: 'Converte quilos em libras', usage: '<peso em kg>', examples: ['70 — setenta quilos'] }
        const t = U.enriquecerPedidoDeUso(cmd, '❌ Digite o peso em kg.', { prefix: '.' })
        assert.ok(t.includes('Como usar o .kg2libras'))
        assert.ok(t.includes('Converte quilos em libras.'))
        assert.ok(t.includes('⚠️ Digite o peso em kg.'))
        assert.ok(t.includes('`.kg2libras <peso em kg>`'))
        assert.ok(t.includes('`.kg2libras 70` — setenta quilos'))
        assert.ok(t.includes('`.kg2libras -help`'))
    })

    await test('sem schema, reaproveita a sintaxe que o próprio comando escreveu', () => {
        const t = U.enriquecerPedidoDeUso({ name: 'validarurl', description: 'Confere um endereço' }, '🔗 `.validarurl <url>`', { prefix: '.' })
        assert.ok(t.includes('`.validarurl <url>`'))
        assert.ok(!t.includes('⚠️'), 'mensagem que só tinha a sintaxe não gera orientação vazia')
    })

    await test('dispatcher entrega a ajuda enriquecida no lugar do uso seco', async () => {
        const dispatcher = require('../src/handlers/commandDispatcher')
        dispatcher.loadCommands()
        // O comando de teste cai no módulo Utilidades, desligado num PV novo; liga no PV para o teste.
        require('../src/services/moduleStateService').setModule('utilidades', true, 'pv')
        // Registra um comando de teste que responde uso seco sem argumento.
        const comandos = dispatcher.getCommands()
        const falso = {
            name: 'testeusoseco', category: 'general', description: 'Comando de teste da ajuda',
            usage: '<texto>', examples: ['olá — repete olá'], cooldownMs: 0,
            execute: async ({ reply, args }) => args.length ? reply('✅ ' + args.join(' ')) : reply('❌ Uso: `.testeusoseco <texto>`')
        }
        comandos.set('testeusoseco', falso)
        try {
            let resposta = ''
            await dispatcher.dispatch({ commandName: 'testeusoseco', sender: '5511900000001@s.whatsapp.net', from: '5511900000001@s.whatsapp.net', isGroup: false, isOwner: true, args: [], reply: async t => { resposta = t } })
            assert.ok(resposta.includes('Como usar o .testeusoseco'), resposta)
            assert.ok(resposta.includes('`.testeusoseco olá` — repete olá'), resposta)

            let conteudo = ''
            await dispatcher.dispatch({ commandName: 'testeusoseco', sender: '5511900000001@s.whatsapp.net', from: '5511900000001@s.whatsapp.net', isGroup: false, isOwner: true, args: ['oi'], reply: async t => { conteudo = t } })
            // Mapeamento universal (aa8e5ca2, 2026-10-26): toda resposta de comando ganha UMA linha de ajuda no fim.
            assert.ok(conteudo.startsWith('✅ oi'), 'o conteúdo vem primeiro')
            assert.strictEqual(conteudo.split('Comandos para Ajudar').length - 1, 1, 'a ajuda aparece uma vez só')
        } finally {
            comandos.delete('testeusoseco')
        }
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Base de apresentação: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
