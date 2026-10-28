module.exports = {
    name: 'elem_ar',
    aliases: ["cmd_elem_ar","atalho_elem_ar","abrev_elem_ar"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Argônio (Ar)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ARGÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ar\n'
        txt += '🔢 *Número Atômico (Z):* 18\n'
        txt += '⚖️ *Massa Atômica:* 39.948 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
