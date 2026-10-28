module.exports = {
    name: 'termo_geografia_geometria_espacial',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de geometria espacial',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: GEOMETRIA ESPACIAL* ═══════╗\n\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\n'
        txt += '🏷️ *Grande Área:* GEOGRAFIA'
        return reply(txt.trim())
    }
}
