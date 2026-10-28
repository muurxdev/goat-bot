const fs = require('fs')
const path = require('path')

const baseDir = path.join(__dirname, '..', 'src', 'commands')

const commands = {}

// PROFILE
commands['profile/daily.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'daily',
    aliases: ['diario', 'recompensa'],
    category: 'profile',
    description: 'Resgata sua recompensa diária de XP e Coins (cooldown 24h)',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const agora = Date.now()
        const ultimoDaily = user.lastDaily || 0
        const COOLDOWN_24H = 86400000

        if (agora - ultimoDaily < COOLDOWN_24H) {
            const tempoRestante = COOLDOWN_24H - (agora - ultimoDaily)
            const horas = Math.floor(tempoRestante / 3600000)
            const minutos = Math.floor((tempoRestante % 3600000) / 60000)
            return reply('⏳ Você já resgatou seu prêmio diário hoje.\\n\\n🕒 Volte em *' + horas + 'h ' + minutos + 'm*.')
        }

        user.lastDaily = agora
        user.xp = (user.xp || 0) + 50
        user.coins = (user.coins || 0) + 100
        user.streak = (user.streak || 0) + 1

        await dataService.saveXpData(xpData)
        logger.info('[DAILY] User ' + sender + ' resgatou daily (+50 XP, +100 Coins, Streak: ' + user.streak + ')')

        await reply('🎁 *DAILY RESGATADO COM SUCESSO!*\\n\\n⭐ *+50 XP*\\n💰 *+100 Coins*\\n🔥 *Streak diário:* ' + user.streak + ' dias seguidos!')
    }
}`


commands['profile/rank.js'] = `const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')

module.exports = {
    name: 'rank',
    aliases: ['top', 'ranking', 'leaderboard'],
    category: 'profile',
    description: 'Exibe o top 10 usuários com maior nível e XP global',
    execute: async ({ reply }) => {
        const xpData = dataService.getXpData()
        const ranking = Object.entries(xpData)
            .sort((a, b) => {
                const totalA = (a[1].level * 1000) + (a[1].xp || 0)
                const totalB = (b[1].level * 1000) + (b[1].xp || 0)
                return totalB - totalA
            })
            .slice(0, 10)

        if (ranking.length === 0) {
            return reply('🏆 Nenhum usuário registrado no ranking ainda.')
        }

        let textoRank = '🏆 *TOP RANKING GLOBAL*\\n\\n'
        const mentions = []

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            const cargo = getCargo(user[1].level)
            mentions.push(user[0])

            textoRank += medalha + ' *#' + (i + 1) + '* @' + user[0].split('@')[0] + '\\n📈 *Nível:* ' + user[1].level + ' | ⭐ *XP:* ' + (user[1].xp || 0) + '\\n💬 *Mensagens:* ' + (user[1].messages || 0) + ' | 💰 *Coins:* ' + (user[1].coins || 0) + '\\n💼 *Cargo:* ' + cargo + '\\n\\n'
        })

        await reply(textoRank, mentions)
    }
}`

commands['profile/rankcoins.js'] = `const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')

module.exports = {
    name: 'rankcoins',
    aliases: ['topcoins', 'ricos'],
    category: 'profile',
    description: 'Exibe o top 10 usuários mais ricos do bot',
    execute: async ({ reply }) => {
        const xpData = dataService.getXpData()
        const ranking = Object.entries(xpData)
            .sort((a, b) => (b[1].coins || 0) - (a[1].coins || 0))
            .slice(0, 10)

        if (ranking.length === 0) {
            return reply('💰 Nenhum usuário registrado no ranking ainda.')
        }

        let textoRank = '💰 *TOP RANKING DE COINS*\\n\\n'
        const mentions = []

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            const cargo = getCargo(user[1].level)
            mentions.push(user[0])

            textoRank += medalha + ' *#' + (i + 1) + '* @' + user[0].split('@')[0] + '\\n💰 *Coins:* ' + (user[1].coins || 0) + '\\n📈 *Nível:* ' + user[1].level + ' | 💼 *Cargo:* ' + cargo + '\\n\\n'
        })

        await reply(textoRank, mentions)
    }
}`

commands['profile/ranksemana.js'] = `const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')

module.exports = {
    name: 'ranksemana',
    aliases: ['topsemana', 'semanal'],
    category: 'profile',
    description: 'Exibe o top 10 usuários com maior XP acumulado na semana',
    execute: async ({ reply }) => {
        const xpData = dataService.getXpData()
        const ranking = Object.entries(xpData)
            .sort((a, b) => (b[1].weeklyXp || 0) - (a[1].weeklyXp || 0))
            .slice(0, 10)

        if (ranking.length === 0) {
            return reply('📅 Nenhum usuário com XP semanal registrado ainda.')
        }

        let textoRank = '📅 *TOP RANKING SEMANAL*\\n\\n'
        const mentions = []

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            const cargo = getCargo(user[1].level)
            mentions.push(user[0])

            textoRank += medalha + ' *#' + (i + 1) + '* @' + user[0].split('@')[0] + '\\n⭐ *XP Semanal:* ' + (user[1].weeklyXp || 0) + '\\n📈 *Nível:* ' + user[1].level + ' | 💼 *Cargo:* ' + cargo + '\\n\\n'
        })

        await reply(textoRank, mentions)
    }
}`

commands['profile/rep.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'rep',
    aliases: ['reputacao', 'reputar'],
    category: 'profile',
    description: 'Dá +1 ponto de reputação para outro usuário',
    execute: async ({ info, sender, reply }) => {
        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid
        if (!mentioned || mentioned.length === 0) {
            return reply('❌ Marque alguém para dar reputação. Exemplo: .rep @usuario')
        }

        const alvo = mentioned[0]
        if (alvo === sender) {
            return reply('❌ Você não pode dar reputação para si mesmo.')
        }

        const xpData = dataService.getXpData()
        const perfilAlvo = initializeUser(alvo, xpData)

        perfilAlvo.rep = (perfilAlvo.rep || 0) + 1
        await dataService.saveXpData(xpData)
        logger.info('[REP] User ' + sender + ' deu +1 reputação para ' + alvo)

        await reply('❤️ @' + alvo.split('@')[0] + ' recebeu +1 ponto de reputação! (Total: ' + perfilAlvo.rep + ')', [alvo])
    }
}`

commands['profile/stats.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')

module.exports = {
    name: 'stats',
    aliases: ['estatisticas', 'pvpstats'],
    category: 'profile',
    description: 'Exibe estatísticas de combate, vitórias e derrotas',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const wins = user.wins || 0
        const losses = user.losses || 0
        const total = wins + losses
        const taxa = total > 0 ? ((wins / total) * 100).toFixed(1) : 0

        const texto = '⚔️ *ESTATÍSTICAS DE COMBATE*\\n\\n🏆 *Vitórias:* ' + wins + '\\n💀 *Derrotas:* ' + losses + '\\n📊 *Total de Duelos:* ' + total + '\\n📈 *Taxa de Vitória:* ' + taxa + '%'

        await reply(texto)
    }
}`

commands['profile/xp.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { barraXP, getCargo, getRank } = require('../../utils/helpers')

module.exports = {
    name: 'xp',
    aliases: ['perfil', 'level'],
    category: 'profile',
    description: 'Exibe seu nível, XP, rank e progresso no bot',
    execute: async ({ info, sender, reply }) => {
        const xpData = dataService.getXpData()
        const alvo = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const perfil = initializeUser(alvo, xpData)

        const cargo = perfil.equipado ? ('🎒 ' + perfil.equipado) : getCargo(perfil.level)
        const rank = getRank(perfil.level)
        const maxXp = Math.floor(100 * Math.pow(perfil.level, 1.5))

        const texto = '🏆 *PERFIL DO USUÁRIO*\\n\\n👤 @' + alvo.split('@')[0] + '\\n\\n⭐ *XP:* ' + perfil.xp + ' / ' + maxXp + '\\n📊 *Progresso:* ' + barraXP(perfil.xp, perfil.level) + '\\n\\n📈 *Nível:* ' + perfil.level + '\\n🏆 *Rank:* ' + rank + '\\n💼 *Cargo:* ' + cargo + '\\n🧬 *Classe:* ' + (perfil.classe || 'Nenhuma') + '\\n🔮 *Classe Lendária:* ' + (perfil.classeLendaria || 'Nenhuma') + '\\n🐛 *Poder Bug:* ' + (perfil.bugPower || 0) + '\\n━━━━━━━━━━━━━━━━━━\\n💰 *Coins:* ' + perfil.coins + '\\n💬 *Mensagens:* ' + (perfil.messages || 0) + '\\n❤️ *Rep:* ' + (perfil.rep || 0) + '\\n🔥 *Streak:* ' + (perfil.streak || 0) + '\\n🥇 *Conquistas:* ' + (perfil.conquistas?.length || 0) + '\\n🐉 *Bosses derrotados:* ' + (perfil.bossesMortos || 0) + '\\n🏆 *Vitórias:* ' + (perfil.wins || 0) + ' | 💀 *Derrotas:* ' + (perfil.losses || 0)

        await reply(texto, [alvo])
    }
}`

// ECONOMY
const lojaItens = {
    'vip dev': { nome: 'VIP DEV', preco: 500 },
    'react master': { nome: 'React Master', preco: 1000 },
    'node wizard': { nome: 'Node Wizard', preco: 1500 },
    'full stack': { nome: 'Full Stack', preco: 2000 },
    'mochila pequena': { nome: '🎒 Mochila Pequena', preco: 500, espaco: 10 },
    'mochila media': { nome: '🎒 Mochila Média', preco: 1200, espaco: 25 },
    'mochila grande': { nome: '🎒 Mochila Grande', preco: 2500, espaco: 50 },
    'mochila lendaria': { nome: '🎒 Mochila Lendária', preco: 5000, espaco: 100 }
}

commands['economy/buy.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const lojaItens = {
    'vip dev': { nome: 'VIP DEV', preco: 500 },
    'react master': { nome: 'React Master', preco: 1000 },
    'node wizard': { nome: 'Node Wizard', preco: 1500 },
    'full stack': { nome: 'Full Stack', preco: 2000 },
    'mochila pequena': { nome: '🎒 Mochila Pequena', preco: 500, espaco: 10 },
    'mochila media': { nome: '🎒 Mochila Média', preco: 1200, espaco: 25 },
    'mochila grande': { nome: '🎒 Mochila Grande', preco: 2500, espaco: 50 },
    'mochila lendaria': { nome: '🎒 Mochila Lendária', preco: 5000, espaco: 100 }
}

module.exports = {
    name: 'buy',
    aliases: ['comprar'],
    category: 'economy',
    description: 'Compra um item da loja (.shop)',
    execute: async ({ text, sender, reply }) => {
        if (!text) {
            return reply('❌ Use: .buy nome\\nExemplo: .buy mochila pequena')
        }

        const produto = lojaItens[text.toLowerCase().trim()]
        if (!produto) {
            return reply('❌ Item não encontrado na loja. Use .shop para ver os itens disponíveis.')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!Number.isFinite(user.coins) || user.coins < 0) {
            user.coins = 0
        }

        if (user.coins < produto.preco) {
            return reply('❌ Coins insuficientes.\\n\\n💰 Você tem: ' + user.coins + ' coins\\n🛒 Preço: ' + produto.preco + ' coins')
        }

        user.coins -= produto.preco

        if (produto.espaco) {
            user.mochila = (user.mochila || 20) + produto.espaco
            await dataService.saveXpData(xpData)
            logger.info('[SHOP] User ' + sender + ' comprou ' + produto.nome)

            return reply('✅ *Mochila Comprada!*\\n\\n' + produto.nome + '\\n📦 +' + produto.espaco + ' espaços\\n🎒 Espaço total: ' + user.mochila + '\\n💰 Coins restantes: ' + user.coins)
        }

        if (!user.inventario) user.inventario = []
        if (user.inventario.length >= (user.mochila || 20)) {
            return reply('❌ Sua mochila está cheia. Use .buy mochila pequena ou venda itens com .vender loot')
        }

        user.inventario.push(produto.nome)
        await dataService.saveXpData(xpData)
        logger.info('[SHOP] User ' + sender + ' comprou ' + produto.nome)

        return reply('✅ *Item Comprado!*\\n\\n' + produto.nome + '\\n💰 Preço: ' + produto.preco + ' coins\\n💰 Coins restantes: ' + user.coins)
    }
}`

commands['economy/mochila.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'mochila',
    aliases: ['bag', 'backpack'],
    category: 'economy',
    description: 'Exibe a capacidade da mochila ou faz upgrade de espaço (.mochila up)',
    execute: async ({ text, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const capacidade = user.mochila || 20
        const ocupado = user.inventario?.length || 0

        if (!text) {
            const precoUpgrade = capacidade * 20
            return reply('🎒 *SUA MOCHILA*\\n\\n📦 *Espaços ocupados:* ' + ocupado + ' / ' + capacidade + '\\n\\n💰 *Melhorar capacidade:*\\nUse: .mochila up\\n📌 Cada upgrade concede +10 espaços.\\n💵 Preço do próximo nível: ' + precoUpgrade + ' coins')
        }

        if (text.toLowerCase() === 'up') {
            const preco = capacidade * 20
            if ((user.coins || 0) < preco) {
                return reply('❌ Coins insuficientes para upgrade.\\n\\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\\n💵 Necessário: ' + preco + ' coins')
            }

            user.coins -= preco
            user.mochila = capacidade + 10
            await dataService.saveXpData(xpData)
            logger.info('[MOCHILA] User ' + sender + ' fez upgrade de mochila para ' + user.mochila)

            return reply('🎉 *MOCHILA MELHORADA COM SUCESSO!*\\n\\n📦 Nova capacidade: ' + user.mochila + ' espaços\\n💰 Coins restantes: ' + user.coins)
        }

        return reply('❌ Opção inválida. Use: .mochila ou .mochila up')
    }
}`

commands['economy/shop.js'] = `module.exports = {
    name: 'shop',
    aliases: ['loja'],
    category: 'economy',
    description: 'Exibe a loja de itens e mochilas para desenvolvedores',
    execute: async ({ reply }) => {
        const loja = \`╔══════════════════╗
║ 🛒 LOJA DEV 🛒 ║
╚══════════════════╝

1️⃣ 👑 *VIP DEV*
💰 500 coins

2️⃣ ⚛️ *React Master*
💰 1000 coins

3️⃣ 🟢 *Node Wizard*
💰 1500 coins

4️⃣ 🚀 *Full Stack*
💰 2000 coins

5️⃣ 🎒 *Mochila Pequena*
💰 500 coins | 📦 +10 espaços

6️⃣ 🎒 *Mochila Média*
💰 1200 coins | 📦 +25 espaços

7️⃣ 🎒 *Mochila Grande*
💰 2500 coins | 📦 +50 espaços

8️⃣ 🎒 *Mochila Lendária*
💰 5000 coins | 📦 +100 espaços

━━━━━━━━━━━━━━━━━━
🛍️ *Como comprar:*
.buy [nome do item]

*Exemplos:*
• .buy mochila pequena
• .buy vip dev\`
        await reply(loja)
    }
}`

commands['economy/vender.js'] = `const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const precosLoot = {
    '🟢 Fragmento de Bug': 20,
    '🟢 Asa Corrompida': 25,
    '🪲 Casca Binária': 35,
    '🌿 Gosma de Código': 45,
    '🔥 Log Perdido': 80,
    '💾 Arquivo Quebrado': 100,
    '📡 Sinal Perdido': 130,
    '🧯 Fragmento de Firewall': 150,
    '🕷️ Dados Roubados': 180,
    '🔓 Chave Digital': 220,
    '👁️ Lente Sombria': 260,
    '🧬 Gene Corrompido': 320,
    '🐉 Escama Binária': 400,
    '👁️ Olho Ancestral': 500,
    '🗿 Pedra de Script': 650,
    '⚔️ Lâmina Algorítmica': 800
}

module.exports = {
    name: 'vender',
    aliases: ['sell'],
    category: 'economy',
    description: 'Vende todos os loots de monstros coletados para obter coins',
    execute: async ({ text, sender, reply }) => {
        if (text !== 'loot') {
            return reply('❌ Use: .vender loot')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.inventario || user.inventario.length === 0) {
            return reply('📦 Seu inventário está vazio.')
        }

        let total = 0
        const vendidos = []

        user.inventario = user.inventario.filter(item => {
            if (precosLoot[item]) {
                total += precosLoot[item]
                vendidos.push(item)
                return false
            }
            return true
        })

        if (total <= 0) {
            return reply('❌ Você não possui loots de mobs vendíveis no seu inventário.')
        }

        user.coins = (user.coins || 0) + total
        await dataService.saveXpData(xpData)
        logger.info('[VENDER] User ' + sender + ' vendeu ' + vendidos.length + ' loots por ' + total + ' coins')

        await reply('💰 *LOOTS VENDIDOS COM SUCESSO!*\\n\\n📦 *Itens vendidos:*\\n' + vendidos.map(i => '• ' + i).join('\\n') + '\\n\\n💵 *Total recebido:* +' + total + ' coins\\n💰 *Saldo atual:* ' + user.coins + ' coins')
    }
}`

for (const [relPath, content] of Object.entries(commands)) {
    const fullPath = path.join(baseDir, relPath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content, 'utf8')
}

console.log('✅ Arquivos de perfil e economia populados!')

