module.exports = {
    name: 'elem_yb',
    aliases: ["cmd_elem_yb","atalho_elem_yb","abrev_elem_yb"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Itérbio (Yb)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ITÉRBIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Yb\n'
        txt += '🔢 *Número Atômico (Z):* 70\n'
        txt += '⚖️ *Massa Atômica:* 173.05 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
