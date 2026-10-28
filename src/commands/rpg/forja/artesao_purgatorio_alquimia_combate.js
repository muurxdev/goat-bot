module.exports = {
    name: 'artesao_purgatorio_alquimia_combate',
    aliases: [],
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de alquimia combate da região de purgatorio',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: PURGATORIO* ═══════╗\n\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para alquimia combate\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\n\n'
        txt += 'Consulte receitas oficiais com `.receitas`.'
        return reply(txt.trim())
    }
}
