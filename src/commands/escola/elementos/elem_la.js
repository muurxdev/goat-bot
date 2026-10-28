module.exports = {
    name: 'elem_la',
    aliases: ["cmd_elem_la","atalho_elem_la","abrev_elem_la"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Lantânio (La)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: LANTÂNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* La\n'
        txt += '🔢 *Número Atômico (Z):* 57\n'
        txt += '⚖️ *Massa Atômica:* 138.91 u\n'
        txt += '🧪 *Grupo / Família:* Lantanídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
