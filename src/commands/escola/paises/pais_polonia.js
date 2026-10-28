module.exports = {
    name: 'pais_polonia',
    aliases: ["cmd_pais_polonia","atalho_pais_polonia","abrev_pais_polonia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Polônia (Capital: Varsóvia)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: POLÔNIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Varsóvia\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 38 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Polonês\n'
        txt += '💵 *Moeda:* Zloty (PLN)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
