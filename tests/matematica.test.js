process.env.NODE_ENV = 'test'

/**
 * Testes da família ESCOLA — EXATAS (.mat1 … .mat180).
 *
 * Duas frentes, na ordem em que as coisas quebram:
 *
 *  (a) A CONTA — cada resultado foi conferido à mão antes de virar assert.
 *      Resposta errada aqui é pior que comando faltando: o aluno copia o número
 *      e leva para a prova. Junto vão os casos que costumam derrubar conta:
 *      delta negativo, divisão por zero, raiz de número negativo, entrada que
 *      não é número e número grande demais para caber num double.
 *
 *  (b) OS COMANDOS — os 180 são carregados do disco e executados com contexto
 *      falso. Cada um precisa responder algo de gente: mais de 40 caracteres,
 *      schema limpo, sem alias, sem moldura desenhada e sem descrição repetida.
 *
 * Os números de tabela (massa atômica, calor específico, índice de refração)
 * são conferidos contra o valor de referência citado no cabeçalho do serviço.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const E = require('../src/services/exactSciencesService')
const F = require('../src/utils/formato')

const PASTA = path.join(__dirname, '..', 'src', 'commands', 'escola')
const CAIXA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const { temTexto, molduraQuebrada, semTitulosDeMoldura } = require('./helpers/moldura')
// "TODO" e "FIXME" só valem como marcador de código em CAIXA ALTA: em português
// "todo mundo" é frase comum e a versão minúscula acusaria texto inocente.
const MARCADOR_DE_CODIGO = /\b(TODO|FIXME|XXX)\b/
const ENCHIMENTO = /(em breve|placeholder|lorem ipsum|texto de exemplo|indisponível no momento|conteúdo a definir)/i
const LIXO = /NaN|undefined|Infinity|\[object Object\]/
const CHAVES_PERMITIDAS = new Set(['usage', 'examples', 'name', 'execute', 'aliases', 'category',
    'subcategory', 'description', 'cooldownMs', 'groupOnly', 'adminOnly', 'ownerOnly',
    'botAdminOnly', 'minRole', 'hidden', 'devOnly'])

let pass = 0, fail = 0
const falhas = []

function test(nome, fn) {
    try { fn(); pass++ }
    catch (e) { fail++; falhas.push(nome); console.log(`  ❌ FAIL: ${nome}\n     ${e.message}`) }
}

/** Divide a entrada como o comando divide, respeitando entrada vazia. */
const partes = entrada => String(entrada).trim() ? String(entrada).trim().split(/\s+/) : []

/** Só a frase do resultado, sem os asteriscos do negrito. */
function frase(chave, entrada) {
    return String(E.calcular(chave, partes(entrada)).intro).replace(/\*/g, '')
}

/** A tela inteira, do jeito que a pessoa recebe no WhatsApp. */
function tela(chave, entrada) {
    return F.tela(E.responder(chave, partes(entrada), { comando: chave }))
}

/** A frase do resultado precisa conter cada trecho — é o número conferido à mão. */
function confere(chave, entrada, ...trechos) {
    const dito = frase(chave, entrada)
    for (const t of trechos) {
        assert.ok(dito.includes(t), `${chave} "${entrada}"\n     esperava conter: ${t}\n     veio: ${dito}`)
    }
}

/** Entrada ruim não pode estourar: vira tela educada de "Quase lá". */
function recusa(chave, entrada, pedaco) {
    let dito
    try { dito = E.calcular(chave, partes(entrada)); }
    catch (e) {
        assert.ok(e instanceof E.EntradaInvalida, `${chave} "${entrada}" jogou ${e.constructor.name}, esperava EntradaInvalida`)
        if (pedaco) assert.ok(e.message.includes(pedaco), `${chave} "${entrada}": mensagem "${e.message}" não fala de "${pedaco}"`)
        const t = tela(chave, entrada)
        assert.ok(temTexto(t, 'Quase lá'), `${chave} "${entrada}": não virou tela de ajuda`)
        assert.ok(t.length > 40, `${chave} "${entrada}": tela de recusa curta demais`)
        return
    }
    assert.fail(`${chave} "${entrada}" devia ter recusado, mas respondeu: ${dito.intro}`)
}

console.log('\n🧪 Testes da família escola — exatas...\n')

// ─────────────────────────────────────────────────────────────────────────
// (a) MATEMÁTICA — contas conferidas à mão
// ─────────────────────────────────────────────────────────────────────────

test('equação do 1º grau resolve e isola o x', () => {
    confere('eq1grau', '2x + 6 = 0', '-3')          // 2x = -6
    confere('eq1grau', '3x - 9 = 0', '3')
    confere('eq1grau', '5x + 2 = 2x + 11', '3')     // 3x = 9
})

test('equação do 2º grau: delta positivo, zero e negativo', () => {
    confere('eq2grau', 'x²-5x+6', '3', '2')                       // raízes 3 e 2
    confere('eq2grau', '2x²-5x+3', '1,5', '1')                    // 1,5 e 1
    confere('eq2grau', 'x²-4x+4', 'uma raiz')                     // delta = 0, raiz dupla 2
    confere('eq2grau', 'x²+x+1', 'não tem raiz real')             // delta = -3
    // O passo a passo precisa mostrar o delta, não só cuspir a resposta.
    assert.ok(tela('eq2grau', 'x²+x+1').includes('-3'), 'não mostrou o delta negativo')
})

test('delta e as relações de Girard', () => {
    confere('delta', '1 -4 4', '0')          // 16 - 16
    confere('delta', '1 2 5', '-16')         // 4 - 20
    confere('girard', '1 -5 6', '5', '6')    // soma 5, produto 6
})

test('sistema de duas equações', () => {
    confere('sistema2x2', 'x+y=10 ; x-y=2', '6', '4')
    confere('sistema2x2', '2x+3y=8 ; x-y=1', '2,2', '1,2')  // x=2,2  y=1,2
})

test('funções do 1º e do 2º grau', () => {
    confere('funcao1grau', '2 -3 5', '7')            // f(x)=2x-3, f(5)=7
    confere('funcao2grau', '1 -4 3', '(2, -1)')      // vértice
})

test('regra de três simples, inversa e composta', () => {
    confere('regratres', '3 12 5', '20')             // 3:12 :: 5:x
    confere('regratresinv', '4 6 8', '3')            // 4×6 = 8×x
    confere('regratrescomp', '5 6 40 8 9', '96')     // 40 × (8/5) × (9/6)
})

test('porcentagem nos quatro formatos', () => {
    confere('porcentagemde', '15 200', '30')
    confere('percentualquanto', '30 150', '20%')
    confere('aumentar', '100 10', '110')
    confere('descontar', '100 10', 'R$ 90,00')
    confere('variacaopercent', '200 250', '25%')
})

test('juros simples e compostos', () => {
    // 1000 a 5% por 12 períodos: juro simples 600, montante 1600.
    confere('jurossimples', '1000 5 12', 'R$ 1.600,00', 'R$ 600,00')
    // 1000 a 2% por 12: 1000 × 1,02^12 = 1268,24.
    confere('juroscompostos', '1000 2 12', 'R$ 1.268,24')
    // Regra dos 72 de verdade: ln2 / ln(1,10) = 7,27 períodos.
    confere('tempodobrar', '10', '7,27')
    // (1,12^12 - 1) = 289,6% ao ano.
    confere('taxaequivalente', '12 12 1', '289,5976%')
})

test('MMC, MDC, fatoração, primos e divisores', () => {
    confere('mmc', '4 6 10', '60')
    confere('mdc', '12 18 24', '6')
    confere('mmc', '12 18', '36')
    confere('mdc', '48 36', '12')
    confere('fatorar', '360', '2³ × 3² × 5')
    confere('ehprimo', '97', 'é primo')
    confere('ehprimo', '91', 'não é primo')      // 7 × 13
    confere('primosate', '20', '8')              // 2,3,5,7,11,13,17,19
    confere('divisores', '36', '9')              // 1,2,3,4,6,9,12,18,36
})

test('médias, mediana, moda e desvio padrão', () => {
    confere('media', '7 8 9', '8')
    confere('mediaponderada', '7 2 9 3', '8,2')      // (14+27)/5
    confere('mediana', '3 1 2 5 4', '3')
    confere('mediana', '1 2 3 4', '2,5')             // par: média dos dois do meio
    confere('moda', '1 2 2 3', '2')
    // Conjunto clássico {2,4,4,4,5,5,7,9}: média 5, variância 4, desvio 2.
    confere('desviopadrao', '2 4 4 4 5 5 7 9', '2', '5')
})

test('frações', () => {
    confere('somarfracao', '1/2 + 1/3', '5/6')
    confere('multiplicarfracao', '2/3 x 3/4', '1/2')
    confere('simplificarfracao', '18/24', '3/4')
    confere('fracaodecimal', '3/8', '0,375', '37,5%')
    confere('decimalfracao', '0,75', '3/4')
})

test('potências, raízes, logaritmo e notação científica', () => {
    confere('potencia', '2 10', '1.024')
    confere('raiz', '144', '12')
    confere('raizn', '27 3', '3')
    confere('raizn', '-8 3', '-2')               // índice ímpar aceita negativo
    confere('logaritmo', '8 2', '3')
    confere('logaritmo', '1000 10', '3')
    confere('notacaocientifica', '0,00045', '4,5 × 10^-4')
    // O caminho de volta: 3 × 10^8 tem que virar 300.000.000, não "3".
    confere('denotacao', '3 8', '300.000.000')
    confere('denotacao', '4,5 -6', '0,0000045')
})

test('bases numéricas', () => {
    confere('decbin', '10', '1010')
    confere('bindec', '1011', '11')
    confere('basequalquer', 'FF 16 10', '255')
})

test('áreas, perímetros e volumes', () => {
    confere('areatriangulo', '10 6', '30')
    confere('areaheron', '3 4 5', '6')              // triângulo retângulo 3-4-5
    confere('areacirculo', '5', '78,5398')          // π × 25
    confere('areatrapezio', '10 6 4', '32')         // (10+6)/2 × 4
    confere('arealosango', '8 6', '24')
    confere('areasetor', '5 90', '19,635')          // um quarto de π×25
    confere('circunferencia', '5', '31,4159')
    confere('perimetroretangulo', '5 3', '16')
    confere('areacoordenadas', '0 0 4 0 0 3', '6')
    confere('volumecubo', '3', '27')
    confere('volumebloco', '2 3 4', '24')
    confere('volumecilindro', '2 5', '62,831853')   // π × 4 × 5
    confere('volumecone', '3 4', '37,699112')       // π × 9 × 4 ÷ 3
    confere('volumeesfera', '3', '113,097336')      // 36π
})

test('Pitágoras, trigonometria e geometria analítica', () => {
    confere('pitagoras', '3 4', '5')
    confere('pitagorascateto', '5 3', '4')
    confere('trigangulo', '30', '0,5')                       // seno de 30°
    confere('trigtriangulo', '30 10', '5', '8,660254')       // catetos
    confere('leisenos', '10 30 45', '14,142136')             // 20 × sen 45°
    confere('leicossenos', '3 4 90', '5')                    // vira Pitágoras
    confere('grausrad', '180', '3,141593')
    confere('distanciapontos', '0 0 3 4', '5')
    confere('pontomedio', '0 0 4 6', '(2, 3)')
    confere('equacaoreta', '1 2 3 6', 'y = 2x')
})

test('progressões', () => {
    confere('pa', '2 3 10', '29')            // 2 + 9×3
    confere('pasoma', '1 2 10', '100')       // 10 × (1+19)/2
    confere('pg', '2 3 5', '162')            // 2 × 3^4
    confere('pgsoma', '1 2 10', '1.023')     // 2^10 - 1
})

test('contagem e probabilidade', () => {
    confere('fatorial', '5', '120')
    confere('arranjo', '5 2', '20')
    confere('combinacao', '5 2', '10')
    confere('combinacao', '10 3', '120')
    confere('anagramas', 'BANANA', '60')                  // 6! ÷ (3!×2!)
    confere('probabilidade', '1 6', '16,6667%')
    confere('probdados', '7', '16,6667%')                 // 6 em 36
    confere('probbinomial', '10 50 5', '24,6094%')        // C(10,5) ÷ 1024
    confere('probmega', '6', '50.063.860')                // C(60,6)
})

// ─────────────────────────────────────────────────────────────────────────
// (a) FÍSICA
// ─────────────────────────────────────────────────────────────────────────

test('cinemática: velocidade, aceleração, MRU e MRUV', () => {
    confere('vmedia', '100 4', '25')
    confere('aceleracao', '0 30 10', '3')
    confere('mru', '0 20 5', '100')                  // 0 + 20×5
    confere('mruvvel', '0 2 10', '20')               // v = 0 + 2×10
    confere('mruvpos', '0 0 2 5', '25')              // ½ × 2 × 25
    confere('torricelli', '0 2 50', '14,1421')       // v² = 2×2×50
})

test('queda livre e lançamentos usam g = 9,8 m/s²', () => {
    // h = 20 m: t = raiz(40/9,8) = 2,0203 s e v = 19,799 m/s.
    confere('quedalivre', '20', '2,0203', '19,799')
    // v0 = 20 m/s: sobe v²/2g = 20,408 m e fica 2×20/9,8 = 4,0816 s no ar.
    confere('lancvertical', '20', '20,4082', '4,0816')
    // 45°: alcance v²/g = 40,816 m e altura v²/4g = 10,204 m.
    confere('lancobliquo', '20 45', '40,8163', '10,2041')
})

test('circular, forças e dinâmica', () => {
    confere('mcu', '2 4', '3,1416')                  // 2π×2 ÷ 4
    confere('acentripeta', '20 50', '8')             // 400 ÷ 50
    confere('forcaresultante', '10 5', '50')
    confere('peso', '70', '686')                     // 70 × 9,8
    confere('atrito', '0,3 50', '147')               // 0,3 × 50 × 9,8
    confere('planoinclinado', '10 30', '49', '4,9')  // mg·sen30 e g·sen30
    confere('hooke', '200 0,1', '20')
    confere('elevador', '70 2', '826')               // 70 × 11,8
    confere('quantmovimento', '1000 20', '20.000')
    confere('colisaoinelastica', '1000 20 1500 0', '8')  // 20000 ÷ 2500
})

test('trabalho, energia e potência', () => {
    confere('trabalho', '50 10', '500')
    confere('energiacinetica', '1000 20', '200.000')     // ½ × 1000 × 400
    confere('energiapotencial', '2 10', '196')           // 2 × 9,8 × 10
    confere('energiaelastica', '200 0,1', '1')           // ½ × 200 × 0,01
    confere('potenciamecanica', '1000 5', '200')
    confere('rendimento', '300 1000', '30%')
})

test('densidade, pressão e hidrostática', () => {
    confere('densidade', '200 100', '2')
    confere('pressao', '100 2', '50')
    confere('pressaohidrostatica', '10', '98.000')       // 1000 × 9,8 × 10
    confere('empuxo', '10', '98')                        // 10 L = 0,01 m³
    confere('prensahidraulica', '100 0,01 0,5', '5.000')
})

test('calor, temperatura e dilatação', () => {
    // 500 g de água subindo 20 °C: Q = 500 × 1 × 20 = 10.000 cal.
    confere('calorsensivel', '500 agua 20', '10.000')
    // Fusão do gelo: 80 cal/g × 100 g = 8.000 cal.
    confere('calorlatente', '100 agua fusao', '8.000')
    // 200 g a 80 °C com 300 g a 20 °C: (16000+6000)/500 = 44 °C.
    confere('equilibriotermico', '200 80 300 20', '44')
    confere('temperaturaconv', '100 C', '212', '373,15')
    confere('temperaturaconv', '32 F', '0')
})

test('óptica e ondas', () => {
    // Objeto a 30 da lente de foco 10: 1/p' = 1/10 - 1/30 → p' = 15.
    confere('lentes', '30 10', '15')
    confere('espelhos', '30 10', '15')
    confere('vergencia', '0,5', '2')                     // 1 ÷ 0,5
    // Ar para água: asen(sen30° ÷ 1,33) = 22,082°.
    confere('snell', '1 30 1,33', '22,082')
    confere('ondavelocidade', '0,5 680', '340')
    confere('periodofrequencia', '60', '60')
})

test('eletricidade e a conta de luz', () => {
    confere('ohm', '12 4', '3')
    confere('potenciaeletrica', '220 5', '1.100')
    confere('resistoresserie', '10 20 30', '60')
    confere('resistoresparalelo', '10 10', '5')
    confere('consumokwh', '100 5 30', '15')              // 100 W × 5 h × 30 d
    confere('contadeluz', '250 0,92', 'R$ 230,00')
})

test('fichas de referência trazem dado conferido', () => {
    const c = tela('constantesfisicas', 'luz')
    assert.ok(/299\.792\.458|299 792 458/.test(c), `velocidade da luz não bateu:\n${c}`)
    const si = tela('unidadessi', 'massa')
    assert.ok(/quilograma|kg/i.test(si), `unidade de massa não apareceu:\n${si}`)
})

// ─────────────────────────────────────────────────────────────────────────
// (a) QUÍMICA
// ─────────────────────────────────────────────────────────────────────────

test('tabela periódica e estrutura do átomo', () => {
    confere('elemento', 'Na', 'Sódio', '11', '22,99')
    confere('elemento', 'O', 'Oxigênio', '8')
    confere('particulas', 'Na', '11 prótons', '12 nêutrons')
    confere('valencia', 'O', '6')
    confere('isotopos', '12 6 14 6', 'isótopos')
    // Cloro: 34,969×75,77% + 36,966×24,23% = 35,4529 u.
    confere('massaatomicamedia', '34,969 75,77 36,966 24,23', '35,4529')
    confere('familia', 'halogenios', '17')
})

test('distribuição eletrônica segue o diagrama de Pauling', () => {
    // Ferro (Z=26): o 4s enche antes do 3d.
    confere('distribuicao', '26', '1s2 2s2 2p6 3s2 3p6 4s2 3d6')
    confere('distribuicao', '2', '1s2')
    confere('distribuicao', '11', '1s2 2s2 2p6 3s1')
})

test('massa molar e mol', () => {
    confere('massamolar', 'H2O', '18,015')            // 2×1,008 + 15,999
    confere('massamolar', 'H2SO4', '98,072')
    confere('massamolar', 'NaCl', '58,44')
    confere('molparamassa', '2 H2O', '36,03')
    confere('avogadro', '1', '6,022')
    confere('volumemolar', '2', '44,8')               // 2 × 22,4 L
    confere('densidadegas', 'CO2', '1,96')            // 44,009 ÷ 22,4
})

test('balanceamento fecha átomo por átomo', () => {
    confere('balanceamento', 'C3H8 + O2 = CO2 + H2O', 'C3H8 + 5O2 → 3CO2 + 4H2O')
    confere('balanceamento', 'H2 + O2 = H2O', '2H2 + O2 → 2H2O')
})

test('soluções: concentração, diluição e título', () => {
    confere('concentracaocomum', '20 4', '5')
    confere('molaridade', '58,5 NaCl 1', '1,001')
    confere('diluicao', '2 100 500', '0,4')               // C1V1 = C2V2
    confere('misturasolucoes', '2 100 0,5 200', '1')      // (200+100)/300
    confere('titulomassa', '5 100', '5%')
    confere('ppm', '0,002 1000', '2 ppm')
    confere('molalidade', '0,5 1', '0,5')
})

test('pH, pOH e a escala da água', () => {
    confere('ph', '0,001', '3')
    confere('ph', '1e-5', '5')
    confere('poh', '4', 'pH = 4', 'pOH = 10')
    confere('poh', '9 poh', 'pH = 5', 'pOH = 9')
    confere('hidrogenionica', '3', '10^-3')
    // O passo a passo não pode vazar NaN — já vazou uma vez.
    assert.ok(!LIXO.test(tela('poh', '4')), 'a tela de pOH trouxe NaN/undefined')
})

test('ligações, geometria, funções e gases', () => {
    confere('classificafuncao', 'H2SO4', 'ácido')
    confere('tipoligacao', 'Na Cl', 'iônica')
    confere('geometria', 'H2O', 'angular', 'polar')
    confere('polaridade', 'CO2', 'apolar')
    confere('composicaopercentual', 'H2O', 'Oxigênio')
    confere('formulaminima', 'C 40 H 6,7 O 53,3', 'CH2O')
    // PV = nRT com T = 27 °C = 300,15 K.
    confere('boyle', '1 10 2', '5')                       // P1V1 = P2V2
    confere('charles', '10 27 127', '13,33')              // V2 = 10 × 400,15/300,15
    confere('equacaogeralgases', '1 10 27 2 127', '6,66')
    confere('hidrocarboneto', '1 alcano', 'metano', 'CH4')
    confere('nomenclaturaorganica', '2 alcool', 'etanol')
})

// ─────────────────────────────────────────────────────────────────────────
// (a) OS CASOS QUE DERRUBAM CONTA
// ─────────────────────────────────────────────────────────────────────────

test('delta negativo não vira raiz quebrada', () => {
    const t = tela('eq2grau', 'x²+2x+5')
    assert.ok(t.includes('não tem raiz real'), `delta negativo mal explicado:\n${t}`)
    assert.ok(!LIXO.test(t), 'delta negativo vazou NaN')
    confere('delta', '1 2 5', '-16')
})

test('divisão por zero é recusada com explicação', () => {
    recusa('vmedia', '100 0', 'zero')
    recusa('regratres', '0 12 5', 'zero')
    recusa('densidade', '10 0', 'zero')
    recusa('ohm', '12 0', 'zero')
    recusa('simplificarfracao', '5/0', 'zero')
    recusa('concentracaocomum', '20 0', 'zero')
})

test('raiz de número negativo é recusada, mas índice ímpar passa', () => {
    recusa('raiz', '-9', 'negativo')
    confere('raizn', '-8 3', '-2')
    recusa('raizn', '-9 2', 'negativo')
})

test('entrada inválida vira conversa, nunca exceção crua', () => {
    recusa('mdc', 'banana')
    recusa('media', 'nada aqui')
    recusa('massamolar', 'Zz', 'Zz')
    recusa('elemento', 'Xyz')
    recusa('logaritmo', '0', 'maior que zero')
    recusa('logaritmo', '8 1', 'base')
    recusa('combinacao', '5 9')
    recusa('eq2grau', '0x²+2x+4', 'primeiro grau')
    recusa('ph', '0', 'maior que zero')
    recusa('balanceamento', 'abc = def')
})

test('número gigante não estoura nem imprime Infinity', () => {
    recusa('fatorial', '171', '170')
    recusa('potencia', '9 99999', 'grande demais')
    recusa('primosate', '1000000', '5.000')
    // 170! ainda cabe: precisa sair em notação científica, não como Infinity.
    const t = tela('fatorial', '170')
    assert.ok(!LIXO.test(t), `170! vazou Infinity:\n${t}`)
    assert.ok(t.includes('10^'), `170! devia sair em notação científica:\n${t}`)
    // Expoente absurdo na notação científica também é recusado.
    recusa('denotacao', '3 400', 'expoente')
})

test('nenhuma tela do serviço vaza NaN, undefined ou moldura quebrada', () => {
    const sujos = []
    for (const t of E.listarTopicos()) {
        const entradas = [[], ...t.examples.map(ex => String(ex).split(' — ')[0].trim().split(/\s+/))]
        for (const args of entradas) {
            const txt = F.tela(E.responder(t.chave, args, { comando: t.comando }))
            const rotulo = `${t.comando}/${t.chave} "${args.join(' ')}"`
            if (LIXO.test(txt)) sujos.push(`${rotulo}: ${txt.match(LIXO)[0]}`)
            if (molduraQuebrada(txt)) sujos.push(`${rotulo}: moldura quebrada`)
            if (MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(txt))) sujos.push(`${rotulo}: marcador de código`)
            if (ENCHIMENTO.test(txt)) sujos.push(`${rotulo}: enchimento`)
            if (txt.trim().length < 40) sujos.push(`${rotulo}: resposta curta`)
        }
    }
    assert.strictEqual(sujos.length, 0, `${sujos.length} telas sujas:\n     ${sujos.slice(0, 10).join('\n     ')}`)
})

test('entrada hostil não derruba nenhum dos 180 tópicos', () => {
    const HOSTIL = [['0'], ['-1'], ['0', '0'], ['1e308', '1e308'], ['abc'], ['???'], ['-'],
        ['999999999999999999999'], ['1', '0'], ['0', '100'], ['á é í'], ['🙂'], ['1e-320']]
    const quebrados = []
    for (const t of E.listarTopicos()) {
        for (const args of HOSTIL) {
            try {
                const txt = F.tela(E.responder(t.chave, args, { comando: t.comando }))
                if (txt.trim().length < 40) quebrados.push(`${t.comando} "${args.join(' ')}": resposta curta`)
            } catch (e) {
                quebrados.push(`${t.comando}/${t.chave} "${args.join(' ')}": ${e.constructor.name} — ${e.message}`)
            }
        }
    }
    assert.strictEqual(quebrados.length, 0, `${quebrados.length} quebraram:\n     ${quebrados.slice(0, 10).join('\n     ')}`)
})

// ─────────────────────────────────────────────────────────────────────────
// (b) OS 180 COMANDOS EM DISCO
// ─────────────────────────────────────────────────────────────────────────

/** Contexto falso: o comando responde aqui em vez de falar com o WhatsApp. */
function contextoFalso(saidas, args) {
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

;(async () => {
    const arquivos = fs.existsSync(PASTA)
        ? fs.readdirSync(PASTA).filter(a => /^mat\d+\.js$/.test(a)).sort((a, b) => parseInt(a.slice(3), 10) - parseInt(b.slice(3), 10))
        : []

    test('os 180 arquivos matN.js estão em src/commands/escola/', () => {
        assert.strictEqual(arquivos.length, 180, `achei ${arquivos.length} arquivos mat*.js`)
        for (let i = 1; i <= 180; i++) {
            assert.ok(arquivos.includes(`mat${i}.js`), `faltou mat${i}.js`)
        }
    })

    const comandos = []
    test('todo comando carrega e segue o schema do projeto', () => {
        for (const arq of arquivos) {
            const cmd = require(path.join(PASTA, arq))
            assert.ok(cmd && typeof cmd === 'object', `${arq} não exporta objeto`)
            assert.strictEqual(cmd.name, arq.replace('.js', ''), `${arq}: name não bate com o arquivo`)
            assert.strictEqual(typeof cmd.execute, 'function', `${arq} sem execute`)
            assert.strictEqual(cmd.category, 'escola', `${arq}: categoria ${cmd.category}`)
            assert.ok(['Matemática', 'Física', 'Química'].includes(cmd.subcategory), `${arq}: subcategoria "${cmd.subcategory}" fora da lista`)
            assert.strictEqual(cmd.cooldownMs, 3000, `${arq}: cooldown ${cmd.cooldownMs}`)
            assert.ok((cmd.aliases || []).every(a => typeof a === 'string' && a && a !== cmd.name), `${arq} aliases inválidos`)
            assert.ok(cmd.description && cmd.description.length <= 55, `${arq}: description com ${(cmd.description || '').length} caracteres`)
            assert.ok(cmd.usage, `${arq} sem usage`)
            assert.ok(Array.isArray(cmd.examples) && cmd.examples.length, `${arq} sem examples`)
            for (const chave of Object.keys(cmd)) {
                assert.ok(CHAVES_PERMITIDAS.has(chave), `${arq}: chave "${chave}" fora do schema`)
            }
            comandos.push({ arq, cmd })
        }
    })

    test('nenhuma descrição repetida entre os 180', () => {
        const vistos = new Map()
        for (const { arq, cmd } of comandos) {
            const antes = vistos.get(cmd.description)
            assert.ok(!antes, `${arq} e ${antes} repetem a descrição "${cmd.description}"`)
            vistos.set(cmd.description, arq)
        }
    })

    test('a família cobre as três matérias na proporção combinada', () => {
        const porSub = {}
        for (const { cmd } of comandos) porSub[cmd.subcategory] = (porSub[cmd.subcategory] || 0) + 1
        assert.strictEqual(porSub['Matemática'], 90, `Matemática tem ${porSub['Matemática']}`)
        assert.strictEqual(porSub['Física'], 50, `Física tem ${porSub['Física']}`)
        assert.strictEqual(porSub['Química'], 40, `Química tem ${porSub['Química']}`)
    })

    // O teste que importa: cada comando responde alguma coisa de verdade?
    const semResposta = []
    const comCaixa = []
    const comLixo = []
    const quebrados = []
    const semExemplo = []

    for (const { arq, cmd } of comandos) {
        // (1) Sem argumento: tela curta de ajuda, com exemplo pronto para copiar.
        const saidas = []
        try {
            await cmd.execute(contextoFalso(saidas, []))
        } catch (err) {
            quebrados.push(`${arq} sem argumento: ${err.message}`)
            continue
        }
        const ajuda = saidas.join('\n')
        if (ajuda.trim().length <= 40) semResposta.push(`${arq} (${ajuda.trim().length} caracteres)`)
        if (molduraQuebrada(ajuda)) comCaixa.push(arq)
        if (LIXO.test(ajuda) || ENCHIMENTO.test(ajuda) || MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(ajuda))) comLixo.push(arq)
        if (!ajuda.includes('`.' + cmd.name)) semExemplo.push(arq)

        // (2) Com o primeiro exemplo do próprio comando: a conta de verdade.
        const args = String(cmd.examples[0]).split(' — ')[0].trim().split(/\s+/)
        const saidas2 = []
        try {
            await cmd.execute(contextoFalso(saidas2, args))
        } catch (err) {
            quebrados.push(`${arq} "${args.join(' ')}": ${err.message}`)
            continue
        }
        const conta = saidas2.join('\n')
        if (conta.trim().length <= 40) semResposta.push(`${arq} rodando "${args.join(' ')}" (${conta.trim().length} caracteres)`)
        if (molduraQuebrada(conta)) comCaixa.push(`${arq} (rodando)`)
        if (LIXO.test(conta) || ENCHIMENTO.test(conta) || MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(conta))) comLixo.push(`${arq} (rodando)`)
        if (!conta.includes('*')) semResposta.push(`${arq}: resposta não passou pelo F.tela`)
    }

    test('nenhum dos 180 comandos estoura ao rodar', () => {
        assert.strictEqual(quebrados.length, 0, `${quebrados.length} quebraram:\n     ${quebrados.slice(0, 8).join('\n     ')}`)
    })

    test('os 180 comandos respondem mais de 40 caracteres de conteúdo', () => {
        assert.strictEqual(semResposta.length, 0, `${semResposta.length} sem resposta de verdade:\n     ${semResposta.slice(0, 8).join('\n     ')}`)
    })

    test('a tela de ajuda traz o exemplo pronto do próprio comando', () => {
        assert.strictEqual(semExemplo.length, 0, `${semExemplo.length} sem exemplo copiável: ${semExemplo.slice(0, 8).join(', ')}`)
    })

    test('moldura bem formada na resposta', () => {
        assert.strictEqual(comCaixa.length, 0, `${comCaixa.length} com moldura quebrada: ${comCaixa.slice(0, 8).join(', ')}`)
    })

    test('nenhuma resposta com NaN, enchimento ou marcador de código', () => {
        assert.strictEqual(comLixo.length, 0, `${comLixo.length} com lixo: ${comLixo.slice(0, 8).join(', ')}`)
    })

    test('o manifesto do gerador bate com o que está em disco', () => {
        const caminho = path.join(__dirname, '..', 'scripts', 'manifests', 'mat_arquivos.json')
        assert.ok(fs.existsSync(caminho), 'scripts/manifests/mat_arquivos.json não existe')
        const m = JSON.parse(fs.readFileSync(caminho, 'utf8'))
        assert.strictEqual(m.total, 180, `manifesto diz ${m.total}`)
        assert.strictEqual(m.comandos.length, 180, `manifesto lista ${m.comandos.length}`)
        for (const c of m.comandos) {
            assert.ok(fs.existsSync(path.join(__dirname, '..', c.arquivo)), `manifesto aponta para ${c.arquivo}, que não existe`)
        }
    })

    console.log('\n========================================')
    console.log(`📊 Escola — exatas: ✅ ${pass} ❌ ${fail}`)
    console.log('========================================\n')
    if (fail > 0) {
        console.log('Falhas:')
        falhas.forEach(f => console.log('  • ' + f))
        process.exit(1)
    }
})()
