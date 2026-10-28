module.exports = {
    name: 'elem_pm',
    aliases: ["cmd_elem_pm","atalho_elem_pm","abrev_elem_pm"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Promécio (Pm)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PROMÉCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pm\n'
        txt += '🔢 *Número Atômico (Z):* 61\n'
        txt += '⚖️ *Massa Atômica:* 145 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
