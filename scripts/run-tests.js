/**
 * Roda cada tests/*.test.js em processo próprio (NODE_ENV=test) e não para no primeiro erro.
 * Uso: node scripts/run-tests.js [filtro]   — sai com código 1 se algum arquivo falhar.
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const DIR = path.resolve(__dirname, '..', 'tests')
const filtro = process.argv[2] || ''
const arquivos = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.test.js') && f.includes(filtro))
    .sort()

const falhas = []
const inicio = Date.now()
for (const arquivo of arquivos) {
    const t0 = Date.now()
    // Arquivos no estilo Mocha (describe/it) recebem o executor compartilhado antes de rodar.
    const usaBdd = /\bdescribe\s*\(/.test(fs.readFileSync(path.join(DIR, arquivo), 'utf8'))
    const preload = usaBdd ? ['-r', path.join(DIR, 'helpers', 'bdd-shim.js')] : []
    const r = spawnSync(process.execPath, [...preload, path.join(DIR, arquivo)], {
        env: { ...process.env, NODE_ENV: 'test' },
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    })
    const seg = ((Date.now() - t0) / 1000).toFixed(1)
    const ok = r.status === 0
    if (!ok) falhas.push(arquivo)
    console.log(`${ok ? 'PASS' : 'FAIL'} ${arquivo} (${seg}s)`)
    if (!ok) {
        const saida = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n')
        console.log(saida.slice(-15).map((l) => `    ${l}`).join('\n'))
    }
}

const total = ((Date.now() - inicio) / 1000).toFixed(0)
console.log(`\n${arquivos.length - falhas.length}/${arquivos.length} arquivos passaram em ${total}s`)
if (falhas.length) {
    console.log('Falharam:\n  ' + falhas.join('\n  '))
    process.exit(1)
}
