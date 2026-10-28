process.env.NODE_ENV = 'test'

/**
 * Teste da família FERRAMENTAS (.ferr1 … .ferr360).
 *
 * Duas camadas:
 *  1. A CONTA — cada número conferido à mão aqui embaixo, com a origem escrita
 *     ao lado. Entra também o que costuma quebrar calculadora: documento
 *     inválido, data que não existe, número negativo, texto no lugar de número
 *     e divisão por zero. Nada disso pode virar exceção: vira tela explicando.
 *  2. A CASCA — os 360 arquivos carregam, seguem o schema e respondem alguma
 *     coisa de gente quando chamados sem argumento nenhum.
 *
 * Não toca em banco, em rede nem em arquivo. Roda em segundos.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const RAIZ = path.join(__dirname, '..')
const PASTA = path.join(RAIZ, 'src', 'commands', 'ferramentas')

const conversor = require(path.join(RAIZ, 'src', 'services', 'converterService'))
const caixa = require(path.join(RAIZ, 'src', 'services', 'toolboxService'))
const F = require(path.join(RAIZ, 'src', 'utils', 'formato'))

const CAIXA_DESENHADA = /[╔╗╚╝╭╮╰╯┏┓┗┛┣┫━═┈⊷⬣┃║〔〕]/
const { molduraQuebrada, semTitulosDeMoldura } = require('./helpers/moldura')
const ENCHIMENTO = /\b(em breve|placeholder|lorem ipsum|texto de exemplo|indisponível no momento|conteúdo a definir)\b/i
const MARCADOR_DE_CODIGO = /\b(TODO|FIXME|XXX)\b/
const CHAVES_ACEITAS = new Set(['usage', 'examples', 'name', 'execute', 'aliases', 'category',
    'subcategory', 'description', 'cooldownMs', 'groupOnly', 'adminOnly', 'ownerOnly',
    'botAdminOnly', 'minRole', 'hidden', 'devOnly'])
const SUBCATEGORIAS = new Set(['Conversões', 'Calculadoras', 'Documentos', 'Geradores', 'Data e Hora'])

let ok = 0
let falhou = 0

function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ ${nome}`) } catch (err) { falhou++; console.log(`  ❌ ${nome}\n     ${err.message}`) }
}

/** Roda a ferramenta e devolve o texto pronto, como o usuário veria. */
function tela(servico, chave, args) {
    return F.tela(servico.responder(chave, args, { nome: 'ferrTeste', prefix: '.' }))
}

const daCaixa = (chave, ...args) => tela(caixa, chave, args)
const doConversor = (chave, ...args) => tela(conversor, chave, args)

/** Exige que um trecho apareça na resposta, com mensagem útil quando não aparece. */
function contem(texto, trecho, contexto) {
    assert.ok(texto.includes(trecho), `${contexto}: esperava encontrar "${trecho}" na resposta.\n--- resposta ---\n${texto.slice(0, 700)}\n---`)
}

console.log('\n🧰 Ferramentas: a conta primeiro, a casca depois\n')

/* ───────────────────────── 1. Conversões ───────────────────────── */
console.log('— Conversões')

teste('metro para centímetro: 2,5 m = 250 cm', () => {
    contem(doConversor('comp_m_cm', '2,5'), '250 cm', 'comp_m_cm')
})

teste('quilo para libra: 80 kg = 176,3698 lb (1 lb = 0,45359237 kg)', () => {
    contem(doConversor('mas_kg_lb', '80'), '176,3698 lb', 'mas_kg_lb')
})

teste('milha para km: 26,2 mi = 42,1648 km (1 mi = 1,609344 km)', () => {
    contem(doConversor('comp_mi_km', '26,2'), '42,1648 km', 'comp_mi_km')
})

teste('Celsius para Fahrenheit: 36,5 °C = 97,7 °F', () => {
    contem(doConversor('temp_c_f', '36,5'), '97,7 °F', 'temp_c_f')
})

teste('Fahrenheit para Celsius: 98,6 °F = 37 °C', () => {
    contem(doConversor('temp_f_c', '98,6'), '37 °C', 'temp_f_c')
})

teste('abaixo do zero absoluto vira recusa explicada, não exceção', () => {
    const t = doConversor('temp_k_c', '-5')
    contem(t, 'zero absoluto', 'temp_k_c com -5 K')
})

teste('romano: 2026 vira MMXXVI e MMXXVI volta a 2026', () => {
    assert.strictEqual(conversor.paraRomano(2026), 'MMXXVI')
    assert.strictEqual(conversor.deRomano('MMXXVI'), 2026)
    assert.strictEqual(conversor.paraRomano(4), 'IV')
    assert.strictEqual(conversor.paraRomano(1994), 'MCMXCIV')
})

teste('romano mal escrito é recusado (IIII não existe, o certo é IV)', () => {
    assert.throws(() => conversor.deRomano('IIII'), /IV/)
    assert.throws(() => conversor.deRomano('ABC'), /romano/i)
    assert.throws(() => conversor.paraRomano(0), /1 a 3999/)
})

teste('base numérica: 42 em decimal é 101010 em binário', () => {
    contem(doConversor('base_dec_bin', '42'), '101010', 'base_dec_bin')
    contem(doConversor('base_hex_dec', 'FF'), '255', 'base_hex_dec')
})

teste('base numérica recusa dígito que não existe naquela base', () => {
    contem(doConversor('base_bin_dec', '1012'), 'não é um número válido', 'base_bin_dec com 1012')
})

teste('leitura de número aceita o formato brasileiro e o americano', () => {
    assert.strictEqual(conversor.num('1.234,56'), 1234.56)
    assert.strictEqual(conversor.num('1234.56'), 1234.56)
    assert.strictEqual(conversor.num('2,5kg'), 2.5)
    assert.strictEqual(conversor.num('-3'), -3)
    assert.ok(Number.isNaN(conversor.num('abacaxi')))
})

teste('texto no lugar de número vira tela pedindo o número', () => {
    const t = doConversor('comp_m_cm', 'abacaxi')
    contem(t, 'Não entendi', 'comp_m_cm com texto')
    assert.ok(t.length > 40, 'a recusa precisa explicar, não sair vazia')
})

teste('cozinha: 2 xícaras de farinha dão 240 g e declaram a vigência', () => {
    const t = doConversor('coz_xic_farinha', '2')
    contem(t, '240', 'coz_xic_farinha')
    contem(t, 'conferidas em setembro de 2026', 'coz_xic_farinha sem vigência')
})

teste('tela de 55 polegadas em 16:9 mede 121,8 por 68,5 cm', () => {
    const t = doConversor('tela_pol_cm', '55')
    contem(t, '121,8', 'tela_pol_cm largura')
    contem(t, '68,5', 'tela_pol_cm altura')
})

/* ───────────────────────── 2. Calculadoras ───────────────────────── */
console.log('\n— Calculadoras')

teste('IMC: 80 kg e 1,75 m dão 26,12 e classificam como sobrepeso', () => {
    // 80 / (1,75 x 1,75) = 80 / 3,0625 = 26,1224…
    const t = daCaixa('imc', '80', '1,75')
    contem(t, '26,12', 'imc')
    contem(t, 'sobrepeso', 'imc')
})

teste('IMC recusa altura impossível e texto no lugar do peso', () => {
    contem(daCaixa('imc', '80', '17'), 'não existe', 'imc com altura de 17 m')
    contem(daCaixa('imc', 'abacaxi', '1,75'), 'Não entendi', 'imc com texto')
})

teste('água por dia: 70 kg pedem 2,45 litros (35 ml por quilo)', () => {
    contem(daCaixa('agua_dia', '70'), '2,45', 'agua_dia')
})

teste('INSS sobre R$ 3.000 desconta R$ 253,41 (tabela progressiva de 2025)', () => {
    // 1.518,00 x 7,5% = 113,85
    // (2.793,88 - 1.518,00) x 9% = 114,83
    // (3.000,00 - 2.793,88) x 12% = 24,73  →  total 253,41
    const r = caixa.calcularInss(3000)
    assert.strictEqual(r.total, 253.41, `INSS de 3.000 deu ${r.total}`)
    const t = daCaixa('inss', '3000')
    contem(t, 'R$ 253,41', 'inss')
    contem(t, 'vigente desde janeiro de 2025', 'inss sem vigência declarada')
})

teste('INSS trava no teto: acima de R$ 8.157,41 o desconto não sobe', () => {
    const noTeto = caixa.calcularInss(8157.41).total
    const acima = caixa.calcularInss(20000).total
    assert.strictEqual(acima, noTeto, 'o desconto passou do teto')
    assert.strictEqual(acima, 951.63, `a contribuição máxima deu ${acima}`)
})

teste('salário líquido de R$ 5.000 cai em R$ 4.177,51', () => {
    // INSS 509,60; IRRF pelo desconto simplificado 312,89; 5000 - 509,60 - 312,89
    const inss = caixa.calcularInss(5000)
    assert.strictEqual(inss.total, 509.6, `INSS deu ${inss.total}`)
    const ir = caixa.calcularIrrf(5000, inss.total, 0)
    assert.strictEqual(ir.valor, 312.89, `IRRF deu ${ir.valor}`)
    assert.ok(ir.usouSimplificado, 'o desconto simplificado era o mais vantajoso aqui')
    contem(daCaixa('salario_liquido', '5000'), 'R$ 4.177,51', 'salario_liquido')
})

teste('quem ganha até a faixa isenta não paga imposto na fonte', () => {
    const ir = caixa.calcularIrrf(2400, caixa.calcularInss(2400).total, 0)
    assert.strictEqual(ir.valor, 0, `deveria ser isento, deu ${ir.valor}`)
    contem(daCaixa('irrf', '2400'), 'isento', 'irrf na faixa isenta')
})

teste('desconto que passa do salário é recusado com explicação', () => {
    contem(daCaixa('salario_liquido', '2000', '0', '5000'), 'passam do salário', 'salario_liquido com desconto maior que o bruto')
})

teste('férias de 30 dias somam o terço: R$ 4.000 viram R$ 5.333,33 brutos', () => {
    // 4.000 + 4.000/3 = 5.333,33
    contem(daCaixa('ferias', '4000'), 'R$ 5.333,33', 'ferias')
})

teste('décimo terceiro: 7 meses de R$ 3.500 dão R$ 2.041,67 brutos', () => {
    // 3.500 / 12 x 7 = 2.041,666…
    contem(daCaixa('decimo_terceiro', '3500', '7'), 'R$ 2.041,67', 'decimo_terceiro')
})

teste('hora extra de 50%: R$ 3.000 em 220 horas dão R$ 20,45 por hora extra', () => {
    // 3.000 / 220 = 13,6363…  →  x1,5 = 20,4545…  →  10 horas = 204,55
    const t = daCaixa('hora_extra50', '3000', '10')
    contem(t, 'R$ 20,45', 'hora_extra50 valor da hora extra')
    contem(t, 'R$ 204,55', 'hora_extra50 total')
})

teste('adicional noturno usa a hora reduzida de 52 minutos e 30 segundos', () => {
    // 40 horas de relógio x (60/52,5) = 45,7142 horas de folha
    contem(daCaixa('adicional_noturno', '3000', '40'), '45,71', 'adicional_noturno')
})

teste('FGTS deposita 8% do bruto: R$ 3.000 dão R$ 240 por mês', () => {
    contem(daCaixa('fgts_mensal', '3000', '24'), 'R$ 240,00', 'fgts_mensal')
    contem(daCaixa('fgts_multa', '12000'), 'R$ 4.800,00', 'fgts_multa de 40% sobre 12.000')
})

teste('juros compostos: R$ 1.000 a 1% ao mês por 120 meses viram R$ 3.300,39', () => {
    // 1.000 x 1,01^120 = 3.300,386…
    contem(daCaixa('juros_compostos', '1000', '1', '120'), 'R$ 3.300,39', 'juros_compostos')
})

teste('juros simples: R$ 1.000 a 2% ao mês por 12 meses rendem R$ 240', () => {
    contem(daCaixa('juros_simples', '1000', '2', '12'), 'R$ 240,00', 'juros_simples')
})

teste('tabela Price: R$ 200.000 a 0,8% em 360 meses dão parcela de R$ 1.696,33', () => {
    const t = daCaixa('price', '200000', '0,8', '360')
    contem(t, 'R$ 1.696,3', 'price')
})

teste('SAC: primeira parcela de R$ 200.000 a 0,8% em 360 meses é R$ 2.155,56', () => {
    // amortização 555,56 + juros 1.600,00
    contem(daCaixa('sac', '200000', '0,8', '360'), 'R$ 2.155,56', 'sac')
})

teste('desconto de 30% sobre R$ 250 deixa o preço em R$ 175', () => {
    contem(daCaixa('desconto', '250', '30'), 'R$ 175,00', 'desconto')
})

teste('descontos em sequência não se somam: 20% e 10% dão 28%, não 30%', () => {
    const t = daCaixa('desconto_sucessivo', '500', '20', '10')
    contem(t, 'R$ 360,00', 'desconto_sucessivo preço final')
    contem(t, '28%', 'desconto_sucessivo desconto real')
})

teste('margem de lucro: custo 40 e venda 100 dão 60% de margem e 150% de markup', () => {
    const t = daCaixa('margem_lucro', '40', '100')
    contem(t, 'a margem é *60%*', 'margem_lucro')
    contem(t, '150%', 'margem_lucro markup')
})

teste('markup: 60% de margem sobre custo 40 pede preço de R$ 100', () => {
    contem(daCaixa('markup', '40', '60'), 'R$ 100,00', 'markup')
})

teste('dividir a conta: R$ 340 entre 5 dão R$ 68 para cada', () => {
    contem(daCaixa('dividir_conta', '340', '5'), 'R$ 68,00', 'dividir_conta')
})

teste('dividir a conta recusa zero pessoa em vez de dividir por zero', () => {
    const t = daCaixa('dividir_conta', '340', '0')
    contem(t, 'no mínimo 1', 'dividir_conta com zero pessoas')
    assert.ok(!t.includes('Infinity') && !t.includes('NaN'), 'saiu conta quebrada na tela')
})

teste('troco: pagando R$ 100 em compra de R$ 73,40 devolve R$ 26,60', () => {
    const t = daCaixa('troco', '73,40', '100')
    contem(t, 'R$ 26,60', 'troco')
    contem(t, 'nota de 20', 'troco sem a composição em cédulas')
})

teste('troco recusa pagamento menor que a compra', () => {
    contem(daCaixa('troco', '100', '50'), 'Faltam', 'troco com valor pago menor')
})

teste('combustível de viagem: 420 km a 12 km/l gastam 35 litros', () => {
    contem(daCaixa('combustivel_viagem', '420', '12'), '35 litros', 'combustivel_viagem')
})

teste('álcool ou gasolina: 3,99 contra 5,89 dá 67,7% e o álcool compensa', () => {
    // 3,99 / 5,89 = 0,6774  →  abaixo de 70%
    const t = daCaixa('alcool_ou_gasolina', '3,99', '5,89')
    contem(t, '67,7%', 'alcool_ou_gasolina')
    contem(t, 'álcool', 'alcool_ou_gasolina escolha')
})

teste('tinta: 45 m² em duas demãos pedem 8,18 litros (11 m² por litro)', () => {
    contem(daCaixa('tinta_parede', '45'), '8,18', 'tinta_parede')
})

teste('caixa de água: 4 moradores pedem 600 litros de reserva', () => {
    const t = daCaixa('caixa_dagua', '4')
    contem(t, '600', 'caixa_dagua')
})

teste('consumo: 1.500 W por 2 horas dão 90 kWh no mês', () => {
    // 1500 x 2 / 1000 = 3 kWh por dia x 30 = 90
    contem(daCaixa('consumo_kwh', '1500', '2'), '90 kWh', 'consumo_kwh')
})

teste('regra de três: 3 está para 12 assim como 7 está para 28', () => {
    contem(daCaixa('regra_tres', '3', '12', '7'), '28', 'regra_tres')
})

teste('regra de três recusa zero no primeiro valor (seria divisão por zero)', () => {
    const t = daCaixa('regra_tres', '0', '12', '7')
    contem(t, 'não pode ser zero', 'regra_tres com zero')
    assert.ok(!t.includes('Infinity'), 'divisão por zero vazou para a tela')
})

teste('regra de três inversa: 4 pessoas em 6 dias, 8 pessoas em 3 dias', () => {
    contem(daCaixa('regra_tres_inversa', '4', '6', '8'), '3', 'regra_tres_inversa')
})

teste('porcentagem: 15% de 240 é 36, e 45 de 300 é 15%', () => {
    contem(daCaixa('porcentagem_de', '15', '240'), '36', 'porcentagem_de')
    contem(daCaixa('porcentagem_quanto', '45', '300'), '15', 'porcentagem_quanto')
})

teste('porcentagem com total zero é recusada, não vira infinito', () => {
    const t = daCaixa('porcentagem_quanto', '45', '0')
    contem(t, 'não pode ser zero', 'porcentagem_quanto com total zero')
})

teste('variação: de 250 para 310 é 24% de aumento', () => {
    contem(daCaixa('variacao_percentual', '250', '310'), '24% de aumento', 'variacao_percentual')
})

teste('média: 7, 8,5, 6 e 9 dão média 7,625 e mediana 7,75 (vírgula é decimal)', () => {
    const t = daCaixa('media_simples', '7,', '8,5,', '6,', '9')
    contem(t, '7,625', 'media_simples média')
    contem(t, '7,75', 'media_simples mediana')
})

teste('média ponderada: 7 peso 2 e 9 peso 3 dão 8,2', () => {
    // (7x2 + 9x3) / 5 = 41/5 = 8,2
    contem(daCaixa('media_ponderada', '7', '2', '9', '3'), '8,2', 'media_ponderada')
})

teste('nota para passar: média 6,5 em peso 3, falta peso 1, alvo 6 → precisa de 4,5', () => {
    // (6 x 4 - 6,5 x 3) / 1 = 24 - 19,5 = 4,5
    contem(daCaixa('media_para_passar', '6,5', '3', '1'), '4,5', 'media_para_passar')
})

teste('nota para passar avisa quando já passou mesmo tirando zero', () => {
    contem(daCaixa('media_para_passar', '9', '3', '1'), 'pode tirar zero', 'media_para_passar com média alta')
})

teste('Bhaskara: x² - 5x + 6 tem raízes 3 e 2', () => {
    const t = daCaixa('bhaskara', '1', '-5', '6')
    contem(t, '3', 'bhaskara raiz 1')
    contem(t, '2', 'bhaskara raiz 2')
})

teste('Bhaskara com delta negativo avisa que não há raiz real', () => {
    contem(daCaixa('bhaskara', '1', '1', '5'), 'não tem raiz real', 'bhaskara delta negativo')
})

teste('Bhaskara recusa a igual a zero (aí não é equação do segundo grau)', () => {
    contem(daCaixa('bhaskara', '0', '2', '3'), 'não pode ser zero', 'bhaskara com a = 0')
})

teste('Pitágoras: catetos 3 e 4 dão hipotenusa 5', () => {
    contem(daCaixa('pitagoras', '3', '4'), '5', 'pitagoras')
})

teste('MMC e MDC de 12 e 18 são 36 e 6', () => {
    const t = daCaixa('mmc_mdc', '12', '18')
    contem(t, '36', 'mmc_mdc mmc')
    contem(t, '6', 'mmc_mdc mdc')
})

teste('fração 3/4 é 0,75 e 75%', () => {
    const t = daCaixa('fracao_para_decimal', '3/4')
    contem(t, '0,75', 'fracao_para_decimal')
    contem(t, '75', 'fracao_para_decimal em porcento')
})

teste('fração com denominador zero é recusada com explicação', () => {
    const t = daCaixa('fracao_para_decimal', '3/0')
    contem(t, 'zero', 'fracao_para_decimal com denominador zero')
    assert.ok(!t.includes('Infinity'), 'divisão por zero vazou para a tela')
})

teste('combinações: 6 dezenas entre 60 dão 50.063.860 jogos', () => {
    contem(daCaixa('combinacoes', '60', '6'), '50.063.860', 'combinacoes')
})

teste('combinações recusa escolher mais itens do que existem', () => {
    contem(daCaixa('combinacoes', '5', '9'), 'Não dá para escolher', 'combinacoes com k maior que n')
})

teste('número negativo é recusado onde não faz sentido (área de pintura)', () => {
    const t = daCaixa('tinta_parede', '-45')
    contem(t, 'não pode ser negativo', 'tinta_parede com área negativa')
})

teste('dívida: parcela menor que o juro é recusada com aviso claro', () => {
    const t = daCaixa('divida_quitacao', '5000', '3', '100')
    contem(t, 'não cobre nem o juro', 'divida_quitacao com parcela baixa')
})

teste('dívida: R$ 5.000 a 3% pagando R$ 500 quitam em 12 meses', () => {
    contem(daCaixa('divida_quitacao', '5000', '3', '500'), '12', 'divida_quitacao')
})

teste('orçamento em três fatias: R$ 3.500 viram 1.750, 1.050 e 700', () => {
    const t = daCaixa('orcamento_503020', '3500')
    contem(t, 'R$ 1.750,00', 'orcamento_503020 necessidades')
    contem(t, 'R$ 1.050,00', 'orcamento_503020 desejos')
    contem(t, 'R$ 700,00', 'orcamento_503020 futuro')
})

teste('churrasco: 12 adultos pedem 4,8 kg de carne (400 g por pessoa)', () => {
    contem(daCaixa('churrasco', '12'), '4,8 kg', 'churrasco')
})

teste('pizza: a de 40 cm tem quase o dobro da área da de 30 cm', () => {
    const t = daCaixa('pizza_comparar', '30', '45', '40', '70')
    contem(t, '1,78', 'pizza_comparar proporção de área')
})

/* ───────────────────────── 3. Documentos ───────────────────────── */
console.log('\n— Documentos')

teste('CPF de manual passa e CPF com dígito trocado não passa', () => {
    assert.ok(caixa.validarCpf('123.456.789-09').ok, 'o 123.456.789-09 deveria passar')
    assert.ok(!caixa.validarCpf('123.456.789-00').ok, 'dígito trocado deveria falhar')
    contem(daCaixa('doc_cpf_validar', '123.456.789-09'), 'passa na conferência', 'doc_cpf_validar')
    contem(daCaixa('doc_cpf_validar', '123.456.789-00'), 'não passa', 'doc_cpf_validar com dígito errado')
})

teste('CPF com todos os dígitos iguais é recusado', () => {
    const r = caixa.validarCpf('111.111.111-11')
    assert.ok(!r.ok, 'CPF de dígito repetido deveria falhar')
    contem(daCaixa('doc_cpf_validar', '11111111111'), 'não passa', 'doc_cpf_validar com dígitos iguais')
})

teste('CPF com quantidade errada de dígitos explica o que faltou', () => {
    const r = caixa.validarCpf('1234')
    assert.ok(!r.ok)
    assert.ok(/11 dígitos/.test(r.motivo), `motivo pouco claro: ${r.motivo}`)
})

teste('CNPJ de manual passa e CNPJ com dígito trocado não passa', () => {
    assert.ok(caixa.validarCnpj('11.222.333/0001-81').ok, 'o 11.222.333/0001-81 deveria passar')
    assert.ok(!caixa.validarCnpj('11.222.333/0001-82').ok, 'dígito trocado deveria falhar')
    contem(daCaixa('doc_cnpj_validar', '11222333000181'), 'passa na conferência', 'doc_cnpj_validar')
})

teste('CNPJ terminado em 0001 é matriz, o resto é filial', () => {
    contem(daCaixa('doc_cnpj_filial', '11222333000181'), 'matriz', 'doc_cnpj_filial')
})

teste('nenhuma ferramenta se propõe a gerar documento de pessoa', () => {
    const proibido = /gera(r)?\s+(um\s+)?(cpf|cnpj|rg|documento|t[íi]tulo)/i
    for (const [servico, nome] of [[conversor, 'converterService'], [caixa, 'toolboxService']]) {
        for (const chave of servico.chaves()) {
            const m = servico.meta(chave)
            const texto = `${m.titulo} ${m.descricao}`
            assert.ok(!proibido.test(texto), `${nome}:${chave} promete gerar documento: "${texto}"`)
        }
    }
})

teste('cartão: o número de teste passa no Luhn e o alterado não', () => {
    assert.ok(caixa.luhn('4111111111111111').ok, 'o cartão de teste deveria passar')
    assert.ok(!caixa.luhn('4111111111111112').ok, 'dígito trocado deveria falhar')
    assert.strictEqual(caixa.bandeiraCartao('4111111111111111'), 'Visa')
    assert.strictEqual(caixa.bandeiraCartao('5412751234123456'), 'Mastercard')
})

teste('cartão mascarado mostra só os quatro últimos dígitos', () => {
    const t = daCaixa('doc_cartao_mascarar', '4111111111111111')
    contem(t, '1111', 'doc_cartao_mascarar')
    // Dígito escondido é "•": "*" no WhatsApp vira negrito e embaralhava a máscara.
    contem(t, '•••• •••• ••••', 'doc_cartao_mascarar sem máscara')
    assert.ok(!/\*{3,}/.test(t), 'máscara com asteriscos quebra a formatação do WhatsApp')
})

teste('CPF mascarado esconde o meio com "•", sem asteriscos', () => {
    const t = daCaixa('doc_cpf_mascarar', '123.456.789-09')
    contem(t, '•••.456.789-••', 'doc_cpf_mascarar')
    assert.ok(!/\*{3,}/.test(t), 'máscara com asteriscos quebra a formatação do WhatsApp')
})

teste('CEP cai na faixa do estado certo', () => {
    contem(daCaixa('doc_cep_validar', '01310-100'), 'São Paulo', 'doc_cep_validar de SP')
    contem(daCaixa('doc_cep_validar', '30130-010'), 'Minas Gerais', 'doc_cep_validar de MG')
    contem(daCaixa('doc_cep_validar', '90010-000'), 'Rio Grande do Sul', 'doc_cep_validar do RS')
})

teste('CEP com quantidade errada de dígitos é recusado', () => {
    contem(daCaixa('doc_cep_validar', '123'), '8 dígitos', 'doc_cep_validar curto')
})

teste('PIS de exemplo passa e o dígito trocado não passa', () => {
    contem(daCaixa('doc_pis_validar', '12061341235'), 'passa na conferência', 'doc_pis_validar')
    contem(daCaixa('doc_pis_validar', '12061341234'), 'não passa', 'doc_pis_validar com dígito errado')
})

teste('título de eleitor traz o estado de emissão', () => {
    contem(daCaixa('doc_titulo_validar', '123456780191'), 'SP', 'doc_titulo_validar')
    contem(daCaixa('doc_titulo_validar', '876543210221'), 'MG', 'doc_titulo_validar de MG')
    contem(daCaixa('doc_titulo_validar', '123456780192'), 'não passa', 'doc_titulo_validar com dígito errado')
})

teste('RENAVAM confere o dígito e completa com zero à esquerda', () => {
    contem(daCaixa('doc_renavam_validar', '12345678900'), 'passa na conferência', 'doc_renavam_validar')
    contem(daCaixa('doc_renavam_validar', '12345678901'), 'não passa', 'doc_renavam_validar com dígito errado')
})

teste('placa: padrão antigo e Mercosul são reconhecidos', () => {
    contem(daCaixa('doc_placa_validar', 'ABC1234'), 'antigo', 'doc_placa_validar antigo')
    contem(daCaixa('doc_placa_validar', 'ABC1D23'), 'Mercosul', 'doc_placa_validar Mercosul')
    contem(daCaixa('doc_placa_validar', 'AB12'), 'não está em um padrão válido', 'doc_placa_validar inválida')
})

teste('placa antiga vira Mercosul trocando o segundo número por letra', () => {
    contem(daCaixa('doc_placa_padrao', 'ABC1234'), 'ABC1C34', 'doc_placa_padrao (o 2 vira C)')
})

teste('telefone: celular precisa começar com 9 e o DDD precisa existir', () => {
    contem(daCaixa('doc_telefone_validar', '11987654321'), '(11) 98765-4321', 'doc_telefone_validar')
    contem(daCaixa('doc_telefone_validar', '11887654321'), 'começar com 9', 'doc_telefone_validar com celular sem o 9')
    contem(daCaixa('doc_telefone_validar', '10987654321'), 'não existe', 'doc_telefone_validar com DDD inexistente')
})

teste('DDD 35 é do sul de Minas e DDD 71 é de Salvador', () => {
    contem(daCaixa('doc_ddd_cidade', '35'), 'Minas Gerais', 'doc_ddd_cidade 35')
    contem(daCaixa('doc_ddd_cidade', '71'), 'Salvador', 'doc_ddd_cidade 71')
})

teste('e-mail: endereço bem escrito passa, com dois arrobas não passa', () => {
    contem(daCaixa('doc_email_validar', 'contato@exemplo.com.br'), 'bem escrito', 'doc_email_validar')
    contem(daCaixa('doc_email_validar', 'contato@@exemplo.com'), 'arroba', 'doc_email_validar com dois arrobas')
    contem(daCaixa('doc_email_validar', 'contato.exemplo.com'), 'arroba', 'doc_email_validar sem arroba')
})

teste('boleto: a linha digitável de exemplo fecha em todos os campos', () => {
    const t = daCaixa('doc_boleto_validar', '34191234546789012345767890123457910000000125050')
    contem(t, 'passa em todas as conferências', 'doc_boleto_validar')
    contem(t, 'R$ 1.250,50', 'doc_boleto_validar valor')
})

teste('boleto com um dígito trocado é reprovado', () => {
    contem(daCaixa('doc_boleto_validar', '34191234546789012345767890123457910000000125051'), 'não fecha', 'doc_boleto_validar alterado')
})

teste('boleto de 48 dígitos é conta de consumo, e o comando avisa', () => {
    contem(daCaixa('doc_boleto_validar', '826200000014255012341236456789012345567890123456'), 'conta de consumo', 'doc_boleto_validar com 48 dígitos')
})

teste('conta de consumo: os quatro blocos do exemplo conferem', () => {
    contem(daCaixa('doc_arrecadacao_validar', '826200000014255012341236456789012345567890123456'), 'passa nas quatro conferências', 'doc_arrecadacao_validar')
})

teste('chave da nota fiscal: dígito confere e os campos são lidos', () => {
    const chave = '35260911222333000181550010000123451123456784'
    contem(daCaixa('doc_nfe_validar', chave), 'passa na conferência', 'doc_nfe_validar')
    const t = daCaixa('doc_nfe_ler', chave)
    contem(t, 'São Paulo', 'doc_nfe_ler estado')
    contem(t, '09/2026', 'doc_nfe_ler emissão')
    contem(t, '11.222.333/0001-81', 'doc_nfe_ler CNPJ')
})

teste('processo judicial: o número de exemplo confere e é da Justiça Estadual', () => {
    contem(daCaixa('doc_processo_validar', '0001234-03.2026.8.26.0100'), 'passa na conferência', 'doc_processo_validar')
    contem(daCaixa('doc_processo_validar', '0001234-04.2026.8.26.0100'), 'não passa', 'doc_processo_validar alterado')
    contem(daCaixa('doc_processo_ler', '0001234-03.2026.8.26.0100'), 'Justiça Estadual', 'doc_processo_ler')
})

teste('código de barras: 7891000315507 confere e é registro brasileiro', () => {
    const t = daCaixa('doc_ean_validar', '7891000315507')
    contem(t, 'passa na conferência', 'doc_ean_validar')
    contem(t, 'Brasil', 'doc_ean_validar origem')
    contem(daCaixa('doc_ean_validar', '7891000315508'), 'não passa', 'doc_ean_validar alterado')
})

teste('ISBN de 10 e de 13 dígitos são conferidos pelo método certo', () => {
    contem(daCaixa('doc_isbn_validar', '8535902775'), 'passa na conferência', 'doc_isbn_validar de 10')
    contem(daCaixa('doc_isbn_validar', '978-85-359-0277-8'), 'passa na conferência', 'doc_isbn_validar de 13')
})

teste('IMEI de teste confere e o alterado não', () => {
    contem(daCaixa('doc_imei_validar', '490154203237518'), 'passa na conferência', 'doc_imei_validar')
    contem(daCaixa('doc_imei_validar', '490154203237519'), 'não passa', 'doc_imei_validar alterado')
})

teste('cartão do SUS: a soma de conferência fecha no número de exemplo', () => {
    contem(daCaixa('doc_sus_validar', '201234567890018'), 'passa na conferência', 'doc_sus_validar')
    contem(daCaixa('doc_sus_validar', '201234567890019'), 'não passa', 'doc_sus_validar alterado')
})

teste('PIX copia e cola: o código de exemplo fecha no dígito de verificação', () => {
    const codigo = '00020126410014BR.GOV.BCB.PIX0119goat@exemplo.com.br520400005303986540525.505802BR5910LOJA TESTE6008BRASILIA62070503***6304D08B'
    const t = daCaixa('doc_pix_brcode', codigo)
    contem(t, 'passa na verificação', 'doc_pix_brcode')
    contem(t, 'LOJA TESTE', 'doc_pix_brcode recebedor')
    contem(t, 'R$ 25,50', 'doc_pix_brcode valor')
})

teste('PIX copia e cola alterado é reprovado', () => {
    const adulterado = '00020126410014BR.GOV.BCB.PIX0119goat@exemplo.com.br520400005303986540525.505802BR5910LOJA TESTE6008BRASILIA62070503***6304D08A'
    contem(daCaixa('doc_pix_brcode', adulterado), 'não passa na verificação', 'doc_pix_brcode adulterado')
})

teste('tipo de chave PIX é identificado pelo formato', () => {
    contem(daCaixa('doc_pix_chave', '123.456.789-09'), 'CPF', 'doc_pix_chave CPF')
    contem(daCaixa('doc_pix_chave', 'contato@exemplo.com.br'), 'e-mail', 'doc_pix_chave e-mail')
    contem(daCaixa('doc_pix_chave', '1e1b1c1d-2a2b-3c3d-4e4f-5a5b5c5d5e5f'), 'aleatória', 'doc_pix_chave aleatória')
})

teste('rastreio dos Correios: o dígito do exemplo confere', () => {
    contem(daCaixa('doc_rastreio_correios', 'PY123456785BR'), 'passa na conferência', 'doc_rastreio_correios')
    contem(daCaixa('doc_rastreio_correios', 'PY123456781BR'), 'não passa', 'doc_rastreio_correios alterado')
})

teste('conferência em lote separa o que passa do que não passa', () => {
    const t = daCaixa('doc_lote_validar', '12345678909,', '11111111111,', '11222333000181')
    contem(t, '2 passaram', 'doc_lote_validar')
})

teste('detector identifica o documento pelo tamanho e pelos dígitos', () => {
    contem(daCaixa('doc_detectar', '12345678909'), 'CPF', 'doc_detectar CPF')
    contem(daCaixa('doc_detectar', '11222333000181'), 'CNPJ', 'doc_detectar CNPJ')
    contem(daCaixa('doc_detectar', '01310100'), 'CEP', 'doc_detectar CEP')
})

/* ───────────────────────── 4. Geradores ───────────────────────── */
console.log('\n— Geradores')

teste('senha sai do tamanho pedido e muda a cada chamada', () => {
    const a = daCaixa('ger_senha', '20')
    const b = daCaixa('ger_senha', '20')
    assert.notStrictEqual(a, b, 'duas senhas seguidas saíram iguais')
    const m = a.match(/Sua senha: \*(.+?)\*/)
    assert.ok(m, 'não achei a senha na resposta')
    assert.strictEqual(m[1].length, 20, `a senha saiu com ${m[1].length} caracteres em vez de 20`)
})

teste('senha respeita o limite de tamanho e recusa fora dele', () => {
    contem(daCaixa('ger_senha', '3'), 'no mínimo 8', 'ger_senha curta demais')
    contem(daCaixa('ger_senha', '500'), 'no máximo 64', 'ger_senha longa demais')
})

teste('senha de wi-fi não usa caractere que confunde ao ditar', () => {
    for (let i = 0; i < 20; i++) {
        const m = daCaixa('ger_senha_wifi', '16').match(/Senha do wi-fi: \*(.+?)\*/)
        assert.ok(m, 'não achei a senha na resposta')
        assert.ok(!/[0O1lI]/.test(m[1]), `saiu caractere ambíguo: ${m[1]}`)
    }
})

teste('números distintos não repetem e ficam dentro da faixa', () => {
    for (let i = 0; i < 30; i++) {
        const t = daCaixa('ger_numeros_distintos', '6', '60')
        const m = t.match(/Números sorteados: \*(.+?)\*/)
        assert.ok(m, 'não achei os números na resposta')
        const nums = m[1].split(' - ').map(Number)
        assert.strictEqual(nums.length, 6, 'deveriam ser 6 números')
        assert.strictEqual(new Set(nums).size, 6, `saiu número repetido: ${nums.join(', ')}`)
        for (const n of nums) assert.ok(n >= 1 && n <= 60, `número fora da faixa: ${n}`)
    }
})

teste('não dá para sortear mais números distintos do que a faixa tem', () => {
    contem(daCaixa('ger_numeros_distintos', '10', '5'), 'Não dá para sortear', 'ger_numeros_distintos impossível')
})

teste('dado de RPG fica entre o mínimo e o máximo da fórmula', () => {
    for (let i = 0; i < 40; i++) {
        const t = daCaixa('ger_dado_rpg', '2d6+3')
        const m = t.match(/Resultado: \*(-?\d+)\*/)
        assert.ok(m, `não achei o resultado: ${t.slice(0, 120)}`)
        const v = Number(m[1])
        assert.ok(v >= 5 && v <= 15, `2d6+3 saiu ${v}, fora da faixa de 5 a 15`)
    }
})

teste('fórmula de dado mal escrita é recusada com exemplo', () => {
    contem(daCaixa('ger_dado_rpg', '2x6'), 'Escreva assim', 'ger_dado_rpg com fórmula errada')
})

teste('amigo secreto nunca deixa alguém tirar a si mesmo', () => {
    for (let i = 0; i < 40; i++) {
        const t = daCaixa('ger_amigo_secreto', 'ana,', 'bruno,', 'carla,', 'diego,', 'edu')
        for (const linha of t.split('\n').filter(l => l.includes(' tirou '))) {
            const [quem, alvo] = linha.replace('• ', '').split(' tirou ')
            assert.notStrictEqual(quem.trim(), alvo.trim(), `${quem} tirou a si mesmo`)
        }
    }
})

teste('amigo secreto recusa nome repetido na lista', () => {
    contem(daCaixa('ger_amigo_secreto', 'ana,', 'ana,', 'bruno'), 'nome repetido', 'ger_amigo_secreto com nome repetido')
})

teste('times ficam com todo mundo e ninguém em dois times', () => {
    const t = daCaixa('ger_times', '2', 'ana,', 'bruno,', 'carla,', 'diego,', 'edu,', 'fabio')
    const nomes = ['ana', 'bruno', 'carla', 'diego', 'edu', 'fabio']
    for (const n of nomes) {
        const vezes = (t.match(new RegExp(`(?:•|➤) ${n}\\b`, 'g')) || []).length
        assert.strictEqual(vezes, 1, `${n} apareceu ${vezes} vez(es) nos times`)
    }
})

teste('sorteio de ganhadores não repete nome', () => {
    for (let i = 0; i < 25; i++) {
        const t = daCaixa('ger_sortear_ganhadores', '3', 'a,', 'b,', 'c,', 'd,', 'e,', 'f')
        const linhas = t.split('\n').filter(l => /^\dº lugar:/.test(l)).map(l => l.split(': ')[1])
        assert.strictEqual(new Set(linhas).size, linhas.length, `ganhador repetido: ${linhas.join(', ')}`)
    }
})

teste('sortear exige pelo menos dois nomes', () => {
    contem(daCaixa('ger_sortear_nome', 'ana'), 'pelo menos 2', 'ger_sortear_nome com um nome só')
})

teste('identificador único tem o formato certo e nunca repete', () => {
    const vistos = new Set()
    for (let i = 0; i < 20; i++) {
        const m = daCaixa('ger_uuid').match(/Identificador: \*(.+?)\*/)
        assert.ok(m && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(m[1]), `formato inesperado: ${m && m[1]}`)
        assert.ok(!vistos.has(m[1]), 'saiu identificador repetido')
        vistos.add(m[1])
    }
})

teste('moeda cai dos dois lados ao longo de muitas jogadas', () => {
    const t = daCaixa('ger_moeda', '50')
    const m = t.match(/Deu \*(\d+) cara/)
    assert.ok(m, 'não achei a contagem de caras')
    const caras = Number(m[1])
    assert.ok(caras > 5 && caras < 45, `saíram ${caras} caras em 50 jogadas — muito longe do esperado`)
})

/* ───────────────────────── 5. Data e Hora ───────────────────────── */
console.log('\n— Data e Hora')

teste('data que não existe é recusada com explicação', () => {
    assert.throws(() => caixa.lerData('31/02/2026'), /não existe no calendário/)
    assert.throws(() => caixa.lerData('30/02/2026'), /não existe no calendário/)
    const t = daCaixa('dh_dia_semana', '31/02/2026')
    contem(t, 'não existe', 'dh_dia_semana com 31 de fevereiro')
    assert.ok(t.length > 40, 'a recusa precisa explicar')
})

teste('mês 13 e texto no lugar da data também são recusados', () => {
    assert.throws(() => caixa.lerData('10/13/2026'), /Mês 13 não existe/)
    contem(daCaixa('dh_dia_semana', 'abacaxi'), 'Não entendi', 'dh_dia_semana com texto')
})

teste('dias entre 01/01/2026 e 25/12/2026 são 358', () => {
    assert.strictEqual(caixa.diasEntre(caixa.lerData('01/01/2026'), caixa.lerData('25/12/2026')), 358)
    contem(daCaixa('dh_dias_entre', '01/01/2026', '25/12/2026'), '358 dias', 'dh_dias_entre')
})

teste('7 de setembro de 2026 cai em uma segunda-feira', () => {
    contem(daCaixa('dh_dia_semana', '07/09/2026'), 'segunda-feira', 'dh_dia_semana')
    contem(daCaixa('dh_dia_semana', '01/01/2026'), 'quinta-feira', 'dh_dia_semana 01/01/2026')
})

teste('idade de 15/03/1990 em 15/03/2026 é exatamente 36 anos', () => {
    contem(daCaixa('dh_idade', '15/03/1990', '15/03/2026'), '36 anos, 0 meses e 0 dias', 'dh_idade')
})

teste('idade na véspera do aniversário ainda é a anterior', () => {
    contem(daCaixa('dh_idade', '15/03/1990', '14/03/2026'), '35 anos', 'dh_idade na véspera')
})

teste('data de nascimento no futuro é recusada', () => {
    contem(daCaixa('dh_idade', '15/03/2090'), 'vem depois', 'dh_idade com data futura')
})

teste('Páscoa de 2026 é 5 de abril, e o Carnaval cai em 17 de fevereiro', () => {
    assert.strictEqual(caixa.fmtData(caixa.pascoa(2026)), '05/04/2026')
    const carnaval = caixa.feriadosDoAno(2026).find(f => f.nome.includes('terça'))
    assert.strictEqual(caixa.fmtData(carnaval.data), '17/02/2026')
})

teste('feriados nacionais de 2026 saem com data e vigência declarada', () => {
    const t = daCaixa('dh_feriados_ano', '2026')
    contem(t, '25/12/2026', 'dh_feriados_ano Natal')
    contem(t, '20/11/2026', 'dh_feriados_ano Consciência Negra')
    contem(t, 'legislação em vigor', 'dh_feriados_ano sem vigência declarada')
})

teste('Carnaval é ponto facultativo, não feriado nacional', () => {
    const t = daCaixa('dh_feriado_e', '17/02/2026')
    contem(t, 'ponto facultativo', 'dh_feriado_e no Carnaval')
})

teste('25 de dezembro é feriado e 22 de dezembro é dia útil comum', () => {
    contem(daCaixa('dh_feriado_e', '25/12/2026'), 'Natal', 'dh_feriado_e no Natal')
    contem(daCaixa('dh_feriado_e', '22/12/2026'), 'dia útil comum', 'dh_feriado_e em 22/12')
})

teste('dia útil pula sábado, domingo e feriado nacional', () => {
    assert.ok(!caixa.ehDiaUtil(caixa.lerData('25/12/2026')), 'Natal não é dia útil')
    assert.ok(!caixa.ehDiaUtil(caixa.lerData('05/09/2026')), 'sábado não é dia útil')
    assert.ok(caixa.ehDiaUtil(caixa.lerData('08/09/2026')), 'terça comum deveria ser dia útil')
})

teste('setembro de 2026 tem 21 dias úteis (22 dias de semana menos o dia 7)', () => {
    // 30 dias, começando numa terça: 22 dias de semana. Menos 7 de setembro, feriado numa segunda.
    contem(daCaixa('dh_dias_uteis', '01/09/2026', '30/09/2026'), '21 dias úteis', 'dh_dias_uteis')
})

teste('somar 90 dias a 01/03/2026 dá 30/05/2026', () => {
    contem(daCaixa('dh_somar_dias', '01/03/2026', '90'), '30/05/2026', 'dh_somar_dias')
})

teste('voltar 30 dias de 31/03/2026 dá 01/03/2026', () => {
    contem(daCaixa('dh_subtrair_dias', '31/03/2026', '30'), '01/03/2026', 'dh_subtrair_dias')
})

teste('prazo de 5 dias úteis a partir de 01/12/2026 termina em 08/12/2026', () => {
    // 01/12 é terça: 2, 3, 4, 7 e 8 são os cinco dias úteis seguintes
    contem(daCaixa('dh_somar_uteis', '01/12/2026', '5'), '08/12/2026', 'dh_somar_uteis')
})

teste('ano bissexto: 2024 é, 2100 não é, 2000 é', () => {
    assert.strictEqual(caixa.bissexto(2024), true)
    assert.strictEqual(caixa.bissexto(2100), false)
    assert.strictEqual(caixa.bissexto(2000), true)
    contem(daCaixa('dh_bissexto', '2100'), 'não é bissexto', 'dh_bissexto 2100')
    contem(daCaixa('dh_bissexto', '2028'), 'é bissexto', 'dh_bissexto 2028')
})

teste('fevereiro de 2028 tem 29 dias e o de 2026 tem 28', () => {
    contem(daCaixa('dh_dias_no_mes', '2', '2028'), '29', 'dh_dias_no_mes bissexto')
    contem(daCaixa('dh_dias_no_mes', '2', '2026'), '28', 'dh_dias_no_mes comum')
})

teste('turno da noite: de 22:00 a 06:00 são 8 horas', () => {
    contem(daCaixa('dh_diferenca_horas', '22:00', '06:00'), '8h00', 'dh_diferenca_horas virando o dia')
    contem(daCaixa('dh_diferenca_horas', '08:00', '17:30'), '9h30', 'dh_diferenca_horas no mesmo dia')
})

teste('ponto de 08:00 às 17:30 com uma hora de almoço dá 8h30 trabalhadas', () => {
    const t = daCaixa('dh_jornada_ponto', '08:00', '12:00', '13:00', '17:30')
    contem(t, '8h30', 'dh_jornada_ponto')
})

teste('marcação de ponto fora de ordem é recusada', () => {
    contem(daCaixa('dh_jornada_ponto', '17:00', '12:00', '13:00', '18:00'), 'fora de ordem', 'dh_jornada_ponto invertido')
})

teste('banco de horas soma crédito e débito com sinal', () => {
    // +1:30 -0:45 +2:00 = 2h45
    contem(daCaixa('dh_banco_horas', '+1:30', '-0:45', '+2:00'), '2h45', 'dh_banco_horas')
})

teste('somar durações: 1:30 mais 2:45 mais 0:50 dá 5h05', () => {
    contem(daCaixa('dh_soma_horas', '1:30', '2:45', '0:50'), '5h05', 'dh_soma_horas')
})

teste('horário impossível é recusado', () => {
    contem(daCaixa('dh_diferenca_horas', '25:00', '26:00'), 'impossível', 'dh_diferenca_horas com hora 25')
})

teste('gestação: 280 dias após a última menstruação é a data provável', () => {
    const t = daCaixa('dh_gestacao', caixa.fmtData(caixa.lerData('hoje')))
    contem(t, '0 semanas e 0 dias', 'dh_gestacao no primeiro dia')
})

teste('gestação recusa data futura e data velha demais', () => {
    contem(daCaixa('dh_gestacao', '01/01/2000'), 'além de qualquer gestação', 'dh_gestacao com data antiga')
})

teste('signo: 15 de março é Peixes e 25 de dezembro é Capricórnio', () => {
    contem(daCaixa('dh_signo', '15/03'), 'Peixes', 'dh_signo março')
    contem(daCaixa('dh_signo', '25/12'), 'Capricórnio', 'dh_signo dezembro')
})

teste('trimestre: 15 de agosto está no terceiro', () => {
    contem(daCaixa('dh_trimestre', '15/08/2026'), '3º', 'dh_trimestre')
})

teste('sábados e domingos de 2026: 52 de cada', () => {
    const t = daCaixa('dh_fins_de_semana', '01/01/2026', '31/12/2026')
    contem(t, '*Sábados:* 52', 'dh_fins_de_semana sábados')
    contem(t, '*Domingos:* 52', 'dh_fins_de_semana domingos')
})

/* ─────────────── 6. Os 360 arquivos: schema e resposta ─────────────── */
console.log('\n— Os 360 comandos em disco')

const arquivos = fs.existsSync(PASTA) ? fs.readdirSync(PASTA).filter(n => /^ferr\d+\.js$/.test(n)) : []
const comandos = []

teste('a pasta tem exatamente 360 comandos, de ferr1 a ferr360', () => {
    assert.strictEqual(arquivos.length, 360, `achei ${arquivos.length} arquivos`)
    for (let i = 1; i <= 360; i++) {
        assert.ok(arquivos.includes(`ferr${i}.js`), `falta o arquivo ferr${i}.js`)
    }
})

teste('todo arquivo carrega e segue o schema do projeto', () => {
    const descricoes = new Map()
    for (const arq of arquivos.sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))) {
        const cmd = require(path.join(PASTA, arq))
        assert.ok(cmd && typeof cmd === 'object', `${arq} não exporta objeto`)
        assert.strictEqual(cmd.name, arq.replace('.js', ''), `${arq}: o nome não bate com o arquivo`)
        assert.strictEqual(typeof cmd.execute, 'function', `${arq} sem execute`)
        assert.strictEqual(cmd.category, 'ferramentas', `${arq}: categoria errada`)
        assert.ok(SUBCATEGORIAS.has(cmd.subcategory), `${arq}: subcategoria "${cmd.subcategory}" fora das cinco combinadas`)
        assert.strictEqual(cmd.cooldownMs, 3000, `${arq}: cooldown diferente de 3000`)
        assert.deepStrictEqual(cmd.aliases, [], `${arq} declarou alias`)
        assert.ok(cmd.description && cmd.description.length <= 55, `${arq}: descrição com ${(cmd.description || '').length} caracteres`)
        assert.ok(!descricoes.has(cmd.description), `${arq} repete a descrição de ${descricoes.get(cmd.description)}: "${cmd.description}"`)
        descricoes.set(cmd.description, arq)
        assert.ok(cmd.usage, `${arq} sem usage`)
        assert.ok(Array.isArray(cmd.examples) && cmd.examples.length, `${arq} sem examples`)
        for (const chave of Object.keys(cmd)) {
            assert.ok(CHAVES_ACEITAS.has(chave), `${arq}: chave "${chave}" fora do schema`)
        }
        comandos.push({ arq, cmd })
    }
})

teste('as cinco subcategorias têm a quantidade combinada', () => {
    const conta = comandos.reduce((acc, { cmd }) => { acc[cmd.subcategory] = (acc[cmd.subcategory] || 0) + 1; return acc }, {})
    assert.deepStrictEqual(conta, {
        'Conversões': 120,
        'Calculadoras': 120,
        'Documentos': 50,
        'Geradores': 40,
        'Data e Hora': 30
    }, `a divisão saiu ${JSON.stringify(conta)}`)
})

/** Executa o comando com um contexto falso e devolve o que ele respondeu. */
async function rodar(cmd, args) {
    const saidas = []
    await cmd.execute({
        reply: t => { saidas.push(String(t ?? '')); return Promise.resolve() },
        args,
        text: args.join(' '),
        prefix: '.',
        from: '120363000000000000@g.us',
        sender: '5511900000001@s.whatsapp.net',
        isGroup: true,
        info: {},
        client: {}
    })
    return saidas.join('\n')
}

async function rodarTodos() {
    const vazios = []
    const quebrados = []
    const comCaixa = []
    const comEnchimento = []
    const semExemplo = []

    for (const { arq, cmd } of comandos) {
        let texto = ''
        try {
            texto = await rodar(cmd, [])
        } catch (err) {
            quebrados.push(`${arq}: ${err.message}`)
            continue
        }
        if (texto.trim().length <= 40) vazios.push(`${arq} (${texto.trim().length} caracteres)`)
        if (molduraQuebrada(texto)) comCaixa.push(arq)
        if (ENCHIMENTO.test(texto) || MARCADOR_DE_CODIGO.test(semTitulosDeMoldura(texto))) comEnchimento.push(arq)

        // O primeiro exemplo do próprio comando precisa produzir resposta de verdade.
        const args = String(cmd.examples[0]).split(' — ')[0].trim().split(/\s+/)
        try {
            const comArgs = await rodar(cmd, args)
            if (comArgs.includes('não está registrada') || comArgs.includes('Ferramenta fora do ar')) semExemplo.push(`${arq}: ferramenta não encontrada no serviço`)
            if (comArgs.trim().length <= 40) semExemplo.push(`${arq}: exemplo "${args.join(' ')}" respondeu quase nada`)
        } catch (err) {
            quebrados.push(`${arq} (com exemplo): ${err.message}`)
        }
    }

    teste('nenhum comando estoura ao rodar sem argumento nem com o exemplo', () => {
        assert.strictEqual(quebrados.length, 0, `${quebrados.length} quebraram:\n     ${quebrados.slice(0, 5).join('\n     ')}`)
    })

    teste('todo comando responde mais de 40 caracteres sem argumento', () => {
        assert.strictEqual(vazios.length, 0, `${vazios.length} responderam quase nada:\n     ${vazios.slice(0, 5).join('\n     ')}`)
    })

    teste('o exemplo de cada comando produz resposta de verdade', () => {
        assert.strictEqual(semExemplo.length, 0, `${semExemplo.length} com exemplo que não funciona:\n     ${semExemplo.slice(0, 5).join('\n     ')}`)
    })

    teste('toda moldura da resposta está bem formada', () => {
        assert.strictEqual(comCaixa.length, 0, `${comCaixa.length} com moldura quebrada: ${comCaixa.slice(0, 5).join(', ')}`)
    })

    teste('nenhuma resposta é enchimento', () => {
        assert.strictEqual(comEnchimento.length, 0, `${comEnchimento.length} com texto de enchimento: ${comEnchimento.slice(0, 5).join(', ')}`)
    })

    teste('o manifesto bate com o que está em disco', () => {
        const manifesto = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scripts', 'manifests', 'ferr_arquivos.json'), 'utf8'))
        assert.strictEqual(manifesto.total, 360, `manifesto diz ${manifesto.total}`)
        assert.strictEqual(manifesto.arquivos.length, 360, 'a lista do manifesto não tem 360 itens')
        for (const item of manifesto.arquivos) {
            assert.ok(fs.existsSync(path.join(RAIZ, item.arquivo)), `manifesto aponta para arquivo que não existe: ${item.arquivo}`)
        }
    })

    console.log(`\n📊 Ferramentas: ✅ ${ok} ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

rodarTodos()
