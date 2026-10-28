module.exports = {
    name: 'elem_ir',
    aliases: ["cmd_elem_ir","atalho_elem_ir","abrev_elem_ir"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Irídio (Ir)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: IRÍDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ir\n'
        txt += '🔢 *Número Atômico (Z):* 77\n'
        txt += '⚖️ *Massa Atômica:* 192.22 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
