module.exports = {
    name: 'propriedade_purgatorio_agro',
    aliases: ["cmd_propriedade_purgatorio_agro","atalho_propriedade_purgatorio_agro","abrev_propriedade_purgatorio_agro"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de agro em purgatorio',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: PURGATORIO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para agro\n'
        txt += '📍 *Bairro:* Centro Histórico de purgatorio\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
