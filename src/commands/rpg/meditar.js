/**
 * Comando .meditar — atividade de progressão do RPG.
 * Recompensa em XP proporcional ao próximo nível (ver rpgActivityService).
 */

const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const ativ = require('../../services/rpgActivityService')
const { formatNumber, moedas, marcar, linhasSubiuNivel } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

const ESPERA_MS = 1200000

module.exports = {
    name: 'meditar',
    aliases: ['meditacao','meditação'],
    category: 'rpg',
    subcategory: 'Progressão',
    description: 'Medite e ganhe um pouco de XP e moedas a cada 20 minutos',
    examples: [' — meditação espiritual: XP e moedas que crescem com o seu nível'],
    cooldownMs: 3000,
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const cd = ativ.checarCooldown(user, 'meditar', ESPERA_MS)
        if (!cd.pronto) {
            return reply(F.tela({
                emoji: '⏳',
                titulo: 'Você ainda está se recuperando',
                intro: `*Meditação espiritual* libera de novo em *${ativ.formatarEspera(cd.restanteMs)}*. Enquanto isso, outras atividades podem estar prontas.`,
                secoes: [{ emoji: '📋', titulo: 'Enquanto isso', linhas: ativ.linhasOutras(user, 'meditar', prefix) }],
                dica: 'Cada atividade tem a própria espera: dá para alternar entre elas sem perder tempo.',
                proximos: [
                    { nome: 'hunt', oque: 'caçar monstros agora' },
                    { nome: 'dungeon', oque: 'descer a masmorra' }
                ],
                prefix
            }), [sender])
        }

        const nivel = user.level || 1
        const xpBase = ativ.calcularXpAtividade(nivel, 0.025)
        const coinsGanho = ativ.calcularCoinsAtividade(nivel, 20)

        const { xpGanho, lvlRes } = adicionarXp(user, xpBase, { source: 'rpg' })
        user.coins = (user.coins || 0) + coinsGanho
        ativ.marcarUso(user, 'meditar')
        dataService.saveUser(user)

        return reply(F.tela({
            emoji: '🧘',
            titulo: 'Meditação espiritual',
            intro: `${marcar(sender)} meditou em silêncio perto da nascente druídica e ganhou *+${formatNumber(xpGanho)} XP* e *${moedas(coinsGanho)}*.`,
            secoes: [
                { emoji: '📜', titulo: 'Relatório', linhas: [
                    F.campo('XP', `+${formatNumber(xpGanho)}`),
                    F.campo('Moedas', `+${moedas(coinsGanho)} (total ${moedas(user.coins)})`),
                    F.campo('Nível atual', formatNumber(user.level)),
                    F.campo('De novo em', F.tempo(ESPERA_MS))
                ] },
                { emoji: '🆙', titulo: 'Subiu de nível', linhas: linhasSubiuNivel(user, lvlRes) },
                { emoji: '📋', titulo: 'Outras atividades', linhas: ativ.linhasOutras(user, 'meditar', prefix) }
            ],
            dica: 'A recompensa cresce junto com o seu nível, então as atividades valem a pena do começo ao fim.',
            proximos: [
                { nome: 'treinar', oque: 'treino de combate' },
                { nome: 'hunt', oque: 'caçar monstros' }
            ],
            prefix
        }), [sender])
    }
}
