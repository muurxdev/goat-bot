module.exports = {
    name: 'elem_ds',
    aliases: ["cmd_elem_ds","atalho_elem_ds","abrev_elem_ds"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Darmstádtio (Ds)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: DARMSTÁDTIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ds\n'
        txt += '🔢 *Número Atômico (Z):* 110\n'
        txt += '⚖️ *Massa Atômica:* 281 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
