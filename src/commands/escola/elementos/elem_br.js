module.exports = {
    name: 'elem_br',
    aliases: ["cmd_elem_br","atalho_elem_br","abrev_elem_br"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Bromo (Br)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BROMO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Br\n'
        txt += '🔢 *Número Atômico (Z):* 35\n'
        txt += '⚖️ *Massa Atômica:* 79.904 u\n'
        txt += '🧪 *Grupo / Família:* Halogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Líquido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
