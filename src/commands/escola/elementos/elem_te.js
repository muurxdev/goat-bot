module.exports = {
    name: 'elem_te',
    aliases: ["cmd_elem_te","atalho_elem_te","abrev_elem_te"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Telúrio (Te)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TELÚRIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Te\n'
        txt += '🔢 *Número Atômico (Z):* 52\n'
        txt += '⚖️ *Massa Atômica:* 127.60 u\n'
        txt += '🧪 *Grupo / Família:* Calcogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
