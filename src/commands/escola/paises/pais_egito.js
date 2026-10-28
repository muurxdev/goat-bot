module.exports = {
    name: 'pais_egito',
    aliases: ["cmd_pais_egito","atalho_pais_egito","abrev_pais_egito"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Egito (Capital: Cairo)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: EGITO* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Cairo\n'
        txt += '🌎 *Continente:* África\n'
        txt += '👥 *População Estimada:* 109 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Árabe\n'
        txt += '💵 *Moeda:* Libra Egípcia (EGP)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
