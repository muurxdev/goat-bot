module.exports = {
    name: 'pais_portugal',
    aliases: ["cmd_pais_portugal","atalho_pais_portugal","abrev_pais_portugal"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Portugal (Capital: Lisboa)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: PORTUGAL* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Lisboa\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 10,3 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Português\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
