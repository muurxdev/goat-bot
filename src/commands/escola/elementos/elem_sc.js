module.exports = {
    name: 'elem_sc',
    aliases: ["cmd_elem_sc","atalho_elem_sc","abrev_elem_sc"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Escândio (Sc)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ESCÂNDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Sc\n'
        txt += '🔢 *Número Atômico (Z):* 21\n'
        txt += '⚖️ *Massa Atômica:* 44.956 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
