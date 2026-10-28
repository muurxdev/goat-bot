const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const PETS = {
    gato: { nome: '🐱 Gato', bonus: '+5 Sorte', preco: 2000, stat: 'sorte', value: 5 },
    cachorro: { nome: '🐕 Cachorro', bonus: '+10 Defesa', preco: 2000, stat: 'defesa', value: 10 },
    falcao: { nome: '🦅 Falcão', bonus: '+10 Ataque', preco: 2000, stat: 'ataque', value: 10 },
    dragao: { nome: '🐲 Dragão', bonus: '+20 Ataque', preco: 5000, stat: 'ataque', value: 20 },
    hydra: { nome: '🐉 Hydra', bonus: '+70% XP | +50% Dano | +50% Crítico', preco: 100000000, stat: 'lendario', value: 0 }
}

module.exports = {
    name: 'petshop',
    aliases: ['lojapet', 'comprarpet'],
    category: 'rpg',
    subcategory: 'Economia',
    description: 'Compre e gerencie pets de combate com bônus',
    cooldownMs: 10000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'loja' || sub === 'lista') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🐾 *PET SHOP — LOJA* 🐾   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `💰 *Seu Saldo:* ${formatCoins(user.coins || 0)}\n\n`

            Object.entries(PETS).forEach(([key, p]) => {
                doc += `╭━〔 ${p.nome} 〕━⬣\n`
                doc += `┃ ✨ *Bônus:* ${p.bonus}\n`
                doc += `┃ 💰 *Preço:* ${formatCoins(p.preco)}\n`
                doc += `┃ 🆔 *ID:* ${key}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += '💡 _Use_ \`.petshop comprar <nome>\` _para adquirir um pet!_'
            return reply(doc.trim(), [sender])
        }

        if (sub === 'comprar' || sub === 'buy') {
            const petName = (args[1] || '').toLowerCase()

            if (!petName || !PETS[petName]) {
                return reply('❌ Pet inválido! Pets disponíveis: gato, cachorro, falcao, dragao\nEx: `.petshop comprar gato`')
            }

            const pet = PETS[petName]

            if ((user.coins || 0) < pet.preco) {
                return reply(`❌ Coins insuficientes!\n\n💰 *Seu Saldo:* ${formatCoins(user.coins || 0)}\n🏷️ *Preço:* ${formatCoins(pet.preco)}`)
            }

            if (!user.pets) user.pets = []
            if (user.pets.includes(petName)) {
                return reply(`❌ Você já possui um *${pet.nome}*! Use \`.petshop ver\` para ver seus pets.`)
            }

            user.coins -= pet.preco
            user.pets.push(petName)

            // Equipa na hora quando não há nenhum pet ativo.
            // Antes a compra só empilhava em `user.pets` e `user.pet` continuava
            // vazio: o jogador pagava (a Hydra custa 100 milhões), não via bônus
            // nenhum e não tinha como adivinhar que faltava um segundo comando.
            // Se JÁ existe pet equipado, não troca — a escolha é do jogador.
            let equipadoAgora = false
            if (!user.pet) {
                // String, não objeto: a coluna `pet` é TEXT e um objeto quebrava
            // o bind do SQLite, fazendo o equipar nunca persistir.
            user.pet = petName
                equipadoAgora = true
            }

            await dataService.saveXpData(xpData)
            logger.info(`[PETSHOP] ${sender} comprou pet ${petName}${equipadoAgora ? ' (equipado automaticamente)' : ''}`)

            let doc = '🎉 *PET ADQUIRIDO COM SUCESSO!*\n\n'
            doc += `${pet.nome}\n`
            doc += `✨ *Bônus:* ${pet.bonus}\n`
            doc += equipadoAgora
                ? '\n✅ *Equipado automaticamente* — o bônus já está valendo.\n'
                : `\n💡 _Você já tem outro pet ativo. Para usar este:_ \`.petshop equipar ${petName}\`\n`
            doc += `💰 *Pago:* ${formatCoins(pet.preco)}\n`
            doc += `💰 *Saldo Restante:* ${formatCoins(user.coins || 0)}\n\n`
            doc += `💡 _Use_ \`.petshop equipar ${petName}\` _para ativar o bônus!_`

            return reply(doc.trim(), [sender])
        }

        if (sub === 'ver' || sub === 'meus' || sub === 'info') {
            const equipped = user.pet ? (typeof user.pet === 'object' ? user.pet : { name: user.pet }) : null
            const owned = user.pets || []

            if (owned.length === 0 && !equipped) {
                return reply('🐾 *Você não possui nenhum pet!*\n\n💡 _Visite a loja com_ \`.petshop\`')
            }

            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🐾 *SEUS PETS* 🐾   ║\n'
            doc += '╚══════════════════════════════╝\n\n'

            if (equipped) {
                const petData = PETS[equipped.name] || PETS[equipped.type] || {}
                doc += `╭━〔 🏆 PET EQUIPADO 〕━⬣\n`
                doc += `┃ ${petData.nome || equipped.name}\n`
                doc += `┃ ✨ *Bônus:* ${petData.bonus || 'N/A'}\n`
                doc += `┃ 📈 *Nível:* ${equipped.level || 1}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            }

            doc += `╭━〔 🎒 PETS POSSEÍDOS (${owned.length}) 〕━⬣\n`
            owned.forEach(p => {
                const pData = PETS[p] || PETS[p.name] || {}
                const isEquipped = (equipped && (equipped.name === p || equipped.name === p.name))
                doc += `┃ ${pData.nome || p} ${isEquipped ? '✅ *(Equipado)*' : ''}\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _Equipar:_ \`.petshop equipar <nome>\`'

            return reply(doc.trim(), [sender])
        }

        if (sub === 'equipar' || sub === 'equip') {
            const petName = (args[1] || '').toLowerCase()

            if (!petName) {
                return reply('❌ Use: `.petshop equipar <nome>`')
            }

            const owned = user.pets || []
            if (!owned.includes(petName)) {
                return reply(`❌ Você não possui o pet *${petName}*! Compre na loja com \`.petshop\``)
            }

            // String, não objeto: a coluna `pet` é TEXT e um objeto quebrava o
            // bind do SQLite — o equipar falhava e o pet nunca ficava ativo.
            user.pet = petName

            await dataService.saveXpData(xpData)
            logger.info(`[PETSHOP] ${sender} equipou pet ${petName}`)

            const petData = PETS[petName] || {}
            return reply(`✅ *PET EQUIPADO!*\n\n${petData.nome || petName}\n✨ *Bônus Ativo:* ${petData.bonus || 'N/A'}`, [sender])
        }

        return reply('❌ Opção inválida! Use:\n• `.petshop` — Ver loja\n• `.petshop comprar <nome>` — Comprar pet\n• `.petshop ver` — Ver seus pets\n• `.petshop equipar <nome>` — Equipar pet')
    }
}
