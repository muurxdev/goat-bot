module.exports = {
    name: 'elem_mn',
    aliases: ["cmd_elem_mn","atalho_elem_mn","abrev_elem_mn"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Manganês (Mn)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MANGANÊS* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Mn\n'
        txt += '🔢 *Número Atômico (Z):* 25\n'
        txt += '⚖️ *Massa Atômica:* 54.938 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
