module.exports = {
    name: 'pais_australia',
    aliases: ["cmd_pais_australia","atalho_pais_australia","abrev_pais_australia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Austrália (Capital: Camberra)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: AUSTRÁLIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Camberra\n'
        txt += '🌎 *Continente:* Oceania\n'
        txt += '👥 *População Estimada:* 26 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Inglês\n'
        txt += '💵 *Moeda:* Dólar Australiano (AUD)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
