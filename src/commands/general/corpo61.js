/**
 * Comando .zonatreino — ZONAS DE TREINO
 *
 * Faixas de batimento por objetivo, a partir da idade.
 */

const B = require('../../services/bodyService')

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


module.exports = {
    name: 'zonatreino',
    aliases: ["batimentos"],
    category: 'general',
    subcategory: 'Corpo e Saúde',
    description: 'Faixas de batimento por objetivo, a partir da idade',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const idade = parseInt(args[0], 10)
    const repouso = parseInt(args[1], 10) || 70
    const r = B.zonasCardiacas(idade, repouso)
    if (!r) return reply('❤️ 📌 Uso: `' + prefix + 'zonatreino <idade> [batimento em repouso]`\n\n🧮 `' + prefix + 'zonatreino 35 60`')
    let doc = cab('ZONAS DE TREINO', '❤️')
    doc += linha('Idade', idade + ' anos')
    doc += linha('Repouso', repouso + ' bpm')
    doc += linha('FC máxima estimada', r.fcMax + ' bpm')
    doc += sep()
    for (const z of r.zonas) {
        doc += '┃ *' + z.min + '-' + z.max + ' bpm*\n┃    ' + z.nome + '\n'
    }
    doc += '\n🔎 *Como medir sem relógio*\nConte as pulsações no punho por 15 segundos e multiplique por 4.\n\n'
    doc += '_Estimativa pela fórmula de Karvonen. Quem tem condição cardíaca treina com liberação médica._'
    return reply(doc)
    }
}
