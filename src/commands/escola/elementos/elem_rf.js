module.exports = {
    name: 'elem_rf',
    aliases: ["cmd_elem_rf","atalho_elem_rf","abrev_elem_rf"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Rutherfórdio (Rf)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RUTHERFÓRDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Rf\n'
        txt += '🔢 *Número Atômico (Z):* 104\n'
        txt += '⚖️ *Massa Atômica:* 267 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
