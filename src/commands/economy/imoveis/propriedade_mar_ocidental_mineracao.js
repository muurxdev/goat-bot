module.exports = {
    name: 'propriedade_mar_ocidental_mineracao',
    aliases: ["cmd_propriedade_mar_ocidental_mineracao","atalho_propriedade_mar_ocidental_mineracao","abrev_propriedade_mar_ocidental_mineracao"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de mineracao em mar_ocidental',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: MAR_OCIDENTAL* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para mineracao\n'
        txt += '📍 *Bairro:* Centro Histórico de mar_ocidental\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
