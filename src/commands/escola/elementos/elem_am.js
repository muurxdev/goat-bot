module.exports = {
    name: 'elem_am',
    aliases: ["cmd_elem_am","atalho_elem_am","abrev_elem_am"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Amerício (Am)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: AMERÍCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Am\n'
        txt += '🔢 *Número Atômico (Z):* 95\n'
        txt += '⚖️ *Massa Atômica:* 243 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
