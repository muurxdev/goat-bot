module.exports = {
    name: 'elem_w',
    aliases: ["cmd_elem_w","atalho_elem_w","abrev_elem_w"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Tungstênio (W)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TUNGSTÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* W\n'
        txt += '🔢 *Número Atômico (Z):* 74\n'
        txt += '⚖️ *Massa Atômica:* 183.84 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
