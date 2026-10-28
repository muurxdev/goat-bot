module.exports = {
    name: 'artesao_orlondi_alquimia_combate',
    aliases: [],
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de alquimia combate da região de orlondi',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: ORLONDI* ═══════╗\n\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para alquimia combate\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\n\n'
        txt += 'Consulte receitas oficiais com `.receitas`.'
        return reply(txt.trim())
    }
}
