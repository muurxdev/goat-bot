module.exports = {
    name: 'propriedade_mar_ocidental_alimentos',
    aliases: ["cmd_propriedade_mar_ocidental_alimentos","atalho_propriedade_mar_ocidental_alimentos","abrev_propriedade_mar_ocidental_alimentos"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de alimentos em mar_ocidental',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: MAR_OCIDENTAL* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para alimentos\n'
        txt += '📍 *Bairro:* Centro Histórico de mar_ocidental\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
