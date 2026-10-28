const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_central_capital',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Capital Real Central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: CAPITAL REAL CENTRAL* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 5000 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +15%\n'
        txt += '🪙 *Multiplicador de Moedas:* +15%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar central_capital`'
        return reply(txt.trim())
    }
}
