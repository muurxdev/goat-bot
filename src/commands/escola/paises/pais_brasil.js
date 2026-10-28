module.exports = {
    name: 'pais_brasil',
    aliases: ["cmd_pais_brasil","atalho_pais_brasil","abrev_pais_brasil"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Brasil (Capital: Brasília)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: BRASIL* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Brasília\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 215 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Português\n'
        txt += '💵 *Moeda:* Real (BRL)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
