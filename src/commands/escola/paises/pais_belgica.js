module.exports = {
    name: 'pais_belgica',
    aliases: ["cmd_pais_belgica","atalho_pais_belgica","abrev_pais_belgica"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Bélgica (Capital: Bruxelas)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: BÉLGICA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Bruxelas\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 11,7 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Holandês, Francês e Alemão\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
