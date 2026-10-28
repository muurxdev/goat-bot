/**
 * Detector de template literal quebrado por crase não escapada.
 *
 * Bug real encontrado em produção: dentro de um template literal, escreveram a
 * formatação de código do WhatsApp com crase, ex.:
 *
 *     reply(`Jogue na `.loteriasaga` para concorrer!`)
 *
 * A crase do meio FECHA o template; o resto vira acesso a propriedade
 * ("...".loteriasaga) e o comando quebra em runtime com "is not a function" ou
 * "X is not defined". O arquivo continua sintaticamente válido, então
 * `node --check` e o carregamento NÃO pegam — só explode quando o comando roda.
 *
 * Correção: escapar a crase interna (\` ) ou usar aspas simples na string externa.
 *
 * Uso: node scripts/check-template-literals.js [--fix]
 * Sai com código 1 se encontrar ocorrências (bom para CI).
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..', 'src')
const FIX = process.argv.includes('--fix')

/**
 * Varre o arquivo caractere a caractere rastreando o contexto (string simples,
 * dupla, template, comentário) para achar template literals fechados por engano.
 * @returns {Array<{line:number, trecho:string, idx:number}>}
 */
function encontrarQuebras(src) {
    const achados = []
    let i = 0
    const n = src.length
    let ctx = 'code' // code | sq | dq | tpl | line-comment | block-comment
    let tplStart = -1

    while (i < n) {
        const c = src[i]
        const c2 = src[i + 1]

        if (ctx === 'code') {
            if (c === '/' && c2 === '/') { ctx = 'line-comment'; i += 2; continue }
            if (c === '/' && c2 === '*') { ctx = 'block-comment'; i += 2; continue }
            if (c === "'") { ctx = 'sq'; i++; continue }
            if (c === '"') { ctx = 'dq'; i++; continue }
            if (c === '`') { ctx = 'tpl'; tplStart = i; i++; continue }
            i++; continue
        }
        if (ctx === 'line-comment') { if (c === '\n') ctx = 'code'; i++; continue }
        if (ctx === 'block-comment') { if (c === '*' && c2 === '/') { ctx = 'code'; i += 2; continue } i++; continue }
        if (ctx === 'sq' || ctx === 'dq') {
            if (c === '\\') { i += 2; continue }
            if ((ctx === 'sq' && c === "'") || (ctx === 'dq' && c === '"')) ctx = 'code'
            i++; continue
        }
        if (ctx === 'tpl') {
            if (c === '\\') { i += 2; continue }
            // ${ ... } — pula a expressão embutida (contagem simples de chaves)
            if (c === '$' && c2 === '{') {
                let depth = 1; i += 2
                while (i < n && depth > 0) {
                    if (src[i] === '{') depth++
                    else if (src[i] === '}') depth--
                    i++
                }
                continue
            }
            if (c === '`') {
                // Fechou o template. Se logo em seguida vem ".identificador",
                // quase certamente era pra ser uma crase escapada no meio do texto.
                // Só é BUG quando vem ".algo …" e depois OUTRA crase na mesma linha
                // (ou seja, formatação de código do WhatsApp que fechou o template).
                // `${x}`.trim() é legítimo e não casa, porque não há crase de fecho.
                const depois = src.slice(i + 1, i + 120)
                const m = depois.match(/^\.[A-Za-z_$][\w$]*[^`\n]*`/)
                if (m) {
                    const line = src.slice(0, i).split('\n').length
                    const trecho = src.slice(Math.max(tplStart, i - 45), i + 25).replace(/\n/g, ' ')
                    achados.push({ line, trecho: trecho.trim(), idx: i })
                }
                ctx = 'code'
            }
            i++; continue
        }
    }
    return achados
}

/** Escapa a crase problemática e a crase de fechamento correspondente. */
function corrigir(src, achados) {
    let out = src
    // Aplica de trás para frente para não invalidar os índices.
    for (const a of [...achados].sort((x, y) => y.idx - x.idx)) {
        const depois = out.slice(a.idx + 1)
        const m = depois.match(/^\.[A-Za-z_$][\w$]*[^`\n]*`/)
        if (!m) continue // padrão inesperado: não mexe
        const fim = a.idx + 1 + m[0].length // posição após a crase de fechamento
        const miolo = out.slice(a.idx, fim)     // `.comando`
        const corrigido = '\\`' + miolo.slice(1, -1) + '\\`'
        out = out.slice(0, a.idx) + corrigido + out.slice(fim)
    }
    return out
}

function varrer(dir, arquivos = []) {
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f)
        const st = fs.statSync(p)
        if (st.isDirectory()) varrer(p, arquivos)
        else if (f.endsWith('.js')) arquivos.push(p)
    }
    return arquivos
}

function main() {
    const arquivos = varrer(ROOT)
    let totalOcorrencias = 0
    let totalArquivos = 0
    const corrigidos = []

    for (const p of arquivos) {
        const src = fs.readFileSync(p, 'utf8')
        const achados = encontrarQuebras(src)
        if (!achados.length) continue
        totalArquivos++
        totalOcorrencias += achados.length
        const rel = path.relative(path.resolve(ROOT, '..', '..'), p).replace(/\\/g, '/')
        console.log(`\n❌ ${rel}`)
        for (const a of achados) console.log(`   linha ${a.line}: …${a.trecho}…`)

        if (FIX) {
            const novo = corrigir(src, achados)
            if (novo !== src) {
                fs.writeFileSync(p, novo)
                corrigidos.push(rel)
            }
        }
    }

    console.log(`\n${'─'.repeat(60)}`)
    if (totalOcorrencias === 0) {
        console.log('✅ Nenhum template literal quebrado por crase.')
        return
    }
    console.log(`⚠️  ${totalOcorrencias} ocorrência(s) em ${totalArquivos} arquivo(s).`)
    if (FIX) {
        console.log(`🔧 Corrigidos: ${corrigidos.length} arquivo(s).`)
        console.log('   Rode de novo sem --fix para confirmar.')
    } else {
        console.log('💡 Rode com --fix para escapar as crases automaticamente.')
        process.exitCode = 1
    }
}

main()
