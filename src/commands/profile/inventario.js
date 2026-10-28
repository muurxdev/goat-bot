const dataService = require('../../services/dataService')
const { initializeUser, adicionarXp } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

module.exports = {
    name: 'inventario',
    aliases: ['inventory'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Inventário expandido — veja, use e descarte itens',
    cooldownMs: 3000,
    execute: async ({ args, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        // O inventário do RPG guarda itens como STRING ("Poção de Vida"), enquanto
        // este comando assumia objetos {name, qty, type} — por isso o mesmo item
        // aparecia no `.inv` e sumia aqui. Normaliza os dois formatos na leitura.
        const bruto = user.inventario || user.inventory || []
        const inventario = (Array.isArray(bruto) ? bruto : []).map(it =>
            (typeof it === 'string')
                ? { name: it, nome: it, qty: 1, type: 'item', tipo: 'item', __str: true }
                : it
        )
        const acao = (args[0] || '').toLowerCase()

        if (acao === 'usar') {
            const itemNome = args.slice(1).join(' ').toLowerCase().trim()
            if (!itemNome) {
                return reply('❌ Uso: `.inventario usar <item>`\n\nExemplo: `.inventario usar poção de vida`')
            }
            const idx = inventario.findIndex(i =>
                (i.name || i.nome || '').toLowerCase().includes(itemNome)
            )
            if (idx === -1) {
                return reply('❌ Item não encontrado no inventário.')
            }
            const item = inventario[idx]
            const tipo = (item.type || item.tipo || '').toLowerCase()
            const nome = item.name || item.nome

            if (tipo === 'consumivel' || tipo === 'potion' || tipo === 'pocao' || tipo === 'consumable') {
                if (tipo.includes('vida') || nome.toLowerCase().includes('vida')) {
                    user.hp = Math.min((user.hpMax || 100), (user.hp || 0) + 50)
                    reply(`🧪 Você usou *${nome}* e recuperou 50 HP! ❤️ HP: ${user.hp}/${user.hpMax || 100}`)
                } else if (tipo.includes('xp') || nome.toLowerCase().includes('xp')) {
                    const { xpGanho, lvlRes } = adicionarXp(user, 100, { source: 'rpg' })
                    const subiu = lvlRes.subiu ? ` 🆙 Subiu de nível! Agora nível ${user.level}.` : ''
                    reply(`🧪 Você usou *${nome}* e ganhou ${xpGanho} XP! ⭐ XP: ${user.xp}${subiu}`)
                } else if (tipo.includes('coin') || nome.toLowerCase().includes('coin')) {
                    user.coins = (user.coins || 0) + 200
                    reply(`🧪 Você usou *${nome}* e ganhou 200 Coins! 💰 Coins: ${user.coins}`)
                } else {
                    reply(`🧪 Você usou *${nome}*!`)
                }
                item.qty = (item.qty || 1) - 1
                if (item.qty <= 0) {
                    inventario.splice(idx, 1)
                }
                user.inventario = inventario
                user.inventory = inventario
                await dataService.saveXpData(xpData)
                logger.info('[INVENTARIO] User ' + sender + ' usou item: ' + nome)
                return
            }
            return reply(`❌ O item *${nome}* não é um item utilizável (tipo: ${item.type || item.tipo || 'desconhecido'}).`)
        }

        if (acao === 'descartar') {
            const itemNome = args.slice(1).join(' ').toLowerCase().trim()
            if (!itemNome) {
                return reply('❌ Uso: `.inventario descartar <item>`\n\nExemplo: `.inventario descardar poção velha`')
            }
            const idx = inventario.findIndex(i =>
                (i.name || i.nome || '').toLowerCase().includes(itemNome)
            )
            if (idx === -1) {
                return reply('❌ Item não encontrado no inventário.')
            }
            const item = inventario[idx]
            const nome = item.name || item.nome
            inventario.splice(idx, 1)
            user.inventario = inventario
            user.inventory = inventario
            await dataService.saveXpData(xpData)
            logger.info('[INVENTARIO] User ' + sender + ' descartou item: ' + nome)
            return reply(`🗑️ Item *${nome}* descartado do inventário.`)
        }

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🎒 *SEU INVENTÁRIO* 🎒   \n`
        doc += `╚══════════════════════════════╝\n\n`

        if (inventario.length === 0) {
            doc += `📦 *Inventário vazio*\n\n`
            doc += `💡 _Ganhe itens usando comandos de economia e RPG_`
            return reply(doc.trim())
        }

        doc += `╭━〔 📦 ITENS (${inventario.length}) 〕━⬣\n`
        for (const item of inventario) {
            const nome = item.name || item.nome || 'Item Desconhecido'
            const qty = item.qty || item.quantidade || 1
            const tipo = item.type || item.tipo || 'geral'
            doc += `┃ 📦 *${nome}* x${qty}\n`
            doc += `┃   📂 Tipo: ${tipo}\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🔧 COMANDOS 〕━⬣\n`
        doc += `┃ 🧪 \`.inventario usar <item>\` — usa um item\n`
        doc += `┃ 🗑️ \`.inventario descartar <item>\` — descarta um item\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`

        await reply(doc.trim())
    }
}
