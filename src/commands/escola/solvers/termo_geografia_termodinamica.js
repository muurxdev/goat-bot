module.exports = {
    name: 'termo_geografia_termodinamica',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de termodinamica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: TERMODINAMICA* ═══════╗\n\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\n'
        txt += '🏷️ *Grande Área:* GEOGRAFIA'
        return reply(txt.trim())
    }
}
