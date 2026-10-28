module.exports = {
    name: 'banco_edimburgo_magia',
    aliases: ["cmd_banco_edimburgo_magia","atalho_banco_edimburgo_magia","abrev_banco_edimburgo_magia"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em edimburgo para o setor de magia',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA EDIMBURGO* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para magia\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
