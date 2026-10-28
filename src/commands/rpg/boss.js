const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { gerarBoss, sortearLootBoss, aplicarBonusDano, aplicarBonusCoins } = require('../../services/rpgService')
const { bosses, mundos, petsDisponiveis } = require('../../utils/constants')
const { formatNumber, moedas, plural, percentual, marcar } = require('../../utils/textoRpg')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'boss',
    aliases: ['chefe'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Invoque chefes, ataque, ajude amigos e veja os espólios',
    usage: '<lista | criar código | atk | ajudar @pessoa | reviver | loot>',
    examples: ['lista — chefes do seu mundo', 'criar bug — invoca o chefe Bug', 'ajudar @pessoa — ataca o chefe de outra pessoa'],
    execute: async ({ text, args, from, sender, info, reply }) => {
        const subCmd = args[0] ? args[0].toLowerCase() : ''
        const param = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const bossData = dataService.getBossData()
        const missoesData = dataService.getMissoesData()

        if (subCmd === 'lista' || subCmd === 'bosses' || subCmd === 'list') {
            const mundoAtualBoss = mundos[user.mundo || 'floresta']
            let lista = `🐉 *Chefes do Reino*\n\n`
            lista += `${marcar(sender)}, você está em *${mundoAtualBoss.nome}* e já derrubou ${plural(user.bossesMortos || 0, 'chefe', 'chefes')}.\n\n`
            lista += `*Chefes do seu mundo*\n`
            mundoAtualBoss.bosses.forEach(bId => {
                const b = bosses[bId]
                if (b) {
                    lista += `• *${b.nome}* · ${formatNumber(b.vidaBase)} HP · \`.boss criar ${bId}\`\n`
                    lista += `   Efeito: ${b.efeito} · Espólios: ${b.loot?.map(l => l.nome).join(', ') || 'nenhum'}\n`
                }
            })
            lista += `\n*Todos os chefes*\n`
            Object.entries(bosses).forEach(([id, b]) => {
                lista += `• ${b.nome} · ${formatNumber(b.vidaBase)} HP · \`${id}\`\n`
            })
            lista += `\nInvoque com \`.boss criar <código>\` e veja as chances de espólio em \`.boss loot\`.`
            return reply(lista.trim(), [sender])
        }

        if (subCmd === 'loot' || subCmd === 'loots') {
            let listaLoots = '🎁 *Espólios dos chefes*\n'
            Object.entries(bosses).forEach(([id, b]) => {
                listaLoots += '\n*' + b.nome + '*\n'
                b.loot.forEach(l => {
                    listaLoots += '• ' + l.nome + ' · ' + percentual(l.chance) + '%\n'
                })
            })
            return reply(listaLoots.trim())
        }

        let donoBoss = sender
        if (subCmd === 'ajudar' || subCmd === 'ajd') {
            const marcado = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            if (!marcado) {
                return reply('❌ Marque quem você quer ajudar. Exemplo: `.boss ajudar @pessoa`')
            }
            donoBoss = marcado
        }

        const idLuta = from + '_' + donoBoss

        bossData.ultimoBoss = bossData.ultimoBoss || {}

        if (subCmd === 'reviver' || subCmd === 'voltar' || subCmd === 'respawn') {
            const ultimo = bossData.ultimoBoss[idLuta]
            if (!ultimo) {
                return reply('❌ Não há chefe recente nesta conversa para chamar de volta.\nInvoque um com `.boss criar <código>` ou veja a lista em `.boss lista`.')
            }
            if (bossData.lutas[idLuta] && bossData.lutas[idLuta].ativo) {
                return reply(`⚔️ *${bossData.lutas[idLuta].nome}* ainda está de pé nesta conversa. Ataque com \`.atk\`.`)
            }
            bossData.lutas[idLuta] = gerarBoss(ultimo.id)
            bossData.lutas[idLuta].dono = donoBoss
            await dataService.saveBossData(bossData)
            logger.info('[BOSS REVIVER] Boss ' + bossData.lutas[idLuta].nome + ' ressuscitado por ' + sender)
            const revivido = bossData.lutas[idLuta]
            return reply(`🐉 *${revivido.nome}* voltou para a revanche!\n\n*Raridade:* ${revivido.raridade}\n*Vida:* ${formatNumber(revivido.vida)} / ${formatNumber(revivido.vidaMax)} HP\n\nAtaque com \`.atk\`.`, [sender])
        }

        if (subCmd === 'criar') {
            const mundoAtualBoss = mundos[user.mundo || 'floresta']
            const bossEscolhido = param || mundoAtualBoss.bosses[0]

            if (!bosses[bossEscolhido]) {
                return reply(`❌ Não conheço o chefe \`${bossEscolhido}\`. Veja os disponíveis em \`.boss lista\`.`)
            }

            let bossMundo = null
            for (const [mKey, mVal] of Object.entries(mundos)) {
                if (mVal.bosses && mVal.bosses.includes(bossEscolhido)) {
                    bossMundo = mVal
                    break
                }
            }

            const isReborn = Number(user.rebirthCount || user.rebirth_count || 0) > 0
            const userLevel = Number(user.level || 1)
            const hasLevel = bossMundo ? userLevel >= bossMundo.minLevel : true
            const jaDerrotou = user.extra?.bossesResumo && user.extra.bossesResumo[bosses[bossEscolhido].nome]
            let isOwner = false
            try {
                const { isOwner: checkOwner } = require('../../services/ownerService')
                isOwner = checkOwner(sender)
            } catch (err) {
                logger.warn('[BOSS CRIAR] Falha ao checar se ' + sender + ' é dono: ' + err.message)
            }

            const podeInvocar = mundoAtualBoss.bosses.includes(bossEscolhido) || isReborn || hasLevel || jaDerrotou || isOwner

            if (!podeInvocar) {
                const nomeMundo = bossMundo ? bossMundo.nome : 'um mundo avançado'
                return reply(`🔒 *${bosses[bossEscolhido].nome}* vive em ${nomeMundo}, que pede nível ${bossMundo?.minLevel || '?'}. Você está no nível ${userLevel}.\nSuba de nível e use \`.viajar\`, ou reencarne com \`.reencarnar\` para enfrentar qualquer chefe.`)
            }

            if (bossData.lutas[idLuta] && bossData.lutas[idLuta].ativo) {
                return reply('⚔️ Você já tem um chefe de pé nesta conversa. Ataque com `.atk`.')
            }

            bossData.lutas[idLuta] = gerarBoss(bossEscolhido)
            bossData.lutas[idLuta].dono = donoBoss

            await dataService.saveBossData(bossData)
            logger.info('[BOSS CRIAR] User ' + sender + ' invocou boss ' + bossData.lutas[idLuta].nome)

            const novo = bossData.lutas[idLuta]
            return reply(`🐉 *${novo.nome}* apareceu, invocado por ${marcar(sender)}.\n\n*Raridade:* ${novo.raridade}\n*Vida:* ${formatNumber(novo.vida)} / ${formatNumber(novo.vidaMax)} HP\n\nAtaque com \`.atk\`. Quem quiser ajudar usa \`.boss ajudar ${marcar(sender)}\`.`, [sender])
        }

        if (subCmd === 'atk' || subCmd === 'atacar' || subCmd === 'ajudar' || subCmd === 'ajd') {
            const bossEntry = bossData.lutas[idLuta]
            if (!bossEntry || !bossEntry.ativo || bossEntry.vida <= 0) {
                delete bossData.lutas[idLuta]
                await dataService.saveBossData(bossData)
                const ultimo = bossData.ultimoBoss?.[idLuta]
                const mundoSemBoss = mundos[user.mundo || 'floresta']
                const doMundo = (mundoSemBoss?.bosses || [])
                    .filter(bId => bosses[bId])
                    .slice(0, 4)
                    .map(bId => `• *${bosses[bId].nome}* · ${formatNumber(bosses[bId].vidaBase)} HP · ${F.cmd('.', 'boss criar', bId)}`)
                const primeiro = (mundoSemBoss?.bosses || []).find(bId => bosses[bId]) || 'bug'
                return reply(F.tela({
                    emoji: '🐉',
                    titulo: 'Nenhum chefe de pé nesta conversa',
                    intro: ultimo
                        ? `O último por aqui foi *${ultimo.nome}*. Para atacar, primeiro chame um chefe.`
                        : 'Para atacar, primeiro chame um chefe. Quem invoca pode atacar, e o grupo inteiro pode ajudar.',
                    secoes: [
                        { emoji: '🗺️', titulo: `Chefes de ${mundoSemBoss?.nome || 'seu mundo'}`, linhas: doMundo },
                        { emoji: '📊', titulo: 'Sua ficha', linhas: [
                            F.campo('Nível', formatNumber(user.level || 1)),
                            F.campo('Chefes derrubados', formatNumber(user.bossesMortos || 0))
                        ] }
                    ],
                    dica: 'Chefe derrubado em grupo divide o espólio entre todo mundo que acertou.',
                    proximos: [
                        ultimo ? { nome: 'boss reviver', oque: `revanche contra ${ultimo.nome}` } : null,
                        { nome: 'boss criar', args: primeiro, oque: 'invocar um chefe agora' },
                        { nome: 'boss lista', oque: 'todos os chefes e onde vivem' }
                    ].filter(Boolean)
                }))
            }

            const boss = bossEntry
            const { calcularDanoPlayer, calcularDanoSofrido } = require('../../services/combatEngine')
            const { calculateFullCharacterStats } = require('../../services/characterEngine')
            const { getItem } = require('../../services/rpgEquipmentService')
            const stats = calculateFullCharacterStats(user)

            const combatResult = calcularDanoPlayer(user, boss)
            const dano = combatResult.danoFinal

            const armaRef = user.slots?.arma || user.arma
            const armaObj = armaRef ? (typeof armaRef === 'object' ? armaRef : getItem(armaRef)) : null
            const armaNome = armaObj ? armaObj.nome : (user.arma || 'Punhos')
            const armaAtk = armaObj ? armaObj.atk : 0

            const procs = []
            if (armaAtk > 0) {
                procs.push(`${armaNome} +${formatNumber(armaAtk)} ATK`)
            }
            if (stats.rebirths > 0) {
                procs.push(`${plural(stats.rebirths, 'reencarnação', 'reencarnações')} +${stats.rebirths * 25}% de dano`)
            }
            if (combatResult.isCritico) {
                procs.push(`acerto crítico (${stats.crit}% de chance)`)
            }
            if (combatResult.isDobro) {
                procs.push(`golpe duplo`)
            }

            // Pet equipado. O bônus SEMPRE entrou no dano (via
            // calculateFullCharacterStats), mas não aparecia nesta lista — e o
            // jogador concluía, com razão, que o pet de 100 milhões não fazia nada.
            const { resolvePetKey, petsDisponiveis: petsCat } = require('../../utils/constants')
            const petKeyAtk = resolvePetKey(user.pet)
            if (petKeyAtk && petsCat[petKeyAtk]) {
                const petInfo = petsCat[petKeyAtk]
                const partes = []
                if (petInfo.buffs?.danoPct) partes.push(`+${petInfo.buffs.danoPct}% de dano`)
                if (petInfo.buffs?.critPct) partes.push(`+${petInfo.buffs.critPct} de crítico`)
                if (petInfo.buffs?.xpPct) partes.push(`+${petInfo.buffs.xpPct}% de XP`)
                if (!partes.length && petInfo.tipo === 'dano') partes.push(`+${petInfo.valor} ATK`)
                procs.push(`${petInfo.nome}${partes.length ? ` (${partes.join(', ')})` : ''}`)
            }

            if (missoesData[sender]?.missao?.tipo === 'boss' && !missoesData[sender].concluida) {
                missoesData[sender].progresso += 1
                await dataService.saveMissoesData(missoesData)
            }

            // Dano agressivo escalonado: bosses com milhões de HP desferem golpes brutais
            const danoBaseBoss = boss.danoBase || Math.max(30, Math.floor(boss.vidaMax * 0.0012))
            const danoBossRaw = Math.floor(danoBaseBoss * (0.85 + (Math.random() * 0.30)))
            const sofridoResult = calcularDanoSofrido(user, danoBossRaw)
            const danoBoss = sofridoResult.danoMitigado

            if (sofridoResult.esquivou) {
                procs.push(`esquivou do contra-ataque`)
            } else if (sofridoResult.bloqueou) {
                procs.push(`bloqueou metade do contra-ataque`)
            }

            user.hp = Math.max(0, (user.hp || stats.hpMax) - (sofridoResult.esquivou ? 0 : danoBoss))

            if (user.hp <= 0) {
                user.hp = stats.hpMax
                await dataService.saveXpData(xpData)
                await dataService.saveBossData(bossData)

                return reply(`💀 *${boss.nome}* derrubou você com um golpe de *${formatNumber(danoBoss)} de dano*, antes que o seu acertasse.\n\n*Sua vida:* restaurada para ${formatNumber(user.hp)} / ${formatNumber(stats.hpMax)} HP\n\nRespire fundo e tente de novo com \`.atk\`.`)
            }

            boss.vida -= dano
            if (!boss.dano[sender]) boss.dano[sender] = 0
            boss.dano[sender] += dano
            // Dano total da carreira: requisito do Lorde das Sombras em .lendaria.
            user.totalDamage = (Number(user.totalDamage) || 0) + (Number(dano) || 0)

            const percentDamageDealt = percentual((dano / boss.vidaMax) * 100)
            const remainingBossPercent = Math.max(0, Math.min(100, Math.round((Math.max(0, boss.vida) / boss.vidaMax) * 100)))

            function makeHpBar(pct) {
                const totalBlocks = 10
                const filled = Math.round((pct / 100) * totalBlocks)
                const empty = totalBlocks - filled
                return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty))
            }

            if (boss.vida <= 0) {
                boss.vida = 0
                boss.ativo = false
                bossData.ultimoBoss[idLuta] = { id: boss.id, nome: boss.nome }
                delete bossData.lutas[idLuta]

                const { adicionarXp } = require('../../services/xpService')
                const participantes = Object.keys(boss.dano)
                const mult = boss.multiplicador || 1
                let relatorioRecompensas = '🏆 *' + boss.nome + '* caiu! (' + boss.raridade + ')\n\n*Recompensas*\n'

                participantes.forEach(pUser => {
                    const perfilP = initializeUser(pUser, xpData)
                    perfilP.bossesMortos = (perfilP.bossesMortos || 0) + 1
                    perfilP.wins = (perfilP.wins || 0) + 1

                    const danoP = boss.dano[pUser]
                    require('../../services/bossHistoryService')
                        .registrarAbate(perfilP, boss, { dano: danoP, tipo: 'boss' })
                    const xpBase = Math.floor((100 + danoP / 5) * mult)
                    const coinsGanho = Math.floor((200 + danoP / 3) * mult)

                    perfilP.coins = (perfilP.coins || 0) + coinsGanho

                    const { xpGanho, lvlRes: lvlResult } = adicionarXp(perfilP, xpBase, { source: 'rpg' })

                    const rebirthsP = perfilP.rebirthCount || perfilP.rebirth_count
                    relatorioRecompensas += '\n' + marcar(pUser) + '\n'
                    relatorioRecompensas += '*Dano:* ' + formatNumber(danoP) + ' (' + Math.round((danoP / boss.vidaMax) * 100) + '% da vida do chefe)\n'
                    const rebText = rebirthsP ? ` (inclui +${rebirthsP * 25}% da reencarnação)` : ''
                    relatorioRecompensas += '*Ganhos:* +' + formatNumber(xpGanho) + ' XP' + rebText + ' · +' + moedas(coinsGanho) + '\n'
                    if (lvlResult.subiu) {
                        relatorioRecompensas += '*Nível:* subiu para ' + perfilP.level + '\n'
                    }

                    let lootRecebido = null
                    if (boss.loot && boss.loot.length > 0) {
                        const chanceLoot = Math.random() * 100
                        let chanceAcumulada = 0
                        for (const l of boss.loot) {
                            chanceAcumulada += l.chance
                            if (chanceLoot < chanceAcumulada) {
                                lootRecebido = l.nome
                                if (!perfilP.inventario) perfilP.inventario = []
                                perfilP.inventario.push(l.nome)
                                break
                            }
                        }
                    }

                    if (lootRecebido) {
                        relatorioRecompensas += '*Espólio:* ' + lootRecebido + '\n'
                    }

                    // Equipamento REAL do catálogo. A tabela `boss.loot` acima só
                    // devolve nomes soltos (strings), que não viram equipamento.
                    // Boss é o conteúdo mais difícil, então a chance é alta (35%).
                    try {
                        const { sortearEquipamentoDrop } = require('../../services/rpgEquipmentService')
                        if (!Array.isArray(perfilP.inventario)) perfilP.inventario = []
                        if (perfilP.inventario.length < (perfilP.mochila || 20) && Math.random() < 0.35) {
                            const equip = sortearEquipamentoDrop((perfilP.level || 1) + 10)
                            if (equip) {
                                perfilP.inventario.push({ ...equip })
                                relatorioRecompensas += '*Equipamento:* ' + equip.raridade + ' ' + equip.nome +
                                    ' (+' + formatNumber(equip.cp) + ' de poder) · `.equipar ' + equip.id + '`\n'
                            }
                        }
                    } catch (equipErr) {
                        logger.warn('[BOSS] Falha no drop de equipamento: ' + equipErr.message)
                    }
                })

                relatorioRecompensas += '\nQuer a revanche? Chame o chefe de volta com `.boss reviver`.'

                await dataService.saveXpData(xpData)
                await dataService.saveBossData(bossData)
                logger.info('[BOSS MORTO] Boss ' + boss.nome + ' derrotado por ' + participantes.length + ' jogadores')

                return reply(relatorioRecompensas, participantes)
            }

            await dataService.saveXpData(xpData)
            await dataService.saveBossData(bossData)

            const codinomeUser = user.nicknameRpg ? `${user.nicknameRpg} (${marcar(sender)})` : marcar(sender)

            let docAtk = `⚔️ ${codinomeUser}, seu golpe tirou *${formatNumber(dano)} de vida* de ${boss.nome} (${percentDamageDealt}% do total).\n\n`
            docAtk += `*Vida do chefe:* ${formatNumber(Math.max(0, boss.vida))} / ${formatNumber(boss.vidaMax)} HP\n`
            docAtk += `${makeHpBar(remainingBossPercent)} ${remainingBossPercent}%\n`
            docAtk += `*Contra-ataque:* ${sofridoResult.esquivou ? 'você esquivou' : `-${formatNumber(danoBoss)} HP`}\n`
            docAtk += `*Sua vida:* ${formatNumber(user.hp)} / ${formatNumber(stats.hpMax)} HP\n`
            docAtk += `*Poder de combate:* ${formatNumber(stats.cp)}\n`
            if (procs.length > 0) docAtk += `*Bônus:* ${procs.join(' · ')}\n`
            docAtk += `\nAtaque de novo com \`.atk\`.`

            return reply(docAtk, [sender])
        }

        return reply('🐉 *Chefes do Reino*\n\n• `.boss lista` · ver os chefes e onde vivem\n• `.boss criar <código>` · invocar um chefe\n• `.atk` · atacar o seu chefe (o mesmo que `.boss atk`)\n• `.boss ajudar @pessoa` · atacar o chefe de outra pessoa\n• `.boss reviver` · chamar de volta o último chefe derrotado\n• `.boss loot` · chances de espólio')
    }
}
