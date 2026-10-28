const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_mar_ocidental_porto',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Porto dos Mares Ocidentais',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: PORTO DOS MARES OCIDENTAIS* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 4200 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +10%\n'
        txt += '🪙 *Multiplicador de Moedas:* +30%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar mar_ocidental_porto`'
        return reply(txt.trim())
    }
}
