module.exports = {
    name: 'elem_fe',
    aliases: ["cmd_elem_fe","atalho_elem_fe","abrev_elem_fe"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Ferro (Fe)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: FERRO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Fe\n'
        txt += '🔢 *Número Atômico (Z):* 26\n'
        txt += '⚖️ *Massa Atômica:* 55.845 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
