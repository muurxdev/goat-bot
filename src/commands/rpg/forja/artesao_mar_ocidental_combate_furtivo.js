module.exports = {
    name: 'artesao_mar_ocidental_combate_furtivo',
    aliases: [],
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de combate furtivo da região de mar_ocidental',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: MAR_OCIDENTAL* ═══════╗\n\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para combate furtivo\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\n\n'
        txt += 'Consulte receitas oficiais com `.receitas`.'
        return reply(txt.trim())
    }
}
