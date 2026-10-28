module.exports = {
    name: 'elem_pa',
    aliases: ["cmd_elem_pa","atalho_elem_pa","abrev_elem_pa"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Protactínio (Pa)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PROTACTÍNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pa\n'
        txt += '🔢 *Número Atômico (Z):* 91\n'
        txt += '⚖️ *Massa Atômica:* 231.04 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
