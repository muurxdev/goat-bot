const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_edimburgo_castelo',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Castelo dos Vampiros de Edimburgo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: CASTELO DOS VAMPIROS DE EDIMBURGO* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 5500 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +22%\n'
        txt += '🪙 *Multiplicador de Moedas:* +18%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar edimburgo_castelo`'
        return reply(txt.trim())
    }
}
