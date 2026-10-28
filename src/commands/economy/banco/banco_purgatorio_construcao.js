module.exports = {
    name: 'banco_purgatorio_construcao',
    aliases: ["cmd_banco_purgatorio_construcao","atalho_banco_purgatorio_construcao","abrev_banco_purgatorio_construcao"],
    category: 'economy',
    subcategory: 'Agências Bancárias',
    description: 'Agência e atendimento do Banco Real em purgatorio para o setor de construcao',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🏦 *BANCO DE REINO - AGÊNCIA PURGATORIO* ═══════╗\n\n'
        txt += '🏛️ *Especialidade:* Linhas de financiamento para construcao\n'
        txt += '💳 *Score Mínimo Requerido:* 550 pontos\n'
        txt += '💰 *Taxa Especial de Poupança:* Isenta de IOF real\n\n'
        txt += 'Consulte sua conta com `.poupanca` e `.scorecredito`.'
        return reply(txt.trim())
    }
}
