module.exports = {
    name: 'elem_ni',
    aliases: ["cmd_elem_ni","atalho_elem_ni","abrev_elem_ni"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Níquel (Ni)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NÍQUEL* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Ni\n'
        txt += '🔢 *Número Atômico (Z):* 28\n'
        txt += '⚖️ *Massa Atômica:* 58.693 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
