module.exports = {
    name: 'elem_pu',
    aliases: ["cmd_elem_pu","atalho_elem_pu","abrev_elem_pu"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Plutônio (Pu)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: PLUTÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Pu\n'
        txt += '🔢 *Número Atômico (Z):* 94\n'
        txt += '⚖️ *Massa Atômica:* 244 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
