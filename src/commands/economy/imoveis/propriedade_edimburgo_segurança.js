module.exports = {
    name: 'propriedade_edimburgo_segurança',
    aliases: ["cmd_propriedade_edimburgo_segurança","atalho_propriedade_edimburgo_segurança","abrev_propriedade_edimburgo_segurança"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de segurança em edimburgo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: EDIMBURGO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para segurança\n'
        txt += '📍 *Bairro:* Centro Histórico de edimburgo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
