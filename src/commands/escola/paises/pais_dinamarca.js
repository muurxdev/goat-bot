module.exports = {
    name: 'pais_dinamarca',
    aliases: ["cmd_pais_dinamarca","atalho_pais_dinamarca","abrev_pais_dinamarca"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Dinamarca (Capital: Copenhague)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: DINAMARCA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Copenhague\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 5,9 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Dinamarquês\n'
        txt += '💵 *Moeda:* Coroa Dinamarquesa (DKK)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
