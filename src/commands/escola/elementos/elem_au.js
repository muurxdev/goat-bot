module.exports = {
    name: 'elem_au',
    aliases: ["cmd_elem_au","atalho_elem_au","abrev_elem_au"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Ouro (Au)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: OURO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Au\n'
        txt += '🔢 *Número Atômico (Z):* 79\n'
        txt += '⚖️ *Massa Atômica:* 196.97 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
