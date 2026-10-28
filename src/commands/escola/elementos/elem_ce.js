module.exports = {
    name: 'elem_ce',
    aliases: ["cmd_elem_ce","atalho_elem_ce","abrev_elem_ce"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cério (Ce)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CÉRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ce\n'
        txt += '🔢 *Número Atômico (Z):* 58\n'
        txt += '⚖️ *Massa Atômica:* 140.12 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
