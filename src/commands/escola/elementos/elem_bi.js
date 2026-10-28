module.exports = {
    name: 'elem_bi',
    aliases: ["cmd_elem_bi","atalho_elem_bi","abrev_elem_bi"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Bismuto (Bi)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BISMUTO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Bi\n'
        txt += '🔢 *Número Atômico (Z):* 83\n'
        txt += '⚖️ *Massa Atômica:* 208.98 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
