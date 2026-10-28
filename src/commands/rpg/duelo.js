/**
 * Comando .duelo / .pvp / .x1
 * Sistema completo de Duelo PvP 1v1 e 2v2 com cálculo de equipamentos, penalidades reais de moedas e marcação explícita
 */

const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { calculateCharacterStats, getItem } = require('../../services/rpgEquipmentService')
const { formatNumber, moedas, plural, marcar } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

/** "Apelido (@número)" quando há apelido de RPG; senão só a marcação. */
function rotulo(perfil, jid) {
    return perfil.nicknameRpg ? `${perfil.nicknameRpg} (${marcar(jid)})` : marcar(jid)
}

/** Tela de como duelar — usada sem marcação e com número errado de marcações. */
function telaUso(p, intro) {
    return F.tela({
        emoji: '⚔️',
        titulo: 'Duelos',
        intro,
        secoes: [
            { emoji: '🥊', titulo: 'Digite assim', linhas: [
                `• ${F.cmd(p, 'duelo', '@pessoa')} — duelo valendo moedas e XP`,
                `• ${F.cmd(p, 'duelo', '@pessoa 500')} — duelo com aposta de 500 moedas`,
                `• ${F.cmd(p, 'duelo', '@aliado @rival1 @rival2')} — duelo em dupla`
            ] },
            { emoji: '📜', titulo: 'Regras', linhas: [
                '• Quem perde entrega moedas da carteira para quem vence',
                '• Sem aposta, a perda é 6% da carteira do perdedor (com um mínimo pelo nível)',
                '• Vale poder de combate, ataque, crítico, defesa e escudo, com um pouco de sorte',
                '• O vencedor ganha XP e troféus de arena; o perdedor perde troféus'
            ] }
        ],
        dica: 'Em aposta, as duas pessoas precisam ter o valor na carteira.',
        prefix: p,
        proximos: [
            { nome: 'forjar', oque: 'ganhar poder antes de desafiar' },
            { nome: 'perfil', oque: 'ver seu poder e vitórias' }
        ]
    })
}

module.exports = {
    name: 'duelo',
    aliases: ['pvp', 'x1', 'duel', 'combate1v1', 'lutar1v1'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Desafie alguém (ou uma dupla) para um duelo valendo moedas, XP e troféus',
    usage: '@pessoa [aposta] | @aliado @rival1 @rival2',
    examples: [
        '@pessoa — duelo valendo parte da carteira de quem perder',
        '@pessoa 500 — duelo com aposta de 500 moedas',
        '@aliado @rival1 @rival2 — você e seu aliado contra outra dupla'
    ],
    execute: async ({ info, sender, reply, args, text, prefix }) => {
        const p = prefix || '.'
        const mencao = info.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

        if (!mencao || mencao.length === 0) {
            return reply(telaUso(p, 'Desafie alguém do grupo para uma luta valendo moedas, XP e troféus de arena. Marque quem você quer enfrentar.'))
        }

        const xpData = dataService.getXpData()
        const userSender = initializeUser(sender, xpData)

        // DUELO 1V1
        if (mencao.length === 1) {
            const oponente = mencao[0]
            if (oponente === sender) {
                return reply(F.tela({
                    emoji: '🪞',
                    titulo: 'Não dá para duelar consigo mesmo',
                    intro: 'Você marcou a si mesmo. Marque outra pessoa do grupo para o duelo.',
                    prefix: p,
                    proximos: [{ nome: 'duelo', args: '@pessoa', oque: 'desafiar outra pessoa' }]
                }))
            }

            const userOponente = initializeUser(oponente, xpData)

            // Argumento opcional de aposta customizada
            let customBet = 0
            const betArg = args.find(a => /^\d+$/.test(a))
            if (betArg) {
                customBet = parseInt(betArg, 10)
                if (customBet > (userSender.coins || 0)) {
                    return reply(F.tela({
                        emoji: '🪙',
                        titulo: 'Aposta maior que sua carteira',
                        intro: `Você não tem *${moedas(customBet)}* para essa aposta.`,
                        secoes: [{ emoji: '💰', titulo: 'Carteira', linhas: [
                            F.campo('Aposta', moedas(customBet)),
                            F.campo('Seu saldo', moedas(userSender.coins || 0))
                        ] }],
                        dica: 'Aposte um valor que caiba no seu saldo, ou duele sem aposta.',
                        prefix: p,
                        proximos: [
                            (userSender.coins || 0) > 0 ? { nome: 'duelo', args: `${marcar(oponente)} ${userSender.coins}`, oque: 'apostar tudo o que você tem' } : null,
                            { nome: 'duelo', args: marcar(oponente), oque: 'duelar sem aposta' }
                        ].filter(Boolean)
                    }), [oponente])
                }
                if (customBet > (userOponente.coins || 0)) {
                    return reply(F.tela({
                        emoji: '🪙',
                        titulo: 'O rival não cobre a aposta',
                        intro: `${marcar(oponente)} não tem *${moedas(customBet)}* para cobrir essa aposta.`,
                        secoes: [{ emoji: '💰', titulo: 'Carteira do rival', linhas: [
                            F.campo('Aposta', moedas(customBet)),
                            F.campo('Saldo do rival', moedas(userOponente.coins || 0))
                        ] }],
                        dica: 'Tente um valor menor ou duele sem aposta.',
                        prefix: p,
                        proximos: [
                            (userOponente.coins || 0) > 0 ? { nome: 'duelo', args: `${marcar(oponente)} ${userOponente.coins}`, oque: 'apostar o máximo que o rival cobre' } : null,
                            { nome: 'duelo', args: marcar(oponente), oque: 'duelar sem aposta' }
                        ].filter(Boolean)
                    }), [oponente])
                }
            }

            // Estatísticas e Poder de Combate (CP) dos Lutadores
            const statsSender = calculateCharacterStats(userSender)
            const statsOponente = calculateCharacterStats(userOponente)

            const armaSenderRef = userSender.slots?.arma || userSender.arma
            const armaSender = armaSenderRef ? (typeof armaSenderRef === 'object' ? armaSenderRef.nome : (getItem(armaSenderRef)?.nome || userSender.arma)) : 'Punhos'

            const armaOponenteRef = userOponente.slots?.arma || userOponente.arma
            const armaOponente = armaOponenteRef ? (typeof armaOponenteRef === 'object' ? armaOponenteRef.nome : (getItem(armaOponenteRef)?.nome || userOponente.arma)) : 'Punhos'

            // Cálculo dinâmico de dano baseado em CP, Ataque, Crítico e Sorte
            let rollSender = statsSender.cp + (statsSender.atk * 2) + Math.floor(Math.random() * 80)
            let rollOponente = statsOponente.cp + (statsOponente.atk * 2) + Math.floor(Math.random() * 80)

            const critSender = Math.random() * 100 < statsSender.crit
            if (critSender) rollSender = Math.floor(rollSender * 1.5)

            const critOponente = Math.random() * 100 < statsOponente.crit
            if (critOponente) rollOponente = Math.floor(rollOponente * 1.5)

            // Redução por defesa, esquiva e escudo dinâmico
            const shieldEngine = require('../../services/shieldEngine')
            const shieldStatusSender = shieldEngine.getShieldStatus(userSender)
            const shieldStatusOponente = shieldEngine.getShieldStatus(userOponente)
            let shieldMsgSender = ''
            let shieldMsgOponente = ''

            if (shieldStatusOponente && shieldStatusOponente.active) {
                const abs = shieldEngine.processDamageAbsorption(userOponente, rollSender, { name: userSender.name, cp: statsSender.cp })
                if (abs.broken) {
                    shieldMsgOponente = `🛡️ O escudo de ${marcar(oponente)} se partiu com o impacto.`
                } else {
                    shieldMsgOponente = `🛡️ O escudo de ${marcar(oponente)} segurou ${formatNumber(abs.absorbedDamage)} de dano (resta ${formatNumber(abs.shieldHpRemaining)} de ${formatNumber(abs.maxHp)}).`
                }
                rollSender = Math.max(5, rollSender - abs.absorbedDamage)
            } else {
                rollSender = Math.max(10, rollSender - Math.floor(statsOponente.def * 0.4))
            }

            if (shieldStatusSender && shieldStatusSender.active) {
                const abs = shieldEngine.processDamageAbsorption(userSender, rollOponente, { name: userOponente.name, cp: statsOponente.cp })
                if (abs.broken) {
                    shieldMsgSender = `🛡️ O escudo de ${marcar(sender)} se partiu com o impacto.`
                } else {
                    shieldMsgSender = `🛡️ O escudo de ${marcar(sender)} segurou ${formatNumber(abs.absorbedDamage)} de dano (resta ${formatNumber(abs.shieldHpRemaining)} de ${formatNumber(abs.maxHp)}).`
                }
                rollOponente = Math.max(5, rollOponente - abs.absorbedDamage)
            } else {
                rollOponente = Math.max(10, rollOponente - Math.floor(statsSender.def * 0.4))
            }

            const senderVenceu = rollSender >= rollOponente
            const vencedorJid = senderVenceu ? sender : oponente
            const perdedorJid = senderVenceu ? oponente : sender

            const userVencedor = senderVenceu ? userSender : userOponente
            const userPerdedor = senderVenceu ? userOponente : userSender

            // Cálculo das moedas: Se tiver aposta, usa a aposta; senão calcula perda proporcional justa (5% do saldo do perdedor + bônus de nível)
            let coinsTransferidas = customBet
            if (coinsTransferidas <= 0) {
                const baseLoss = Math.floor((userPerdedor.coins || 0) * 0.06) // 6% do saldo da carteira
                const minLoss = (userPerdedor.level || 1) * 35 + 50
                const maxLoss = 15000
                coinsTransferidas = Math.min(maxLoss, Math.max(minLoss, baseLoss))
                // Limita ao saldo do perdedor
                coinsTransferidas = Math.min(coinsTransferidas, userPerdedor.coins || 0)
                if (coinsTransferidas < 20) coinsTransferidas = 20
            }

            const xpBase = (userPerdedor.level || 1) * 45 + Math.floor(Math.random() * 50) + 60
            const trofeusGanhos = Math.floor(Math.random() * 20) + 15
            const trofeusPerdidos = Math.floor(trofeusGanhos * 0.6)

            // Aplica transferências e estatísticas
            userVencedor.coins = (userVencedor.coins || 0) + coinsTransferidas
            userVencedor.wins = (userVencedor.wins || 0) + 1
            userVencedor.arenaPontos = (userVencedor.arenaPontos || 0) + trofeusGanhos

            userPerdedor.coins = Math.max(0, (userPerdedor.coins || 0) - coinsTransferidas)
            userPerdedor.losses = (userPerdedor.losses || 0) + 1
            userPerdedor.arenaPontos = Math.max(0, (userPerdedor.arenaPontos || 0) - trofeusPerdidos)

            // Verificação de Level Up no Vencedor
            const { xpGanho, lvlRes: lvlResult } = adicionarXp(userVencedor, xpBase, { source: 'rpg' })

            await dataService.saveXpData(xpData)
            logger.info(`[DUELO 1V1] ${sender} (${rollSender}) vs ${oponente} (${rollOponente}) -> Vencedor: ${vencedorJid} (+${coinsTransferidas} coins)`)

            const totalPartidasV = (userVencedor.wins || 0) + (userVencedor.losses || 0)
            const winrateV = totalPartidasV > 0 ? Math.round(((userVencedor.wins || 0) / totalPartidasV) * 100) : 100

            const totalPartidasP = (userPerdedor.wins || 0) + (userPerdedor.losses || 0)
            const winrateP = totalPartidasP > 0 ? Math.round(((userPerdedor.wins || 0) / totalPartidasP) * 100) : 0

            const nomeVencedor = rotulo(userVencedor, vencedorJid)
            const nomePerdedor = rotulo(userPerdedor, perdedorJid)
            const cartel = (u, wr) => `${formatNumber(u.wins || 0)} V · ${formatNumber(u.losses || 0)} D (${wr}% de aproveitamento)`
            const diferenca = Math.abs(rollSender - rollOponente)

            const doc = F.tela({
                emoji: '⚔️',
                titulo: senderVenceu ? 'Você venceu o duelo' : 'Você perdeu o duelo',
                intro: `${nomeVencedor} venceu e levou *${moedas(coinsTransferidas)}*${customBet > 0 ? ' da aposta' : ''} de ${nomePerdedor}.`,
                secoes: [
                    { emoji: '🥊', titulo: 'A luta', linhas: [
                        `${marcar(sender)} golpeou com *${formatNumber(rollSender)}*${critSender ? ' (crítico)' : ''}`,
                        `   ${armaSender} · ${formatNumber(statsSender.cp)} de poder`,
                        shieldMsgSender ? `   ${shieldMsgSender}` : null,
                        `${marcar(oponente)} golpeou com *${formatNumber(rollOponente)}*${critOponente ? ' (crítico)' : ''}`,
                        `   ${armaOponente} · ${formatNumber(statsOponente.cp)} de poder`,
                        shieldMsgOponente ? `   ${shieldMsgOponente}` : null,
                        F.campo('Diferença', formatNumber(diferenca))
                    ] },
                    { emoji: '🏆', titulo: 'Vencedor', linhas: [
                        nomeVencedor,
                        F.campo('Ganhos', `+${moedas(coinsTransferidas)} · +${formatNumber(xpGanho)} XP · +${plural(trofeusGanhos, 'troféu', 'troféus')}`),
                        F.campo('Saldo', moedas(userVencedor.coins || 0)),
                        F.campo('Cartel', cartel(userVencedor, winrateV)),
                        lvlResult.subiu ? `🆙 Subiu para o nível ${formatNumber(userVencedor.level)}` : null
                    ] },
                    { emoji: '💀', titulo: 'Perdedor', linhas: [
                        nomePerdedor,
                        F.campo('Perdas', `-${moedas(coinsTransferidas)} · -${plural(trofeusPerdidos, 'troféu', 'troféus')}`),
                        F.campo('Saldo', moedas(userPerdedor.coins || 0)),
                        F.campo('Cartel', cartel(userPerdedor, winrateP))
                    ] }
                ],
                dica: diferenca < 80
                    ? 'Foi por pouco: a sorte decide lutas equilibradas. Uma revanche pode virar o jogo.'
                    : 'O poder de combate pesa muito no duelo. Forjar o equipamento aumenta ataque e poder de uma vez.',
                prefix: p,
                proximos: [
                    { nome: 'duelo', args: `${marcar(oponente)} 500`, oque: 'revanche com aposta' },
                    { nome: 'forjar', oque: 'ficar mais forte' },
                    { nome: 'arena', oque: 'ver sua arena e troféus' }
                ]
            })

            return reply(doc, [sender, oponente, vencedorJid, perdedorJid])
        }

        // DUELO 2V2 EM DUPLAS
        if (mencao.length === 3) {
            const jogador1 = sender
            const jogador2 = mencao[0]
            const jogador3 = mencao[1]
            const jogador4 = mencao[2]

            const jogadores = [jogador1, jogador2, jogador3, jogador4]
            if (new Set(jogadores).size !== 4) {
                return reply(F.tela({
                    emoji: '👥',
                    titulo: 'Duelo em dupla precisa de 4 pessoas',
                    intro: 'No duelo em dupla, as quatro pessoas precisam ser diferentes: você, seu aliado e os dois rivais. Alguém foi marcado duas vezes (ou você se marcou).',
                    prefix: p,
                    proximos: [{ nome: 'duelo', args: '@aliado @rival1 @rival2', oque: 'tentar de novo' }]
                }))
            }

            const p1 = initializeUser(jogador1, xpData)
            const p2 = initializeUser(jogador2, xpData)
            const p3 = initializeUser(jogador3, xpData)
            const p4 = initializeUser(jogador4, xpData)

            const s1 = calculateCharacterStats(p1)
            const s2 = calculateCharacterStats(p2)
            const s3 = calculateCharacterStats(p3)
            const s4 = calculateCharacterStats(p4)

            const poderT1 = s1.cp + s2.cp + (s1.atk + s2.atk) + Math.floor(Math.random() * 150)
            const poderT2 = s3.cp + s4.cp + (s3.atk + s4.atk) + Math.floor(Math.random() * 150)

            const t1Venceu = poderT1 >= poderT2
            const vencedores = t1Venceu ? [jogador1, jogador2] : [jogador3, jogador4]
            const perdedores = t1Venceu ? [jogador3, jogador4] : [jogador1, jogador2]

            const coinsPorVencedor = 200
            const coinsPorPerdedor = 100
            const xpPorVencedor = 150

            const subiram = []
            for (const j of vencedores) {
                const u = initializeUser(j, xpData)
                u.coins = (u.coins || 0) + coinsPorVencedor
                u.wins = (u.wins || 0) + 1
                const { lvlRes } = adicionarXp(u, xpPorVencedor, { source: 'rpg' })
                if (lvlRes.subiu) subiram.push(`${marcar(j)} (nível ${formatNumber(u.level)})`)
            }

            for (const j of perdedores) {
                const u = initializeUser(j, xpData)
                u.coins = Math.max(0, (u.coins || 0) - coinsPorPerdedor)
                u.losses = (u.losses || 0) + 1
            }

            await dataService.saveXpData(xpData)

            const doc = F.tela({
                emoji: '⚔️',
                titulo: t1Venceu ? 'Sua dupla venceu' : 'Sua dupla perdeu',
                intro: `${marcar(vencedores[0])} e ${marcar(vencedores[1])} venceram o duelo em dupla e levaram *${moedas(coinsPorVencedor)}* cada.`,
                secoes: [
                    { emoji: '🥊', titulo: 'As duplas', linhas: [
                        F.campo('Dupla 1', `${marcar(jogador1)} e ${marcar(jogador2)}`),
                        `   ${formatNumber(poderT1)} de poder${t1Venceu ? ' 🏆' : ''}`,
                        F.campo('Dupla 2', `${marcar(jogador3)} e ${marcar(jogador4)}`),
                        `   ${formatNumber(poderT2)} de poder${t1Venceu ? '' : ' 🏆'}`
                    ] },
                    { emoji: '💰', titulo: 'Resultado', linhas: [
                        F.campo('Cada vencedor', `+${moedas(coinsPorVencedor)} e +${formatNumber(xpPorVencedor)} XP`),
                        F.campo('Cada perdedor', `-${moedas(coinsPorPerdedor)}`),
                        subiram.length ? `🆙 Subiu de nível: ${subiram.join(', ')}` : null
                    ] }
                ],
                dica: 'Na dupla conta a soma do poder e do ataque dos dois. Escolha um aliado forte.',
                prefix: p,
                proximos: [
                    { nome: 'duelo', args: '@aliado @rival1 @rival2', oque: 'jogar outra rodada' },
                    { nome: 'duelo', args: '@pessoa', oque: 'desafiar alguém sozinho' }
                ]
            })

            return reply(doc, jogadores)
        }

        return reply(telaUso(p, `Você marcou ${plural(mencao.length, 'pessoa', 'pessoas')}, e não sei montar esse duelo. Marque *1* pessoa para o duelo comum ou *3* para o duelo em dupla.`))
    }
}
