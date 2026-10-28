const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const SLOTS_VALIDOS = {
    arma: '⚔️ Arma',
    armadura: '🛡️ Armadura',
    capa: '🧥 Capa',
    anel: '💍 Anel',
    amuleto: '📿 Amuleto'
}

module.exports = {
    name: 'equipamento',
    aliases: ['gear'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Sistema de equipamento — veja e equipa itens nos slots',
    cooldownMs: 3000,
    execute: async ({ args, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.equipment) {
            user.equipment = { weapon: null, armor: null, cape: null, ring: null, amulet: null }
        }

        const inventario = user.inventario || user.inventory || []
        const acao = (args[0] || '').toLowerCase()

        if (acao === 'equip') {
            const slotInput = (args[1] || '').toLowerCase()
            const itemNome = args.slice(2).join(' ').toLowerCase().trim()

            if (!slotInput || !itemNome) {
                return reply('❌ Uso: `.equipamento equip <slot> <item>`\n\nSlots: arma, armadura, capa, anel, amuleto\nExemplo: `.equipamento equip arma espada lendária`')
            }

            const slotMap = {
                arma: 'weapon',
                arma_: 'weapon',
                armadura: 'armor',
                armadura_: 'armor',
                capa: 'cape',
                capa_: 'cape',
                anel: 'ring',
                anel_: 'ring',
                amuleto: 'amulet',
                amuleto_: 'amulet'
            }
            const slotKey = slotMap[slotInput]
            if (!slotKey) {
                return reply('❌ Slot inválido. Slots disponíveis: ' + Object.keys(SLOTS_VALIDOS).join(', '))
            }

            const itemEncontrado = inventario.find(i =>
                (i.name || i.nome || '').toLowerCase().includes(itemNome)
            )
            if (!itemEncontrado) {
                return reply('❌ Item não encontrado no seu inventário.')
            }

            user.equipment[slotKey] = itemEncontrado.name || itemEncontrado.nome
            await dataService.saveXpData(xpData)
            logger.info('[EQUIPAMENTO] User ' + sender + ' equipou ' + itemEncontrado.name + ' no slot ' + slotKey)

            return reply(`✅ *${itemEncontrado.name || itemEncontrado.nome}* equipado no slot *${SLOTS_VALIDOS[slotInput]}*!`)
        }

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🛡️ *SEU EQUIPAMENTO* 🛡️   \n`
        doc += `╚══════════════════════════════╝\n\n`

        const slots = user.equipment
        doc += `╭━〔 ⚔️ SLOTS 〕━⬣\n`
        doc += `┃ ⚔️ *Arma:* ${slots.weapon || '❌ Vazio'}\n`
        doc += `┃ 🛡️ *Armadura:* ${slots.armor || '❌ Vazio'}\n`
        doc += `┃ 🧥 *Capa:* ${slots.cape || '❌ Vazio'}\n`
        doc += `┃ 💍 *Anel:* ${slots.ring || '❌ Vazio'}\n`
        doc += `┃ 📿 *Amuleto:* ${slots.amulet || '❌ Vazio'}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        const itensEquipados = Object.values(slots).filter(Boolean).length
        doc += `📊 *Slots preenchidos:* ${itensEquipados}/5\n\n`
        doc += `💡 _Use_ \`.equipamento equip <slot> <item>\` _para equipar um item_`

        await reply(doc.trim())
    }
}
