/**
 * BotXP — Suíte de Testes da Fase 3: Persistência & SQLite
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const path = require('path')
const fs = require('fs')

const { getDatabase, closeDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const { importLegacyJsonData } = require('../src/database/importer')
const userRepo = require('../src/database/repositories/userRepository')
const guildRepo = require('../src/database/repositories/guildRepository')
const bossRepo = require('../src/database/repositories/bossRepository')
const missionRepo = require('../src/database/repositories/missionRepository')
const warnRepo = require('../src/database/repositories/warnRepository')
const configRepo = require('../src/database/repositories/configRepository')
const craftRepo = require('../src/database/repositories/craftRepository')

console.log('🧪 Iniciando suíte de testes de Banco de Dados & SQLite (FASE 3)...\n')

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

async function runDbTests() {
    const testDbPath = path.join(__dirname, 'test_db.sqlite')
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)

    const db = getDatabase(testDbPath)

    // ══════════════════════════════════════════
    // 1. MIGRATIONS & SCHEMA
    // ══════════════════════════════════════════
    console.log('--- 1. Migrations & Tabelas ---')

    test('runMigrations cria todas as tabelas necessárias', () => {
        runMigrations(db)
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name)
        assert(tables.includes('schema_migrations'))
        assert(tables.includes('users'))
        assert(tables.includes('guilds'))
        assert(tables.includes('warns'))
        assert(tables.includes('configs'))
        assert(tables.includes('missions'))
        assert(tables.includes('boss_fights'))
        assert(tables.includes('crafts'))
    })

    // ══════════════════════════════════════════
    // 2. IMPORTAÇÃO DE DADOS LEGADOS
    // ══════════════════════════════════════════
    console.log('\n--- 2. Importador de Dados Legados ---')

    test('importLegacyJsonData migra dados de data/xp.json para SQLite', () => {
        importLegacyJsonData(db)
        const users = userRepo.getAllUsers()
        const count = Object.keys(users).length
        console.log(`     (Total de usuários carregados no SQLite: ${count})`)
        assert(count >= 200, 'Deve importar os 222 usuários do xp.json legado')
    })

    // ══════════════════════════════════════════
    // 3. USER REPOSITORY & QUERIES OTIMIZADAS
    // ══════════════════════════════════════════
    console.log('\n--- 3. User Repository ---')

    test('getUser e saveUser realizam CRUD com tipos corretos', () => {
        const testUser = {
            jid: '5511888888888@s.whatsapp.net',
            xp: 350,
            level: 12,
            coins: 5000,
            hp: 220,
            hpMax: 220,
            mundo: 'cyber',
            classe: 'hacker',
            classeLendaria: 'neural',
            inventario: ['item1', 'item2'],
            conquistas: ['c1'],
            pets: ['raposa']
        }
        userRepo.saveUser(testUser)

        const loaded = userRepo.getUser(testUser.jid)
        assert.strictEqual(loaded.jid, testUser.jid)
        assert.strictEqual(loaded.xp, 350)
        assert.strictEqual(loaded.level, 12)
        assert.strictEqual(loaded.coins, 5000)
        assert.strictEqual(loaded.classe, 'hacker')
        assert.strictEqual(loaded.classeLendaria, 'neural')
        assert.deepStrictEqual(loaded.inventario, ['item1', 'item2'])
        assert.deepStrictEqual(loaded.pets, ['raposa'])
    })

    test('getTopRank e getTopCoins retornam ordenados e limitados', () => {
        const topRank = userRepo.getTopRank(5)
        assert(topRank.length <= 5)
        if (topRank.length > 1) {
            const first = topRank[0][1]
            const second = topRank[1][1]
            assert(first.level >= second.level)
        }

        const topCoins = userRepo.getTopCoins(5)
        assert(topCoins.length <= 5)
        if (topCoins.length > 1) {
            assert(topCoins[0][1].coins >= topCoins[1][1].coins)
        }
    })

    // ══════════════════════════════════════════
    // 4. GUILD REPOSITORY
    // ══════════════════════════════════════════
    console.log('\n--- 4. Guild Repository ---')

    test('saveGuild, getGuild e deleteGuild operam corretamente', () => {
        const guild = {
            dono: '5511999999999@s.whatsapp.net',
            level: 2,
            xp: 1500,
            coins: 300,
            membros: ['5511999999999@s.whatsapp.net', '5511888888888@s.whatsapp.net']
        }
        guildRepo.saveGuild('TestGuild', guild)

        const loaded = guildRepo.getGuild('TestGuild')
        assert.strictEqual(loaded.dono, guild.dono)
        assert.strictEqual(loaded.level, 2)
        assert.deepStrictEqual(loaded.membros, guild.membros)

        guildRepo.deleteGuild('TestGuild')
        assert.strictEqual(guildRepo.getGuild('TestGuild'), null)
    })

    // ══════════════════════════════════════════
    // 5. BOSS REPOSITORY
    // ══════════════════════════════════════════
    console.log('\n--- 5. Boss Repository ---')

    test('saveBossFight, getBossFight e deleteBossFight operam corretamente', () => {
        const fight = {
            id: 'bug',
            dono: '5511999999999@s.whatsapp.net',
            nome: '🐛 Bug Gigante',
            tipo: 'Bug',
            raridade: '🌟 LENDÁRIO',
            vida: 4000,
            vidaMax: 5000,
            multiplicador: 2,
            efeito: 'normal',
            ativo: true,
            dano: { '5511999999999@s.whatsapp.net': 1000 },
            loot: [{ nome: '🟢 Chip Comum', chance: 40 }]
        }
        const idLuta = 'group1_user1'
        bossRepo.saveBossFight(idLuta, fight)

        const loaded = bossRepo.getBossFight(idLuta)
        assert.strictEqual(loaded.nome, '🐛 Bug Gigante')
        assert.strictEqual(loaded.vida, 4000)
        assert.strictEqual(loaded.dano['5511999999999@s.whatsapp.net'], 1000)

        bossRepo.deleteBossFight(idLuta)
        assert.strictEqual(bossRepo.getBossFight(idLuta), null)
    })

    // ══════════════════════════════════════════
    // 6. MISSION, WARN, CONFIG & CRAFT REPOSITORIES
    // ══════════════════════════════════════════
    console.log('\n--- 6. Outros Repositórios (Missions, Warns, Configs, Crafts) ---')

    test('missionRepository salva e recupera missão diária', () => {
        const m = {
            dia: '2026-8-30',
            progresso: 10,
            concluida: false,
            missao: { tipo: 'mensagens', titulo: 'Chat', descricao: 'Envie msgs', meta: 20, xp: 100, coins: 50 }
        }
        missionRepo.saveMission('user_mission', m)
        const loaded = missionRepo.getMission('user_mission')
        assert.strictEqual(loaded.dia, '2026-8-30')
        assert.strictEqual(loaded.progresso, 10)
        assert.strictEqual(loaded.missao.meta, 20)
    })

    test('warnRepository incrementa e lê warns', () => {
        warnRepo.setWarns('warned_user', 2)
        assert.strictEqual(warnRepo.getWarns('warned_user'), 2)
    })

    test('configRepository salva flags de antilink de grupos', () => {
        configRepo.saveConfig('group_123@g.us', { antilink: true, welcome: false })
        const cfg = configRepo.getConfig('group_123@g.us')
        assert.strictEqual(cfg.antilink, true)
    })

    test('craftRepository adiciona e recupera itens forjados', () => {
        craftRepo.addCraft('craft_user', '⚔️ Espada de Bug')
        craftRepo.addCraft('craft_user', '🛡️ Armadura de Firewall')
        const crafts = craftRepo.getUserCrafts('craft_user')
        assert(crafts.includes('⚔️ Espada de Bug'))
        assert(crafts.includes('🛡️ Armadura de Firewall'))
    })

    // ══════════════════════════════════════════
    // RESUMO FINAL
    // ══════════════════════════════════════════
    console.log('\n========================================')
    console.log(`📊 RESULTADO DOS TESTES DE BANCO DE DADOS:`)
    console.log(`   ✅ Passaram: ${passCount}`)
    console.log(`   ❌ Falharam: ${failCount}`)
    console.log('========================================\n')

    closeDatabase()
    try { if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath) } catch (_) {}

    if (failCount > 0) process.exit(1)
    else process.exit(0)
}

runDbTests().catch(err => {
    console.error('Erro na execução dos testes de banco de dados:', err)
    process.exit(1)
})

