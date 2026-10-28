module.exports = {
    name: 'elem_ho',
    aliases: ["cmd_elem_ho","atalho_elem_ho","abrev_elem_ho"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Hólmio (Ho)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: HÓLMIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ho\n'
        txt += '🔢 *Número Atômico (Z):* 67\n'
        txt += '⚖️ *Massa Atômica:* 164.93 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
