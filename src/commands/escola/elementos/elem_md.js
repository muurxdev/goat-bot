module.exports = {
    name: 'elem_md',
    aliases: ["cmd_elem_md","atalho_elem_md","abrev_elem_md"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Mendelévio (Md)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MENDELÉVIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Md\n'
        txt += '🔢 *Número Atômico (Z):* 101\n'
        txt += '⚖️ *Massa Atômica:* 258 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
