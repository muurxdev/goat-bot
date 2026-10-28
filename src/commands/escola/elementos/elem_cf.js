module.exports = {
    name: 'elem_cf',
    aliases: ["cmd_elem_cf","atalho_elem_cf","abrev_elem_cf"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Califórnio (Cf)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CALIFÓRNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cf\n'
        txt += '🔢 *Número Atômico (Z):* 98\n'
        txt += '⚖️ *Massa Atômica:* 251 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
