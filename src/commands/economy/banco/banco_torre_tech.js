module.exports = {
    name: 'banco_torre_tech',
    aliases: ["cmd_banco_torre_tech","atalho_banco_torre_tech","abrev_banco_torre_tech"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em torre para o setor de tech',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA TORRE* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para tech\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
