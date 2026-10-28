module.exports = {
    name: 'elem_tm',
    aliases: ["cmd_elem_tm","atalho_elem_tm","abrev_elem_tm"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Túlio (Tm)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TÚLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Tm\n'
        txt += '🔢 *Número Atômico (Z):* 69\n'
        txt += '⚖️ *Massa Atômica:* 168.93 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
