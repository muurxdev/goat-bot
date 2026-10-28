/**
 * Comando .escolherpet — QUAL BICHO COMBINA
 *
 * Sugere raças pelo espaço e pelo tempo que você tem.
 */

const H = require('../../services/homeLifeService')

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
    name: 'escolherpet',
    aliases: ["qualpet"],
    category: 'general',
    subcategory: 'Plantas e Bichos',
    description: 'Sugere raças pelo espaço e pelo tempo que você tem',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const espaco = String(args[0] || '').toLowerCase()
    const tempo = parseInt(args[1], 10)
    if (!espaco || !Number.isFinite(tempo)) {
        let doc = cab('QUAL BICHO COMBINA', '🐾')
        doc += '📌 Uso: `' + prefix + 'escolherpet <apartamento|casa> <minutos por dia>`\n\n'
        doc += '🧮 *Exemplo*\n`' + prefix + 'escolherpet apartamento 40`\n\n'
        doc += '_Considera porte e necessidade de exercício, não gosto pessoal._'
        return reply(doc)
    }
    const apto = espaco.startsWith('ap')
    const energiaOk = tempo >= 90 ? ['muito alta', 'alta', 'média', 'baixa'] : tempo >= 45 ? ['alta', 'média', 'baixa'] : ['média', 'baixa']
    const caes = Object.entries(H.CAES).filter(([, c]) => {
        const cabe = !apto || !c.porte.includes('grande')
        return cabe && energiaOk.some(e => c.energia.includes(e)) && !(tempo < 45 && c.energia.includes('alta'))
    })
    const gatos = Object.entries(H.GATOS).filter(([, g]) => tempo >= 30 || g.energia === 'baixa')
    let doc = cab('QUAL BICHO COMBINA', '🐾')
    doc += linha('Espaço', apto ? 'apartamento' : 'casa com quintal')
    doc += linha('Tempo diário', tempo + ' min')
    doc += sep()
    doc += bloco('🐕 CÃES QUE CABEM (' + caes.length + ')', caes.length
        ? caes.slice(0, 10).map(([k, c]) => c.nome + ' `' + prefix + 'cao' + k + '`')
        : ['Nenhum do catálogo com esse tempo disponível'])
    doc += bloco('🐈 GATOS (' + gatos.length + ')', gatos.slice(0, 8).map(([k, g]) => g.nome + ' `' + prefix + 'gato' + k + '`'))
    if (tempo < 45) doc += '\n💡 _Com menos de 45 minutos por dia, gato costuma ser a escolha honesta._'
    doc += '\n\n_Sugestão por porte e energia. Adotar um SRD contorna quase todas essas contas._'
    return reply(doc)
    }
}
