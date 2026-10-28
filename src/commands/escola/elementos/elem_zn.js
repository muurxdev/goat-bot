module.exports = {
    name: 'elem_zn',
    aliases: ["cmd_elem_zn","atalho_elem_zn","abrev_elem_zn"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Zinco (Zn)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ZINCO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Zn\n'
        txt += '🔢 *Número Atômico (Z):* 30\n'
        txt += '⚖️ *Massa Atômica:* 65.38 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
