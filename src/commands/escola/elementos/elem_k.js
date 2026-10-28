module.exports = {
    name: 'elem_k',
    aliases: ["cmd_elem_k","atalho_elem_k","abrev_elem_k"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Potássio (K)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: POTÁSSIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* K\n'
        txt += '🔢 *Número Atômico (Z):* 19\n'
        txt += '⚖️ *Massa Atômica:* 39.098 u\n'
        txt += '🧪 *Grupo / Família:* Metal Alcalino\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
