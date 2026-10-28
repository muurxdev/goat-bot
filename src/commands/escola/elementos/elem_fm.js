module.exports = {
    name: 'elem_fm',
    aliases: ["cmd_elem_fm","atalho_elem_fm","abrev_elem_fm"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Férmio (Fm)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: FÉRMIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Fm\n'
        txt += '🔢 *Número Atômico (Z):* 100\n'
        txt += '⚖️ *Massa Atômica:* 257 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
