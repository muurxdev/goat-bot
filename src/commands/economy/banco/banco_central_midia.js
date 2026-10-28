module.exports = {
    name: 'banco_central_midia',
    aliases: ["cmd_banco_central_midia","atalho_banco_central_midia","abrev_banco_central_midia"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em central para o setor de midia',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA CENTRAL* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para midia\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
