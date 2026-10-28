module.exports = {
    name: 'elem_ac',
    aliases: ["cmd_elem_ac","atalho_elem_ac","abrev_elem_ac"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Actínio (Ac)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ACTÍNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ac\n'
        txt += '🔢 *Número Atômico (Z):* 89\n'
        txt += '⚖️ *Massa Atômica:* 227 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
