module.exports = {
    name: 'propriedade_edimburgo_imobiliario',
    aliases: ["cmd_propriedade_edimburgo_imobiliario","atalho_propriedade_edimburgo_imobiliario","abrev_propriedade_edimburgo_imobiliario"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de imobiliario em edimburgo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: EDIMBURGO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para imobiliario\n'
        txt += '📍 *Bairro:* Centro Histórico de edimburgo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
