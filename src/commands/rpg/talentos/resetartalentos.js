const talentService = require('../../../services/talentService')

module.exports = {
    name: 'resetartalentos',
    category: 'rpg',
    subcategory: 'Habilidades',
    description: 'Redefine todos os pontos de talentos gastos para redistribuir',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const res = talentService.resetTalents(sender)
        if (!res.success) return reply(res.message)

        let txt = '🔄 *TALENTOS REDEFINIDOS COM SUCESSO!*\n\n'
        txt += `✨ *Pontos Devolvidos:* \${res.refundedPoints} pts\n`
        if (res.cost > 0) {
            txt += `💰 *Custo do Reset:* \${res.cost.toLocaleString('pt-BR')} moedas\n`
        } else {
            txt += '🎁 *Primeiro Reset Gratuito!*\n'
        }
        txt += '\n💡 Digite `.talentos` para montar uma nova build estratégica.'
        return reply(txt.trim())
    }
}
