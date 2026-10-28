module.exports = {
    name: 'elem_dy',
    aliases: ["cmd_elem_dy","atalho_elem_dy","abrev_elem_dy"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Disprósio (Dy)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: DISPRÓSIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Dy\n'
        txt += '🔢 *Número Atômico (Z):* 66\n'
        txt += '⚖️ *Massa Atômica:* 162.50 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
