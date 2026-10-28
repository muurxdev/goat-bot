/**
 * BotXP — Suíte de Testes Automatizados (Fase 1 & Fase 2)
 * Testa arquitetura modular, persistência, serviços, utilitários e command dispatcher
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { temTexto } = require('./helpers/moldura')
const fs = require('fs')
const path = require('path')

// Importa módulos da nova arquitetura src/
const paths = require('../src/config/paths')
const env = require('../src/config/env')
const locks = require('../src/core/locks')
const validators = require('../src/utils/validators')
const helpers = require('../src/utils/helpers')
const constants = require('../src/utils/constants')
const dataService = require('../src/services/dataService')
const xpService = require('../src/services/xpService')
const rpgService = require('../src/services/rpgService')
const missionService = require('../src/services/missionService')
const dispatcher = require('../src/handlers/commandDispatcher')

console.log('🧪 Iniciando suíte de testes do BotXP (FASE 2 — ARQUITETURA MODULAR)...\n')

let passCount = 0
let failCount = 0

function test(name, fn) {
    try {
        fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

async function testAsync(name, fn) {
    try {
        await fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const { importLegacyJsonData } = require('../src/database/importer')

async function runTests() {
    // Inicializa o banco de dados e migrations para o teste
    const db = getDatabase()
    runMigrations(db)
    importLegacyJsonData(db)

    // ══════════════════════════════════════════
    // 1. CONFIGURAÇÕES E PATHS
    // ══════════════════════════════════════════
    console.log('--- 1. Configurações e Paths ---')

    test('Diretórios e caminhos essenciais existem', () => {
        assert(fs.existsSync(paths.dataDir), 'data/ deve existir')
        assert(fs.existsSync(paths.tempDir), 'temp/ deve existir')
        assert(paths.files.xp.endsWith('xp.json'))
        assert(paths.files.boss.endsWith('boss.json'))
    })

    test('Env wrapper retorna valores padrão apropriados', () => {
        assert.strictEqual(env.prefix, '.')
        assert(typeof env.isDev === 'boolean')
    })

    // ══════════════════════════════════════════
    // 2. VALIDAÇÃO DE INPUTS
    // ══════════════════════════════════════════
    console.log('\n--- 2. Validação de Inputs ---')

    test('validateNumber aceita números válidos dentro do range', () => {
        assert.strictEqual(validators.validateNumber('50', 0, 100), 50)
        assert.strictEqual(validators.validateNumber(10, 0, 20), 10)
    })

    test('validateNumber rejeita NaN, números negativos ou fora do range', () => {
        assert.strictEqual(validators.validateNumber('abc', 0, 100), null)
        assert.strictEqual(validators.validateNumber('-5', 0, 100), null)
        assert.strictEqual(validators.validateNumber('150', 0, 100), null)
        assert.strictEqual(validators.validateNumber(null), null)
    })

    test('validateString valida comprimento e tipo', () => {
        assert.strictEqual(validators.validateString('teste', 10), 'teste')
        assert.strictEqual(validators.validateString('string_muito_longa', 5), null)
        assert.strictEqual(validators.validateString('', 10), null)
        assert.strictEqual(validators.validateString(null), null)
    })

    test('validateMathExpression previne código malicioso e aceita matemática segura', () => {
        assert.strictEqual(validators.validateMathExpression('2 + 2 * 3'), '2 + 2 * 3')
        assert.strictEqual(validators.validateMathExpression('(10 / 2) - 1'), '(10 / 2) - 1')
        assert.strictEqual(validators.validateMathExpression('process.exit()'), null)
        assert.strictEqual(validators.validateMathExpression('require("fs")'), null)
        assert.strictEqual(validators.validateMathExpression('2 + 2; rm -rf /'), null)
    })

    test('validateUrl valida URLs bem formatadas', () => {
        assert.strictEqual(validators.validateUrl('https://google.com'), 'https://google.com')
        assert.strictEqual(validators.validateUrl('http://localhost:3000'), 'http://localhost:3000')
        assert.strictEqual(validators.validateUrl('invalid-url'), null)
        assert.strictEqual(validators.validateUrl(''), null)
    })

    // ══════════════════════════════════════════
    // 3. INICIALIZAÇÃO DE USUÁRIOS E LEVELING
    // ══════════════════════════════════════════
    console.log('\n--- 3. XP Service e Perfil ---')

    test('initializeUser cria estrutura padrão completa', () => {
        const dummyDb = {}
        const user = xpService.initializeUser('novo_usuario_teste_unitario_' + Date.now() + '@s.whatsapp.net', dummyDb)
        assert.strictEqual(user.xp, 0)
        assert.strictEqual(user.level, 1)
        assert.strictEqual(user.coins, 0)
        assert.strictEqual(user.hp, 100)
        assert.strictEqual(user.hpMax, 100)
        assert.strictEqual(user.mochila, 20)
        assert(Array.isArray(user.inventario))
        assert(Array.isArray(user.conquistas))
        assert(Array.isArray(user.pets))
    })

    test('helpers: getCargo, getRank e barraXP falam a língua do Reino', () => {
        // As patentes vêm de config/lore.js. A escada antiga era uma carreira de
        // tecnologia ("Iniciante", "Tech Lead"); o usuário do bot não é
        // programador. Se algum termo de TI voltar aqui, é regressão.
        assert.strictEqual(helpers.getCargo(1), '🍺 Andarilho do Reino')
        assert.strictEqual(helpers.getCargo(50), '👑 Grão-Mestre dos Cavaleiros')
        assert.strictEqual(helpers.getRank(1), '🍺 Novato')
        assert.strictEqual(helpers.getRank(50), '👑 Lendário')

        const PROIBIDOS = /\b(dev|engineer|CTO|tech lead|software|computação|junior|pleno|senior)\b/i
        for (const lvl of [1, 10, 25, 40, 60, 80, 120, 200, 400, 800, 1500]) {
            assert.ok(!PROIBIDOS.test(helpers.getCargo(lvl)), `patente do nível ${lvl} tem jargão de TI: ${helpers.getCargo(lvl)}`)
            assert.ok(!PROIBIDOS.test(helpers.getRank(lvl)), `rank do nível ${lvl} tem jargão de TI: ${helpers.getRank(lvl)}`)
        }

        const barra = helpers.barraXP(50, 1)
        assert(temTexto(barra, '%'))
    })

    // ══════════════════════════════════════════
    // 4. RPG, COMBATE E BOSSES
    // ══════════════════════════════════════════
    console.log('\n--- 4. RPG Service e Combate ---')

    test('rpgService: aplicarBonusDano com e sem poção', () => {
        const agora = Date.now()
        const playerComPot = { pocaoAtiva: { tipo: 'forca', expira: agora + 60000 } }
        assert.strictEqual(rpgService.aplicarBonusDano(playerComPot, 100), 125)

        const playerSemPot = { pocaoAtiva: null }
        assert.strictEqual(rpgService.aplicarBonusDano(playerSemPot, 100), 100)
    })

    test('rpgService: gerarBoss e sortearRaridadeBoss', () => {
        const boss = rpgService.gerarBoss('bug')
        assert(boss !== null)
        assert.strictEqual(boss.tipo, 'Bug')
        assert(boss.vida >= 5000)
        assert(Array.isArray(boss.loot))
        assert(boss.loot.length > 0)
    })

    test('missionService: gerarMissao retorna missão com campos válidos', () => {
        const missao = missionService.gerarMissao()
        assert(missao && missao.tipo)
        assert(missao.meta > 0)
        assert(missao.xp > 0)
        assert(missao.coins > 0)
    })

    // ══════════════════════════════════════════
    // 5. PERSISTÊNCIA E LOCKS
    // ══════════════════════════════════════════
    console.log('\n--- 5. Concorrência e Data Service ---')

    await testAsync('locks: acquireLock e releaseLock operam de forma atômica', async () => {
        let lockAcquired = false
        await locks.acquireLock('test_lock')
        lockAcquired = true

        let secondAcquired = false
        const waitPromise = locks.acquireLock('test_lock').then(() => {
            secondAcquired = true
        })

        assert.strictEqual(secondAcquired, false)
        locks.releaseLock('test_lock')

        await waitPromise
        assert.strictEqual(secondAcquired, true)
        locks.releaseLock('test_lock')
    })

    test('dataService: getXpData lê dados sem falhas', () => {
        const xp = dataService.getXpData()
        assert(typeof xp === 'object' && xp !== null)
        const keys = Object.keys(xp)
        console.log(`     (Total de usuários registrados em data/xp.json: ${keys.length})`)
    })

    // ══════════════════════════════════════════
    // 6. COMMAND DISPATCHER & CARREGAMENTO DINÂMICO
    // ══════════════════════════════════════════
    console.log('\n--- 6. Command Dispatcher & Módulos de Comandos ---')

    test('loadCommands carrega comandos dinamicamente', () => {
        dispatcher.loadCommands()
        console.log(`     (Comandos carregados: ${dispatcher.commands.size}, Aliases: ${dispatcher.aliases.size})`)
        assert(dispatcher.commands.size >= 25, 'Deve carregar mais de 25 comandos modulares')
        assert(dispatcher.commands.has('menu'))
        assert(dispatcher.commands.has('ping'))
        assert(dispatcher.commands.has('xp'))
        assert(dispatcher.commands.has('hunt'))
        assert(dispatcher.commands.has('boss'))
        assert(dispatcher.commands.has('kick'))
        assert(dispatcher.commands.has('fig'))
        assert(dispatcher.commands.has('play'))
    })

    await testAsync('dispatch executa comando ping com resposta correta', async () => {
        const botScheduler = require('../src/services/botScheduler')
        const securityService = require('../src/services/securityService')
        botScheduler.openImmediately('OWNER')
        securityService.setMaintenance(false)
        const configs = dataService.getConfigsData()
        if (configs.global) configs.global.blockAllDMs = false
        await dataService.saveConfigsData(configs)

        let response = ''
        const mockContext = {
            commandName: 'ping',
            sender: '5511999999999@s.whatsapp.net',
            from: '5511999999999@s.whatsapp.net',
            isGroup: false,
            isAdmin: false,
            isBotAdmin: false,
            isOwner: false,
            reply: async (txt) => { response += txt },
            args: []
        }
        const dispatched = await dispatcher.dispatch(mockContext)
        assert.strictEqual(dispatched, true)
        assert(temTexto(response, 'Pong') || temTexto(response, 'Latência'))
    })

    await testAsync('dispatch bloqueia comandos adminOnly para não-admins', async () => {
        let response = ''
        const mockContext = {
            commandName: 'kick',
            sender: '5511911112222@s.whatsapp.net',
            from: '120363000000000000@g.us',
            isGroup: true,
            isAdmin: false,
            isBotAdmin: true,
            isOwner: false,
            reply: async (txt) => { response = txt },
            args: []
        }
        const dispatched = await dispatcher.dispatch(mockContext)
        assert.strictEqual(dispatched, true)
        assert(temTexto(response, 'Só administradores do grupo podem usar') || temTexto(response, 'ADMINISTRADOR DO GRUPO'))
    })

    await testAsync('dispatch bloqueia comandos groupOnly no privado', async () => {
        let response = ''
        const mockContext = {
            commandName: 'kick',
            sender: '5511911112222@s.whatsapp.net',
            from: '5511911112222@s.whatsapp.net',
            isGroup: false,
            isAdmin: false,
            isBotAdmin: false,
            isOwner: false,
            reply: async (txt) => { response = txt },
            args: []
        }
        const dispatched = await dispatcher.dispatch(mockContext)
        assert.strictEqual(dispatched, true)
        assert(temTexto(response, 'funciona só dentro de grupos'))
    })

    await testAsync('dispatch executa .help com categorias e detalhes de comando', async () => {
        // 1. Menu Geral de Categorias
        let replyMain = ''
        await dispatcher.dispatch({
            commandName: 'help',
            sender: '5511999999999@s.whatsapp.net',
            from: '5511999999999@s.whatsapp.net',
            isGroup: false,
            isOwner: true,
            reply: async (txt) => { replyMain = txt },
            args: []
        })
        const botName = require('../src/config/botConfig').getBotName()
        assert(temTexto(replyMain, botName) || temTexto(replyMain, 'GOAT') || temTexto(replyMain, 'GOAT'))
        assert(temTexto(replyMain, 'Mídia & Downloads') || temTexto(replyMain, 'media'))

        // 2. Ajuda por Categoria (.help media)
        let replyCat = ''
        await dispatcher.dispatch({
            commandName: 'help',
            sender: '5511999999999@s.whatsapp.net',
            from: '5511999999999@s.whatsapp.net',
            isGroup: false,
            isOwner: true,
            text: 'media',
            reply: async (txt) => { replyCat = txt },
            args: ['media']
        })
        assert(temTexto(replyCat, 'Mídia & Downloads'))
        assert(temTexto(replyCat, '.play') || temTexto(replyCat, '.media'))

        // 3. Ajuda de Comando Específico (.help .play)
        let replyCmd = ''
        await dispatcher.dispatch({
            commandName: 'help',
            sender: '5511999999999@s.whatsapp.net',
            from: '5511999999999@s.whatsapp.net',
            isGroup: false,
            isOwner: true,
            text: '.play',
            reply: async (txt) => { replyCmd = txt },
            args: ['.play']
        })
        // Guia sem jargão desde 2026-09-17: "Aliases" virou "Também funciona como".
        assert(temTexto(replyCmd, 'Guia do .play'))
        assert(temTexto(replyCmd, 'Também funciona como'))
        assert(temTexto(replyCmd, 'Espera entre usos'))
        assert(!/Aliases|Cooldown|GROUP_ADMIN|USER`/.test(replyCmd), 'guia não pode ter jargão')
    })

    test('dispatcher.findCommand localiza comandos por nome canônico e aliases', () => {
        const cmdPlay = dispatcher.findCommand('play')
        const aliasTocar = dispatcher.findCommand('tocar')
        const aliasAjuda = dispatcher.findCommand('ajuda')

        assert.strictEqual(cmdPlay.name, 'play')
        assert.strictEqual(aliasTocar.name, 'play')
        assert.strictEqual(aliasAjuda.name, 'help')
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    if (failCount > 0) {
        process.exit(1)
    } else {
        process.exit(0)
    }
}

runTests().catch(err => {
    console.error('Erro na execução da suíte de testes:', err)
    process.exit(1)
})
