module.exports = {
    name: 'elem_nd',
    aliases: ["cmd_elem_nd","atalho_elem_nd","abrev_elem_nd"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Neodímio (Nd)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NEODÍMIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Nd\n'
        txt += '🔢 *Número Atômico (Z):* 60\n'
        txt += '⚖️ *Massa Atômica:* 144.24 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
