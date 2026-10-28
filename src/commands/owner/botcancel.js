/**
 * Comando .botcancel
 * Cancela qualquer agendamento futuro de fechamento ou abertura do bot
 */

const { cancelActiveSchedule } = require('../../services/botScheduler')
const { ROLES } = require('../../services/permissionService')
const F = require('../../utils/formato')

module.exports = {
    name: 'botcancel',
    aliases: ['cancelarschedule', 'cancelarfechamento'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Cancela os horários marcados para eu fechar ou reabrir',
    examples: [' — cancela o fechamento ou a reabertura marcada e me deixa aberto'],
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ reply, prefix = '.' }) => {
        const cancelled = cancelActiveSchedule()

        if (cancelled) {
            return reply(F.tela({
                prefix,
                emoji: '✅',
                titulo: 'Horários cancelados',
                intro: 'Tirei tudo o que estava marcado. Estou aberto e atendendo normalmente.',
                proximos: [
                    { nome: 'botschedule', oque: 'conferir a situação' },
                    { nome: 'botclose', args: '23:00 07:00', oque: 'marcar um novo horário' }
                ]
            }))
        }

        return reply(F.tela({
            prefix,
            emoji: 'ℹ️',
            titulo: 'Nada para cancelar',
            intro: 'Não havia fechamento nem reabertura marcados. Continuo aberto e atendendo normalmente.',
            dica: 'Os horários aparecem aqui depois de usar .botclose com duração ou horário.',
            proximos: [
                { nome: 'botclose', args: '23:00 07:00', oque: 'fechar às 23h e reabrir às 7h' },
                { nome: 'botclose', args: '30m', oque: 'fechar por 30 minutos' }
            ]
        }))
    }
}
