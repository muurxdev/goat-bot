module.exports = {
    name: 'elem_sm',
    aliases: ["cmd_elem_sm","atalho_elem_sm","abrev_elem_sm"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Samário (Sm)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: SAMÁRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Sm\n'
        txt += '🔢 *Número Atômico (Z):* 62\n'
        txt += '⚖️ *Massa Atômica:* 150.36 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
