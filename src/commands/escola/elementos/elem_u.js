module.exports = {
    name: 'elem_u',
    aliases: ["cmd_elem_u","atalho_elem_u","abrev_elem_u"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Urânio (U)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: URÂNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* U\n'
        txt += '🔢 *Número Atômico (Z):* 92\n'
        txt += '⚖️ *Massa Atômica:* 238.03 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
