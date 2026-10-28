const fs = require('fs')
const path = require('path')

const baseDir = path.join(__dirname, '..', 'src', 'commands')

const commands = {}

commands['rpg/arena.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer } = require('../../services/rpgService')
const { arenas } = require('../../utils/constants')

module.exports = {
    name: 'arena',
    aliases: ['arenas', 'coliseu'],
    category: 'rpg',
    description: 'Lista todas as 20 arenas do bot e mostra sua arena atual',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        let textoArenas = '🏟️ *ARENAS DO GOAT BOT*\\n\\n'
        Object.entries(arenas).forEach(([num, a]) => {
            const atual = Number(num) === user.arenaAtual ? '👈 (Você está aqui)' : ''
            const status = (user.arenaPontos || 0) >= a.pontos ? '🟢' : '🔒'
            textoArenas += status + ' *Arena ' + num + ':* ' + a.nome + ' (' + a.pontos + ' troféus) ' + atual + '\\n'
        })

        textoArenas += '\\n🏆 *Seus Troféus:* ' + (user.arenaPontos || 0) + '\\nUse *.batalhar* para desafiar a arena atual!'
        await reply(textoArenas)
    }
}`

commands['rpg/arenainfo.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer } = require('../../services/rpgService')
const { arenas } = require('../../utils/constants')

module.exports = {
    name: 'arenainfo',
    aliases: ['minhaarena'],
    category: 'rpg',
    description: 'Exibe informações sobre sua arena atual e requisitos para a próxima',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        const arenaAtual = arenas[user.arenaAtual] || arenas[1]
        const proximaArena = Object.values(arenas).find(a => a.pontos > (user.arenaPontos || 0))

        const texto = '🏟️ *SUA ARENA ATUAL*\\n\\n' + arenaAtual.nome + '\\n\\n🏆 *Seus Troféus:* ' + (user.arenaPontos || 0) + '\\n🔓 *Próxima Arena:* ' + (proximaArena ? (proximaArena.nome + ' (' + proximaArena.pontos + ' troféus)') : '👑 ARENA MÁXIMA ALCANÇADA!')
        await reply(texto)
    }
}`

commands['rpg/arenarank.js'] = `const dataService = require('../../services/dataService')

module.exports = {
    name: 'arenarank',
    aliases: ['toparena', 'arenaleaderboard'],
    category: 'rpg',
    description: 'Exibe o top 10 jogadores com maior pontuação de arena',
    execute: async ({ reply }) => {
        const xpData = dataService.getXpData()
        const ranking = Object.entries(xpData)
            .sort((a, b) => (b[1].arenaPontos || 0) - (a[1].arenaPontos || 0))
            .slice(0, 10)

        if (ranking.length === 0) {
            return reply('🏟️ Nenhum jogador na classificação da arena ainda.')
        }

        let textoArena = '🏟️ *TOP RANKING DA ARENA*\\n\\n'
        const mentions = []

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            mentions.push(user[0])
            textoArena += medalha + ' *#' + (i + 1) + '* @' + user[0].split('@')[0] + '\\n🏆 *Troféus:* ' + (user[1].arenaPontos || 0) + '\\n\\n'
        })

        await reply(textoArena, mentions)
    }
}`

commands['rpg/atk.js'] = `const bossCommand = require('./boss')

module.exports = {
    name: 'atk',
    aliases: ['atacar', 'hit', 'bater'],
    category: 'rpg',
    description: 'Atalho rápido para atacar o Boss ativo (.boss atk)',
    execute: async (context) => {
        context.args = ['atk']
        return bossCommand.execute(context)
    }
}`

commands['rpg/batalhar.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer, aplicarBonusDano, aplicarBonusCoins } = require('../../services/rpgService')
const { arenas, cartasArena } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'batalhar',
    aliases: ['lutararena', 'arenabattle'],
    category: 'rpg',
    description: 'Batalha na sua arena atual contra guardiões para ganhar troféus e coins',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        const arenaJogador = arenas[user.arenaAtual]
        if (!arenaJogador) {
            return reply('❌ Arena inválida. Use .arena para listar.')
        }

        const cartasDaArena = cartasArena[user.arenaAtual] || ['Guardião da Arena']
        const inimigo = cartasDaArena[Math.floor(Math.random() * cartasDaArena.length)]

        let poderPlayerBase = (user.level * 20) + Math.floor(Math.random() * 150)
        let poderPlayer = aplicarBonusDano(user, poderPlayerBase)

        const poderArena = Math.floor(arenaJogador.pontos / 20) + Math.floor(Math.random() * 200) + 50

        if (poderPlayer >= poderArena) {
            const ganhoTrofeus = Math.floor(Math.random() * 35) + 15
            const ganhoCoins = aplicarBonusCoins(user, 50)

            user.arenaPontos = (user.arenaPontos || 0) + ganhoTrofeus
            user.coins = (user.coins || 0) + ganhoCoins
            atualizarArenaPlayer(user)

            await dataService.saveXpData(xpData)
            logger.info('[BATALHAR] User ' + sender + ' venceu arena ' + user.arenaAtual + ' (+' + ganhoTrofeus + ' troféus)')

            return reply('🏆 *BATALHA DE ARENA — VITÓRIA!*\\n\\n👤 @' + sender.split('@')[0] + ' *VS* ⚔️ ' + inimigo + '\\n\\n💥 *Seu Poder:* ' + poderPlayer + '\\n💀 *Poder do Guardião:* ' + poderArena + '\\n\\n✅ *Você venceu o combate!*\\n🏆 *+' + ganhoTrofeus + ' Troféus de Arena*\\n💰 *+' + ganhoCoins + ' Coins*\\n\\n🏟️ *Arena Atual:* ' + arenaJogador.nome + '\\n🏅 *Total de Troféus:* ' + user.arenaPontos, [sender])
        }

        const perdaTrofeus = Math.floor(Math.random() * 20) + 5
        user.arenaPontos = Math.max(0, (user.arenaPontos || 0) - perdaTrofeus)
        atualizarArenaPlayer(user)

        await dataService.saveXpData(xpData)
        logger.info('[BATALHAR] User ' + sender + ' perdeu na arena (-' + perdaTrofeus + ' troféus)')

        return reply('💀 *BATALHA DE ARENA — DERROTA!*\\n\\n👤 @' + sender.split('@')[0] + ' *VS* ⚔️ ' + inimigo + '\\n\\n💥 *Seu Poder:* ' + poderPlayer + '\\n💀 *Poder do Guardião:* ' + poderArena + '\\n\\n❌ *Você foi derrotado!*\\n🏆 *-' + perdaTrofeus + ' Troféus de Arena*\\n\\n🏟️ *Arena Atual:* ' + arenaJogador.nome + '\\n🏅 *Total de Troféus:* ' + user.arenaPontos, [sender])
    }
}`

commands['rpg/boss.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { gerarBoss, sortearLootBoss, aplicarBonusDano, aplicarBonusCoins } = require('../../services/rpgService')
const { bosses, mundos, petsDisponiveis } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'boss',
    aliases: ['chefe', 'raid'],
    category: 'rpg',
    description: 'Sistema completo de Bosses: criar, atacar, ajudar e consultar recompensas',
    execute: async ({ text, args, from, sender, info, reply }) => {
        const subCmd = args[0] ? args[0].toLowerCase() : ''
        const param = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const bossData = dataService.getBossData()
        const missoesData = dataService.getMissoesData()

        if (subCmd === 'lista') {
            let lista = '🐉 *BOSSES DISPONÍVEIS*\\n\\n'
            Object.entries(bosses).forEach(([id, b]) => {
                lista += '👑 *' + b.nome + '* (' + id + ')\\n❤️ Vida Base: ' + b.vidaBase + '\\n✨ Efeito: ' + b.efeito + '\\n\\n'
            })
            lista += 'Use: .boss criar [id]'
            return reply(lista)
        }

        if (subCmd === 'loot' || subCmd === 'loots') {
            let listaLoots = '🐉 *TABELA DE LOOTS DE BOSSES*\\n\\n'
            Object.entries(bosses).forEach(([id, b]) => {
                listaLoots += '🧬 *' + b.nome + ':*\\n'
                b.loot.forEach(l => {
                    listaLoots += '• ' + l.nome + ' - ' + l.chance + '%\\n'
                })
                listaLoots += '\\n'
            })
            return reply(listaLoots)
        }

        let donoBoss = sender
        if (subCmd === 'ajudar' || subCmd === 'ajd') {
            const marcado = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            if (!marcado) {
                return reply('❌ Marque quem você deseja ajudar no Boss. Exemplo: .boss ajudar @usuario')
            }
            donoBoss = marcado
        }

        const idLuta = from + '_' + donoBoss

        if (subCmd === 'criar') {
            const mundoAtualBoss = mundos[user.mundo || 'floresta']
            const bossEscolhido = param || mundoAtualBoss.bosses[0]

            if (!mundoAtualBoss.bosses.includes(bossEscolhido)) {
                return reply('🚫 *Boss Bloqueado!*\\n\\n🐉 Boss: ' + bossEscolhido + '\\n🌍 Seu mundo atual: ' + mundoAtualBoss.nome + '\\n❌ Este boss não pertence ao seu mundo atual.')
            }

            if (bossData.lutas[idLuta] && bossData.lutas[idLuta].ativo) {
                return reply('❌ Você já possui um Boss ativo nesta sala!\\n\\nUse: .boss atk ou .atk')
            }

            bossData.lutas[idLuta] = gerarBoss(bossEscolhido)
            bossData.lutas[idLuta].dono = donoBoss

            await dataService.saveBossData(bossData)
            logger.info('[BOSS CRIAR] User ' + sender + ' invocou boss ' + bossData.lutas[idLuta].nome)

            return reply('🐉 *BOSS INVOCADO COM SUCESSO!*\\n\\n👑 *Invocador:* @' + sender.split('@')[0] + '\\n🧬 *Boss:* ' + bossData.lutas[idLuta].nome + '\\n✨ *Raridade:* ' + bossData.lutas[idLuta].raridade + '\\n❤️ *Vida:* ' + bossData.lutas[idLuta].vida + ' / ' + bossData.lutas[idLuta].vidaMax + '\\n\\nUse *.boss atk* ou *.atk* para atacar!', [sender])
        }

        if (subCmd === 'atk' || subCmd === 'atacar' || subCmd === 'ajudar' || subCmd === 'ajd') {
            if (!bossData.lutas[idLuta] || !bossData.lutas[idLuta].ativo) {
                return reply('❌ Nenhum Boss ativo encontrado para lutar.\\n\\nUse: .boss criar bug')
            }

            const boss = bossData.lutas[idLuta]

            let dano = (user.level * 5) + Math.floor(Math.random() * 100)

            const classe = user.classe || 'nenhuma'
            if (classe === 'arquimago' && Math.random() < 0.25) dano *= 3
            if (classe === 'guardiao') { dano += 50; user.xp = (user.xp || 0) + 20 }
            if (classe === 'bughunter' && Math.random() < 0.20) dano += 300
            if (classe === 'nuvem') user.coins = (user.coins || 0) + aplicarBonusCoins(user, 50)
            if (classe === 'ia' && Math.random() < 0.30) dano *= 2
            if (classe === 'hacker') dano += Math.floor(Math.random() * 400)
            if (classe === 'fullstack') { dano += 75; user.coins = (user.coins || 0) + 20 }
            if (classe === 'necromante') {
                user.bugPower = (user.bugPower || 0) + 10
                dano += user.bugPower
            }

            const lendaria = user.classeLendaria
            if (lendaria === 'arquiteto') { dano += 200; user.coins = (user.coins || 0) + 100 }
            if (lendaria === 'cloudlord') dano += 300
            if (lendaria === 'senhorbugs') dano += 400
            if (lendaria === 'infernal') { dano += 300; user.coins = (user.coins || 0) + 150 }
            if (lendaria === 'neural' && Math.random() < 0.50) dano *= 2
            if (lendaria === 'draconico') dano += 600
            if (lendaria === 'voidking') dano += 1000
            if (lendaria === 'deusfullstack') dano *= 2
            if (lendaria === 'reibugs') { user.bugPower = (user.bugPower || 0) + 50; dano += user.bugPower }
            if (lendaria === 'singularidade' && Math.random() < 0.50) dano *= 2

            if (user.pet && petsDisponiveis[user.pet]) {
                const petBonus = petsDisponiveis[user.pet]
                if (petBonus.tipo === 'dano') dano += petBonus.valor
                else if (petBonus.tipo === 'critico' && Math.random() < 0.1) dano += petBonus.valor
                else if (petBonus.tipo === 'dobro' && Math.random() < 0.2) dano *= petBonus.valor
            }

            if (user.equipado === '⚔️ Espada de Bug') dano += 150
            if (user.equipado === '💍 Anel Neural') user.xp = (user.xp || 0) + 50

            dano = Math.floor(aplicarBonusDano(user, dano))

            if (boss.efeito === 'queimadura') user.xp = (user.xp || 0) + 10
            if (boss.efeito === 'roubo') user.coins = Math.max(0, (user.coins || 0) - 20)
            if (boss.efeito === 'duplicar' && Math.random() < 0.25) dano *= 2
            if (boss.efeito === 'defesa') dano = Math.floor(dano * 0.75)

            if (missoesData[sender]?.missao?.tipo === 'boss' && !missoesData[sender].concluida) {
                missoesData[sender].progresso += 1
                await dataService.saveMissoesData(missoesData)
            }

            let danoBoss = Math.floor(Math.random() * 40) + 10
            if (user.equipado === '🛡️ Armadura de Firewall') danoBoss = Math.max(0, danoBoss - 10)

            user.hp = (user.hp || user.hpMax || 100) - danoBoss

            if (user.hp <= 0) {
                user.hp = user.hpMax || 100
                await dataService.saveXpData(xpData)
                await dataService.saveBossData(bossData)

                return reply('💀 *VOCÊ MORREU NO COMBATE!*\\n\\n🐉 O Boss desferiu um ataque de ' + danoBoss + ' de dano.\\n❤️ Seu HP foi restaurado para ' + user.hp + '/' + user.hpMax + '.\\n⚠️ Você não conseguiu causar dano no Boss nesta rodada.')
            }

            boss.vida -= dano
            if (!boss.dano[sender]) boss.dano[sender] = 0
            boss.dano[sender] += dano

            if (boss.vida <= 0) {
                boss.vida = 0
                boss.ativo = false
                delete bossData.lutas[idLuta]

                const participantes = Object.keys(boss.dano)
                const mult = boss.multiplicador || 1
                let relatorioRecompensas = '🏆 *BOSS DERROTADO COM SUCESSO!*\\n\\n👑 *' + boss.nome + '* foi eliminado!\\n\\n🎁 *RECOMPENSAS DISTRIBUÍDAS:*\\n'

                participantes.forEach(pUser => {
                    const perfilP = initializeUser(pUser, xpData)
                    perfilP.bossesMortos = (perfilP.bossesMortos || 0) + 1

                    const danoP = boss.dano[pUser]
                    const xpGanho = Math.floor((100 + danoP / 5) * mult)
                    const coinsGanho = Math.floor((200 + danoP / 3) * mult)

                    perfilP.xp = (perfilP.xp || 0) + xpGanho
                    perfilP.coins = (perfilP.coins || 0) + coinsGanho

                    const loot = sortearLootBoss(boss)
                    let lootTexto = 'Nenhum'
                    if (loot) {
                        if ((perfilP.inventario?.length || 0) < (perfilP.mochila || 20)) {
                            if (!perfilP.inventario) perfilP.inventario = []
                            perfilP.inventario.push(loot.nome)
                            lootTexto = loot.nome
                        }
                    }

                    relatorioRecompensas += '\\n👤 @' + pUser.split('@')[0] + '\\n⚔️ Dano: ' + danoP + '\\n⭐ +' + xpGanho + ' XP | 💰 +' + coinsGanho + ' Coins\\n📦 Loot: ' + lootTexto + '\\n'
                })

                await dataService.saveXpData(xpData)
                await dataService.saveBossData(bossData)
                logger.info('[BOSS MORTO] Boss ' + boss.nome + ' derrotado por ' + participantes.length + ' jogadores')

                return reply(relatorioRecompensas, participantes)
            }

            await dataService.saveXpData(xpData)
            await dataService.saveBossData(bossData)

            return reply('⚔️ *ATAQUE AO BOSS!*\\n\\n🐉 *' + boss.nome + '* (' + boss.raridade + ')\\n💥 Dano causado por você: *' + dano + '*\\n🩸 Vida restante do Boss: *' + Math.max(0, boss.vida) + ' / ' + boss.vidaMax + '*\\n\\n💔 Dano sofrido: *' + danoBoss + '*\\n❤️ Seu HP: *' + user.hp + ' / ' + user.hpMax + '*')
        }

        return reply('🐉 *SISTEMA DE BOSSES*\\n\\n• *.boss lista* — Ver todos os Bosses\\n• *.boss criar [nome]* — Invocar Boss do mundo atual\\n• *.boss atk* ou *.atk* — Atacar seu Boss\\n• *.boss ajudar @usuario* — Ajudar outro jogador na luta\\n• *.boss loot* — Ver tabela de drops')
    }
}`

commands['rpg/cartas.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { arenas, cartasArena } = require('../../utils/constants')

module.exports = {
    name: 'cartas',
    aliases: ['cards', 'guardioes'],
    category: 'rpg',
    description: 'Lista as cartas e guardiões de uma determinada arena (.cartas [numero])',
    execute: async ({ text, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const arenaNum = Number(text) || user.arenaAtual || 1
        if (!arenas[arenaNum]) {
            return reply('❌ Arena inválida. As arenas vão do número 1 ao 20.')
        }

        const cartas = cartasArena[arenaNum] || []

        const texto = '🃏 *CARTAS E GUARDIÕES DA ARENA*\\n\\n' + arenas[arenaNum].nome + '\\n\\n' + cartas.map(c => '• ' + c).join('\\n') + '\\n\\nPara consultar outra arena:\\n*.cartas [1-20]*'
        await reply(texto)
    }
}`

commands['rpg/classe.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classes } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'classe',
    aliases: ['classes', 'vocacao'],
    category: 'rpg',
    description: 'Sistema de classes do jogador: listar, ver informações ou escolher',
    execute: async ({ args, sender, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nomeClasse = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao || acao === 'lista') {
            let listaTexto = '⚔️ *CLASSES DO REINO*\\n\\n'
            Object.entries(classes).forEach(([id, c]) => {
                listaTexto += c.nome + ' (id: ' + id + ')\\n✨ ' + c.habilidade + '\\n\\n'
            })
            listaTexto += 'Para ver detalhes: *.classe info [id]*\\nPara escolher: *.classe escolher [id]*'
            return reply(listaTexto)
        }

        if (acao === 'info') {
            if (!nomeClasse) return reply('❌ Use: .classe info [nome]\\nExemplo: .classe info arquimago')
            const c = classes[nomeClasse]
            if (!c) return reply('❌ Classe não encontrada. Use .classe lista.')

            return reply('🧬 *INFORMAÇÕES DA CLASSE*\\n\\n' + c.nome + '\\n\\n📌 *Descrição:* ' + c.descricao + '\\n✨ *Habilidade:* ' + c.habilidade + '\\n\\nPara escolher use:\\n*.classe escolher ' + nomeClasse + '*')
        }

        if (acao === 'escolher') {
            if (!nomeClasse) return reply('❌ Use: .classe escolher [nome]\\nExemplo: .classe escolher arquimago')
            if (!classes[nomeClasse]) return reply('❌ Classe inválida. Use .classe lista.')

            if (user.classe) {
                return reply('❌ Você já possui uma classe ativa (*' + (classes[user.classe]?.nome || user.classe) + '*). Para trocar, use: *.classeshop*')
            }

            user.classe = nomeClasse
            await dataService.saveXpData(xpData)
            logger.info('[CLASSE] User ' + sender + ' escolheu ' + nomeClasse)

            return reply('🎉 *CLASSE ESCOLHIDA COM SUCESSO!*\\n\\n' + classes[nomeClasse].nome + '\\n\\n📌 ' + classes[nomeClasse].descricao + '\\n✨ ' + classes[nomeClasse].habilidade)
        }

        return reply('❌ Opção inválida. Use: .classe lista, .classe info [nome] ou .classe escolher [nome]')
    }
}`

commands['rpg/classeshop.js'] = `module.exports = {
    name: 'classeshop',
    aliases: ['lojaclasses', 'trocarclasse'],
    category: 'rpg',
    description: 'Loja para compra e troca de classes com coins',
    execute: async ({ reply }) => {
        const lojaClasses = \`🏪 *LOJA DE CLASSES*

🧙 *Arquimago do Código*
💰 800 coins | Use: .comprarclasse arquimago

🛡️ *Guardião do Servidor*
💰 800 coins | Use: .comprarclasse guardiao

⚡ *Bug Hunter*
💰 1000 coins | Use: .comprarclasse bughunter

☁️ *Mestre da Nuvem*
💰 1000 coins | Use: .comprarclasse nuvem

🤖 *Engenheiro de IA*
💰 1500 coins | Use: .comprarclasse ia

🕶️ *Hacker Fantasma*
💰 1500 coins | Use: .comprarclasse hacker

🔥 *Dev Full Stack*
💰 2000 coins | Use: .comprarclasse fullstack

💀 *Necromante dos Bugs*
💰 2500 coins | Use: .comprarclasse necromante\`
        await reply(lojaClasses)
    }
}`

commands['rpg/comprarclasse.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classes } = require('../../utils/constants')
const logger = require('../../core/logger')

const precosClasses = {
    arquimago: 800,
    guardiao: 800,
    bughunter: 1000,
    nuvem: 1000,
    ia: 1500,
    hacker: 1500,
    fullstack: 2000,
    necromante: 2500
}

module.exports = {
    name: 'comprarclasse',
    aliases: ['mudarclasse', 'adquirirclasse'],
    category: 'rpg',
    description: 'Compra e equipa uma nova classe utilizando coins (.classeshop)',
    execute: async ({ text, sender, reply }) => {
        if (!text) return reply('❌ Use: .comprarclasse [nome]\\nExemplo: .comprarclasse fullstack')

        const classeEscolhida = text.toLowerCase().trim()
        if (!classes[classeEscolhida] || !precosClasses[classeEscolhida]) {
            return reply('❌ Classe inválida. Use .classeshop para ver as disponíveis.')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const preco = precosClasses[classeEscolhida]
        if ((user.coins || 0) < preco) {
            return reply('❌ Coins insuficientes.\\n\\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\\n🏷️ Preço da classe: ' + preco + ' coins')
        }

        user.coins -= preco
        user.classe = classeEscolhida
        user.bugPower = 0

        await dataService.saveXpData(xpData)
        logger.info('[COMPRARCLASSE] User ' + sender + ' comprou classe ' + classeEscolhida)

        await reply('🎉 *CLASSE COMPRADA E EQUIPADA!*\\n\\n' + classes[classeEscolhida].nome + '\\n\\n💰 Coins restantes: ' + user.coins)
    }
}`

commands['rpg/craft.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { equipamentos } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'craft',
    aliases: ['craftar', 'forjar'],
    category: 'rpg',
    description: 'Sistema de forja de equipamentos através de receitas de loots',
    execute: async ({ text, args, sender, reply }) => {
        const craftData = dataService.getCraftData()
        if (!craftData[sender]) craftData[sender] = []

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const acaoCraft = args[0] ? args[0].toLowerCase() : ''
        const nomeCraft = args.slice(1).join(' ').trim()

        if (!text || acaoCraft === 'lista') {
            let listaEquipamentos = '⚒️ *EQUIPAMENTOS DISPONÍVEIS PARA CRAFT*\\n\\n'
            Object.entries(equipamentos).forEach(([id, equip]) => {
                listaEquipamentos += '🗡️ *' + equip.nome + '*\\n🆔 *ID:* ' + id + '\\n🏷️ Tipo: ' + equip.tipo + '\\n✨ Bônus: ' + equip.bonus + '\\n📦 *Receita:*\\n' + Object.entries(equip.receita).map(([item, qtd]) => '  • ' + qtd + 'x ' + item).join('\\n') + '\\n\\n'
            })
            listaEquipamentos += 'Use: *.craft fazer [id/nome]* ou *.craft [id]*'
            return reply(listaEquipamentos)
        }

        if (acaoCraft === 'meus') {
            if (craftData[sender].length === 0) {
                return reply('⚒️ Você ainda não craftou nenhum equipamento.')
            }
            let meusCrafts = '⚒️ *MEUS EQUIPAMENTOS CRAFTADOS*\\n\\n'
            craftData[sender].forEach(equip => {
                meusCrafts += '• ' + equip + '\\n'
            })
            return reply(meusCrafts)
        }

        const termoBusca = (acaoCraft === 'fazer' ? nomeCraft : text).toLowerCase().trim()
        const craftKey = Object.keys(equipamentos).find(k => k.toLowerCase() === termoBusca)
        const eq = craftKey ? equipamentos[craftKey] : Object.values(equipamentos).find(e => e.nome.toLowerCase().includes(termoBusca))

        if (!eq) {
            return reply('❌ Equipamento não encontrado.\\nUse: .craft lista')
        }

        const invCraft = user.inventario
        let faltam = []
        let temTudo = true

        for (const [item, qtd] of Object.entries(eq.receita)) {
            const quantidadeNoInv = invCraft.filter(i => i === item).length
            if (quantidadeNoInv < qtd) {
                temTudo = false
                faltam.push(item + ': ' + quantidadeNoInv + '/' + qtd)
            }
        }

        if (!temTudo) {
            return reply('❌ *MATERIAIS INSUFICIENTES!*\\n\\nFaltam:\\n' + faltam.join('\\n') + '\\n\\nConsulte seus itens com: *.inv*')
        }

        for (const [item, qtd] of Object.entries(eq.receita)) {
            for (let i = 0; i < qtd; i++) {
                const index = user.inventario.indexOf(item)
                if (index !== -1) {
                    user.inventario.splice(index, 1)
                }
            }
        }

        user.inventario.push(eq.nome)
        if (!craftData[sender].includes(eq.nome)) {
            craftData[sender].push(eq.nome)
        }

        await dataService.saveXpData(xpData)
        await dataService.saveCraftData(craftData)
        logger.info('[CRAFT] User ' + sender + ' craftou ' + eq.nome)

        await reply('✅ *EQUIPAMENTO FORJADO COM SUCESSO!*\\n\\n🗡️ ' + eq.nome + '\\n✨ ' + eq.bonus + '\\n\\nPara equipar use:\\n*.equip ' + eq.nome + '*')
    }
}`

commands['rpg/criarpocao.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes, receitasPocao } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'criarpocao',
    aliases: ['fazerpocao', 'brew'],
    category: 'rpg',
    description: 'Cria uma poção consumindo os loots necessários do inventário',
    execute: async ({ text, sender, reply }) => {
        if (!text) {
            return reply('⚗️ *COMO CRIAR POÇÕES:*\\n\\n• .criarpocao forca\\n• .criarpocao experiencia\\n• .criarpocao fortuna\\n• .criarpocao lendaria')
        }

        const tipo = text.toLowerCase().trim()
        if (!pocoes[tipo] || !receitasPocao[tipo]) {
            return reply('❌ Poção inválida. Escolha entre: forca, experiencia, fortuna ou lendaria.')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const receita = receitasPocao[tipo]

        for (const [item, quantidade] of Object.entries(receita)) {
            const possui = user.inventario.filter(i => i === item).length
            if (possui < quantidade) {
                return reply('❌ *MATERIAIS INSUFICIENTES!*\\n\\n🧪 *' + pocoes[tipo].nome + '*\\n\\n*Receita necessária:*\\n' + Object.entries(receita).map(([i, q]) => '• ' + q + 'x ' + i).join('\\n') + '\\n\\n❌ *Faltando:* ' + item + ' (' + possui + '/' + quantidade + ')')
            }
        }

        for (const [item, quantidade] of Object.entries(receita)) {
            for (let i = 0; i < quantidade; i++) {
                const index = user.inventario.indexOf(item)
                if (index !== -1) {
                    user.inventario.splice(index, 1)
                }
            }
        }

        user.inventario.push('🧪 ' + tipo)
        await dataService.saveXpData(xpData)
        logger.info('[CRIARPOCAO] User ' + sender + ' criou poção ' + tipo)

        await reply('⚗️ *POÇÃO CRIADA COM SUCESSO!*\\n\\n' + pocoes[tipo].nome + '\\n✅ Adicionada ao seu inventário: *🧪 1x ' + tipo + '*\\n\\nUse para consumir:\\n*.usarpocao ' + tipo + '*')
    }
}`

commands['rpg/curar.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')

module.exports = {
    name: 'curar',
    aliases: ['heal', 'recuperar'],
    category: 'rpg',
    description: 'Cura o HP do jogador até o valor máximo com uma pequena taxa de coins',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const hpMax = user.hpMax || 100
        const hpAtual = user.hp || hpMax

        if (hpAtual >= hpMax) {
            return reply('❤️ Seu HP já está no máximo: *' + hpAtual + ' / ' + hpMax + '*')
        }

        const custo = 20
        if ((user.coins || 0) < custo) {
            return reply('❌ Coins insuficientes para curar.\\n\\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\\n💵 Custo de cura: ' + custo + ' coins')
        }

        user.coins -= custo
        user.hp = hpMax
        await dataService.saveXpData(xpData)

        await reply('💖 *HP RESTAURADO!*\\n\\n❤️ Vida: *' + user.hp + ' / ' + hpMax + '*\\n💰 Coins restantes: ' + user.coins)
    }
}`

commands['rpg/duelo.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { aplicarBonusDano } = require('../../services/rpgService')
const logger = require('../../core/logger')

module.exports = {
    name: 'duelo',
    aliases: ['pvp', 'x1', 'duel'],
    category: 'rpg',
    description: 'Duelos PvP 1v1 (@usuario) ou 2v2 (@p1 @p2 @p3)',
    execute: async ({ info, sender, reply }) => {
        const mencao = info.message?.extendedTextMessage?.contextInfo?.mentionedJid

        if (!mencao || mencao.length === 0) {
            return reply('❌ Marque quem você deseja desafiar.\\n\\n• 1v1: .duelo @usuario\\n• 2v2: .duelo @aliado @oponente1 @oponente2')
        }

        const xpData = dataService.getXpData()
        const userSender = initializeUser(sender, xpData)

        if (mencao.length === 1) {
            const oponente = mencao[0]
            if (oponente === sender) {
                return reply('❌ Você não pode duelar consigo mesmo.')
            }

            const userOponente = initializeUser(oponente, xpData)

            const poderSenderBase = (userSender.level * 10) + ((userSender.rep || 0) * 5)
            const poderOponenteBase = (userOponente.level * 10) + ((userOponente.rep || 0) * 5)

            const poderSender = aplicarBonusDano(userSender, poderSenderBase)
            const poderOponente = aplicarBonusDano(userOponente, poderOponenteBase)

            const sorteSender = Math.floor(Math.random() * 50)
            const sorteOponente = Math.floor(Math.random() * 50)

            const totalSender = poderSender + sorteSender
            const totalOponente = poderOponente + sorteOponente

            const vencedor = totalSender >= totalOponente ? sender : oponente
            const perdedor = vencedor === sender ? oponente : sender

            const userVencedor = vencedor === sender ? userSender : userOponente
            const userPerdedor = perdedor === sender ? userSender : userOponente

            const coinsPerdidas = 25

            userVencedor.xp = (userVencedor.xp || 0) + 30
            userVencedor.coins = (userVencedor.coins || 0) + 50
            userVencedor.wins = (userVencedor.wins || 0) + 1

            userPerdedor.coins = Math.max(0, (userPerdedor.coins || 0) - coinsPerdidas)
            userPerdedor.losses = (userPerdedor.losses || 0) + 1

            await dataService.saveXpData(xpData)
            logger.info('[DUELO 1V1] ' + sender + ' vs ' + oponente + ' -> Vencedor: ' + vencedor)

            return reply('⚔️ *DUELO 1V1 — RESULTADO*\\n\\n🥊 @' + sender.split('@')[0] + ' *VS* 🥊 @' + oponente.split('@')[0] + '\\n\\n💥 *Poderes apurados:*\\n• @' + sender.split('@')[0] + ': ' + totalSender + '\\n• @' + oponente.split('@')[0] + ': ' + totalOponente + '\\n\\n🏆 *Vencedor:* @' + vencedor.split('@')[0] + '\\n💀 *Perdedor:* @' + perdedor.split('@')[0] + '\\n\\n🎁 *Recompensas:*\\n🏆 Vencedor: ⭐ +30 XP | 💰 +50 coins\\n💀 Perdedor: 💰 -25 coins', [sender, oponente, vencedor, perdedor])
        }

        if (mencao.length === 3) {
            const jogador1 = sender
            const jogador2 = mencao[0]
            const jogador3 = mencao[1]
            const jogador4 = mencao[2]

            const jogadores = [jogador1, jogador2, jogador3, jogador4]
            if (new Set(jogadores).size !== 4) {
                return reply('❌ Para o duelo 2v2, os 4 jogadores precisam ser diferentes.')
            }

            const p1 = initializeUser(jogador1, xpData)
            const p2 = initializeUser(jogador2, xpData)
            const p3 = initializeUser(jogador3, xpData)
            const p4 = initializeUser(jogador4, xpData)

            const poderT1 = (p1.level * 10) + ((p1.rep || 0) * 5) + (p2.level * 10) + ((p2.rep || 0) * 5)
            const poderT2 = (p3.level * 10) + ((p3.rep || 0) * 5) + (p4.level * 10) + ((p4.rep || 0) * 5)

            const sorteT1 = Math.floor(Math.random() * 50) + Math.floor(Math.random() * 50)
            const sorteT2 = Math.floor(Math.random() * 50) + Math.floor(Math.random() * 50)

            const totalT1 = poderT1 + sorteT1
            const totalT2 = poderT2 + sorteT2

            const t1Venceu = totalT1 >= totalT2
            const vencedores = t1Venceu ? [jogador1, jogador2] : [jogador3, jogador4]
            const perdedores = t1Venceu ? [jogador3, jogador4] : [jogador1, jogador2]

            for (const j of vencedores) {
                const u = initializeUser(j, xpData)
                u.xp = (u.xp || 0) + 30
                u.coins = (u.coins || 0) + 50
                u.wins = (u.wins || 0) + 1
            }

            for (const j of perdedores) {
                const u = initializeUser(j, xpData)
                u.coins = Math.max(0, (u.coins || 0) - 25)
                u.losses = (u.losses || 0) + 1
            }

            await dataService.saveXpData(xpData)
            return reply('⚔️ *DUELO 2V2 — RESULTADO*\\n\\n🔵 *TIME 1:* @' + jogador1.split('@')[0] + ' & @' + jogador2.split('@')[0] + '\\n🔴 *TIME 2:* @' + jogador3.split('@')[0] + ' & @' + jogador4.split('@')[0] + '\\n\\n💥 *Poder dos Times:*\\n🔵 Time 1: ' + totalT1 + '\\n🔴 Time 2: ' + totalT2 + '\\n\\n🏆 *Vencedores:* ' + vencedores.map(j => '@' + j.split('@')[0]).join(' e ') + '\\n💀 *Perdedores:* ' + perdedores.map(j => '@' + j.split('@')[0]).join(' e ') + '\\n\\n🎁 Vencedores: ⭐ +30 XP | 💰 +50 coins\\n💀 Perdedores: 💰 -25 coins', jogadores)
        }

        return reply('❌ Quantidade inválida de menções. Use: .duelo @usuario (1v1) ou .duelo @p1 @p2 @p3 (2v2)')
    }
}`

commands['rpg/equip.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const itensAtalho = {
    '1': 'VIP DEV',
    '2': 'React Master',
    '3': 'Node Wizard',
    '4': 'Full Stack'
}

module.exports = {
    name: 'equip',
    aliases: ['equipar', 'use'],
    category: 'rpg',
    description: 'Equipa um item ou equipamento forjado do seu inventário',
    execute: async ({ text, sender, reply }) => {
        if (!text) {
            return reply('❌ Digite o nome ou número do item que deseja equipar. Exemplo: .equip VIP DEV ou .equip ⚔️ Espada de Bug')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const inventario = user.inventario || []

        if (inventario.length === 0) {
            return reply('📦 Seu inventário está vazio.')
        }

        const termo = text.trim()
        const itemEscolhido = itensAtalho[termo] || inventario.find(i => i.toLowerCase().includes(termo.toLowerCase())) || termo

        if (!inventario.includes(itemEscolhido)) {
            return reply('❌ Você não possui o item "' + termo + '" no seu inventário. Use *.inv* para ver seus itens.')
        }

        user.equipado = itemEscolhido

        if (itemEscolhido === '⚔️ Espada de Bug') {
            user.arma = 'espada_bug'
        }

        await dataService.saveXpData(xpData)
        logger.info('[EQUIP] User ' + sender + ' equipou ' + itemEscolhido)

        await reply('✅ *Item equipado com sucesso!*\\n\\n🎖️ *Equipado:* ' + itemEscolhido)
    }
}`

commands['rpg/guilda.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'guilda',
    aliases: ['cla', 'clan', 'guild'],
    category: 'rpg',
    description: 'Sistema de guildas: criar, entrar, sair e gerenciar',
    execute: async ({ args, sender, reply }) => {
        const guilds = dataService.getGuildData()
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nomeGuilda = args.slice(1).join(' ').trim()

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao) {
            return reply('🏰 *SISTEMA DE GUILDAS*\\n\\n• *.guilda criar [nome]* — Criar guilda (Custo: 500 coins)\\n• *.guilda entrar [nome]* — Entrar em uma guilda existente\\n• *.guilda sair* — Sair da sua guilda atual\\n• *.guilda info* — Ver informações da sua guilda')
        }

        if (acao === 'criar') {
            if (!nomeGuilda) return reply('❌ Digite o nome da guilda.')
            if (user.guilda) return reply('❌ Você já pertence à guilda *' + user.guilda + '*.')
            if (guilds[nomeGuilda]) return reply('❌ Já existe uma guilda com este nome.')
            if ((user.coins || 0) < 500) return reply('❌ Você precisa de 500 coins para criar uma guilda.')

            user.coins -= 500
            user.guilda = nomeGuilda

            guilds[nomeGuilda] = {
                dono: sender,
                membros: [sender],
                level: 1,
                xp: 0,
                coins: 0
            }

            await dataService.saveXpData(xpData)
            await dataService.saveGuildData(guilds)
            logger.info('[GUILDA] User ' + sender + ' criou guilda ' + nomeGuilda)

            return reply('🏰 *GUILDA CRIADA COM SUCESSO!*\\n\\n📛 *Nome:* ' + nomeGuilda + '\\n👑 *Líder:* @' + sender.split('@')[0] + '\\n💰 *Custo:* 500 coins', [sender])
        }

        if (acao === 'entrar') {
            if (!nomeGuilda) return reply('❌ Digite o nome da guilda.')
            if (user.guilda) return reply('❌ Você já pertence à guilda *' + user.guilda + '*.')
            if (!guilds[nomeGuilda]) return reply('❌ Guilda não encontrada.')

            guilds[nomeGuilda].membros.push(sender)
            user.guilda = nomeGuilda

            await dataService.saveXpData(xpData)
            await dataService.saveGuildData(guilds)
            logger.info('[GUILDA] User ' + sender + ' entrou na guilda ' + nomeGuilda)

            return reply('✅ *Você entrou na guilda:* ' + nomeGuilda)
        }

        if (acao === 'sair') {
            const minhaGuilda = user.guilda
            if (!minhaGuilda) return reply('❌ Você não pertence a nenhuma guilda.')
            if (guilds[minhaGuilda]?.dono === sender) return reply('❌ O líder da guilda não pode sair diretamente.')

            if (guilds[minhaGuilda]) {
                guilds[minhaGuilda].membros = guilds[minhaGuilda].membros.filter(m => m !== sender)
            }
            delete user.guilda

            await dataService.saveXpData(xpData)
            await dataService.saveGuildData(guilds)
            logger.info('[GUILDA] User ' + sender + ' saiu da guilda ' + minhaGuilda)

            return reply('✅ Você saiu da guilda *' + minhaGuilda + '*.')
        }

        if (acao === 'info') {
            const minhaGuilda = user.guilda
            if (!minhaGuilda || !guilds[minhaGuilda]) return reply('❌ Você não pertence a nenhuma guilda.')
            const g = guilds[minhaGuilda]

            return reply('🏰 *INFORMAÇÕES DA GUILDA*\\n\\n📛 *Nome:* ' + minhaGuilda + '\\n👑 *Líder:* @' + g.dono.split('@')[0] + '\\n👥 *Membros:* ' + g.membros.length + '\\n📈 *Nível da Guilda:* ' + (g.level || 1) + '\\n⭐ *XP da Guilda:* ' + (g.xp || 0) + '\\n💰 *Cofre:* ' + (g.coins || 0) + ' coins', [g.dono])
        }

        return reply('❌ Opção inválida. Use: .guilda criar, .guilda entrar, .guilda sair ou .guilda info')
    }
}`

commands['rpg/hunt.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { sortearLootMob } = require('../../services/rpgService')
const { mundos } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'hunt',
    aliases: ['cacar', 'caçar'],
    category: 'rpg',
    description: 'Caça monstros no mundo atual para ganhar XP, coins e loots',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const mundoAtual = mundos[user.mundo || 'floresta']

        if (user.level < mundoAtual.minLevel) {
            return reply('❌ Nível insuficiente para caçar neste mundo.\\n\\n🌍 Mundo: ' + mundoAtual.nome + '\\n📊 Seu nível: ' + user.level + '\\n🔓 Nível necessário: ' + mundoAtual.minLevel)
        }

        const monstro = mundoAtual.monstros[Math.floor(Math.random() * mundoAtual.monstros.length)]

        const poderJogador = (user.level * 20) + Math.floor(Math.random() * 100)
        const poderMonstro = Math.floor(monstro.hp / 10) + monstro.dano + Math.floor(Math.random() * 80)

        if (poderJogador >= poderMonstro) {
            user.xp = (user.xp || 0) + monstro.xp
            user.coins = (user.coins || 0) + monstro.coins

            if (!user.inventario) user.inventario = []

            let lootMob = sortearLootMob(monstro.loot)
            if (lootMob) {
                if (user.inventario.length >= (user.mochila || 20)) {
                    lootMob = null
                } else {
                    user.inventario.push(lootMob)
                }
            }

            await dataService.saveXpData(xpData)
            logger.info('[HUNT] User ' + sender + ' venceu ' + monstro.nome)

            return reply('🗺️ *CAÇADA — VITÓRIA!*\\n\\n🌍 *Mundo:* ' + mundoAtual.nome + '\\n👤 @' + sender.split('@')[0] + ' *VS* ' + monstro.nome + '\\n\\n⭐ *+' + monstro.xp + ' XP*\\n💰 *+' + monstro.coins + ' Coins*\\n🎁 *Loot:* ' + (lootMob || 'Nenhum'), [sender])
        }

        const perdaCoins = 30
        user.coins = Math.max(0, (user.coins || 0) - perdaCoins)

        await dataService.saveXpData(xpData)
        logger.info('[HUNT] User ' + sender + ' foi derrotado por ' + monstro.nome)

        return reply('🗺️ *CAÇADA — DERROTA!*\\n\\n🌍 *Mundo:* ' + mundoAtual.nome + '\\n👤 @' + sender.split('@')[0] + ' *VS* ' + monstro.nome + '\\n\\n💀 *Você perdeu a batalha!*\\n💰 *-' + perdaCoins + ' coins*', [sender])
    }
}`

commands['rpg/inv.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')

module.exports = {
    name: 'inv',
    aliases: ['inventario', 'itens'],
    category: 'rpg',
    description: 'Exibe todos os itens, loots de bosses e loots de mobs no seu inventário',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const inventario = user.inventario || []
        const limiteMochila = user.mochila || 20

        if (inventario.length === 0) {
            return reply('📦 *Seu inventário está vazio.*\\n\\n🎒 *Capacidade da Mochila:* 0 / ' + limiteMochila + ' espaços\\n\\nUse *.hunt* ou *.boss* para obter itens.')
        }

        const lootBoss = inventario.filter(item =>
            item.includes('Chip') ||
            item.includes('Cristal') ||
            item.includes('Núcleo') ||
            item.includes('Chama') ||
            item.includes('Exploit') ||
            item.includes('Escama') ||
            item.includes('Processador') ||
            item.includes('Memória') ||
            item.includes('Coração') ||
            item.includes('Código Infectado') ||
            item.includes('Chave Root') ||
            item.includes('Fragmento Infernal')
        )

        const lootMobs = inventario.filter(item =>
            item.includes('Fragmento de Bug') ||
            item.includes('Asa') ||
            item.includes('Casca Binária') ||
            item.includes('Gosma de Código') ||
            item.includes('Log Perdido') ||
            item.includes('Arquivo Quebrado') ||
            item.includes('Sinal Perdido') ||
            item.includes('Fragmento de Firewall') ||
            item.includes('Dados Roubados') ||
            item.includes('Chave Digital') ||
            item.includes('Lente Sombria') ||
            item.includes('Gene Corrompido') ||
            item.includes('Escama Binária') ||
            item.includes('Olho Ancestral') ||
            item.includes('Pedra de Script') ||
            item.includes('Lâmina Algorítmica')
        )

        const itensNormais = inventario.filter(item =>
            !lootBoss.includes(item) && !lootMobs.includes(item)
        )

        const texto = '📦 *INVENTÁRIO DO JOGADOR*\\n\\n🎒 *Mochila:* ' + inventario.length + ' / ' + limiteMochila + ' espaços\\n\\n🛒 *ITENS EQUIPÁVEIS & COMPRADOS:*\\n' + (itensNormais.length ? itensNormais.map(i => '• ' + i).join('\\n') : 'Nenhum') + '\\n\\n━━━━━━━━━━━━━━━━━━\\n🐉 *LOOTS DE BOSS:*\\n' + (lootBoss.length ? lootBoss.map(i => '• ' + i).join('\\n') : 'Nenhum') + '\\n\\n━━━━━━━━━━━━━━━━━━\\n👾 *LOOTS DE MOBS:*\\n' + (lootMobs.length ? lootMobs.map(i => '• ' + i).join('\\n') : 'Nenhum')
        await reply(texto)
    }
}`

commands['rpg/lendaria.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classesLendarias } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'lendaria',
    aliases: ['classelendaria', 'lendarias'],
    category: 'rpg',
    description: 'Classes lendárias supremas com habilidades passivas de combate',
    execute: async ({ args, sender, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nome = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao || acao === 'lista') {
            let texto = '🔮 *CLASSES LENDÁRIAS SUPREMAS*\\n\\n'
            Object.entries(classesLendarias).forEach(([id, l]) => {
                texto += l.nome + ' (id: ' + id + ')\\n📌 Requisito: ' + l.requisito + '\\n✨ Habilidade: ' + l.habilidade + '\\n\\n'
            })
            texto += 'Para ver detalhes: *.lendaria info [nome]*\\nPara desbloquear: *.lendaria desbloquear [nome]*'
            return reply(texto)
        }

        if (acao === 'info') {
            if (!nome) return reply('❌ Use: .lendaria info [nome]\\nExemplo: .lendaria info arquiteto')
            const l = classesLendarias[nome]
            if (!l) return reply('❌ Classe lendária não encontrada. Use .lendaria lista.')

            return reply('🔮 *INFORMAÇÕES DA CLASSE LENDÁRIA*\\n\\n' + l.nome + '\\n\\n📌 *Requisito:* ' + l.requisito + '\\n✨ *Habilidade:* ' + l.habilidade + '\\n\\nPara desbloquear use:\\n*.lendaria desbloquear ' + nome + '*')
        }

        if (acao === 'desbloquear') {
            if (!nome) return reply('❌ Use: .lendaria desbloquear [nome]\\nExemplo: .lendaria desbloquear arquiteto')
            const lendariaEscolhida = classesLendarias[nome]
            if (!lendariaEscolhida) return reply('❌ Classe lendária não encontrada. Use .lendaria lista.')

            if (nome === 'arquiteto' && user.level < 50) return reply('❌ Requisito não atingido: Você precisa ser nível 50.')
            if (nome === 'cloudlord' && (user.bossesMortos || 0) < 50) return reply('❌ Requisito não atingido: Você precisa derrotar 50 Bosses.')
            if (nome === 'deusfullstack' && user.level < 100) return reply('❌ Requisito não atingido: Você precisa ser nível 100.')
            if (nome === 'reibugs' && (user.bugPower || 0) < 1000) return reply('❌ Requisito não atingido: Você precisa de 1000 Bug Power.')
            if (nome === 'singularidade' && (user.wins || 0) < 100) return reply('❌ Requisito não atingido: Você precisa de 100 vitórias em duelos.')

            if (lendariaEscolhida.loots && lendariaEscolhida.loots.length > 0) {
                const inventario = user.inventario || []
                const faltando = lendariaEscolhida.loots.filter(item => !inventario.includes(item))

                if (faltando.length > 0) {
                    return reply('❌ *Faltam loots de Boss necessários!*\\n\\n🔮 Classe: ' + lendariaEscolhida.nome + '\\n\\n📦 *Loots pendentes:*\\n' + faltando.map(i => '• ' + i).join('\\n'))
                }

                lendariaEscolhida.loots.forEach(item => {
                    const idx = user.inventario.indexOf(item)
                    if (idx !== -1) user.inventario.splice(idx, 1)
                })
            }

            user.classeLendaria = nome
            await dataService.saveXpData(xpData)
            logger.info('[LENDARIA] User ' + sender + ' desbloqueou classe lendária ' + nome)

            return reply('🌟 *CLASSE LENDÁRIA DESBLOQUEADA!*\\n\\n🔮 *' + lendariaEscolhida.nome + '*\\n✨ *Habilidade Ativa:* ' + lendariaEscolhida.habilidade)
        }

        return reply('❌ Opção inválida. Use: .lendaria lista, .lendaria info [nome] ou .lendaria desbloquear [nome]')
    }
}`

commands['rpg/lootshop.js'] = `const { equipamentos } = require('../../utils/constants')

module.exports = {
    name: 'lootshop',
    aliases: ['equipshop', 'forjaloja'],
    category: 'rpg',
    description: 'Lista todos os equipamentos que podem ser forjados (.craft)',
    execute: async ({ reply }) => {
        let textoEquip = '🛠️ *LOJA DE EQUIPAMENTOS & FORJA*\\n\\nPara criar um equipamento, use:\\n*.craft fazer [nome]*\\n\\n'
        Object.entries(equipamentos).forEach(([id, eq]) => {
            textoEquip += '🗡️ *' + eq.nome + '*\\n🆔 *ID:* ' + id + '\\n🎒 *Tipo:* ' + eq.tipo + '\\n✨ *Bônus:* ' + eq.bonus + '\\n📦 *Receita:*\\n' + Object.entries(eq.receita).map(([item, qtd]) => '  • ' + qtd + 'x ' + item).join('\\n') + '\\n\\n'
        })
        await reply(textoEquip)
    }
}`

commands['rpg/missao.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { gerarMissao } = require('../../services/missionService')
const { hojeId } = require('../../utils/helpers')
const logger = require('../../core/logger')

module.exports = {
    name: 'missao',
    aliases: ['missoes', 'quest'],
    category: 'rpg',
    description: 'Consulta ou conclui sua missão diária (.missao / .missao concluir)',
    execute: async ({ text, sender, reply }) => {
        const missoesData = dataService.getMissoesData()
        const hoje = hojeId()

        if (!missoesData[sender] || missoesData[sender].dia !== hoje) {
            missoesData[sender] = {
                dia: hoje,
                missao: gerarMissao(),
                progresso: 0,
                concluida: false
            }
            await dataService.saveMissoesData(missoesData)
        }

        const m = missoesData[sender]
        const missao = m.missao

        if (text && text.toLowerCase().trim() === 'concluir') {
            if (m.concluida) return reply('✅ Você já concluiu sua missão de hoje.')
            if (m.progresso < missao.meta) {
                return reply('❌ *Missão ainda não concluída!*\\n\\n📌 *' + missao.titulo + '*\\n📝 ' + missao.descricao + '\\n📊 Progresso: ' + m.progresso + '/' + missao.meta)
            }

            m.concluida = true
            await dataService.saveMissoesData(missoesData)

            const xpData = dataService.getXpData()
            const user = initializeUser(sender, xpData)
            user.xp = (user.xp || 0) + missao.xp
            user.coins = (user.coins || 0) + missao.coins

            await dataService.saveXpData(xpData)
            logger.info('[MISSAO CONCLUIDA] User ' + sender + ' concluiu ' + missao.titulo)

            return reply('🎉 *MISSÃO CONCLUÍDA COM SUCESSO!*\\n\\n📌 *' + missao.titulo + '*\\n⭐ *+' + missao.xp + ' XP*\\n💰 *+' + missao.coins + ' Coins*')
        }

        const status = m.concluida ? '✅ Concluída' : ('⏳ Em andamento (' + m.progresso + '/' + missao.meta + ')')

        return reply('📜 *MISSÃO DIÁRIA DO DEV*\\n\\n📌 *' + missao.titulo + '*\\n📝 ' + missao.descricao + '\\n\\n📊 *Progresso:* ' + status + '\\n🎁 *Recompensas:*\\n⭐ ' + missao.xp + ' XP | 💰 ' + missao.coins + ' Coins\\n\\nPara resgatar após atingir a meta, use:\\n*.missao concluir*')
    }
}`

commands['rpg/mob.js'] = `const { mundos } = require('../../utils/constants')

module.exports = {
    name: 'mob',
    aliases: ['mobs', 'monstros'],
    category: 'rpg',
    description: 'Lista os monstros e loots de cada mundo (.mob lista / .mob loot)',
    execute: async ({ args, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''

        if (acao === 'lista') {
            let texto = '👾 *MOBS DISPONÍVEIS POR MUNDO*\\n\\n'
            Object.values(mundos).forEach(mundo => {
                texto += '🌍 *' + mundo.nome + '*\\n'
                mundo.monstros.forEach(m => {
                    texto += '• ' + m.nome + ' (❤️ ' + m.hp + ' HP | ⚔️ ' + m.dano + ' Dano)\\n'
                })
                texto += '\\n'
            })
            return reply(texto)
        }

        if (acao === 'loot' || acao === 'loots') {
            let texto = '🎁 *TABELA DE LOOTS DOS MOBS*\\n\\n'
            Object.values(mundos).forEach(mundo => {
                texto += '🌍 *' + mundo.nome + '*\\n'
                mundo.monstros.forEach(m => {
                    texto += '👾 *' + m.nome + ':*\\n'
                    m.loot.forEach(l => {
                        texto += '  • ' + l.nome + ' (' + l.chance + '%)\\n'
                    })
                })
                texto += '\\n'
            })
            return reply(texto)
        }

        return reply('👾 *SISTEMA DE MOBS*\\n\\n• *.mob lista* — Ver todos os monstros por mundo\\n• *.mob loot* — Ver a lista de drops de cada monstro\\n• *.hunt* — Caçar monstros no mundo atual')
    }
}`

commands['rpg/mundo.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { mundos } = require('../../utils/constants')

module.exports = {
    name: 'mundo',
    aliases: ['mundos', 'mapa'],
    category: 'rpg',
    description: 'Lista os mundos disponíveis e seus requisitos de nível',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        let textoMundos = '🌍 *MUNDOS DISPONÍVEIS*\\n\\n'
        Object.entries(mundos).forEach(([id, m]) => {
            const status = user.level >= m.minLevel ? '🟢 Desbloqueado' : ('🔒 Nível ' + m.minLevel)
            const atual = (user.mundo || 'floresta') === id ? '👈 (Atual)' : ''
            textoMundos += '📌 *' + m.nome + '* (' + id + ') ' + atual + '\\n📊 Status: ' + status + '\\n\\n'
        })

        textoMundos += 'Para viajar use: .viajar [nome_do_mundo]'
        await reply(textoMundos)
    }
}`

commands['rpg/pet.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { petsDisponiveis } = require('../../utils/constants')
const logger = require('../../core/logger')

const precosPets = {
    cachorro: 500,
    gato: 500,
    raposa: 1200,
    lobo: 1500,
    aguia: 1500,
    robo: 2500
}

module.exports = {
    name: 'pet',
    aliases: ['pets', 'mascote'],
    category: 'rpg',
    description: 'Sistema de pets companheiros com bônus de dano, XP e coins',
    execute: async ({ args, sender, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nomePet = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao || acao === 'loja') {
            let textoLoja = '🐾 *LOJA DE PETS DEV*\\n\\n'
            Object.entries(petsDisponiveis).forEach(([id, p]) => {
                textoLoja += p.nome + ' (id: ' + id + ')\\n💰 Preço: ' + (precosPets[id] || 1000) + ' coins\\n✨ Bônus: ' + p.bonus + '\\n\\n'
            })
            textoLoja += 'Para comprar use: *.pet comprar [id]*\\nPara ver seus pets: *.pet meus*\\nPara equipar: *.pet equipar [id]*'
            return reply(textoLoja)
        }

        if (acao === 'meus') {
            const meus = user.pets || []
            if (meus.length === 0) return reply('🐾 Você ainda não possui nenhum pet. Adquira um na loja com *.pet loja*')
            return reply('🐾 *SEUS PETS:*\\n\\n' + meus.map(p => '• ' + (petsDisponiveis[p]?.nome || p)).join('\\n') + '\\n\\n🎒 *Equipado:* ' + (user.pet ? petsDisponiveis[user.pet]?.nome : 'Nenhum'))
        }

        if (acao === 'comprar') {
            if (!nomePet) return reply('❌ Use: .pet comprar [nome]\\nExemplo: .pet comprar cachorro')
            if (!petsDisponiveis[nomePet]) return reply('❌ Pet inválido. Use .pet loja.')

            if (!user.pets) user.pets = []
            if (user.pets.includes(nomePet)) return reply('❌ Você já possui este pet.')

            const preco = precosPets[nomePet] || 1000
            if ((user.coins || 0) < preco) return reply('❌ Coins insuficientes.\\n\\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\\n🏷️ Preço: ' + preco + ' coins')

            user.coins -= preco
            user.pets.push(nomePet)
            await dataService.saveXpData(xpData)
            logger.info('[PET] User ' + sender + ' comprou pet ' + nomePet)

            return reply('🎉 *PET ADQUIRIDO COM SUCESSO!*\\n\\n' + petsDisponiveis[nomePet].nome + '\\n✨ ' + petsDisponiveis[nomePet].bonus + '\\n\\nPara equipar use:\\n*.pet equipar ' + nomePet + '*')
        }

        if (acao === 'equipar') {
            if (!nomePet) return reply('❌ Use: .pet equipar [nome]\\nExemplo: .pet equipar cachorro')
            if (!user.pets || !user.pets.includes(nomePet)) return reply('❌ Você não possui esse pet. Compre na loja com *.pet loja*')

            user.pet = nomePet
            await dataService.saveXpData(xpData)
            logger.info('[PET] User ' + sender + ' equipou pet ' + nomePet)

            return reply('✅ *PET EQUIPADO COM SUCESSO!*\\n\\n' + petsDisponiveis[nomePet].nome + '\\n✨ ' + petsDisponiveis[nomePet].bonus)
        }

        return reply('❌ Opção inválida. Use: .pet loja, .pet meus, .pet comprar [nome] ou .pet equipar [nome]')
    }
}`

commands['rpg/pocao.js'] = `const { pocoes } = require('../../utils/constants')

module.exports = {
    name: 'pocao',
    aliases: ['pocoes', 'pot'],
    category: 'rpg',
    description: 'Exibe o guia completo de criação e uso de poções alquímicas',
    execute: async ({ reply }) => {
        const texto = \`🧪 *SISTEMA DE POÇÕES ALQUÍMICAS*

🧪 *forca*
⚔️ +25% de dano

🧪 *experiencia*
⭐ +50% de XP

🧪 *fortuna*
💰 +50% de coins

🧪 *lendaria*
🔥 +50% de dano | ⭐ +50% de XP | 💰 +50% de coins

⏳ *Duração:* 30 minutos

━━━━━━━━━━━━━━━━━━
⚗️ *COMO CRIAR:*
• .criarpocao forca
• .criarpocao experiencia
• .criarpocao fortuna
• .criarpocao lendaria

━━━━━━━━━━━━━━━━━━
🧪 *COMO USAR:*
• .usarpocao forca
• .usarpocao experiencia
• .usarpocao fortuna
• .usarpocao lendaria\`
        await reply(texto)
    }
}`

commands['rpg/pocaoativa.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes } = require('../../utils/constants')

module.exports = {
    name: 'pocaoativa',
    aliases: ['buffs', 'minhapocao'],
    category: 'rpg',
    description: 'Consulta o tempo restante e efeitos da sua poção ativa',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.pocaoAtiva || Date.now() >= user.pocaoAtiva.expira) {
            user.pocaoAtiva = null
            await dataService.saveXpData(xpData)
            return reply('🧪 Você não tem nenhuma poção ativa no momento. Crie ou consuma uma com .pocao')
        }

        const pocao = pocoes[user.pocaoAtiva.tipo]
        const tempoRestante = user.pocaoAtiva.expira - Date.now()
        const minutos = Math.floor(tempoRestante / 60000)
        const segundos = Math.floor((tempoRestante % 60000) / 1000)

        await reply('🧪 *POÇÃO ATIVA:*\\n\\n' + (pocao?.nome || user.pocaoAtiva.tipo) + '\\n✨ ' + (pocao?.descricao || '') + '\\n⏱️ *Tempo restante:* ' + minutos + 'm ' + segundos + 's')
    }
}`

commands['rpg/usarpocao.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'usarpocao',
    aliases: ['tomarpocao', 'beberpocao', 'usepot'],
    category: 'rpg',
    description: 'Consome uma poção do inventário ativando seus buffs por 30 minutos',
    execute: async ({ text, sender, reply }) => {
        if (!text) return reply('🧪 *USE:* .usarpocao [tipo]\\n\\n• .usarpocao forca\\n• .usarpocao experiencia\\n• .usarpocao fortuna\\n• .usarpocao lendaria')

        const tipo = text.toLowerCase().trim()
        if (!pocoes[tipo]) return reply('❌ Poção inexistente. Use: forca, experiencia, fortuna ou lendaria.')

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const nomePocao = '🧪 ' + tipo
        const index = user.inventario.indexOf(nomePocao)

        if (index === -1) {
            return reply('❌ Você não possui *' + pocoes[tipo].nome + '* no inventário. Crie uma com *.criarpocao ' + tipo + '*')
        }

        user.inventario.splice(index, 1)
        user.pocaoAtiva = {
            tipo: tipo,
            expira: Date.now() + pocoes[tipo].duracao
        }

        await dataService.saveXpData(xpData)
        logger.info('[USARPOCAO] User ' + sender + ' consumiu poção ' + tipo)

        await reply('🧪 *POÇÃO ATIVADA COM SUCESSO!*\\n\\n' + pocoes[tipo].nome + '\\n✨ ' + pocoes[tipo].descricao + '\\n⏳ *Duração:* 30 minutos\\n\\n🔥 O efeito será aplicado em Bosses, Caçadas, Duelos e Arenas!')
    }
}`

commands['rpg/viajar.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { mundos } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'viajar',
    aliases: ['irpara', 'travel'],
    category: 'rpg',
    description: 'Viaja para outro mundo desbloqueado',
    execute: async ({ text, sender, reply }) => {
        if (!text) return reply('❌ Use: .viajar [nome_do_mundo]\\nExemplo: .viajar servidor')

        const destino = text.toLowerCase().trim()
        if (!mundos[destino]) return reply('❌ Mundo não encontrado. Use .mundo para ver os mundos disponíveis.')

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (user.level < mundos[destino].minLevel) {
            return reply('🚫 *ACESSO BLOQUEADO!*\\n\\n🌍 *Mundo:* ' + mundos[destino].nome + '\\n📈 *Seu nível:* ' + user.level + '\\n🔓 *Nível necessário:* ' + mundos[destino].minLevel)
        }

        user.mundo = destino
        await dataService.saveXpData(xpData)
        logger.info('[VIAJAR] User ' + sender + ' viajou para ' + destino)

        await reply('✅ *Você viajou para:*\\n\\n' + mundos[destino].nome)
    }
}`

for (const [relPath, content] of Object.entries(commands)) {
    const fullPath = path.join(baseDir, relPath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content, 'utf8')
}

console.log('✅ Arquivos RPG populados!')

