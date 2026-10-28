module.exports = {
    name: 'banco_floresta_fadas_midia',
    aliases: ["cmd_banco_floresta_fadas_midia","atalho_banco_floresta_fadas_midia","abrev_banco_floresta_fadas_midia"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em floresta_fadas para o setor de midia',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA FLORESTA_FADAS* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para midia\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
