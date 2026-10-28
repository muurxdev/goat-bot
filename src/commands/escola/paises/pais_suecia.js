module.exports = {
    name: 'pais_suecia',
    aliases: ["cmd_pais_suecia","atalho_pais_suecia","abrev_pais_suecia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Suécia (Capital: Estocolmo)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: SUÉCIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Estocolmo\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 10,5 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Sueco\n'
        txt += '💵 *Moeda:* Coroa Sueca (SEK)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
