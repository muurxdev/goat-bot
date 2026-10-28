module.exports = {
    name: 'elem_as',
    aliases: ["cmd_elem_as","atalho_elem_as","abrev_elem_as"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Arsênio (As)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ARSÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* As\n'
        txt += '🔢 *Número Atômico (Z):* 33\n'
        txt += '⚖️ *Massa Atômica:* 74.922 u\n'
        txt += '🧪 *Grupo / Família:* Semimetal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
