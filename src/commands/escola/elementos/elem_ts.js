module.exports = {
    name: 'elem_ts',
    aliases: ["cmd_elem_ts","atalho_elem_ts","abrev_elem_ts"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Tenessino (Ts)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: TENESSINO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ts\n'
        txt += '🔢 *Número Atômico (Z):* 117\n'
        txt += '⚖️ *Massa Atômica:* 294 u\n'
        txt += '🧪 *Grupo / Família:* Halogênio\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sintético\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
