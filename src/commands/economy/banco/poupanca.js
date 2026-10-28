const bankingService = require('../../../services/bankingService')

module.exports = {
    name: 'poupanca',
    aliases: ["cmd_poupanca","atalho_poupanca","abrev_poupanca"],
    category: 'economy',
    subcategory: 'Banco Real',
    description: 'Consulta o saldo guardado na Caderneta de Poupança protegida',
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const acc = bankingService.getAccount(sender)
        let txt = '╔════════ 🏦 *POUPANÇA REAL DE REINO* ════════╗\n\n'
        txt += `💰 *Saldo Guardado na Poupança:* ${acc.savings_balance.toLocaleString('pt-BR')} moedas\n`
        txt += '🛡️ *Status de Proteção:* 100% Imune a assaltos e golpes (.roubar)\n\n'
        txt += '💡 *Operações Rápidas:*\n'
        txt += '├ Depositar: `.guardar <valor>`\n'
        txt += '└ Sacar: `.sacar <valor>`'
        return reply(txt.trim())
    }
}
