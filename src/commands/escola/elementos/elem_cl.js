module.exports = {
    name: 'elem_cl',
    aliases: ["cmd_elem_cl","atalho_elem_cl","abrev_elem_cl"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cloro (Cl)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CLORO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cl\n'
        txt += '🔢 *Número Atômico (Z):* 17\n'
        txt += '⚖️ *Massa Atômica:* 35.45 u\n'
        txt += '🧪 *Grupo / Família:* Halogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
