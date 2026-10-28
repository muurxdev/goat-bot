module.exports = {
    name: 'elem_lu',
    aliases: ["cmd_elem_lu","atalho_elem_lu","abrev_elem_lu"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Lutécio (Lu)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: LUTÉCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Lu\n'
        txt += '🔢 *Número Atômico (Z):* 71\n'
        txt += '⚖️ *Massa Atômica:* 174.97 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
