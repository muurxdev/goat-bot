module.exports = {
    name: 'propriedade_cidadedourada_imobiliario',
    aliases: ["cmd_propriedade_cidadedourada_imobiliario","atalho_propriedade_cidadedourada_imobiliario","abrev_propriedade_cidadedourada_imobiliario"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de imobiliario em cidade dourada',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: CIDADE DOURADA* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para imobiliario\n'
        txt += '📍 *Bairro:* Centro Histórico de cidade dourada\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
