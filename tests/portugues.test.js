process.env.NODE_ENV = 'test'

/**
 * Testes da família PORTUGUÊS, REDAÇÃO E LITERATURA (.port1 … .port150).
 *
 * Duas frentes:
 *
 *  (a) O SERVIÇO — cada análise conferida com caso escrito à mão. O foco é o
 *      acento: /\b/ de regex trata "ç" e "é" como limite de palavra, e isso já
 *      mordeu este projeto. Por isso quase todo caso aqui tem acento dentro.
 *      Também entram verbo irregular, entrada vazia e entrada sem sentido, que
 *      são os três jeitos de o comando explodir na mão de quem usa.
 *
 *  (b) OS COMANDOS — os 150 são carregados e executados com um contexto falso.
 *      Cada um precisa responder algo de verdade: mais de 40 caracteres, sem
 *      caractere de moldura e sem enchimento. E cada um precisa responder
 *      também quando a pessoa não digita nada, com a tela de como usar.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const aula = require('../src/services/portugueseService')
const F = require('../src/utils/formato')

const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const { molduraQuebrada, semTitulosDeMoldura } = require('./helpers/moldura')
const ENCHIMENTO = [/em breve/i, /placeholder/i, /lorem/i, /\bTODO\b/, /conteúdo a definir/i]
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

console.log('🧪 Testes da família português, redação e literatura...\n')

// ─────────────────────────────────────────────────────────────────────────
// (a) SERVIÇO
// ─────────────────────────────────────────────────────────────────────────

test('separação de sílabas com acento, dígrafo e encontro consonantal', () => {
    const casos = [
        ['casa', 'ca-sa'],
        ['coração', 'co-ra-ção'],
        ['saída', 'sa-í-da'],
        ['país', 'pa-ís'],
        ['história', 'his-tó-ria'],
        ['energia', 'e-ner-gi-a'],
        ['ciência', 'ci-ên-cia'],
        ['abstrato', 'abs-tra-to'],
        ['carro', 'car-ro'],
        ['nascer', 'nas-cer'],
        ['guerra', 'guer-ra'],
        ['chocolate', 'cho-co-la-te'],
        ['transporte', 'trans-por-te'],
        ['água', 'á-gua'],
        ['psicólogo', 'psi-có-lo-go']
    ]
    for (const [palavra, esperado] of casos) {
        assert.strictEqual(aula.silabasDe(palavra).join('-'), esperado, `${palavra} deveria virar ${esperado}`)
    }
})

test('sílaba tônica e classificação respeitam o acento gráfico', () => {
    const casos = [
        ['médico', 'proparoxítona', 'mé'],
        ['casa', 'paroxítona', 'ca'],
        ['café', 'oxítona', 'fé'],
        ['urubu', 'oxítona', 'bu'],
        ['lápis', 'paroxítona', 'lá'],
        ['amanhã', 'oxítona', 'nhã'],
        ['pé', 'monossílabo', 'pé']
    ]
    for (const [palavra, classe, tonica] of casos) {
        const c = aula.classificarTonica(palavra)
        assert.strictEqual(c.classe, classe, `${palavra} deveria ser ${classe}, veio ${c.classe}`)
        assert.strictEqual(c.tonica, tonica, `${palavra}: tônica deveria ser ${tonica}, veio ${c.tonica}`)
    }
})

test('regra de acentuação explica o caso certo', () => {
    const facil = aula.regraDeAcento('fácil')
    assert.ok(facil.regras.join(' ').includes('Paroxítona'), 'fácil é paroxítona acentuada')
    const saida = aula.regraDeAcento('saída')
    assert.ok(saida.regras.some(r => r.includes('hiato')), 'saída precisa citar a regra do hiato')
    const casa = aula.regraDeAcento('casa')
    assert.strictEqual(casa.temAcento, false)
})

test('encontros vocálicos separam ditongo de hiato', () => {
    const saudade = aula.encontrosVocalicos('saudade')
    assert.ok(saudade.achados.some(a => a.letras === 'au' && a.tipo.startsWith('ditongo')), 'au é ditongo')
    const saida = aula.encontrosVocalicos('saída')
    assert.ok(saida.achados.some(a => a.tipo === 'hiato'), 'saída tem hiato')
})

test('plural segue a regra, inclusive nos casos com acento', () => {
    const casos = [
        ['casa', 'casas'], ['pão', 'pães'], ['irmão', 'irmãos'], ['coração', 'corações'],
        ['homem', 'homens'], ['animal', 'animais'], ['papel', 'papéis'], ['farol', 'faróis'],
        ['fóssil', 'fósseis'], ['funil', 'funis'], ['luz', 'luzes'], ['país', 'países'],
        ['hífen', 'hifens'], ['mal', 'males']
    ]
    for (const [singular, plural] of casos) {
        assert.strictEqual(aula.pluralDe(singular).plural, plural, `plural de ${singular}`)
    }
    assert.strictEqual(aula.pluralDe('lápis').plural, 'lápis (não muda)')
    assert.strictEqual(aula.pluralComposto('couve-flor').plural, 'couves-flores')
    assert.strictEqual(aula.pluralComposto('guarda-chuva').plural, 'guarda-chuvas')
})

test('feminino, masculino, diminutivo e aumentativo', () => {
    assert.strictEqual(aula.femininoDe('ator').feminino, 'atriz')
    assert.strictEqual(aula.femininoDe('menino').feminino, 'menina')
    assert.strictEqual(aula.femininoDe('português').feminino, 'portuguesa')
    assert.strictEqual(aula.masculinoDe('atriz').masculino, 'ator')
    assert.strictEqual(aula.masculinoDe('madrinha').masculino, 'padrinho')
    // café termina em vogal tônica: entra o Z e o acento cai
    assert.strictEqual(aula.diminutivoDe('café').forma, 'cafezinho')
    assert.strictEqual(aula.aumentativoDe('café').forma, 'cafezão')
    assert.strictEqual(aula.diminutivoDe('livro').forma.startsWith('livrinho'), true)
    assert.strictEqual(aula.aumentativoDe('casa').forma, 'casarão')
})

test('graus do adjetivo, inclusive os irregulares', () => {
    const bom = aula.grausDe('bom')
    assert.ok(bom.superioridade.includes('melhor'), 'bom faz melhor')
    const facil = aula.grausDe('fácil')
    assert.strictEqual(facil.absolutoSintetico, 'facílimo')
})

test('conjugação regular das três conjugações, com ajuste ortográfico', () => {
    const cantar = aula.conjugar('cantar')
    assert.deepStrictEqual(cantar.presente, ['canto', 'cantas', 'canta', 'cantamos', 'cantais', 'cantam'])
    assert.strictEqual(cantar.irregular, false)
    const vender = aula.conjugar('vender')
    assert.strictEqual(vender.perfeito[2], 'vendeu')
    const partir = aula.conjugar('partir')
    assert.strictEqual(partir.presente[3], 'partimos')
    // ficar/pagar/começar/conhecer/dirigir só ficam certos com o ajuste ortográfico
    assert.strictEqual(aula.conjugar('ficar').subjPresente[0], 'fique')
    assert.strictEqual(aula.conjugar('pagar').subjPresente[0], 'pague')
    assert.strictEqual(aula.conjugar('começar').subjPresente[0], 'comece')
    assert.strictEqual(aula.conjugar('conhecer').presente[0], 'conheço')
    assert.strictEqual(aula.conjugar('dirigir').presente[0], 'dirijo')
})

test('conjugação dos irregulares sai da tabela conferida', () => {
    const ser = aula.conjugar('ser')
    assert.strictEqual(ser.irregular, true)
    assert.deepStrictEqual(ser.presente, ['sou', 'és', 'é', 'somos', 'sois', 'são'])
    assert.deepStrictEqual(ser.perfeito.slice(0, 3), ['fui', 'foste', 'foi'])
    const por = aula.conjugar('pôr')
    assert.strictEqual(por.presente[2], 'põe')
    assert.strictEqual(por.participio, 'posto')
    assert.strictEqual(aula.conjugar('por').verbo, 'pôr', 'por sem acento também chega em pôr')
    assert.strictEqual(aula.conjugar('fazer').perfeito[0], 'fiz')
    assert.strictEqual(aula.conjugar('trazer').perfeito[0], 'trouxe')
    assert.strictEqual(aula.conjugar('ver').futuroPresente[0], 'verei')
    assert.strictEqual(aula.conjugar('ter').presente[5], 'têm')
    assert.strictEqual(aula.conjugar('poder').perfeito[2], 'pôde')
    assert.strictEqual(aula.tipoDeVerbo('ser').situacao, 'irregular')
    assert.strictEqual(aula.tipoDeVerbo('cantar').situacao, 'regular')
})

test('conjugar recusa o que não é verbo, sem explodir', () => {
    assert.strictEqual(aula.conjugar('xyz').erro, 'naoInfinitivo')
    assert.strictEqual(aula.conjugar(''), null)
    assert.strictEqual(aula.conjugar('   '), null)
    assert.strictEqual(aula.conjugar('cadeira').erro, 'naoInfinitivo')
})

test('classes de palavras leem o vizinho antes de decidir', () => {
    const t = aula.classesDaFrase('O menino comeu o bolo')
    assert.deepStrictEqual(t.map(x => x.classe), ['artigo', 'substantivo', 'verbo', 'artigo', 'substantivo'])
    // "Maria" termina em -ria e não pode virar verbo por causa disso
    const m = aula.classesDaFrase('Maria comprou um carro novo')
    assert.strictEqual(m[0].classe, 'substantivo', 'Maria não é verbo')
    assert.strictEqual(m[1].classe, 'verbo')
    // "gosto" só é verbo por causa do vizinho
    const g = aula.classesDaFrase('Eu não gosto de café')
    assert.strictEqual(g[2].classe, 'verbo')
})

test('análise sintática separa sujeito, predicado e complemento', () => {
    const a = aula.analiseSintatica('O menino comeu o bolo')
    assert.strictEqual(a.sujeito, 'O menino')
    assert.strictEqual(a.nucleoSujeito, 'menino')
    assert.ok(a.tipoPredicado.includes('verbal'))
    assert.ok(a.termos.join(' ').includes('Objeto direto'))
    const b = aula.analiseSintatica('Os alunos estão felizes')
    assert.ok(b.tipoPredicado.includes('nominal'), 'verbo de ligação faz predicado nominal')
    const c = aula.analiseSintatica('Choveu muito ontem')
    assert.ok(c.tipoSujeito.includes('sem sujeito'))
    const d = aula.analiseSintatica('Muito obrigado')
    assert.strictEqual(d.erro, 'semVerbo')
})

test('voz passiva concorda o particípio e contrai a preposição', () => {
    const a = aula.paraVozPassiva('O menino comeu o bolo')
    assert.strictEqual(a.passiva, 'O bolo foi comido pelo menino.')
    const b = aula.paraVozPassiva('A professora corrigiu as provas')
    assert.strictEqual(b.passiva, 'As provas foram corrigidas pela professora.')
    const c = aula.paraVozPassiva('Os alunos estão felizes')
    assert.strictEqual(c.erro, 'ligacao')
    const d = aula.paraVozPassiva('Choveu muito ontem')
    assert.strictEqual(d.erro, 'impessoal')
})

test('crase: caso com acento, caso com verbo e locução', () => {
    const escola = aula.analisarCrase('Vou à escola amanhã')
    assert.ok(escola.casos.some(c => c.veredito === 'tem crase'), 'à escola tem crase')
    const verbo = aula.analisarCrase('Voltei a estudar')
    assert.ok(verbo.casos.some(c => c.veredito === 'não tem crase' && c.porque.includes('verbo')))
    const locucao = aula.analisarCrase('Chego sempre as vezes atrasado')
    assert.ok(locucao.casos.some(c => c.trecho === 'às vezes'), 'a locução tem de ser reconhecida mesmo sem o acento')
    // a locução não pode ser analisada duas vezes com vereditos diferentes
    const dentro = locucao.casos.filter(c => c.trecho.startsWith('as vezes') || c.trecho.startsWith('às vezes'))
    assert.strictEqual(dentro.length, 1, 'a locução aparece uma vez só')
    assert.deepStrictEqual(aula.analisarCrase('').casos, [])
})

test('porquê: as quatro formas julgadas na frase', () => {
    const p1 = aula.analisarPorque('Por que você saiu?')
    assert.strictEqual(p1.casos[0].certo, true)
    const p2 = aula.analisarPorque('Você saiu por que?')
    assert.strictEqual(p2.casos[0].certo, false)
    assert.strictEqual(p2.casos[0].deveriaSer, 'por quê')
    const p3 = aula.analisarPorque('Não fui porque estava doente')
    assert.strictEqual(p3.casos[0].certo, true)
    const p4 = aula.analisarPorque('Ninguém sabe o porquê')
    assert.strictEqual(p4.casos[0].certo, true)
    assert.strictEqual(aula.analisarPorque('frase sem nada disso').casos.length, 0)
})

test('pares que confundem julgam a frase da pessoa', () => {
    const mau = aula.analisarPar('maumal', 'Ele é um mau aluno')
    assert.strictEqual(mau.casos[0].ok, true)
    const mal = aula.analisarPar('maumal', 'Dormi mal ontem')
    assert.strictEqual(mal.casos[0].ok, true)
    const mim = aula.analisarPar('mimeu', 'Este bolo é para mim comer')
    assert.strictEqual(mim.casos[0].ok, false, '"para mim comer" está errado')
    const onde = aula.analisarPar('ondeaonde', 'Aonde você mora?')
    assert.strictEqual(onde.casos[0].ok, false, 'morar é verbo de permanência')
    const aonde = aula.analisarPar('ondeaonde', 'Aonde você vai?')
    assert.strictEqual(aonde.casos[0].ok, true)
    const ha = aula.analisarPar('haa', 'Há dois anos atrás eu estudava lá')
    assert.strictEqual(ha.casos[0].ok, false, 'há + atrás é pleonasmo')
})

test('concordância verbal pega as armadilhas clássicas', () => {
    const fazem = aula.analisarConcordanciaVerbal('Fazem dois anos que estudo aqui')
    assert.ok(fazem.problemas.some(p => p.certo === 'faz'))
    const houveram = aula.analisarConcordanciaVerbal('Houveram muitos problemas')
    assert.ok(houveram.problemas.some(p => p.certo === 'houve'))
    const agente = aula.analisarConcordanciaVerbal('A gente vamos embora')
    assert.ok(agente.problemas.length > 0)
    const determinante = aula.analisarConcordanciaVerbal('Os menino saiu cedo')
    assert.ok(determinante.problemas.length > 0, 'o determinante plural denuncia o sujeito plural')
    const certa = aula.analisarConcordanciaVerbal('Os alunos chegaram cedo')
    assert.strictEqual(certa.problemas.length, 0)
})

test('concordância nominal confere artigo, substantivo e adjetivo', () => {
    const r = aula.analisarConcordanciaNominal('Os menino bonito chegou')
    assert.ok(r.problemas.length > 0)
    const ok = aula.analisarConcordanciaNominal('Os meninos bonitos chegaram')
    assert.strictEqual(ok.problemas.length, 0)
})

test('regência verbal: ficha do verbo e erro na frase', () => {
    const ficha = aula.analisarRegenciaVerbal('assistir')
    assert.strictEqual(ficha.tipo, 'ficha')
    assert.ok(ficha.regencia.includes('AO'))
    const frase = aula.analisarRegenciaVerbal('Eu assisti o filme ontem')
    assert.strictEqual(frase.tipo, 'frase')
    assert.ok(frase.achados.length > 0)
    const semFicha = aula.analisarRegenciaVerbal('zunzunar')
    assert.strictEqual(semFicha.tipo, 'semFicha')
})

test('colocação pronominal reconhece atrativa, futuro e ênclise', () => {
    const proclise = aula.analisarColocacao('Não me diga isso')
    assert.ok(proclise.achados.some(a => a.regra.includes('próclise')))
    const mesoclise = aula.analisarColocacao('Darei o livro a ele')
    assert.ok(mesoclise.achados.some(a => a.regra.includes('mesóclise')))
    // "se" enclítico não pode ser lido como conjunção
    const enclise = aula.analisarColocacao('Sentou-se na cadeira')
    assert.ok(enclise.achados.some(a => a.regra.includes('ênclise')), 'Sentou-se é ênclise, não próclise')
    const comeco = aula.analisarColocacao('Me empresta o livro')
    assert.ok(comeco.achados.some(a => a.regra.includes('nunca comece')))
})

test('vírgula: erro entre sujeito e verbo, vocativo e adversativa', () => {
    const erro = aula.analisarVirgula('Os alunos, chegaram cedo')
    assert.ok(erro.alertas.some(a => a.includes('sujeito')))
    const vocativo = aula.analisarVirgula('Maria, venha aqui')
    assert.strictEqual(vocativo.alertas.length, 0, 'vocativo não é erro')
    assert.ok(vocativo.achados.some(a => a.includes('vocativo')))
    const adversativa = aula.analisarVirgula('Estudei mas não passei')
    assert.ok(adversativa.alertas.some(a => a.includes('adversativa')))
})

test('figuras de linguagem, com o acento comparado do lado certo', () => {
    const metafora = aula.acharFiguras('Meu coração é um deserto')
    assert.ok(metafora.achadas.some(f => f.nome === 'metáfora'))
    // "e o" não pode virar metáfora: o teste do "é" tem de ser feito com acento
    const antitese = aula.acharFiguras('O amor e o ódio moram perto')
    assert.ok(antitese.achadas.some(f => f.nome === 'antítese'))
    assert.ok(!antitese.achadas.some(f => f.nome === 'metáfora'), '"e o" não é metáfora')
    assert.ok(aula.acharFiguras('Ele é forte como um touro').achadas.some(f => f.nome === 'comparação'))
    assert.ok(aula.acharFiguras('Estou morrendo de fome').achadas.some(f => f.nome === 'hipérbole'))
    assert.ok(aula.acharFiguras('O rato roeu a roupa do rei de Roma').achadas.some(f => f.nome === 'aliteração'))
    assert.deepStrictEqual(aula.acharFiguras('').achadas, [])
})

test('vícios de linguagem: pleonasmo, gerundismo, eco e "há ... atrás"', () => {
    assert.ok(aula.acharVicios('Vou subir para cima agora').achados.some(a => a.vicio === 'pleonasmo vicioso'))
    assert.ok(aula.acharVicios('Vou estar enviando o arquivo').achados.some(a => a.vicio === 'gerundismo'))
    assert.ok(aula.acharVicios('Há dez anos atrás eu estudava').achados.some(a => a.vicio === 'pleonasmo vicioso'))
    assert.ok(aula.acharVicios('Realmente e totalmente errado').achados.some(a => a.vicio === 'eco'))
    assert.deepStrictEqual(aula.acharVicios('Frase limpa e curta.').achados, [])
})

test('ortografia acha erro conhecido e ignora texto certo', () => {
    const r = aula.corrigirOrtografia('Concerteza vou apartir de amanhã, com menas gente')
    const errados = r.achados.map(a => a.errado)
    assert.ok(errados.includes('concerteza'))
    assert.ok(errados.includes('apartir'))
    assert.ok(errados.includes('menas'))
    assert.deepStrictEqual(aula.corrigirOrtografia('Com certeza vou a partir de amanhã.').achados, [])
})

test('hífen segue as regras do Acordo de 2009', () => {
    assert.ok(aula.analisarHifen('micro-ondas').veredito.includes('certo'))
    assert.ok(aula.analisarHifen('ex-aluno').porque.includes('EX'))
    assert.ok(aula.analisarHifen('autoescola').veredito.includes('sem hífen'))
})

test('número por extenso, com E no lugar certo', () => {
    assert.strictEqual(aula.porExtenso(0), 'zero')
    assert.strictEqual(aula.porExtenso(21), 'vinte e um')
    assert.strictEqual(aula.porExtenso(100), 'cem')
    assert.strictEqual(aula.porExtenso(101), 'cento e um')
    assert.strictEqual(aula.porExtenso(1000), 'mil')
    assert.strictEqual(aula.porExtenso(2500), 'dois mil e quinhentos')
    assert.strictEqual(aula.porExtenso(15320), 'quinze mil trezentos e vinte')
    assert.strictEqual(aula.porExtenso(1000000), 'um milhão')
    assert.strictEqual(aula.ordinalPorExtenso(42), 'quadragésimo segundo')
    assert.strictEqual(aula.ordinalPorExtenso(0), null)
})

test('raio X do parágrafo mede sem confundir palavra com pedaço de palavra', () => {
    const r = aula.analisarParagrafo('Nos dias de hoje, a gente vê que a educação é ruim, tipo, a educação não recebe verba e a educação piora sem professor.')
    assert.ok(r.palavras > 15)
    assert.ok(r.repetidas.some(x => x.palavra === 'educação'), 'educação repetida tem de aparecer com acento')
    assert.ok(r.oralidade.includes('a gente') && r.oralidade.includes('tipo'))
    // "professor" não pode acusar a gíria "pro", e "sem" não pode acusar o conectivo "se"
    assert.ok(!r.oralidade.includes('pro'), '"professor" não contém a gíria "pro"')
    assert.ok(!r.conectivos.some(c => c.endsWith(': se')), '"sem" não é o conectivo "se"')
    assert.ok(r.cliches.includes('nos dias de hoje'))
    const vazio = aula.analisarParagrafo('')
    assert.strictEqual(vazio.palavras, 0)
})

test('tese, argumento e intervenção saem montados do tema', () => {
    const tese = aula.montarTese('a evasão escolar')
    assert.ok(tese.tese.length > 40)
    const arg = aula.montarArgumento('educação')
    assert.strictEqual(arg.area, 'educação')
    assert.ok(arg.repertorio.length >= 3)
    const inter = aula.montarIntervencao('a evasão escolar')
    assert.strictEqual(inter.elementos.length, 5)
    assert.ok(inter.modelo.includes('evasão escolar'))
})

test('tabelas de literatura estão completas e coerentes', () => {
    assert.ok(Object.keys(aula.ESCOLAS).length >= 18, 'pelo menos 18 escolas')
    for (const [chave, e] of Object.entries(aula.ESCOLAS)) {
        assert.ok(e.nome && e.periodo && e.marco, `${chave} sem nome, período ou marco`)
        assert.ok(e.caracteristicas.length >= 3, `${chave} com poucas características`)
        assert.ok(e.autores.length >= 2 && e.obras.length >= 2, `${chave} sem autores ou obras`)
    }
    for (const [chave, o] of Object.entries(aula.OBRAS)) {
        assert.ok(o.titulo && o.autor && o.ano, `${chave} sem título, autor ou ano`)
        assert.ok(o.enredo.length > 60, `${chave} com enredo raso`)
        assert.ok(o.personagens.length >= 2, `${chave} sem personagens`)
        assert.ok(o.porqueCai.length > 40, `${chave} sem explicação do que cai`)
    }
    const dom = aula.OBRAS.domcasmurro
    assert.strictEqual(dom.autor, 'Machado de Assis')
    assert.strictEqual(dom.ano, 1899)
    assert.strictEqual(aula.OBRAS.oslusiadas.ano, 1572)
    assert.strictEqual(aula.OBRAS.vidassecas.autor, 'Graciliano Ramos')
    assert.ok(aula.GLOSSARIO_LITERARIO.length >= 40)
})

test('o catálogo tem exatamente 150 operações, 70 mais 40 mais 40', () => {
    assert.strictEqual(aula.OPS.length, 150)
    const porSub = {}
    for (const op of aula.OPS) porSub[op.sub] = (porSub[op.sub] || 0) + 1
    assert.strictEqual(porSub['Português'], 70)
    assert.strictEqual(porSub['Redação'], 40)
    assert.strictEqual(porSub['Literatura'], 40)
    const ids = new Set()
    for (const op of aula.OPS) {
        assert.ok(!ids.has(op.id), `id repetido: ${op.id}`)
        ids.add(op.id)
        assert.ok(op.descricao.length <= 55, `${op.id}: descrição de ${op.descricao.length} caracteres`)
        assert.strictEqual(typeof op.run, 'function', `${op.id} sem run`)
    }
})

test('toda operação aguenta entrada vazia, sem sentido e gigante', () => {
    const entradas = ['', '   ', '!!!???', '😀😀😀', 'zzzz qqqq wwww', 'a'.repeat(6000)]
    const quebrados = []
    for (const op of aula.OPS) {
        for (const e of entradas) {
            try {
                const r = aula.telaDeResultado(op.id, e, { prefix: '.', nome: 'port1' })
                assert.ok(r && r.titulo, `${op.id} devolveu tela sem título`)
            } catch (err) {
                quebrados.push(`${op.id} com ${JSON.stringify(e.slice(0, 12))}: ${err.message}`)
            }
        }
    }
    assert.strictEqual(quebrados.length, 0, quebrados.slice(0, 6).join('\n     '))
})

// ─────────────────────────────────────────────────────────────────────────
// (b) COMANDOS
// ─────────────────────────────────────────────────────────────────────────

/** Contexto falso: o comando responde aqui em vez de falar com o WhatsApp. */
function contextoFalso(saidas, texto) {
    const args = String(texto || '').trim() ? String(texto).trim().split(/\s+/) : []
    return {
        reply: t => { saidas.push(String(t ?? '')); return Promise.resolve() },
        args,
        text: args.join(' '),
        prefix: '.',
        from: '120363000000000000@g.us',
        sender: '5511900000001@s.whatsapp.net',
        isGroup: true,
        info: {},
        client: {}
    }
}

async function rodar(cmd, texto) {
    const saidas = []
    await cmd.execute(contextoFalso(saidas, texto))
    return saidas.join('\n')
}

;(async () => {
    const pasta = path.join(__dirname, '..', 'src', 'commands', 'escola')
    const arquivos = fs.readdirSync(pasta)
        .filter(n => /^port\d+\.js$/.test(n))
        .sort((a, b) => parseInt(a.slice(4), 10) - parseInt(b.slice(4), 10))

    test('os 150 arquivos port existem na pasta escola', () => {
        assert.strictEqual(arquivos.length, 150, `achei ${arquivos.length} arquivos port`)
    })

    const comandos = []
    test('todo comando carrega e segue o schema combinado', () => {
        const nomes = new Set()
        for (const arq of arquivos) {
            const cmd = require(path.join(pasta, arq))
            assert.ok(cmd && typeof cmd === 'object', `${arq} não exporta objeto`)
            assert.strictEqual(typeof cmd.execute, 'function', `${arq} sem execute`)
            assert.strictEqual(cmd.category, 'escola', `${arq}: categoria errada`)
            assert.ok(['Português', 'Redação', 'Literatura'].includes(cmd.subcategory), `${arq}: subcategoria ${cmd.subcategory}`)
            assert.strictEqual(cmd.cooldownMs, 3000, `${arq}: cooldown errado`)
            assert.deepStrictEqual(cmd.aliases, [], `${arq} declarou alias`)
            assert.ok(cmd.description && cmd.description.length <= 55, `${arq}: descrição de ${(cmd.description || '').length} caracteres`)
            for (const chave of Object.keys(cmd)) {
                assert.ok(CHAVES_PERMITIDAS.has(chave), `${arq}: chave "${chave}" fora do schema`)
            }
            assert.ok(!nomes.has(cmd.name), `${arq}: nome repetido ${cmd.name}`)
            nomes.add(cmd.name)
            comandos.push({ arq, cmd })
        }
    })

    test('nenhuma descrição se repete dentro da família', () => {
        const vistas = new Map()
        for (const { arq, cmd } of comandos) {
            assert.ok(!vistas.has(cmd.description), `${arq} e ${vistas.get(cmd.description)}: "${cmd.description}"`)
            vistas.set(cmd.description, arq)
        }
    })

    // Uma entrada plausível por subcategoria, para o comando ter o que analisar.
    const AMOSTRA = {
        'Português': 'coração',
        'Redação': 'a evasão escolar nas escolas públicas brasileiras',
        'Literatura': 'Machado'
    }

    const problemas = []
    for (const { arq, cmd } of comandos) {
        let comTexto
        try { comTexto = await rodar(cmd, AMOSTRA[cmd.subcategory]) }
        catch (e) { problemas.push(`${cmd.name} (${arq}): explodiu com texto — ${e.message}`); continue }
        if (comTexto.trim().length <= 40) problemas.push(`${cmd.name}: resposta de ${comTexto.trim().length} caracteres`)
        if (comTexto.length > 4096) problemas.push(`${cmd.name}: resposta de ${comTexto.length} caracteres passa do limite do WhatsApp`)
        if (molduraQuebrada(comTexto)) problemas.push(`${cmd.name}: moldura quebrada`)
        if (!comTexto.includes('*')) problemas.push(`${cmd.name}: resposta sem título formatado (não passou pelo F.tela)`)
        for (const e of ENCHIMENTO) if (e.test(semTitulosDeMoldura(comTexto))) problemas.push(`${cmd.name}: enchimento ${e} na resposta`)

        let ajuda
        try { ajuda = await rodar(cmd, '') }
        catch (e) { problemas.push(`${cmd.name} (${arq}): explodiu sem texto — ${e.message}`); continue }
        if (ajuda.trim().length <= 40) problemas.push(`${cmd.name}: ajuda de ${ajuda.trim().length} caracteres`)
        if (!ajuda.includes('`.' + cmd.name)) problemas.push(`${cmd.name}: a ajuda não traz o exemplo pronto do próprio comando`)
        if (molduraQuebrada(ajuda)) problemas.push(`${cmd.name}: ajuda com moldura quebrada`)
    }

    test('os 150 comandos respondem conteúdo de verdade com contexto falso', () => {
        assert.strictEqual(problemas.length, 0, `${problemas.length} problema(s):\n     ` + problemas.slice(0, 12).join('\n     '))
    })

    // A palavra acentuada precisa atravessar o comando inteiro sem se perder.
    test('palavra com acento atravessa o comando inteiro', () => {
        const silabas = comandos.find(c => c.cmd.description.includes('sílabas, com a regra'))
        assert.ok(silabas, 'não achei o comando de separar sílabas')
        const saidas = []
        silabas.cmd.execute(contextoFalso(saidas, 'coração'))
        const texto = saidas.join('\n')
        assert.ok(texto.includes('co-ra-ção'), 'a separação com cedilha e til tem de sair inteira')
    })

    console.log('\n========================================')
    console.log(`📊 Português, redação e literatura: ✅ ${pass} ❌ ${fail}`)
    console.log('========================================\n')
    if (fail > 0) {
        console.log('Falhas:')
        falhas.forEach(f => console.log('  • ' + f))
        process.exit(1)
    }
})()
