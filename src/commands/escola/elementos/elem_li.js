module.exports = {
    name: 'elem_li',
    aliases: ["cmd_elem_li","atalho_elem_li","abrev_elem_li"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Lítio (Li)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: LÍTIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Li\n'
        txt += '🔢 *Número Atômico (Z):* 3\n'
        txt += '⚖️ *Massa Atômica:* 6.94 u\n'
        txt += '🧪 *Grupo / Família:* Metal Alcalino\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
