/**
 * Comando .feriadoproximo — PRÓXIMO FERIADO
 *
 * Qual o próximo feriado e quantos dias faltam.
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
    name: 'feriadoproximo',
    aliases: ["quandoferiado","cmd_feriadoproximo","alt_feriadoproximo","atalho_feriadoproximo","abrev_feriadoproximo","call_feriadoproximo","func_feriadoproximo"],
    category: 'adicional',
    subcategory: 'Ferramentas',
    description: 'Qual o próximo feriado e quantos dias faltam',
    cooldownMs: 2500,
    execute: async ({ reply, sender, args = [], prefix = '.', mentionedJid, client, from, isGroup }) => {
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const candidatos = [...F.feriados(ano), ...F.feriados(ano + 1)]
        .map(([data, nome]) => {
            const [d, m] = data.split('/').map(Number)
            let dt = new Date(ano, m - 1, d)
            if (dt < hoje) dt = new Date(ano + 1, m - 1, d)
            return { dt, nome, data }
        })
        .filter(x => x.dt >= hoje)
        .sort((a, b) => a.dt - b.dt)
    if (!candidatos.length) return reply('🏖️ _Não consegui calcular o próximo feriado._')
    const p = candidatos[0]
    const dias = Math.ceil((p.dt - hoje) / 86400000)
    let doc = cab('PRÓXIMO FERIADO', '🏖️')
    doc += linha('Feriado', p.nome)
    doc += linha('Data', fmt(p.dt))
    doc += linha('Dia da semana', p.dt.toLocaleDateString('pt-BR', { weekday: 'long' }))
    doc += linha('Faltam', dias + ' dias')
    return reply(doc)
    }
}
