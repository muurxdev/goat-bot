module.exports = {
    name: 'artesao_cidadedourada_tiro_arco',
    aliases: [],
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de tiro arco da região de cidade dourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: CIDADE DOURADA* ═══════╗\n\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para tiro arco\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\n\n'
        txt += 'Consulte receitas oficiais com `.receitas`.'
        return reply(txt.trim())
    }
}
