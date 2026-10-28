module.exports = {
    name: 'elem_rg',
    aliases: ["cmd_elem_rg","atalho_elem_rg","abrev_elem_rg"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Roentgênio (Rg)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ROENTGÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Rg\n'
        txt += '🔢 *Número Atômico (Z):* 111\n'
        txt += '⚖️ *Massa Atômica:* 282 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
