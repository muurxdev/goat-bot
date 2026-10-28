module.exports = {
    name: 'elem_na',
    aliases: ["cmd_elem_na","atalho_elem_na","abrev_elem_na"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Sódio (Na)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: SÓDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Na\n'
        txt += '🔢 *Número Atômico (Z):* 11\n'
        txt += '⚖️ *Massa Atômica:* 22.990 u\n'
        txt += '🧪 *Grupo / Família:* Metal Alcalino\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
