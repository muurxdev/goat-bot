module.exports = {
    name: 'pais_irlanda',
    aliases: ["cmd_pais_irlanda","atalho_pais_irlanda","abrev_pais_irlanda"],
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de Irlanda (Capital: Dublin)',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: IRLANDA* ═══════╗\n\n'
        txt += '🏛️ *Capital:* Dublin\n'
        txt += '🌎 *Continente:* Europa\n'
        txt += '👥 *População Estimada:* 5,1 milhões\n'
        txt += '🗣️ *Idioma Oficial:* Irlandês e Inglês\n'
        txt += '💵 *Moeda:* Euro (EUR)\n\n'
        txt += '💡 Consulte outros países com `.atlas_mundial`.'
        return reply(txt.trim())
    }
}
