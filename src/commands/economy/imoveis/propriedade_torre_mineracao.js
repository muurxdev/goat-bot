module.exports = {
    name: 'propriedade_torre_mineracao',
    aliases: ["cmd_propriedade_torre_mineracao","atalho_propriedade_torre_mineracao","abrev_propriedade_torre_mineracao"],
    category: 'economy',
    subcategory: 'Imóveis Regionais',
    description: 'Oportunidade imobiliária comercial para o setor de mineracao em torre',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏰 *IMÓVEL COMERCIAL: TORRE* ═══════╗\n\n'
        txt += '🏷️ *Finalidade:* Ponto comercial voltado para mineracao\n'
        txt += '📍 *Bairro:* Centro Histórico de torre\n'
        txt += '📈 *Valorização Média:* +12% ao ano\n\n'
        txt += 'Consulte o catálogo da imobiliária com `.imoveis`.'
        return reply(txt.trim())
    }
}
