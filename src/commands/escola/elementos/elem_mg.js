module.exports = {
    name: 'elem_mg',
    aliases: ["cmd_elem_mg","atalho_elem_mg","abrev_elem_mg"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Magnésio (Mg)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MAGNÉSIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Mg\n'
        txt += '🔢 *Número Atômico (Z):* 12\n'
        txt += '⚖️ *Massa Atômica:* 24.305 u\n'
        txt += '🧪 *Grupo / Família:* Alcalino-terroso\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
