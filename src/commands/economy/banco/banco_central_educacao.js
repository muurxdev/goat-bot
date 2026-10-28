module.exports = {
    name: 'banco_central_educacao',
    aliases: ["cmd_banco_central_educacao","atalho_banco_central_educacao","abrev_banco_central_educacao"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em central para o setor de educacao',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA CENTRAL* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para educacao\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
