module.exports = {
    name: 'pais_turquia',
    aliases: ["cmd_pais_turquia","atalho_pais_turquia","abrev_pais_turquia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Turquia (Capital: Ancara)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: TURQUIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Ancara\n'
        txt += '🌎 *Continente:* Eurásia\n'
        txt += '👥 *População Estimada:* 85 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Turco\n'
        txt += '💵 *Moeda:* Lira Turca (TRY)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
