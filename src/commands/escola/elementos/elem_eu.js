module.exports = {
    name: 'elem_eu',
    aliases: ["cmd_elem_eu","atalho_elem_eu","abrev_elem_eu"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Európio (Eu)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: EURÓPIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Eu\n'
        txt += '🔢 *Número Atômico (Z):* 63\n'
        txt += '⚖️ *Massa Atômica:* 151.96 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
