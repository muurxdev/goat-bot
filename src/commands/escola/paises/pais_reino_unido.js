module.exports = {
    name: 'pais_reino_unido',
    aliases: ["cmd_pais_reino_unido","atalho_pais_reino_unido","abrev_pais_reino_unido"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Reino Unido (Capital: Londres)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: REINO UNIDO* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Londres\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 67 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Inglês\n'
        txt += '💵 *Moeda:* Libra Esterlina (GBP)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
