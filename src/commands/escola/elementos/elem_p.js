module.exports = {
    name: 'elem_p',
    aliases: ["cmd_elem_p","atalho_elem_p","abrev_elem_p"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Fósforo (P)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: FÓSFORO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* P\n'
        txt += '🔢 *Número Atômico (Z):* 15\n'
        txt += '⚖️ *Massa Atômica:* 30.974 u\n'
        txt += '🧪 *Grupo / Família:* Não-metal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
