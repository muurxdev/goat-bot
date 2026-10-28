module.exports = {
    name: 'elem_b',
    aliases: ["cmd_elem_b","atalho_elem_b","abrev_elem_b"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Boro (B)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BORO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* B\n'
        txt += '🔢 *Número Atômico (Z):* 5\n'
        txt += '⚖️ *Massa Atômica:* 10.81 u\n'
        txt += '🧪 *Grupo / Família:* Semimetal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
