module.exports = {
    name: 'pais_canada',
    aliases: ["cmd_pais_canada","atalho_pais_canada","abrev_pais_canada"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Canadá (Capital: Ottawa)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: CANADÁ* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Ottawa\n'
        txt += '🌎 *Continente:* América do Norte\n'
        txt += '👥 *População Estimada:* 39 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Inglês e Francês\n'
        txt += '💵 *Moeda:* Dólar Canadense (CAD)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
