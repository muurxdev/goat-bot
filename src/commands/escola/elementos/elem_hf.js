module.exports = {
    name: 'elem_hf',
    aliases: ["cmd_elem_hf","atalho_elem_hf","abrev_elem_hf"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Háfnio (Hf)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: HÁFNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Hf\n'
        txt += '🔢 *Número Atômico (Z):* 72\n'
        txt += '⚖️ *Massa Atômica:* 178.49 u\n'
        txt += '🧪 *Grupo / Família:* Metal de Transição\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
