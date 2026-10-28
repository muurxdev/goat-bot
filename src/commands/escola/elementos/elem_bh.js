module.exports = {
    name: 'elem_bh',
    aliases: ["cmd_elem_bh","atalho_elem_bh","abrev_elem_bh"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Bóhrio (Bh)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BÓHRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Bh\n'
        txt += '🔢 *Número Atômico (Z):* 107\n'
        txt += '⚖️ *Massa Atômica:* 270 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
