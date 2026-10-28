module.exports = {
    name: 'elem_f',
    aliases: ["cmd_elem_f","atalho_elem_f","abrev_elem_f"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Flúor (F)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: FLÚOR* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* F\n'
        txt += '🔢 *Número Atômico (Z):* 9\n'
        txt += '⚖️ *Massa Atômica:* 18.998 u\n'
        txt += '🧪 *Grupo / Família:* Halogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
