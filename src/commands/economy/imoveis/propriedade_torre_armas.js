module.exports = {
    name: 'propriedade_torre_armas',
    aliases: ["cmd_propriedade_torre_armas","atalho_propriedade_torre_armas","abrev_propriedade_torre_armas"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de armas em torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: TORRE* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para armas\n'
        txt += '📍 *Bairro:* Centro Histórico de torre\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
