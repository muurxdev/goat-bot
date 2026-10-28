module.exports = {
    name: 'pais_russia',
    aliases: ["cmd_pais_russia","atalho_pais_russia","abrev_pais_russia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Rússia (Capital: Moscou)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: RÚSSIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Moscou\n'
        txt += '🌎 *Continente:* Eurásia\n'
        txt += '👥 *População Estimada:* 144 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Russo\n'
        txt += '💵 *Moeda:* Rublo (RUB)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
