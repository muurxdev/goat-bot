module.exports = {
    name: 'elem_he',
    aliases: ["cmd_elem_he","atalho_elem_he","abrev_elem_he"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Hélio (He)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: HÉLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* He\n'
        txt += '🔢 *Número Atômico (Z):* 2\n'
        txt += '⚖️ *Massa Atômica:* 4.0026 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
