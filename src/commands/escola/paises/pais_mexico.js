module.exports = {
    name: 'pais_mexico',
    aliases: ["cmd_pais_mexico","atalho_pais_mexico","abrev_pais_mexico"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de México (Capital: Cidade do México)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: MÉXICO* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Cidade do México\n'
        txt += '🌎 *Continente:* América do Norte\n'
        txt += '👥 *População Estimada:* 128 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol\n'
        txt += '💵 *Moeda:* Peso Mexicano (MXN)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
