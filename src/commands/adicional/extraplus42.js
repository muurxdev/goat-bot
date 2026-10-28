/**
 * Comando .extraplusajuda — GUIA DAS FERRAMENTAS
 *
 * Todos os geradores e sorteios disponíveis.
 */

const F = require('../../services/toolsService')

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
    name: 'extraplusajuda',
    aliases: ["guiaferramentas","cmd_extraplusajuda","alt_extraplusajuda","atalho_extraplusajuda","abrev_extraplusajuda","call_extraplusajuda","func_extraplusajuda"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Todos os geradores e sorteios disponíveis',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    let doc = cab('GUIA DAS FERRAMENTAS', '🗺️')
    doc += bloco('🔐 SEGURANÇA', [
        '`' + prefix + 'criarsenha` · `' + prefix + 'frasesenha`',
        '`' + prefix + 'forcasenha` · `' + prefix + 'gerarcodigo`'
    ])
    doc += '\n' + bloco('🎲 SORTEIOS', [
        '`' + prefix + 'sortearopcao` · `' + prefix + 'sortearvalor`',
        '`' + prefix + 'dividirtimes` · `' + prefix + 'duplassorteadas`',
        '`' + prefix + 'rolagemdados` · `' + prefix + 'decidir`'
    ])
    doc += '\n' + bloco('📅 DATAS', [
        '`' + prefix + 'calcularanos` · `' + prefix + 'intervalodatas`',
        '`' + prefix + 'diasuteis` · `' + prefix + 'listaferiados`',
        '`' + prefix + 'tempoate` · `' + prefix + 'calendario`'
    ])
    doc += '\n' + bloco('🎨 CORES E TEXTO', [
        '`' + prefix + 'criarpaleta` · `' + prefix + 'analisarcor`',
        '`' + prefix + 'gerarslug` · `' + prefix + 'converterromano`'
    ])
    return reply(doc)
    }
}
