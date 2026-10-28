module.exports = {
    name: 'elem_in',
    aliases: ["cmd_elem_in","atalho_elem_in","abrev_elem_in"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Índio (In)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ÍNDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* In\n'
        txt += '🔢 *Número Atômico (Z):* 49\n'
        txt += '⚖️ *Massa Atômica:* 114.82 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
