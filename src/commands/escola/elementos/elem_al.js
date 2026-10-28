module.exports = {
    name: 'elem_al',
    aliases: ["cmd_elem_al","atalho_elem_al","abrev_elem_al"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Alumínio (Al)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ALUMÍNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Al\n'
        txt += '🔢 *Número Atômico (Z):* 13\n'
        txt += '⚖️ *Massa Atômica:* 26.982 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
