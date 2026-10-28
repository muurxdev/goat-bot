module.exports = {
    name: 'pais_italia',
    aliases: ["cmd_pais_italia","atalho_pais_italia","abrev_pais_italia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Itália (Capital: Roma)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ITÁLIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Roma\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 59 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Italiano\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
