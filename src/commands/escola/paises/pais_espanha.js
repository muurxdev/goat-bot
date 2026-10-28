module.exports = {
    name: 'pais_espanha',
    aliases: ["cmd_pais_espanha","atalho_pais_espanha","abrev_pais_espanha"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Espanha (Capital: Madri)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ESPANHA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Madri\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 48 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
