module.exports = {
    name: 'elem_sn',
    aliases: ["cmd_elem_sn","atalho_elem_sn","abrev_elem_sn"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Estanho (Sn)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ESTANHO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Sn\n'
        txt += '🔢 *Número Atômico (Z):* 50\n'
        txt += '⚖️ *Massa Atômica:* 118.71 u\n'
        txt += '🧪 *Grupo / Família:* Metal Pós-transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
