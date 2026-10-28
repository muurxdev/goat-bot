module.exports = {
    name: 'elem_es',
    aliases: ["cmd_elem_es","atalho_elem_es","abrev_elem_es"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Einstênio (Es)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: EINSTÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Es\n'
        txt += '🔢 *Número Atômico (Z):* 99\n'
        txt += '⚖️ *Massa Atômica:* 252 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
