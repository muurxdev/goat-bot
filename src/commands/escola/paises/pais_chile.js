module.exports = {
    name: 'pais_chile',
    aliases: ["cmd_pais_chile","atalho_pais_chile","abrev_pais_chile"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Chile (Capital: Santiago)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: CHILE* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Santiago\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 19 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol\n'
        txt += '💵 *Moeda:* Peso Chileno (CLP)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
