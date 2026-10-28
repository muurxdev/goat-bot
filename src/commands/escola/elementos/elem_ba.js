module.exports = {
    name: 'elem_ba',
    aliases: ["cmd_elem_ba","atalho_elem_ba","abrev_elem_ba"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Bário (Ba)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BÁRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ba\n'
        txt += '🔢 *Número Atômico (Z):* 56\n'
        txt += '⚖️ *Massa Atômica:* 137.33 u\n'
        txt += '🧪 *Grupo / Família:* Alcalino-terroso\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
