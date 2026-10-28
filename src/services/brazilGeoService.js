/**
 * Geografia do Brasil: estados, regiões e biomas.
 *
 * ─── PROCEDÊNCIA DOS NÚMEROS ───
 * População é do Censo 2022 (IBGE), arredondada. Área é a oficial do IBGE em
 * km². O campo VIGENCIA_DADOS aparece em todo comando que mostra número, para
 * quem lê saber de quando é — população envelhece rápido, área não.
 *
 * Gentílico é o do ESTADO. Vale reparar em Rio de Janeiro: fluminense é quem
 * nasce no estado, carioca é quem nasce na capital. São coisas diferentes e é o
 * erro mais comum da lista.
 */

const VIGENCIA_DADOS = 'Censo 2022 (IBGE)'

const ESTADOS = {
    ac: { nome: 'Acre', capital: 'Rio Branco', regiao: 'Norte', gentilico: 'acriano', area: 164173, populacao: 830018, bioma: 'Amazônia',
        marca: 'Único estado com dois fusos horários de diferença para Brasília em parte do território. Foi comprado da Bolívia pelo Tratado de Petrópolis, em 1903.' },
    al: { nome: 'Alagoas', capital: 'Maceió', regiao: 'Nordeste', gentilico: 'alagoano', area: 27848, populacao: 3127511, bioma: 'Mata Atlântica e Caatinga',
        marca: 'Menor estado do Nordeste em área. Abriga a serra da Barriga, onde ficava o Quilombo dos Palmares.' },
    ap: { nome: 'Amapá', capital: 'Macapá', regiao: 'Norte', gentilico: 'amapaense', area: 142470, populacao: 733759, bioma: 'Amazônia',
        marca: 'Macapá é a única capital cortada pela linha do Equador e a única sem ligação rodoviária com o resto do país.' },
    am: { nome: 'Amazonas', capital: 'Manaus', regiao: 'Norte', gentilico: 'amazonense', area: 1559168, populacao: 3941613, bioma: 'Amazônia',
        marca: 'Maior estado do Brasil: sozinho é maior que a soma de França, Espanha, Alemanha e Itália.' },
    ba: { nome: 'Bahia', capital: 'Salvador', regiao: 'Nordeste', gentilico: 'baiano', area: 564760, populacao: 14136417, bioma: 'Caatinga, Cerrado e Mata Atlântica',
        marca: 'Maior estado do Nordeste e o de mais municípios da região (417). Salvador foi a primeira capital do Brasil, de 1549 a 1763.' },
    ce: { nome: 'Ceará', capital: 'Fortaleza', regiao: 'Nordeste', gentilico: 'cearense', area: 148894, populacao: 8794957, bioma: 'Caatinga',
        marca: 'Foi a primeira província a abolir a escravidão, em 1884, quatro anos antes da Lei Áurea.' },
    df: { nome: 'Distrito Federal', capital: 'Brasília', regiao: 'Centro-Oeste', gentilico: 'brasiliense', area: 5760, populacao: 2817381, bioma: 'Cerrado',
        marca: 'Não é estado nem município: é uma unidade federativa própria, sem municípios, dividida em regiões administrativas.' },
    es: { nome: 'Espírito Santo', capital: 'Vitória', regiao: 'Sudeste', gentilico: 'capixaba', area: 46074, populacao: 3833712, bioma: 'Mata Atlântica',
        marca: 'O gentílico capixaba vem do tupi e significava "roça de milho". Vitória é uma das três capitais brasileiras em ilha.' },
    go: { nome: 'Goiás', capital: 'Goiânia', regiao: 'Centro-Oeste', gentilico: 'goiano', area: 340203, populacao: 7056495, bioma: 'Cerrado',
        marca: 'Perdeu quase metade do território em 1988, quando Tocantins foi criado. Goiânia é uma cidade planejada, de 1933.' },
    ma: { nome: 'Maranhão', capital: 'São Luís', regiao: 'Nordeste', gentilico: 'maranhense', area: 329642, populacao: 6775805, bioma: 'Cerrado, Amazônia e Caatinga',
        marca: 'São Luís é a única capital brasileira fundada por franceses. Abriga os Lençóis Maranhenses, dunas com lagoas de água doce.' },
    mt: { nome: 'Mato Grosso', capital: 'Cuiabá', regiao: 'Centro-Oeste', gentilico: 'mato-grossense', area: 903207, populacao: 3658649, bioma: 'Cerrado, Amazônia e Pantanal',
        marca: 'Terceiro maior estado e o único onde se encontram três biomas. Cuiabá fica perto do centro geodésico da América do Sul.' },
    ms: { nome: 'Mato Grosso do Sul', capital: 'Campo Grande', regiao: 'Centro-Oeste', gentilico: 'sul-mato-grossense', area: 357145, populacao: 2757013, bioma: 'Cerrado e Pantanal',
        marca: 'Criado em 1977, pela divisão de Mato Grosso. Concentra a maior parte do Pantanal brasileiro.' },
    mg: { nome: 'Minas Gerais', capital: 'Belo Horizonte', regiao: 'Sudeste', gentilico: 'mineiro', area: 586514, populacao: 20539989, bioma: 'Cerrado e Mata Atlântica',
        marca: 'Estado com mais municípios do país: 853. Não tem litoral, e ainda assim é o segundo mais populoso.' },
    pa: { nome: 'Pará', capital: 'Belém', regiao: 'Norte', gentilico: 'paraense', area: 1245870, populacao: 8120131, bioma: 'Amazônia',
        marca: 'Segundo maior estado. Abriga a ilha do Marajó, a maior ilha fluviomarinha do mundo.' },
    pb: { nome: 'Paraíba', capital: 'João Pessoa', regiao: 'Nordeste', gentilico: 'paraibano', area: 56469, populacao: 3974687, bioma: 'Caatinga e Mata Atlântica',
        marca: 'A Ponta do Seixas, em João Pessoa, é o ponto mais oriental das Américas — onde o sol nasce primeiro no continente.' },
    pr: { nome: 'Paraná', capital: 'Curitiba', regiao: 'Sul', gentilico: 'paranaense', area: 199298, populacao: 11444380, bioma: 'Mata Atlântica',
        marca: 'Abriga as Cataratas do Iguaçu, com 275 quedas. Curitiba é referência mundial em transporte por corredores de ônibus.' },
    pe: { nome: 'Pernambuco', capital: 'Recife', regiao: 'Nordeste', gentilico: 'pernambucano', area: 98067, populacao: 9058931, bioma: 'Caatinga e Mata Atlântica',
        marca: 'Administra Fernando de Noronha, a 545 km da costa. Foi o centro da ocupação holandesa no século XVII.' },
    pi: { nome: 'Piauí', capital: 'Teresina', regiao: 'Nordeste', gentilico: 'piauiense', area: 251755, populacao: 3271199, bioma: 'Caatinga e Cerrado',
        marca: 'Menor litoral do Brasil: apenas 66 km. A Serra da Capivara guarda alguns dos vestígios humanos mais antigos das Américas.' },
    rj: { nome: 'Rio de Janeiro', capital: 'Rio de Janeiro', regiao: 'Sudeste', gentilico: 'fluminense', area: 43750, populacao: 16055174, bioma: 'Mata Atlântica',
        marca: 'Fluminense é quem nasce no estado; carioca, quem nasce na capital. Foi capital do país por 197 anos, de 1763 a 1960.' },
    rn: { nome: 'Rio Grande do Norte', capital: 'Natal', regiao: 'Nordeste', gentilico: 'potiguar', area: 52809, populacao: 3302729, bioma: 'Caatinga e Mata Atlântica',
        marca: 'Tem o maior parque de energia eólica do país. Potiguar vem do tupi e significa "comedor de camarão".' },
    rs: { nome: 'Rio Grande do Sul', capital: 'Porto Alegre', regiao: 'Sul', gentilico: 'gaúcho', area: 281707, populacao: 10882965, bioma: 'Mata Atlântica e Pampa',
        marca: 'Único estado onde o Pampa ocorre no Brasil. Foi república independente por dez anos durante a Revolução Farroupilha.' },
    ro: { nome: 'Rondônia', capital: 'Porto Velho', regiao: 'Norte', gentilico: 'rondoniense', area: 237765, populacao: 1581196, bioma: 'Amazônia',
        marca: 'Leva o nome do marechal Rondon. A ferrovia Madeira-Mamoré, construída ali, ficou conhecida como a ferrovia do diabo pelo número de mortes.' },
    rr: { nome: 'Roraima', capital: 'Boa Vista', regiao: 'Norte', gentilico: 'roraimense', area: 224301, populacao: 636707, bioma: 'Amazônia',
        marca: 'Estado menos populoso do Brasil e o único inteiramente no hemisfério norte em boa parte do território. Boa Vista é a única capital ao norte da linha do Equador.' },
    sc: { nome: 'Santa Catarina', capital: 'Florianópolis', regiao: 'Sul', gentilico: 'catarinense', area: 95730, populacao: 7610361, bioma: 'Mata Atlântica',
        marca: 'Registra as temperaturas mais baixas do país com alguma regularidade. Florianópolis fica quase toda numa ilha.' },
    sp: { nome: 'São Paulo', capital: 'São Paulo', regiao: 'Sudeste', gentilico: 'paulista', area: 248219, populacao: 44411238, bioma: 'Mata Atlântica e Cerrado',
        marca: 'Estado mais populoso: um em cada cinco brasileiros mora nele. Paulista é do estado; paulistano, da capital.' },
    se: { nome: 'Sergipe', capital: 'Aracaju', regiao: 'Nordeste', gentilico: 'sergipano', area: 21925, populacao: 2210004, bioma: 'Caatinga e Mata Atlântica',
        marca: 'Menor estado do Brasil em área. Aracaju foi a primeira capital brasileira planejada, em 1855.' },
    to: { nome: 'Tocantins', capital: 'Palmas', regiao: 'Norte', gentilico: 'tocantinense', area: 277466, populacao: 1511460, bioma: 'Cerrado',
        marca: 'Estado mais novo do Brasil, criado pela Constituição de 1988. Palmas é a capital mais jovem do país, fundada em 1989.' }
}

const REGIOES = {
    norte: { nome: 'Norte', estados: ['ac', 'ap', 'am', 'pa', 'ro', 'rr', 'to'],
        marca: 'Maior região em área e a menos densamente povoada. Concentra a floresta amazônica e a maior bacia hidrográfica do mundo.',
        economia: 'Extrativismo, Zona Franca de Manaus, mineração e agropecuária em expansão.',
        detalhe: 'Ocupa 45% do território nacional com cerca de 8% da população.' },
    nordeste: { nome: 'Nordeste', estados: ['al', 'ba', 'ce', 'ma', 'pb', 'pe', 'pi', 'rn', 'se'],
        marca: 'Região com mais estados (nove) e o litoral mais extenso. Berço da colonização portuguesa no país.',
        economia: 'Turismo, energia eólica e solar, petroquímica, agricultura irrigada no vale do São Francisco.',
        detalhe: 'Divide-se em quatro sub-regiões bem distintas: Zona da Mata, Agreste, Sertão e Meio-Norte.' },
    centrooeste: { nome: 'Centro-Oeste', estados: ['df', 'go', 'mt', 'ms'],
        marca: 'Região do Cerrado e do Pantanal, e sede da capital federal.',
        economia: 'Maior produtora de grãos e carne do país; o agronegócio domina a pauta.',
        detalhe: 'Menos unidades federativas que qualquer outra região: apenas quatro.' },
    sudeste: { nome: 'Sudeste', estados: ['es', 'mg', 'rj', 'sp'],
        marca: 'Região mais populosa e economicamente concentrada, com as duas maiores metrópoles do país.',
        economia: 'Indústria, serviços, finanças, petróleo na bacia de Campos, mineração em Minas.',
        detalhe: 'Tem cerca de 42% da população em 11% do território.' },
    sul: { nome: 'Sul', estados: ['pr', 'rs', 'sc'],
        marca: 'Menor região em área, com clima subtropical e a única onde neva com alguma regularidade.',
        economia: 'Agroindústria, indústria de transformação, vinho na serra gaúcha, tecnologia em Florianópolis e Curitiba.',
        detalhe: 'Forte marca da imigração alemã, italiana, polonesa e ucraniana.' }
}

const BIOMAS = {
    amazonia: { nome: 'Amazônia', areaPct: 49.5, estados: 'AC, AP, AM, PA, RO, RR, parte de MT, TO e MA',
        oquee: 'Maior floresta tropical do mundo, com a maior biodiversidade conhecida do planeta.',
        marca: 'Produz os "rios voadores": massas de vapor que levam chuva para o Centro-Oeste, o Sudeste e até a Argentina.',
        ameaca: 'Desmatamento por pecuária, grilagem, garimpo e queimadas. Perto do ponto de não retorno segundo boa parte da literatura científica.' },
    cerrado: { nome: 'Cerrado', areaPct: 23.3, estados: 'GO, DF, TO, MT, MS, MG, BA, PI, MA',
        oquee: 'Savana mais biodiversa do mundo, com árvores tortuosas e casca grossa adaptadas ao fogo.',
        marca: 'É chamado de caixa d\'água do Brasil: nele nascem oito das doze grandes bacias hidrográficas do país.',
        ameaca: 'Bioma mais desmatado proporcionalmente, pela expansão agrícola. Perdeu cerca de metade da cobertura original.' },
    mataatlantica: { nome: 'Mata Atlântica', areaPct: 13.0, estados: 'de RN ao RS, ao longo do litoral, e adentrando MG, GO e MS',
        oquee: 'Floresta tropical costeira, uma das mais ameaçadas e mais biodiversas do mundo.',
        marca: 'Abriga cerca de 70% da população brasileira e mais de 60% das espécies ameaçadas do país.',
        ameaca: 'Restam cerca de 12% da cobertura original, em fragmentos. É o bioma mais devastado do Brasil.' },
    caatinga: { nome: 'Caatinga', areaPct: 9.9, estados: 'BA, CE, PE, PI, RN, PB, AL, SE, parte de MG',
        oquee: 'Único bioma exclusivamente brasileiro. Vegetação adaptada à seca, que perde as folhas para não perder água.',
        marca: 'Não é deserto nem terra morta: reverdece por completo em poucos dias após a primeira chuva.',
        ameaca: 'Desmatamento para lenha e pecuária, somado à desertificação em áreas do sertão.' },
    pampa: { nome: 'Pampa', areaPct: 2.1, estados: 'metade sul do RS',
        oquee: 'Campos naturais de gramíneas, com relevo suave e poucas árvores.',
        marca: 'Tem mais de 400 espécies de gramíneas nativas, base da pecuária extensiva gaúcha há séculos.',
        ameaca: 'Substituição por lavoura de grãos e por silvicultura de eucalipto e pínus.' },
    pantanal: { nome: 'Pantanal', areaPct: 1.8, estados: 'MS e MT',
        oquee: 'Maior planície alagável contínua do planeta, com ciclo anual de cheia e seca.',
        marca: 'Maior concentração de fauna das Américas. Na seca, os animais se juntam nos corixos e a visualização é única no mundo.',
        ameaca: 'Queimadas de grande escala, assoreamento pela erosão no planalto e obras hidroviárias.' }
}

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Estados de uma região. */
function estadosDa(regiao) {
    const r = REGIOES[norm(regiao).replace(/[^a-z]/g, '')]
    if (!r) return null
    return { regiao: r, estados: r.estados.map(s => ({ sigla: s.toUpperCase(), ...ESTADOS[s] })) }
}

/** Descobre o estado a partir da capital, do nome, da sigla ou do gentílico. */
function acharEstado(termo) {
    const t = norm(termo)
    if (!t) return null
    for (const [sigla, e] of Object.entries(ESTADOS)) {
        if (sigla === t || norm(e.nome) === t || norm(e.capital) === t || norm(e.gentilico) === t) {
            return { sigla: sigla.toUpperCase(), ...e }
        }
    }
    for (const [sigla, e] of Object.entries(ESTADOS)) {
        if (norm(e.nome).includes(t) || norm(e.capital).includes(t)) return { sigla: sigla.toUpperCase(), ...e }
    }
    return null
}

/** Ranking por área ou população. */
function ranking(criterio = 'populacao', ordem = 'desc') {
    const campo = norm(criterio).startsWith('a') ? 'area' : 'populacao'
    const lista = Object.entries(ESTADOS).map(([sigla, e]) => ({ sigla: sigla.toUpperCase(), ...e }))
    lista.sort((a, b) => ordem === 'asc' ? a[campo] - b[campo] : b[campo] - a[campo])
    const total = lista.reduce((s, e) => s + e[campo], 0)
    return { campo, ordem, lista, total }
}

/** Compara dois estados lado a lado. */
function comparar(a, b) {
    const x = acharEstado(a), y = acharEstado(b)
    if (!x || !y) return null
    return {
        a: x, b: y,
        maiorArea: x.area >= y.area ? x : y,
        maisPopuloso: x.populacao >= y.populacao ? x : y,
        razaoArea: Math.max(x.area, y.area) / Math.min(x.area, y.area),
        razaoPop: Math.max(x.populacao, y.populacao) / Math.min(x.populacao, y.populacao),
        densidadeA: x.populacao / x.area,
        densidadeB: y.populacao / y.area
    }
}

function procurar(termo) {
    const t = norm(termo)
    if (!t) return []
    const achados = []
    for (const [sigla, e] of Object.entries(ESTADOS)) {
        if (norm(JSON.stringify(e) + sigla).includes(t)) achados.push({ tipo: 'estado', chave: sigla, nome: e.nome })
    }
    for (const [chave, b] of Object.entries(BIOMAS)) {
        if (norm(JSON.stringify(b) + chave).includes(t)) achados.push({ tipo: 'bioma', chave, nome: b.nome })
    }
    for (const [chave, r] of Object.entries(REGIOES)) {
        if (norm(JSON.stringify(r) + chave).includes(t)) achados.push({ tipo: 'regiao', chave, nome: r.nome })
    }
    return achados
}

const num = (v, c = 0) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c })

module.exports = { VIGENCIA_DADOS, ESTADOS, REGIOES, BIOMAS, estadosDa, acharEstado, ranking, comparar, procurar, num }
