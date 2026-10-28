module.exports = {
    name: 'termo_fisica_dinamica',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de dinamica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: DINAMICA* ═══════╗\n\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\n'
        txt += '🏷️ *Grande Área:* FISICA'
        return reply(txt.trim())
    }
}
