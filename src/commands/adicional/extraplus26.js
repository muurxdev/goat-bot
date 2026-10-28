/**
 * Comando .calculoporcento — PORCENTAGEM
 *
 * Calcula porcentagens de várias formas.
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
    name: 'calculoporcento',
    aliases: ["percentuais","cmd_calculoporcento","alt_calculoporcento","atalho_calculoporcento","abrev_calculoporcento","call_calculoporcento","func_calculoporcento"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Calcula porcentagens de várias formas',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const a = parseFloat(String(args[0] || '').replace(',', '.'))
    const b = parseFloat(String(args[1] || '').replace(',', '.'))
    if (isNaN(a) || isNaN(b)) {
        return reply('％ 📌 Uso: `' + prefix + 'calculoporcento 15 200`\n\n_Calcula 15% de 200, quanto 15 é de 200 e a variação entre eles._')
    }
    let doc = cab('PORCENTAGEM', '％')
    doc += linha(a + '% de ' + b, ((a / 100) * b).toLocaleString('pt-BR'))
    doc += linha(a + ' é quanto % de ' + b, b ? ((a / b) * 100).toFixed(2) + '%' : '—')
    doc += linha('Variação de ' + a + ' para ' + b, a ? (((b - a) / a) * 100).toFixed(2) + '%' : '—')
    doc += linha('Acréscimo de ' + a + '%', (b * (1 + a / 100)).toLocaleString('pt-BR'))
    doc += linha('Desconto de ' + a + '%', (b * (1 - a / 100)).toLocaleString('pt-BR'))
    return reply(doc)
    }
}
