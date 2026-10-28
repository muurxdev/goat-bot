module.exports = {
    name: 'elem_no',
    aliases: ["cmd_elem_no","atalho_elem_no","abrev_elem_no"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Nobélio (No)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NOBÉLIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* No\n'
        txt += '🔢 *Número Atômico (Z):* 102\n'
        txt += '⚖️ *Massa Atômica:* 259 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
