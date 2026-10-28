module.exports = {
    name: 'elem_c',
    aliases: ["cmd_elem_c","atalho_elem_c","abrev_elem_c"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Carbono (C)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CARBONO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* C\n'
        txt += '🔢 *Número Atômico (Z):* 6\n'
        txt += '⚖️ *Massa Atômica:* 12.011 u\n'
        txt += '🧪 *Grupo / Família:* Não-metal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
