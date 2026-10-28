module.exports = {
    name: 'elem_po',
    aliases: ["cmd_elem_po","atalho_elem_po","abrev_elem_po"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Polônio (Po)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: POLÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Po\n'
        txt += '🔢 *Número Atômico (Z):* 84\n'
        txt += '⚖️ *Massa Atômica:* 209 u\n'
        txt += '🧪 *Grupo / Família:* Semimetal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
