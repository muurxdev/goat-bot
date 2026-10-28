module.exports = {
    name: 'elem_ti',
    aliases: ["cmd_elem_ti","atalho_elem_ti","abrev_elem_ti"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Titânio (Ti)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TITÂNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ti\n'
        txt += '🔢 *Número Atômico (Z):* 22\n'
        txt += '⚖️ *Massa Atômica:* 47.867 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
