module.exports = {
    name: 'propriedade_floresta_fadas_alimentos',
    aliases: ["cmd_propriedade_floresta_fadas_alimentos","atalho_propriedade_floresta_fadas_alimentos","abrev_propriedade_floresta_fadas_alimentos"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de alimentos em floresta_fadas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: FLORESTA_FADAS* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para alimentos\n'
        txt += '📍 *Bairro:* Centro Histórico de floresta_fadas\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
