module.exports = {
    name: 'pais_franca',
    aliases: ["cmd_pais_franca","atalho_pais_franca","abrev_pais_franca"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de França (Capital: Paris)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: FRANÇA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Paris\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 68 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Francês\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
