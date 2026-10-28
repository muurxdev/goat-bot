module.exports = {
    name: 'elem_rb',
    aliases: ["cmd_elem_rb","atalho_elem_rb","abrev_elem_rb"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Rubídio (Rb)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RUBÍDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Rb\n'
        txt += '🔢 *Número Atômico (Z):* 37\n'
        txt += '⚖️ *Massa Atômica:* 85.468 u\n'
        txt += '🧪 *Grupo / Família:* Metal Alcalino\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
