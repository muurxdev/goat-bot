module.exports = {
    name: 'elem_ca',
    aliases: ["cmd_elem_ca","atalho_elem_ca","abrev_elem_ca"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Cálcio (Ca)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CÁLCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ca\n'
        txt += '🔢 *Número Atômico (Z):* 20\n'
        txt += '⚖️ *Massa Atômica:* 40.078 u\n'
        txt += '🧪 *Grupo / Família:* Alcalino-terroso\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
