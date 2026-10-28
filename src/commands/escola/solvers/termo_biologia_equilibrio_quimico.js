module.exports = {
    name: 'termo_biologia_equilibrio_quimico',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de equilibrio quimico',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: EQUILIBRIO QUIMICO* ═══════╗\n\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\n'
        txt += '🏷️ *Grande Área:* BIOLOGIA'
        return reply(txt.trim())
    }
}
