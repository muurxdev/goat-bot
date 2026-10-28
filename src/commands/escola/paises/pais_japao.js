module.exports = {
    name: 'pais_japao',
    aliases: ["cmd_pais_japao","atalho_pais_japao","abrev_pais_japao"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Japão (Capital: Tóquio)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: JAPÃO* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Tóquio\n'
        txt += '🌎 *Continente:* Ásia\n'
        txt += '👥 *População Estimada:* 125 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Japonês\n'
        txt += '💵 *Moeda:* Iene (JPY)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
