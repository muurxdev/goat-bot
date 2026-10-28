module.exports = {
    name: 'artesao_purgatorio_domestica_feras',
    aliases: [],
    category: 'rpg',
    subcategory: 'Artesanato Marcial',
    description: 'Manual de manufatura de suprimentos de domestica feras da região de purgatorio',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *MANUAL DO ARTESÃO: PURGATORIO* ═══════╗\n\n'
        txt += '📦 *Especialidade Regional:* Suprimentos para domestica feras\n'
        txt += '⭐ *Qualidade dos Materiais:* Aço nobre e madeira encantada\n\n'
        txt += 'Consulte receitas oficiais com `.receitas`.'
        return reply(txt.trim())
    }
}
