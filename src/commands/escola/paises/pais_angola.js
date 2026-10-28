module.exports = {
    name: 'pais_angola',
    aliases: ["cmd_pais_angola","atalho_pais_angola","abrev_pais_angola"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Angola (Capital: Luanda)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ANGOLA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Luanda\n'
        txt += '🌎 *Continente:* África\n'
        txt += '👥 *População Estimada:* 35 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Português\n'
        txt += '💵 *Moeda:* Kwanza (AOA)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
