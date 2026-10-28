module.exports = {
    name: 'propriedade_torre_quimica',
    aliases: ["cmd_propriedade_torre_quimica","atalho_propriedade_torre_quimica","abrev_propriedade_torre_quimica"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de quimica em torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: TORRE* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para quimica\n'
        txt += '📍 *Bairro:* Centro Histórico de torre\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
