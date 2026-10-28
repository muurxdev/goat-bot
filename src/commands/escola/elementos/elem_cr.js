module.exports = {
    name: 'elem_cr',
    aliases: ["cmd_elem_cr","atalho_elem_cr","abrev_elem_cr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cromo (Cr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CROMO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cr\n'
        txt += '🔢 *Número Atômico (Z):* 24\n'
        txt += '⚖️ *Massa Atômica:* 51.996 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
