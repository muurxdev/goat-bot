const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'scorecredito',
    aliases: ["cmd_scorecredito","atalho_scorecredito","abrev_scorecredito"],
    category: 'economy',
    subcategory: 'Crédito & Empréstimo',
    description: 'Consulta sua pontuação de Score de Crédito e limites liberados',
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const acc = bankingService.getAccount(sender)
        const scoreIcon = acc.credit_score >= 800 ? '🟢 Excelente' : acc.credit_score >= 600 ? '🟡 Bom' : '🔴 Regular'
        const maxLoan = Math.floor((acc.credit_score / 100) * 2000)

        let txt = '╔════════ 💳 *SCORE DE CRÉDITO DO REINO* ════════╗\n\n'
        txt += `⭐ *Pontuação Atual:* ${acc.credit_score} / 1000 pontos (${scoreIcon})\n`
        txt += `💰 *Limite Pré-Aprovado de Empréstimo:* Até ${maxLoan.toLocaleString('pt-BR')} moedas\n`
        txt += `📉 *Dívida Ativa Atual:* ${acc.loan_due.toLocaleString('pt-BR')} moedas\n\n`
        txt += '💡 *Como aumentar seu Score:*\n'
        txt += '├ Pague seus empréstimos em dia (`.quitar_emprestimo`).\n'
        txt += '├ Mantenha saldo guardado na poupança (`.guardar`).\n'
        txt += '└ Opere na Bolsa de Valores com frequência.\n\n'
        txt += 'Para solicitar crédito: `.pediremprestimo <valor>`'
        return reply(txt.trim())
    }
}
