module.exports = {
    name: 'propriedade_edimburgo_armas',
    aliases: ["cmd_propriedade_edimburgo_armas","atalho_propriedade_edimburgo_armas","abrev_propriedade_edimburgo_armas"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de armas em edimburgo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: EDIMBURGO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para armas\n'
        txt += '📍 *Bairro:* Centro Histórico de edimburgo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
