module.exports = {
    name: 'pais_finlandia',
    aliases: ["cmd_pais_finlandia","atalho_pais_finlandia","abrev_pais_finlandia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Finlândia (Capital: Helsinque)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: FINLÂNDIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Helsinque\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 5,5 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Finlandês e Sueco\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
