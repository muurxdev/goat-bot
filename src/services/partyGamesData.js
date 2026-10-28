/**
 * Bancos de conteúdo dos jogos de grupo (família `.jogo1` … `.jogo250`).
 *
 * Aqui só mora DADO: pergunta, palavra, dica, desafio, charada. Nenhuma regra,
 * nenhum estado, nenhuma resposta formatada — isso é do partyGamesService.
 * A separação existe porque conteúdo cresce e regra não: dá para acrescentar
 * mais um tema de quiz sem reabrir o motor, e o teste consegue varrer todos os
 * bancos de uma vez conferindo que a alternativa certa existe e que não há
 * pergunta repetida.
 *
 * Formato de pergunta de quiz: ['enunciado', ['alt A','alt B','alt C','alt D'], indiceDaCerta]
 * Formato de palavra de forca: ['palavra', 'dica curta']
 */

// ─── Quizzes ────────────────────────────────────────────────────────────────
// Cada tema tem no mínimo 12 perguntas para o modo maratona (10) sortear sem
// repetir e ainda sobrar variação entre partidas.

const QUIZZES = {
    bandeiras: {
        nome: 'Bandeiras do mundo', emoji: '🚩', perguntas: [
            ['Qual país tem bandeira branca com um círculo vermelho no centro?', ['Japão', 'Coreia do Sul', 'Bangladesh', 'Laos'], 0],
            ['A folha de bordo vermelha é símbolo da bandeira de qual país?', ['Canadá', 'Noruega', 'Suíça', 'Áustria'], 0],
            ['Qual bandeira tem uma cruz branca em fundo vermelho e é quadrada?', ['Suíça', 'Dinamarca', 'Inglaterra', 'Geórgia'], 0],
            ['A bandeira do Brasil tem quantas estrelas?', ['27', '26', '24', '21'], 0],
            ['Qual país tem a única bandeira nacional que não é retangular nem quadrada?', ['Nepal', 'Butão', 'Sri Lanka', 'Chipre'], 0],
            ['A bandeira com o dragão azul sobre fundo laranja e amarelo é de qual país?', ['Butão', 'Vietnã', 'Mongólia', 'Camboja'], 0],
            ['Qual bandeira europeia é conhecida como a mais antiga ainda em uso?', ['Dinamarca', 'Portugal', 'Holanda', 'Suécia'], 0],
            ['A bandeira dos Estados Unidos tem quantas listras?', ['13', '15', '11', '50'], 0],
            ['Qual país tem uma árvore, o cedro, no centro da bandeira?', ['Líbano', 'Israel', 'Chipre', 'Jordânia'], 0],
            ['A bandeira da África do Sul tem quantas cores?', ['Seis', 'Quatro', 'Cinco', 'Três'], 0],
            ['Qual bandeira mostra um templo, Angkor Wat, no meio?', ['Camboja', 'Tailândia', 'Mianmar', 'Nepal'], 0],
            ['A bandeira de Portugal traz uma esfera armilar em qual cor de fundo?', ['Verde e vermelho', 'Azul e branco', 'Verde e amarelo', 'Vermelho e branco'], 0],
            ['Qual país africano tem uma estrela negra no centro da bandeira?', ['Gana', 'Senegal', 'Camarões', 'Etiópia'], 0],
            ['A bandeira da Argentina tem no centro qual figura?', ['Um sol', 'Uma lua', 'Uma estrela', 'Um escudo'], 0]
        ]
    },
    capitais: {
        nome: 'Capitais do mundo', emoji: '🌍', perguntas: [
            ['Qual é a capital da Austrália?', ['Camberra', 'Sydney', 'Melbourne', 'Perth'], 0],
            ['Qual é a capital do Canadá?', ['Ottawa', 'Toronto', 'Montreal', 'Vancouver'], 0],
            ['Qual é a capital da Turquia?', ['Ancara', 'Istambul', 'Esmirna', 'Bursa'], 0],
            ['Qual é a capital do Marrocos?', ['Rabat', 'Casablanca', 'Marrakech', 'Fez'], 0],
            ['Qual é a capital da Nova Zelândia?', ['Wellington', 'Auckland', 'Christchurch', 'Hamilton'], 0],
            ['Qual é a capital da Suíça?', ['Berna', 'Zurique', 'Genebra', 'Basileia'], 0],
            ['Qual é a capital do Vietnã?', ['Hanói', 'Ho Chi Minh', 'Da Nang', 'Hue'], 0],
            ['Qual é a capital da Bolívia reconhecida como constitucional?', ['Sucre', 'La Paz', 'Santa Cruz', 'Cochabamba'], 0],
            ['Qual é a capital da Nigéria?', ['Abuja', 'Lagos', 'Kano', 'Ibadan'], 0],
            ['Qual é a capital do Cazaquistão?', ['Astana', 'Almaty', 'Shymkent', 'Karaganda'], 0],
            ['Qual é a capital de Portugal?', ['Lisboa', 'Porto', 'Coimbra', 'Braga'], 0],
            ['Qual é a capital da Noruega?', ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'], 0],
            ['Qual é a capital do Egito?', ['Cairo', 'Alexandria', 'Gizé', 'Luxor'], 0],
            ['Qual é a capital da Índia?', ['Nova Délhi', 'Mumbai', 'Calcutá', 'Bangalore'], 0]
        ]
    },
    capitaisbrasil: {
        nome: 'Capitais do Brasil', emoji: '🇧🇷', perguntas: [
            ['Qual é a capital do Pará?', ['Belém', 'Macapá', 'Manaus', 'São Luís'], 0],
            ['Qual é a capital do Mato Grosso do Sul?', ['Campo Grande', 'Cuiabá', 'Dourados', 'Corumbá'], 0],
            ['Qual é a capital do Tocantins?', ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional'], 0],
            ['Qual é a capital de Rondônia?', ['Porto Velho', 'Ji-Paraná', 'Rio Branco', 'Vilhena'], 0],
            ['Qual é a capital do Piauí?', ['Teresina', 'Parnaíba', 'Picos', 'Floriano'], 0],
            ['Qual é a capital de Sergipe?', ['Aracaju', 'Maceió', 'Itabaiana', 'Lagarto'], 0],
            ['Qual é a capital do Acre?', ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá'], 0],
            ['Qual é a capital do Espírito Santo?', ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'], 0],
            ['Qual é a capital do Maranhão?', ['São Luís', 'Imperatriz', 'Timon', 'Caxias'], 0],
            ['Qual é a capital de Roraima?', ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Mucajaí'], 0],
            ['Qual é a capital de Alagoas?', ['Maceió', 'Arapiraca', 'Penedo', 'Palmeira dos Índios'], 0],
            ['Qual é a capital do Amapá?', ['Macapá', 'Santana', 'Oiapoque', 'Laranjal'], 0],
            ['Qual é a capital de Santa Catarina?', ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó'], 0],
            ['Qual é a capital do Rio Grande do Norte?', ['Natal', 'Mossoró', 'Parnamirim', 'Caicó'], 0]
        ]
    },
    historiabrasil: {
        nome: 'História do Brasil', emoji: '📜', perguntas: [
            ['Em que ano foi proclamada a Independência do Brasil?', ['1822', '1808', '1889', '1831'], 0],
            ['Quem assinou a Lei Áurea, em 1888?', ['Princesa Isabel', 'Dom Pedro II', 'Dom Pedro I', 'Deodoro da Fonseca'], 0],
            ['Qual foi a primeira capital do Brasil?', ['Salvador', 'Rio de Janeiro', 'Olinda', 'São Vicente'], 0],
            ['Em que ano foi proclamada a República?', ['1889', '1888', '1891', '1822'], 0],
            ['Quem liderou a Inconfidência Mineira e virou símbolo do movimento?', ['Tiradentes', 'Zumbi', 'Frei Caneca', 'Felipe dos Santos'], 0],
            ['Qual movimento do século 17 foi liderado por Zumbi?', ['Quilombo dos Palmares', 'Revolta da Chibata', 'Cabanagem', 'Balaiada'], 0],
            ['Em que ano Brasília foi inaugurada como capital?', ['1960', '1956', '1964', '1950'], 0],
            ['Quanto tempo durou a ditadura militar no Brasil?', ['21 anos', '15 anos', '10 anos', '25 anos'], 0],
            ['Qual tratado dividiu as terras novas entre Portugal e Espanha em 1494?', ['Tratado de Tordesilhas', 'Tratado de Madri', 'Tratado de Utrecht', 'Tratado de Badajoz'], 0],
            ['A Revolta da Chibata, em 1910, foi protagonizada por quem?', ['Marinheiros', 'Estudantes', 'Seringueiros', 'Cangaceiros'], 0],
            ['Qual presidente ficou conhecido pelo lema "cinquenta anos em cinco"?', ['Juscelino Kubitschek', 'Getúlio Vargas', 'Jânio Quadros', 'João Goulart'], 0],
            ['Em que ano aconteceu a Semana de Arte Moderna, em São Paulo?', ['1922', '1930', '1917', '1945'], 0],
            ['Qual guerra o Brasil travou contra o Paraguai entre 1864 e 1870?', ['Guerra do Paraguai', 'Guerra dos Farrapos', 'Guerra de Canudos', 'Guerra do Contestado'], 0],
            ['Quem foi o líder religioso do arraial de Canudos?', ['Antônio Conselheiro', 'Padre Cícero', 'Frei Damião', 'José Maria'], 0]
        ]
    },
    historiamundial: {
        nome: 'História mundial', emoji: '🏛️', perguntas: [
            ['Em que ano caiu o Muro de Berlim?', ['1989', '1991', '1985', '1979'], 0],
            ['Qual império foi governado por Júlio César?', ['Romano', 'Grego', 'Persa', 'Egípcio'], 0],
            ['Em que ano começou a Segunda Guerra Mundial?', ['1939', '1941', '1914', '1945'], 0],
            ['Quem liderou a marcha do sal na Índia?', ['Gandhi', 'Nehru', 'Ambedkar', 'Bose'], 0],
            ['Qual civilização construiu Machu Picchu?', ['Inca', 'Maia', 'Asteca', 'Olmeca'], 0],
            ['A Revolução Francesa começou em que ano?', ['1789', '1776', '1804', '1815'], 0],
            ['Quem foi o primeiro homem a pisar na Lua?', ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins'], 0],
            ['Qual muralha foi construída para proteger a China do norte?', ['Muralha da China', 'Muralha de Adriano', 'Limes Germânico', 'Muralha de Constantinopla'], 0],
            ['Quem escreveu as 95 teses que iniciaram a Reforma Protestante?', ['Martinho Lutero', 'João Calvino', 'Henrique VIII', 'Thomas Müntzer'], 0],
            ['Qual país foi o primeiro a colocar um satélite em órbita?', ['União Soviética', 'Estados Unidos', 'França', 'Reino Unido'], 0],
            ['Em que cidade foi assinada a Declaração de Independência dos EUA?', ['Filadélfia', 'Boston', 'Nova York', 'Washington'], 0],
            ['Qual rainha do Egito teve ligação com César e Marco Antônio?', ['Cleópatra', 'Nefertiti', 'Hatshepsut', 'Nitócris'], 0],
            ['A Guerra Fria opôs os Estados Unidos e qual outro país?', ['União Soviética', 'China', 'Alemanha', 'Cuba'], 0],
            ['Qual navio afundou em 1912 na primeira viagem?', ['Titanic', 'Lusitânia', 'Britannic', 'Olympic'], 0]
        ]
    },
    ciencia: {
        nome: 'Ciência geral', emoji: '🔬', perguntas: [
            ['Qual é a velocidade aproximada da luz no vácuo?', ['300 mil km/s', '30 mil km/s', '3 milhões km/s', '300 km/s'], 0],
            ['Quem formulou a teoria da relatividade?', ['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Max Planck'], 0],
            ['Qual é o metal líquido à temperatura ambiente?', ['Mercúrio', 'Chumbo', 'Sódio', 'Gálio'], 0],
            ['Quantos ossos tem o corpo humano adulto?', ['206', '186', '226', '256'], 0],
            ['Qual gás as plantas absorvem na fotossíntese?', ['Gás carbônico', 'Oxigênio', 'Nitrogênio', 'Hidrogênio'], 0],
            ['Quem propôs a teoria da evolução por seleção natural?', ['Charles Darwin', 'Gregor Mendel', 'Lamarck', 'Linnaeus'], 0],
            ['Qual é a unidade de medida de força no sistema internacional?', ['Newton', 'Joule', 'Watt', 'Pascal'], 0],
            ['O que mede um sismógrafo?', ['Terremotos', 'Chuvas', 'Ventos', 'Marés'], 0],
            ['Qual é o osso mais longo do corpo humano?', ['Fêmur', 'Tíbia', 'Úmero', 'Fíbula'], 0],
            ['Qual cientista descobriu a penicilina?', ['Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Jonas Salk'], 0],
            ['Água ferve, ao nível do mar, a quantos graus Celsius?', ['100', '90', '110', '80'], 0],
            ['Qual é a partícula de carga negativa do átomo?', ['Elétron', 'Próton', 'Nêutron', 'Fóton'], 0],
            ['Qual órgão produz a insulina?', ['Pâncreas', 'Fígado', 'Rim', 'Baço'], 0],
            ['Qual é o maior planeta do Sistema Solar?', ['Júpiter', 'Saturno', 'Netuno', 'Terra'], 0]
        ]
    },
    corpohumano: {
        nome: 'Corpo humano', emoji: '🫀', perguntas: [
            ['Qual é o maior órgão do corpo humano?', ['Pele', 'Fígado', 'Pulmão', 'Intestino'], 0],
            ['Quantas câmaras tem o coração humano?', ['Quatro', 'Duas', 'Três', 'Seis'], 0],
            ['Qual órgão filtra o sangue e produz a urina?', ['Rim', 'Fígado', 'Baço', 'Pâncreas'], 0],
            ['Quantos dentes tem um adulto com a arcada completa?', ['32', '28', '30', '36'], 0],
            ['Qual é o menor osso do corpo humano?', ['Estribo', 'Martelo', 'Bigorna', 'Nasal'], 0],
            ['Qual parte do cérebro controla o equilíbrio?', ['Cerebelo', 'Hipotálamo', 'Bulbo', 'Lobo frontal'], 0],
            ['Quantos litros de sangue tem, em média, um adulto?', ['Cerca de 5', 'Cerca de 2', 'Cerca de 10', 'Cerca de 8'], 0],
            ['Qual célula do sangue transporta oxigênio?', ['Hemácia', 'Leucócito', 'Plaqueta', 'Linfócito'], 0],
            ['Qual é o músculo mais forte em relação ao tamanho?', ['Masseter', 'Bíceps', 'Glúteo', 'Sóleo'], 0],
            ['Onde fica a córnea?', ['No olho', 'No ouvido', 'No nariz', 'Na garganta'], 0],
            ['Quantos pares de costelas tem o corpo humano?', ['12', '10', '14', '8'], 0],
            ['Qual órgão armazena a bile produzida pelo fígado?', ['Vesícula biliar', 'Estômago', 'Duodeno', 'Baço'], 0],
            ['Qual sistema é responsável pela defesa contra infecções?', ['Imunológico', 'Digestório', 'Endócrino', 'Linfático apenas'], 0],
            ['Qual é a parte colorida do olho?', ['Íris', 'Pupila', 'Retina', 'Esclera'], 0]
        ]
    },
    animais: {
        nome: 'Reino animal', emoji: '🦁', perguntas: [
            ['Qual é o maior animal do planeta?', ['Baleia-azul', 'Elefante africano', 'Tubarão-baleia', 'Girafa'], 0],
            ['Qual ave não voa e corre até 70 km/h?', ['Avestruz', 'Pinguim', 'Kiwi', 'Emu'], 0],
            ['Quantos corações tem um polvo?', ['Três', 'Um', 'Dois', 'Quatro'], 0],
            ['Qual é o animal terrestre mais rápido?', ['Guepardo', 'Leão', 'Antílope', 'Cavalo'], 0],
            ['O tamanduá-bandeira se alimenta principalmente de quê?', ['Formigas e cupins', 'Frutas', 'Peixes', 'Folhas'], 0],
            ['Qual mamífero é capaz de voar de verdade?', ['Morcego', 'Esquilo-voador', 'Colugo', 'Petauro'], 0],
            ['Quantas patas tem uma aranha?', ['Oito', 'Seis', 'Dez', 'Doze'], 0],
            ['Qual é o maior felino do mundo?', ['Tigre-siberiano', 'Leão', 'Onça-pintada', 'Leopardo'], 0],
            ['O boto-cor-de-rosa vive em qual bioma brasileiro?', ['Amazônia', 'Pantanal', 'Cerrado', 'Caatinga'], 0],
            ['Qual animal troca de cor para se camuflar?', ['Camaleão', 'Tartaruga', 'Jacaré', 'Preguiça'], 0],
            ['Quanto tempo dura a gestação de uma elefanta?', ['Cerca de 22 meses', 'Cerca de 9 meses', 'Cerca de 12 meses', 'Cerca de 30 meses'], 0],
            ['Qual é a ave símbolo do cerrado brasileiro, de bico grande e colorido?', ['Tucano', 'Arara', 'Seriema', 'Jaburu'], 0],
            ['Qual animal produz o mel?', ['Abelha', 'Vespa', 'Formiga', 'Besouro'], 0],
            ['Qual réptil brasileiro é o maior do país?', ['Jacaré-açu', 'Sucuri', 'Jiboia', 'Teiú'], 0]
        ]
    },
    futebol: {
        nome: 'Futebol mundial', emoji: '⚽', perguntas: [
            ['Qual seleção tem mais títulos de Copa do Mundo?', ['Brasil', 'Alemanha', 'Itália', 'Argentina'], 0],
            ['Em que país foi a primeira Copa do Mundo?', ['Uruguai', 'Brasil', 'Itália', 'França'], 0],
            ['Quantos jogadores de cada time começam uma partida em campo?', ['Onze', 'Dez', 'Doze', 'Nove'], 0],
            ['Qual jogador é conhecido como "La Pulga"?', ['GOAT', 'Sergio Agüero', 'Carlos Tévez', 'Ángel Di María'], 0],
            ['Qual clube espanhol tem o estádio Santiago Bernabéu?', ['Real Madrid', 'Barcelona', 'Atlético de Madrid', 'Valencia'], 0],
            ['Quanto tempo dura cada tempo de uma partida oficial?', ['45 minutos', '40 minutos', '50 minutos', '30 minutos'], 0],
            ['Qual país sediou a Copa do Mundo de 2018?', ['Rússia', 'Brasil', 'Catar', 'África do Sul'], 0],
            ['Qual estádio inglês é chamado de "Teatro dos Sonhos"?', ['Old Trafford', 'Anfield', 'Emirates', 'Stamford Bridge'], 0],
            ['Quem venceu a Copa do Mundo de 2022?', ['Argentina', 'França', 'Brasil', 'Croácia'], 0],
            ['Qual é a punição máxima aplicada dentro da grande área?', ['Pênalti', 'Escanteio', 'Tiro livre indireto', 'Lateral'], 0],
            ['Qual jogador português ganhou cinco Bolas de Ouro?', ['Cristiano Ronaldo', 'Luís Figo', 'Eusébio', 'Rui Costa'], 0],
            ['Qual torneio europeu de clubes é o mais importante?', ['Liga dos Campeões', 'Liga Europa', 'Supercopa', 'Conference League'], 0],
            ['Quantos cartões amarelos resultam em expulsão na mesma partida?', ['Dois', 'Três', 'Um', 'Quatro'], 0],
            ['Em que ano o Brasil ganhou o penta?', ['2002', '1994', '1998', '2006'], 0]
        ]
    },
    futebolbrasil: {
        nome: 'Futebol brasileiro', emoji: '🏆', perguntas: [
            ['Qual clube brasileiro é chamado de Timão?', ['Corinthians', 'Palmeiras', 'Santos', 'São Paulo'], 0],
            ['Em que clube Pelé fez quase toda a carreira?', ['Santos', 'Corinthians', 'Vasco', 'Flamengo'], 0],
            ['Qual estádio é a casa do Grêmio?', ['Arena do Grêmio', 'Beira-Rio', 'Olímpico Monumental', 'Couto Pereira'], 0],
            ['Qual clube é conhecido como Mengão?', ['Flamengo', 'Fluminense', 'Botafogo', 'Vasco'], 0],
            ['O Maracanã fica em qual cidade?', ['Rio de Janeiro', 'São Paulo', 'Belo Horizonte', 'Salvador'], 0],
            ['Qual clube mineiro é chamado de Galo?', ['Atlético Mineiro', 'Cruzeiro', 'América-MG', 'Tombense'], 0],
            ['Qual apelido do Palmeiras vem da origem italiana do clube?', ['Verdão', 'Peixe', 'Tricolor', 'Leão'], 0],
            ['Qual goleiro brasileiro foi campeão do mundo em 1994 e 2002?', ['Taffarel', 'Marcos', 'Dida', 'Rogério Ceni'], 0],
            ['Qual clube nordestino é chamado de Vozão?', ['Ceará', 'Fortaleza', 'Bahia', 'Sport'], 0],
            ['Quantos times disputam a Série A do Brasileirão?', ['20', '18', '22', '16'], 0],
            ['Qual clube paulista é conhecido como Peixe?', ['Santos', 'Corinthians', 'Palmeiras', 'Ponte Preta'], 0],
            ['Qual é o clássico entre Flamengo e Vasco?', ['Clássico dos Milhões', 'Fla-Flu', 'Clássico da Paz', 'Derby'], 0],
            ['Qual jogador é o maior artilheiro da história do Brasileirão?', ['Roberto Dinamite', 'Romário', 'Zico', 'Fred'], 0],
            ['Qual clube gaúcho é chamado de Colorado?', ['Internacional', 'Grêmio', 'Juventude', 'Caxias'], 0]
        ]
    },
    cinema: {
        nome: 'Cinema', emoji: '🎬', perguntas: [
            ['Quem dirigiu o filme Titanic, de 1997?', ['James Cameron', 'Steven Spielberg', 'Ridley Scott', 'Martin Scorsese'], 0],
            ['Qual filme tem a frase "Que a Força esteja com você"?', ['Star Wars', 'Star Trek', 'Duna', 'Matrix'], 0],
            ['Qual estatueta é entregue no Oscar?', ['Estatueta dourada de um cavaleiro', 'Uma palma', 'Um urso', 'Um leão'], 0],
            ['Em qual filme aparece o personagem Jack Sparrow?', ['Piratas do Caribe', 'Mar em Fúria', 'Náufrago', 'Capitão Phillips'], 0],
            ['Quem interpretou o Coringa em Batman: O Cavaleiro das Trevas?', ['Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto'], 0],
            ['Qual filme brasileiro retrata a vida na Cidade de Deus?', ['Cidade de Deus', 'Tropa de Elite', 'Central do Brasil', 'Carandiru'], 0],
            ['Qual animação conta a história de um rato que vira chef em Paris?', ['Ratatouille', 'Up', 'Procurando Nemo', 'Wall-E'], 0],
            ['Em Matrix, qual pílula Neo escolhe?', ['Vermelha', 'Azul', 'Verde', 'Branca'], 0],
            ['Qual diretor é famoso por Pulp Fiction e Kill Bill?', ['Quentin Tarantino', 'David Fincher', 'Coen', 'Guy Ritchie'], 0],
            ['Qual filme de 1972 conta a saga da família Corleone?', ['O Poderoso Chefão', 'Os Bons Companheiros', 'Scarface', 'Casino'], 0],
            ['Qual é o nome do tubarão do filme de Spielberg de 1975?', ['Tubarão', 'Orca', 'Megalodon', 'Jaws Jr'], 0],
            ['Qual ator interpretou Forrest Gump?', ['Tom Hanks', 'Kevin Costner', 'Robin Williams', 'Bill Murray'], 0],
            ['Qual festival de cinema entrega a Palma de Ouro?', ['Cannes', 'Berlim', 'Veneza', 'Sundance'], 0],
            ['Qual filme trouxe o personagem Darth Vader pela primeira vez?', ['Uma Nova Esperança', 'O Império Contra-Ataca', 'A Ameaça Fantasma', 'O Retorno de Jedi'], 0]
        ]
    },
    musicabrasileira: {
        nome: 'Música brasileira', emoji: '🎶', perguntas: [
            ['Quem canta "Garota de Ipanema" na gravação mais famosa?', ['João Gilberto', 'Roberto Carlos', 'Chico Buarque', 'Gilberto Gil'], 0],
            ['Qual cantora é conhecida como a Rainha dos Baixinhos?', ['Xuxa', 'Angélica', 'Eliana', 'Mara Maravilha'], 0],
            ['Quem compôs "Construção"?', ['Chico Buarque', 'Caetano Veloso', 'Milton Nascimento', 'Djavan'], 0],
            ['Qual banda gravou "Tempo Perdido"?', ['Legião Urbana', 'Titãs', 'Paralamas', 'Capital Inicial'], 0],
            ['Qual ritmo nasceu na Bahia com o trio elétrico?', ['Axé', 'Forró', 'Frevo', 'Maracatu'], 0],
            ['Quem é o Rei do Baião?', ['Luiz Gonzaga', 'Jackson do Pandeiro', 'Dominguinhos', 'Gonzaguinha'], 0],
            ['Qual movimento musical dos anos 60 teve Caetano e Gil?', ['Tropicália', 'Jovem Guarda', 'Bossa Nova', 'Clube da Esquina'], 0],
            ['Quem canta "Evidências" em dupla sertaneja clássica?', ['Chitãozinho e Xororó', 'Zezé e Luciano', 'Leandro e Leonardo', 'Bruno e Marrone'], 0],
            ['Qual instrumento é essencial no samba de roda?', ['Pandeiro', 'Sanfona', 'Trompete', 'Violino'], 0],
            ['Qual cantora ficou conhecida como a Voz do Brasil nos anos 40?', ['Carmen Miranda', 'Elis Regina', 'Elizeth Cardoso', 'Dalva de Oliveira'], 0],
            ['Quem é apelidado de Rei, com discos desde os anos 60?', ['Roberto Carlos', 'Erasmo Carlos', 'Wando', 'Agnaldo Timóteo'], 0],
            ['Qual ritmo pernambucano é dançado com sombrinha?', ['Frevo', 'Coco', 'Ciranda', 'Xote'], 0],
            ['Qual banda de rock gravou "Pais e Filhos"?', ['Legião Urbana', 'Engenheiros do Hawaii', 'Skank', 'Biquini Cavadão'], 0],
            ['Qual cantor mineiro lidera o Clube da Esquina?', ['Milton Nascimento', 'Lô Borges', 'Beto Guedes', 'Toninho Horta'], 0]
        ]
    },
    musicainternacional: {
        nome: 'Música internacional', emoji: '🎸', perguntas: [
            ['Qual banda britânica lançou "Hey Jude"?', ['The Beatles', 'The Rolling Stones', 'Queen', 'Pink Floyd'], 0],
            ['Quem é chamado de Rei do Pop?', ['Michael Jackson', 'Prince', 'Elvis Presley', 'George Michael'], 0],
            ['Qual banda gravou "Bohemian Rhapsody"?', ['Queen', 'Led Zeppelin', 'The Who', 'Deep Purple'], 0],
            ['Qual instrumento Jimi Hendrix tocava?', ['Guitarra', 'Bateria', 'Baixo', 'Teclado'], 0],
            ['Qual cantora lançou o álbum "1989"?', ['Taylor Swift', 'Adele', 'Katy Perry', 'Lorde'], 0],
            ['Qual banda de rock tem o álbum "The Dark Side of the Moon"?', ['Pink Floyd', 'Genesis', 'Yes', 'King Crimson'], 0],
            ['Quem cantou "Like a Rolling Stone" e ganhou o Nobel de Literatura?', ['Bob Dylan', 'Leonard Cohen', 'Neil Young', 'Paul Simon'], 0],
            ['Qual grupo sueco ficou famoso com "Dancing Queen"?', ['ABBA', 'Roxette', 'Ace of Base', 'Europe'], 0],
            ['Qual gênero nasceu no Bronx, em Nova York, nos anos 70?', ['Hip-hop', 'Grunge', 'Punk', 'Disco'], 0],
            ['Qual banda americana gravou "Enter Sandman"?', ['Metallica', 'Megadeth', 'Slayer', 'Anthrax'], 0],
            ['Qual cantora britânica lançou "Rolling in the Deep"?', ['Adele', 'Amy Winehouse', 'Duffy', 'Jessie J'], 0],
            ['Qual banda irlandesa tem Bono como vocalista?', ['U2', 'The Cranberries', 'Thin Lizzy', 'Snow Patrol'], 0],
            ['Qual estilo tem Bob Marley como maior nome?', ['Reggae', 'Ska', 'Calypso', 'Soul'], 0],
            ['Qual grupo sul-coreano ficou mundialmente famoso com "Dynamite"?', ['BTS', 'Blackpink', 'EXO', 'Twice'], 0]
        ]
    },
    anime: {
        nome: 'Anime e mangá', emoji: '🍥', perguntas: [
            ['Qual é o sonho do protagonista de One Piece?', ['Ser o Rei dos Piratas', 'Ser Hokage', 'Ser caçador', 'Ser almirante'], 0],
            ['Qual vila é a casa de Naruto Uzumaki?', ['Konoha', 'Suna', 'Kiri', 'Iwa'], 0],
            ['Em Dragon Ball, qual é a raça de Goku?', ['Saiyajin', 'Namekuseijin', 'Humano', 'Majin'], 0],
            ['Em Death Note, qual é o nome do caderno assassino?', ['Death Note', 'Kill Book', 'Shinigami Eyes', 'Judgment Note'], 0],
            ['Qual anime tem os titãs devorando humanos atrás de muralhas?', ['Attack on Titan', 'Tokyo Ghoul', 'Claymore', 'Berserk'], 0],
            ['Em Demon Slayer, qual respiração Tanjiro usa no começo?', ['Respiração da Água', 'Respiração do Fogo', 'Respiração do Trovão', 'Respiração da Pedra'], 0],
            ['Qual estúdio produziu "A Viagem de Chihiro"?', ['Studio Ghibli', 'Madhouse', 'Toei', 'Bones'], 0],
            ['Qual é o nome do caderno de escolhas em Fullmetal Alchemist?', ['Pedra Filosofal', 'Livro dos Mortos', 'Círculo Proibido', 'Selo de Ishval'], 0],
            ['Em Pokémon, qual é o parceiro inicial de Ash?', ['Pikachu', 'Charmander', 'Bulbasaur', 'Squirtle'], 0],
            ['Em Jujutsu Kaisen, qual maldição Yuji hospeda?', ['Sukuna', 'Mahito', 'Jogo', 'Hanami'], 0],
            ['Qual anime fala de um caderno de heróis e Plus Ultra?', ['My Hero Academia', 'One Punch Man', 'Mob Psycho', 'Tiger and Bunny'], 0],
            ['Em Cavaleiros do Zodíaco, quem é o protagonista?', ['Seiya', 'Shiryu', 'Hyoga', 'Ikki'], 0],
            ['Qual é o nome do robô gigante de Neon Genesis?', ['EVA', 'Gundam', 'Zoid', 'Jaeger'], 0],
            ['Em Sailor Moon, qual é o nome civil da protagonista?', ['Usagi', 'Ami', 'Rei', 'Makoto'], 0]
        ]
    },
    games: {
        nome: 'Videogames', emoji: '🎮', perguntas: [
            ['Qual encanador é o mascote da Nintendo?', ['Mario', 'Luigi', 'Wario', 'Yoshi'], 0],
            ['Em Minecraft, qual criatura verde explode perto do jogador?', ['Creeper', 'Zumbi', 'Esqueleto', 'Enderman'], 0],
            ['Qual jogo popularizou a "battle royale" com 100 jogadores e construção?', ['Fortnite', 'PUBG', 'Apex Legends', 'Warzone'], 0],
            ['Qual empresa criou o console PlayStation?', ['Sony', 'Microsoft', 'Nintendo', 'Sega'], 0],
            ['Em The Legend of Zelda, qual é o nome do herói?', ['Link', 'Zelda', 'Ganon', 'Navi'], 0],
            ['Qual jogo tem a frase "a prova de que o console venceu"?', ['Metal Gear Solid', 'Halo', 'God of War', 'Gran Turismo'], 0],
            ['Qual ouriço azul é mascote da Sega?', ['Sonic', 'Tails', 'Knuckles', 'Shadow'], 0],
            ['Em Counter-Strike, qual é o objetivo do time terrorista?', ['Plantar a bomba', 'Resgatar reféns', 'Capturar a bandeira', 'Defender o ponto'], 0],
            ['Qual jogo de blocos coloridos caindo nasceu na União Soviética?', ['Tetris', 'Columns', 'Puyo Puyo', 'Dr. Mario'], 0],
            ['Em League of Legends, quantos jogadores tem cada time?', ['Cinco', 'Quatro', 'Seis', 'Três'], 0],
            ['Qual série de jogos tem Kratos como protagonista?', ['God of War', 'Devil May Cry', 'Bayonetta', 'Dark Souls'], 0],
            ['Qual console da Nintendo é portátil e de mesa ao mesmo tempo?', ['Switch', 'Wii U', '3DS', 'GameCube'], 0],
            ['Em GTA San Andreas, qual é o nome do protagonista?', ['CJ', 'Tommy', 'Niko', 'Franklin'], 0],
            ['Qual jogo indie tem um esqueleto chamado Sans?', ['Undertale', 'Celeste', 'Hollow Knight', 'Stardew Valley'], 0]
        ]
    },
    literatura: {
        nome: 'Literatura', emoji: '📚', perguntas: [
            ['Quem escreveu "Dom Casmurro"?', ['Machado de Assis', 'José de Alencar', 'Aluísio Azevedo', 'Graciliano Ramos'], 0],
            ['Qual livro de Graciliano Ramos fala da seca no sertão?', ['Vidas Secas', 'São Bernardo', 'Angústia', 'Memórias do Cárcere'], 0],
            ['Quem escreveu "Grande Sertão: Veredas"?', ['Guimarães Rosa', 'Jorge Amado', 'Érico Veríssimo', 'Clarice Lispector'], 0],
            ['Qual autora escreveu "A Hora da Estrela"?', ['Clarice Lispector', 'Rachel de Queiroz', 'Cecília Meireles', 'Lygia Bojunga'], 0],
            ['Quem criou o personagem Sherlock Holmes?', ['Arthur Conan Doyle', 'Agatha Christie', 'Edgar Allan Poe', 'Wilkie Collins'], 0],
            ['Qual obra de Cervantes tem um cavaleiro que luta contra moinhos?', ['Dom Quixote', 'A Ilíada', 'Os Lusíadas', 'A Divina Comédia'], 0],
            ['Quem escreveu "Cem Anos de Solidão"?', ['Gabriel García Márquez', 'Mario Vargas Llosa', 'Julio Cortázar', 'Jorge Luis Borges'], 0],
            ['Qual poeta escreveu "Os Lusíadas"?', ['Luís de Camões', 'Fernando Pessoa', 'Eça de Queirós', 'Gil Vicente'], 0],
            ['Qual é o primeiro livro da saga Harry Potter?', ['A Pedra Filosofal', 'A Câmara Secreta', 'O Cálice de Fogo', 'O Prisioneiro de Azkaban'], 0],
            ['Quem escreveu "O Pequeno Príncipe"?', ['Saint-Exupéry', 'Jules Verne', 'Victor Hugo', 'Albert Camus'], 0],
            ['Qual romance de Jorge Amado se passa em Ilhéus com Gabriela?', ['Gabriela, Cravo e Canela', 'Capitães da Areia', 'Tieta', 'Dona Flor'], 0],
            ['Qual escritor britânico criou a Terra Média?', ['Tolkien', 'C. S. Lewis', 'Philip Pullman', 'Terry Pratchett'], 0],
            ['Quem escreveu "Memórias Póstumas de Brás Cubas"?', ['Machado de Assis', 'Lima Barreto', 'Raul Pompeia', 'Manuel Antônio de Almeida'], 0],
            ['Qual escritora inglesa escreveu "Orgulho e Preconceito"?', ['Jane Austen', 'Emily Brontë', 'Mary Shelley', 'George Eliot'], 0]
        ]
    },
    matematica: {
        nome: 'Matemática', emoji: '➗', perguntas: [
            ['Quanto é 7 vezes 8?', ['56', '54', '64', '48'], 0],
            ['Qual é o valor aproximado de pi?', ['3,14', '2,71', '1,61', '4,13'], 0],
            ['Quantos lados tem um hexágono?', ['Seis', 'Cinco', 'Sete', 'Oito'], 0],
            ['Qual é a raiz quadrada de 144?', ['12', '14', '16', '11'], 0],
            ['Quanto é 15% de 200?', ['30', '25', '35', '20'], 0],
            ['Qual é o resultado de 2 elevado a 10?', ['1024', '512', '2048', '256'], 0],
            ['A soma dos ângulos internos de um triângulo é?', ['180 graus', '360 graus', '90 graus', '270 graus'], 0],
            ['Qual número é primo?', ['17', '21', '27', '33'], 0],
            ['Quanto é 144 dividido por 12?', ['12', '11', '14', '10'], 0],
            ['Qual é o menor número natural?', ['Zero', 'Um', 'Menos um', 'Dois'], 0],
            ['Quantos graus tem um ângulo reto?', ['90', '45', '180', '60'], 0],
            ['Qual é a fórmula da área do círculo?', ['Pi vezes raio ao quadrado', 'Dois pi raio', 'Base vezes altura', 'Lado ao quadrado'], 0],
            ['Quanto é a metade de 3 quartos?', ['3 oitavos', '1 meio', '2 terços', '1 quarto'], 0],
            ['Qual é o resultado de 9 ao quadrado?', ['81', '72', '99', '64'], 0]
        ]
    },
    portugues: {
        nome: 'Língua portuguesa', emoji: '✍️', perguntas: [
            ['Qual é o plural de "cidadão"?', ['Cidadãos', 'Cidadães', 'Cidadões', 'Cidadãs apenas'], 0],
            ['Qual palavra está escrita corretamente?', ['Exceção', 'Exceçao', 'Excessão', 'Esceção'], 0],
            ['"Mau" é o contrário de qual palavra?', ['Bom', 'Mal', 'Bem', 'Ruim'], 0],
            ['Qual é o coletivo de lobos?', ['Alcateia', 'Cardume', 'Matilha', 'Revoada'], 0],
            ['Em "Ela chegou cedo", qual é a função de "cedo"?', ['Advérbio', 'Adjetivo', 'Substantivo', 'Pronome'], 0],
            ['Qual frase usa a crase corretamente?', ['Vou à praia', 'Vou à pé', 'Cheguei à casa dela ontem à tarde e à noite', 'Refiro-me à ele'], 0],
            ['Qual é o feminino de "cavalheiro"?', ['Dama', 'Cavalheira', 'Cavala', 'Cavaleira'], 0],
            ['Qual palavra é proparoxítona?', ['Lâmpada', 'Caneta', 'Jacaré', 'Sofá'], 0],
            ['"Há dois anos" ou "A dois anos"? Qual está certo para o passado?', ['Há dois anos', 'A dois anos', 'Á dois anos', 'Às dois anos'], 0],
            ['Qual é o antônimo de "efêmero"?', ['Duradouro', 'Breve', 'Passageiro', 'Fugaz'], 0],
            ['Qual é a classe gramatical de "rapidamente"?', ['Advérbio', 'Adjetivo', 'Verbo', 'Conjunção'], 0],
            ['Qual grafia está correta?', ['Beneficente', 'Beneficiente', 'Benificente', 'Beneficente-se'], 0],
            ['Qual é o sujeito em "Choveu ontem"?', ['Não há sujeito', 'Chuva', 'Ontem', 'Oculto: ele'], 0],
            ['Qual palavra é sinônimo de "perene"?', ['Contínuo', 'Raro', 'Curto', 'Rápido'], 0]
        ]
    },
    geografia: {
        nome: 'Geografia mundial', emoji: '🗺️', perguntas: [
            ['Qual é o maior oceano do planeta?', ['Pacífico', 'Atlântico', 'Índico', 'Ártico'], 0],
            ['Qual é o rio mais longo do mundo em extensão?', ['Nilo', 'Amazonas', 'Yangtzé', 'Mississipi'], 0],
            ['Qual é o maior deserto quente do mundo?', ['Saara', 'Gobi', 'Kalahari', 'Atacama'], 0],
            ['Qual é a montanha mais alta do mundo?', ['Everest', 'K2', 'Aconcágua', 'Kilimanjaro'], 0],
            ['Qual continente tem mais países?', ['África', 'Ásia', 'Europa', 'América'], 0],
            ['Qual país tem a maior população do mundo?', ['Índia', 'China', 'Estados Unidos', 'Indonésia'], 0],
            ['Qual canal liga o Atlântico ao Pacífico na América Central?', ['Canal do Panamá', 'Canal de Suez', 'Estreito de Magalhães', 'Canal de Corinto'], 0],
            ['Qual é o menor país do mundo em área?', ['Vaticano', 'Mônaco', 'Nauru', 'San Marino'], 0],
            ['Qual linha imaginária divide a Terra em norte e sul?', ['Equador', 'Trópico de Câncer', 'Meridiano de Greenwich', 'Trópico de Capricórnio'], 0],
            ['Em qual continente fica o deserto do Atacama?', ['América do Sul', 'África', 'Ásia', 'Oceania'], 0],
            ['Qual é o maior país do mundo em área?', ['Rússia', 'Canadá', 'China', 'Estados Unidos'], 0],
            ['Qual mar é tão salgado que a pessoa boia sem esforço?', ['Mar Morto', 'Mar Negro', 'Mar Cáspio', 'Mar Vermelho'], 0],
            ['Qual vulcão italiano destruiu Pompeia?', ['Vesúvio', 'Etna', 'Stromboli', 'Vulcano'], 0],
            ['Qual é a capital mais alta do mundo em altitude?', ['La Paz', 'Quito', 'Bogotá', 'Katmandu'], 0]
        ]
    },
    geografiabrasil: {
        nome: 'Geografia do Brasil', emoji: '🧭', perguntas: [
            ['Quantos estados tem o Brasil?', ['26 e o Distrito Federal', '25 e o Distrito Federal', '27 e o Distrito Federal', '24 e o Distrito Federal'], 0],
            ['Qual é o maior estado brasileiro em área?', ['Amazonas', 'Pará', 'Mato Grosso', 'Bahia'], 0],
            ['Qual bioma ocupa a maior parte do Nordeste semiárido?', ['Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa'], 0],
            ['Qual rio corta o estado de São Paulo e dá nome a uma usina famosa?', ['Tietê', 'Doce', 'Parnaíba', 'Iguaçu'], 0],
            ['As Cataratas do Iguaçu ficam na divisa com qual país?', ['Argentina', 'Paraguai', 'Uruguai', 'Bolívia'], 0],
            ['Qual é o ponto mais alto do Brasil?', ['Pico da Neblina', 'Pico da Bandeira', 'Monte Roraima', 'Pico Paraná'], 0],
            ['Qual estado brasileiro tem o menor território?', ['Sergipe', 'Alagoas', 'Rio de Janeiro', 'Espírito Santo'], 0],
            ['Qual bioma brasileiro alaga boa parte do ano?', ['Pantanal', 'Cerrado', 'Caatinga', 'Pampa'], 0],
            ['Quantos países fazem fronteira com o Brasil?', ['Dez', 'Oito', 'Doze', 'Nove'], 0],
            ['Qual região brasileira concentra a maior população?', ['Sudeste', 'Nordeste', 'Sul', 'Norte'], 0],
            ['Qual é o arquipélago brasileiro famoso no Atlântico, em Pernambuco?', ['Fernando de Noronha', 'Abrolhos', 'Ilha Grande', 'Marajó'], 0],
            ['Qual estado é banhado pelo Rio São Francisco em sua nascente?', ['Minas Gerais', 'Bahia', 'Pernambuco', 'Sergipe'], 0],
            ['Qual é a maior ilha fluvial do mundo, no Pará?', ['Marajó', 'Bananal', 'Tupinambarana', 'Caviana'], 0],
            ['Qual estado tem o maior litoral brasileiro?', ['Bahia', 'Ceará', 'Rio Grande do Sul', 'Maranhão'], 0]
        ]
    },
    tecnologia: {
        nome: 'Tecnologia', emoji: '💻', perguntas: [
            ['O que significa a sigla CPU?', ['Unidade central de processamento', 'Central de programas', 'Controle por usuário', 'Conexão para upload'], 0],
            ['Qual empresa criou o sistema Windows?', ['Microsoft', 'Apple', 'IBM', 'Google'], 0],
            ['Quantos bits tem um byte?', ['Oito', 'Quatro', 'Dezesseis', 'Dois'], 0],
            ['Qual componente guarda dados mesmo com o computador desligado?', ['Disco rígido', 'Memória RAM', 'Processador', 'Placa de vídeo'], 0],
            ['Quem fundou a Apple junto com Steve Jobs?', ['Steve Wozniak', 'Bill Gates', 'Paul Allen', 'Tim Cook'], 0],
            ['O que é um firewall?', ['Barreira de proteção de rede', 'Antivírus de arquivos', 'Programa de backup', 'Tipo de cabo'], 0],
            ['Qual linguagem roda no navegador junto com HTML e CSS?', ['JavaScript', 'Python', 'Java', 'C#'], 0],
            ['O que significa a sigla USB?', ['Barramento serial universal', 'Unidade de sistema básico', 'Uso simples de bateria', 'Unidade sem bloqueio'], 0],
            ['Qual é o sistema operacional livre com o pinguim como mascote?', ['Linux', 'Windows', 'macOS', 'Solaris'], 0],
            ['Qual tecnologia liga dispositivos por curta distância sem fio?', ['Bluetooth', 'Ethernet', 'Fibra óptica', 'Infravermelho apenas'], 0],
            ['O que é a memória RAM?', ['Memória volátil de trabalho', 'Memória permanente', 'Disco de backup', 'Cartão de vídeo'], 0],
            ['Qual empresa criou o sistema Android?', ['Google', 'Samsung', 'Nokia', 'Motorola'], 0],
            ['O que faz um compilador?', ['Traduz código em programa executável', 'Limpa arquivos', 'Conecta à internet', 'Formata o disco'], 0],
            ['Qual unidade mede a velocidade do processador?', ['Hertz', 'Byte', 'Pixel', 'Volt'], 0]
        ]
    },
    internet: {
        nome: 'Internet e redes', emoji: '🌐', perguntas: [
            ['O que significa a sigla WWW?', ['Rede mundial de computadores', 'Web wide work', 'World web writer', 'Wireless web world'], 0],
            ['Qual protocolo entrega páginas de forma segura?', ['HTTPS', 'FTP', 'SMTP', 'POP3'], 0],
            ['O que é um endereço IP?', ['Identificação do aparelho na rede', 'Senha do roteador', 'Nome do site', 'Número do provedor'], 0],
            ['Qual rede social foi criada por Mark Zuckerberg?', ['Facebook', 'Twitter', 'Instagram', 'LinkedIn'], 0],
            ['O que é phishing?', ['Golpe que finge ser site confiável', 'Vírus de boot', 'Tipo de roteador', 'Rede sem fio aberta'], 0],
            ['Qual serviço traduz nomes de sites em endereços de rede?', ['DNS', 'DHCP', 'VPN', 'NAT'], 0],
            ['O que significa VPN?', ['Rede privada virtual', 'Verificação por número', 'Visualização de páginas na rede', 'Velocidade padrão de navegação'], 0],
            ['Qual empresa criou o buscador mais usado do mundo?', ['Google', 'Microsoft', 'Yahoo', 'Baidu'], 0],
            ['Qual é a função de um roteador?', ['Encaminhar dados entre redes', 'Armazenar arquivos', 'Gerar energia', 'Imprimir documentos'], 0],
            ['O que é um cookie de navegador?', ['Pequeno arquivo guardado pelo site', 'Vírus de propaganda', 'Extensão obrigatória', 'Tipo de senha'], 0],
            ['Qual formato de imagem aceita fundo transparente?', ['PNG', 'JPG', 'BMP', 'TIFF sem canal'], 0],
            ['O que quer dizer "banda larga"?', ['Conexão de alta capacidade', 'Cabo grosso', 'Sinal de rádio', 'Wi-Fi público'], 0],
            ['Qual plataforma de vídeos foi comprada pelo Google em 2006?', ['YouTube', 'Vimeo', 'Dailymotion', 'Twitch'], 0],
            ['O que é autenticação em duas etapas?', ['Confirmação extra além da senha', 'Duas senhas iguais', 'Login com e-mail', 'Troca de senha mensal'], 0]
        ]
    },
    culinaria: {
        nome: 'Culinária do mundo', emoji: '🍳', perguntas: [
            ['De qual país é originária a pizza?', ['Itália', 'Grécia', 'França', 'Espanha'], 0],
            ['Qual prato japonês leva arroz avinagrado e peixe cru?', ['Sushi', 'Ramen', 'Tempurá', 'Yakisoba'], 0],
            ['Qual é o ingrediente principal do guacamole?', ['Abacate', 'Tomate', 'Pepino', 'Pimentão'], 0],
            ['Qual massa italiana tem formato de tubo curto e riscado?', ['Penne', 'Fusilli', 'Farfalle', 'Conchiglie'], 0],
            ['Qual país é o berço do curry?', ['Índia', 'Tailândia', 'China', 'Japão'], 0],
            ['Qual queijo é tradicional na pizza margherita?', ['Muçarela', 'Gorgonzola', 'Parmesão', 'Brie'], 0],
            ['Qual é a base do hummus?', ['Grão-de-bico', 'Lentilha', 'Feijão branco', 'Ervilha'], 0],
            ['Qual bebida é feita com folhas fermentadas e é típica da China?', ['Chá', 'Saquê', 'Café', 'Kombucha apenas'], 0],
            ['O que é o croissant?', ['Pão folhado francês', 'Bolo alemão', 'Biscoito inglês', 'Torta belga'], 0],
            ['Qual tempero dá a cor amarela ao açafrão-da-terra?', ['Cúrcuma', 'Páprica', 'Colorau apenas', 'Mostarda'], 0],
            ['Qual país criou o taco?', ['México', 'Peru', 'Chile', 'Colômbia'], 0],
            ['Qual carne é usada no strogonoff clássico russo?', ['Carne bovina', 'Frango', 'Porco', 'Cordeiro'], 0],
            ['Qual é o nome da massa folhada grega usada em tortas?', ['Filo', 'Brisé', 'Sablée', 'Choux'], 0],
            ['Qual fruta é a base do vinho?', ['Uva', 'Maçã', 'Pera', 'Ameixa'], 0]
        ]
    },
    culinariabrasil: {
        nome: 'Comida brasileira', emoji: '🍲', perguntas: [
            ['Qual é o prato mais associado ao Brasil, com feijão preto e carnes?', ['Feijoada', 'Moqueca', 'Baião de dois', 'Vatapá'], 0],
            ['O acarajé é típico de qual estado?', ['Bahia', 'Pernambuco', 'Ceará', 'Maranhão'], 0],
            ['Qual doce mineiro leva goiaba e queijo?', ['Romeu e Julieta', 'Ambrosia', 'Curau', 'Quindim'], 0],
            ['Qual é o ingrediente principal do pão de queijo?', ['Polvilho', 'Trigo', 'Fubá', 'Aveia'], 0],
            ['Qual prato nordestino junta arroz, feijão-verde e queijo coalho?', ['Baião de dois', 'Escondidinho', 'Cuscuz', 'Paçoca de carne'], 0],
            ['O tacacá é típico de qual região?', ['Norte', 'Sul', 'Centro-Oeste', 'Sudeste'], 0],
            ['Qual doce leva leite condensado, chocolate e granulado?', ['Brigadeiro', 'Beijinho', 'Cajuzinho', 'Olho de sogra'], 0],
            ['Qual é a base do vatapá?', ['Pão, leite de coco e dendê', 'Mandioca e leite', 'Milho e coco', 'Arroz e camarão'], 0],
            ['Qual carne é tradicional no churrasco gaúcho de costela?', ['Bovina', 'Suína', 'Ovina', 'Frango'], 0],
            ['Qual bebida brasileira é destilada da cana-de-açúcar?', ['Cachaça', 'Rum', 'Vodca', 'Gim'], 0],
            ['O que é a farofa?', ['Farinha de mandioca refogada', 'Purê de batata', 'Massa de milho', 'Creme de queijo'], 0],
            ['Qual doce é feito de leite e açúcar cozidos até endurecer, típico de Minas?', ['Doce de leite', 'Pé de moleque', 'Cocada', 'Rapadura'], 0],
            ['Qual fruta amazônica é batida e servida com farinha e peixe?', ['Açaí', 'Cupuaçu', 'Bacuri', 'Graviola'], 0],
            ['Qual prato capixaba é cozido em panela de barro com peixe?', ['Moqueca', 'Bobó', 'Caldeirada', 'Peixada'], 0]
        ]
    },
    novela: {
        nome: 'Novelas brasileiras', emoji: '📺', perguntas: [
            ['Qual novela tem a personagem Nazaré Tedesco?', ['Senhora do Destino', 'Mulheres Apaixonadas', 'Laços de Família', 'Celebridade'], 0],
            ['Em qual novela a personagem Odete Roitman foi assassinada?', ['Vale Tudo', 'Roque Santeiro', 'Que Rei Sou Eu', 'Tieta'], 0],
            ['Qual novela se passa na cidade fictícia de Asa Branca?', ['Roque Santeiro', 'Cordel Encantado', 'Gabriela', 'O Bem-Amado'], 0],
            ['Quem é a autora de "Avenida Brasil"?', ['João Emanuel Carneiro', 'Manoel Carlos', 'Glória Perez', 'Aguinaldo Silva'], 0],
            ['Qual novela popularizou o bordão "pode ir tirando o cavalinho da chuva"?', ['Avenida Brasil', 'Fina Estampa', 'Império', 'A Favorita'], 0],
            ['Qual autor é conhecido pelas novelas com personagens chamadas Helena?', ['Manoel Carlos', 'Silvio de Abreu', 'Walcyr Carrasco', 'Benedito Ruy Barbosa'], 0],
            ['Qual novela rural gira em torno da disputa por terras no Pantanal?', ['Pantanal', 'O Rei do Gado', 'Renascer', 'Terra Nostra'], 0],
            ['Em "O Clone", qual país aparece além do Brasil?', ['Marrocos', 'Egito', 'Turquia', 'Líbano'], 0],
            ['Qual novela tem a vilã Carminha?', ['Avenida Brasil', 'Amor à Vida', 'Império', 'Babilônia'], 0],
            ['Qual novela de época conta a chegada de italianos ao Brasil?', ['Terra Nostra', 'Esperança', 'Chocolate com Pimenta', 'Sinhá Moça'], 0],
            ['Qual emissora exibiu a novela "Carrossel" em 2012?', ['SBT', 'Globo', 'Record', 'Band'], 0],
            ['Qual novela tem o personagem Tufão, ex-jogador de futebol?', ['Avenida Brasil', 'Cheias de Charme', 'Salve Jorge', 'Geração Brasil'], 0],
            ['Qual novela adaptou o livro de Jorge Amado sobre Tieta do Agreste?', ['Tieta', 'Porto dos Milagres', 'Gabriela', 'Dona Flor'], 0],
            ['Qual novela dos anos 90 tinha Ana Paula Arósio em Terra Nostra?', ['Terra Nostra', 'Esperança', 'Hilda Furacão', 'Os Maias'], 0]
        ]
    },
    desenhoantigo: {
        nome: 'Desenhos antigos', emoji: '📼', perguntas: [
            ['Qual desenho tem Pedrita e Bam-Bam?', ['Os Flintstones', 'Os Jetsons', 'Scooby-Doo', 'Tom e Jerry'], 0],
            ['Qual é o nome do cachorro covarde que resolve mistérios?', ['Scooby-Doo', 'Bidu', 'Pluto', 'Muttley'], 0],
            ['Em Caverna do Dragão, quantas crianças se perdem?', ['Seis', 'Cinco', 'Quatro', 'Sete'], 0],
            ['Qual desenho tem o gato Tom perseguindo o rato Jerry?', ['Tom e Jerry', 'Piu-Piu e Frajola', 'Ligeirinho', 'Manda-Chuva'], 0],
            ['Qual gato azul dos anos 60 comanda uma turma de rua?', ['Manda-Chuva', 'Frajola', 'Garfield', 'Félix'], 0],
            ['Qual desenho tem os ThunderCats liderados por?', ['Leon-O', 'Panthro', 'Tygra', 'Cheetara'], 0],
            ['Em He-Man, qual é a frase ao erguer a espada?', ['Eu tenho a força', 'Pelos poderes de Grayskull', 'Avante', 'Sou o mestre'], 0],
            ['Qual dupla de esquilos vive em Rescue Rangers?', ['Tico e Teco', 'Zé Carioca e Pato Donald', 'Pernalonga e Patolino', 'Pepe e Pepa'], 0],
            ['Qual desenho passa no futuro com a família e a robô Rosie?', ['Os Jetsons', 'Os Flintstones', 'Futurama', 'Jonny Quest'], 0],
            ['Qual é o nome do coelho que pergunta "o que é que há, velhinho?"', ['Pernalonga', 'Patolino', 'Gaguinho', 'Hortelino'], 0],
            ['Qual desenho tem um urso de chapéu que rouba cestas em Jellystone?', ['Zé Colmeia', 'Ursinho Pooh', 'Baloo', 'Ben'], 0],
            ['Qual anime dos anos 80 tem abelha em busca da mãe?', ['Abelha Maia', 'Zezinho', 'Sandy Bell', 'Belfy'], 0],
            ['Qual desenho tem a turma do Snorks, que vive no fundo do mar?', ['Snorks', 'Bob Esponja', 'Pequena Sereia', 'Sea Lab'], 0],
            ['Qual cachorro de Dartagnan corre em Dastardly and Muttley?', ['Muttley', 'Bidu', 'Rex', 'Astro'], 0]
        ]
    },
    religiao: {
        nome: 'Religiões do mundo', emoji: '🕊️', perguntas: [
            ['Qual é o livro sagrado do islamismo?', ['Alcorão', 'Torá', 'Bíblia', 'Vedas'], 0],
            ['Quantos livros tem o Novo Testamento cristão?', ['27', '39', '46', '21'], 0],
            ['Qual é o dia sagrado do judaísmo?', ['Sábado', 'Domingo', 'Sexta-feira', 'Segunda-feira'], 0],
            ['Qual religião tem o conceito de carma e reencarnação como central?', ['Hinduísmo', 'Islamismo', 'Judaísmo', 'Xintoísmo'], 0],
            ['Quem fundou o budismo?', ['Sidarta Gautama', 'Confúcio', 'Lao-Tsé', 'Mahavira'], 0],
            ['Qual é a cidade sagrada do islamismo para a peregrinação?', ['Meca', 'Medina', 'Jerusalém', 'Cairo'], 0],
            ['Qual é o primeiro livro da Bíblia?', ['Gênesis', 'Êxodo', 'Levítico', 'Salmos'], 0],
            ['Qual religião de matriz africana cultua os orixás no Brasil?', ['Candomblé', 'Espiritismo', 'Xintoísmo', 'Taoismo'], 0],
            ['Quantos mandamentos foram entregues a Moisés?', ['Dez', 'Sete', 'Doze', 'Cinco'], 0],
            ['Qual é o templo principal do xintoísmo no Japão?', ['Santuário', 'Mosteiro', 'Sinagoga', 'Mesquita'], 0],
            ['Qual figura é considerada o líder espiritual do budismo tibetano?', ['Dalai Lama', 'Papa', 'Aiatolá', 'Patriarca'], 0],
            ['Qual doutrina foi codificada por Allan Kardec?', ['Espiritismo', 'Umbanda', 'Teosofia', 'Gnosticismo'], 0],
            ['Qual festa judaica lembra a saída do Egito?', ['Pessach', 'Hanucá', 'Purim', 'Sucot'], 0],
            ['Qual é o mês de jejum no islamismo?', ['Ramadã', 'Muharram', 'Rajab', 'Shawwal'], 0]
        ]
    },
    mitologiagrega: {
        nome: 'Mitologia grega', emoji: '⚡', perguntas: [
            ['Quem é o rei dos deuses no Olimpo?', ['Zeus', 'Poseidon', 'Hades', 'Apolo'], 0],
            ['Qual deus grego comanda os mares?', ['Poseidon', 'Zeus', 'Hades', 'Hermes'], 0],
            ['Quem é a deusa da sabedoria e da guerra estratégica?', ['Atena', 'Afrodite', 'Ártemis', 'Hera'], 0],
            ['Qual herói matou o Minotauro no labirinto?', ['Teseu', 'Perseu', 'Héracles', 'Jasão'], 0],
            ['Quem carrega o céu nas costas como castigo?', ['Atlas', 'Prometeu', 'Sísifo', 'Tântalo'], 0],
            ['Quantos trabalhos Héracles precisou cumprir?', ['Doze', 'Dez', 'Sete', 'Quinze'], 0],
            ['Quem foi condenado a empurrar uma pedra morro acima para sempre?', ['Sísifo', 'Ícaro', 'Orfeu', 'Narciso'], 0],
            ['Qual deus roubou o fogo dos deuses para os humanos?', ['Prometeu', 'Hefesto', 'Hermes', 'Dionísio'], 0],
            ['Quem é a deusa do amor e da beleza?', ['Afrodite', 'Deméter', 'Héstia', 'Perséfone'], 0],
            ['Qual criatura tem cabeça de mulher e cabelos de serpente?', ['Medusa', 'Harpia', 'Quimera', 'Esfinge'], 0],
            ['Qual herói voltou para Ítaca após vinte anos?', ['Odisseu', 'Aquiles', 'Heitor', 'Ájax'], 0],
            ['Qual é o ponto fraco de Aquiles?', ['O calcanhar', 'O ombro', 'O joelho', 'O pescoço'], 0],
            ['Quem é o deus mensageiro de sandálias aladas?', ['Hermes', 'Apolo', 'Ares', 'Hefesto'], 0],
            ['Qual deus reina no mundo dos mortos?', ['Hades', 'Caronte', 'Tânatos', 'Cérbero'], 0]
        ]
    },
    mitologianordica: {
        nome: 'Mitologia nórdica', emoji: '🔨', perguntas: [
            ['Quem é o deus do trovão na mitologia nórdica?', ['Thor', 'Odin', 'Loki', 'Baldur'], 0],
            ['Qual é o nome do martelo de Thor?', ['Mjolnir', 'Gungnir', 'Gram', 'Laevateinn'], 0],
            ['Quem é o pai de todos os deuses nórdicos?', ['Odin', 'Thor', 'Tyr', 'Heimdall'], 0],
            ['Qual é o nome do salão dos guerreiros mortos?', ['Valhalla', 'Asgard', 'Midgard', 'Helheim'], 0],
            ['Qual é o nome do fim do mundo nórdico?', ['Ragnarok', 'Yggdrasil', 'Fimbulvetr', 'Niflheim'], 0],
            ['Qual deus é conhecido como o trapaceiro?', ['Loki', 'Frey', 'Njord', 'Bragi'], 0],
            ['Qual é a árvore que sustenta os nove mundos?', ['Yggdrasil', 'Glasir', 'Barnstokkr', 'Laerad'], 0],
            ['Qual lobo gigante é filho de Loki?', ['Fenrir', 'Geri', 'Freki', 'Skoll'], 0],
            ['Quem guarda a ponte Bifrost?', ['Heimdall', 'Tyr', 'Vidar', 'Ull'], 0],
            ['Qual deus perdeu a mão ao acorrentar o lobo Fenrir?', ['Tyr', 'Odin', 'Thor', 'Loki'], 0],
            ['Como se chamam as guerreiras que levam os mortos ao Valhalla?', ['Valquírias', 'Nornas', 'Disir', 'Jotun'], 0],
            ['Qual serpente circunda o mundo?', ['Jormungand', 'Nidhogg', 'Fafnir', 'Ratatosk'], 0],
            ['Qual é o mundo dos humanos na cosmologia nórdica?', ['Midgard', 'Asgard', 'Vanaheim', 'Alfheim'], 0],
            ['Qual deusa é associada ao amor e à magia seidr?', ['Freyja', 'Frigg', 'Idunn', 'Sif'], 0]
        ]
    },
    folclore: {
        nome: 'Folclore brasileiro', emoji: '🪘', perguntas: [
            ['Qual figura do folclore tem os pés virados para trás?', ['Curupira', 'Saci', 'Boitatá', 'Caipora'], 0],
            ['Quantas pernas tem o Saci-Pererê?', ['Uma', 'Duas', 'Três', 'Nenhuma'], 0],
            ['Qual criatura é uma cobra de fogo que protege os campos?', ['Boitatá', 'Mula sem cabeça', 'Cuca', 'Iara'], 0],
            ['Qual figura feminina canta para atrair pescadores nos rios?', ['Iara', 'Cuca', 'Mula sem cabeça', 'Matinta Perera'], 0],
            ['Qual é a lenda do golfinho que vira homem nas festas amazônicas?', ['Boto cor-de-rosa', 'Mapinguari', 'Juma', 'Uirapuru'], 0],
            ['Qual personagem é uma bruxa com cara de jacaré?', ['Cuca', 'Caipora', 'Anhangá', 'Corpo-seco'], 0],
            ['Qual festa junina brasileira tem quadrilha e fogueira?', ['Festa de São João', 'Carnaval', 'Folia de Reis', 'Círio'], 0],
            ['Qual lenda conta sobre uma mulher amaldiçoada que vira animal?', ['Mula sem cabeça', 'Iara', 'Cuca', 'Boiúna'], 0],
            ['O Bumba meu boi é tradição forte de qual estado?', ['Maranhão', 'Ceará', 'Bahia', 'Pará'], 0],
            ['Qual ser peludo e fedorento assombra a floresta amazônica?', ['Mapinguari', 'Curupira', 'Jurupari', 'Tupã'], 0],
            ['Qual ave da lenda tem canto que encanta a floresta?', ['Uirapuru', 'Sabiá', 'Bem-te-vi', 'Juriti'], 0],
            ['Qual personagem protege os animais da mata e monta um porco?', ['Caipora', 'Curupira', 'Saci', 'Anhangá'], 0],
            ['Qual dança circular do Nordeste é feita em roda na praia?', ['Ciranda', 'Frevo', 'Maracatu', 'Coco de roda'], 0],
            ['Qual festa do Pará reúne milhões em procissão?', ['Círio de Nazaré', 'Festa do Divino', 'Festa do Peão', 'Lavagem do Bonfim'], 0]
        ]
    },
    espaco: {
        nome: 'Espaço e astronomia', emoji: '🚀', perguntas: [
            ['Qual é o planeta mais próximo do Sol?', ['Mercúrio', 'Vênus', 'Terra', 'Marte'], 0],
            ['Quantos planetas tem o Sistema Solar?', ['Oito', 'Nove', 'Sete', 'Dez'], 0],
            ['Qual planeta é conhecido como o planeta vermelho?', ['Marte', 'Júpiter', 'Vênus', 'Mercúrio'], 0],
            ['Qual é a estrela mais próxima da Terra?', ['Sol', 'Alfa Centauri', 'Sirius', 'Proxima b'], 0],
            ['Qual planeta tem os anéis mais visíveis?', ['Saturno', 'Urano', 'Netuno', 'Júpiter'], 0],
            ['Quem foi o primeiro ser humano a ir ao espaço?', ['Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard', 'John Glenn'], 0],
            ['Qual é o nome da galáxia onde fica o Sistema Solar?', ['Via Láctea', 'Andrômeda', 'Triângulo', 'Sombrero'], 0],
            ['O que é um ano-luz?', ['Distância percorrida pela luz em um ano', 'Tempo de uma órbita', 'Idade de uma estrela', 'Brilho de um astro'], 0],
            ['Qual telescópio espacial foi lançado em 1990?', ['Hubble', 'James Webb', 'Kepler', 'Spitzer'], 0],
            ['Qual é o satélite natural da Terra?', ['Lua', 'Fobos', 'Europa', 'Titã'], 0],
            ['Qual planeta gira deitado, com o eixo quase paralelo à órbita?', ['Urano', 'Netuno', 'Saturno', 'Vênus'], 0],
            ['Qual fenômeno ocorre quando a Lua cobre o Sol?', ['Eclipse solar', 'Eclipse lunar', 'Solstício', 'Equinócio'], 0],
            ['Qual é a maior lua de Júpiter?', ['Ganimedes', 'Io', 'Europa', 'Calisto'], 0],
            ['O que é um buraco negro?', ['Região de gravidade extrema', 'Estrela apagada fria', 'Planeta sem luz', 'Nuvem de poeira'], 0]
        ]
    },
    quimica: {
        nome: 'Química', emoji: '⚗️', perguntas: [
            ['Qual é a fórmula química da água?', ['H2O', 'CO2', 'O2', 'NaCl'], 0],
            ['Qual é o símbolo químico do ouro?', ['Au', 'Ag', 'Fe', 'Pb'], 0],
            ['Qual gás compõe a maior parte do ar que respiramos?', ['Nitrogênio', 'Oxigênio', 'Gás carbônico', 'Argônio'], 0],
            ['Qual é o símbolo químico do sódio?', ['Na', 'So', 'Sd', 'S'], 0],
            ['O que mede a escala de pH?', ['Acidez e basicidade', 'Temperatura', 'Densidade', 'Pressão'], 0],
            ['Qual é o elemento mais abundante do universo?', ['Hidrogênio', 'Hélio', 'Oxigênio', 'Carbono'], 0],
            ['Qual é a fórmula do sal de cozinha?', ['NaCl', 'KCl', 'CaCO3', 'NaHCO3'], 0],
            ['Quantos elétrons cabem na primeira camada do átomo?', ['Dois', 'Oito', 'Um', 'Quatro'], 0],
            ['Quem organizou a tabela periódica moderna?', ['Mendeleev', 'Dalton', 'Lavoisier', 'Bohr'], 0],
            ['Qual gás é liberado na respiração celular?', ['Gás carbônico', 'Oxigênio', 'Metano', 'Amônia'], 0],
            ['O que é uma substância inflamável?', ['Que pega fogo com facilidade', 'Que não queima', 'Que evapora rápido', 'Que dissolve metais'], 0],
            ['Qual é o símbolo químico do ferro?', ['Fe', 'Fr', 'Ir', 'Fl'], 0],
            ['O bicarbonato de sódio é ácido ou básico em solução?', ['Básico', 'Ácido', 'Neutro sempre', 'Depende da cor'], 0],
            ['Qual estado da matéria tem volume fixo e forma variável?', ['Líquido', 'Sólido', 'Gasoso', 'Plasma'], 0]
        ]
    },
    fisica: {
        nome: 'Física', emoji: '🧲', perguntas: [
            ['Qual é a unidade de energia no sistema internacional?', ['Joule', 'Newton', 'Watt', 'Pascal'], 0],
            ['Quem formulou as três leis do movimento?', ['Isaac Newton', 'Galileu', 'Kepler', 'Einstein'], 0],
            ['O que é inércia?', ['Tendência de manter o estado de movimento', 'Força de atrito', 'Aceleração constante', 'Energia armazenada'], 0],
            ['Qual é a unidade de potência elétrica?', ['Watt', 'Ampère', 'Volt', 'Ohm'], 0],
            ['A gravidade na Terra vale aproximadamente quanto?', ['9,8 m/s²', '3,7 m/s²', '12 m/s²', '5 m/s²'], 0],
            ['Qual fenômeno explica o arco-íris?', ['Refração da luz', 'Reflexão total', 'Difração sonora', 'Ionização'], 0],
            ['O que mede um amperímetro?', ['Corrente elétrica', 'Tensão', 'Resistência', 'Potência'], 0],
            ['Qual é a velocidade do som no ar, aproximadamente?', ['340 m/s', '150 m/s', '1000 m/s', '30 m/s'], 0],
            ['Qual lei relaciona tensão, corrente e resistência?', ['Lei de Ohm', 'Lei de Faraday', 'Lei de Lenz', 'Lei de Coulomb'], 0],
            ['O que acontece com a pressão à medida que se desce no mar?', ['Aumenta', 'Diminui', 'Fica igual', 'Oscila'], 0],
            ['Qual tipo de energia tem um corpo em movimento?', ['Cinética', 'Potencial', 'Térmica', 'Química'], 0],
            ['Qual instrumento mede temperatura?', ['Termômetro', 'Barômetro', 'Higrômetro', 'Anemômetro'], 0],
            ['Dois ímãs com polos iguais fazem o quê?', ['Se repelem', 'Se atraem', 'Nada acontece', 'Se fundem'], 0],
            ['Qual é a fórmula da segunda lei de Newton?', ['Força igual massa vezes aceleração', 'Energia igual massa vezes luz', 'Pressão igual força sobre área', 'Trabalho igual força vezes tempo'], 0]
        ]
    },
    biologia: {
        nome: 'Biologia', emoji: '🧬', perguntas: [
            ['Qual organela produz energia na célula?', ['Mitocôndria', 'Ribossomo', 'Lisossomo', 'Complexo de Golgi'], 0],
            ['O que a sigla DNA representa?', ['Ácido desoxirribonucleico', 'Ácido de núcleo animal', 'Dupla nucleação ativa', 'Divisão natural do ácido'], 0],
            ['Qual processo divide uma célula em duas iguais?', ['Mitose', 'Meiose', 'Fissão binária apenas', 'Gemulação'], 0],
            ['Qual estrutura só existe em células vegetais?', ['Parede celular', 'Membrana plasmática', 'Núcleo', 'Citoplasma'], 0],
            ['Quem é considerado o pai da genética?', ['Gregor Mendel', 'Charles Darwin', 'Watson', 'Crick'], 0],
            ['Qual pigmento dá a cor verde às plantas?', ['Clorofila', 'Caroteno', 'Xantofila', 'Antocianina'], 0],
            ['Quantos cromossomos tem uma célula humana normal?', ['46', '23', '48', '44'], 0],
            ['Qual reino inclui os cogumelos?', ['Fungi', 'Plantae', 'Animalia', 'Protista'], 0],
            ['O que é um ecossistema?', ['Conjunto de seres vivos e o ambiente', 'Só os animais de uma área', 'Só as plantas', 'Clima de uma região'], 0],
            ['Qual grupo de animais tem sangue de temperatura variável?', ['Répteis', 'Mamíferos', 'Aves', 'Nenhum'], 0],
            ['Qual é a função dos glóbulos brancos?', ['Defender o organismo', 'Transportar oxigênio', 'Coagular o sangue', 'Produzir hormônios'], 0],
            ['Qual é a unidade básica da vida?', ['Célula', 'Tecido', 'Órgão', 'Molécula'], 0],
            ['Qual processo transforma luz em alimento nas plantas?', ['Fotossíntese', 'Respiração', 'Transpiração', 'Fermentação'], 0],
            ['Qual animal é um exemplo de invertebrado?', ['Minhoca', 'Sapo', 'Peixe', 'Morcego'], 0]
        ]
    },
    carros: {
        nome: 'Carros e automobilismo', emoji: '🏎️', perguntas: [
            ['Qual marca tem o cavalo empinado como símbolo?', ['Ferrari', 'Porsche', 'Lamborghini', 'Mustang'], 0],
            ['Quantas vezes Ayrton Senna foi campeão mundial de Fórmula 1?', ['Três', 'Duas', 'Quatro', 'Cinco'], 0],
            ['Qual país é a origem da marca Toyota?', ['Japão', 'Coreia do Sul', 'China', 'Alemanha'], 0],
            ['Qual é a corrida de 24 horas mais famosa do mundo?', ['Le Mans', 'Daytona', 'Nürburgring', 'Spa'], 0],
            ['Qual marca alemã tem quatro anéis no logo?', ['Audi', 'BMW', 'Mercedes', 'Opel'], 0],
            ['O que faz o câmbio de um carro?', ['Transmite a força do motor às rodas', 'Gera eletricidade', 'Resfria o motor', 'Filtra o combustível'], 0],
            ['Qual piloto tem mais títulos mundiais de Fórmula 1 empatado no topo?', ['Lewis Hamilton', 'Alain Prost', 'Sebastian Vettel', 'Niki Lauda'], 0],
            ['Qual combustível é típico dos carros flex brasileiros além da gasolina?', ['Etanol', 'Diesel', 'Querosene', 'Gás natural apenas'], 0],
            ['Qual marca fabrica o modelo Fusca?', ['Volkswagen', 'Fiat', 'Ford', 'Chevrolet'], 0],
            ['O que significa ABS nos freios?', ['Sistema antitravamento', 'Freio de banho de óleo', 'Absorção de choque', 'Alavanca de bloqueio'], 0],
            ['Qual circuito brasileiro recebe a Fórmula 1?', ['Interlagos', 'Jacarepaguá', 'Goiânia', 'Curitiba'], 0],
            ['Qual é a função do radiador?', ['Resfriar o motor', 'Aumentar a potência', 'Filtrar o ar', 'Carregar a bateria'], 0],
            ['Qual marca italiana produz o modelo Uno no Brasil?', ['Fiat', 'Alfa Romeo', 'Lancia', 'Maserati'], 0],
            ['Qual bandeira encerra uma corrida?', ['Quadriculada', 'Amarela', 'Vermelha', 'Azul'], 0]
        ]
    },
    esportes: {
        nome: 'Esportes variados', emoji: '🏅', perguntas: [
            ['Quantos jogadores tem um time de vôlei em quadra?', ['Seis', 'Cinco', 'Sete', 'Quatro'], 0],
            ['Qual esporte usa raquete e uma peteca com penas?', ['Badminton', 'Tênis', 'Squash', 'Pingue-pongue'], 0],
            ['Quantos pontos vale uma cesta de três no basquete?', ['Três', 'Dois', 'Um', 'Quatro'], 0],
            ['Qual esporte tem termos como strike e home run?', ['Beisebol', 'Críquete', 'Softbol apenas', 'Golfe'], 0],
            ['Qual é a distância de uma maratona oficial?', ['42,195 km', '21 km', '50 km', '30 km'], 0],
            ['Qual arte marcial japonesa usa quimono e faixas coloridas com projeções?', ['Judô', 'Karatê', 'Aikidô', 'Kendô'], 0],
            ['No tênis, como se chama o placar zero?', ['Love', 'Nil', 'Zero point', 'Null'], 0],
            ['Quantos buracos tem um campo de golfe oficial?', ['18', '12', '24', '9'], 0],
            ['Qual esporte é jogado sobre gelo com um disco?', ['Hóquei no gelo', 'Curling', 'Patinação', 'Bobsled'], 0],
            ['Qual esporte brasileiro nasceu com a peteca indígena?', ['Peteca', 'Futevôlei', 'Capoeira', 'Bocha'], 0],
            ['No vôlei, quantos toques um time pode dar antes de devolver?', ['Três', 'Dois', 'Quatro', 'Cinco'], 0],
            ['Qual é o nome do movimento de saque no vôlei por cima com salto?', ['Saque viagem', 'Manchete', 'Toque', 'Bloqueio'], 0],
            ['Qual esporte usa o termo "nocaute"?', ['Boxe', 'Natação', 'Ciclismo', 'Remo'], 0],
            ['Quantos jogadores tem um time de handebol em quadra?', ['Sete', 'Seis', 'Cinco', 'Oito'], 0]
        ]
    },
    olimpiadas: {
        nome: 'Jogos Olímpicos', emoji: '🔥', perguntas: [
            ['Em qual país surgiram os Jogos Olímpicos antigos?', ['Grécia', 'Itália', 'Egito', 'Turquia'], 0],
            ['Quantos anéis tem o símbolo olímpico?', ['Cinco', 'Quatro', 'Seis', 'Três'], 0],
            ['Em que cidade brasileira foram os Jogos de 2016?', ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], 0],
            ['De quanto em quanto tempo acontecem os Jogos de verão?', ['Quatro anos', 'Dois anos', 'Três anos', 'Cinco anos'], 0],
            ['Qual nadador é o maior medalhista olímpico da história?', ['Michael Phelps', 'Mark Spitz', 'Ian Thorpe', 'Caeleb Dressel'], 0],
            ['Qual velocista jamaicano bateu recordes nos 100 metros?', ['Usain Bolt', 'Yohan Blake', 'Asafa Powell', 'Tyson Gay'], 0],
            ['Qual esporte brasileiro ganhou o primeiro ouro no vôlei masculino em 1992?', ['Vôlei de quadra', 'Vôlei de praia', 'Futebol', 'Judô'], 0],
            ['Qual cidade sediou os primeiros Jogos modernos, em 1896?', ['Atenas', 'Paris', 'Londres', 'Roma'], 0],
            ['Qual é o lema olímpico tradicional?', ['Mais rápido, mais alto, mais forte', 'Unir e vencer', 'Paz e esporte', 'Força e honra'], 0],
            ['Qual medalha recebe o segundo colocado?', ['Prata', 'Bronze', 'Ouro', 'Cobre'], 0],
            ['Qual esporte foi incluído nos Jogos de Tóquio 2020 com pranchas?', ['Skate', 'Parkour', 'Ciclismo indoor', 'Patins'], 0],
            ['Quem acende a pira olímpica na abertura?', ['Um atleta escolhido', 'O presidente do país', 'O prefeito', 'Um sorteado da plateia'], 0],
            ['Qual dupla brasileira é lendária no vôlei de praia masculino?', ['Emanuel e Ricardo', 'Giba e Serginho', 'Bernardinho e Tande', 'Nalbert e Dante'], 0],
            ['Qual país mais vezes liderou o quadro de medalhas na era moderna?', ['Estados Unidos', 'União Soviética', 'China', 'Alemanha'], 0]
        ]
    },
    series: {
        nome: 'Séries de TV', emoji: '🍿', perguntas: [
            ['Em qual cidade se passa a série Friends?', ['Nova York', 'Chicago', 'Los Angeles', 'Boston'], 0],
            ['Qual série tem o personagem Walter White?', ['Breaking Bad', 'Better Call Saul', 'Ozark', 'Narcos'], 0],
            ['Qual é a casa de Jon Snow em Game of Thrones?', ['Stark', 'Lannister', 'Targaryen', 'Baratheon'], 0],
            ['Em Stranger Things, qual é o nome do mundo paralelo?', ['Mundo Invertido', 'Zona Morta', 'Vale Negro', 'Outro Lado'], 0],
            ['Qual série espanhola tem assaltantes com máscara de Dalí?', ['La Casa de Papel', 'Elite', 'Vis a Vis', 'Toy Boy'], 0],
            ['Qual série acompanha o escritório de Dunder Mifflin?', ['The Office', 'Parks and Recreation', 'Superstore', 'Brooklyn Nine-Nine'], 0],
            ['Qual série médica tem Meredith Grey?', ['Grey’s Anatomy', 'House', 'ER', 'The Good Doctor'], 0],
            ['Qual série brasileira mistura folclore e investigação em uma cidade oculta?', ['Cidade Invisível', 'Bom Dia, Verônica', 'O Mecanismo', 'Coisa Mais Linda'], 0],
            ['Qual série tem o personagem Sheldon Cooper?', ['The Big Bang Theory', 'How I Met Your Mother', 'Community', 'Scrubs'], 0],
            ['Em Lost, o que os sobreviventes procuram na ilha?', ['Uma forma de sair', 'Um tesouro', 'Um laboratório secreto apenas', 'Uma cidade perdida'], 0],
            ['Qual série animada dos Simpsons tem a cidade fictícia de?', ['Springfield', 'Quahog', 'South Park', 'Shelbyville'], 0],
            ['Qual série coreana virou fenômeno com jogos infantis mortais?', ['Round 6', 'Kingdom', 'Sweet Home', 'Hellbound'], 0],
            ['Qual série tem o detetive Rust Cohle na primeira temporada?', ['True Detective', 'Mindhunter', 'The Killing', 'Fargo'], 0],
            ['Qual série brasileira retrata o tráfico e o baile funk em São Paulo?', ['Sintonia', 'Impuros', 'Arcanjo Renegado', 'Ilha de Ferro'], 0]
        ]
    },
    disney: {
        nome: 'Mundo Disney', emoji: '🏰', perguntas: [
            ['Qual foi o primeiro longa animado da Disney?', ['Branca de Neve', 'Pinóquio', 'Fantasia', 'Bambi'], 0],
            ['Qual é o nome do leão protagonista de O Rei Leão?', ['Simba', 'Mufasa', 'Scar', 'Nala'], 0],
            ['Qual princesa perde um sapatinho de cristal?', ['Cinderela', 'Aurora', 'Bela', 'Ariel'], 0],
            ['Em Aladdin, o que o Gênio concede?', ['Três desejos', 'Um desejo', 'Cinco desejos', 'Desejos ilimitados'], 0],
            ['Qual é o nome da sereia de A Pequena Sereia?', ['Ariel', 'Úrsula', 'Marina', 'Melody'], 0],
            ['Em Frozen, qual é o poder de Elsa?', ['Gelo e neve', 'Fogo', 'Vento', 'Luz'], 0],
            ['Qual é o nome do boneco de neve de Frozen?', ['Olaf', 'Sven', 'Kristoff', 'Hans'], 0],
            ['Qual filme da Pixar tem brinquedos que ganham vida?', ['Toy Story', 'Carros', 'Vida de Inseto', 'Monstros S.A.'], 0],
            ['Em Moana, qual é o nome do semideus?', ['Maui', 'Tui', 'Tamatoa', 'Heihei'], 0],
            ['Qual é o nome do cachorro de Mickey?', ['Pluto', 'Pateta', 'Bolt', 'Rex'], 0],
            ['Em Procurando Nemo, qual peixe tem memória curta?', ['Dory', 'Marlin', 'Bruce', 'Gill'], 0],
            ['Qual filme da Pixar tem uma casa levantada por balões?', ['Up: Altas Aventuras', 'Valente', 'Divertida Mente', 'Wall-E'], 0],
            ['Em Mulan, qual animal acompanha a protagonista?', ['Mushu', 'Abu', 'Pascal', 'Meeko'], 0],
            ['Qual é o parque temático original da Disney, aberto em 1955?', ['Disneyland', 'Magic Kingdom', 'Epcot', 'Disney Sea'], 0]
        ]
    },
    marvel: {
        nome: 'Universo Marvel', emoji: '🦸', perguntas: [
            ['Qual é o nome verdadeiro do Homem de Ferro?', ['Tony Stark', 'Steve Rogers', 'Bruce Banner', 'Peter Parker'], 0],
            ['Qual herói carrega o escudo de vibranium?', ['Capitão América', 'Pantera Negra', 'Thor', 'Gavião Arqueiro'], 0],
            ['Qual é o nome do reino do Pantera Negra?', ['Wakanda', 'Asgard', 'Latvéria', 'Atlântida'], 0],
            ['Quem é o irmão adotivo de Thor?', ['Loki', 'Balder', 'Heimdall', 'Hela'], 0],
            ['Quantas Joias do Infinito existem?', ['Seis', 'Cinco', 'Sete', 'Quatro'], 0],
            ['Qual é o nome verdadeiro do Homem-Aranha original?', ['Peter Parker', 'Miles Morales', 'Ben Reilly', 'Harry Osborn'], 0],
            ['Qual cientista vira o Hulk?', ['Bruce Banner', 'Reed Richards', 'Hank Pym', 'Otto Octavius'], 0],
            ['Qual grupo tem Rocket e Groot?', ['Guardiões da Galáxia', 'Vingadores', 'X-Men', 'Quarteto Fantástico'], 0],
            ['Quem lidera os X-Men na cadeira de rodas?', ['Professor Xavier', 'Magneto', 'Ciclope', 'Wolverine'], 0],
            ['Qual vilão busca reunir as Joias do Infinito?', ['Thanos', 'Ultron', 'Loki', 'Caveira Vermelha'], 0],
            ['Qual é o metal das garras do Wolverine?', ['Adamantium', 'Vibranium', 'Uru', 'Titânio'], 0],
            ['Qual heroína é conhecida como Viúva Negra?', ['Natasha Romanoff', 'Wanda Maximoff', 'Carol Danvers', 'Yelena Belova'], 0],
            ['Qual é o martelo de Thor no cinema antes do Stormbreaker?', ['Mjolnir', 'Gungnir', 'Jarnbjorn', 'Hofund'], 0],
            ['Qual doutor protege a realidade com magia?', ['Doutor Estranho', 'Doutor Destino', 'Doutor Octopus', 'Doutor Fate'], 0]
        ]
    }
}

// ─── Palavras para forca, anagrama, dica e caça-palavras ────────────────────
// Só letras de A a Z, sem acento e sem espaço: a forca compara letra a letra e
// acento faria a mesma palavra ter duas grafias aceitáveis. Quem quiser tema
// novo acrescenta aqui e ganha forca, anagrama, embaralhada e dica de uma vez.

const FORCA = {
    animais: {
        nome: 'Bichos', emoji: '🐾', palavras: [
            ['GIRAFA', 'Pescoço comprido e manchas amarelas'], ['JACARE', 'Réptil de rio com dentes à mostra'],
            ['TUCANO', 'Ave de bico grande e colorido'], ['CAPIVARA', 'Maior roedor do mundo, vive perto d’água'],
            ['TAMANDUA', 'Come formiga com a língua comprida'], ['PANTERA', 'Felino negro e silencioso'],
            ['GOLFINHO', 'Mamífero marinho muito brincalhão'], ['CAMALEAO', 'Muda de cor para se esconder'],
            ['ELEFANTE', 'Tem tromba e orelhas enormes'], ['PINGUIM', 'Ave que nada e não voa'],
            ['MACACO', 'Vive nas árvores e adora banana'], ['ONCA', 'Felino manchado das matas brasileiras']
        ]
    },
    frutas: {
        nome: 'Frutas', emoji: '🍉', palavras: [
            ['ABACAXI', 'Casca espinhosa e coroa verde'], ['MELANCIA', 'Verde por fora, vermelha por dentro'],
            ['GOIABA', 'Vira doce com queijo'], ['MARACUJA', 'Fruta do suco que acalma'],
            ['JABUTICABA', 'Nasce grudada no tronco'], ['CAJU', 'Tem castanha pendurada'],
            ['MORANGO', 'Vermelho com sementinhas por fora'], ['MAMAO', 'Amarelo e cheio de sementes pretas'],
            ['PITAYA', 'Rosa por fora e pintada por dentro'], ['CARAMBOLA', 'Fatiada vira estrela'],
            ['GRAVIOLA', 'Polpa branca e casca espinhosa'], ['TANGERINA', 'Prima da laranja, fácil de descascar']
        ]
    },
    paises: {
        nome: 'Países', emoji: '🌎', palavras: [
            ['PORTUGAL', 'Fica ao lado da Espanha'], ['CANADA', 'Folha de bordo na bandeira'],
            ['JAPAO', 'Terra do sol nascente'], ['EGITO', 'Pirâmides e o rio Nilo'],
            ['NORUEGA', 'Fiordes e aurora boreal'], ['ARGENTINA', 'Vizinho do sul e rival no futebol'],
            ['MARROCOS', 'Deserto e cidades de barro vermelho'], ['AUSTRALIA', 'Cangurus e coalas'],
            ['ISLANDIA', 'Gêiseres e vulcões no norte gelado'], ['TAILANDIA', 'Templos dourados e comida picante'],
            ['MEXICO', 'Taco, mariachi e pirâmides maias'], ['GRECIA', 'Deuses do Olimpo e ilhas brancas']
        ]
    },
    profissoes: {
        nome: 'Profissões', emoji: '🧰', palavras: [
            ['PEDREIRO', 'Levanta parede e assenta tijolo'], ['ENFERMEIRO', 'Cuida do paciente no hospital'],
            ['COZINHEIRO', 'Comanda a panela'], ['ADVOGADO', 'Defende causa no tribunal'],
            ['ELETRICISTA', 'Resolve o curto-circuito'], ['JORNALISTA', 'Apura e conta a notícia'],
            ['VETERINARIO', 'Médico dos bichos'], ['CARTEIRO', 'Entrega correspondência'],
            ['MARCENEIRO', 'Trabalha a madeira com capricho'], ['DENTISTA', 'Cuida do sorriso'],
            ['PROFESSOR', 'Dá aula e corrige prova'], ['MECANICO', 'Conserta motor e faz revisão']
        ]
    },
    objetos: {
        nome: 'Objetos de casa', emoji: '🪑', palavras: [
            ['GELADEIRA', 'Mantém a comida fria'], ['VASSOURA', 'Varre o chão'],
            ['TRAVESSEIRO', 'Apoia a cabeça na cama'], ['LIQUIDIFICADOR', 'Bate vitamina e molho'],
            ['ARMARIO', 'Guarda roupa e louça'], ['TORNEIRA', 'Abre e fecha a água'],
            ['ESPELHO', 'Mostra você de volta'], ['CORTINA', 'Cobre a janela'],
            ['VENTILADOR', 'Gira e faz vento'], ['TAPETE', 'Fica no chão da sala'],
            ['ESCADA', 'Ajuda a alcançar o alto'], ['CHALEIRA', 'Ferve a água do café']
        ]
    },
    esportes: {
        nome: 'Esportes', emoji: '🏐', palavras: [
            ['NATACAO', 'Disputado dentro da piscina'], ['CAPOEIRA', 'Luta e dança com berimbau'],
            ['HANDEBOL', 'Sete de cada lado, gol com a mão'], ['ATLETISMO', 'Correr, saltar e arremessar'],
            ['VOLEI', 'Rede alta e três toques'], ['SURFE', 'Prancha e onda'],
            ['CICLISMO', 'Pedala longas distâncias'], ['BOXE', 'Luvas e assaltos no ringue'],
            ['GINASTICA', 'Solo, trave e argolas'], ['REMO', 'Barco e remadas no rio'],
            ['JUDO', 'Quimono, faixa e projeção'], ['SKATE', 'Manobras sobre quatro rodas']
        ]
    },
    comidas: {
        nome: 'Comidas', emoji: '🍛', palavras: [
            ['FEIJOADA', 'Feijão preto com várias carnes'], ['LASANHA', 'Massa em camadas com molho'],
            ['COXINHA', 'Salgado em forma de gota'], ['ESTROGONOFE', 'Creme com carne e batata palha'],
            ['PANQUECA', 'Massa fina enrolada com recheio'], ['CUSCUZ', 'Milho cozido no vapor'],
            ['ESCONDIDINHO', 'Carne por baixo, purê por cima'], ['TAPIOCA', 'Goma de mandioca na chapa'],
            ['MOQUECA', 'Peixe na panela de barro'], ['RISOTO', 'Arroz cremoso italiano'],
            ['PASTEL', 'Frito na feira de domingo'], ['BRIGADEIRO', 'Doce de chocolate com granulado']
        ]
    },
    cores: {
        nome: 'Cores e tons', emoji: '🎨', palavras: [
            ['VERMELHO', 'Cor do sangue e do amor'], ['AMARELO', 'Cor do sol do meio-dia'],
            ['TURQUESA', 'Entre o azul e o verde'], ['LARANJA', 'Nome de cor e de fruta'],
            ['VIOLETA', 'Roxo claro, nome de flor'], ['DOURADO', 'Cor do ouro'],
            ['MARROM', 'Cor da terra e do chocolate'], ['PRATEADO', 'Cor da prata'],
            ['ROSA', 'Cor do algodão-doce'], ['BEGE', 'Claro, entre o branco e o marrom'],
            ['VERDE', 'Cor da mata'], ['AZUL', 'Cor do céu limpo']
        ]
    },
    corpo: {
        nome: 'Corpo humano', emoji: '🫁', palavras: [
            ['CLAVICULA', 'Osso entre o ombro e o pescoço'], ['PULMAO', 'Enche de ar quando respira'],
            ['ESTOMAGO', 'Recebe a comida depois do esôfago'], ['CEREBRO', 'Centro de comando do corpo'],
            ['TORNOZELO', 'Junta entre o pé e a perna'], ['COTOVELO', 'Dobra do braço'],
            ['PANCREAS', 'Produz a insulina'], ['INTESTINO', 'Longo tubo que absorve nutrientes'],
            ['JOELHO', 'Dobra da perna'], ['FIGADO', 'Filtra e guarda energia'],
            ['CORACAO', 'Bate e bombeia o sangue'], ['OMBRO', 'Onde o braço encontra o tronco']
        ]
    },
    natureza: {
        nome: 'Natureza', emoji: '🌳', palavras: [
            ['CACHOEIRA', 'Água que despenca da pedra'], ['RELAMPAGO', 'Risca de luz na tempestade'],
            ['VULCAO', 'Montanha que cospe lava'], ['ORVALHO', 'Gotas de manhã na folha'],
            ['DESERTO', 'Areia até onde a vista alcança'], ['FLORESTA', 'Mata fechada e cheia de vida'],
            ['NEBLINA', 'Nuvem baixa que cobre a estrada'], ['ARCOIRIS', 'Sete cores depois da chuva'],
            ['GEADA', 'Gelo fino sobre o campo de madrugada'], ['MANGUE', 'Lama, raiz e caranguejo'],
            ['DUNA', 'Morro de areia moldado pelo vento'], ['PENHASCO', 'Parede de pedra à beira do abismo']
        ]
    },
    tecnologia: {
        nome: 'Tecnologia', emoji: '🔌', palavras: [
            ['TECLADO', 'Tem teclas e digita'], ['IMPRESSORA', 'Passa o arquivo para o papel'],
            ['ROTEADOR', 'Espalha a internet pela casa'], ['PROCESSADOR', 'Cérebro do computador'],
            ['NOTEBOOK', 'Computador que dobra e viaja'], ['BLUETOOTH', 'Liga fone sem fio'],
            ['SERVIDOR', 'Máquina que atende muita gente'], ['ALGORITMO', 'Receita de passos para resolver algo'],
            ['NAVEGADOR', 'Programa que abre sites'], ['PENDRIVE', 'Memória portátil de bolso'],
            ['SATELITE', 'Fica em órbita retransmitindo sinal'], ['SENHA', 'Segredo que destranca a conta']
        ]
    },
    musica: {
        nome: 'Música', emoji: '🎼', palavras: [
            ['SANFONA', 'Fole do forró'], ['BERIMBAU', 'Arame, cabaça e roda de capoeira'],
            ['VIOLAO', 'Seis cordas e roda de amigos'], ['PANDEIRO', 'Platinela e samba'],
            ['TROMBONE', 'Sopro de vara que desliza'], ['BATERIA', 'Caixa, bumbo e pratos'],
            ['CAVAQUINHO', 'Pequeno, de quatro cordas'], ['SAXOFONE', 'Sopro curvado do jazz'],
            ['TAMBORIM', 'Pequeno e agudo na bateria da escola'], ['ZABUMBA', 'Tambor grave do baião'],
            ['TECLADO', 'Teclas brancas e pretas'], ['FLAUTA', 'Sopro fino do choro']
        ]
    }
}

// ─── Bancos de língua ───────────────────────────────────────────────────────

const SOLETRAR = [
    ['EXCECAO', 'abertura fora da regra'], ['BENEFICENTE', 'que faz o bem sem lucro'],
    ['PRIVILEGIO', 'vantagem concedida a poucos'], ['ADVOGADO', 'quem defende no tribunal'],
    ['ESTUPEFATO', 'muito espantado'], ['CONSCIENCIA', 'noção do que se faz'],
    ['MEXERICO', 'fofoca de vizinho'], ['ABSTER', 'deixar de fazer por vontade própria'],
    ['ENXERGAR', 'ver com os olhos'], ['ASCENSAO', 'ato de subir'],
    ['OBSESSAO', 'ideia que não sai da cabeça'], ['PARALELEPIPEDO', 'pedra da rua antiga'],
    ['RUBORIZAR', 'ficar vermelho de vergonha'], ['SUSCETIVEL', 'que se afeta com facilidade'],
    ['XICARA', 'copo pequeno com asa'], ['MISCIGENACAO', 'mistura de povos'],
    ['HESITAR', 'ficar em dúvida antes de agir'], ['MEIRINHO', 'antigo oficial de justiça'],
    ['ESTRANGEIRO', 'quem vem de outro país'], ['CATASTROFE', 'desastre grande']
]

const PROVERBIOS = [
    ['Quem não tem cão', 'caça com gato'], ['Água mole em pedra dura', 'tanto bate até que fura'],
    ['Quem semeia vento', 'colhe tempestade'], ['A pressa é', 'inimiga da perfeição'],
    ['De grão em grão', 'a galinha enche o papo'], ['Casa de ferreiro', 'espeto de pau'],
    ['Quem com ferro fere', 'com ferro será ferido'], ['Filho de peixe', 'peixinho é'],
    ['Antes só', 'do que mal acompanhado'], ['Cada macaco', 'no seu galho'],
    ['Mais vale um pássaro na mão', 'do que dois voando'], ['Quem ri por último', 'ri melhor'],
    ['Em terra de cego', 'quem tem um olho é rei'], ['Não adianta chorar', 'sobre o leite derramado'],
    ['O barato', 'sai caro'], ['Quem tudo quer', 'tudo perde'],
    ['Deus ajuda', 'quem cedo madruga'], ['Amigos amigos', 'negócios à parte'],
    ['Diga-me com quem andas', 'que te direi quem és'], ['Onde há fumaça', 'há fogo'],
    ['Quem espera', 'sempre alcança'], ['O seguro', 'morreu de velho'],
    ['Um dia da caça', 'outro do caçador'], ['Quem não arrisca', 'não petisca']
]

const FRASES = [
    ['A união faz a ___', 'FORCA'], ['Quem cala ___', 'CONSENTE'],
    ['O sol nasce para ___', 'TODOS'], ['Mais vale tarde do que ___', 'NUNCA'],
    ['Nem tudo que reluz é ___', 'OURO'], ['Devagar se vai ao ___', 'LONGE'],
    ['Cada um sabe onde o sapato ___', 'APERTA'], ['Quem avisa amigo ___', 'E'],
    ['A esperança é a última que ___', 'MORRE'], ['Um por todos e todos por ___', 'UM'],
    ['O que os olhos não veem o coração não ___', 'SENTE'], ['A ocasião faz o ___', 'LADRAO'],
    ['Roupa suja se lava em ___', 'CASA'], ['Quem tem boca vai a ___', 'ROMA'],
    ['Mais vale um gosto do que três ___', 'VINTENS'], ['Há males que vêm para ___', 'BEM'],
    ['Em boca fechada não entra ___', 'MOSCA'], ['Depois da tempestade vem a ___', 'BONANCA'],
    ['Gato escaldado tem medo de água ___', 'FRIA'], ['Quem não tem colírio usa ___', 'OCULOS']
]

const SINONIMOS = [
    ['ALEGRE', ['FELIZ', 'CONTENTE', 'JOVIAL', 'RADIANTE']], ['RAPIDO', ['VELOZ', 'LIGEIRO', 'APRESSADO', 'AGIL']],
    ['BONITO', ['BELO', 'LINDO', 'FORMOSO', 'ATRAENTE']], ['CASA', ['LAR', 'RESIDENCIA', 'MORADIA', 'HABITACAO']],
    ['FORTE', ['ROBUSTO', 'VIGOROSO', 'POTENTE', 'RESISTENTE']], ['CALMO', ['TRANQUILO', 'SERENO', 'PLACIDO', 'QUIETO']],
    ['DIFICIL', ['ARDUO', 'COMPLICADO', 'PENOSO', 'COMPLEXO']], ['ESPERTO', ['ASTUTO', 'SAGAZ', 'PERSPICAZ', 'VIVO']],
    ['MEDO', ['TEMOR', 'RECEIO', 'PAVOR', 'SUSTO']], ['TRISTE', ['ABATIDO', 'MELANCOLICO', 'PESAROSO', 'DESANIMADO']],
    ['GRANDE', ['ENORME', 'VASTO', 'AMPLO', 'IMENSO']], ['FALAR', ['DIZER', 'CONVERSAR', 'COMENTAR', 'EXPRESSAR']],
    ['ANDAR', ['CAMINHAR', 'PERCORRER', 'MARCHAR', 'PASSEAR']], ['COMECAR', ['INICIAR', 'PRINCIPIAR', 'ABRIR', 'ESTREAR']],
    ['ANTIGO', ['VELHO', 'REMOTO', 'ARCAICO', 'ANCESTRAL']], ['RICO', ['ABASTADO', 'PROSPERO', 'OPULENTO', 'ENDINHEIRADO']],
    ['SILENCIO', ['QUIETUDE', 'CALADA', 'MUDEZ', 'SOSSEGO']], ['AMIGO', ['COMPANHEIRO', 'CAMARADA', 'PARCEIRO', 'ALIADO']],
    ['SUJO', ['IMUNDO', 'ENCARDIDO', 'MANCHADO', 'SORDIDO']], ['CANSADO', ['EXAUSTO', 'FATIGADO', 'ESGOTADO', 'ABATIDO']],
    ['CERTO', ['CORRETO', 'EXATO', 'PRECISO', 'ACERTADO']], ['BARULHO', ['RUIDO', 'ESTARDALHACO', 'ALGAZARRA', 'ESTRONDO']],
    ['PEQUENO', ['MINUSCULO', 'DIMINUTO', 'REDUZIDO', 'MIUDO']], ['TRABALHO', ['LABOR', 'OFICIO', 'SERVICO', 'TAREFA']]
]

const ANTONIMOS = [
    ['ALEGRE', ['TRISTE', 'INFELIZ', 'ABATIDO']], ['RAPIDO', ['LENTO', 'VAGAROSO', 'DEMORADO']],
    ['CLARO', ['ESCURO', 'SOMBRIO', 'TURVO']], ['CHEIO', ['VAZIO', 'OCO', 'DESOCUPADO']],
    ['QUENTE', ['FRIO', 'GELADO', 'GLACIAL']], ['SUBIR', ['DESCER', 'BAIXAR', 'CAIR']],
    ['ENTRAR', ['SAIR', 'PARTIR', 'RETIRAR']], ['FORTE', ['FRACO', 'DEBIL', 'FRAGIL']],
    ['AMOR', ['ODIO', 'RANCOR', 'AVERSAO']], ['VERDADE', ['MENTIRA', 'FALSIDADE', 'ENGANO']],
    ['COMECO', ['FIM', 'TERMINO', 'DESFECHO']], ['GRANDE', ['PEQUENO', 'DIMINUTO', 'MIUDO']],
    ['LEMBRAR', ['ESQUECER', 'OLVIDAR', 'OMITIR']], ['ABRIR', ['FECHAR', 'TRANCAR', 'CERRAR']],
    ['RICO', ['POBRE', 'MISERAVEL', 'NECESSITADO']], ['LIMPO', ['SUJO', 'IMUNDO', 'ENCARDIDO']],
    ['DIA', ['NOITE', 'ESCURIDAO', 'TREVAS']], ['PERTO', ['LONGE', 'DISTANTE', 'AFASTADO']],
    ['DURO', ['MOLE', 'MACIO', 'FLEXIVEL']], ['GANHAR', ['PERDER', 'FRACASSAR', 'AMARGAR']],
    ['CERTO', ['ERRADO', 'INCORRETO', 'EQUIVOCADO']], ['SIMPLES', ['COMPLEXO', 'COMPLICADO', 'DIFICIL']],
    ['CALMO', ['AGITADO', 'NERVOSO', 'INQUIETO']], ['NOVO', ['VELHO', 'ANTIGO', 'USADO']]
]

const CHARADAS = [
    ['O que é que quanto mais se tira, maior fica?', 'BURACO'],
    ['O que é que anda com os pés na cabeça?', 'PIOLHO'],
    ['O que é que tem cabeça e não tem corpo?', 'ALFINETE'],
    ['O que é que cai em pé e corre deitado?', 'CHUVA'],
    ['O que é que tem dente mas não morde?', 'PENTE'],
    ['O que é que sobe e desce e fica sempre no mesmo lugar?', 'ESCADA'],
    ['O que é que está sempre na sua frente mas você não vê?', 'FUTURO'],
    ['O que é que quebra quando se fala o nome dele?', 'SILENCIO'],
    ['O que é que tem agulha mas não costura?', 'RELOGIO'],
    ['O que é que tem asas e não voa, tem bico e não bica?', 'BULE'],
    ['O que é que anda o dia inteiro e não sai do lugar?', 'RELOGIO DE PAREDE'],
    ['O que é que fica mais perto quanto mais você corre?', 'CANSACO'],
    ['O que é que entra na água e não se molha?', 'SOMBRA'],
    ['O que é que tem olho mas não enxerga?', 'AGULHA'],
    ['O que é que vai até a porta da casa e não entra?', 'CAMINHO'],
    ['O que é que come com a boca e guarda na barriga?', 'ESTOMAGO'],
    ['O que é que tem coroa e não é rei?', 'ABACAXI'],
    ['O que é que tem perna e não anda?', 'MESA'],
    ['O que é que está no meio do ovo?', 'LETRA V'],
    ['O que é que é seu mas os outros usam mais que você?', 'NOME']
]

const ENIGMAS = [
    ['Tenho cidades mas nenhuma casa, montanhas sem pedra e água sem peixe. O que sou?', 'MAPA'],
    ['Quanto mais você me tira, mais eu apareço. O que sou?', 'PEGADA'],
    ['Falo sem boca e escuto sem ouvido. Ganho vida com o vento. O que sou?', 'ECO'],
    ['Sou leve como pena, mas ninguém segura por muito tempo. O que sou?', 'RESPIRACAO'],
    ['Me quebram antes de usar. O que sou?', 'OVO'],
    ['Tenho chaves mas não abro portas, tenho espaço mas não tem sala. O que sou?', 'TECLADO'],
    ['Viajo o mundo inteiro parado num canto. O que sou?', 'SELO'],
    ['Quanto mais seco fico, mais molhado estive. O que sou?', 'TOALHA'],
    ['Nasço grande e morro pequeno, e choro cera. O que sou?', 'VELA'],
    ['Tenho dentes de metal e mordo papel sem comer. O que sou?', 'GRAMPEADOR'],
    ['Passo o dia de boca aberta e só falo quando me batem. O que sou?', 'TAMBOR'],
    ['Corro sem pernas e murmuro sem boca. O que sou?', 'RIO'],
    ['Sou destruído toda vez que sou dito. O que sou?', 'SEGREDO'],
    ['Tenho páginas mas não sou árvore, guardo histórias sem viver nenhuma. O que sou?', 'LIVRO'],
    ['Só existo enquanto houver luz e algo para bloquear. O que sou?', 'SOMBRA'],
    ['Subo e desço sem sair do prédio. O que sou?', 'ELEVADOR'],
    ['Meço o tempo sem contar, e viro quando acabo. O que sou?', 'AMPULHETA'],
    ['Quanto mais peso carrego, mais fundo afundo, mas nunca me molho por dentro. O que sou?', 'BARCO'],
    ['Tenho anéis mas não tenho dedos. O que sou?', 'TRONCO DE ARVORE'],
    ['Apareço uma vez no minuto, duas no momento e nenhuma em cem anos. O que sou?', 'LETRA M']
]

const OQUEEOQUEE = [
    ['O que é, o que é: cai em pé e corre deitado?', 'CHUVA'],
    ['O que é, o que é: tem escamas mas não é peixe, tem coroa mas não é rei?', 'ABACAXI'],
    ['O que é, o que é: quanto mais quente, mais fresco fica?', 'PAO'],
    ['O que é, o que é: tem capa mas não é livro, tem folha mas não é árvore?', 'CADERNO'],
    ['O que é, o que é: anda de cabeça para baixo e não reclama?', 'PREGO NA PAREDE'],
    ['O que é, o que é: tem bico mas não canta, tem asa mas não voa?', 'CHALEIRA'],
    ['O que é, o que é: de dia tem quatro pés e de noite tem seis?', 'CAMA COM PESSOA'],
    ['O que é, o que é: está no fim da rua e no começo da roça?', 'LETRA R'],
    ['O que é, o que é: quanto mais se anda, menos se tem?', 'CAMINHO A PERCORRER'],
    ['O que é, o que é: tem barriga e não tem umbigo?', 'GARRAFA'],
    ['O que é, o que é: fala todas as línguas sem estudar nenhuma?', 'ECO'],
    ['O que é, o que é: tem cabeça, tem pé, mas não tem corpo?', 'CAMA'],
    ['O que é, o que é: sempre vem mas nunca chega?', 'AMANHA'],
    ['O que é, o que é: fica cheio de olhos e não vê nada?', 'QUEIJO'],
    ['O que é, o que é: nasce sem pai nem mãe e morre com o sol?', 'ORVALHO'],
    ['O que é, o que é: tem pescoço e não tem cabeça, tem dois braços e nenhuma mão?', 'CAMISA'],
    ['O que é, o que é: quanto mais escuro fica, mais se enxerga longe?', 'CEU ESTRELADO'],
    ['O que é, o que é: todo mundo carrega e ninguém pesa?', 'SOBRENOME'],
    ['O que é, o que é: tem raiz mas não é planta, e cresce todo mês?', 'CABELO'],
    ['O que é, o que é: passa a vida deitado e faz a casa em pé?', 'TIJOLO']
]

const TRAVALINGUAS = [
    'O rato roeu a roupa do rei de Roma',
    'Três pratos de trigo para três tigres tristes',
    'A aranha arranha a rã e a rã arranha a aranha',
    'O peito do pé de Pedro é preto',
    'Um ninho de mafagafos com sete mafagafinhos',
    'O doce perguntou ao doce qual o doce mais doce',
    'Bagre branco bebe bastante barro bom',
    'Casa suja chão sujo porta suja parede suja',
    'Sabia que o sabiá sabia assobiar',
    'Num prato de prata pousou uma pata parda',
    'Larga a lata lá longe Lucrecia',
    'O caju do Juca e a jaca do Cajuca'
]

const STOP_CATEGORIAS = [
    'Nome', 'Animal', 'Cidade', 'Comida', 'Cor', 'Objeto', 'Profissão', 'Fruta',
    'País', 'Marca', 'Filme', 'Time de futebol', 'Parte do corpo', 'Instrumento musical',
    'Palavra em inglês', 'Personagem famoso', 'Bebida', 'Planta', 'Esporte', 'Móvel'
]

const PALAVRA_PROIBIDA = [
    ['FUTEBOL', ['bola', 'gol', 'time', 'campo', 'jogador']],
    ['PRAIA', ['areia', 'mar', 'sol', 'onda', 'guarda-sol']],
    ['CARNAVAL', ['fantasia', 'bloco', 'samba', 'folia', 'fevereiro']],
    ['CELULAR', ['telefone', 'aplicativo', 'tela', 'ligar', 'bateria']],
    ['CHURRASCO', ['carne', 'carvão', 'espeto', 'grelha', 'domingo']],
    ['ESCOLA', ['aula', 'professor', 'aluno', 'prova', 'caderno']],
    ['CASAMENTO', ['noiva', 'igreja', 'aliança', 'festa', 'vestido']],
    ['HOSPITAL', ['médico', 'doente', 'remédio', 'enfermeira', 'cama']],
    ['CHUVA', ['água', 'guarda-chuva', 'molhar', 'nuvem', 'trovão']],
    ['CAFE', ['xícara', 'manhã', 'coado', 'quente', 'grão']],
    ['NATAL', ['presente', 'árvore', 'papai noel', 'dezembro', 'ceia']],
    ['ANIVERSARIO', ['bolo', 'vela', 'parabéns', 'festa', 'idade']],
    ['CACHORRO', ['latir', 'osso', 'pet', 'rabo', 'coleira']],
    ['DINHEIRO', ['nota', 'banco', 'pagar', 'moeda', 'carteira']],
    ['MUSICA', ['som', 'cantar', 'letra', 'ritmo', 'banda']],
    ['VIAGEM', ['mala', 'avião', 'hotel', 'passagem', 'destino']],
    ['ACADEMIA', ['peso', 'treino', 'músculo', 'esteira', 'suor']],
    ['CINEMA', ['filme', 'pipoca', 'tela', 'sessão', 'ingresso']],
    ['INTERNET', ['site', 'rede', 'wifi', 'navegar', 'conexão']],
    ['INVERNO', ['frio', 'casaco', 'estação', 'neve', 'junho']]
]

// ─── Bancos das brincadeiras de grupo ───────────────────────────────────────

const VERDADES = [
    'Qual foi a mentira mais boba que você contou este mês?',
    'Qual música você canta no banho e jura que ninguém ouve?',
    'Qual foi a maior vergonha que você passou na escola?',
    'Você já fingiu gostar de um presente? Qual foi?',
    'Qual conversa deste grupo você já mostrou para outra pessoa?',
    'Qual foi a coisa mais cara que você comprou por impulso?',
    'Qual é o seu maior medo que quase ninguém conhece?',
    'Você já mandou mensagem para a pessoa errada? Conta.',
    'Qual hábito seu você esconde das visitas?',
    'Qual foi a desculpa mais esfarrapada que você deu para não sair?',
    'Qual série você abandonou no meio e mentiu dizendo que viu tudo?',
    'Qual foi a última vez que você chorou e por quê?',
    'Você já comeu algo do chão? Quanto tempo ficou lá?',
    'Qual apelido você odiava na infância?',
    'Qual é a coisa mais estranha que você já procurou na internet?',
    'Você já dormiu em aula ou no trabalho? Onde?',
    'Qual promessa de ano-novo você quebrou mais rápido?',
    'Qual foi a pior comida que você já fez para alguém?',
    'Você já stalkeou o perfil de alguém por mais de uma hora?',
    'Qual segredo bobo você guarda até hoje?',
    'Qual foi o maior mico que você pagou em público?',
    'Qual assunto faz você fingir que entende?',
    'Você já mentiu a idade? Para quem e por quê?',
    'Qual presente você reciclou e deu para outra pessoa?'
]

const DESAFIOS = [
    'Mande um áudio cantando o refrão da primeira música que tocar no seu celular.',
    'Escreva as próximas três mensagens só com emoji.',
    'Troque sua foto de perfil por uma foto de comida por uma hora.',
    'Mande um áudio imitando alguém do grupo.',
    'Conte uma história de trinta segundos sem usar a letra A.',
    'Mande um print do seu último pedido de comida.',
    'Fale por um minuto com sotaque de outra região.',
    'Mande uma foto do que está na sua frente agora.',
    'Escreva um elogio sincero para a pessoa que falou antes de você.',
    'Conte a quinta foto da sua galeria e descreva sem mostrar.',
    'Mande um áudio contando até vinte em outra língua, mesmo inventando.',
    'Escreva uma poesia de quatro linhas sobre o grupo.',
    'Ligue para alguém do grupo e cante parabéns sem motivo.',
    'Mande um áudio rindo por dez segundos sem parar.',
    'Diga três coisas que você faria com um milhão de moedas de ouro.',
    'Mande a última mensagem que você recebeu de um desconhecido.',
    'Conte uma piada e aceite o silêncio se ninguém rir.',
    'Faça um resumo da sua semana em cinco palavras.',
    'Mande uma foto imitando a pose de uma estátua.',
    'Invente um nome de time e diga o capitão dele.',
    'Escreva a próxima mensagem de trás para frente.',
    'Mande um áudio narrando seu dia como se fosse jogo de futebol.',
    'Descreva seu pior defeito como se fosse qualidade.',
    'Conte até dez mudando de voz em cada número.'
]

const EU_NUNCA = [
    'Eu nunca fingi estar doente para faltar.',
    'Eu nunca chorei vendo desenho animado.',
    'Eu nunca deixei alguém no vácuo de propósito.',
    'Eu nunca comi algo que caiu no chão.',
    'Eu nunca dormi durante um filme no cinema.',
    'Eu nunca cantei em público sem saber a letra.',
    'Eu nunca esqueci o aniversário de alguém próximo.',
    'Eu nunca menti sobre já ter assistido a um clássico.',
    'Eu nunca mandei mensagem de madrugada e me arrependi.',
    'Eu nunca tomei banho de chuva de propósito.',
    'Eu nunca me perdi numa cidade nova.',
    'Eu nunca falei mal da comida e comi tudo mesmo assim.',
    'Eu nunca dancei sozinho na frente do espelho.',
    'Eu nunca fugi de uma ligação apertando recusar.',
    'Eu nunca inventei uma palavra e usei como se existisse.',
    'Eu nunca chorei de tanto rir em lugar silencioso.',
    'Eu nunca quebrei algo e fingi que não fui eu.',
    'Eu nunca levei bolo de alguém.',
    'Eu nunca dormi em pé de tanto cansaço.',
    'Eu nunca cheguei atrasado e culpei o trânsito sem trânsito.',
    'Eu nunca segui alguém nas redes só para observar.',
    'Eu nunca cozinhei algo que ninguém quis comer.'
]

const VOCE_PREFERE = [
    ['viver sem internet por um ano', 'viver sem música por um ano'],
    ['ter dinheiro infinito e nenhum amigo', 'ter muitos amigos e viver apertado'],
    ['saber a data da sua morte', 'saber a causa da sua morte'],
    ['poder voar devagar', 'ficar invisível por dez minutos por dia'],
    ['comer só doce pelo resto da vida', 'comer só salgado pelo resto da vida'],
    ['nunca mais sentir frio', 'nunca mais sentir calor'],
    ['ler pensamentos', 'ver dois minutos do futuro'],
    ['morar na praia sem ar-condicionado', 'morar na serra sem aquecedor'],
    ['ter fama sem dinheiro', 'ter dinheiro sem ninguém te conhecer'],
    ['falar todas as línguas', 'tocar todos os instrumentos'],
    ['viajar para o passado sem voltar', 'viajar para o futuro sem voltar'],
    ['perder todas as fotos antigas', 'perder todas as conversas antigas'],
    ['trabalhar no que ama ganhando pouco', 'odiar o trabalho ganhando muito'],
    ['ter sempre a resposta certa e ninguém acreditar', 'estar sempre errado e todos confiarem'],
    ['dormir doze horas por dia', 'dormir três horas e nunca cansar'],
    ['viver sem café', 'viver sem refrigerante'],
    ['ser o mais engraçado do grupo', 'ser o mais confiável do grupo'],
    ['ter uma memória perfeita', 'esquecer o que te machuca'],
    ['ser famoso na internet por algo ridículo', 'ser desconhecido fazendo algo genial'],
    ['comer no melhor restaurante uma vez por ano', 'comer bem em casa todo dia']
]

const MAIS_PROVAVEL = [
    'Quem é mais provável de chegar atrasado no próprio casamento?',
    'Quem é mais provável de virar milionário do nada?',
    'Quem é mais provável de adotar dez gatos?',
    'Quem é mais provável de sumir do grupo por um mês?',
    'Quem é mais provável de cantar no karaokê sem ser chamado?',
    'Quem é mais provável de esquecer o celular em casa?',
    'Quem é mais provável de comprar algo caro por impulso?',
    'Quem é mais provável de ficar amigo de um desconhecido no ônibus?',
    'Quem é mais provável de largar tudo e viajar sem avisar?',
    'Quem é mais provável de responder mensagem só três dias depois?',
    'Quem é mais provável de virar chef de cozinha?',
    'Quem é mais provável de chorar assistindo a propaganda?',
    'Quem é mais provável de se perder usando mapa?',
    'Quem é mais provável de discutir por causa de futebol?',
    'Quem é mais provável de dormir em festa?',
    'Quem é mais provável de virar influenciador?',
    'Quem é mais provável de esquecer o nome de alguém na hora de apresentar?',
    'Quem é mais provável de brigar com a impressora?',
    'Quem é mais provável de contar o final do filme sem querer?',
    'Quem é mais provável de fazer amizade com o garçom?'
]

const MIMICA = {
    filmes: { nome: 'Filmes', emoji: '🎬', itens: ['Titanic', 'Rei Leão', 'Homem-Aranha', 'Tubarão', 'Frozen', 'Matrix', 'Velozes e Furiosos', 'Procurando Nemo', 'Jurassic Park', 'Cidade de Deus', 'Toy Story', 'Piratas do Caribe'] },
    profissoes: { nome: 'Profissões', emoji: '🧰', itens: ['dentista', 'pedreiro', 'garçom', 'bombeiro', 'cabeleireiro', 'piloto de avião', 'professor', 'açougueiro', 'juiz de futebol', 'costureira', 'motorista de ônibus', 'jardineiro'] },
    animais: { nome: 'Bichos', emoji: '🐒', itens: ['gorila', 'cobra', 'canguru', 'pinguim', 'caranguejo', 'elefante', 'galinha', 'sapo', 'águia', 'preguiça', 'cavalo', 'gato assustado'] },
    acoes: { nome: 'Ações do dia', emoji: '🧹', itens: ['passar roupa', 'lavar louça', 'trocar pneu', 'fazer bolo', 'tomar banho de chuva', 'perder o ônibus', 'jogar videogame', 'tirar selfie', 'pescar', 'dançar forró', 'pintar parede', 'acordar atrasado'] }
}

const HISTORIA_INICIOS = [
    'Era uma vez um vestiário onde o craque jurava que a bola falava.',
    'Ninguém no vilarejo lembrava quem tinha trancado o portão do moinho.',
    'O carteiro entregou uma carta endereçada a alguém que ainda não nasceu.',
    'A lua sumiu do céu e só o cachorro do ferreiro percebeu.',
    'O mapa marcava um tesouro exatamente embaixo da padaria.',
    'Todo dia às três da tarde o relógio da praça tocava quatro vezes.',
    'Um viajante chegou pedindo água e pagou com uma moeda quente.',
    'A ponte velha começou a assobiar quando ninguém passava.',
    'O espelho da estalagem mostrava o dia seguinte em vez do rosto.',
    'Na feira apareceu uma barraca que ninguém tinha visto montar.',
    'O poço secou e no fundo havia uma porta de madeira.',
    'A galinha do vizinho botou um ovo com um bilhete dentro.'
]

const JURI_CASOS = [
    'Comer o último pedaço de bolo sem perguntar: crime ou direito?',
    'Responder mensagem com "kkk" e nada mais: preguiça ou simpatia?',
    'Colocar abacaxi na pizza: liberdade ou heresia?',
    'Cortar o rodízio antes da sobremesa chegar: erro grave?',
    'Chegar quinze minutos atrasado é atraso ou tolerância?',
    'Mandar dez áudios seguidos de um minuto: aceitável?',
    'Dar spoiler três dias depois da estreia: inocente ou culpado?',
    'Pegar batata frita do prato alheio sem pedir: costume ou roubo?',
    'Sair do grupo sem avisar: covardia ou paz de espírito?',
    'Colocar ketchup na feijoada: caso de expulsão?',
    'Não devolver o livro emprestado em dois anos: esquecimento?',
    'Postar foto do grupo sem autorização: crime social?',
    'Ler a mensagem e responder só no dia seguinte: culpado?',
    'Usar chinelo em festa de casamento: ousadia ou desrespeito?',
    'Contar o final da série no grupo: perdão possível?'
]

const ELEICAO_CARGOS = [
    ['Capitão do time', 'quem organiza tudo e ninguém sabe como'],
    ['Cozinheiro-chefe', 'quem alimentaria o grupo inteiro sem reclamar'],
    ['Guarda do portão', 'quem barraria estranho com mais firmeza'],
    ['Contador de histórias', 'quem segura a atenção de todo mundo'],
    ['Tesoureiro', 'quem cuidaria do dinheiro sem sumir com ele'],
    ['Juiz de paz', 'quem apaga briga antes de virar incêndio'],
    ['Mensageiro', 'quem responde mais rápido no grupo'],
    ['Bardo oficial', 'quem canta mesmo desafinado'],
    ['Curandeiro', 'quem sempre tem o remédio certo na bolsa'],
    ['Explorador', 'quem toparia qualquer viagem de última hora'],
    ['Despertador do grupo', 'quem acorda mais cedo'],
    ['Advogado da causa perdida', 'quem defende qualquer ideia até o fim']
]

const RANKING_TITULOS = [
    ['Mais pontual', 'chega antes de todo mundo'],
    ['Mais enrolado', 'promete e não aparece'],
    ['Mais engraçado', 'salva qualquer conversa parada'],
    ['Mais dramático', 'transforma tropeço em tragédia'],
    ['Mais generoso', 'divide o último pedaço'],
    ['Mais teimoso', 'não muda de ideia nem sob tortura'],
    ['Mais dorminhoco', 'some às dez da noite'],
    ['Mais fofoqueiro', 'sabe de tudo antes de todos'],
    ['Mais organizado', 'tem planilha até para churrasco'],
    ['Mais perdido', 'pergunta onde é a festa na porta da festa'],
    ['Mais corajoso', 'encara qualquer desafio bobo'],
    ['Mais calmo', 'nunca perde a paciência'],
    ['Mais sortudo', 'ganha até rifa que não comprou'],
    ['Mais guloso', 'come antes de servir'],
    ['Mais saudoso', 'manda foto antiga toda semana']
]

const CONFISSOES = [
    'Conte algo que você fez e nunca contou para os seus pais.',
    'Qual regra você quebra sempre e acha que ninguém nota?',
    'Qual mentira você conta para escapar de compromisso?',
    'Qual mania sua deixaria as pessoas com nojo?',
    'Qual foi a vez que você fingiu conhecer alguém para não ser rude?',
    'Qual comida você adora mas todo mundo acha estranha?',
    'Que música você ouve escondido?',
    'Qual gasto bobo você repete todo mês?',
    'Qual foi a maior bobagem que você acreditou por anos?',
    'Que coisa você ainda tem medo mesmo sendo adulto?',
    'Qual conversa você ensaiou no chuveiro e nunca teve?',
    'O que você faz quando ninguém está olhando e acha ridículo?'
]

const SUSSURRO_FRASES = [
    'O tatu-bola correu atrás do trator amarelo',
    'A avó do padeiro guardou três queijos no porão',
    'O relógio da praça atrasou catorze minutos ontem',
    'Sete sapos saltaram sobre a sela do soldado',
    'A vaca malhada comeu a manga do vizinho',
    'O pescador perdeu a rede na terceira curva do rio',
    'Doze doces de coco desapareceram da cozinha',
    'A carroça de Joana quebrou na subida da serra',
    'O gato preto dormiu dentro do baú do capitão',
    'Quarenta abelhas fizeram casa no chapéu do prefeito',
    'A chuva encheu o balde azul da varanda',
    'O ferreiro trocou o martelo por um saco de farinha'
]

const DESAFIO_RELAMPAGO = [
    'Diga cinco frutas em dez segundos.',
    'Cite três cidades que começam com a letra S.',
    'Fale o alfabeto de trás para frente até o L.',
    'Diga quatro times de futebol sem repetir estado.',
    'Cite cinco coisas que existem dentro de uma geladeira.',
    'Fale três palavras que rimam com pão.',
    'Diga cinco animais que voam.',
    'Cite três filmes que você assistiu mais de uma vez.',
    'Fale quatro profissões que usam uniforme.',
    'Diga três coisas amarelas em cinco segundos.',
    'Cite cinco nomes próprios com a letra M.',
    'Fale três instrumentos de sopro.',
    'Diga quatro comidas que levam ovo.',
    'Cite três países da América do Sul sem pensar muito.',
    'Fale cinco partes do corpo acima do pescoço.',
    'Diga três marcas de refrigerante.',
    'Cite quatro coisas que cabem no bolso.',
    'Fale três palavras com a letra Z no meio.'
]

const DUAS_VERDADES_TEMAS = [
    'viagens que você já fez', 'comidas que você detesta', 'empregos que você já teve',
    'habilidades escondidas', 'lugares onde você já dormiu', 'sustos que você já levou',
    'coisas que você já quebrou', 'apelidos que você já teve', 'shows a que você já foi',
    'bichos que você já criou', 'esportes que você já praticou', 'matérias que você odiava'
]

const PRENDAS = [
    'canta o refrão de uma música sertaneja',
    'manda um áudio dando bom dia com voz de locutor',
    'conta a piada mais sem graça que souber',
    'escreve um poema de duas linhas para o grupo',
    'imita o som de três animais em sequência',
    'manda foto do teto onde estiver agora',
    'elogia a próxima pessoa que falar',
    'fala cinco palavras difíceis sem gaguejar',
    'conta um segredo bobo da infância',
    'faz uma dancinha e descreve em texto',
    'inventa um provérbio novo na hora',
    'narra o próprio café da manhã como se fosse épico',
    'diz o nome de todo mundo do grupo de memória',
    'assume um apelido ridículo até o fim do dia',
    'manda um áudio contando até dez em ritmo de rap',
    'conta a última vez que passou vergonha'
]

// ─── Quebra-cabeças de lógica ───────────────────────────────────────────────
// Resposta curta e verificável; a dica só entra quando a pessoa erra uma vez.

const LOGICA = [
    ['Um tijolo pesa um quilo mais meio tijolo. Quanto pesa o tijolo inteiro?', '2', 'Chame o peso de x e escreva a frase como equação.'],
    ['Se três gatos pegam três ratos em três minutos, quantos minutos cem gatos levam para pegar cem ratos?', '3', 'Cada gato cuida de um rato no mesmo tempo.'],
    ['Um caracol sobe 3 metros de dia e escorrega 2 à noite, num poço de 10 metros. Em quantos dias sai?', '8', 'No último dia ele não escorrega mais.'],
    ['Você é o segundo colocado e ultrapassa o primeiro. Em que posição você fica?', '1', 'Você toma o lugar de quem ultrapassou.'],
    ['Quantas vezes o número 7 aparece de 1 a 100 escrevendo todos os números?', '20', 'Conte as unidades e as dezenas separadamente.'],
    ['Um pai tem 40 anos e o filho tem 10. Em quantos anos o pai terá o dobro da idade do filho?', '20', 'Escreva 40 mais x igual a duas vezes 10 mais x.'],
    ['Numa sala há 5 pessoas e cada uma cumprimenta as outras uma vez. Quantos cumprimentos?', '10', 'É a combinação de 5 tomados 2 a 2.'],
    ['Se você tem 6 laranjas e tira 4, com quantas você fica?', '4', 'As que você tirou ficaram com você.'],
    ['Quantos meses do ano têm 28 dias?', '12', 'Todos têm pelo menos 28.'],
    ['Um relógio bate 6 vezes em 5 segundos. Quanto tempo leva para bater 12 vezes?', '11', 'Conte os intervalos, não as badaladas.'],
    ['Metade de 2 mais 2 vezes 2 é quanto, seguindo a ordem das operações?', '5', 'Multiplicação antes da soma.'],
    ['Numa corrida você ultrapassa o último colocado. Isso é possível? Responda sim ou nao.', 'NAO', 'Não há ninguém atrás do último.'],
    ['Três pessoas dividem uma conta de 90 moedas em partes iguais. Quanto cada uma paga?', '30', 'Basta dividir por três.'],
    ['Quantos quadrados de qualquer tamanho existem num tabuleiro 2 por 2?', '5', 'Quatro pequenos e um grande.'],
    ['Um livro tem 100 páginas. Quantos algarismos são usados para numerá-las?', '192', 'Some 9 mais 180 mais 3.'],
    ['Se dobrar todo dia, uma lagoa fica cheia em 30 dias. Em que dia estava pela metade?', '29', 'Volte um passo do final.'],
    ['Quantos aniversários de verdade uma pessoa de 40 anos já teve?', '1', 'Aniversário de nascimento só existe um; o resto é comemoração.'],
    ['Quantos cortes são precisos para dividir um pão comprido em 5 pedaços?', '4', 'Cada corte cria um pedaço a mais.'],
    ['Quanto é 1 mais 1 mais 1 mais 1 vezes 0, na ordem correta das operações?', '3', 'Resolva a multiplicação primeiro.'],
    ['Um trem de 100 metros a 10 metros por segundo leva quanto para atravessar um túnel de 200 metros?', '30', 'Some o comprimento do trem ao do túnel.'],
    ['Se ontem foi terça, que dia será depois de amanhã?', 'SEXTA', 'Hoje é quarta.'],
    ['Quantas pernas há na sala com 3 cadeiras de 4 pernas e 2 pessoas sentadas?', '16', 'Conte cadeiras e pessoas.'],
    ['Numa gaveta escura há 10 meias pretas e 10 brancas. Quantas tirar para garantir um par igual?', '3', 'Com três, duas são da mesma cor.'],
    ['Qual número somado a ele mesmo e depois dividido por 2 dá 7?', '7', 'Somar e dividir por dois devolve o próprio número.'],
    ['Se um remédio deve ser tomado de 8 em 8 horas, quantos comprimidos em 24 horas?', '4', 'Conte o da hora zero também.']
]

// Palavras da forca antiga (.forca até 2026-09-18), mantidas como tema quando
// ela virou a forca por tema. Ficam FORA da TABELA do scripts/gen-jogos.js, que
// percorre FORCA em ordem para numerar os atalhos .jogoN: entram como variante
// extra, sem deslocar nenhum atalho.
FORCA.saga = {
    nome: 'Futebol e Lendas', emoji: '⚽', palavras: [
        ['GOAT', 'O maior jogador da história'], ['MARADONA', 'Lenda eterna da Argentina'],
        ['NEYMAR', 'Craque habilidoso do futebol brasileiro'], ['CRISTIANO', 'Goleador lendário de Portugal'],
        ['PELE', 'O Rei do futebol mundial'], ['COPA DO MUNDO', 'O maior torneio do planeta futebol'],
        ['BOLA DE OURO', 'Prêmio máximo individual do futebol'], ['WHATSAPP', 'O aplicativo onde você está falando comigo'],
        ['PROGRAMACAO', 'A arte de criar códigos e programas'], ['JAVASCRIPT', 'A linguagem em que eu fui escrito']
    ]
}
FORCA.mestre = {
    nome: 'Mestres', emoji: '🎓', palavras: [
        ['MESTRE', 'Quem ensina e guia'], ['MENTOR', 'Quem orienta e aconselha com experiência'],
        ['MAESTRO', 'Quem rege uma orquestra'], ['MONITOR', 'Quem acompanha uma turma'],
        ['MATEMATICO', 'Quem estuda números e demonstrações'], ['MODELO', 'Exemplo a ser seguido'],
        ['MEMORIA', 'Onde guardamos o que aprendemos'], ['MOTIVACAO', 'Força que move a gente a aprender'],
        ['MAPA', 'Desenho que mostra caminhos'], ['MUSEU', 'Lugar que guarda história e arte']
    ]
}
const TEMAS_FORCA_EXTRAS = ['saga', 'mestre']

// Bancos temáticos do "você prefere", herdados do .voceprefere (programação) e
// do .dilema (dilemas morais) quando os dois viraram temas do .dilemas.
const VOCE_PREFERE_TEMAS = {
    programacao: {
        nome: 'Programação', pares: [
            ['terminal em dark mode pra sempre', 'IDE lento pra sempre'],
            ['programar sem Stack Overflow', 'programar sem Google'],
            ['bug em produção na sexta 18h', 'merge conflict gigante na segunda'],
            ['code review de 2000 linhas', 'reunião de 3 horas'],
            ['tabs', 'espaços'],
            ['front-end pelo resto da vida', 'back-end pelo resto da vida'],
            ['ter que documentar tudo', 'ler código sem nenhum comentário'],
            ['deploy manual', 'CI que quebra do nada'],
            ['viver sem café', 'viver sem fones de ouvido'],
            ['reescrever o projeto do zero', 'manter o legado pra sempre'],
            ['perder o Ctrl+Z', 'perder o Ctrl+C/Ctrl+V'],
            ['internet de 1 Mbps estável', 'internet de 1 Gbps que cai toda hora']
        ]
    },
    moral: {
        nome: 'Dilemas morais', pares: [
            ['ter a capacidade de voar', 'ficar invisível'],
            ['voltar 10 anos no passado com toda a sua memória', 'ir 20 anos para o futuro com 10 milhões de reais'],
            ['nunca mais ter que dormir', 'nunca mais ter que comer']
        ]
    }
}

module.exports = {
    TEMAS_FORCA_EXTRAS, VOCE_PREFERE_TEMAS,
    QUIZZES, FORCA, SOLETRAR, PROVERBIOS, FRASES, SINONIMOS, ANTONIMOS,
    CHARADAS, ENIGMAS, OQUEEOQUEE, TRAVALINGUAS, STOP_CATEGORIAS, PALAVRA_PROIBIDA,
    VERDADES, DESAFIOS, EU_NUNCA, VOCE_PREFERE, MAIS_PROVAVEL, MIMICA,
    HISTORIA_INICIOS, JURI_CASOS, ELEICAO_CARGOS, RANKING_TITULOS, CONFISSOES,
    SUSSURRO_FRASES, DESAFIO_RELAMPAGO, DUAS_VERDADES_TEMAS, PRENDAS, LOGICA
}
