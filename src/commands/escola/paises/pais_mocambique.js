module.exports = {
    name: 'pais_mocambique',
    aliases: ["cmd_pais_mocambique","atalho_pais_mocambique","abrev_pais_mocambique"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Moçambique (Capital: Maputo)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: MOÇAMBIQUE* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Maputo\n'
        txt += '🌎 *Continente:* África\n'
        txt += '👥 *População Estimada:* 33 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Português\n'
        txt += '💵 *Moeda:* Metical (MZN)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
