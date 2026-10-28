module.exports = {
    name: 'elem_ga',
    aliases: ["cmd_elem_ga","atalho_elem_ga","abrev_elem_ga"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Gálio (Ga)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: GÁLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ga\n'
        txt += '🔢 *Número Atômico (Z):* 31\n'
        txt += '⚖️ *Massa Atômica:* 69.723 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
