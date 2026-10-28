module.exports = {
    name: 'elem_ge',
    aliases: ["cmd_elem_ge","atalho_elem_ge","abrev_elem_ge"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Germânio (Ge)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: GERMÂNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ge\n'
        txt += '🔢 *Número Atômico (Z):* 32\n'
        txt += '⚖️ *Massa Atômica:* 72.63 u\n'
        txt += '🧪 *Grupo / Família:* Semimetal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
