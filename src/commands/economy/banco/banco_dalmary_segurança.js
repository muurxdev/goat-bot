module.exports = {
    name: 'banco_dalmary_segurança',
    aliases: ["cmd_banco_dalmary_segurança","atalho_banco_dalmary_segurança","abrev_banco_dalmary_segurança"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em dalmary para o setor de segurança',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA DALMARY* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para segurança\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
