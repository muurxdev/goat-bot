module.exports = {
    name: 'elem_mt',
    aliases: ["cmd_elem_mt","atalho_elem_mt","abrev_elem_mt"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Meitnério (Mt)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MEITNÉRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Mt\n'
        txt += '🔢 *Número Atômico (Z):* 109\n'
        txt += '⚖️ *Massa Atômica:* 278 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
