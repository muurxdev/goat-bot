const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { formatNumber, moedas, marcar, linhasSubiuNivel } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'daily',
    aliases: ['diario', 'recompensa'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Resgata sua recompensa diária de XP e moedas, uma vez a cada 24 horas',
    examples: [' — pega os 50 XP e 100 moedas do dia e soma um dia à sua sequência'],
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const agora = Date.now()
        const ultimoDaily = user.lastDaily || 0
        const COOLDOWN_24H = 86400000
        // Passou de 48 h sem resgatar: pulou pelo menos um dia e a sequência recomeça.
        const LIMITE_SEQUENCIA = 2 * COOLDOWN_24H

        if (agora - ultimoDaily < COOLDOWN_24H) {
            const tempoRestante = COOLDOWN_24H - (agora - ultimoDaily)
            return reply(F.tela({
                emoji: '⏳',
                titulo: 'Recompensa de hoje já foi',
                intro: `Você já resgatou o prêmio diário. Volte em *${F.tempo(tempoRestante)}*.`,
                secoes: [{ emoji: '📊', titulo: 'Sua sequência', linhas: [
                    F.campo('Dias seguidos', formatNumber(user.streak || 0)),
                    F.campo('Libera às', new Date(ultimoDaily + COOLDOWN_24H).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }))
                ] }],
                dica: 'Enquanto espera, caçadas e trabalho também rendem XP e moedas.',
                proximos: [
                    { nome: 'hunt', oque: 'caçar monstros por XP e moedas' },
                    { nome: 'trabalhar', oque: 'ganhar moedas trabalhando' },
                    { nome: 'rankstreak', oque: 'ver quem tem a maior sequência' }
                ],
                prefix
            }), [sender])
        }

        const manteveSequencia = ultimoDaily > 0 && agora - ultimoDaily <= LIMITE_SEQUENCIA
        user.lastDaily = agora
        const { xpGanho, lvlRes } = adicionarXp(user, 50, { source: 'rpg' })
        user.coins = (user.coins || 0) + 100
        user.streak = manteveSequencia ? (user.streak || 0) + 1 : 1

        await dataService.saveXpData(xpData)
        logger.info('[DAILY] User ' + sender + ' resgatou daily (+' + xpGanho + ' XP, +100 moedas, Streak: ' + user.streak + ')')

        await reply(F.tela({
            emoji: '🎁',
            titulo: 'Recompensa diária resgatada',
            intro: `${marcar(sender)}, você ganhou *+${formatNumber(xpGanho)} XP* e *${moedas(100)}*. Sua sequência está em *${formatNumber(user.streak)} ${user.streak === 1 ? 'dia' : 'dias'}*.`,
            secoes: [{ emoji: '📜', titulo: 'Recompensa', linhas: [
                F.campo('XP', `+${formatNumber(xpGanho)}`),
                F.campo('Moedas', `+${moedas(100)} (total ${moedas(user.coins)})`),
                F.campo('Sequência', `${formatNumber(user.streak)} ${user.streak === 1 ? 'dia' : 'dias'}`),
                F.campo('Próxima', 'daqui a 24 horas')
            ] }, { emoji: '🆙', titulo: 'Subiu de nível', linhas: linhasSubiuNivel(user, lvlRes) }],
            dica: 'Volte todo dia para aumentar a sequência: se passar de 48 horas sem resgatar, ela recomeça do 1.',
            proximos: [
                { nome: 'hunt', oque: 'usar o dia para caçar' },
                { nome: 'rankstreak', oque: 'ver o ranking de sequência' },
                { nome: 'perfil', oque: 'ver seu perfil' }
            ],
            prefix
        }), [sender])
    }
}
