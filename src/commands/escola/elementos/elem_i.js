module.exports = {
    name: 'elem_i',
    aliases: ["cmd_elem_i","atalho_elem_i","abrev_elem_i"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Iodo (I)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: IODO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* I\n'
        txt += '🔢 *Número Atômico (Z):* 53\n'
        txt += '⚖️ *Massa Atômica:* 126.90 u\n'
        txt += '🧪 *Grupo / Família:* Halogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
