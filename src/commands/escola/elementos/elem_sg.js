module.exports = {
    name: 'elem_sg',
    aliases: ["cmd_elem_sg","atalho_elem_sg","abrev_elem_sg"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Seabórgio (Sg)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: SEABÓRGIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Sg\n'
        txt += '🔢 *Número Atômico (Z):* 106\n'
        txt += '⚖️ *Massa Atômica:* 269 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
