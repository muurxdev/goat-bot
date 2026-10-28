module.exports = {
    name: 'elem_nh',
    aliases: ["cmd_elem_nh","atalho_elem_nh","abrev_elem_nh"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Nihônio (Nh)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NIHÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Nh\n'
        txt += '🔢 *Número Atômico (Z):* 113\n'
        txt += '⚖️ *Massa Atômica:* 286 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
