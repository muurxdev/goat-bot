module.exports = {
    name: 'elem_ta',
    aliases: ["cmd_elem_ta","atalho_elem_ta","abrev_elem_ta"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Tântalo (Ta)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TÂNTALO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ta\n'
        txt += '🔢 *Número Atômico (Z):* 73\n'
        txt += '⚖️ *Massa Atômica:* 180.95 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
