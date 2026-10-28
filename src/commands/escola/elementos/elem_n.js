module.exports = {
    name: 'elem_n',
    aliases: ["cmd_elem_n","atalho_elem_n","abrev_elem_n"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Nitrogênio (N)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NITROGÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* N\n'
        txt += '🔢 *Número Atômico (Z):* 7\n'
        txt += '⚖️ *Massa Atômica:* 14.007 u\n'
        txt += '🧪 *Grupo / Família:* Não-metal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
