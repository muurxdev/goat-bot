process.env.NODE_ENV = 'test'

/**
 * Testes da família CURIOSIDADES (.curio1 … .curio250).
 *
 * Três frentes:
 *
 *  (a) A TABELA — nenhuma ficha vazia, nenhuma repetida, todo número com data
 *      de referência declarada. É o teste que impede a família de virar lista
 *      de nome solto.
 *
 *  (b) A CONSULTA — item que existe, item que não existe, busca por parte do
 *      nome, acento e caixa alta. Acento é o caso que já quebrou texto neste
 *      projeto antes: quem digita no WhatsApp escreve "antartico", e a ficha
 *      se chama "Deserto Antártico".
 *
 *  (c) OS COMANDOS — os 250 carregados e executados com contexto falso, sem
 *      argumento e com argumento. Cada um precisa responder mais de 40
 *      caracteres, sem moldura desenhada e sem enchimento.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const C = require('../src/services/curiosityService')
const D = require('../src/services/curiosityData')
const F = require('../src/utils/formato')

const ALVO = 249 // 250 até 2026-10 (anime removido: subcategoria Mangá e anime saiu)
const PASTA = path.join(__dirname, '..', 'src', 'commands', 'curiosidades')
const MANIFESTO = path.join(__dirname, '..', 'scripts', 'manifests', 'curio_arquivos.json')

const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const { temTexto, molduraQuebrada, semTitulosDeMoldura } = require('./helpers/moldura')
const MARCADOR_DE_CODIGO = /\b(TODO|FIXME|XXX)\b/
const ENCHIMENTO = /(em breve|placeholder|lorem ipsum|texto de exemplo|indisponível no momento|conteúdo a definir)/i
const CHAVES_PERMITIDAS = new Set([
    'usage', 'examples', 'name', 'execute', 'aliases', 'category', 'subcategory',
    'description', 'cooldownMs', 'groupOnly', 'adminOnly', 'ownerOnly',
    'botAdminOnly', 'minRole', 'hidden', 'devOnly'
])

let pass = 0, fail = 0
const falhas = []
function test(nome, fn) {
    try { fn(); pass++ }
    catch (e) { fail++; falhas.push(`${nome}\n     ${e.message}`); console.log(`  ❌ FAIL: ${nome}\n     ${e.message}`) }
}

console.log('🧪 Testes da família curiosidades...\n')

// ─────────────────────────────────────────────────────────────────────────
// (a) A TABELA
// ─────────────────────────────────────────────────────────────────────────

test('a tabela passa no pente do próprio serviço', () => {
    const problemas = C.conferir()
    assert.strictEqual(problemas.length, 0, `${problemas.length} problema(s):\n     ${problemas.slice(0, 12).join('\n     ')}`)
})

test(`a tabela tem ${ALVO} assuntos, um por comando`, () => {
    const conta = C.contagem()
    assert.strictEqual(conta.temas, ALVO, `achei ${conta.temas} assuntos`)
    assert.ok(conta.fichas >= ALVO * 5, `só ${conta.fichas} fichas para ${conta.temas} assuntos`)
})

test('as seis subcategorias do menu estão todas povoadas', () => {
    const conta = C.contagem()
    for (const sub of C.SUBS) {
        assert.ok(conta.porSub[sub] > 0, `subcategoria "${sub}" ficou sem nenhum assunto`)
    }
    const soma = Object.values(conta.porSub).reduce((a, b) => a + b, 0)
    assert.strictEqual(soma, ALVO, `as subcategorias somam ${soma}, e a família é de ${ALVO}`)
})

test('nenhuma ficha está vazia: todo campo tem texto e todo fato tem conteúdo', () => {
    const vazias = []
    for (const tema of D.TEMAS) {
        for (const ficha of C.fichasDe(tema)) {
            if (!ficha.nome || !ficha.nome.trim()) vazias.push(`${tema.chave}.${ficha.chave}: sem nome`)
            if (!ficha.fato || ficha.fato.trim().length < 40) {
                vazias.push(`${tema.chave}.${ficha.chave}: fato com ${(ficha.fato || '').trim().length} caracteres`)
            }
            if (ficha.valores.length !== tema.campos.length) {
                vazias.push(`${tema.chave}.${ficha.chave}: ${ficha.valores.length} valores para ${tema.campos.length} campos`)
            }
            for (const v of ficha.valores) {
                if (!String(v.valor || '').trim()) vazias.push(`${tema.chave}.${ficha.chave}: campo "${v.rotulo}" vazio`)
            }
        }
    }
    assert.strictEqual(vazias.length, 0, `${vazias.length} ficha(s) com buraco:\n     ${vazias.slice(0, 10).join('\n     ')}`)
})

test('nenhuma ficha duplicada: nem nome repetido no assunto, nem fato repetido na família', () => {
    const repetidas = []
    const fatos = new Map()
    for (const tema of D.TEMAS) {
        const nomes = new Map()
        for (const ficha of C.fichasDe(tema)) {
            const n = C.norm(ficha.nome)
            if (nomes.has(n)) repetidas.push(`${tema.chave}: "${ficha.nome}" aparece duas vezes`)
            nomes.set(n, ficha.chave)

            const f = C.norm(ficha.fato)
            if (fatos.has(f)) repetidas.push(`fato repetido entre ${fatos.get(f)} e ${tema.chave}.${ficha.chave}`)
            fatos.set(f, `${tema.chave}.${ficha.chave}`)
        }
    }
    assert.strictEqual(repetidas.length, 0, `${repetidas.length} repetição(ões):\n     ${repetidas.slice(0, 10).join('\n     ')}`)
})

test('nenhum assunto repete o título de outro (a description sai dele)', () => {
    const vistos = new Map()
    const repetidos = []
    for (const tema of D.TEMAS) {
        const t = C.norm(tema.titulo)
        if (vistos.has(t)) repetidos.push(`${tema.chave} e ${vistos.get(t)}: "${tema.titulo}"`)
        vistos.set(t, tema.chave)
    }
    assert.strictEqual(repetidos.length, 0, repetidos.join(' | '))
})

test('todo assunto declara de quando é o dado', () => {
    const sem = D.TEMAS.filter(t => !t.fonte || !String(t.fonte).trim()).map(t => t.chave)
    assert.strictEqual(sem.length, 0, `sem fonte: ${sem.slice(0, 8).join(', ')}`)
    assert.ok(D.VIGENCIA_DADOS && D.VIGENCIA_DADOS.length > 10, 'VIGENCIA_DADOS não foi declarado')
})

test('a tabela não usa caractere de moldura nem marcador de código', () => {
    const texto = JSON.stringify(D.TEMAS)
    assert.ok(!CAIXA.test(texto), 'a tabela tem caractere de caixa desenhada')
    assert.ok(!MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(texto)), 'a tabela tem TODO, FIXME ou XXX em caixa alta')
    assert.ok(!ENCHIMENTO.test(texto), 'a tabela tem texto de enchimento')
})

// ─────────────────────────────────────────────────────────────────────────
// (b) A CONSULTA
// ─────────────────────────────────────────────────────────────────────────

test('item que existe: abre a ficha certa pelo nome e pela chave', () => {
    const r = C.consultar('desertos', 'saara')
    assert.ok(r && r.ficha, 'não achou o Saara em desertos')
    assert.strictEqual(r.ficha.nome, 'Saara')
    assert.strictEqual(r.exata, true, 'o nome inteiro tem que contar como acerto exato')
    assert.ok(r.ficha.fato.length > 40, 'a ficha veio sem fato')
    assert.ok(r.ficha.valores.length >= 2, 'a ficha veio sem campos')
})

test('item que não existe: devolve o assunto e nenhuma ficha, sem estourar', () => {
    const r = C.consultar('desertos', 'deserto de gelatina')
    assert.ok(r, 'devolveu nulo em vez do assunto')
    assert.strictEqual(r.ficha, null)
    assert.strictEqual(r.parecidos.length, 0)
    assert.ok(r.tema && r.tema.chave === 'desertos')
})

test('assunto que não existe: devolve nulo em vez de quebrar', () => {
    assert.strictEqual(C.consultar('assuntoquenaoexiste', 'saara'), null)
    assert.strictEqual(C.listar('assuntoquenaoexiste'), null)
    assert.deepStrictEqual(C.buscar('assuntoquenaoexiste', 'saara'), [])
})

test('busca por parte do nome traz mais de um resultado', () => {
    const achados = C.buscar('desertos', 'deserto')
    assert.ok(achados.length >= 2, `a busca parcial trouxe ${achados.length} resultado(s)`)
    assert.ok(achados.every(f => f && f.nome), 'veio resultado sem nome')
})

test('acento não atrapalha: "antartico" acha "Deserto Antártico"', () => {
    const semAcento = C.consultar('desertos', 'antartico')
    const comAcento = C.consultar('desertos', 'Antártico')
    assert.ok(semAcento.ficha, 'escrever sem acento tem que achar')
    assert.ok(comAcento.ficha, 'escrever com acento tem que achar')
    assert.strictEqual(semAcento.ficha.chave, comAcento.ficha.chave)
    assert.ok(semAcento.ficha.nome.includes('Antártico'), semAcento.ficha.nome)
})

test('maiúscula não atrapalha: SAARA, Saara e saara caem na mesma ficha', () => {
    const chaves = ['SAARA', 'Saara', 'saara', '  sAaRa  '].map(t => {
        const r = C.consultar('desertos', t)
        assert.ok(r.ficha, `"${t}" não achou nada`)
        return r.ficha.chave
    })
    assert.strictEqual(new Set(chaves).size, 1, `caíram em fichas diferentes: ${chaves.join(', ')}`)
})

test('toda ficha da família é achável pelo próprio nome e pela própria chave', () => {
    const perdidas = []
    for (const tema of D.TEMAS) {
        for (const ficha of C.fichasDe(tema)) {
            const porNome = C.consultar(tema.chave, ficha.nome)
            if (!porNome.ficha || porNome.ficha.chave !== ficha.chave) {
                perdidas.push(`${tema.chave}: "${ficha.nome}" não volta pelo nome`)
            }
            const porChave = C.consultar(tema.chave, ficha.chave)
            if (!porChave.ficha || porChave.ficha.chave !== ficha.chave) {
                perdidas.push(`${tema.chave}: "${ficha.chave}" não volta pela chave`)
            }
            const cru = C.norm(ficha.nome).toUpperCase()
            const porCru = C.consultar(tema.chave, cru)
            if (!porCru.ficha) perdidas.push(`${tema.chave}: "${cru}" (sem acento, em caixa alta) não volta`)
        }
    }
    assert.strictEqual(perdidas.length, 0, `${perdidas.length} ficha(s) inalcançáveis:\n     ${perdidas.slice(0, 10).join('\n     ')}`)
})

test('comparação põe as duas fichas lado a lado, campo por campo', () => {
    const r = C.comparar('desertos', 'saara', 'gobi')
    assert.ok(r && r.a && r.b, 'a comparação não achou as duas fichas')
    assert.strictEqual(r.a.nome, 'Saara')
    assert.strictEqual(r.b.nome, 'Gobi')
    assert.strictEqual(r.linhas.length, r.tema.campos.length, 'faltou campo na comparação')
    for (const l of r.linhas) {
        assert.ok(l.rotulo && l.a && l.b, `linha incompleta em "${l.rotulo}"`)
    }
})

test('comparação com um nome inventado não estoura: devolve o que achou', () => {
    const r = C.comparar('desertos', 'saara', 'deserto de gelatina')
    assert.ok(r, 'devolveu nulo')
    assert.ok(r.a, 'perdeu até o lado que existia')
    assert.strictEqual(r.b, null, 'o lado inventado tem que voltar nulo')
    assert.strictEqual(r.linhas.length, 0)
})

test('dois termos são separados por vírgula, por " e " ou por " x "', () => {
    assert.deepStrictEqual(C.doisTermos('saara, gobi'), ['saara', 'gobi'])
    assert.deepStrictEqual(C.doisTermos('saara e gobi'), ['saara', 'gobi'])
    assert.deepStrictEqual(C.doisTermos('saara x gobi'), ['saara', 'gobi'])
    assert.deepStrictEqual(C.doisTermos('saara gobi'), ['saara', 'gobi'])
    assert.deepStrictEqual(C.doisTermos(''), [])
})

test('listagem devolve todas as fichas do assunto', () => {
    const r = C.listar('desertos')
    assert.ok(r && r.fichas.length >= 5, 'a listagem veio curta')
    assert.strictEqual(r.fichas.length, Object.keys(r.tema.itens).length)
})

test('procura geral atravessa os assuntos todos', () => {
    const achados = C.procurar('saara')
    assert.ok(achados.length >= 1, 'a procura geral não achou o Saara')
    assert.deepStrictEqual(C.procurar(''), [], 'procura vazia tem que voltar vazia')
})

test('toda tela do serviço vira texto de verdade, com data de referência', () => {
    const problemas = []
    for (const tema of D.TEMAS) {
        const primeira = C.fichasDe(tema)[0]
        const casos = [
            [],
            ['lista'],
            [primeira.chave],
            ['buscar', primeira.nome.split(/\s+/)[0]],
            ['comparar', ...C.fichasDe(tema).slice(0, 2).map(f => f.chave)],
            ['coisa', 'que', 'nao', 'existe']
        ]
        for (const args of casos) {
            let texto
            try { texto = F.tela({ ...C.responder(tema.chave, { args, nome: 'curio0' }), prefix: '.' }) }
            catch (e) { problemas.push(`${tema.chave} [${args.join(' ')}]: estourou — ${e.message}`); continue }
            if (texto.trim().length <= 40) problemas.push(`${tema.chave} [${args.join(' ')}]: ${texto.trim().length} caracteres`)
            if (texto.length > 4096) problemas.push(`${tema.chave} [${args.join(' ')}]: ${texto.length} caracteres, passa do limite do WhatsApp`)
            if (molduraQuebrada(texto)) problemas.push(`${tema.chave} [${args.join(' ')}]: moldura quebrada`)
            if (MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(texto))) problemas.push(`${tema.chave} [${args.join(' ')}]: marcador de código na resposta`)
        }
        const ficha = F.tela({ ...C.responder(tema.chave, { args: [primeira.chave], nome: 'curio0' }), prefix: '.' })
        if (!ficha.includes(tema.fonte)) problemas.push(`${tema.chave}: a ficha não diz de quando é o dado`)
    }
    assert.strictEqual(problemas.length, 0, `${problemas.length} problema(s):\n     ${problemas.slice(0, 10).join('\n     ')}`)
})

// ─────────────────────────────────────────────────────────────────────────
// (c) OS COMANDOS
// ─────────────────────────────────────────────────────────────────────────

const arquivos = fs.existsSync(PASTA)
    ? fs.readdirSync(PASTA).filter(f => /^curio\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5), 10) - parseInt(b.slice(5), 10))
    : []

// Os números não são recompactados: curio231 (Mangá e anime) saiu e os demais mantêm o nome que os usuários conhecem.
test(`a pasta tem exatamente ${ALVO} comandos, os listados no manifesto (sem curio231)`, () => {
    assert.strictEqual(arquivos.length, ALVO, `achei ${arquivos.length} arquivo(s)`)
    const m = JSON.parse(fs.readFileSync(MANIFESTO, 'utf8'))
    for (const item of m.comandos) {
        assert.ok(arquivos.includes(`${item.nome}.js`), `faltou ${item.nome}.js`)
    }
    assert.ok(!arquivos.includes('curio231.js'), 'curio231 era o anime removido')
})

test('o manifesto do gerador bate com o que está no disco', () => {
    assert.ok(fs.existsSync(MANIFESTO), 'o manifesto não foi gravado')
    const m = JSON.parse(fs.readFileSync(MANIFESTO, 'utf8'))
    assert.strictEqual(m.total, ALVO)
    assert.strictEqual(m.comandos.length, arquivos.length)
    for (const item of m.comandos) {
        assert.ok(fs.existsSync(path.join(__dirname, '..', item.arquivo)), `faltou ${item.arquivo}`)
        assert.ok(C.temaDe(item.tema), `${item.nome} aponta para o assunto "${item.tema}", que não existe`)
    }
})

const comandos = arquivos.map(f => require(path.join(PASTA, f)))

test('todos seguem o schema, sem chave estranha e com apelidos válidos', () => {
    const problemas = []
    const nomes = new Set()
    const descricoes = new Map()
    for (const cmd of comandos) {
        for (const k of Object.keys(cmd)) if (!CHAVES_PERMITIDAS.has(k)) problemas.push(`${cmd.name}: chave "${k}" fora do schema`)
        if (!/^curio\d+$/.test(cmd.name || '')) problemas.push(`nome fora do padrão: ${cmd.name}`)
        if (nomes.has(cmd.name)) problemas.push(`nome repetido: ${cmd.name}`)
        nomes.add(cmd.name)
        // Apelidos vêm da expansão de 20.000 aliases (commit 165795de, 2026-10-25): lista de textos, sem repetir o nome.
        if (!Array.isArray(cmd.aliases) || cmd.aliases.some(a => typeof a !== 'string' || !a || a === cmd.name)) problemas.push(`${cmd.name}: aliases inválidos`)
        if (cmd.category !== 'curiosidades') problemas.push(`${cmd.name}: categoria "${cmd.category}"`)
        if (!C.SUBS.includes(cmd.subcategory)) problemas.push(`${cmd.name}: subcategoria "${cmd.subcategory}"`)
        if (cmd.cooldownMs !== 3000) problemas.push(`${cmd.name}: cooldown ${cmd.cooldownMs}`)
        if (typeof cmd.execute !== 'function') problemas.push(`${cmd.name}: sem execute`)
        if (!cmd.description) problemas.push(`${cmd.name}: sem description`)
        else if (cmd.description.length > 55) problemas.push(`${cmd.name}: description com ${cmd.description.length} caracteres`)
        else if (descricoes.has(cmd.description)) problemas.push(`${cmd.name} repete a description de ${descricoes.get(cmd.description)}`)
        if (cmd.description) descricoes.set(cmd.description, cmd.name)
    }
    assert.strictEqual(problemas.length, 0, `${problemas.length} problema(s):\n     ${problemas.slice(0, 10).join('\n     ')}`)
})

test('nenhum nome da família colide com comando de outra família', () => {
    const dispatcher = require('../src/handlers/commandDispatcher')
    dispatcher.loadCommands()
    const registro = dispatcher.getCommands()
    const fora = []
    for (const cmd of comandos) {
        const dono = registro.get(cmd.name)
        if (!dono) { fora.push(`${cmd.name} não entrou no registro`); continue }
        if (dono.category !== 'curiosidades') fora.push(`${cmd.name} foi tomado pela categoria ${dono.category}`)
    }
    assert.strictEqual(fora.length, 0, fora.slice(0, 8).join(' | '))
})

/** Contexto falso: o comando responde aqui em vez de falar com o WhatsApp. */
async function rodar(cmd, args) {
    const saidas = []
    await cmd.execute({
        reply: async t => { saidas.push(String(t ?? '')); return Promise.resolve() },
        args: args || [],
        prefix: '.',
        from: '120363000000000000@g.us',
        sender: '5511900000001@s.whatsapp.net',
        isGroup: true,
        info: {},
        client: {}
    })
    return { texto: saidas.join('\n'), vezes: saidas.length }
}

;(async () => {
    const problemas = []
    const manifesto = fs.existsSync(MANIFESTO) ? JSON.parse(fs.readFileSync(MANIFESTO, 'utf8')) : { comandos: [] }
    const temaPorNome = new Map(manifesto.comandos.map(c => [c.nome, c.tema]))

    for (const cmd of comandos) {
        // Sem argumento: a lista do que dá para consultar.
        let semArgs
        try { semArgs = await rodar(cmd, []) }
        catch (e) { problemas.push(`${cmd.name}: estourou sem argumento — ${e.message}`); continue }

        if (semArgs.vezes !== 1) problemas.push(`${cmd.name}: respondeu ${semArgs.vezes} vez(es) sem argumento`)
        const t = semArgs.texto
        if (t.trim().length <= 40) problemas.push(`${cmd.name}: resposta de ${t.trim().length} caracteres`)
        if (t.length > 4096) problemas.push(`${cmd.name}: resposta de ${t.length} caracteres passa do limite do WhatsApp`)
        if (molduraQuebrada(t)) problemas.push(`${cmd.name}: moldura quebrada`)
        if (MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(t))) problemas.push(`${cmd.name}: marcador de código na resposta`)
        if (ENCHIMENTO.test(t)) problemas.push(`${cmd.name}: enchimento na resposta`)
        if (!t.includes('*')) problemas.push(`${cmd.name}: resposta sem título formatado (não passou pelo F.tela)`)
        if (!t.includes('`.' + cmd.name)) problemas.push(`${cmd.name}: a lista não traz o exemplo pronto do próprio comando`)

        // Com argumento: a ficha de um item de verdade daquele assunto.
        const tema = C.temaDe(temaPorNome.get(cmd.name) || '')
        if (!tema) { problemas.push(`${cmd.name}: sem assunto no manifesto`); continue }
        const ficha = C.fichasDe(tema)[0]

        let comArgs
        try { comArgs = await rodar(cmd, [ficha.chave]) }
        catch (e) { problemas.push(`${cmd.name}: estourou com argumento — ${e.message}`); continue }
        const a = comArgs.texto
        if (a.trim().length <= 40) problemas.push(`${cmd.name}: ficha de ${a.trim().length} caracteres`)
        if (!temTexto(a, ficha.nome)) problemas.push(`${cmd.name}: a ficha pedida não veio na resposta`)
        if (!a.includes(tema.fonte)) problemas.push(`${cmd.name}: a ficha não diz de quando é o dado`)
        if (molduraQuebrada(a)) problemas.push(`${cmd.name}: ficha com moldura quebrada`)

        // Argumento sem resposta: não pode deixar a pessoa na mão.
        let vazio
        try { vazio = await rodar(cmd, ['zzz', 'nao', 'existe']) }
        catch (e) { problemas.push(`${cmd.name}: estourou com argumento inventado — ${e.message}`); continue }
        if (vazio.texto.trim().length <= 40) problemas.push(`${cmd.name}: sem resposta para argumento inventado`)
    }

    test(`os ${ALVO} comandos respondem conteúdo de verdade com contexto falso`, () => {
        assert.strictEqual(problemas.length, 0, `${problemas.length} problema(s):\n     ${problemas.slice(0, 12).join('\n     ')}`)
    })

    console.log('\n========================================')
    console.log(`📊 Curiosidades: ✅ ${pass} ❌ ${fail}`)
    console.log('========================================\n')
    if (fail > 0) {
        console.log('Falhas:')
        falhas.forEach(f => console.log('  • ' + f))
        process.exit(1)
    }
})()
