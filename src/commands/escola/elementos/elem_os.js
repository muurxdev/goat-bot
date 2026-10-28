module.exports = {
    name: 'elem_os',
    aliases: ["cmd_elem_os","atalho_elem_os","abrev_elem_os"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Ósmio (Os)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ÓSMIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Os\n'
        txt += '🔢 *Número Atômico (Z):* 76\n'
        txt += '⚖️ *Massa Atômica:* 190.23 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
