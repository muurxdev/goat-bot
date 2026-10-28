module.exports = {
    name: 'pais_paraguai',
    aliases: ["cmd_pais_paraguai","atalho_pais_paraguai","abrev_pais_paraguai"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Paraguai (Capital: Assunção)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: PARAGUAI* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Assunção\n'
        txt += '🌎 *Continente:* América do Sul\n'
        txt += '👥 *População Estimada:* 7,4 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Espanhol e Guarani\n'
        txt += '💵 *Moeda:* Guarani (PYG)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
