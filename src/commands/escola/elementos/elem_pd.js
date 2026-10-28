module.exports = {
    name: 'elem_pd',
    aliases: ["cmd_elem_pd","atalho_elem_pd","abrev_elem_pd"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Paládio (Pd)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PALÁDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pd\n'
        txt += '🔢 *Número Atômico (Z):* 46\n'
        txt += '⚖️ *Massa Atômica:* 106.42 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
