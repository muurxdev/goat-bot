module.exports = {
    name: 'elem_tc',
    aliases: ["cmd_elem_tc","atalho_elem_tc","abrev_elem_tc"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Tecnécio (Tc)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TECNÉCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Tc\n'
        txt += '🔢 *Número Atômico (Z):* 43\n'
        txt += '⚖️ *Massa Atômica:* 98 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
