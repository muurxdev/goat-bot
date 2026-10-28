module.exports = {
    name: 'pais_holanda',
    aliases: ["cmd_pais_holanda","atalho_pais_holanda","abrev_pais_holanda"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Holanda / Países Baixos (Capital: Amsterdã)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: HOLANDA / PAÍSES BAIXOS* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Amsterdã\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 17,8 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Holandês\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
