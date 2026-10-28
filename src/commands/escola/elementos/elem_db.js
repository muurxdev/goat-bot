module.exports = {
    name: 'elem_db',
    aliases: ["cmd_elem_db","atalho_elem_db","abrev_elem_db"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Dúbnio (Db)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: DÚBNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Db\n'
        txt += '🔢 *Número Atômico (Z):* 105\n'
        txt += '⚖️ *Massa Atômica:* 268 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
