module.exports = {
    name: 'pais_grecia',
    aliases: ["cmd_pais_grecia","atalho_pais_grecia","abrev_pais_grecia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Grécia (Capital: Atenas)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: GRÉCIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Atenas\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 10,4 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Grego\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
