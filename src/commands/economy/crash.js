const dataService = require("../../services/dataService")
const { moedas, marcar } = require("../../utils/textoRpg")
const logger = require("../../core/logger")
const F = require("../../utils/formato")

/**
 * Crash — aposta que multiplica com o tempo e pode explodir a qualquer momento.
 *
 * CURVA DO MULTIPLICADOR
 *   multiplicador(t) = 1,00 + 0,05 × t      (t = segundos desde a aposta)
 *   1,00x na hora · 1,50x em 10 s · 2,00x em 20 s · 3,00x em 40 s · 5,00x em 80 s
 * O valor é truncado em duas casas. Linear de propósito: no WhatsApp cada
 * mensagem leva alguns segundos para ir e voltar, e uma curva exponencial faria
 * o jogo explodir antes de a pessoa conseguir ler o status.
 *
 * EXPLOSÃO
 *   O ponto de explosão é sorteado na aposta (generateCrashPoint, teto de 100x).
 *   O jogo explode no instante em que multiplicador(t) alcança esse ponto. Não há
 *   relógio rodando: a explosão é verificada quando a pessoa pede status, saca
 *   ou tenta abrir outro jogo — o resultado é o mesmo, porque depende só do tempo.
 *   Sacar antes paga aposta × multiplicador do momento; depois, a aposta é perdida.
 *
 * POR QUE O JOGO FICA SALVO NO USUÁRIO (campo crashAberto)
 *   A aposta sai da carteira na hora. Com o jogo só em memória, reiniciar o bot
 *   sumia com a aposta sem saque possível. Cobrar só no fim também não serve:
 *   no meio do jogo a pessoa poderia gastar as moedas e a explosão não teria de
 *   onde cobrar. Salvando o jogo aberto no usuário, a cobrança continua na hora
 *   e o saque sobrevive a reinícios.
 *
 * ESPERA
 *   A espera de 30 s vale só para ABRIR um novo jogo, contada do fim do anterior.
 *   O comando em si não tem espera no despachante: senão o saque ficaria preso
 *   nos primeiros 30 s, justamente quando o jogo está valendo.
 */

const ESPERA_NOVO_JOGO_MS = 30000
const APOSTA_MINIMA = 10
const TAXA_POR_SEGUNDO = 0.05
const TETO_EXPLOSAO = 100

/** 1.5 -> "1,50x" */
const mult = m => `${Number(m || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`

/** Multiplicador depois de `ms` milissegundos, truncado em duas casas. */
function multiplicadorEm(ms) {
    const s = Math.max(0, Number(ms) || 0) / 1000
    return Math.floor((1 + TAXA_POR_SEGUNDO * s) * 100) / 100
}

/** Segundos até o multiplicador alcançar `alvo`. */
function segundosAte(alvo) {
    return Math.max(0, (alvo - 1) / TAXA_POR_SEGUNDO)
}

function generateCrashPoint() {
    const e = 2 ** 32
    const h = Math.floor(Math.random() * e)
    if (h % 33 === 0) return 1.00
    return Math.min(TETO_EXPLOSAO, Math.max(1.00, Math.floor((100 * e - h) / (e - h)) / 100))
}

/** Lê o jogo aberto e diz em que pé está agora. */
function situacao(game, agora = Date.now()) {
    const m = multiplicadorEm(agora - game.startTime)
    return { multiplicador: m, explodiu: m >= game.crashPoint }
}

function registrar(user, entrada) {
    if (!Array.isArray(user.transactionHistory)) user.transactionHistory = []
    user.transactionHistory.push({ ...entrada, timestamp: Date.now() })
    if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)
}

const REGRAS = [
    "• O multiplicador começa em 1,00x e sobe 0,05x por segundo (2,00x em 20 s)",
    "• Sacar paga a aposta vezes o multiplicador do momento",
    "• Se explodir antes do saque, a aposta inteira é perdida",
    "• Um jogo por vez; a aposta sai da carteira na hora"
]

module.exports = {
    name: "crash",
    aliases: ["crashgame","explodir","cmd_crash","alt_crash","atalho_crash","abrev_crash","call_crash","func_crash"],
    category: "economy",
    subcategory: "Jogos",
    description: "Aposte no crash e saque antes que o multiplicador exploda",
    usage: "<valor> | cashout | status",
    examples: [
        "500 — começa um jogo apostando 500 moedas",
        "cashout — saca o jogo em andamento",
        "status — mostra o jogo em andamento"
    ],
    // Sem espera no despachante: ver ESPERA no topo do arquivo.
    cooldownMs: 0,
    execute: async ({ sender, args = [], reply, prefix = "." }) => {
        const user = dataService.initializeUser(sender)
        const subcommand = String(args[0] || "").toLowerCase()
        const agora = Date.now()

        // Jogo aberto que já explodiu é encerrado aqui, qualquer que seja o pedido.
        let explodido = null
        const aberto = user.crashAberto && Number(user.crashAberto.bet) > 0 ? user.crashAberto : null
        if (aberto && situacao(aberto, agora).explodiu) {
            explodido = aberto
            user.crashAberto = null
            user.crashLiberaEm = agora + ESPERA_NOVO_JOGO_MS
            registrar(user, { type: "crash_explodiu", amount: 0, multiplier: aberto.crashPoint.toFixed(2) })
            dataService.saveUser(user)
            logger.info(`[CRASH] ${sender} explodiu em ${aberto.crashPoint.toFixed(2)}x, perdeu ${aberto.bet}`)
        }
        const game = explodido ? null : aberto

        const telaExplosao = (intro) => F.tela({
            emoji: "💥",
            titulo: `Explodiu em ${mult(explodido.crashPoint)}`,
            intro,
            secoes: [{ emoji: "📋", titulo: "Jogo encerrado", linhas: [
                F.campo("Aposta perdida", moedas(explodido.bet)),
                F.campo("Explodiu em", explodido.crashPoint <= 1
                    ? `${mult(explodido.crashPoint)} (logo na aposta)`
                    : `${mult(explodido.crashPoint)} (${F.tempo(segundosAte(explodido.crashPoint) * 1000)} depois da aposta)`),
                F.campo("Carteira", moedas(user.coins || 0)),
                F.campo("Novo jogo liberado em", F.tempo(ESPERA_NOVO_JOGO_MS))
            ] }],
            dica: explodido.crashPoint <= 1
                ? "Às vezes o jogo explode logo em 1,00x. Apostas menores aguentam esse azar."
                : `Sacar antes de ${mult(explodido.crashPoint)} teria pago. Definir um alvo e sacar ao chegar nele evita esperar demais.`,
            proximos: [{ nome: "crash", args: String(explodido.bet), oque: "tentar de novo com o mesmo valor" }],
            prefix
        })

        if (subcommand === "cashout" || subcommand === "sacar") {
            if (explodido) {
                return reply(telaExplosao(`${marcar(sender)}, o jogo explodiu antes do saque e a aposta de *${moedas(explodido.bet)}* ficou com a casa.`), [sender])
            }
            if (!game) {
                return reply(F.tela({
                    emoji: "🚀",
                    titulo: "Nenhum jogo em andamento",
                    intro: "Você não tem um jogo de crash aberto para sacar.",
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "crash", "100")} — começa um jogo apostando 100 moedas`
                    ] }],
                    dica: `Sua carteira tem ${moedas(user.coins || 0)}.`,
                    prefix
                }))
            }

            const { multiplicador } = situacao(game, agora)
            const carteiraAntes = user.coins || 0
            const winnings = Math.floor(game.bet * multiplicador)
            user.coins = carteiraAntes + winnings
            user.crashAberto = null
            user.crashLiberaEm = agora + ESPERA_NOVO_JOGO_MS
            registrar(user, { type: "crash_cashout", amount: winnings, multiplier: multiplicador.toFixed(2) })
            dataService.saveUser(user)
            logger.info(`[CRASH] ${sender} cashout em ${multiplicador.toFixed(2)}x, ganhou ${winnings}`)

            const lucro = winnings - game.bet
            return reply(F.tela({
                emoji: "🚀",
                titulo: `Saque em ${mult(multiplicador)}`,
                intro: `${marcar(sender)}, você sacou antes de explodir e recebeu *${moedas(winnings)}* (lucro de ${moedas(Math.max(0, lucro))}).`,
                secoes: [{ emoji: "📋", titulo: "Jogo encerrado", linhas: [
                    F.campo("Aposta", moedas(game.bet)),
                    F.campo("Multiplicador", mult(multiplicador)),
                    F.campo("Recebido", `+${moedas(winnings)}`),
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`),
                    F.campo("Novo jogo liberado em", F.tempo(ESPERA_NOVO_JOGO_MS))
                ] }],
                dica: "Guarde o que recebeu no banco para não perder em outra rodada.",
                proximos: [
                    { nome: "crash", args: String(game.bet), oque: "jogar de novo com o mesmo valor" },
                    { nome: "banco", args: "depositar tudo", oque: "proteger a carteira" }
                ],
                prefix
            }), [sender])
        }

        if (subcommand === "status" || subcommand === "") {
            if (explodido) {
                return reply(telaExplosao(`${marcar(sender)}, seu jogo explodiu antes do saque e a aposta de *${moedas(explodido.bet)}* foi perdida.`), [sender])
            }
            if (game) {
                const { multiplicador } = situacao(game, agora)
                return reply(F.tela({
                    emoji: "🚀",
                    titulo: `Subindo: ${mult(multiplicador)}`,
                    intro: `Se sacar agora, você recebe *${moedas(Math.floor(game.bet * multiplicador))}*.`,
                    secoes: [{ emoji: "📋", titulo: "Seu jogo", linhas: [
                        F.campo("Aposta", moedas(game.bet)),
                        F.campo("Multiplicador agora", mult(multiplicador)),
                        F.campo("Recebe se sacar", moedas(Math.floor(game.bet * multiplicador))),
                        F.campo("Aberto há", agora - game.startTime < 1000 ? "agora mesmo" : F.tempo(agora - game.startTime)),
                        F.campo("Em 20 s estaria em", mult(multiplicadorEm(agora - game.startTime + 20000)))
                    ] }],
                    dica: "O multiplicador sobe enquanto você lê. Se explodir antes do saque, a aposta inteira é perdida.",
                    proximos: [{ nome: "crash", args: "cashout", oque: "sacar agora" }],
                    prefix
                }))
            }

            return reply(F.tela({
                emoji: "🚀",
                titulo: "Crash",
                intro: subcommand === "status"
                    ? "Você não tem jogo aberto agora. Aposte um valor para começar."
                    : "Aposte, acompanhe o multiplicador subir e saque antes que exploda.",
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "crash", "<valor>")} — começa um jogo (mínimo ${moedas(APOSTA_MINIMA)})`,
                        `• ${F.cmd(prefix, "crash", "cashout")} — saca antes de explodir`,
                        `• ${F.cmd(prefix, "crash", "status")} — mostra o jogo aberto`
                    ] },
                    { emoji: "📊", titulo: "Regras", linhas: REGRAS },
                    { emoji: "💳", titulo: "Você", linhas: [
                        F.campo("Carteira", moedas(user.coins || 0)),
                        F.campo("Espera entre jogos", F.tempo(ESPERA_NOVO_JOGO_MS))
                    ] }
                ],
                proximos: [{ nome: "crash", args: "100", oque: "apostar 100 moedas" }],
                prefix
            }))
        }

        if (game) {
            const { multiplicador } = situacao(game, agora)
            return reply(F.tela({
                emoji: "🚀",
                titulo: "Você já tem um jogo aberto",
                intro: `Termine o jogo de *${moedas(game.bet)}* antes de começar outro.`,
                secoes: [{ emoji: "📋", titulo: "Jogo aberto", linhas: [
                    F.campo("Multiplicador agora", mult(multiplicador)),
                    F.campo("Recebe se sacar", moedas(Math.floor(game.bet * multiplicador)))
                ] }],
                proximos: [{ nome: "crash", args: "cashout", oque: "sacar o jogo aberto" }],
                prefix
            }))
        }

        const betAmount = /^\d+$/.test(subcommand) ? parseInt(subcommand, 10) : NaN
        if (isNaN(betAmount) || betAmount < APOSTA_MINIMA) {
            return reply(F.tela({
                emoji: "🚀",
                titulo: isNaN(betAmount) ? "Não entendi a aposta" : "Aposta baixa demais",
                intro: isNaN(betAmount)
                    ? `"${String(args[0]).slice(0, 30)}" não é um valor nem uma opção do crash. A aposta mínima é *${moedas(APOSTA_MINIMA)}*.`
                    : `A aposta mínima é *${moedas(APOSTA_MINIMA)}*.`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "crash", "100")} — aposta 100 moedas`,
                    `• ${F.cmd(prefix, "crash", "cashout")} — saca o jogo aberto`
                ] }],
                dica: `Sua carteira tem ${moedas(user.coins || 0)}.`,
                prefix
            }))
        }

        const liberaEm = Number(user.crashLiberaEm) || 0
        if (liberaEm > agora) {
            return reply(F.tela({
                emoji: "⏳",
                titulo: "Espere um pouco",
                intro: explodido
                    ? `Seu último jogo explodiu em ${mult(explodido.crashPoint)} e a aposta de *${moedas(explodido.bet)}* foi perdida. Um novo jogo libera em *${F.tempo(liberaEm - agora)}*.`
                    : `Um novo jogo de crash libera em *${F.tempo(liberaEm - agora)}*.`,
                dica: `Sua carteira tem ${moedas(user.coins || 0)}.`,
                proximos: [{ nome: "crash", args: String(betAmount), oque: "tentar de novo depois da espera" }],
                prefix
            }))
        }

        if ((user.coins || 0) < betAmount) {
            const carteira = user.coins || 0
            return reply(F.tela({
                emoji: "🪙",
                titulo: "Moedas insuficientes",
                intro: `A aposta é de *${moedas(betAmount)}*, mas você tem *${moedas(carteira)}* na carteira.`,
                dica: carteira >= APOSTA_MINIMA ? "Aposte um valor que caiba na carteira." : "Junte moedas antes de voltar ao crash.",
                proximos: [
                    carteira >= APOSTA_MINIMA ? { nome: "crash", args: String(carteira), oque: "apostar tudo o que tem" } : { nome: "trabalhar", oque: "ganhar moedas" },
                    (user.bank || 0) > 0 ? { nome: "banco", args: "sacar <valor>", oque: "trazer moedas do banco" } : null
                ].filter(Boolean),
                prefix
            }))
        }

        const carteiraAntes = user.coins || 0
        user.coins = carteiraAntes - betAmount
        user.crashAberto = { bet: betAmount, crashPoint: generateCrashPoint(), startTime: agora }
        registrar(user, { type: "crash_bet", amount: -betAmount })
        dataService.saveUser(user)

        return reply(F.tela({
            emoji: "🚀",
            titulo: "Jogo de crash começou",
            intro: `${marcar(sender)}, sua aposta de *${moedas(betAmount)}* está valendo. O multiplicador já está subindo: saque antes que exploda.`,
            secoes: [
                { emoji: "📋", titulo: "Seu jogo", linhas: [
                    F.campo("Aposta", moedas(betAmount)),
                    F.campo("Multiplicador", `${mult(1)} agora, ${mult(multiplicadorEm(20000))} em 20 s, ${mult(multiplicadorEm(40000))} em 40 s`),
                    F.campo("Em 20 s você receberia", moedas(Math.floor(betAmount * multiplicadorEm(20000)))),
                    F.campo("Carteira", `${moedas(carteiraAntes)} → *${moedas(user.coins)}*`)
                ] },
                { emoji: "📊", titulo: "Regras", linhas: REGRAS }
            ],
            dica: "Ninguém sabe quando vai explodir. Escolha um alvo e saque quando chegar nele.",
            proximos: [
                { nome: "crash", args: "cashout", oque: "sacar" },
                { nome: "crash", args: "status", oque: "ver o multiplicador agora" }
            ],
            prefix
        }), [sender])
    }
}
