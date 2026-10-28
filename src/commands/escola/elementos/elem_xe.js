module.exports = {
    name: 'elem_xe',
    aliases: ["cmd_elem_xe","atalho_elem_xe","abrev_elem_xe"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Xenônio (Xe)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: XENÔNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Xe\n'
        txt += '🔢 *Número Atômico (Z):* 54\n'
        txt += '⚖️ *Massa Atômica:* 131.29 u\n'
        txt += '🧪 *Grupo / Família:* Gás Nobre\n'
        txt += '🌡️ *Estado Físico a 25°C:* Gás\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
