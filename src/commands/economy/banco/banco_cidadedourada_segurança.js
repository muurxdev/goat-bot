module.exports = {
    name: 'banco_cidadedourada_segurança',
    aliases: ["cmd_banco_cidadedourada_segurança","atalho_banco_cidadedourada_segurança","abrev_banco_cidadedourada_segurança"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em cidadedourada para o setor de segurança',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA CIDADEDOURADA* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para segurança\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
