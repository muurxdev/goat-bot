module.exports = {
    name: 'elem_cn',
    aliases: ["cmd_elem_cn","atalho_elem_cn","abrev_elem_cn"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Copernício (Cn)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: COPERNÍCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cn\n'
        txt += '🔢 *Número Atômico (Z):* 112\n'
        txt += '⚖️ *Massa Atômica:* 285 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
