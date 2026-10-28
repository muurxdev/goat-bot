module.exports = {
    name: 'elem_co',
    aliases: ["cmd_elem_co","atalho_elem_co","abrev_elem_co"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cobalto (Co)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: COBALTO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Co\n'
        txt += '🔢 *Número Atômico (Z):* 27\n'
        txt += '⚖️ *Massa Atômica:* 58.933 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
