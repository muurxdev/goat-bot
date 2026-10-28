module.exports = {
    name: 'elem_y',
    aliases: ["cmd_elem_y","atalho_elem_y","abrev_elem_y"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Ítrio (Y)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ÍTRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Y\n'
        txt += '🔢 *Número Atômico (Z):* 39\n'
        txt += '⚖️ *Massa Atômica:* 88.906 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
