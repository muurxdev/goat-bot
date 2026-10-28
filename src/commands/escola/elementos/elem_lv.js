module.exports = {
    name: 'elem_lv',
    aliases: ["cmd_elem_lv","atalho_elem_lv","abrev_elem_lv"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Livermório (Lv)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: LIVERMÓRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Lv\n'
        txt += '🔢 *Número Atômico (Z):* 116\n'
        txt += '⚖️ *Massa Atômica:* 293 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
