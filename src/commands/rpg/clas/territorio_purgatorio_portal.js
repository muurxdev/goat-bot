const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_purgatorio_portal',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Garganta do Purgatório',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: GARGANTA DO PURGATÓRIO* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 8000 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +30%\n'
        txt += '🪙 *Multiplicador de Moedas:* +20%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar purgatorio_portal`'
        return reply(txt.trim())
    }
}
