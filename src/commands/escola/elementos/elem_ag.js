module.exports = {
    name: 'elem_ag',
    aliases: ["cmd_elem_ag","atalho_elem_ag","abrev_elem_ag"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Prata (Ag)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PRATA* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ag\n'
        txt += '🔢 *Número Atômico (Z):* 47\n'
        txt += '⚖️ *Massa Atômica:* 107.87 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
