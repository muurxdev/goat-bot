const clanService = require('../../../services/clanService')

module.exports = {
    name: 'territorio_vilarejo_ruinas',
    aliases: [],
    category: 'rpg',
    subcategory: 'Fichas Territoriais',
    description: 'Relatório tático e fortificações de Ruínas Antigas de Vilarejo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *FICHA TÁTICA: RUÍNAS ANTIGAS DE VILAREJO* ═══════╗\n\n'
        txt += '🛡️ *Poder Defensivo da Guarnição:* 3500 soldados\n'
        txt += '⚡ *Multiplicador de XP:* +18%\n'
        txt += '🪙 *Multiplicador de Moedas:* +12%\n\n'
        txt += 'Para conquistar com seu clã: `.conquistar vilarejo_ruinas`'
        return reply(txt.trim())
    }
}
