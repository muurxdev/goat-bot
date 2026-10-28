const fs = require('fs')
const { files } = require('../config/paths')
const logger = require('../core/logger')

function readJsonQuiet(filePath, defaultVal = {}) {
    if (!fs.existsSync(filePath)) return defaultVal
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {
        return defaultVal
    }
}

function importLegacyJsonData(db) {
    // 1. IMPORTAR USUÁRIOS
    const countUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0
    if (countUsers === 0 && fs.existsSync(files.xp)) {
        const xpData = readJsonQuiet(files.xp, {})
        const entries = Object.entries(xpData)
        if (entries.length > 0) {
            logger.info(`📥 Importando ${entries.length} usuários de ${files.xp} para SQLite...`)
            const insertUser = db.prepare(`
                INSERT OR REPLACE INTO users (
                    jid, xp, level, messages, coins, rep, streak, hp, hp_max,
                    mundo, mochila, classe, classe_lendaria, bug_power, pet,
                    equipado, arma, guilda, wins, losses, bosses_mortos,
                    arena_pontos, arena_atual, last_daily, weekly_xp, weekly_coins,
                    pocao_ativa_tipo, pocao_ativa_expira, inventario, conquistas, pets
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?
                )
            `)

            for (const [jid, u] of entries) {
                insertUser.run(
                    jid,
                    u.xp || 0,
                    u.level || 1,
                    u.messages || 0,
                    u.coins || 0,
                    u.rep || 0,
                    u.streak || 0,
                    u.hp || 100,
                    u.hpMax || 100,
                    u.mundo || 'floresta',
                    u.mochila || 20,
                    u.classe || null,
                    u.classeLendaria || null,
                    u.bugPower || 0,
                    u.pet || null,
                    u.equipado || null,
                    u.arma || null,
                    u.guilda || null,
                    u.wins || 0,
                    u.losses || 0,
                    u.bossesMortos || 0,
                    u.arenaPontos || 0,
                    u.arenaAtual || 1,
                    u.lastDaily || 0,
                    u.weeklyXp || 0,
                    u.weeklyCoins || 0,
                    u.pocaoAtiva?.tipo || null,
                    u.pocaoAtiva?.expira || null,
                    JSON.stringify(u.inventario || []),
                    JSON.stringify(u.conquistas || []),
                    JSON.stringify(u.pets || [])
                )
            }
            logger.info(`✅ ${entries.length} usuários importados com sucesso para o banco de dados!`)
        }
    }

    // 2. IMPORTAR GUILDAS
    const countGuilds = db.prepare('SELECT COUNT(*) as count FROM guilds').get()?.count || 0
    if (countGuilds === 0 && fs.existsSync(files.guilds)) {
        const guildData = readJsonQuiet(files.guilds, {})
        const entries = Object.entries(guildData)
        if (entries.length > 0) {
            logger.info(`📥 Importando ${entries.length} guildas para SQLite...`)
            const insertGuild = db.prepare(`
                INSERT OR REPLACE INTO guilds (nome, dono, level, xp, coins, membros)
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            for (const [nome, g] of entries) {
                insertGuild.run(
                    nome,
                    g.dono || '',
                    g.level || 1,
                    g.xp || 0,
                    g.coins || 0,
                    JSON.stringify(g.membros || [])
                )
            }
            logger.info(`✅ ${entries.length} guildas importadas com sucesso!`)
        }
    }

    // 3. IMPORTAR WARNS
    const countWarns = db.prepare('SELECT COUNT(*) as count FROM warns').get()?.count || 0
    if (countWarns === 0 && fs.existsSync(files.warns)) {
        const warnsData = readJsonQuiet(files.warns, {})
        const entries = Object.entries(warnsData)
        if (entries.length > 0) {
            const insertWarn = db.prepare(`INSERT OR REPLACE INTO warns (jid, count) VALUES (?, ?)`)
            for (const [jid, count] of entries) {
                insertWarn.run(jid, count || 0)
            }
            logger.info(`✅ ${entries.length} registros de warns importados!`)
        }
    }

    // 4. IMPORTAR CONFIGS
    const countConfigs = db.prepare('SELECT COUNT(*) as count FROM configs').get()?.count || 0
    if (countConfigs === 0 && fs.existsSync(files.configs)) {
        const configsData = readJsonQuiet(files.configs, {})
        const entries = Object.entries(configsData)
        if (entries.length > 0) {
            const insertConfig = db.prepare(`INSERT OR REPLACE INTO configs (group_jid, antilink, settings) VALUES (?, ?, ?)`)
            for (const [groupJid, cfg] of entries) {
                insertConfig.run(groupJid, cfg.antilink ? 1 : 0, JSON.stringify(cfg))
            }
            logger.info(`✅ ${entries.length} configurações de grupos importadas!`)
        }
    }

    // 5. IMPORTAR CRAFTS
    const countCrafts = db.prepare('SELECT COUNT(*) as count FROM crafts').get()?.count || 0
    if (countCrafts === 0 && fs.existsSync(files.crafts)) {
        const craftsData = readJsonQuiet(files.crafts, {})
        const entries = Object.entries(craftsData)
        if (entries.length > 0) {
            const insertCraft = db.prepare(`INSERT OR IGNORE INTO crafts (jid, item_nome) VALUES (?, ?)`)
            for (const [jid, items] of entries) {
                if (Array.isArray(items)) {
                    for (const item of items) {
                        insertCraft.run(jid, item)
                    }
                }
            }
            logger.info(`✅ Registros de craft importados com sucesso!`)
        }
    }
}

module.exports = {
    importLegacyJsonData
}

