module.exports = {
    name: 'elem_tl',
    aliases: ["cmd_elem_tl","atalho_elem_tl","abrev_elem_tl"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Tálio (Tl)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TÁLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Tl\n'
        txt += '🔢 *Número Atômico (Z):* 81\n'
        txt += '⚖️ *Massa Atômica:* 204.38 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
