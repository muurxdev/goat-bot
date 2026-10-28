module.exports = {
    name: 'elem_o',
    aliases: ["cmd_elem_o","atalho_elem_o","abrev_elem_o"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Oxigênio (O)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: OXIGÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* O\n'
        txt += '🔢 *Número Atômico (Z):* 8\n'
        txt += '⚖️ *Massa Atômica:* 15.999 u\n'
        txt += '🧪 *Grupo / Família:* Calcogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
