module.exports = {
    name: 'banco_cidadedourada_quimica',
    aliases: ["cmd_banco_cidadedourada_quimica","atalho_banco_cidadedourada_quimica","abrev_banco_cidadedourada_quimica"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em cidade dourada para o setor de quimica',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA CIDADE DOURADA* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para quimica\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
