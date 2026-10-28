process.env.NODE_ENV = 'test'

/**
 * Testes da família TEXTO E ESCRITA (.txt1 … .txt160).
 *
 * Duas frentes:
 *
 *  (a) O SERVIÇO — cada transformação conferida com caso escrito à mão, mais os
 *      quatro casos que já quebraram texto neste projeto: acento, emoji, texto
 *      vazio e texto gigante. Os codificadores passam pelo teste de ida e
 *      volta: codificar e decodificar tem que devolver o original.
 *
 *  (b) OS COMANDOS — os 160 são carregados e executados com um contexto falso.
 *      Cada um precisa responder algo de verdade: mais de 40 caracteres, sem
 *      caractere de moldura (proibidos desde 2026-09-15) e sem enchimento do
 *      tipo "em breve" ou "placeholder".
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const estudio = require('../src/services/textStudioService')
const F = require('../src/utils/formato')

const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const { molduraQuebrada, semTitulosDeMoldura } = require('./helpers/moldura')
const ENCHIMENTO = [/em breve/i, /placeholder/i, /lorem/i, /\bTODO\b/]
const CHAVES_PERMITIDAS = new Set([
    'usage', 'examples', 'name', 'execute', 'aliases', 'category', 'subcategory',
    'description', 'cooldownMs', 'groupOnly', 'adminOnly', 'ownerOnly',
    'botAdminOnly', 'minRole', 'hidden', 'devOnly'
])

const AMOSTRA = 'A coração não mente: o rato roeu a roupa do rei de Roma! Fale com ana@site.com ou (35) 99737-9643 até 05/11/2026 por R$ 12,50 😀 #festa @ana https://exemplo.com'

let pass = 0, fail = 0
const falhas = []
function test(nome, fn) {
    try { fn(); pass++ }
    catch (e) { fail++; falhas.push(`${nome}\n     ${e.message}`); console.log(`  ❌ FAIL: ${nome}\n     ${e.message}`) }
}

/** Atalho: roda a operação crua e devolve só o texto resultante. */
const tx = (id, entrada) => estudio.aplicar(id, entrada).texto

console.log('🧪 Testes da família texto e escrita...\n')

// ─────────────────────────────────────────────────────────────────────────
// (a) SERVIÇO — transformações com caso escrito à mão
// ─────────────────────────────────────────────────────────────────────────

test('maiúscula e minúscula respeitam acento', () => {
    assert.strictEqual(tx('maiusculas', 'ação à noite'), 'AÇÃO À NOITE')
    assert.strictEqual(tx('minusculas', 'AÇÃO À NOITE'), 'ação à noite')
})

test('primeira letra de cada palavra', () => {
    assert.strictEqual(tx('capitalizar', 'maria da silva'), 'Maria Da Silva')
    assert.strictEqual(tx('capitalizar', 'ÓRGÃO público'), 'Órgão Público')
})

test('maiúscula só no começo da frase', () => {
    assert.strictEqual(tx('frasecapital', 'ELE CHEGOU. ELA SAIU.'), 'Ele chegou. Ela saiu.')
})

test('inverter letras não parte emoji ao meio', () => {
    assert.strictEqual(tx('inverterletras', 'abc'), 'cba')
    assert.strictEqual(tx('inverterletras', 'a😀b'), 'b😀a')
})

test('inverter palavras e linhas', () => {
    assert.strictEqual(tx('inverterpalavras', 'o gato subiu'), 'subiu gato o')
    assert.strictEqual(tx('inverterlinhas', 'um\ndois\ntrês'), 'três\ndois\num')
})

test('embaralhar é semeado: mesmo texto, mesmo resultado', () => {
    const a = tx('embaralharpalavras', 'uma frase com varias palavras aqui')
    const b = tx('embaralharpalavras', 'uma frase com varias palavras aqui')
    assert.strictEqual(a, b, 'o mesmo texto tem que embaralhar igual')
    assert.strictEqual(a.split(/\s+/).sort().join(' '), 'aqui com frase palavras uma varias')
})

test('tirar acento, pontuação, espaço repetido e emoji', () => {
    assert.strictEqual(tx('tiraracento', 'coração à vontade'), 'coracao a vontade')
    assert.strictEqual(tx('tirarpontuacao', 'Oi, tudo bem? Claro!'), 'Oi tudo bem Claro')
    assert.strictEqual(tx('tirarespacorepetido', 'oi     tudo    bem'), 'oi tudo bem')
    assert.strictEqual(tx('tirartodoespaco', 'tudo junto agora'), 'tudojuntoagora')
    assert.strictEqual(tx('tiraremoji', 'oi 😀 tudo bem 🎉'), 'oi tudo bem')
    assert.strictEqual(tx('tirarnumeros', 'casa 42 rua 7'), 'casa rua')
})

test('tirar vogais e deixar só letras ou só números', () => {
    assert.strictEqual(tx('tirarvogais', 'bom dia'), 'bm d')
    assert.strictEqual(tx('soletras', 'pedido 42 #urgente'), 'pedido urgente')
    assert.strictEqual(tx('sonumeros', 'pedido 42 custou 19'), '42\n19')
})

test('linha vazia, linha repetida e espaço das pontas', () => {
    assert.strictEqual(tx('tirarlinhavazia', 'um\n\ndois'), 'um\ndois')
    assert.strictEqual(tx('tirarlinharepetida', 'ana\nbia\nana'), 'ana\nbia')
    assert.strictEqual(tx('tirarespacoborda', '   um   \n  dois  '), 'um\ndois')
})

test('link amigável e nome de arquivo', () => {
    assert.strictEqual(tx('slug', 'Minha Loja de Pão'), 'minha-loja-de-pao')
    assert.strictEqual(tx('nomearquivo', 'Nota: 12/03 final?'), 'Nota_12_03_final')
})

test('espaçado, alternado e as marcas do WhatsApp', () => {
    assert.strictEqual(tx('espacado', 'oi'), 'o i')
    assert.strictEqual(tx('alternado', 'abcd'), 'AbCd')
    assert.strictEqual(tx('negrito', 'aviso'), '*aviso*')
    assert.strictEqual(tx('italico', 'aviso'), '_aviso_')
    assert.strictEqual(tx('riscado', 'aviso'), '~aviso~')
    assert.strictEqual(tx('monoespacado', 'codigo'), '```codigo```')
})

test('letras miúdas e letras largas', () => {
    assert.strictEqual(tx('letraspequenas', 'bem'), 'ʙᴇᴍ')
    assert.strictEqual(tx('caixaaltalarga', 'ab'), 'ａｂ')
})

test('emoji entre palavras usa o emoji pedido', () => {
    assert.strictEqual(tx('emojientrepalavras', '🔥 promoção de hoje'), 'promoção🔥de🔥hoje')
    assert.strictEqual(tx('emojientrepalavras', 'promoção de hoje'), 'promoção✨de✨hoje')
})

test('quebra em palavra, letra e frase por linha', () => {
    assert.strictEqual(tx('palavraporlinha', 'arroz feijão'), 'arroz\nfeijão')
    assert.strictEqual(tx('letraporlinha', 'sol'), 's\no\nl')
    assert.strictEqual(tx('fraseporlinha', 'Ele veio. Ela foi.'), 'Ele veio.\nEla foi.')
})

test('numerar e ordenar linhas', () => {
    assert.strictEqual(tx('numerarlinhas', 'pão\nluz'), '1. pão\n2. luz')
    assert.strictEqual(tx('ordenarlinhas', 'caio\nana\nbia'), 'ana\nbia\ncaio')
    assert.strictEqual(tx('ordenarlinhasdesc', 'ana\nbia\ncaio'), 'caio\nbia\nana')
})

test('quebrar em blocos respeita o tamanho pedido', () => {
    assert.strictEqual(tx('blocos', '5 abcdefghij'), 'abcde\nfghij')
    assert.strictEqual(tx('blocos', 'abcdefghij').includes('\n'), false, 'sem número, o padrão de 60 não quebra texto curto')
})

test('alinhar à direita, centralizar e recuar', () => {
    assert.strictEqual(tx('alinhardireita', '5 oi'), '   oi')
    assert.strictEqual(tx('alinharcentro', '6 oi'), '  oi')
    assert.strictEqual(tx('recuar', '3 oi'), '   oi')
})

test('censurar palavrão respeita acento (o \\b de regex não respeitaria)', () => {
    assert.strictEqual(tx('censurar', 'que merda de dia'), 'que m**** de dia')
    assert.strictEqual(tx('censurar', 'que desgraça!'), 'que d*******!')
    assert.strictEqual(tx('censurar', 'merdaria não é palavrão'), 'merdaria não é palavrão', 'só palavra inteira é censurada')
})

test('trocar palavra por outra, com e sem o par velho>novo', () => {
    assert.strictEqual(tx('trocarpalavra', 'sol>lua o sol nasceu'), 'o lua nasceu')
    assert.strictEqual(tx('trocarpalavra', 'ação>calma a ação passou'), 'a calma passou')
    assert.ok(tx('trocarpalavra', 'casa da casa é casa').includes('CASA'), 'sem par, destaca a mais repetida')
})

test('repetir, refrão e zero à esquerda', () => {
    assert.strictEqual(tx('repetir', '3 vai'), 'vai\nvai\nvai')
    assert.strictEqual(tx('refrao', 'ôô\nvamos\nchegar'), 'vamos\nôô\nchegar\nôô')
    assert.strictEqual(tx('preencherzero', '4 sala 7'), 'sala 0007')
})

test('tabela alinha as colunas', () => {
    const t = tx('tabela', 'pão;5\nleite;12')
    assert.ok(t.includes('pão    5'), t)
    assert.ok(t.includes('leite  12'), t)
})

test('formatos de programador', () => {
    assert.strictEqual(tx('snakecase', 'Minha Lista de Compras'), 'minha_lista_de_compras')
    assert.strictEqual(tx('camelcase', 'minha lista de compras'), 'minhaListaDeCompras')
    assert.strictEqual(tx('kebabcase', 'Minha Lista'), 'minha-lista')
    assert.strictEqual(tx('constantecase', 'limite de envio'), 'LIMITE_DE_ENVIO')
    assert.strictEqual(tx('pascalcase', 'minha lista'), 'MinhaLista')
})

test('sigla pula palavra de ligação', () => {
    assert.strictEqual(tx('sigla', 'organização das nações unidas'), 'ONU')
})

test('juntar linhas, separar por vírgula, cortar e filtrar', () => {
    assert.strictEqual(tx('juntarlinhas', 'ele chegou\ne foi'), 'ele chegou e foi')
    assert.strictEqual(tx('separarporvirgula', 'pão\nleite\novo'), 'pão, leite e ovo')
    assert.strictEqual(tx('truncar', '5 abcdefghij'), 'abcd…')
    assert.strictEqual(tx('filtrarlinhas', 'pago joão pago\nmaria deve'), 'joão pago')
})

// ── Analisar ─────────────────────────────────────────────────────────────

test('contagens básicas batem', () => {
    const c = estudio.aplicar('contarcaracteres', 'ação boa')
    assert.ok(c.intro.includes('8 caracteres'), c.intro)
    const p = estudio.aplicar('contarpalavras', 'o rato roeu o rato')
    assert.ok(p.intro.includes('5 palavras') && p.intro.includes('3 diferentes'), p.intro)
    const f = estudio.aplicar('contarfrases', 'Ele veio. Ela foi. Fim!')
    assert.ok(f.intro.includes('3 frase'), f.intro)
    const l = estudio.aplicar('contarlinhas', 'um\n\ndois')
    assert.ok(l.intro.includes('3 linha') && l.intro.includes('1 delas em branco'), l.intro)
})

test('parágrafo é bloco separado por linha em branco', () => {
    const r = estudio.aplicar('contarparagrafos', 'bloco um\nmesma coisa\n\nbloco dois')
    assert.ok(r.intro.includes('2 parágrafo'), r.intro)
})

test('tempo de leitura e de fala usam ritmos diferentes', () => {
    const texto = 'palavra '.repeat(200)
    const leitura = estudio.aplicar('tempoleitura', texto)
    const fala = estudio.aplicar('tempofala', texto)
    assert.ok(leitura.intro.includes('1 min'), leitura.intro)
    assert.ok(fala.intro.includes('2 min'), fala.intro)
})

test('palavras repetidas ignoram palavrinha de ligação', () => {
    const r = estudio.aplicar('palavrasrepetidas', 'o gato e o rato e o gato de novo com o gato')
    assert.ok(r.intro.includes('"gato"'), r.intro)
    assert.ok(!r.intro.includes('"com"'), r.intro)
})

test('caps excessivo mede o grito', () => {
    assert.ok(estudio.aplicar('capsexcessivo', 'SOCORRO GENTE').intro.includes('está gritando'))
    assert.ok(estudio.aplicar('capsexcessivo', 'oi tudo bem').intro.includes('tom normal'))
})

test('contar emoji conta figurinha e não letra', () => {
    const r = estudio.aplicar('contaremoji', 'oi 😀 tchau 😀 🎉')
    assert.ok(r.intro.includes('3 emoji'), r.intro)
    assert.ok(estudio.aplicar('contaremoji', 'sem figurinha aqui').intro.includes('não tem nenhum emoji'))
})

test('detecta marcas do português', () => {
    assert.ok(estudio.aplicar('detectarportugues', 'a canção não parou porque você quis').intro.includes('português'))
    assert.ok(estudio.aplicar('detectarportugues', 'the quick brown fox').intro.includes('não achei marca'))
})

test('localiza e-mail, telefone, link, CPF, data e dinheiro', () => {
    assert.ok(tx('acharemail', 'fale com ana.lu@site.com.br hoje').includes('ana.lu@site.com.br'))
    assert.ok(tx('achartelefone', 'ligue (35) 99737-9643').includes('99737-9643'))
    assert.ok(tx('acharlink', 'veja https://exemplo.com/ja agora').includes('https://exemplo.com/ja'))
    assert.ok(tx('acharcpf', 'cadastro 529.982.247-25').includes('conta bate'))
    assert.ok(tx('acharcpf', 'cadastro 111.222.333-44').includes('conta não bate'))
    assert.ok(tx('achardata', 'reunião 05/11/2026 às 14h').includes('05/11/2026'))
    assert.ok(estudio.aplicar('achardinheiro', 'pão R$ 5,00 e leite R$ 7,50').blocos[0].linhas[0].includes('12,50'))
    assert.ok(tx('acharhashtag', 'bom dia #domingo #café').includes('#café'))
    assert.ok(tx('acharmencao', 'obrigado @ana e @bia').includes('@bia'))
})

test('comparar textos e ver a diferença entre versões', () => {
    const c = estudio.aplicar('compararTextos', 'pão leite ovo | pão leite queijo')
    assert.ok(c.intro.includes('50%'), c.intro)
    const d = estudio.aplicar('diferencalinhas', 'pão\nleite | pão\novo')
    assert.ok(d.blocos[0].linhas.join(' ').includes('leite'), 'leite saiu')
    assert.ok(d.blocos[1].linhas.join(' ').includes('ovo'), 'ovo entrou')
})

test('procurar palavra conta as vezes certas', () => {
    const r = estudio.aplicar('acharpalavra', 'rato o rato roeu a roupa do rato')
    assert.ok(r.intro.includes('2 vez'), r.intro)
})

test('anagrama, palíndromo e rima', () => {
    assert.ok(estudio.aplicar('anagrama', 'roma amor').intro.startsWith('Sim'))
    assert.ok(estudio.aplicar('anagrama', 'casa gato').intro.startsWith('Não'))
    assert.ok(estudio.aplicar('palindromo', 'Socorram-me, subi no ônibus em Marrocos').intro.startsWith('Sim'))
    assert.ok(estudio.aplicar('palindromo', 'bom dia').intro.startsWith('Não'))
    assert.ok(estudio.aplicar('rima', 'coração emoção').intro.startsWith('Rimam'))
    assert.ok(estudio.aplicar('rima', 'casa livro').intro.startsWith('Não rimam'))
})

test('sílabas e métrica de verso', () => {
    assert.strictEqual(estudio.silabasDe('casa'), 2)
    assert.strictEqual(estudio.silabasDe('saudade'), 3)
    const m = estudio.aplicar('metricaverso', 'casa bonita\nmesa bonita')
    assert.ok(m.texto.includes('sílabas'), m.texto)
})

test('distância de edição conta as trocas', () => {
    assert.strictEqual(estudio.distanciaEdicao('casa', 'caso'), 1)
    assert.strictEqual(estudio.distanciaEdicao('casa', 'casa'), 0)
    assert.ok(estudio.aplicar('distanciaedicao', 'casa caso').intro.includes('1 letra'))
})

test('painel resume o texto inteiro sem estourar', () => {
    const r = estudio.aplicar('painelresumo', 'Uma frase. Outra frase maior aqui.')
    assert.strictEqual(r.blocos.length, 3)
    assert.ok(r.intro.includes('palavras'), r.intro)
})

// ── Códigos: ida e volta ─────────────────────────────────────────────────

test('todo codificador tem par de ida e volta declarado', () => {
    const codigos = estudio.OPS.filter(o => o.sub === 'Códigos').map(o => o.id)
    const cobertos = new Set(estudio.PARES_CODIGO.flatMap(p => [p.ida, p.volta]))
    const fora = codigos.filter(c => !cobertos.has(c))
    assert.strictEqual(fora.length, 0, `sem teste de ida e volta: ${fora.join(', ')}`)
})

for (const par of estudio.PARES_CODIGO) {
    test(`ida e volta: ${par.ida} → ${par.volta}`, () => {
        const chave = par.chave ? par.chave + ' ' : ''
        const codificado = tx(par.ida, chave + par.amostra)
        assert.ok(codificado && codificado.length, 'codificou para vazio')
        const voltou = tx(par.volta, chave + codificado)
        const esperado = par.normaliza ? par.normaliza(par.amostra) : par.amostra
        assert.strictEqual(voltou, esperado, `codificado: ${codificado}`)
    })
}

test('codificadores conhecidos batem com o valor escrito à mão', () => {
    assert.strictEqual(tx('morse', 'sos'), '... --- ...')
    assert.strictEqual(tx('demorse', '... --- ...'), 'sos')
    assert.strictEqual(tx('binario', 'oi'), '01101111 01101001')
    assert.strictEqual(tx('hexadecimal', 'oi'), '6f 69')
    assert.strictEqual(tx('base64', 'oi'), 'b2k=')
    assert.strictEqual(tx('debase64', 'b2k='), 'oi')
    assert.strictEqual(tx('rot13', 'ola'), 'byn')
    assert.strictEqual(tx('atbash', 'ola'), 'loz')
    assert.strictEqual(tx('cesar', '5 ola'), 'tqf')
    assert.strictEqual(tx('decesar', '5 tqf'), 'ola')
    assert.strictEqual(tx('cifranumeros', 'ola'), '15-12-1')
    assert.strictEqual(tx('fonetico', 'ana'), 'Alfa Novembro Alfa')
    assert.strictEqual(tx('braille', 'ola'), '⠕⠇⠁')
    assert.strictEqual(tx('leet', 'batalha'), '8474lh4')
    assert.strictEqual(tx('t9', 'oi'), '666-444')
    assert.strictEqual(tx('codigoteclado', 'ola'), '2.9-3.9-3.1')
})

test('base64 e link aguentam acento e emoji na ida e volta', () => {
    const original = 'Ação 😀 ç ã'
    assert.strictEqual(tx('debase64', tx('base64', original)), original)
    assert.strictEqual(tx('urldecodificar', tx('urlcodificar', original)), original)
})

test('link com código quebrado não derruba o comando', () => {
    const r = estudio.aplicar('urldecodificar', '%E0%A4%A')
    assert.ok(r.intro.includes('quebrado'), r.intro)
})

test('cifra de César e Vigenère só desfazem com a chave certa', () => {
    const cifrado = tx('cesar', '7 ola mundo')
    assert.notStrictEqual(tx('decesar', '3 ' + cifrado), 'ola mundo', 'chave errada não pode devolver o original')
    assert.strictEqual(tx('decesar', '7 ' + cifrado), 'ola mundo')
    const vig = tx('vigenere', 'limao ola mundo')
    assert.notStrictEqual(tx('devigenere', 'outra ' + vig), 'ola mundo')
    assert.strictEqual(tx('devigenere', 'limao ' + vig), 'ola mundo')
})

test('toda tela de código avisa que é brincadeira', () => {
    for (const op of estudio.OPS.filter(o => o.sub === 'Códigos')) {
        const t = F.tela(estudio.telaDeResultado(op.id, 'mensagem secreta de teste', { prefix: '.', nome: 'txtX' }))
        assert.ok(t.includes('não use para esconder senha') || t.includes('Não use para esconder senha'),
            `${op.id} não avisou que é brincadeira`)
    }
})

// ── Criar ────────────────────────────────────────────────────────────────

test('criadores usam mesmo o texto que a pessoa mandou', () => {
    assert.ok(tx('apelido', 'Rafael').toLowerCase().includes('rafa'))
    assert.ok(tx('frasedeefeito', 'treino').includes('treino'))
    assert.ok(tx('convite', 'churrasco, sábado 13h, casa da vó').includes('CHURRASCO'))
    assert.ok(tx('convite', 'churrasco, sábado 13h, casa da vó').includes('casa da vó'))
    assert.ok(tx('recadoaniversario', 'Ana, amiga de escola').includes('Ana'))
    assert.ok(tx('listatarefas', 'pagar luz, comprar pão').includes('Pagar luz'))
    assert.ok(tx('poema', 'chuva, janela, saudade').includes('chuva'))
    assert.ok(tx('acrostico', 'sol').startsWith('*S*'))
    assert.ok(tx('hashtags', 'bolo de cenoura caseiro').includes('#cenoura'))
    assert.ok(tx('enquete', 'que dia?\nsábado\ndomingo').includes('1️⃣ sábado'))
})

test('banner em blocos não usa caractere de moldura', () => {
    const b = estudio.bannerDeBlocos('oi')
    assert.ok(b.includes('█'), b)
    assert.ok(!CAIXA.test(b), 'o banner não pode usar traço de caixa')
    assert.strictEqual(b.split('\n').length, 5)
    assert.strictEqual(estudio.bannerDeBlocos('😀😀'), '', 'sem letra conhecida, não há banner')
})

// ── Casos que já quebraram texto neste projeto ───────────────────────────

test('texto vazio não derruba nenhuma das 160 operações', () => {
    const quebrou = []
    for (const op of estudio.OPS) {
        try { F.tela(estudio.telaDeResultado(op.id, '', { prefix: '.', nome: 'txtX' })) }
        catch (e) { quebrou.push(`${op.id}: ${e.message}`) }
    }
    assert.strictEqual(quebrou.length, 0, quebrou.slice(0, 5).join(' | '))
})

test('texto só com emoji não derruba nenhuma operação', () => {
    const quebrou = []
    for (const op of estudio.OPS) {
        try { F.tela(estudio.telaDeResultado(op.id, '😀🎉😀 🔥', { prefix: '.', nome: 'txtX' })) }
        catch (e) { quebrou.push(`${op.id}: ${e.message}`) }
    }
    assert.strictEqual(quebrou.length, 0, quebrou.slice(0, 5).join(' | '))
})

test('texto de 5.000 caracteres é cortado na entrada e na saída', () => {
    const gigante = 'Ação e coração: o rato roeu a roupa do rei de Roma! '.repeat(100)
    assert.ok(gigante.length >= 5000, `a amostra tem ${gigante.length}`)
    assert.strictEqual(estudio.limitarEntrada(gigante).length, estudio.LIMITE_ENTRADA)

    const grandes = []
    const inicio = Date.now()
    for (const op of estudio.OPS) {
        const t = F.tela(estudio.telaDeResultado(op.id, gigante, { prefix: '.', nome: 'txtX' }))
        if (t.length > 4096) grandes.push(`${op.id}: ${t.length}`)
    }
    assert.strictEqual(grandes.length, 0, `passaram do limite de mensagem: ${grandes.join(', ')}`)
    assert.ok(Date.now() - inicio < 10000, `as 160 operações levaram ${Date.now() - inicio} ms num texto gigante`)
})

test('entrada vem do texto digitado ou da mensagem respondida', () => {
    assert.strictEqual(estudio.entradaDe(['bom', 'dia']), 'bom dia')
    assert.strictEqual(estudio.entradaDe([]), '')
    const info = { message: { extendedTextMessage: { contextInfo: { quotedMessage: { conversation: 'texto citado' } } } } }
    assert.strictEqual(estudio.entradaDe([], info), 'texto citado')
    assert.strictEqual(estudio.entradaDe(['digitado'], info), 'digitado', 'o que a pessoa digitou ganha da citação')
})

test('parâmetro só é engolido quando é mesmo parâmetro', () => {
    const spec = [{ nome: 'vezes', tipo: 'numero', padrao: 2, min: 1, max: 9 }]
    assert.deepStrictEqual(estudio.lerParametros('3 oi', spec), { texto: 'oi', p: { vezes: 3 } })
    assert.deepStrictEqual(estudio.lerParametros('oi', spec), { texto: 'oi', p: { vezes: 2 } })
    assert.strictEqual(estudio.lerParametros('3 linha um\nlinha dois', spec).texto, 'linha um\nlinha dois',
        'ler parâmetro não pode destruir a quebra de linha')
})

test('borda de palavra funciona com acento (o \\b de regex não funcionaria)', () => {
    assert.ok(estudio.regexPalavra('ação').test('a ação parou'))
    assert.ok(!estudio.regexPalavra('ação').test('reação em cadeia'))
    assert.ok(estudio.regexPalavra('pao').test('pao quente'))
})

// ─────────────────────────────────────────────────────────────────────────
// (b) COMANDOS — os 160 rodando com contexto falso
// ─────────────────────────────────────────────────────────────────────────

const PASTA = path.join(__dirname, '..', 'src', 'commands', 'texto')
const arquivos = fs.existsSync(PASTA) ? fs.readdirSync(PASTA).filter(f => f.endsWith('.js')).sort() : []

test('a pasta tem exatamente 160 comandos', () => {
    assert.strictEqual(arquivos.length, 160, `achei ${arquivos.length} arquivo(s)`)
})

test('o manifesto do gerador bate com o que está no disco', () => {
    const m = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scripts', 'manifests', 'txt_arquivos.json'), 'utf8'))
    assert.strictEqual(m.total, 160)
    assert.strictEqual(m.arquivos.length, arquivos.length)
    for (const item of m.arquivos) {
        assert.ok(fs.existsSync(path.join(__dirname, '..', item.arquivo)), `faltou ${item.arquivo}`)
    }
})

const comandos = arquivos.map(f => require(path.join(PASTA, f)))

test('todos seguem o schema, sem chave estranha e sem apelido', () => {
    const problemas = []
    const nomes = new Set()
    for (const cmd of comandos) {
        for (const k of Object.keys(cmd)) if (!CHAVES_PERMITIDAS.has(k)) problemas.push(`${cmd.name}: chave ${k}`)
        if (!/^txt\d+$/.test(cmd.name || '')) problemas.push(`nome fora do padrão: ${cmd.name}`)
        if (nomes.has(cmd.name)) problemas.push(`nome repetido: ${cmd.name}`)
        nomes.add(cmd.name)
        if (!Array.isArray(cmd.aliases) || cmd.aliases.length) problemas.push(`${cmd.name}: aliases tem que ser lista vazia`)
        if (cmd.category !== 'texto') problemas.push(`${cmd.name}: categoria ${cmd.category}`)
        if (!['Transformar', 'Analisar', 'Códigos', 'Criar'].includes(cmd.subcategory)) problemas.push(`${cmd.name}: subcategoria ${cmd.subcategory}`)
        if (cmd.cooldownMs !== 3000) problemas.push(`${cmd.name}: cooldown ${cmd.cooldownMs}`)
        if (!cmd.description || cmd.description.length > 55) problemas.push(`${cmd.name}: descrição com ${(cmd.description || '').length} caracteres`)
        if (typeof cmd.execute !== 'function') problemas.push(`${cmd.name}: sem execute`)
    }
    assert.strictEqual(problemas.length, 0, problemas.slice(0, 10).join(' | '))
})

test('as quatro subcategorias têm o tamanho combinado', () => {
    const conta = {}
    for (const c of comandos) conta[c.subcategory] = (conta[c.subcategory] || 0) + 1
    assert.deepStrictEqual(conta, { Transformar: 60, Analisar: 40, 'Códigos': 36, Criar: 24 })
})

/** Executa um comando com contexto falso e devolve o que ele respondeu. */
async function rodar(cmd, texto) {
    let resposta = null
    let vezes = 0
    await cmd.execute({
        reply: async (t) => { resposta = t; vezes++ },
        args: texto ? texto.split(/\s+/) : [],
        prefix: '.',
        info: null
    })
    return { resposta, vezes }
}

;(async () => {
    const problemas = []
    for (const cmd of comandos) {
        let r
        try { r = await rodar(cmd, AMOSTRA) }
        catch (e) { problemas.push(`${cmd.name}: explodiu com texto — ${e.message}`); continue }

        if (r.vezes !== 1) { problemas.push(`${cmd.name}: respondeu ${r.vezes} vez(es)`); continue }
        const t = String(r.resposta || '')
        if (t.length <= 40) problemas.push(`${cmd.name}: resposta de ${t.length} caracteres — ${JSON.stringify(t)}`)
        if (t.length > 4096) problemas.push(`${cmd.name}: resposta de ${t.length} caracteres passa do limite do WhatsApp`)
        if (molduraQuebrada(t)) problemas.push(`${cmd.name}: moldura quebrada`)
        for (const enchimento of ENCHIMENTO) if (enchimento.test(semTitulosDeMoldura(t))) problemas.push(`${cmd.name}: enchimento "${enchimento}" na resposta`)
        if (!t.includes('*')) problemas.push(`${cmd.name}: resposta sem título formatado (não passou pelo F.tela)`)

        // Sem texto nenhum: tem que vir a tela curta de como usar, com exemplo pronto.
        let ajuda
        try { ajuda = await rodar(cmd, '') }
        catch (e) { problemas.push(`${cmd.name}: explodiu sem texto — ${e.message}`); continue }
        const a = String(ajuda.resposta || '')
        if (a.length <= 40) problemas.push(`${cmd.name}: ajuda de ${a.length} caracteres`)
        if (!a.includes('`.' + cmd.name)) problemas.push(`${cmd.name}: a ajuda não traz o exemplo pronto do próprio comando`)
        if (molduraQuebrada(a)) problemas.push(`${cmd.name}: ajuda com moldura quebrada`)
    }

    test('os 160 comandos respondem conteúdo de verdade com contexto falso', () => {
        assert.strictEqual(problemas.length, 0, problemas.slice(0, 12).join('\n     '))
    })

    console.log('\n========================================')
    console.log(`📊 Texto e escrita: ✅ ${pass} ❌ ${fail}`)
    console.log('========================================\n')
    if (fail > 0) {
        console.log('Falhas:')
        falhas.forEach(f => console.log('  • ' + f))
        process.exit(1)
    }
})()
