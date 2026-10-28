module.exports = {
    name: 'elem_ru',
    aliases: ["cmd_elem_ru","atalho_elem_ru","abrev_elem_ru"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Rutênio (Ru)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RUTÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ru\n'
        txt += '🔢 *Número Atômico (Z):* 44\n'
        txt += '⚖️ *Massa Atômica:* 101.07 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
