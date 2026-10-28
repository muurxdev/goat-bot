module.exports = {
    name: 'elem_at',
    aliases: ["cmd_elem_at","atalho_elem_at","abrev_elem_at"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Ástato (At)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ÁSTATO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* At\n'
        txt += '🔢 *Número Atômico (Z):* 85\n'
        txt += '⚖️ *Massa Atômica:* 210 u\n'
        txt += '🧪 *Grupo / Família:* Halogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
