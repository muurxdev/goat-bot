module.exports = {
    name: 'artesao_floresta_fadas_tiro_arco',
    aliases: [],
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de tiro arco da região de floresta_fadas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: FLORESTA_FADAS* ═══════╗\n\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para tiro arco\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\n\n'
        txt += 'Consulte receitas oficiais com `.receitas`.'
        return reply(txt.trim())
    }
}
