module.exports = {
    name: 'propriedade_central_quimica',
    aliases: ["cmd_propriedade_central_quimica","atalho_propriedade_central_quimica","abrev_propriedade_central_quimica"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de quimica em central',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: CENTRAL* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para quimica\n'
        txt += '📍 *Bairro:* Centro Histórico de central\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
