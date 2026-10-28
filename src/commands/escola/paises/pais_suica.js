module.exports = {
    name: 'pais_suica',
    aliases: ["cmd_pais_suica","atalho_pais_suica","abrev_pais_suica"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Suíça (Capital: Berna)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: SUÍÇA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Berna\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 8,8 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Alemão, Francês e Italiano\n'
        txt += '💵 *Moeda:* Franco Suíço (CHF)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
