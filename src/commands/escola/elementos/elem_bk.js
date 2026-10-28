module.exports = {
    name: 'elem_bk',
    aliases: ["cmd_elem_bk","atalho_elem_bk","abrev_elem_bk"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Berquélio (Bk)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: BERQUÉLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Bk\n'
        txt += '🔢 *Número Atômico (Z):* 97\n'
        txt += '⚖️ *Massa Atômica:* 247 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
