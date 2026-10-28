module.exports = {
    name: 'elem_sr',
    aliases: ["cmd_elem_sr","atalho_elem_sr","abrev_elem_sr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Estrôncio (Sr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ESTRÔNCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Sr\n'
        txt += '🔢 *Número Atômico (Z):* 38\n'
        txt += '⚖️ *Massa Atômica:* 87.62 u\n'
        txt += '🧪 *Grupo / Família:* Alcalino-terroso\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
