module.exports = {
    name: 'elem_pb',
    aliases: ["cmd_elem_pb","atalho_elem_pb","abrev_elem_pb"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Chumbo (Pb)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CHUMBO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pb\n'
        txt += '🔢 *Número Atômico (Z):* 82\n'
        txt += '⚖️ *Massa Atômica:* 207.2 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
