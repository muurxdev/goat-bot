/**
 * Testes do tradutor de jargão (config/lore + services/loreService).
 * Desde 2026-09-15 o destino é português simples, não termo de fantasia.
 *
 * O que precisa continuar verdadeiro:
 *  - Jargão técnico não chega ao usuário.
 *  - Blocos de código, URLs e nomes de comando saem intactos — traduzir esses
 *    quebraria o conteúdo em vez de melhorá-lo.
 *  - O português continua concordando: artigo, gênero e número.
 *  - Nenhuma troca aparece repetida lado a lado.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const { traduzir, traduzirSeguro, traduzirConteudo, semLore, estaIsento } = require('../src/services/loreService')
const { GLOSSARIO, PATENTES, RANKS, resolverEscala } = require('../src/config/lore')

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes do tradutor de jargão...\n')

// Termos que jamais podem sobrar num texto traduzido.
const JARGAO = /\b(SQL|SQLite|JSON|NodeJS|JavaScript|undefined|NaN|buffer|servidor|VPS|Docker|deploy|backend|endpoint|timeout|regex|payload|stacktrace|webhook|uptime|heap)\b/i

test('jargão técnico não sobrevive à tradução', () => {
    const entradas = [
        'Erro ao consultar o banco de dados SQLite',
        'O servidor VPS respondeu com timeout',
        'Falha na API ao processar JSON',
        'Deploy no Docker concluído, uptime do servidor estável',
        'Valor undefined e saldo NaN'
    ]
    for (const e of entradas) {
        const saida = traduzir(e)
        assert.ok(!JARGAO.test(saida), `sobrou jargão em "${saida}"`)
    }
})

test('artigo concorda em gênero com a troca', () => {
    assert.ok(traduzir('o cache foi limpo').startsWith('o arquivo temporário'), traduzir('o cache foi limpo'))
    assert.ok(traduzir('a API respondeu').startsWith('a integração'), traduzir('a API respondeu'))
    assert.ok(traduzir('Falha na API').includes('na integração'), traduzir('Falha na API'))
    assert.ok(traduzir('o servidor caiu').startsWith('o sistema'), traduzir('o servidor caiu'))
})

test('plural do termo técnico vira plural da troca', () => {
    assert.ok(traduzir('3 backups criados').includes('salvamentos'), traduzir('3 backups criados'))
    assert.ok(traduzir('2 containers ativos').includes('sistemas'), traduzir('2 containers ativos'))
    assert.ok(traduzir('as queries falharam').includes('consultas'), traduzir('as queries falharam'))
})

test('termos repetidos lado a lado são colapsados', () => {
    // "banco de dados SQLite" viraria "registro registro" sem o colapso.
    const a = traduzir('consulta ao banco de dados SQLite')
    assert.ok(!/registro\s+registro/i.test(a), a)
    const b = traduzir('o servidor VPS está no ar')
    assert.ok(!/sistema\s+sistema/i.test(b), b)
})

test('bloco de código sai intacto', () => {
    const entrada = '```sql\nSELECT * FROM users\n```'
    assert.strictEqual(traduzir(entrada), entrada)
})

test('código em linha sai intacto', () => {
    const saida = traduzir('Use `SELECT * FROM users` para isso')
    assert.ok(saida.includes('`SELECT * FROM users`'), saida)
})

test('URL sai intacta', () => {
    const url = 'https://api.github.com/repos/node/json'
    assert.ok(traduzir(`Veja em ${url} agora`).includes(url))
})

test('nome de comando sai intacto', () => {
    for (const cmd of ['.sqlformatter', '.jsonfmt', '.httpstatus']) {
        assert.ok(traduzir(`Use ${cmd} para isso`).includes(cmd), `${cmd} foi traduzido`)
    }
})

test('texto sem jargão não é alterado', () => {
    const limpo = '⚔️ Você derrotou o Cavaleiro Sagrado e ganhou 500 moedas!'
    assert.strictEqual(traduzir(limpo), limpo)
})

test('tradução é estável ao ser aplicada duas vezes', () => {
    // O reply pode passar por aqui mais de uma vez em caminhos com reenvio; a
    // segunda passada não pode traduzir o que já foi traduzido.
    const uma = traduzir('o cache do servidor falhou')
    assert.strictEqual(traduzir(uma), uma)
})

test('entradas não-string atravessam sem quebrar', () => {
    for (const v of [null, undefined, 0, 42, {}, []]) {
        assert.doesNotThrow(() => traduzir(v))
    }
})

test('termos técnicos diferentes não viram a mesma palavra repetida', () => {
    // O .status mostrava "SISTEMA & SISTEMA" (de "SERVIDOR & VPS") e
    // "Linguagem: sistema" (de "Node.js").
    const titulo = traduzir('╭━〔 ⚙️ SERVIDOR & VPS 〕━⬣')
    assert.ok(!/SISTEMA\s*&\s*SISTEMA/.test(titulo), titulo)
    assert.ok(titulo.includes('SISTEMA 〕'), titulo)
    const linguagem = traduzir('Linguagem: Node.js (v24)')
    assert.ok(!/sistema/i.test(linguagem) && linguagem.includes('motor do bot'), linguagem)
    assert.strictEqual(traduzir('Deploy no Docker'), 'envio de atualização no ambiente do bot')
})

test('"SQLite WAL" vira só "registro", sem sobra técnica', () => {
    assert.strictEqual(traduzir('guardado em SQLite WAL'), 'guardado em registro')
})

test('"e" e vírgula não juntam termos: juntar quebraria a concordância', () => {
    const t = traduzir('servidor e VPS reiniciados')
    assert.ok(!/^sistema reiniciados$/.test(t), t)
    assert.strictEqual((traduzir('cache, cache e cache').match(/arquivo temporário/g) || []).length, 3)
})

test('regex global não perde ocorrências entre chamadas', () => {
    // lastIndex de regex /g persiste; sem zerar, a 2ª chamada pulava trechos.
    const frase = 'cache e cache e cache'
    const esperado = traduzir(frase)
    for (let i = 0; i < 5; i++) assert.strictEqual(traduzir(frase), esperado)
    assert.strictEqual((esperado.match(/arquivo temporário/g) || []).length, 3, esperado)
})

test('traduzirSeguro devolve o original se a tradução falhar', () => {
    const original = { toString() { throw new Error('boom') } }
    assert.doesNotThrow(() => traduzirSeguro(original))
})

test('nenhuma patente ou rank carrega jargão de tecnologia', () => {
    const PROIBIDO = /\b(dev|engineer|CTO|tech|software|computação|junior|pleno|senior|pro)\b/i
    for (const lvl of [0, 5, 15, 25, 35, 45, 60, 80, 110, 160, 250, 350, 600, 1200]) {
        for (const escala of [PATENTES, RANKS]) {
            const nome = resolverEscala(escala, lvl)
            assert.ok(!PROIBIDO.test(nome), `nível ${lvl}: "${nome}"`)
        }
    }
})

test('glossário não tem regra que se traduza a si mesma', () => {
    // Uma troca cujo resultado casa com a própria regra causaria substituição
    // instável entre chamadas.
    for (const [regex, troca] of GLOSSARIO) {
        regex.lastIndex = 0
        assert.ok(!regex.test(String(troca)), `regra ${regex} reescreve o próprio resultado "${troca}"`)
    }
})



test('sigla em qualquer caixa é traduzida', () => {
    // "SQLITE" e "NULL" em caixa alta escapavam quando a regra era sensível a caixa.
    assert.ok(!/SQLITE/i.test(traduzir('histórico SQLITE')), traduzir('histórico SQLITE'))
    assert.ok(!/NULL/i.test(traduzir('valor NULL')), traduzir('valor NULL'))
    assert.ok(!/json/i.test(traduzir('json invalido')), traduzir('json invalido'))
})

test('cabeçalho em caixa alta mantém o termo em caixa alta', () => {
    assert.ok(traduzir('📊 STATUS DO SERVIDOR').includes('SISTEMA'), traduzir('📊 STATUS DO SERVIDOR'))
})

test('sigla em frase normal NÃO vira caixa alta', () => {
    // Siglas são maiúsculas por natureza; decidir pela palavra isolada faria
    // "use isso no SQL" virar "no REGISTRO".
    const saida = traduzir('Use SELECT no SQL para isso')
    assert.ok(saida.includes('no registro'), saida)
    assert.ok(!saida.includes('REGISTRO'), saida)
})

test('termo repetido entre parênteses é colapsado', () => {
    const saida = traduzir('💾 Banco de Dados (SQLITE): 4 MB')
    assert.ok(!/registro\s*[([]/i.test(saida), saida)
    assert.ok(/registro/i.test(saida), saida)
})



test('palavra acentuada não é partida ao meio', () => {
    // `\b` do JavaScript é ASCII: em "Análise" ele vê borda entre "n" e "á", e
    // a regra de "NaN" casava ali dentro, gerando "incalculávelálise". As
    // bordas do glossário são Unicode justamente por causa disso.
    const intocadas = ['Análise de dados', 'Apiário de abelhas', 'banana e nanico',
                       'Ramo de flores', 'cachê do artista', 'Sanção aplicada']
    for (const t of intocadas) {
        assert.strictEqual(traduzir(t), t, `"${t}" foi alterado indevidamente`)
    }
})

test('borda Unicode não impede a tradução legítima', () => {
    assert.ok(traduzir('erro de API').includes('integração'))
    assert.ok(traduzir('valor NaN').includes('incalculável'))
    assert.ok(traduzir('o cache caiu').includes('arquivo temporário'))
})


// ══════════════════════════════════════════════════════════════
// PONTO DE SAÍDA (client.sendMessage) E ISENÇÃO
// ══════════════════════════════════════════════════════════════

test('traduz apenas text e caption, deixando o resto do envelope intacto', () => {
    const conteudo = { image: { url: 'x' }, caption: 'JSON gerado', mimetype: 'image/png' }
    const saida = traduzirConteudo(conteudo)
    assert.ok(saida.caption.includes('arquivo de dados'), saida.caption)
    assert.deepStrictEqual(saida.image, conteudo.image)
    assert.strictEqual(saida.mimetype, 'image/png')
})

test('reação não é traduzida', () => {
    // O `text` da reação é um emoji e vive aninhado; tocar nele quebraria a
    // reação de ciclo dos comandos.
    const react = { react: { text: '✅', key: {} } }
    assert.strictEqual(traduzirConteudo(react), react)
})

test('semLore desliga a tradução dentro do bloco', () => {
    assert.ok(traduzirConteudo({ text: 'SQL' }).text !== 'SQL')
    semLore(() => {
        assert.strictEqual(estaIsento(), true)
        assert.strictEqual(traduzirConteudo({ text: 'SQL' }).text, 'SQL')
    })
    assert.strictEqual(estaIsento(), false)
})

async function testeIsolamento() {
    // Dois comandos no ar ao mesmo tempo: um isento (categoria dev) e um comum.
    // Com uma flag de módulo em vez de AsyncLocalStorage, o comum herdaria a
    // isenção do dev e mostraria jargão ao usuário.
    const espera = (ms) => new Promise(r => setTimeout(r, ms))
    let textoDev = null, textoComum = null

    const dev = semLore(async () => {
        await espera(30)
        textoDev = traduzirConteudo({ text: 'SQL e JSON' }).text
    })
    const comum = (async () => {
        await espera(5)
        textoComum = traduzirConteudo({ text: 'SQL e JSON' }).text
    })()

    await Promise.all([dev, comum])

    try {
        assert.strictEqual(textoDev, 'SQL e JSON')
        assert.ok(/registro/i.test(textoComum), `comando comum herdou a isenção: "${textoComum}"`)
        console.log('  ✅ PASS: isenção não vaza entre comandos simultâneos')
        pass++
    } catch (e) {
        console.log('  ❌ FAIL: isenção não vaza entre comandos simultâneos\n     ' + e.message)
        fail++
    }
}

// Palavras do glossário que também são português corrente. O sentido técnico
// deve traduzir; o sentido comum, não. Já quebrou de verdade: "processo
// seletivo" virou "Ritual seletivo" e "servidor público" virou
// "Castelo Central público" em fichas de vida prática e finanças (quando o
// destino ainda era fantasia; a proteção continua valendo).
test('sentido comum de palavra técnica não é traduzido', () => {
    const intocaveis = [
        'Processo seletivo sério não cobra do candidato',
        'de 2 a 6 meses no processo completo',
        'Servidor público tem estabilidade',
        'servidores públicos e servidoras públicas',
        'O módulo lunar pousou no mar da Tranquilidade',
        'memória afetiva e memória muscular',
        'padrão de qualidade e padrão ouro',
        'por padrão, o comando responde no grupo'
    ]
    for (const frase of intocaveis) {
        assert.strictEqual(traduzir(frase), frase, `traduziu sentido comum: "${traduzir(frase)}"`)
    }
})

test('sentido técnico continua traduzindo', () => {
    const casos = [
        ['o servidor caiu de novo', /o sistema caiu/i],
        ['reinicie o processo node', /tarefa do bot/i],
        ['matando processos do sistema', /tarefas do sistema/i],
        ['memória RAM em 90%', /^memória em 90%$/i],
        ['reinicie o módulo de download', /recurso de download/i]
    ]
    for (const [entrada, esperado] of casos) {
        const saida = traduzir(entrada)
        assert.ok(esperado.test(saida), `não traduziu o sentido técnico: "${saida}"`)
    }
})

testeIsolamento().then(() => {
console.log('\n========================================')
console.log(`📊 RESULTADO — Lore: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})
