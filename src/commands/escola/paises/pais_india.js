module.exports = {
    name: 'pais_india',
    aliases: ["cmd_pais_india","atalho_pais_india","abrev_pais_india"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Índia (Capital: Nova Délhi)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ÍNDIA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Nova Délhi\n'
        txt += '🌎 *Continente:* Ásia\n'
        txt += '👥 *População Estimada:* 1,42 bilhão\n'
        txt += '🗣️ *Idioma Oficial:* Hindi e Inglês\n'
        txt += '💵 *Moeda:* Rúpia (INR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
