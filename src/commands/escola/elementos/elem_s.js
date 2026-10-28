module.exports = {
    name: 'elem_s',
    aliases: ["cmd_elem_s","atalho_elem_s","abrev_elem_s"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Enxofre (S)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ENXOFRE* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* S\n'
        txt += '🔢 *Número Atômico (Z):* 16\n'
        txt += '⚖️ *Massa Atômica:* 32.06 u\n'
        txt += '🧪 *Grupo / Família:* Calcogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
