module.exports = {
    name: 'pais_eua',
    aliases: ["cmd_pais_eua","atalho_pais_eua","abrev_pais_eua"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Estados Unidos (Capital: Washington D.C.)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ESTADOS UNIDOS* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Washington D.C.\n'
        txt += '🌎 *Continente:* América do Norte\n'
        txt += '👥 *População Estimada:* 334 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Inglês\n'
        txt += '💵 *Moeda:* Dólar (USD)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
