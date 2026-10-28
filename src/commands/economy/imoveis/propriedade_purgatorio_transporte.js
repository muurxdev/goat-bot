module.exports = {
    name: 'propriedade_purgatorio_transporte',
    aliases: ["cmd_propriedade_purgatorio_transporte","atalho_propriedade_purgatorio_transporte","abrev_propriedade_purgatorio_transporte"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de transporte em purgatorio',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: PURGATORIO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para transporte\n'
        txt += '📍 *Bairro:* Centro Histórico de purgatorio\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
