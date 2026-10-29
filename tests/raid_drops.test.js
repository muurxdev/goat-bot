/**
 * Testes Unitários e de Integração: Drops de Raid, Equipamentos Titânicos e Venda de Loots
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const dataService = require('../src/services/dataService')
const { initializeUser, processarLevelUp } = require('../src/services/xpService')
const {
    sortearEquipamentoRaid,
    sortearEquipamentoDrop,
    ITEMS_DB,
    getItem
} = require('../src/services/rpgEquipmentService')
const raidCommand = require('../src/commands/rpg/raid')
const venderCommand = require('../src/commands/economy/vender')
const equiparCommand = require('../src/commands/rpg/equipar')

console.log('🧪 Iniciando testes de Drops de Raid Titânica...\n')

// 1. Testes de sortearEquipamentoRaid
console.log('--- 1. sortearEquipamentoRaid (Catálogo de Equipamentos de Raid) ---')
for (let i = 0; i < 20; i++) {
    const item = sortearEquipamentoRaid(10, 0, 'sombria')
    assert(item, 'Deve sempre retornar um equipamento válido')
    assert(item.id && item.nome && item.slot, 'Equipamento deve ter id, nome e slot')
    assert.notStrictEqual(item.raridade, '⚪ Comum', 'Raid não deve dropar item comum')
}
console.log('  ✅ PASS: Sorteia equipamentos Raro/Épico/Lendário/Mítico/Divino sem falhas (20 iterações)')

// Teste de afinidade temática
let dropThematicoCount = 0
for (let i = 0; i < 100; i++) {
    const item = sortearEquipamentoRaid(50, 0, 'sombria')
    if (item.id === 'sombria') dropThematicoCount++
}
assert(dropThematicoCount > 0, 'Deve haver chance de drop temático de Sombria para o MVP')
console.log(`  ✅ PASS: Drop temático de Sombria ocorreu (${dropThematicoCount}/100 vezes para MVP)`)

// 2. Simulação de Vitória de Raid e Garantia de Drops
console.log('\n--- 2. Vitória de Raid e Drops Garantidos ---')
const xpData = dataService.getXpData()
const testMvp = '5511999990001@s.whatsapp.net'
const testSupport = '5511999990002@s.whatsapp.net'

const userMvp = initializeUser(testMvp, xpData)
const userSupport = initializeUser(testSupport, xpData)

userMvp.inventario = []
userSupport.inventario = []

const raids = dataService.getRaidsData()
const raidGroup = '120363000000000000@g.us'

raids[raidGroup] = {
    id: 'sombria',
    nome: 'Dragão da Ira Sombria',
    vida: 50,
    vidaMax: 60000,
    mult: 2.8,
    loot: ['🐉 Escama do Dragão Sombria', '🗡️ Lâmina Quebrada Sagrada'],
    dano: {
        [testMvp]: 50000,
        [testSupport]: 10000
    },
    criador: testMvp,
    ativo: true,
    inicio: Date.now()
}
dataService.saveRaidsData(raids)

let victoryDoc = ''
let repliedTo = null

const fakeReply = (text, mentions) => {
    victoryDoc = text
    repliedTo = mentions
}

dataService.saveXpData(xpData).then(() => {
    // Executa o golpe final
    raidCommand.execute({
        from: raidGroup,
        sender: testMvp,
        args: ['atk'],
        reply: fakeReply,
        client: {},
        info: {}
    }).then(() => {
        // Texto reescrito em 2026-09-17 (829bdb42): "O grupo derrubou o titã!"
        assert(victoryDoc.includes('O grupo derrubou o titã'), 'Deve anunciar a derrota do Boss Raid')
        // Relatório reescrito em 2026-09-17 (829bdb42): recompensas por jogador, com a linha do equipamento.
        assert(/recompensas por dano/i.test(victoryDoc), 'Deve conter as recompensas por dano no relatório (título em caixa alta)')
        assert(victoryDoc.includes('✨'), 'MVP deve receber equipamento garantido (100% de drop)')

        // Verifica inventário do MVP diretamente do banco
        const updatedMvp = dataService.getUser(testMvp)
        assert(Array.isArray(updatedMvp.inventario), 'Inventário do MVP deve ser um array')
        const hasEscama = updatedMvp.inventario.some(i => typeof i === 'string' && i.includes('Escama do Dragão Sombria'))
        assert(hasEscama, 'MVP DEVE ter recebido a Escama do Dragão Sombria (drop garantido)')

        const hasEquipObj = updatedMvp.inventario.some(i => typeof i === 'object' && i.id && i.cp)
        assert(hasEquipObj, 'MVP DEVE ter recebido um equipamento real com CP e stats')
        console.log('  ✅ PASS: MVP recebeu materiais garantidos e equipamento real de Raid!')

        // Verifica inventário do Suporte
        const updatedSupport = dataService.getUser(testSupport)
        const hasSupportLoot = updatedSupport.inventario.some(i => typeof i === 'string' && i.includes('Escama do Dragão Sombria'))
        assert(hasSupportLoot, 'Suporte DEVE ter recebido materiais de Raid garantidos!')
        console.log('  ✅ PASS: Participante secundário também recebeu drop garantido!')

        // 3. Teste de Venda de Loots de Raid
        console.log('\n--- 3. Venda de Loots de Raid no .vender ---')
        let sellReply = ''
        venderCommand.execute({
            text: 'loot',
            args: ['loot'], // .vender lê args (o dispatcher entrega args)
            sender: testMvp,
            reply: (msg) => { sellReply = msg }
        }).then(() => {
        // Relatório reescrito em 2026-09-17: título "Loot vendido" (em caixa alta na moldura).
        assert(/loot vendido/i.test(sellReply), 'Deve vender loots de Raid com sucesso')
        assert(sellReply.includes('Escama do Dragão Sombria'), 'Deve listar a escama vendida')
        console.log('  ✅ PASS: Materiais de Raid podem ser vendidos por coins no .vender loot')

        // 4. Teste de Equipar o Item de Raid Recebido
        console.log('\n--- 4. Equipar Item do Drop de Raid ---')
        const equipDrop = updatedMvp.inventario.find(i => typeof i === 'object' && i.id)
        assert(equipDrop, 'Deve ter restado o equipamento no inventário')

        let equipReply = ''
        equiparCommand.execute({
            sender: testMvp,
            text: equipDrop.nome,
            reply: (msg) => { equipReply = msg }
        }).then(() => {
            assert(equipReply.includes('Você equipou'), 'Item deve ser equipado com sucesso')
            console.log(`  ✅ PASS: Equipamento de Raid (${equipDrop.nome}) equipado com sucesso no slot ${equipDrop.slot}!`)

            console.log('\n========================================')
            console.log('📊 TODOS OS TESTES DE DROPS DE RAID PASSARAM COM SUCESSO!')
            console.log('========================================\n')
        })
    })
    })
}).catch(err => {
    console.error('❌ Erro no teste de raid:', err)
    process.exit(1)
})
