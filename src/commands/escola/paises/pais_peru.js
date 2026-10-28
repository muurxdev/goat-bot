module.exports = {
    name: 'pais_peru',
    aliases: ["cmd_pais_peru","atalho_pais_peru","abrev_pais_peru"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Peru (Capital: Lima)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: PERU* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Lima\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 34 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol e Quechua\n'
        txt += '💵 *Moeda:* Sol (PEN)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
