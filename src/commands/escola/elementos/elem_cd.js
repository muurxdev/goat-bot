module.exports = {
    name: 'elem_cd',
    aliases: ["cmd_elem_cd","atalho_elem_cd","abrev_elem_cd"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cádmio (Cd)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CÁDMIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cd\n'
        txt += '🔢 *Número Atômico (Z):* 48\n'
        txt += '⚖️ *Massa Atômica:* 112.41 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
