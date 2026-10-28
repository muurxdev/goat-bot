module.exports = {
    name: 'banco_edimburgo_armas',
    aliases: ["cmd_banco_edimburgo_armas","atalho_banco_edimburgo_armas","abrev_banco_edimburgo_armas"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em edimburgo para o setor de armas',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA EDIMBURGO* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para armas\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
