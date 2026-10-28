module.exports = {
    name: 'elem_be',
    aliases: ["cmd_elem_be","atalho_elem_be","abrev_elem_be"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Berílio (Be)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BERÍLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Be\n'
        txt += '🔢 *Número Atômico (Z):* 4\n'
        txt += '⚖️ *Massa Atômica:* 9.0122 u\n'
        txt += '🧪 *Grupo / Família:* Alcalino-terroso\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
