/**
 * Comando .roubar / .rob
 * Tenta furtar moedas da carteira de outro usuário com risco de indenização/multa
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatNumber, moedas, marcar } = require("../../utils/textoRpg")
const logger = require("../../core/logger")
const F = require("../../utils/formato")

const COOLDOWN_ROB = 2 * 60 * 60 * 1000 // 2 horas
const CHANCE_SUCESSO = 0.45 // 45% de sucesso

module.exports = {
    name: "roubar",
    aliases: ["rob","assaltar","furtar","trombadinha","cmd_roubar","alt_roubar","atalho_roubar","abrev_roubar","call_roubar","func_roubar"],
    category: "economy",
    subcategory: "Proteção",
    description: "Tente surrupiar moedas da carteira de alguém (uma tentativa a cada 2 horas)",
    usage: "@pessoa",
    examples: [
        "@pessoa — tenta levar de 10% a 24% da carteira dela (45% de chance)"
    ],
    groupOnly: true,
    cooldownMs: 2000,
    execute: async ({ sender, info, reply, isOwner, mentionedJid, mentions, prefix = "." }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const now = Date.now()
        const lastRob = user.lastRob || 0
        const esperaRestante = Math.max(0, COOLDOWN_ROB - (now - lastRob))

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            || mentionedJid?.[0] || mentions?.[0]
        if (!mentioned) {
            return reply(F.tela({
                emoji: "🦹",
                titulo: "Roubar moedas",
                intro: "Marque alguém e eu tento surrupiar parte da carteira dessa pessoa. Se a guarda pegar, você paga indenização a ela.",
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "roubar", "@pessoa")} — tenta roubar quem você marcou`
                    ] },
                    { emoji: "🎲", titulo: "Como funciona", linhas: [
                        F.campo("Chance de sucesso", `${Math.round(CHANCE_SUCESSO * 100)}%`),
                        F.campo("Se der certo", "leva de 10% a 24% da carteira (mínimo 50 moedas)"),
                        F.campo("Se der errado", "paga de 200 a 549 moedas para a vítima"),
                        F.campo("Espera entre tentativas", F.tempo(COOLDOWN_ROB)),
                        F.campo("Alvo precisa ter", "100 moedas ou mais na carteira")
                    ] },
                    { emoji: "👤", titulo: "Você agora", linhas: [
                        F.campo("Sua carteira", moedas(user.coins || 0)),
                        F.campo("Próxima tentativa", esperaRestante > 0 && !isOwner ? `em ${F.tempo(esperaRestante)}` : "liberada")
                    ] }
                ],
                dica: "Moedas guardadas no cofre do banco e quem tem escudo ativo não podem ser roubados.",
                proximos: [
                    { nome: "banco", args: "depositar tudo", oque: "proteger suas próprias moedas" },
                    { nome: "escudo", oque: "ver a proteção contra roubo" }
                ],
                prefix
            }))
        }

        if (mentioned === sender) {
            return reply(F.tela({
                emoji: "🤔",
                titulo: "Esse alvo é você",
                intro: "Roubar de si mesmo não rende nada. Marque outra pessoa do grupo.",
                proximos: [{ nome: "roubar", args: "@pessoa", oque: "tentar roubar outra pessoa" }],
                prefix
            }))
        }

        const victim = initializeUser(mentioned, xpData)
        const victimCoins = victim.coins || 0

        // Escudo dinâmico com HP — bloqueia antes de qualquer sorteio.
        const shieldEngine = require("../../services/shieldEngine")
        const shieldStatus = shieldEngine.getShieldStatus(victim)
        if (shieldStatus && shieldStatus.active) {
            const maxHp = Number(shieldStatus.maxHp) || 0
            return reply(F.tela({
                emoji: "🛡️",
                titulo: "Roubo barrado pelo escudo",
                intro: `${marcar(mentioned)} está protegido por *${shieldStatus.name}*, e você nem chegou perto da carteira.`,
                secoes: [{ emoji: "🛡️", titulo: "Escudo da vítima", linhas: [
                    F.campo("Resistência", `${formatNumber(shieldStatus.hp)} / ${formatNumber(maxHp)}`),
                    maxHp > 0 ? F.campo("Integridade", F.barra(shieldStatus.hp / maxHp)) : null,
                    F.campo("Protegido por mais", F.tempo(shieldStatus.timeLeftMs))
                ] }],
                dica: "Essa tentativa não contou: você pode tentar outra pessoa agora mesmo.",
                proximos: [{ nome: "roubar", args: "@pessoa", oque: "escolher outro alvo" }],
                prefix
            }), [mentioned])
        }

        if (victimCoins < 100) {
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Não vale o risco",
                intro: `${marcar(mentioned)} tem *${moedas(victimCoins)}* na carteira. Só dá para roubar de quem tem 100 moedas ou mais.`,
                dica: "Essa tentativa não contou: você pode escolher outro alvo agora.",
                proximos: [{ nome: "roubar", args: "@pessoa", oque: "tentar outra pessoa" }],
                prefix
            }), [mentioned])
        }

        if (now - lastRob < COOLDOWN_ROB && !isOwner) {
            return reply(F.tela({
                emoji: "⏳",
                titulo: "A guarda ainda está de olho",
                intro: `Você tentou roubar há pouco. Espere *${F.tempo(esperaRestante)}* para a próxima tentativa.`,
                secoes: [{ emoji: "⏱️", titulo: "Espera", linhas: [
                    F.campo("Falta", F.tempo(esperaRestante)),
                    F.campo("Progresso", F.barra(1 - esperaRestante / COOLDOWN_ROB))
                ] }],
                dica: "Enquanto espera, guarde suas moedas: quem roubou também pode ser roubado.",
                proximos: [
                    { nome: "banco", args: "depositar tudo", oque: "proteger sua carteira" },
                    { nome: "trabalhar", oque: "ganhar moedas sem risco" }
                ],
                prefix
            }))
        }

        user.lastRob = now
        const success = Math.random() < CHANCE_SUCESSO
        const carteiraAntes = user.coins || 0

        let doc = ""

        if (success) {
            // Rouba entre 10% e 25% das moedas da carteira da vítima
            const percent = (Math.floor(Math.random() * 15) + 10) / 100
            const stolenAmount = Math.max(50, Math.floor(victimCoins * percent))

            victim.coins = Math.max(0, (victim.coins || 0) - stolenAmount)
            user.coins = (user.coins || 0) + stolenAmount
            user.roubosSucesso = (user.roubosSucesso || 0) + 1

            doc = F.tela({
                emoji: "🦹",
                titulo: "Roubo bem-sucedido",
                intro: `${marcar(sender)}, você surrupiou *${moedas(stolenAmount)}* de ${marcar(mentioned)} (${Math.round(percent * 100)}% da carteira).`,
                secoes: [{ emoji: "💰", titulo: "Resultado", linhas: [
                    F.campo("Levou", `+${moedas(stolenAmount)}`),
                    F.campo("Sua carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    F.campo("Chance que você tinha", `${Math.round(CHANCE_SUCESSO * 100)}%`),
                    F.campo("Roubos certeiros", formatNumber(user.roubosSucesso)),
                    F.campo("Próxima tentativa", `em ${F.tempo(COOLDOWN_ROB)}`)
                ] }],
                dica: `${marcar(mentioned)}, dinheiro guardado no cofre do banco não pode ser roubado.`,
                proximos: [
                    { nome: "banco", args: "depositar tudo", oque: "guardar o que você levou" },
                    { nome: "escudo", oque: "se proteger de quem quiser revidar" }
                ],
                prefix
            })
        } else {
            // Pego em flagrante: Paga indenização para a vítima
            const fine = Math.min(user.coins || 0, Math.floor(Math.random() * 350) + 200)

            user.coins = Math.max(0, (user.coins || 0) - fine)
            victim.coins = (victim.coins || 0) + fine

            doc = F.tela({
                emoji: "👮",
                titulo: "Pego em flagrante",
                intro: fine > 0
                    ? `A guarda pegou ${marcar(sender)} tentando roubar ${marcar(mentioned)}, e você pagou *${moedas(fine)}* de indenização.`
                    : `A guarda pegou ${marcar(sender)} tentando roubar ${marcar(mentioned)}. Sem moedas na carteira, você não teve como indenizar.`,
                secoes: [{ emoji: "⚖️", titulo: "Resultado", linhas: [
                    F.campo("Indenização paga", fine > 0 ? `−${moedas(fine)}` : "nenhuma"),
                    F.campo("Sua carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    F.campo("Chance que você tinha", `${Math.round(CHANCE_SUCESSO * 100)}%`),
                    F.campo("Próxima tentativa", `em ${F.tempo(COOLDOWN_ROB)}`)
                ] }],
                dica: "Andar com pouco na carteira diminui o prejuízo quando a guarda pega você.",
                proximos: [
                    { nome: "banco", args: "depositar tudo", oque: "proteger o que sobrou" },
                    { nome: "trabalhar", oque: "recuperar moedas sem risco" }
                ],
                prefix
            })
        }

        await dataService.saveXpData(xpData)
        logger.info(`[ROUBAR] ${sender} tentou roubar ${mentioned}: ${success ? "sucesso" : "flagrante"}`)
        return reply(doc, [sender, mentioned])
    }
}
