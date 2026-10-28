module.exports = {
    name: 'pais_argentina',
    aliases: ["cmd_pais_argentina","atalho_pais_argentina","abrev_pais_argentina"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Argentina (Capital: Buenos Aires)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ARGENTINA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Buenos Aires\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 46 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol\n'
        txt += '💵 *Moeda:* Peso Argentino (ARS)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
