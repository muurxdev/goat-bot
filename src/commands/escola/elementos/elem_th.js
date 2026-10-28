module.exports = {
    name: 'elem_th',
    aliases: ["cmd_elem_th","atalho_elem_th","abrev_elem_th"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Tório (Th)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TÓRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Th\n'
        txt += '🔢 *Número Atômico (Z):* 90\n'
        txt += '⚖️ *Massa Atômica:* 232.04 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
