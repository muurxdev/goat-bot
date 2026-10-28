module.exports = {
    name: 'banco_dalmary_mineracao',
    aliases: ["cmd_banco_dalmary_mineracao","atalho_banco_dalmary_mineracao","abrev_banco_dalmary_mineracao"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em dalmary para o setor de mineracao',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA DALMARY* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para mineracao\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
