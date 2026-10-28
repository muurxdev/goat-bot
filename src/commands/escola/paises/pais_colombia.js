module.exports = {
    name: 'pais_colombia',
    aliases: ["cmd_pais_colombia","atalho_pais_colombia","abrev_pais_colombia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Colômbia (Capital: Bogotá)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: COLÔMBIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Bogotá\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 52 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol\n'
        txt += '💵 *Moeda:* Peso Colombiano (COP)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
