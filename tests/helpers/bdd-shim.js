/**
 * Executor mínimo no estilo Mocha (describe / it / before / after / beforeEach / afterEach).
 * Carregado por scripts/run-tests.js (-r) só nos arquivos que usam describe(.
 * Roda os blocos em ordem, aceita funções async, expõe this.timeout(ms),
 * imprime ✓/✗ por teste e sai com código 1 se algum teste ou hook falhar.
 */
const DEFAULT_TIMEOUT_MS = 20000

const raiz = { name: '', hooks: { before: [], after: [], beforeEach: [], afterEach: [] }, items: [] }
const pilha = [raiz]
const topo = () => pilha[pilha.length - 1]

global.describe = (nome, fn) => {
    const bloco = { name: nome, hooks: { before: [], after: [], beforeEach: [], afterEach: [] }, items: [] }
    topo().items.push(bloco)
    pilha.push(bloco)
    try { fn() } finally { pilha.pop() }
}
global.it = (nome, fn) => topo().items.push({ name: nome, fn })
global.it.skip = (nome) => topo().items.push({ name: nome, skip: true })
global.describe.skip = (nome) => topo().items.push({ name: nome, skip: true, group: true })
global.before = global.beforeAll = (fn) => topo().hooks.before.push(fn)
global.after = global.afterAll = (fn) => topo().hooks.after.push(fn)
global.beforeEach = (fn) => topo().hooks.beforeEach.push(fn)
global.afterEach = (fn) => topo().hooks.afterEach.push(fn)
global.test = global.it

function comTimeout(promessa, ms) {
    let timer
    const limite = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(`timeout de ${ms}ms`)), ms) })
    return Promise.race([promessa, limite]).finally(() => clearTimeout(timer))
}

async function executar(fn, ctx) {
    const r = fn.call(ctx)
    if (r && typeof r.then === 'function') await comTimeout(r, ctx.__timeout)
}

function nova() {
    return { timeout(ms) { this.__timeout = ms; return this }, __timeout: DEFAULT_TIMEOUT_MS }
}

const resultado = { ok: 0, falhas: 0 }
const linhas = []

function registrarFalha(caminho, erro) {
    resultado.falhas++
    const msg = erro && erro.message ? erro.message.split('\n')[0] : String(erro)
    linhas.push(`  ✗ ${caminho}: ${msg}`)
}

async function rodar(bloco, herdaAntes, herdaDepois, caminho) {
    const antes = [...herdaAntes, ...bloco.hooks.beforeEach]
    const depois = [...bloco.hooks.afterEach, ...herdaDepois]
    const caminhoBloco = bloco.name ? [...caminho, bloco.name] : caminho
    const rotulo = caminhoBloco.join(' > ')
    if (bloco.name) linhas.push(rotulo)

    try {
        for (const h of bloco.hooks.before) await executar(h, nova())
    } catch (e) {
        registrarFalha(`${rotulo} [before]`, e)
        return
    }

    for (const item of bloco.items) {
        if (item.skip) { linhas.push(`  - ${item.name} (pulado)`); continue }
        if (item.items) { await rodar(item, antes, depois, caminhoBloco); continue }

        const ctx = nova()
        const nome = `${rotulo} > ${item.name}`
        let falhou = false
        try {
            for (const h of antes) await executar(h, ctx)
            await executar(item.fn, ctx)
        } catch (e) {
            falhou = true
            registrarFalha(nome, e)
        }
        try {
            for (const h of depois) await executar(h, nova())
        } catch (e) {
            if (!falhou) { falhou = true; registrarFalha(`${nome} [afterEach]`, e) }
        }
        if (!falhou) {
            resultado.ok++
            linhas.push(`  ✓ ${item.name}`)
        }
    }

    try {
        for (const h of bloco.hooks.after) await executar(h, nova())
    } catch (e) {
        registrarFalha(`${rotulo} [after]`, e)
    }
}

setImmediate(async () => {
    for (const bloco of raiz.items) {
        if (bloco.items) await rodar(bloco, [], [], [])
        else if (bloco.skip) continue
        else {
            // it() solto fora de describe: roda como teste de topo
            const ctx = nova()
            try { await executar(bloco.fn, ctx); resultado.ok++; linhas.push(`  ✓ ${bloco.name}`) }
            catch (e) { registrarFalha(bloco.name, e) }
        }
    }
    console.log(linhas.join('\n'))
    console.log(`bdd-shim: ${resultado.ok} passaram, ${resultado.falhas} falharam`)
    if (resultado.falhas > 0) process.exitCode = 1
})
