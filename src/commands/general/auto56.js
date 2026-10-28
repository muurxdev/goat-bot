/**
 * Comando .luzespainel — LUZES DO PAINEL
 *
 * Todas as luzes do painel agrupadas por cor.
 */

const A = require('../../services/autoService')

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
    name: 'luzespainel',
    aliases: ["painelcarro","luzesdocarro"],
    category: 'general',
    subcategory: 'Carro e Trânsito',
    description: 'Todas as luzes do painel agrupadas por cor',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const filtro = String(args[0] || '').toLowerCase()
    const lista = filtro ? A.luzesPorCor(filtro) : Object.entries(A.LUZES).map(([chave, l]) => ({ chave, ...l }))
    if (!lista.length) return reply('🚘 Nenhuma luz `' + filtro + '`.\n\n📌 Veja tudo: `' + prefix + 'luzespainel`')
    const porCor = {}
    for (const l of lista) {
        const c = l.cor.split(' ')[0]
        if (!porCor[c]) porCor[c] = []
        porCor[c].push(l)
    }
    const EMO = { vermelha: '🔴', amarela: '🟡', azul: '🔵', verde: '🟢' }
    const ORDEM = ['vermelha', 'amarela', 'verde', 'azul']
    let doc = cab('LUZES DO PAINEL', '🚘')
    doc += linha('Luzes', String(lista.length)) + '\n'
    for (const cor of ORDEM) {
        if (!porCor[cor]) continue
        doc += bloco((EMO[cor] || '') + ' ' + cor.toUpperCase(), porCor[cor].map(l => l.nome + ' `' + prefix + 'luz' + l.chave + '`'))
    }
    doc += '\n🔴 *Vermelho:* pare agora\n🟡 *Amarelo:* providencie logo\n🔵🟢 *Azul e verde:* só avisam que algo está ligado\n\n'
    doc += '💡 _Filtrar:_ `' + prefix + 'luzespainel vermelha`'
    return reply(doc)
    }
}
