module.exports = {
    name: 'termo_portugues_ondulatoria',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de ondulatoria',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: ONDULATORIA* ═══════╗\n\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\n'
        txt += '🏷️ *Grande Área:* PORTUGUES'
        return reply(txt.trim())
    }
}
