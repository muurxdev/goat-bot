module.exports = {
    name: 'elem_fl',
    aliases: ["cmd_elem_fl","atalho_elem_fl","abrev_elem_fl"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Fleróvio (Fl)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: FLERÓVIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Fl\n'
        txt += '🔢 *Número Atômico (Z):* 114\n'
        txt += '⚖️ *Massa Atômica:* 289 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
