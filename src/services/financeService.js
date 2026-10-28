/**
 * Dinheiro: conceitos, produtos e as contas que dão a resposta.
 *
 * A parte de cálculo é a que importa aqui. Juros compostos, financiamento
 * pela Tabela Price e SAC, tempo até um objetivo e corrosão pela inflação
 * são fórmulas fechadas — o serviço as implementa uma vez e os comandos só
 * apresentam.
 *
 * Nada aqui é recomendação de investimento. As fichas de produto descrevem
 * como o instrumento funciona e onde ele costuma decepcionar, não o que
 * comprar.
 */

/** Conceitos financeiros, cada um com o erro que a maioria comete. */
const CONCEITOS = {
    jurossimples: {
        nome: 'Juros simples', area: 'Matemática financeira',
        oquee: 'Os juros incidem sempre sobre o valor inicial. R$ 1.000 a 1% ao mês rendem R$ 10 todo mês, para sempre.',
        formula: 'M = C × (1 + i × n)',
        erro: 'Quase nada no mundo real usa juros simples. Serve para entender o conceito e para multas contratuais curtas.'
    },
    juroscompostos: {
        nome: 'Juros compostos', area: 'Matemática financeira',
        oquee: 'Os juros incidem sobre o montante acumulado. O rendimento do mês passa a render também.',
        formula: 'M = C × (1 + i)ⁿ',
        erro: 'Somar taxas mensais para achar a anual. 1% ao mês não é 12% ao ano, é 12,68% — a diferença cresce com o prazo.'
    },
    taxareal: {
        nome: 'Taxa real de juros', area: 'Matemática financeira',
        oquee: 'É o ganho descontada a inflação. Um investimento que rende 10% num ano de 8% de inflação teve ganho real perto de 1,85%.',
        formula: 'real = (1 + nominal) / (1 + inflação) − 1',
        erro: 'Subtrair a inflação da taxa nominal. Dá quase certo em números pequenos e erra feio em números grandes.'
    },
    selic: {
        nome: 'Taxa Selic', area: 'Política monetária',
        oquee: 'Taxa básica da economia, definida pelo Copom a cada 45 dias. É a referência de quase todo rendimento de renda fixa no Brasil.',
        formula: '—',
        erro: 'Achar que a Selic é o que você recebe. É a referência; o produto entrega um percentual dela, menos taxas e impostos.'
    },
    cdi: {
        nome: 'CDI', area: 'Renda fixa',
        oquee: 'Taxa dos empréstimos que bancos fazem entre si de um dia para o outro. Anda quase colada na Selic.',
        formula: '—',
        erro: 'Comparar "120% do CDI" com "IPCA + 6%" direto. São indexadores diferentes e só dá para comparar projetando cenários.'
    },
    liquidez: {
        nome: 'Liquidez', area: 'Investimentos',
        oquee: 'Velocidade com que um ativo vira dinheiro na conta sem perder valor.',
        formula: '—',
        erro: 'Deixar a reserva de emergência em algo com carência. Reserva sem liquidez diária não é reserva de emergência.'
    },
    diversificacao: {
        nome: 'Diversificação', area: 'Investimentos',
        oquee: 'Distribuir o dinheiro entre ativos que não sobem e descem juntos, para que um erro não leve tudo.',
        formula: '—',
        erro: 'Comprar dez fundos que seguem o mesmo índice. Isso é repetição, não diversificação.'
    },
    inflacao: {
        nome: 'Inflação', area: 'Economia',
        oquee: 'Perda do poder de compra do dinheiro ao longo do tempo, medida no Brasil principalmente pelo IPCA.',
        formula: 'poder = valor / (1 + inflação)ⁿ',
        erro: 'Guardar dinheiro parado em conta corrente achando que está seguro. Está perdendo valor todo mês, só que devagar.'
    },
    reservaemergencia: {
        nome: 'Reserva de emergência', area: 'Planejamento',
        oquee: 'Dinheiro guardado para cobrir de 3 a 12 meses de despesas essenciais, com resgate imediato.',
        formula: 'reserva = gasto mensal essencial × meses de cobertura',
        erro: 'Calcular sobre a renda em vez do gasto. O que importa é quanto você precisa por mês, não quanto ganha.'
    },
    custoefetivototal: {
        nome: 'CET — Custo Efetivo Total', area: 'Crédito',
        oquee: 'A taxa que inclui juros, tarifas, seguros e impostos de um empréstimo. É o número que realmente importa.',
        formula: '—',
        erro: 'Comparar propostas pela taxa de juros anunciada. A instituição é obrigada a informar o CET; é por ele que se compara.'
    },
    amortizacao: {
        nome: 'Amortização', area: 'Crédito',
        oquee: 'A parte da parcela que abate o saldo devedor. O resto é juro e não reduz a dívida.',
        formula: 'amortização = parcela − juros do período',
        erro: 'Amortizar reduzindo o valor da parcela em vez do prazo. Reduzir o prazo economiza muito mais juros.'
    },
    patrimonioliquido: {
        nome: 'Patrimônio líquido pessoal', area: 'Planejamento',
        oquee: 'Tudo o que você tem menos tudo o que você deve. É o único número que mede progresso financeiro de verdade.',
        formula: 'patrimônio = ativos − passivos',
        erro: 'Contar o carro financiado como ativo e esquecer o saldo devedor no passivo.'
    },
    orcamento503020: {
        nome: 'Regra 50/30/20', area: 'Planejamento',
        oquee: 'Divide a renda líquida em 50% essenciais, 30% desejos e 20% poupança e dívidas.',
        formula: '—',
        erro: 'Tratar como lei. É um ponto de partida; quem mora em cidade cara raramente cabe nos 50%.'
    },
    aportemensal: {
        nome: 'Aporte recorrente', area: 'Investimentos',
        oquee: 'Investir um valor fixo todo mês, independente do preço, diluindo o risco de acertar o momento errado.',
        formula: 'M = A × [((1 + i)ⁿ − 1) / i]',
        erro: 'Parar os aportes quando o mercado cai. É justamente quando o mesmo dinheiro compra mais.'
    },
    imposto: {
        nome: 'Tabela regressiva de IR', area: 'Tributação',
        oquee: 'Em renda fixa, o imposto cai com o tempo: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima disso.',
        formula: '—',
        erro: 'Resgatar antes de 720 dias sem necessidade. Os últimos degraus custam caro em ganhos grandes.'
    },
    scorecredito: {
        nome: 'Score de crédito', area: 'Crédito',
        oquee: 'Pontuação que estima a chance de você pagar em dia, calculada por birôs a partir do histórico.',
        formula: '—',
        erro: 'Achar que existe empresa capaz de "limpar o nome" por fora. O que muda o score é pagar em dia e ter histórico.'
    }
}

/** Produtos financeiros: como funcionam e onde decepcionam. */
const PRODUTOS = {
    poupanca: {
        nome: 'Poupança', tipo: 'Renda fixa', risco: 'muito baixo', liquidez: 'imediata', imposto: 'isento',
        comofunciona: 'Rende 70% da Selic + TR quando a Selic está em 8,5% ao ano ou menos; acima disso, 0,5% ao mês + TR.',
        pega: 'Rende só no "aniversário" mensal. Sacar um dia antes zera o rendimento daquele mês inteiro.'
    },
    tesourourasselic: {
        nome: 'Tesouro Selic', tipo: 'Renda fixa pública', risco: 'muito baixo', liquidez: 'D+1', imposto: 'tabela regressiva',
        comofunciona: 'Título público que acompanha a Selic diariamente. É o ativo mais conservador do mercado brasileiro.',
        pega: 'Tem taxa de custódia da B3 acima de um valor isento. Em valores muito pequenos, isso pesa.'
    },
    tesouroipca: {
        nome: 'Tesouro IPCA+', tipo: 'Renda fixa pública', risco: 'baixo se levado ao vencimento', liquidez: 'D+1', imposto: 'tabela regressiva',
        comofunciona: 'Paga a inflação mais uma taxa fixa. Garante ganho real se mantido até o vencimento.',
        pega: 'Vender antes do prazo expõe à marcação a mercado — o preço oscila e pode dar prejuízo nominal.'
    },
    cdb: {
        nome: 'CDB', tipo: 'Renda fixa privada', risco: 'baixo até o limite do FGC', liquidez: 'varia', imposto: 'tabela regressiva',
        comofunciona: 'Você empresta ao banco e recebe um percentual do CDI. Coberto pelo FGC até R$ 250 mil por CPF e instituição.',
        pega: 'CDB com carência longa e taxa alta costuma ser de banco pequeno. A cobertura do FGC tem teto e prazo de pagamento.'
    },
    lci: {
        nome: 'LCI e LCA', tipo: 'Renda fixa privada', risco: 'baixo até o limite do FGC', liquidez: 'carência mínima', imposto: 'isento para pessoa física',
        comofunciona: 'Letras lastreadas em crédito imobiliário ou do agronegócio. Isentas de IR para pessoa física.',
        pega: 'Isento não significa melhor. Um CDB de 110% do CDI pode superar uma LCI de 90% mesmo pagando imposto.'
    },
    acoes: {
        nome: 'Ações', tipo: 'Renda variável', risco: 'alto', liquidez: 'D+2', imposto: '15% sobre ganho, isento até R$ 20 mil/mês em vendas comuns',
        comofunciona: 'Fração do capital de uma empresa. O retorno vem da valorização e dos dividendos.',
        pega: 'A isenção de R$ 20 mil vale para vendas no mercado à vista, não para day trade, que é sempre tributado.'
    },
    fii: {
        nome: 'Fundos imobiliários', tipo: 'Renda variável', risco: 'médio', liquidez: 'D+2', imposto: 'rendimento isento; ganho na venda tributado em 20%',
        comofunciona: 'Cotas de um fundo que investe em imóveis ou papéis do setor, distribuindo aluguéis mensalmente.',
        pega: 'O rendimento mensal é isento, mas o lucro na venda da cota é tributado em 20% sem faixa de isenção.'
    },
    etf: {
        nome: 'ETF', tipo: 'Renda variável', risco: 'médio a alto', liquidez: 'D+2', imposto: '15% sobre ganho, sem isenção mensal',
        comofunciona: 'Fundo negociado em bolsa que replica um índice. Uma cota compra a carteira inteira.',
        pega: 'Não tem a isenção de R$ 20 mil que as ações têm. Todo lucro na venda é tributado.'
    },
    fundodi: {
        nome: 'Fundo DI', tipo: 'Fundo de investimento', risco: 'muito baixo', liquidez: 'D+0 ou D+1', imposto: 'tabela regressiva + come-cotas',
        comofunciona: 'Fundo que acompanha o CDI, útil para caixa com resgate rápido.',
        pega: 'Taxa de administração acima de 0,5% ao ano costuma comer boa parte do rendimento. E há come-cotas semestral.'
    },
    previdencia: {
        nome: 'Previdência privada', tipo: 'Longo prazo', risco: 'varia com o fundo', liquidez: 'baixa', imposto: 'progressiva ou regressiva, escolhida na contratação',
        comofunciona: 'PGBL permite deduzir até 12% da renda tributável de quem declara no completo; VGBL tributa só o rendimento.',
        pega: 'Escolher PGBL declarando no simplificado joga fora a única vantagem do produto.'
    },
    consorcio: {
        nome: 'Consórcio', tipo: 'Autofinanciamento', risco: 'médio', liquidez: 'nenhuma até a contemplação', imposto: '—',
        comofunciona: 'Grupo que compra em conjunto; a contemplação vem por sorteio ou lance.',
        pega: 'Não tem juros, mas tem taxa de administração. E não há data para ser contemplado — não serve para necessidade com prazo.'
    },
    cripto: {
        nome: 'Criptomoedas', tipo: 'Renda variável', risco: 'muito alto', liquidez: 'imediata', imposto: '15% a 22,5% sobre ganho acima de R$ 35 mil/mês em vendas',
        comofunciona: 'Ativos digitais em redes descentralizadas, com preço definido puramente por oferta e procura.',
        pega: 'Sem FGC, sem garantia e com volatilidade que derruba metade do valor em semanas. Custódia própria significa que perder a chave é perder tudo.'
    }
}

const NUM = { min: 1e-9 }

/** Juros compostos com aporte mensal opcional. */
function jurosCompostos({ capital = 0, taxaMensal = 0, meses = 0, aporte = 0 }) {
    const c = Number(capital) || 0
    const i = Number(taxaMensal) / 100
    const n = Math.max(0, Math.floor(Number(meses) || 0))
    const a = Number(aporte) || 0
    const fator = Math.pow(1 + i, n)
    const doCapital = c * fator
    const dosAportes = Math.abs(i) < NUM.min ? a * n : a * ((fator - 1) / i)
    const total = doCapital + dosAportes
    const investido = c + a * n
    return {
        total, investido, juros: total - investido, doCapital, dosAportes, meses: n,
        rendimentoPct: investido > 0 ? ((total / investido) - 1) * 100 : 0
    }
}

/** Evolução mês a mês, para mostrar a curva. */
function evolucao({ capital = 0, taxaMensal = 0, meses = 0, aporte = 0 }, pontos = 6) {
    const n = Math.max(1, Math.floor(Number(meses) || 1))
    const passo = Math.max(1, Math.round(n / pontos))
    const linhas = []
    for (let m = passo; m <= n; m += passo) {
        linhas.push({ mes: m, ...jurosCompostos({ capital, taxaMensal, meses: m, aporte }) })
    }
    if (!linhas.length || linhas[linhas.length - 1].meses !== n) {
        linhas.push({ mes: n, ...jurosCompostos({ capital, taxaMensal, meses: n, aporte }) })
    }
    return linhas
}

/** Financiamento pela Tabela Price: parcela fixa. */
function price({ valor, taxaMensal, meses }) {
    const pv = Number(valor) || 0
    const i = Number(taxaMensal) / 100
    const n = Math.max(1, Math.floor(Number(meses) || 1))
    const parcela = Math.abs(i) < NUM.min ? pv / n : pv * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
    const totalPago = parcela * n
    return { parcela, totalPago, juros: totalPago - pv, primeira: parcela, ultima: parcela, meses: n, valor: pv }
}

/** Financiamento SAC: amortização constante, parcela decrescente. */
function sac({ valor, taxaMensal, meses }) {
    const pv = Number(valor) || 0
    const i = Number(taxaMensal) / 100
    const n = Math.max(1, Math.floor(Number(meses) || 1))
    const amort = pv / n
    let saldo = pv, totalPago = 0
    let primeira = 0, ultima = 0
    for (let m = 1; m <= n; m++) {
        const parcela = amort + saldo * i
        if (m === 1) primeira = parcela
        if (m === n) ultima = parcela
        totalPago += parcela
        saldo -= amort
    }
    return { parcela: totalPago / n, totalPago, juros: totalPago - pv, primeira, ultima, meses: n, valor: pv, amortizacao: amort }
}

/** Meses até alcançar um objetivo. */
function tempoAteObjetivo({ objetivo, capital = 0, aporte = 0, taxaMensal = 0 }) {
    const alvo = Number(objetivo) || 0
    const i = Number(taxaMensal) / 100
    let saldo = Number(capital) || 0
    const a = Number(aporte) || 0
    if (saldo >= alvo) return { meses: 0, alcancavel: true, saldoFinal: saldo }
    if (a <= 0 && i <= 0) return { meses: null, alcancavel: false, motivo: 'sem aporte e sem juros o saldo não cresce' }
    for (let m = 1; m <= 1200; m++) {
        saldo = saldo * (1 + i) + a
        if (saldo >= alvo) return { meses: m, alcancavel: true, saldoFinal: saldo, investido: (Number(capital) || 0) + a * m }
    }
    return { meses: null, alcancavel: false, motivo: 'levaria mais de 100 anos nesse ritmo' }
}

/** Poder de compra corroído pela inflação. */
function corrosaoInflacao({ valor, inflacaoAnual, anos }) {
    const v = Number(valor) || 0
    const i = Number(inflacaoAnual) / 100
    const n = Math.max(0, Number(anos) || 0)
    const equivalente = v / Math.pow(1 + i, n)
    const necessario = v * Math.pow(1 + i, n)
    return { valor: v, equivalente, necessario, perdaPct: v > 0 ? (1 - equivalente / v) * 100 : 0, anos: n }
}

/** Taxa real a partir da nominal e da inflação. */
function taxaReal(nominal, inflacao) {
    const nom = Number(nominal) / 100
    const inf = Number(inflacao) / 100
    return (((1 + nom) / (1 + inf)) - 1) * 100
}

/** Converte taxa entre períodos (mensal ↔ anual). */
function converterTaxa(taxa, de, para) {
    const t = Number(taxa) / 100
    const periodos = { dia: 252, mes: 12, ano: 1, semestre: 2, trimestre: 4 }
    const pDe = periodos[de], pPara = periodos[para]
    if (!pDe || !pPara) return null
    const anual = Math.pow(1 + t, pDe) - 1
    return (Math.pow(1 + anual, 1 / pPara) - 1) * 100
}

/** Reserva de emergência recomendada pelo perfil de renda. */
const PERFIS_RESERVA = {
    clt: { nome: 'Assalariado CLT', meses: 6, porque: 'Tem aviso prévio, FGTS e seguro-desemprego amortecendo a queda.' },
    servidorpublico: { nome: 'Servidor público', meses: 3, porque: 'Renda estável e demissão rara; a reserva cobre imprevistos, não desemprego.' },
    autonomo: { nome: 'Autônomo ou PJ', meses: 12, porque: 'Renda irregular e nenhuma rede de proteção automática.' },
    empresario: { nome: 'Empresário', meses: 12, porque: 'A renda depende do negócio, que é justamente o que pode falhar junto.' },
    aposentado: { nome: 'Aposentado', meses: 6, porque: 'Renda estável, mas gastos de saúde tendem a aparecer de repente.' }
}

function moeda(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function pct(v, casas = 2) {
    return Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + '%'
}

/** Lê um número aceitando vírgula, ponto e separador de milhar. */
function lerNumero(txt) {
    if (txt === null || txt === undefined) return NaN
    let s = String(txt).trim().replace(/[R$\s]/gi, '')
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : NaN
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [chave, c] of Object.entries(CONCEITOS)) {
        if ((JSON.stringify(c) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'conceito', chave, nome: c.nome })
    }
    for (const [chave, p] of Object.entries(PRODUTOS)) {
        if ((JSON.stringify(p) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'produto', chave, nome: p.nome })
    }
    return achados
}

module.exports = {
    CONCEITOS, PRODUTOS, PERFIS_RESERVA,
    jurosCompostos, evolucao, price, sac, tempoAteObjetivo, corrosaoInflacao,
    taxaReal, converterTaxa, moeda, pct, lerNumero, procurar
}
