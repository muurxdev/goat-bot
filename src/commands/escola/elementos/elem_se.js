module.exports = {
    name: 'elem_se',
    aliases: ["cmd_elem_se","atalho_elem_se","abrev_elem_se"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Selênio (Se)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: SELÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Se\n'
        txt += '🔢 *Número Atômico (Z):* 34\n'
        txt += '⚖️ *Massa Atômica:* 78.971 u\n'
        txt += '🧪 *Grupo / Família:* Calcogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
