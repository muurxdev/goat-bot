module.exports = {
    name: 'pais_africa_do_sul',
    aliases: ["cmd_pais_africa_do_sul","atalho_pais_africa_do_sul","abrev_pais_africa_do_sul"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de África do Sul (Capital: Pretória)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ÁFRICA DO SUL* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Pretória\n'
        txt += '🌎 *Continente:* África\n'
        txt += '👥 *População Estimada:* 60 milhões\n'
        txt += '🗣️ *Idioma Oficial:* 11 idiomas oficiais\n'
        txt += '💵 *Moeda:* Rand (ZAR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
