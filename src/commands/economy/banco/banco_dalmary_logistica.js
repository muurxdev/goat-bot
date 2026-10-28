module.exports = {
    name: 'banco_dalmary_logistica',
    aliases: ["cmd_banco_dalmary_logistica","atalho_banco_dalmary_logistica","abrev_banco_dalmary_logistica"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em dalmary para o setor de logistica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA DALMARY* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para logistica\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
