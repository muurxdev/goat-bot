module.exports = {
    name: 'elem_kr',
    aliases: ["cmd_elem_kr","atalho_elem_kr","abrev_elem_kr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Criptônio (Kr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CRIPTÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Kr\n'
        txt += '🔢 *Número Atômico (Z):* 36\n'
        txt += '⚖️ *Massa Atômica:* 83.798 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
