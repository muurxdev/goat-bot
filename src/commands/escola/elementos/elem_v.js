module.exports = {
    name: 'elem_v',
    aliases: ["cmd_elem_v","atalho_elem_v","abrev_elem_v"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Vanádio (V)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: VANÁDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* V\n'
        txt += '🔢 *Número Atômico (Z):* 23\n'
        txt += '⚖️ *Massa Atômica:* 50.942 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
