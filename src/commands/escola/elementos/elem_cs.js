module.exports = {
    name: 'elem_cs',
    aliases: ["cmd_elem_cs","atalho_elem_cs","abrev_elem_cs"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Césio (Cs)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: CÉSIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Cs\n'
        txt += '🔢 *Número Atômico (Z):* 55\n'
        txt += '⚖️ *Massa Atômica:* 132.91 u\n'
        txt += '🧪 *Grupo / Família:* Metal Alcalino\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
