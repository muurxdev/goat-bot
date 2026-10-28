module.exports = {
    name: 'propriedade_vilarejo_quimica',
    aliases: ["cmd_propriedade_vilarejo_quimica","atalho_propriedade_vilarejo_quimica","abrev_propriedade_vilarejo_quimica"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de quimica em vilarejo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: VILAREJO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para quimica\n'
        txt += '📍 *Bairro:* Centro Histórico de vilarejo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
