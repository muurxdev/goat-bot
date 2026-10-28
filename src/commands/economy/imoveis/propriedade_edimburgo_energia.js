module.exports = {
    name: 'propriedade_edimburgo_energia',
    aliases: ["cmd_propriedade_edimburgo_energia","atalho_propriedade_edimburgo_energia","abrev_propriedade_edimburgo_energia"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de energia em edimburgo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: EDIMBURGO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para energia\n'
        txt += '📍 *Bairro:* Centro Histórico de edimburgo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
