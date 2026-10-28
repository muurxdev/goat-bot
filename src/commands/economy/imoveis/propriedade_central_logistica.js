module.exports = {
    name: 'propriedade_central_logistica',
    aliases: ["cmd_propriedade_central_logistica","atalho_propriedade_central_logistica","abrev_propriedade_central_logistica"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de logistica em central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: CENTRAL* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para logistica\n'
        txt += '📍 *Bairro:* Centro Histórico de central\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
