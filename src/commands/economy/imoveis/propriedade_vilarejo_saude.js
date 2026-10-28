module.exports = {
    name: 'propriedade_vilarejo_saude',
    aliases: ["cmd_propriedade_vilarejo_saude","atalho_propriedade_vilarejo_saude","abrev_propriedade_vilarejo_saude"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de saude em vilarejo',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: VILAREJO* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para saude\n'
        txt += '📍 *Bairro:* Centro Histórico de vilarejo\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
