module.exports = {
    name: 'elem_pr',
    aliases: ["cmd_elem_pr","atalho_elem_pr","abrev_elem_pr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Praseodímio (Pr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PRASEODÍMIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pr\n'
        txt += '🔢 *Número Atômico (Z):* 59\n'
        txt += '⚖️ *Massa Atômica:* 140.91 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
