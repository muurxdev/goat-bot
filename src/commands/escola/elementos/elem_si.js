module.exports = {
    name: 'elem_si',
    aliases: ["cmd_elem_si","atalho_elem_si","abrev_elem_si"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Silício (Si)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: SILÍCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Si\n'
        txt += '🔢 *Número Atômico (Z):* 14\n'
        txt += '⚖️ *Massa Atômica:* 28.085 u\n'
        txt += '🧪 *Grupo / Família:* Semimetal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
