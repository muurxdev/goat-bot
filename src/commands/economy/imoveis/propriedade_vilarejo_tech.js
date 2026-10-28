module.exports = {
    name: 'propriedade_vilarejo_tech',
    aliases: ["cmd_propriedade_vilarejo_tech","atalho_propriedade_vilarejo_tech","abrev_propriedade_vilarejo_tech"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de tech em vilarejo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: VILAREJO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para tech\n'
        txt += '📍 *Bairro:* Centro Histórico de vilarejo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
