module.exports = {
    name: 'propriedade_dalmary_banco',
    aliases: ["cmd_propriedade_dalmary_banco","atalho_propriedade_dalmary_banco","abrev_propriedade_dalmary_banco"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de banco em dalmary',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: DALMARY* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para banco\n'
        txt += '📍 *Bairro:* Centro Histórico de dalmary\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
