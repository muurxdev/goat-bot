module.exports = {
    name: 'pais_noruega',
    aliases: ["cmd_pais_noruega","atalho_pais_noruega","abrev_pais_noruega"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Noruega (Capital: Oslo)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: NORUEGA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Oslo\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 5,5 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Norueguês\n'
        txt += '💵 *Moeda:* Coroa Norueguesa (NOK)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
