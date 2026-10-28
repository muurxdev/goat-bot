const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_cidadedourada_fortaleza',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Fortaleza Caótica de Cidade Dourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: FORTALEZA CAÓTICA DE CIDADE DOURADA* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 6000 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +20%\n'
        txt += '🪙 *Multiplicador de Moedas:* +10%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar cidadedourada_fortaleza`'
        return reply(txt.trim())
    }
}
