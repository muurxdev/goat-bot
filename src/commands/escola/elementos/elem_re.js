module.exports = {
    name: 'elem_re',
    aliases: ["cmd_elem_re","atalho_elem_re","abrev_elem_re"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Rênio (Re)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Re\n'
        txt += '🔢 *Número Atômico (Z):* 75\n'
        txt += '⚖️ *Massa Atômica:* 186.21 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
