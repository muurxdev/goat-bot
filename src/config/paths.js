// Sem logger aqui: o próprio logger carrega este arquivo (dependência
// circular derrubava o healthcheck em 2026-09-21). Aviso vai para o console.
const path = require('path')
const fs = require('fs')

const rootDir = path.join(__dirname, '..', '..')
const dataDir = path.join(rootDir, 'data')
const tempDir = path.join(rootDir, 'temp')
const sessaoDir = path.join(rootDir, 'sessao')

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
}

const files = {
    xp: path.join(dataDir, 'xp.json'),
    guilds: path.join(dataDir, 'guilds.json'),
    boss: path.join(dataDir, 'boss.json'),
    missoes: path.join(dataDir, 'missoes.json'),
    warns: path.join(dataDir, 'warns.json'),
    configs: path.join(dataDir, 'configs.json'),
    crafts: path.join(dataDir, 'crafts.json'),
    database: path.join(dataDir, 'database.sqlite')
}

// Migração segura de arquivos JSON da raiz para data/
const legacyFiles = ['xp.json', 'boss.json', 'missoes.json', 'warns.json', 'configs.json', 'guilds.json', 'crafts.json']
for (const file of legacyFiles) {
    const rootPath = path.join(rootDir, file)
    const targetPath = path.join(dataDir, file)
    if (fs.existsSync(rootPath) && !fs.existsSync(targetPath)) {
        try {
            fs.copyFileSync(rootPath, targetPath)
        } catch (errIgnorado) { console.warn(`[PATHS] Falha ignorada em src/config/paths.js: ${errIgnorado.message}`) }
    }
}

module.exports = {
    rootDir,
    dataDir,
    tempDir,
    sessaoDir,
    files
}

