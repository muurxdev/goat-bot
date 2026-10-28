/**
 * Comando .sistemanervoso — SISTEMA NERVOSO
 *
 * Ficha do sistema: órgãos, função, escala e sinal de alerta.
 * O conteúdo vem de services/bodyService — o comando só apresenta.
 */
const B = require('../../services/bodyService')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }

module.exports = {
    name: 'sistemanervoso',
    aliases: ["corponervoso"],
    category: 'general',
    subcategory: 'Conhecimento',
    description: 'Sistema nervoso: órgãos, função e sinais de alerta',
    cooldownMs: 2500,
    execute: async ({ reply, prefix = '.' }) => {
        const s = B.SISTEMAS['nervoso']
        let doc = cab("SISTEMA NERVOSO", '🫀')
        doc += linha('Órgãos', s.orgaos)
        doc += sep()
        doc += '⚙️ *O que faz*\n' + s.funcao + '\n\n'
        doc += '📐 *O número que dá a escala*\n' + s.numero + '\n\n'
        doc += '🚩 *Sinal de alerta*\n' + s.sinal + '\n\n'
        doc += '🧬 _Órgãos deste sistema:_ `' + prefix + 'orgaos nervoso`\n'
        doc += '🫀 _Todos os sistemas:_ `' + prefix + 'corpohumano`\n\n'
        doc += '_Informação geral de saúde. Sintoma que preocupa se resolve com consulta, não com busca._'
        return reply(doc)
    }
}
