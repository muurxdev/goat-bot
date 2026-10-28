module.exports = {
    name: 'propriedade_torre_varejo',
    aliases: ["cmd_propriedade_torre_varejo","atalho_propriedade_torre_varejo","abrev_propriedade_torre_varejo"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de varejo em torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: TORRE* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para varejo\n'
        txt += '📍 *Bairro:* Centro Histórico de torre\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
