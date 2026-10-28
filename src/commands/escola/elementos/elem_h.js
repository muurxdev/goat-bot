module.exports = {
    name: 'elem_h',
    aliases: ["cmd_elem_h","atalho_elem_h","abrev_elem_h"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Hidrogênio (H)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: HIDROGÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* H\n'
        txt += '🔢 *Número Atômico (Z):* 1\n'
        txt += '⚖️ *Massa Atômica:* 1.008 u\n'
        txt += '🧪 *Grupo / Família:* Não-metal\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
