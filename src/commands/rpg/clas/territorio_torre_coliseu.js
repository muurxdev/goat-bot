const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_torre_coliseu',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Coliseu dos Festivais de Torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: COLISEU DOS FESTIVAIS DE TORRE* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 4000 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +10%\n'
        txt += '🪙 *Multiplicador de Moedas:* +25%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar torre_coliseu`'
        return reply(txt.trim())
    }
}
