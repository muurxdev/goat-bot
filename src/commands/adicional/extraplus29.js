/**
 * Comando .sorteardata — DATA SORTEADA
 *
 * Sorteia uma data dentro de um intervalo.
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
    name: 'sorteardata',
    aliases: ["dataaleatoria","cmd_sorteardata","alt_sorteardata","atalho_sorteardata","abrev_sorteardata","call_sorteardata","func_sorteardata"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Sorteia uma data dentro de um intervalo',
    usage: '[início] [fim]',
    examples: [' — uma data deste ano', '01/10/2026 31/12/2026 — entre duas datas'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const a = dataOuHoje(args[0]), b = dataOuHoje(args[1])
    const inicio = a || new Date(new Date().getFullYear(), 0, 1)
    const fim = b || new Date(new Date().getFullYear(), 11, 31)
    if (fim <= inicio) return reply(Fmt.tela({
        emoji: '📆', titulo: 'Intervalo inválido', prefix,
        intro: 'A data final precisa vir depois da inicial. Escreva as duas no formato dia/mês/ano.',
        secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [Fmt.cmd(prefix, 'sorteardata', '<início> <fim>')] }],
        proximos: [{ nome: 'sorteardata', args: '01/01/2026 31/12/2026', oque: 'exemplo pronto' }]
    }))
    const ms = inicio.getTime() + Math.floor(Math.random() * (fim - inicio))
    const d = new Date(ms)
    return reply(Fmt.tela({
        emoji: '📆', titulo: 'Data sorteada: ' + fmt(d), prefix,
        intro: 'Caiu em *' + d.toLocaleDateString('pt-BR', { weekday: 'long' }) + ', ' + fmt(d) + '*.',
        secoes: [{ emoji: '🧾', titulo: 'Sorteio', linhas: [Fmt.campo('Entre', fmt(inicio) + ' e ' + fmt(fim))] }],
        dica: a || b ? '' : 'Sem datas, sorteio dentro deste ano. Informe início e fim para outro intervalo.',
        proximos: [
            { nome: 'sorteardata', args: '01/10/2026 31/12/2026', oque: 'sorteia entre duas datas' },
            { nome: 'sortearvalor', args: '1 100', oque: 'sorteia um número' }
        ]
    }))
    }
}
