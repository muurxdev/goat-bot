/**
 * Trabalho e CLT: direitos, contratos, rescisão e as contas de folha.
 *
 * ─── ATENÇÃO A QUEM FOR ATUALIZAR ───
 * Todos os números que envelhecem estão em TABELAS, no topo, com o campo
 * `vigencia`. Ao mudar o ano, edite SÓ esse bloco: todo comando imprime a
 * vigência junto do resultado, então o usuário sempre vê de qual tabela veio a
 * conta. Nenhum valor monetário está espalhado pelo resto do arquivo.
 *
 * As contas seguem a regra geral da CLT. Convenção coletiva da categoria pode
 * mudar piso, adicional e jornada — por isso todo resultado sai rotulado como
 * estimativa, e não como o valor exato do holerite.
 */

const TABELAS = {
    vigencia: '2025',
    salarioMinimo: 1518.00,

    // INSS do empregado: progressivo por faixa, como no holerite.
    inss: {
        teto: 8157.41,
        faixas: [
            { ate: 1518.00, aliquota: 7.5 },
            { ate: 2793.88, aliquota: 9 },
            { ate: 4190.83, aliquota: 12 },
            { ate: 8157.41, aliquota: 14 }
        ]
    },

    // IRRF mensal: alíquota e parcela a deduzir.
    irrf: {
        faixas: [
            { ate: 2428.80, aliquota: 0, deduzir: 0 },
            { ate: 2826.65, aliquota: 7.5, deduzir: 182.16 },
            { ate: 3751.05, aliquota: 15, deduzir: 394.16 },
            { ate: 4664.68, aliquota: 22.5, deduzir: 675.49 },
            { ate: Infinity, aliquota: 27.5, deduzir: 908.73 }
        ],
        porDependente: 189.59,
        descontoSimplificado: 607.20
    },

    fgtsPercentual: 8,
    jornadaMensalPadrao: 220,   // 44 h semanais
    adicionalNoturnoPct: 20,    // urbano, 22h às 5h
    limiteValeTransportePct: 6
}

/** INSS progressivo sobre o salário de contribuição. */
function calcularInss(bruto) {
    const b = Math.max(0, Number(bruto) || 0)
    const base = Math.min(b, TABELAS.inss.teto)
    let anterior = 0, total = 0
    const detalhe = []
    for (const f of TABELAS.inss.faixas) {
        if (base <= anterior) break
        const parcela = Math.min(base, f.ate) - anterior
        if (parcela > 0) {
            const valor = parcela * f.aliquota / 100
            total += valor
            detalhe.push({ aliquota: f.aliquota, sobre: parcela, valor })
        }
        anterior = f.ate
    }
    return {
        valor: Math.round(total * 100) / 100,
        detalhe,
        aliquotaEfetiva: b > 0 ? (total / b) * 100 : 0,
        noTeto: b > TABELAS.inss.teto
    }
}

/**
 * IRRF mensal. Compara o desconto simplificado com o modelo completo
 * (INSS + dependentes) e devolve o que sai mais barato, que é o que a folha faz.
 */
function calcularIrrf(bruto, inss = null, dependentes = 0) {
    const b = Math.max(0, Number(bruto) || 0)
    const descInss = inss === null ? calcularInss(b).valor : Number(inss) || 0
    const dep = Math.max(0, Math.floor(Number(dependentes) || 0))

    const aplicar = (base) => {
        const f = TABELAS.irrf.faixas.find(x => base <= x.ate)
        const imposto = Math.max(0, base * f.aliquota / 100 - f.deduzir)
        return { base, faixa: f, imposto: Math.round(imposto * 100) / 100 }
    }

    const completo = aplicar(Math.max(0, b - descInss - dep * TABELAS.irrf.porDependente))
    const simplificado = aplicar(Math.max(0, b - TABELAS.irrf.descontoSimplificado))
    const melhor = simplificado.imposto <= completo.imposto ? 'simplificado' : 'completo'
    const escolhido = melhor === 'simplificado' ? simplificado : completo

    return {
        valor: escolhido.imposto,
        modelo: melhor,
        base: escolhido.base,
        aliquota: escolhido.faixa.aliquota,
        deduzir: escolhido.faixa.deduzir,
        isento: escolhido.imposto === 0,
        completo: completo.imposto,
        simplificado: simplificado.imposto
    }
}

/** Salário líquido do mês. */
function salarioLiquido({ bruto, dependentes = 0, outrosDescontos = 0 }) {
    const b = Math.max(0, Number(bruto) || 0)
    const inss = calcularInss(b)
    const irrf = calcularIrrf(b, inss.valor, dependentes)
    const outros = Math.max(0, Number(outrosDescontos) || 0)
    const liquido = b - inss.valor - irrf.valor - outros
    return {
        bruto: b, inss, irrf, outros,
        liquido: Math.round(liquido * 100) / 100,
        totalDescontos: Math.round((inss.valor + irrf.valor + outros) * 100) / 100,
        pctDescontado: b > 0 ? ((inss.valor + irrf.valor + outros) / b) * 100 : 0
    }
}

/** 13º salário: as duas parcelas, com o desconto caindo todo na segunda. */
function decimoTerceiro({ salario, meses = 12, dependentes = 0 }) {
    const s = Math.max(0, Number(salario) || 0)
    const m = Math.min(12, Math.max(0, Math.floor(Number(meses) || 0)))
    const bruto = Math.round((s / 12) * m * 100) / 100
    const primeira = Math.round((bruto / 2) * 100) / 100
    const inss = calcularInss(bruto)
    const irrf = calcularIrrf(bruto, inss.valor, dependentes)
    const segunda = Math.round((bruto - primeira - inss.valor - irrf.valor) * 100) / 100
    return {
        bruto, meses: m, primeira, segunda, inss, irrf,
        liquidoTotal: Math.round((primeira + segunda) * 100) / 100
    }
}

/** Férias: dias gozados, terço constitucional e abono pecuniário opcional. */
function ferias({ salario, dias = 30, abono = false, dependentes = 0 }) {
    const s = Math.max(0, Number(salario) || 0)
    const d = Math.min(30, Math.max(1, Math.floor(Number(dias) || 30)))
    const diaria = s / 30
    const gozadas = Math.round(diaria * d * 100) / 100
    const terco = Math.round((gozadas / 3) * 100) / 100
    const brutoTributavel = gozadas + terco

    // Abono pecuniário: vender até 1/3 das férias. É isento de INSS e IRRF.
    const diasAbono = abono ? Math.floor(d / 3) : 0
    const valorAbono = Math.round(diaria * diasAbono * 100) / 100
    const tercoAbono = Math.round((valorAbono / 3) * 100) / 100

    const inss = calcularInss(brutoTributavel)
    const irrf = calcularIrrf(brutoTributavel, inss.valor, dependentes)
    const liquido = brutoTributavel - inss.valor - irrf.valor + valorAbono + tercoAbono

    return {
        dias: d, diaria, gozadas, terco, brutoTributavel,
        diasAbono, valorAbono, tercoAbono, inss, irrf,
        liquido: Math.round(liquido * 100) / 100
    }
}

/** Hora extra: valor da hora normal, adicional e total. */
function horasExtras({ salario, jornadaMensal = TABELAS.jornadaMensalPadrao, horas50 = 0, horas100 = 0 }) {
    const s = Math.max(0, Number(salario) || 0)
    const j = Math.max(1, Number(jornadaMensal) || TABELAS.jornadaMensalPadrao)
    const hora = s / j
    const h50 = Math.max(0, Number(horas50) || 0)
    const h100 = Math.max(0, Number(horas100) || 0)
    const v50 = hora * 1.5 * h50
    const v100 = hora * 2 * h100
    // Reflexo no DSR: a hora extra repercute no descanso semanal remunerado.
    const dsr = (v50 + v100) / 6
    return {
        hora: Math.round(hora * 100) / 100,
        h50, h100,
        valor50: Math.round(v50 * 100) / 100,
        valor100: Math.round(v100 * 100) / 100,
        dsr: Math.round(dsr * 100) / 100,
        total: Math.round((v50 + v100 + dsr) * 100) / 100,
        jornadaMensal: j
    }
}

/** Adicional noturno urbano: 20% e hora reduzida de 52min30s. */
function adicionalNoturno({ salario, horasNoturnas, jornadaMensal = TABELAS.jornadaMensalPadrao }) {
    const s = Math.max(0, Number(salario) || 0)
    const j = Math.max(1, Number(jornadaMensal) || TABELAS.jornadaMensalPadrao)
    const h = Math.max(0, Number(horasNoturnas) || 0)
    const hora = s / j
    const adicional = hora * (TABELAS.adicionalNoturnoPct / 100) * h
    // A hora noturna vale 52min30s, então 7 horas de relógio contam como 8.
    const horasFicticias = h * (60 / 52.5)
    const ganhoReducao = hora * (horasFicticias - h)
    return {
        hora: Math.round(hora * 100) / 100,
        horas: h,
        adicional: Math.round(adicional * 100) / 100,
        horasFicticias: Math.round(horasFicticias * 100) / 100,
        ganhoReducao: Math.round(ganhoReducao * 100) / 100,
        total: Math.round((adicional + ganhoReducao) * 100) / 100
    }
}

/** FGTS: depósito mensal e saldo acumulado (sem rendimento). */
function fgts({ salario, meses = 12 }) {
    const s = Math.max(0, Number(salario) || 0)
    const m = Math.max(0, Math.floor(Number(meses) || 0))
    const mensal = Math.round(s * TABELAS.fgtsPercentual / 100 * 100) / 100
    const acumulado = Math.round(mensal * m * 100) / 100
    return {
        mensal, meses: m, acumulado,
        multa40: Math.round(acumulado * 0.4 * 100) / 100,
        multa20: Math.round(acumulado * 0.2 * 100) / 100
    }
}

/** Vale-transporte: o desconto é o menor entre 6% do salário e o custo real. */
function valeTransporte({ salario, custoDiario, diasUteis = 22 }) {
    const s = Math.max(0, Number(salario) || 0)
    const c = Math.max(0, Number(custoDiario) || 0)
    const d = Math.max(0, Math.floor(Number(diasUteis) || 0))
    const custoTotal = Math.round(c * d * 100) / 100
    const teto = Math.round(s * TABELAS.limiteValeTransportePct / 100 * 100) / 100
    const desconto = Math.min(teto, custoTotal)
    return {
        custoTotal, teto, desconto: Math.round(desconto * 100) / 100,
        empresaPaga: Math.round((custoTotal - desconto) * 100) / 100,
        limitadoPeloTeto: teto < custoTotal
    }
}

/** Aviso prévio: 30 dias mais 3 por ano completo, teto de 90. */
function avisoPrevio(anosCompletos) {
    const a = Math.max(0, Math.floor(Number(anosCompletos) || 0))
    return Math.min(90, 30 + a * 3)
}

/** O que cada tipo de saída dá direito a receber. */
const TIPOS_RESCISAO = {
    semjustacausa: {
        nome: 'Demissão sem justa causa', quemPede: 'a empresa',
        aviso: 'recebe', decimo: true, feriasProp: true, multaFgts: 40, saqueFgts: 100, seguro: true,
        resumo: 'É a saída com o pacote completo: tudo é devido, com multa de 40% e saque integral do FGTS.'
    },
    pedidodemissao: {
        nome: 'Pedido de demissão', quemPede: 'o trabalhador',
        aviso: 'paga', decimo: true, feriasProp: true, multaFgts: 0, saqueFgts: 0, seguro: false,
        resumo: 'As verbas proporcionais são pagas, mas não há multa nem saque do FGTS. Se não cumprir o aviso, o valor é descontado.'
    },
    justacausa: {
        nome: 'Demissão por justa causa', quemPede: 'a empresa',
        aviso: 'nenhum', decimo: false, feriasProp: false, multaFgts: 0, saqueFgts: 0, seguro: false,
        resumo: 'Recebe apenas saldo de salário e férias vencidas com 1/3. É a hipótese mais severa e exige falta grave comprovada.'
    },
    acordo: {
        nome: 'Acordo entre as partes (art. 484-A)', quemPede: 'os dois, em comum acordo',
        aviso: 'metade', decimo: true, feriasProp: true, multaFgts: 20, saqueFgts: 80, seguro: false,
        resumo: 'Criado pela reforma de 2017: aviso e multa pela metade, saque de 80% e nenhum seguro-desemprego.'
    },
    terminocontrato: {
        nome: 'Fim de contrato por prazo determinado', quemPede: 'ninguém — o prazo acabou',
        aviso: 'nenhum', decimo: true, feriasProp: true, multaFgts: 0, saqueFgts: 100, seguro: false,
        resumo: 'Chegando ao termo final, não há aviso nem multa, mas o FGTS pode ser sacado. Rompimento antecipado tem regra própria.'
    }
}

/** Rescisão: monta as verbas conforme o tipo de saída. */
function rescisao({ salario, meses, tipo = 'semjustacausa', diasSaldo = 0, feriasVencidas = 0, saldoFgts = null }) {
    const t = TIPOS_RESCISAO[tipo] || TIPOS_RESCISAO.semjustacausa
    const s = Math.max(0, Number(salario) || 0)
    const m = Math.max(0, Math.floor(Number(meses) || 0))
    const anos = Math.floor(m / 12)
    const mesesNoAno = m % 12
    const diaria = s / 30

    const verbas = []
    const somar = (nome, valor, obs) => { if (valor > 0.005) verbas.push({ nome, valor: Math.round(valor * 100) / 100, obs }) }

    somar('Saldo de salário', diaria * Math.max(0, Math.floor(Number(diasSaldo) || 0)), `${diasSaldo} dia(s) do mês`)

    const diasAviso = avisoPrevio(anos)
    if (t.aviso === 'recebe') somar('Aviso prévio indenizado', diaria * diasAviso, `${diasAviso} dias (30 + 3 por ano)`)
    if (t.aviso === 'metade') somar('Aviso prévio (metade)', diaria * diasAviso / 2, `${diasAviso} dias, pagos pela metade`)

    if (t.decimo) somar('13º proporcional', (s / 12) * mesesNoAno, `${mesesNoAno}/12 avos`)

    const vencidas = Math.max(0, Math.floor(Number(feriasVencidas) || 0))
    if (vencidas > 0) somar('Férias vencidas + 1/3', s * vencidas * (4 / 3), `${vencidas} período(s) integral(is)`)

    if (t.feriasProp) somar('Férias proporcionais + 1/3', (s / 12) * mesesNoAno * (4 / 3), `${mesesNoAno}/12 avos`)

    const fgtsBase = saldoFgts === null ? fgts({ salario: s, meses: m }).acumulado : Math.max(0, Number(saldoFgts) || 0)
    if (t.multaFgts > 0) somar(`Multa do FGTS (${t.multaFgts}%)`, fgtsBase * t.multaFgts / 100, `sobre ${fgtsBase.toFixed(2)} de saldo`)

    const descontos = []
    if (t.aviso === 'paga') descontos.push({ nome: 'Aviso prévio não cumprido', valor: Math.round(diaria * 30 * 100) / 100, obs: 'descontado se o trabalhador não trabalhar o aviso' })

    const totalVerbas = verbas.reduce((a, v) => a + v.valor, 0)
    const totalDescontos = descontos.reduce((a, v) => a + v.valor, 0)

    return {
        tipo: t, meses: m, anos, mesesNoAno, diasAviso,
        verbas, descontos,
        total: Math.round((totalVerbas - totalDescontos) * 100) / 100,
        totalVerbas: Math.round(totalVerbas * 100) / 100,
        totalDescontos: Math.round(totalDescontos * 100) / 100,
        fgtsBase, saqueFgts: Math.round(fgtsBase * t.saqueFgts / 100 * 100) / 100
    }
}

/** Direitos: o que é, quem tem, e o ponto que gera mais dúvida. */
const DIREITOS = {
    ferias: { nome: 'Férias', base: 'CLT art. 129 a 145', quem: 'Todo empregado com 12 meses de trabalho',
        oquee: '30 dias de descanso remunerado por ano trabalhado, acrescidos de 1/3 do salário.',
        detalhe: 'Podem ser divididas em até três períodos, sendo um de no mínimo 14 dias e os outros de no mínimo 5. Até 1/3 pode ser vendido (abono pecuniário).',
        pegadinha: 'Férias não concedidas em até 12 meses após o período aquisitivo devem ser pagas em dobro.' },
    decimoterceiro: { nome: '13º salário', base: 'Lei 4.090/62', quem: 'Todo empregado com carteira assinada',
        oquee: 'Um salário extra por ano, proporcional aos meses trabalhados.',
        detalhe: '1ª parcela até 30 de novembro (metade, sem descontos); 2ª até 20 de dezembro, com INSS e IRRF sobre o total.',
        pegadinha: 'Mês com 15 dias ou mais de trabalho conta como mês inteiro para o cálculo.' },
    fgts: { nome: 'FGTS', base: 'Lei 8.036/90', quem: 'Todo empregado CLT',
        oquee: '8% do salário depositados mensalmente pela empresa numa conta em nome do trabalhador.',
        detalhe: 'Sai do bolso da empresa, não é descontado do salário. Pode ser sacado na demissão sem justa causa, aposentadoria, compra da casa própria e doenças graves.',
        pegadinha: 'Confira os depósitos pelo app FGTS: empresa que não deposita é problema comum e prescreve em 5 anos.' },
    avisoprevio: { nome: 'Aviso prévio', base: 'CLT art. 487 e Lei 12.506/11', quem: 'Ambas as partes',
        oquee: 'Comunicação antecipada do fim do contrato: 30 dias, mais 3 por ano completo, até o máximo de 90.',
        detalhe: 'Pode ser trabalhado (com redução de 2 h/dia ou 7 dias corridos) ou indenizado (pago sem trabalhar).',
        pegadinha: 'Os dias extras por tempo de casa valem só a favor do trabalhador, nunca contra ele.' },
    horasextras: { nome: 'Horas extras', base: 'CLT art. 59', quem: 'Empregado sujeito a controle de jornada',
        oquee: 'Trabalho além da jornada normal, pago com no mínimo 50% de adicional.',
        detalhe: 'Domingos e feriados costumam ser 100%. Limite legal de 2 horas extras por dia.',
        pegadinha: 'A hora extra também repercute no DSR, no 13º, nas férias e no FGTS — não é só a hora.' },
    adicionalnoturno: { nome: 'Adicional noturno', base: 'CLT art. 73', quem: 'Quem trabalha entre 22h e 5h (urbano)',
        oquee: 'Acréscimo de 20% sobre a hora normal no período noturno.',
        detalhe: 'A hora noturna é reduzida: vale 52 minutos e 30 segundos, então 7 horas de relógio contam como 8.',
        pegadinha: 'No trabalho rural o período e o percentual são diferentes (25%).' },
    insalubridade: { nome: 'Adicional de insalubridade', base: 'CLT art. 189 a 192', quem: 'Exposto a agente nocivo acima do limite',
        oquee: 'Acréscimo de 10%, 20% ou 40% sobre o salário mínimo, conforme o grau.',
        detalhe: 'Depende de laudo técnico (LTCAT/PPRA). Fornecer EPI eficaz pode eliminar o direito.',
        pegadinha: 'Insalubridade e periculosidade não se acumulam: o trabalhador escolhe a mais vantajosa.' },
    periculosidade: { nome: 'Adicional de periculosidade', base: 'CLT art. 193', quem: 'Exposto a risco de vida permanente',
        oquee: 'Acréscimo de 30% sobre o salário base.',
        detalhe: 'Vale para inflamáveis, explosivos, energia elétrica, segurança patrimonial e motociclista profissional.',
        pegadinha: 'Incide sobre o salário base, não sobre o mínimo — por isso costuma valer mais que a insalubridade.' },
    valetransporte: { nome: 'Vale-transporte', base: 'Lei 7.418/85', quem: 'Empregado que usa transporte público para trabalhar',
        oquee: 'A empresa custeia o deslocamento casa-trabalho-casa.',
        detalhe: 'O desconto no salário é limitado a 6% do salário base; o que passar disso é da empresa.',
        pegadinha: 'É opcional para o trabalhador, mas exige declaração por escrito — sem ela a empresa não é obrigada a fornecer.' },
    licencamaternidade: { nome: 'Licença-maternidade', base: 'CF art. 7º e Lei 11.770/08', quem: 'Mãe empregada, inclusive por adoção',
        oquee: '120 dias de afastamento com salário integral, pago pelo INSS.',
        detalhe: 'Pode chegar a 180 dias em empresas do Programa Empresa Cidadã.',
        pegadinha: 'A estabilidade vai da confirmação da gravidez até 5 meses após o parto — e vale mesmo se a empresa não sabia.' },
    licencapaternidade: { nome: 'Licença-paternidade', base: 'CF art. 7º e ADCT art. 10', quem: 'Pai empregado',
        oquee: '5 dias corridos a partir do nascimento.',
        detalhe: 'Sobe para 20 dias em empresas do Programa Empresa Cidadã.',
        pegadinha: 'Conta em dias corridos, incluindo o dia do nascimento.' },
    intervalo: { nome: 'Intervalo intrajornada', base: 'CLT art. 71', quem: 'Jornada acima de 6 horas',
        oquee: 'No mínimo 1 hora e no máximo 2 para refeição e descanso.',
        detalhe: 'Jornada entre 4 e 6 horas dá direito a 15 minutos. Abaixo de 4 horas, não há intervalo obrigatório.',
        pegadinha: 'Intervalo suprimido é pago como hora extra, mas só o tempo não usufruído — mudou com a reforma de 2017.' },
    dsr: { nome: 'Descanso semanal remunerado', base: 'Lei 605/49', quem: 'Todo empregado',
        oquee: '24 horas seguidas de descanso por semana, preferencialmente aos domingos.',
        detalhe: 'Faltas injustificadas na semana fazem perder o DSR daquela semana.',
        pegadinha: 'Quem trabalha no domingo tem direito a folga compensatória, e ela deve coincidir com um domingo pelo menos a cada 7 semanas.' },
    bancodehoras: { nome: 'Banco de horas', base: 'CLT art. 59, §§ 2º a 6º', quem: 'Onde houver acordo',
        oquee: 'Compensar horas extras com folgas em vez de pagá-las.',
        detalhe: 'Acordo individual escrito permite compensação em até 6 meses; convenção coletiva, em até 1 ano.',
        pegadinha: 'Horas não compensadas no prazo viram hora extra com adicional, e são pagas na rescisão.' },
    salariofamilia: { nome: 'Salário-família', base: 'Lei 8.213/91', quem: 'Baixa renda, com filhos até 14 anos',
        oquee: 'Valor pago por filho a trabalhadores dentro do limite de renda definido anualmente.',
        detalhe: 'Pago pela empresa e compensado com o INSS. Exige certidão de nascimento e carteira de vacinação em dia.',
        pegadinha: 'O limite de renda é baixo e reajustado todo ano — confira o valor vigente antes de contar com ele.' },
    segurodesemprego: { nome: 'Seguro-desemprego', base: 'Lei 7.998/90', quem: 'Demitido sem justa causa',
        oquee: 'De 3 a 5 parcelas, conforme o tempo trabalhado nos últimos 36 meses.',
        detalhe: 'Requerimento de 7 a 120 dias após a demissão, pelo app Carteira de Trabalho Digital ou gov.br.',
        pegadinha: 'Pedido de demissão e acordo do art. 484-A não dão direito. Justa causa também não.' },
    estabilidade: { nome: 'Estabilidades no emprego', base: 'CF, CLT e leis específicas', quem: 'Situações protegidas',
        oquee: 'Períodos em que a demissão sem justa causa é proibida.',
        detalhe: 'Gestante (da confirmação até 5 meses após o parto), acidentado (12 meses após o auxílio-doença acidentário), cipeiro, dirigente sindical e alguns casos de convenção coletiva.',
        pegadinha: 'Demissão dentro da estabilidade gera reintegração ou indenização do período todo.' },
    jornada: { nome: 'Jornada de trabalho', base: 'CF art. 7º, XIII', quem: 'Todo empregado',
        oquee: 'Máximo de 8 horas diárias e 44 semanais.',
        detalhe: 'Escalas 12x36 são permitidas por acordo. Entre uma jornada e outra devem existir 11 horas de descanso.',
        pegadinha: 'O tempo à disposição da empresa conta como jornada, mesmo sem trabalhar de fato.' }
}

/** Tipos de contrato. */
const CONTRATOS = {
    indeterminado: { nome: 'Contrato por prazo indeterminado', duracao: 'sem prazo final',
        comofunciona: 'O padrão da CLT. Vale até que uma das partes o encerre.',
        direitos: 'Todos os direitos celetistas, sem restrição.',
        atencao: 'É o contrato que dá a proteção mais completa; qualquer outro formato é exceção prevista em lei.' },
    determinado: { nome: 'Contrato por prazo determinado', duracao: 'até 2 anos',
        comofunciona: 'Só é válido em serviço de natureza transitória, atividade empresarial transitória ou contrato de experiência.',
        direitos: 'Férias, 13º e FGTS proporcionais. Sem aviso prévio e sem multa de 40% no término normal.',
        atencao: 'Admite uma única prorrogação. Prorrogar duas vezes transforma em indeterminado.' },
    experiencia: { nome: 'Contrato de experiência', duracao: 'até 90 dias',
        comofunciona: 'Espécie de contrato determinado, para avaliar a adaptação ao cargo.',
        direitos: 'Todos os direitos proporcionais, incluindo FGTS.',
        atencao: 'Máximo de 90 dias no total, com uma prorrogação. Passou disso, vira indeterminado automaticamente.' },
    intermitente: { nome: 'Contrato intermitente', duracao: 'sem prazo, com convocações',
        comofunciona: 'Trabalho não contínuo, com convocação avisada com 3 dias de antecedência.',
        direitos: 'Férias, 13º, FGTS e INSS proporcionais ao período efetivamente trabalhado.',
        atencao: 'Não há garantia de renda mínima mensal. Recusar a convocação não é falta.' },
    temporario: { nome: 'Trabalho temporário', duracao: 'até 180 dias, prorrogáveis por 90',
        comofunciona: 'Contratado por empresa de trabalho temporário para atender demanda ou substituir alguém.',
        direitos: 'Mesmo salário dos efetivos da tomadora na mesma função, além dos direitos proporcionais.',
        atencao: 'O vínculo é com a empresa de trabalho temporário, não com a empresa onde se trabalha.' },
    aprendiz: { nome: 'Contrato de aprendizagem', duracao: 'até 2 anos',
        comofunciona: 'Para jovens de 14 a 24 anos, unindo trabalho e formação técnico-profissional.',
        direitos: 'Salário mínimo hora, férias coincidindo com as escolares, 13º e FGTS de 2%.',
        atencao: 'FGTS reduzido a 2% é a única diferença relevante nos depósitos. A empresa é obrigada a manter cota de aprendizes.' },
    teletrabalho: { nome: 'Teletrabalho (home office)', duracao: 'conforme o contrato',
        comofunciona: 'Prestação preponderantemente fora da empresa, com uso de tecnologia.',
        direitos: 'Todos os direitos celetistas. O regime deve constar em contrato escrito.',
        atencao: 'Quem é contratado por produção ou tarefa fica fora do controle de jornada — e portanto sem hora extra.' },
    pj: { nome: 'Contratação como PJ', duracao: 'conforme o contrato civil',
        comofunciona: 'Não é contrato de trabalho: é prestação de serviço entre empresas.',
        direitos: 'Nenhum direito celetista. Sem férias, 13º, FGTS ou aviso prévio.',
        atencao: 'Se houver pessoalidade, habitualidade, subordinação e onerosidade, a Justiça pode reconhecer vínculo de emprego — é a chamada pejotização.' }
}

/** O que fazer quando dá problema. */
const SITUACOES = {
    salarioatrasado: { nome: 'Salário atrasado', urgencia: 'alta',
        oquediz: 'O pagamento deve ocorrer até o 5º dia útil do mês seguinte ao trabalhado.',
        oquefazer: ['Registre a data real de cada pagamento por escrito.', 'Cobre formalmente por e-mail ou mensagem, guardando o envio.', 'Atraso contumaz permite pedir rescisão indireta, com todas as verbas de uma demissão sem justa causa.'],
        onde: 'Sindicato da categoria e, se persistir, Justiça do Trabalho.' },
    fgtsnaodepositado: { nome: 'FGTS não depositado', urgencia: 'média',
        oquediz: 'A empresa deve depositar 8% do salário todo mês, até o dia 7.',
        oquefazer: ['Confira o extrato no app FGTS mês a mês.', 'Junte holerites do mesmo período.', 'Denuncie ao Ministério do Trabalho; a fiscalização é gratuita.'],
        onde: 'App FGTS, Ministério do Trabalho e Emprego, sindicato.' },
    assediomoral: { nome: 'Assédio moral', urgencia: 'alta',
        oquediz: 'Condutas repetidas que humilham ou constrangem o trabalhador ferem sua dignidade.',
        oquefazer: ['Anote data, hora, local, o que foi dito e quem viu.', 'Guarde mensagens, e-mails e áudios.', 'Procure o canal interno de denúncia, se houver, e o sindicato.'],
        onde: 'Sindicato, Ministério Público do Trabalho, Justiça do Trabalho.' },
    acidentetrabalho: { nome: 'Acidente de trabalho', urgencia: 'máxima',
        oquediz: 'Todo acidente deve ser comunicado por CAT até o dia útil seguinte, e imediatamente em caso de morte.',
        oquefazer: ['Busque atendimento médico e guarde todos os laudos.', 'Exija a emissão da CAT — o trabalhador, o médico ou o sindicato também podem emitir.', 'A estabilidade é de 12 meses após o fim do auxílio-doença acidentário.'],
        onde: 'INSS, sindicato, Ministério Público do Trabalho.' },
    demissaogravida: { nome: 'Demissão de gestante', urgencia: 'alta',
        oquediz: 'A estabilidade vai da confirmação da gravidez até 5 meses após o parto.',
        oquefazer: ['Comunique a gravidez por escrito assim que confirmada.', 'A estabilidade vale mesmo se a empresa não sabia na data da demissão.', 'Peça reintegração ou a indenização do período de estabilidade.'],
        onde: 'Sindicato e Justiça do Trabalho.' },
    horasnaopagas: { nome: 'Horas extras não pagas', urgencia: 'média',
        oquediz: 'Toda hora além da jornada é devida com adicional mínimo de 50%.',
        oquefazer: ['Guarde prints do ponto, mensagens fora do horário e escalas.', 'Testemunhas do setor ajudam a provar a jornada real.', 'O direito prescreve em 5 anos, limitado a 2 anos após a saída.'],
        onde: 'Sindicato e Justiça do Trabalho.' },
    rescisaoindireta: { nome: 'Rescisão indireta', urgencia: 'média',
        oquediz: 'É a "justa causa da empresa": falta grave do empregador permite ao trabalhador sair recebendo tudo.',
        oquefazer: ['Reúna prova da falta: salário atrasado, rigor excessivo, exigência de tarefa ilegal ou risco à saúde.', 'Consulte antes de pedir demissão — pedir demissão perde as verbas.', 'É pedida judicialmente, e o trabalhador pode parar de comparecer após o ajuizamento.'],
        onde: 'Advogado trabalhista ou sindicato, antes de qualquer decisão.' },
    carteiranaoassinada: { nome: 'Trabalho sem carteira assinada', urgencia: 'alta',
        oquediz: 'Presentes pessoalidade, habitualidade, subordinação e salário, existe vínculo — com ou sem registro.',
        oquefazer: ['Junte prova do trabalho: mensagens, escalas, uniformes, comprovantes de pagamento, fotos.', 'Testemunhas são decisivas.', 'O reconhecimento gera todas as verbas do período, além do registro retroativo.'],
        onde: 'Ministério do Trabalho e Justiça do Trabalho.' }
}

const moeda = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (v, c = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c }) + '%'

/** Lê número aceitando vírgula, ponto e separador de milhar. */
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
    for (const [tipo, cat] of [['direito', DIREITOS], ['contrato', CONTRATOS], ['situacao', SITUACOES]]) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = {
    TABELAS, DIREITOS, CONTRATOS, SITUACOES, TIPOS_RESCISAO,
    calcularInss, calcularIrrf, salarioLiquido, decimoTerceiro, ferias,
    horasExtras, adicionalNoturno, fgts, valeTransporte, avisoPrevio, rescisao,
    moeda, pct, lerNumero, procurar
}
