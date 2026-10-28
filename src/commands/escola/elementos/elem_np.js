module.exports = {
    name: 'elem_np',
    aliases: ["cmd_elem_np","atalho_elem_np","abrev_elem_np"],
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento Netúnio (Np)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: NETÚNIO* ═══════╗\n\n'
        txt += '🏷️ *Símbolo:* Np\n'
        txt += '🔢 *Número Atômico (Z):* 93\n'
        txt += '⚖️ *Massa Atômica:* 237 u\n'
        txt += '🧪 *Grupo / Família:* Actinídeo\n'
        txt += '🌡️ *Estado Físico a 25°C:* Sólido\n\n'
        txt += '💡 Consulte a tabela completa com `.tabelaperiodica`.'
        return reply(txt.trim())
    }
}
