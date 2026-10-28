module.exports = {
    name: 'elem_pt',
    aliases: ["cmd_elem_pt","atalho_elem_pt","abrev_elem_pt"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Platina (Pt)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PLATINA* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pt\n'
        txt += '🔢 *Número Atômico (Z):* 78\n'
        txt += '⚖️ *Massa Atômica:* 195.08 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
