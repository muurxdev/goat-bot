/**
 * GOATBOT — Database Seeder Tool
 * Popula o banco de dados com dados fictícios para testes de desenvolvimento e QA
 */

const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const userRepo = require('../src/database/repositories/userRepository')
const guildRepo = require('../src/database/repositories/guildRepository')
const bossRepo = require('../src/database/repositories/bossRepository')
const logger = require('../src/core/logger')

function seedDatabase(count = 10) {
    const db = getDatabase()
    runMigrations(db)

    logger.info(`🌱 Iniciando seeding de ${count} usuários e dados de teste...`)

    const classesList = ['arquimago', 'guardiao', 'bughunter', 'nuvem', 'ia', 'hacker', 'fullstack', 'necromante']
    const mundosList = ['floresta', 'servidor', 'cyber', 'ancestral', 'void']

    for (let i = 1; i <= count; i++) {
        const jid = `55119990000${String(i).padStart(2, '0')}@s.whatsapp.net`
        const lvl = Math.floor(Math.random() * 40) + 1
        const u = {
            jid,
            xp: Math.floor(Math.random() * 500),
            level: lvl,
            messages: Math.floor(Math.random() * 300) + 10,
            coins: Math.floor(Math.random() * 5000) + 100,
            rep: Math.floor(Math.random() * 20),
            streak: Math.floor(Math.random() * 15),
            hp: 100 + (Math.floor(lvl / 5) * 10),
            hpMax: 100 + (Math.floor(lvl / 5) * 10),
            mundo: mundosList[Math.floor(Math.random() * mundosList.length)],
            mochila: 20,
            classe: classesList[Math.floor(Math.random() * classesList.length)],
            arenaPontos: Math.floor(Math.random() * 1500),
            arenaAtual: 1,
            wins: Math.floor(Math.random() * 30),
            losses: Math.floor(Math.random() * 10),
            bossesMortos: Math.floor(Math.random() * 15),
            inventario: ['🟢 Fragmento de Bug', '🪲 Casca Binária'],
            conquistas: ['primeiro_codigo'],
            pets: ['cachorro']
        }
        userRepo.saveUser(u)
    }

    // Cria Guilda de Teste
    guildRepo.saveGuild('DevLegends', {
        dono: '5511999000001@s.whatsapp.net',
        level: 3,
        xp: 2500,
        coins: 800,
        membros: ['5511999000001@s.whatsapp.net', '5511999000002@s.whatsapp.net']
    })

    // Cria Luta de Boss de Teste
    bossRepo.saveBossFight('test_group_seed', {
        id: 'bug',
        dono: '5511999000001@s.whatsapp.net',
        nome: '🐛 Bug Gigante',
        tipo: 'Bug',
        raridade: '⚪ COMUM',
        vida: 5000,
        vidaMax: 5000,
        multiplicador: 1,
        efeito: 'normal',
        ativo: true,
        dano: { '5511999000001@s.whatsapp.net': 150 },
        loot: [{ nome: '🟢 Chip Comum', chance: 40 }]
    })

    logger.info('✅ Seeding concluído com sucesso!')
}

if (require.main === module) {
    seedDatabase(15)
}

module.exports = { seedDatabase }
