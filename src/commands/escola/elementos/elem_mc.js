module.exports = {
    name: 'elem_mc',
    aliases: ["cmd_elem_mc","atalho_elem_mc","abrev_elem_mc"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Moscóvio (Mc)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MOSCÓVIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Mc\n'
        txt += '🔢 *Número Atômico (Z):* 115\n'
        txt += '⚖️ *Massa Atômica:* 290 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
