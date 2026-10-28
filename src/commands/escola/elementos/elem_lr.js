module.exports = {
    name: 'elem_lr',
    aliases: ["cmd_elem_lr","atalho_elem_lr","abrev_elem_lr"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Laurêncio (Lr)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: LAURÊNCIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Lr\n'
        txt += '🔢 *Número Atômico (Z):* 103\n'
        txt += '⚖️ *Massa Atômica:* 266 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
