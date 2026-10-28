module.exports = {
    name: 'elem_tb',
    aliases: ["cmd_elem_tb","atalho_elem_tb","abrev_elem_tb"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Térbio (Tb)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TÉRBIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Tb\n'
        txt += '🔢 *Número Atômico (Z):* 65\n'
        txt += '⚖️ *Massa Atômica:* 158.93 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
