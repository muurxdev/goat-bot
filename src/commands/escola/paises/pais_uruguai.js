module.exports = {
    name: 'pais_uruguai',
    aliases: ["cmd_pais_uruguai","atalho_pais_uruguai","abrev_pais_uruguai"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Uruguai (Capital: Montevidéu)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: URUGUAI* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Montevidéu\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 3,4 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol\n'
        txt += '💵 *Moeda:* Peso Uruguaio (UYU)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
