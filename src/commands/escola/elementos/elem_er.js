module.exports = {
    name: 'elem_er',
    aliases: ["cmd_elem_er","atalho_elem_er","abrev_elem_er"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Érbio (Er)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ÉRBIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Er\n'
        txt += '🔢 *Número Atômico (Z):* 68\n'
        txt += '⚖️ *Massa Atômica:* 167.26 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
