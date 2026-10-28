module.exports = {
    name: 'elem_rh',
    aliases: ["cmd_elem_rh","atalho_elem_rh","abrev_elem_rh"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Ródio (Rh)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RÓDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Rh\n'
        txt += '🔢 *Número Atômico (Z):* 45\n'
        txt += '⚖️ *Massa Atômica:* 102.91 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
