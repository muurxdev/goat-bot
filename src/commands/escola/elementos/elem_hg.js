module.exports = {
    name: 'elem_hg',
    aliases: ["cmd_elem_hg","atalho_elem_hg","abrev_elem_hg"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Mercúrio (Hg)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MERCÚRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Hg\n'
        txt += '🔢 *Número Atômico (Z):* 80\n'
        txt += '⚖️ *Massa Atômica:* 200.59 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Líquido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
