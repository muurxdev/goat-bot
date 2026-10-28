module.exports = {
    name: 'pais_coreia_do_sul',
    aliases: ["cmd_pais_coreia_do_sul","atalho_pais_coreia_do_sul","abrev_pais_coreia_do_sul"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Coreia do Sul (Capital: Seul)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: COREIA DO SUL* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Seul\n'
        txt += '🌎 *Continente:* Ásia\n'
        txt += '👥 *População Estimada:* 51,7 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Coreano\n'
        txt += '💵 *Moeda:* Won (KRW)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
