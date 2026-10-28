module.exports = {
    name: 'elem_cu',
    aliases: ["cmd_elem_cu","atalho_elem_cu","abrev_elem_cu"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cobre (Cu)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: COBRE* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cu\n'
        txt += '🔢 *Número Atômico (Z):* 29\n'
        txt += '⚖️ *Massa Atômica:* 63.546 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
