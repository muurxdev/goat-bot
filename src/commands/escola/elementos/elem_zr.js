module.exports = {
    name: 'elem_zr',
    aliases: ["cmd_elem_zr","atalho_elem_zr","abrev_elem_zr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Zircônio (Zr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ZIRCÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Zr\n'
        txt += '🔢 *Número Atômico (Z):* 40\n'
        txt += '⚖️ *Massa Atômica:* 91.224 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
