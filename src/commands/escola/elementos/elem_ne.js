module.exports = {
    name: 'elem_ne',
    aliases: ["cmd_elem_ne","atalho_elem_ne","abrev_elem_ne"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Neônio (Ne)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NEÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ne\n'
        txt += '🔢 *Número Atômico (Z):* 10\n'
        txt += '⚖️ *Massa Atômica:* 20.180 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
