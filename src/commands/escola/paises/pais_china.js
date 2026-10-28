module.exports = {
    name: 'pais_china',
    aliases: ["cmd_pais_china","atalho_pais_china","abrev_pais_china"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de China (Capital: Pequim)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: CHINA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Pequim\n'
        txt += '🌎 *Continente:* Ásia\n'
        txt += '👥 *População Estimada:* 1,41 bilhão\n'
        txt += '🗣️ *Idioma Oficial:* Mandarim\n'
        txt += '💵 *Moeda:* Yuan (CNY)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
