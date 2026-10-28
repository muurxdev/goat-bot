module.exports = {
    name: 'propriedade_orlondi_tech',
    aliases: ["cmd_propriedade_orlondi_tech","atalho_propriedade_orlondi_tech","abrev_propriedade_orlondi_tech"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de tech em orlondi',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: ORLONDI* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para tech\n'
        txt += '📍 *Bairro:* Centro Histórico de orlondi\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
