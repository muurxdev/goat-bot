/**
 * Comando .raid
 * Sistema de Raids Cooperativas Globais e de Grupo contra Bosses Titânicos
 */

const dataService = require("../../services/dataService")
const { initializeUser, adicionarXp } = require("../../services/xpService")
const { aplicarBonusDano } = require("../../services/rpgService")
const { formatNumber, moedas, percentual, marcar, plural, duracao } = require("../../utils/textoRpg")
const logger = require("../../core/logger")
const { resolveHp } = require("../../services/characterEngine")
const { sortearEquipamentoRaid } = require("../../services/rpgEquipmentService")
const F = require("../../utils/formato")

const RAID_BOSSES = {
    "reidemonio": {
        nome: "Rei Demônio (Forma Primordial)",
        vidaBase: 80000,
        mult: 3.5,
        loot: ["👑 Coroa do Rei Demônio", "🗡️ Espada da Escuridão", "🧬 Fragmento Mandamento"],
        descricao: "O soberano supremo do Clã dos Demônios em sua forma colossal."
    },
    "deusasuprema": {
        nome: "Deusa Suprema (Luz Divina)",
        vidaBase: 75000,
        mult: 3.2,
        loot: ["✨ Asas do Arcanjo", "☀️ Centelha do Sol Cruel", "🛡️ Escudo da Graça"],
        descricao: "A governante do Clã das Deusas detentora das Quatro Graças."
    },
    "sombria": {
        nome: "Dragão da Ira Sombria",
        vidaBase: 60000,
        mult: 2.8,
        loot: ["🐉 Escama do Dragão Sombria", "🗡️ Lâmina Quebrada Sagrada"],
        descricao: "A manifestação titânica da fúria do Dragão de GOAT."
    },
    "ardente": {
        nome: "Ardente (4 Mandamentos Corrompido)",
        vidaBase: 70000,
        mult: 3.0,
        loot: ["🪽 Pluma Corrompida", "⚡ Raio da Punição Divina"],
        descricao: "O Arcanjo mais forte corrompido pelas trevas dos Mandamentos."
    }
}

/** Quantos participantes aparecem com detalhe na tela de vitória (os demais recebem igual, em resumo). */
const DETALHE_MAX = 8

const MEDALHAS = ["🥇", "🥈", "🥉"]

/** "2x 🪽 Pluma, ⚡ Raio" em vez de repetir o mesmo espólio. */
function agruparItens(itens) {
    const cont = new Map()
    for (const i of itens) cont.set(i, (cont.get(i) || 0) + 1)
    return [...cont.entries()].map(([i, n]) => (n > 1 ? `${n}x ${i}` : i)).join(", ")
}

/** Tela de "não há raid" — usada por atk e status. */
function semRaid(p) {
    return F.tela({
        emoji: "🐉",
        titulo: "Nenhuma raid neste grupo",
        intro: "Ninguém chamou um titã por aqui ainda. Qualquer pessoa do grupo pode abrir uma raid, e todo mundo que atacar ganha recompensa.",
        secoes: [{ emoji: "🗡️", titulo: "Como funciona", linhas: [
            "• Alguém invoca um titã",
            "• Cada pessoa ataca quantas vezes quiser",
            "• Quando o titã cai, cada um recebe XP, moedas e espólios pelo dano que causou"
        ] }],
        dica: "O Dragão Sombria é o titã com menos vida: bom para grupos pequenos.",
        prefix: p,
        proximos: [
            { nome: "raid", args: "criar sombria", oque: "invocar o titã mais fácil" },
            { nome: "raid", args: "bosses", oque: "conhecer todos os titãs" }
        ]
    })
}

module.exports = {
    name: "raid",
    aliases: ["bossraid", "raidboss", "coopraid"],
    category: "rpg",
    subcategory: "Combate",
    description: "Enfrente um titã junto com o grupo inteiro e divida as recompensas pelo dano",
    usage: "[criar <titã> | atk | status | bosses]",
    examples: [
        "criar sombria — invoca o Dragão Sombria no grupo",
        "atk — ataca o titã da raid em andamento",
        "status — mostra a vida do titã e quem mais bateu",
        "bosses — lista os titãs que dá para invocar"
    ],
    groupOnly: true,
    cooldownMs: 2500,
    execute: async ({ from, sender, args, reply, client, info, prefix }) => {
        const p = prefix || "."
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        // As raids ficavam em bossData.raids, mas o saveBossData() só persiste
        // lutas — o objeto era jogado fora no save e o raid atk seguinte
        // não achava nada. Agora usam armazenamento próprio e persistente.
        const raids = dataService.getRaidsData()
        const raidKey = from
        const currentRaid = raids[raidKey]

        const sub = (args[0] || "").toLowerCase().trim()

        // 1. CRIAR RAID NO GRUPO
        if (sub === "criar" || sub === "invocar" || sub === "iniciar") {
            if (currentRaid && currentRaid.ativo && currentRaid.vida > 0) {
                return reply(F.tela({
                    emoji: "⚔️",
                    titulo: "Já tem uma raid em andamento",
                    intro: `*${currentRaid.nome}* ainda está de pé neste grupo. Só dá para chamar outro titã depois que este cair.`,
                    secoes: [{ emoji: "❤️", titulo: "Vida do titã", linhas: [
                        `${formatNumber(Math.max(0, currentRaid.vida))} / ${formatNumber(currentRaid.vidaMax)} HP`,
                        F.barra(currentRaid.vida / currentRaid.vidaMax)
                    ] }],
                    prefix: p,
                    proximos: [
                        { nome: "raid", args: "atk", oque: "entrar na luta" },
                        { nome: "raid", args: "status", oque: "ver quem mais bateu" }
                    ]
                }))
            }

            const pedido = args[1] ? args[1].toLowerCase().replace(/[^a-z0-9]/g, "") : ""
            const chosenKey = RAID_BOSSES[pedido] ? pedido : "sombria"
            const template = RAID_BOSSES[chosenKey] || RAID_BOSSES["sombria"]
            const desconhecido = pedido && !RAID_BOSSES[pedido]

            raids[raidKey] = {
                id: chosenKey,
                nome: template.nome,
                vida: template.vidaBase,
                vidaMax: template.vidaBase,
                mult: template.mult,
                loot: template.loot,
                dano: {},
                criador: sender,
                ativo: true,
                inicio: Date.now()
            }

            dataService.saveRaidsData(raids)
            logger.info("[RAID CRIADA] Grupo " + from + " invocou Raid: " + template.nome)

            const doc = F.tela({
                emoji: "🐉",
                titulo: `${template.nome} surgiu`,
                intro: `${marcar(sender)} invocou um titã no grupo. Todo mundo pode atacar, e cada um ganha pelo dano que causar.` +
                    (desconhecido ? `\n\nNão conheço o titã "${args[1]}", então chamei o Dragão Sombria.` : ""),
                secoes: [
                    { emoji: "📜", titulo: "O titã", linhas: [
                        `_${template.descricao}_`,
                        F.campo("Vida", `${formatNumber(template.vidaBase)} HP`),
                        F.campo("Multiplicador de recompensa", `${template.mult}x`)
                    ] },
                    { emoji: "🎁", titulo: "Espólios", linhas: F.lista(template.loot) },
                    { emoji: "🏅", titulo: "Premiação", linhas: [
                        "• Quem mais bateu: 3 espólios e equipamento garantido",
                        "• 2º e 3º lugar: 2 espólios e boa chance de equipamento",
                        "• Demais: 1 espólio e metade de chance de equipamento"
                    ] }
                ],
                dica: `Cada ataque também tira um pouco da sua vida. Fique de olho e use ${p}curar se precisar.`,
                prefix: p,
                proximos: [
                    { nome: "raid", args: "atk", oque: "atacar o titã" },
                    { nome: "raid", args: "status", oque: "ver a vida e o placar" }
                ]
            })

            return reply(doc, [sender])
        }

        // 2. ATACAR O BOSS DA RAID
        if (sub === "atk" || sub === "atacar" || sub === "golpe" || !sub) {
            if (!currentRaid || !currentRaid.ativo || currentRaid.vida <= 0) {
                return reply(semRaid(p))
            }

            const level = user.level || 1
            let poderBase = (level * 25) + 150 + Math.floor(Math.random() * 80)
            let dano = poderBase

            // Bônus de Classes no Raid
            const classe = user.classe || "nenhuma"
            if (classe === "guerreiro") dano = Math.floor(dano * 1.5) + 100
            if (classe === "mago") dano = Math.floor(dano * 1.8) + 120
            if (classe === "arqueiro") dano = Math.floor(dano * 1.7) + 150
            if (classe === "ladino") dano = Math.floor(dano * 1.9) + 200
            if (classe === "paladino") dano = Math.floor(dano * 1.6) + 130
            if (classe === "berserker") dano = Math.floor(dano * 2.0) + 250
            if (classe === "necromante") dano = Math.floor(dano * 1.7) + 100
            if (classe === "curandeiro") dano = Math.floor(dano * 1.4) + 80

            let golpeDuplo = false
            if (user.classeLendaria) {
                dano += 500
                if (Math.random() < 0.35) { dano = Math.floor(dano * 2); golpeDuplo = true }
            }

            dano = Math.floor(aplicarBonusDano(user, dano))
            if (dano < 10) dano = 10

            currentRaid.vida -= dano
            if (!currentRaid.dano[sender]) currentRaid.dano[sender] = 0
            currentRaid.dano[sender] += dano

            // Dano que o jogador sofre do Boss de Raid
            const danoBoss = Math.floor(Math.random() * 35) + 15
            user.hp = Math.max(1, (user.hp || 100) - danoBoss)

            // VITÓRIA NA RAID (BOSS ELIMINADO)
            if (currentRaid.vida <= 0) {
                currentRaid.vida = 0
                currentRaid.ativo = false

                const participantes = Object.keys(currentRaid.dano)
                const mult = currentRaid.mult || 3.0

                participantes.sort((a, b) => currentRaid.dano[b] - currentRaid.dano[a])

                const linhasDetalhe = []
                const resumoResto = []
                let totalDano = 0

                participantes.forEach((pUser, rankIdx) => {
                    const pProfile = initializeUser(pUser, xpData)
                    pProfile.bossesMortos = (pProfile.bossesMortos || 0) + 1

                    const userDmg = currentRaid.dano[pUser]
                    totalDano += userDmg
                    require('../../services/bossHistoryService')
                        .registrarAbate(pProfile, currentRaid, { dano: userDmg, tipo: 'raid' })
                    const dmgPercent = percentual((userDmg / currentRaid.vidaMax) * 100)

                    const xpAward = Math.floor((300 + (userDmg / 4)) * mult)
                    const coinsAward = Math.floor((600 + (userDmg / 2)) * mult)

                    pProfile.coins = (pProfile.coins || 0) + coinsAward

                    if (!Array.isArray(pProfile.inventario)) pProfile.inventario = []
                    const limiteMochila = pProfile.mochila || 20

                    // 1. Drops Garantidos de Materiais / Loots do Titã
                    // Todos os guerreiros que atacaram a Raid recebem loot garantido!
                    const qtdLoot = rankIdx === 0 ? 3 : (rankIdx === 1 ? 2 : (rankIdx === 2 ? 2 : 1))
                    const lootsGanhos = []
                    const pool = (currentRaid.loot && currentRaid.loot.length > 0)
                        ? currentRaid.loot
                        : ["🐉 Escama do Titã Ancestral"]

                    for (let i = 0; i < qtdLoot; i++) {
                        const material = pool[i % pool.length]
                        pProfile.inventario.push(material)
                        lootsGanhos.push(material)
                    }

                    // 2. Drop de Equipamento Real do Catálogo (com CP, stats e equipar)
                    // MVP (rank 0) tem 100% de drop! Rank 1 tem 85%, Rank 2 tem 70%, demais 50%.
                    const chanceEquip = rankIdx === 0 ? 1.0 : (rankIdx === 1 ? 0.85 : (rankIdx === 2 ? 0.70 : 0.50))
                    let equipDrop = null
                    if (Math.random() <= chanceEquip) {
                        try {
                            equipDrop = sortearEquipamentoRaid(pProfile.level || 1, rankIdx, currentRaid.id)
                            if (equipDrop) {
                                pProfile.inventario.push({ ...equipDrop })
                            }
                        } catch (eErr) {
                            logger.warn('[RAID] Falha ao sortear equipamento: ' + eErr.message)
                        }
                    }

                    // 3. Processamento de Level Up
                    const { xpGanho: xpRecebido, lvlRes: lvlResult } = adicionarXp(pProfile, xpAward, { source: 'rpg' })

                    if (rankIdx < DETALHE_MAX) {
                        const medalha = MEDALHAS[rankIdx] || `${rankIdx + 1}º`
                        const bloco = [
                            `${medalha} ${marcar(pUser)} · ${formatNumber(userDmg)} de dano (${dmgPercent}%)`,
                            `   +${formatNumber(xpRecebido)} XP · +${moedas(coinsAward)} · ${agruparItens(lootsGanhos)}`
                        ]
                        if (equipDrop) {
                            bloco.push(`   ✨ ${equipDrop.raridade} ${equipDrop.nome} (+${formatNumber(equipDrop.cp)} de poder) · ${F.cmd(p, 'equipar', equipDrop.id)}`)
                        }
                        if (lvlResult && lvlResult.subiu) {
                            bloco.push(`   🆙 Subiu para o nível ${formatNumber(pProfile.level)}`)
                        }
                        if (pProfile.inventario.length > limiteMochila) {
                            bloco.push(`   🎒 Mochila acima do limite (${pProfile.inventario.length}/${limiteMochila})`)
                        }
                        linhasDetalhe.push(bloco.join('\n'))
                    } else {
                        resumoResto.push(pUser)
                    }
                })

                delete raids[raidKey]
                await dataService.saveXpData(xpData)
                dataService.saveRaidsData(raids)

                logger.info(`[RAID VENCIDA] Grupo ${from} venceu Raid com ${participantes.length} jogadores`)

                if (resumoResto.length > 0) {
                    linhasDetalhe.push(`E mais ${plural(resumoResto.length, 'pessoa recebeu', 'pessoas receberam')} XP, moedas e espólio pelo dano causado.`)
                }

                const vitoriaDoc = F.tela({
                    emoji: "🏆",
                    titulo: `${currentRaid.nome} caiu`,
                    intro: `O grupo derrubou o titã! ${marcar(sender)} deu o golpe final com *${formatNumber(dano)} de dano*.`,
                    secoes: [
                        { emoji: "📜", titulo: "Resumo da batalha", linhas: [
                            F.campo("Participantes", formatNumber(participantes.length)),
                            F.campo("Dano total", formatNumber(totalDano)),
                            F.campo("Maior dano", participantes[0] ? marcar(participantes[0]) : '—')
                        ] },
                        { emoji: "🎁", titulo: "Recompensas por dano", linhas: linhasDetalhe }
                    ],
                    dica: `Mochila cheia? Venda os espólios com ${p}vender loot ou aumente com ${p}mochila up.`,
                    prefix: p,
                    proximos: [
                        { nome: "raid", args: "criar", oque: "chamar outro titã" },
                        { nome: "inv", oque: "ver o que caiu na sua mochila" }
                    ]
                })

                return reply(vitoriaDoc, participantes)
            }

            await dataService.saveXpData(xpData)
            dataService.saveRaidsData(raids)

            const hpMax = resolveHp(user).max
            const ranking = Object.entries(currentRaid.dano).sort((a, b) => b[1] - a[1])
            const posicao = ranking.findIndex(([j]) => j === sender) + 1

            const atkDoc = F.tela({
                emoji: "⚔️",
                titulo: `Golpe de ${formatNumber(dano)} no titã`,
                intro: `${marcar(sender)}, seu ataque tirou *${formatNumber(dano)} de vida* de ${currentRaid.nome}${golpeDuplo ? ' com um golpe duplo' : ''}.`,
                secoes: [
                    { emoji: "🐉", titulo: "Vida do titã", linhas: [
                        `${formatNumber(Math.max(0, currentRaid.vida))} / ${formatNumber(currentRaid.vidaMax)} HP`,
                        F.barra(currentRaid.vida / currentRaid.vidaMax)
                    ] },
                    { emoji: "📊", titulo: "Você na raid", linhas: [
                        F.campo("Seu dano total", formatNumber(currentRaid.dano[sender])),
                        F.campo("Posição", `${posicao}º de ${ranking.length}`),
                        F.campo("Contra-ataque", `-${formatNumber(danoBoss)} HP`),
                        F.campo("Sua vida", `${formatNumber(user.hp)} / ${formatNumber(hpMax)} HP`)
                    ] }
                ],
                dica: posicao === 1
                    ? "Você é quem mais bateu: se continuar assim, leva 3 espólios e equipamento garantido."
                    : "Quanto mais dano, maior o prêmio. Os 3 primeiros levam espólios extras.",
                prefix: p,
                proximos: [
                    { nome: "raid", args: "atk", oque: "atacar de novo" },
                    { nome: "raid", args: "status", oque: "ver o placar" },
                    user.hp < hpMax * 0.3 ? { nome: "curar", oque: "recuperar a vida" } : null
                ].filter(Boolean)
            })

            return reply(atkDoc, [sender])
        }

        // 3. STATUS DA RAID ATIVA
        if (sub === "status" || sub === "info" || sub === "rank") {
            if (!currentRaid || !currentRaid.ativo) {
                return reply(semRaid(p))
            }

            const participantes = Object.entries(currentRaid.dano || {}).sort((a, b) => b[1] - a[1])
            const placar = participantes.slice(0, 5).map(([pUser, dmg], i) => {
                const percent = percentual((dmg / currentRaid.vidaMax) * 100)
                return `${MEDALHAS[i] || `${i + 1}º`} ${marcar(pUser)} · ${formatNumber(dmg)} de dano (${percent}%)`
            })
            const duracaoMs = currentRaid.inicio ? Date.now() - currentRaid.inicio : 0

            const doc = F.tela({
                emoji: "🐉",
                titulo: `Raid contra ${currentRaid.nome}`,
                intro: `O titã ainda tem *${formatNumber(Math.max(0, currentRaid.vida))} de vida*. ${participantes.length ? `${plural(participantes.length, 'pessoa já atacou', 'pessoas já atacaram')}.` : 'Ninguém atacou ainda.'}`,
                secoes: [
                    { emoji: "❤️", titulo: "Vida do titã", linhas: [
                        `${formatNumber(Math.max(0, currentRaid.vida))} / ${formatNumber(currentRaid.vidaMax)} HP`,
                        F.barra(currentRaid.vida / currentRaid.vidaMax),
                        duracaoMs >= 60000 ? F.campo("Em andamento há", duracao(duracaoMs)) : null,
                        currentRaid.criador ? F.campo("Invocado por", marcar(currentRaid.criador)) : null
                    ] },
                    { emoji: "🏅", titulo: "Quem mais bateu", linhas: placar.length ? placar : ["Ninguém atacou ainda. O primeiro golpe pode ser o seu."] }
                ],
                dica: "Todo mundo que atacar recebe recompensa quando o titã cair, mesmo com pouco dano.",
                prefix: p,
                proximos: [
                    { nome: "raid", args: "atk", oque: "atacar o titã" }
                ]
            })

            return reply(doc, participantes.map(x => x[0]).concat(currentRaid.criador ? [currentRaid.criador] : []))
        }

        // 4. CATÁLOGO DE BOSSES DE RAID
        if (sub === "bosses" || sub === "lista" || sub === "list") {
            const secoes = Object.entries(RAID_BOSSES).map(([k, b]) => ({
                emoji: "🐲",
                titulo: b.nome,
                linhas: [
                    `_${b.descricao}_`,
                    `${F.campo("Vida", `${formatNumber(b.vidaBase)} HP`)} · ${F.campo("Recompensa", `${b.mult}x`)}`,
                    F.campo("Espólios", b.loot.join(", ")),
                    `Invocar: ${F.cmd(p, "raid", "criar " + k)}`
                ]
            }))
            return reply(F.tela({
                emoji: "🐉",
                titulo: "Titãs de raid",
                intro: "Estes são os titãs que o grupo pode enfrentar junto. Mais vida significa luta mais longa, e recompensa maior.",
                secoes,
                dica: "Grupo pequeno? Comece pelo Dragão Sombria, que tem menos vida.",
                prefix: p,
                proximos: [
                    { nome: "raid", args: "criar sombria", oque: "invocar o mais fácil" },
                    { nome: "raid", args: "status", oque: "ver a raid em andamento" }
                ]
            }))
        }

        return reply(F.tela({
            emoji: "🐉",
            titulo: "Raid do grupo",
            intro: `Não conheço a opção "${args[0]}". A raid é uma luta do grupo inteiro contra um titã, e cada um ganha pelo dano que causar.`,
            secoes: [{ emoji: "📋", titulo: "Opções", linhas: [
                `• ${F.cmd(p, "raid", "criar <titã>")} — abrir uma raid no grupo`,
                `• ${F.cmd(p, "raid", "atk")} — atacar o titã`,
                `• ${F.cmd(p, "raid", "status")} — vida do titã e quem mais bateu`,
                `• ${F.cmd(p, "raid", "bosses")} — conhecer os titãs`
            ] }],
            prefix: p,
            proximos: [
                { nome: "raid", args: "criar sombria", oque: "começar agora" }
            ]
        }))
    }
}
