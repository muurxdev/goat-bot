module.exports = {
    name: 'elem_rn',
    aliases: ["cmd_elem_rn","atalho_elem_rn","abrev_elem_rn"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Radônio (Rn)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RADÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Rn\n'
        txt += '🔢 *Número Atômico (Z):* 86\n'
        txt += '⚖️ *Massa Atômica:* 222 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
