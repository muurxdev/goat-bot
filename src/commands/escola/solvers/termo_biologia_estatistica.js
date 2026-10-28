module.exports = {
    name: 'termo_biologia_estatistica',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de estatistica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: ESTATISTICA* ═══════╗\n\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\n'
        txt += '🏷️ *Grande Área:* BIOLOGIA'
        return reply(txt.trim())
    }
}
