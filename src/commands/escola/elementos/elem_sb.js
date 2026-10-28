module.exports = {
    name: 'elem_sb',
    aliases: ["cmd_elem_sb","atalho_elem_sb","abrev_elem_sb"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Antimônio (Sb)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ANTIMÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Sb\n'
        txt += '🔢 *Número Atômico (Z):* 51\n'
        txt += '⚖️ *Massa Atômica:* 121.76 u\n'
        txt += '🧪 *Grupo / Família:* Semimetal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
