/**
 * Comando .rolagemdados — ROLAR DADO
 *
 * Rola dados de qualquer número de faces.
 */

const F = require('../../services/toolsService')
const Fmt = require('../../utils/formato')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function itensDe(args) {
    return (args || []).join(' ').split(/[;,\n]| \| /).map(s => s.trim()).filter(Boolean)
}
function pedeItens(prefix, cmd) {
    return '📋 *Informe as opções separadas por vírgula.*\n\n📌 Exemplo: `' + prefix + cmd + ' pizza, hambúrguer, sushi`'
}
function dataOuHoje(txt) {
    const d = F.lerData(txt)
    return d && !isNaN(d.getTime()) ? d : null
}
function fmt(d) { return d.toLocaleDateString('pt-BR') }

module.exports = {
    name: 'rolagemdados',
    aliases: ["jogardados","cmd_rolagemdados","alt_rolagemdados","atalho_rolagemdados","abrev_rolagemdados","call_rolagemdados","func_rolagemdados"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Rola dados de qualquer número de faces',
    usage: '[quantidade]d<faces>',
    examples: [' — um dado comum de 6 faces', '2d20 — dois dados de 20 faces', 'd100 — um dado de 100 faces'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const m = String(args[0] || '1d6').match(/^(\d*)d(\d+)$/i)
    if (!m) return reply(Fmt.tela({
        emoji: '🎲', titulo: 'Rolar dados', prefix,
        intro: 'Não entendi "' + args[0] + '". Escreva a quantidade, a letra d e o número de faces, tudo junto.',
        secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [Fmt.cmd(prefix, 'rolagemdados', '2d20')] }],
        proximos: [
            { nome: 'rolagemdados', args: '1d6', oque: 'um dado comum' },
            { nome: 'rolagemdados', args: '3d10', oque: 'três dados de 10 faces' }
        ]
    }))
    const qtd = Math.min(20, Math.max(1, parseInt(m[1], 10) || 1))
    const faces = Math.min(1000, Math.max(2, parseInt(m[2], 10)))
    const rolagens = []
    for (let i = 0; i < qtd; i++) rolagens.push(1 + F.inteiroSeguro(faces))
    const soma = rolagens.reduce((a, b) => a + b, 0)
    return reply(Fmt.tela({
        emoji: '🎲', titulo: 'Deu ' + soma + (qtd > 1 ? ' no total' : ''), prefix,
        intro: 'Rolei ' + (qtd === 1 ? 'um dado' : qtd + ' dados') + ' de ' + faces + ' faces.',
        secoes: [{ emoji: '🧾', titulo: 'Rolagem', linhas: [
            Fmt.campo('Dados', qtd + 'd' + faces),
            Fmt.campo('Resultados', rolagens.join(' · ')),
            Fmt.campo('Soma', String(soma)),
            qtd > 1 ? Fmt.campo('Média', (soma / qtd).toFixed(1)) : null
        ] }],
        dica: 'Escreva quantidade, a letra d e as faces: 2d20 são dois dados de 20 faces.',
        proximos: [
            { nome: 'rolagemdados', args: '2d20', oque: 'dois dados de 20 faces' },
            { nome: 'rolagemdados', args: '3d6', oque: 'três dados comuns' }
        ]
    }))
    }
}
