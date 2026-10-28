module.exports = {
    name: 'elem_ra',
    aliases: ["cmd_elem_ra","atalho_elem_ra","abrev_elem_ra"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Rádio (Ra)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: RÁDIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ra\n'
        txt += '🔢 *Número Atômico (Z):* 88\n'
        txt += '⚖️ *Massa Atômica:* 226 u\n'
        txt += '🧪 *Grupo / Família:* Alcalino-terroso\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
