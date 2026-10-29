/**
 * Curiosidades com dado de verdade — SÓ AS TABELAS.
 *
 * ─── PROCEDÊNCIA ───
 * Aqui não entra número que eu não consiga sustentar. Quando a grandeza é
 * discutida (altura de montanha, área de deserto, população de cidade), a ficha
 * traz o valor usual da literatura e o campo `fonte` do tema diz de onde vem e
 * de quando é. Quando o número é instável ou disputado de verdade, a ficha
 * prefere o fato qualitativo — é melhor dizer "o mais fundo já medido" do que
 * cravar um metro que muda a cada expedição.
 *
 * VIGENCIA_DADOS aparece no rodapé de todo comando que mostra número, para quem
 * lê saber de quando é. Segue o mesmo costume de brazilGeoService.
 *
 * ─── O QUE ESTA FAMÍLIA NÃO COBRE ───
 * De propósito, para não pisar em cima de quem já tem dono no projeto:
 *   • estados, capitais, regiões e biomas do Brasil → brazilGeoService
 *   • períodos, eventos e presidentes do Brasil     → brazilHistoryService
 *   • planetas, luas, missões e constelações        → astronomyService
 *   • deuses, panteões e criaturas míticas          → mythologyService
 *   • tabela periódica, constantes e países-ficha   → knowledgeService
 *   • sistemas, órgãos, nutrientes e exames         → bodyService
 *   • escolas, autores e obras brasileiras          → literatureService
 *   • plantas de casa, cães e gatos                 → homeLifeService
 *   • instrumentos, gêneros e teoria musical        → musicService
 *
 * ─── FORMATO DE UM TEMA ───
 *   chave   identificador estável do assunto (não muda quando a ordem muda)
 *   sub     subcategoria do menu
 *   campos  rótulos das colunas, na ordem
 *   itens   { chave: [nome, ...valores na ordem de campos, fato] }
 * O `fato` é a razão de a ficha existir: o que ela conta e uma lista não conta.
 */

const VIGENCIA_DADOS = 'valores usuais de referência, revisados em setembro de 2026'

/** @type {Array<{chave:string, sub:string, emoji:string, titulo:string, intro:string, fonte?:string, campos:string[], itens:Object<string,string[]>}>} */
const TEMAS = []

/** Empilha um tema preservando a ordem de declaração. */
function T(sub, emoji, chave, titulo, intro, campos, itens, fonte) {
    TEMAS.push({ chave, sub, emoji, titulo, intro, campos, itens, fonte: fonte || VIGENCIA_DADOS })
}

/* ───────────────────────────── MUNDO ───────────────────────────── */

T('Mundo', '🏜️', 'desertos', 'Os maiores desertos do mundo',
    'Deserto se define pela chuva que não cai, não pelo calor. Por isso os dois maiores são gelados.',
    ['Onde fica', 'Área aproximada', 'Tipo'], {
    antartico: ['Deserto Antártico', 'Antártida', '14 milhões de km²', 'Polar', 'É o maior deserto do planeta. No interior cai menos neve por ano do que cai chuva no Saara, e parte dos Vales Secos de McMurdo não recebe água há muito tempo.'],
    artico: ['Deserto Ártico', 'Norte do Canadá, Groenlândia e Sibéria', '13,7 milhões de km²', 'Polar', 'Segundo maior, e o único deserto que flutua: boa parte dele é mar congelado, não terra firme.'],
    saara: ['Saara', 'Norte da África', '9,2 milhões de km²', 'Quente', 'Maior deserto quente do mundo, quase do tamanho dos Estados Unidos. A imagem de dunas engana: a maior parte é cascalho, rocha e planalto.'],
    arabico: ['Deserto da Arábia', 'Península Arábica', '2,3 milhões de km²', 'Quente', 'Guarda o Rub al-Khali, o Quarto Vazio, o maior mar de areia contínuo do planeta, onde dunas passam de 200 metros.'],
    gobi: ['Gobi', 'Mongólia e norte da China', '1,3 milhão de km²', 'Frio', 'Deserto de inverno rigoroso, com neve sobre a areia. Foi ali que se acharam os primeiros ninhos de ovos de dinossauro reconhecidos pela ciência.'],
    atacama: ['Atacama', 'Norte do Chile', '105 mil km²', 'Quente e árido extremo', 'O lugar mais seco fora dos polos. Há estações onde nunca se registrou chuva, e por isso a NASA testa equipamento marciano ali.']
})

T('Mundo', '⛰️', 'montanhas', 'As montanhas mais altas do mundo',
    'Todas as catorze montanhas acima de oito mil metros ficam na Ásia, entre Himalaia e Karakoram.',
    ['Onde fica', 'Altitude', 'Primeira subida'], {
    everest: ['Everest', 'Nepal e China', '8.849 m', '1953, por Edmund Hillary e Tenzing Norgay', 'O ponto mais alto acima do nível do mar, mas não o mais distante do centro da Terra nem o mais alto do pé ao topo. São três recordes diferentes.'],
    k2: ['K2', 'Paquistão e China', '8.611 m', '1954, por uma expedição italiana', 'Mais baixo que o Everest e muito mais difícil: a parede é íngreme, o clima vira em horas e nunca houve subida bem-sucedida no inverno até 2021.'],
    kangchenjunga: ['Kangchenjunga', 'Nepal e Índia', '8.586 m', '1955, por George Band e Joe Brown', 'Por tradição, quem chega ao topo para poucos metros antes do cume: a montanha é sagrada para o povo do Sikkim e o ponto mais alto fica intocado.'],
    lhotse: ['Lhotse', 'Nepal e China', '8.516 m', '1956, por uma expedição suíça', 'Divide com o Everest boa parte da rota de subida. A face sul é uma das paredes mais temidas do alpinismo.'],
    makalu: ['Makalu', 'Nepal e China', '8.485 m', '1955, por uma expedição francesa', 'Tem forma de pirâmide de quatro faces, quase geométrica, e fica isolada das vizinhas, o que deixa o vento ainda pior.'],
    annapurna: ['Annapurna I', 'Nepal', '8.091 m', '1950, por Maurice Herzog e Louis Lachenal', 'Foi o primeiro pico de mais de oito mil metros conquistado, e é o mais mortal deles: a proporção de mortes por subida bem-sucedida não tem paralelo.']
})

T('Mundo', '🏞️', 'rios', 'Os rios mais longos do mundo',
    'Qual é o mais longo ainda é disputa aberta: depende de onde se decide que o rio começa.',
    ['Onde corre', 'Extensão usual', 'Foz'], {
    nilo: ['Nilo', 'Nordeste da África, por onze países', 'cerca de 6.650 km', 'Mar Mediterrâneo', 'Corre de sul para norte, o que confunde quem olha o mapa. O Egito antigo chamava o sul de Alto Egito justamente por ser rio acima.'],
    amazonas: ['Amazonas', 'Peru, Colômbia e Brasil', 'cerca de 6.400 km', 'Oceano Atlântico', 'Disputa o título de mais longo com o Nilo, mas em volume não há disputa: despeja mais água que os sete rios seguintes somados, cerca de um quinto de toda a água doce que chega aos oceanos.'],
    yangtze: ['Yangtzé', 'China', 'cerca de 6.300 km', 'Mar da China Oriental', 'O mais longo que corre inteiro dentro de um só país. Abriga a barragem das Três Gargantas, a maior usina hidrelétrica do mundo em potência instalada.'],
    mississippi: ['Mississippi-Missouri', 'Estados Unidos', 'cerca de 6.275 km', 'Golfo do México', 'Sozinho o Mississippi tem cerca de 3.766 km. O número grande só aparece quando se soma o Missouri, seu afluente mais longo.'],
    ienissei: ['Ienissei', 'Mongólia e Rússia', 'cerca de 5.539 km', 'Oceano Ártico', 'Corre para o norte e congela da foz para a nascente. Quando o degelo chega, a água que desce encontra gelo ainda firme e alaga a planície.'],
    amarelo: ['Rio Amarelo', 'China', 'cerca de 5.464 km', 'Mar de Bohai', 'Chamam de berço da civilização chinesa e também de tristeza da China: suas enchentes estão entre os desastres mais mortais já registrados.']
})

T('Mundo', '🌊', 'oceanos', 'Os oceanos e os mares do planeta',
    'A água salgada cobre 71% da superfície da Terra e está longe de ser bem conhecida.',
    ['Área aproximada', 'Profundidade média', 'Ponto mais fundo'], {
    pacifico: ['Oceano Pacífico', '165 milhões de km²', 'cerca de 4.000 m', 'Fossa das Marianas, cerca de 10.900 m', 'Sozinho é maior que toda a terra firme do planeta somada. O nome veio de Fernão de Magalhães, que o encontrou calmo depois do estreito ao sul.'],
    atlantico: ['Oceano Atlântico', '106 milhões de km²', 'cerca de 3.600 m', 'Fossa de Porto Rico, cerca de 8.400 m', 'Cresce alguns centímetros por ano: a cordilheira meso-atlântica está sempre criando crosta nova e afastando América da Europa e da África.'],
    indico: ['Oceano Índico', '70 milhões de km²', 'cerca de 3.700 m', 'Fossa de Java, cerca de 7.200 m', 'É o mais quente dos oceanos, o que enfraquece a vida marinha em parte dele e alimenta as monções que regulam a agricultura de meio bilhão de pessoas.'],
    antartico: ['Oceano Antártico', '20 milhões de km²', 'cerca de 3.300 m', 'Fossa Sandwich do Sul, cerca de 7.200 m', 'Foi reconhecido formalmente como quinto oceano só em 2000, e é definido por uma corrente, não por continentes: a Corrente Circumpolar Antártica.'],
    artico: ['Oceano Ártico', '14 milhões de km²', 'cerca de 1.200 m', 'Bacia Eurasiana, cerca de 5.500 m', 'O menor e o mais raso. Não tem terra sob o polo: o Polo Norte fica sobre mar congelado, ao contrário do Polo Sul, que fica sobre rocha.'],
    marianas: ['Fossa das Marianas', 'depressão no Pacífico oeste', 'cerca de 10.935 m no ponto mais fundo', 'Abismo Challenger', 'Se o Everest fosse jogado ali dentro, sobrariam mais de dois quilômetros de água por cima dele. A pressão no fundo passa de mil vezes a da superfície.']
})

T('Mundo', '🌋', 'vulcoes', 'Vulcões que mudaram a história',
    'Erupção grande não muda só a paisagem: muda safra, clima e, às vezes, o calendário político.',
    ['Onde fica', 'Erupção marcante', 'O que causou'], {
    vesuvio: ['Vesúvio', 'Itália, perto de Nápoles', '79 d.C.', 'Soterrou Pompeia e Herculano', 'A cinza que matou também conservou: casas, pães e até o vazio deixado pelos corpos viraram molde. Pompeia é a cidade romana que melhor conhecemos.'],
    tambora: ['Tambora', 'Ilha de Sumbawa, Indonésia', '1815', 'O ano sem verão, em 1816', 'A maior erupção registrada em tempos históricos. A poeira esfriou o planeta, arruinou colheitas na Europa e na América e trouxe fome em pleno mês de julho.'],
    krakatoa: ['Krakatoa', 'Estreito de Sunda, Indonésia', '1883', 'Tsunamis e o estrondo mais alto já registrado', 'O estouro foi ouvido a milhares de quilômetros, e o barulho deu a volta no mundo várias vezes em forma de onda de pressão medida por barômetros.'],
    etna: ['Etna', 'Sicília, Itália', 'em atividade quase contínua', 'Erupções frequentes e de baixo risco', 'O vulcão ativo mais alto da Europa e um dos mais vigiados do mundo. Cresce e encolhe: a altura do cume muda de um ano para o outro.'],
    eyjafjallajokull: ['Eyjafjallajökull', 'Islândia', '2010', 'Paralisou a aviação europeia por dias', 'Erupção pequena em volume, enorme em efeito: a cinza fina subiu na rota dos aviões e mostrou o quanto o mundo moderno depende do espaço aéreo.'],
    kilauea: ['Kilauea', 'Havaí, Estados Unidos', 'ciclos desde 1983', 'Lava que cria terra nova', 'Não explode, escorre. É o tipo de vulcão que aumenta a ilha em vez de destruí-la, e por isso é o mais estudado e filmado do planeta.']
})

T('Mundo', '🏝️', 'ilhas', 'As maiores ilhas do mundo',
    'A Austrália não entra na lista: por convenção, massa daquele tamanho é continente, não ilha.',
    ['A quem pertence', 'Área aproximada', 'População aproximada'], {
    groenlandia: ['Groenlândia', 'Dinamarca, com governo próprio', '2,16 milhões de km²', 'cerca de 56 mil pessoas', 'Maior ilha do mundo e quase vazia: mais de 80% é calota de gelo. O nome quer dizer terra verde, batismo publicitário de um colonizador viking atrás de gente.'],
    novaguine: ['Nova Guiné', 'Indonésia e Papua-Nova Guiné', '786 mil km²', 'cerca de 14 milhões de pessoas', 'É a ilha com mais línguas do planeta: mais de oitocentos idiomas vivos, cerca de um em cada dez falados no mundo inteiro.'],
    borneu: ['Bornéu', 'Indonésia, Malásia e Brunei', '748 mil km²', 'cerca de 23 milhões de pessoas', 'Única ilha grande dividida por três países. Sua floresta está entre as mais antigas do planeta, mais velha que a Amazônia.'],
    madagascar: ['Madagascar', 'Madagascar', '587 mil km²', 'cerca de 30 milhões de pessoas', 'Separou-se da África há dezenas de milhões de anos, e a vida ali seguiu sozinha: a maioria esmagadora de suas espécies não existe em nenhum outro lugar.'],
    baffin: ['Ilha de Baffin', 'Canadá', '507 mil km²', 'cerca de 13 mil pessoas', 'Maior ilha do Canadá e quase desabitada. Tem fiordes e paredes de rocha que atraem escaladores atrás de precipícios de mais de mil metros.'],
    sumatra: ['Sumatra', 'Indonésia', '473 mil km²', 'cerca de 59 milhões de pessoas', 'Fica em cima do encontro de placas tectônicas: foi lá que começou o terremoto de 2004, que gerou o tsunami mais mortal já registrado.']
})

T('Mundo', '💧', 'lagos', 'Lagos que quebram recordes',
    'Maior em área, maior em volume e mais profundo são três lagos diferentes.',
    ['Onde fica', 'Marca', 'Número de referência'], {
    caspio: ['Mar Cáspio', 'Entre Europa e Ásia, cinco países', 'Maior lago do mundo em área', 'cerca de 371 mil km²', 'Chamam de mar porque é salgado e enorme, mas é lago: não tem ligação natural com oceano nenhum. Seu nível sobe e desce sem maré.'],
    baikal: ['Lago Baikal', 'Sibéria, Rússia', 'Mais profundo e maior em volume de água doce', 'cerca de 1.642 m de profundidade', 'Guarda cerca de um quinto de toda a água doce líquida da superfície do planeta. É tão fundo que a água do fundo leva séculos para se misturar.'],
    superior: ['Lago Superior', 'Canadá e Estados Unidos', 'Maior lago de água doce em área', 'cerca de 82 mil km²', 'Se fosse esvaziado sobre as Américas do Norte e do Sul, cobriria as duas com trinta centímetros de água. Tem ondas e naufrágios como um mar.'],
    vitoria: ['Lago Vitória', 'Uganda, Quênia e Tanzânia', 'Maior lago da África', 'cerca de 68 mil km²', 'É raso para o tamanho, com cerca de 40 metros no ponto mais fundo. Dele sai o Nilo Branco, um dos braços que formam o Nilo.'],
    titicaca: ['Lago Titicaca', 'Peru e Bolívia', 'Lago navegável mais alto do mundo', 'cerca de 3.812 m de altitude', 'Tem ilhas flutuantes feitas de junco pelo povo uru, que as constrói, mora nelas e as refaz camada por camada quando a base apodrece.'],
    mortomar: ['Mar Morto', 'Israel, Jordânia e Cisjordânia', 'Ponto de terra firme mais baixo do planeta', 'cerca de 430 m abaixo do nível do mar', 'A água é tão salgada que o corpo boia sem esforço, e tão salgada que peixe nenhum vive ali. O nível cai ano após ano porque o Jordão chega cada vez mais fraco.']
})

T('Mundo', '🌬️', 'quedas', 'Quedas de água e cataratas',
    'Mais alta, mais larga e mais volumosa são títulos que nunca ficam com a mesma queda.',
    ['Onde fica', 'Marca', 'Número de referência'], {
    angel: ['Salto Angel', 'Venezuela', 'Queda livre mais alta do mundo', 'cerca de 979 m', 'É tão alta que boa parte da água vira neblina antes de chegar ao chão. Só foi conhecida pelo resto do mundo em 1933, por um piloto que sobrevoava a região.'],
    iguacu: ['Cataratas do Iguaçu', 'Brasil e Argentina', 'Sistema com o maior número de quedas', 'cerca de 275 quedas', 'A Garganta do Diabo é um corredor em U onde catorze quedas despencam juntas. É o único conjunto do porte dividido entre dois países e dois parques nacionais.'],
    vitoria: ['Cataratas Vitória', 'Zâmbia e Zimbábue', 'Maior cortina de água contínua', 'cerca de 1.700 m de largura por 108 m de altura', 'O nome local, Mosi-oa-Tunya, quer dizer a fumaça que troveja: a névoa sobe centenas de metros e é vista de longe antes de se ouvir o barulho.'],
    niagara: ['Cataratas do Niágara', 'Canadá e Estados Unidos', 'Maior vazão da América do Norte', 'mais de 2.800 m³ por segundo no verão', 'Recua alguns centímetros por ano porque a rocha da borda se desfaz. Em onze mil anos andou cerca de onze quilômetros rio acima.'],
    khone: ['Cataratas de Khone', 'Laos', 'Maior vazão média do mundo', 'cerca de 11 mil m³ por segundo', 'Baixa e larguíssima, ela bloqueia o Mekong para a navegação e por isso desmontou o sonho francês de usar o rio como estrada para a China.'],
    tugela: ['Cataratas Tugela', 'África do Sul', 'Disputa a maior altura total em degraus', 'cerca de 948 m em cinco saltos', 'Seca em boa parte do ano e volta com força no verão chuvoso. Medições recentes brigam com o Salto Angel pelo primeiro lugar.']
})

T('Mundo', '📍', 'extremos', 'Os pontos extremos do planeta',
    'Onde o mundo chega ao limite: mais alto, mais fundo, mais quente, mais frio, mais seco.',
    ['Onde fica', 'Marca', 'Número de referência'], {
    everest: ['Ponto mais alto acima do mar', 'Everest, Nepal e China', 'Altitude máxima', '8.849 m', 'Altitude se mede a partir do nível do mar. Mude o critério e o campeão muda junto, como mostram os três itens seguintes.'],
    chimborazo: ['Ponto mais distante do centro da Terra', 'Chimborazo, Equador', 'Raio terrestre máximo', 'cerca de 6.384 km do centro', 'Perde em altitude para o Everest por mais de dois mil metros, mas fica quase na linha do Equador, onde o planeta é mais gordo.'],
    maunakea: ['Montanha mais alta do pé ao topo', 'Mauna Kea, Havaí', 'Altura total', 'cerca de 10.200 m', 'Só 4.207 m ficam acima da água: o resto está submerso. Medida da base ao cume, supera o Everest com folga.'],
    challenger: ['Ponto mais fundo do mar', 'Abismo Challenger, Fossa das Marianas', 'Profundidade máxima', 'cerca de 10.935 m', 'Menos gente desceu ali do que pisou na Lua. A pressão amassaria um submarino comum em segundos.'],
    vostok: ['Lugar mais frio já medido', 'Base Vostok, Antártida', 'Temperatura mínima em estação meteorológica', '-89,2 °C, em 1983', 'Medições por satélite acharam pontos ainda mais frios na Antártida, mas o recorde oficial em termômetro de superfície continua sendo este.'],
    furnace: ['Lugar mais quente já medido', 'Furnace Creek, Vale da Morte, Estados Unidos', 'Temperatura máxima aceita', '56,7 °C, em 1913', 'O registro é contestado por parte dos meteorologistas. Mesmo descartado, o Vale da Morte segue batendo marcas acima de 54 °C em verões recentes.'],
    mawsynram: ['Lugar mais chuvoso habitado', 'Mawsynram, Índia', 'Chuva anual média', 'cerca de 11.800 mm', 'Chove ali em um ano cerca de oito vezes o que chove em São Paulo. Os moradores usam uma capa de bambu em forma de casco de tartaruga.']
})

T('Mundo', '🏛️', 'maravilhasantigas', 'As sete maravilhas do mundo antigo',
    'A lista é grega e antiga, e só uma das sete continua de pé.',
    ['Onde ficava', 'Quando', 'Fim'], {
    piramide: ['Grande Pirâmide de Gizé', 'Egito', 'cerca de 2560 a.C.', 'Continua de pé', 'Única sobrevivente da lista e a mais velha de todas. Foi a construção mais alta do mundo por cerca de 3.800 anos, até as catedrais góticas.'],
    jardins: ['Jardins Suspensos da Babilônia', 'Iraque atual', 'século VI a.C., se existiram', 'Nunca encontrados', 'É a única maravilha sem prova arqueológica. Há quem defenda que os jardins ficavam em Nínive, não na Babilônia, e que a lista trocou as cidades.'],
    artemis: ['Templo de Ártemis', 'Éfeso, Turquia atual', 'século VI a.C.', 'Incendiado e depois saqueado', 'Foi queimado de propósito por um homem que queria ficar famoso. A cidade proibiu que se dissesse o nome dele, e o nome chegou até hoje assim mesmo.'],
    zeus: ['Estátua de Zeus em Olímpia', 'Grécia', 'século V a.C.', 'Destruída por fogo', 'Tinha cerca de doze metros, feita de ouro e marfim sobre madeira. Dizia-se que, se Zeus se levantasse, arrancaria o teto do templo.'],
    mausoleu: ['Mausoléu de Halicarnasso', 'Turquia atual', 'século IV a.C.', 'Derrubado por terremotos', 'O túmulo do sátrapa Mausolo era tão imponente que o nome dele virou palavra comum: é de onde vem mausoléu.'],
    colosso: ['Colosso de Rodes', 'Grécia', 'século III a.C.', 'Caiu em um terremoto após 54 anos', 'Durou pouquíssimo tempo e mesmo assim entrou na lista. A imagem popular, com as pernas abertas sobre a entrada do porto, é invenção medieval.'],
    farol: ['Farol de Alexandria', 'Egito', 'século III a.C.', 'Derrubado por terremotos', 'Guiou navios por cerca de mil e quinhentos anos. Suas pedras foram reaproveitadas em uma fortaleza que ainda existe no mesmo lugar.']
})

T('Mundo', '🗿', 'maravilhasnovas', 'As sete maravilhas do mundo moderno',
    'A lista saiu de uma votação aberta encerrada em 2007, sem chancela de órgão oficial.',
    ['Onde fica', 'Quando foi feita', 'Por que entrou'], {
    muralha: ['Muralha da China', 'China', 'trechos de mais de dois mil anos', 'Maior obra defensiva já construída', 'Não é uma muralha só nem é visível a olho nu do espaço, ao contrário do que se repete. São muros de várias dinastias, somando milhares de quilômetros.'],
    petra: ['Petra', 'Jordânia', 'a partir do século IV a.C.', 'Cidade esculpida na rocha', 'Os nabateus não empilharam pedra: escavaram a fachada direto no paredão. E dominaram a água no deserto com cisternas e canais que ainda se veem.'],
    cristo: ['Cristo Redentor', 'Rio de Janeiro, Brasil', '1931', 'Símbolo do país e da lista', 'Tem 30 metros de estátua sobre um pedestal de 8. É revestido de pedra-sabão em mosaico, escolhida por resistir bem à chuva e à variação de temperatura.'],
    machu: ['Machu Picchu', 'Peru', 'século XV', 'Cidade inca intacta na montanha', 'Os espanhóis nunca a encontraram, e é por isso que ela sobreviveu. As pedras se encaixam sem argamassa e aguentam terremotos há quinhentos anos.'],
    chichen: ['Chichén Itzá', 'México', 'séculos IX a XII', 'Astronomia maia em forma de pirâmide', 'Nos equinócios, a sombra dos degraus desenha uma serpente que desce a escadaria. A pirâmide tem 365 degraus somados, um para cada dia do ano.'],
    coliseu: ['Coliseu', 'Roma, Itália', 'ano 80', 'Maior anfiteatro do Império Romano', 'Comportava dezenas de milhares de pessoas e esvaziava em minutos por oitenta saídas numeradas, um sistema que os estádios modernos ainda copiam.'],
    taj: ['Taj Mahal', 'Índia', '1653', 'Mausoléu de mármore branco', 'Foi erguido por um imperador para a esposa morta. Os quatro minaretes são levemente inclinados para fora, para não caírem sobre o túmulo em um terremoto.']
})

T('Mundo', '🇧🇷', 'bandeirasamerica', 'Bandeiras da América, explicadas',
    'Bandeira não é enfeite: cada cor e cada forma foi escolhida para contar alguma coisa.',
    ['Como é', 'O que significa', 'Detalhe'], {
    brasil: ['Brasil', 'Verde com losango amarelo e círculo azul estrelado', 'O círculo mostra o céu do Rio de Janeiro na manhã de 15 de novembro de 1889', '27 estrelas, uma por estado e pelo Distrito Federal', 'A frase Ordem e Progresso vem do positivismo de Auguste Comte. As estrelas foram sendo acrescentadas conforme o país ganhava estados.'],
    argentina: ['Argentina', 'Duas faixas azul-celeste e uma branca com um sol no meio', 'O sol de maio lembra a revolução de 1810', 'O sol tem rosto humano e 32 raios', 'A cor celeste teria vindo das fitas usadas pelos revolucionários. O Uruguai carrega um sol parecido pela mesma raiz histórica.'],
    canada: ['Canadá', 'Faixas vermelhas nas laterais e folha de bordo vermelha no centro', 'A folha de bordo é símbolo nacional desde o século XIX', 'A folha desenhada tem onze pontas', 'O desenho é estilizado de propósito: nenhuma espécie real de bordo tem folha exatamente assim. Ele foi simplificado para não deformar ao vento.'],
    eua: ['Estados Unidos', 'Treze listras e cinquenta estrelas em campo azul', 'As listras são as treze colônias originais e as estrelas são os estados de hoje', '50 estrelas desde 1960', 'O arranjo das estrelas mudou 27 vezes. O desenho atual foi proposto por um estudante do ensino médio em um trabalho de escola.'],
    mexico: ['México', 'Verde, branco e vermelho com uma águia sobre um cacto', 'A cena é a fundação de Tenochtitlán pelos astecas', 'A águia devora uma serpente', 'A lenda dizia que a capital deveria nascer onde se visse uma águia pousada em um cacto. A bandeira fixou a profecia no centro do pano.'],
    jamaica: ['Jamaica', 'Cruz diagonal amarela separando triângulos verdes e pretos', 'Verde é a terra, amarelo é o sol, preto é a força do povo', 'É a única bandeira nacional sem vermelho, branco ou azul', 'O significado oficial já foi revisto: a leitura original associava o preto às dificuldades, e o país trocou por um sentido de força e criatividade.']
})

T('Mundo', '🇪🇺', 'bandeiraseuropa', 'Bandeiras da Europa, explicadas',
    'A Europa inventou a maioria dos padrões de bandeira que o mundo usa hoje.',
    ['Como é', 'O que significa', 'Detalhe'], {
    dinamarca: ['Dinamarca', 'Vermelha com cruz branca deslocada para a esquerda', 'A cruz nórdica, que virou padrão de toda a região', 'Em uso desde o século XIV', 'É considerada a bandeira nacional mais antiga ainda em uso. Suécia, Noruega, Finlândia e Islândia copiaram o formato da cruz deslocada.'],
    reinounido: ['Reino Unido', 'Três cruzes sobrepostas em vermelho, branco e azul', 'União das cruzes da Inglaterra, da Escócia e da Irlanda', 'O País de Gales não aparece', 'A bandeira não é simétrica: as faixas diagonais brancas e vermelhas são desiguais, e hasteá-la de cabeça para baixo é erro protocolar.'],
    suica: ['Suíça', 'Quadrada, vermelha com cruz branca', 'Cruz de origem medieval, ligada aos cantões', 'É uma das duas bandeiras nacionais quadradas', 'A Cruz Vermelha nasceu invertendo estas cores, em homenagem ao país onde a organização foi fundada. A outra bandeira quadrada é a do Vaticano.'],
    grecia: ['Grécia', 'Nove listras azuis e brancas com uma cruz no canto', 'As nove listras são lidas como as nove sílabas do grito de independência', 'A cruz representa a Igreja Ortodoxa', 'Azul e branco também são as cores do mar e da espuma, leitura popular que o país adotou sem nunca fixar um tom oficial de azul.'],
    portugal: ['Portugal', 'Verde e vermelha com esfera armilar e escudo', 'A esfera armilar lembra as navegações', 'Os cinco escudetes azuis formam uma cruz', 'Os sete castelos da borda representam praças conquistadas aos mouros. O verde entrou só em 1911, com a República.'],
    islandia: ['Islândia', 'Azul com cruz nórdica vermelha contornada de branco', 'Azul é o mar, branco é o gelo, vermelho é o fogo dos vulcões', 'Adotada em 1915', 'É a bandeira que se explica sozinha quando se sabe onde o país fica: ilha de gelo e vulcão cercada de Atlântico frio.']
})

T('Mundo', '🏳️', 'bandeirasestranhas', 'As bandeiras mais fora do padrão',
    'Quase toda bandeira nacional é um retângulo. Estas fogem da regra de alguma forma.',
    ['País', 'O que tem de diferente', 'Detalhe'], {
    nepal: ['Nepal', 'Nepal', 'Única bandeira nacional que não é retangular', 'Dois triângulos sobrepostos', 'A forma vem de duas flâmulas unidas, e a Constituição do país traz a fórmula geométrica exata para desenhá-la, com régua e compasso.'],
    paraguai: ['Paraguai', 'Paraguai', 'Frente e verso diferentes', 'Brasão nacional de um lado, selo do tesouro do outro', 'Por muito tempo foi a única bandeira nacional com desenhos distintos em cada face, o que obriga a fabricar as duas partes separadamente.'],
    chipre: ['Chipre', 'Chipre', 'Traz o próprio mapa do país', 'Silhueta da ilha em cor de cobre', 'A cor lembra que o nome Chipre está ligado ao cobre. Os ramos de oliveira e a ausência de azul e vermelho foram escolhas de neutralidade entre gregos e turcos.'],
    butao: ['Butão', 'Butão', 'Um dragão branco atravessa a bandeira inteira', 'O dragão segura joias nas garras', 'O nome local do país quer dizer terra do dragão do trovão. As joias nas garras representam a riqueza, e a boca aberta, a proteção.'],
    mocambique: ['Moçambique', 'Moçambique', 'Traz um fuzil moderno', 'Fuzil cruzado com uma enxada sobre um livro', 'É a única bandeira nacional em uso com uma arma de fogo contemporânea. Houve tentativas de mudança, e nenhuma prosperou.'],
    libia: ['Líbia entre 1977 e 2011', 'Líbia', 'Foi a única bandeira de cor única e sem desenho', 'Verde, do começo ao fim', 'Depois da queda do regime, o país voltou à bandeira anterior, de 1951. Enquanto durou, era a bandeira mais simples já adotada por um Estado.']
})

T('Mundo', '🕐', 'fusos', 'Fusos horários pelo mundo',
    'A conta de somar e subtrair horas tem mais exceções do que regra.',
    ['Fuso', 'Quem usa', 'O que chama atenção'], {
    kiribati: ['Kiribati', 'UTC+14', 'Ilhas da Linha, no Pacífico', 'Fuso mais adiantado do planeta', 'É o primeiro lugar do mundo a entrar no ano novo, 26 horas antes do último. O país moveu a linha da data em 1995 para caber todo no mesmo dia.'],
    baker: ['Ilhas Baker e Howland', 'UTC-12', 'Territórios desabitados dos Estados Unidos', 'Fuso mais atrasado do planeta', 'Ninguém mora lá, o que é uma sorte: quem estivesse ali veria o ano novo por último, um dia inteiro depois de Kiribati.'],
    nepal: ['Nepal', 'UTC+5:45', 'País inteiro', 'Fuso com deslocamento de 45 minutos', 'Foi escolhido para marcar a hora pelo meridiano de uma montanha perto de Catmandu, e de quebra para não ficar igual ao da Índia vizinha.'],
    india: ['Índia', 'UTC+5:30', 'País inteiro', 'Um só fuso para um país larguíssimo', 'No extremo leste o sol nasce cerca de duas horas antes do extremo oeste, e mesmo assim o relógio é o mesmo. Há décadas se discute criar um segundo fuso.'],
    china: ['China', 'UTC+8', 'País inteiro', 'Cinco fusos geográficos em um só relógio oficial', 'No oeste do país o sol pode nascer depois das dez da manhã pelo relógio de Pequim. Parte da população usa uma hora local não oficial.'],
    franca: ['França', 'de UTC-10 a UTC+12', 'Metrópole e territórios ultramarinos', 'País com mais fusos horários do mundo', 'São doze ou treze, conforme a contagem, graças a ilhas espalhadas por três oceanos. A Rússia, contínua e enorme, tem onze.']
})

T('Mundo', '🗓️', 'linhadata', 'A linha internacional da data',
    'A linha invisível onde o calendário vira: de um lado é terça, do outro já é quarta.',
    ['Onde', 'O que aconteceu', 'Efeito'], {
    samoa: ['Samoa', 'Pacífico Sul', 'Pulou o dia 30 de dezembro de 2011', 'O país mudou de lado da linha', 'Saiu de UTC-11 para UTC+13 para ficar no mesmo dia útil de Austrália e Nova Zelândia, seus maiores parceiros comerciais. Aquele 30 de dezembro simplesmente não existiu.'],
    kiribati1995: ['Kiribati', 'Pacífico central', 'Entortou a linha da data em 1995', 'O país deixou de viver em dois dias ao mesmo tempo', 'Antes disso, metade do território estava sempre um dia à frente da outra metade, o que reduzia a quatro os dias úteis comuns por semana.'],
    alasca: ['Alasca', 'América do Norte', 'Mudou de calendário em 1867', 'Teve duas sextas-feiras seguidas', 'Quando os Estados Unidos compraram o território da Rússia, ele trocou de lado da linha e ainda passou do calendário juliano para o gregoriano no mesmo dia.'],
    diomedes: ['Ilhas Diomedes', 'Estreito de Bering', 'Ficam a menos de 4 km uma da outra', 'Separadas por quase um dia inteiro', 'A Grande Diomede é russa, a Pequena é americana. No inverno dá para atravessar o gelo entre a de amanhã e a de ontem.'],
    antartida: ['Antártida', 'Polo Sul', 'Todos os fusos se encontram no mesmo ponto', 'Cada base escolhe o próprio horário', 'Na prática, cada estação de pesquisa usa o fuso do país que a abastece, para facilitar voos e comunicação com casa.'],
    rota: ['A linha em si', 'Meridiano 180, com desvios', 'Não é uma reta', 'Desvia para não cortar países ao meio', 'Ela zigue-zagueia pelo Pacífico justamente para manter cada território inteiro no mesmo dia. Não é definida por tratado: cada país decide o próprio lado.']
})

T('Mundo', '🗣️', 'idiomas', 'Os idiomas mais falados do mundo',
    'A ordem muda conforme a pergunta: quem fala como língua materna ou quem fala de qualquer jeito.',
    ['Falantes no total', 'Nativos', 'Onde é oficial'], {
    ingles: ['Inglês', 'cerca de 1,5 bilhão', 'cerca de 380 milhões', 'mais de 55 países', 'É o primeiro em falantes totais e só o terceiro em nativos: a maioria de quem fala inglês aprendeu depois, como segunda língua.'],
    mandarim: ['Mandarim', 'cerca de 1,1 bilhão', 'cerca de 940 milhões', 'China, Taiwan e Singapura', 'É o primeiro em falantes nativos com larga vantagem. A escrita é comum a dialetos que, falados, não se entendem entre si.'],
    hindi: ['Hindi', 'cerca de 600 milhões', 'cerca de 345 milhões', 'Índia', 'Compartilha a gramática com o urdu: falados, os dois se entendem quase por completo. Escritos, usam alfabetos diferentes.'],
    espanhol: ['Espanhol', 'cerca de 560 milhões', 'cerca de 485 milhões', '20 países', 'Segundo em falantes nativos. O maior país de língua espanhola em população é o México, não a Espanha.'],
    portugues: ['Português', 'cerca de 265 milhões', 'cerca de 235 milhões', '9 países em quatro continentes', 'Mais de sete em cada dez falantes nativos são brasileiros. É a língua mais falada de todo o hemisfério sul.'],
    arabe: ['Árabe', 'cerca de 400 milhões', 'cerca de 335 milhões', 'mais de 20 países', 'O árabe clássico serve de padrão escrito comum, mas as variedades faladas do Marrocos e do Iraque podem ser tão distantes quanto português e italiano.']
})

T('Mundo', '✍️', 'escritas', 'Alfabetos e sistemas de escrita',
    'Nem toda escrita tem letras: algumas têm sílabas, outras têm ideias inteiras por sinal.',
    ['Tipo', 'Quem usa', 'Sinais'], {
    latino: ['Alfabeto latino', 'Alfabeto', 'Maior parte do Ocidente e boa parte do mundo', '26 letras na forma básica', 'É o sistema mais usado do planeta. Nasceu do etrusco, que veio do grego, que veio do fenício. Cada empréstimo perdeu e ganhou letras pelo caminho.'],
    cirilico: ['Alfabeto cirílico', 'Alfabeto', 'Rússia, Bulgária, Sérvia e vizinhos', 'de 30 a 33 letras conforme a língua', 'Foi criado a partir do grego por discípulos dos monges Cirilo e Metódio, no século IX, para escrever línguas eslavas que o grego não dava conta.'],
    arabe: ['Escrita árabe', 'Abjad, só consoantes marcadas', 'Do Marrocos ao Paquistão', '28 letras básicas', 'Escreve-se da direita para a esquerda, e cada letra muda de forma conforme a posição na palavra. As vogais curtas em geral nem aparecem.'],
    devanagari: ['Devanágari', 'Abugida, sílaba com vogal embutida', 'Hindi, marata, nepali e sânscrito', '11 vogais e 33 consoantes', 'A linha horizontal contínua no topo das palavras é marca registrada do sistema: ela pendura as letras em vez de apoiá-las.'],
    hangul: ['Hangul', 'Alfabeto', 'Coreia do Sul e do Norte', '24 letras básicas', 'É o raro caso de escrita com data e autor: foi criada em 1443 pelo rei Sejong para que o povo comum pudesse aprender a ler em poucos dias.'],
    chines: ['Escrita chinesa', 'Logográfica, cada sinal é uma palavra ou parte dela', 'China, Taiwan, Japão em parte', 'mais de 50 mil sinais catalogados', 'Ler jornal exige cerca de três mil caracteres. É a única escrita antiga ainda em uso contínuo, com mais de três mil anos de linhagem direta.']
})

T('Mundo', '💰', 'moedas', 'De onde vem o nome das moedas',
    'Quase todo nome de moeda conta uma história de peso, metal ou império.',
    ['País', 'Origem do nome', 'Detalhe'], {
    real: ['Real', 'Brasil', 'Do latim regalis, o que é do rei', 'Nome herdado da moeda portuguesa', 'O plural oficial é reais, e a moeda atual é a sétima do país desde 1942. O nome voltou em 1994 por lembrar algo de valor estável.'],
    dolar: ['Dólar', 'Estados Unidos e outros vinte países', 'Do alemão thaler, moeda cunhada em Joachimsthal', 'O vale que dá nome fica na Chéquia de hoje', 'O símbolo cifrão provavelmente vem do peso espanhol, com as colunas de Hércules enroladas por uma fita, desenhadas no verso da moeda.'],
    libra: ['Libra esterlina', 'Reino Unido', 'De libra, unidade de peso romana', 'Valia mesmo uma libra de prata', 'O símbolo é um L estilizado, inicial de libra em latim. Esterlina vem do nome da prata de alta pureza usada na cunhagem medieval.'],
    rupia: ['Rúpia', 'Índia, Paquistão, Indonésia e vizinhos', 'Do sânscrito rupya, prata trabalhada', 'Nome com mais de dois mil anos', 'Sobreviveu a impérios, colonizações e independências. Cada país que a usa cunha a sua, com valores completamente diferentes entre si.'],
    iene: ['Iene', 'Japão', 'De en, que quer dizer círculo', 'O nome descreve o formato', 'Veio da troca das moedas ovais e retangulares antigas por moedas redondas ao estilo ocidental, em 1871. O yuan chinês tem a mesma origem de sentido.'],
    rublo: ['Rublo', 'Rússia', 'Do verbo rubit, cortar', 'Era um pedaço cortado de uma barra de prata', 'Antes de existir moeda cunhada, pagava-se com pedaços cortados de um anel de prata chamado grivna. O corte batizou a moeda.']
})

T('Mundo', '🤏', 'paisespequenos', 'Os menores países do mundo',
    'Cabem todos, somados, dentro de uma cidade média brasileira.',
    ['Onde fica', 'Área', 'População aproximada'], {
    vaticano: ['Vaticano', 'Dentro de Roma, Itália', '0,49 km²', 'cerca de 800 pessoas', 'Menor país do mundo em área e em população. É o único cuja cidadania não se herda por nascimento: ela vem do cargo e acaba quando o cargo acaba.'],
    monaco: ['Mônaco', 'Costa do Mediterrâneo, cercado pela França', '2,02 km²', 'cerca de 39 mil pessoas', 'É o país mais densamente povoado do planeta. Vem ganhando território do mar com aterros, porque não tem para onde crescer em terra.'],
    nauru: ['Nauru', 'Micronésia, Oceano Pacífico', '21 km²', 'cerca de 12 mil pessoas', 'Enriqueceu com fosfato de excremento de aves acumulado por milênios e empobreceu quando a jazida acabou, deixando o interior da ilha inabitável.'],
    tuvalu: ['Tuvalu', 'Polinésia, Oceano Pacífico', '26 km²', 'cerca de 11 mil pessoas', 'Tem no domínio de internet .tv uma de suas maiores fontes de renda. É também um dos países mais ameaçados pela subida do nível do mar.'],
    sanmarino: ['San Marino', 'Cercado pela Itália', '61 km²', 'cerca de 34 mil pessoas', 'Diz-se a república mais antiga do mundo ainda em funcionamento, fundada em 301. Tem dois chefes de Estado que governam juntos por seis meses.'],
    liechtenstein: ['Liechtenstein', 'Entre Suíça e Áustria', '160 km²', 'cerca de 40 mil pessoas', 'É um dos dois países do mundo duplamente sem litoral: para chegar ao mar é preciso atravessar pelo menos dois países.']
})

T('Mundo', '🧭', 'semlitoral', 'Países sem saída para o mar',
    'Mais de quarenta países não têm um centímetro de costa, e isso muda a economia inteira.',
    ['Onde fica', 'Vizinhos que dão passagem', 'O que isso custa'], {
    bolivia: ['Bolívia', 'América do Sul', 'Chile e Peru', 'Perdeu o litoral na Guerra do Pacífico, em 1884', 'Mantém uma Marinha até hoje, que navega no lago Titicaca e nos rios. Todo ano o país celebra o Dia do Mar, que já não tem.'],
    paraguai: ['Paraguai', 'América do Sul', 'Argentina e Brasil', 'Depende dos rios Paraguai e Paraná', 'É um dos maiores exportadores de soja do mundo escoando quase tudo por barcaça: tem uma das maiores frotas fluviais do planeta.'],
    cazaquistao: ['Cazaquistão', 'Ásia Central', 'Rússia e China', 'Maior país sem litoral do mundo', 'É maior que toda a Europa Ocidental e mesmo assim depende de portos alheios. O Cáspio, que banha o país, é um lago sem saída para o oceano.'],
    mongolia: ['Mongólia', 'Entre Rússia e China', 'Só esses dois', 'País menos densamente povoado do mundo', 'Com apenas dois vizinhos possíveis, toda a sua logística externa é uma negociação permanente com Moscou e Pequim.'],
    uzbequistao: ['Uzbequistão', 'Ásia Central', 'Todos os vizinhos também não têm mar', 'Duplamente sem litoral', 'Junto de Liechtenstein, é um dos dois únicos países nessa situação: seria preciso cruzar dois países para molhar o pé no oceano.'],
    suica: ['Suíça', 'Europa Central', 'França, Itália, Alemanha e Áustria', 'Sem litoral e mesmo assim com frota mercante', 'Registra navios de carga sob bandeira suíça desde a Segunda Guerra, para garantir abastecimento se as fronteiras terrestres fecharem.']
})

T('Mundo', '🚧', 'fronteiras', 'Fronteiras que contam uma história',
    'Fronteira é a linha mais política do mapa, e algumas foram desenhadas de um jeito difícil de acreditar.',
    ['Onde', 'O que tem de notável', 'Detalhe'], {
    chinarussia: ['China e Rússia', 'Ásia', 'Empatam no maior número de vizinhos', '14 países cada uma', 'A Rússia faz fronteira com países de três continentes se contarmos suas duas pontas, e ainda tem vizinhos marítimos como Japão e Estados Unidos.'],
    brasil: ['Brasil', 'América do Sul', 'Faz fronteira com quase todo o continente', '10 países vizinhos', 'Só Chile e Equador ficam de fora. A fronteira terrestre brasileira passa de 16 mil quilômetros, quase toda ela em floresta ou pantanal.'],
    baarle: ['Baarle-Hertog e Baarle-Nassau', 'Bélgica e Países Baixos', 'Uma cidade picotada em dezenas de enclaves', 'Há enclaves dentro de enclaves', 'A fronteira passa dentro de casas e cafés, marcada no chão com cruzes brancas. Há portas com dois números, um de cada país.'],
    coreias: ['Zona Desmilitarizada das Coreias', 'Península Coreana', 'A fronteira mais vigiada do mundo', 'Faixa de cerca de 4 km de largura', 'Por ser proibida a humanos há setenta anos, virou sem querer uma das reservas de vida selvagem mais preservadas da Ásia.'],
    usacanada: ['Estados Unidos e Canadá', 'América do Norte', 'Maior fronteira terrestre entre dois países', 'cerca de 8.890 km', 'Boa parte segue o paralelo 49 em linha reta, traçada em gabinete. Existe uma biblioteca que fica metade em cada país, com a linha pintada no piso.'],
    lesoto: ['Lesoto', 'África Austral', 'País inteiramente cercado por outro', 'Só faz fronteira com a África do Sul', 'São só três países no mundo nessa condição. Os outros dois são San Marino e Vaticano, ambos cercados pela Itália.']
})

T('Mundo', '🏙️', 'capitaisnaomaiores', 'Capitais que não são a maior cidade',
    'A maior cidade e a sede do governo quase nunca são a mesma coisa por acaso.',
    ['País', 'Maior cidade', 'Por que a capital é outra'], {
    brasilia: ['Brasília', 'Brasil', 'São Paulo', 'Foi construída do zero no planalto central', 'A ideia de interiorizar a capital aparecia em projetos desde o século XVIII. A cidade foi erguida em pouco mais de três anos e inaugurada em 1960.'],
    washington: ['Washington, D.C.', 'Estados Unidos', 'Nova York', 'Acordo entre estados do norte e do sul', 'O distrito foi criado em terreno cedido por Maryland e Virgínia para que nenhum estado hospedasse o governo federal e ganhasse vantagem com isso.'],
    canberra: ['Canberra', 'Austrália', 'Sydney', 'Solução para a briga entre Sydney e Melbourne', 'Como as duas maiores cidades queriam o posto, escolheram um ponto entre elas e construíram uma capital nova, inaugurada em 1927.'],
    ancara: ['Ancara', 'Turquia', 'Istambul', 'Decisão de refundar o país longe do passado imperial', 'Atatürk mudou a capital em 1923 para o interior da Anatólia, marcando a ruptura com o Império Otomano e com a cidade dos sultões.'],
    ottawa: ['Ottawa', 'Canadá', 'Toronto', 'Meio-termo entre ingleses e franceses', 'A rainha Vitória escolheu a cidade em 1857 por ficar na divisa entre o Canadá inglês e o francês, e longe o bastante da fronteira americana.'],
    abuja: ['Abuja', 'Nigéria', 'Lagos', 'Buscava neutralidade étnica e religiosa', 'Lagos era congestionada e ficava no território de um só grupo. Abuja foi erguida no centro geográfico do país e virou capital em 1991.']
})

T('Mundo', '🏛️', 'capitaisduplas', 'Países com mais de uma capital',
    'Nem todo país concentra governo, parlamento e tribunais na mesma cidade.',
    ['Capitais', 'Como divide', 'Por quê'], {
    africadosul: ['África do Sul', 'Pretória, Cidade do Cabo e Bloemfontein', 'Executivo, Legislativo e Judiciário em cidades diferentes', 'Acordo de união entre colônias rivais', 'Quando as quatro colônias se uniram em 1910, nenhuma aceitou ceder o posto. Dividir os poderes foi a saída para fechar o acordo.'],
    bolivia: ['Bolívia', 'Sucre e La Paz', 'Sucre é a capital constitucional, La Paz é a sede do governo', 'Guerra civil no fim do século XIX', 'O Judiciário ficou em Sucre e o resto mudou para La Paz. A disputa entre as duas cidades nunca foi encerrada formalmente.'],
    holanda: ['Países Baixos', 'Amsterdã e Haia', 'Amsterdã é a capital, Haia é a sede do governo', 'Tradição histórica', 'O rei é coroado em Amsterdã, mas o parlamento, os ministérios e as embaixadas ficam em Haia, que também abriga cortes internacionais.'],
    chile: ['Chile', 'Santiago e Valparaíso', 'O Congresso fica em Valparaíso', 'Decisão política de 1990', 'A mudança foi feita para descentralizar o poder. Na prática, criou o incômodo de deputados e ministros viajarem toda semana entre as duas cidades.'],
    malasia: ['Malásia', 'Kuala Lumpur e Putrajaya', 'Putrajaya concentra a administração federal', 'Congestionamento da capital', 'Putrajaya foi construída do zero nos anos 1990 para aliviar Kuala Lumpur, que continua sendo a capital oficial e a sede do parlamento.'],
    benim: ['Benim', 'Porto-Novo e Cotonou', 'Porto-Novo é oficial, Cotonou concentra o governo', 'Herança colonial', 'Quase todas as instituições funcionam em Cotonou, mas a Constituição nunca foi mudada, e Porto-Novo mantém o título no papel.']
})

T('Mundo', '🌆', 'cidadesgrandes', 'As maiores cidades do mundo',
    'Depende de onde se traça a linha: cidade, região metropolitana ou mancha urbana dão listas diferentes.',
    ['País', 'População metropolitana', 'O que a define'], {
    toquio: ['Tóquio', 'Japão', 'cerca de 37 milhões', 'Maior aglomeração urbana do planeta', 'A estação de Shinjuku movimenta mais de três milhões de pessoas por dia e é a mais movimentada do mundo por larga margem.'],
    delhi: ['Délhi', 'Índia', 'cerca de 33 milhões', 'A que mais cresce entre as gigantes', 'Deve ultrapassar Tóquio na próxima década. Nova Délhi, a capital, é apenas um distrito planejado dentro da cidade muito maior.'],
    xangai: ['Xangai', 'China', 'cerca de 29 milhões', 'Maior cidade chinesa e maior porto do mundo', 'Movimenta mais contêineres que qualquer outro porto do planeta, à frente de Singapura, e ainda assim não é a capital do país.'],
    saopaulo: ['São Paulo', 'Brasil', 'cerca de 22 milhões na região metropolitana', 'Maior cidade do hemisfério sul', 'Concentra a maior frota de helicópteros em uso civil do mundo, junto de Nova York, e a maior colônia japonesa fora do Japão.'],
    cidadedomexico: ['Cidade do México', 'México', 'cerca de 22 milhões', 'Construída sobre um lago drenado', 'Por causa disso, ela afunda. Partes do centro histórico cederam mais de nove metros em um século, e catedrais ficaram visivelmente tortas.'],
    cairo: ['Cairo', 'Egito', 'cerca de 22 milhões', 'Maior cidade da África e do mundo árabe', 'O governo ergueu uma nova capital administrativa no deserto a leste, para tirar ministérios de uma cidade que já não comporta o próprio trânsito.']
})

T('Mundo', '🏺', 'cidadesantigas', 'Cidades habitadas há mais tempo',
    'Continuamente habitada é um critério duro: a cidade não pode ter ficado vazia nenhuma vez.',
    ['País', 'Desde quando', 'O que restou'], {
    jerico: ['Jericó', 'Cisjordânia', 'vestígios de cerca de 9000 a.C.', 'Muralhas e torre de pedra neolíticas', 'A torre circular de Jericó é uma das construções mais antigas já encontradas, anterior à invenção da roda, da escrita e da cerâmica.'],
    damasco: ['Damasco', 'Síria', 'ocupação desde ao menos 3000 a.C.', 'Cidade velha murada', 'A rua Reta, citada na Bíblia, ainda existe e ainda é reta. Damasco disputa com Alepo o título de capital habitada há mais tempo.'],
    biblos: ['Biblos', 'Líbano', 'cerca de 5000 a.C.', 'Porto fenício e castelo cruzado', 'Deu nome ao livro: os gregos chamavam o papiro que vinha dali de byblos, e daí vieram bíblia e bibliotecas.'],
    atenas: ['Atenas', 'Grécia', 'cerca de 3000 a.C.', 'Acrópole e ágora', 'É a cidade europeia com ocupação contínua mais longa. O Partenon já foi templo grego, igreja cristã, mesquita e paiol de pólvora.'],
    varanasi: ['Varanasi', 'Índia', 'ao menos desde 1200 a.C.', 'Escadarias no rio Ganges', 'Considerada sagrada por hindus, budistas e jainistas. Milhares de pessoas viajam até ali para morrer, por crerem que isso encerra o ciclo de renascimentos.'],
    plovdiv: ['Plovdiv', 'Bulgária', 'cerca de 6000 a.C.', 'Teatro romano em uso até hoje', 'A cidade europeia mais antiga com ocupação contínua ao lado de Atenas. Seu anfiteatro romano ainda recebe shows e óperas.']
})

T('Mundo', '🚇', 'metros', 'Os metrôs mais notáveis do mundo',
    'Cada rede bateu um recorde diferente: idade, tamanho, profundidade ou beleza.',
    ['Cidade', 'Marca', 'Número de referência'], {
    londres: ['Metrô de Londres', 'Reino Unido', 'O primeiro metrô do mundo', 'inaugurado em 1863', 'Os primeiros trens eram a vapor, em túneis abertos e cobertos depois. O apelido tube veio dos túneis circulares escavados mais tarde.'],
    xangai: ['Metrô de Xangai', 'China', 'Rede mais extensa do mundo', 'mais de 800 km de linhas', 'Foi construída quase toda depois de 1993. Em trinta anos a cidade fez o que Londres levou um século e meio para montar.'],
    novayork: ['Metrô de Nova York', 'Estados Unidos', 'Maior número de estações', '472 estações', 'Funciona 24 horas por dia, todos os dias, o que é raríssimo. Quase nenhuma outra grande rede do mundo opera de madrugada.'],
    pequim: ['Metrô de Pequim', 'China', 'Um dos que mais transportam passageiros', 'mais de 3 bilhões de viagens por ano', 'Em horário de pico há funcionários cuja função é empurrar gente para dentro do vagão para que as portas fechem.'],
    pyongyang: ['Metrô de Pyongyang', 'Coreia do Norte', 'Um dos mais profundos do mundo', 'cerca de 110 m abaixo da rua', 'Foi cavado fundo para servir de abrigo antiaéreo. A escada rolante de descida leva vários minutos.'],
    moscou: ['Metrô de Moscou', 'Rússia', 'Estações tratadas como palácios', 'mármore, mosaicos e lustres', 'Foi projetado nos anos 1930 como palácio do povo. Algumas estações têm vitrais e esculturas de bronze e são visitadas como museu.']
})

T('Mundo', '🌉', 'pontes', 'Pontes que desafiam o bom senso',
    'Vão livre, comprimento total e altura são recordes diferentes, e cada um tem sua campeã.',
    ['Onde fica', 'Marca', 'Número de referência'], {
    canakkale: ['Ponte 1915 Çanakkale', 'Turquia', 'Maior vão livre suspenso do mundo', 'cerca de 2.023 m entre as torres', 'O número do nome e o do vão foram escolhidos de propósito: 1915 é o ano da batalha de Galípoli, e 2023, o centenário da República turca.'],
    akashi: ['Ponte Akashi Kaikyo', 'Japão', 'Recordista de vão livre por 24 anos', 'cerca de 1.991 m', 'Um terremoto durante a obra afastou as torres em quase um metro, e o projeto foi refeito no meio do caminho para acomodar a nova distância.'],
    danyang: ['Viaduto Danyang-Kunshan', 'China', 'Ponte mais longa do mundo', 'cerca de 164 km', 'É ferroviária e faz parte da linha de alta velocidade entre Pequim e Xangai. Atravessa arrozais, rios e lagos quase sem tocar o chão.'],
    hzmb: ['Ponte Hong Kong-Zhuhai-Macau', 'China', 'Maior travessia marítima do mundo', 'cerca de 55 km entre pontes e túnel', 'No meio do trajeto a ponte mergulha em um túnel submarino para não atrapalhar a rota dos navios cargueiros que entram no delta.'],
    goldengate: ['Golden Gate', 'Estados Unidos', 'A ponte mais fotografada do mundo', 'vão de 1.280 m, aberta em 1937', 'A cor laranja internacional foi escolhida para ser visível na neblina constante da baía. A Marinha queria listras amarelas e pretas.'],
    duge: ['Ponte de Duge', 'China', 'Ponte mais alta do mundo', 'cerca de 565 m acima do rio', 'Atravessa um cânion tão profundo que a obra foi feita içando peças por cabos. A ponte fica acima do nível onde as nuvens costumam se formar.']
})

T('Mundo', '🕳️', 'tuneis', 'Os túneis mais impressionantes',
    'Furar montanha e passar por baixo do mar mudou a geografia econômica de continentes inteiros.',
    ['Onde fica', 'Extensão', 'O que resolve'], {
    gotardo: ['Túnel de Base de São Gotardo', 'Suíça', 'cerca de 57 km', 'Liga o norte e o sul da Europa por baixo dos Alpes', 'Levou dezessete anos para ficar pronto e foi inaugurado em 2016. Os trens passam quase no nível do mar sob montanhas de mais de dois mil metros.'],
    seikan: ['Túnel Seikan', 'Japão', 'cerca de 53,8 km', 'Liga as ilhas de Honshu e Hokkaido', 'Foi decidido depois que um naufrágio de balsa matou mais de mil pessoas em 1954. Passa cerca de 240 metros abaixo do nível do mar.'],
    eurotunel: ['Eurotúnel', 'Reino Unido e França', 'cerca de 50,5 km', 'Liga a ilha britânica ao continente', 'Tem o trecho submarino mais longo do mundo, cerca de 38 km. A ideia foi proposta pela primeira vez a Napoleão, em 1802.'],
    laerdal: ['Túnel de Lærdal', 'Noruega', 'cerca de 24,5 km', 'Túnel rodoviário mais longo do mundo', 'Tem cavernas iluminadas de azul a cada seis quilômetros, criadas de propósito para o motorista não adormecer na monotonia.'],
    delaware: ['Aqueduto do Delaware', 'Estados Unidos', 'cerca de 137 km', 'Leva água para Nova York', 'É o túnel mais longo do mundo de qualquer tipo. Tem vazamentos conhecidos há décadas e passou por um desvio construído em operação.'],
    zhongnanshan: ['Túnel de Zhongnanshan', 'China', 'cerca de 18 km', 'Cruza a cordilheira Qinling', 'Tem trechos com céu pintado e iluminação que simula nuvens, pela mesma razão do túnel norueguês: manter quem dirige acordado e calmo.']
})

T('Mundo', '🚢', 'canais', 'Canais que encurtaram o mundo',
    'Cavar um canal não economiza só distância: muda rota comercial, guerra e preço de tudo.',
    ['Onde fica', 'Extensão', 'O que encurtou'], {
    suez: ['Canal de Suez', 'Egito', 'cerca de 193 km', 'Europa e Ásia sem contornar a África', 'Não tem eclusas, porque os dois mares estão praticamente no mesmo nível. Um único navio encalhado em 2021 travou o comércio mundial por seis dias.'],
    panama: ['Canal do Panamá', 'Panamá', 'cerca de 82 km', 'Atlântico e Pacífico sem descer ao cabo Horn', 'Os navios sobem 26 metros por eclusas, atravessam um lago artificial e descem do outro lado. A água usada vem da chuva, não do mar.'],
    grandecanal: ['Grande Canal da China', 'China', 'cerca de 1.776 km', 'Norte e sul da China por via fluvial', 'É o canal artificial mais longo e mais antigo do mundo ainda em uso, com trechos escavados a partir do século V a.C.'],
    kiel: ['Canal de Kiel', 'Alemanha', 'cerca de 98 km', 'Mar do Norte e mar Báltico', 'É o canal marítimo com mais movimento de navios do mundo, mesmo sendo curto: economiza a volta pela ponta da Dinamarca.'],
    corinto: ['Canal de Corinto', 'Grécia', 'cerca de 6,4 km', 'Separa o Peloponeso do continente', 'Nero começou a obra no ano 67 e ela só foi concluída em 1893. É tão estreito que quase nenhum navio moderno cabe nele.'],
    ericanal: ['Canal Erie', 'Estados Unidos', 'cerca de 584 km', 'Grandes Lagos e o oceano Atlântico', 'Aberto em 1825, fez de Nova York o principal porto do país e despejou o trigo do interior no mercado mundial.']
})

T('Mundo', '⚓', 'estreitos', 'Estreitos que o mundo inteiro vigia',
    'Passagem estreita é garganta: fechar uma delas trava petróleo, comida e frota.',
    ['Onde fica', 'Liga', 'Por que importa'], {
    ormuz: ['Estreito de Ormuz', 'Golfo Pérsico', 'Golfo Pérsico e mar da Arábia', 'Cerca de um quinto do petróleo do mundo passa ali', 'Tem cerca de 33 km na parte mais apertada. Qualquer tensão na região faz o preço do barril subir no mesmo dia.'],
    malaca: ['Estreito de Malaca', 'Sudeste Asiático', 'Oceano Índico e mar da China Meridional', 'Rota principal entre Oriente Médio e Ásia Oriental', 'Passam por ali cerca de um quarto de todo o comércio marítimo do planeta, em um corredor que chega a menos de três quilômetros de largura.'],
    bosforo: ['Estreito de Bósforo', 'Turquia', 'Mar Negro e mar de Mármara', 'Única saída do mar Negro para o oceano', 'Corta Istambul ao meio e separa Europa de Ásia. Grãos da Ucrânia e da Rússia só chegam ao mundo passando por ele.'],
    gibraltar: ['Estreito de Gibraltar', 'Espanha e Marrocos', 'Mediterrâneo e oceano Atlântico', 'Porta de entrada do Mediterrâneo', 'Tem cerca de 14 km no ponto mais estreito. Sem ele, o Mediterrâneo secaria: a evaporação supera a água que os rios despejam.'],
    bering: ['Estreito de Bering', 'Rússia e Estados Unidos', 'Oceano Pacífico e oceano Ártico', 'Separa dois continentes por 82 km', 'Na última era glacial, o nível do mar baixo transformou a região em uma ponte de terra por onde povos entraram nas Américas.'],
    magalhaes: ['Estreito de Magalhães', 'Chile', 'Atlântico e Pacífico pelo sul', 'Rota anterior ao canal do Panamá', 'É mais abrigado que o cabo Horn, mas cheio de curvas e ventos. Perdeu importância em 1914 e virou rota turística.']
})

T('Mundo', '🏢', 'predios', 'Os prédios mais altos do mundo',
    'O recorde de altura muda de país a cada década, e quase sempre acompanha um ciclo econômico.',
    ['Cidade', 'Altura', 'Quando ficou pronto'], {
    burj: ['Burj Khalifa', 'Dubai, Emirados Árabes', '828 m', '2010', 'É tão alto que quem está no térreo vê o sol se pôr alguns minutos antes de quem está no topo. O jejum do Ramadã nos andares altos segue horário próprio.'],
    merdeka: ['Merdeka 118', 'Kuala Lumpur, Malásia', 'cerca de 679 m', '2023', 'Segundo mais alto do mundo. O desenho da fachada reproduz o gesto de mão levantada do primeiro-ministro ao declarar a independência do país.'],
    shanghai: ['Shanghai Tower', 'Xangai, China', 'cerca de 632 m', '2015', 'A torre é torcida em cerca de 120 graus ao longo da subida, um formato que reduz de forma significativa a carga do vento sobre a estrutura.'],
    abraj: ['Abraj Al-Bait', 'Meca, Arábia Saudita', 'cerca de 601 m', '2012', 'Tem o maior relógio do mundo no topo, com ponteiros de dezenas de metros, visível a quilômetros da Grande Mesquita.'],
    empire: ['Empire State Building', 'Nova York, Estados Unidos', '381 m até o teto', '1931', 'Foi o prédio mais alto do mundo por quarenta anos e subiu em apenas treze meses e meio, em plena Grande Depressão.'],
    pisa: ['Torre de Pisa', 'Pisa, Itália', 'cerca de 57 m', '1372', 'Não é alta, mas é a mais famosa por estar errada: começou a inclinar durante a própria obra, porque o solo mole cedeu de um lado.']
})

T('Mundo', '🏟️', 'estadios', 'Os maiores estádios do mundo',
    'Capacidade de estádio encolheu no mundo inteiro quando as arquibancadas de pé viraram cadeiras.',
    ['Cidade', 'Capacidade', 'Detalhe'], {
    rungrado: ['Rungrado Primeiro de Maio', 'Pyongyang, Coreia do Norte', 'cerca de 114 mil lugares', 'Maior estádio do mundo em capacidade', 'É usado sobretudo para apresentações de massa com dezenas de milhares de participantes coreografados, não para futebol.'],
    michigan: ['Michigan Stadium', 'Ann Arbor, Estados Unidos', 'cerca de 107 mil lugares', 'Maior estádio das Américas', 'Pertence a uma universidade e enche para jogos de futebol americano universitário, que atraem mais público que muita liga profissional.'],
    mcg: ['Melbourne Cricket Ground', 'Melbourne, Austrália', 'cerca de 100 mil lugares', 'Maior estádio do hemisfério sul', 'Foi sede da abertura olímpica de 1956, a primeira realizada no hemisfério sul, e é o templo do críquete australiano.'],
    campnou: ['Camp Nou', 'Barcelona, Espanha', 'cerca de 99 mil lugares antes da reforma', 'Maior estádio da Europa', 'A reforma em andamento pretende levá-lo a mais de 105 mil lugares, retomando a liderança com folga no continente.'],
    maracana: ['Maracanã', 'Rio de Janeiro, Brasil', 'cerca de 78 mil lugares hoje', 'Recorde histórico de público em jogo de futebol', 'Na final da Copa de 1950 entraram cerca de 200 mil pessoas, com arquibancada de pé. Nenhuma partida de futebol reuniu tanta gente desde então.'],
    azteca: ['Estádio Azteca', 'Cidade do México, México', 'cerca de 87 mil lugares', 'Único a sediar duas finais de Copa do Mundo até 2022', 'Recebeu as finais de 1970 e 1986 e fica a mais de 2.200 metros de altitude, o que castiga visitantes desacostumados ao ar rarefeito.']
})

T('Mundo', '✈️', 'aeroportos', 'Os aeroportos que mais movimentam o mundo',
    'Cada aeroporto lidera uma estatística diferente: passageiros, carga, voos ou área.',
    ['Cidade', 'Em que lidera', 'Número de referência'], {
    atlanta: ['Hartsfield-Jackson', 'Atlanta, Estados Unidos', 'Mais passageiros totais do mundo', 'mais de 100 milhões por ano', 'Virou gigante por ser ponto de baldeação: boa parte de quem passa por ali não está indo para Atlanta, apenas trocando de avião.'],
    dubai: ['Aeroporto Internacional de Dubai', 'Dubai, Emirados Árabes', 'Mais passageiros internacionais', 'cerca de 90 milhões por ano', 'Fica a menos de oito horas de voo de boa parte da população mundial, posição que a companhia local transformou em modelo de negócio.'],
    memphis: ['Aeroporto de Memphis', 'Memphis, Estados Unidos', 'Um dos maiores em carga aérea', 'milhões de toneladas por ano', 'É o centro noturno de uma grande transportadora de encomendas: quase toda a operação acontece de madrugada, quando os passageiros dormem.'],
    ohare: ['Chicago O Hare', 'Chicago, Estados Unidos', 'Um dos maiores em número de pousos e decolagens', 'cerca de 800 mil movimentos por ano', 'Os atrasos de Chicago se espalham pelo país inteiro, porque muitas conexões internas dependem dele. Nevasca ali vira problema nacional.'],
    kingfahd: ['Rei Fahd', 'Dammam, Arábia Saudita', 'Maior aeroporto do mundo em área', 'cerca de 776 km²', 'É maior que o país vizinho Bahrein. Quase toda essa área é deserto vazio reservado para expansões que ainda não aconteceram.'],
    congonhas: ['Congonhas', 'São Paulo, Brasil', 'Um dos aeroportos urbanos mais movimentados', 'cerca de 20 milhões de passageiros por ano', 'Foi construído longe da cidade em 1936 e hoje está cercado por ela. A pista curta e o entorno denso impedem qualquer ampliação.']
})

T('Mundo', '🛫', 'voos', 'Os voos comerciais mais longos',
    'Voo sem escala de quase um dia inteiro só virou possível com motores mais econômicos.',
    ['Rota', 'Distância', 'Duração aproximada'], {
    sqnovayork: ['Singapura a Nova York', 'Singapore Airlines', 'cerca de 15.300 km', 'cerca de 18 h 40 min', 'É o voo comercial regular mais longo do mundo. O avião voa com menos poltronas que o normal, porque não conseguiria decolar cheio com tanto combustível.'],
    aucklanddoha: ['Auckland a Doha', 'Qatar Airways', 'cerca de 14.500 km', 'cerca de 18 h', 'Por muito tempo foi o mais longo. A volta é mais rápida que a ida por causa dos ventos de altitude, que empurram no sentido oeste-leste.'],
    perthlondres: ['Perth a Londres', 'Qantas', 'cerca de 14.500 km', 'cerca de 17 h', 'Foi a primeira ligação aérea direta entre Austrália e Europa, em 2018. Antes, a viagem sempre exigia parada na Ásia ou no Oriente Médio.'],
    saopaulotoquio: ['São Paulo a Tóquio', 'rota sem escala pontual', 'cerca de 18.500 km em rota', 'mais de 20 h em ensaios', 'Brasil e Japão estão quase em lados opostos do planeta, o que torna a ligação direta um dos maiores desafios da aviação comercial.'],
    maiscurto: ['Westray a Papa Westray', 'Ilhas Órcades, Escócia', 'cerca de 2,7 km', 'cerca de 90 segundos', 'É o voo comercial regular mais curto do mundo. Com vento favorável, já foi feito em menos de cinquenta segundos, porta a porta.'],
    projetosunrise: ['Sydney a Londres sem escala', 'projeto anunciado', 'cerca de 17.000 km', 'previstas cerca de 20 h', 'Quando entrar em operação, será o voo comercial mais longo já feito, e as aeronaves terão área para alongamento no lugar de poltronas.']
})

T('Mundo', '🧊', 'antartida', 'Antártida, o continente sem país',
    'É o continente mais alto, mais seco, mais frio e mais ventoso, e ninguém é dono dele.',
    ['Número de referência', 'Por que importa'], {
    area: ['Tamanho', 'cerca de 14 milhões de km²', 'Quinto maior continente', 'É maior que a Europa e quase do tamanho da América do Sul sem o Brasil. No inverno, com o mar congelado ao redor, praticamente dobra de área.'],
    gelo: ['Espessura do gelo', 'até cerca de 4,8 km', 'Média em torno de 2 km', 'O peso do gelo afunda a rocha abaixo dele. Se todo o gelo derretesse, o continente subiria centenas de metros ao longo de milhares de anos.'],
    agua: ['Água doce guardada', 'cerca de 70% da água doce do planeta', 'A maior reserva da Terra', 'Se tudo derretesse, o nível do mar subiria cerca de sessenta metros, o bastante para redesenhar o litoral de todos os continentes.'],
    populacao: ['Habitantes', 'de 1 mil a 5 mil conforme a estação', 'Nenhum permanente', 'A população é de pesquisadores e apoio, e sobe no verão austral. Já nasceram bebês ali, em manobras de Argentina e Chile para reforçar reivindicações.'],
    tratado: ['Tratado da Antártida', 'assinado em 1959, em vigor desde 1961', 'Congela todas as reivindicações territoriais', 'Reserva o continente à ciência e à paz, proíbe atividade militar e mineração. Mais de cinquenta países fazem parte dele hoje.'],
    vento: ['Ventos catabáticos', 'rajadas acima de 300 km/h já medidas', 'Os ventos mais fortes do planeta em terra', 'São ventos de ar frio e denso que despencam do planalto em direção à costa, ganhando velocidade por gravidade pura.']
})

T('Mundo', '🏔️', 'geleiras', 'Geleiras e calotas de gelo',
    'Geleira não é gelo parado: é um rio lento de gelo que esculpe vale e carrega pedra.',
    ['Onde fica', 'Marca', 'Detalhe'], {
    lambert: ['Geleira Lambert', 'Antártida', 'Maior geleira do mundo', 'cerca de 100 km de largura e 400 km de extensão', 'Drena boa parte do gelo do leste antártico para o mar. Move-se lentamente, mas carrega um volume de gelo difícil de imaginar.'],
    groenlandia: ['Calota da Groenlândia', 'Groenlândia', 'Segunda maior massa de gelo do planeta', 'cerca de 1,7 milhão de km²', 'Perde massa a cada ano. Sozinha, se derretesse por inteiro, elevaria o nível do mar em cerca de sete metros.'],
    peritomoreno: ['Perito Moreno', 'Argentina', 'Uma das poucas geleiras em equilíbrio', 'frente de cerca de 5 km e 60 m de altura', 'A cada poucos anos ela avança até represar um braço do lago, a água acumula e a parede desaba em um espetáculo anunciado.'],
    vatnajokull: ['Vatnajökull', 'Islândia', 'Maior calota de gelo da Europa', 'cerca de 7.900 km²', 'Há vulcões ativos embaixo dela. Quando um entra em erupção, o degelo repentino provoca enchentes violentas chamadas jökulhlaup.'],
    aletsch: ['Geleira de Aletsch', 'Suíça', 'Maior geleira dos Alpes', 'cerca de 20 km de extensão', 'Recuou vários quilômetros em um século e é acompanhada como termômetro do clima europeu. Fotos do mesmo ponto mostram a diferença.'],
    siachen: ['Geleira de Siachen', 'Índia e Paquistão', 'Campo de batalha mais alto do mundo', 'cerca de 5.400 m de altitude', 'Soldados são disputados ali desde 1984. A maior parte das baixas vem do frio e da altitude, não do combate.']
})

T('Mundo', '🌳', 'florestas', 'As grandes florestas do planeta',
    'A floresta que mais guarda carbono não é a mais famosa, e a mais antiga nem é tropical no imaginário comum.',
    ['Onde fica', 'Área aproximada', 'O que a distingue'], {
    taiga: ['Floresta boreal, ou taiga', 'Rússia, Canadá e Escandinávia', 'cerca de 15 milhões de km²', 'Maior bioma florestal terrestre', 'É maior que a Amazônia e guarda mais carbono, boa parte dele no solo congelado sob as árvores, não nos troncos.'],
    amazonia: ['Amazônia', 'Nove países da América do Sul', 'cerca de 5,5 milhões de km²', 'Maior floresta tropical do mundo', 'Ela fabrica a própria chuva: a água evaporada pelas árvores volta como precipitação e segue para o sul, abastecendo lavouras a milhares de quilômetros.'],
    congo: ['Bacia do Congo', 'Seis países da África Central', 'cerca de 3,4 milhões de km²', 'Segunda maior floresta tropical', 'Suas turfeiras guardam um volume de carbono comparável ao de vários anos de emissões globais, e só foram bem mapeadas na última década.'],
    daintree: ['Floresta de Daintree', 'Austrália', 'cerca de 1.200 km²', 'Floresta tropical contínua mais antiga', 'Tem cerca de 180 milhões de anos de existência contínua, bem mais velha que a Amazônia, e guarda linhagens de plantas quase pré-históricas.'],
    valdiviana: ['Floresta Valdiviana', 'Chile e Argentina', 'cerca de 250 mil km²', 'Floresta temperada úmida rara', 'Só existem poucas manchas desse tipo no mundo. Abriga a alerce, árvore que passa dos três mil anos de idade.'],
    tongass: ['Floresta Nacional de Tongass', 'Alasca, Estados Unidos', 'cerca de 68 mil km²', 'Maior floresta nacional dos Estados Unidos', 'É uma floresta tropical temperada, encharcada e fria, onde ursos, salmões e árvores gigantes dependem uns dos outros.']
})

T('Mundo', '🦇', 'cavernas', 'Cavernas que parecem outro planeta',
    'Cavernas guardam recordes que a superfície não tem: escuridão absoluta e silêncio total.',
    ['Onde fica', 'Marca', 'Número de referência'], {
    mammoth: ['Caverna Mammoth', 'Estados Unidos', 'Maior sistema de cavernas do mundo', 'mais de 680 km mapeados', 'É mais que o dobro do segundo colocado, e continua crescendo: novas passagens são ligadas ao sistema quase todo ano.'],
    sondoong: ['Son Doong', 'Vietnã', 'Maior passagem de caverna conhecida', 'até 200 m de altura em trechos', 'Cabe um quarteirão de prédios dentro dela. Tem floresta e nuvens próprias, formadas onde o teto desabou e deixou entrar luz.'],
    veryovkina: ['Veryovkina', 'Geórgia', 'Caverna mais profunda do mundo', 'mais de 2.200 m de profundidade', 'Explorá-la exige expedições de semanas acampando no subsolo. Uma enchente repentina já prendeu uma equipe inteira lá embaixo.'],
    naica: ['Cueva de los Cristales', 'México', 'Os maiores cristais naturais conhecidos', 'blocos de até 11 m de comprimento', 'Fica a cerca de 50 °C com umidade quase total, e quem entra usa traje refrigerado e só aguenta poucos minutos por vez.'],
    waitomo: ['Waitomo', 'Nova Zelândia', 'Teto iluminado por larvas bioluminescentes', 'milhares de pontos de luz', 'As larvas brilham para atrair insetos para fios grudentos que elas penduram. O efeito, visto de baixo, imita um céu estrelado.'],
    lechuguilla: ['Lechuguilla', 'Estados Unidos', 'Formações minerais raríssimas', 'mais de 240 km mapeados', 'Foi descoberta em 1986 e é quase toda fechada ao público. Micro-organismos achados ali interessam à pesquisa de antibióticos.']
})

T('Mundo', '📉', 'terremotos', 'Terremotos e as escalas que os medem',
    'A escala Richter saiu de moda na ciência: hoje se usa a magnitude de momento, que não satura.',
    ['Onde', 'Quando', 'Magnitude'], {
    valdivia: ['Valdívia', 'Chile', '1960', '9,5', 'É o terremoto mais forte já registrado por instrumentos. A ruptura teve centenas de quilômetros e gerou tsunami que matou gente no Japão e no Havaí.'],
    alasca: ['Alasca', 'Estados Unidos', '1964', '9,2', 'Durou cerca de quatro minutos e meio, o que é longuíssimo. Terreno inteiro liquefez e bairros escorregaram encosta abaixo.'],
    sumatra: ['Sumatra', 'Indonésia', '2004', '9,1', 'Gerou o tsunami mais mortal já registrado, com mais de duzentas mil vítimas em quatorze países. Foi o que levou o Índico a ganhar sistema de alerta.'],
    tohoku: ['Tohoku', 'Japão', '2011', '9,0', 'Moveu a ilha principal do Japão alguns metros para leste e encurtou o dia terrestre em uma fração de microssegundo. Causou o acidente nuclear de Fukushima.'],
    escala: ['Magnitude de momento', 'Escala usada hoje', 'desde os anos 1970', 'cada ponto multiplica a energia por cerca de 32', 'Um sismo de magnitude 8 libera cerca de mil vezes mais energia que um de 6. A escala é logarítmica, e por isso os números enganam.'],
    mercalli: ['Escala de Mercalli', 'Escala de intensidade', 'de I a XII', 'mede o estrago, não a energia', 'Dois lugares podem sentir o mesmo terremoto com intensidades muito diferentes, conforme a distância, o solo e o tipo de construção.']
})

T('Mundo', '🌀', 'tempestades', 'Furacão, tufão e ciclone',
    'São a mesma coisa com nomes diferentes: o que muda é o oceano onde a tempestade nasceu.',
    ['Onde nasce', 'Como se chama', 'Detalhe'], {
    furacao: ['Furacão', 'Atlântico Norte e Pacífico Nordeste', 'Furacão', 'Temporada de junho a novembro', 'São classificados de 1 a 5 pela escala Saffir-Simpson, que olha só a velocidade do vento e ignora chuva e maré, as causas mais comuns de morte.'],
    tufao: ['Tufão', 'Pacífico Noroeste', 'Tufão', 'A bacia mais ativa do mundo', 'Quando o vento passa de 240 km/h, alguns serviços usam o termo supertufão. Filipinas, Japão e Taiwan recebem vários por ano.'],
    ciclone: ['Ciclone tropical', 'Índico e Pacífico Sul', 'Ciclone', 'Gira ao contrário no hemisfério sul', 'A rotação da Terra faz o sistema girar no sentido horário no sul e anti-horário no norte. Por isso as imagens de satélite parecem espelhadas.'],
    catarina: ['Catarina', 'Atlântico Sul', 'Raríssimo no hemisfério sul', '2004, no litoral de Santa Catarina', 'Foi o primeiro furacão documentado no Atlântico Sul, região onde a formação é considerada quase impossível pelas condições do mar e do vento.'],
    patricia: ['Patricia', 'Pacífico Nordeste', 'Ventos mais fortes já medidos', 'cerca de 345 km/h em 2015', 'Intensificou-se mais rápido do que qualquer tempestade já observada, saindo de tormenta a categoria máxima em cerca de um dia.'],
    olho: ['O olho da tempestade', 'Centro do sistema', 'Calmaria enganosa', 'de 20 a 60 km de diâmetro', 'Quem está no olho vê céu azul e sente vento fraco por minutos. Em seguida vem a outra parede, com vento na direção oposta.']
})

T('Mundo', '🌡️', 'climas', 'Os climas do mundo, em ordem',
    'A classificação de Köppen agrupa o planeta em cinco grandes letras e explica quase toda a vegetação.',
    ['Letra', 'Onde predomina', 'Como é'], {
    tropical: ['Tropical úmido', 'A', 'Amazônia, Congo, Indonésia', 'Quente o ano todo, chuva abundante', 'Nenhum mês abaixo de 18 °C. Onde há estação seca definida, a floresta dá lugar à savana, como no cerrado brasileiro.'],
    arido: ['Árido e semiárido', 'B', 'Saara, Arábia, Atacama, sertão nordestino', 'Evaporação maior que a chuva', 'A letra não é definida por calor, e sim pelo balanço entre chuva e evaporação. Por isso há desertos frios dentro da mesma classe.'],
    temperado: ['Temperado', 'C', 'Sul do Brasil, Europa Ocidental, Califórnia, Japão', 'Invernos amenos e verões variados', 'É a faixa onde vive a maior parte da população mundial. O clima mediterrâneo, de verão seco, é uma das variações dessa letra.'],
    continental: ['Continental', 'D', 'Canadá, Rússia, norte dos Estados Unidos', 'Invernos rigorosos e verões curtos', 'Quase não existe no hemisfério sul, porque falta massa de terra nas latitudes certas para afastar o ar do efeito moderador do mar.'],
    polar: ['Polar', 'E', 'Antártida, Groenlândia, norte da Sibéria', 'Nenhum mês acima de 10 °C', 'Divide-se em tundra, onde o solo descongela na superfície e nasce vegetação rasteira, e gelo permanente, onde nada cresce.'],
    altitude: ['Clima de montanha', 'H, em algumas versões', 'Andes, Himalaia, altiplanos', 'Muda conforme a altura, não a latitude', 'Subir mil metros equivale grosso modo a viajar centenas de quilômetros na direção do polo. Por isso há geleira sobre a linha do Equador.']
})

T('Mundo', '🧩', 'placas', 'As placas tectônicas',
    'O chão que parece firme está se movendo agora, mais ou menos na velocidade em que a unha cresce.',
    ['Tamanho relativo', 'Onde fica', 'O que provoca'], {
    pacifica: ['Placa do Pacífico', 'A maior de todas', 'Quase todo o oceano Pacífico', 'Boa parte do Cinturão de Fogo', 'Está mergulhando por baixo das placas vizinhas em quase todas as bordas, e é por isso que o Pacífico encolhe alguns centímetros por ano.'],
    nazca: ['Placa de Nazca', 'Pequena, mas decisiva', 'Pacífico a oeste da América do Sul', 'Ergueu a cordilheira dos Andes', 'Ela mergulha sob a placa sul-americana. Esse empurrão levantou os Andes e provoca os terremotos mais fortes já registrados.'],
    indoaustraliana: ['Placa Indo-Australiana', 'Grande e em separação', 'Índia, Austrália e parte do Índico', 'Ergueu o Himalaia', 'A Índia foi uma ilha que atravessou o oceano e bateu na Ásia. O choque ainda continua, e por isso o Himalaia cresce alguns milímetros por ano.'],
    africana: ['Placa Africana', 'Grande e rachando', 'África e parte do Atlântico', 'O Vale do Rift Africano', 'A placa está se dividindo em duas. Em alguns milhões de anos, um novo oceano deve separar o chifre da África do resto do continente.'],
    sulamericana: ['Placa Sul-Americana', 'Grande e estável no centro', 'América do Sul e parte do Atlântico', 'Brasil quase sem terremoto', 'O Brasil fica no meio da placa, longe das bordas, e por isso quase não treme. Os abalos brasileiros são raros e fracos.'],
    cinturao: ['Cinturão de Fogo do Pacífico', 'Faixa em ferradura', 'Bordas do oceano Pacífico', 'Concentra a maioria dos vulcões e terremotos', 'Cerca de três quartos dos vulcões ativos e a grande maioria dos terremotos fortes do planeta acontecem nessa única faixa.']
})

T('Mundo', '⛰️', 'cordilheiras', 'As grandes cordilheiras',
    'A cadeia de montanhas mais longa do planeta fica debaixo do mar e quase ninguém a vê.',
    ['Onde fica', 'Extensão', 'Ponto mais alto'], {
    dorsalmeso: ['Dorsal Meso-Oceânica', 'Submersa, em todos os oceanos', 'cerca de 65.000 km', 'Emerge na Islândia', 'É a maior formação geológica do planeta. Ali nasce crosta nova continuamente, empurrando os continentes para os lados.'],
    andes: ['Andes', 'Sete países da América do Sul', 'cerca de 7.000 km', 'Aconcágua, 6.961 m', 'A cadeia de montanhas emersa mais longa do mundo. Abriga o vulcão ativo mais alto do planeta e as cidades mais altas habitadas.'],
    rochosas: ['Montanhas Rochosas', 'Canadá e Estados Unidos', 'cerca de 4.800 km', 'Monte Elbert, 4.401 m', 'Separam as bacias que correm para o Pacífico das que correm para o Atlântico, uma divisória continental que atravessa o continente inteiro.'],
    himalaia: ['Himalaia', 'Cinco países da Ásia', 'cerca de 2.400 km', 'Everest, 8.849 m', 'Concentra todos os picos de mais de oito mil metros do mundo e alimenta rios de que dependem cerca de dois bilhões de pessoas.'],
    grandedivisoria: ['Grande Cordilheira Divisória', 'Austrália', 'cerca de 3.500 km', 'Monte Kosciuszko, 2.228 m', 'É a terceira cadeia mais longa do mundo e a mais baixa das grandes: a Austrália é o continente mais plano e mais erodido.'],
    alpes: ['Alpes', 'Oito países europeus', 'cerca de 1.200 km', 'Mont Blanc, cerca de 4.808 m', 'A altura do Mont Blanc é remedida a cada dois anos, porque a calota de gelo do cume engorda e emagrece conforme o clima.']
})

T('Mundo', '🗺️', 'peninsulas', 'Penínsulas, istmos e cabos',
    'Terra cercada de água por quase todos os lados é onde a geografia decide rota e fronteira.',
    ['Onde fica', 'Tipo', 'Por que importa'], {
    arabica: ['Península Arábica', 'Sudoeste da Ásia', 'Maior península do mundo', 'cerca de 3,2 milhões de km²', 'É maior que a Índia. Cercada por três mares, concentra uma parcela enorme das reservas mundiais de petróleo e gás.'],
    iberica: ['Península Ibérica', 'Sudoeste da Europa', 'Península', 'cerca de 583 mil km²', 'Separada do resto da Europa pelos Pirineus, foi por séculos mais ligada ao norte da África que à França, e isso marcou língua, arquitetura e culinária.'],
    escandinava: ['Península Escandinava', 'Norte da Europa', 'Maior península europeia', 'cerca de 750 mil km²', 'Sua costa oeste é rasgada por fiordes escavados por geleiras, o que dá à Noruega um litoral de dezenas de milhares de quilômetros.'],
    panama: ['Istmo do Panamá', 'América Central', 'Istmo', 'cerca de 60 km na parte mais estreita', 'Quando ele se fechou, há cerca de três milhões de anos, mudou as correntes marinhas do planeta e permitiu a troca de animais entre as Américas.'],
    suez: ['Istmo de Suez', 'Egito', 'Istmo', 'cerca de 125 km de largura', 'É a única ligação terrestre entre África e Ásia. Cortá-lo com um canal separou fisicamente os dois continentes pela primeira vez.'],
    boaesperanca: ['Cabo da Boa Esperança', 'África do Sul', 'Cabo', 'ponto de virada das rotas para o Índico', 'Não é o ponto mais ao sul da África, apesar da fama: esse título pertence ao cabo das Agulhas, cerca de 150 km a sudeste.']
})

T('Mundo', '🏝️', 'arquipelagos', 'Os arquipélagos do mundo',
    'Contar ilhas parece simples até alguém perguntar a partir de que tamanho uma pedra vira ilha.',
    ['Onde fica', 'Número de ilhas', 'Detalhe'], {
    suecia: ['Suécia', 'Norte da Europa', 'cerca de 270 mil ilhas', 'O país com mais ilhas do mundo', 'A imensa maioria é minúscula e desabitada. Só algumas centenas têm gente morando, e o arquipélago de Estocolmo é o mais conhecido.'],
    indonesia: ['Indonésia', 'Sudeste Asiático', 'cerca de 17.500 ilhas', 'Maior país-arquipélago habitado', 'São cerca de seis mil ilhas habitadas e centenas de idiomas. Manter um país inteiro sobre isso exigiu criar uma língua nacional franca.'],
    japao: ['Japão', 'Leste da Ásia', 'cerca de 14.125 ilhas', 'O número dobrou em uma recontagem', 'Até 2023 o país dizia ter cerca de 6.800 ilhas. Um novo levantamento digital, com critério mais fino, mais que dobrou a contagem.'],
    filipinas: ['Filipinas', 'Sudeste Asiático', 'cerca de 7.641 ilhas', 'Muitas só aparecem na maré baixa', 'A contagem oficial cresceu nos últimos anos por causa de mapeamentos mais precisos. Cerca de duas mil são habitadas.'],
    maldivas: ['Maldivas', 'Oceano Índico', 'cerca de 1.190 ilhas', 'O país mais plano do mundo', 'O ponto mais alto do território fica em torno de 2,4 metros acima do mar. O país já fez reunião de governo debaixo da água para chamar atenção.'],
    galapagos: ['Galápagos', 'Equador, no Pacífico', 'cerca de 127 ilhas e ilhotas', 'Berço da teoria da evolução', 'Foi ali que Darwin notou que aves parecidas tinham bicos diferentes em cada ilha, conforme o alimento disponível.']
})

T('Mundo', '🌊', 'mares', 'Mares fechados e mares estranhos',
    'Mar não é só oceano recortado: alguns são lagos, um não tem costa nenhuma e outro quase sumiu.',
    ['Onde fica', 'O que tem de estranho', 'Detalhe'], {
    sargacos: ['Mar dos Sargaços', 'Atlântico Norte', 'Único mar sem costa alguma', 'Delimitado por correntes, não por terra', 'Suas fronteiras são quatro correntes oceânicas que o cercam. As enguias europeias atravessam o oceano só para desovar ali.'],
    aral: ['Mar de Aral', 'Cazaquistão e Uzbequistão', 'Secou quase por completo', 'Perdeu cerca de 90% do volume', 'Os rios que o alimentavam foram desviados para lavouras de algodão. Navios pesqueiros ficaram encalhados em pleno deserto de sal.'],
    vermelho: ['Mar Vermelho', 'Entre África e Ásia', 'O mar aberto mais quente e mais salgado', 'temperaturas acima de 30 °C no verão', 'Quase nenhum rio desagua nele, e chove pouquíssimo. Toda a água que entra vem do Índico e boa parte evapora ali mesmo.'],
    baltico: ['Mar Báltico', 'Norte da Europa', 'O mar menos salgado do mundo', 'salinidade muito abaixo da oceânica', 'Recebe muitos rios e troca pouca água com o oceano. Por isso congela em partes e conserva naufrágios em estado impressionante.'],
    negro: ['Mar Negro', 'Entre Europa e Ásia', 'Sem oxigênio abaixo de certa profundidade', 'mais de 80% do volume sem vida animal', 'A água doce dos rios fica por cima e a salgada embaixo, sem se misturar. No fundo há naufrágios antigos preservados com madeira e cordas intactas.'],
    caribe: ['Mar do Caribe', 'América Central', 'Um dos maiores mares do mundo', 'cerca de 2,7 milhões de km²', 'Abriga a segunda maior barreira de corais do planeta e é a principal região de formação de furacões que atingem a América do Norte.']
})

T('Mundo', '🧱', 'enclaves', 'Enclaves, exclaves e pedaços soltos',
    'Território não precisa ser contínuo, e o mapa político guarda recortes difíceis de explicar.',
    ['De quem é', 'Onde fica', 'Como ficou assim'], {
    kaliningrado: ['Kaliningrado', 'Rússia', 'Entre Polônia e Lituânia', 'Ficou separado com o fim da União Soviética', 'É um exclave: território russo sem ligação terrestre com a Rússia. Antes da guerra era a cidade alemã de Königsberg.'],
    llivia: ['Llívia', 'Espanha', 'Dentro do território francês', 'Um tratado de 1659 listou aldeias, e Llívia era vila', 'Como o acordo cedia à França as aldeias da região, e Llívia tinha status de vila, ela ficou de fora e virou uma ilha espanhola em solo francês.'],
    ceuta: ['Ceuta e Melilla', 'Espanha', 'Na costa do norte da África', 'Herança de conquistas anteriores à independência marroquina', 'São as únicas fronteiras terrestres da União Europeia com a África, e por isso concentram um dos pontos mais tensos de migração do continente.'],
    cabinda: ['Cabinda', 'Angola', 'Separada pelo território da República Democrática do Congo', 'Traçado colonial de fronteiras', 'É um exclave rico em petróleo, responsável por boa parte da produção angolana, e com um movimento separatista antigo.'],
    nakhchivan: ['Nakhchivan', 'Azerbaijão', 'Separado pelo território armênio', 'Acordos entre potências nos anos 1920', 'Para ir da capital ao exclave por terra, é preciso atravessar outro país, o que já sustentou décadas de disputa regional.'],
    alasca: ['Alasca', 'Estados Unidos', 'Separado pelo Canadá', 'Comprado da Rússia em 1867', 'Custou cerca de 7,2 milhões de dólares da época e foi chamado de loucura. Décadas depois, acharam ouro, e mais tarde, petróleo.']
})

T('Mundo', '🏴', 'ultramar', 'Territórios que ficam longe do próprio país',
    'Há pedaços da Europa na América do Sul e no Caribe, com euro no bolso e bandeira europeia.',
    ['De quem é', 'Onde fica', 'Situação'], {
    guianafrancesa: ['Guiana Francesa', 'França', 'América do Sul, ao norte do Brasil', 'Departamento francês, território da União Europeia', 'A maior fronteira terrestre da França é com o Brasil. O centro espacial europeu fica ali, perto da linha do Equador, onde o impulso de lançamento é maior.'],
    groenlandia: ['Groenlândia', 'Dinamarca', 'Entre os oceanos Ártico e Atlântico', 'País autônomo do Reino da Dinamarca', 'Saiu da Comunidade Europeia em 1985, depois de um referendo motivado sobretudo por direitos de pesca.'],
    havai: ['Havaí', 'Estados Unidos', 'Meio do oceano Pacífico', 'Estado desde 1959', 'Era um reino independente, com monarquia reconhecida internacionalmente, até ser derrubado em 1893 com apoio de interesses estrangeiros.'],
    portorico: ['Porto Rico', 'Estados Unidos', 'Caribe', 'Território não incorporado', 'Seus moradores são cidadãos americanos, mas não votam para presidente enquanto morarem na ilha. O tema vai a referendo periodicamente.'],
    pascoa: ['Ilha de Páscoa', 'Chile', 'Pacífico Sul, a cerca de 3.500 km do continente', 'Território especial chileno', 'Uma das ilhas habitadas mais isoladas do mundo. Seus moradores a chamam de Rapa Nui, e as estátuas moai pesam dezenas de toneladas.'],
    reuniao: ['Reunião', 'França', 'Oceano Índico, perto de Madagascar', 'Departamento francês', 'Detém recordes mundiais de chuva em 24 horas e em 72 horas, graças a ciclones que despejam metros de água sobre o relevo vulcânico.']
})

T('Mundo', '🆕', 'paisesnovos', 'Os países mais novos do mundo',
    'A lista de países do mundo mudou mais nos últimos trinta anos do que muita gente imagina.',
    ['Quando nasceu', 'De onde saiu', 'Como aconteceu'], {
    sudaodosul: ['Sudão do Sul', '2011', 'Sudão', 'Referendo após décadas de guerra civil', 'É o país mais novo reconhecido pela ONU. Quase 99% dos votos foram pela separação, encerrando um dos conflitos mais longos da África.'],
    montenegro: ['Montenegro', '2006', 'União com a Sérvia', 'Referendo apertado', 'A separação passou por pouco mais que o mínimo exigido. Com isso, a Sérvia virou independente também e perdeu a saída para o mar.'],
    timor: ['Timor-Leste', '2002', 'Indonésia', 'Referendo supervisionado pela ONU', 'Foi colônia portuguesa, depois ocupada por 24 anos. É um dos dois países de língua oficial portuguesa na Ásia, ao lado de Macau em outro estatuto.'],
    palau: ['Palau', '1994', 'Administração dos Estados Unidos', 'Fim de tutela internacional', 'Foi o último território sob tutela da ONU a se tornar independente, encerrando um capítulo aberto no fim da Segunda Guerra.'],
    eritreia: ['Eritreia', '1993', 'Etiópia', 'Referendo após guerra de independência', 'A separação deixou a Etiópia sem litoral, o que virou uma das causas da guerra sangrenta entre os dois países no fim dos anos 1990.'],
    chequia: ['Chéquia e Eslováquia', '1993', 'Tchecoslováquia', 'Separação negociada e pacífica', 'Ficou conhecida como divórcio de veludo: os dois países se separaram por acordo, sem tiro, sem referendo e em poucos meses.']
})

T('Mundo', '🛣️', 'estradas', 'Estradas lendárias do planeta',
    'Estrada longa não é façanha de engenharia: a façanha é onde ela passa.',
    ['Onde fica', 'Extensão', 'O que tem de especial'], {
    panamericana: ['Rodovia Pan-Americana', 'Do Alasca à Patagônia', 'cerca de 30.000 km', 'A estrada mais longa do mundo', 'Tem um buraco de cerca de 100 km na selva entre Panamá e Colômbia, o Tampão do Darién, que nunca foi vencido por asfalto.'],
    karakoram: ['Rodovia do Karakoram', 'China e Paquistão', 'cerca de 1.300 km', 'A estrada internacional pavimentada mais alta', 'Cruza a fronteira a cerca de 4.700 metros. Centenas de operários morreram na construção, em desabamentos e quedas.'],
    yungas: ['Estrada de Yungas', 'Bolívia', 'cerca de 60 km de trecho crítico', 'Apelidada de estrada da morte', 'Largura de poucos metros, sem guarda-corpo e com abismos de centenas de metros. Depois que uma rota alternativa foi aberta, virou destino de ciclistas.'],
    rota66: ['Rota 66', 'Estados Unidos', 'cerca de 3.940 km', 'A estrada mais mitificada do mundo', 'Ligava Chicago a Santa Mônica e foi desativada oficialmente em 1985, substituída por interestaduais. Virou atração justamente por ter sido aposentada.'],
    highway1: ['Highway 1', 'Austrália', 'cerca de 14.500 km', 'A estrada nacional mais longa em circuito', 'Dá a volta no continente inteiro. Um de seus trechos segue reto por cerca de 146 km sem uma única curva.'],
    transiberianarod: ['Estrada de Kolimá', 'Rússia', 'cerca de 2.000 km', 'Construída sobre solo permanentemente congelado', 'É chamada de estrada dos ossos por ter sido erguida por trabalhos forçados, com mortes enterradas ao longo do próprio traçado.']
})

T('Mundo', '🚂', 'ferrovias', 'Ferrovias que atravessam continentes',
    'Trem longo mudou império, fronteira e fuso horário antes de virar passeio turístico.',
    ['Onde fica', 'Extensão', 'O que tem de especial'], {
    transiberiana: ['Transiberiana', 'Rússia', 'cerca de 9.289 km', 'A ferrovia mais longa do mundo', 'A viagem inteira leva cerca de sete dias e cruza oito fusos horários. Os horários nas estações sempre foram exibidos na hora de Moscou.'],
    qinghai: ['Ferrovia Qinghai-Tibete', 'China', 'cerca de 1.956 km', 'A ferrovia mais alta do mundo', 'Passa dos 5.000 metros de altitude. Os vagões são pressurizados e oferecem oxigênio, e parte dos trilhos corre sobre solo congelado resfriado artificialmente.'],
    shinkansen: ['Shinkansen', 'Japão', 'rede de milhares de km', 'O primeiro trem de alta velocidade do mundo', 'Entrou em operação em 1964, às vésperas da Olimpíada de Tóquio. Em décadas de operação, nunca houve morte de passageiro por descarrilamento ou colisão.'],
    orientexpress: ['Orient Express', 'Paris a Istambul', 'cerca de 3.000 km na rota clássica', 'O trem mais romanceado da história', 'Funcionou de 1883 a 2009 em vários formatos. Serviu de cenário a romances e virou sinônimo de viagem de luxo entre Europa e Oriente.'],
    eurostar: ['Eurostar', 'Londres, Paris e Bruxelas', 'cerca de 500 km na rota principal', 'Liga uma ilha ao continente por baixo do mar', 'Atravessa o Eurotúnel em cerca de vinte minutos. Os passageiros passam pela fronteira antes de embarcar, não ao desembarcar.'],
    transandina: ['Trem das Nuvens', 'Argentina', 'cerca de 217 km', 'Uma das ferrovias mais altas das Américas', 'Chega a cerca de 4.200 metros e vence a subida com curvas em zigue-zague e laços completos, sem cremalheira.']
})

T('Mundo', '🌍', 'continentes', 'Os continentes em números',
    'Quantos continentes existem depende do país onde você estudou: são cinco, seis ou sete conforme a escola.',
    ['Área', 'População aproximada', 'Países'], {
    asia: ['Ásia', 'cerca de 44,6 milhões de km²', 'cerca de 4,7 bilhões', 'cerca de 49 países', 'Concentra quase seis em cada dez pessoas do planeta. Sozinha tem mais gente que todos os outros continentes somados.'],
    africa: ['África', 'cerca de 30,3 milhões de km²', 'cerca de 1,4 bilhão', '54 países', 'É o continente com mais países e o de população mais jovem: a idade mediana fica em torno de dezenove anos.'],
    americadonorte: ['América do Norte', 'cerca de 24,7 milhões de km²', 'cerca de 600 milhões', '23 países', 'Inclui América Central e Caribe na divisão mais usada fora do Brasil, o que explica a diferença de contagem entre atlas.'],
    americadosul: ['América do Sul', 'cerca de 17,8 milhões de km²', 'cerca de 435 milhões', '12 países e um território', 'O Brasil ocupa cerca de metade da área e concentra cerca de metade da população do continente inteiro.'],
    europa: ['Europa', 'cerca de 10,2 milhões de km²', 'cerca de 745 milhões', 'cerca de 44 países', 'É o segundo menor continente em área e não tem separação física clara da Ásia: a divisão nos montes Urais é convenção cultural, não geológica.'],
    oceania: ['Oceania', 'cerca de 8,5 milhões de km²', 'cerca de 45 milhões', '14 países', 'Menor continente em população. A Austrália responde por quase toda a área e por mais da metade dos habitantes.']
})

T('Mundo', '🧭', 'remotos', 'Os lugares mais isolados do planeta',
    'Longe de tudo tem medida: existe um ponto do oceano onde o ser humano mais próximo está no espaço.',
    ['Onde fica', 'Distância do vizinho mais próximo', 'Quem vive lá'], {
    nemo: ['Ponto Nemo', 'Pacífico Sul', 'cerca de 2.688 km da terra mais próxima', 'Ninguém', 'Quando a Estação Espacial passa por cima, os astronautas são os humanos mais próximos dali. É também onde se derrubam satélites no fim da vida útil.'],
    tristao: ['Tristão da Cunha', 'Atlântico Sul', 'cerca de 2.400 km de Santa Helena', 'cerca de 240 pessoas', 'É o povoado habitado mais remoto do mundo. Não tem aeroporto: chegar exige uma viagem de barco de vários dias a partir da África do Sul.'],
    bouvet: ['Ilha Bouvet', 'Atlântico Sul', 'cerca de 1.600 km da Antártida', 'Ninguém', 'Considerada a ilha mais remota do mundo, é quase toda coberta de gelo e cercada de falésias, o que torna o desembarque quase impossível.'],
    pitcairn: ['Pitcairn', 'Pacífico Sul', 'dias de barco até a ilha vizinha', 'cerca de 35 a 50 pessoas', 'Foi povoada por amotinados do navio Bounty em 1790. Boa parte da população atual descende diretamente deles.'],
    ittoqqortoormiit: ['Ittoqqortoormiit', 'Groenlândia', 'centenas de km do povoado mais próximo', 'cerca de 350 pessoas', 'O mar ao redor fica congelado a maior parte do ano, e a ligação com o resto do mundo depende de helicóptero e de uma janela curta de navegação.'],
    inacessibilidade: ['Polo euroasiático de inacessibilidade', 'Noroeste da China', 'cerca de 2.500 km do mar mais próximo', 'Quase ninguém', 'É o ponto de terra firme mais distante de qualquer oceano no planeta, no meio do deserto de Gobi e das estepes da Ásia Central.']
})

T('Mundo', '🧱', 'muros', 'Muros que dividiram o mundo',
    'Muro quase nunca é só pedra: é declaração política que sobrevive à própria função.',
    ['Onde fica', 'Quando', 'O que separava'], {
    berlim: ['Muro de Berlim', 'Alemanha', '1961 a 1989', 'Berlim Oriental e Ocidental', 'Tinha cerca de 155 km e cercava a parte ocidental da cidade por inteiro, como uma ilha. Caiu em parte por causa de um anúncio feito por engano em uma coletiva.'],
    adriano: ['Muralha de Adriano', 'Reino Unido', 'a partir de 122', 'Limite norte do Império Romano', 'Tinha cerca de 117 km de costa a costa. Fortes, torres e portões a cada milha romana mostram que servia também de posto aduaneiro, não só de defesa.'],
    gorgan: ['Grande Muralha de Gorgan', 'Irã', 'séculos V e VI', 'Império Sassânida e povos das estepes', 'Com cerca de 195 km, é uma das maiores muralhas antigas já construídas e tinha fortes guarnecidos por dezenas de milhares de soldados.'],
    belfast: ['Muros da paz', 'Irlanda do Norte', 'desde 1969', 'Bairros católicos e protestantes', 'Há mais muros de pé hoje do que no fim do conflito, em 1998. Alguns portões ainda fecham à noite, por acordo entre as próprias comunidades.'],
    saara: ['Berma do Saara Ocidental', 'Marrocos', 'anos 1980', 'Área controlada por Marrocos e a disputada', 'É uma barreira de areia e pedra de cerca de 2.700 km, cercada por um dos maiores campos minados contínuos do planeta.'],
    lamentacoes: ['Muro das Lamentações', 'Jerusalém', 'século I a.C.', 'Resto de um muro de sustentação do Segundo Templo', 'Não era parede do templo, e sim da plataforma que o sustentava. Virou o lugar mais sagrado acessível ao culto judaico depois da destruição.']
})

/* ───────────────────────────── BRASIL ───────────────────────────── */

T('Brasil', '🏖️', 'praias', 'Praias brasileiras que valem a viagem',
    'São mais de sete mil quilômetros de litoral, e cada trecho tem um tipo de praia diferente.',
    ['Onde fica', 'O que a distingue', 'Detalhe'], {
    cassino: ['Praia do Cassino', 'Rio Grande, Rio Grande do Sul', 'A praia contínua mais longa do mundo', 'cerca de 250 km de areia sem interrupção', 'Dá para dirigir sobre a areia por horas. O naufrágio do navio Altair, encalhado desde 1976, virou ponto de referência da paisagem.'],
    sancho: ['Baía do Sancho', 'Fernando de Noronha, Pernambuco', 'Eleita várias vezes a melhor praia do mundo', 'acesso por escada dentro de uma fenda na rocha', 'A descida é feita por degraus encaixados em uma fresta do paredão. A visibilidade da água permite ver tartarugas do alto do mirante.'],
    jericoacoara: ['Jericoacoara', 'Jijoca de Jericoacoara, Ceará', 'Vila sem asfalto dentro de um parque nacional', 'ruas de areia e sem iluminação forte', 'A iluminação pública é propositalmente fraca para não atrapalhar a observação do céu e a desova das tartarugas.'],
    portodegalinhas: ['Porto de Galinhas', 'Ipojuca, Pernambuco', 'Piscinas naturais entre os corais', 'visíveis apenas na maré baixa', 'O nome vem do tempo em que galinhas de angola eram anunciadas no porto como código para a chegada de escravizados, já no período de proibição do tráfico.'],
    lopesmendes: ['Lopes Mendes', 'Ilha Grande, Rio de Janeiro', 'Só se chega a pé ou de barco', 'cerca de duas horas de trilha na mata', 'A areia é tão fina e compacta que quase não afunda o pé. Não há quiosque nem estrutura, porque a praia fica em área protegida.'],
    copacabana: ['Copacabana', 'Rio de Janeiro, Rio de Janeiro', 'A praia urbana mais famosa do país', 'cerca de 4 km de extensão', 'O calçadão de ondas pretas e brancas foi desenhado por Roberto Burle Marx em 1970, inspirado no padrão português do Rossio, em Lisboa.']
})

T('Brasil', '🏕️', 'parques', 'Parques nacionais do Brasil',
    'O país tem dezenas de parques nacionais, e cada um protege uma paisagem que não se repete.',
    ['Onde fica', 'Criado em', 'O que protege'], {
    itatiaia: ['Parque Nacional do Itatiaia', 'Rio de Janeiro e Minas Gerais', '1937', 'Mata Atlântica de altitude e campos rupestres', 'Foi o primeiro parque nacional do Brasil. A parte alta tem formações rochosas como as Agulhas Negras e chega a registrar geada.'],
    iguacu: ['Parque Nacional do Iguaçu', 'Paraná', '1939', 'Cataratas e floresta subtropical', 'É Patrimônio Natural da Humanidade e faz par com o parque argentino do outro lado do rio. Abriga onças-pintadas monitoradas por armadilhas fotográficas.'],
    lencois: ['Parque Nacional dos Lençóis Maranhenses', 'Maranhão', '1981', 'Campo de dunas com lagoas de água doce', 'As lagoas se formam porque há uma camada impermeável logo abaixo da areia, que segura a chuva em vez de deixá-la infiltrar.'],
    capivara: ['Parque Nacional Serra da Capivara', 'Piauí', '1979', 'Pinturas rupestres e caatinga', 'Guarda um dos maiores conjuntos de arte rupestre das Américas, com milhares de sítios e datações que reabrem o debate sobre a chegada do ser humano ao continente.'],
    tumucumaque: ['Parque Nacional Montanhas do Tumucumaque', 'Amapá e Pará', '2002', 'Floresta amazônica em serras baixas', 'É o maior parque nacional de floresta tropical do mundo, com cerca de 3,8 milhões de hectares, quase todo sem estrada e sem visitação.'],
    chapada: ['Parque Nacional da Chapada Diamantina', 'Bahia', '1985', 'Serras, grutas e cachoeiras no sertão', 'A região foi garimpo de diamantes no século XIX. Vilarejos que hoje vivem do turismo nasceram como acampamentos de garimpeiros.']
})

T('Brasil', '💦', 'cachoeiras', 'As cachoeiras brasileiras que impressionam',
    'O país tem quedas altíssimas fora do circuito turístico, e perdeu uma das maiores do mundo.',
    ['Onde fica', 'Altura', 'Detalhe'], {
    fumaca: ['Cachoeira da Fumaça', 'Chapada Diamantina, Bahia', 'cerca de 340 m', 'Uma das mais altas do Brasil', 'O nome vem do que acontece com a água: ela se desfaz em névoa no meio da queda e, com vento forte, chega a subir em vez de cair.'],
    tabuleiro: ['Cachoeira do Tabuleiro', 'Conceição do Mato Dentro, Minas Gerais', 'cerca de 273 m', 'A maior queda de Minas Gerais', 'Forma um poço enorme na base, cercado por paredões. Fica dentro de um monumento natural estadual e exige caminhada até o mirante.'],
    itiquira: ['Salto do Itiquira', 'Formosa, Goiás', 'cerca de 168 m', 'Uma das mais altas em queda livre acessíveis', 'Fica a poucas horas de Brasília e é uma das cachoeiras altas mais fáceis de visitar do país, com estrutura no próprio parque.'],
    caracol: ['Cascata do Caracol', 'Canela, Rio Grande do Sul', 'cerca de 131 m', 'A queda mais visitada do Sul', 'Uma escada de centenas de degraus desce até a base. O mirante em forma de torre foi construído para dar a visão frontal da queda.'],
    veudanoiva: ['Véu de Noiva', 'Chapada dos Guimarães, Mato Grosso', 'cerca de 86 m', 'Cartão-postal do cerrado', 'A água despenca de um paredão de arenito avermelhado que foi fundo de mar há milhões de anos, e há fósseis marinhos na região.'],
    setequedas: ['Sete Quedas de Guaíra', 'Paraná, no rio Paraná', 'conjunto submerso em 1982', 'Tinha a maior vazão do mundo', 'Era um conjunto de dezenove quedas que superava as Cataratas do Iguaçu em volume. Foi coberto pelo lago da usina de Itaipu e não existe mais.']
})

T('Brasil', '🏔️', 'montanhasbr', 'Os pontos mais altos do Brasil',
    'Os quatro picos mais altos do país ficam no extremo norte, na fronteira com a Venezuela.',
    ['Onde fica', 'Altitude', 'Detalhe'], {
    neblina: ['Pico da Neblina', 'Amazonas, na fronteira com a Venezuela', '2.995,3 m', 'O ponto mais alto do Brasil', 'Só foi reconhecido como o mais alto em 1965, porque fica quase sempre encoberto por nuvens. A expedição até ele leva dias de barco e trilha.'],
    trintaeum: ['Pico 31 de Março', 'Amazonas, na mesma serra', 'cerca de 2.973 m', 'O segundo mais alto', 'Fica a poucos quilômetros do Pico da Neblina, na mesma formação de rocha antiquíssima da Serra do Imeri.'],
    bandeira: ['Pico da Bandeira', 'Divisa de Minas Gerais e Espírito Santo', '2.892 m', 'O mais alto fora da Amazônia', 'Foi considerado o ponto culminante do país até a medição do Pico da Neblina. É o cume alto mais acessível: dá para subir em um dia.'],
    agulhasnegras: ['Pico das Agulhas Negras', 'Divisa de Minas Gerais e Rio de Janeiro', '2.791 m', 'O quinto mais alto do país', 'Fica no Parque Nacional do Itatiaia e é onde muita gente vê geada pela primeira vez. A subida final exige corda em alguns trechos.'],
    roraima: ['Monte Roraima', 'Roraima, na tríplice fronteira', '2.734 m no ponto mais alto', 'Um platô com paredões verticais', 'O topo é uma mesa de rocha compartilhada por Brasil, Venezuela e Guiana, com plantas que não existem em nenhum outro lugar.'],
    marins: ['Pedra do Baú e Marins', 'Serra da Mantiqueira, São Paulo', 'cerca de 2.420 m no Marins', 'A montanha mais escalada do Sudeste', 'A travessia entre os dois picos é um clássico do montanhismo brasileiro, com trechos expostos e mudança brusca de tempo.']
})

T('Brasil', '🌊', 'riosbr', 'Os rios brasileiros que moldaram o país',
    'O Brasil tem a maior rede de água doce do planeta, e cada grande rio conta uma história diferente.',
    ['Onde corre', 'Extensão', 'Por que importa'], {
    saofrancisco: ['Rio São Francisco', 'Cinco estados, de Minas à foz entre Alagoas e Sergipe', 'cerca de 2.863 km', 'O maior rio inteiramente brasileiro', 'Apelidado de rio da integração nacional por ligar o Sudeste ao Nordeste. Corre em plena caatinga e sustenta a agricultura irrigada do vale.'],
    negro: ['Rio Negro', 'Amazonas', 'cerca de 1.700 km', 'O maior rio de águas pretas do mundo', 'A cor vem de ácidos de folhas em decomposição. Onde ele encontra o Solimões, as águas correm lado a lado por quilômetros sem se misturar.'],
    madeira: ['Rio Madeira', 'Rondônia e Amazonas', 'cerca de 1.450 km em território brasileiro', 'O maior afluente do Amazonas', 'Carrega tanto sedimento dos Andes que a água fica cor de barro. Esse sedimento é o que torna as várzeas amazônicas férteis.'],
    tiete: ['Rio Tietê', 'São Paulo', 'cerca de 1.100 km', 'Corre para dentro do continente', 'Ao contrário de quase todos os rios do litoral, ele nasce perto do mar e corre para o interior. Foi por ele que as bandeiras entraram no sertão.'],
    araguaia: ['Rio Araguaia', 'Goiás, Mato Grosso, Tocantins e Pará', 'cerca de 2.100 km', 'Forma a maior ilha fluvial do mundo', 'A ilha do Bananal, cercada pelos dois braços do rio, tem cerca de 20 mil km², quase o tamanho de Sergipe.'],
    parana: ['Rio Paraná', 'Do centro-sul até a fronteira com o Paraguai', 'cerca de 4.880 km com o Paranaíba', 'Sustenta o maior parque hidrelétrico do país', 'Sua bacia gera a maior parte da energia hidrelétrica brasileira, incluindo Itaipu, que por décadas foi a maior usina do mundo em geração anual.']
})

T('Brasil', '🏝️', 'ilhasbr', 'Ilhas brasileiras',
    'De ilha fluvial do tamanho de um estado a rochedo no meio do Atlântico.',
    ['Onde fica', 'Área aproximada', 'O que tem de especial'], {
    marajo: ['Ilha de Marajó', 'Pará', 'cerca de 40 mil km²', 'Maior ilha fluviomarinha do mundo', 'Metade dela alaga na estação chuvosa. A cerâmica marajoara, feita por povos que viveram ali há mais de mil anos, é uma das mais elaboradas das Américas.'],
    noronha: ['Fernando de Noronha', 'Pernambuco', 'cerca de 26 km² no arquipélago', 'Topo de uma montanha vulcânica submersa', 'A visitação é limitada e há taxa diária de preservação ambiental. O arquipélago é Patrimônio Natural da Humanidade.'],
    ilhagrande: ['Ilha Grande', 'Rio de Janeiro', 'cerca de 193 km²', 'Abrigou um presídio de segurança máxima', 'O presídio foi demolido em 1994. O isolamento que servia à prisão acabou preservando a Mata Atlântica, hoje o maior atrativo da ilha.'],
    ilhabela: ['Ilhabela', 'São Paulo', 'cerca de 348 km²', 'O maior arquipélago marinho do país', 'Mais de 80% do território é parque estadual. A face voltada para o oceano só é acessível por trilha ou barco.'],
    trindade: ['Ilha da Trindade', 'Espírito Santo, a cerca de 1.140 km da costa', 'cerca de 10 km²', 'Posto avançado da Marinha no Atlântico', 'É área de desova da tartaruga-verde e só pode ser visitada com autorização militar. Garante ao Brasil uma vasta zona econômica no oceano.'],
    rocas: ['Atol das Rocas', 'Rio Grande do Norte', 'cerca de 7 km² de anel de recifes', 'Único atol do Atlântico Sul', 'Foi a primeira reserva biológica marinha do Brasil, criada em 1979, e o acesso é restrito a pesquisadores.']
})

T('Brasil', '🕯️', 'grutas', 'Cavernas e grutas do Brasil',
    'O país tem mais de vinte mil cavernas catalogadas, e boa parte nunca foi mapeada inteira.',
    ['Onde fica', 'O que a distingue', 'Detalhe'], {
    tocadaboavista: ['Toca da Boa Vista', 'Campo Formoso, Bahia', 'A maior caverna do hemisfério sul', 'mais de 100 km de galerias mapeadas', 'Fica em pleno sertão seco, e dentro dela foram achados fósseis de animais da megafauna, como preguiças gigantes e tigres-dentes-de-sabre.'],
    lagoazul: ['Gruta do Lago Azul', 'Bonito, Mato Grosso do Sul', 'Lago subterrâneo de azul intenso', 'profundidade ainda não totalmente medida', 'A cor vem da luz do sol que entra pela boca da gruta em determinado horário. Mergulhos já encontraram fósseis no fundo.'],
    janelao: ['Gruta do Janelão', 'Parque Nacional Cavernas do Peruaçu, Minas Gerais', 'Salões com aberturas gigantes no teto', 'vãos de mais de 100 m de altura', 'A luz que entra pelas clarabeiras naturais permite que cresça floresta dentro da caverna, com árvores de porte normal.'],
    santana: ['Caverna Santana', 'PETAR, São Paulo', 'A caverna mais visitada do país', 'cerca de 7 km de galerias', 'Fica no Vale do Ribeira, região com a maior concentração de cavernas do Brasil e um dos últimos grandes trechos contínuos de Mata Atlântica.'],
    anhumas: ['Abismo Anhumas', 'Bonito, Mato Grosso do Sul', 'Descida de rapel de 72 m até um lago', 'lago com cerca de 80 m de profundidade', 'É preciso treino de rapel antes de descer, e a subida é feita por ascensores. Cones de calcita gigantes emergem da água.'],
    maquine: ['Gruta de Maquiné', 'Cordisburgo, Minas Gerais', 'Primeira caverna turística do Brasil', 'aberta à visitação desde 1908', 'Foi estudada no século XIX pelo naturalista dinamarquês Peter Lund, que encontrou ali e na região fósseis humanos e da megafauna brasileira.']
})

T('Brasil', '🍲', 'comidanorte', 'Comidas típicas do Norte',
    'A cozinha do Norte é a mais distante do resto do país: usa ingredientes que só existem ali.',
    ['De onde é', 'O que leva', 'Detalhe'], {
    tacaca: ['Tacacá', 'Pará e Amazonas', 'Tucupi, goma de tapioca, jambu e camarão seco', 'Servido quente em cuia', 'O jambu anestesia levemente a boca, e essa sensação de formigamento faz parte da experiência, não é defeito.'],
    patonotucupi: ['Pato no tucupi', 'Pará', 'Pato cozido no caldo amarelo da mandioca brava', 'Prato central do Círio de Nazaré', 'O tucupi é venenoso cru e precisa ferver por horas para perder o ácido cianídrico. É um caso de veneno que a cozinha domesticou.'],
    maniçoba: ['Maniçoba', 'Pará', 'Folha de mandioca moída cozida por dias com carnes', 'Cozimento de até uma semana', 'A folha também é tóxica crua. O cozimento longo é obrigatório, e por isso o prato é chamado de feijoada paraense sem feijão.'],
    tambaqui: ['Tambaqui na brasa', 'Amazonas e Rondônia', 'Peixe de rio assado inteiro ou em costela', 'Peixe que come frutos e sementes', 'O tambaqui engorda na época da cheia comendo frutos que caem na água alagada, e a gordura desse período é o que dá sabor à costela.'],
    xnegro: ['Jambu e tucupi preto', 'Pará', 'Redução escura do tucupi com pimenta', 'Base de molhos regionais', 'O tucupi preto é o mesmo caldo reduzido por horas até escurecer e concentrar. Vira um tempero denso, usado como condimento.'],
    acaitigela: ['Açaí na tigela salgado', 'Pará e Amapá', 'Açaí puro, sem açúcar, com farinha e peixe frito', 'Acompanhamento de almoço', 'No Norte o açaí é comida de refeição, não sobremesa. A versão doce com granola e banana é uma invenção do Sudeste.']
})

T('Brasil', '🥥', 'comidanordeste', 'Comidas típicas do Nordeste',
    'O Nordeste tem duas cozinhas em uma: a do litoral, com dendê e coco, e a do sertão, de carne seca e milho.',
    ['De onde é', 'O que leva', 'Detalhe'], {
    acaraje: ['Acarajé', 'Bahia', 'Massa de feijão-fradinho frita no dendê, com vatapá e camarão', 'Comida de origem religiosa', 'É uma oferenda a Iansã no candomblé, e as baianas de acarajé têm o ofício reconhecido como patrimônio cultural brasileiro.'],
    moqueca: ['Moqueca', 'Bahia e Espírito Santo', 'Peixe cozido com tomate, pimentão e coentro', 'Duas escolas rivais', 'A baiana leva leite de coco e dendê e vai em panela de barro. A capixaba dispensa os dois e usa urucum. Discutir qual é a verdadeira é esporte local.'],
    baiaodedois: ['Baião de dois', 'Ceará e Piauí', 'Arroz e feijão-de-corda cozidos juntos com queijo coalho', 'Prato de aproveitamento', 'Nasceu de misturar o que sobrou do almoço em uma panela só, e virou prato principal com nome próprio.'],
    carnedesol: ['Carne de sol', 'Todo o sertão', 'Carne salgada e secada à sombra e ao vento', 'Não é carne seca nem charque', 'A carne de sol seca pouco e fica macia. O charque é muito mais salgado e desidratado. Confundir os três é o erro mais comum.'],
    bolodrolo: ['Bolo de rolo', 'Pernambuco', 'Massa finíssima enrolada com goiabada', 'Patrimônio cultural de Pernambuco', 'A massa precisa ficar quase transparente. Um bolo bem feito mostra dezenas de camadas na fatia, como anéis de tronco.'],
    cuscuz: ['Cuscuz nordestino', 'Todo o Nordeste', 'Flocos de milho hidratados e cozidos no vapor', 'Café da manhã de todo dia', 'É parente distante do cuscuz de sêmola do norte da África, mas feito de milho, ingrediente americano, em uma cuscuzeira própria.']
})

T('Brasil', '🐄', 'comidacentro', 'Comidas típicas do Centro-Oeste',
    'Cozinha de boiadeiro, de rio e de cerrado, com influência indígena e paraguaia.',
    ['De onde é', 'O que leva', 'Detalhe'], {
    pacu: ['Pacu assado', 'Mato Grosso do Sul', 'Peixe de rio recheado e assado', 'Peixe que come fruta', 'O pacu se alimenta de frutos que caem na água do Pantanal, e o sabor muda conforme a estação e o que está frutificando.'],
    arrozcarreteiro: ['Arroz carreteiro', 'Mato Grosso do Sul e Sul', 'Arroz refogado com carne seca desfiada', 'Comida de estrada de boiadeiro', 'Nasceu nos carreteiros que puxavam carga em carroça de boi e cozinhavam em uma panela só, com o que dava para carregar sem estragar.'],
    chipa: ['Chipa', 'Mato Grosso do Sul', 'Polvilho, queijo, ovo e banha', 'Herança paraguaia', 'É vendida quente em cestos nas ruas e nos ônibus de Campo Grande. O sabor muda bastante conforme o queijo usado.'],
    pequi: ['Frango com pequi', 'Goiás', 'Frango cozido com o fruto do cerrado', 'Fruto com espinhos por dentro', 'O caroço do pequi tem espinhos finíssimos sob a polpa. Come-se raspando com os dentes, nunca mordendo, sob risco de ferimentos na boca.'],
    empadao: ['Empadão goiano', 'Goiás', 'Massa recheada com frango, linguiça, queijo e guariroba', 'A guariroba é amarga de propósito', 'O amargor do palmito de guariroba equilibra a gordura do recheio. Sem ele, os goianos dizem que não é empadão de verdade.'],
    sopaparaguaia: ['Sopa paraguaia', 'Mato Grosso do Sul', 'Bolo salgado de fubá, queijo e cebola', 'Não é sopa', 'O nome é um mistério de fronteira. O prato é um bolo firme, cortado em pedaços, servido como acompanhamento de churrasco.']
})

T('Brasil', '☕', 'comidasudeste', 'Comidas típicas do Sudeste',
    'Comida de fazenda, de imigrante e de boteco convivem na mesma região.',
    ['De onde é', 'O que leva', 'Detalhe'], {
    feijoada: ['Feijoada', 'Rio de Janeiro e todo o país', 'Feijão-preto com carnes salgadas e defumadas', 'Prato nacional por adoção', 'A ideia de que nasceu da senzala com as sobras é contestada por historiadores: o cozido de feijão com carnes tem parentes europeus antigos.'],
    paodequeijo: ['Pão de queijo', 'Minas Gerais', 'Polvilho, queijo curado, ovo e leite', 'Só funciona com polvilho', 'A massa não tem glúten. O que faz o pãozinho crescer e ficar oco por dentro é o vapor da água presa na goma, não fermento.'],
    virado: ['Virado à paulista', 'São Paulo', 'Tutu de feijão, couve, bisteca, linguiça e banana frita', 'Prato de tropeiro', 'Era comida de quem viajava com tropas de mula: o feijão engrossado com farinha não azedava tão rápido quanto o caldo.'],
    torresmo: ['Torresmo de rolo', 'Minas Gerais', 'Barriga de porco enrolada e frita duas vezes', 'A fritura dupla é obrigatória', 'A primeira fritura cozinha a carne em temperatura baixa, e a segunda, bem quente, estoura a pele. Pular uma etapa dá borracha.'],
    moquecacapixaba: ['Moqueca capixaba', 'Espírito Santo', 'Peixe, tomate, cebola, coentro e urucum', 'Sem dendê e sem leite de coco', 'Vai em panela de barro feita à mão por paneleiras de Goiabeiras, um ofício reconhecido como patrimônio cultural brasileiro.'],
    queijominas: ['Queijo minas artesanal', 'Minas Gerais', 'Leite cru e pingo, o fermento natural da região', 'Cada região tem um sabor', 'O pingo é o soro do queijo do dia anterior, e carrega micro-organismos locais. Por isso o queijo do Serro é diferente do da Canastra.']
})

T('Brasil', '🧉', 'comidasul', 'Comidas típicas do Sul',
    'Fogo de chão, imigração europeia e o mate que atravessa a fronteira.',
    ['De onde é', 'O que leva', 'Detalhe'], {
    churrasco: ['Churrasco gaúcho', 'Rio Grande do Sul', 'Carne em espeto sobre brasa, com sal grosso', 'Fogo baixo e paciência', 'O corte nobre da tradição é a costela assada por horas em fogo de chão, não a picanha, que virou símbolo mais tarde e por marketing.'],
    chimarrao: ['Chimarrão', 'Rio Grande do Sul, Santa Catarina e Paraná', 'Erva-mate moída, cuia e bomba', 'Bebida de roda', 'A cuia passa de mão em mão e ninguém mexe na bomba: mexer é considerado falta grave à etiqueta da roda.'],
    barreado: ['Barreado', 'Litoral do Paraná', 'Carne cozida por horas em panela de barro selada', 'A panela é fechada com massa', 'O barro é vedado com uma pasta de farinha e água, e o cozimento dura de dez a vinte horas. Serve-se com farinha e banana.'],
    pinhao: ['Pinhão', 'Todo o Sul', 'Semente da araucária cozida na água e sal', 'Comida de inverno', 'A araucária leva décadas para produzir, e a coleta do pinhão tem regras de época para não prejudicar a regeneração da espécie ameaçada.'],
    cuca: ['Cuca', 'Santa Catarina e Rio Grande do Sul', 'Bolo com farofa doce por cima, de origem alemã', 'Herança da imigração', 'O nome vem do alemão kuchen, que quer dizer simplesmente bolo. A farofa crocante é a marca da versão brasileira.'],
    carreteirodosul: ['Galeto ao primeiro canto', 'Serra gaúcha', 'Frango jovem assado no espeto com tempero de vinho', 'Tradição da imigração italiana', 'O nome vem da idade da ave, abatida bem nova. É servido em rodízio junto de polenta, radicchio e massa caseira.']
})

T('Brasil', '🍮', 'doces', 'Doces brasileiros e de onde vieram',
    'Quase todo doce clássico daqui tem gema, coco ou leite condensado, e uma história de origem discutida.',
    ['De onde é', 'O que leva', 'Origem do nome'], {
    brigadeiro: ['Brigadeiro', 'Sudeste, anos 1940', 'Leite condensado, chocolate em pó e manteiga', 'Homenagem a um candidato a presidente', 'Surgiu na campanha do brigadeiro Eduardo Gomes, em 1945 e 1946. Ele perdeu a eleição e ganhou o doce mais popular do país.'],
    quindim: ['Quindim', 'Nordeste, origem colonial', 'Gema de ovo, açúcar e coco ralado', 'Do quimbundo kidimu, quitute', 'Nasceu da união entre a doçaria portuguesa de gemas e o coco africano. O truque do brilho é não mexer a mistura para não incorporar ar.'],
    pedemoleque: ['Pé de moleque', 'Sudeste e Nordeste', 'Amendoim e rapadura ou açúcar mascavo', 'Discutida até hoje', 'Uma das explicações mais citadas liga o nome ao calçamento irregular de pedras, parecido com a superfície do doce.'],
    romeujulieta: ['Romeu e Julieta', 'Minas Gerais', 'Goiabada com queijo minas', 'Do par de amantes de Shakespeare', 'O nome popular veio da ideia de dois que não se separam. A goiabada cascão com queijo curado é a versão que os mineiros defendem.'],
    docedeleite: ['Doce de leite', 'Sul e Sudeste, também no Prata', 'Leite e açúcar cozidos por horas', 'Provável acidente de cozinha', 'Argentina e Brasil disputam a invenção. A versão mais contada é a de um leite adoçado esquecido no fogo até caramelizar.'],
    cocada: ['Cocada', 'Nordeste', 'Coco ralado e açúcar, branca ou queimada', 'Direto do nome do coco', 'É vendida em tabuleiro nas praias desde o período colonial e muda de textura conforme o ponto do açúcar, de mole a puxa.']
})

T('Brasil', '🥤', 'bebidas', 'Bebidas que nasceram no Brasil',
    'A primeira bebida destilada das Américas saiu de um engenho brasileiro, antes do rum.',
    ['De onde é', 'Do que é feita', 'Detalhe'], {
    cachaca: ['Cachaça', 'Todo o país, desde o século XVI', 'Destilado do caldo de cana fermentado', 'A primeira destilada das Américas', 'É diferente do rum, que em geral vem do melaço, não do caldo. Por lei, cachaça só pode ser chamada assim se for produzida no Brasil.'],
    caipirinha: ['Caipirinha', 'São Paulo, provável origem no interior', 'Cachaça, limão, açúcar e gelo', 'Nasceu como remédio caseiro', 'A versão mais contada diz que era um preparo contra gripe, com alho e mel, que foi perdendo os ingredientes e ganhando gelo.'],
    guarana: ['Guaraná', 'Amazônia', 'Semente de um fruto da floresta', 'Tem mais cafeína que o café em pó', 'Os sateré-mawé domesticaram a planta e fazem o bastão de guaraná ralado em língua de peixe. O refrigerante industrial chegou em 1921.'],
    cajuina: ['Cajuína', 'Piauí e Ceará', 'Suco de caju clarificado, sem álcool e sem gás', 'Patrimônio cultural brasileiro', 'A clarificação usa cola de mandioca para precipitar as impurezas, e depois o líquido é cozido, o que dá a cor de âmbar.'],
    terere: ['Tereré', 'Mato Grosso do Sul', 'Erva-mate com água gelada', 'Patrimônio cultural brasileiro', 'Veio da tradição guarani e é bebido no calor, ao contrário do chimarrão. A roda de tereré é também um encontro social marcado.'],
    cafe: ['Café brasileiro', 'Sudeste e Sul', 'Grãos torrados de arábica e conilon', 'O país é o maior produtor do mundo', 'A muda inicial entrou pelo Pará em 1727, contrabandeada da Guiana Francesa. Em um século o café virou a espinha dorsal da economia do país.']
})

T('Brasil', '🎉', 'festas', 'As grandes festas populares do Brasil',
    'Fora o carnaval, o país tem festas que movem milhões de pessoas e quase ninguém de fora conhece.',
    ['Onde acontece', 'Quando', 'Tamanho'], {
    cirio: ['Círio de Nazaré', 'Belém, Pará', 'Segundo domingo de outubro', 'cerca de 2 milhões de pessoas', 'A corda que puxa a berlinda é disputada como promessa, e a procissão leva horas para andar poucos quilômetros. É Patrimônio Cultural Imaterial.'],
    parintins: ['Festival de Parintins', 'Parintins, Amazonas', 'Fim de junho', 'estádio para cerca de 35 mil pessoas', 'Os bois Garantido e Caprichoso disputam em um bumbódromo redondo. Metade da cidade veste vermelho e a outra metade, azul, o ano inteiro.'],
    bumbameuboi: ['Bumba meu boi', 'Maranhão', 'Junho e julho', 'dezenas de grupos em São Luís', 'Cada sotaque de boi tem instrumento e ritmo próprios, de matraca a zabumba. A brincadeira é Patrimônio Cultural Imaterial da Humanidade.'],
    iemanja: ['Festa de Iemanjá', 'Salvador, Bahia', '2 de fevereiro', 'centenas de milhares de pessoas', 'Os pescadores do Rio Vermelho levam presentes ao mar em barcos. É festa religiosa e popular ao mesmo tempo, com blocos tocando na rua.'],
    oktoberfest: ['Oktoberfest de Blumenau', 'Blumenau, Santa Catarina', 'Outubro', 'uma das maiores festas alemãs fora da Alemanha', 'Nasceu em 1984 como resposta a uma enchente devastadora: a cidade precisava de um motivo para as pessoas voltarem a se reunir.'],
    cavalhadas: ['Cavalhadas', 'Pirenópolis, Goiás', 'Domingo de Pentecostes', 'três dias de encenação a cavalo', 'Encena a batalha entre cristãos e mouros com cavaleiros mascarados. A tradição chegou de Portugal e se mantém há mais de 200 anos.']
})

T('Brasil', '🎭', 'carnaval', 'O carnaval de cada canto do Brasil',
    'Não existe um carnaval brasileiro: existem pelo menos cinco, com músicas e regras diferentes.',
    ['Onde', 'Como é', 'Marco'], {
    rio: ['Rio de Janeiro', 'Rio de Janeiro', 'Desfile de escolas de samba em sambódromo', 'Sambódromo inaugurado em 1984', 'O projeto é de Oscar Niemeyer e foi erguido em pouco mais de três meses. Antes disso as escolas desfilavam em avenidas com arquibancadas provisórias.'],
    salvador: ['Salvador', 'Bahia', 'Trios elétricos e blocos em circuitos', 'Trio elétrico criado em 1950', 'Dodô e Osmar montaram guitarras eletrificadas sobre um Ford 1929 e saíram tocando pela rua. O carro ficou conhecido como Fobica.'],
    recifeolinda: ['Recife e Olinda', 'Pernambuco', 'Frevo, maracatu e blocos de rua', 'Galo da Madrugada, maior bloco do mundo', 'O Galo entrou para o livro dos recordes pelo número de participantes. Em Olinda, os bonecos gigantes chegam a mais de três metros.'],
    ouropreto: ['Ouro Preto', 'Minas Gerais', 'Carnaval universitário em ladeiras de pedra', 'Repúblicas estudantis como anfitriãs', 'A cidade colonial vira palco de blocos que sobem e descem ladeiras íngremes, uma logística que nenhum outro carnaval enfrenta.'],
    saopaulo: ['São Paulo', 'São Paulo', 'Desfiles no Anhembi e blocos de rua enormes', 'Anhembi aberto em 1991', 'A cidade tem hoje um dos maiores carnavais de rua do país em número de blocos, fenômeno que explodiu a partir dos anos 2010.'],
    frevo: ['Frevo', 'Pernambuco', 'Música e dança com passos de capoeira', 'Patrimônio Imaterial da Humanidade desde 2012', 'A sombrinha colorida nasceu como arma disfarçada dos capoeiristas que abriam caminho para as bandas, e virou símbolo da dança.']
})

T('Brasil', '🔥', 'juninas', 'As festas juninas',
    'Junho no Brasil tem três santos, fogueira, milho e a maior festa de rua fora do carnaval.',
    ['Data ou lugar', 'O que marca', 'Detalhe'], {
    santoantonio: ['Santo Antônio', '13 de junho', 'O santo casamenteiro', 'Simpatias de casamento', 'É o primeiro dos três santos juninos. As simpatias envolvendo a imagem do santo virada de cabeça para baixo são tradição popular, não doutrina.'],
    saojoao: ['São João', '24 de junho', 'O auge da festa', 'Fogueira e quadrilha', 'A fogueira tem raiz em festas europeias de solstício. No hemisfério sul a data cai no inverno, e o fogo ganhou sentido prático de aquecer a roda.'],
    saopedro: ['São Pedro', '29 de junho', 'Padroeiro das chuvas e dos pescadores', 'Fecha o ciclo junino', 'Em regiões do interior, é a São Pedro que se pede chuva na medida certa, nem seca nem enchente, para a lavoura do ano seguinte.'],
    campinagrande: ['Campina Grande', 'Paraíba', 'Anunciada como o maior São João do mundo', 'trinta dias de festa', 'O Parque do Povo recebe shows todas as noites de junho, e a cidade mantém uma vila cenográfica que funciona como parque temático junino.'],
    caruaru: ['Caruaru', 'Pernambuco', 'Capital do forró', 'festa por todo o mês', 'A cidade também é reconhecida pelo artesanato em barro figurativo, tradição que ganhou o mundo pelas mãos de Mestre Vitalino.'],
    comidasjuninas: ['A mesa junina', 'Todo o país', 'Tudo gira em torno do milho', 'canjica, pamonha, curau e pipoca', 'Junho é a época da colheita do milho no Brasil, e a festa se organizou em volta do que estava maduro no campo naquele mês.']
})

T('Brasil', '🪁', 'brincadeiras', 'Brincadeiras tradicionais brasileiras',
    'Jogos de rua que atravessaram gerações sem manual, sem marca e sem pilha.',
    ['Como se joga', 'De onde veio', 'Detalhe'], {
    peteca: ['Peteca', 'Bate-se com a mão para não deixar cair', 'Origem indígena', 'Nome de origem tupi', 'A palavra vem do tupi e quer dizer bater. Virou esporte com regras oficiais e federação, disputado em quadra com rede.'],
    pipa: ['Pipa', 'Papel e varetas erguidos pelo vento na linha', 'Chegou da Ásia pela Europa', 'Também chamada de papagaio, arraia e pandorga', 'O nome muda de estado para estado, e a disputa de linha cortante levou várias cidades a proibir o cerol por acidentes graves.'],
    bolinhadegude: ['Bolinha de gude', 'Acertar as bolas do adversário com a sua', 'Brincadeira milenar, presente em vários povos', 'Já foi feita de argila e de caroço', 'Antes do vidro, usava-se argila cozida ou sementes. O nome gude aparece em registros brasileiros do século XIX.'],
    amarelinha: ['Amarelinha', 'Pular casas numeradas em um pé só', 'Versões europeias antigas', 'Do céu ao inferno', 'O desenho com céu e inferno nas pontas aparece em várias culturas e é apontado como herança de jogos medievais de percurso simbólico.'],
    cincomarias: ['Cinco Marias', 'Jogar e apanhar saquinhos com uma mão', 'Também chamado de jogo das pedrinhas', 'Presente em muitos países', 'É um dos jogos mais antigos que se conhece: há registros de versões com ossinhos de animais na Antiguidade.'],
    cabodeguerra: ['Cabo de guerra', 'Duas equipes puxam a mesma corda', 'Antiga prova de força coletiva', 'Já foi esporte olímpico', 'Fez parte do programa dos Jogos Olímpicos entre 1900 e 1920, com medalhas oficiais, antes de ser retirado.']
})

T('Brasil', '💃', 'dancas', 'Danças tradicionais do Brasil',
    'Cada região desenvolveu uma forma própria de dançar em roda, em fila ou em par.',
    ['De onde é', 'Como é', 'Detalhe'], {
    carimbo: ['Carimbó', 'Pará', 'Roda com saias rodadas e tambor de tronco', 'O tambor dá nome à dança', 'Carimbó vem do tupi e nomeia o tambor feito de tronco escavado, tocado com o músico sentado em cima dele.'],
    ciranda: ['Ciranda', 'Litoral de Pernambuco', 'Roda aberta em que qualquer um entra', 'Dançada na areia da praia', 'A roda não tem número fixo de participantes e cresce durante a apresentação. Quem chega entra no meio de duas pessoas e continua o passo.'],
    coco: ['Coco de roda', 'Nordeste litorâneo', 'Roda com palmas, sapateado e improviso cantado', 'Ligada ao trabalho coletivo', 'Nasceu do ritmo de bater o coco e de mutirões de trabalho, em que o canto marcava o compasso do esforço.'],
    jongo: ['Jongo', 'Vale do Paraíba, Sudeste', 'Roda com tambores e versos enigmáticos', 'Patrimônio Cultural Imaterial', 'Os versos, chamados pontos, usam linguagem cifrada que vem do tempo da escravidão, quando a mensagem precisava passar despercebida.'],
    catira: ['Catira', 'Goiás, Minas e São Paulo', 'Fileiras batendo pés e mãos em sincronia', 'Acompanhada por viola caipira', 'O som da dança é feito pelo próprio corpo: as palmas e o sapateado funcionam como instrumento de percussão junto da viola.'],
    congada: ['Congada', 'Minas Gerais e Centro-Oeste', 'Cortejo com reis, rainhas e bastões', 'Coroação de reis congos', 'Encena a coroação de reis africanos e mistura devoção católica a Nossa Senhora do Rosário com tradições de reinos centro-africanos.']
})

T('Brasil', '🧶', 'artesanato', 'Artesanato brasileiro por região',
    'Técnicas que atravessaram séculos e hoje sustentam cidades inteiras.',
    ['Onde é feito', 'Do que é feito', 'Detalhe'], {
    marajoara: ['Cerâmica marajoara', 'Ilha de Marajó, Pará', 'Argila com grafismos geométricos', 'Herança de povos pré-coloniais', 'As peças originais têm mais de mil anos e impressionam pela complexidade. Os artesãos atuais recriam os padrões encontrados em sítios arqueológicos.'],
    renderenascenca: ['Renda renascença', 'Pernambuco e Paraíba', 'Fita de algodão unida por pontos de agulha', 'Chegou pela Europa e virou ofício local', 'O trabalho é feito sobre um desenho riscado em papel, e cada peça grande pode levar semanas de agulha de uma única rendeira.'],
    capim: ['Capim dourado', 'Jalapão, Tocantins', 'Haste dourada de uma planta do cerrado', 'Colheita permitida só a partir de setembro', 'A regra de colheita existe para a planta soltar as sementes antes. Quebrar a data é crime ambiental e ameaça o próprio ofício.'],
    barrovitalino: ['Figuras de barro', 'Caruaru, Pernambuco', 'Barro modelado à mão e pintado', 'Tradição iniciada por Mestre Vitalino', 'As peças retratam cenas do cotidiano sertanejo, como cortejos de casamento, bandas e retirantes, e viraram símbolo da arte popular brasileira.'],
    panelasbarro: ['Panelas de barro', 'Goiabeiras, Espírito Santo', 'Argila queimada e tingida com tanino de mangue', 'Ofício reconhecido como patrimônio', 'A cor preta vem de um banho de tanino aplicado com a peça ainda quente. É a panela obrigatória da moqueca capixaba.'],
    redes: ['Redes de dormir', 'Ceará e Rio Grande do Norte', 'Algodão tecido em tear manual', 'Herança indígena adotada por todo o país', 'Os europeus conheceram a rede nas Américas e a levaram para os navios, onde ela resolveu o problema de dormir em convés balançando.']
})

T('Brasil', '🗣️', 'girias', 'Gírias e palavras de cada estado',
    'O mesmo idioma muda de sentido a cada fronteira estadual, e algumas palavras não viajam.',
    ['Onde se usa', 'O que quer dizer', 'Como se usa'], {
    uai: ['Uai', 'Minas Gerais', 'Interjeição de espanto ou de obviedade', 'Uai, e não é que deu certo', 'Não tem tradução exata. Serve para surpresa, para confirmar o óbvio e para preencher pausa, tudo com a mesma palavra.'],
    trem: ['Trem', 'Minas Gerais', 'Qualquer coisa, objeto ou situação', 'Passa esse trem aí pra mim', 'Substitui praticamente qualquer substantivo. Um mineiro pode conversar minutos usando trem sem que ninguém se perca.'],
    bah: ['Bah', 'Rio Grande do Sul', 'Interjeição de espanto, bom ou ruim', 'Bah, que jogo daquele', 'Acompanha tri, que funciona como intensificador: tri legal, tri difícil. A dupla resume metade das conversas gaúchas.'],
    oxente: ['Oxente', 'Bahia e Pernambuco', 'Espanto ou estranhamento', 'Oxente, e agora', 'A forma reduzida oxe é ainda mais comum na Bahia. Tem parentesco com a interjeição portuguesa arcaica ó gente.'],
    egua: ['Égua', 'Pará e Amazonas', 'Espanto, admiração ou reclamação', 'Égua, maninho, que calor', 'Quase sempre vem acompanhada de maninho ou maninha, que servem de vocativo geral, para amigo, desconhecido ou irmão de verdade.'],
    mermao: ['Mermão', 'Rio de Janeiro', 'Contração de meu irmão, usada como vocativo', 'Mermão, pega leve', 'Faz par com caraca e sinistro no repertório carioca. Sinistro pode ser elogio ou crítica, dependendo inteiramente do tom.']
})

T('Brasil', '👂', 'sotaques', 'Os sotaques do português brasileiro',
    'Sotaque não é erro: cada um é resultado de quem colonizou, de quem migrou e de quem ficou.',
    ['Onde', 'Marca sonora', 'De onde veio'], {
    carioca: ['Carioca', 'Rio de Janeiro', 'O S chiado no fim da sílaba', 'Influência da corte portuguesa', 'O chiado se firmou depois de 1808, com a chegada da família real e de milhares de portugueses de Lisboa, onde o som já existia.'],
    caipira: ['Caipira', 'Interior de São Paulo, Minas, Goiás e Paraná', 'O R retroflexo, curvado para trás', 'Contato com a língua geral e o tupi', 'É o chamado R caipira, produzido com a ponta da língua virada. Aparece em porta e em carta, nunca no começo da palavra.'],
    gaucho: ['Gaúcho', 'Rio Grande do Sul', 'Uso de tu com verbo conjugado', 'Contato com o espanhol platino', 'A frase tu foste, com verbo correto, sobrevive no Sul enquanto o resto do país usa tu foi ou você foi.'],
    nordestino: ['Nordestino', 'Vários estados do Nordeste', 'Vogais bem abertas antes de consoante', 'Conservação de traços do português antigo', 'A pronúncia de pÉrto e sÉte com vogal aberta é considerada mais próxima do português falado no período colonial que a do Sudeste.'],
    mineiro: ['Mineiro da capital', 'Região de Belo Horizonte', 'Corta o fim das palavras', 'Economia de sílabas', 'Belo Horizonte vira Belzonte, pode ser vira pó sê. A fala encurta tanto que virou piada entre os próprios mineiros.'],
    paraense: ['Paraense', 'Pará e Amazonas', 'Chiado forte e ritmo cantado', 'Contato com línguas indígenas e com o Caribe', 'O chiado lembra o carioca, mas o ritmo e a entonação são muito diferentes, com influência da nheengatu, a língua geral amazônica.']
})

T('Brasil', '🌿', 'tupi', 'Palavras do dia a dia que vêm do tupi',
    'O português brasileiro está cheio de tupi, e quase ninguém percebe ao usar.',
    ['Significado original', 'O que virou', 'Detalhe'], {
    abacaxi: ['Abacaxi', 'ibá cati, fruto que cheira forte', 'Nome da fruta', 'A fruta é americana', 'Em Portugal a mesma fruta é ananás, que também é palavra indígena, do tupi-guarani naná. As duas convivem no Brasil.'],
    pipoca: ['Pipoca', 'pi poca, pele que estoura', 'Nome do milho estourado', 'Descrição literal do fenômeno', 'A palavra descreve exatamente o que acontece: a casca arrebenta com a pressão do vapor preso dentro do grão.'],
    jacare: ['Jacaré', 'iacaré, o que olha de lado', 'Nome do réptil', 'Observação de comportamento', 'O nome nasceu da forma como o animal fica parado na água, com os olhos de fora, acompanhando o movimento sem virar o corpo.'],
    mingau: ['Mingau', 'minga u, comida grudenta', 'Nome do preparo', 'Entrou na cozinha de todo o país', 'A palavra descreve a textura. É um dos muitos termos de cozinha que o português brasileiro tomou emprestado das línguas indígenas.'],
    capim: ['Capim', 'caa pii, folha fina', 'Nome genérico da erva rasteira', 'Compõe muitos outros nomes', 'A raiz caa, que quer dizer mato ou folha, aparece em caatinga, mato branco, e em caapora, morador do mato.'],
    curitiba: ['Curitiba', 'kuri tyba, muito pinheiro', 'Nome da cidade', 'A toponímia brasileira é tupi', 'Milhares de topônimos vêm do tupi: Ipanema é água ruim, Paraná é rio grande como o mar, e Itaipu é a pedra que soa.']
})

T('Brasil', '🥁', 'africanas', 'Palavras de origem africana no português',
    'Boa parte do vocabulário afetivo do brasileiro veio de línguas banto, sobretudo do quimbundo.',
    ['Língua de origem', 'Sentido original', 'Detalhe'], {
    cacula: ['Caçula', 'Quimbundo', 'kasule, o menor ou o último', 'Substituiu a palavra portuguesa benjamim', 'É tão integrada ao português brasileiro que quase ninguém a reconhece como empréstimo. Em Portugal o termo é pouco usado.'],
    cafune: ['Cafuné', 'Quimbundo', 'Estalar as unhas na cabeça de alguém', 'Não tem tradução exata em outras línguas', 'A palavra descreve um gesto específico de carinho, e é citada com frequência em listas de termos intraduzíveis do mundo.'],
    moleque: ['Moleque', 'Quimbundo', 'muleke, menino', 'Mudou de sentido no Brasil', 'Começou significando apenas garoto e ganhou camadas de sentido ao longo do tempo, algumas afetuosas, outras depreciativas.'],
    quitanda: ['Quitanda', 'Quimbundo', 'kitanda, mercado ou feira', 'Nomeia hoje a venda de verduras', 'As quitandeiras que vendiam nas ruas do Brasil colonial deram o nome ao ponto de venda, e em Minas o termo passou a designar também os quitutes.'],
    fuba: ['Fubá', 'Quimbundo', 'fuba, farinha', 'Nome da farinha de milho', 'O produto é americano e o nome é africano: um resumo de como a cozinha brasileira se formou pela troca entre três continentes.'],
    marimbondo: ['Marimbondo', 'Quimbundo', 'Nome de inseto que ferroa', 'Convive com vespa e maribondo', 'É a palavra mais usada em boa parte do país, enquanto vespa, de origem latina, ficou restrita a contextos mais formais e científicos.']
})

T('Brasil', '🇧🇷', 'simbolos', 'Os símbolos nacionais do Brasil',
    'A lei reconhece quatro símbolos nacionais, e dois deles quase ninguém sabe citar.',
    ['O que é', 'Desde quando', 'Detalhe'], {
    bandeira: ['Bandeira Nacional', 'Símbolo oficial', '19 de novembro de 1889', 'Adotada quatro dias após a Proclamação', 'A data virou o Dia da Bandeira. A lei detalha até a proporção exata de cada elemento e as ocasiões em que ela deve ser hasteada.'],
    hino: ['Hino Nacional', 'Símbolo oficial', 'música de 1831, letra oficializada em 1922', 'A música é mais velha que a letra', 'Francisco Manuel da Silva compôs a melodia para celebrar a abdicação de dom Pedro I. A letra de Joaquim Osório Duque-Estrada veio quase oitenta anos depois.'],
    armas: ['Armas Nacionais', 'Símbolo oficial', '19 de novembro de 1889', 'O brasão que aparece em documentos', 'Traz uma espada, ramos de café e de fumo, e uma estrela de cinco pontas. É o símbolo usado em cédulas, passaportes e sedes de governo.'],
    selo: ['Selo Nacional', 'Símbolo oficial', '19 de novembro de 1889', 'O menos conhecido dos quatro', 'É um círculo com a esfera celeste da bandeira e a inscrição República Federativa do Brasil. Serve para autenticar atos oficiais e diplomas.'],
    sabia: ['Sabiá-laranjeira', 'Ave símbolo nacional', 'Decreto de 1999', 'Não é símbolo nacional pela lei de 1971', 'Foi escolhido por decreto separado, em parte pela presença dele na poesia brasileira, do Canção do Exílio em diante.'],
    paubrasil: ['Pau-brasil', 'Árvore nacional', 'Lei de 1978', 'Deu nome ao país', 'A árvore que batizou o Brasil quase foi extinta pela exploração do corante vermelho de sua madeira, e hoje é espécie ameaçada.']
})

T('Brasil', '🎼', 'hino', 'O Hino Nacional, verso por verso',
    'A letra é difícil de propósito: usa ordem invertida e palavras que saíram de uso.',
    ['Trecho', 'O que quer dizer', 'Detalhe'], {
    ipiranga: ['Ouviram do Ipiranga as margens plácidas', 'Primeiro verso', 'As margens calmas do riacho Ipiranga ouviram', 'A ordem das palavras está invertida', 'Quem ouviu foram as margens, não o povo. A inversão é o primeiro tropeço de quem tenta entender a letra sem reorganizar a frase.'],
    brado: ['De um povo heroico o brado retumbante', 'Segundo verso', 'O grito forte de um povo corajoso', 'Retumbante quer dizer que ecoa', 'Ligado ao verso anterior, forma uma frase só: as margens ouviram o grito do povo. É a cena do grito da independência, em 1822.'],
    fulgidos: ['E o sol da liberdade em raios fúlgidos', 'Terceiro verso', 'O sol da liberdade em raios brilhantes', 'Fúlgido vem do latim fulgere, brilhar', 'A mesma raiz aparece em refulgir e em fulgor. É uma palavra que hoje só sobrevive na poesia e neste hino.'],
    colosso: ['Deitado eternamente em berço esplêndido', 'Da segunda parte', 'Descreve o país como um gigante deitado', 'Ligado ao gigante pela própria natureza', 'A imagem é do Brasil como um colosso repousando em um berço magnífico, isto é, a própria geografia do território.'],
    clava: ['Verás que um filho teu não foge à luta', 'Da segunda parte', 'Um filho da pátria não recua do combate', 'Precedido de clava forte em outro trecho', 'Clava é uma borduna, um porrete de guerra. A imagem é a de um país que empunha a arma apenas para se defender.'],
    duasestrofes: ['As duas partes', 'Estrutura do hino', 'O hino oficial tem duas estrofes completas', 'Quase sempre se canta só a primeira', 'A lei manda executar as duas em solenidades oficiais. Em eventos esportivos e escolares, o costume consagrou apenas a primeira.']
})

T('Brasil', '🟩', 'bandeirabr', 'A bandeira do Brasil, elemento por elemento',
    'Cada pedaço da bandeira tem um significado documentado, e alguns são diferentes do que se aprende na escola.',
    ['Elemento', 'O que representa', 'Detalhe'], {
    verde: ['Campo verde', 'Cor de fundo', 'Herdada da Casa de Bragança', 'Não é a floresta, segundo a origem heráldica', 'A leitura de que verde é a mata e amarelo é o ouro é popular e posterior. As cores vieram das casas reais de dom Pedro I e da imperatriz Leopoldina.'],
    amarelo: ['Losango amarelo', 'Forma central', 'Herdado da Casa de Habsburgo-Lorena', 'Vem da família da imperatriz Leopoldina', 'O losango já estava na bandeira imperial, com as armas do Império no centro. A República trocou o brasão pela esfera celeste.'],
    esfera: ['Círculo azul estrelado', 'Céu do Rio de Janeiro', 'Manhã de 15 de novembro de 1889', 'Visto de fora da esfera celeste', 'Por isso o céu aparece espelhado em relação a quem olha do chão, detalhe que gera confusão até entre astrônomos desavisados.'],
    estrelas: ['As 27 estrelas', 'Estados e Distrito Federal', 'Uma para cada unidade federativa', 'Foram acrescentadas ao longo do tempo', 'Começaram em 21 e chegaram a 27 em 1992, com a criação de novos estados. Cada estrela tem um tamanho conforme o brilho real do astro.'],
    spica: ['A estrela acima da faixa', 'Spica, da constelação de Virgem', 'Representa o Pará', 'A única acima da faixa branca', 'Ela fica acima da linha porque, no céu real daquela manhã, estava acima do horizonte ali representado. Simboliza o estado ao norte do Equador.'],
    lema: ['Ordem e Progresso', 'Lema na faixa', 'Resumo de uma frase positivista', 'Do pensamento de Auguste Comte', 'A frase original é mais longa e começa com o amor por princípio. A parte cortada é justamente a que falava de amor.']
})

T('Brasil', '📅', 'feriados', 'Os feriados nacionais e a origem de cada um',
    'Nem tudo que a empresa emenda é feriado nacional: alguns são apenas ponto facultativo.',
    ['Data', 'O que marca', 'Detalhe'], {
    confraternizacao: ['Confraternização Universal', '1º de janeiro', 'Dia mundial da paz na tradição católica', 'É feriado nacional por lei', 'Coincide com o primeiro dia do calendário gregoriano, mas o nome oficial no Brasil não se refere ao ano-novo, e sim à confraternização entre os povos.'],
    tiradentes: ['Tiradentes', '21 de abril', 'Execução de Joaquim José da Silva Xavier em 1792', 'Feriado desde a Primeira República', 'A data foi escolhida pela República para criar um herói civil anterior à monarquia, em contraposição às efemérides imperiais.'],
    trabalho: ['Dia do Trabalho', '1º de maio', 'Greve de Chicago em 1886', 'Feriado no Brasil desde 1925', 'Getúlio Vargas transformou a data em vitrine de anúncios trabalhistas, o que consolidou o 1º de maio como evento oficial e não de protesto.'],
    independencia: ['Independência', '7 de setembro', 'Rompimento com Portugal em 1822', 'Feriado nacional', 'A data marca o grito às margens do Ipiranga, mas o reconhecimento internacional só veio anos depois, com Portugal cedendo em 1825 mediante indenização.'],
    consciencianegra: ['Dia da Consciência Negra', '20 de novembro', 'Morte de Zumbi dos Palmares em 1695', 'Feriado nacional desde 2023', 'Antes disso já era feriado em centenas de municípios e em alguns estados. A lei federal que o tornou nacional é de dezembro de 2023.'],
    carnaval: ['Carnaval', 'Data móvel', 'Período anterior à Quaresma', 'Não é feriado nacional por lei', 'É ponto facultativo para o funcionalismo federal. Muitos municípios e estados o decretam feriado local, o que gera a confusão.']
})

T('Brasil', '⛪', 'cidadeshistoricas', 'As cidades históricas brasileiras',
    'Conjuntos coloniais preservados porque a riqueza acabou e ninguém teve dinheiro para demolir.',
    ['Onde fica', 'O que preserva', 'Detalhe'], {
    ouropreto: ['Ouro Preto', 'Minas Gerais', 'Barroco mineiro em igrejas e casario', 'Primeiro sítio brasileiro na lista da Unesco, em 1980', 'Chegou a ser uma das maiores cidades das Américas no auge do ouro, e depois estagnou por dois séculos, o que salvou o conjunto arquitetônico.'],
    paraty: ['Paraty', 'Rio de Janeiro', 'Centro colonial com ruas de pedra irregular', 'Patrimônio Mundial desde 2019', 'As ruas do centro alagam nas marés de lua cheia por projeto: a água entra, lava o calçamento e sai, um sistema de limpeza colonial.'],
    olinda: ['Olinda', 'Pernambuco', 'Igrejas barrocas em ladeiras com vista para o mar', 'Patrimônio Mundial desde 1982', 'Foi incendiada pelos holandeses em 1631 e reconstruída depois. O casario colorido atual é muito posterior ao traçado original.'],
    saoluis: ['São Luís', 'Maranhão', 'Casarões cobertos de azulejo português', 'Patrimônio Mundial desde 1997', 'Os azulejos não eram enfeite: protegiam a parede da umidade e do calor, funcionando como isolamento térmico em clima equatorial.'],
    diamantina: ['Diamantina', 'Minas Gerais', 'Conjunto urbano do ciclo do diamante', 'Patrimônio Mundial desde 1999', 'A Casa da Glória tem uma passarela coberta ligando dois casarões sobre a rua, imagem que virou cartão-postal da cidade.'],
    cidadedegoias: ['Cidade de Goiás', 'Goiás', 'Antiga capital do estado, casario do século XVIII', 'Patrimônio Mundial desde 2001', 'Perdeu o posto de capital para Goiânia em 1937 e, como Ouro Preto, manteve o conjunto justamente por ter saído do centro econômico.']
})

T('Brasil', '🏛️', 'patrimonios', 'Patrimônios da Humanidade no Brasil',
    'O país tem mais de vinte sítios reconhecidos pela Unesco, entre culturais e naturais.',
    ['Onde fica', 'Tipo', 'Desde'], {
    brasilia: ['Brasília', 'Distrito Federal', 'Cultural', '1987', 'É o único conjunto urbano construído no século XX a entrar na lista. O tombamento cobre o plano piloto inteiro, não apenas os prédios famosos.'],
    congonhas: ['Santuário do Bom Jesus de Matosinhos', 'Congonhas, Minas Gerais', 'Cultural', '1985', 'Os doze profetas em pedra-sabão foram esculpidos por Aleijadinho já com a saúde muito debilitada, com as ferramentas amarradas às mãos.'],
    saomiguel: ['Missões Jesuíticas Guaranis', 'Rio Grande do Sul', 'Cultural', '1983', 'As ruínas de São Miguel são o que restou de um sistema de reduções que chegou a abrigar dezenas de milhares de guaranis com organização própria.'],
    pantanal: ['Complexo de Conservação do Pantanal', 'Mato Grosso e Mato Grosso do Sul', 'Natural', '2000', 'Protege apenas uma fração do Pantanal, mas justamente a área onde as cheias e vazantes anuais acontecem da forma mais preservada.'],
    valongo: ['Cais do Valongo', 'Rio de Janeiro', 'Cultural', '2017', 'Foi o principal ponto de desembarque de africanos escravizados nas Américas. Ficou soterrado por mais de um século e reapareceu em obras de 2011.'],
    pampulha: ['Conjunto Moderno da Pampulha', 'Belo Horizonte, Minas Gerais', 'Cultural', '2016', 'A igreja projetada por Niemeyer ficou anos sem ser consagrada porque a Igreja a considerou imprópria para o culto pela forma das curvas.']
})

T('Brasil', '📐', 'arquiteturabr', 'Arquitetos que desenharam o Brasil',
    'O país exportou um jeito próprio de construir, com curva de concreto e planta livre.',
    ['Época', 'O que fez', 'Detalhe'], {
    aleijadinho: ['Aleijadinho', 'Século XVIII', 'Barroco mineiro em igrejas e esculturas', 'Antônio Francisco Lisboa', 'Perdeu progressivamente o uso das mãos por uma doença nunca identificada com certeza, e continuou esculpindo com ferramentas amarradas aos punhos.'],
    lucio: ['Lúcio Costa', 'Século XX', 'Plano piloto de Brasília', 'Venceu o concurso em 1957', 'Entregou o projeto com poucas pranchas desenhadas à mão e um memorial de texto, e mesmo assim ganhou de propostas muito mais detalhadas.'],
    niemeyer: ['Oscar Niemeyer', 'Século XX e XXI', 'Curvas de concreto armado em obras pelo mundo', 'Trabalhou até os cem anos', 'Dizia que se inspirava nas montanhas e nas curvas do corpo, não no ângulo reto. Assinou prédios em quatro continentes.'],
    linabo: ['Lina Bo Bardi', 'Século XX', 'MASP e SESC Pompeia, em São Paulo', 'Italiana naturalizada brasileira', 'O vão livre do MASP, de 74 metros, foi exigência de um antigo termo de doação do terreno, que proibia bloquear a vista da cidade.'],
    burlemarx: ['Roberto Burle Marx', 'Século XX', 'Paisagismo com plantas nativas brasileiras', 'Descobriu espécies novas para a ciência', 'Foi ver plantas brasileiras valorizadas em um jardim botânico alemão que o convenceu a usar a flora nativa em vez de canteiros europeus.'],
    mendesdarocha: ['Paulo Mendes da Rocha', 'Século XX e XXI', 'Concreto aparente e estruturas suspensas', 'Prêmio Pritzker em 2006', 'É o segundo brasileiro a receber o prêmio mais importante da arquitetura, depois de Oscar Niemeyer, laureado em 1988.']
})

T('Brasil', '🖼️', 'museusbr', 'Museus brasileiros que valem a fila',
    'De acervo científico do século XIX a museu ao ar livre do tamanho de um bairro.',
    ['Onde fica', 'O que guarda', 'Detalhe'], {
    museunacional: ['Museu Nacional', 'Rio de Janeiro', 'Acervo de história natural e arqueologia', 'Fundado em 1818', 'Era o museu mais antigo do Brasil e perdeu a maior parte do acervo em um incêndio em 2018. O crânio de Luzia, fóssil humano antiquíssimo, foi recuperado em fragmentos.'],
    masp: ['MASP', 'São Paulo', 'A mais relevante coleção de arte europeia do hemisfério sul', 'Prédio de 1968', 'Os quadros já foram expostos em cavaletes de vidro no meio do salão, sem parede, ideia de Lina Bo Bardi retomada décadas depois.'],
    inhotim: ['Inhotim', 'Brumadinho, Minas Gerais', 'Arte contemporânea em galerias espalhadas por um parque', 'Cerca de 140 hectares visitáveis', 'É ao mesmo tempo museu e jardim botânico, com uma das maiores coleções de palmeiras do mundo. Percorrer tudo leva mais de um dia.'],
    amanha: ['Museu do Amanhã', 'Rio de Janeiro', 'Ciência e futuro em exposição interativa', 'Aberto em 2015', 'O prédio, projetado por Santiago Calatrava, capta água da baía para climatização e tem placas solares móveis que acompanham o sol.'],
    ipiranga: ['Museu do Ipiranga', 'São Paulo', 'História do Brasil e o quadro Independência ou Morte', 'Reaberto em 2022', 'Ficou nove anos fechado para restauro. O prédio foi erguido no lugar onde a tradição situa o grito da independência.'],
    pinacoteca: ['Pinacoteca de São Paulo', 'São Paulo', 'Arte brasileira do século XIX em diante', 'Museu de arte mais antigo da cidade', 'O prédio de 1900 foi reformado por Paulo Mendes da Rocha, que deixou o tijolo aparente e cobriu os pátios com vidro.']
})

T('Brasil', '🎭', 'teatros', 'Os grandes teatros brasileiros',
    'Casas de ópera erguidas com dinheiro de café e de borracha, no meio da floresta ou da cidade.',
    ['Onde fica', 'Inaugurado em', 'Detalhe'], {
    amazonas: ['Teatro Amazonas', 'Manaus, Amazonas', '1896', 'Erguido no auge do ciclo da borracha', 'Material de construção veio da Europa de navio, e a rua em frente foi calçada com borracha para que as carruagens não fizessem barulho durante os espetáculos.'],
    municipalrio: ['Theatro Municipal do Rio', 'Rio de Janeiro', '1909', 'Inspirado na Ópera de Paris', 'A escadaria, os vitrais e o salão de espelhos seguem o modelo francês. Foi construído durante a reforma urbana que rasgou avenidas no centro do Rio.'],
    municipalsp: ['Theatro Municipal de São Paulo', 'São Paulo', '1911', 'Palco da Semana de Arte Moderna de 1922', 'A plateia vaiou e gritou durante as apresentações modernistas. O escândalo foi parte do plano dos organizadores, que queriam provocar reação.'],
    paz: ['Theatro da Paz', 'Belém, Pará', '1878', 'Uma das primeiras grandes casas de ópera do Norte', 'Foi erguido antes do Teatro Amazonas e também com dinheiro da borracha, no período em que Belém se via como capital cultural da Amazônia.'],
    josedealencar: ['Teatro José de Alencar', 'Fortaleza, Ceará', '1910', 'Estrutura de ferro fundido importada da Escócia', 'As peças de ferro chegaram numeradas e foram montadas como um quebra-cabeça. O jardim ao redor é assinado por Burle Marx.'],
    guaira: ['Teatro Guaíra', 'Curitiba, Paraná', '1974 na forma atual', 'Um dos maiores complexos teatrais do país', 'A sala principal passa de dois mil lugares, o que o coloca entre os maiores auditórios de teatro da América Latina.']
})

T('Brasil', '🌉', 'pontesbr', 'As pontes brasileiras que impressionam',
    'Travessias que resolveram problemas de geografia e viraram símbolo de cidade.',
    ['Onde fica', 'Extensão', 'O que tem de especial'], {
    rioniteroi: ['Ponte Rio-Niterói', 'Rio de Janeiro', 'cerca de 13,3 km', 'Vão central de 300 m sobre o canal de navegação', 'O trecho central é mais alto para deixar passar navios de grande porte. Foi por décadas o maior vão em viga reta de concreto protendido do mundo.'],
    estaiada: ['Ponte Octávio Frias de Oliveira', 'São Paulo', 'cerca de 1,6 km somando as pistas', 'Duas pistas curvas cruzando em X no mesmo mastro', 'É considerada a única ponte estaiada do mundo com esse arranjo. O mastro em forma de X tem 138 metros de altura.'],
    jk: ['Ponte Juscelino Kubitschek', 'Brasília, Distrito Federal', 'cerca de 1,2 km', 'Três arcos que cruzam o tabuleiro em diagonal', 'Ganhou um dos principais prêmios internacionais de engenharia de pontes em 2003. Os arcos se alternam de um lado e do outro da pista.'],
    hercilioluz: ['Ponte Hercílio Luz', 'Florianópolis, Santa Catarina', 'cerca de 820 m', 'Maior ponte pênsil em barras de olhal do mundo', 'Ficou interditada por mais de trinta anos e foi reaberta em 2019, depois de um restauro que trocou peça por peça da estrutura metálica.'],
    negro: ['Ponte sobre o rio Negro', 'Manaus, Amazonas', 'cerca de 3,6 km', 'A maior ponte sobre um rio da Amazônia', 'Ligou Manaus a Iranduba em 2011. O vão central precisou ser altíssimo porque o nível do rio varia mais de dez metros entre cheia e seca.'],
    newtonnavarro: ['Ponte Newton Navarro', 'Natal, Rio Grande do Norte', 'cerca de 1,8 km', 'Estaiada sobre o rio Potengi', 'É iluminada por um sistema que muda de cor e virou o principal cartão-postal noturno da cidade desde a inauguração, em 2007.']
})

T('Brasil', '🛤️', 'estradasbr', 'As grandes rodovias brasileiras',
    'O país escolheu o caminhão como espinha dorsal, e essas estradas são o esqueleto.',
    ['Trajeto', 'Extensão', 'O que tem de especial'], {
    br116: ['BR-116', 'De Fortaleza a Jaguarão, no Rio Grande do Sul', 'cerca de 4.500 km', 'A rodovia mais longa do país', 'Reúne trechos com nomes famosos, como a Régis Bittencourt e a Presidente Dutra, e corta treze estados de ponta a ponta.'],
    br101: ['BR-101', 'De Touros, no Rio Grande do Norte, a São José do Norte', 'cerca de 4.800 km projetados', 'A principal rodovia litorânea', 'Liga quase todas as capitais da costa. Boa parte do trecho nordestino e sul foi duplicada apenas nas últimas décadas.'],
    transamazonica: ['Transamazônica, a BR-230', 'Do Nordeste ao Acre, cortando a Amazônia', 'cerca de 4.000 km projetados', 'Nunca foi concluída como planejada', 'Foi anunciada em 1970 como obra de integração nacional. Grande parte segue sem pavimento e fica intrafegável na estação chuvosa.'],
    br319: ['BR-319', 'Manaus a Porto Velho', 'cerca de 880 km', 'A estrada que a floresta engoliu', 'Aberta nos anos 1970 e praticamente abandonada nos anos 1980, tem um trecho central sem asfalto que só é vencido por veículos preparados.'],
    imigrantes: ['Sistema Anchieta-Imigrantes', 'São Paulo ao litoral', 'cerca de 70 km', 'Vence a serra do Mar em túneis e viadutos', 'Mais da metade da pista nova é de túnel ou ponte, solução adotada para atravessar a mata sem cortar encostas instáveis.'],
    estradareal: ['Estrada Real', 'Minas Gerais, Rio de Janeiro e São Paulo', 'cerca de 1.630 km de caminhos', 'A rota do ouro no período colonial', 'Não é uma rodovia moderna, e sim um conjunto de caminhos históricos. Hoje é percorrida a pé, a cavalo e de bicicleta como roteiro cultural.']
})

T('Brasil', '🚂', 'trensbr', 'Ferrovias e trens brasileiros',
    'O país já teve uma malha ferroviária extensa de passageiros, e restaram poucos trechos.',
    ['Onde fica', 'O que tem de especial', 'Detalhe'], {
    madeiramamore: ['Estrada de Ferro Madeira-Mamoré', 'Rondônia', 'Apelidada de ferrovia do diabo', 'cerca de 366 km construídos', 'Milhares de trabalhadores morreram de malária e febre amarela na construção. Ficou pronta em 1912, quando o ciclo da borracha já estava em queda.'],
    vitoriaminas: ['Estrada de Ferro Vitória a Minas', 'Minas Gerais e Espírito Santo', 'Trem de passageiros mais longo em operação regular', 'cerca de 664 km', 'Faz a viagem diária em cerca de treze horas e atende dezenas de cidades pequenas que não têm outra ligação confiável.'],
    carajas: ['Estrada de Ferro Carajás', 'Pará e Maranhão', 'Um dos trens mais longos do mundo', 'composições de mais de 3 km', 'Leva minério de ferro de Carajás ao porto do Itaqui e também opera um trem de passageiros ao longo da mesma linha.'],
    serraverde: ['Serra Verde Express', 'Curitiba a Morretes, Paraná', 'Uma das ferrovias mais bonitas do mundo', 'cerca de 110 km', 'Desce a serra do Mar por pontes e túneis do século XIX. A ponte São João e o viaduto Carvalho são trechos suspensos sobre o vale.'],
    corcovado: ['Trem do Corcovado', 'Rio de Janeiro', 'A primeira ferrovia elétrica do Brasil', 'em operação desde 1884', 'Foi eletrificada em 1910. Sobe a montanha por cremalheira, sistema de engrenagem no centro dos trilhos que impede o trem de escorregar.'],
    mariafumaca: ['Maria Fumaça da Serra Gaúcha', 'Bento Gonçalves a Carlos Barbosa', 'Locomotiva a vapor em operação turística', 'cerca de 23 km', 'É um passeio com música e degustação de vinho, feito em trechos remanescentes da antiga linha que servia às colônias italianas.']
})

T('Brasil', '✈️', 'aeroportosbr', 'Os aeroportos brasileiros',
    'O país tem um dos maiores números de aeródromos do mundo, herança da distância entre suas cidades.',
    ['Onde fica', 'Em que se destaca', 'Detalhe'], {
    guarulhos: ['Guarulhos', 'São Paulo', 'O maior aeroporto do Brasil', 'mais de 40 milhões de passageiros por ano', 'Concentra a maior parte dos voos internacionais do país e funciona como porta de entrada da América do Sul para várias companhias.'],
    santosdumont: ['Santos Dumont', 'Rio de Janeiro', 'Pista construída sobre aterro na baía', 'operação restrita por regras de voo', 'A aproximação exige uma curva fechada sobre a cidade por causa dos morros. É um dos pousos mais exigentes do país para pilotos.'],
    brasilia: ['Presidente Juscelino Kubitschek', 'Brasília', 'O grande ponto de conexão do país', 'posição central no mapa', 'Por ficar no centro geográfico, virou o entroncamento natural das rotas domésticas, papel que a cidade foi projetada para ter.'],
    galeao: ['Galeão', 'Rio de Janeiro', 'O maior aeroporto do Rio em área', 'duas pistas independentes', 'Foi por décadas o principal portão internacional do Brasil, e seu terminal dos anos 1970 foi projetado para o auge do transporte aéreo intercontinental.'],
    confins: ['Confins', 'Belo Horizonte, Minas Gerais', 'Um dos poucos com espaço amplo para crescer', 'construído longe da cidade', 'Foi aberto em 1984 para substituir a Pampulha e enfrentou anos de baixa demanda justamente pela distância do centro.'],
    manaus: ['Eduardo Gomes', 'Manaus, Amazonas', 'Um dos maiores em carga aérea do país', 'ligado à Zona Franca', 'Boa parte dos componentes eletrônicos montados em Manaus chega e sai por via aérea, porque o transporte fluvial é lento demais para a indústria.']
})

T('Brasil', '⚓', 'portosbr', 'Os portos que movimentam o Brasil',
    'Cerca de nove em cada dez toneladas do comércio exterior brasileiro passam por um porto.',
    ['Onde fica', 'Em que se destaca', 'Detalhe'], {
    santos: ['Porto de Santos', 'São Paulo', 'O maior da América Latina', 'movimenta mais de 160 milhões de toneladas por ano', 'Nasceu para escoar o café do Oeste Paulista e hoje despacha de soja a contêiner. A ferrovia que descia a serra foi decisiva para seu crescimento.'],
    paranagua: ['Porto de Paranaguá', 'Paraná', 'Referência em grãos e fertilizantes', 'um dos maiores corredores de exportação agrícola', 'O canal de acesso precisa de dragagem constante porque a baía acumula sedimento, um custo permanente da operação.'],
    itaqui: ['Porto do Itaqui', 'São Luís, Maranhão', 'Águas naturalmente profundas', 'recebe navios de grande calado', 'A profundidade natural dispensa boa parte da dragagem e o coloca em vantagem para o minério que chega pela ferrovia de Carajás.'],
    tubarao: ['Porto de Tubarão', 'Vitória, Espírito Santo', 'Um dos maiores terminais de minério do mundo', 'embarque em larga escala', 'Foi projetado junto com a ferrovia Vitória a Minas para carregar navios gigantes em poucas horas, com esteiras e carregadores automáticos.'],
    riogrande: ['Porto do Rio Grande', 'Rio Grande do Sul', 'O porto mais ao sul do país', 'principal saída do Mercosul pelo Atlântico Sul', 'Serve também a Argentina e ao Uruguai em parte da carga, e concentra a indústria de fertilizantes do Sul.'],
    suape: ['Porto de Suape', 'Ipojuca, Pernambuco', 'Complexo industrial e portuário integrado', 'porto e indústria no mesmo território', 'Foi concebido não apenas como cais, mas como distrito industrial: refinaria, estaleiro e fábricas ficam dentro da própria área portuária.']
})

T('Brasil', '🚉', 'metrosbr', 'Os metrôs e trens urbanos do Brasil',
    'Só uma parte das capitais tem metrô, e a maioria das redes é curta para o tamanho das cidades.',
    ['Onde fica', 'Inaugurado em', 'Detalhe'], {
    saopaulo: ['Metrô de São Paulo', 'São Paulo', '1974', 'O primeiro metrô do Brasil', 'A linha 4 foi a primeira da América Latina a operar sem condutor, em 2010, com portas de plataforma que só abrem com o trem parado.'],
    rio: ['Metrô do Rio', 'Rio de Janeiro', '1979', 'Escavado sob uma cidade entre morros e mar', 'A linha 4, aberta em 2016, atravessa um maciço rochoso por um túnel de quilômetros para ligar a zona sul à Barra da Tijuca.'],
    recife: ['Metrô do Recife', 'Recife, Pernambuco', '1985', 'Rede em superfície reaproveitando ferrovias', 'Boa parte do traçado usa leitos de antigas ferrovias de carga, solução mais barata que abrir túnel em solo alagadiço.'],
    portoalegre: ['Trensurb', 'Porto Alegre, Rio Grande do Sul', '1985', 'Liga a capital a cidades vizinhas', 'É um trem metropolitano, não um metrô subterrâneo, e atende a região norte da Grande Porto Alegre até o aeroporto.'],
    brasilia: ['Metrô de Brasília', 'Distrito Federal', '2001', 'Atende sobretudo as cidades-satélites', 'Foi pensado para trazer trabalhadores das regiões administrativas ao Plano Piloto, o movimento pendular que define a cidade.'],
    salvador: ['Metrô de Salvador', 'Salvador, Bahia', '2014', 'Um dos mais recentes do país', 'A obra ficou parada por anos antes de ser retomada por concessão. Hoje tem uma das maiores taxas de ocupação por quilômetro do Brasil.']
})

T('Brasil', '⚽', 'classicos', 'Os clássicos do futebol brasileiro',
    'Cada clássico nasceu de uma rivalidade que é de bairro, de classe ou de origem dos torcedores.',
    ['Quem joga', 'Desde', 'Origem da rivalidade'], {
    grenal: ['Gre-Nal', 'Grêmio e Internacional, Porto Alegre', '1909', 'Clube de imigrantes alemães contra clube que aceitava todos', 'É apontado como o clássico mais disputado do mundo em número de partidas, com mais de quatrocentos confrontos oficiais.'],
    flaflu: ['Fla-Flu', 'Flamengo e Fluminense, Rio de Janeiro', '1912', 'Uma dissidência de jogadores do Fluminense fundou o futebol do Flamengo', 'Nelson Rodrigues escreveu que o Fla-Flu começou quarenta minutos antes do nada, frase que virou a definição eterna do duelo.'],
    bavi: ['Ba-Vi', 'Bahia e Vitória, Salvador', '1905 entre clubes antecessores', 'Rivalidade de bairros da capital baiana', 'É citado como um dos clássicos mais antigos do país, com registros de confrontos entre clubes predecessores ainda no início do século XX.'],
    derby: ['Derby Paulista', 'Corinthians e Palmeiras, São Paulo', '1917', 'Clube do operariado contra clube da colônia italiana', 'O Palmeiras nasceu como Palestra Italia e precisou mudar de nome em 1942, quando o Brasil entrou na guerra contra a Itália.'],
    majestoso: ['Majestoso', 'Corinthians e São Paulo, São Paulo', '1930', 'Torcida popular contra clube de origem mais abastada', 'O nome veio da imprensa esportiva dos anos 1930, que classificava os clássicos por apelidos, e este foi o que pegou de vez.'],
    classicorei: ['Clássico Rei', 'Ceará e Fortaleza, Fortaleza', '1918', 'Disputa pela hegemonia na capital cearense', 'É o jogo que mais leva público ao estádio no Nordeste em vários anos, com médias que superam clássicos de capitais bem maiores.']
})

T('Brasil', '🏟️', 'estadiosbr', 'Os estádios brasileiros',
    'Depois de 1950, a regra virou cadeira numerada, e a capacidade dos gigantes caiu pela metade.',
    ['Onde fica', 'Capacidade', 'Detalhe'], {
    morumbi: ['Morumbi', 'São Paulo', 'cerca de 66 mil lugares', 'O maior estádio privado do Brasil', 'Levou dezessete anos para ficar pronto e foi financiado em boa parte por campanhas entre torcedores, incluindo venda de cadeiras cativas.'],
    mineirao: ['Mineirão', 'Belo Horizonte, Minas Gerais', 'cerca de 62 mil lugares', 'Reformado mantendo a fachada tombada', 'A reforma para a Copa de 2014 rebaixou o gramado em quase quatro metros para caber mais assentos sem mexer na estrutura protegida.'],
    beirario: ['Beira-Rio', 'Porto Alegre, Rio Grande do Sul', 'cerca de 50 mil lugares', 'Construído sobre aterro no Guaíba', 'Os torcedores levaram material de construção de casa durante a obra, campanha que ficou conhecida como a corrente do Beira-Rio.'],
    neoquimica: ['Arena Corinthians', 'São Paulo', 'cerca de 49 mil lugares', 'Sediou a abertura da Copa de 2014', 'Tem um dos maiores painéis de LED em fachada de estádio do mundo, com dezenas de metros de largura sobre a entrada principal.'],
    castelao: ['Castelão', 'Fortaleza, Ceará', 'cerca de 63 mil lugares', 'O primeiro estádio pronto para a Copa de 2014', 'Foi entregue com mais de um ano de antecedência, caso raro entre as sedes, e é usado por Ceará e Fortaleza como mando compartilhado.'],
    pacaembu: ['Pacaembu', 'São Paulo', 'cerca de 40 mil lugares', 'Estádio art déco tombado', 'Inaugurado em 1940, é cercado por um conjunto urbano protegido. Qualquer reforma precisa passar por órgãos de patrimônio histórico.']
})

T('Brasil', '🌳', 'parquesurbanos', 'Parques urbanos brasileiros',
    'Grandes cidades brasileiras têm parques que nasceram de aterro, de fazenda ou de pedreira desativada.',
    ['Onde fica', 'Tamanho', 'Detalhe'], {
    ibirapuera: ['Parque Ibirapuera', 'São Paulo', 'cerca de 158 hectares', 'Aberto em 1954, no aniversário de 400 anos da cidade', 'Os prédios são de Oscar Niemeyer e o paisagismo original, de Burle Marx. A marquise ondulada liga os pavilhões sem parede.'],
    flamengo: ['Parque do Flamengo', 'Rio de Janeiro', 'cerca de 120 hectares', 'Construído sobre aterro na baía', 'A terra veio do desmonte do morro de Santo Antônio. É considerado um dos maiores projetos de Burle Marx e é tombado como paisagem.'],
    jardimbotanico: ['Jardim Botânico do Rio', 'Rio de Janeiro', 'cerca de 54 hectares visitáveis', 'Fundado por dom João VI em 1808', 'Nasceu como horto de aclimatação de especiarias trazidas do Oriente. As palmeiras-imperiais descendem todas de uma única árvore plantada por dom João.'],
    barigui: ['Parque Barigui', 'Curitiba, Paraná', 'cerca de 140 hectares', 'Área alagável que virou parque', 'Faz parte de um sistema de parques criado para controlar enchentes: os lagos funcionam como bacias de contenção da chuva.'],
    redencao: ['Parque Farroupilha', 'Porto Alegre, Rio Grande do Sul', 'cerca de 37 hectares', 'Conhecido como Redenção', 'A feira de domingo, com artesanato e antiguidades, é instituição da cidade e ocupa a avenida lateral do parque há décadas.'],
    mangabeiras: ['Parque das Mangabeiras', 'Belo Horizonte, Minas Gerais', 'cerca de 235 hectares', 'Na encosta da serra do Curral', 'Fica em área de antiga mineração e guarda nascentes que abastecem parte da cidade. O mirante dá a vista mais ampla de Belo Horizonte.']
})

T('Brasil', '🧺', 'mercados', 'Mercados públicos brasileiros',
    'Mercado municipal é onde a cozinha de uma cidade fica exposta, com cheiro e sotaque.',
    ['Onde fica', 'Desde', 'O que se acha lá'], {
    veropeso: ['Ver-o-Peso', 'Belém, Pará', 'origem no século XVII', 'Ervas, peixes e frutos amazônicos', 'É apontado como a maior feira a céu aberto da América Latina. O nome vem da balança colonial onde se conferia o peso das mercadorias para cobrar imposto.'],
    municipalsp: ['Mercado Municipal', 'São Paulo', '1933', 'Frutas, especiarias e o sanduíche de mortadela', 'Os vitrais retratam cenas de lavoura e pecuária. O sanduíche que virou símbolo do mercado é invenção bem posterior ao prédio.'],
    modelo: ['Mercado Modelo', 'Salvador, Bahia', 'no prédio atual desde 1971', 'Artesanato, instrumentos e comida baiana', 'Funciona no antigo prédio da alfândega, no porto. O subsolo é associado à chegada de africanos escravizados e é visitado como memorial.'],
    publicopoa: ['Mercado Público', 'Porto Alegre, Rio Grande do Sul', '1869', 'Erva-mate, peixes e bancas centenárias', 'Sofreu um incêndio grave em 2013 e foi restaurado. A escultura no centro, chamada Bará do Mercado, é ponto de devoção de religiões afro-brasileiras.'],
    centralbh: ['Mercado Central', 'Belo Horizonte, Minas Gerais', '1929', 'Queijos, doces, cachaça e boteco', 'Tem centenas de lojas em um quarteirão inteiro e virou point noturno: vários boxes funcionam como bar de balcão até tarde.'],
    adolphlisboa: ['Mercado Adolpho Lisboa', 'Manaus, Amazonas', '1883', 'Peixes de rio, ervas e farinhas', 'A estrutura de ferro foi importada da Europa no ciclo da borracha, no mesmo espírito do Teatro Amazonas.']
})

T('Brasil', '🔦', 'farois', 'Faróis do litoral brasileiro',
    'O Brasil tem mais de trezentos faróis, e alguns funcionam sem interrupção há séculos.',
    ['Onde fica', 'Desde', 'Detalhe'], {
    barra: ['Farol da Barra', 'Salvador, Bahia', '1698', 'O farol mais antigo das Américas', 'Foi erguido junto ao forte de Santo Antônio, na entrada da Baía de Todos-os-Santos, e sinaliza um trecho de naufrágios desde o período colonial.'],
    santamarta: ['Farol de Santa Marta', 'Laguna, Santa Catarina', '1891', 'Uma das maiores lentes da América Latina', 'A lente veio da França e flutua sobre mercúrio, o que permite girá-la com pouquíssimo esforço apesar do peso de toneladas.'],
    conchas: ['Farol das Conchas', 'Ilha do Mel, Paraná', '1872', 'Só se chega a pé', 'Fica em uma ilha sem carros. A subida até ele é feita por trilha na areia, e do alto se vê toda a entrada da baía de Paranaguá.'],
    cabobranco: ['Farol do Cabo Branco', 'João Pessoa, Paraíba', '1928 na forma atual', 'Perto do ponto mais oriental das Américas', 'A falésia onde fica recua com a erosão, e o farol já precisou ser reconstruído mais afastado da borda do penhasco.'],
    saotome: ['Farol de São Tomé', 'Campos dos Goytacazes, Rio de Janeiro', '1882', 'Sinaliza um cabo de correntes perigosas', 'A região concentrou naufrágios por causa de bancos de areia móveis, que mudam de posição e não aparecem em cartas antigas.'],
    rasa: ['Farol da Ilha Rasa', 'Rio de Janeiro', '1829', 'Guia a entrada da Baía de Guanabara', 'É um dos faróis mais antigos em operação no país e serviu de referência para gerações de navegadores que chegavam ao porto do Rio.']
})

T('Brasil', '🏙️', 'cidadesbr', 'As maiores cidades do Brasil',
    'A contagem é do Censo 2022 e conta só o município, não a região metropolitana.',
    ['Estado', 'População no Censo 2022', 'Detalhe'], {
    saopaulo: ['São Paulo', 'São Paulo', 'cerca de 11,45 milhões', 'A maior cidade do país e do hemisfério sul', 'Sozinha tem mais gente que a maioria dos estados brasileiros e que vários países inteiros da América do Sul.'],
    rio: ['Rio de Janeiro', 'Rio de Janeiro', 'cerca de 6,21 milhões', 'A segunda maior', 'Foi capital do país por quase dois séculos e é a única cidade brasileira a ter sediado uma Olimpíada, em 2016.'],
    brasilia: ['Brasília', 'Distrito Federal', 'cerca de 2,82 milhões', 'A terceira maior', 'O número inclui todas as regiões administrativas do Distrito Federal, porque ali não existem municípios separados.'],
    fortaleza: ['Fortaleza', 'Ceará', 'cerca de 2,43 milhões', 'A maior do Nordeste em população municipal', 'Tem uma das maiores densidades demográficas entre as capitais brasileiras, concentrada em uma área relativamente pequena.'],
    salvador: ['Salvador', 'Bahia', 'cerca de 2,42 milhões', 'Primeira capital do Brasil', 'Foi sede do governo colonial de 1549 a 1763 e é a cidade brasileira com maior proporção de população negra e parda entre as grandes capitais.'],
    manaus: ['Manaus', 'Amazonas', 'cerca de 2,06 milhões', 'A maior cidade da Amazônia', 'É a metrópole mais isolada do país por terra: a ligação rodoviária com o restante do Brasil é precária, e quase tudo chega por rio ou por ar.']
}, 'Censo 2022 (IBGE)')

/* ───────────────────────────── CIÊNCIA ───────────────────────────── */

T('Ciência', '⭐', 'estrelas', 'Estrelas que dá para achar no céu',
    'Cada uma dessas estrelas conta algo diferente sobre como o universo funciona.',
    ['Onde está', 'Distância', 'O que tem de especial'], {
    sirius: ['Sirius', 'Constelação de Cão Maior', 'cerca de 8,6 anos-luz', 'A estrela mais brilhante do céu noturno', 'Brilha tanto por estar perto, não por ser gigante. Tem uma companheira anã branca minúscula, descoberta pelo balanço que provoca na principal.'],
    proxima: ['Proxima Centauri', 'Constelação de Centauro', 'cerca de 4,24 anos-luz', 'A estrela mais próxima do Sol', 'É uma anã vermelha fraca demais para ser vista a olho nu, apesar de ser nossa vizinha mais próxima. Tem ao menos um planeta na zona habitável.'],
    betelgeuse: ['Betelgeuse', 'Ombro de Órion', 'cerca de 500 a 700 anos-luz', 'Supergigante vermelha prestes a explodir', 'Se estivesse no lugar do Sol, engoliria a órbita de Marte. Escureceu de repente em 2019, e a causa foi uma nuvem de poeira que ela mesma expeliu.'],
    polaris: ['Polaris', 'Constelação de Ursa Menor', 'cerca de 430 anos-luz', 'A estrela que marca o norte', 'Não é a mais brilhante do céu, ao contrário do que muita gente pensa. E nem sempre foi a polar: o eixo da Terra oscila e troca de estrela a cada milhares de anos.'],
    canopus: ['Canopus', 'Constelação de Carina', 'cerca de 310 anos-luz', 'A segunda estrela mais brilhante do céu', 'É bem visível do hemisfério sul e quase inacessível do norte. Sondas espaciais a usam como referência de navegação justamente por isso.'],
    uyscuti: ['UY Scuti', 'Constelação de Escudo', 'cerca de 9.500 anos-luz', 'Uma das maiores estrelas conhecidas', 'Seu raio é estimado em mais de mil vezes o do Sol. Mesmo assim, tem massa modesta: é gigantesca e extremamente rarefeita.']
})

T('Ciência', '🌟', 'tiposestrela', 'Os tipos de estrela e como cada uma acaba',
    'O fim de uma estrela é decidido no nascimento, pela massa com que ela se formou.',
    ['Massa típica', 'Como vive', 'Como termina'], {
    ananvermelha: ['Anã vermelha', 'menos de metade da massa do Sol', 'Queima hidrogênio devagar', 'Vive mais que a idade atual do universo', 'É o tipo mais comum de estrela: cerca de três em cada quatro. Nenhuma anã vermelha morreu ainda, porque o universo é jovem demais para isso.'],
    ananamarela: ['Anã amarela', 'próxima à massa do Sol', 'Sequência principal por bilhões de anos', 'Vira gigante vermelha e depois anã branca', 'É a classe do Sol. Em cerca de cinco bilhões de anos ele inchará, engolirá os planetas internos e deixará um caroço brilhante do tamanho da Terra.'],
    gigantevermelha: ['Gigante vermelha', 'fase, não classe de nascimento', 'Queima hélio no núcleo e incha', 'Solta as camadas externas', 'A estrela cresce dezenas de vezes e esfria na superfície, por isso fica vermelha. A camada solta vira uma nebulosa planetária.'],
    ananbranca: ['Anã branca', 'caroço de até 1,4 massa solar', 'Não queima mais nada', 'Esfria por bilhões de anos', 'É matéria tão comprimida que uma colher de chá pesaria toneladas. O limite de 1,4 massa solar tem nome: limite de Chandrasekhar.'],
    supernova: ['Supergigante', 'mais de oito massas solares', 'Queima elementos cada vez mais pesados', 'Explode como supernova', 'A explosão espalha pelo espaço os elementos pesados forjados dentro dela. O ferro do seu sangue veio de uma estrela que morreu assim.'],
    neutrons: ['Estrela de nêutrons', 'caroço de 1,4 a cerca de 2 massas solares', 'Gira rapidíssimo', 'Fica assim por bilhões de anos', 'Concentra mais massa que o Sol em uma esfera de poucos quilômetros. Algumas giram centenas de vezes por segundo e são detectadas como pulsares.']
})

T('Ciência', '🕳️', 'buracosnegros', 'Buracos negros, sem mistificação',
    'Buraco negro não é um buraco nem suga tudo: é massa concentrada demais para a luz escapar.',
    ['O que é', 'Tamanho ou massa', 'Detalhe'], {
    horizonte: ['Horizonte de eventos', 'A fronteira sem volta', 'Depende da massa', 'Não é uma superfície física', 'É apenas a distância a partir da qual nem a luz consegue voltar. Quem cruzasse não notaria nada de especial no exato momento da passagem.'],
    sagitarioa: ['Sagitário A estrela', 'O buraco negro da nossa galáxia', 'cerca de 4 milhões de massas solares', 'Fica a cerca de 26 mil anos-luz', 'Sua existência foi confirmada acompanhando estrelas que orbitam algo invisível e maciço no centro da Via Láctea, trabalho que rendeu o Nobel de 2020.'],
    m87: ['M87 estrela', 'O primeiro a ser fotografado', 'cerca de 6,5 bilhões de massas solares', 'Imagem divulgada em 2019', 'A foto foi montada juntando dados de radiotelescópios espalhados pelo planeta, formando na prática um telescópio do tamanho da Terra.'],
    estelar: ['Buraco negro estelar', 'Resto de uma estrela gigante', 'de 3 a dezenas de massas solares', 'Nasce do colapso do núcleo', 'São os mais comuns. A Via Láctea deve ter centenas de milhões deles, quase todos invisíveis porque não estão engolindo nada no momento.'],
    ondas: ['Ondas gravitacionais', 'Ondulações no próprio espaço', 'Detectadas em 2015', 'Previstas por Einstein em 1916', 'A primeira detecção veio da fusão de dois buracos negros a mais de um bilhão de anos-luz. O sinal durou uma fração de segundo.'],
    hawking: ['Radiação Hawking', 'Buraco negro evapora, em tese', 'Lentíssima para os grandes', 'Proposta por Stephen Hawking em 1974', 'Se estiver certa, buracos negros perdem massa muito devagar e acabam sumindo. Para os maiores, isso levaria muito mais que a idade atual do universo.']
})

T('Ciência', '🌌', 'galaxias', 'Galáxias e o lugar da Terra no universo',
    'Nosso endereço cósmico tem muito mais degraus do que sistema solar e galáxia.',
    ['Tipo', 'Distância ou tamanho', 'Detalhe'], {
    vialactea: ['Via Láctea', 'Espiral barrada', 'cerca de 100 mil anos-luz de diâmetro', 'Nossa galáxia', 'Tem de cem a quatrocentos bilhões de estrelas. O Sol fica em um braço afastado do centro e leva cerca de 230 milhões de anos para dar uma volta.'],
    andromeda: ['Andrômeda', 'Espiral', 'cerca de 2,5 milhões de anos-luz', 'A grande galáxia mais próxima', 'Está vindo na nossa direção e deve se fundir com a Via Láctea em cerca de quatro bilhões de anos. Estrelas quase não colidem nesses encontros.'],
    magalhaes: ['Nuvens de Magalhães', 'Irregulares', 'cerca de 160 mil anos-luz', 'Galáxias satélites visíveis a olho nu', 'Só aparecem do hemisfério sul. Foram descritas por navegadores europeus na viagem de Fernão de Magalhães, daí o nome.'],
    elipticas: ['Galáxias elípticas', 'Elíptica', 'as maiores conhecidas', 'Pouca formação de estrelas novas', 'Costumam ser resultado de fusões e já gastaram quase todo o gás. São dominadas por estrelas velhas e avermelhadas.'],
    grupolocal: ['Grupo Local', 'Aglomerado de galáxias', 'cerca de 10 milhões de anos-luz', 'O bairro da Via Láctea', 'Reúne mais de oitenta galáxias, quase todas anãs. As duas grandes são a Via Láctea e Andrômeda, e elas dominam a gravidade do conjunto.'],
    observavel: ['Universo observável', 'Tudo que podemos ver', 'cerca de 93 bilhões de anos-luz de diâmetro', 'Limitado pela idade da luz', 'É maior que a idade do universo em anos-luz porque o espaço se expandiu enquanto a luz viajava. Não é o tamanho do universo, é o alcance da vista.']
})

T('Ciência', '☁️', 'nebulosas', 'Nebulosas, onde nascem e morrem estrelas',
    'Nuvem de gás no espaço pode ser berçário, cadáver de estrela ou só poeira no caminho.',
    ['Tipo', 'Distância', 'O que acontece lá'], {
    orion: ['Nebulosa de Órion', 'De emissão, berçário estelar', 'cerca de 1.340 anos-luz', 'Estrelas novas se formam agora', 'É a região de formação estelar mais próxima da Terra e pode ser vista a olho nu como um borrão na espada de Órion.'],
    caranguejo: ['Nebulosa do Caranguejo', 'Resto de supernova', 'cerca de 6.500 anos-luz', 'Explosão registrada em 1054', 'Astrônomos chineses anotaram uma estrela visível de dia por semanas. Hoje sabemos que era a supernova que criou essa nuvem.'],
    aguia: ['Nebulosa da Águia', 'De emissão', 'cerca de 7.000 anos-luz', 'Abriga os Pilares da Criação', 'A imagem dos pilares, feita pelo Hubble em 1995, é uma das fotos astronômicas mais reproduzidas da história.'],
    anel: ['Nebulosa do Anel', 'Planetária', 'cerca de 2.500 anos-luz', 'Camadas soltas por uma estrela moribunda', 'O nome planetária é um erro histórico: no telescópio antigo pareciam discos de planeta, e a designação ficou mesmo depois de corrigida a ideia.'],
    cabecacavalo: ['Nebulosa Cabeça de Cavalo', 'Escura', 'cerca de 1.400 anos-luz', 'Só aparece contra o fundo iluminado', 'Não emite luz própria: é poeira densa que bloqueia o brilho de trás. A silhueta muda lentamente ao longo de milhares de anos.'],
    carina: ['Nebulosa de Carina', 'De emissão', 'cerca de 7.500 anos-luz', 'Abriga estrelas instáveis e gigantescas', 'Guarda a Eta Carinae, um sistema que quase explodiu em 1843 e brilhou como a segunda estrela mais forte do céu por anos.']
})

T('Ciência', '📏', 'distancias', 'As distâncias do universo em escala',
    'Números cósmicos só fazem sentido quando comparados a algo que dá para imaginar.',
    ['Distância', 'Quanto a luz leva', 'Comparação'], {
    lua: ['Terra à Lua', 'cerca de 384 mil km', '1,3 segundo', 'Cabem todos os planetas do sistema solar enfileirados nesse espaço', 'Uma conversa por rádio com alguém na Lua tem quase três segundos de atraso entre a pergunta e a resposta.'],
    sol: ['Terra ao Sol', 'cerca de 150 milhões de km', '8 minutos e 20 segundos', 'Essa distância é chamada de unidade astronômica', 'Se o Sol se apagasse agora, ainda teríamos mais de oito minutos de luz antes de perceber qualquer coisa.'],
    netuno: ['Terra a Netuno', 'cerca de 4,5 bilhões de km', 'cerca de 4 horas', 'Trinta vezes a distância até o Sol', 'A sonda Voyager 2 levou doze anos para chegar lá, e é a única nave que já visitou esse planeta de perto.'],
    proxima: ['Sol a Proxima Centauri', 'cerca de 40 trilhões de km', '4,24 anos', 'A estrela mais próxima', 'Com a nave mais rápida já lançada, a viagem levaria dezenas de milhares de anos. Nenhuma tecnologia atual muda isso.'],
    centro: ['Sol ao centro da galáxia', 'cerca de 26 mil anos-luz', '26 mil anos', 'Ainda dentro da nossa própria galáxia', 'A luz que sai do centro da Via Láctea hoje só chegará aqui quando a civilização humana atual for pré-história remota.'],
    andromeda: ['Via Láctea a Andrômeda', 'cerca de 2,5 milhões de anos-luz', '2,5 milhões de anos', 'A galáxia grande mais próxima', 'A luz que você vê de Andrômeda saiu de lá quando os primeiros hominídeos começavam a usar ferramentas de pedra.']
})

T('Ciência', '🔬', 'tamanhos', 'Do átomo à galáxia, em degraus',
    'Cada degrau desta lista é milhares de vezes maior que o anterior.',
    ['Tamanho típico', 'Como enxergar', 'Detalhe'], {
    proton: ['Próton', 'cerca de 0,000 000 000 000 001 m', 'Só por experimentos indiretos', 'Nenhum microscópio o mostra', 'Se um átomo fosse do tamanho de um estádio, o núcleo seria uma bolinha de gude no centro, e o resto seria vazio.'],
    atomo: ['Átomo', 'cerca de 0,1 nanômetro', 'Microscópio de força atômica', 'Cerca de um milhão cabem na espessura de um fio de cabelo', 'A palavra átomo quer dizer indivisível, nome dado antes de se descobrir que ele tem partes menores dentro.'],
    virus: ['Vírus', 'de 20 a 300 nanômetros', 'Microscópio eletrônico', 'Menor que qualquer célula', 'Por serem menores que o comprimento de onda da luz visível, vírus não podem ser vistos em microscópio óptico comum.'],
    bacteria: ['Bactéria', 'de 1 a 10 micrômetros', 'Microscópio óptico comum', 'Mil vezes maior que um vírus típico', 'Uma colher de terra de jardim contém mais bactérias do que existem seres humanos no planeta inteiro.'],
    celula: ['Célula humana', 'de 10 a 100 micrômetros', 'Microscópio óptico', 'O óvulo é visível a olho nu', 'O óvulo humano é a maior célula do corpo e chega a cerca de 0,1 milímetro, no limite do que o olho consegue distinguir.'],
    terra: ['Terra', 'cerca de 12.742 km de diâmetro', 'Do espaço', 'Cabem cerca de 1,3 milhão de Terras no Sol', 'Apesar das montanhas, a Terra é proporcionalmente mais lisa que uma bola de sinuca: o Everest é uma ruga mínima na escala do planeta.']
})

T('Ciência', '💨', 'velocidades', 'A velocidade das coisas',
    'Comparar velocidades em uma mesma unidade revela o quanto a luz está fora de escala.',
    ['Velocidade', 'Comparação', 'Detalhe'], {
    caminhada: ['Pessoa caminhando', 'cerca de 5 km/h', 'A referência de todo o resto', 'O passo humano confortável', 'É a velocidade que serviu de base para medir distância a pé em quase todas as culturas antes do veículo motorizado.'],
    bolt: ['Corredor mais rápido', 'cerca de 44,7 km/h de pico', 'Nove vezes a caminhada', 'Recorde medido em trecho dos 100 m', 'A velocidade de pico dura poucos segundos. A média ao longo da prova inteira fica bem abaixo disso.'],
    guepardo: ['Guepardo', 'cerca de 110 km/h', 'O animal terrestre mais rápido', 'Só aguenta poucos segundos', 'A corrida aquece tanto o corpo que o animal precisa parar antes de superaquecer, e muitas caçadas falham por isso.'],
    som: ['Som no ar', 'cerca de 1.235 km/h', 'Trezentos e quarenta metros por segundo', 'Varia com a temperatura', 'É por isso que o trovão chega depois do relâmpago: a luz faz o percurso quase instantaneamente e o som se arrasta.'],
    iss: ['Estação Espacial', 'cerca de 27.600 km/h', 'Dá a volta na Terra em 90 minutos', 'Vinte e duas vezes a velocidade do som', 'A tripulação vê cerca de dezesseis amanheceres e dezesseis anoiteceres a cada período de 24 horas.'],
    luz: ['Luz no vácuo', 'cerca de 1,08 bilhão de km/h', 'Sete voltas na Terra por segundo', 'O limite absoluto do universo', 'Nada com massa alcança essa velocidade, porque a energia necessária cresceria sem limite conforme se aproximasse dela.']
})

T('Ciência', '🌡️', 'temperaturas', 'A temperatura das coisas',
    'De onde o movimento das partículas para até onde a matéria deixa de existir como conhecemos.',
    ['Temperatura', 'Onde acontece', 'Detalhe'], {
    zeroabsoluto: ['Zero absoluto', '-273,15 °C', 'Nunca alcançado de fato', 'O limite inferior da escala', 'É o ponto em que o movimento térmico das partículas seria mínimo. Laboratórios já chegaram a bilionésimos de grau acima dele, nunca a ele.'],
    espaco: ['Espaço profundo', 'cerca de -270 °C', 'Entre as galáxias', 'Radiação de fundo do universo', 'Esses poucos graus acima do zero absoluto são o calor residual do próprio Big Bang, espalhado por todo o universo.'],
    corpo: ['Corpo humano', 'cerca de 36,5 °C', 'Temperatura interna', 'Varia ao longo do dia', 'A temperatura corporal é mais baixa de madrugada e mais alta no fim da tarde, variação normal de cerca de meio grau.'],
    lava: ['Lava vulcânica', 'de 700 a 1.200 °C', 'Erupções', 'Depende da composição', 'Lava rica em sílica é mais fria e mais viscosa, e por isso causa erupções explosivas. A lava fluida e quente escorre em vez de explodir.'],
    superficiesol: ['Superfície do Sol', 'cerca de 5.500 °C', 'Fotosfera', 'A parte que vemos', 'A coroa solar, muito acima da superfície, é centenas de vezes mais quente, e explicar essa inversão continua sendo um problema em aberto.'],
    nucleosol: ['Núcleo do Sol', 'cerca de 15 milhões de °C', 'Centro da estrela', 'Onde acontece a fusão nuclear', 'É a pressão somada à temperatura que permite a fusão. Só com calor, mesmo esse, os núcleos não se aproximariam o bastante.']
})

T('Ciência', '🪨', 'pressao', 'Pressão, do vácuo ao fundo do mar',
    'A pressão do ar em cima de você equivale a cerca de uma tonelada por metro quadrado, e ninguém sente.',
    ['Pressão', 'Onde acontece', 'Detalhe'], {
    nivelmar: ['Nível do mar', '1 atmosfera, cerca de 101 kPa', 'Superfície da Terra', 'A referência de todas as outras', 'Você não sente essa pressão porque o corpo empurra de volta com a mesma força, por dentro. O que se sente é a mudança dela.'],
    everest: ['Topo do Everest', 'cerca de 0,33 atmosfera', 'A 8.849 m de altitude', 'Um terço do oxigênio disponível', 'Acima de oito mil metros fica a chamada zona da morte, onde o corpo se deteriora mesmo em repouso e nenhuma aclimatação resolve.'],
    panela: ['Panela de pressão', 'cerca de 2 atmosferas', 'Cozinha', 'A água ferve a cerca de 120 °C', 'É esse aumento do ponto de ebulição que acelera o cozimento. Em cidades altas, a água ferve abaixo de 100 °C e o feijão demora mais.'],
    mergulho: ['Mergulho a 30 m', 'cerca de 4 atmosferas', 'Mar', 'A cada 10 m soma-se 1 atmosfera', 'A subida rápida faz o nitrogênio dissolvido formar bolhas no sangue, o que causa a doença descompressiva.'],
    venus: ['Superfície de Vênus', 'cerca de 92 atmosferas', 'Planeta vizinho', 'Como estar a 900 m debaixo da água', 'Somada à temperatura de centenas de graus, essa pressão destruiu em poucas horas todas as sondas que pousaram lá.'],
    marianas: ['Fundo das Marianas', 'cerca de 1.100 atmosferas', 'Ponto mais fundo do oceano', 'Mais de mil vezes a da superfície', 'Mesmo assim há vida ali: peixes, crustáceos e micro-organismos adaptados a uma pressão que amassaria um submarino comum.']
})

T('Ciência', '🔊', 'decibeis', 'O som medido em decibéis',
    'A escala é logarítmica: mais dez decibéis não é um pouco mais alto, é dez vezes mais intenso.',
    ['Nível', 'Exemplo', 'Efeito'], {
    limiar: ['0 dB', 'Limiar da audição humana', 'O som mais fraco perceptível', 'Ponto zero da escala', 'Não é ausência de som, e sim o mínimo que um ouvido jovem e saudável consegue detectar em condições ideais.'],
    sussurro: ['30 dB', 'Sussurro a um metro', 'Biblioteca silenciosa', 'Confortável', 'É o nível recomendado para quarto de dormir. Acima disso, o sono fica mais superficial mesmo sem a pessoa acordar.'],
    conversa: ['60 dB', 'Conversa normal', 'Escritório', 'Sem risco', 'O ouvido humano é mais sensível justamente na faixa de frequência da voz falada, o que faz sentido do ponto de vista evolutivo.'],
    transito: ['85 dB', 'Trânsito intenso', 'Rua movimentada', 'Limite para exposição de 8 horas', 'Acima desse nível, o tempo seguro cai pela metade a cada três decibéis a mais. A 100 dB, o limite já é de minutos.'],
    show: ['110 dB', 'Show ao vivo perto da caixa', 'Festa ou concerto', 'Risco em minutos', 'A perda auditiva por ruído é cumulativa e irreversível: células do ouvido interno não se regeneram em seres humanos.'],
    jato: ['140 dB', 'Jato decolando de perto', 'Pista de aeroporto', 'Dor imediata e risco de lesão', 'O limiar da dor fica em torno de 120 a 130 dB. Acima de 194 dB, no ar, a onda deixa de ser som e vira onda de choque.']
})

T('Ciência', '🌈', 'espectro', 'A luz que você vê e a que não vê',
    'A luz visível é uma fatia estreitíssima de um espectro que vai do rádio ao raio gama.',
    ['Comprimento de onda', 'Para que serve', 'Detalhe'], {
    radio: ['Ondas de rádio', 'de metros a quilômetros', 'Rádio, TV e celular', 'As mais longas do espectro', 'Atravessam paredes e contornam obstáculos justamente por terem onda longa, o que as torna ideais para comunicação a distância.'],
    microondas: ['Micro-ondas', 'de milímetros a centímetros', 'Forno, radar e satélite', 'Agitam as moléculas de água', 'O forno esquenta a comida fazendo as moléculas de água girarem bilhões de vezes por segundo. O calor vem do atrito entre elas.'],
    infravermelho: ['Infravermelho', 'de 700 nanômetros a 1 milímetro', 'Controle remoto e câmera térmica', 'É o calor que se sente', 'Todo corpo acima do zero absoluto emite infravermelho. É assim que uma câmera térmica enxerga pessoas no escuro total.'],
    visivel: ['Luz visível', 'de cerca de 380 a 700 nanômetros', 'Enxergar', 'Uma faixa minúscula do espectro', 'Nossos olhos evoluíram para a faixa em que o Sol emite mais energia e a atmosfera deixa passar. Não é coincidência.'],
    ultravioleta: ['Ultravioleta', 'de 10 a 400 nanômetros', 'Esterilização e vitamina D', 'Causa queimadura de sol', 'A camada de ozônio bloqueia a parte mais destrutiva. Sem ela, a vida na superfície seria inviável como a conhecemos.'],
    gama: ['Raios gama', 'menores que um picômetro', 'Radioterapia e astronomia', 'Os mais energéticos do espectro', 'Vêm de reações nucleares e de eventos cósmicos violentos. A atmosfera os barra, e por isso só são estudados com telescópios em órbita.']
})

/* ─────────────────── CIÊNCIA — corpo, vida e matéria ─────────────────── */

T('Ciência', '🧍', 'corponumeros', 'O corpo humano em números',
    'A gente carrega um monte de número redondo sobre o próprio corpo sem nunca ter parado para conferir nenhum deles.',
    ['Número', 'Comparação', 'Detalhe'], {
    ossos: ['Ossos', 'cerca de 206 no adulto', 'mais de 270 no recém-nascido', 'quase metade está nas mãos e nos pés', 'O bebê nasce com mais osso que o adulto porque muita peça ainda vai grudar: o crânio fecha aos poucos e a bacia vira uma só. Ninguém perde osso nessa conta, é fusão.'],
    batimentos: ['Batimentos', 'perto de 100 mil por dia', 'alguns bilhões numa vida longa', 'em repouso, de 60 a 100 por minuto', 'O coração não descansa entre uma batida e outra, ele descansa dentro de cada batida. Somando essas pausas curtinhas, o músculo passa boa parte do dia parado.'],
    sangue: ['Sangue bombeado', 'estimado em milhares de litros por dia', 'encheria um caminhão-pipa pequeno', 'o corpo inteiro tem só uns 5 litros', 'Não são milhares de litros de sangue diferente. São os mesmos cinco litros dando volta, passando pelo coração de novo e de novo, o dia inteiro, sem intervalo.'],
    celulas: ['Células', 'estimadas em dezenas de trilhões', 'os micróbios do corpo são número parecido', 'bilhões são trocadas todo dia', 'A conta muda conforme quem mede e como mede, então trate como ordem de grandeza. O que ninguém discute é que a hemácia é a mais numerosa de longe, sozinha na casa dos trilhões.'],
    agua: ['Água no corpo', 'cerca de 60% do peso do adulto', 'no bebê passa de 70%', 'a proporção cai com a idade', 'Sede já é aviso atrasado, sinal de que faltou água faz um tempo. O corpo aguenta semanas sem comer e poucos dias sem beber, porque quase toda reação dele acontece dentro d\'água.'],
    pele: ['Pele', 'perto de 2 metros quadrados', 'pesa mais que o fígado', 'se renova em mais ou menos um mês', 'É a maior peça do corpo e a única que a gente troca inteira sem notar. Boa parte da poeira que assenta em casa é pele velha de quem mora ali.']
}, 'valores usuais da literatura, arredondados')

T('Ciência', '👁️', 'sentidos', 'Os limites dos cinco sentidos',
    'Cada sentido tem um teto bem definido, e a maior parte do mundo acontece do lado de fora desse teto.',
    ['Alcance', 'Comparação', 'Detalhe'], {
    audicao: ['Audição', 'de cerca de 20 a 20.000 hertz', 'cão e gato escutam bem mais agudo', 'o topo cai com a idade, e cai cedo', 'O agudo é o primeiro a ir embora. Por isso existe toque de celular que só adolescente escuta, enquanto o adulto na mesma sala jura que o telefone está mudo.'],
    visao: ['Visão', 'luz de cerca de 380 a 700 nanômetros', 'abelha enxerga ultravioleta, a gente não', 'milhões de tons diferentes', 'No escuro, o olho leva uns vinte minutos para chegar no máximo da sensibilidade. Um segundo de lanterna na cara joga fora esse ajuste inteiro e a conta recomeça do zero.'],
    olfato: ['Olfato', 'centenas de tipos de receptor', 'o cão tem muito mais receptor que a gente', 'é o sentido mais difícil de pôr em palavra', 'O cheiro é o único sentido que chega ao cérebro sem passar pela triagem central. Por isso um cheiro puxa a lembrança inteira antes de a pessoa saber do quê.'],
    paladar: ['Paladar', 'cinco gostos básicos', 'doce, salgado, azedo, amargo e umami', 'o resto do sabor é cheiro', 'Aquele mapa da língua, doce na ponta e amargo no fundo, saiu de um erro de tradução e virou cartaz de escola. Todo gosto é sentido em toda a língua.'],
    tato: ['Tato', 'a ponta do dedo separa pontos a poucos milímetros', 'nas costas precisa de centímetros', 'sente sulco fino demais para o olho ver', 'A mão não é sensível por causa da pele, e sim pelo espaço que ela ocupa no cérebro. Dedo e lábio tomam mais área lá dentro do que as costas inteiras.'],
    equilibrio: ['Equilíbrio', 'três canais de líquido dentro do ouvido', 'é o sentido que ninguém inclui na lista', 'trabalha em dupla com a visão', 'Girar rápido e parar deixa o líquido do ouvido rodando sozinho. O corpo parou, o ouvido diz que não, e o mundo continua girando até o líquido sossegar.']
})

T('Ciência', '😴', 'sono', 'As fases do sono e o que acontece em cada uma',
    'Dormir não é um estado só: a noite inteira é uma escada que a pessoa sobe e desce várias vezes sem perceber.',
    ['Quanto dura', 'Fatia da noite', 'O que acontece'], {
    fase1: ['Fase 1, o cochilo', 'poucos minutos', 'a menor fatia de todas', 'o músculo relaxa e vem o tranco', 'Aquele solavanco que acorda a pessoa achando que caiu é comum e tem nome. O corpo desliga o músculo antes de a cabeça desligar, e a cabeça traduz aquilo como queda.'],
    fase2: ['Fase 2, o sono leve', 'de 10 a 25 minutos por ciclo', 'cerca de metade da noite', 'batimento e temperatura caem', 'É a fase em que a pessoa passa mais tempo e a que ela mais nega ter tido. Acordada no meio dela, jura que estava só de olho fechado pensando na vida.'],
    fase3: ['Fase 3, o sono profundo', 'mais longa na primeira metade da noite', 'algo entre 15% e 25%', 'é difícil acordar alguém', 'Sonambulismo e terror noturno nascem aqui, não no sonho. Quem levanta e anda nessa fase costuma não lembrar de nada no dia seguinte, e não adianta insistir.'],
    rem: ['Sono REM', 'começa curto e vai se alongando', 'perto de um quarto da noite', 'o olho se mexe e o corpo trava', 'O corpo se paralisa de propósito para não encenar o sonho. Quando essa trava falha, a pessoa chuta, fala e chega a sair da cama sonhando de olho aberto.'],
    ciclo: ['O ciclo completo', 'cerca de 90 minutos', 'de quatro a seis por noite', 'as fases se repetem na ordem', 'Acordar na emenda de um ciclo dá sensação de noite boa mesmo com poucas horas. Despertador tocando no meio do sono profundo estraga a manhã inteira.'],
    despertar: ['A hora de acordar', 'mais leve no fim de um ciclo', 'o sonho domina o fim da madrugada', 'é quando o sonho é lembrado', 'Sonho a gente tem a noite toda, mas só guarda o que estava rodando pouco antes de abrir o olho. Dois minutos de pé e a lembrança já foi embora.']
})

T('Ciência', '🧬', 'dna', 'DNA e genética em números',
    'O manual do corpo inteiro é escrito com quatro letras e cabe dentro de uma bolinha que nenhum olho enxerga.',
    ['Número', 'Comparação', 'Detalhe'], {
    paresdebase: ['Pares de base', 'cerca de 3 bilhões no genoma humano', 'daria uma estante inteira de listas telefônicas', 'só quatro letras se repetem', 'As quatro letras se encaixam sempre aos pares, e sempre do mesmo jeito. Essa regra boba é o que deixa a célula copiar a fita inteira sem precisar entender o que está escrito ali.'],
    cromossomos: ['Cromossomos', '46 no ser humano, em 23 pares', 'a samambaia e o cachorro têm mais', 'número alto não quer dizer bicho complexo', 'Muita gente acha que mais cromossomo é sinal de bicho mais avançado. Tem planta com centenas deles e a gente com quarenta e seis, e essa conta não diz nada sobre quem é mais complicado.'],
    genes: ['Genes', 'estimados em cerca de 20 mil', 'parecido com o de um verme pequeno', 'ocupam uma fatia pequena da fita', 'Antes de medirem, o palpite era de cem mil genes para tanta complexidade. O número veio bem menor e a saída foi entender que um gene só sabe fabricar mais de uma proteína.'],
    semelhanca: ['Duas pessoas quaisquer', 'mais de 99% da fita igual', 'a diferença se espalha por milhões de pontos', 'a maior variação está dentro de cada povo', 'Duas pessoas do mesmo bairro podem estar mais distantes entre si do que uma delas e alguém do outro lado do mundo. Não existe linha divisória de raça escrita no genoma.'],
    chimpanze: ['Chimpanzé', 'perto de 98% em comum com a gente', 'com o gato fica na casa dos 90%', 'a porcentagem depende de como se conta', 'O número muda de reportagem para reportagem porque cada estudo mede de um jeito. O que ele mostra é que a receita básica de célula é quase a mesma para todo bicho vivo.'],
    fita: ['A fita esticada', 'cerca de 2 metros por célula', 'enrolada num núcleo invisível a olho nu', 'somando o corpo, dá distância absurda', 'Dois metros de linha dobrados dentro de algo que não se vê sem microscópio. É como guardar um quilômetro de linha de costura dentro de uma cabeça de alfinete.']
}, 'valores de referência do genoma humano, arredondados')

T('Ciência', '🔬', 'celulas', 'Os tipos de célula e quanto cada uma dura',
    'Tem célula que dura a vida inteira e célula que não passa de um mês, e todas elas são do mesmo dono.',
    ['Tamanho', 'Tempo de vida', 'Função'], {
    neuronio: ['Neurônio', 'corpo microscópico, fio que chega a quase um metro', 'costuma durar a vida toda', 'leva o sinal elétrico', 'O nervo que vai da coluna até o dedão do pé é uma célula só, esticada por quase um metro. E é praticamente o mesmo neurônio com que a pessoa nasceu.'],
    hemacia: ['Hemácia', 'uns 7 milésimos de milímetro', 'perto de 120 dias', 'carrega o oxigênio', 'Ela joga fora o próprio núcleo para caber mais oxigênio dentro. Por isso não consegue se dividir nem se consertar, e a fábrica do corpo precisa produzir milhões por segundo.'],
    ovulo: ['Óvulo', 'a maior do corpo, do tamanho de um ponto final', 'formado antes mesmo do nascimento', 'guarda quase toda a bagagem da primeira célula', 'É a única célula humana que dá para enxergar sem microscópio, se a luz ajudar. A mulher já nasce com o estoque pronto e não fabrica mais nenhuma depois disso.'],
    espermatozoide: ['Espermatozoide', 'a menor do corpo', 'poucos dias', 'entrega só o material genético', 'Ele é quase só cabeça e rabo, sem bagagem nenhuma. O que fica de fora na hora do encontro é justamente o que explica por que uma parte da herança vem sempre da mãe.'],
    ossea: ['Célula do osso', 'presa dentro do próprio osso', 'anos, dentro de um osso que se refaz', 'constrói e desmancha osso', 'O esqueleto parece a parte mais parada do corpo, mas tem turma derrubando e turma levantando o tempo todo. O osso de um adulto se renova por inteiro ao longo de alguns anos.'],
    pelecel: ['Célula da pele', 'microscópica e achatada', 'cerca de um mês até cair', 'faz a barreira externa', 'Ela nasce lá embaixo, vai subindo, endurece e morre no caminho. A camada que separa a pessoa do mundo é feita de célula morta bem empilhada.']
})

T('Ciência', '🦠', 'microbios', 'Bactéria, vírus e fungo: quem é quem',
    'Micróbio virou sinônimo de doença, mas a maioria nunca fez mal a ninguém e alguns fazem falta quando somem.',
    ['O que é', 'Tamanho', 'Antibiótico resolve?'], {
    bacteria: ['Bactéria', 'ser vivo de uma célula só, sem núcleo', 'milésimos de milímetro', 'sim, é justamente o alvo dele', 'A esmagadora maioria não faz mal nenhum e boa parte é útil. Sem bactéria não tem queijo, iogurte, pão de fermentação natural nem intestino funcionando direito.'],
    virus: ['Vírus', 'material genético dentro de uma capa', 'muito menor que a bactéria', 'não, não faz efeito nenhum', 'Sozinho ele não come, não cresce e não se reproduz. Precisa invadir uma célula viva e usar a máquina dela, e é por isso que tem gente que nem chama isso de ser vivo.'],
    fungo: ['Fungo', 'ser vivo próprio, nem planta nem bicho', 'de microscópico a cogumelo grande', 'não, precisa de antifúngico', 'Na árvore da vida o fungo está mais perto da gente do que da planta. Por isso remédio que mata fungo costuma incomodar o paciente: o alvo se parece demais com a célula dele.'],
    protozoario: ['Protozoário', 'uma célula só, mas com núcleo', 'bem maior que a bactéria', 'não, tem remédio próprio', 'É o grupo por trás da malária, da doença de Chagas e da amebíase. Bicho de uma célula só que se move, caça e às vezes viaja de mosquito em mosquito.'],
    prion: ['Príon', 'só uma proteína com o formato errado', 'menor que vírus', 'não, e quase nada resolve', 'Não tem material genético nenhum, só um dobramento torto que obriga as proteínas vizinhas a entortar igual. Foi o que causou o susto da vaca louca.'],
    vizinhanca: ['A vizinhança do corpo', 'trilhões de micróbios morando na gente', 'somados, não passariam de um punhado', 'atinge todo mundo junto, sem escolher', 'Tomar antibiótico é bombardeio de área, não tiro certeiro. Ele derruba o causador da doença e leva junto boa parte da vizinhança útil, e daí vem a barriga desarrumada.']
})

T('Ciência', '💉', 'vacinashistoria', 'As vacinas que mudaram o mundo',
    'Doenças que assombraram gerações inteiras hoje quase só aparecem em livro, e na maioria das vezes por causa de uma agulha.',
    ['Quando chegou', 'Alcance hoje', 'Detalhe'], {
    variola: ['Varíola', 'fim do século 18, com Edward Jenner', 'doença apagada do planeta', 'a palavra vacina vem de vaca', 'É a única doença humana que o mundo conseguiu eliminar de vez. Sobraram amostras do vírus trancadas em dois laboratórios, e a briga sobre destruir esse resto arrasta há décadas.'],
    polio: ['Poliomielite', 'anos 1950 e 1960', 'restam pouquíssimos focos no mundo', 'no Brasil virou gotinha e mascote', 'Quem cresceu antes dela viu colega de escola ficar de muleta. Hoje o obstáculo não é mais a ciência: é fazer o frasco chegar em região de guerra e em lugar sem estrada.'],
    raiva: ['Raiva', 'década de 1880, com Louis Pasteur', 'usada até depois da mordida', 'vale para cão, gato e morcego', 'Pasteur aplicou num menino mordido por cão raivoso sem saber se ia funcionar. A raiva declarada mata quase todo mundo, então tudo vira corrida contra o vírus subindo pelo nervo.'],
    febreamarela: ['Febre amarela', 'anos 1930', 'uma dose vale por muitos anos', 'o trabalho rendeu prêmio Nobel', 'O vírus não some porque vive em macaco no mato, e o mosquito só faz a ponte até a cidade. Quando começa a aparecer macaco morto numa região, é aviso de que gente vai adoecer em seguida.'],
    sarampo: ['Sarampo', 'anos 1960', 'volta assim que a cobertura cai', 'é das doenças mais contagiosas que existem', 'Ele acha qualquer bolsão de gente desprotegida numa cidade grande. Países que já tinham comemorado o fim da doença voltaram a registrar surto depois que a fila do posto esvaziou.'],
    tetano: ['Tétano', 'anos 1920', 'pede reforço de tempos em tempos', 'a bactéria mora no chão e não some', 'Não dá para erradicar bicho que vive na terra do quintal, então o jeito é treinar o corpo contra o veneno dele. O prego enferrujado não é o vilão: o vilão é a terra que veio junto.']
})

T('Ciência', '💊', 'remedios', 'Remédios que mudaram a medicina',
    'Boa parte dos remédios que viraram o jogo saiu de bolor esquecido, de casca de árvore ou de um acidente de bancada.',
    ['Quando', 'Para que serve', 'Detalhe'], {
    penicilina: ['Penicilina', 'achada em 1928, usada nos anos 1940', 'derruba bactéria', 'saiu de um bolor em placa esquecida', 'Fleming topou com o bolor por descuido e nem ele conseguiu virar aquilo em remédio. Quem fez isso foi outro time, mais de dez anos depois, apressado pela guerra.'],
    aspirina: ['Aspirina', 'fim do século 19', 'dor, febre e sangue mais fino', 'o princípio veio da casca do salgueiro', 'O chá de casca de salgueiro já era remédio de avó muito antes de alguém isolar o que havia ali dentro. O uso que hoje é o mais importante, mexer na coagulação, só foi descoberto bem depois.'],
    anestesia: ['Anestesia', 'meados do século 19', 'apaga a dor da cirurgia', 'antes dela se operava com o paciente acordado', 'Cirurgião bom era cirurgião rápido, porque o paciente estava amarrado e consciente. Com a dor fora do caminho, a operação pôde ficar lenta, caprichada e muito mais profunda.'],
    insulina: ['Insulina', 'anos 1920', 'controla o diabetes tipo 1', 'a patente foi vendida por valor simbólico', 'Antes dela, criança com diabetes tipo 1 não passava de alguns meses. Os descobridores abriram mão do lucro de propósito, e mesmo assim o preço do frasco disparou décadas depois.'],
    antirretrovirais: ['Antirretrovirais', 'anos 1990, em coquetel', 'seguram o vírus do HIV', 'viraram doença fatal em doença crônica', 'Um remédio sozinho falhava porque o vírus se adaptava depressa demais. A sacada foi atacar por várias frentes de uma vez, e hoje quem toma direito nem transmite mais.'],
    soro: ['Soro de reidratação', 'anos 1960 e 1970', 'repõe água e sal na diarreia', 'água, açúcar e sal na medida certa', 'Uma mistura que cabe num copo salvou mais criança que quase todo aparelho caro de hospital. O açúcar não está ali por gosto: é ele que abre a porta para o sal e a água entrarem.']
})

T('Ciência', '🩺', 'cirurgias', 'Marcos da cirurgia',
    'A cirurgia só virou coisa de se aceitar depois de resolver dois problemas antigos: a dor e a infecção.',
    ['Quando', 'O marco', 'Detalhe'], {
    antissepsia: ['Antissepsia', 'meados do século 19', 'mão e instrumento lavados antes de operar', 'Semmelweis primeiro, Lister depois', 'Semmelweis mostrou com números que médico vindo da sala de autópsia matava parturiente. Foi ridicularizado pelos colegas, perdeu o emprego e morreu antes de alguém aceitar a conta dele.'],
    coracao: ['Transplante de coração', '1967', 'primeira troca feita em ser humano', 'na Cidade do Cabo, com Christiaan Barnard', 'O primeiro paciente viveu dezoito dias e morreu de pneumonia. Costurar nunca foi a parte difícil: difícil é convencer o corpo a aceitar uma peça que não é dele.'],
    catarata: ['Cirurgia de catarata', 'moderna a partir dos anos 1940', 'lente artificial colocada dentro do olho', 'hoje é das operações mais feitas do mundo', 'A ideia veio de piloto de guerra com lasca de cabine acrílica presa no olho, que o corpo não expulsava. Um médico inglês reparou nisso e mandou fabricar a primeira lente de dentro do olho.'],
    cesarea: ['Cesárea', 'segura só a partir do século 19', 'parto pela barriga sem matar a mãe', 'no Brasil o problema virou o excesso', 'O nome não vem de Júlio César ter nascido assim, isso é lenda antiga: a mãe dele viveu muitos anos depois. Até o século 19 a operação só era feita com a mãe já morrendo, para tentar tirar o bebê.'],
    laparoscopia: ['Laparoscopia', 'popular a partir dos anos 1980', 'operar por furinhos, olhando numa tela', 'alta em dias, não em semanas', 'Operar por buraco pequeno deu mais trabalho ao cirurgião e muito menos ao paciente. Quem tirava a vesícula ficava semanas de repouso, e hoje costuma ir para casa no dia seguinte.'],
    protese: ['Mão biônica', 'avanço forte a partir dos anos 2000', 'prótese que obedece ao próprio músculo', 'sensores leem a contração do braço', 'A mão artificial moderna não lê pensamento, lê a contração do que sobrou do músculo. O usuário aprende a mandar um sinal novo e o aparelho aprende a traduzir aquele sinal.']
})

T('Ciência', '🐒', 'evolucao', 'A evolução da vida em degraus',
    'A história da vida cabe numa escada de poucos degraus, e a gente só aparece no último centímetro do último deles.',
    ['Há quanto tempo', 'O degrau', 'Detalhe'], {
    primeirascelulas: ['As primeiras células', 'bilhões de anos atrás', 'vida de uma célula só, sem núcleo', 'tudo no mar, com o ar ainda irrespirável', 'Por muito mais tempo do que a gente imagina, a vida inteira do planeta foi lodo microscópico. Bicho que dá para ver a olho nu é novidade recente perto da idade da Terra.'],
    oxigenio: ['O ar virou respirável', 'bilhões de anos atrás', 'micróbio passou a soltar oxigênio', 'enferrujou o ferro dissolvido no oceano', 'O oxigênio que a gente respira começou como poluição de micróbio. Ele envenenou boa parte da vida que existia até então, e quem sobrou foi justamente quem aprendeu a usar o veneno.'],
    multicelular: ['Vida com muitas células', 'centenas de milhões de anos atrás', 'as células passaram a viver em time', 'aparecem os primeiros bichos com corpo', 'Viver em time exige que cada célula abra mão de se reproduzir por conta própria. Quando uma delas volta atrás nesse acordo dentro de um corpo pronto, o nome que se dá é câncer.'],
    terrafirme: ['A saída para a terra firme', 'centenas de milhões de anos atrás', 'planta e bicho fora da água', 'a nadadeira vira pata com dedo', 'Sair da água não foi façanha heroica, foi vantagem de quem aguentava a beira seca. Os ossos do braço de uma pessoa são os mesmos daquela nadadeira antiga, só com outro formato.'],
    dinossauros: ['O tempo dos dinossauros', 'dezenas a centenas de milhões de anos atrás', 'répteis tomaram conta da terra firme', 'a ave é o dinossauro que sobrou', 'A galinha do quintal é parente mais próxima do tiranossauro do que o lagarto do muro. Um ramo de dinossauro pequeno e emplumado atravessou a catástrofe e virou passarinho.'],
    humanos: ['Gente moderna', 'algo em torno de trezentos mil anos', 'a nossa espécie surge na África', 'só depois se espalha pelo mundo', 'Numa escala de relógio, a humanidade inteira aparece nos últimos segundos. E por boa parte desse tempo a gente dividiu o planeta com outras espécies de gente, não estava sozinha.']
}, 'ordens de grandeza, não datas cravadas')

T('Ciência', '☄️', 'extincoes', 'As cinco grandes extinções, e a sexta',
    'Cinco vezes a vida quase acabou, e toda vez que ela voltou foi com outro elenco no comando do planeta.',
    ['Quando', 'Quanto sumiu', 'Causa provável'], {
    ordoviciano: ['Extinção do Ordoviciano', 'cerca de 440 milhões de anos atrás', 'boa parte das espécies do mar', 'gelo avançando e mar recuando', 'A vida ainda estava quase toda dentro d\'água, então foi um desastre de mar. O nível do oceano baixou e secou justamente os rasos onde quase todo bicho da época morava.'],
    devoniano: ['Extinção do Devoniano', 'cerca de 370 milhões de anos atrás', 'recifes e vida de água rasa', 'falta de oxigênio na água, em ondas', 'Não foi um baque só, foram várias pancadas espalhadas por milhões de anos. Os recifes daquela época levaram um tempo enorme para reaparecer no planeta depois disso.'],
    permiano: ['Extinção do Permiano', 'cerca de 250 milhões de anos atrás', 'a maior de todas, quase tudo', 'vulcanismo gigante na Sibéria', 'Chamam de a mãe das extinções porque ela quase apagou a vida complexa da face da Terra. Sobrou tão pouca coisa que os poucos sobreviventes tiveram espaço livre para reinventar o mundo.'],
    triassico: ['Extinção do Triássico', 'cerca de 200 milhões de anos atrás', 'muitos répteis e anfíbios grandes', 'vulcanismo com a abertura do Atlântico', 'Ela limpou o terreno para os dinossauros. Eles já existiam e eram coadjuvantes, e só viraram donos do pedaço porque a concorrência sumiu do mapa de uma vez.'],
    cretaceo: ['Extinção do Cretáceo', 'cerca de 66 milhões de anos atrás', 'os dinossauros não voadores e muito mais', 'meteoro no golfo do México, e vulcanismo', 'A cratera está enterrada sob a península de Yucatán e só foi identificada por gente procurando petróleo. O que matou a maioria não foi o impacto e sim o inverno de poeira que veio depois.'],
    atual: ['A extinção em curso', 'agora, medida em décadas', 'perdas aceleradas em todo continente', 'caça, desmatamento e clima', 'Esta é a primeira em que a causa consegue ler sobre ela mesma. O ritmo de espécie desaparecendo já está bem acima do que os fósseis mostram como perda normal de rotina.']
}, 'datas da escala geológica, arredondadas')

T('Ciência', '🦴', 'fosseis', 'Fósseis e como se data o passado',
    'Ninguém mede a idade de um osso olhando para ele: mede-se a terra em volta, e o osso fica preso no meio.',
    ['O que é', 'Alcance', 'Detalhe'], {
    carbono14: ['Carbono 14', 'relógio do carbono que ainda resta no material', 'até algo em torno de 50 mil anos', 'só serve para o que um dia foi vivo', 'Passado esse limite sobra carbono de menos para medir, e por isso ele não serve para dinossauro. Quem tenta datar dinossauro com carbono 14 está medindo a contaminação, não o bicho.'],
    potassioargonio: ['Potássio-argônio', 'relógio guardado na rocha vulcânica', 'de milhões a bilhões de anos', 'data a camada, nunca o osso', 'A cinza vulcânica de baixo e a de cima são datadas, e o fóssil fica espremido entre as duas. É como achar um recado entre duas páginas com data e deduzir quando ele foi escrito.'],
    camadas: ['Camadas do terreno', 'leitura da ordem em que a terra se empilhou', 'vale em qualquer idade', 'o de baixo é mais velho que o de cima', 'Essa regra simples é mais antiga que qualquer relógio químico e continua de pé. Quando a sequência aparece invertida, é sinal de que aquele pedaço de terreno virou de cabeça para baixo.'],
    ambar: ['Âmbar', 'resina de árvore que endureceu', 'dezenas de milhões de anos', 'guarda o bicho inteiro, com pelo e asa', 'Dá para ver a cerda da perna de um mosquito de milhões de anos atrás como se fosse ontem. O que não dá é tirar dali material genético que preste, ao contrário do que o cinema prometeu.'],
    pegadas: ['Pegadas', 'marca de passo que endureceu na lama', 'centenas de milhões de anos', 'conta comportamento, não anatomia', 'Osso diz como o bicho era, pegada diz o que ele estava fazendo naquele minuto. Dá para calcular a velocidade da corrida e descobrir se ele andava sozinho ou em bando.'],
    fossilvivo: ['Fóssil vivo', 'espécie de hoje parecida com a bem antiga', 'linhagens de milhões de anos', 'celacanto, nautilo e ginkgo', 'O celacanto era dado como extinto havia milhões de anos até aparecer numa feira de peixe na África do Sul. O apelido engana: eles continuaram evoluindo, só mudaram pouco por fora.']
})

T('Ciência', '🪨', 'rochas', 'Rochas, minerais e a escala de dureza',
    'Toda rocha do planeta cabe em três famílias, e a dureza dos minerais tem escala própria, que vai do talco ao diamante.',
    ['Como se forma', 'Detalhe', 'Onde aparece'], {
    ignea: ['Rocha ígnea', 'magma que esfriou', 'rápido vira vidro, devagar vira cristal', 'basalto de calçada e granito de bancada', 'A mesma lava pode virar duas rochas bem diferentes só pelo tempo que levou esfriando. Cristal grande e visível é sinal de que aquilo cozinhou fundo e com muita calma.'],
    sedimentar: ['Rocha sedimentar', 'grão que se acumulou e endureceu', 'é a única que guarda fóssil', 'arenito e barranco listrado de beira de estrada', 'Só aqui o bicho morto fica inteiro, porque não passa por calor nem por esmagamento. Praticamente todo fóssil de museu saiu de rocha desse tipo, e de nenhum outro.'],
    metamorfica: ['Rocha metamórfica', 'outra rocha cozida e prensada', 'muda de cara sem chegar a derreter', 'mármore de pia e ardósia de churrasqueira', 'Calcário apertado e aquecido vira mármore, e barro vira ardósia. É a rocha mudando de personalidade no estado sólido, sem nunca passar por líquido.'],
    granito: ['Granito', 'magma esfriando bem lá no fundo', 'cristais grandes, visíveis a olho nu', 'bancada de cozinha e morro do Rio', 'Aquele salpicado preto, branco e rosa não é pintura: é grão de mineral diferente que cresceu grudado. O Pão de Açúcar é um bloco só dessa rocha, sem emenda.'],
    calcario: ['Calcário', 'concha e esqueleto de bicho do mar', 'dissolve com ácido, até com chuva', 'grutas, cimento e cal de pintura', 'Toda caverna grande de calcário foi cavada por água meio ácida, gota por gota, ao longo de muito tempo. A montanha de hoje já foi fundo de mar cheio de carcaça.'],
    diamante: ['Diamante', 'carbono prensado bem fundo na Terra', 'o topo da escala de dureza, nota dez', 'joia, e também ponta de broca', 'É o mesmo carbono do grafite do lápis, só arrumado de outro jeito. Duro não é a mesma coisa que resistente: uma martelada no ponto certo racha um diamante sem esforço.']
})

T('Ciência', '🌫️', 'atmosfera', 'As camadas do ar, da troposfera ao espaço',
    'O ar não acaba de repente: ele vai ficando ralo camada após camada até ninguém mais saber dizer onde começa o espaço.',
    ['Altura', 'Temperatura', 'O que acontece lá'], {
    troposfera: ['Troposfera', 'do chão até cerca de 10 a 15 km', 'esfria conforme se sobe', 'é onde tem nuvem, chuva e vento', 'Quase todo o ar do planeta está espremido nessa camada fininha. O avião de carreira voa bem no teto dela, atrás de ar rarefeito e de céu sem turbulência.'],
    estratosfera: ['Estratosfera', 'até perto de 50 km', 'esquenta conforme se sobe', 'é onde fica a camada de ozônio', 'Ela esquenta para cima porque o ozônio segura a luz que queimaria a gente. Com o ar quente por cima, quase nada se mistura ali, e é por isso que a camada é tão calma.'],
    mesosfera: ['Mesosfera', 'até cerca de 85 km', 'a parte mais fria de toda a atmosfera', 'é onde o meteoro pega fogo', 'Toda estrela cadente que você já viu virou risco de luz aqui. É a faixa mais difícil de estudar: alta demais para balão e baixa demais para satélite se manter.'],
    termosfera: ['Termosfera', 'centenas de quilômetros de altura', 'milhares de graus que não queimariam você', 'é onde nasce a aurora', 'A temperatura é altíssima e ao mesmo tempo inofensiva, porque sobrou partícula de menos para passar calor adiante. A estação espacial dá voltas na Terra bem dentro dessa faixa.'],
    exosfera: ['Exosfera', 'vai sumindo por milhares de quilômetros', 'não faz sentido falar em temperatura do ar', 'o ar escapa para o espaço', 'Aqui uma partícula pode viajar quilômetros sem esbarrar em nenhuma outra. Não existe borda: a atmosfera não termina, ela só fica rala até não dar mais para contar.'],
    linhaespaco: ['A linha do espaço', 'cerca de 100 km de altura', 'convenção combinada, não parede', 'acima dela, voo vira voo espacial', 'A altura foi escolhida porque dali para cima a asa não sustenta mais nada: teria que voar rápido demais para arrancar apoio do ar. E nem todo país adota o mesmo número.']
})

T('Ciência', '💡', 'invencoes', 'Invenções que mudaram o dia a dia',
    'Toda invenção que virou rotina já foi novidade barulhenta, e quase nenhuma delas teve um inventor só.',
    ['Quando apareceu', 'O que mudou', 'Detalhe'], {
    roda: ['A roda', 'por volta de 3500 a.C., na Mesopotâmia', 'Carregar peso sem arrastar', 'Nasceu deitada, como torno de oleiro', 'O difícil nunca foi a roda: foi o eixo, que precisa girar sem torcer nem travar. Vários povos da América tinham rodinhas em brinquedos e não usavam roda para transporte, porque não tinham animal de tração.'],
    imprensa: ['A imprensa de tipos móveis', 'por volta de 1450, com Gutenberg', 'Livro deixou de ser artigo de luxo', 'A China já tinha tipos móveis antes', 'O mérito de Gutenberg não foi o tipo solto, e sim o conjunto: liga de metal que aguentava a prensa, tinta oleosa que grudava nela e uma prensa de vinho adaptada.'],
    lampada: ['A lâmpada elétrica', 'filamento comercial em 1879', 'A noite virou horário útil', 'Edison melhorou, não inventou sozinho', 'Já existiam lâmpadas antes dele. O que faltava era filamento que durasse e uma rede elétrica que valesse a pena, e foi a rede, não a lâmpada, o verdadeiro negócio.'],
    telefone: ['O telefone', 'patente de Bell em 1876', 'A voz passou a viajar', 'Três pessoas chegaram quase juntas', 'Antonio Meucci demonstrou um aparelho antes e não teve dinheiro para manter a patente viva. Elisha Gray protocolou pedido parecido no mesmo dia que Bell, e perdeu por horas.'],
    geladeira: ['A geladeira doméstica', 'popular a partir dos anos 1920', 'Comida fresca longe da roça', 'Os primeiros modelos vazavam gás tóxico', 'Ela mudou o que o mundo come mais do que qualquer receita. Também derrubou a intoxicação alimentar e permitiu que cidade grande se alimentasse de comida produzida a centenas de quilômetros.'],
    antibiotico: ['O antibiótico', 'penicilina em escala nos anos 1940', 'Ferida infeccionada deixou de matar', 'Antes dele, um arranhão podia ser fatal', 'Fleming viu o mofo matar bactéria e não conseguiu purificar a substância. Foram Florey e Chain, mais de dez anos depois, que transformaram aquilo em remédio de guerra.']
})

T('Ciência', '🎲', 'invencoesacaso', 'Invenções que nasceram de um erro',
    'Nem toda invenção veio de plano: algumas nasceram de um acidente que alguém teve a curiosidade de olhar duas vezes.',
    ['Quem tropeçou', 'O que procurava', 'O que saiu'], {
    microondas: ['O forno de micro-ondas', 'Percy Spencer, em 1945', 'Testava radar militar', 'Comida quente sem fogo', 'A barra de chocolate no bolso dele derreteu perto do equipamento ligado. O teste seguinte foi com milho de pipoca, e estourou. O primeiro forno vendido pesava mais que um adulto.'],
    postit: ['O bilhete adesivo', 'Spencer Silver e Art Fry, na 3M', 'Queria uma cola bem forte', 'Uma cola fraca que descola sem sujar', 'A cola errada ficou anos parada na gaveta da empresa. Só virou produto quando um colega de coral cansou de perder a página do hinário e lembrou daquela gosma que ninguém queria.'],
    velcro: ['O velcro', 'George de Mestral, em 1941', 'Só passeava com o cachorro', 'Fecho de ganchinho e argolinha', 'Ele voltou do mato cheio de carrapicho grudado na calça e no pelo do cão. Em vez de xingar, levou um ao microscópio e viu os ganchos. Levou mais de dez anos para virar produto.'],
    vulcanizacao: ['A borracha vulcanizada', 'Charles Goodyear, em 1839', 'Borracha que não derretesse', 'O pneu que existe até hoje', 'A borracha crua virava melado no calor e pedra no frio. A mistura com enxofre caiu no fogão por descuido e cozinhou. Ele morreu endividado, e o nome só ficou famoso na marca de outra gente.'],
    teflon: ['O teflon da frigideira', 'Roy Plunkett, em 1938', 'Um gás novo para refrigeração', 'O pó mais escorregadio que se conhecia', 'O cilindro de gás pareceu vazio, mas pesava. Serrado ao meio, tinha por dentro uma cera branca em que nada grudava. Antes de chegar à cozinha, serviu em projeto militar secreto.'],
    sacarina: ['A sacarina', 'Constantin Fahlberg, em 1879', 'Estudava derivados de alcatrão', 'O primeiro adoçante artificial', 'Ele jantou sem lavar as mãos direito e achou o pão doce demais. Voltou ao laboratório provando os frascos um por um, coisa que hoje daria demissão e talvez enterro.']
})

T('Ciência', '🧱', 'materiais', 'Os materiais que sustentam o mundo',
    'Quase tudo que você encosta hoje é feito de meia dúzia de materiais, e cada um chegou aí por um motivo bem prático.',
    ['Do que é feito', 'Onde aparece', 'Ponto forte'], {
    aco: ['Aço', 'Ferro com uma pitada de carbono', 'Prédio, ponte, carro, panela', 'Aguenta ser esticado sem quebrar', 'A diferença entre ferro e aço cabe numa pitada: carbono de menos e ele amolece, carbono demais e ele quebra feito vidro. Foi o forno de Bessemer que baixou o preço e levantou as cidades.'],
    concreto: ['Concreto', 'Cimento, areia, brita e água', 'Fundação, laje, viaduto, barragem', 'Barato e aguenta compressão como rocha', 'Concreto é ótimo apertado e péssimo esticado, por isso levou ferro dentro. Só que o ferro enferruja, incha e racha o concreto de dentro para fora. Obra de concreto armado tem prazo de validade.'],
    vidro: ['Vidro', 'Areia derretida a quase mil e setecentos graus', 'Janela, garrafa, tela, lente', 'Deixa a luz passar e não reage com quase nada', 'Aquela história de que o vidro é um líquido que escorre com o século é lenda. Vitral antigo é mais grosso embaixo porque era assim que se fabricava a chapa, não porque desceu.'],
    aluminio: ['Alumínio', 'Bauxita separada com muita eletricidade', 'Lata, esquadria, avião, panela', 'Leve e não enferruja', 'Já foi mais caro que ouro, e Napoleão III servia os convidados de honra em talher de alumínio. Reciclar uma lata gasta uma fração mínima da energia de fazer a primeira.'],
    fibracarbono: ['Fibra de carbono', 'Fios de carbono colados com resina', 'Avião, bicicleta, carro de corrida', 'Rígida e muito leve para o peso', 'Ela não amassa: aguenta calada e depois estilhaça de uma vez. Por isso quadro de bicicleta trincado não se martela de volta, e a peça cara vira sucata sem conserto.'],
    silicio: ['Silício', 'Areia purificada até virar cristal', 'Chip, painel solar, memória', 'Conduz eletricidade só quando mandam', 'Uma pastilha de chip sai de areia comum levada a uma pureza absurda, quase sem átomo estranho. E cuidado com o nome: silicone de prótese e de vedação é outra coisa, feita a partir dele.']
})

T('Ciência', '♻️', 'plasticos', 'Os plásticos e quanto tempo ficam por aí',
    'Plástico não é um material só: são famílias diferentes, com usos diferentes e destinos bem diferentes depois do lixo.',
    ['Onde você vê', 'Número no símbolo', 'Tempo estimado no ambiente'], {
    pet: ['PET', 'Garrafa de refrigerante e de água', '1', 'estimado em algumas centenas de anos', 'É o campeão da reciclagem no Brasil, puxado por catador e não por coleta seletiva. A garrafa volta como fibra de camiseta, enchimento de travesseiro, cerda de vassoura e até corda.'],
    pead: ['PEAD', 'Frasco de detergente, tampa, caixa d\'água', '2', 'estimado em algumas centenas de anos', 'Aguenta produto químico agressivo sem se abrir, por isso guarda o que corrói. É dos plásticos que mais valem a pena reciclar, porque volta em peça grossa e resistente.'],
    pvc: ['PVC', 'Cano, esquadria, fio elétrico', '3', 'estimado em séculos', 'Tem cloro na composição, então queimar em fogueira de quintal solta gás que corrói pulmão. Enterrado como cano, é praticamente eterno, o que na obra é justamente a vantagem.'],
    pebd: ['PEBD', 'Sacolinha, filme de embalagem', '4', 'estimado em cerca de um a quatro séculos', 'É o mais difícil de reciclar, não por química, mas por logística: pesa quase nada, vem sujo de comida e voa. Vento tira do aterro e leva ao rio, do rio ao mar, onde a tartaruga confunde com água-viva.'],
    pp: ['PP', 'Pote de margarina, seringa, tampa de rosca', '5', 'estimado em algumas centenas de anos', 'Aguenta o micro-ondas porque só amolece bem depois dos cem graus. É o plástico que mais cresce no mundo, e desde que nasceu já é o que menos volta para a linha de reciclagem.'],
    ps: ['PS e isopor', 'Copinho, bandeja, caixa térmica', '6', 'estimado em séculos, sem medição confiável', 'Isopor é quase todo ar preso em bolha. Transportar custa mais do que o material vale, e é por isso que o ferro-velho não quer: ninguém paga frete de caminhão cheio de vento.']
}, 'tempos de degradação são estimativas de campanha ambiental, não medida de laboratório')

T('Ciência', '⚡', 'energia', 'As fontes de energia, o forte e o fraco',
    'Não existe fonte de energia perfeita, só troca: o que uma tem de sobra, a outra costuma ter de falta.',
    ['Como gera', 'Ponto forte', 'Ponto fraco'], {
    hidreletrica: ['Hidrelétrica', 'Água caindo gira a turbina', 'Liga e desliga conforme a demanda', 'Depende de chuva e alaga terra habitada', 'É a espinha do sistema brasileiro, e por isso o noticiário fala de nível de reservatório como quem fala de saldo bancário. Ano seco aqui não acende vela: acende termelétrica cara.'],
    solar: ['Solar', 'A luz arranca elétrons da placa', 'Cabe no telhado de casa', 'Só de dia, e nublado derruba', 'O preço do painel despencou de um jeito que quase ninguém previu, e virou a fonte nova mais barata em muito lugar. O gargalo agora não é gerar de dia: é guardar para a noite.'],
    eolica: ['Eólica', 'O vento gira a pá do cata-vento', 'Não gasta água nem combustível', 'Vento varia de hora em hora', 'No Nordeste o vento é dos mais constantes do mundo, e às vezes sobra tanta energia que o sistema precisa mandar desligar parque. Uma pá sozinha é maior que a asa de um avião grande.'],
    nuclear: ['Nuclear', 'Núcleo de urânio partido libera calor', 'Muita energia com pouca matéria', 'Lixo radioativo e medo de acidente', 'Um comprimido de urânio do tamanho da ponta do dedo rende o que renderia uma tonelada de carvão. O problema nunca foi o rendimento: é o que fazer com o rejeito por milhares de anos.'],
    carvao: ['Carvão', 'Queima e ferve água para o vapor', 'Barato, constante e fácil de estocar', 'A mais suja de todas', 'Foi ela que moveu a revolução industrial e é ela que ainda gera a maior fatia de eletricidade do mundo. Mata gente todo ano pelo ar que suja, não pelo acidente que aparece na televisão.'],
    biomassa: ['Biomassa', 'Queima bagaço, lenha ou lixo orgânico', 'Aproveita o que ia virar resto', 'Ocupa terra e fumaça também polui', 'Usina de açúcar brasileira queima o bagaço da cana, move a própria fábrica e ainda vende o que sobra para a rede. E a safra cai justo no período seco, quando a hidrelétrica está fraca.']
})

T('Ciência', '⛽', 'combustiveis', 'Combustíveis e o que cada um rende',
    'Todo combustível é energia guardada esperando fogo, e a diferença entre eles é quanto cabe em cada litro do tanque.',
    ['De onde vem', 'Onde é usado', 'Rendimento'], {
    gasolina: ['Gasolina', 'Destilada do petróleo', 'Carro e moto de vela', 'a referência da bomba', 'A gasolina que você compra no Brasil não é gasolina pura: leva perto de um terço de etanol anidro misturado por lei. Gasolina de verdade, sem mistura, só em posto de país que não planta cana.'],
    etanol: ['Etanol', 'Cana, e nos Estados Unidos, milho', 'Carro flex', 'rende cerca de setenta por cento do litro de gasolina', 'Daí a conta da regra dos setenta por cento na bomba: se o litro custar mais que isso, a gasolina compensa. A diferença some quando o motor é ajustado só para álcool, que aceita mais compressão.'],
    diesel: ['Diesel', 'Destilado mais pesado do petróleo', 'Caminhão, ônibus, trator, gerador', 'rende um pouco mais que a gasolina por litro', 'É o combustível que define o preço do que você come, porque tudo que chega ao mercado chegou de caminhão. E o motor dele não tem vela: acende só apertando o ar até esquentar.'],
    querosene: ['Querosene de avião', 'Faixa entre a gasolina e o diesel', 'Turbina de avião', 'parecido com o diesel', 'Ele precisa continuar líquido a quarenta graus negativos, senão vira gel na altitude de cruzeiro e entope o filtro. Por isso é fabricado com controle de congelamento mais rígido que o do posto.'],
    gasnatural: ['Gás natural', 'Sai do poço junto com o petróleo', 'Fogão, indústria, táxi', 'rende pouco por volume, precisa ir comprimido', 'Queima mais limpo que gasolina e diesel, e é por isso que táxi de rodagem alta compensa. O preço é o cilindro pesado que come o porta-malas e precisa de teste periódico.'],
    hidrogenio: ['Hidrogênio', 'Separado da água ou do gás natural', 'Ônibus, empilhadeira, indústria', 'o que mais rende por quilo e menos por litro', 'Ele não é fonte, é carregador: só vale o que gastaram para produzir. Feito com gás natural, suja tanto quanto o resto. Feito com eletricidade limpa, custa caro e ainda assim ocupa tanque enorme.']
})

T('Ciência', '⚙️', 'motores', 'Os motores e o truque de cada um',
    'Motor é sempre a mesma ideia, transformar energia em empurrão, e o que muda é onde o fogo acontece.',
    ['Como empurra', 'Onde vive', 'Detalhe'], {
    vapor: ['Máquina a vapor', 'Vapor de fora empurra o pistão', 'Locomotiva, fábrica, navio antigo', 'Queima fora do motor', 'Ela não liga: acende. A caldeira leva quase uma hora para ficar no ponto, e por isso maquinista chegava muito antes do passageiro. Foi ela que tirou a fábrica da beira do rio.'],
    otto: ['Motor de combustão interna', 'Mistura explode dentro do cilindro', 'Carro, moto, cortador de grama', 'A vela é o que o separa do diesel', 'Em quatro tempos ele só empurra num deles, e nos outros três vive de embalo do volante. Por isso um cilindro sozinho treme e quatro em sequência andam liso.'],
    eletrico: ['Motor elétrico', 'Ímã e bobina se empurram', 'Carro, ventilador, furadeira, trem', 'Força total desde parado', 'Um motor a combustão tem centenas de peças se mexendo; o elétrico tem uma. Ele também funciona ao contrário: quando o carro freia, vira gerador e devolve energia para a bateria.'],
    jato: ['Motor a jato', 'Suga ar, comprime, queima e cospe', 'Avião de linha e caça', 'Só funciona onde tem ar', 'É por isso que o avião tem teto de altitude: acima de certo ponto não sobra ar para queimar. E quase todo o empurrão de um motor moderno vem do ar que passa por fora, não do que pega fogo.'],
    foguete: ['Foguete', 'Leva o oxigênio junto e joga fogo para trás', 'Fora da atmosfera', 'Quase todo o peso é combustível', 'Como carrega o próprio ar, funciona no vácuo, onde não há nada para empurrar. E o gargalo é cruel: para levar mais carga precisa de mais combustível, que também precisa ser levantado.'],
    dieselnavio: ['Diesel marítimo', 'Pistões enormes girando devagar', 'Navio cargueiro', 'Alto como prédio de quatro andares', 'Ele gira cerca de cem voltas por minuto, dez vezes menos que um carro, e por isso liga direto na hélice sem caixa de marcha. Queima um óleo tão grosso que precisa ser aquecido para escorrer.']
})

T('Ciência', '💻', 'computacao', 'Marcos da computação, degrau por degrau',
    'A computação não deu um salto só: foram degraus, e cada um deixou o anterior parecendo brinquedo de madeira.',
    ['Quando', 'O salto', 'Tamanho'], {
    babbage: ['Máquina analítica de Babbage', 'projetada nos anos 1830', 'Primeiro projeto de computador programável', 'Uma sala de engrenagem de bronze', 'Nunca foi construída enquanto ele viveu, faltou dinheiro e paciência do governo. Ada Lovelace escreveu para ela o que se considera o primeiro programa, e foi a primeira a dizer que aquilo serviria para mais que número.'],
    eniac: ['ENIAC', 'ligado em 1945', 'Primeiro cálculo eletrônico em grande escala', 'Trinta toneladas em uma sala inteira', 'Programar era trocar cabo e girar chave, trabalho de seis mulheres matemáticas que apareciam nas fotos como se fossem modelos posando. Válvula queimava toda hora e achar a queimada era o serviço do dia.'],
    transistor: ['Transistor', 'inventado em 1947', 'Substituiu a válvula que queimava', 'Cabia na palma da mão', 'Ele faz o mesmo que a válvula sem esquentar, sem queimar e sem ocupar espaço. É a peça que todo o resto desta lista tem dentro, hoje aos bilhões em cada aparelho que você carrega.'],
    microprocessador: ['Microprocessador', 'o primeiro chegou em 1971', 'O computador inteiro virou uma pastilha', 'Do tamanho de uma unha', 'Nasceu de encomenda de uma fabricante japonesa de calculadora, e o cliente nem quis os direitos. A empresa que fez ficou com eles por uma pechincha e construiu um império em cima.'],
    pessoal: ['Computador pessoal', 'a partir de meados dos anos 1970', 'Saiu da sala refrigerada e entrou em casa', 'Cabia numa escrivaninha', 'Os primeiros vinham em caixa para montar, sem tela e sem teclado, e se programava por chavinhas no painel. Quem comprava era fanático por eletrônica, e foi essa turma que fundou o vale inteiro.'],
    celular: ['Celular com tela', 'popularizado a partir de 2007', 'Computador no bolso, o dia todo ligado', 'Menor que a mão', 'O aparelho que você usa para ver vídeo de gato faz mais conta por segundo que qualquer supercomputador dos anos 1980. E o que mais consome bateria nele não é a conta: é acender a tela.']
})

T('Ciência', '🌐', 'internet', 'A internet por dentro',
    'A internet parece coisa do ar, sem lugar, mas ela é feita de cabo, ferro e gente pagando conta de luz.',
    ['O que é', 'Onde fica', 'Quando falha'], {
    cabosubmarino: ['Cabo submarino', 'Fibra ótica no fundo do mar', 'Entre continentes, deitado na lama', 'País inteiro fica lento', 'A esmagadora maioria do tráfego entre continentes passa por cabo submarino, não por satélite. Cada um é fino como uma mangueira de jardim, e quem mais corta é âncora de navio pescando fundo demais.'],
    endereco: ['Endereço de rede', 'O número que identifica seu aparelho', 'Distribuído pelo provedor', 'Você some da rede', 'Os endereços do padrão antigo acabaram de verdade: eram cerca de quatro bilhões e o mundo tem mais aparelho que isso. A casa inteira sai para a rua com um endereço só, e o roteador faz o desvio.'],
    dns: ['Servidor de nomes', 'A lista que traduz nome em número', 'Em servidores espalhados pelo mundo', 'Tudo parece fora do ar', 'Quando ele cai, a frase que todo mundo fala é que a internet caiu, mas os sites estão de pé. É como ter o telefone funcionando e ter perdido a agenda com os números.'],
    roteador: ['Roteador', 'A portaria entre sua casa e a rua', 'Na estante da sala, piscando', 'A casa fica sem rede', 'Wi-fi não é internet, é só o último pulo sem fio. Mudar o aparelho de lugar resolve mais reclamação de lentidão do que trocar de plano, porque parede, espelho e micro-ondas atrapalham o sinal.'],
    satelite: ['Satélite', 'Antena que rebate o sinal do céu', 'Em órbita, alto ou baixo', 'Chuva forte derruba', 'O satélite antigo fica tão alto que o sinal demora um tanto perceptível para ir e voltar, e essa demora atrapalha jogo e conversa. A leva nova voa baixo e rápido, o que corta a espera e enche o céu.'],
    provedor: ['Provedor', 'A empresa que te liga na rede grande', 'No poste da rua e num galpão', 'Você fica ilhado', 'O contrato diz até tanto, e esse até é levado a sério: a rua inteira divide o mesmo cano. E a conta vem em bits, enquanto o download aparece em bytes, oito vezes menor, o que parece roubo e não é.']
})

T('Ciência', '💾', 'armazenamento', 'A memória dos computadores em degraus',
    'Guardar arquivo já foi trabalho braçal, e cada degrau desta lista guardou mais ocupando menos espaço na mesa.',
    ['Quando reinou', 'Quanto guardava', 'Como falhava'], {
    cartao: ['Cartão perfurado', 'anos 1950 e 1960', 'Um cartão guardava uma linha de programa', 'Derrubar a caixa no chão', 'Um programa era uma caixa de papelão com milhares de cartões em ordem. Para o caso de a caixa cair, riscava-se uma faixa diagonal com caneta na lateral do lote: fora de ordem, a risca denunciava.'],
    disquete: ['Disquete', 'anos 1980 e 1990', 'Pouco mais de um megabyte no formato final', 'Perto de ímã, morria', 'O ícone de salvar que todo programa ainda usa é o desenho de um objeto que a maioria dos jovens nunca segurou. Ele não cabe uma foto de celular de hoje, e às vezes um trabalho de escola precisava de três.'],
    cd: ['CD', 'anos 1990 e 2000', 'Cerca de setecentos megabytes', 'Risco fundo e sol', 'Conta a lenda da fabricante que a duração foi escolhida para caber a Nona Sinfonia de Beethoven inteira num disco só. O prateado é alumínio finíssimo, e é a camada que oxida quando o disco envelhece.'],
    hd: ['Disco rígido', 'de 1990 até hoje, em servidor', 'De megabytes a dezenas de terabytes', 'Batida forte ligado', 'Dentro dele um disco gira a milhares de voltas por minuto e uma cabeça plana sobrevoa a superfície mais perto do que a espessura de um fio de cabelo, sem nunca encostar. Encostar é o fim.'],
    pendrive: ['Pendrive', 'dos anos 2000 em diante', 'De gigabytes a centenas de gigabytes', 'Cansa de tanto gravar', 'Não tem peça que se mexa, o que o torna resistente a queda e imune a ímã. Em troca, cada célula aguenta um número limitado de regravações, e barato demais some com o arquivo sem avisar.'],
    nuvem: ['Nuvem', 'de 2010 em diante', 'O quanto você quiser pagar', 'Sem internet, sem arquivo', 'Nuvem é o computador de outra pessoa, num galpão com ar-condicionado e gerador. Seu arquivo costuma estar em três máquinas ao mesmo tempo, e a conta de luz desses galpões pesa no consumo de um país.']
})

T('Ciência', '☢️', 'radioatividade', 'Radiação sem pânico e sem descuido',
    'Radiação assusta porque ninguém vê, mas ela sempre esteve por aqui, e o que decide o estrago é o tipo e a dose.',
    ['O que é', 'O que barra', 'Onde aparece'], {
    alfa: ['Radiação alfa', 'Um pedaço pesado de núcleo', 'Uma folha de papel ou a própria pele', 'Urânio, rádio, detector de fumaça antigo', 'De fora ela não passa da roupa. Engolida ou respirada, é a pior de todas, porque solta toda a energia num punhado de células vizinhas. Foi assim que um envenenamento com polônio virou caso de espionagem.'],
    beta: ['Radiação beta', 'Um elétron cuspido em alta velocidade', 'Uma chapa fina de alumínio', 'Carbono catorze, exame de tireoide', 'O carbono catorze some pela metade a cada cinco mil e setecentos anos mais ou menos, e é essa contagem que data múmia, carvão de fogueira e tronco antigo com boa margem.'],
    gama: ['Radiação gama', 'Onda de energia altíssima, como luz braba', 'Chumbo grosso ou parede de concreto', 'Esterilização, radioterapia, reator', 'O acidente de Goiânia começou com um aparelho de hospital abandonado e uma cápsula de césio aberta a marreta. O pó azul brilhava no escuro, e foi passado de mão em mão como novidade bonita.'],
    raiox: ['Raio X', 'Radiação feita por máquina, não por átomo', 'Avental de chumbo', 'Chapa médica, dentista, bagagem', 'A grande vantagem é o interruptor: desligou a máquina, acabou a radiação, não fica nada na sala nem em você. A dose de uma chapa de tórax é menor que a de umas semanas de vida normal.'],
    neutron: ['Nêutrons', 'Partícula sem carga saindo do núcleo', 'Água e concreto, melhor que chumbo', 'Dentro de reator e em pesquisa', 'É a única que faz o material em volta ficar radioativo também. Por isso, quando uma usina é desmontada, boa parte do próprio prédio precisa ser tratada como rejeito.'],
    fundonatural: ['Radiação natural', 'A que sempre existiu no planeta', 'Nada barra por completo', 'Solo, pedra, comida e o seu corpo', 'A maior parte da dose que uma pessoa recebe na vida não vem de usina nem de exame: vem do gás que sobe do solo, do granito da bancada, da banana do café da manhã e do raio cósmico de cada voo.']
}, 'valores usuais de referência em proteção radiológica, arredondados')

T('Ciência', '⏱️', 'relogios', 'Como a humanidade mediu o tempo',
    'Antes do relógio de pulso, marcar hora era serviço de sol, água e areia, e cada minuto a mais custava caro.',
    ['Como marca', 'Quando reinou', 'Precisão'], {
    solar: ['Relógio de sol', 'A sombra de uma haste anda no chão', 'da Antiguidade ao fim da Idade Média', 'depende do sol e da estação', 'Com ele a hora não tinha tamanho fixo: dividia-se o dia claro em partes iguais, então a hora de verão era mais longa que a de inverno. Relógio de sol bem feito ainda precisa de ajuste conforme o mês.'],
    agua: ['Relógio de água', 'A água escorre de um vaso para outro', 'Egito, Grécia, Roma, China', 'erra minutos por hora', 'No tribunal romano cada advogado falava enquanto o vaso escorria, e pedir mais água era pedir mais tempo de fala. Ele tinha a vantagem enorme de continuar funcionando à noite e no dia nublado.'],
    ampulheta: ['Ampulheta', 'A areia cai por um gargalo estreito', 'a bordo dos navios, do século 14 em diante', 'mede intervalo, não diz a hora', 'Ela não sabe que horas são, só quanto tempo passou, e é justamente isso que servia no mar. Um grumete virava a ampulheta a cada meia hora, e o descuido dele bagunçava a conta da viagem toda.'],
    pendulo: ['Relógio de pêndulo', 'Um peso balança sempre no mesmo compasso', 'de meados do século 17 ao século 20', 'erra segundos por dia', 'Ele derrubou o erro de quinze minutos por dia para menos de um, e foi ele que tornou possível marcar hora igual em cidades diferentes. Só que não funciona em navio balançando, e isso travou a navegação por décadas.'],
    quartzo: ['Relógio de quartzo', 'Um cristal vibra quando recebe corrente', 'dos anos 1970 em diante', 'erra segundos por mês', 'O cristal vibra dezenas de milhares de vezes por segundo, sempre igual, e o circuito só conta essas vibrações. Ele ficou tão barato e tão certo que quase quebrou a relojoaria suíça inteira.'],
    atomico: ['Relógio atômico', 'Conta a vibração do átomo de césio', 'de 1955 em diante, nos laboratórios', 'erra menos de um segundo em milhões de anos', 'O segundo oficial do mundo deixou de ser uma fatia do dia e passou a ser definido por esse átomo. Sem ele o navegador do celular erraria quilômetros, porque a posição sai de contas de microssegundo.']
})

T('Ciência', '💧', 'agua', 'A água do planeta em números',
    'O planeta é quase todo água e mesmo assim falta água, porque quase nada dela está num lugar de onde dê para beber.',
    ['Onde está', 'Fatia do total', 'Dá para beber'], {
    salgada: ['Água salgada', 'Oceanos e mares', 'cerca de noventa e sete por cento', 'não', 'Beber água do mar desidrata: o rim precisa gastar mais água para expulsar o sal do que veio no gole. Náufrago que bebe apressa a própria morte, e isso já custou tripulação inteira.'],
    geleiras: ['Gelo e geleira', 'Antártida, Groenlândia, alta montanha', 'a maior parte de toda a água doce', 'em tese sim, se derretesse', 'A maior parte da água doce do mundo está congelada e fora do alcance de qualquer torneira. As geleiras de montanha são caixa d\'água de cidade grande, e estão encolhendo ano após ano.'],
    subterranea: ['Água subterrânea', 'Poros e fendas de rocha, sob os pés', 'quase toda a água doce líquida', 'sim, e é a mais usada no mundo', 'Debaixo de parte do Brasil, Paraguai, Uruguai e Argentina existe um dos maiores reservatórios subterrâneos do planeta. O problema é a conta: enche devagar, em séculos, e se esvazia em poucas décadas de bomba.'],
    rioselagos: ['Rios e lagos', 'A água que você enxerga', 'uma fração mínima do total', 'sim, depois de tratada', 'É dessa migalha que quase toda cidade bebe. E o Amazonas sozinho despeja no mar perto de um quinto de toda a água doce que os rios do mundo entregam aos oceanos.'],
    atmosfera: ['Água na atmosfera', 'Nuvem, vapor e neblina', 'quase nada, e mesmo assim chove', 'é a origem de toda chuva', 'Ela é pouquíssima, mas roda depressa: uma gota evaporada volta como chuva em cerca de uma semana. É essa pressa que move os rios voadores que saem da Amazônia e molham o Sudeste.'],
    consumo: ['O gasto de uma pessoa', 'Na torneira, no chuveiro e na descarga', 'perto de cento e cinquenta litros por dia', 'sim, e boa parte vai pelo ralo', 'No Brasil, quase quatro de cada dez litros tratados somem no caminho, em cano furado e ligação clandestina, antes de chegar em casa. A conta é sempre pelo banho, e o vazamento é que bebe.']
}, 'divisão usual da água do planeta e média de consumo urbano brasileiro, arredondadas')

T('Ciência', '🎨', 'cores', 'Como as cores se formam',
    'Cor não está no objeto: ela nasce no encontro entre a luz, a superfície e três tipos de célula lá no fundo do seu olho.',
    ['O que acontece', 'Onde você vê', 'Se misturar tudo'], {
    luz: ['Cor de luz', 'Vermelho, verde e azul se somam', 'Tela de celular, televisão, palco', 'dá branco', 'A tela não tem ponto amarelo nenhum: ela acende vermelho e verde lado a lado e o seu olho entrega o amarelo de graça. Uma gota d\'água sobre a tela funciona como lupa e mostra os três pontinhos.'],
    tinta: ['Cor de tinta', 'O pigmento come parte da luz', 'Impressora, lata de tinta, pintura', 'dá um marrom sujo', 'Por isso a impressora tem um cartucho preto separado: misturando as outras três nunca sai um preto de verdade, sai um borrão esverdeado que ainda por cima encharca o papel.'],
    pigmento: ['A cor de um objeto', 'A superfície devolve o que não absorve', 'Folha verde, camisa azul, parede', 'quanto menos devolve, mais escuro', 'A cor que você vê é justamente a luz que o objeto rejeitou. A folha é verde porque come o vermelho e o azul para viver e devolve o verde, ou seja, ela é da cor que menos aproveita.'],
    arcoiris: ['Arco-íris', 'A gota de chuva separa a luz branca', 'De costas para o sol, depois da chuva', 'volta a dar branco', 'O arco é na verdade um círculo inteiro: o chão é que corta a metade de baixo, e de avião dá para ver redondo. Quando aparece um segundo arco por fora, ele vem com as cores na ordem trocada.'],
    daltonismo: ['Daltonismo', 'Um tipo de célula do olho sai trocada', 'Mais em homens que em mulheres', 'não muda o que a pessoa vê', 'O gene fica no cromossomo X, e por isso atinge cerca de um em cada doze homens e pouquíssimas mulheres. A confusão clássica é entre verde e vermelho, o que explica o semáforo ter ordem fixa.'],
    magenta: ['Magenta', 'O cérebro inventa para fechar o círculo', 'Rosa, pink, roxo de revista', 'é pura invenção do olho', 'Não existe comprimento de onda de magenta: nenhuma fatia do arco-íris tem essa cor. Quando o olho recebe vermelho e azul juntos e nada de verde, o cérebro cria uma cor nova para não ficar sem resposta.']
})

/* ───────────────────────────── HISTÓRIA ───────────────────────────── */

T('História', '📜', 'mesopotamia', 'A Mesopotâmia, onde a escrita nasceu',
    'Entre o Tigre e o Eufrates apareceram as primeiras cidades grandes, e com elas o hábito de anotar tudo em barro.',
    ['Onde ficava', 'Época aproximada', 'Marca registrada'], {
    uruk: ['Uruk', 'Sul do atual Iraque, perto do Eufrates', 'por volta de 3200 a.C.', 'As primeiras tabuinhas escritas', 'As tabuinhas mais antigas não trazem poema nem oração: são recibos de cevada, óleo e cerveja. A escrita nasceu da contabilidade, para o templo saber quem devia o quê a quem.'],
    ur: ['Ur', 'Sul do atual Iraque', 'por volta de 2100 a.C.', 'Zigurate e tumbas reais', 'As tumbas de Ur vieram cheias de harpas, jogos de tabuleiro e gente enterrada junto. O Jogo Real de Ur teve as regras achadas numa tabuinha, e dá para jogar até hoje.'],
    acadia: ['Acádia de Sargão', 'Centro da Mesopotâmia', 'por volta de 2300 a.C.', 'O primeiro império de que se tem notícia', 'Sargão contava que foi bebê abandonado num cesto e criado por um jardineiro. A filha dele, Enheduana, assinou os próprios hinos: é o nome de autor mais antigo que se conhece.'],
    babilonia: ['Babilônia de Hamurábi', 'Centro do atual Iraque', 'por volta de 1750 a.C.', 'Leis gravadas em pedra à vista de todos', 'O código não tratava todo mundo igual: a pena mudava se a vítima fosse nobre, plebeu ou escravo. E boa parte dos artigos é sobre preço de aluguel, salário de pedreiro e conserto de barco.'],
    ninive: ['Nínive assíria', 'Norte do atual Iraque, perto de Mossul', 'por volta de 650 a.C.', 'A biblioteca de Assurbanípal', 'O incêndio que derrubou a cidade foi o que salvou a biblioteca: o fogo cozinhou a argila e endureceu as tabuinhas. Delas saiu a cópia mais completa da epopeia de Gilgamesh.'],
    basesessenta: ['A contagem de base sessenta', 'Invenção suméria, espalhada pelo mundo todo', 'por volta de 2000 a.C.', 'Hora, minuto e grau', 'Todo relógio do planeta ainda anda em ritmo sumério. Sessenta minutos, sessenta segundos e o círculo de trezentos e sessenta graus vieram de escribas que contavam nas falanges dos dedos.']
}, 'datas da periodização mais aceita, arredondadas')

T('História', '🔺', 'egitoantigo', 'O Egito Antigo, do Nilo às pirâmides',
    'O Egito durou tanto tempo que Cleópatra viveu mais perto da chegada do homem à Lua do que da construção da Grande Pirâmide.',
    ['Quando', 'Onde', 'O que ficou'], {
    gize: ['As pirâmides de Gizé', 'por volta de 2560 a.C.', 'Margem oeste do Nilo, perto do Cairo', 'A única das sete maravilhas antigas de pé', 'Não foram escravos. Escavações acharam a vila dos trabalhadores, com padaria, cervejaria e ossos remendados por médicos. Era gente paga, alimentada e enterrada com honra ali do lado.'],
    hatshepsut: ['Hatshepsut', 'por volta de 1470 a.C.', 'Tebas, no Alto Egito', 'Templo de Deir el-Bahari', 'Governou como faraó e mandou se retratar de barba postiça, porque o cargo tinha forma masculina. Décadas depois do reinado, alguém tentou raspar o nome dela dos monumentos.'],
    akhenaton: ['Akhenaton', 'por volta de 1350 a.C.', 'Amarna, cidade construída do zero', 'Uma reforma que não sobreviveu ao autor', 'Mudou religião, arte e capital de uma vez, e os artistas passaram a mostrar a família real de barriga e tudo. Na geração seguinte tudo voltou ao normal e a cidade nova virou areia.'],
    tutancamon: ['Tutancâmon', 'por volta de 1330 a.C.', 'Vale dos Reis', 'A tumba quase intacta', 'Foi um rei menor, morto ainda adolescente, e ficou famoso só porque os ladrões não acharam a tumba dele. A tal maldição foi invenção de jornal para vender papel.'],
    ramses: ['Ramsés II', 'por volta de 1270 a.C.', 'Pi-Ramessés, no delta do Nilo', 'Abu Simbel e uma pilha de estátuas', 'Reinou por mais de sessenta anos e enterrou os próprios filhos. Depois de empatar com os hititas em Cadesh, mandou esculpir a batalha nas paredes como vitória esmagadora.'],
    cleopatra: ['Cleópatra VII', 'por volta de 40 a.C.', 'Alexandria', 'A última do Egito independente', 'Era de família grega, da linhagem dos Ptolomeus, e foi a primeira deles a se dar ao trabalho de aprender a língua egípcia. Falava várias e negociava sem intérprete.']
}, 'datas da periodização mais aceita, arredondadas')

T('História', '🏛️', 'greciaantiga', 'A Grécia Antiga, cidade por cidade',
    'Não existia um país chamado Grécia: existiam centenas de cidades independentes que só se juntavam sob ameaça ou nos jogos.',
    ['Onde ficava', 'Como se governava', 'Fama'], {
    atenas: ['Atenas', 'Ática, no centro da Grécia', 'Democracia direta, por sorteio de cargos', 'Filosofia, teatro e uma frota grande', 'A assembleia decidia na mão levantada, mas mulheres, estrangeiros e escravizados ficavam de fora. Votava perto de um em cada seis moradores adultos da cidade.'],
    esparta: ['Esparta', 'Lacônia, no Peloponeso', 'Dois reis ao mesmo tempo e um conselho de anciãos', 'Treinamento militar desde menino', 'Os trezentos das Termópilas não estavam sozinhos: havia milhares de aliados gregos no desfiladeiro, e os tésbios ficaram até o fim junto com eles.'],
    corinto: ['Corinto', 'No istmo que liga o Peloponeso', 'Oligarquia de comerciantes', 'Riqueza de porto e de pedágio', 'Ficava entre dois mares e cobrava por isso. Tinha uma rampa de pedra, o diolco, por onde barcos eram arrastados por terra para não dar a volta no Peloponeso.'],
    tebas: ['Tebas', 'Beócia, ao norte de Atenas', 'Liga de cidades vizinhas', 'O exército que derrubou Esparta', 'Por gerações Esparta foi tida como invencível em campo aberto. Tebas venceu em Leuctra com uma formação torta, empilhando tropa de um lado só, e a lenda espartana acabou ali.'],
    siracusa: ['Siracusa', 'Costa leste da Sicília', 'Tiranos, com intervalos de democracia', 'Cidade grega mais rica do Ocidente', 'Foi lá que Arquimedes passou a vida e morreu, morto por um soldado romano durante o cerco. Diziam que projetou guindastes que levantavam navios inteiros pela proa.'],
    mileto: ['Mileto', 'Costa da atual Turquia', 'Assembleia de cidadãos, sob pressão persa', 'Berço dos primeiros filósofos', 'Tales e seus alunos começaram a explicar o mundo sem recorrer ao sobrenatural, e é daí que se costuma marcar o começo da filosofia. A cidade também fundou dezenas de colônias no mar Negro.']
})

T('História', '🐺', 'romarepublica', 'Roma, da aldeia de pastores à república',
    'Antes dos imperadores, Roma passou séculos governada por cargos de mandato curto, inventados para que ninguém mandasse sozinho.',
    ['Quem ocupava', 'Quanto durava', 'O que podia fazer'], {
    consulado: ['Os cônsules', 'Dois patrícios eleitos, depois também plebeus', 'Um ano, sem repetir logo em seguida', 'Comandar o exército e presidir o senado', 'Eram dois de propósito, e um podia barrar o outro. Em campanha, revezavam o comando dia sim, dia não, e essa mania de alternar custou caro contra Aníbal em Canas.'],
    senado: ['O senado', 'Ex-magistrados, vitalícios', 'Para a vida toda', 'Aconselhar, cuidar do dinheiro e da guerra', 'No papel o senado só dava conselho: quem mandava era o povo reunido. Na prática, o conselho de trezentos homens ricos decidia quase tudo, e a fórmula do poder era o costume, não a lei.'],
    tribunato: ['Os tribunos da plebe', 'Plebeus eleitos pela própria plebe', 'Um ano', 'Vetar qualquer decisão e proteger plebeus', 'O poder veio de uma greve: a plebe saiu da cidade e se recusou a voltar até ter representante. O corpo do tribuno era intocável, e encostar nele valia pena de morte.'],
    ditadura: ['O ditador', 'Nomeado numa emergência', 'Seis meses, no máximo', 'Mandar em tudo, sem prestar contas', 'Era cargo legal e temporário. Cincinato largou o arado, resolveu a guerra e devolveu o poder em poucos dias. Sula e Júlio César foram os que quebraram o prazo, e a república não sobreviveu.'],
    censura: ['Os censores', 'Dois ex-cônsules de muito prestígio', 'Dezoito meses, a cada cinco anos', 'Contar o povo e vigiar o comportamento', 'Faziam o recenseamento, mas também podiam expulsar um senador por má fama ou por exagero no luxo. É dessa fiscalização de costumes que vem a palavra censura.'],
    gracos: ['Os irmãos Graco', 'Tribunos de família nobre', 'Um ano cada, na prática menos', 'Tentar repartir terra pública com os pobres', 'Propuseram limitar quanta terra pública um rico podia tomar e foram mortos por turbas ligadas ao senado. Depois deles, disputa política em Roma passou a se resolver com sangue.']
})

T('História', '🦅', 'imperioromano', 'O Império Romano e seus imperadores',
    'O império nunca teve regra clara de sucessão, e foi essa falta que transformou o trono num prêmio de guerra civil.',
    ['Quando governou', 'Como chegou lá', 'Como saiu'], {
    augusto: ['Augusto', 'de 27 a.C. a 14 d.C.', 'Herdeiro de César, venceu a guerra civil', 'Morreu velho, na cama', 'Nunca se chamou de rei nem de imperador no sentido moderno: preferia primeiro cidadão, e manteve o senado funcionando. Mudou tudo fingindo que nada tinha mudado.'],
    nero: ['Nero', 'de 54 a 68', 'Adotado por Cláudio, com empurrão da mãe', 'Suicídio, com o exército contra ele', 'Não tocou violino enquanto Roma queimava: o instrumento só apareceu mil e quinhentos anos depois, e ele estava fora da cidade. Voltou às pressas e abriu os próprios jardins aos desabrigados.'],
    trajano: ['Trajano', 'de 98 a 117', 'Adotado pelo antecessor', 'Morreu de doença na volta da Pérsia', 'Foi o primeiro imperador nascido fora da Itália, na atual Espanha. Levou as fronteiras ao ponto mais largo que já tiveram, e o sucessor abandonou parte da conquista por achar indefensável.'],
    marcoaurelio: ['Marco Aurélio', 'de 161 a 180', 'Adotado e preparado desde jovem', 'Morreu em campanha, na fronteira', 'Escreveu para si mesmo, em grego, um caderno de anotações que nunca pretendeu publicar. Governou entre peste e guerra e ainda assim quebrou a tradição, deixando o trono para o próprio filho.'],
    diocleciano: ['Diocleciano', 'de 284 a 305', 'Subiu pelo exército, de origem humilde', 'Abdicou e foi plantar repolho', 'Dividiu o império entre quatro governantes para caber na administração. Foi o único a largar o cargo por vontade própria, e recusou voltar dizendo que sua horta estava melhor que o trono.'],
    constantino: ['Constantino', 'de 306 a 337', 'Aclamado pela tropa do pai e venceu os rivais', 'Morreu no cargo', 'Mudou a capital para uma cidade grega chamada Bizâncio e deu a ela seu nome. Essa metade do império continuou de pé por mais mil anos depois que Roma caiu.']
})

T('História', '🐉', 'chinaimperial', 'A China imperial, dinastia por dinastia',
    'Por mais de dois mil anos, cada dinastia derrubou a anterior e depois passou décadas copiando o que ela tinha de bom.',
    ['Quando', 'Capital principal', 'O que deixou'], {
    qin: ['Qin', 'de 221 a 206 a.C.', 'Xianyang', 'A unificação e o primeiro imperador', 'Padronizou escrita, moeda e até a distância entre as rodas das carroças. Durou quinze anos, menos tempo do que levou para cavar o exército de terracota que guarda o túmulo do fundador.'],
    han: ['Han', 'de 206 a.C. a 220 d.C.', 'Chang\'an e depois Luoyang', 'Papel, concurso público e Rota da Seda', 'A maioria dos chineses ainda se chama de povo han, pelo nome dessa dinastia. Foi nela que se inventou o papel barato e se começou a escolher funcionário por prova escrita, não por berço.'],
    tang: ['Tang', 'de 618 a 907', 'Chang\'an', 'Poesia, impressão em blocos e cidade aberta', 'A capital recebia comerciantes persas, monges indianos e músicos turcos. Foi também a única vez em que uma mulher, Wu Zetian, governou em nome próprio, com título de imperador.'],
    song: ['Song', 'de 960 a 1279', 'Kaifeng e depois Hangzhou', 'Dinheiro de papel, bússola e pólvora', 'Foi a economia mais adiantada do mundo na época, com cidades de mais de um milhão de pessoas e nota de papel circulando séculos antes da Europa. Perdeu o norte para invasores e seguiu rica no sul.'],
    ming: ['Ming', 'de 1368 a 1644', 'Nanquim e depois Pequim', 'Cidade Proibida e a muralha de tijolo', 'A Grande Muralha que aparece nas fotos é quase toda desta época, não do primeiro imperador. E não, não dá para vê-la a olho nu do espaço: é comprida, mas estreita como uma estrada.'],
    qing: ['Qing', 'de 1644 a 1912', 'Pequim', 'O maior território e o fim do sistema', 'Os imperadores eram manchus, gente do nordeste, e obrigaram os homens a usar a trança como sinal de submissão. A última a mandar de fato foi a imperatriz viúva Cixi.']
}, 'datas da periodização mais aceita')

T('História', '🕉️', 'indiaantiga', 'A Índia antiga e seus impérios',
    'Antes de qualquer império indiano havia cidades com esgoto planejado, e ninguém ainda conseguiu ler uma linha do que escreviam.',
    ['Quando', 'Onde ficava', 'O que deixou'], {
    indo: ['Civilização do Indo', 'por volta de 2500 a.C.', 'Vale do Indo, atual Paquistão e noroeste indiano', 'Cidades em tabuleiro, com banheiro e esgoto', 'Mohenjo-Daro tinha rua reta, poço e canalização quando Londres ainda não existia. A escrita deles continua sem tradução, e sem palácio nem túmulo rico ninguém sabe quem mandava.'],
    maurya: ['Império Máuria', 'por volta de 320 a.C.', 'Do Ganges até o Afeganistão', 'O primeiro estado a unir quase toda a Índia', 'Chandragupta começou com tropa pequena e terminou negociando de igual para igual com um general de Alexandre, levando quinhentos elefantes de guerra no acordo.'],
    asoka: ['Asoka', 'por volta de 260 a.C.', 'Capital em Pataliputra, atual Patna', 'Ordens gravadas em pilares e rochas', 'Depois de vencer uma guerra sangrenta em Kalinga, mandou escrever nas pedras do império que estava arrependido. É raro um governante antigo publicar o próprio remorso.'],
    gupta: ['Império Gupta', 'de 320 a 550 aproximadamente', 'Norte da Índia', 'O zero como número e a numeração decimal', 'Os algarismos que o mundo inteiro usa saíram daqui, foram levados pelos árabes e chegaram à Europa com nome trocado. Ariabata já calculava o valor de pi com boa aproximação.'],
    nalanda: ['Nalanda', 'de 400 a 1200 aproximadamente', 'Bihar, no nordeste da Índia', 'Uma das primeiras universidades do mundo', 'Recebia estudantes da China, da Coreia e do Tibete, que atravessavam meio continente para entrar. A biblioteca ardeu num saque e, segundo o relato, o fogo durou dias.'],
    chola: ['Império Chola', 'de 850 a 1250 aproximadamente', 'Sul da Índia, costa de Tâmil Nadu', 'Marinha de guerra e bronzes fundidos', 'Foram dos poucos impérios indianos a atravessar o mar para conquistar: chegaram ao Sri Lanka e às ilhas da Indonésia. As esculturas de bronze deles continuam sendo copiadas.']
}, 'datas da periodização mais aceita, arredondadas')

T('História', '🏹', 'persia', 'O Império Persa, de Ciro a Dario',
    'Quase tudo que se conta dos persas foi escrito por gregos, que eram justamente o povo que eles não conseguiram engolir.',
    ['Quando', 'Alcance', 'Marca de governo'], {
    ciro: ['Ciro, o Grande', 'por volta de 550 a.C.', 'Da Anatólia à Ásia Central', 'Deixou cada povo com sua língua e seu culto', 'O cilindro de argila dele é chamado de primeira carta de direitos humanos, mas o texto segue uma fórmula babilônica comum. O que impressiona mesmo é ter mandado os exilados voltarem para casa.'],
    dario: ['Dario I', 'de 522 a 486 a.C.', 'Do Egito e da Trácia até o rio Indo', 'Províncias, imposto fixo e moeda própria', 'Dividiu o império em satrapias e mandou inspetores de surpresa, apelidados de olhos e ouvidos do rei. Também cunhou o dárico, moeda de ouro aceita muito além da fronteira.'],
    xerxes: ['Xerxes I', 'de 486 a 465 a.C.', 'Chegou até a Grécia central', 'A invasão que o Ocidente nunca esqueceu', 'Perdeu no mar em Salamina, mas antes disso venceu nas Termópilas e queimou Atenas. Os filmes esquecem que ele voltou para casa e governou por mais vinte anos.'],
    estradareal: ['A Estrada Real', 'construída por volta de 500 a.C.', 'De Susa a Sardes, mais de dois mil quilômetros', 'Postos de troca de cavalo a cada etapa', 'Um mensageiro fazia em uma semana o que um viajante comum levava três meses. Foi descrevendo esse correio que Heródoto escreveu a frase sobre nem neve nem chuva deterem o mensageiro.'],
    persepolis: ['Persépolis', 'começada por volta de 518 a.C.', 'Sudoeste do atual Irã', 'Palácio cerimonial com escadaria esculpida', 'Alexandre a incendiou, e o fogo cozinhou os arquivos de argila. Neles está a folha de pagamento da obra: os operários recebiam ração, prata e licença-maternidade, e não eram escravos.'],
    sassanidas: ['Império Sassânida', 'de 224 a 651', 'Do Iraque ao Afeganistão', 'Séculos de guerra de igual para igual com Roma', 'Chegaram a capturar um imperador romano vivo. Duas potências se desgastaram tanto uma contra a outra que, quando os exércitos árabes apareceram, nenhuma das duas tinha fôlego para resistir.']
}, 'datas da periodização mais aceita, arredondadas')

T('História', '⛵', 'fenicios', 'Fenícios, Cartago e o mar Mediterrâneo',
    'Um punhado de cidades pequenas no atual Líbano virou dona do mar por fazer bem duas coisas: navegar de noite e vender caro.',
    ['Onde ficava', 'Do que vivia', 'Como terminou'], {
    biblos: ['Biblos', 'Costa do atual Líbano', 'Exportar madeira de cedro e papiro', 'Foi engolida por impérios maiores', 'A cidade revendia papiro egípcio para os gregos, e o nome dela acabou virando a palavra grega para livro. É daí que veio, por caminho tortuoso, a palavra Bíblia.'],
    tiro: ['Tiro', 'Ilha rente à costa libanesa', 'Tingir tecido de púrpura e fundar colônias', 'Caiu depois de sete meses de cerco', 'A tinta púrpura saía de um caracol do mar, e precisava de milhares deles para tingir uma única roupa. Ficou tão cara que virou cor de rei, e usá-la sem permissão dava cadeia.'],
    sidon: ['Sídon', 'Costa do atual Líbano', 'Vidro soprado e comércio de luxo', 'Trocou de dono várias vezes e seguiu viva', 'Os vidreiros de lá aprenderam a soprar vidro em vez de moldar, e o copo deixou de ser artigo de nobre. Foi uma das primeiras vezes que uma técnica barateou o luxo de vez.'],
    alfabeto: ['O alfabeto fenício', 'Nascido nas cidades da costa', 'Anotar carga, dívida e contrato de navio', 'Virou o avô de quase todo alfabeto atual', 'Tinha só consoante, e foram os gregos que acrescentaram as vogais. As letras que você está lendo agora descendem em linha reta daqueles rabiscos de comerciante.'],
    cartago: ['Cartago', 'Perto da atual Tunis', 'Comércio de metal, cereal e escala de rota', 'Arrasada por Roma em 146 a.C.', 'A história de que os romanos salgaram a terra para nada mais crescer ali é invenção do século dezenove. Menos de cem anos depois, Roma refundou a cidade e ela voltou a ser rica.'],
    anibal: ['Aníbal Barca', 'General cartaginês, no sul da Itália', 'Ganhar batalha atrás de batalha', 'Exilado, morreu longe de casa', 'Atravessou os Alpes com elefantes, mas quase todos morreram no caminho e no inverno seguinte. Passou quinze anos vencendo dentro da Itália sem nunca conseguir cercar Roma.']
}, 'datas da periodização mais aceita')

T('História', '🌽', 'maias', 'Os maias, cidades dentro da floresta',
    'Não era um império só: eram dezenas de cidades rivais que faziam aliança, guerra e casamento, como as cidades gregas.',
    ['Onde fica', 'Auge', 'O que deixou'], {
    tikal: ['Tikal', 'Norte da Guatemala', 'entre 200 e 900 aproximadamente', 'Pirâmides altas saindo por cima das árvores', 'A cidade dependia de reservatórios cavados à mão para atravessar a seca. Quando a chuva falhou por décadas seguidas, nem o melhor engenheiro segurou a população no lugar.'],
    calakmul: ['Calakmul', 'Campeche, no sul do México', 'entre 500 e 700 aproximadamente', 'A grande rival de Tikal', 'Por mais de um século as duas se enfrentaram por aliados, não por território, comprando a lealdade de cidades menores. Era guerra de influência, e as inscrições contam os dois lados.'],
    palenque: ['Palenque', 'Chiapas, no sul do México', 'entre 600 e 800 aproximadamente', 'A tumba de Pacal, sob uma pirâmide', 'A laje do sarcófago mostra o rei morto entre raízes e já foi vendida por aí como desenho de astronauta. Os textos ao redor explicam a cena, e ela não tem nada de foguete.'],
    copan: ['Copán', 'Oeste de Honduras', 'entre 400 e 800 aproximadamente', 'A escadaria com o texto maia mais longo', 'São mais de mil e quinhentos sinais gravados em degraus de pedra. Uma restauração antiga remontou os blocos na ordem errada, e até hoje se discute como ler o meio da escada.'],
    chichenitza: ['Chichén Itzá', 'Yucatán, no México', 'entre 800 e 1200 aproximadamente', 'O castelo e a maior quadra de jogo de bola', 'A pirâmide funciona como calendário: nos equinócios, a sombra dos degraus desenha uma serpente descendo a escada. Quem projetou sabia exatamente onde o sol estaria.'],
    escritamaia: ['A escrita e a conta do tempo', 'Toda a região maia', 'lida de verdade só a partir de 1960', 'Um calendário que conta os dias desde o começo', 'O tal fim do mundo em 2012 era só um contador virando de ciclo, como um relógio que passa das nove e cinquenta e nove. E os maias não sumiram: milhões de pessoas ainda falam línguas maias.']
}, 'datas da periodização mais aceita, arredondadas')

T('História', '🌋', 'astecas', 'Os astecas e a cidade sobre o lago',
    'Eles não se chamavam astecas: diziam mexicas, e é desse nome que saiu o nome do México.',
    ['O que era', 'Quando', 'Detalhe que fica'], {
    tenochtitlan: ['Tenochtitlán', 'Capital construída numa ilha do lago Texcoco', 'de 1325 a 1521', 'Calçadas, aqueduto e mercado diário gigante', 'Era maior que quase toda cidade europeia da época e os espanhóis não acreditaram no que viram. Tinha água doce trazida por aqueduto e gente varrendo as ruas todo dia.'],
    chinampas: ['As chinampas', 'Roças construídas sobre o lago raso', 'em uso desde antes do império', 'Várias colheitas por ano no mesmo pedaço', 'Chamam de jardins flutuantes, mas não flutuam: são camadas de lodo e planta fincadas no fundo com estaca de salgueiro. Em Xochimilco ainda se planta assim.'],
    tripleaianca: ['A Tríplice Aliança', 'Acordo entre Tenochtitlán, Texcoco e Tlacopan', 'de 1428 até a conquista', 'Repartia o tributo em partes desiguais', 'O império não ocupava as cidades vencidas: deixava o chefe local no lugar e cobrava tributo em algodão, cacau e trabalho. Quem atrasava recebia visita do exército.'],
    pochteca: ['Os pochteca', 'Comerciantes de longa distância', 'no século quinze', 'Levavam mercadoria e traziam informação', 'Viajavam meses até terras distantes e voltavam com relatório do que viram: estradas, defesas, humor do povo. Eram mercador e espião na mesma pessoa, e enriqueceram tanto que viraram problema.'],
    cacau: ['O cacau como dinheiro', 'Moeda corrente em toda a região', 'séculos antes e depois da conquista', 'Preço de tudo contado em amêndoas', 'Uma amêndoa comprava um tomate, algumas dezenas compravam um peru. Havia falsificação: gente esvaziava a casca e enchia de barro, o que rendeu punição prevista em lei.'],
    quedaimperio: ['A queda de 1521', 'Cerco de dois meses à capital', 'de 1519 a 1521', 'Fim do domínio mexica no vale', 'Cortés não venceu com poucos espanhóis: veio com dezenas de milhares de aliados indígenas, gente cansada de pagar tributo. A varíola fez o resto, matando antes mesmo dos combates.']
})

T('História', '🏔️', 'incas', 'Os incas e o império dos caminhos',
    'Governaram milhões de pessoas sem roda de transporte, sem ferro e sem escrita como a conhecemos, e ainda assim nada se perdia na conta.',
    ['O que era', 'Onde', 'Detalhe que fica'], {
    cusco: ['Cusco', 'Capital e centro de tudo', 'Serra do sul do Peru', 'Dali saíam as quatro estradas do império', 'O nome do império, Tawantinsuyu, quer dizer as quatro regiões juntas, e cada uma começava numa esquina da praça de Cusco. Endereço no império era dizer de que lado da capital você vinha.'],
    qhapaqnan: ['O Qhapaq Nan', 'Rede de estradas de pedra', 'Da Colômbia ao Chile, pela cordilheira', 'Degraus, pontes de corda e depósitos no caminho', 'São dezenas de milhares de quilômetros cruzando montanha, deserto e selva. As pontes de fibra trançada eram refeitas todo ano por comunidades vizinhas, e uma delas ainda é.'],
    quipu: ['O quipu', 'Cordas com nós, penduradas numa corda maior', 'Usado em todo o império', 'Guardava conta de gente, grão e tributo', 'A posição e o tipo do nó davam o número, e a cor dizia do que se falava. Parte dos quipos parece guardar também narrativa, e essa parte ninguém conseguiu ler até hoje.'],
    chasquis: ['Os chasquis', 'Corredores de revezamento', 'Postos a cada poucos quilômetros', 'Recado e encomenda em velocidade de cavalo', 'Diziam que peixe fresco do litoral chegava à mesa de Cusco em dois dias, subindo a cordilheira na mão de corredores que só faziam o próprio trecho e passavam adiante.'],
    machupicchu: ['Machu Picchu', 'Conjunto de construções na crista da montanha', 'Perto de Cusco, acima do rio Urubamba', 'Terraços, fonte de água e pedra encaixada', 'Nunca foi cidade perdida: famílias locais moravam e plantavam lá quando o forasteiro chegou em 1911. Era uma propriedade de descanso de um imperador, não fortaleza secreta.'],
    pedracortada: ['A pedra sem argamassa', 'Técnica de encaixe usada nos muros', 'Cusco, Sacsayhuamán e vales vizinhos', 'Blocos enormes juntos sem nada no meio', 'Os blocos foram desbastados a marteladas de pedra mais dura, com muito ajuste e paciência. O encaixe torto é de propósito: em terremoto a parede sacode, se acomoda e não cai.']
})

T('História', '🌍', 'africaantiga', 'Reinos africanos antes da colonização',
    'Muito antes de qualquer navio europeu descer a costa, havia na África estados grandes, ricos e cheios de livro.',
    ['Onde ficava', 'Auge', 'De onde vinha a riqueza'], {
    gana: ['Império do Gana', 'Sul da Mauritânia e oeste do Mali de hoje', 'de 700 a 1200 aproximadamente', 'Pedágio sobre o ouro e o sal que cruzavam', 'Não fica onde está o país chamado Gana hoje: o nome foi adotado na independência como homenagem. O rei cobrava imposto na entrada e na saída de cada carregamento.'],
    mali: ['Império do Mali', 'Curva do rio Níger', 'de 1230 a 1450 aproximadamente', 'Minas de ouro e rotas do Saara', 'Mansa Musa foi a Meca distribuindo ouro pelo caminho e desarrumou o preço do metal no Cairo por anos. Foi assim que os mapas europeus passaram a desenhar um rei africano segurando uma pepita.'],
    songai: ['Império Songai', 'Níger médio, entre Mali e Níger atuais', 'de 1460 a 1591 aproximadamente', 'Controle do rio e das cidades de comércio', 'Tombuctu tinha escolas e um comércio de livro copiado à mão que rendia mais que muita loja. O império caiu para uma tropa marroquina que atravessou o deserto levando armas de fogo.'],
    axum: ['Reino de Axum', 'Norte da Etiópia e Eritreia', 'de 100 a 700 aproximadamente', 'Porto no mar Vermelho, marfim e ouro', 'Cunhava moeda própria, coisa rara na época, e escrevia em alfabeto próprio, o ge\'ez, ainda usado na liturgia etíope. Os obeliscos de pedra inteiriça de lá passam de vinte metros.'],
    zimbabue: ['Grande Zimbábue', 'Planalto do atual Zimbábue', 'de 1200 a 1450 aproximadamente', 'Gado, ouro e comércio até o oceano Índico', 'As muralhas foram erguidas sem argamassa, pedra sobre pedra. Arqueólogos do tempo colonial insistiam que africanos não poderiam tê-las feito, e o governo da época censurou quem dizia o contrário.'],
    benim: ['Reino do Benim', 'Sul da atual Nigéria', 'de 1400 a 1897 aproximadamente', 'Pimenta, marfim e trabalho em metal', 'A cidade era cercada por valas e muros de terra entre os maiores já cavados por mão humana. As placas de latão que contavam a história do reino foram levadas num saque britânico em 1897.']
}, 'datas da periodização mais aceita, arredondadas')

T('História', '🏰', 'idademedia', 'A Idade Média sem o mito das trevas',
    'Ninguém com estudo achava a Terra plana naquela época: essa história foi inventada por escritores do século dezenove.',
    ['Quando apareceu', 'Onde', 'O que mudou na vida'], {
    universidades: ['As universidades', 'a partir de 1088, em Bolonha', 'Itália, França e Inglaterra', 'Diploma, currículo e greve de estudante', 'Bolonha começou como sindicato de alunos que contratava e demitia os professores. Quando a cidade cobrava caro demais, a turma inteira mudava de cidade, e algumas universidades nasceram assim.'],
    aradopesado: ['O arado de aiveca', 'espalhado a partir do século oito', 'Norte da Europa, de solo pesado', 'Terra encharcada virou terra boa de plantar', 'Junto com a coleira rígida, que deixou o cavalo puxar sem se estrangular, e com o rodízio de três campos, encheu o celeiro. Mais comida, mais gente, mais cidade.'],
    moinhos: ['Os moinhos de água e vento', 'em toda parte a partir do século nove', 'Rios e colinas da Europa', 'Moer, serrar, bater ferro e pisar tecido', 'Só a Inglaterra tinha milhares deles no levantamento mandado fazer em 1086. Foi a primeira vez que trabalho pesado em escala saiu do braço humano e passou para a máquina.'],
    catedrais: ['As catedrais góticas', 'a partir de 1140, em Saint-Denis', 'França, Inglaterra e Alemanha', 'Parede fina, janela enorme e teto altíssimo', 'O arco apontado e o contraforte tiraram o peso das paredes e deixaram entrar luz colorida. Cada obra levava gerações, e o pedreiro que lançava a pedra fundamental morria sem ver o fim.'],
    oculos: ['Os óculos', 'por volta de 1285, no norte da Itália', 'Veneza e Toscana', 'Anos a mais de trabalho para quem lê', 'Um frade escreveu que a invenção era recente e que ele conhecia o sujeito que a fez. De repente, copista, joalheiro e alfaiate ganharam duas décadas úteis de carreira.'],
    relogio: ['O relógio mecânico', 'a partir do fim do século treze', 'Torres de igreja e prefeitura', 'A hora passou a ter sempre o mesmo tamanho', 'Antes disso, a hora de verão era mais longa que a de inverno, porque dividiam a luz do dia em doze pedaços. O sino da torre foi o começo de trabalhar por horário em vez de por tarefa.']
}, 'datas da periodização mais aceita')

T('História', '⚔️', 'feudalismo', 'Como o feudalismo funcionava de verdade',
    'A palavra feudalismo foi inventada por estudiosos séculos depois: quem vivia naquilo nunca usou o termo para se descrever.',
    ['Quem era', 'O que devia', 'O que recebia em troca'], {
    suserano: ['O suserano', 'Rei ou grande senhor com terra de sobra', 'Proteção, justiça e socorro militar', 'Juramento de fidelidade e tropa quando chamasse', 'Ninguém mandava sozinho num território grande sem estrada nem correio. Dar terra a um homem de confiança era a única forma de ter alguém armado a três dias de viagem dali.'],
    vassalo: ['O vassalo', 'Nobre que recebia um feudo', 'Comparecer com cavaleiros e dar conselho', 'A renda das terras enquanto servisse bem', 'Dava para ser vassalo de dois senhores ao mesmo tempo, e aí começava a confusão: quando os dois brigavam entre si, o sujeito tinha que escolher de qual juramento faltar.'],
    cavaleiro: ['O cavaleiro', 'Guerreiro montado, nobre ou aspirante a isso', 'Quarenta dias de serviço por ano, em geral', 'Terra, parte do saque e prestígio social', 'Não era profissão barata: o cavalo de guerra, a armadura e o escudeiro custavam o preço de uma fazenda. Quem não tinha renda para manter tudo isso vivia de torneio e de contrato.'],
    servo: ['O servo da gleba', 'Camponês preso à terra onde nasceu', 'Dias de trabalho no campo do senhor e taxas', 'Uma faixa de terra para o próprio sustento', 'Servo não é escravo: tinha casa, roça e família, não podia ser vendido sozinho e a terra ia junto se mudasse de dono. Em compensação, também não podia ir embora.'],
    banalidades: ['As banalidades', 'Monopólios do senhor no feudo', 'O camponês pagava para usar', 'Moinho, forno e lagar para todos', 'Moer o próprio trigo em casa era proibido, e havia fiscal para conferir. Os inventários dos senhores listam pedras de mão confiscadas de camponeses teimosos.'],
    comuna: ['A cidade com carta de franquia', 'Moradores de burgo em crescimento', 'Pagavam ao senhor por uma carta de direitos', 'Governo próprio, feira e tribunal da cidade', 'Corria um dito de que o ar da cidade liberta: em vários lugares, o servo que passasse um ano e um dia dentro dos muros sem ser reclamado virava homem livre.']
})

T('História', '✝️', 'cruzadas', 'As Cruzadas, expedição por expedição',
    'Foram muito mais do que as oito numeradas, e nem todas iam ao Oriente: houve cruzada contra pagão no Báltico e contra cristão no sul da França.',
    ['Quando', 'Quem puxou', 'Como terminou'], {
    primeira: ['Primeira Cruzada', 'de 1096 a 1099', 'Pregação do papa Urbano II', 'Tomada de Jerusalém, com massacre', 'Antes dos nobres saiu uma multidão de gente pobre mal armada, que foi destroçada pouco depois de atravessar para a Ásia. Foi a única expedição a atingir o alvo que anunciava.'],
    segunda: ['Segunda Cruzada', 'de 1147 a 1149', 'Dois reis, o da França e o da Alemanha', 'Fracasso completo diante de Damasco', 'Os dois exércitos mais poderosos da Europa cercaram uma cidade que até então era aliada, e desistiram em quatro dias. O cerco só serviu para empurrar Damasco para o lado inimigo.'],
    terceira: ['Terceira Cruzada', 'de 1189 a 1192', 'Ricardo da Inglaterra e Filipe da França', 'Trégua: peregrino entra, mas a cidade fica', 'Ricardo e Saladino negociaram por meses e nunca se viram pessoalmente. Quando o inglês adoeceu, o adversário mandou fruta gelada e um médico, e os dois trocaram presente até o acordo sair.'],
    quarta: ['Quarta Cruzada', 'de 1202 a 1204', 'Nobres franceses endividados com Veneza', 'Saque de Constantinopla, cidade cristã', 'Nunca chegou perto da Terra Santa. Para pagar os navios, a expedição atacou aliados e terminou arrasando a maior cidade cristã do mundo, que nunca se recuperou do estrago.'],
    criancas: ['A Cruzada das Crianças', 'por volta de 1212', 'Pregadores populares na França e na Alemanha', 'Dispersou no caminho, sem chegar a lugar nenhum', 'Não foi um exército de crianças. A palavra usada na época servia também para jovem pobre e trabalhador sem terra, e boa parte do resto do enredo cresceu na boca do povo.'],
    acre: ['A queda de Acre', 'em 1291', 'Sultanato mameluco do Egito', 'Fim dos estados cruzados no Oriente', 'Com o último porto perdido, as ordens militares mudaram de ramo: os hospitalários viraram potência naval em Rodes e depois em Malta, e os templários acabaram dissolvidos e presos na França.']
}, 'datas da periodização mais aceita')

T('História', '🕌', 'islamicomedieval', 'A era de ouro islâmica, de Bagdá a Córdoba',
    'Enquanto a Europa copiava livro à mão em mosteiro, Bagdá e Córdoba pagavam bem para traduzir, conferir e discordar dos antigos.',
    ['Onde viveu', 'Quando', 'No que mexeu'], {
    alkhwarizmi: ['Al-Khwarizmi', 'Bagdá', 'por volta de 820', 'Equações, tabelas e números indianos', 'O nome dele, latinizado, virou a palavra algoritmo, e o título do livro, al-jabr, virou álgebra. Foi ele que convenceu o mundo a largar o algarismo romano na hora de calcular.'],
    ibnalhaytham: ['Ibn al-Haytham', 'Cairo', 'por volta de 1020', 'Óptica e método de testar hipótese', 'Mostrou que o olho recebe luz em vez de emitir raios, derrubando uma ideia grega de mil anos. Escreveu boa parte disso preso em casa, depois de fingir loucura para escapar de um califa irritado.'],
    ibnsina: ['Ibn Sina, o Avicena', 'Pérsia, entre Bucara e Hamadã', 'por volta de 1020', 'Medicina organizada em enciclopédia', 'O manual dele virou livro obrigatório nas faculdades europeias e continuou em uso por mais de quinhentos anos. Já descrevia contágio, quarentena e teste de remédio em série.'],
    alrazi: ['Al-Razi, o Rasis', 'Rei e Bagdá', 'por volta de 900', 'Clínica, química e hospital', 'Foi o primeiro a separar por escrito varíola de sarampo, olhando paciente por paciente. Dirigia hospital que atendia quem chegasse, e escreveu que médico que não estuda mata mais que cura.'],
    ibnbatuta: ['Ibn Battuta', 'Saiu de Tânger e rodou o mundo', 'de 1325 a 1354', 'Relato de viagem pela Ásia e África', 'Andou muito mais que Marco Polo, quase trinta anos na estrada, e ditou tudo de memória ao voltar. Conta desde audiência com sultão até briga por causa de comida na estrada.'],
    ibnkhaldun: ['Ibn Khaldun', 'Tunes, Fez e Cairo', 'por volta de 1377', 'Por que impérios sobem e depois caem', 'Explicou história sem recorrer a destino: dizia que o grupo unido conquista, enriquece, amolece e é trocado por outro grupo unido. Virou fundação do que hoje se chama sociologia.']
})

T('História', '🛡️', 'vikings', 'Os vikings, entre o remo e o arado',
    'Viking era ofício, não povo: a maior parte daquela gente passava o ano plantando cevada e só uns poucos saíam em expedição.',
    ['De onde vinham', 'O que fizeram', 'Quando'], {
    lindisfarne: ['O ataque a Lindisfarne', 'Noruega', 'Saque a um mosteiro na costa inglesa', 'em 793', 'É a data que se convencionou para o início da era viking, mas só porque o mosteiro tinha quem soubesse escrever. Ataque em costa sem cronista não entrou em nenhuma lista.'],
    elmodechifre: ['O elmo com chifre', 'Não veio da Escandinávia medieval', 'Virou marca registrada de um povo inteiro', 'inventado por volta de 1876', 'Nenhum elmo viking achado tem chifre, e chifre em combate só serve para o inimigo agarrar. O figurino saiu da cabeça de um desenhista de ópera alemã, e grudou para sempre.'],
    vinlandia: ['Vinlândia', 'Islândia e Groenlândia', 'Acampamento na América do Norte', 'por volta do ano 1000', 'Em Terra Nova, num sítio chamado L\'Anse aux Meadows, apareceram casas e oficina de ferro nórdicas. Eles chegaram cerca de quinhentos anos antes de Colombo e desistiram de ficar.'],
    rus: ['Os rus no leste', 'Suécia', 'Rota de rio até Bagdá e Constantinopla', 'nos séculos nove e dez', 'Desciam rios russos carregando o barco no ombro entre um e outro. Serviram de guarda pessoal do imperador bizantino, e um deles deixou o nome riscado a faca no mármore de Santa Sofia.'],
    canuto: ['Canuto, o Grande', 'Dinamarca', 'Rei da Inglaterra, Dinamarca e Noruega', 'de 1016 a 1035', 'A história da maré é o contrário do que contam: ele mandou o mar parar justamente para mostrar aos bajuladores que o poder de um rei tem limite, e saiu com os pés molhados.'],
    althing: ['O Althing', 'Islândia', 'Assembleia ao ar livre que fazia lei e julgava', 'desde 930', 'Homens livres se reuniam numa planície de pedra para resolver pendência e escolher regra. É tido como o parlamento mais antigo que ainda funciona, e a Islândia passou séculos sem rei.']
}, 'datas da periodização mais aceita')

T('História', '🐀', 'pestenegra', 'A Peste Negra e o mundo que ela mudou',
    'A doença matou uma fatia enorme da Europa em poucos anos e, sem querer, deu ao sobrevivente comum um poder de barganha inédito.',
    ['Onde', 'Quando', 'O que aconteceu'], {
    caffa: ['O cerco de Caffa', 'Porto genovês na Crimeia', 'em 1346', 'A doença entra na rota do mar Negro', 'Um cronista conta que os sitiantes catapultaram corpos doentes por cima da muralha. Verdade ou não, os navios que fugiram dali levaram a peste para dentro do Mediterrâneo.'],
    messina: ['A chegada a Messina', 'Sicília', 'em outubro de 1347', 'Doze galés atracam com a tripulação doente', 'Mandaram os navios embora, e foi pior: eles seguiram para outros portos espalhando a carga. Em dois anos a peste tinha ido da Sicília à Noruega, seguindo estrada e rota comercial.'],
    florenca: ['Florença', 'Toscana', 'em 1348', 'Cidade perde grande parte dos moradores', 'Boccaccio abriu o Decamerão descrevendo o que viu: gente abandonando parente, vizinho enterrando às pressas e lei sem ninguém para cumprir. O livro nasceu de dez jovens fugindo da peste.'],
    quarentena: ['A quarentena', 'Ragusa, hoje Dubrovnik, e depois Veneza', 'a partir de 1377', 'Navio esperava fundeado antes de desembarcar', 'Começou com trinta dias de espera e depois virou quarenta, e é desse número em italiano que vem a palavra quarentena. Foi das primeiras vezes que um governo isolou gente saudável por precaução.'],
    salarios: ['A falta de trabalhador', 'Inglaterra e boa parte da Europa', 'de 1349 em diante', 'Salário sobe e a lei tenta segurar', 'Com menos gente viva, quem trabalhava passou a escolher patrão. Os reis publicaram leis congelando salário no nível de antes da peste, e o resultado foi revolta camponesa uma atrás da outra.'],
    medicodapeste: ['O médico da peste', 'Itália e França', 'traje descrito a partir de 1619', 'Máscara de bico cheia de ervas e capa encerada', 'A roupa que virou fantasia de carnaval é quase trezentos anos mais nova que a Peste Negra. Ninguém em 1348 viu aquele bico, e quem o usou depois achava que o cheiro ruim é que contaminava.']
}, 'estimativas de mortalidade variam muito entre regiões e fontes')

T('História', '🎭', 'renascimento', 'O Renascimento',
    'Um punhado de cidades italianas cheias de dinheiro resolveu pagar artista, e o resultado ainda está pendurado nos museus do mundo.',
    ['Onde', 'Quando', 'Marca registrada'], {
    florenca: ['Florença', 'Itália, no vale do rio Arno', 'século 15', 'banqueiro bancando artista', 'A família Médici não pintou nada, mas escolhia quem pintava. Era dinheiro de banco virando cúpula, estátua e afresco, e um jeito eficiente de comprar prestígio numa cidade que vivia de reputação.'],
    leonardo: ['Leonardo da Vinci', 'Vinci, Milão e Amboise', 'de 1452 a 1519', 'caderno de anotações', 'Deixou menos de vinte pinturas terminadas e milhares de páginas de caderno. Esses cadernos ficaram guardados em coleção particular por séculos, então quase nenhuma invenção dele chegou a influenciar quem veio depois.'],
    michelangelo: ['Michelangelo', 'Roma, na Capela Sistina', 'de 1508 a 1512', 'teto pintado em pé', 'A imagem do artista deitado de costas no andaime é invenção de filme. Ele pintou em pé, com a cabeça jogada para trás, e reclamava em verso que a tinta escorria na própria cara.'],
    imprensa: ['A imprensa de Gutenberg', 'Mogúncia, Alemanha', 'por volta de 1450', 'tipos móveis de metal', 'Tipo móvel já existia na China e na Coreia havia séculos. O que Gutenberg juntou foi liga de metal, tinta à base de óleo e uma prensa de vinho adaptada, e foi essa combinação que fez o livro ficar barato.'],
    perspectiva: ['A perspectiva', 'Florença', 'anos 1420', 'ponto de fuga no quadro', 'Brunelleschi provou a ideia com um truque de espelho na praça da catedral. A pintura deixou de ser símbolo empilhado e virou janela: de repente dava para dizer o que estava perto e o que estava longe.'],
    humanismo: ['O humanismo', 'Itália e depois toda a Europa', 'séculos 14 a 16', 'voltar aos textos antigos', 'A ideia de que a Idade Média foi um breu e o Renascimento acendeu a luz veio depois, de gente que queria se vender como novidade. Os humanistas eram quase todos religiosos e muitos trabalhavam para a Igreja.']
})

T('História', '🧭', 'grandesnavegacoes', 'As Grandes Navegações',
    'Meia dúzia de barcos de madeira, sem mapa confiável do outro lado, mudou para sempre o que os continentes sabiam uns dos outros.',
    ['Quem', 'Quando', 'O que mudou'], {
    ceuta: ['A tomada de Ceuta', 'Portugal', '1415', 'porta de entrada na África', 'A praça no norte da África foi tomada por causa do ouro que chegava lá pelo deserto. Portugal descobriu que o ouro vinha de muito mais longe, e a única forma de cortar o intermediário era descer a costa de barco.'],
    bartolomeudias: ['Bartolomeu Dias', 'navegador português', '1488', 'achou a ponta sul da África', 'O cabo foi batizado das Tormentas por causa da tempestade que quase virou o barco. O rei trocou o nome para Boa Esperança por pura propaganda: ninguém investe numa rota que já começa com aviso de naufrágio.'],
    vascodagama: ['Vasco da Gama', 'navegador português', '1498', 'ligou a Europa à Índia por mar', 'Chegou a Calicute e ofereceu ao governante local presentes tão vagabundos que os mercadores riram na cara dele. A Índia já era rica, já comerciava com meio mundo e não estava esperando ser descoberta por ninguém.'],
    colombo: ['Cristóvão Colombo', 'genovês a serviço da Espanha', '1492', 'topou com um continente inteiro', 'Morreu convencido de que tinha chegado à Ásia. O erro não foi achar a Terra plana, isso gente instruída já sabia que não era: ele errou o tamanho do planeta e chutou quase um terço a menos do que ele tem.'],
    magalhaes: ['A primeira volta ao mundo', 'Fernão de Magalhães e Elcano', 'de 1519 a 1522', 'provou que dava para dar a volta', 'Magalhães não completou a viagem: morreu nas Filipinas no meio do caminho. Quem voltou foi Juan Sebastián Elcano, com um único navio e dezoito homens, de cinco navios e mais de duzentos que tinham partido.'],
    caravela: ['A caravela', 'estaleiros portugueses', 'século 15', 'vela que sobe contra o vento', 'A vantagem não era tamanho, era teimosia contra o vento: a vela latina deixava o barco navegar de banda e voltar para casa. Sem isso, descer a costa africana seria viagem só de ida.']
})

T('História', '📖', 'reforma', 'Reforma e Contrarreforma',
    'Uma briga sobre perdão comprado com dinheiro rachou a Europa em duas e deixou marcas que ainda dá para ver no mapa das religiões.',
    ['Quem', 'Onde e quando', 'A ideia central'], {
    lutero: ['Martinho Lutero', 'monge alemão e professor', 'Wittenberg, 1517', 'a fé salva, o pagamento não', 'Ele escreveu as noventa e cinco teses em latim, para discutir com outros professores, e não para levantar o povo. A cena do martelo na porta da igreja pode nem ter acontecido: quem contou foi um colega, anos depois.'],
    indulgencias: ['As indulgências', 'pregadores a serviço de Roma', 'Alemanha, anos 1510', 'perdão de pena por doação', 'O dinheiro tinha destino certo: a obra da basílica de São Pedro. Um pregador famoso resumia a venda num verso de feira, prometendo que a alma pulava do purgatório assim que a moeda tinia no fundo do cofre.'],
    calvino: ['João Calvino', 'francês exilado', 'Genebra, anos 1540', 'predestinação e vida regrada', 'Genebra virou cidade-modelo e também cidade vigiada, com comissão fiscalizando festa, roupa e bebida. A ideia de que ir bem no trabalho seria sinal de ter sido escolhido pegou mais entre os seguidores do que nele.'],
    anglicana: ['A Igreja da Inglaterra', 'o rei Henrique VIII', 'Inglaterra, anos 1530', 'o rei no lugar do papa', 'A briga começou por um divórcio negado, mas o que selou o rompimento foi a conta: os mosteiros ingleses tinham muita terra, e a coroa ficou com ela. A doutrina mudou pouco; o dono do negócio mudou tudo.'],
    trento: ['O Concílio de Trento', 'a Igreja de Roma', 'norte da Itália, 1545 a 1563', 'arrumar a casa sem ceder no dogma', 'Levou dezoito anos, com interrupções e troca de papa no meio. Saiu de lá com seminário para formar padre, proibição de vender indulgência por dinheiro e uma lista de livros proibidos que durou até o século 20.'],
    augsburgo: ['A Paz de Augsburgo', 'príncipes alemães e o imperador', 'Augsburgo, 1555', 'a religião do príncipe vale na terra dele', 'A fórmula resolvia a briga entre os príncipes e ignorava o fiel comum: quem não seguia a religião do seu senhor tinha que se mudar. E nem cobria todos os grupos, o que ajudou a levar a Europa a uma guerra pior.']
})

T('História', '🕯️', 'iluminismo', 'O Iluminismo',
    'Um grupo de escritores decidiu que a razão podia julgar rei, igreja e costume, e a conversa de salão acabou virando material de revolução.',
    ['Quem era', 'País', 'Ideia que pegou'], {
    montesquieu: ['Montesquieu', 'nobre e magistrado', 'França', 'separar os três poderes', 'Ele achava que estava copiando o modelo inglês, e descreveu errado um sistema que na prática misturava tudo. A descrição equivocada virou projeto e acabou influenciando constituição em meio mundo, inclusive a nossa.'],
    voltaire: ['Voltaire', 'escritor e panfletário', 'França', 'tolerância e liberdade de opinião', 'A frase mais famosa dele, sobre defender até a morte o direito de o outro falar, nunca saiu da pena dele: foi escrita por uma biógrafa inglesa resumindo o pensamento. Voltaire tinha inimigo demais e paciência de menos.'],
    rousseau: ['Rousseau', 'genebrino autodidata', 'Suíça e França', 'o poder vem do povo', 'Escreveu o manual de educação mais influente do século e mandou os próprios filhos para o orfanato. O contrato social foi proibido em Paris e em Genebra, e virou livro de cabeceira de quem faria a revolução.'],
    enciclopedia: ['A Enciclopédia', 'Diderot e d\'Alembert', 'França', 'todo o saber num lugar só', 'Foram mais de vinte anos de trabalho, com censura no meio e verbete escrito em código para escapar dela. Um texto inofensivo sobre artesanato podia terminar com uma alfinetada na Igreja escondida na última linha.'],
    adamsmith: ['Adam Smith', 'professor de filosofia moral', 'Escócia', 'mercado movido pelo interesse de cada um', 'A famosa mão invisível aparece uma vez só no livro, de passagem. Ele desconfiava de comerciante combinado e dizia que patrão acertando preço e salário nas costas do trabalhador era a regra, não a exceção.'],
    despotismo: ['O despotismo esclarecido', 'reis que liam os filósofos', 'Prússia, Áustria e Rússia', 'reforma de cima, sem dividir poder', 'Catarina da Rússia trocava carta com Voltaire e bancava a Enciclopédia, enquanto endurecia a servidão dentro de casa. Era filosofia usada como fachada: modernizava o Estado e não abria mão de nada.']
})

T('História', '🏭', 'revolucaoindustrial', 'A Revolução Industrial',
    'Carvão, ferro e uma máquina que não cansava tiraram a produção de dentro de casa e puseram na fábrica, e o mundo trocou de relógio.',
    ['Quando', 'Onde', 'O que mudou'], {
    maquinavapor: ['A máquina a vapor', 'anos 1760 a 1780', 'Escócia e Inglaterra', 'força que não depende de rio nem vento', 'James Watt não inventou a máquina a vapor: melhorou uma que já bombeava água de mina havia meio século. A sacada foi separar o condensador, o que cortou o gasto de carvão e deixou o motor sair de dentro da mina.'],
    algodao: ['A indústria do algodão', 'fim do século 18', 'Lancashire, Inglaterra', 'fio e tecido em escala', 'Foi o primeiro setor a virar fábrica de verdade, e o algodão vinha em boa parte de lavoura escravista do outro lado do oceano. A máquina barateou a roupa e amarrou dois continentes na mesma conta.'],
    ferrovia: ['A ferrovia', 'a partir de 1830', 'norte da Inglaterra', 'carga e gente em velocidade nova', 'Antes do trem cada cidade acertava o relógio pelo sol do próprio lugar. Horário de trem não funciona assim, e foi a ferrovia que obrigou o país inteiro a marcar a mesma hora no mesmo minuto.'],
    cidadeoperaria: ['A cidade operária', 'primeira metade do século 19', 'Manchester e arredores', 'gente morando ao lado da máquina', 'A cidade cresceu bem mais rápido que o esgoto, e a expectativa de vida do operário ficou menor que a do camponês que ele tinha deixado para trás. Cólera e tifo entraram na conta do progresso.'],
    trabalhoinfantil: ['O trabalho de crianças', 'século 19', 'Inglaterra e depois a Europa toda', 'mão pequena para máquina apertada', 'Criança trabalhando não era novidade, o campo sempre usou. O que mudou foi o turno de doze horas sem estação do ano nem descanso. As primeiras leis de fábrica nasceram daí e demoraram décadas para serem cumpridas.'],
    ludistas: ['Os ludistas', 'de 1811 a 1816', 'centro da Inglaterra', 'quebrar a máquina como protesto', 'Não eram inimigos da tecnologia por birra: eram tecelões qualificados vendo o salário despencar, sem sindicato e sem voto para reclamar. Quebrar tear era a única mesa de negociação que existia para eles.']
})

T('História', '🗽', 'independenciaeua', 'A independência dos Estados Unidos',
    'Treze colônias brigaram com Londres por causa de imposto e terminaram inventando um país que foi escrito no papel antes de existir no mapa.',
    ['Quando', 'Quem', 'O que estava em jogo'], {
    impostos: ['A briga do imposto', 'de 1765 a 1773', 'Parlamento inglês e colonos', 'pagar sem ter representante', 'O chá jogado no porto de Boston era de uma companhia que tinha acabado de ficar mais barata. O problema não era o preço: era Londres decidir sozinha quem podia vender o quê do outro lado do oceano.'],
    declaracao: ['A Declaração de Independência', '4 de julho de 1776', 'Jefferson e o Congresso', 'romper de vez com o rei', 'A votação pela separação foi no dia 2, e quase ninguém assinou no dia 4. John Adams escreveu para a esposa que o dia 2 seria comemorado para sempre. Errou por dois dias e por dois séculos e meio.'],
    guerra: ['A guerra de independência', 'de 1775 a 1783', 'milícias contra o exército inglês', 'aguentar oito anos de guerra', 'Sem a esquadra e o dinheiro da França a coisa não teria terminado em Yorktown. O rombo que essa ajuda abriu no cofre francês é um dos motivos de a própria França estar quebrada quando a revolução chegou lá.'],
    constituicao: ['A Constituição', '1787', 'convenção na Filadélfia', 'montar um governo que se controle', 'A primeira tentativa, com os estados quase soltos, não durou dez anos. A segunda deu certo em parte porque não resolveu a escravidão: empurrou a questão para frente e cobrou o preço numa guerra civil setenta anos depois.'],
    cartadedireitos: ['A Carta de Direitos', '1791', 'as dez primeiras emendas', 'limitar o governo recém-criado', 'Vários estados só aceitaram a Constituição com a promessa de que uma lista de direitos viria logo em seguida. Foram doze emendas propostas; dez passaram na hora, e uma das que sobraram só foi aprovada em 1992.'],
    washington: ['George Washington', 'de 1789 a 1797', 'o primeiro presidente', 'sair do cargo por vontade própria', 'Largar o posto depois de dois mandatos não estava em lei nenhuma: virou costume por imitação e só entrou na Constituição em 1951. Na época, governante que devolve o poder era coisa que quase ninguém tinha visto.']
})

T('História', '⚜️', 'revolucaofrancesa', 'A Revolução Francesa',
    'Em pouco mais de dez anos a França trocou o rei por uma república, inventou a cidadania moderna e mostrou que revolução também devora quem a começou.',
    ['Quando', 'Quem', 'O que aconteceu'], {
    bastilha: ['A queda da Bastilha', '14 de julho de 1789', 'o povo de Paris', 'prisão tomada e demolida', 'Dentro da fortaleza havia sete presos, nenhum deles preso político famoso. O que a multidão queria mesmo era a pólvora guardada lá dentro; a prisão virou símbolo por ser a cara mais feia do poder do rei.'],
    direitosdohomem: ['A Declaração dos Direitos', 'agosto de 1789', 'Assembleia Nacional', 'todo homem nasce livre e igual', 'A escritora Olympe de Gouges publicou dois anos depois a versão para as mulheres e terminou guilhotinada. O texto original falava de homem, e a palavra estava sendo usada nos dois sentidos de propósito.'],
    guilhotina: ['A guilhotina', 'a partir de 1792', 'proposta pelo médico Guillotin', 'execução igual para todo mundo', 'O médico que deu nome à máquina não a inventou e nem queria que ela existisse: defendia que, se havia pena de morte, ela fosse rápida e igual para nobre e plebeu. A família dele pediu para trocar de sobrenome depois.'],
    execucaodorei: ['A execução do rei', 'janeiro de 1793', 'Convenção Nacional', 'Luís XVI julgado e condenado', 'A condenação passou por um voto de diferença, numa votação em que cada deputado teve de dizer a sentença em voz alta. Depois daquilo não havia mais volta: a Europa dos reis inteira declarou guerra à França.'],
    terror: ['O Terror', 'de 1793 a 1794', 'Comitê de Salvação Pública', 'perseguição e execução em série', 'O tribunal julgava em minutos, e a maioria dos mortos não era nobre: era gente comum denunciada por vizinho. Robespierre, que assinava as listas, terminou na mesma fila poucos meses depois.'],
    calendario: ['O calendário novo', 'de 1793 a 1805', 'a Convenção', 'meses e semanas refeitos', 'Trocaram os meses por nomes de chuva e colheita, e a semana por dez dias, o que dava nove dias de trabalho para um de descanso. Durou doze anos: ninguém aguentou o novo ritmo e o velho calendário voltou.']
})

T('História', '🎖️', 'napoleao', 'A era napoleônica',
    'Um oficial de artilharia da Córsega virou imperador da França, redesenhou a Europa no tapa e deixou um código de leis que segue em vigor.',
    ['Quando', 'O que foi', 'Resultado'], {
    tomadadopoder: ['A tomada do poder', '1799', 'golpe que encerrou o Diretório', 'cônsul e depois imperador', 'Ele pegou a coroa e se coroou sozinho na cerimônia, com o papa sentado ali perto. O recado era claro: aquela coroa vinha da força e do voto bem arrumado, não das mãos da Igreja.'],
    codigocivil: ['O Código Civil', '1804', 'lei escrita e igual para o cidadão', 'modelo copiado no mundo todo', 'É a obra dele que mais durou e serve de base até hoje para o direito de muitos países. Também colocou a mulher casada sob tutela do marido, e isso foi exportado junto com o resto do pacote.'],
    austerlitz: ['Austerlitz', 'dezembro de 1805', 'batalha contra Áustria e Rússia', 'auge militar do império', 'Ele fingiu fraqueza num flanco para atrair o inimigo e tomou o morro no meio do campo quando a linha adversária se abriu. É batalha que os manuais militares ainda mandam estudar, vencida por armadilha e não por número.'],
    bloqueio: ['O Bloqueio Continental', 'de 1806 em diante', 'fechar a Europa ao comércio inglês', 'faltou produto e sobrou contrabando', 'A ideia era quebrar a Inglaterra pelo bolso, mas quem passou necessidade foi o continente. O bloqueio empurrou Napoleão a invadir Espanha e Rússia só para fazer o fecho valer, e foi ali que ele se perdeu.'],
    russia: ['A campanha da Rússia', '1812', 'invasão que virou retirada', 'exército desfeito na volta', 'Os russos recuaram queimando a própria plantação e entregaram Moscou vazia. Não houve batalha decisiva: o que destruiu o exército foi fome, tifo e o caminho de volta no inverno, com uma fração dos homens chegando em casa.'],
    waterloo: ['Waterloo', 'junho de 1815', 'derrota final na Bélgica', 'exílio em Santa Helena', 'Ele já tinha voltado uma vez do exílio e governado por cem dias. A derrota não foi só contra os ingleses: quem chegou no fim da tarde e fechou a conta foi o exército prussiano, que todos davam como fora do jogo.']
})

T('História', '🗺️', 'imperialismo', 'A partilha da África e o imperialismo',
    'No fim do século 19 as potências europeias dividiram um continente inteiro numa sala de reuniões, e o mundo ainda vive com as linhas que saíram dali.',
    ['Quando', 'Quem', 'O que ficou'], {
    berlim: ['A Conferência de Berlim', '1884 e 1885', 'catorze potências, nenhuma africana', 'regra para dividir o que não era delas', 'Ninguém desenhou o mapa inteiro na conferência: o que ficou combinado foi que só valia a posse de quem ocupasse de fato. O resultado foi uma corrida armada pelo interior do continente nos vinte anos seguintes.'],
    fronteiras: ['As fronteiras de régua', 'décadas de 1880 e 1890', 'diplomatas em escritório europeu', 'linhas retas cortando povos', 'Boa parte das divisas foi traçada por paralelo e meridiano, sem rio nem serra no meio. Povo que era um só acordou dividido em dois países, e rival histórico virou compatriota. Muito conflito depois nasce desse traço.'],
    congo: ['O Congo de Leopoldo', 'de 1885 a 1908', 'propriedade pessoal de um rei belga', 'borracha arrancada sob violência', 'O território não era colônia da Bélgica: era do rei em pessoa. A cota de borracha era cobrada com reféns e mutilação, e a denúncia de funcionários e missionários forçou o parlamento belga a tirar a terra das mãos dele.'],
    adua: ['A Etiópia em Adua', '1896', 'exército etíope contra a Itália', 'a derrota que barrou a partilha', 'Menelik II comprou armamento moderno de várias potências europeias e usou contra uma delas. A derrota italiana foi tão completa que a independência etíope foi reconhecida, e o país virou referência para a África inteira.'],
    indiabritanica: ['A Índia britânica', 'de 1858 a 1947', 'a coroa no lugar da Companhia', 'a colônia mais lucrativa do império', 'Antes de 1858 quem mandava na Índia era uma empresa com exército próprio. Depois de uma grande revolta, Londres assumiu direto, e a colônia passou a pagar até a conta de guerras britânicas travadas longe dela.'],
    missaocivilizadora: ['A conversa de missão civilizadora', 'fim do século 19', 'jornais, igrejas e governos', 'desculpa moral para a conquista', 'Vendia-se a ideia de levar progresso e fé, mas a régua da conquista era matéria-prima e mercado. O mesmo jornal que falava em civilizar publicava anúncio de terra e concessão de mina na página seguinte.']
})

T('História', '💥', 'primeiraguerra', 'A Primeira Guerra Mundial',
    'Um tiro nos Bálcãs acendeu um sistema de alianças, e a guerra que ia acabar até o Natal ficou quatro anos parada dentro de um buraco na lama.',
    ['Quando', 'Onde', 'O que marcou'], {
    sarajevo: ['O atentado de Sarajevo', '28 de junho de 1914', 'Bósnia', 'herdeiro austríaco assassinado', 'O atentado quase deu errado: a primeira bomba errou o alvo e o grupo se dispersou. O carro do arquiduque pegou a rua errada e parou bem na frente de um dos conspiradores. A guerra veio de uma esquina mal feita.'],
    trincheiras: ['A guerra de trincheiras', 'de 1914 a 1918', 'norte da França e Bélgica', 'meses de lama para ganhar metros', 'A frente ocidental mal se moveu depois do primeiro ano. Metralhadora e arame farpado davam vantagem a quem estava parado, e o soldado passava mais tempo enterrado, doente e entre ratos do que atirando.'],
    verdunsomme: ['Verdun e o Somme', '1916', 'França', 'as duas batalhas mais caras', 'As duas duraram meses e terminaram quase onde tinham começado, com centenas de milhares de mortos de cada lado. Verdun virou o símbolo francês de resistir a qualquer custo, e o custo foi quase uma geração inteira.'],
    armasnovas: ['As armas novas', 'de 1915 em diante', 'todas as frentes', 'gás, tanque e avião', 'O gás matou bem menos do que o pânico que causava, e o vento virava contra quem soltava. O tanque apareceu justamente para atravessar o arame farpado, e na estreia quebrou mais do que andou.'],
    entradaeua: ['A entrada dos Estados Unidos', '1917', 'Atlântico e depois a França', 'homens e dinheiro novos na balança', 'O empurrão final veio de um telegrama alemão interceptado, que oferecia território ao México se ele atacasse o vizinho do norte. A guerra submarina já vinha afundando navio com civil a bordo havia meses.'],
    versalhes: ['O Tratado de Versalhes', '1919', 'Paris', 'culpa e conta jogadas na Alemanha', 'A Alemanha assinou sem participar da negociação, e a dívida imposta só terminou de ser paga em 2010. Dizer que o tratado sozinho causou a guerra seguinte é simplificar, mas ele entregou o discurso pronto a quem queria revanche.']
}, 'números de mortos variam muito entre as fontes')

T('História', '🚩', 'revolucaorussa', 'A Revolução Russa',
    'Em um ano só a Rússia derrubou um czar, tentou uma república e acabou nas mãos de um partido que quase ninguém tinha levado a sério.',
    ['Quando', 'Quem', 'O que mudou'], {
    fevereiro: ['A Revolução de Fevereiro', 'março de 1917 no nosso calendário', 'operárias e soldados em Petrogrado', 'fim de trezentos anos de czar', 'Começou com mulheres saindo das fábricas no Dia Internacional da Mulher para pedir pão. Os soldados mandados para reprimir viraram de lado, e em uma semana o czar não tinha mais a quem dar ordem.'],
    governoprovisorio: ['O Governo Provisório', 'de março a outubro de 1917', 'liberais e socialistas moderados', 'liberdade nova, guerra mantida', 'O erro que custou tudo foi continuar na guerra. O povo pedia pão, terra e paz, e o governo só entregava promessa de eleição, enquanto os conselhos de operários e soldados mandavam de fato nas ruas.'],
    outubro: ['A Revolução de Outubro', 'novembro de 1917 no nosso calendário', 'bolcheviques liderados por Lênin', 'tomada do poder em Petrogrado', 'A tomada do Palácio de Inverno foi bem menos épica do que o filme rodado dez anos depois mostrou: houve poucos tiros e mais gente se rendendo do que lutando. A cena heroica que todo mundo conhece é cinema.'],
    guerracivil: ['A guerra civil', 'de 1918 a 1922', 'vermelhos contra brancos', 'anos de fome e combate', 'Havia tropa estrangeira metida no meio e nenhum comando único do lado branco. Morreu mais gente de fome e tifo do que em batalha, e a máquina de repressão montada ali não foi desmontada quando a guerra acabou.'],
    uniaosovietica: ['A criação da União Soviética', '1922', 'repúblicas reunidas sob um partido', 'outro tipo de Estado no lugar do império', 'No papel cada república podia até sair da união. Na prática quem decidia era um partido único em Moscou, e a cláusula de saída ficou dormindo no texto até ser usada de verdade em 1991.'],
    sucessao: ['A disputa pela sucessão', 'anos 1920', 'Stálin contra Trótski', 'o secretário vence o orador', 'Lênin deixou um bilhete pedindo que tirassem Stálin do cargo de secretário do partido, e o bilhete foi abafado. Quem controlava a papelada e as nomeações levou a melhor sobre quem discursava melhor.']
})

T('História', '📉', 'crise1929', 'A crise de 1929 e a Grande Depressão',
    'A bolsa de Nova York caiu numa semana, mas a fome que veio depois durou dez anos e mudou o que o mundo passou a esperar de um governo.',
    ['Quando', 'O que foi', 'Efeito'], {
    euforia: ['A euforia dos anos 1920', 'de 1921 a 1929', 'ação comprada fiado na corretora', 'preço solto do lucro real', 'Dava para comprar ação pagando uma fração e ficando devendo o resto à corretora. Enquanto subia, todo mundo ganhava; quando parou de subir, a corretora cobrou, e a venda forçada virou avalanche.'],
    quebra: ['A quebra da bolsa', 'outubro de 1929', 'dias de pânico em Wall Street', 'fortuna evaporada no pregão', 'A crise não começou nem terminou ali. A economia já vinha desacelerando antes, e o estrago grande veio depois, quando milhares de bancos quebraram e levaram junto a poupança de quem nunca tinha visto uma ação.'],
    bancos: ['A onda de quebra de bancos', 'de 1930 a 1933', 'corrida para sacar antes do vizinho', 'o crédito sumiu da economia', 'Banco nenhum guarda o dinheiro todo parado no cofre. Bastava o boato para a fila se formar, e a fila derrubava banco saudável também. A garantia pública de depósito nasceu para quebrar esse ciclo.'],
    desemprego: ['O desemprego em massa', 'anos 1930', 'quase um em cada quatro sem trabalho', 'fila de sopa e despejo', 'Não foi só nos Estados Unidos: Alemanha e Inglaterra tiveram número parecido. A conta política dessa fila ajudou a levar ao poder quem prometia emprego a qualquer preço, e o preço apareceu logo depois.'],
    newdeal: ['O New Deal', 'de 1933 em diante', 'obra pública, regra nova e aposentadoria', 'o Estado entra na economia', 'Estrada, escola, barragem e até pintor contratado para fazer mural. Os economistas ainda discutem quanto disso realmente tirou o país do buraco, mas a ideia de que o governo tem que segurar a queda ficou de pé.'],
    tarifas: ['A guerra de tarifas', 'de 1930 em diante', 'imposto alto sobre produto importado', 'o comércio mundial encolheu', 'Cada país tentou salvar a própria indústria taxando a do vizinho, e o vizinho respondeu na mesma moeda. O comércio internacional despencou, e o remédio que todos tomaram ao mesmo tempo virou parte da doença.']
})

T('História', '🪖', 'segundaguerra', 'A Segunda Guerra Mundial',
    'A maior guerra da história pegou quase todos os continentes, matou mais civil do que soldado e terminou inaugurando a era da bomba atômica.',
    ['Quando', 'Onde', 'O que decidiu'], {
    polonia: ['A invasão da Polônia', 'setembro de 1939', 'Europa central', 'França e Inglaterra declaram guerra', 'Duas semanas depois a União Soviética entrou pelo outro lado, cumprindo um acordo secreto assinado com a Alemanha poucos dias antes. Os dois países que viriam a se enfrentar dividiram o mapa juntos primeiro.'],
    guerrarelampago: ['A guerra-relâmpago', 'de 1939 a 1941', 'França, Bálcãs e norte da África', 'tanque e avião andando juntos', 'A França tinha mais tanque que a Alemanha e caiu em seis semanas. A diferença não estava no equipamento: estava no rádio dentro do veículo e na ordem de avançar sem esperar o mapa chegar do quartel.'],
    fronteleste: ['A frente oriental', 'de 1941 a 1945', 'União Soviética', 'a maior parte da guerra em terra', 'Stalingrado e Kursk pesaram mais do que muita gente imagina: a maioria das baixas alemãs aconteceu no leste. A União Soviética pagou o preço mais alto da guerra, em milhões de mortos, boa parte deles civis.'],
    pacifico: ['Pearl Harbor e o Pacífico', 'dezembro de 1941', 'Havaí e Ásia', 'a guerra vira mundial de verdade', 'O ataque afundou encouraçado velho e errou o que contava: os porta-aviões estavam fora do porto e os depósitos de combustível ficaram intactos. Foi isso que permitiu a virada em Midway meio ano depois.'],
    holocausto: ['O Holocausto', 'de 1933 a 1945', 'Europa ocupada', 'extermínio planejado pelo Estado', 'Seis milhões de judeus foram assassinados, junto com ciganos, pessoas com deficiência, opositores e outros grupos. Não foi surto de guerra: foi política de Estado, com lei, orçamento, ferrovia e papelada, montada ao longo de anos.'],
    fimdaguerra: ['O fim da guerra', '1945', 'Berlim e Japão', 'rendição e as bombas atômicas', 'A Alemanha se rendeu em maio; o Japão, em agosto, depois de Hiroshima e Nagasaki e da entrada soviética na guerra do Pacífico. O que pesou mais nessa decisão é debate aberto entre historiadores até hoje.']
})

T('História', '🧊', 'guerrafria', 'A Guerra Fria',
    'Dois vencedores da mesma guerra passaram quarenta anos se ameaçando sem nunca trocar tiro direto, e foram brigar no quintal dos outros.',
    ['Quando', 'Onde', 'Como terminou'], {
    cortinadeferro: ['A cortina de ferro', 'de 1946 em diante', 'Europa rachada em dois blocos', 'fronteira fechada por décadas', 'A expressão ficou famosa num discurso de Churchill nos Estados Unidos, quando ele já nem era mais primeiro-ministro. E não era só figura de linguagem: virou arame, campo minado e permissão para atravessar.'],
    aliancas: ['OTAN e Pacto de Varsóvia', '1949 e 1955', 'aliança militar de cada lado', 'a Europa virou tabuleiro', 'A aliança do oeste veio primeiro; a do leste nasceu quando a Alemanha Ocidental entrou na outra. Nenhuma das duas chegou a disparar contra a outra: a função era garantir que atacar um valia atacar todos.'],
    coreia: ['A Guerra da Coreia', 'de 1950 a 1953', 'península coreana', 'armistício, não paz', 'Terminou quase na mesma linha onde tinha começado, e sem tratado de paz: o que existe até hoje é um cessar-fogo. A fronteira mais vigiada do planeta é o resto de uma guerra que tecnicamente nunca acabou.'],
    misseis: ['A crise dos mísseis', 'outubro de 1962', 'Cuba e o Caribe', 'treze dias à beira do desastre', 'A saída incluiu um acordo que ficou escondido: os Estados Unidos também tiraram mísseis da Turquia, e isso só apareceu anos depois. Foi dessa crise que nasceu a linha direta entre Washington e Moscou.'],
    vietna: ['A Guerra do Vietnã', 'de 1955 a 1975', 'sudeste asiático', 'derrota da maior potência militar', 'Foi a primeira guerra que entrou na sala de jantar pela televisão, e a imagem fez mais estrago na opinião pública do que qualquer batalha. O país saiu unificado, e o custo humano local foi muito maior que o americano.'],
    desfecho: ['O fim da Guerra Fria', 'de 1989 a 1991', 'leste europeu e União Soviética', 'um dos lados se desmanchou sozinho', 'Não houve rendição nem tratado de paz: em dois anos os regimes do leste caíram em série, o muro de Berlim foi aberto e a própria União Soviética se dissolveu por decisão das suas próprias repúblicas.']
})

T('História', '🏳️', 'descolonizacao', 'A descolonização da África e da Ásia',
    'Em cerca de trinta anos dezenas de países nasceram no mapa, uns por negociação e outros depois de guerra longa contra quem não queria sair.',
    ['Quando', 'De quem saiu', 'Como foi'], {
    indiapaquistao: ['Índia e Paquistão', '1947', 'Reino Unido', 'independência com partilha', 'A linha entre os dois países foi traçada em poucas semanas por um advogado inglês que nunca tinha pisado na região. Milhões atravessaram a fronteira às pressas, e a violência daquela separação ainda cobra preço hoje.'],
    gana: ['Gana', '1957', 'Reino Unido', 'primeira da África subsaariana', 'Nkrumah saiu da cadeia direto para o governo, depois de ganhar eleição estando preso. O país trocou o nome de Costa do Ouro pelo de um império africano antigo, e escolher o próprio nome virou moda no continente.'],
    argelia: ['Argélia', 'de 1954 a 1962', 'França', 'oito anos de guerra', 'A França não tratava a Argélia como colônia e sim como parte do próprio país, e por isso a guerra foi tão dura. Ela derrubou um governo em Paris, quase provocou um golpe militar e ainda é ferida aberta nos dois lados.'],
    anodaafrica: ['O Ano da África', '1960', 'França, Bélgica e Reino Unido', 'dezessete países em doze meses', 'Foram dezessete independências num ano só, quase todas por acordo. Só que o governo novo herdava fronteira de régua, economia dependente de um produto e nenhuma instituição pensada para governar o país inteiro.'],
    coloniasportuguesas: ['As colônias portuguesas na África', 'de 1961 a 1975', 'Portugal', 'guerra longa nos dois lados', 'Portugal segurou as colônias por treze anos de guerra, e foi essa guerra que acabou derrubando a ditadura em Lisboa. As independências vieram logo depois do golpe de militares portugueses cansados de lutar.'],
    bandung: ['A conferência de Bandung', '1955', 'países recém-independentes', 'terceira via entre os dois blocos', 'Quase trinta países da Ásia e da África se reuniram na Indonésia para dizer que não queriam escolher lado na Guerra Fria. Dali saiu o movimento dos não alinhados, que juntou gente demais para conseguir agir junto.']
})

T('História', '✊', 'direitoscivis', 'As lutas por direitos civis no mundo',
    'Direito que hoje parece óbvio foi arrancado com boicote, marcha e cadeia, quase sempre por gente que não viveu o bastante para ver o resultado.',
    ['Quando', 'Onde', 'O que se conquistou'], {
    votofeminino: ['O voto das mulheres', 'de 1893 em diante', 'Nova Zelândia foi a primeira', 'direito de votar e de ser votada', 'A Nova Zelândia abriu a fila, e a Suíça só liberou o voto feminino nacional em 1971, com um cantão resistindo até 1990. Direito velho num lugar pode ser novidade recente logo ali do lado, no país vizinho.'],
    boicoteonibus: ['O boicote aos ônibus', '1955 e 1956', 'Montgomery, Estados Unidos', 'fim da separação no transporte', 'Rosa Parks não estava cansada demais para levantar: era secretária de uma entidade de direitos civis e o gesto foi planejado. Uma adolescente tinha feito o mesmo meses antes, e o movimento esperou o caso certo.'],
    marchawashington: ['A marcha sobre Washington', 'agosto de 1963', 'Estados Unidos', 'pressão pela lei de direitos civis', 'O trecho mais famoso do discurso de Martin Luther King não estava no papel: ele improvisou depois que uma cantora, atrás dele, gritou para contar do sonho. A lei de direitos civis saiu no ano seguinte.'],
    marchadosal: ['A marcha do sal', '1930', 'Índia colonial', 'desobediência civil em massa', 'Gandhi caminhou mais de trezentos quilômetros até o mar para pegar um punhado de sal e quebrar o monopólio inglês. Escolheu o sal justamente porque todo mundo, rico ou pobre, precisava dele todo santo dia.'],
    apartheid: ['O fim do apartheid', 'de 1948 a 1994', 'África do Sul', 'voto e cidadania para todos', 'Mandela passou vinte e sete anos preso e saiu para negociar com quem o prendeu. Na eleição de 1994 a fila tinha quilômetros, com gente votando pela primeira vez aos oitenta anos no país onde tinha nascido.'],
    stonewall: ['Stonewall', 'junho de 1969', 'Nova York', 'saída do silêncio', 'A batida policial naquele bar era rotina; o que mudou foi a clientela ter revidado e a confusão ter durado dias. O aniversário do episódio virou a data das paradas do orgulho no mundo inteiro.']
})

T('História', '😷', 'pandemias', 'As grandes pandemias da história',
    'Doença já derrubou império, mudou salário e apressou invenção, e quase sempre a lenda que sobrou conta a história errada.',
    ['Quando', 'Onde', 'O que ficou depois'], {
    justiniano: ['A peste de Justiniano', 'a partir de 541', 'Império Bizantino e Mediterrâneo', 'fim do sonho de refazer Roma', 'Chegou pelo porto junto com o trigo, e o imperador que queria reunificar o antigo império perdeu gente demais para segurar o que já tinha conquistado. Só muito depois se confirmou que era a mesma bactéria da peste negra.'],
    pestenegra: ['A peste negra', 'de 1347 a 1351', 'Europa, Ásia e norte da África', 'falta de gente abalou a servidão', 'Com tanta morte, quem sobrou virou mão de obra disputada e passou a exigir pagamento melhor. O rato leva a culpa sozinho, mas hoje se discute se a pulga humana e o contágio direto não espalharam tanto quanto ele.'],
    variola: ['A varíola nas Américas', 'do século 16 em diante', 'do México aos Andes', 'populações inteiras dizimadas', 'Não foi só a espada que derrubou os impérios americanos: em vários lugares a doença chegou antes do exército. A varíola também é a única doença humana que o mundo conseguiu apagar do mapa, em 1980.'],
    gripede1918: ['A gripe de 1918', '1918 e 1919', 'mundo inteiro, em três ondas', 'a pandemia mais mortal do século 20', 'Não começou na Espanha. Os países que estavam em guerra censuravam a notícia para não abalar a tropa, e a Espanha, neutra, publicava tudo. O nome pegou só porque de lá vinha informação, e isso a marcou para sempre.'],
    colera: ['A cólera em Londres', '1854', 'bairro do Soho', 'nasce a epidemiologia', 'Um médico marcou cada morte num mapa da vizinhança, viu que tudo apontava para uma bomba de água e mandou tirar a alavanca. Era a prova de que a doença vinha da água suja, e não do ar ruim, como se acreditava.'],
    hiv: ['O HIV e a aids', 'dos anos 1980 para cá', 'começou na África central', 'de sentença de morte a doença tratável', 'Nos primeiros anos o diagnóstico era quase certeza de morte, e vinha com preconceito de brinde. O coquetel de remédios mudou isso nos anos 1990, e hoje quem trata direito chega a não transmitir mais o vírus.']
})

T('História', '🗓️', 'datascomemorativas', 'De onde vêm as datas comemorativas',
    'Quase toda data do calendário tem uma origem diferente da que se conta por aí, e boa parte delas foi criada por motivo político ou comercial.',
    ['Quando', 'De onde veio', 'O que virou'], {
    natal: ['O Natal', '25 de dezembro', 'data fixada em Roma no século 4', 'festa de família no mundo todo', 'Nenhum evangelho dá a data do nascimento. O dia foi escolhido em Roma, perto das festas de inverno que já existiam, e boa parte do que se faz hoje, como a árvore e o papai noel de vermelho, é costume do século 19 para cá.'],
    diadasmaes: ['O Dia das Mães', 'segundo domingo de maio', 'campanha de uma americana em 1908', 'a data mais movimentada do comércio', 'Anna Jarvis criou a data em homenagem à própria mãe e passou o resto da vida tentando acabar com ela, revoltada com a venda de cartão e flor. Chegou a ser presa protestando contra uma convenção de floricultura.'],
    diadotrabalho: ['O Dia do Trabalho', 'primeiro de maio', 'greve de Chicago em 1886', 'feriado em boa parte do mundo', 'A data lembra a greve pela jornada de oito horas e a repressão que veio depois. Nos Estados Unidos, onde tudo aconteceu, o feriado do trabalho foi jogado para setembro justamente para não lembrar disso.'],
    halloween: ['O Halloween', '31 de outubro', 'festa celta de fim de colheita', 'fantasia, doce e filme de terror', 'A lanterna entalhada começou com nabo na Irlanda e só virou abóbora quando os imigrantes chegaram à América e acharam um legume maior e mais fácil de cavar. Pedir doce de porta em porta é costume do século 20.'],
    anonovo: ['O Ano-Novo', 'primeiro de janeiro', 'calendário romano reformado', 'virada comemorada fuso a fuso', 'Janeiro nem sempre abriu o ano: em muitos lugares ele começava em março, e a Inglaterra só mudou em 1752. Quem já usava outro calendário, como o chinês e o judaico, continuou virando o ano no próprio dia.'],
    diadamulher: ['O Dia da Mulher', '8 de março', 'congressos e greves operárias', 'data de luta virou data de flor', 'A história do incêndio numa fábrica que teria dado origem à data é mistura confusa de dois episódios diferentes. Ela nasceu mesmo de congresso operário e das manifestações russas de 1917, que derrubaram o czar.']
})

T('História', '🪙', 'dinheirohistoria', 'A história do dinheiro',
    'Do saco de cevada ao número na tela, o dinheiro já trocou de corpo várias vezes, e cada troca dessas mexeu com quem manda em quem.',
    ['Quando', 'Onde', 'Como funcionava'], {
    escambo: ['O escambo', 'antes da moeda cunhada', 'aldeias e mercados antigos', 'troca direta de coisa por coisa', 'A ideia de que todo mundo vivia trocando galinha por sapato antes da moeda é história contada por economista, não achado de arqueólogo. O que se encontra é dívida anotada: fiado registrado em barro bem antes da moeda.'],
    moedacunhada: ['A moeda cunhada', 'século 7 antes de Cristo', 'Lídia, na atual Turquia', 'peso e liga garantidos por um selo', 'O selo do rei não criava valor: dizia que o peso e a liga eram aqueles mesmos, para ninguém ter que pesar a cada compra. Quando o rei precisava de dinheiro, misturava mais cobre na liga e o preço de tudo subia.'],
    papelmoeda: ['O papel-moeda', 'por volta do século 11', 'China', 'papel que vale porque alguém promete', 'Comerciantes chineses cansaram de carregar moeda de metal e passaram a trocar recibos de depósito. O governo gostou da ideia, imprimiu demais, e a China teve as primeiras grandes inflações de papel da história.'],
    padraoouro: ['O padrão-ouro', 'do século 19 aos anos 1970', 'Inglaterra e depois quase todo mundo', 'cada nota valia ouro guardado', 'Amarrava as mãos do governo, e era essa a graça, mas também impedia reagir a crise: na Depressão, quem saiu do padrão primeiro se recuperou antes. O último laço entre dólar e ouro foi cortado em 1971.'],
    cartao: ['O cartão de crédito', 'dos anos 1950 em diante', 'Estados Unidos', 'pagar agora com dinheiro de depois', 'A primeira versão era de cartolina e só servia em restaurantes de Nova York. A mágica nunca esteve no plástico: está numa rede de confiança que adianta o dinheiro ao lojista e cobra o cliente no fim do mês.'],
    digital: ['O dinheiro digital', 'dos anos 1990 para cá', 'mundo todo, pelo celular', 'saldo que só existe como registro', 'A maior parte do dinheiro do mundo já não é cédula nem moeda: é número em sistema de banco. Quando falta energia ou rede, o lugar descobre rápido que dinheiro é um acordo, e que esse acordo depende de tomada.']
})

/* ──────────────────────── BICHO E PLANTA ──────────────────────── */

T('Bicho e Planta', '🏅', 'recordistas', 'Os recordistas do reino animal',
    'Toda lista de recorde animal esbarra no mesmo problema: medir bicho solto na natureza é difícil, e o campeão de hoje pode cair amanhã.',
    ['O recorde', 'A marca', 'Onde vive'], {
    girafa: ['Girafa', 'o animal terrestre mais alto', 'de 4,5 a 5,5 m de altura, com o macho no topo', 'savanas da África', 'O pescoço enorme tem os mesmos sete ossos que o seu tem. São os ossos que são compridos, não a quantidade, e isso vale para quase todo mamífero.'],
    baleiaazul: ['Baleia-azul', 'o maior e mais pesado animal conhecido', 'passa das 100 toneladas nos maiores exemplares', 'todos os oceanos', 'Pesar uma baleia inteira quase nunca aconteceu: os números vieram de animais cortados em pedaços na época da caça. Por isso se fala em faixa, nunca em valor cravado.'],
    zifio: ['Zifio-de-cuvier', 'o mergulho mais fundo já medido num mamífero', 'perto de 3 km abaixo da superfície', 'águas profundas de quase todo o mundo', 'Passa mais de duas horas embaixo sem respirar. O recorde só apareceu quando puseram marcadores eletrônicos nos animais; antes ninguém imaginava que um bicho de pulmão descesse tanto.'],
    grifo: ['Grifo-de-rüppell', 'a ave que voa mais alto já confirmada', 'cerca de 11 mil metros de altitude', 'Sahel e leste da África', 'A marca veio de um acidente: um avião bateu num deles sobre a Costa do Marfim em 1973. As penas recolhidas na turbina serviram para identificar a espécie.'],
    camarao: ['Camarão-de-estalo', 'o som mais alto do mar para o tamanho', 'um estouro que rivaliza com o de baleias', 'recifes rasos dos mares quentes', 'A garra fecha tão rápido que ferve a água num ponto minúsculo, e a bolha estoura. O barulho atordoa a presa e já atrapalhou sonar de submarino em tempo de guerra.'],
    coala: ['Coala', 'o mamífero que mais dorme', 'de 18 a 22 horas por dia', 'florestas de eucalipto na Austrália', 'A culpa é da comida: folha de eucalipto tem pouca energia e um bocado de veneno. Dormir é o jeito de gastar pouco enquanto o corpo processa a folha.']
}, 'valores usuais da literatura, arredondados')

T('Bicho e Planta', '🐋', 'maioresanimais', 'Os maiores animais do planeta',
    'Os gigantes de verdade estão quase todos na água, porque o mar segura um peso que nenhuma perna aguentaria em terra firme.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    baleiaazul: ['Baleia-azul', 'todos os oceanos, migrando entre polos e trópicos', 'de 24 a 30 m de comprimento', 'de 80 a mais de 150 toneladas', 'krill, aos bilhões', 'A língua dela sozinha pesa o mesmo que um elefante. Para encher a boca, engole um volume de água maior que o próprio corpo e depois espreme tudo pelas barbatanas da boca.'],
    tubaraobaleia: ['Tubarão-baleia', 'águas quentes de todos os oceanos', 'de 9 a 12 m, com registros maiores', 'perto de 20 toneladas', 'plâncton e peixe miúdo, filtrados', 'É o maior peixe vivo e não morde ninguém. Cada indivíduo tem um padrão de pintas único, e pesquisadores identificam os animais com um programa feito para achar estrelas no céu.'],
    elefante: ['Elefante-africano', 'savanas e florestas da África subsaariana', 'de 3 a 4 m de altura no ombro', 'de 4 a 7 toneladas', 'capim, folha, casca e fruta', 'Come mais de cem quilos de vegetal por dia e digere mal de propósito: espalha semente inteira pelo caminho. Onde o elefante some, árvore inteira deixa de brotar.'],
    girafa: ['Girafa', 'savanas da África', 'de 4,5 a 5,5 m de altura', 'de 800 a 1.200 kg', 'folha de acácia, colhida no alto', 'O coração precisa de uma pressão altíssima para empurrar sangue até aquela cabeça. Quando ela abaixa para beber, válvulas no pescoço seguram o baque e evitam o desmaio.'],
    avestruz: ['Avestruz', 'campos e semidesertos da África', 'de 2 a 2,7 m de altura', 'de 100 a 150 kg', 'semente, broto, inseto e lagarto', 'Maior ave viva, não voa e não faz falta: corre mais que cavalo em trecho curto. O ovo é o maior de qualquer ave atual e leva quase uma hora para cozinhar.'],
    lulacolossal: ['Lula-colossal', 'águas profundas ao redor da Antártida', 'estimada em cerca de 10 m com os braços', 'estimado em perto de meia tonelada', 'peixe grande de fundo', 'Tem o maior olho do reino animal, do tamanho de um prato raso. Quase tudo que se sabe dela veio de bicos encontrados no estômago de cachalotes.']
}, 'valores usuais da literatura, arredondados')

T('Bicho e Planta', '🤏', 'menoresanimais', 'Os menores vertebrados do mundo',
    'Existe um limite para encolher: abaixo de certo tamanho o corpo perde água e calor rápido demais, e esses bichos vivem colados nesse limite.',
    ['Onde vive', 'Tamanho', 'Peso'], {
    rapapua: ['Rã da Papua-Nova Guiné', 'folha seca do chão da mata, na Papua-Nova Guiné', 'perto de 7,7 mm de comprimento', 'peso que balança comum nem registra', 'É o menor vertebrado conhecido e cabe numa moeda pequena. Foi achada pelo ouvido: seguiram um chiado agudo no chão e levaram tempo para aceitar que aquilo era sapo, não grilo.'],
    beijaflor: ['Beija-flor-abelha', 'matas e jardins de Cuba', 'de 5 a 6 cm com o bico', 'cerca de 2 gramas', 'Bate as asas tão rápido que o som vira zumbido de inseto. O coração passa de mil batidas por minuto em voo, e o ninho tem o tamanho de uma tampa de garrafa.'],
    morcego: ['Morcego-focinho-de-porco', 'cavernas de calcário na Tailândia e em Mianmar', 'cerca de 3 cm de corpo', 'perto de 2 gramas', 'Disputa com o musaranho-etrusco o posto de menor mamífero: um ganha no peso, o outro no comprimento. Vive em poucas cavernas e some se elas forem mexidas.'],
    musaranho: ['Musaranho-etrusco', 'matas e muros de pedra do sul da Europa e da Ásia', 'de 3 a 5 cm sem a cauda', 'de 1,5 a 2,5 gramas', 'Precisa comer quase o próprio peso todo dia ou morre em poucas horas. O coração dele bate mais de mil vezes por minuto mesmo com o bicho parado.'],
    peixinho: ['Peixe Paedocypris', 'turfeiras ácidas de Sumatra e de Bornéu', 'perto de 8 mm quando adulto', 'peso que balança comum nem registra', 'Vive numa água ácida onde quase nenhum peixe aguenta, e o crânio dele é tão simples que parece de filhote. As turfeiras onde ele mora vêm sendo drenadas para plantio.'],
    camaleao: ['Camaleão Brookesia nana', 'mata de montanha no norte de Madagascar', 'cerca de 2,2 cm com a cauda, o macho', 'fração de grama', 'O macho é menor que a fêmea e cabe na ponta do dedo. Foi descrito só em 2021, e o retalho de floresta onde apareceu é pequeno o bastante para caber numa tarde de caminhada.']
})

T('Bicho e Planta', '🐆', 'maisrapidos', 'Os mais rápidos por terra, mar e ar',
    'Comparar velocidade de bicho é traiçoeiro: mergulho não é corrida, e muito número famoso saiu de cronometragem improvisada de barco.',
    ['Corre, nada ou voa', 'Velocidade', 'Onde vive'], {
    falcao: ['Falcão-peregrino', 'no ar, em mergulho', 'passa de 300 km/h ao despencar', 'quase o mundo todo, inclusive cidades', 'Ele não voa nessa velocidade: ele cai. Fecha as asas, vira uma gota e acerta a presa no ar. Em voo reto e batido é bem mais devagar que um andorinhão.'],
    guepardo: ['Guepardo', 'em terra, na arrancada', 'perto de 100 km/h em trecho curto', 'savanas e campos da África', 'Aguenta esse ritmo por menos de meio minuto e depois precisa parar para esfriar. Se um leão chega e toma a caça nesse intervalo, ele correu à toa e ainda perdeu a refeição.'],
    andorinhao: ['Andorinhão-preto', 'no ar, em voo reto', 'entre os mais rápidos batendo asa', 'penhascos e telhados da Europa e da África', 'Passa meses no ar sem pousar: come, bebe e cochila voando. Só encosta no chão para fazer ninho, e o filhote que sai do ninho pode levar dois anos para pousar de novo.'],
    peixevela: ['Peixe-vela', 'na água', 'tido como o peixe mais rápido, sem medida boa', 'mares quentes do mundo todo', 'O número famoso de mais de cem por hora saiu de um teste antigo com linha de pesca e ninguém repetiu direito. Medições recentes de nado dão bem menos, e a fama continua.'],
    mako: ['Tubarão-mako', 'na água, em disparada', 'o tubarão mais veloz que se conhece', 'mar aberto, em águas temperadas e quentes', 'Sai da água inteiro quando ataca ou quando é fisgado. Corpo de torpedo e cauda em meia-lua fazem o serviço; é parente próximo do tubarão-branco.'],
    antilope: ['Antílope-americano', 'em terra, na distância', 'segura perto de 60 km/h por quilômetros', 'campos do oeste da América do Norte', 'Corre muito mais do que qualquer predador vivo hoje na América. A explicação provável é um gato veloz que existia por lá e se extinguiu: ele ficou rápido demais para o mundo que sobrou.']
}, 'valores usuais da literatura, arredondados')

T('Bicho e Planta', '⏳', 'maislongevos', 'Os animais que vivem mais',
    'Idade de bicho velho quase nunca é contada em aniversário: ela sai de anel de concha, de camada do olho e até de arpão achado dentro do corpo.',
    ['Onde vive', 'Vive até', 'Como se sabe a idade'], {
    tubaraogelo: ['Tubarão-da-groenlândia', 'águas geladas e fundas do Atlântico Norte', 'estimado em mais de 250 anos, em liberdade', 'proteína do cristalino do olho', 'Só fica adulto perto dos cem anos de idade. Nada mais devagar que gente caminhando, come carniça e já apareceu com resto de rena no estômago.'],
    quahog: ['Quahog-do-oceano', 'fundo de areia do Atlântico Norte', 'mais de 500 anos, em liberdade', 'anéis de crescimento da concha', 'O mais famoso deles, apelidado de Ming, foi aberto por pesquisadores que só depois contaram os anéis. A concha guarda o registro de cada ano, como anel de tronco de árvore.'],
    baleiartico: ['Baleia-da-groenlândia', 'mares do Ártico', 'passa dos 200 anos, em liberdade', 'ponta de arpão antiga achada na carne', 'Caçadores do Alasca encontraram em baleias vivas pontas de arpão de pedra e de marfim que saíram de uso no século 19. O bicho tinha carregado aquilo a vida inteira.'],
    tartaruga: ['Tartaruga-gigante-de-aldabra', 'ilhas do oceano Índico', 'passa dos 150 anos, sob cuidado humano', 'registro de quem cuidou do animal', 'A mais famosa vive num jardim da ilha de Santa Helena e já era adulta quando chegou lá, ainda no século 19. Ninguém sabe em que ano ela nasceu.'],
    tuatara: ['Tuatara', 'ilhas pequenas da Nova Zelândia', 'mais de 100 anos, em liberdade', 'acompanhamento de animais marcados', 'Parece lagarto, mas é o último sobrevivente de uma linhagem bem antiga. Um macho de cativeiro virou pai passados os cem anos e a notícia correu o mundo.'],
    peixerocha: ['Peixe-rocha-de-olho-áspero', 'fundos rochosos do Pacífico Norte', 'perto de 200 anos, em liberdade', 'anéis do ossinho do ouvido', 'Um peixe pescado hoje pode ter nascido antes do seu bisavô. Como demora demais para se reproduzir, um trecho de mar pescado em excesso leva décadas para voltar ao normal.']
}, 'idades máximas estimadas, não a média da espécie')

T('Bicho e Planta', '☠️', 'peconhentos', 'Peçonhentos e venenosos: quem é quem',
    'A regra é simples: peçonhento injeta, com presa ou ferrão, e venenoso só faz mal se você comer o bicho ou encostar nele.',
    ['Onde vive', 'Peçonhento ou venenoso', 'O que faz'], {
    vespadomar: ['Vespa-do-mar', 'costa norte da Austrália e sudeste da Ásia', 'peçonhenta, pelo tentáculo', 'queimadura violenta e parada do coração', 'É uma água-viva quase invisível dentro da água. Praias do norte australiano têm rede e vinagre à mão, porque o vinagre desarma os filamentos que ainda não dispararam.'],
    taipan: ['Taipan-do-interior', 'planícies secas do centro da Austrália', 'peçonhenta, pela presa', 'a peçonha de cobra mais potente já medida', 'Tem a peçonha mais forte em teste e quase nunca morde gente: vive longe de tudo e foge. Cobra perigosa de verdade é a que cruza com muita gente, não a mais potente.'],
    polvoaneis: ['Polvo-de-anéis-azuis', 'poças de maré do Pacífico e da Oceania', 'peçonhento, pela mordida', 'paralisa o corpo, inclusive a respiração', 'Cabe na palma da mão e a mordida quase não dói. Os anéis só ficam azuis brilhantes quando ele está irritado, e nessa hora já é tarde para querer pegar no colo.'],
    radourada: ['Rã-dourada-venenosa', 'floresta do litoral do Pacífico colombiano', 'venenosa, pela pele', 'basta encostar para passar muito mal', 'O veneno não é fabricado por ela: vem de besouros da dieta, e rã criada com grilo em cativeiro fica inofensiva. Indígenas da região passavam a ponta do dardo no dorso do animal.'],
    baiacu: ['Baiacu', 'mares quentes, inclusive a costa do Brasil', 'venenoso, na carne e nas vísceras', 'paralisa quem come o peixe mal limpo', 'O veneno vem de bactérias que ele acumula e não existe antídoto. No Japão só cozinheiro licenciado pode servir; no Brasil a recomendação é mais curta ainda: não coma.'],
    escorpiao: ['Escorpião-amarelo', 'cidades do Brasil, em entulho, bueiro e obra', 'peçonhento, pelo ferrão', 'dor forte, e risco sério em criança', 'A fêmea se reproduz sozinha, sem macho, então uma só já começa uma colônia num terreno baldio. É o escorpião que mais manda gente ao hospital no país.']
})

T('Bicho e Planta', '🆘', 'ameacados', 'Bichos à beira do fim',
    'Nem toda espécie ameaçada some por caça: perder o lugar onde vive costuma matar mais devagar e com muito mais eficiência.',
    ['Onde vive', 'Quantos restam', 'O que ameaça'], {
    vaquita: ['Vaquita', 'um canto do golfo da Califórnia, no México', 'menos de duas dezenas de animais', 'rede de pesca ilegal', 'É o menor golfinho do mundo e morre afogado em rede armada para outro peixe, o totoaba, cuja bexiga vale fortuna no mercado negro. Ela nunca foi caçada de propósito.'],
    rinoceronte: ['Rinoceronte-de-java', 'um único parque na ilha de Java', 'algumas dezenas, todos no mesmo lugar', 'espaço apertado e caça pelo chifre', 'Estão todos numa península só. Um tsunami ou uma doença no rebanho acabaria com a espécie inteira num ano, e por isso se discute levar parte deles para outro lugar.'],
    gorila: ['Gorila-das-montanhas', 'montanhas de Ruanda, Uganda e Congo', 'mais de mil, e subindo', 'doença humana e conflito armado', 'É o caso raro que melhorou. Turismo controlado paga guarda e veterinário, e hoje quem visita usa máscara e fica longe: uma gripe boba de gente mata gorila.'],
    kakapo: ['Kakapo', 'ilhas sem predador da Nova Zelândia', 'pouco mais de duas centenas', 'gato, rato e arminho trazidos de fora', 'É um papagaio gordo que não voa e só se reproduz quando certa árvore dá fruto. Cada ave tem nome e ficha própria, e a população inteira cabe numa planilha.'],
    micoleao: ['Mico-leão-dourado', 'restinga e mata atlântica do Rio de Janeiro', 'poucos milhares, contra centenas nos anos 1970', 'mata picada em pedaços', 'Voltou do quase nada com criação em zoológico e replantio de corredor de mata. O que faltava era ligar os pedaços de floresta; hoje existe até passagem sobre rodovia.'],
    tartaruga: ['Tartaruga-de-pente', 'recifes de mares quentes, inclusive no Brasil', 'queda grande em quase todo o mundo', 'comércio do casco e perda de praia', 'O casco dela virou pente, óculos e enfeite por séculos. Ela come esponja e mantém o recife em ordem; sem ela, a esponja toma o espaço que seria do coral.']
})

T('Bicho e Planta', '🕯️', 'extintosrecentes', 'Os que sumiram na nossa frente',
    'Essas espécies não morreram num passado nebuloso: tem gente que desenhou, fotografou e até filmou o último bicho de cada uma delas.',
    ['Onde vivia', 'Último registro', 'O que aconteceu'], {
    dodo: ['Dodô', 'ilha Maurício, no oceano Índico', 'meados do século 17', 'caça e bichos trazidos em navio', 'Não era bobo: nunca tinha visto predador e por isso não fugia de ninguém. Porco e rato saídos dos navios comiam os ovos no chão, e isso fez mais estrago que os marinheiros.'],
    tilacino: ['Tigre-da-tasmânia', 'Tasmânia e antes também a Austrália', 'o último morreu num zoológico em 1936', 'recompensa paga por cabeça abatida', 'Era marsupial, parente de canguru, e só parecia cachorro por coincidência da evolução. Virou protegido por lei poucas semanas antes de morrer o último conhecido.'],
    rolinha: ['Rolinha-passageira', 'florestas do leste dos Estados Unidos', 'a última morreu em cativeiro em 1914', 'caça em escala industrial', 'Voava em bandos que escureciam o céu por horas e era a ave mais numerosa do continente. Ser bilhões não salvou ninguém: a espécie desabou em poucas décadas.'],
    vacamarinha: ['Vaca-marinha-de-steller', 'mar de Bering, perto das ilhas Comandante', 'menos de trinta anos depois de descrita', 'caçada por carne pelas tripulações', 'Um naturalista a descreveu em 1741, náufrago numa ilha gelada. Era um peixe-boi gigante, manso e lento, e virou despensa de quem passava por aquele mar.'],
    quagga: ['Quagga', 'campos do sul da África', 'a última morreu num zoológico em 1883', 'caça pelo couro e disputa por pasto', 'Parecia meia zebra: listrada na frente, lisa atrás. Só muito depois se descobriu que era uma variação da zebra-comum, e hoje há um projeto cruzando zebras para resgatar o padrão.'],
    ararinha: ['Ararinha-azul', 'caatinga do norte da Bahia', 'o último animal solto sumiu em 2000', 'corte da mata de galeria e tráfico', 'Sumiu da natureza, mas não do mundo: sobrou em criadouro na Europa. Filhotes criados lá voltaram a voar na Bahia nos últimos anos, perto do mesmo riacho de antes.']
})

T('Bicho e Planta', '🦖', 'dinossauros', 'Dinossauros, ficha por ficha',
    'Quase tudo que se sabe de dinossauro vem de osso quebrado e pegada em pedra, então tamanho aqui é sempre estimativa, nunca medida de fita.',
    ['Quando viveu', 'Onde viveu', 'Tamanho', 'Do que comia'], {
    tiranossauro: ['Tiranossauro-rex', 'fim do Cretáceo', 'oeste da América do Norte', 'de 11 a 13 m de comprimento', 'carne, caçada e achada', 'A mordida dele quebrava osso, coisa rara em réptil, e há fóssil de presa com marca de dente. Os braços curtos e fortes continuam sem explicação fechada.'],
    argentinossauro: ['Argentinossauro', 'meio do Cretáceo', 'o que hoje é a Argentina', 'estimado de 30 a 35 m de comprimento', 'planta, em quantidade enorme', 'Foi montado a partir de poucas vértebras e um osso de perna, então o tamanho é conta de papel, não medida. Uma vértebra sozinha é mais alta que uma pessoa em pé.'],
    velociraptor: ['Velociraptor', 'fim do Cretáceo', 'desertos da Mongólia e da China', 'do tamanho de um peru grande', 'bicho pequeno e carniça', 'Tinha penas, e o cinema errou feio no tamanho. Existe um fóssil famoso dele agarrado a um protoceratops, os dois enterrados de uma vez por uma duna que desabou.'],
    triceratops: ['Triceratops', 'fim do Cretáceo', 'oeste da América do Norte', 'de 8 a 9 m de comprimento', 'planta rasteira e arbusto', 'Os chifres e a gola serviam mais para brigar entre eles e para exibição do que contra predador. Muitos crânios trazem marca de chifre de outro triceratops.'],
    estegossauro: ['Estegossauro', 'fim do Jurássico', 'oeste da América do Norte', 'de 7 a 9 m de comprimento', 'planta baixa', 'As placas das costas provavelmente serviam para exibir e para trocar calor, e não de armadura. A arma de verdade ficava na ponta da cauda, com quatro espinhos.'],
    espinossauro: ['Espinossauro', 'meio do Cretáceo', 'norte da África', 'estimado em mais de 14 m', 'peixe grande de rio', 'Os melhores fósseis dele viraram pó num bombardeio em Munique na Segunda Guerra, e só restaram desenhos. Achados novos no Saara reabriram a discussão sobre como ele nadava.']
}, 'estimativas de tamanho, que mudam a cada achado novo')

T('Bicho e Planta', '🐳', 'baleias', 'Baleias e golfinhos, ficha a ficha',
    'São mamíferos que voltaram para o mar: ainda respiram ar, parem filhote vivo e dão leite debaixo da água salgada.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    baleiaazul: ['Baleia-azul', 'todos os oceanos, em migrações longas', 'de 24 a 30 m', 'de 80 a mais de 150 toneladas', 'krill', 'O canto dela atravessa centenas de quilômetros de oceano numa frequência tão grave que ouvido humano mal alcança. Quase foi extinta pela caça e ainda não voltou ao que era.'],
    cachalote: ['Cachalote', 'mares fundos do mundo todo', 'de 15 a 18 m, o macho maior', 'de 35 a 50 toneladas', 'lula de fundo, inclusive as gigantes', 'Tem o maior cérebro de qualquer animal e mergulha quilômetros atrás de lula. Muitos trazem marca redonda de ventosa na pele, lembrança de briga lá embaixo no escuro.'],
    orca: ['Orca', 'de polo a polo, em todos os mares', 'de 6 a 9 m', 'de 3 a 6 toneladas', 'peixe, foca e até baleia', 'Apesar do nome, é o maior golfinho que existe. Cada grupo tem cardápio e sotaque próprios: uns só comem salmão, outros só caçam foca, e eles não se misturam.'],
    jubarte: ['Baleia-jubarte', 'migra do frio polar até a costa do Brasil', 'de 13 a 16 m', 'perto de 30 toneladas', 'krill e peixe miúdo', 'Os machos cantam frases que mudam de ano em ano, e a moda nova se espalha de um oceano para o outro. Na Bahia elas chegam para parir e quase não comem.'],
    golfinho: ['Golfinho-nariz-de-garrafa', 'mares quentes e temperados do mundo', 'de 2 a 4 m', 'de 150 a 300 kg', 'peixe e lula', 'Cada um tem um assobio próprio, que funciona como nome, e os outros chamam por ele. Enxerga com som: o sonar dele distingue objeto enterrado na areia.'],
    boto: ['Boto-cor-de-rosa', 'rios Amazonas e Orinoco', 'de 2 a 2,7 m', 'de 100 a 185 kg', 'peixe de rio, inclusive piranha', 'O pescoço dele dobra, coisa que golfinho de mar não faz, e isso serve para desviar de tronco na água turva. Fica rosado com a idade e com a briga entre machos.']
})

T('Bicho e Planta', '🦈', 'tubaroes', 'Os tubarões, ficha a ficha',
    'Tubarão existe desde antes das árvores, e a maioria das espécies é menor que uma pessoa, o que não combina nada com a fama.',
    ['Onde vive', 'Tamanho', 'Vive até', 'Do que come'], {
    branco: ['Tubarão-branco', 'águas temperadas de todos os oceanos', 'de 4 a 6 m, a fêmea maior', 'perto de 70 anos, em liberdade', 'foca, leão-marinho e peixe grande', 'Nunca sobreviveu muito tempo em aquário: precisa nadar longe e para de comer quando preso. Ataca de baixo para cima em alta velocidade, e às vezes sai inteiro da água.'],
    baleia: ['Tubarão-baleia', 'águas quentes de todos os oceanos', 'de 9 a 12 m, com registros maiores', 'estimado em muitas décadas', 'plâncton filtrado', 'O maior peixe vivo come coisa quase microscópica. Uma fêmea achada em Taiwan trazia centenas de filhotes em estágios diferentes, sinal de que ela guarda esperma e vai parindo aos poucos.'],
    martelo: ['Tubarão-martelo-recortado', 'mares quentes e temperados', 'de 3 a 4 m', 'perto de 30 anos, em liberdade', 'peixe, lula e arraia', 'A cabeça larga espalha sensores que captam o campo elétrico de uma arraia enterrada na areia. Forma cardume enorme de dia, o que é comportamento estranho para tubarão.'],
    groenlandia: ['Tubarão-da-groenlândia', 'águas geladas e fundas do Atlântico Norte', 'de 4 a 6 m', 'estimado em mais de 250 anos', 'peixe, lula e carniça', 'Nada mais devagar que gente caminhando e mesmo assim aparece com foca no estômago, provavelmente pega dormindo. Quase todos têm um parasita pendurado no olho.'],
    cabecachata: ['Tubarão-cabeça-chata', 'costas rasas e também rios', 'de 2 a 3,5 m', 'perto de 25 anos, em liberdade', 'peixe, arraia e outros tubarões', 'É o único que sobe rio adentro: já foi visto no Amazonas e a milhares de quilômetros do mar no Mississippi. Por isso responde por encontros em água doce.'],
    mako: ['Tubarão-mako', 'mar aberto, em águas temperadas e quentes', 'de 3 a 4 m', 'perto de 30 anos, em liberdade', 'peixe rápido, como atum e cavala', 'É o mais veloz do grupo e mantém o corpo mais quente que a água em volta, truque que pouquíssimo peixe tem. Salta vários metros fora da água quando é fisgado.']
})

T('Bicho e Planta', '🐙', 'cefalopodes', 'Polvos, lulas e sépias',
    'São parentes do caracol que trocaram a concha por nervo e músculo, e mudam de cor e de textura mais rápido do que você troca de ideia.',
    ['Onde vive', 'Tamanho', 'Vive até', 'Do que come'], {
    polvocomum: ['Polvo-comum', 'fundo rochoso de mares temperados e quentes', 'de 60 cm a 1 m com os braços', 'de 1 a 2 anos, em liberdade', 'caranguejo, molusco e peixe', 'Vive pouquíssimo e aprende muito: abre pote, foge de aquário e reconhece pessoa. Dois terços dos neurônios ficam nos braços, que resolvem parte das coisas sozinhos.'],
    lulagigante: ['Lula-gigante', 'águas fundas de quase todo o mundo', 'de 10 a 13 m com os tentáculos', 'estimado em poucos anos', 'peixe e outras lulas', 'Só foi filmada viva em 2012, depois de séculos de história de marinheiro. Quase todo exemplar conhecido veio morto na praia ou saiu do estômago de um cachalote.'],
    lulacolossal: ['Lula-colossal', 'fundo do oceano ao redor da Antártida', 'estimada em cerca de 10 m, e mais pesada', 'estimado em poucos anos', 'peixe grande de fundo', 'Mais curta que a lula-gigante e muito mais robusta, com ganchos giratórios nos braços em vez de só ventosa. O olho dela é o maior conhecido em qualquer animal.'],
    sepia: ['Sépia-comum', 'fundos de areia do Atlântico leste e do Mediterrâneo', 'de 30 a 45 cm de manto', 'de 1 a 2 anos, em liberdade', 'camarão, caranguejo e peixe', 'Hipnotiza caranguejo com faixas de cor que correm pelo corpo antes do bote. Aquele osso branco que se vende para passarinho roer é a concha interna dela.'],
    nautilo: ['Náutilo', 'encostas de recife fundo no Pacífico', 'cerca de 20 cm de concha', 'mais de 15 anos, em liberdade', 'carniça e crustáceo pequeno', 'É o único do grupo que manteve a concha do lado de fora, e o formato mudou pouco em milhões de anos. Enxerga mal, com um olho sem lente, e cheira o caminho até a comida.'],
    polvoaneis: ['Polvo-de-anéis-azuis', 'poças de maré da Austrália e do Pacífico', 'cabe na palma da mão', 'cerca de 2 anos, em liberdade', 'caranguejo e camarão pequenos', 'A fêmea para de comer para cuidar dos ovos e morre quando eles nascem. A peçonha dele trava a respiração de uma pessoa adulta, e não existe antídoto.']
})

T('Bicho e Planta', '🐅', 'felinos', 'Os grandes felinos',
    'Todo gatão caça do mesmo jeito: espreita, chega bem perto e resolve em segundos, porque nenhum deles aguenta perseguição longa.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    leao: ['Leão', 'savanas da África e um trecho da Índia', 'de 1,7 a 2,5 m com a cauda', 'de 120 a 250 kg, o macho maior', 'antílope, zebra e búfalo', 'É o único felino que vive em grupo, e quem caça quase sempre são as fêmeas. O macho passa o dia parado porque o serviço dele é segurar o território contra outros machos.'],
    tigre: ['Tigre', 'florestas da Índia até a Sibéria', 'de 2,5 a 3,3 m com a cauda', 'de 100 a 300 kg, conforme a região', 'cervo, javali e búfalo', 'Maior felino vivo e o único que gosta de água: entra no rio para se refrescar. As listras estão na pele, não só no pelo, e o desenho não se repete entre dois indivíduos.'],
    onca: ['Onça-pintada', 'Amazônia, Pantanal e boa parte das Américas', 'de 1,8 a 2,7 m com a cauda', 'de 60 a 130 kg', 'capivara, jacaré, tatu e peixe', 'Tem a mordida mais forte entre os felinos para o tamanho do corpo e mata perfurando o crânio, não a garganta. Nada bem e pega jacaré dentro da água mesmo.'],
    leopardo: ['Leopardo', 'África e Ásia, do deserto à montanha', 'de 1,6 a 2,4 m com a cauda', 'de 30 a 90 kg', 'antílope pequeno, macaco e ave', 'Sobe em árvore carregando presa mais pesada que ele para não dividir com leão e hiena. É o mais adaptável do grupo e vive até na periferia de cidade grande.'],
    guepardo: ['Guepardo', 'campos abertos da África e um resto no Irã', 'de 1,7 a 2,3 m com a cauda', 'de 35 a 65 kg', 'gazela e outros antílopes pequenos', 'As garras não recolhem e funcionam como trava de sapato de corrida. É frágil apesar da velocidade: perde a caça para leão e hiena com frequência.'],
    puma: ['Puma', 'do Canadá à Patagônia, o felino de maior alcance', 'de 1,5 a 2,4 m com a cauda', 'de 30 a 100 kg', 'cervo, capivara e bicho pequeno', 'Tem dezenas de nomes populares, de suçuarana a leão-da-montanha, porque cruza países demais. Não ruge: mia, assobia e grita, com garganta de felino pequeno.']
})

T('Bicho e Planta', '🦍', 'primatas', 'Os primatas',
    'Dá para reconhecer um primata pela mão: dedo que agarra, unha em vez de garra e olho na frente da cara, para medir distância de galho.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    gorila: ['Gorila-do-ocidente', 'florestas da África central', 'de 1,4 a 1,8 m em pé', 'de 70 a 200 kg, o macho bem maior', 'folha, talo e fruta', 'O maior primata vivo é quase todo vegetariano e passa o dia mastigando. O macho de dorso prateado bate no peito para evitar briga, não para começar uma.'],
    chimpanze: ['Chimpanzé', 'florestas e savanas da África ocidental e central', 'de 1 a 1,5 m em pé', 'de 30 a 60 kg', 'fruta, folha, inseto e carne', 'Fabrica ferramenta: quebra castanha com pedra e pesca cupim com graveto preparado. Cada bando tem os seus truques e ensina aos filhotes, o que é cultura mesmo.'],
    bonobo: ['Bonobo', 'só ao sul do rio Congo', 'de 1 a 1,3 m em pé', 'de 30 a 50 kg', 'fruta, broto e bicho pequeno', 'Parente tão próximo nosso quanto o chimpanzé e de temperamento oposto: resolve tensão com afago em vez de pancada. Quem manda no grupo são as fêmeas.'],
    orangotango: ['Orangotango-de-bornéu', 'florestas da ilha de Bornéu', 'de 1,2 a 1,5 m em pé', 'de 40 a 90 kg, o macho maior', 'fruta madura, sobretudo figo', 'Vive quase sempre sozinho e tem a infância mais longa do reino animal depois da nossa: a cria mama e anda com a mãe por perto de oito anos.'],
    mandril: ['Mandril', 'florestas de Camarões, Gabão e Guiné Equatorial', 'de 60 a 95 cm de corpo', 'de 10 a 35 kg, o macho bem maior', 'fruta, semente, inseto e raiz', 'É o maior macaco do mundo, fora os grandes primatas. As cores da cara ficam mais fortes quanto mais alto o posto do macho no bando, e todo mundo entende o recado.'],
    muriqui: ['Muriqui-do-norte', 'restos de mata atlântica em Minas e no Espírito Santo', 'de 55 a 70 cm de corpo', 'de 8 a 15 kg', 'folha e fruta', 'É o maior macaco das Américas e um dos mais ameaçados que existem. Vive sem hierarquia de briga: os machos se abraçam em vez de disputar, coisa rara entre primatas.']
})

T('Bicho e Planta', '🐻', 'ursos', 'Os ursos do mundo',
    'São oito espécies no planeta inteiro, e quase todas comem muito mais planta do que carne, ao contrário do que a fama faz pensar.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    polar: ['Urso-polar', 'gelo marinho do Ártico', 'de 2 a 2,6 m de comprimento', 'de 300 a 600 kg, o macho maior', 'foca, sobretudo a gordura', 'O pelo não é branco: é transparente e oco, e a pele por baixo é preta. Ele caça em cima do gelo, e gelo que derrete cedo demais significa temporada inteira sem comer.'],
    pardo: ['Urso-pardo', 'do Alasca à Europa e à Sibéria', 'de 1,7 a 2,8 m de comprimento', 'de 130 a 600 kg, conforme a região', 'salmão, fruta, raiz e carniça', 'Antes do inverno come sem parar e engorda muito. No sono da hibernação não urina nem perde músculo, e a fêmea ainda pare filhote enquanto dorme.'],
    negro: ['Urso-negro-americano', 'florestas do Canadá ao México', 'de 1,3 a 1,9 m de comprimento', 'de 60 a 250 kg', 'fruta, noz, inseto e lixo', 'É o urso mais numeroso e o mais fácil de topar perto de gente. Aprende rápido onde tem comida fácil, e cidade com lixeira aberta acaba criando urso encrenqueiro.'],
    panda: ['Panda-gigante', 'bambuzais de montanha no centro da China', 'de 1,2 a 1,9 m de comprimento', 'de 70 a 125 kg', 'bambu, quase só isso', 'O intestino dele é de carnívoro e digere bambu muito mal, então precisa comer umas doze horas por dia. Um osso extra do pulso funciona como polegar para segurar o talo.'],
    oculos: ['Urso-de-óculos', 'florestas de montanha dos Andes', 'de 1,2 a 2 m de comprimento', 'de 60 a 175 kg', 'bromélia, fruta e palmito', 'É o único urso da América do Sul e o mais vegetariano depois do panda. As manchas claras da cara mudam de desenho em cada animal, como impressão digital.'],
    malaio: ['Urso-malaio', 'florestas do sudeste da Ásia', 'de 1,1 a 1,5 m de comprimento', 'de 25 a 65 kg', 'mel, cupim e fruta', 'Menor urso do mundo, com língua comprida para tirar mel e cupim de dentro do tronco. A mancha clara do peito varia tanto que já confundiram um deles com gente fantasiada.']
})

T('Bicho e Planta', '🐺', 'canideos', 'Lobos, raposas e parentes',
    'A família toda vive de fôlego, não de força bruta: eles cansam a caça andando, e quase todos comem fruta quando a carne falta.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    lobo: ['Lobo-cinzento', 'florestas e tundras da Europa, Ásia e América do Norte', 'de 1 a 1,6 m com a cauda', 'de 30 a 60 kg', 'alce, cervo e bicho pequeno', 'O bando é uma família: pai, mãe e filhotes de ninhadas diferentes. Aquela conversa de lobo alfa que briga para mandar saiu de estudo com animais presos juntos à força.'],
    raposa: ['Raposa-vermelha', 'quase todo o hemisfério norte, inclusive cidades', 'de 90 cm a 1,3 m com a cauda', 'de 4 a 8 kg', 'roedor, ave, inseto e fruta', 'Pula de cabeça na neve para pegar rato que ela só escuta. É o carnívoro terrestre de maior distribuição no mundo e se deu muito bem morando em subúrbio.'],
    loboguara: ['Lobo-guará', 'cerrado do Brasil e de países vizinhos', 'de 1,2 a 1,5 m com a cauda', 'de 20 a 30 kg', 'lobeira, fruta e bicho pequeno', 'Não é lobo nem raposa: está sozinho no galho dele. Metade da dieta é fruta, e a lobeira que ele adora germina melhor depois de passar pelo intestino do bicho.'],
    licaon: ['Licaão', 'savanas do sul e do leste da África', 'de 90 cm a 1,1 m de corpo', 'de 18 a 36 kg', 'antílope de porte médio', 'O bando decide caçar espirrando: quanto mais espirro, maior a chance de levantarem. Acerta a presa na maioria das tentativas, taxa bem melhor que a do leão.'],
    coiote: ['Coiote', 'da Costa Rica ao Alasca, e se espalhando', 'de 1 a 1,3 m com a cauda', 'de 8 a 20 kg', 'roedor, fruta, carniça e lixo', 'Quanto mais perseguido, mais ele se espalha: com o bando quebrado, as fêmeas passam a ter ninhada maior. Hoje vive dentro de cidades grandes dos Estados Unidos.'],
    cachorrodomato: ['Cachorro-do-mato', 'matas e cerrados da América do Sul', 'de 80 cm a 1 m com a cauda', 'de 5 a 8 kg', 'fruta, roedor, ave e inseto', 'Anda de noite, quase sempre em casal, e é confundido com cão solto na estrada. É um dos bichos mais atropelados do Brasil, justo por caçar na beira de rodovia.']
})

T('Bicho e Planta', '🦅', 'aves', 'Aves que impressionam',
    'Pena é escama modificada e osso oco é osso reforçado por dentro: a ave é um bicho construído inteiro em volta da conta do peso.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    harpia: ['Harpia', 'copa alta da Amazônia e da mata atlântica', 'até 2 m de envergadura', 'de 4 a 9 kg, a fêmea maior', 'macaco e preguiça', 'A garra dela é mais grossa que dedo de gente e arranca preguiça de galho em pleno voo. Cria um filhote a cada dois ou três anos, e por isso some rápido onde a mata cai.'],
    albatroz: ['Albatroz-errante', 'mares abertos do sul do mundo', 'perto de 3,5 m de envergadura', 'de 6 a 12 kg', 'lula e peixe pegos na superfície', 'Tem a maior envergadura entre as aves vivas e planeia por dias sem bater asa, aproveitando o vento do mar. Alguns casais ficam juntos por décadas seguidas.'],
    avestruz: ['Avestruz', 'campos e semidesertos da África', 'de 2 a 2,7 m de altura', 'de 100 a 150 kg', 'semente, broto e bicho pequeno', 'O olho dela é maior que o próprio cérebro. Não enfia a cabeça na areia: deita o pescoço no chão para sumir de longe, e de perto dá coice capaz de quebrar osso.'],
    condor: ['Condor-dos-andes', 'cordilheira dos Andes, da Venezuela ao Chile', 'perto de 3 m de envergadura', 'de 8 a 15 kg', 'carniça de bicho grande', 'Voa horas sem bater asa, subindo em corrente de ar quente. Só começa a se reproduzir perto dos dez anos de idade e põe um ovo a cada dois anos, no máximo.'],
    tuiuiu: ['Tuiuiú', 'Pantanal e outras áreas alagadas da América do Sul', 'de 1,2 a 1,4 m de altura', 'de 5 a 8 kg', 'peixe, cobra e bicho de brejo', 'É a ave símbolo do Pantanal e faz um ninho de galhos no alto da árvore, reaproveitado por anos. O papo vermelho fica mais vivo na época de acasalar.'],
    coruja: ['Coruja-das-neves', 'tundra do Ártico, descendo no inverno', 'até 1,5 m de envergadura', 'de 1,5 a 3 kg, a fêmea maior', 'lemingue, sobretudo', 'Caça de dia, ao contrário da maioria das corujas, porque no verão ártico o sol não se põe. Em ano de poucos lemingues, ela simplesmente não bota ovo nenhum.']
})

T('Bicho e Planta', '🐧', 'pinguins', 'Os pinguins',
    'Nenhum pinguim selvagem vive no Ártico, e um deles mora na linha do equador: o que conta para eles é a corrente fria, não o gelo.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    imperador: ['Pinguim-imperador', 'gelo marinho da Antártida', 'de 1,1 a 1,3 m de altura', 'de 22 a 45 kg, conforme a estação', 'peixe, lula e krill', 'O macho choca o ovo em cima dos pés no pior inverno do planeta, sem comer por dois meses. Eles se amontoam aos milhares e vão trocando de lugar para ninguém congelar na borda.'],
    rei: ['Pinguim-rei', 'ilhas subantárticas', 'de 85 cm a 1 m de altura', 'de 9 a 17 kg', 'peixe lanterna e lula', 'O filhote é marrom e peludo e já foi descrito como espécie diferente por engano. O casal leva mais de um ano para criar uma cria, ritmo que nenhuma outra ave marinha tem.'],
    gentoo: ['Pinguim-gentoo', 'península Antártica e ilhas ao redor', 'de 70 a 90 cm de altura', 'de 5 a 8 kg', 'krill, peixe e lula', 'É o mais rápido do grupo debaixo da água. O macho oferece uma pedra lisa à fêmea para o ninho, e pedra boa é roubada do vizinho na maior cara de pau.'],
    adelia: ['Pinguim-de-adélia', 'costa de quase toda a Antártida', 'de 60 a 70 cm de altura', 'de 3 a 6 kg', 'krill, sobretudo', 'Anda dezenas de quilômetros sobre o gelo até a colônia e volta ao mesmo ninho todo ano. Ossos de colônias antigas contam o que o mar tinha de comida séculos atrás.'],
    galapagos: ['Pinguim-de-galápagos', 'ilhas Galápagos, na linha do equador', 'cerca de 50 cm de altura', 'de 2 a 2,5 kg', 'peixe miúdo de cardume', 'Vive no calor graças a uma corrente fria que sobe do sul. Quando a água esquenta demais num ano de El Niño, o peixe some e a colônia inteira deixa de botar ovo.'],
    azul: ['Pinguim-azul', 'sul da Austrália e Nova Zelândia', 'de 30 a 35 cm de altura', 'perto de 1 kg', 'peixe pequeno e lula', 'É o menor pinguim do mundo e sai do mar só depois de escurecer, em fila, para despistar predador. Faz toca em duna e às vezes embaixo de casa de praia.']
})

T('Bicho e Planta', '🐍', 'cobras', 'As serpentes, cobra por cobra',
    'Cobra não tem pálpebra nem ouvido de fora, e as que mais matam gente no mundo não são as maiores da lista.',
    ['Onde vive', 'Tamanho', 'Veneno', 'Do que come'], {
    sucuri: ['Sucuri-verde', 'Bacias do Amazonas e do Orinoco', 'de 4 a 6 m, com relatos maiores', 'Não tem; mata apertando', 'Capivara, jacaré, peixe grande', 'Passa quase a vida dentro da água, onde o peso não atrapalha, e a fêmea é bem maior que o macho. História de sucuri de trinta metros nunca sobreviveu a uma fita métrica.'],
    piton: ['Píton-reticulada', 'Sudeste da Ásia', 'de 4 a 7 m', 'Não tem; mata apertando', 'Mamíferos e aves', 'É a cobra mais comprida que se conhece, embora a sucuri leve no peso. Vive perto de gente, inclusive em cidade, caçando rato e cachorro no quintal.'],
    najareal: ['Naja-real', 'Florestas da Índia e do Sudeste Asiático', 'de 3 a 4 m', 'Neurotóxico, em dose grande', 'Quase só outras cobras', 'É a maior serpente peçonhenta do mundo e come até outras najas. É também a única que junta folhas num ninho e fica de guarda até os ovos chocarem.'],
    cascavel: ['Cascavel', 'Campos e cerrados das Américas', 'de 1 a 1,6 m', 'Neurotóxico', 'Roedores', 'O chocalho é feito de anéis de queratina que sobram a cada troca de pele. Não serve para contar idade: ela troca mais de uma vez por ano e os anéis vão quebrando.'],
    jararaca: ['Jararaca', 'Mata Atlântica e sul do Brasil', 'de 0,6 a 1,6 m', 'Hemotóxico', 'Roedores, sapos e lagartos', 'É a cobra que mais causa acidente no Brasil. Do veneno dela saiu a pesquisa do Butantan que levou ao captopril, primeiro remédio de pressão alta da sua classe.'],
    mamba: ['Mamba-negra', 'Savanas do leste e do sul da África', 'de 2 a 3 m', 'Neurotóxico de ação rápida', 'Aves e pequenos mamíferos', 'Não é preta: o nome vem do interior da boca, escuro, que ela abre quando se sente encurralada. É das mais velozes que existem e prefere fugir a brigar.']
}, 'faixas de tamanho usuais; adultos variam muito')

T('Bicho e Planta', '🐊', 'crocodilianos', 'Crocodilos, jacarés e gaviais',
    'São bichos de linhagem antiga, quase iguais aos do tempo dos dinossauros, e dá para separar crocodilo de jacaré só olhando o focinho.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    salgada: ['Crocodilo-de-água-salgada', 'Do norte da Austrália ao sudeste da Ásia', 'macho de 4 a 6 m', 'de 400 a 1.000 kg', 'Peixe, ave, búfalo', 'É o maior réptil vivo e atravessa braço de mar boiando na corrente, sem nadar, o que explica como foi parar em ilha distante. A mordida dele é a mais forte já medida em bicho vivo.'],
    nilo: ['Crocodilo-do-nilo', 'Rios e lagos da África', 'de 3,5 a 5 m', 'de 220 a 750 kg', 'Peixe, zebra, gnu', 'A mãe carrega os filhotes recém-saídos do ovo dentro da boca até a água, com um cuidado que ninguém espera. Na travessia do rio Mara, é ele que espera a manada do outro lado.'],
    jacareacu: ['Jacaré-açu', 'Bacia amazônica', 'de 4 a 5 m', 'de 200 a 400 kg', 'Peixe, capivara, tartaruga', 'É o maior predador da Amazônia e quase sumiu na época da caça pelo couro. Onde ele some de um trecho de rio, o peixe some junto: os nutrientes que ele devolve à água alimentam a cadeia inteira.'],
    pantanal: ['Jacaré-do-pantanal', 'Pantanal e bacia do Paraguai', 'de 2 a 3 m', 'de 50 a 90 kg', 'Peixe, piranha, caramujo', 'São milhões deles no Pantanal e quase não existe registro de ataque a gente. Passam a seca amontoados em poça rasa, de boca aberta, esperando o peixe que desce com a água.'],
    gavial: ['Gavial-do-ganges', 'Rios do norte da Índia e do Nepal', 'de 3,5 a 5 m', 'de 160 a 250 kg', 'Quase só peixe', 'O focinho fino feito pinça é ótimo para fisgar peixe e ruim para qualquer outra coisa. Restam poucas centenas de adultos livres, presos a alguns trechos de rio.'],
    aligator: ['Aligátor-americano', 'Sudeste dos Estados Unidos', 'de 3 a 4,5 m', 'de 200 a 450 kg', 'Peixe, tartaruga, ave', 'Cava poças que viram o único ponto de água do pântano na seca, e o brejo inteiro depende delas. Saiu da lista de ameaçados depois de décadas de proteção, um dos poucos casos assim.']
}, 'faixas usuais de adulto; há indivíduos fora delas')

T('Bicho e Planta', '🐸', 'anfibios', 'Sapos, rãs, pererecas e salamandras',
    'Anfíbio respira pela pele, e é justamente por isso que ele costuma ser o primeiro a sumir quando a água de um lugar piora.',
    ['Onde vive', 'Tamanho', 'Defesa', 'Do que come'], {
    cururu: ['Sapo-cururu', 'Quintais e beira de mata no Brasil', 'de 10 a 20 cm', 'Glândulas de veneno atrás dos olhos', 'Inseto, sobretudo cupim e formiga', 'Não dá verruga, não cospe veneno e não pula em ninguém: o veneno só age se o bicho for mordido ou lambido. Quem mais se dá mal é cachorro curioso.'],
    raflecha: ['Rã-flecha-dourada', 'Floresta do Pacífico colombiano', 'cerca de 5 cm', 'Uma das peles mais tóxicas conhecidas', 'Formiga e ácaro do chão da mata', 'A toxina vem da dieta: criada em cativeiro com grilo, a mesma rã cresce inofensiva. Caçadores Emberá passavam a ponta do dardo na pele do bicho vivo e o soltavam de volta.'],
    perereca: ['Perereca-de-banheiro', 'Casas e jardins do Brasil inteiro', 'de 3 a 5 cm', 'Discos de cola na ponta dos dedos', 'Mosquito e mariposa', 'Sobe azulejo liso porque os discos dos dedos grudam por tensão da água, e não por ventosa. Aparece no vaso porque a tubulação é úmida e cheia de inseto.'],
    salamandra: ['Salamandra-gigante-da-china', 'Rios frios de montanha na China', 'de 1 a 1,8 m', 'Pele escorregadia e mordida forte', 'Peixe, caranguejo, inseto', 'É o maior anfíbio vivo e respira pela pele enrugada, porque pulmão nenhum daria conta desse corpo. Virou prato caro e sumiu quase toda dos rios; o que restou é de criadouro.'],
    axolote: ['Axolote', 'Canais de Xochimilco, na Cidade do México', 'de 20 a 30 cm', 'Regenera pata, olho e parte do cérebro', 'Verme, larva, peixinho', 'Nunca vira adulto: fica a vida toda com as guelras de fora, no corpo de larva. Há milhares em laboratório e aquário pelo mundo, e quase nenhum sobrou no canal de onde veio.'],
    cecilia: ['Cecília', 'Solo úmido de floresta tropical', 'de 10 cm a 1,5 m', 'Vive enterrada, fora do alcance', 'Minhoca e larva', 'Não é cobra nem minhoca: é anfíbio sem perna, cego, que passa a vida cavando. Em algumas espécies o filhote come a camada de fora da pele da mãe, que ela produz de propósito.']
})

T('Bicho e Planta', '🐢', 'tartarugas', 'Tartarugas, jabutis e cágados',
    'Tartaruga é de mar, cágado é de água doce e jabuti é de terra, e o casco de todos eles é coluna e costela viradas para fora.',
    ['Onde vive', 'Tamanho', 'Vive até', 'Do que come'], {
    couro: ['Tartaruga-de-couro', 'Todos os oceanos, do trópico ao mar frio', 'casco de 1,5 a 2 m', 'estimado em perto de 50 anos', 'Quase só água-viva', 'É a maior de todas e a única sem casco duro: a carapaça é de couro com ossinhos por dentro. Mergulha a mais de mil metros e confunde saco plástico com água-viva, o que a mata.'],
    verde: ['Tartaruga-verde', 'Mares quentes do mundo todo', 'casco de 1 a 1,2 m', 'mais de 60 anos', 'Capim-marinho e alga, na fase adulta', 'Nasce comendo de tudo e vira vegetariana depois de crescida; o verde do nome é a cor da gordura, não do casco. Volta a desovar na praia onde nasceu, décadas mais tarde.'],
    jabuti: ['Jabuti-piranga', 'Matas e cerrados da América do Sul', 'de 40 a 50 cm', 'mais de 50 anos', 'Fruta caída, flor, carniça', 'É um dos poucos bichos que engole semente grande e a devolve inteira longe dali, plantando floresta sem querer. As patas da frente têm escamas vermelhas, e daí vem o nome.'],
    amazonia: ['Tartaruga-da-amazônia', 'Rios da bacia amazônica', 'casco de 60 a 90 cm', 'estimado em mais de 60 anos', 'Fruta, semente e planta de rio', 'Desova em praia de rio, aos milhares, na mesma semana. O filhote pia ainda dentro do ovo e a mãe responde: é esse chamado que mantém o bando junto na descida para a água.'],
    galapagos: ['Tartaruga-gigante-de-galápagos', 'Ilhas Galápagos', 'casco de 1,2 a 1,5 m', 'mais de 100 anos', 'Cacto, capim e fruta', 'Cada ilha tem o seu formato de casco, e foi essa diferença que ajudou Darwin a desconfiar de tudo. Aguenta meses sem comer nem beber, e foi isso que a condenou nos porões dos navios.'],
    pescoco: ['Cágado-de-pescoço-de-cobra', 'Rios e brejos do leste da Austrália', 'casco de 20 a 30 cm', 'mais de 30 anos', 'Peixe, girino, inseto', 'O pescoço é quase do tamanho do casco e não recolhe para dentro: dobra de lado, feito cobra. Quando leva susto, solta um cheiro forte que gruda na mão por horas.']
})

T('Bicho e Planta', '🦗', 'insetos', 'Os insetos em números',
    'Três em cada quatro espécies de bicho já descritas são inseto, e ninguém duvida que a maior parte deles ainda esteja sem nome.',
    ['Onde vive', 'Tamanho', 'Vive até', 'Do que come'], {
    golias: ['Besouro-golias', 'Florestas da África equatorial', 'de 6 a 11 cm', 'poucos meses como adulto', 'Seiva e fruta madura', 'Está entre os insetos mais pesados do mundo, e a vida dele é quase toda de larva: meses comendo madeira podre no chão para depois ganhar asa por poucas semanas.'],
    bichopau: ['Bicho-pau gigante', 'Florestas do Sudeste Asiático', 'passa de 50 cm com as pernas', 'cerca de 1 ano', 'Folha', 'É o inseto mais comprido conhecido e se disfarça de galho até no jeito de andar: balança devagar, como se fosse o vento. Em várias espécies a fêmea se reproduz sem macho nenhum.'],
    libelula: ['Libélula', 'Beira de lago, brejo e rio no mundo todo', 'de 5 a 12 cm de asa aberta', 'anos como ninfa, meses como adulta', 'Mosquito e mosca, caçados no ar', 'Acerta a caça em quase toda investida, marca que nenhum predador grande alcança. Passa anos embaixo da água na forma de ninfa e só poucas semanas voando.'],
    gafanhoto: ['Gafanhoto-do-deserto', 'Da África ao noroeste da Índia', 'de 6 a 8 cm', 'de 3 a 5 meses', 'Qualquer folha pela frente', 'Vive sozinho e discreto até a chuva juntar muitos num lugar só; aí ele muda de cor, de corpo e de comportamento, e a nuvem que se forma limpa uma lavoura num dia.'],
    cigarra: ['Cigarra periódica', 'Leste dos Estados Unidos', 'de 2,5 a 3 cm', '13 ou 17 anos, quase todos no subsolo', 'Seiva de raiz', 'Sai da terra tudo de uma vez, aos bilhões, canta algumas semanas e morre. O intervalo em número primo dificulta a vida de qualquer predador que tente casar o ciclo com o dela.'],
    monarca: ['Borboleta-monarca', 'Do Canadá ao centro do México', 'de 9 a 10 cm de asa aberta', 'semanas, menos a geração que migra', 'Néctar; a lagarta só come asclépia', 'Leva três ou quatro gerações para subir e uma só para descer os milhares de quilômetros de volta. A que faz a viagem inteira vive meses e nunca viu o lugar para onde vai.']
}, 'faixas usuais da literatura, arredondadas')

T('Bicho e Planta', '🐝', 'abelhas', 'As abelhas e a polinização',
    'Nem toda abelha faz mel nem vive em colmeia, e as sem ferrão daqui já polinizavam a mata muito antes de a europeia desembarcar.',
    ['Onde vive', 'Tamanho', 'Ferrão', 'O que faz'], {
    apis: ['Abelha-europeia', 'Criada no mundo inteiro; nativa da Europa e da África', 'de 1,2 a 1,5 cm', 'Sim, e ela morre depois de usar', 'Mel, cera e própolis', 'Avisa onde está a flor dançando em forma de oito: o ângulo diz a direção em relação ao sol e a duração diz a distância. Decifrar essa dança rendeu um Nobel a Karl von Frisch.'],
    jatai: ['Jataí', 'Do México ao sul do Brasil', 'cerca de 4 mm', 'Não tem ferrão', 'Mel raro, mais líquido e ácido', 'Guarda o mel em potinhos de cerume, não em favo, e defende a entrada do ninho fazendo parede com o próprio corpo. Cabe uma colônia inteira dentro de um tronco fino.'],
    mandacaia: ['Mandaçaia', 'Cerrado e Mata Atlântica', 'cerca de 1,2 cm', 'Não tem ferrão', 'Mel e polinização de mata nativa', 'A entrada do ninho é um funil de barro com desenho próprio de cada colônia, e por ele passa uma abelha de cada vez. Era esse o mel que o sertanejo conhecia antes da colmeia europeia.'],
    mamangava: ['Mamangava', 'Américas, em jardim e em roça', 'de 2 a 3 cm', 'Só a fêmea, e não morre ao usar', 'Poliniza maracujá', 'Ela abraça a flor e vibra até a sacudida soltar o pólen, coisa que a abelha de colmeia não sabe fazer. Sem mamangava, plantação de maracujá precisa de gente polinizando à mão.'],
    africanizada: ['Abelha-africanizada', 'Das Américas, do sul ao norte', 'parecida com a europeia, um pouco menor', 'Sim, e ataca em grupo', 'Mel, em quantidade maior', 'Saiu de um experimento em São Paulo nos anos 1950, quando alguns enxames escaparam. Tomou o continente em poucas décadas e hoje faz a maior parte do mel brasileiro.'],
    urucu: ['Uruçu-amarela', 'Nordeste do Brasil', 'cerca de 1,3 cm', 'Não tem ferrão', 'Mel valorizado e cera escura', 'A colônia nova não nasce sozinha: fica dependendo do ninho-mãe, que manda cera, barro e comida por semanas até a filha se firmar. Por isso quem cria uruçu divide a caixa à mão.']
})

T('Bicho e Planta', '🐜', 'formigas', 'Formigas e cupins',
    'Formiga é parente de vespa e cupim é parente de barata, mas os dois chegaram sozinhos à mesma invenção: a cidade.',
    ['Onde vive', 'Tamanho', 'Colônia', 'Do que come'], {
    sauva: ['Saúva', 'Do sul dos Estados Unidos à Argentina', 'de 2 mm a 2 cm, conforme a casta', 'milhões de indivíduos', 'Fungo que ela mesma cultiva', 'Não come a folha que carrega: usa como adubo de um fungo criado no subsolo, e come só o fungo. O ninho chega a ter milhares de câmaras e correntes de ar que renovam o fundo sozinhas.'],
    correicao: ['Formiga-de-correição', 'Florestas tropicais da América', 'de 3 mm a 1,2 cm', 'centenas de milhares', 'Qualquer bicho no caminho', 'Não tem formigueiro fixo: o ninho é feito dos próprios corpos entrelaçados e se desmancha quando a coluna marcha. Aves seguem a trilha só para comer o inseto que foge dela.'],
    lavapes: ['Formiga-lava-pés', 'Nativa do Brasil; hoje em vários continentes', 'de 2 a 6 mm', 'dezenas de milhares', 'Semente, inseto, açúcar', 'Quando a água sobe, a colônia se agarra e vira uma balsa viva que boia por dias sem afogar ninguém do meio. Foi assim, de carona em carga de navio, que ela atravessou o mundo.'],
    tocandira: ['Tocandira', 'Amazônia e Mata Atlântica', 'de 2 a 3 cm', 'algumas centenas', 'Néctar e inseto pequeno', 'A ferroada dela é tida como a mais dolorida entre os insetos e arde quase um dia inteiro. Alguns povos do Amazonas usam luva cheia delas em rito de passagem de menino para homem.'],
    catedral: ['Cupim-catedral', 'Norte da Austrália e savanas africanas', 'operário de poucos milímetros', 'mais de um milhão', 'Capim seco e madeira', 'O montículo passa de cinco metros e funciona como pulmão: corredores de ar seguram a temperatura lá dentro quase igual o dia todo. Um prédio em Harare foi ventilado copiando a ideia.'],
    montesba: ['Cupinzeiros da caatinga baiana', 'Norte da Bahia, na caatinga', 'operário de poucos milímetros', 'montes vizinhos por centenas de km²', 'Folha seca do chão', 'São cerca de duzentos milhões de montes de terra em campo aberto, feitos só do material cavado embaixo. Datações indicam que os mais antigos passam de três mil anos e seguem em uso.']
})

T('Bicho e Planta', '🕷️', 'aranhas', 'Aranhas e escorpiões',
    'Aranha e escorpião não são inseto: têm oito pernas, e entre as dezenas de milhares de espécies de aranha pouquíssimas fazem mal a gente.',
    ['Onde vive', 'Tamanho', 'Peçonha', 'Do que come'], {
    golias: ['Caranguejeira-golias', 'Norte da América do Sul', 'até 28 cm de pernas abertas', 'Fraca para gente', 'Inseto, sapo, roedor', 'É a maior aranha do mundo em peso, e a defesa principal dela não é a picada: ela esfrega o abdome e solta pelos finos que atacam o olho e o nariz de quem chega perto.'],
    armadeira: ['Armadeira', 'Mata Atlântica e quintais do Sudeste', 'corpo de 3 a 5 cm; pernas de 15 cm', 'Forte, com antídoto disponível', 'Inseto grande e lagartixa', 'Não faz teia para caçar: anda pelo chão à noite e se esconde de dia em pilha de lenha, sapato e cacho de banana. Quando se assusta, levanta as pernas da frente, e daí o nome.'],
    viuvanegra: ['Viúva-negra', 'Regiões quentes do mundo todo', 'fêmea com cerca de 1 cm de corpo', 'Neurotóxica, raramente fatal', 'Inseto preso na teia', 'O nome vem de a fêmea às vezes comer o macho, coisa quase nunca vista na natureza e comum só em pote de laboratório. A teia parece bagunça, mas é armadilha de fio esticado.'],
    teiaouro: ['Aranha-de-teia-dourada', 'Matas tropicais, inclusive no Brasil', 'fêmea de 4 a 5 cm; macho minúsculo', 'Fraca para gente', 'Inseto e, às vezes, passarinho', 'A seda dela é amarela, brilha ao sol e aguenta mais tração que fio de aço da mesma espessura. Já teceram um tecido inteiro com ela, e foi preciso mais de um milhão de aranhas.'],
    escamarelo: ['Escorpião-amarelo', 'Cidades do Brasil, em bueiro e entulho', 'de 6 a 7 cm', 'A mais perigosa do país', 'Barata', 'A fêmea se reproduz sozinha, sem macho, e cada uma gera dezenas de filhotes. É por isso que ele tomou a cidade tão rápido: basta um indivíduo chegar num terreno baldio.'],
    imperador: ['Escorpião-imperador', 'Florestas da África ocidental', 'de 15 a 20 cm', 'Fraca; ele prefere resolver na pinça', 'Inseto e outros aracnídeos', 'É um dos maiores do mundo e um dos mais mansos, e por isso virou bicho de terrário. Todo escorpião brilha de verde sob luz ultravioleta, e ninguém sabe direito para quê.']
})

T('Bicho e Planta', '🐟', 'peixes', 'Peixes de água doce e de mar',
    'Peixe é o grupo de vertebrado mais variado que existe, e os extremos dele não cabem na mesma imaginação.',
    ['Onde vive', 'Tamanho', 'Peso', 'Do que come'], {
    tubaraobaleia: ['Tubarão-baleia', 'Mares quentes do mundo todo', 'de 8 a 12 m', 'estimado em mais de 10 toneladas', 'Plâncton e peixinho, filtrados', 'É o maior peixe vivo e se alimenta das menores coisas do mar, coando água de boca aberta. Cada um tem um desenho de pintas diferente, e é por ele que se reconhece o mesmo bicho anos depois.'],
    pirarucu: ['Pirarucu', 'Rios e lagos da Amazônia', 'de 2 a 3 m', 'de 100 a 200 kg', 'Peixe menor', 'Respira ar e precisa subir à superfície de tempos em tempos, e era essa subida que o entregava ao arpão. Onde a pesca virou manejo com contagem feita pelo ribeirinho, ele voltou a encher o lago.'],
    celacanto: ['Celacanto', 'Encostas fundas perto de Comores e da Indonésia', 'de 1,5 a 2 m', 'cerca de 90 kg', 'Peixe e lula de fundo', 'Era dado como extinto havia milhões de anos até uma pescaria na África do Sul trazer um vivo em 1938. A nadadeira dele tem osso e articulação, parecida com um começo de perna.'],
    arqueiro: ['Peixe-arqueiro', 'Manguezais do Sudeste Asiático e da Oceania', 'de 15 a 25 cm', 'cerca de 100 g', 'Inseto derrubado da folha', 'Cospe um jato de água certeiro para derrubar inseto de folha acima da água, e corrige sozinho o desvio que a luz causa entre o ar e o líquido. Os filhotes aprendem olhando os mais velhos.'],
    abissal: ['Peixe-pescador abissal', 'Mar aberto, abaixo de mil metros', 'fêmea de 20 a 60 cm; macho de poucos cm', 'menos de 10 kg', 'O que passar na frente', 'A isca luminosa na testa não é dela: é bactéria que mora ali e acende. Em algumas espécies o macho minúsculo morde a fêmea e gruda de vez, a pele dos dois se funde e ele vira um apêndice.'],
    dourado: ['Dourado', 'Bacias do Prata, São Francisco e Araguaia', 'de 70 cm a 1 m', 'de 10 a 20 kg', 'Peixe de cardume', 'Sobe o rio na piracema para desovar e não desova em água parada. Barragem sem escada corta a viagem no meio, e onde o rio foi represado ele sumiu do trecho de cima.']
}, 'faixas usuais de adulto; pesos arredondados')

T('Bicho e Planta', '🪸', 'corais', 'Corais e recifes',
    'Coral é bicho, não pedra nem planta: os recifes ocupam uma fatia mínima do mar e abrigam perto de um quarto de toda a vida marinha.',
    ['Onde fica', 'Tamanho', 'Idade', 'Como vive'], {
    barreira: ['Grande Barreira de Coral', 'Costa nordeste da Austrália', 'perto de 2.300 km de extensão', 'formada ao longo de milhares de anos', 'Coral com alga dentro da própria célula', 'É a maior estrutura construída por bicho vivo no planeta e aparece nas imagens de satélite. Perdeu boa parte da cobertura de coral em poucas décadas, e cada onda de calor branqueia um trecho novo.'],
    abrolhos: ['Banco dos Abrolhos', 'Litoral sul da Bahia', 'cerca de 46 mil km² de banco raso', 'corais do grupo há milhões de anos', 'Espécies em boa parte só daqui', 'É o maior recife do Atlântico Sul e tem uma forma que não existe em outro canto: os chapeirões, pilares de coral que se abrem no topo feito cogumelo. Metade das espécies dali só vive no Brasil.'],
    atol: ['Atol', 'Pacífico e Índico, em mar aberto', 'anel de poucos km a mais de 70 km', 'cresce junto com a ilha que afunda', 'Coral vivo na borda de fora do anel', 'Darwin acertou a explicação antes de existir sonda: é um vulcão que afunda devagar enquanto o coral cresce para cima, e no fim sobra só o anel com a lagoa no meio.'],
    cerebro: ['Coral-cérebro', 'Recifes rasos do Atlântico e do Caribe', 'colônia de até 2 m', 'colônias que passam de um século', 'Captura plâncton de noite', 'Os sulcos que lembram um cérebro são fileiras de pólipos, cada um deles um bichinho separado. De dia parece pedra; de noite abre milhares de tentáculos e sai caçando.'],
    aguafria: ['Coral de água fria', 'Fundo do Atlântico Norte, no escuro', 'recifes de dezenas de quilômetros', 'algumas colônias com milhares de anos', 'Sem alga; vive só do que captura', 'Existe recife a mais de mil metros de profundidade, onde nunca bateu sol. Rede de arrasto derruba em minutos uma estrutura que levou séculos para crescer, e ela não se refaz.'],
    coralsol: ['Coral-sol', 'Invasor no litoral do Rio e do Espírito Santo', 'colônias de até 30 cm', 'chegou ao Brasil nos anos 1980', 'Sem alga; captura plâncton', 'Veio grudado em casco de plataforma de petróleo e hoje toma o costão das espécies nativas. Quebrar a colônia não adianta: cada pedaço que se solta vira uma colônia nova.']
})

T('Bicho e Planta', '🧳', 'migracoes', 'As grandes migrações animais',
    'Nenhum desses bichos tem mapa, e alguns fazem a viagem inteira uma vez só, sem nunca ter visto o caminho antes.',
    ['Rota', 'Distância', 'Quando', 'Como se orienta'], {
    gnu: ['Gnu-azul', 'Serengeti e Masai Mara, num círculo sem fim', 'perto de 1.000 km por ano', 'O ano inteiro, atrás da chuva', 'Cheiro de chuva e memória do bando', 'É mais de um milhão de gnus girando sem parar atrás de capim novo. A travessia do rio Mara mata milhares por afogamento e por crocodilo, e ainda assim o bando atravessa todo ano.'],
    andorinha: ['Andorinha-do-ártico', 'Do Ártico à Antártida e de volta', 'perto de 70 mil km por ano', 'Duas vezes por ano', 'Sol, estrelas e campo magnético', 'Faz a maior viagem anual conhecida e vive de verão em verão, vendo mais luz do dia que qualquer outro bicho. Ao longo da vida voa o equivalente a ir três vezes à Lua e voltar.'],
    jubarte: ['Baleia-jubarte', 'Da Antártida ao litoral da Bahia', 'de 8 a 10 mil km na ida', 'Chega ao Brasil entre julho e novembro', 'Canto, correntes e relevo do fundo', 'Come o verão inteiro no gelo e passa meses em jejum na água quente, onde pare o filhote. O canto dos machos muda de um ano para outro, e a versão nova se espalha pela população toda.'],
    salmao: ['Salmão-vermelho', 'Do Pacífico até o rio onde nasceu', 'de centenas a mais de 3 mil km', 'Uma vez só, no fim da vida', 'Cheiro da água do próprio rio', 'Sobe corredeira sem comer, muda de cor e de formato no caminho e morre depois de desovar. O corpo apodrecendo aduba a floresta: urso e ave levam o peixe mata adentro.'],
    caranguejo: ['Caranguejo-vermelho da Ilha Christmas', 'Da floresta ao mar, na mesma ilha', 'poucos quilômetros, mas em massa', 'No começo da estação de chuva', 'Maré e fase da lua', 'São dezenas de milhões de caranguejos atravessando estrada e quintal ao mesmo tempo. A ilha fecha ruas e construiu pontes de passagem só para eles não morrerem no asfalto.'],
    caribu: ['Caribu', 'Da tundra ártica à floresta boreal', 'mais de 1.500 km por ano', 'Duas vezes por ano', 'Memória da rota e cheiro do líquen', 'É a maior migração terrestre do mundo em distância percorrida. O filhote nasce no meio do caminho e anda no mesmo dia, porque o bando não espera por ninguém.']
}, 'distâncias aproximadas, variam por população')

T('Bicho e Planta', '🦥', 'bichosbrasil', 'Bichos que só existem no Brasil',
    'Endêmico quer dizer que o bicho não vive em nenhum outro lugar do planeta, e a lista brasileira dessas exclusividades é comprida.',
    ['Onde vive', 'Tamanho', 'Do que come', 'Situação'], {
    micoleao: ['Mico-leão-dourado', 'Mata Atlântica do Rio de Janeiro', 'de 20 a 33 cm sem a cauda', 'Fruta, inseto e bichinhos', 'Ameaçado, mas em recuperação', 'Chegou a menos de duzentos animais livres nos anos 1970. Zoológicos do mundo devolveram filhotes nascidos em cativeiro, e hoje são milhares, ligados por pontes de mata sobre a rodovia.'],
    preguica: ['Preguiça-de-coleira', 'Trechos de Mata Atlântica do Nordeste ao Rio', 'de 45 a 75 cm', 'Folha de umas poucas árvores', 'Ameaçada', 'Desce ao chão mais ou menos uma vez por semana só para defecar sempre no mesmo pé, e é aí que ela mais morre. No pelo dela cresce alga, e na alga mora uma mariposa que só vive ali.'],
    ararinha: ['Ararinha-azul', 'Caatinga da Bahia, no rio São Francisco', 'cerca de 55 cm', 'Semente de faveleira e pinhão-bravo', 'Extinta na natureza; reintroduzida', 'Sumiu do mato no fim dos anos 1990 e só existia em gaiola de colecionador. Aves criadas na Alemanha voltaram à caatinga em 2022, e o primeiro filhote solto em décadas nasceu por lá.'],
    muriqui: ['Muriqui-do-norte', 'Restos de mata em Minas e no Espírito Santo', 'de 55 a 70 cm sem a cauda', 'Folha e fruta', 'Criticamente ameaçado', 'É o maior macaco das Américas e um dos mais pacíficos que se conhece: não briga por fêmea nem por comida, e os machos se abraçam quando a tensão sobe no grupo.'],
    soldadinho: ['Soldadinho-do-araripe', 'Mata úmida da Chapada do Araripe, no Ceará', 'cerca de 14 cm', 'Fruta pequena e inseto', 'Criticamente ameaçado', 'Vive num punhado de nascentes numa faixa de mata de poucos quilômetros e não existe em outro canto do planeta. Só foi descrito pela ciência em 1996, tarde demais para ser comum.'],
    botoaraguaia: ['Boto-do-araguaia', 'Bacia do Araguaia e do Tocantins', 'de 2 a 2,5 m', 'Peixe de fundo', 'Ameaçado; espécie ainda discutida', 'Pesquisadores o separaram do boto amazônico em 2014, e nem todo especialista aceita a divisão. Ele ficou isolado quando as corredeiras cortaram a ligação entre as bacias e desde então segue por conta própria.']
})

T('Bicho e Planta', '🌳', 'arvores', 'As árvores mais notáveis do mundo',
    'Cada uma destas guarda um recorde diferente, e a que parece um bosque inteiro talvez seja, sozinha, o ser vivo mais antigo da lista.',
    ['De onde vem', 'Onde cresce', 'Porte', 'O recorde'], {
    sequoia: ['Sequoia-vermelha', 'Costa da Califórnia e sul do Oregon', 'Faixa estreita de neblina perto do mar', 'passa de 100 m de altura', 'A árvore mais alta já medida', 'A maior delas tem a localização guardada em segredo, para não virar ponto turístico. Ela bebe pela folha: a neblina que entra do mar responde por boa parte da água que chega ao topo.'],
    bristlecone: ['Pinheiro-bristlecone', 'Montanhas secas do leste da Califórnia', 'Acima de três mil metros, na rocha', 'de 5 a 15 m, torto e retorcido', 'Passa dos 4.800 anos', 'Cresce pouquíssimo por ano, e é por isso mesmo que dura: a madeira fica tão densa que fungo e inseto não entram. Os anéis dela viraram calendário para datar o clima do passado.'],
    pando: ['Pando', 'Montanhas de Utah, nos Estados Unidos', 'Encosta alta de clima seco', 'dezenas de milhares de troncos', 'Um dos seres vivos mais pesados', 'Parece floresta de árvores separadas, mas é um clone só: todos os troncos brotam da mesma raiz e são o mesmo indivíduo. Cervo e gado comem os brotos novos, e ele vem encolhendo.'],
    baoba: ['Baobá', 'Savanas da África; há primos em Madagascar', 'Terreno seco e quente', 'tronco que passa de 10 m de largura', 'Guarda água no próprio tronco', 'O tronco esponjoso segura milhares de litros e murcha visivelmente na seca. Vários dos exemplares mais velhos da África caíram de uma vez nos últimos anos, e o calor é o suspeito principal.'],
    dragoeiro: ['Dragoeiro', 'Ilha de Socotra, no Iêmen', 'Encosta de calcário batida por neblina', 'copa em guarda-chuva, de 8 a 10 m', 'A resina escorre vermelha', 'A copa funciona como funil e joga a neblina direto na raiz, que é como ela bebe numa ilha quase sem chuva. A resina virou verniz de violino e remédio, vendida como sangue de dragão.'],
    figueira: ['Figueira-de-bengala', 'Índia e Paquistão', 'Clima quente e úmido', 'copa que passa de um hectare', 'Uma árvore que vira um bosque', 'Solta raízes do galho que descem, criam tronco e viram pilar, e a copa segue avançando sem limite claro. Debaixo de uma só cabe feira inteira, e é o que muita aldeia faz por lá.']
}, 'medidas aproximadas; recordes mudam a cada nova medição')

T('Bicho e Planta', '🌴', 'arvoresbr', 'Árvores brasileiras e suas histórias',
    'Uma delas deu nome ao país, outra é a mais alta da Amazônia, e a castanheira só dá fruto se a floresta em volta estiver de pé.',
    ['De onde vem', 'Onde cresce', 'Porte', 'Época'], {
    paubrasil: ['Pau-brasil', 'Mata Atlântica, do Rio Grande do Norte ao Rio', 'Mata de tabuleiro e restinga', 'de 10 a 15 m', 'Floresce em amarelo entre setembro e outubro', 'Deu nome ao país por causa do corante vermelho do cerne, que encheu navio durante três séculos. Hoje é espécie ameaçada, e a madeira dela virou matéria-prima de arco de violino.'],
    ipeamarelo: ['Ipê-amarelo', 'Cerrado e Mata Atlântica', 'Solo bem drenado; aguenta cidade', 'de 8 a 20 m', 'Floresce de julho a setembro', 'Larga toda a folha antes de abrir a flor, e é por isso que a copa fica só de amarelo. É a árvore símbolo do Brasil, e no interior muita gente lê nela quando a seca vai virar chuva.'],
    castanheira: ['Castanheira-do-brasil', 'Amazônia, do Brasil à Bolívia e ao Peru', 'Só vinga em floresta em pé', 'de 30 a 50 m', 'Ouriço cai entre janeiro e março', 'Não vira plantação: sem a abelha grande que força a flor e sem a cotia que abre o ouriço e esquece semente enterrada, muda nenhuma nasce. Derrubar a mata em volta mata a árvore aos poucos.'],
    seringueira: ['Seringueira', 'Amazônia', 'Terra firme de floresta tropical', 'de 20 a 30 m', 'Corte do látex na estação seca', 'O látex dela bancou a ópera de Manaus e depois arruinou a cidade: sementes levadas para a Ásia em 1876 viraram plantações mais baratas, e o preço do produto desabou.'],
    sumauma: ['Sumaúma', 'Amazônia e América tropical', 'Beira de rio e várzea', 'passa de 50 m; a maior da floresta', 'Solta paina na seca', 'A copa fica acima de todas as outras e vira poleiro de gavião-real. As raízes em forma de tabuleiro, altas feito parede, seguram o tronco em terreno que alaga metade do ano.'],
    araucaria: ['Araucária', 'Sul do Brasil e serras de São Paulo e Minas', 'Planalto frio e úmido', 'de 25 a 40 m, copa em taça', 'Pinhão cai de abril a julho', 'Restou uma fração pequena do pinheiral que cobria o Sul, derrubado para serraria no século passado. Leva mais de dez anos para dar o primeiro pinhão, e quem planta a semente esquecida é a gralha-azul.']
})

T('Bicho e Planta', '🍎', 'frutas', 'Frutas e de onde elas vieram',
    'Quase nenhuma fruta da feira nasceu no lugar onde ficou famosa, e várias só existem porque alguém cruzou duas plantas diferentes.',
    ['De onde vem', 'Onde cresce', 'Porte', 'Época'], {
    banana: ['Banana', 'Sudeste Asiático e Nova Guiné', 'Trópico quente e úmido', 'Erva gigante, não é árvore', 'Colhe o ano inteiro', 'A bananeira é uma erva e o tronco é folha enrolada. A banana de mercado quase não tem semente porque é clone: cada pé é pedaço do anterior, e por isso uma praga só ameaça a lavoura toda.'],
    maca: ['Maçã', 'Montanhas do Cazaquistão', 'Clima frio, com inverno de verdade', 'Árvore de 3 a 10 m', 'Colhe no outono', 'Toda maçã de mercado é enxerto, porque semente de maçã não dá a mesma fruta da mãe. Cada variedade veio de uma única árvore que alguém achou boa e copiou galho por galho.'],
    laranja: ['Laranja', 'Cruzamento nascido na Ásia', 'Clima quente, sem geada', 'Árvore de 5 a 8 m', 'Safra de maio a dezembro', 'Não é fruta de origem: é o cruzamento antigo entre pomelo e tangerina, feito pela natureza e refeito pela mão do homem. Boa parte do suco que o mundo bebe sai de pomar paulista.'],
    tomate: ['Tomate', 'Andes, entre o Peru e o Equador', 'Clima ameno; gosta de sol', 'Planta rasteira ou amarrada em vara', 'Colhe quase o ano inteiro', 'Chegou à Europa como planta de enfeite e passou dois séculos com fama de venenoso, por ser parente da beladona. Só virou molho na Itália bem depois de o continente inteiro já conhecê-lo.'],
    melancia: ['Melancia', 'África, provavelmente no nordeste do continente', 'Solo arenoso e calor', 'Rasteira, de ramo comprido', 'Verão', 'A ancestral era amarga e servia de cantil no deserto, pela água guardada dentro. Pintura egípcia de milhares de anos atrás já mostra a fruta oval sendo servida em mesa de festa.'],
    abacaxi: ['Abacaxi', 'Entre o sul do Brasil e o Paraguai', 'Solo arenoso e clima quente', 'Roseta rente ao chão', 'Leva de 15 a 20 meses por fruto', 'Não é uma fruta só: é um punhado de frutinhas grudadas, cada uma de uma flor. Virou símbolo de hospitalidade na Europa porque um exemplar custava o preço de uma carruagem.']
})

T('Bicho e Planta', '🥭', 'frutasbr', 'As frutas nativas do Brasil',
    'São frutas que quase não viajam: várias fermentam em dois dias depois de colhidas, e é por isso que o resto do mundo mal as conhece.',
    ['De onde vem', 'Onde cresce', 'Porte', 'Época'], {
    acai: ['Açaí', 'Estuário do Amazonas, no Pará', 'Várzea que alaga com a maré', 'Palmeira de 15 a 25 m', 'Safra forte de agosto a dezembro', 'No Pará se come salgado, com peixe e farinha; a tigela doce com granola é invenção carioca dos anos 1980. O caroço ocupa quase a fruta inteira, e a polpa é uma casquinha fina em volta.'],
    cupuacu: ['Cupuaçu', 'Sul e leste da Amazônia', 'Sombra de mata, em terra firme', 'Árvore de 6 a 15 m', 'Frutifica de janeiro a abril', 'É parente do cacau, e da semente sai um chocolate branco chamado cupulate. O fruto não se colhe no pé: espera-se cair, porque antes disso ele ainda não está no ponto.'],
    jabuticaba: ['Jabuticaba', 'Mata Atlântica do Sudeste e do Sul', 'Quintal e mata; pede solo fundo', 'Árvore de 6 a 9 m', 'Safra curta na primavera', 'Nasce grudada no tronco, não no galho, e a árvore fica parecendo coberta de bolinhas pretas. Dura dois ou três dias depois de colhida, e é por isso que quase não se acha longe do pé.'],
    pitanga: ['Pitanga', 'Mata Atlântica, do Nordeste ao Sul', 'Quintal, restinga e beira de estrada', 'Arbusto ou arvoreta de 2 a 6 m', 'Amadurece de setembro a novembro', 'A fruta tem gomos marcados e vai do verde ao vermelho quase preto em poucos dias. Foi levada para Israel e para a Flórida, onde virou cerca viva e quase ninguém pensa em comer.'],
    caju: ['Caju', 'Litoral do Nordeste brasileiro', 'Areia de praia e tabuleiro', 'Árvore de 5 a 12 m', 'Safra de setembro a janeiro', 'O que a gente come não é a fruta: é o cabo inchado do galho. A fruta de verdade é a castanha pendurada na ponta, e a casca dela guarda um óleo que queima a pele de quem abre sem jeito.'],
    bacuri: ['Bacuri', 'Amazônia oriental e cerrado do Maranhão', 'Terra firme e capoeira', 'Árvore de 15 a 30 m', 'Safra de dezembro a maio', 'A casca é grossa feito couro e só abre na faca; a polpa branca é pouca e perfumada, e por isso o doce sai caro. A árvore rebrota da raiz, e um bacurizal inteiro pode ser um pé só.']
})

T('Bicho e Planta', '🌶️', 'temperos', 'Temperos e especiarias',
    'Boa parte das grandes navegações foi atrás de tempero, e o mais caro do mundo ainda hoje é colhido flor por flor, na mão.',
    ['De onde vem', 'Onde cresce', 'Que parte se usa', 'Época'], {
    pimentareino: ['Pimenta-do-reino', 'Costa do Malabar, na Índia', 'Trepadeira de clima quente e úmido', 'O fruto seco', 'Colhe de dezembro a março', 'Já foi moeda e resgate de guerra: Roma pagou tributo aos visigodos parte em pimenta. Hoje o Brasil está entre os grandes produtores, com quase toda a lavoura concentrada no Pará.'],
    canela: ['Canela', 'Sri Lanka', 'Arbusto de trópico úmido', 'A casca de dentro do galho', 'Colhe na estação chuvosa', 'O pau que se põe no doce é a casca interna, raspada do galho e secada ao sol, que encolhe e enrola sozinha. Mercador árabe inventava história de ave gigante para esconder de onde ela vinha.'],
    acafrao: ['Açafrão-verdadeiro', 'Oriente Médio e Ásia Central', 'Campo frio e seco, de bulbo plantado', 'Três fios do miolo da flor', 'Colhe no outono, de madrugada', 'É o tempero mais caro do mundo porque cada flor dá três fios e a colheita é toda à mão: um quilo pede mais de cem mil flores. O que se vende barato como açafrão quase sempre é cúrcuma.'],
    baunilha: ['Baunilha', 'México', 'Orquídea trepadeira de mata quente', 'A vagem curada', 'A flor abre por um dia só', 'A flor só é polinizada por uma abelha mexicana; fora de lá é preciso fazer à mão, flor por flor, na manhã em que ela abre. Quem descobriu o truque foi um menino escravizado na Ilha Reunião.'],
    cravo: ['Cravo-da-índia', 'Ilhas Molucas, na Indonésia', 'Árvore de ilha vulcânica úmida', 'O botão da flor, seco', 'Colhe antes de a flor abrir', 'Os holandeses arrancaram os cravos de todas as ilhas menos uma, para segurar o preço no alto. Um francês contrabandeou mudas para fora e derrubou o monopólio em poucas décadas.'],
    malagueta: ['Pimenta-malagueta', 'Américas; o grupo surgiu na Bolívia', 'Arbusto de quintal, de clima quente', 'O fruto, fresco ou em conserva', 'Dá quase o ano todo', 'A ardência é defesa contra mamífero: ave não sente nada e sai espalhando a semente. E ela não queima de verdade, só engana o nervo que avisa calor, e por isso beber água não resolve.']
})

T('Bicho e Planta', '🍄', 'cogumelos', 'Fungos e cogumelos',
    'Fungo não é planta nem bicho: é um reino à parte, e a diferença entre o cogumelo do prato e o que mata está em detalhe que só especialista enxerga.',
    ['De onde vem', 'Onde cresce', 'Porte', 'Cuidado'], {
    falohide: ['Amanita-faloide', 'Europa; espalhada junto com mudas de árvore', 'Debaixo de carvalho e de pinheiro', 'chapéu de 5 a 15 cm, esverdeado', 'Mortal; responde pela maioria das mortes por cogumelo', 'Um exemplar já basta para destruir o fígado de um adulto, e cozinhar não desmancha o veneno. Pior: os sintomas somem por quase um dia antes de o estrago aparecer, e a pessoa acha que passou.'],
    champignon: ['Champignon', 'Campo europeu; hoje cultivado no mundo todo', 'Cultivo em composto, dentro de galpão', 'chapéu de 3 a 10 cm', 'Cultivado; é o mais consumido do planeta', 'Champignon, paris e portobelo são o mesmo fungo em idades e linhagens diferentes. O cultivo dele começou em pedreira abandonada perto de Paris, aproveitando o escuro e o fresco.'],
    shiitake: ['Shiitake', 'Leste da Ásia', 'Tora de madeira dura, na sombra', 'chapéu de 5 a 12 cm', 'Cultivado há séculos', 'Cresce em tora preparada pelo produtor, que bate na madeira ou a mergulha em água gelada para enganar o fungo: ele entende aquilo como chuva de outono e frutifica tudo de uma vez.'],
    armilaria: ['Armilária gigante', 'Montanhas do Oregon, nos Estados Unidos', 'Debaixo de floresta de coníferas', 'ocupa cerca de 9 km² de subsolo', 'Praga que mata a árvore hospedeira', 'É apontado como um dos maiores seres vivos do planeta: um indivíduo só, espalhado por quilômetros de solo, com idade estimada em milhares de anos. O cogumelo é apenas a pontinha que aparece.'],
    penicilio: ['Bolor do penicílio', 'Solo e comida estragada, no mundo todo', 'Pão, fruta e queijo esquecidos', 'colônia azulada de poucos centímetros', 'Nem todo bolor é este; não se prova bolor de casa', 'Uma placa contaminada por engano no laboratório de Alexander Fleming, em 1928, virou o primeiro antibiótico. O mesmo grupo dá a veia azul do gorgonzola e a casca branca do brie.'],
    trufa: ['Trufa-negra', 'Sul da Europa, em bosque de carvalho', 'Enterrada, presa à raiz da árvore', 'do tamanho de uma noz a uma laranja', 'Cultivo difícil; preço alto', 'Cresce no subsolo e não aparece: é preciso cão treinado para farejar. A árvore alimenta o fungo e o fungo devolve água e sal mineral, num acordo que leva anos até render a primeira trufa.']
})

/* ───────────────────────────── CULTURA ───────────────────────────── */

T('Cultura', '🎬', 'cinemaclassicos', 'Filmes que mudaram o cinema',
    'Alguns filmes não fizeram só sucesso: depois deles, ninguém mais filmou do mesmo jeito.',
    ['Ano', 'Quem fez', 'De onde vem'], {
    viagemlua: ['A Viagem à Lua', '1902', 'Georges Méliès', 'França', 'Méliès era mágico de teatro e tratou a câmera como truque de palco. A nave acertando o olho da Lua virou a primeira imagem que o cinema inteiro reconhece de cara.'],
    potemkin: ['O Encouraçado Potemkin', '1925', 'Sergei Eisenstein', 'União Soviética', 'A cena da escadaria é montagem pura: cortes curtos, um carrinho de bebê descendo, e a plateia sente o pânico sem que ninguém explique nada. Vira aula de montagem até hoje.'],
    cidadaokane: ['Cidadão Kane', '1941', 'Orson Welles', 'Estados Unidos', 'Welles tinha 25 anos e nunca havia dirigido um longa. Mandou cavar buracos no chão do estúdio para filmar de baixo, e contar a história por depoimentos que se contradizem virou receita de roteiro.'],
    ladroes: ['Ladrões de Bicicleta', '1948', 'Vittorio De Sica', 'Itália', 'De Sica filmou na rua, com gente que nunca tinha atuado: o pai da história era operário de fábrica. O neorrealismo provou que dava para fazer cinema grande sem estúdio e sem estrela.'],
    setesamurais: ['Os Sete Samurais', '1954', 'Akira Kurosawa', 'Japão', 'A ideia de juntar um grupo de especialistas para uma missão quase perdida saiu daqui e foi copiada em faroeste, ficção científica e filme de assalto pelo mundo todo.'],
    odisseia: ['2001: Uma Odisseia no Espaço', '1968', 'Stanley Kubrick', 'Reino Unido', 'Kubrick chamou cientistas para desenhar as naves e quase não usou diálogo. O silêncio do espaço, sem barulho de explosão, incomodou o público e virou marca de rigor.']
})

T('Cultura', '🏆', 'oscar', 'O Oscar e seus recordes',
    'A estatueta careca já premiou por engano, já mudou de regra no meio do caminho e guarda recordes que quase ninguém alcança.',
    ['Ano', 'Quem', 'O recorde'], {
    primeira: ['A primeira cerimônia', '1929', 'Academia de Hollywood', 'Jantar curto para poucos convidados', 'Durou cerca de quinze minutos e os ganhadores já tinham sido anunciados meses antes. Ninguém abriu envelope nenhum: era entrega de troféu em jantar, não noite de suspense.'],
    onze: ['O empate em onze', '1959, 1997 e 2003', 'Ben-Hur, Titanic e O Retorno do Rei', 'Onze estatuetas cada, até a contagem mais recente', 'O Retorno do Rei levou as onze de que foi indicado, sem perder nenhuma. Os outros dois perderam categorias no caminho e chegaram ao mesmo número por vias diferentes.'],
    hepburn: ['Katharine Hepburn', 'De 1934 a 1982', 'Atriz', 'Quatro prêmios de atuação, o maior de todos', 'Ela nunca apareceu para receber. Dizia que prêmio de arte era bobagem e que competir com outra atriz não fazia sentido, mas o quarto veio quase cinquenta anos depois do primeiro.'],
    disney: ['Walt Disney', 'Dos anos 1930 aos 1960', 'Produtor e estúdio', 'Mais estatuetas para uma pessoa, até a contagem mais recente', 'Boa parte veio de curtas de animação, categoria que ele dominou por décadas. Numa noite recebeu um troféu de tamanho normal acompanhado de sete pequenininhos, pela Branca de Neve.'],
    parasita: ['Parasita', '2020', 'Bong Joon-ho', 'Melhor filme para um falado em outra língua', 'A Academia tinha mais de oitenta anos de história e nunca havia dado o prêmio principal a um filme sem inglês. O sul-coreano ainda levou direção e roteiro na mesma noite.'],
    envelope: ['O envelope trocado', '2017', 'La La Land e Moonlight', 'O maior erro em cerimônia ao vivo', 'Anunciaram o filme errado e a equipe já estava no palco agradecendo quando a correção chegou. A culpa foi de um envelope reserva entregue por engano a quem ia abrir.']
}, 'contagens de estatuetas conferidas até a edição mais recente')

T('Cultura', '🎥', 'diretores', 'Diretores que criaram uma linguagem',
    'Dá para reconhecer o dono da câmera antes de o nome aparecer nos créditos, e cada um destes inventou um jeito de olhar.',
    ['De onde vem', 'Auge', 'Marca registrada'], {
    hitchcock: ['Alfred Hitchcock', 'Reino Unido', 'Anos 1940 a 1960', 'Suspense feito com o que a plateia já sabe', 'Ele dizia que bomba embaixo da mesa explodindo é susto de dois segundos; mostrar a bomba antes e deixar os personagens conversando é meia hora de aflição. Nunca ganhou o prêmio de direção.'],
    kurosawa: ['Akira Kurosawa', 'Japão', 'Anos 1950 a 1980', 'Clima virando personagem da cena', 'Filmava chuva com tinta preta na água, para ela aparecer na tela, e usava três câmeras ao mesmo tempo para os atores não saberem qual delas estava ligada.'],
    fellini: ['Federico Fellini', 'Itália', 'Anos 1950 a 1970', 'Memória e sonho misturados ao real', 'O apelido felliniano virou palavra de dicionário para desfile de gente estranha e circo triste. Ele desenhava os rostos que queria antes mesmo de escolher os atores.'],
    godard: ['Jean-Luc Godard', 'França', 'Anos 1960', 'Corte seco no meio da cena', 'O corte que pula um pedaço da ação parecia erro de montagem e virou estilo. Ele cortou assim porque o filme estava longo demais, e a solução preguiçosa virou marco da nova onda francesa.'],
    spielberg: ['Steven Spielberg', 'Estados Unidos', 'Anos 1970 a 2000', 'Emoção grande sem largar o rosto', 'O tubarão mecânico vivia quebrando, então ele filmou quase tudo sem mostrar o bicho. O defeito criou o medo e ensinou uma geração a esconder o monstro.'],
    scorsese: ['Martin Scorsese', 'Estados Unidos', 'Anos 1970 até hoje', 'Câmera solta, narração e trilha de rádio', 'Cresceu numa Nova York de rua fechada e quase virou padre. Filmou o crime como rotina de trabalho, com gente reclamando de conta e de chefe entre uma violência e outra.']
})

T('Cultura', '🎞️', 'animacao', 'A história da animação',
    'Antes do computador, desenhar movimento era trabalho de formiga: milhares de folhas para render poucos minutos de tela.',
    ['Ano', 'De onde vem', 'Quem fez'], {
    gertie: ['Gertie, o Dinossauro', '1914', 'Estados Unidos', 'Winsor McCay', 'McCay levava o filme para o palco e conversava com a dinossaura projetada, fingindo dar comida a ela. Foi o primeiro personagem de desenho com jeito de ter personalidade própria.'],
    achmed: ['As Aventuras do Príncipe Achmed', '1926', 'Alemanha', 'Lotte Reiniger', 'Ela recortava silhuetas de papel e chumbo e movia cada articulação entre uma foto e outra. É o longa de animação mais antigo que sobreviveu inteiro, e quase ninguém sabe o nome dela.'],
    brancadeneve: ['Branca de Neve e os Sete Anões', '1937', 'Estados Unidos', 'Estúdio de Walt Disney', 'A imprensa chamou o projeto de loucura, porque ninguém acreditava que alguém aguentaria mais de uma hora de desenho. O estúdio hipotecou a casa do dono para conseguir terminar.'],
    toystory: ['Toy Story', '1995', 'Estados Unidos', 'Pixar', 'Primeiro longa feito inteiro no computador. Escolheram brinquedos de plástico de propósito, porque pele, cabelo e pano ainda ficavam falsos demais na máquina daquela época.'],
    wallace: ['Wallace e Gromit', '1989', 'Reino Unido', 'Nick Park e o estúdio Aardman', 'Massinha quadro a quadro: o animador encosta o dedo, tira foto, encosta de novo. Um dia inteiro de trabalho costuma render poucos segundos, e o cachorro não fala uma palavra.']
})

T('Cultura', '🪄', 'efeitosespeciais', 'Os efeitos especiais no cinema',
    'Quase todo truque famoso do cinema nasceu de um problema chato de produção, resolvido com teimosia e gambiarra.',
    ['Ano', 'Truque', 'Quem fez'], {
    paradadecamera: ['A parada de câmera', '1896', 'Trocar o que está em cena com a câmera parada', 'Georges Méliès', 'A lenda conta que a câmera dele travou na rua e, ao rodar o filme, um ônibus virou carro fúnebre. Ele passou o resto da vida explorando o acidente.'],
    kingkong: ['King Kong', '1933', 'Boneco animado quadro a quadro', 'Willis O\'Brien', 'O gorila tinha menos de meio metro, feito de borracha e pelo de coelho sobre esqueleto de metal. O pelo se mexia sozinho entre as fotos e deu ao bicho um tremor que parecia respiração.'],
    starwars: ['Guerra nas Estrelas', '1977', 'Câmera comandada por computador', 'Industrial Light and Magic', 'Para as naves parecerem rápidas, a nave ficava parada e a câmera é que se movia, repetindo o mesmo caminho várias vezes. A oficina montada para isso virou a maior casa de efeitos do mundo.'],
    jurassico: ['Jurassic Park', '1993', 'Bicho de computador misturado com boneco', 'Stan Winston e a ILM', 'O plano era usar só bonecos. O teste no computador ficou tão bom que mudaram o filme no meio, e o animador de massa e metal foi aproveitado para ensinar os dinossauros digitais a andar.'],
    matrix: ['Matrix', '1999', 'Tempo parado com a câmera girando', 'John Gaeta e equipe', 'Dezenas de máquinas fotográficas em volta do ator disparam quase juntas; depois as fotos viram um movimento só. O efeito foi copiado à exaustão em propaganda nos anos seguintes.'],
    gollum: ['Gollum', '2002', 'Movimento capturado de um ator real', 'Andy Serkis e a Weta', 'Serkis fez o personagem no set, junto com os outros atores, e depois repetiu tudo num estúdio cheio de sensores. Foi aí que começou a briga: aquilo é atuação ou é desenho?']
})

T('Cultura', '🍿', 'cinemabrasileiro', 'O cinema brasileiro',
    'Quase sempre com pouco dinheiro e nenhuma garantia, o cinema daqui inventou soluções que os grandes estúdios nunca precisaram inventar.',
    ['Ano', 'Quem fez', 'Por que ficou'], {
    limite: ['Limite', '1931', 'Mário Peixoto', 'Experimento mudo que virou lenda', 'Peixoto tinha 22 anos e nunca fez outro filme parecido. A cópia se deteriorou e a obra sumiu de circulação por décadas, criando fama de obra-prima que quase ninguém tinha visto.'],
    deusediabo: ['Deus e o Diabo na Terra do Sol', '1964', 'Glauber Rocha', 'Marco do Cinema Novo', 'O lema era uma ideia na cabeça e uma câmera na mão. Sertão, cangaço e beato filmados com luz dura de sol, sem maquiagem de estúdio, para o país se ver do jeito que era.'],
    donaflor: ['Dona Flor e Seus Dois Maridos', '1976', 'Bruno Barreto', 'Encheu cinema no país inteiro', 'Foi o filme brasileiro mais visto por uma geração, com fila na porta até em cidade pequena. As contagens de público daquela época são discutidas, mas o tamanho do fenômeno ninguém discute.'],
    centraldobrasil: ['Central do Brasil', '1998', 'Walter Salles', 'Levou o cinema daqui de volta ao mundo', 'Fernanda Montenegro virou a primeira brasileira indicada ao prêmio de atriz em Hollywood. O menino do filme foi achado no aeroporto, engraxando sapato, e nunca tinha atuado.'],
    cidadededeus: ['Cidade de Deus', '2002', 'Fernando Meirelles e Kátia Lund', 'Montagem rápida e elenco da comunidade', 'Quase todo o elenco saiu de oficinas feitas na própria comunidade, com gente que nunca tinha pisado num set. O filme rendeu quatro indicações ao Oscar, inclusive a de direção.'],
    aindaestouaqui: ['Ainda Estou Aqui', '2024', 'Walter Salles', 'Primeiro Oscar do Brasil', 'A história de Eunice Paiva, que passou a vida cobrando do Estado o corpo do marido levado pela ditadura. O prêmio de filme internacional veio em 2025, depois de décadas de indicação sem vitória.']
})

T('Cultura', '🎭', 'generoscinema', 'Os gêneros do cinema e de onde saíram',
    'Gênero não é gaveta inventada por crítico: cada um nasceu de uma necessidade de produção, de um susto histórico ou de pura falta de dinheiro.',
    ['Quando nasceu', 'De onde vem', 'Marca da casa'], {
    faroeste: ['Faroeste', 'Começo dos anos 1900', 'Estados Unidos', 'Deserto, cavalo e a lei chegando atrasada', 'O oeste de verdade tinha acabado havia pouco quando o cinema começou a contá-lo. Muito ex-pistoleiro e ex-xerife foi trabalhar como consultor de filme sobre a própria juventude.'],
    noir: ['Noir', 'Anos 1940', 'Estados Unidos, com diretores europeus', 'Sombra dura, chuva e ninguém limpo', 'O nome foi dado por críticos franceses só depois, ao ver de uma vez os filmes que a guerra tinha represado. Os diretores americanos nem sabiam que estavam criando um gênero.'],
    musical: ['Musical', 'Fim dos anos 1920', 'Estados Unidos', 'A história para e todo mundo canta', 'Nasceu colado à chegada do som: assim que o cinema aprendeu a falar, quis cantar. Os primeiros eram gravados com a orquestra tocando ao vivo, logo ali fora do quadro.'],
    terror: ['Terror', 'Anos 1920', 'Alemanha', 'Cenário torto e luz que deforma', 'O expressionismo alemão chegou a pintar a sombra no chão do cenário, porque não havia luz suficiente para criá-la de verdade. A economia virou a cara do medo por cem anos.'],
    ficcao: ['Ficção científica', 'Começo dos anos 1900', 'França e Alemanha', 'O futuro como aviso, não como enfeite', 'Metrópolis, de 1927, já mostrava a cidade dividida entre quem manda em cima e quem trabalha embaixo. Quase toda distopia filmada depois copia aquele desenho.'],
    pastelao: ['Comédia pastelão', 'Anos 1910', 'Estados Unidos', 'Corpo, tombo e nenhuma palavra', 'Sem som, a piada tinha que ser física, e os atores faziam as próprias quedas. Buster Keaton levou uma parede inteira em cima, salvo por uma janela medida no centímetro.']
})

T('Cultura', '📺', 'series', 'Séries que marcaram a televisão',
    'Televisão era tratada como primo pobre do cinema até algumas séries mostrarem que dá para contar uma história em cem horas.',
    ['Ano', 'De onde vem', 'Por que ficou'], {
    ilovelucy: ['I Love Lucy', '1951', 'Estados Unidos', 'Inventou o jeito de gravar comédia', 'Lucille Ball e o marido bancaram a gravação em filme, com três câmeras e plateia ao vivo, formato copiado por setenta anos. Ainda ficaram donos do material, coisa inédita para atores.'],
    jornada: ['Jornada nas Estrelas', '1966', 'Estados Unidos', 'Cancelada e ressuscitada pelo público', 'Saiu do ar por falta de audiência e voltou por causa das reprises e das cartas dos fãs. Boa parte do que hoje é regra da ficção científica na televisão nasceu ali.'],
    chaves: ['Chaves', '1971', 'México', 'Reprise que nunca acabou no Brasil', 'Roberto Gómez Bolaños escrevia, dirigia e atuava. No Brasil a dublagem virou parte da piada, e gerações inteiras decoraram bordões que nem existem no texto original.'],
    twinpeaks: ['Twin Peaks', '1990', 'Estados Unidos', 'Trouxe cinema de autor para a TV aberta', 'David Lynch pegou o formato de novela policial e encheu de sonho e coisa sem explicação. O país inteiro discutiu quem matou a moça, e a resposta a emissora exigiu contra a vontade dele.'],
    sopranos: ['Família Soprano', '1999', 'Estados Unidos', 'Abriu a era do protagonista sem mocinho', 'Um chefe de máfia contando para a terapeuta que tem ataque de pânico. Acompanhar alguém que faz coisas horríveis e ainda assim prende a atenção virou padrão da televisão paga.'],
    breakingbad: ['Breaking Bad', '2008', 'Estados Unidos', 'A mudança lenta como espinha da série', 'O criador resumiu o plano como transformar o professor bonzinho em vilão de faroeste. Até então ninguém deixava um personagem ir de um extremo ao outro dentro da mesma série.']
})

T('Cultura', '💿', 'discos', 'Discos que mudaram a música',
    'Pensar o disco inteiro como uma obra, e não como um punhado de canções soltas, é invenção recente e mudou o que se espera de um artista.',
    ['Ano', 'Quem fez', 'De onde vem'], {
    kindofblue: ['Kind of Blue', '1959', 'Miles Davis', 'Estados Unidos', 'Gravado quase sem ensaio: Davis chegou com rascunhos e mandou o pessoal tocar de primeira. Boa parte do que ficou no disco é a primeira tentativa, sem repetição nenhuma.'],
    petsounds: ['Pet Sounds', '1966', 'Beach Boys', 'Estados Unidos', 'Brian Wilson parou de sair em turnê para ficar no estúdio, tratando a gravação como matéria-prima. Enfiou latido de cachorro, bicicleta e lata de refrigerante no meio das canções.'],
    sgtpeppers: ['Sgt. Pepper\'s Lonely Hearts Club Band', '1967', 'Beatles', 'Reino Unido', 'A banda tinha parado de tocar ao vivo e fez um disco impossível de repetir no palco. Inventaram uma banda de mentira para assinar o trabalho e se livrar do peso de serem eles mesmos.'],
    darkside: ['The Dark Side of the Moon', '1973', 'Pink Floyd', 'Reino Unido', 'Entre uma faixa e outra não existe silêncio: relógio, caixa registradora e conversa de funcionário do estúdio emendam tudo. Ficou tanto tempo nas paradas que virou piada de estatística.'],
    thriller: ['Thriller', '1983', 'Michael Jackson', 'Estados Unidos', 'O clipe de quatorze minutos ajudou a derrubar a barreira de uma MTV que quase não passava artista negro. Virou a régua do que um trabalho pop podia alcançar no mundo inteiro.'],
    nevermind: ['Nevermind', '1991', 'Nirvana', 'Estados Unidos', 'Gravado por uma banda de selo pequeno que só esperava vender o bastante para pagar a conta do estúdio. Em poucos meses a flanela surrada de Seattle estava em vitrine de loja cara.']
})

T('Cultura', '🎸', 'rock', 'A história do rock',
    'O rock não tem certidão de nascimento: tem uma briga velha sobre qual gravação foi a primeira e um monte de gente sem crédito.',
    ['Ano', 'De onde vem', 'Quem fez'], {
    rocket: ['Rocket 88', '1951', 'Memphis, Estados Unidos', 'Banda de Ike Turner, voz de Jackie Brenston', 'O amplificador caiu do carro e rasgou o alto-falante. Em vez de trocar, enfiaram papel dentro e gravaram com o som sujo mesmo: muita gente aponta essa faixa como o primeiro rock.'],
    chuckberry: ['Chuck Berry', 'Meados dos anos 1950', 'Saint Louis, Estados Unidos', 'Chuck Berry', 'Escrevia letra sobre carro, escola e sábado à noite, que era exatamente o que o público jovem vivia. Metade das levadas de guitarra que o mundo repete passou pela mão dele primeiro.'],
    invasao: ['A invasão britânica', '1964', 'Reino Unido', 'Beatles, Rolling Stones e companhia', 'Meninos ingleses aprenderam rock ouvindo disco de blues americano comprado em porto, e devolveram a mercadoria para os Estados Unidos. Muito americano só conheceu seus próprios mestres assim.'],
    woodstock: ['Woodstock', '1969', 'Estado de Nova York', 'Meio milhão de pessoas', 'Era para ser festival pago e cercado. Chegou tanta gente que a cerca caiu e a organização declarou o evento de graça no meio do caminho, quebrando os produtores e virando símbolo.'],
    sabbath: ['Black Sabbath', '1970', 'Birmingham, Inglaterra', 'Black Sabbath', 'Tony Iommi perdeu pontas de dois dedos numa fábrica e afrouxou as cordas para doer menos ao tocar. O som mais grave que saiu dali é a certidão de nascimento do heavy metal.'],
    punk: ['O punk', '1976', 'Londres e Nova York', 'Ramones, Sex Pistols e Clash', 'A ideia central era que não é preciso saber tocar direito para subir no palco. Fanzine ensinava três posições de mão e mandava o leitor montar a banda na semana seguinte.']
})

T('Cultura', '🎺', 'jazzblues', 'O jazz e o blues',
    'Duas músicas nascidas do mesmo sul dos Estados Unidos: uma virou lamento de uma pessoa só, a outra virou conversa de grupo.',
    ['Quando', 'De onde vem', 'Quem fez'], {
    delta: ['O blues do Delta', 'Anos 1920 e 1930', 'Beira do rio Mississippi', 'Charley Patton e Robert Johnson', 'Johnson gravou pouquíssimas músicas, em dois punhados de sessões, e morreu jovem. A lenda do pacto na encruzilhada foi inventada depois e serviu para vender disco que ele nunca viu vender.'],
    neworleans: ['Nova Orleans', 'Anos 1910 e 1920', 'Nova Orleans, Louisiana', 'Louis Armstrong e King Oliver', 'Na cidade portuária a banda de rua tocava em enterro: ida triste, volta animada. Armstrong saiu de um reformatório de menores tocando corneta e virou a voz mais copiada do século.'],
    swing: ['A era do swing', 'Anos 1930 e 1940', 'Nova York e Kansas City', 'Duke Ellington e Count Basie', 'Era música para dançar, com orquestra grande e salão lotado. Ellington escrevia pensando em cada músico da banda pelo nome, e não numa parte genérica que qualquer um preenchesse.'],
    bebop: ['O bebop', 'Anos 1940', 'Salas pequenas de Nova York', 'Charlie Parker e Dizzy Gillespie', 'Tocavam rápido demais de propósito, para que a plateia parasse de dançar e sentasse para ouvir. Virou música de escuta, e muita gente da velha guarda achou que aquilo era barulho.'],
    chicago: ['O blues elétrico', 'Anos 1940 e 1950', 'Chicago', 'Muddy Waters e Howlin\' Wolf', 'A migração do sul levou o blues para o barulho da cidade grande, e ligar na tomada foi o único jeito de ser ouvido dentro do bar. Sem essa mudança não existiria rock.'],
    livre: ['O jazz livre', 'Anos 1960', 'Estados Unidos', 'John Coltrane e Ornette Coleman', 'Abandonaram o roteiro combinado e deixaram cada músico seguir por conta. Gente saía no meio do show reclamando, e hoje são justamente esses discos que os estudantes mais estudam.']
})

T('Cultura', '🎼', 'compositoresclassicos', 'Os compositores da música clássica',
    'Quase todos eles foram empregados: escreviam sob encomenda, com prazo curto e patrão exigente, e a glória só chegou bem depois.',
    ['Quando viveu', 'De onde vem', 'Obra-chave'], {
    bach: ['Johann Sebastian Bach', '1685 a 1750', 'Alemanha', 'Paixão segundo São Mateus', 'Era funcionário de igreja e entregava música nova quase toda semana. Foi esquecido por quase um século e voltou à moda quando Mendelssohn desencavou uma partitura velha e a montou de novo.'],
    mozart: ['Wolfgang Amadeus Mozart', '1756 a 1791', 'Áustria', 'Réquiem', 'O pai o levava em turnê pela Europa como criança prodígio. Morreu aos 35 anos, devendo dinheiro, com a missa de defuntos encomendada por um anônimo inacabada em cima da mesa.'],
    beethoven: ['Ludwig van Beethoven', '1770 a 1827', 'Alemanha', 'Nona Sinfonia', 'Foi ficando surdo aos poucos e escreveu suas obras maiores sem conseguir ouvi-las. Na estreia da Nona tiveram que virá-lo de frente para a plateia para ele enxergar os aplausos.'],
    chopin: ['Frédéric Chopin', '1810 a 1849', 'Polônia', 'Estudos e noturnos', 'Saiu da Polônia aos vinte anos e nunca mais voltou. Detestava palco grande: dizia que a multidão o sufocava e preferia tocar em sala pequena, para poucas pessoas conhecidas.'],
    stravinsky: ['Igor Stravinsky', '1882 a 1971', 'Rússia', 'A Sagração da Primavera', 'A estreia em Paris terminou em confusão, com gente gritando e brigando na plateia. Vinte anos depois a mesma peça era aplaudida de pé pelo mesmo tipo de público.'],
    villalobos: ['Heitor Villa-Lobos', '1887 a 1959', 'Brasil', 'Bachianas Brasileiras', 'Juntou a música de Bach com o que ouvia na rua e no interior do país. Contava histórias inventadas sobre viagens pela Amazônia e nunca deixou ninguém conferir a versão dele.']
})

T('Cultura', '🎶', 'opera', 'A ópera e suas obras',
    'Ópera já foi entretenimento popular na Europa: gente comendo, torcendo e vaiando o palco, bem longe do silêncio respeitoso de hoje.',
    ['Ano', 'Quem fez', 'De onde vem'], {
    orfeu: ['Orfeu', '1607', 'Claudio Monteverdi', 'Mântua, Itália', 'É a ópera mais antiga que ainda sobe ao palco com frequência. Nasceu de um grupo de estudiosos que queria reconstituir o teatro grego antigo e acabou inventando uma coisa nova.'],
    flauta: ['A Flauta Mágica', '1791', 'Wolfgang Amadeus Mozart', 'Viena, Áustria', 'Foi escrita para teatro popular de subúrbio, em alemão e com piada de palhaço, não para a corte. Mozart morreu poucas semanas depois de vê-la lotar a casa noite após noite.'],
    barbeiro: ['O Barbeiro de Sevilha', '1816', 'Gioachino Rossini', 'Roma, Itália', 'Rossini escreveu em poucas semanas e a estreia foi um desastre, com gato passeando no palco e vaia combinada por rivais. Na segunda noite já estava tudo virado em sucesso.'],
    traviata: ['La Traviata', '1853', 'Giuseppe Verdi', 'Veneza, Itália', 'O público riu na estreia porque a moça tuberculosa era vivida por uma cantora de saúde visivelmente robusta. Incomodou também ver no palco gente do presente, e não rei de outro século.'],
    carmen: ['Carmen', '1875', 'Georges Bizet', 'Paris, França', 'A crítica chamou de imoral por causa da protagonista que escolhe e descarta os homens. Bizet morreu três meses depois da estreia achando que tinha feito um fracasso.'],
    anel: ['O Anel do Nibelungo', '1876', 'Richard Wagner', 'Bayreuth, Alemanha', 'São quatro óperas para assistir em dias seguidos, e ele mandou construir um teatro só para elas. Dar a cada personagem um tema próprio virou receita de trilha de cinema.']
})

T('Cultura', '🎤', 'hiphop', 'O hip-hop',
    'Começou numa festa de prédio no Bronx, com dois toca-discos e nenhum dinheiro, e virou a língua comum da música jovem no mundo.',
    ['Ano', 'De onde vem', 'Quem fez'], {
    festabronx: ['A festa do Kool Herc', '1973', 'Bronx, Nova York', 'DJ Kool Herc', 'A irmã dele queria dinheiro para roupa de escola, então cobraram entrada na festa do salão. Ele repetia só a parte instrumental dos discos, esticando o trecho em que todo mundo dançava.'],
    scratch: ['O scratch', 'Meados dos anos 1970', 'Bronx, Nova York', 'Grand Wizzard Theodore', 'A mãe gritou para ele abaixar o som e, ao segurar o disco com a mão no meio da música, ele ouviu o barulho que viraria assinatura sonora do hip-hop inteiro.'],
    rappers: ['Rapper\'s Delight', '1979', 'Nova Jersey', 'Sugarhill Gang', 'Foi a primeira vez que o rap virou disco vendido em loja. O pessoal do Bronx reclamou: aquele grupo não era da cena e parte das rimas tinha sido pega emprestada de outro rapper.'],
    mensagem: ['The Message', '1982', 'Nova York', 'Grandmaster Flash and the Furious Five', 'Até ali a rima era de festa e de vaidade. Essa faixa contou a vida no bairro pobre sem enfeitar nada e abriu caminho para o rap como reportagem sobre o próprio lugar.'],
    publicenemy: ['Public Enemy', '1988', 'Long Island, Nova York', 'Chuck D e a equipe de produção', 'Empilhavam dezenas de pedaços de discos diferentes para montar uma parede de barulho. Processos por uso de trecho alheio depois tornaram esse tipo de produção caro demais para repetir.'],
    racionais: ['Sobrevivendo no Inferno', '1997', 'São Paulo', 'Racionais MC\'s', 'Vendido de porta em porta e em banca, sem apoio de rádio e sem gravadora grande. Virou leitura obrigatória em vestibular de universidade pública duas décadas depois.']
})

T('Cultura', '🎧', 'musicaeletronica', 'A música eletrônica',
    'Muito antes da pista de dança, ela nasceu em laboratório de rádio, feita por gente querendo saber se barulho comum também vira música.',
    ['Ano', 'De onde vem', 'Quem fez'], {
    concreta: ['A música concreta', '1948', 'Paris, França', 'Pierre Schaeffer', 'Ele gravava trem, porta e voz e depois cortava e emendava a fita na mão. A ideia de que qualquer som serve de matéria-prima é a base de tudo que veio depois.'],
    kraftwerk: ['Kraftwerk', '1974', 'Düsseldorf, Alemanha', 'Ralf Hütter e Florian Schneider', 'Fizeram uma música longa sobre dirigir na estrada, repetitiva de propósito. Do techno de Detroit ao hip-hop de Nova York, quase todo mundo depois reconheceu a dívida com eles.'],
    house: ['O house de Chicago', 'Começo dos anos 1980', 'Chicago, Estados Unidos', 'Frankie Knuckles e amigos', 'Nasceu num clube de público negro e gay logo depois de um estádio queimar discos de música de dança em praça pública. O que tentaram matar voltou mais forte e tomou o mundo.'],
    techno: ['O techno de Detroit', 'Meados dos anos 1980', 'Detroit, Estados Unidos', 'Juan Atkins, Derrick May e Kevin Saunderson', 'Três amigos de escola, numa cidade de fábrica fechando, imaginaram como seria a música de um futuro sem operário. Só fizeram sucesso de verdade bem depois, e do outro lado do mar.'],
    jungle: ['O jungle e o drum and bass', 'Começo dos anos 1990', 'Londres, Inglaterra', 'Cena de festa e rádio pirata', 'Quase tudo saiu de um mesmo trecho de bateria de um disco antigo, acelerado e picotado de mil maneiras. O baterista que gravou aquilo passou a vida sem receber nada por isso.'],
    daftpunk: ['Daft Punk', '1997', 'Paris, França', 'Thomas Bangalter e Guy-Manuel de Homem-Christo', 'Depois de uma crítica dizer que a banda anterior deles era barulho bobo, adotaram o insulto como nome. Passaram a usar capacete para não serem reconhecidos na rua.']
})

T('Cultura', '🦸', 'quadrinhos', 'A história dos quadrinhos',
    'Nasceram como isca para vender jornal e passaram por censura, caça às bruxas e muito desprezo antes de entrar em museu.',
    ['Ano', 'De onde vem', 'Quem fez'], {
    yellowkid: ['O Menino Amarelo', '1895', 'Nova York', 'Richard Outcault', 'Dois jornais brigaram pelo personagem e publicaram versões concorrentes ao mesmo tempo. A briga deu nome à imprensa sensacionalista, que até hoje é chamada de amarela.'],
    superman: ['Superman', '1938', 'Cleveland, Estados Unidos', 'Jerry Siegel e Joe Shuster', 'Dois filhos de imigrantes venderam os direitos por uma quantia pequena e passaram a vida tentando reaver o crédito. Só voltaram a ter o nome impresso depois de campanha pública.'],
    codigo: ['O código de censura', '1954', 'Estados Unidos', 'As editoras, sob pressão do Senado', 'Um psiquiatra convenceu meio país de que gibi criava delinquente. As editoras se autocensuraram para escapar de lei, e o terror nos quadrinhos quase sumiu por uma geração inteira.'],
    marvel: ['A virada da Marvel', '1961', 'Nova York', 'Stan Lee e Jack Kirby', 'A novidade foi dar problema de gente comum ao herói: aluguel atrasado, briga em casa, namoro que não dá certo. Quem desenhou e bolou boa parte disso foi Kirby, reconhecido tarde demais.'],
    watchmen: ['Watchmen', '1986', 'Estados Unidos e Reino Unido', 'Alan Moore e Dave Gibbons', 'Junto com o Cavaleiro das Trevas, virou o argumento de que gibi podia ser leitura adulta. Moore passou a detestar o rótulo de romance gráfico, que achava conversa de vendedor.'],
    monica: ['Turma da Mônica', '1959', 'Brasil', 'Maurício de Sousa', 'Começou como tira de jornal estrelada por um cachorrinho, e a menina forte só apareceu alguns anos depois. Virou a maior operação de licenciamento de personagem do país.']
})

T('Cultura', '🎮', 'videogames', 'A história dos videogames',
    'Os primeiros jogos foram feitos por gente com acesso a computador caro querendo se divertir no trabalho, sem pensar em vender nada.',
    ['Ano', 'De onde vem', 'Quem fez'], {
    spacewar: ['Spacewar', '1962', 'Laboratório do MIT', 'Steve Russell e colegas', 'Rodava num computador do tamanho de um armário e foi distribuído de graça entre universidades. Ninguém pensou em cobrar: a ideia de vender jogo simplesmente não existia ainda.'],
    pong: ['Pong', '1972', 'Califórnia, Estados Unidos', 'Atari, projeto de Allan Alcorn', 'A primeira máquina de teste deu defeito porque o cofre de moedas transbordou. Era um exercício de treinamento que o chefe passou para o novato e acabou virando o produto da empresa.'],
    invaders: ['Space Invaders', '1978', 'Japão', 'Tomohiro Nishikado', 'Os alienígenas aceleram no fim da fase por acidente: com menos inimigos na tela, a máquina conseguia desenhar mais rápido. O defeito virou o melhor detalhe do jogo.'],
    crash: ['A quebra de 1983', '1983', 'Estados Unidos', 'A própria indústria', 'Jogo ruim demais e loja abarrotada derrubaram o mercado americano. Uma empresa enterrou cartuchos encalhados no deserto do Novo México, história só confirmada com escavação décadas depois.'],
    mario: ['Super Mario Bros.', '1985', 'Japão', 'Shigeru Miyamoto e a Nintendo', 'A primeira tela ensina tudo sem uma linha de texto: o jogador anda, encosta no bicho, morre e entende. Virou aula de como se explica um jogo jogando.'],
    tetris: ['Tetris', '1984', 'Moscou, União Soviética', 'Alexey Pajitnov', 'Foi criado num instituto do governo, então o dono era o Estado. A briga por quem podia vender o jogo fora do país durou anos, e o criador só passou a receber muito tempo depois.']
})

T('Cultura', '📚', 'literaturamundial', 'Livros que mudaram o mundo',
    'Tem livro que saiu da estante e foi mexer no mundo lá fora, mudando o jeito de escrever, de crer e até de olhar para a própria espécie.',
    ['Quem escreveu', 'Publicado', 'De onde veio'], {
    odisseia: ['A Odisseia', 'atribuída a Homero', 'por volta do século 8 antes de Cristo', 'Grécia', 'Foi cantada de cor por gerações antes de alguém escrever. Por isso tanta frase se repete: o verso pronto era a muleta do cantador para lembrar o que vinha depois.'],
    divinacomedia: ['A Divina Comédia', 'Dante Alighieri', 'começo do século 14', 'Itália', 'Dante escreveu no toscano do povo em vez do latim dos letrados, e esse toscano virou a base do italiano de hoje. De quebra, pôs desafetos pessoais no inferno, com nome e sobrenome.'],
    domquixote: ['Dom Quixote', 'Miguel de Cervantes', 'primeira parte em 1605', 'Espanha', 'Muita gente chama de primeiro romance moderno. A segunda parte só existe porque um oportunista lançou continuação falsa, e Cervantes escreveu a dele para desmoralizar o impostor.'],
    origemdasespecies: ['A Origem das Espécies', 'Charles Darwin', '1859', 'Reino Unido', 'Darwin segurou a ideia por quase vinte anos, com medo do estrago. Só publicou depois de descobrir que Wallace tinha chegado sozinho à mesma conclusão do outro lado do mundo.'],
    milnovecentos: ['1984', 'George Orwell', '1949', 'Reino Unido', 'O título é o ano em que ele terminou o texto, com os dois últimos números trocados. Palavras inventadas ali, como duplipensar e Grande Irmão, hoje aparecem em discussão sobre vigilância de verdade.'],
    cemanos: ['Cem Anos de Solidão', 'Gabriel García Márquez', '1967', 'Colômbia', 'Ele largou o emprego, vendeu o carro e passou mais de um ano só escrevendo, enquanto a mulher fiava dívida no armazém. Na hora de mandar aos editores, faltava dinheiro para postar o calhamaço inteiro de uma vez.']
}, 'anos de primeira publicação; para a Antiguidade, a datação mais aceita')

T('Cultura', '✍️', 'autoresmundiais', 'Autores da literatura mundial',
    'Por trás de cada nome que virou sinônimo de literatura existe uma vida com fuzilamento cancelado, dívida de jogo, nome falso e pedido final que ninguém cumpriu.',
    ['País', 'Época', 'Obra mais lembrada'], {
    shakespeare: ['William Shakespeare', 'Inglaterra', 'virada do século 16 para o 17', 'Hamlet', 'Não sobrou nenhum manuscrito original das peças. O que existe hoje veio de dois colegas de companhia que juntaram os textos num volume anos depois da morte dele, de memória e de papel de ensaio.'],
    janeausten: ['Jane Austen', 'Inglaterra', 'começo do século 19', 'Orgulho e Preconceito', 'Publicou a vida toda sem assinar o nome: nas capas saía apenas que era obra de uma dama. Quem contou ao público quem tinha escrito aquilo foi o irmão, depois que ela morreu.'],
    dostoievski: ['Fiódor Dostoiévski', 'Rússia', 'século 19', 'Crime e Castigo', 'Foi levado ao fuzilamento de verdade e teve a pena trocada no último minuto, já enfileirado no pátio. Voltou da Sibéria endividado no jogo e chegou a ditar um romance inteiro em pouco mais de três semanas.'],
    kafka: ['Franz Kafka', 'Praga, então no Império Austro-Húngaro', 'começo do século 20', 'A Metamorfose', 'Trabalhava de dia numa companhia de seguros e escrevia de madrugada. Pediu ao amigo Max Brod que queimasse tudo o que sobrasse, e é só porque Brod desobedeceu que existe a obra dele.'],
    agathachristie: ['Agatha Christie', 'Inglaterra', 'século 20', 'Assassinato no Expresso do Oriente', 'Em 1926 ela sumiu por onze dias e o país inteiro saiu à procura, com batida policial e aviões. Apareceu hospedada num hotel sob nome falso e nunca explicou o que houve.'],
    tolkien: ['J. R. R. Tolkien', 'Inglaterra', 'século 20', 'O Senhor dos Anéis', 'Era professor de línguas antigas e inventou os idiomas élficos primeiro. A Terra-média nasceu depois, como o lugar onde aquelas línguas inventadas pudessem ser faladas por alguém.']
})

T('Cultura', '🎖️', 'nobel', 'O Nobel e seus laureados',
    'O prêmio criado pelo dono da patente da dinamite já foi recusado em público, dado por um trabalho menor que o famoso e entregue a uma menina de dezessete anos.',
    ['Área', 'Ano', 'País'], {
    mariecurie: ['Marie Curie', 'Física e Química', '1903 e 1911', 'Polônia e França', 'É a única pessoa premiada em duas ciências diferentes. A filha Irène também levou o de Química depois, e o caderno de anotações da mãe segue radioativo, guardado em caixa de chumbo.'],
    einstein: ['Albert Einstein', 'Física', '1921', 'Alemanha', 'Não ganhou pela relatividade, que ainda era discutida demais, e sim pela explicação do efeito fotoelétrico. O dinheiro já estava prometido à ex-mulher no acordo de divórcio, feito antes de existir prêmio.'],
    fleming: ['Alexander Fleming', 'Medicina', '1945', 'Escócia', 'Dividiu com Florey e Chain, que foram quem transformou o mofo esquecido numa placa em remédio de verdade. No discurso, Fleming já avisou que usar o antibiótico à toa criaria bactéria resistente.'],
    king: ['Martin Luther King', 'Paz', '1964', 'Estados Unidos', 'Era o mais jovem a receber o da Paz até então. Não ficou com um centavo: repassou todo o valor ao movimento pelos direitos civis, que vivia de doação e precisava pagar fiança de manifestante.'],
    sartre: ['Jean-Paul Sartre', 'Literatura', '1964', 'França', 'Recusou o prêmio e explicou por quê: escritor que aceita virar instituição perde a liberdade de incomodar. Anos mais tarde, apertado de dinheiro, pediu o valor e ouviu que não dava mais.'],
    malala: ['Malala Yousafzai', 'Paz', '2014', 'Paquistão', 'Recebeu aos dezessete anos, a mais jovem da história do prêmio, dois anos depois de levar um tiro na cabeça indo para a escola. Dividiu o palco com um indiano, num momento em que os dois países mal se falavam.']
}, 'anos de premiação conforme o registro da Fundação Nobel')

T('Cultura', '🎩', 'personagensliterarios', 'Personagens que saíram dos livros e viraram gente',
    'Alguns personagens ficaram maiores que o livro que os criou, a ponto de gente vestir luto por eles e mandar carta para um endereço onde nunca morou ninguém.',
    ['Quem criou', 'Livro de estreia', 'Sinal particular'], {
    sherlock: ['Sherlock Holmes', 'Arthur Conan Doyle', 'Um Estudo em Vermelho, de 1887', 'lupa, cachimbo e dedução', 'Doyle enjoou e matou o detetive numa cachoeira. Leitor cancelou assinatura da revista e gente saiu de luto na rua, até ele ceder e ressuscitar o personagem. O endereço da Baker Street recebe carta até hoje.'],
    frankenstein: ['A criatura de Frankenstein', 'Mary Shelley', 'Frankenstein, de 1818', 'costurada e trazida à vida', 'Frankenstein é o nome do cientista, não do monstro. No livro a criatura aprende a ler sozinha e argumenta melhor que o criador. Mary tinha dezoito anos quando começou a escrever, num verão chuvoso na Suíça.'],
    alice: ['Alice', 'Lewis Carroll', 'Alice no País das Maravilhas, de 1865', 'cai na toca do coelho', 'A história foi improvisada num passeio de barco para entreter três irmãs. Uma delas, chamada Alice, pediu que ele escrevesse aquilo num caderno, e foi assim que o livro existiu.'],
    dracula: ['Drácula', 'Bram Stoker', 'Drácula, de 1897', 'conde que não aparece no espelho', 'Stoker nunca pôs os pés na Transilvânia: montou o cenário inteiro lendo guias de viagem e relatos na biblioteca. O nome tomou emprestado de um príncipe da Valáquia que nada tinha de vampiro.'],
    pinoquio: ['Pinóquio', 'Carlo Collodi', 'As Aventuras de Pinóquio, de 1883', 'nariz que cresce na mentira', 'Na versão original o boneco é um moleque insuportável, mata o grilo falante com uma martelada e acaba enforcado numa árvore. Collodi só escreveu a continuação com final feliz porque os leitores exigiram.'],
    robinson: ['Robinson Crusoé', 'Daniel Defoe', 'Robinson Crusoé, de 1719', 'náufrago que refaz a vida sozinho', 'Saiu de um caso real: o marinheiro escocês Alexander Selkirk brigou com o capitão, foi deixado numa ilha do Pacífico e passou mais de quatro anos ali antes de ser resgatado.']
})

T('Cultura', '🖼️', 'pintura', 'Quadros que todo mundo conhece',
    'Quadro famoso quase nunca ficou famoso pelo motivo que você imagina: no meio da história tem roubo, guerra, tinta errada e pescoço torto de tanto olhar para cima.',
    ['Pintor', 'Quando', 'Onde está'], {
    monalisa: ['Mona Lisa', 'Leonardo da Vinci', 'iniciada por volta de 1503', 'Museu do Louvre, em Paris', 'Virou a pintura mais famosa do planeta depois de ser roubada em 1911 por um funcionário do museu. Ficou sumida por dois anos e, nesse tempo, formava-se fila para ver a parede vazia onde ela ficava.'],
    ultimaceia: ['A Última Ceia', 'Leonardo da Vinci', 'fim do século 15', 'Santa Maria delle Grazie, em Milão', 'Leonardo pintou a seco em vez de fazer afresco, para poder corrigir com calma. A tinta começou a soltar ainda em vida dele, e o que se vê hoje passou por um restauro que levou mais de vinte anos.'],
    criacaodeadao: ['A Criação de Adão', 'Michelangelo', 'por volta de 1511', 'Capela Sistina, no Vaticano', 'Ele pintou em pé, de pescoço torcido para trás, e não deitado como conta a lenda. Reclamou das dores num poema em que diz estar virando um bicho entortado pelo próprio trabalho.'],
    noiteestrelada: ['A Noite Estrelada', 'Vincent van Gogh', '1889', 'Museu de Arte Moderna, em Nova York', 'Pintou de memória, durante o dia, internado num hospital em Saint-Rémy, olhando pela janela do quarto. Escreveu ao irmão que a tela tinha dado errado e não valia grande coisa.'],
    ogrito: ['O Grito', 'Edvard Munch', '1893', 'Oslo, em dois museus da cidade', 'A figura não está gritando: está tapando os ouvidos. Munch anotou que ouviu um grito vindo da natureza enquanto caminhava. Existem várias versões, e duas já foram roubadas e recuperadas.'],
    guernica: ['Guernica', 'Pablo Picasso', '1937', 'Museu Reina Sofía, em Madri', 'Saiu em poucas semanas, logo depois do bombardeio da cidade basca. Picasso proibiu que voltasse à Espanha enquanto durasse a ditadura de Franco, e a tela passou décadas guardada em Nova York.']
})

T('Cultura', '🎨', 'pintores', 'Pintores e seus estilos',
    'Cada um desses pode ser reconhecido de longe por uma mania de traço, e quase todos levaram uma vida bem diferente da lenda que contam por aí.',
    ['Estilo', 'Época', 'Como reconhecer'], {
    vermeer: ['Johannes Vermeer', 'barroco holandês', 'século 17', 'luz de janela entrando sempre pela esquerda', 'Deixou pouco mais de trinta quadros e foi esquecido por quase dois séculos. Um crítico francês o desenterrou nos anos 1800, e hoje cada tela dele é tratada como acontecimento.'],
    monet: ['Claude Monet', 'impressionismo', 'fim do século 19', 'pincelada rápida, pintada ao ar livre', 'O nome do movimento saiu de uma crítica azeda a um quadro dele. Pintou a mesma catedral dezenas de vezes, em horas diferentes, só para mostrar que o assunto era a luz e não a pedra.'],
    vangogh: ['Vincent van Gogh', 'pós-impressionismo', 'fim do século 19', 'tinta empastada e céu em espiral', 'Pintou centenas de telas em cerca de dez anos e quase não vendeu nada em vida. Quem bancou tinta, tela e aluguel foi o irmão Theo, que morreu seis meses depois dele.'],
    picasso: ['Pablo Picasso', 'cubismo, entre outras fases', 'século 20', 'rosto visto de vários ângulos de uma vez', 'Na adolescência já desenhava como os mestres da academia e passou a vida tentando desaprender aquilo. Produziu obra em quantidade absurda, estimada em dezenas de milhares de peças entre tela, gravura e cerâmica.'],
    dali: ['Salvador Dalí', 'surrealismo', 'século 20', 'relógio derretendo e bigode espetado', 'Dizia que os relógios moles vieram de um queijo amolecendo no sol. Fazia escândalo em público de propósito, porque descobriu cedo que a notícia do dia seguinte vendia quadro.'],
    frida: ['Frida Kahlo', 'pintura pessoal perto do surrealismo', 'século 20', 'autorretrato com o corpo à mostra', 'Começou a pintar deitada, presa a uma cama depois de um acidente de bonde. A família prendeu um espelho no teto para ela se enxergar, e daí saiu a série de autorretratos que a tornou conhecida.']
})

T('Cultura', '🖌️', 'movimentosarte', 'Os movimentos da arte',
    'Movimento de arte raramente nasce de manifesto bonito: costuma vir de briga com a geração anterior, de invenção técnica ou de uma crítica que era para ser xingamento.',
    ['Quando', 'Onde nasceu', 'Como reconhecer'], {
    renascimento: ['Renascimento', 'séculos 15 e 16', 'Itália', 'perspectiva certinha e corpo humano estudado', 'A perspectiva foi mais façanha de arquiteto que de pintor. Brunelleschi provou o truque com uma tábua furada e um espelho na praça, e só depois os pintores copiaram o método.'],
    barroco: ['Barroco', 'séculos 17 e 18', 'Roma e a Europa católica', 'luz e sombra fortes, cena em pleno movimento', 'Nasceu como resposta da Igreja à Reforma: arte feita para emocionar na hora, agarrar quem entra pela porta e não deixar dúvida de que lado ficar.'],
    impressionismo: ['Impressionismo', 'fim do século 19', 'França', 'pincelada solta e luz de um instante só', 'Só virou possível quando a tinta passou a ser vendida em tubo de metal. Antes disso o pintor moía pigmento no ateliê, e sair pintando no campo era problema de logística.'],
    cubismo: ['Cubismo', 'começo do século 20', 'Paris', 'figura quebrada em planos e vista de vários lados', 'Braque e Picasso trabalhavam tão colados que nem eles separavam bem quem fez o quê em certas telas. O nome saiu de um crítico zombando dos cubinhos.'],
    surrealismo: ['Surrealismo', 'entre as duas guerras mundiais', 'Paris', 'sonho, acaso e imagem impossível', 'O grupo levava a sério escrita automática e caderno de sonhos. Também funcionava como partido: André Breton expulsava quem discordasse, com direito a comunicado público.'],
    popart: ['Pop art', 'anos 1950 e 1960', 'Reino Unido e Estados Unidos', 'lata de sopa, gibi e cor chapada', 'Pegou a imagem do supermercado e pendurou na galeria. Warhol chamava o ateliê de fábrica e deixava assistente executar a obra, o que enfurecia quem esperava a mão do gênio.']
})

T('Cultura', '🗿', 'esculturas', 'Esculturas famosas',
    'Pedra parada guarda história de gente: bloco recusado por outros escultores, braços que ninguém sabe onde foram parar e cabeças que têm corpo enterrado embaixo.',
    ['Autor ou povo', 'Quando', 'Onde está'], {
    venusdemilo: ['Vênus de Milo', 'escultor grego desconhecido', 'por volta do século 2 antes de Cristo', 'Museu do Louvre, em Paris', 'Foi desenterrada por um camponês numa ilha grega já sem os braços. Ninguém sabe o que ela segurava, e toda reconstituição que você viu é chute de especialista.'],
    exercitodeterracota: ['Exército de Terracota', 'artesãos do imperador Qin', 'século 3 antes de Cristo', 'Xian, na China', 'Apareceu em 1974, quando camponeses cavavam um poço. Cada rosto é diferente do outro, e as peças eram pintadas de cores vivas que somem em pouco tempo quando o ar chega nelas.'],
    moai: ['Moai', 'povo rapanui', 'entre os séculos 13 e 16', 'Ilha de Páscoa', 'Boa parte tem corpo inteiro enterrado até o pescoço, e o que se vê de longe é só a cabeça. Foram levados por quilômetros, e experimentos mostram que dá para fazê-los caminhar em pé, balançados por cordas.'],
    davi: ['Davi', 'Michelangelo', 'começo do século 16', 'Galeria da Academia, em Florença', 'O bloco de mármore estava largado num pátio havia décadas, recusado por outros escultores por ser estreito demais. Michelangelo tinha vinte e poucos anos quando aceitou a sobra e tirou aquilo de dentro dela.'],
    pensador: ['O Pensador', 'Auguste Rodin', 'fim do século 19', 'Museu Rodin, em Paris', 'Começou como detalhe de um portão enorme inspirado em Dante: era o poeta, sentado no alto, olhando os condenados lá embaixo. Só depois foi ampliado e virou obra sozinha.'],
    estatuadaliberdade: ['Estátua da Liberdade', 'Bartholdi, com estrutura de Gustave Eiffel', '1886', 'Nova York', 'Foi presente da França e atravessou o oceano desmontada, em centenas de caixotes. Chegou cor de moeda nova: o verde de hoje é o cobre oxidando ano após ano na maresia.']
})

T('Cultura', '⛪', 'estilosarquitetura', 'Os estilos da arquitetura',
    'Dá para ler a época de um prédio pelo formato do arco, pela grossura da parede e pela quantidade de enfeite que o construtor julgou necessária.',
    ['Quando', 'Como reconhecer', 'Exemplo conhecido'], {
    classicogrego: ['Clássico grego', 'Antiguidade', 'coluna, frontão triangular e simetria', 'Partenon, em Atenas', 'As colunas do Partenon são levemente barrigudas e inclinadas para dentro. É correção proposital: engana o olho, que veria curva onde há reta, e faz o templo parecer perfeito.'],
    romanico: ['Românico', 'séculos 10 a 12', 'arco redondo, parede grossa, janela pequena', 'abadias de peregrinação na Europa', 'A parede é grossa porque ela é que segura tudo, e por isso sobra pouco espaço para janela. Por dentro eram pintadas de cores fortes; o cinza solene de hoje é tinta que o tempo comeu.'],
    gotico: ['Gótico', 'séculos 12 a 15', 'arco em ponta, vitral enorme, arcobotante', 'Notre-Dame, em Paris', 'O arcobotante é uma muleta genial: joga o peso do teto para fora do prédio e libera a parede, que pode então virar vidro. O apelido gótico foi xingamento inventado séculos depois, no sentido de bárbaro.'],
    neoclassico: ['Neoclássico', 'séculos 18 e 19', 'colunata e frontão copiados da Grécia e de Roma', 'prédios de governo e museus', 'Virou a cara oficial do poder no mundo inteiro. Quando um país novo queria parecer antigo e respeitável, mandava pôr coluna grega na fachada do parlamento.'],
    artnouveau: ['Art nouveau', 'virada do século 19 para o 20', 'curva de planta em ferro e vidro', 'entradas do metrô de Paris', 'Pegou forma de caule e flor e enfiou em grade, corrimão e luminária. Durou pouco, umas duas décadas, e foi varrido pelo art déco, que achava tudo aquilo enfeite demais.'],
    modernista: ['Modernista', 'século 20', 'linha reta, concreto aparente, prédio sobre pilotis', 'conjuntos habitacionais do pós-guerra', 'O lema era que a forma segue a função e que enfeite é desperdício. Le Corbusier chamava a casa de máquina de morar, frase que rendeu elogio e xingamento em dose igual.']
})

T('Cultura', '🏛️', 'museusmundo', 'Os grandes museus do mundo',
    'Museu grande quase sempre começou como coleção particular de rei ou de colecionador teimoso, e parte do acervo até hoje é motivo de briga entre países.',
    ['Cidade', 'Aberto desde', 'Destaque do acervo'], {
    louvre: ['Museu do Louvre', 'Paris', '1793', 'Mona Lisa, Vênus de Milo e arte antiga', 'Era palácio dos reis e só virou museu na Revolução, quando a coleção da corte passou a ser do povo. O acervo é tão grande que ver cada peça por meio minuto tomaria meses de visita.'],
    britishmuseum: ['Museu Britânico', 'Londres', '1759', 'Pedra de Roseta e mármores do Partenon', 'A entrada sempre foi gratuita. Boa parte do acervo veio de escavação em terra dominada, e a Grécia cobra a devolução dos mármores do Partenon há mais de dois séculos.'],
    metropolitan: ['Metropolitan Museum', 'Nova York', '1870', 'cinco mil anos de arte, do Egito aos dias de hoje', 'Tem um templo egípcio inteiro montado lá dentro, o de Dendur. Foi presente do Egito a quem ajudou a salvar monumentos que iam sumir sob a água da represa de Assuã.'],
    museusvaticanos: ['Museus Vaticanos', 'Cidade do Vaticano', '1506', 'Capela Sistina e o grupo do Laocoonte', 'Tudo começou com uma escultura desenterrada num vinhedo de Roma. O papa comprou no mesmo dia, mandou expor ao público e a coleção foi crescendo em volta daquela peça.'],
    prado: ['Museu do Prado', 'Madri', '1819', 'Velázquez, Goya e as pinturas negras', 'Nasceu da coleção particular dos reis da Espanha. Na Guerra Civil os quadros saíram de caminhão e foram escondidos longe dos bombardeios, numa das maiores mudanças de acervo já feitas.'],
    hermitage: ['Hermitage', 'São Petersburgo', '1764', 'palácio dos czares e pintura europeia', 'Começou com as compras de Catarina, a Grande, que mandava agente garimpar coleção pela Europa. E mantém gatos no porão há séculos, com status oficial, para manter rato longe das obras.']
})

T('Cultura', '📷', 'fotografia', 'A história da fotografia',
    'Da primeira imagem que levou horas para ficar pronta até a câmera dentro do bolso, a fotografia mudou menos por arte e mais por química e mecânica.',
    ['Quando', 'Quem', 'O que destravou'], {
    primeiraimagem: ['A primeira imagem fixada', 'por volta de 1826', 'Nicéphore Niépce', 'guardar a imagem em vez de só projetá-la', 'A exposição durou horas, apontada para o quintal de casa. Por isso o sol aparece iluminando os dois lados do pátio na mesma chapa: ele deu a volta enquanto a placa ainda gravava.'],
    daguerreotipo: ['Daguerreótipo', '1839', 'Louis Daguerre', 'retrato de pessoa virou possível', 'A França comprou a patente e liberou o processo para o mundo. Ainda assim a pose exigia minutos parado, com um suporte de ferro segurando a nuca, e é por isso que ninguém sorri em retrato antigo.'],
    kodak: ['A primeira Kodak', '1888', 'George Eastman', 'fotografia na mão de quem não é técnico', 'O anúncio prometia que você apertava o botão e a empresa fazia o resto. E era literal: mandava-se a câmera inteira pelo correio, e a fábrica revelava tudo e devolvia o aparelho já com filme novo.'],
    leica: ['A câmera de 35 milímetros', 'anos 1920', 'Oskar Barnack, na Leica', 'câmera pequena de carregar o dia todo', 'Ele pegou o filme que o cinema usava e enfiou numa caixinha de metal. Foi o que permitiu a fotografia de rua, feita andando, sem tripé, sem estúdio e sem pedir licença.'],
    filmecolorido: ['Filme colorido de uso geral', '1935', 'dois músicos contratados pela Kodak', 'cor confiável fora do laboratório', 'Leopold Mannes e Leopold Godowsky eram músicos profissionais que mexiam com química nas horas vagas. A Kodak, em vez de rir, contratou os dois e bancou a pesquisa até dar certo.'],
    digital: ['A primeira câmera digital', '1975', 'Steven Sasson, na Kodak', 'imagem sem filme nenhum', 'O protótipo pesava alguns quilos, gravava em fita cassete e levava quase meio minuto para registrar uma imagem em preto e branco. A direção engavetou o projeto, com medo de matar o próprio filme.']
})

T('Cultura', '🎪', 'teatromundial', 'O teatro através dos séculos',
    'Muito antes do cinema o teatro já tinha máscara que funcionava de megafone, ator improvisando de cabeça e casa que pegou fogo no meio do espetáculo.',
    ['Onde', 'Desde quando', 'Marca do palco'], {
    gregoantigo: ['Teatro grego antigo', 'Grécia', 'séculos 5 e 4 antes de Cristo', 'máscara, coro e plateia em curva na encosta', 'Era concurso religioso, com júri e prêmio para o melhor autor. Só homens subiam ao palco, e a máscara, além do personagem, ajudava a voz a chegar às fileiras lá no alto.'],
    teatrono: ['Teatro nô', 'Japão', 'século 14', 'máscara de madeira, gesto lento, palco vazio', 'O ofício passa de pai para filho dentro das mesmas famílias há séculos. Algumas máscaras usadas em cena hoje têm centenas de anos e são tratadas como instrumento de trabalho, não como peça de museu.'],
    commedia: ['Commedia dellarte', 'Itália', 'séculos 16 a 18', 'tipos fixos como Arlequim e Pantalone', 'Os atores não decoravam falas: decoravam situações e saídas engraçadas, e montavam a peça no susto a cada praça. Boa parte da comédia física do cinema mudo saiu direto dali.'],
    globe: ['O Globe de Shakespeare', 'Londres', 'por volta de 1600', 'palco cercado de plateia em pé, sem cenário', 'Pegou fogo durante uma apresentação, quando um canhão de efeito acendeu o telhado de palha. A reconstrução moderna fica a poucos metros de onde ficava a casa original.'],
    kabuki: ['Kabuki', 'Japão', 'século 17', 'maquiagem forte, passarela e giro de cena', 'Começou com uma mulher à frente do grupo. Depois de proibições sucessivas, passou a ser feito só por homens, inclusive nos papéis femininos, e assim seguiu até hoje.'],
    broadway: ['O musical da Broadway', 'Nova York', 'século 20', 'orquestra ao vivo e temporada sem data para acabar', 'O nome é o de uma avenida, mas o que define é o tamanho da casa e a região da cidade. Um título que lota pode ficar em cartaz por décadas, trocando o elenco inteiro várias vezes.']
})

T('Cultura', '👗', 'moda', 'A moda através das décadas',
    'A roupa conta o que estava acontecendo em volta: guerra, trabalho, protesto e até um carro pequeno deram nome ou forma a peças que todo mundo acabou usando.',
    ['Quando', 'Silhueta', 'Quem puxou'], {
    jeans: ['O jeans', 'do fim do século 19 em diante', 'calça de tecido grosso com rebite de metal', 'Levi Strauss e Jacob Davis', 'Nasceu como roupa de trabalho: o rebite existia para o bolso não rasgar com o peso da ferramenta. Foi o cinema que transformou aquilo em símbolo de rebeldia, décadas depois.'],
    anosvinte: ['A garçonne dos anos 1920', 'anos 1920', 'vestido reto, cintura baixa, barra no joelho', 'Coco Chanel, entre outras', 'Na mesma década a mulher cortou o cabelo curto e largou o espartilho. Chanel pegou o jérsei, tecido até então de roupa de baixo masculina, e fez vestido de rua com ele.'],
    newlook: ['O New Look', '1947', 'cintura bem marcada e saia rodada com muito pano', 'Christian Dior', 'Veio logo depois da guerra, quando tecido ainda era racionado em vários países. Teve protesto de mulheres na rua contra o desperdício de pano numa hora em que faltava tudo.'],
    minissaia: ['A minissaia', 'anos 1960', 'barra bem acima do joelho e corte geométrico', 'Mary Quant, em Londres', 'O nome veio do carro Mini, que ela adorava. A peça virou bandeira de uma geração que queria, antes de tudo, não se vestir como a mãe se vestia.'],
    punk: ['O visual punk', 'fim dos anos 1970', 'roupa rasgada, couro e alfinete de segurança', 'Vivienne Westwood e a loja de Londres', 'Era antimoda que virou moda em poucos anos. O alfinete começou como conserto improvisado de gente sem dinheiro e terminou costurado em peça de grife, vendida caro.'],
    anosoitenta: ['A ombreira dos anos 1980', 'anos 1980', 'ombro largo, cor berrante, corpo em triângulo', 'o guarda-roupa de trabalho feminino', 'A ombreira serviu para ocupar espaço numa sala de reunião cheia de homens. O terninho virou armadura, e quando a geração seguinte quis se opor, tirou a ombreira antes de qualquer outra coisa.']
})

T('Cultura', '🥇', 'olimpiadas', 'Os Jogos Olímpicos',
    'Os Jogos modernos foram inventados no fim do século 19 e desde então acumularam tocha, protesto no pódio, tragédia e uma edição inteira com arquibancada vazia.',
    ['Sede', 'Ano', 'O que marcou'], {
    atenas1896: ['Atenas', 'Atenas, na Grécia', '1896', 'os primeiros Jogos da era moderna', 'Só homens competiram, e o vencedor levava medalha de prata com um ramo de oliveira. A maratona foi criada ali, inspirada numa lenda grega que nunca fez parte dos Jogos da Antiguidade.'],
    berlim1936: ['Berlim', 'Berlim, na Alemanha', '1936', 'vitrine nazista e os quatro ouros de Jesse Owens', 'Foi a estreia do revezamento da tocha, ideia alemã que pegou e virou tradição no mundo inteiro. Owens, negro e americano, ganhou quatro provas diante da arquibancada que deveria celebrar o contrário.'],
    mexico1968: ['Cidade do México', 'Cidade do México', '1968', 'punhos erguidos no pódio dos 200 metros', 'A altitude sufocou as provas longas e favoreceu as de explosão. O salto em distância de Bob Beamon foi tão além do esperado que o aparelho de medição do estádio simplesmente não alcançava a marca.'],
    munique1972: ['Munique', 'Munique, na Alemanha', '1972', 'o atentado contra a delegação de Israel', 'Onze israelenses morreram depois de uma invasão à vila olímpica e um resgate que deu errado. Os Jogos pararam e foram retomados no dia seguinte, decisão que se discute até hoje.'],
    rio2016: ['Rio de Janeiro', 'Rio de Janeiro, no Brasil', '2016', 'primeira edição na América do Sul', 'Foi a primeira vez que uma equipe de refugiados desfilou, sem país, sob a bandeira olímpica. Atletas que tinham fugido de guerra entraram no estádio antes da delegação da casa.'],
    toquio2020: ['Tóquio', 'Tóquio, no Japão', 'disputados em 2021', 'Jogos sem público na arquibancada', 'Foram adiados um ano pela pandemia, mas mantiveram o nome de 2020 gravado nas medalhas. Atleta ganhou final mundial ouvindo o próprio passo, sem torcida, o que muitos descreveram como treino caro.']
}, 'anos das edições conforme o registro do Comitê Olímpico Internacional')

T('Cultura', '🤾', 'modalidades', 'Modalidades olímpicas pouco conhecidas',
    'No meio do programa olímpico existem provas que vieram de treino militar, de aposta legalizada e de brincadeira em cima do gelo de séculos atrás.',
    ['O que é', 'De onde veio', 'Detalhe que ninguém imagina'], {
    pentatlomoderno: ['Pentatlo moderno', 'cinco provas no mesmo dia, do tiro à corrida', 'criado pelo fundador dos Jogos modernos', 'o cavalo era sorteado na hora', 'A ideia era simular um mensageiro militar preso atrás das linhas inimigas: ele atira, esgrime, nada, cavalga e corre para entregar o recado. A parte do cavalo sorteado acabou revista depois de casos de maus-tratos.'],
    curling: ['Curling', 'pedra de granito deslizando no gelo', 'Escócia, desde o século 16', 'as pedras boas saem de uma só ilha', 'A vassoura não é enfeite: esquentar o gelo por um instante muda a rota da pedra. E o granito preferido vem de uma ilhota escocesa, porque é o que menos racha com o choque e a água.'],
    keirin: ['Keirin', 'ciclismo em que uma moto puxa o pelotão e sai', 'Japão, anos 1940', 'começou como esporte de aposta', 'Foi criado no pós-guerra como corrida de apostas legalizada, para levantar dinheiro. Os pilotos japoneses se formam em escola própria, com internato, horário rígido e prova de admissão.'],
    skeleton: ['Skeleton', 'descida de trenó de barriga e de cabeça', 'Suíça, fim do século 19', 'o rosto desce a centímetros do gelo', 'O nome veio da armação de metal do trenó, que lembrava um esqueleto. O atleta se joga de bruços e desce olhando a pista de perto, guiando com deslocamento de ombro e de joelho.'],
    biatlo: ['Biatlo', 'esqui de fundo alternado com tiro ao alvo', 'treino militar escandinavo', 'o inimigo é a própria pulsação', 'A dificuldade não é o alvo, é chegar ao estande com o coração disparado e ter que acertar entre uma batida e outra. Quem erra cumpre volta de punição e vê a prova escapar ali mesmo.'],
    marchaatletica: ['Marcha atlética', 'andar rápido sem perder contato com o chão', 'Inglaterra do século 19', 'quem julga é o olho humano', 'Juízes avaliam a olho nu se os dois pés saíram do chão ao mesmo tempo. Com três apontamentos, o atleta é desclassificado, e já houve quem entrasse liderando no estádio e fosse barrado na reta final.']
})

T('Cultura', '⚽', 'copas', 'As Copas do Mundo',
    'A Copa já teve viagem de navio de duas semanas, taça roubada, bola trocada no intervalo da final e gol de mão que o juiz não viu.',
    ['Sede', 'Ano', 'Campeão'], {
    copa1930: ['A primeira Copa', 'Uruguai', '1930', 'Uruguai', 'Quase nenhum time europeu foi, porque a viagem de navio levava semanas e ninguém queria perder o campeonato de casa. Na final, os dois lados brigaram sobre qual bola usar, e cada tempo foi jogado com uma delas.'],
    copa1950: ['A Copa do quadrangular final', 'Brasil', '1950', 'Uruguai', 'Não teve final marcada: o título saiu de um grupo decisivo, e ao Brasil bastava empatar diante de um Maracanã lotado. A derrota virou assunto permanente e volta à conversa toda vez que um favorito tropeça em casa.'],
    copa1958: ['A Copa da estreia de um garoto', 'Suécia', '1958', 'Brasil', 'Um jogador de dezessete anos entrou no time no meio do torneio e saiu campeão chorando no gramado. Foi a primeira vez que uma seleção sul-americana venceu jogando em solo europeu.'],
    copa1966: ['A Copa do cachorro Pickles', 'Inglaterra', '1966', 'Inglaterra', 'A taça foi roubada de uma exposição antes do torneio e quem achou o embrulho num jardim de Londres foi um cachorro. Na final, um gol que bateu no travessão e voltou é discutido até hoje.'],
    copa1986: ['A Copa dos dois gols de Maradona', 'México', '1986', 'Argentina', 'No mesmo jogo contra a Inglaterra saiu o gol feito com a mão, que o juiz não viu, e, poucos minutos depois, um gol driblando meio time. O México só sediou porque a Colômbia desistiu por falta de dinheiro.'],
    copa2022: ['A Copa do fim do ano', 'Catar', '2022', 'Argentina', 'Primeira no Oriente Médio e a única disputada em novembro e dezembro, porque no verão local o calor inviabilizava jogar. A final empatou em 3 a 3 e foi decidida nos pênaltis.']
}, 'anos de edição e campeões conforme o registro oficial da Fifa')

T('Cultura', '🏎️', 'automobilismo', 'O automobilismo e a Fórmula 1',
    'Correr de carro já foi coisa de gente que preferia ser arremessada a ficar presa pelo cinto, e boa parte das regras de hoje nasceu depois de uma tragédia.',
    ['O que é', 'Desde', 'Marca da prova'], {
    formula1: ['Fórmula 1', 'campeonato mundial de carros de corrida', '1950', 'etapas em vários países ao longo do ano', 'No começo muita gente corria sem cinto de propósito: achavam melhor ser arremessado que ficar preso num carro pegando fogo. O cinto só virou obrigatório quando o próprio carro passou a proteger quem ficava dentro.'],
    monaco: ['Grande Prêmio de Mônaco', 'corrida de rua dentro do principado', '1929', 'muro a centímetros e ultrapassagem quase impossível', 'O traçado atravessa um túnel embaixo de um hotel. O piloto sai do sol para o escuro em alta velocidade e o olho precisa se acertar sozinho, enquanto a mão segue corrigindo a direção.'],
    lemans: ['As 24 Horas de Le Mans', 'prova de resistência de um dia inteiro', '1923', 'revezamento de pilotos, de dia e de noite', 'Por décadas a largada era com os pilotos atravessando a pista correndo a pé até o carro. Acabou quando ficou evidente que muitos saíam sem afivelar o cinto só para ganhar alguns segundos.'],
    indy: ['As 500 Milhas de Indianápolis', 'prova em oval de alta velocidade', '1911', 'o vencedor bebe leite na comemoração', 'O leite virou tradição porque um vencedor dos anos 1930 pediu leitelho, por costume de infância, e a foto rodou o mundo. A pista ganhou apelido por ter sido calçada com milhões de tijolos.'],
    senna: ['Ayrton Senna', 'piloto brasileiro, tricampeão mundial', 'títulos entre 1988 e 1991', 'chuva e volta de classificação', 'Era tido como imbatível com pista molhada e em volta única, quando o carro anda no limite e não há tempo para pensar. A morte dele em Ímola, em 1994, forçou a maior revisão de segurança da história da categoria.'],
    schumacher: ['Michael Schumacher', 'piloto alemão, heptacampeão mundial', 'títulos entre 1994 e 2004', 'preparo físico e trabalho de equipe', 'Mudou a profissão ao tratar academia, dieta e reunião com os mecânicos como parte do trabalho, e não como firula. Levou anos para o resto do grid copiar essa rotina e encostar nele.']
})

T('Cultura', '♟️', 'xadrez', 'O xadrez e seus campeões',
    'A história do título mundial tem campeão que morreu pobre num asilo, campeão que morreu com a coroa na mão e um que largou a disputa no auge por tédio.',
    ['País', 'Época', 'Marca do jogo'], {
    steinitz: ['Wilhelm Steinitz', 'Áustria e Estados Unidos', 'fim do século 19', 'vantagem pequena acumulada com paciência', 'Foi o primeiro campeão mundial reconhecido e mudou o jogo ao pregar que ataque bonito sem base perde para posição bem construída. Apesar disso, terminou a vida pobre e doente, morando de favor.'],
    capablanca: ['José Raúl Capablanca', 'Cuba', 'começo do século 20', 'jogo simples, quase sem esforço aparente', 'Aprendeu vendo o pai jogar, ainda criança, e quase não estudava aberturas em livro. Chegou a emendar anos de competição sem perder uma única partida, o que ninguém mais repetiu daquele jeito.'],
    alekhine: ['Alexander Alekhine', 'Rússia e França', 'entre as duas guerras', 'combinação longa e ataque calculado', 'É o único campeão que morreu com o título nas mãos, sem nunca ter sido destronado. A federação precisou inventar um torneio especial para decidir quem herdaria a coroa vaga.'],
    fischer: ['Bobby Fischer', 'Estados Unidos', 'anos 1970', 'preparo obsessivo e nervo à flor da pele', 'Tomou o título de Spassky em 1972, no auge da Guerra Fria, praticamente sozinho contra a escola soviética inteira. Logo depois abandonou a competição e sumiu da vida pública por décadas.'],
    kasparov: ['Garry Kasparov', 'União Soviética e depois Rússia', 'anos 1980 e 1990', 'abertura preparada até o osso e agressão', 'Perdeu um confronto para o computador Deep Blue em 1997 e o mundo tratou aquilo como o dia em que a máquina passou o homem. Ele desconfiou de um lance estranho que, muito depois, se soube ter vindo de uma falha do programa.'],
    carlsen: ['Magnus Carlsen', 'Noruega', 'do fim dos anos 2000 em diante', 'final interminável em posição de empate', 'Ganha apertando o adversário em posições que qualquer um daria por empatada, até o outro errar de cansaço. Sendo campeão, abriu mão de defender o título, dizendo que a disputa tinha deixado de motivá-lo.']
})

/* ─────────────────────────── FIM DAS TABELAS ─────────────────────────── */

module.exports = { VIGENCIA_DADOS, TEMAS }
