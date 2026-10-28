module.exports = {
    name: 'elem_fr',
    aliases: ["cmd_elem_fr","atalho_elem_fr","abrev_elem_fr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Frâncio (Fr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: FRÂNCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Fr\n'
        txt += '🔢 *Número Atômico (Z):* 87\n'
        txt += '⚖️ *Massa Atômica:* 223 u\n'
        txt += '🧪 *Grupo / Família:* Metal Alcalino\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
