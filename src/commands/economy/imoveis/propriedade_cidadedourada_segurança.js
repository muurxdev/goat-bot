module.exports = {
    name: 'propriedade_cidadedourada_segurança',
    aliases: ["cmd_propriedade_cidadedourada_segurança","atalho_propriedade_cidadedourada_segurança","abrev_propriedade_cidadedourada_segurança"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de segurança em cidadedourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: CIDADEDOURADA* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para segurança\n'
        txt += '📍 *Bairro:* Centro Histórico de cidadedourada\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
