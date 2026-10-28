/**
 * Casa: plantas, cães, gatos e o que é perigoso para cada um.
 *
 * O campo `toxica` das plantas e a lista PERIGOS existem para responder à
 * pergunta que aparece tarde demais: "isso aqui faz mal para o meu bicho?".
 * Por isso `plantasSegurasPara` e `perigosDe` cruzam os dois catálogos.
 *
 * As fichas de raça descrevem tendências da raça, não indivíduos. Todo cão e
 * todo gato desmente a própria ficha em algum ponto, e as fichas dizem isso.
 */

const PLANTAS = {
    espadadesaojorge: {
        nome: 'Espada-de-são-jorge', luz: 'Meia-sombra a sol indireto', rega: 'A cada 15 a 20 dias',
        dificuldade: 'muito fácil', porte: 'até 1 m', toxica: true,
        cuidado: 'Aguenta esquecimento. O que mata é excesso de água: deixe o substrato secar por completo entre as regas.',
        problema: 'Folha amarelada e mole na base é raiz apodrecida por rega demais, não por falta.'
    },
    zamioculca: {
        nome: 'Zamioculca', luz: 'Meia-sombra, tolera pouca luz', rega: 'A cada 15 dias',
        dificuldade: 'muito fácil', porte: 'até 1 m', toxica: true,
        cuidado: 'Guarda água nos rizomas. Sobrevive a semanas de abandono e morre afogada em uma semana de zelo.',
        problema: 'Caule amolecido junto ao vaso: retire da terra e corte a parte podre antes de replantar.'
    },
    jiboia: {
        nome: 'Jiboia', luz: 'Meia-sombra a luz indireta', rega: '1 a 2 vezes por semana',
        dificuldade: 'fácil', porte: 'trepadeira, cresce metros', toxica: true,
        cuidado: 'Cresce em água ou terra. Podar estimula ramificação em vez de um cipó comprido e ralo.',
        problema: 'Folhas pequenas e caule longo entre elas é falta de luz.'
    },
    suculenta: {
        nome: 'Suculentas em geral', luz: 'Sol direto por algumas horas', rega: 'A cada 10 a 15 dias',
        dificuldade: 'fácil', porte: 'pequeno', toxica: false,
        cuidado: 'Precisam de substrato drenante — areia grossa ou perlita misturada à terra — e vaso com furo.',
        problema: 'Estiolamento (caule esticado e pálido) é falta de sol, e não tem volta: replante a ponta.'
    },
    cactos: {
        nome: 'Cactos', luz: 'Sol pleno', rega: 'A cada 15 a 30 dias',
        dificuldade: 'fácil', porte: 'variável', toxica: false,
        cuidado: 'No inverno, reduza a rega quase a zero. Cacto molhado e frio apodrece.',
        problema: 'Manchas marrons secas costumam ser queimadura de sol em planta que estava na sombra.'
    },
    samambaia: {
        nome: 'Samambaia', luz: 'Meia-sombra, nunca sol direto', rega: '2 a 3 vezes por semana',
        dificuldade: 'média', porte: 'pendente', toxica: false,
        cuidado: 'Quer umidade no ar, não encharcamento na terra. Borrifar as folhas ajuda mais que regar demais.',
        problema: 'Pontas marrons e secas indicam ar seco ou água com muito cloro.'
    },
    orquidea: {
        nome: 'Orquídea Phalaenopsis', luz: 'Luz indireta forte', rega: 'A cada 5 a 7 dias',
        dificuldade: 'média', porte: 'pequeno', toxica: false,
        cuidado: 'Raiz precisa de ar: use casca de pinus, nunca terra comum. Regue e deixe drenar por completo.',
        problema: 'Raiz verde é raiz hidratada; prateada, quer água; marrom e mole, apodreceu.'
    },
    anturio: {
        nome: 'Antúrio', luz: 'Meia-sombra', rega: '2 vezes por semana',
        dificuldade: 'média', porte: 'médio', toxica: true,
        cuidado: 'Gosta de umidade e calor. A "flor" vermelha é uma folha modificada, a espata.',
        problema: 'Parar de florir costuma ser falta de luz indireta suficiente.'
    },
    costela: {
        nome: 'Costela-de-adão', luz: 'Luz indireta forte', rega: '1 a 2 vezes por semana',
        dificuldade: 'fácil', porte: 'grande, trepadeira', toxica: true,
        cuidado: 'Quanto mais luz indireta, mais recortes nas folhas. Precisa de tutor para subir.',
        problema: 'Folhas novas inteiras, sem recortes, indicam luz insuficiente.'
    },
    peperomia: {
        nome: 'Peperômia', luz: 'Luz indireta', rega: 'A cada 7 a 10 dias',
        dificuldade: 'fácil', porte: 'pequeno', toxica: false,
        cuidado: 'Folhas suculentas guardam água. Vaso pequeno é melhor que grande demais.',
        problema: 'Folha caindo sem murchar antes é sinal de raiz encharcada.'
    },
    lavanda: {
        nome: 'Lavanda', luz: 'Sol pleno', rega: 'A cada 5 a 7 dias',
        dificuldade: 'difícil', porte: 'até 80 cm', toxica: false,
        cuidado: 'Quer sol forte, vento e solo pobre e drenante. Sofre em ambiente interno e em clima úmido.',
        problema: 'Morre mais por umidade parada nas raízes do que por seca.'
    },
    manjericao: {
        nome: 'Manjericão', luz: 'Sol de 4 a 6 horas', rega: 'Diária em dias quentes',
        dificuldade: 'fácil', porte: 'até 50 cm', toxica: false,
        cuidado: 'Colha sempre a ponta dos ramos: isso força a planta a ramificar em vez de florir.',
        problema: 'Se floresceu, as folhas ficam amargas. Retire as flores assim que aparecerem.'
    },
    hortela: {
        nome: 'Hortelã', luz: 'Meia-sombra a sol ameno', rega: '3 a 4 vezes por semana',
        dificuldade: 'muito fácil', porte: 'alastrante', toxica: false,
        cuidado: 'Plante sozinha: as raízes tomam o vaso inteiro e sufocam vizinhas.',
        problema: 'Caule fino e folha pequena é excesso de sol direto no verão.'
    },
    alecrim: {
        nome: 'Alecrim', luz: 'Sol pleno', rega: 'A cada 4 a 6 dias',
        dificuldade: 'média', porte: 'até 1,5 m', toxica: false,
        cuidado: 'Solo drenante e poda regular. Aguenta seca melhor que excesso de água.',
        problema: 'Ponta seca e quebradiça geralmente é falta de água prolongada, não fungo.'
    },
    babosa: {
        nome: 'Babosa (aloe vera)', luz: 'Sol direto parcial', rega: 'A cada 15 dias',
        dificuldade: 'muito fácil', porte: 'até 60 cm', toxica: true,
        cuidado: 'Rega escassa e vaso com furo. Produz brotos laterais que podem ser separados.',
        problema: 'Folhas finas e enrugadas indicam sede; moles e translúcidas, água demais.'
    },
    violeta: {
        nome: 'Violeta africana', luz: 'Luz indireta', rega: 'Por baixo, 1 vez por semana',
        dificuldade: 'média', porte: 'pequeno', toxica: false,
        cuidado: 'Nunca molhe as folhas: a água parada nelas causa manchas e apodrecimento.',
        problema: 'Manchas claras circulares nas folhas são queimadura por água fria.'
    },
    lirio: {
        nome: 'Lírio-da-paz', luz: 'Meia-sombra', rega: '2 vezes por semana',
        dificuldade: 'fácil', porte: 'até 60 cm', toxica: true,
        cuidado: 'Avisa quando tem sede murchando por inteiro e se recupera horas depois da rega.',
        problema: 'Pontas marrons costumam vir do cloro da água — deixe a água descansar antes.'
    },
    dracena: {
        nome: 'Dracena', luz: 'Luz indireta', rega: 'A cada 7 a 10 dias',
        dificuldade: 'fácil', porte: 'até 2 m', toxica: true,
        cuidado: 'Sensível ao flúor da água de torneira em algumas regiões.',
        problema: 'Pontas marrons com halo amarelo apontam para água tratada ou ar seco.'
    },
    ficus: {
        nome: 'Ficus lyrata', luz: 'Luz indireta forte', rega: '1 vez por semana',
        dificuldade: 'difícil', porte: 'até 3 m', toxica: true,
        cuidado: 'Odeia mudança. Escolha o lugar e não mova mais; gire o vaso para crescer reta.',
        problema: 'Queda súbita de folhas quase sempre segue uma mudança de local ou corrente de ar frio.'
    },
    pilea: {
        nome: 'Pilea', luz: 'Luz indireta', rega: 'A cada 7 dias',
        dificuldade: 'fácil', porte: 'pequeno', toxica: false,
        cuidado: 'Gire o vaso toda semana: as folhas seguem a luz e a planta entorta.',
        problema: 'Folhas enroladas para baixo indicam luz forte demais.'
    },
    maranta: {
        nome: 'Maranta', luz: 'Meia-sombra', rega: '2 vezes por semana',
        dificuldade: 'média', porte: 'pequeno', toxica: false,
        cuidado: 'Fecha as folhas à noite e abre de dia. Quer umidade alta no ar.',
        problema: 'Bordas secas e crocantes são ar seco — agrupe plantas ou use um prato com água e pedras.'
    },
    bambudasorte: {
        nome: 'Bambu-da-sorte', luz: 'Luz indireta', rega: 'Trocar a água a cada 15 dias',
        dificuldade: 'muito fácil', porte: 'até 1 m', toxica: true,
        cuidado: 'Vive em água. Use água filtrada: cloro e flúor amarelam as folhas.',
        problema: 'Haste amarelando de baixo para cima significa água velha ou excesso de sol.'
    },
    hera: {
        nome: 'Hera inglesa', luz: 'Meia-sombra', rega: '2 vezes por semana',
        dificuldade: 'fácil', porte: 'trepadeira', toxica: true,
        cuidado: 'Poda frequente evita que fique rala. Propaga muito fácil por estaca na água.',
        problema: 'Ácaros gostam dela em ambiente seco: cheque o verso das folhas.'
    },
    tomate: {
        nome: 'Tomate-cereja em vaso', luz: 'Sol pleno, 6 horas', rega: 'Diária, sem encharcar',
        dificuldade: 'média', porte: 'até 1,5 m', toxica: false,
        cuidado: 'Vaso de pelo menos 20 litros e uma estaca para sustentar. Rega irregular racha o fruto.',
        problema: 'Fundo do fruto preto e afundado é podridão apical, ligada a rega irregular e falta de cálcio.'
    }
}

const CAES = {
    viralata: { nome: 'Vira-lata (SRD)', porte: 'variável', energia: 'variável', pelo: 'variável', vida: '10 a 15 anos',
        temperamento: 'Tão variável quanto a origem, mas em média mais resistente a doenças hereditárias que raças puras.',
        exercicio: 'Duas caminhadas diárias servem à maioria.',
        atencao: 'É o cão mais disponível para adoção e o menos propenso a problemas genéticos de linhagem fechada.' },
    labrador: { nome: 'Labrador Retriever', porte: 'grande', energia: 'alta', pelo: 'curto, solta muito', vida: '10 a 12 anos',
        temperamento: 'Sociável, paciente com crianças e movido a comida — o que facilita o adestramento e engorda fácil.',
        exercicio: 'Pelo menos 1 hora por dia, de preferência com natação ou busca.',
        atencao: 'Displasia de quadril e obesidade são os dois problemas mais comuns da raça.' },
    poodle: { nome: 'Poodle', porte: 'do toy ao grande', energia: 'média a alta', pelo: 'encaracolado, solta pouco', vida: '12 a 15 anos',
        temperamento: 'Muito inteligente e sensível ao humor da casa. Aprende rápido, inclusive o que não deveria.',
        exercicio: 'Caminhada diária mais estímulo mental; entedia-se rápido.',
        atencao: 'O pelo não para de crescer: tosa a cada 6-8 semanas e escovação frequente contra nós.' },
    pastoralemao: { nome: 'Pastor-alemão', porte: 'grande', energia: 'alta', pelo: 'duplo, solta muito', vida: '9 a 13 anos',
        temperamento: 'Leal, protetor e com necessidade real de ter função. Sem trabalho, inventa o próprio.',
        exercicio: 'Mínimo de 1 a 2 horas com atividade de obediência ou faro.',
        atencao: 'Displasia de quadril e cotovelo é comum; peça exames dos pais ao criador.' },
    bulldogfrances: { nome: 'Bulldog Francês', porte: 'pequeno', energia: 'baixa', pelo: 'curto', vida: '10 a 12 anos',
        temperamento: 'Companheiro, caseiro e apegado. Ronca e resmunga o dia inteiro.',
        exercicio: 'Passeios curtos em horário fresco.',
        atencao: 'Braquicefálico: não tolera calor nem esforço. Nunca deixe em carro ou sol, nem por minutos.' },
    shihtzu: { nome: 'Shih Tzu', porte: 'pequeno', energia: 'baixa a média', pelo: 'longo, solta pouco', vida: '10 a 16 anos',
        temperamento: 'Feito para companhia; tolera bem apartamento e prefere colo a corrida.',
        exercicio: 'Duas caminhadas curtas por dia.',
        atencao: 'Olhos grandes e expostos machucam com facilidade; problemas respiratórios pelo focinho curto.' },
    golden: { nome: 'Golden Retriever', porte: 'grande', energia: 'alta', pelo: 'longo, solta muito', vida: '10 a 12 anos',
        temperamento: 'Paciente e gentil, um dos mais indicados para famílias com crianças.',
        exercicio: 'Ao menos 1 hora diária; adora água e buscar objetos.',
        atencao: 'Incidência alta de câncer na raça e tendência a displasia.' },
    yorkshire: { nome: 'Yorkshire Terrier', porte: 'muito pequeno', energia: 'média', pelo: 'longo e sedoso', vida: '13 a 16 anos',
        temperamento: 'Corajoso além do tamanho, ativo e barulhento se não for socializado.',
        exercicio: 'Caminhadas curtas e brincadeiras dentro de casa.',
        atencao: 'Frágil a quedas; problemas dentários e traqueia colapsada são comuns — use peitoral, não coleira.' },
    pinscher: { nome: 'Pinscher', porte: 'muito pequeno', energia: 'alta', pelo: 'curto', vida: '12 a 15 anos',
        temperamento: 'Vigilante, rápido e latidor. Precisa de limites claros desde filhote.',
        exercicio: 'Muita brincadeira; a energia não combina com o tamanho.',
        atencao: 'Luxação de patela é frequente. Sente frio: agasalho no inverno faz sentido.' },
    rottweiler: { nome: 'Rottweiler', porte: 'grande', energia: 'média a alta', pelo: 'curto', vida: '8 a 10 anos',
        temperamento: 'Confiante e territorial, muito ligado à família. Exige tutor experiente e socialização precoce.',
        exercicio: 'Uma a duas horas com trabalho de obediência.',
        atencao: 'Força enorme: adestramento não é opcional. Displasia e problemas cardíacos aparecem na raça.' },
    beagle: { nome: 'Beagle', porte: 'médio', energia: 'alta', pelo: 'curto', vida: '12 a 15 anos',
        temperamento: 'Farejador incansável e sociável. Segue um cheiro e esquece que você existe.',
        exercicio: 'Uma hora por dia; sem isso, destrói por tédio.',
        atencao: 'Foge atrás de rastro: quintal precisa ser realmente fechado. Engorda com facilidade.' },
    border: { nome: 'Border Collie', porte: 'médio', energia: 'muito alta', pelo: 'médio, solta bastante', vida: '12 a 15 anos',
        temperamento: 'Considerado o cão mais inteligente; precisa de tarefa, não só de espaço.',
        exercicio: 'Duas horas diárias com desafio mental junto.',
        atencao: 'Sem ocupação desenvolve comportamentos repetitivos. Não é cão para apartamento sem rotina intensa.' },
    dachshund: { nome: 'Dachshund (salsicha)', porte: 'pequeno', energia: 'média', pelo: 'curto, longo ou duro', vida: '12 a 16 anos',
        temperamento: 'Teimoso, corajoso e apegado a uma pessoa em especial.',
        exercicio: 'Caminhadas moderadas, sem escadas e saltos.',
        atencao: 'Coluna longa é o ponto frágil: evite pular do sofá e controle o peso com rigor.' },
    pug: { nome: 'Pug', porte: 'pequeno', energia: 'baixa', pelo: 'curto, solta muito', vida: '12 a 15 anos',
        temperamento: 'Palhaço e grudento. Não gosta de ficar sozinho.',
        exercicio: 'Passeios curtos e frescos.',
        atencao: 'Braquicefálico com olhos salientes: calor e esforço são perigosos, e o olho machuca fácil.' },
    husky: { nome: 'Husky Siberiano', porte: 'grande', energia: 'muito alta', pelo: 'duplo e denso', vida: '12 a 14 anos',
        temperamento: 'Independente, vocal e escapista. Obedece quando concorda.',
        exercicio: 'Duas horas por dia, no mínimo.',
        atencao: 'Sofre no calor brasileiro. Nunca tosar o pelo duplo: ele isola do calor também.' },
    pitbull: { nome: 'American Pit Bull Terrier', porte: 'médio', energia: 'alta', pelo: 'curto', vida: '12 a 14 anos',
        temperamento: 'Muito apegado a pessoas e brincalhão; a socialização com outros cães exige trabalho desde cedo.',
        exercicio: 'Uma a duas horas com atividade física e mental.',
        atencao: 'Força de mordida alta torna o adestramento e a socialização precoce uma obrigação, não uma escolha.' },
    maltes: { nome: 'Maltês', porte: 'muito pequeno', energia: 'média', pelo: 'longo, solta pouco', vida: '12 a 15 anos',
        temperamento: 'Afetuoso e alegre; sofre com solidão prolongada.',
        exercicio: 'Passeios curtos e brincadeiras internas.',
        atencao: 'Manchas de lágrima ao redor dos olhos são comuns e pedem limpeza diária.' },
    lhasa: { nome: 'Lhasa Apso', porte: 'pequeno', energia: 'baixa a média', pelo: 'longo', vida: '12 a 15 anos',
        temperamento: 'Independente e desconfiado com estranhos; foi criado como cão de alerta em mosteiros.',
        exercicio: 'Caminhadas curtas diárias.',
        atencao: 'Pelo longo exige escovação diária; problemas oculares são frequentes.' },
    spitz: { nome: 'Spitz Alemão (lulu)', porte: 'pequeno', energia: 'média', pelo: 'duplo e volumoso', vida: '12 a 16 anos',
        temperamento: 'Alerta, vivo e latidor. Aprende rápido e cobra atenção.',
        exercicio: 'Passeios curtos e muito jogo.',
        atencao: 'Nunca tosar rente: o pelo pode não voltar igual. Luxação de patela é comum.' },
    boxer: { nome: 'Boxer', porte: 'grande', energia: 'alta', pelo: 'curto', vida: '10 a 12 anos',
        temperamento: 'Eternamente filhote, brincalhão e muito ligado a crianças.',
        exercicio: 'Uma hora e meia por dia.',
        atencao: 'Focinho curto sofre no calor; incidência alta de problemas cardíacos e tumores.' },
    chihuahua: { nome: 'Chihuahua', porte: 'muito pequeno', energia: 'média', pelo: 'curto ou longo', vida: '14 a 18 anos',
        temperamento: 'Territorial e apegado a uma pessoa. Vive muito tempo.',
        exercicio: 'Brincadeiras dentro de casa bastam na maioria dos dias.',
        atencao: 'Fontanela às vezes não fecha; frágil a quedas e sensível ao frio.' },
    dobermann: { nome: 'Dobermann', porte: 'grande', energia: 'alta', pelo: 'curto', vida: '10 a 13 anos',
        temperamento: 'Extremamente ligado ao tutor, atento e rápido a aprender.',
        exercicio: 'Uma a duas horas com trabalho de obediência.',
        atencao: 'Cardiomiopatia dilatada é a principal causa de morte precoce na raça.' }
}

const GATOS = {
    srd: { nome: 'Gato SRD (vira-lata)', porte: 'médio', pelo: 'curto ou médio', energia: 'média', vida: '12 a 18 anos',
        temperamento: 'Variedade enorme de personalidade; em média robusto e adaptável.',
        atencao: 'O gato mais disponível para adoção e o menos sujeito a doenças de linhagem.' },
    siames: { nome: 'Siamês', porte: 'médio', pelo: 'curto', energia: 'alta', vida: '12 a 20 anos',
        temperamento: 'Falante, grudento e exigente de atenção. Conversa de verdade com o tutor.',
        atencao: 'Sofre com solidão; considere um segundo gato se a casa fica vazia o dia todo.' },
    persa: { nome: 'Persa', porte: 'médio', pelo: 'longo e denso', energia: 'baixa', vida: '12 a 17 anos',
        temperamento: 'Calmo, caseiro e pouco afeito a mudanças.',
        atencao: 'Focinho achatado causa lacrimejamento e dificuldade respiratória; escovação diária é obrigatória.' },
    maine: { nome: 'Maine Coon', porte: 'muito grande', pelo: 'longo', energia: 'média', vida: '10 a 15 anos',
        temperamento: 'Gigante gentil, sociável e brincalhão até tarde na vida.',
        atencao: 'Cardiomiopatia hipertrófica tem incidência maior na raça; peça exames da linhagem.' },
    angora: { nome: 'Angorá', porte: 'médio', pelo: 'longo e sedoso', energia: 'alta', vida: '12 a 18 anos',
        temperamento: 'Ativo, curioso e apegado; gosta de altura.',
        atencao: 'Angorás brancos de olhos azuis têm chance maior de surdez congênita.' },
    bengal: { nome: 'Bengal', porte: 'médio a grande', pelo: 'curto e malhado', energia: 'muito alta', vida: '12 a 16 anos',
        temperamento: 'Atlético, curioso e vocal. Gosta de água, o que é raro entre gatos.',
        atencao: 'Precisa de prateleiras, brinquedos e caça simulada; tédio vira destruição.' },
    ragdoll: { nome: 'Ragdoll', porte: 'grande', pelo: 'semilongo', energia: 'baixa', vida: '12 a 17 anos',
        temperamento: 'Relaxa no colo a ponto de amolecer — daí o nome. Muito tolerante.',
        atencao: 'Docilidade extrema o torna vulnerável: não deve ter acesso à rua.' },
    sphynx: { nome: 'Sphynx', porte: 'médio', pelo: 'praticamente ausente', energia: 'alta', vida: '9 a 15 anos',
        temperamento: 'Extrovertido, grudento e quente ao toque.',
        atencao: 'Sem pelo, precisa de banho regular pela oleosidade da pele, e sente frio e sol de verdade.' },
    britishshorthair: { nome: 'British Shorthair', porte: 'médio a grande', pelo: 'curto e denso', energia: 'baixa', vida: '12 a 17 anos',
        temperamento: 'Tranquilo e independente; gosta de companhia, não de colo.',
        atencao: 'Tendência a ganhar peso; controle a porção e ofereça brincadeira ativa.' },
    russianblue: { nome: 'Azul-russo', porte: 'médio', pelo: 'curto e denso', energia: 'média', vida: '15 a 20 anos',
        temperamento: 'Reservado com estranhos e muito leal a uma ou duas pessoas.',
        atencao: 'Sensível a mudança de rotina; alterações na casa podem causar estresse e cistite.' },
    exoticshorthair: { nome: 'Exotic Shorthair', porte: 'médio', pelo: 'curto e denso', energia: 'baixa', vida: '12 a 15 anos',
        temperamento: 'A calma do persa sem o pelo longo. Muito caseiro.',
        atencao: 'Mesmos problemas respiratórios e oculares do persa pelo focinho achatado.' },
    norueguesdafloresta: { nome: 'Norueguês da Floresta', porte: 'grande', pelo: 'longo e impermeável', energia: 'média', vida: '12 a 16 anos',
        temperamento: 'Escalador nato, independente e afetuoso nos próprios termos.',
        atencao: 'Pelo denso pede escovação frequente, sobretudo na troca de estação.' }
}

/** Alimentos e substâncias perigosas, por espécie. */
const PERIGOS = [
    { item: 'Chocolate', caes: 'tóxico', gatos: 'tóxico', porque: 'A teobromina afeta coração e sistema nervoso. Quanto mais amargo, mais perigoso.' },
    { item: 'Cebola e alho', caes: 'tóxico', gatos: 'tóxico', porque: 'Destroem hemácias e causam anemia. O efeito é cumulativo, inclusive em pó e em caldos.' },
    { item: 'Uva e uva-passa', caes: 'tóxico', gatos: 'evitar', porque: 'Podem causar insuficiência renal aguda em cães, em quantidade imprevisível.' },
    { item: 'Xilitol (adoçante)', caes: 'muito tóxico', gatos: 'evitar', porque: 'Provoca queda brusca de glicose e lesão hepática em cães. Está em balas, chicletes e pastas de dente.' },
    { item: 'Abacate', caes: 'evitar', gatos: 'evitar', porque: 'A persina e o alto teor de gordura podem causar vômito e pancreatite.' },
    { item: 'Osso cozido', caes: 'perigoso', gatos: 'perigoso', porque: 'Lasca em pontas afiadas e pode perfurar o trato digestivo.' },
    { item: 'Leite de vaca', caes: 'evitar', gatos: 'evitar', porque: 'A maioria dos adultos é intolerante à lactose; causa diarreia.' },
    { item: 'Álcool', caes: 'muito tóxico', gatos: 'muito tóxico', porque: 'Mesmo em dose pequena afeta o sistema nervoso e a respiração.' },
    { item: 'Café e energético', caes: 'tóxico', gatos: 'tóxico', porque: 'A cafeína causa agitação, taquicardia e convulsão.' },
    { item: 'Macadâmia', caes: 'tóxico', gatos: 'evitar', porque: 'Causa fraqueza nas patas traseiras, tremor e febre em cães.' },
    { item: 'Massa crua com fermento', caes: 'perigoso', gatos: 'perigoso', porque: 'Fermenta no estômago, produz álcool e expande.' },
    { item: 'Paracetamol e dipirona', caes: 'muito tóxico', gatos: 'letal', porque: 'Gatos não metabolizam paracetamol; uma dose humana pode matar. Nunca medique por conta própria.' },
    { item: 'Lírio (a planta)', caes: 'evitar', gatos: 'letal', porque: 'Todas as partes do lírio verdadeiro causam insuficiência renal em gatos, inclusive o pólen.' },
    { item: 'Óleos essenciais', caes: 'evitar', gatos: 'tóxico', porque: 'Difusores com tea tree, eucalipto e canela são especialmente perigosos para gatos.' },
    { item: 'Sal em excesso', caes: 'perigoso', gatos: 'perigoso', porque: 'Petiscos humanos salgados sobrecarregam rins e coração.' }
]

/** Plantas seguras para casa com animais. */
function plantasSegurasPara() {
    return Object.entries(PLANTAS).filter(([, p]) => !p.toxica).map(([chave, p]) => ({ chave, ...p }))
}

/** Plantas tóxicas do catálogo. */
function plantasToxicas() {
    return Object.entries(PLANTAS).filter(([, p]) => p.toxica).map(([chave, p]) => ({ chave, ...p }))
}

/** Perigos relevantes para uma espécie. */
function perigosDe(especie) {
    const campo = String(especie || '').toLowerCase().startsWith('gat') ? 'gatos' : 'caes'
    const ordem = { letal: 0, 'muito tóxico': 1, tóxico: 2, perigoso: 3, evitar: 4 }
    return PERIGOS
        .map(p => ({ item: p.item, nivel: p[campo], porque: p.porque }))
        .sort((a, b) => (ordem[a.nivel] ?? 9) - (ordem[b.nivel] ?? 9))
}

/** Plantas por nível de dificuldade. */
function plantasPorDificuldade(nivel) {
    const n = String(nivel || '').toLowerCase()
    return Object.entries(PLANTAS).filter(([, p]) => p.dificuldade.includes(n)).map(([chave, p]) => ({ chave, ...p }))
}

/**
 * Calendário de vacinação. Idades são as usuais nos protocolos brasileiros;
 * o veterinário ajusta conforme a região e o histórico do animal.
 */
const VACINAS = {
    caes: [
        { nome: 'V8 ou V10 (múltipla)', quando: '1ª dose com 6 a 8 semanas', reforco: 'mais 2 doses a cada 21-30 dias, depois anual',
          protege: 'Cinomose, parvovirose, hepatite, adenovirose, parainfluenza e leptospirose' },
        { nome: 'Antirrábica', quando: 'a partir de 12 semanas', reforco: 'anual',
          protege: 'Raiva — obrigatória por lei e transmissível a humanos' },
        { nome: 'Tosse dos canis (KC)', quando: 'a partir de 8 semanas', reforco: 'anual',
          protege: 'Bordetella e parainfluenza; exigida por muitos hotéis e creches' },
        { nome: 'Giárdia', quando: 'a partir de 8 semanas', reforco: 'anual, se indicada',
          protege: 'Giardíase intestinal; indicada em áreas de risco' },
        { nome: 'Leishmaniose', quando: 'a partir de 4 meses, com teste negativo antes', reforco: 'anual',
          protege: 'Leishmaniose visceral; indicada em regiões endêmicas' }
    ],
    gatos: [
        { nome: 'V3, V4 ou V5 (múltipla)', quando: '1ª dose com 8 semanas', reforco: 'mais 1 a 2 doses a cada 21-30 dias, depois anual',
          protege: 'Panleucopenia, rinotraqueíte, calicivirose e, na V4/V5, clamidiose e leucemia felina' },
        { nome: 'Antirrábica', quando: 'a partir de 12 semanas', reforco: 'anual',
          protege: 'Raiva — obrigatória por lei' },
        { nome: 'FeLV (leucemia felina)', quando: 'a partir de 8 semanas, com teste negativo antes', reforco: 'anual',
          protege: 'Leucemia felina; essencial para gato com acesso à rua ou casa com vários gatos' }
    ]
}

/** Rotina de cuidado que não é vacina, mas cai na mesma conversa. */
const ROTINA_PET = [
    { item: 'Vermífugo', frequencia: 'filhote a cada 15 dias até 3 meses; adulto a cada 3 a 6 meses' },
    { item: 'Antipulgas e carrapaticida', frequencia: 'mensal ou conforme o produto' },
    { item: 'Castração', frequencia: 'dose única, geralmente entre 6 e 12 meses' },
    { item: 'Consulta de rotina', frequencia: 'anual até os 7 anos, semestral depois' },
    { item: 'Limpeza dentária', frequencia: 'escovação idealmente diária; avaliação anual' },
    { item: 'Microchip ou plaquinha', frequencia: 'uma vez, e mantenha o contato atualizado' }
]

/**
 * Plantas indicadas para a condição de luz do cômodo.
 *
 * A busca por substring simples não serve aqui: "nunca sol direto" contém
 * "sol direto" e colocava a samambaia na lista de sol pleno. Por isso cada
 * condição tem um padrão de aceitação e outro de recusa.
 */
const LUZ = {
    sol: { aceita: /sol pleno|sol direto|sol de \d|sol ameno|sol parcial/i, recusa: /nunca sol|sol indireto|sem sol/i },
    sombra: { aceita: /meia-sombra|pouca luz/i, recusa: /sol pleno/i },
    indireta: { aceita: /indiret[ao]/i, recusa: null }
}

function plantasParaLuz(condicao) {
    const c = String(condicao || '').toLowerCase()
    const chave = c.startsWith('sol') || c.includes('direto') ? 'sol'
        : c.startsWith('somb') || c.includes('pouca') || c.includes('escur') ? 'sombra'
            : 'indireta'
    const { aceita, recusa } = LUZ[chave]
    const lista = Object.entries(PLANTAS)
        .filter(([, p]) => aceita.test(p.luz) && !(recusa && recusa.test(p.luz)))
        .map(([ch, p]) => ({ chave: ch, ...p }))
    return { condicao: chave, lista }
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [chave, p] of Object.entries(PLANTAS)) {
        if ((JSON.stringify(p) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'planta', chave, nome: p.nome })
    }
    for (const [chave, c] of Object.entries(CAES)) {
        if ((JSON.stringify(c) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'cao', chave, nome: c.nome })
    }
    for (const [chave, g] of Object.entries(GATOS)) {
        if ((JSON.stringify(g) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'gato', chave, nome: g.nome })
    }
    return achados
}

module.exports = {
    PLANTAS, CAES, GATOS, PERIGOS, VACINAS, ROTINA_PET,
    plantasSegurasPara, plantasToxicas, perigosDe, plantasPorDificuldade, plantasParaLuz, procurar
}
