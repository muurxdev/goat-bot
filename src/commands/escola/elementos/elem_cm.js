module.exports = {
    name: 'elem_cm',
    aliases: ["cmd_elem_cm","atalho_elem_cm","abrev_elem_cm"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cúrio (Cm)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CÚRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cm\n'
        txt += '🔢 *Número Atômico (Z):* 96\n'
        txt += '⚖️ *Massa Atômica:* 247 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
