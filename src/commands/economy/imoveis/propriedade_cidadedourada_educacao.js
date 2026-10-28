module.exports = {
    name: 'propriedade_cidadedourada_educacao',
    aliases: ["cmd_propriedade_cidadedourada_educacao","atalho_propriedade_cidadedourada_educacao","abrev_propriedade_cidadedourada_educacao"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de educacao em cidade dourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: CIDADE DOURADA* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para educacao\n'
        txt += '📍 *Bairro:* Centro Histórico de cidade dourada\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
