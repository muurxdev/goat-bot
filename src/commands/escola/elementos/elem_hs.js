module.exports = {
    name: 'elem_hs',
    aliases: ["cmd_elem_hs","atalho_elem_hs","abrev_elem_hs"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Hássio (Hs)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: HÁSSIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Hs\n'
        txt += '🔢 *Número Atômico (Z):* 108\n'
        txt += '⚖️ *Massa Atômica:* 269 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
