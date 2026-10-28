const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_floresta_fadas',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Bosque Sagrado do Rei das Fadas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: BOSQUE SAGRADO DO REI DAS FADAS* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 4500 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +25%\n'
        txt += '🪙 *Multiplicador de Moedas:* +5%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar floresta_fadas`'
        return reply(txt.trim())
    }
}
