module.exports = {
    name: 'pais_alemanha',
    aliases: ["cmd_pais_alemanha","atalho_pais_alemanha","abrev_pais_alemanha"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Alemanha (Capital: Berlim)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ALEMANHA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Berlim\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 84 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Alemão\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
