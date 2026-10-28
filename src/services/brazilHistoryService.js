/**
 * História do Brasil: períodos, eventos, figuras e presidentes.
 *
 * O campo que dá razão de existir a este serviço é o `engano`: cada ficha traz
 * o que a memória popular costuma errar sobre aquele assunto. Sem ele, isto
 * seria uma lista de datas que qualquer busca entrega melhor.
 *
 * Datas seguem a periodização mais aceita na historiografia brasileira. Onde há
 * disputa real entre correntes, a ficha diz que há.
 */

const PERIODOS = {
    precabral: {
        nome: 'Antes de 1500', inicio: -10000, fim: 1500, marco: 'Povos originários',
        resumo: 'O território era ocupado por milhões de pessoas em centenas de povos distintos, com línguas, agricultura e organizações políticas próprias.',
        aconteceu: 'Estimativas vão de 2 a 8 milhões de habitantes em 1500. Sambaquis no litoral têm mais de 6 mil anos, e a cerâmica marajoara é anterior à chegada europeia em séculos.',
        engano: 'Chamar tudo de "índios" apaga a diferença entre povos tão distintos entre si quanto portugueses e chineses. Tupi e Jê não se entendiam.'
    },
    colonia: {
        nome: 'Brasil Colônia', inicio: 1500, fim: 1822, marco: 'Domínio português',
        resumo: 'Três séculos de exploração colonial baseados em pau-brasil, açúcar, mineração e trabalho escravizado.',
        aconteceu: 'Capitanias hereditárias (1534), Governo-Geral (1549), invasões francesas e holandesas, ciclo do ouro em Minas (século XVIII) e a transferência da corte portuguesa em 1808.',
        engano: 'A ideia de "descobrimento" pressupõe terra vazia. Havia gente aqui há mais de 10 mil anos — o que houve foi conquista.'
    },
    imperio: {
        nome: 'Império', inicio: 1822, fim: 1889, marco: 'Dois imperadores e uma regência',
        resumo: 'Monarquia constitucional sob Pedro I, o período regencial e o longo reinado de Pedro II.',
        aconteceu: 'Independência (1822), primeira Constituição outorgada (1824), abdicação de Pedro I (1831), regências com revoltas em quase todo o país, Guerra do Paraguai (1864-70) e abolição (1888).',
        engano: 'O Brasil não virou independente de um dia para o outro às margens do Ipiranga. A guerra de independência durou até 1823 na Bahia, no Piauí e no Pará.'
    },
    republicavelha: {
        nome: 'República Velha', inicio: 1889, fim: 1930, marco: 'Café com leite',
        resumo: 'República oligárquica dominada por São Paulo e Minas Gerais, com voto aberto e fraude sistemática.',
        aconteceu: 'Proclamação (1889), política dos governadores, Canudos (1896-97), Revolta da Vacina (1904), Contestado, tenentismo e Semana de Arte Moderna (1922).',
        engano: 'A proclamação não teve participação popular. A frase de Aristides Lobo — "o povo assistiu àquilo bestializado" — é do próprio republicano que estava lá.'
    },
    eravargas: {
        nome: 'Era Vargas', inicio: 1930, fim: 1945, marco: 'Getúlio Vargas',
        resumo: 'Quinze anos de Vargas no poder, incluindo a ditadura do Estado Novo.',
        aconteceu: 'Revolução de 1930, Revolução Constitucionalista (1932), Constituição de 1934, golpe do Estado Novo (1937), CLT (1943) e participação na Segunda Guerra ao lado dos Aliados.',
        engano: 'A CLT não foi um presente: consolidou leis conquistadas por décadas de greves e organização operária, dentro de um projeto de controle dos sindicatos pelo Estado.'
    },
    republica46: {
        nome: 'República de 1946', inicio: 1945, fim: 1964, marco: 'Democracia interrompida',
        resumo: 'Dezenove anos de eleições diretas, industrialização acelerada e crise política crescente.',
        aconteceu: 'Constituição de 1946, volta de Vargas eleito (1951) e seu suicídio (1954), construção de Brasília por JK, renúncia de Jânio (1961) e o parlamentarismo de emergência sob Jango.',
        engano: 'Não foi um período de estabilidade que o golpe interrompeu. Houve tentativas de golpe em 1954, 1955 e 1961 — 1964 foi a que deu certo.'
    },
    ditadura: {
        nome: 'Ditadura militar', inicio: 1964, fim: 1985, marco: 'Regime autoritário',
        resumo: 'Vinte e um anos de governo militar, com censura, cassações, tortura e desaparecimentos.',
        aconteceu: 'Golpe de 1964, Atos Institucionais, AI-5 (1968), "milagre econômico" seguido de crise, Lei da Anistia (1979) e Diretas Já (1984).',
        engano: 'Chamar de "revolução" é o nome que o próprio regime se deu. A Comissão Nacional da Verdade documentou 434 mortos e desaparecidos por agentes do Estado.'
    },
    novarepublica: {
        nome: 'Nova República', inicio: 1985, fim: null, marco: 'Democracia atual',
        resumo: 'Redemocratização, Constituição de 1988 e o período democrático mais longo da história do país.',
        aconteceu: 'Eleição indireta de Tancredo (1985), Constituição Cidadã (1988), primeira eleição direta para presidente desde 1960 (1989), Plano Real (1994), dois impeachments (1992 e 2016).',
        engano: 'A Constituição de 1988 não caiu do céu: foi escrita por uma Assembleia eleita, com mais de 12 milhões de assinaturas em emendas populares.'
    }
}

const EVENTOS = {
    chegada1500: { nome: 'Chegada dos portugueses', ano: 1500, periodo: 'colonia',
        oquefoi: 'A frota de Pedro Álvares Cabral aporta no sul da Bahia, em Porto Seguro.',
        importa: 'Inicia três séculos de colonização e o encontro — violento — entre povos originários e europeus.',
        engano: 'A tese do "acaso" é frágil: a rota já era conhecida e o Tratado de Tordesilhas (1494) reservava a área a Portugal seis anos antes.' },
    capitanias: { nome: 'Capitanias hereditárias', ano: 1534, periodo: 'colonia',
        oquefoi: 'A Coroa divide o território em 15 faixas doadas a donatários particulares.',
        importa: 'Primeira tentativa de ocupar o território sem custo para o Estado português.',
        engano: 'Não foram um fracasso completo: Pernambuco e São Vicente prosperaram e sustentaram o modelo açucareiro.' },
    invasaoholandesa: { nome: 'Invasão holandesa', ano: 1630, periodo: 'colonia',
        oquefoi: 'A Companhia das Índias Ocidentais ocupa Pernambuco por 24 anos.',
        importa: 'Sob Maurício de Nassau houve urbanização do Recife, liberdade de culto e o primeiro observatório astronômico das Américas.',
        engano: 'A expulsão em 1654 não foi obra da Coroa portuguesa: veio de forças locais, com destaque para Henrique Dias e Filipe Camarão.' },
    palmares: { nome: 'Quilombo dos Palmares', ano: 1694, periodo: 'colonia',
        oquefoi: 'Confederação de quilombos na serra da Barriga, em Alagoas, que resistiu por quase um século.',
        importa: 'Chegou a abrigar cerca de 20 mil pessoas e foi a maior experiência de resistência à escravidão nas Américas.',
        engano: 'Zumbi não foi o fundador. Antes dele veio Ganga Zumba, que negociou com a Coroa — e foi justamente essa negociação que Zumbi recusou.' },
    inconfidencia: { nome: 'Inconfidência Mineira', ano: 1789, periodo: 'colonia',
        oquefoi: 'Conspiração de elites mineiras contra a cobrança da derrama pela Coroa.',
        importa: 'Primeiro projeto articulado de separação de Portugal, inspirado na independência dos Estados Unidos.',
        engano: 'Não era um movimento popular nem abolicionista: vários inconfidentes eram donos de pessoas escravizadas. Tiradentes foi o único executado, e o único sem posses.' },
    vindafamilia: { nome: 'Vinda da família real', ano: 1808, periodo: 'colonia',
        oquefoi: 'Fugindo de Napoleão, a corte portuguesa se transfere para o Rio de Janeiro.',
        importa: 'Abertura dos portos, criação do Banco do Brasil, da Imprensa Régia e das primeiras faculdades. O Brasil deixa de ser colônia de fato.',
        engano: 'Não foi fuga desesperada e improvisada: a transferência era plano estudado havia décadas, e a esquadra britânica escoltou a viagem.' },
    independencia: { nome: 'Independência', ano: 1822, periodo: 'imperio',
        oquefoi: 'Dom Pedro rompe com as Cortes de Lisboa às margens do Ipiranga, em 7 de setembro.',
        importa: 'Marca o nascimento do Brasil como Estado soberano, sob a forma de império.',
        engano: 'Não foi pacífica. Houve guerra na Bahia até julho de 1823, no Piauí, no Maranhão e no Pará, com milhares de mortos.' },
    guerraparaguai: { nome: 'Guerra do Paraguai', ano: 1864, periodo: 'imperio',
        oquefoi: 'Maior conflito armado da América do Sul, entre a Tríplice Aliança e o Paraguai.',
        importa: 'Durou seis anos, custou dezenas de milhares de vidas e fortaleceu politicamente o Exército brasileiro.',
        engano: 'A tese de que a Inglaterra teria financiado a guerra para destruir um Paraguai industrializado não se sustenta na documentação e foi abandonada pela historiografia.' },
    abolicao: { nome: 'Lei Áurea', ano: 1888, periodo: 'imperio',
        oquefoi: 'A Princesa Isabel assina a lei que extingue a escravidão no Brasil.',
        importa: 'O Brasil foi o último país das Américas a abolir a escravidão, após 388 anos.',
        engano: 'Não foi concessão generosa: veio depois de décadas de fugas, quilombos, revoltas e da campanha abolicionista. E não houve nenhuma política de reparação, terra ou trabalho para os libertos.' },
    proclamacao: { nome: 'Proclamação da República', ano: 1889, periodo: 'republicavelha',
        oquefoi: 'Golpe militar liderado por Deodoro da Fonseca depõe Pedro II.',
        importa: 'Encerra 67 anos de monarquia e inaugura a república brasileira.',
        engano: 'Não houve plebiscito nem participação popular. Foi um movimento de quartel apoiado por cafeicultores paulistas descontentes com o Império.' },
    canudos: { nome: 'Guerra de Canudos', ano: 1896, periodo: 'republicavelha',
        oquefoi: 'A República destrói o arraial de Antônio Conselheiro no sertão baiano, em quatro expedições militares.',
        importa: 'Cerca de 25 mil pessoas mortas. Euclides da Cunha registrou tudo em "Os Sertões".',
        engano: 'Canudos não era um movimento monarquista, como a imprensa da época dizia. Era uma comunidade de sertanejos pobres organizada em torno da religião e da terra.' },
    semana22: { nome: 'Semana de Arte Moderna', ano: 1922, periodo: 'republicavelha',
        oquefoi: 'Três noites no Theatro Municipal de São Paulo apresentam a arte modernista brasileira.',
        importa: 'Rompe com o academicismo e propõe uma arte que assume as raízes brasileiras.',
        engano: 'Foi vaiada e teve público pequeno. A importância que damos a ela hoje foi construída décadas depois, sobretudo pelos próprios modernistas.' },
    revolucao30: { nome: 'Revolução de 1930', ano: 1930, periodo: 'eravargas',
        oquefoi: 'Movimento armado impede a posse de Júlio Prestes e leva Vargas ao poder.',
        importa: 'Encerra a República Velha e inicia quinze anos de Vargas.',
        engano: 'Não foi revolução popular: foi aliança entre oligarquias dissidentes (Minas, Rio Grande do Sul e Paraíba) e militares tenentistas.' },
    clt: { nome: 'Criação da CLT', ano: 1943, periodo: 'eravargas',
        oquefoi: 'Vargas consolida a legislação trabalhista num único texto.',
        importa: 'Estrutura até hoje as relações de trabalho formais no país.',
        engano: 'Não criou os direitos do zero: consolidou leis já existentes, conquistadas em décadas de greves — dentro de um modelo que atrelava os sindicatos ao Estado.' },
    brasilia: { nome: 'Construção de Brasília', ano: 1960, periodo: 'republica46',
        oquefoi: 'JK constrói a nova capital no Planalto Central em 41 meses.',
        importa: 'Interiorizou o poder federal e virou patrimônio da humanidade pelo urbanismo de Lúcio Costa e a arquitetura de Niemeyer.',
        engano: 'A ideia não foi de JK: mudar a capital para o interior estava na Constituição de 1891 e já aparecia em projetos do século XVIII.' },
    golpe64: { nome: 'Golpe de 1964', ano: 1964, periodo: 'ditadura',
        oquefoi: 'Militares depõem João Goulart e assumem o poder em 31 de março.',
        importa: 'Inicia 21 anos de ditadura, com censura, cassações, tortura e desaparecimentos.',
        engano: 'Não foi "para evitar o comunismo" nem durou os poucos meses prometidos. O próprio regime falava em normalização rápida, e ficou duas décadas.' },
    ai5: { nome: 'AI-5', ano: 1968, periodo: 'ditadura',
        oquefoi: 'Ato Institucional nº 5 fecha o Congresso, suspende o habeas corpus e institui censura prévia.',
        importa: 'Marca o início do período mais duro do regime, os chamados anos de chumbo.',
        engano: 'Não foi resposta a uma ameaça armada iminente: veio depois de um discurso de um deputado, e a guerrilha só cresceu depois dele, não antes.' },
    diretasja: { nome: 'Diretas Já', ano: 1984, periodo: 'ditadura',
        oquefoi: 'Campanha por eleição direta para presidente reúne comícios de mais de um milhão de pessoas.',
        importa: 'Maior mobilização popular da história do país até então.',
        engano: 'A emenda Dante de Oliveira foi derrotada na Câmara. Tancredo Neves foi eleito indiretamente, por colégio eleitoral — o oposto do que a campanha pedia.' },
    constituicao88: { nome: 'Constituição de 1988', ano: 1988, periodo: 'novarepublica',
        oquefoi: 'A Assembleia Nacional Constituinte promulga a Constituição Cidadã.',
        importa: 'Estabelece direitos sociais, SUS, seguridade universal e o marco democrático vigente.',
        engano: 'Não foi obra de um grupo fechado: recebeu 122 emendas populares com mais de 12 milhões de assinaturas.' },
    planoreal: { nome: 'Plano Real', ano: 1994, periodo: 'novarepublica',
        oquefoi: 'Estabilização monetária com a criação do real e a URV como etapa de transição.',
        importa: 'Encerra décadas de hiperinflação que chegou a mais de 2.400% ao ano.',
        engano: 'Não foi só troca de moeda: sete planos anteriores tinham falhado. A diferença foi a URV, que realinhou os preços antes da troca em vez de congelá-los.' }
}

const FIGURAS = {
    zumbi: { nome: 'Zumbi dos Palmares', viveu: '1655-1695', papel: 'Líder quilombola',
        fez: 'Comandou a resistência final de Palmares contra as expedições coloniais, recusando o acordo de paz aceito por Ganga Zumba.',
        legado: '20 de novembro, data de sua morte, é o Dia da Consciência Negra e feriado nacional desde 2023.' },
    tiradentes: { nome: 'Tiradentes', viveu: '1746-1792', papel: 'Alferes e inconfidente',
        fez: 'Único condenado à morte pela Inconfidência Mineira; os demais tiveram penas comutadas em degredo.',
        legado: 'A república o transformou em herói nacional justamente por ser o único sem título e sem posses entre os conspiradores.' },
    pedro1: { nome: 'Dom Pedro I', viveu: '1798-1834', papel: 'Primeiro imperador',
        fez: 'Proclamou a independência em 1822, outorgou a Constituição de 1824 e abdicou em 1831.',
        legado: 'Voltou a Portugal e lutou pelo trono da filha na Guerra Civil Portuguesa, onde morreu aos 35 anos.' },
    pedro2: { nome: 'Dom Pedro II', viveu: '1825-1891', papel: 'Segundo imperador',
        fez: 'Reinou por 49 anos, o mais longo governo da história do Brasil.',
        legado: 'Deposto em 1889, exilou-se na França sem resistir. Ficou conhecido pelo interesse em ciência, fotografia e línguas.' },
    isabel: { nome: 'Princesa Isabel', viveu: '1846-1921', papel: 'Regente do Império',
        fez: 'Assinou a Lei Áurea em 1888, durante a terceira regência.',
        legado: 'A abolição custou ao Império o apoio dos fazendeiros e acelerou a queda da monarquia no ano seguinte.' },
    conselheiro: { nome: 'Antônio Conselheiro', viveu: '1830-1897', papel: 'Líder religioso',
        fez: 'Fundou Belo Monte, o arraial de Canudos, que reuniu milhares de sertanejos.',
        legado: 'Morreu antes da queda final do arraial. A comunidade foi destruída e seus habitantes, mortos ou dispersos.' },
    vargas: { nome: 'Getúlio Vargas', viveu: '1882-1954', papel: 'Presidente e ditador',
        fez: 'Governou de 1930 a 1945 e voltou eleito em 1951. Instituiu a CLT e o salário mínimo, e comandou a ditadura do Estado Novo.',
        legado: 'Suicidou-se no Palácio do Catete em agosto de 1954, em meio a crise política, deixando uma carta-testamento.' },
    jk: { nome: 'Juscelino Kubitschek', viveu: '1902-1976', papel: 'Presidente (1956-61)',
        fez: 'Construiu Brasília e industrializou o país com o Plano de Metas, o "cinquenta anos em cinco".',
        legado: 'Teve os direitos políticos cassados pelo regime militar em 1964 e morreu em acidente de carro em 1976.' },
    niemeyer: { nome: 'Oscar Niemeyer', viveu: '1907-2012', papel: 'Arquiteto',
        fez: 'Projetou os edifícios monumentais de Brasília, a sede da ONU (em equipe) e centenas de obras.',
        legado: 'Levou a curva ao concreto e tornou a arquitetura brasileira moderna conhecida no mundo. Trabalhou até os 104 anos.' },
    chiquinha: { nome: 'Chiquinha Gonzaga', viveu: '1847-1935', papel: 'Compositora e maestrina',
        fez: 'Primeira mulher a reger uma orquestra no Brasil e autora de "Ô Abre Alas", a primeira marchinha de carnaval.',
        legado: 'Abolicionista e republicana, vendeu partituras nas ruas para comprar alforrias.' },
    machado: { nome: 'Machado de Assis', viveu: '1839-1908', papel: 'Escritor',
        fez: 'Escreveu "Memórias Póstumas de Brás Cubas", "Dom Casmurro" e "Quincas Borba"; fundou a Academia Brasileira de Letras.',
        legado: 'Neto de escravizados alforriados, epilético e gago, tornou-se o maior nome da literatura brasileira.' },
    santosdumont: { nome: 'Santos Dumont', viveu: '1873-1932', papel: 'Inventor e aeronauta',
        fez: 'Voou o 14-Bis em Paris em 1906, diante de público e comissão oficial, sem catapulta.',
        legado: 'Recusou patentear seus projetos. Deprimido com o uso militar da aviação, tirou a própria vida em 1932.' },
    nise: { nome: 'Nise da Silveira', viveu: '1905-1999', papel: 'Psiquiatra',
        fez: 'Recusou eletrochoque e lobotomia e criou ateliês de arte como terapia no Rio de Janeiro.',
        legado: 'Fundou o Museu de Imagens do Inconsciente e mudou o tratamento psiquiátrico no Brasil.' },
    dandara: { nome: 'Dandara dos Palmares', viveu: 'século XVII', papel: 'Liderança quilombola',
        fez: 'Lutou na resistência de Palmares ao lado de Zumbi, de quem era companheira.',
        legado: 'A documentação sobre ela é escassa e disputada, o que é comum na história de mulheres negras do período.' },
    mariaquiteria: { nome: 'Maria Quitéria', viveu: '1792-1853', papel: 'Militar',
        fez: 'Alistou-se disfarçada de homem e lutou na guerra de independência na Bahia.',
        legado: 'Primeira mulher a servir em unidade militar no Brasil; é patrona do Quadro Complementar de Oficiais do Exército.' }
}

/** Presidentes desde 1985, com o marco de cada governo. */
const PRESIDENTES = [
    { nome: 'José Sarney', periodo: '1985-1990', comochegou: 'Vice de Tancredo Neves, assumiu com a morte dele antes da posse', marco: 'Constituição de 1988 e Plano Cruzado' },
    { nome: 'Fernando Collor', periodo: '1990-1992', comochegou: 'Primeira eleição direta desde 1960', marco: 'Confisco da poupança e o primeiro impeachment do país' },
    { nome: 'Itamar Franco', periodo: '1992-1994', comochegou: 'Vice, assumiu após o impeachment de Collor', marco: 'Plano Real, que encerrou a hiperinflação' },
    { nome: 'Fernando Henrique Cardoso', periodo: '1995-2002', comochegou: 'Eleito em primeiro turno', marco: 'Estabilização da moeda, privatizações e reeleição' },
    { nome: 'Luiz Inácio Lula da Silva', periodo: '2003-2010', comochegou: 'Eleito na quarta tentativa', marco: 'Bolsa Família e expansão do crédito e do ensino superior' },
    { nome: 'Dilma Rousseff', periodo: '2011-2016', comochegou: 'Primeira mulher presidente do Brasil', marco: 'Programas sociais, crise econômica e o segundo impeachment' },
    { nome: 'Michel Temer', periodo: '2016-2018', comochegou: 'Vice, assumiu após o impeachment de Dilma', marco: 'Teto de gastos e reforma trabalhista' },
    { nome: 'Jair Bolsonaro', periodo: '2019-2022', comochegou: 'Eleito em segundo turno', marco: 'Reforma da Previdência e o período da pandemia de covid-19' },
    { nome: 'Luiz Inácio Lula da Silva', periodo: '2023-', comochegou: 'Terceiro mandato, eleito em segundo turno', marco: 'Em curso' }
]

/** Eventos de um período. */
function eventosDe(periodo) {
    return Object.entries(EVENTOS)
        .filter(([, e]) => e.periodo === periodo)
        .map(([chave, e]) => ({ chave, ...e }))
        .sort((a, b) => a.ano - b.ano)
}

/** Linha do tempo completa. */
function linhaDoTempo() {
    return Object.entries(EVENTOS).map(([chave, e]) => ({ chave, ...e })).sort((a, b) => a.ano - b.ano)
}

/** Que período cobre um ano. */
function periodoDoAno(ano) {
    const a = Number(ano)
    if (!Number.isFinite(a)) return null
    for (const [chave, p] of Object.entries(PERIODOS)) {
        if (a >= p.inicio && (p.fim === null || a < p.fim)) return { chave, ...p }
    }
    return null
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [tipo, cat] of [['periodo', PERIODOS], ['evento', EVENTOS], ['figura', FIGURAS]]) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = { PERIODOS, EVENTOS, FIGURAS, PRESIDENTES, eventosDe, linhaDoTempo, periodoDoAno, procurar }
