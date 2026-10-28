module.exports = {
    name: 'elem_og',
    aliases: ["cmd_elem_og","atalho_elem_og","abrev_elem_og"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Oganessônio (Og)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: OGANESSÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Og\n'
        txt += '🔢 *Número Atômico (Z):* 118\n'
        txt += '⚖️ *Massa Atômica:* 294 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
