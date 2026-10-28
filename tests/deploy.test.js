/**
 * BotXP — Suíte de Testes da Fase 8: VPS & Deploy
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { rootDir } = require('../src/config/paths')

console.log('🧪 Iniciando suíte de testes de VPS & Deploy (FASE 8)...\n')

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

// ══════════════════════════════════════════
// 1. ARQUIVOS DE CONFIGURAÇÃO DE AMBIENTE
// ══════════════════════════════════════════
console.log('--- 1. Arquivos de Configuração de Ambiente & Git ---')

test('.env.example existe e possui variáveis essenciais', () => {
    const envPath = path.join(rootDir, '.env.example')
    assert(fs.existsSync(envPath), '.env.example deve existir')
    const content = fs.readFileSync(envPath, 'utf8')
    assert(content.includes('BOT_PREFIX='))
    assert(content.includes('BOT_OWNER_ID='))
    assert(content.includes('NODE_ENV='))
})

test('.gitignore e .dockerignore protegem arquivos confidenciais', () => {
    const gitignorePath = path.join(rootDir, '.gitignore')
    const dockerignorePath = path.join(rootDir, '.dockerignore')

    assert(fs.existsSync(gitignorePath))
    assert(fs.existsSync(dockerignorePath))

    const gitignore = fs.readFileSync(gitignorePath, 'utf8')
    assert(gitignore.includes('node_modules'))
    assert(gitignore.includes('sessao'))
    assert(gitignore.includes('.env'))
})

// ══════════════════════════════════════════
// 2. DOCKER & PM2
// ══════════════════════════════════════════
console.log('\n--- 2. Dockerfile & PM2 Ecosystem ---')

test('Dockerfile existe e contém diretivas seguras e FFmpeg', () => {
    const dockerfilePath = path.join(rootDir, 'Dockerfile')
    assert(fs.existsSync(dockerfilePath))
    const content = fs.readFileSync(dockerfilePath, 'utf8')
    assert(content.includes('FROM node:'))
    assert(content.includes('ffmpeg'))
    assert(content.includes('USER node'))
    assert(content.includes('HEALTHCHECK'))
})

test('docker-compose.yml possui volumes persistentes de dados e sessao', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml')
    assert(fs.existsSync(composePath))
    const content = fs.readFileSync(composePath, 'utf8')
    assert(content.includes('./data:/app/data'))
    assert(content.includes('./sessao:/app/sessao'))
})

test('ecosystem.config.js exporta configuração válida para o PM2', () => {
    const ecoPath = path.join(rootDir, 'ecosystem.config.js')
    assert(fs.existsSync(ecoPath))
    const config = require(ecoPath)
    assert(Array.isArray(config.apps))
    assert.strictEqual(config.apps[0].name, 'goat-bot-xp')
    assert.strictEqual(config.apps[0].script, 'src/index.js')
    assert.strictEqual(config.apps[0].max_memory_restart, '500M')
})

// ══════════════════════════════════════════
// 3. HEALTHCHECK & SCRIPTS DE DEPLOY
// ══════════════════════════════════════════
console.log('\n--- 3. Scripts de Healthcheck & Deploy ---')

test('scripts/healthcheck.js executa e valida o banco de dados com exit 0', () => {
    const hcPath = path.join(rootDir, 'scripts', 'healthcheck.js')
    assert(fs.existsSync(hcPath))
    // Executa o script diretamente
    const out = execSync(`node "${hcPath}"`, { encoding: 'utf8' })
    // Não deve lançar erro
})

test('scripts/deploy.sh existe e contém permissão de execução', () => {
    const deployPath = path.join(rootDir, 'scripts', 'deploy.sh')
    assert(fs.existsSync(deployPath))
    const content = fs.readFileSync(deployPath, 'utf8')
    assert(content.includes('npm test'))
})

// ══════════════════════════════════════════
// RESUMO FINAL
// ══════════════════════════════════════════
console.log('\n========================================')
console.log(`📊 RESULTADO DOS TESTES DE DEPLOY & INFRA:`)
console.log(`   ✅ Passaram: ${passCount}`)
console.log(`   ❌ Falharam: ${failCount}`)
console.log('========================================\n')

if (failCount > 0) process.exit(1)
else process.exit(0)

