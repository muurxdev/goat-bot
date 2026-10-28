module.exports = {
    name: 'elem_mo',
    aliases: ["cmd_elem_mo","atalho_elem_mo","abrev_elem_mo"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Molibdênio (Mo)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: MOLIBDÊNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Mo\n'
        txt += '🔢 *Número Atômico (Z):* 42\n'
        txt += '⚖️ *Massa Atômica:* 95.95 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
