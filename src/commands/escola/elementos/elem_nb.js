module.exports = {
    name: 'elem_nb',
    aliases: ["cmd_elem_nb","atalho_elem_nb","abrev_elem_nb"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Nióbio (Nb)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NIÓBIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Nb\n'
        txt += '🔢 *Número Atômico (Z):* 41\n'
        txt += '⚖️ *Massa Atômica:* 92.906 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
