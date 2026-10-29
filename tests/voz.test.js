/**
 * Layout das mensagens (services/vozService + ponto de saída do loreService).
 *
 * O que precisa continuar verdadeiro:
 *  - A caixa chega intacta ao usuário (volta decidida pelo dono em 2026-09-18);
 *    normalizarLayout segue testado, mas não está mais no ponto de saída.
 *  - Título gritado vira frase sem estragar sigla nem nome próprio.
 *  - Código, crase, URL e tabuleiro saem intactos.
 *  - Aplicar duas vezes não muda nada.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const { normalizarLayout, emFrase, ehGritado } = require('../src/services/vozService')
const { traduzirConteudo, semLore } = require('../src/services/loreService')
const { renderCard } = require('../src/utils/uiEngine')
const ui = require('../src/utils/ui')
const { molduraQuebrada } = require('./helpers/moldura')

let pass = 0, fail = 0
function test(nome, fn) {
    try { fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/

console.log('🧪 Testes de layout das mensagens...\n')

test('cartão típico de comando perde a moldura e mantém os dados', () => {
    const entrada =
        '╔══════════════════════════════╗\n' +
        '║   🚫 *MEMBRO REMOVIDO DO GRUPO* 🚫   ║\n' +
        '╚══════════════════════════════╝\n\n' +
        '╭━〔 📋 DETALHES DA REMOÇÃO 〕━⬣\n' +
        '┃ 👤 *Membro Removido:* @5511999\n' +
        '┃ ➤ `.unban @5511999`\n' +
        '╰━━━━━━━━━━━━━━━━━━⬣\n\n' +
        '👑 *Bot*'
    const saida = normalizarLayout(entrada)
    assert.ok(!CAIXA.test(saida), saida)
    assert.strictEqual(saida,
        '🚫 *Membro removido do grupo*\n\n' +
        '📋 *Detalhes da remoção*\n' +
        '👤 *Membro Removido:* @5511999\n' +
        '• `.unban @5511999`\n\n' +
        '👑 *Bot*')
})

test('helper cab/linha/bloco/sep copiado nos comandos sai limpo', () => {
    const cab = '╔══════════════════════════════╗\n║ 🔄 *MB PARA KB*\n╚══════════════════════════════╝\n\n'
    const linha = '┃ *Entrada:* 10 MB\n'
    const sep = '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n'
    const bloco = '╭━〔 Dicas 〕━⬣\n┃ use com cuidado\n╰━━━━━━━━━━━━━━━━━━⬣\n'
    const saida = normalizarLayout(cab + linha + sep + bloco)
    assert.strictEqual(saida, '🔄 *MB para KB*\n\n*Entrada:* 10 MB\n\n*Dicas*\nuse com cuidado')
})

test('caixa alta vira frase preservando siglas e nomes próprios', () => {
    assert.strictEqual(emFrase('VÍDEO BAIXADO DO YOUTUBE EM MP4'), 'Vídeo baixado do YouTube em MP4')
    // "em" fica "em": emFrase só corrige a caixa; a contração "no" nunca foi implementada.
    assert.strictEqual(emFrase('RANKING DE XP EM REINO'), 'Ranking de XP em Reino')
    assert.strictEqual(normalizarLayout('⚠️ *ATENÇÃO:* leia as regras'), '⚠️ *Atenção:* leia as regras')
})

test('sigla sozinha e resposta curta não são tocadas', () => {
    assert.ok(!ehGritado('XP'))
    assert.ok(!ehGritado('SIM'))
    const t = 'Digite *SIM* para aprovar ou *NAO* para rejeitar. Ganhou 50 XP!'
    assert.strictEqual(normalizarLayout(t), t)
})

test('código, crase e URL saem intactos', () => {
    const t = '```\n╔══╗ TABELA ORIGINAL\n┃ SELECT\n```\nUse `.MENU TODOS` em https://EXEMPLO.COM/ABCD'
    assert.strictEqual(normalizarLayout(t), t)
})

test('tabuleiro e barra de progresso sobrevivem', () => {
    const tab = '│ ❌ │ ⭕ │ 3 │'
    assert.strictEqual(normalizarLayout(tab), tab)
    const barra = '━━━━━⬤───── 1:23'
    assert.ok(normalizarLayout(barra).includes('⬤'), normalizarLayout(barra))
})

test('divisor de categoria do menu vira título', () => {
    assert.strictEqual(normalizarLayout('⚔️ ═══ *RPG & AVENTURA* ═══'), '⚔️ *RPG & aventura*')
})

test('idempotente', () => {
    const entrada = '╔══╗\n║ 🎬 *VÍDEO BAIXADO* 🎬 ║\n╚══╝\n\n╭━〔 🌐 DETALHES DA MÍDIA 〕━⬣\n┃ 📝 *Título:* X\n╰━━⬣'
    const uma = normalizarLayout(entrada)
    assert.strictEqual(normalizarLayout(uma), uma)
    assert.strictEqual(uma, '🎬 *Vídeo baixado*\n\n🌐 *Detalhes da mídia*\n📝 *Título:* X')
})

test('texto comum passa idêntico', () => {
    const t = 'Oi, @5511! Que bom ter você aqui.\n\nDigite `.menu` para ver o que eu faço.'
    assert.strictEqual(normalizarLayout(t), t)
})

test('ponto de saída mantém a caixa e só traduz o jargão', () => {
    // Desde 2026-09-18 a caixa passa intacta; antes daqui ela era apagada.
    const conteudo = { text: '╔══╗\n║ 📊 *STATUS DO SERVIDOR* ║\n╚══╝' }
    assert.strictEqual(traduzirConteudo(conteudo).text, '╔══╗\n║ 📊 *STATUS DO SISTEMA* ║\n╚══╝')
    semLore(() => {
        assert.strictEqual(traduzirConteudo(conteudo).text, conteudo.text, 'comando isento sai exatamente como veio')
    })
})

test('renderCard e ui.screen nascem em moldura bem formada', () => {
    const card = renderCard({
        title: 'CENTRAL DE RANKINGS', icon: '🏆', subtitle: 'Escolha um',
        sections: [{ title: 'OPÇÕES', icon: '📌', fields: ['uma', { label: 'Grupo', value: '`.rank grupo`', icon: '👥' }] }],
        tip: 'dica'
    })
    assert.strictEqual(molduraQuebrada(card), null, card)
    assert.ok(card.includes('║   🏆 *CENTRAL DE RANKINGS* 🏆   ║'), card)
    assert.ok(card.includes('┃ *Grupo:* `.rank grupo`'), card)
    assert.ok(card.includes('┃ ➤ uma'), card)
    const tela = ui.screen({ title: '🏅 *CONQUISTAS*', sections: [{ title: 'LISTA', lines: ['a', 'b'] }], hint: 'x' })
    assert.strictEqual(molduraQuebrada(tela), null, tela)
    assert.ok(tela.includes('║   🏅 *CONQUISTAS* 🏅   ║'), tela)
    assert.ok(tela.includes('╭━〔 📌 LISTA 〕━⬣'), tela)
})

console.log('\n========================================')
console.log(`📊 RESULTADO — Layout: ${pass} passaram, ${fail} falharam`)
console.log('========================================\n')
process.exit(fail > 0 ? 1 : 0)
