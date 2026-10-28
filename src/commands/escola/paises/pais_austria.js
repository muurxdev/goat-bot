module.exports = {
    name: 'pais_austria',
    aliases: ["cmd_pais_austria","atalho_pais_austria","abrev_pais_austria"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Áustria (Capital: Viena)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ÁUSTRIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Viena\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 9,1 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Alemão\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
