/**
 * Céu: corpos do sistema solar, luas, missões e constelações.
 *
 * Números vêm de valores médios aceitos (NASA/IAU). Distâncias em milhões de
 * km, diâmetros em km, períodos em dias ou anos terrestres. Onde a grandeza é
 * discutida ou varia muito, o campo diz isso em vez de fingir precisão.
 */

const CORPOS = {
    sol: { nome: 'Sol', tipo: 'Estrela anã amarela', diametro: 1392700, distancia: 0, periodo: '—', luas: 0,
        temperatura: '5.500 °C na superfície, 15 milhões no núcleo', gravidade: 274,
        fato: 'Concentra 99,86% de toda a massa do sistema solar. Tudo o mais, somado, é o troco.' },
    mercurio: { nome: 'Mercúrio', tipo: 'Planeta rochoso', diametro: 4879, distancia: 57.9, periodo: '88 dias', luas: 0,
        temperatura: '-173 °C a 427 °C', gravidade: 3.7,
        fato: 'Um dia em Mercúrio dura mais que seu ano: gira devagar e orbita rápido.' },
    venus: { nome: 'Vênus', tipo: 'Planeta rochoso', diametro: 12104, distancia: 108.2, periodo: '225 dias', luas: 0,
        temperatura: '464 °C, constante', gravidade: 8.87,
        fato: 'É mais quente que Mercúrio apesar de mais distante do Sol — a atmosfera de gás carbônico segura o calor. E gira ao contrário.' },
    terra: { nome: 'Terra', tipo: 'Planeta rochoso', diametro: 12742, distancia: 149.6, periodo: '365,25 dias', luas: 1,
        temperatura: '-89 °C a 57 °C', gravidade: 9.81,
        fato: 'Único corpo conhecido com água líquida estável na superfície — e o único onde a tectônica de placas ainda funciona.' },
    marte: { nome: 'Marte', tipo: 'Planeta rochoso', diametro: 6779, distancia: 227.9, periodo: '687 dias', luas: 2,
        temperatura: '-140 °C a 20 °C', gravidade: 3.72,
        fato: 'Tem o maior vulcão do sistema solar, o Monte Olimpo, com 22 km de altura — quase três Everestes.' },
    jupiter: { nome: 'Júpiter', tipo: 'Gigante gasoso', diametro: 139820, distancia: 778.5, periodo: '11,9 anos', luas: 95,
        temperatura: '-145 °C no topo das nuvens', gravidade: 24.79,
        fato: 'A Grande Mancha Vermelha é uma tempestade maior que a Terra, observada sem interrupção há mais de 190 anos.' },
    saturno: { nome: 'Saturno', tipo: 'Gigante gasoso', diametro: 116460, distancia: 1434, periodo: '29,5 anos', luas: 146,
        temperatura: '-178 °C', gravidade: 10.44,
        fato: 'A densidade média é menor que a da água. Num oceano grande o bastante, Saturno flutuaria.' },
    urano: { nome: 'Urano', tipo: 'Gigante de gelo', diametro: 50724, distancia: 2871, periodo: '84 anos', luas: 28,
        temperatura: '-224 °C', gravidade: 8.69,
        fato: 'Gira deitado, com o eixo a 98°. Cada polo passa 42 anos de luz seguidos e 42 no escuro.' },
    netuno: { nome: 'Netuno', tipo: 'Gigante de gelo', diametro: 49244, distancia: 4495, periodo: '165 anos', luas: 16,
        temperatura: '-214 °C', gravidade: 11.15,
        fato: 'Foi o primeiro planeta descoberto por cálculo, não por observação: previram onde olhar pelas perturbações na órbita de Urano.' },
    plutao: { nome: 'Plutão', tipo: 'Planeta anão', diametro: 2377, distancia: 5906, periodo: '248 anos', luas: 5,
        temperatura: '-229 °C', gravidade: 0.62,
        fato: 'Perdeu o status de planeta em 2006 por não ter limpado a vizinhança da própria órbita. A New Horizons revelou nele uma planície de nitrogênio em forma de coração.' },
    ceres: { nome: 'Ceres', tipo: 'Planeta anão', diametro: 946, distancia: 413, periodo: '4,6 anos', luas: 0,
        temperatura: '-105 °C', gravidade: 0.28,
        fato: 'Maior objeto do cinturão de asteroides e provavelmente com mais água doce que a Terra, em forma de gelo.' },
    eris: { nome: 'Éris', tipo: 'Planeta anão', diametro: 2326, distancia: 10120, periodo: '558 anos', luas: 1,
        temperatura: '-231 °C', gravidade: 0.82,
        fato: 'Foi a descoberta que forçou a redefinição de planeta: quase do tamanho de Plutão, mas muito mais distante.' }
}

const LUAS = {
    lua: { nome: 'Lua', planeta: 'Terra', diametro: 3474, descoberta: 'sempre conhecida',
        fato: 'Afasta-se da Terra cerca de 3,8 cm por ano. É a responsável pela estabilidade da inclinação do eixo terrestre — sem ela, o clima oscilaria muito mais.' },
    fobos: { nome: 'Fobos', planeta: 'Marte', diametro: 22, descoberta: '1877',
        fato: 'Orbita tão perto que dá três voltas em Marte por dia marciano. Está caindo e vai se despedaçar em algumas dezenas de milhões de anos.' },
    deimos: { nome: 'Deimos', planeta: 'Marte', diametro: 12, descoberta: '1877',
        fato: 'Tão pequena que, visto de Marte, parece uma estrela brilhante em vez de um disco.' },
    io: { nome: 'Io', planeta: 'Júpiter', diametro: 3643, descoberta: '1610',
        fato: 'É o corpo mais vulcanicamente ativo do sistema solar. A gravidade de Júpiter a amassa e a derrete por dentro.' },
    europa: { nome: 'Europa', planeta: 'Júpiter', diametro: 3122, descoberta: '1610',
        fato: 'Sob a crosta de gelo há um oceano de água salgada com provavelmente mais água que todos os oceanos da Terra somados.' },
    ganimedes: { nome: 'Ganimedes', planeta: 'Júpiter', diametro: 5268, descoberta: '1610',
        fato: 'É a maior lua do sistema solar, maior que Mercúrio, e a única com campo magnético próprio.' },
    calisto: { nome: 'Calisto', planeta: 'Júpiter', diametro: 4821, descoberta: '1610',
        fato: 'A superfície mais craterada que se conhece: nada a renova há bilhões de anos, então tudo que caiu ficou registrado.' },
    tita: { nome: 'Titã', planeta: 'Saturno', diametro: 5150, descoberta: '1655',
        fato: 'Única lua com atmosfera densa e o único outro lugar com líquido estável na superfície — lagos de metano, não de água.' },
    encelado: { nome: 'Encélado', planeta: 'Saturno', diametro: 504, descoberta: '1789',
        fato: 'Expele gêiseres de água pelo polo sul. A sonda Cassini voou dentro da pluma e detectou moléculas orgânicas.' },
    mimas: { nome: 'Mimas', planeta: 'Saturno', diametro: 396, descoberta: '1789',
        fato: 'A cratera Herschel ocupa um terço do diâmetro da lua e dá a ela uma semelhança célebre com uma estação de batalha.' },
    tritao: { nome: 'Tritão', planeta: 'Netuno', diametro: 2707, descoberta: '1846',
        fato: 'Orbita ao contrário do giro do planeta — sinal de que foi capturada, não formada ali. Tem gêiseres de nitrogênio.' },
    titania: { nome: 'Titânia', planeta: 'Urano', diametro: 1578, descoberta: '1787',
        fato: 'Maior lua de Urano. Como quase tudo no sistema uraniano, tem nome vindo de Shakespeare e não da mitologia.' },
    caronte: { nome: 'Caronte', planeta: 'Plutão', diametro: 1212, descoberta: '1978',
        fato: 'É metade do tamanho de Plutão. Os dois giram em torno de um ponto fora de Plutão — tecnicamente, um sistema duplo.' }
}

const MISSOES = {
    sputnik: { nome: 'Sputnik 1', agencia: 'URSS', ano: 1957, alvo: 'Órbita terrestre', status: 'concluída',
        feito: 'Primeiro objeto humano em órbita. Uma esfera de 58 cm emitindo bipes que qualquer rádio amador do planeta conseguia ouvir.' },
    vostok: { nome: 'Vostok 1', agencia: 'URSS', ano: 1961, alvo: 'Órbita terrestre', status: 'concluída',
        feito: 'Iúri Gagarin deu uma volta na Terra em 108 minutos e virou o primeiro humano no espaço.' },
    apollo11: { nome: 'Apollo 11', agencia: 'NASA', ano: 1969, alvo: 'Lua', status: 'concluída',
        feito: 'Primeira alunissagem tripulada. O computador de bordo tinha menos memória que um cartão de felicitações musical de hoje.' },
    apollo13: { nome: 'Apollo 13', agencia: 'NASA', ano: 1970, alvo: 'Lua', status: 'abortada com sucesso',
        feito: 'Explosão de um tanque de oxigênio a caminho da Lua. A tripulação voltou viva improvisando um filtro de CO₂ com fita e capa de manual.' },
    voyager1: { nome: 'Voyager 1', agencia: 'NASA', ano: 1977, alvo: 'Sistema solar exterior', status: 'ativa',
        feito: 'Objeto humano mais distante da Terra. Entrou no espaço interestelar em 2012 e ainda envia dados, com atraso de sinal de mais de 20 horas.' },
    voyager2: { nome: 'Voyager 2', agencia: 'NASA', ano: 1977, alvo: 'Júpiter, Saturno, Urano e Netuno', status: 'ativa',
        feito: 'Única sonda a visitar Urano e Netuno. Aproveitou um alinhamento planetário que só se repete a cada 175 anos.' },
    hubble: { nome: 'Telescópio Hubble', agencia: 'NASA/ESA', ano: 1990, alvo: 'Órbita terrestre', status: 'ativo',
        feito: 'Foi lançado com o espelho com defeito e consertado por astronautas em 1993. Suas imagens redefiniram a idade estimada do universo.' },
    cassini: { nome: 'Cassini-Huygens', agencia: 'NASA/ESA/ASI', ano: 1997, alvo: 'Saturno', status: 'encerrada em 2017',
        feito: 'Orbitou Saturno por 13 anos e pousou uma sonda em Titã. Foi lançada contra o planeta no fim para não contaminar Encélado.' },
    iss: { nome: 'Estação Espacial Internacional', agencia: 'Consórcio internacional', ano: 1998, alvo: 'Órbita terrestre', status: 'ativa',
        feito: 'Habitada continuamente desde novembro de 2000. Dá a volta na Terra a cada 90 minutos — 16 amanheceres por dia.' },
    spirit: { nome: 'Spirit e Opportunity', agencia: 'NASA', ano: 2003, alvo: 'Marte', status: 'encerradas',
        feito: 'Projetados para 90 dias. Opportunity durou quase 15 anos e só parou numa tempestade global de poeira.' },
    newhorizons: { nome: 'New Horizons', agencia: 'NASA', ano: 2006, alvo: 'Plutão e cinturão de Kuiper', status: 'ativa',
        feito: 'Levou nove anos para chegar a Plutão e passou voando: era rápida demais para entrar em órbita. As imagens levaram 16 meses para serem baixadas.' },
    curiosity: { nome: 'Curiosity', agencia: 'NASA', ano: 2011, alvo: 'Marte', status: 'ativo',
        feito: 'Pousou com um guindaste aéreo movido a foguetes. Confirmou que a cratera Gale já teve um lago de água doce.' },
    rosetta: { nome: 'Rosetta', agencia: 'ESA', ano: 2004, alvo: 'Cometa 67P', status: 'encerrada em 2016',
        feito: 'Primeira sonda a orbitar um cometa e a pousar nele. O aterrissador Philae quicou e parou de lado, na sombra, sem carregar as baterias.' },
    perseverance: { nome: 'Perseverance', agencia: 'NASA', ano: 2020, alvo: 'Marte', status: 'ativo',
        feito: 'Coleta amostras para retorno futuro e levou o helicóptero Ingenuity, primeiro voo motorizado em outro planeta.' },
    jwst: { nome: 'Telescópio James Webb', agencia: 'NASA/ESA/CSA', ano: 2021, alvo: 'Ponto L2', status: 'ativo',
        feito: 'Observa em infravermelho a 1,5 milhão de km da Terra. Enxerga galáxias formadas poucas centenas de milhões de anos após o Big Bang.' },
    chang: { nome: 'Chang\'e 4', agencia: 'CNSA', ano: 2018, alvo: 'Face oculta da Lua', status: 'concluída',
        feito: 'Primeiro pouso na face oculta da Lua. Precisou de um satélite retransmissor porque não há linha de visada direta com a Terra.' }
}

const CONSTELACOES = {
    cruzeirodosul: { nome: 'Cruzeiro do Sul', latim: 'Crux', hemisferio: 'Sul', estrelas: 5, melhorepoca: 'abril a junho',
        como: 'Quatro estrelas em cruz mais a Intrometida. O braço maior aponta para o sul celeste quando prolongado 4,5 vezes.',
        historia: 'Está na bandeira do Brasil, com uma estrela para cada estado da proclamação mais o Distrito Federal.' },
    orion: { nome: 'Órion', latim: 'Orion', hemisferio: 'Equatorial', estrelas: 7, melhorepoca: 'dezembro a março',
        como: 'As Três Marias formam o cinturão. Betelgeuse é o ombro avermelhado; Rigel, o pé azul.',
        historia: 'É a constelação mais reconhecível do céu. Betelgeuse é uma supergigante que vai explodir como supernova — em algum momento dos próximos 100 mil anos.' },
    escorpiao: { nome: 'Escorpião', latim: 'Scorpius', hemisferio: 'Sul', estrelas: 18, melhorepoca: 'junho a agosto',
        como: 'Segue a curva do ferrão a partir de Antares, a estrela vermelha no coração do bicho.',
        historia: 'Antares significa "rival de Marte", pela cor parecida. É uma supergigante tão grande que engoliria a órbita de Marte.' },
    ursamaior: { nome: 'Ursa Maior', latim: 'Ursa Major', hemisferio: 'Norte', estrelas: 7, melhorepoca: 'março a maio',
        como: 'O quadrilátero com cabo é o Grande Carro. As duas estrelas da ponta apontam para a Estrela Polar.',
        historia: 'Serviu de bússola para navegantes e, mais tarde, de mapa de fuga para escravizados no sul dos Estados Unidos.' },
    canismajor: { nome: 'Cão Maior', latim: 'Canis Major', hemisferio: 'Sul', estrelas: 8, melhorepoca: 'janeiro a março',
        como: 'Sirius, a estrela mais brilhante do céu noturno, marca o pescoço. Fica logo abaixo e à esquerda de Órion.',
        historia: 'A subida de Sirius antes do amanhecer marcava a cheia do Nilo e abria o ano egípcio.' },
    touro: { nome: 'Touro', latim: 'Taurus', hemisferio: 'Norte', estrelas: 19, melhorepoca: 'novembro a janeiro',
        como: 'O V de estrelas é o rosto; Aldebarã é o olho vermelho. As Plêiades ficam no ombro.',
        historia: 'As Plêiades aparecem em calendários agrícolas de culturas que nunca se encontraram, dos gregos aos aborígenes australianos.' },
    centauro: { nome: 'Centauro', latim: 'Centaurus', hemisferio: 'Sul', estrelas: 11, melhorepoca: 'abril a junho',
        como: 'Alfa e Beta Centauri, os Ponteiros, ficam ao lado do Cruzeiro do Sul.',
        historia: 'Alfa Centauri é o sistema estelar mais próximo do Sol, a 4,37 anos-luz. Proxima Centauri, sua companheira, tem um planeta na zona habitável.' },
    cassiopeia: { nome: 'Cassiopeia', latim: 'Cassiopeia', hemisferio: 'Norte', estrelas: 5, melhorepoca: 'setembro a novembro',
        como: 'Um W (ou M, conforme a hora) de cinco estrelas brilhantes.',
        historia: 'A rainha vaidosa da mitologia grega foi posta no céu de cabeça para baixo parte do ano, como punição.' },
    leao: { nome: 'Leão', latim: 'Leo', hemisferio: 'Norte', estrelas: 9, melhorepoca: 'março a maio',
        como: 'A foice invertida forma a cabeça; Régulus é o ponto na base da foice.',
        historia: 'A chuva de meteoros das Leônidas irradia dali todo mês de novembro, com picos espetaculares a cada 33 anos.' },
    cisne: { nome: 'Cisne', latim: 'Cygnus', hemisferio: 'Norte', estrelas: 9, melhorepoca: 'julho a setembro',
        como: 'Também chamada Cruz do Norte. Deneb marca a cauda e é um dos vértices do Triângulo de Verão.',
        historia: 'Cygnus X-1 foi o primeiro objeto amplamente aceito como buraco negro e motivou uma aposta célebre entre Stephen Hawking e Kip Thorne.' },
    virgem: { nome: 'Virgem', latim: 'Virgo', hemisferio: 'Equatorial', estrelas: 15, melhorepoca: 'abril a junho',
        como: 'Espiga é a estrela mais brilhante. Siga o cabo do Grande Carro em arco até Arcturus e prossiga até Espiga.',
        historia: 'Na direção dela fica o Aglomerado de Virgem, com mais de mil galáxias — e o buraco negro M87, o primeiro a ser fotografado.' },
    sagitario: { nome: 'Sagitário', latim: 'Sagittarius', hemisferio: 'Sul', estrelas: 12, melhorepoca: 'julho a setembro',
        como: 'O desenho mais fácil é o bule de chá, com a alça e o bico bem visíveis.',
        historia: 'O centro da Via Láctea fica nessa direção. O "vapor" que sai do bico do bule é a parte mais densa da nossa galáxia.' }
}

const FENOMENOS = {
    eclipsesolar: { nome: 'Eclipse solar', tipo: 'Alinhamento', frequencia: '2 a 5 por ano no planeta',
        oquee: 'A Lua passa entre a Terra e o Sol e projeta sombra na superfície terrestre.',
        detalhe: 'A totalidade só é visível numa faixa estreita de até 270 km. Ver dois eclipses totais do mesmo lugar leva, em média, 375 anos.',
        cuidado: 'Nunca olhe diretamente sem filtro solar certificado. Óculos escuros e chapa de raio-X não servem.' },
    eclipselunar: { nome: 'Eclipse lunar', tipo: 'Alinhamento', frequencia: '2 a 4 por ano',
        oquee: 'A Terra fica entre o Sol e a Lua e a sombra do planeta cobre a Lua.',
        detalhe: 'A Lua fica avermelhada porque a única luz que a alcança atravessou a atmosfera terrestre — é o vermelho de todos os amanheceres do planeta ao mesmo tempo.',
        cuidado: 'Pode ser observado a olho nu sem risco algum.' },
    chuvameteoros: { nome: 'Chuva de meteoros', tipo: 'Detritos', frequencia: 'dezenas por ano',
        oquee: 'A Terra atravessa a trilha de poeira deixada por um cometa e as partículas queimam na atmosfera.',
        detalhe: 'As Perseidas (agosto) e as Gemínidas (dezembro) são as mais confiáveis. Os grãos costumam ser menores que um grão de areia.',
        cuidado: 'Melhor sem luar, longe da cidade, deitado e sem olhar o celular por 20 minutos.' },
    auroras: { nome: 'Auroras polares', tipo: 'Magnetosfera', frequencia: 'constante em altas latitudes',
        oquee: 'Partículas do vento solar são guiadas pelo campo magnético até os polos e excitam gases da atmosfera.',
        detalhe: 'Verde é oxigênio a 100-300 km; vermelho é oxigênio mais alto; azul e roxo são nitrogênio.',
        cuidado: 'Tempestades solares fortes podem levar auroras a latitudes muito mais baixas que o normal.' },
    superlua: { nome: 'Superlua', tipo: 'Órbita', frequencia: '3 a 4 por ano',
        oquee: 'Lua cheia coincidindo com o perigeu, o ponto mais próximo da órbita.',
        detalhe: 'Fica cerca de 7% maior e 15% mais brilhante que uma cheia média — diferença real, mas difícil de notar a olho nu sem comparação.',
        cuidado: 'A impressão de lua gigante no horizonte é ilusão de óptica e acontece em qualquer lua cheia.' },
    transito: { nome: 'Trânsito planetário', tipo: 'Alinhamento', frequencia: 'raro',
        oquee: 'Mercúrio ou Vênus passa na frente do disco solar, visto da Terra.',
        detalhe: 'O trânsito de Vênus acontece em pares separados por 8 anos, e os pares se repetem só depois de mais de um século. O próximo é em 2117.',
        cuidado: 'Exige filtro solar. É a mesma técnica usada para detectar planetas em outras estrelas.' },
    cometa: { nome: 'Cometa', tipo: 'Corpo gelado', frequencia: 'variável',
        oquee: 'Bola de gelo e poeira que desenvolve cauda ao se aproximar do Sol.',
        detalhe: 'A cauda sempre aponta para longe do Sol, não para trás do movimento. São duas: uma de poeira, curva, e uma de íons, reta e azulada.',
        cuidado: 'O Halley volta em 2061. Quem viu em 1986 pode ver de novo.' },
    ocultacao: { nome: 'Ocultação lunar', tipo: 'Alinhamento', frequencia: 'mensal para alguma estrela',
        oquee: 'A Lua passa na frente de uma estrela ou planeta e o apaga por alguns minutos.',
        detalhe: 'O sumiço é instantâneo porque a Lua não tem atmosfera para atenuar a luz aos poucos.',
        cuidado: 'Binóculo simples já mostra bem. Ocultações de Júpiter ou Saturno são as mais impressionantes.' }
}

function corposPorTipo(tipo) {
    const t = String(tipo || '').toLowerCase()
    return Object.entries(CORPOS).filter(([, c]) => c.tipo.toLowerCase().includes(t)).map(([chave, c]) => ({ chave, ...c }))
}

function luasDe(planeta) {
    const p = String(planeta || '').toLowerCase()
    return Object.entries(LUAS).filter(([, l]) => l.planeta.toLowerCase().includes(p)).map(([chave, l]) => ({ chave, ...l }))
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    const fontes = [['corpo', CORPOS], ['lua', LUAS], ['missao', MISSOES], ['constelacao', CONSTELACOES], ['fenomeno', FENOMENOS]]
    for (const [tipo, cat] of fontes) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = { CORPOS, LUAS, MISSOES, CONSTELACOES, FENOMENOS, corposPorTipo, luasDe, procurar }
