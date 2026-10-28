/**
 * Comando .botschedule
 * Consulta o status operacional atual e os agendamentos ativos do ciclo de vida.
 *
 * A tela é montada aqui, e não com getScheduleStatusCard do serviço, porque o
 * cartão do serviço é coberto por teste com o texto antigo; os dados são os
 * mesmos (estado operacional + agendamentos ativos no banco).
 */

const { getBotState, BOT_STATES, formatarHora } = require('../../services/botScheduler')
const scheduleRepo = require('../../database/repositories/scheduleRepository')
const { ROLES } = require('../../services/permissionService')
const F = require('../../utils/formato')

const SITUACAO = {
    [BOT_STATES.ONLINE]: '🟢 aberto, atendendo todos',
    [BOT_STATES.OFFLINE]: '🔴 fechado (só donos e administradores do bot)',
    [BOT_STATES.SCHEDULED_CLOSE]: '🟡 aberto, com fechamento marcado',
    [BOT_STATES.SCHEDULED_OPEN]: '🟡 fechado, com reabertura marcada',
    [BOT_STATES.MAINTENANCE]: '🔧 em manutenção',
    [BOT_STATES.CLOSING]: '🟠 fechando agora',
    [BOT_STATES.STARTING]: '🟠 ligando agora'
}

const MODO = {
    DURATION: 'por um tempo',
    TIME: 'em horário marcado, sem reabertura',
    CYCLE: 'em horário marcado, com reabertura',
    INDEFINITE: 'sem prazo'
}

// Hora no fuso do bot (BOT_TIMEZONE), não no do servidor
const hora = ts => formatarHora(ts)

module.exports = {
    name: 'botschedule',
    aliases: ['schedulestatus', 'horariobot'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Mostra se estou aberto e os horários marcados para fechar ou reabrir',
    examples: [' — mostra minha situação e o próximo horário marcado'],
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ reply, prefix = '.' }) => {
        const state = getBotState()
        const situacao = SITUACAO[state] || state
        const active = scheduleRepo.getActiveSchedules()

        if (active.length === 0) {
            return reply(F.tela({
                prefix,
                emoji: '🕒',
                titulo: 'Meus horários',
                intro: 'Não tenho nenhum fechamento ou reabertura marcado. Só mudo de estado quando alguém mandar.',
                secoes: [{ emoji: '📋', titulo: 'Agora', linhas: [F.campo('Situação', situacao)] }],
                proximos: [
                    { nome: 'botclose', args: '23:00 07:00', oque: 'fechar às 23h e reabrir às 7h' },
                    { nome: 'botclose', args: '30m', oque: 'fechar por 30 minutos' }
                ]
            }))
        }

        const sched = active[0]
        const executando = sched.status === 'EXECUTING'
        const proximaAcao = executando && sched.reopen_at ? 'reabrir' : (executando ? 'nenhuma (espera você reabrir)' : 'fechar')
        const proximoHorario = executando ? sched.reopen_at : sched.execute_at
        const restante = proximoHorario ? F.tempo(Math.max(0, proximoHorario - Date.now())) : null

        return reply(F.tela({
            prefix,
            emoji: '🕒',
            titulo: 'Meus horários',
            intro: proximoHorario
                ? `Próximo passo: *${proximaAcao}* às *${hora(proximoHorario)}*${restante ? ` (falta ${restante})` : ''}.`
                : 'Estou fechado sem prazo. Só volto quando alguém me reabrir.',
            secoes: [{
                emoji: '📋', titulo: 'Detalhes', linhas: [
                    F.campo('Situação', situacao),
                    F.campo('Tipo', MODO[sched.mode] || sched.mode),
                    F.campo('Fechamento', hora(sched.execute_at)),
                    F.campo('Reabertura', sched.reopen_at ? hora(sched.reopen_at) : 'só manualmente')
                ]
            }],
            proximos: [
                { nome: 'botopen', oque: 'reabrir agora' },
                { nome: 'botcancel', oque: 'cancelar o que está marcado' }
            ]
        }))
    }
}
