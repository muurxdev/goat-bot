module.exports = {
    name: 'elem_gd',
    aliases: ["cmd_elem_gd","atalho_elem_gd","abrev_elem_gd"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Gadolínio (Gd)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: GADOLÍNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Gd\n'
        txt += '🔢 *Número Atômico (Z):* 64\n'
        txt += '⚖️ *Massa Atômica:* 157.25 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
