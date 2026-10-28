module.exports = {
    name: 'pais_nova_zelandia',
    aliases: ["cmd_pais_nova_zelandia","atalho_pais_nova_zelandia","abrev_pais_nova_zelandia"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Nova Zelândia (Capital: Wellington)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: NOVA ZELÂNDIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Wellington\n'
        txt += '🌎 *Continente:* Oceania\n'
        txt += '👥 *População Estimada:* 5,1 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Inglês e Maori\n'
        txt += '💵 *Moeda:* Dólar Neozelandês (NZD)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
