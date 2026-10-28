/**
 * Cozinha, esporte e treino — catálogos de conteúdo prático.
 *
 * São fichas que respondem a pergunta inteira de uma vez: a receita traz
 * ingrediente, modo de fazer e rendimento; o esporte traz regra básica,
 * duração e origem; o exercício traz músculo trabalhado e o erro que a maioria
 * comete.
 *
 * Nada aqui é conselho médico. O bloco de treino diz isso onde importa.
 */

/** Receitas com quantidade, passo e tempo reais. */
const RECEITAS = {
    arrozbranco: {
        nome: 'Arroz branco soltinho', porcoes: 4, tempo: 25, dificuldade: 'fácil', tipo: 'acompanhamento',
        ingredientes: ['2 xíc. de arroz', '4 xíc. de água quente', '2 dentes de alho', '1 colher de sopa de óleo', 'sal'],
        passos: ['Refogue o alho no óleo até dourar levemente.', 'Junte o arroz e mexa por 1 minuto.', 'Acrescente a água quente e o sal.', 'Ferva em fogo alto, tampe e abaixe o fogo por 15 minutos.', 'Desligue e deixe descansar 5 minutos antes de soltar com garfo.'],
        dica: 'Água quente evita que o grão empape. Não mexa depois de tampar.'
    },
    feijaotropeiro: {
        nome: 'Feijão tropeiro', porcoes: 6, tempo: 40, dificuldade: 'média', tipo: 'prato principal',
        ingredientes: ['3 xíc. de feijão cozido e escorrido', '200 g de bacon', '200 g de linguiça', '1 xíc. de farinha de mandioca', '3 ovos', 'cebola, alho, couve e cheiro-verde'],
        passos: ['Frite o bacon até soltar a gordura e reserve.', 'Doure a linguiça na mesma panela.', 'Refogue cebola e alho.', 'Mexa os ovos ali mesmo até firmar.', 'Junte o feijão escorrido e a couve fatiada.', 'Desligue o fogo e só então acrescente a farinha, mexendo.'],
        dica: 'A farinha entra com o fogo desligado; no fogo ela seca o prato.'
    },
    stroganoff: {
        nome: 'Estrogonofe de frango', porcoes: 4, tempo: 30, dificuldade: 'fácil', tipo: 'prato principal',
        ingredientes: ['600 g de peito de frango em cubos', '1 cebola', '2 colheres de sopa de manteiga', '2 colheres de sopa de ketchup', '1 colher de sopa de mostarda', '1 caixa de creme de leite', 'sal e pimenta'],
        passos: ['Doure o frango temperado na manteiga, em porções.', 'Refogue a cebola.', 'Volte o frango, junte ketchup e mostarda.', 'Cozinhe 5 minutos.', 'Desligue e misture o creme de leite.'],
        dica: 'Creme de leite entra com o fogo desligado, senão talha.'
    },
    macarraoalho: {
        nome: 'Macarrão alho e óleo', porcoes: 2, tempo: 20, dificuldade: 'fácil', tipo: 'prato principal',
        ingredientes: ['250 g de espaguete', '4 dentes de alho fatiados', '4 colheres de sopa de azeite', 'pimenta calabresa', 'salsinha', 'sal'],
        passos: ['Cozinhe a massa em água bem salgada até al dente.', 'Doure o alho no azeite em fogo baixo — não deixe queimar.', 'Junte a calabresa.', 'Escorra a massa guardando 1 concha da água.', 'Misture tudo com um pouco da água do cozimento.'],
        dica: 'A água do cozimento tem amido e é o que liga o molho na massa.'
    },
    bolodecenoura: {
        nome: 'Bolo de cenoura', porcoes: 10, tempo: 50, dificuldade: 'fácil', tipo: 'doce',
        ingredientes: ['3 cenouras médias', '3 ovos', '1 xíc. de óleo', '2 xíc. de açúcar', '2½ xíc. de farinha', '1 colher de sopa de fermento'],
        passos: ['Bata cenoura, ovos e óleo no liquidificador.', 'Misture com açúcar e farinha.', 'Acrescente o fermento por último, mexendo devagar.', 'Asse a 180 °C por cerca de 40 minutos.'],
        dica: 'Fermento por último e sem bater: bater depois dele faz o bolo murchar.'
    },
    brigadeiro: {
        nome: 'Brigadeiro', porcoes: 20, tempo: 20, dificuldade: 'fácil', tipo: 'doce',
        ingredientes: ['1 lata de leite condensado', '3 colheres de sopa de chocolate em pó', '1 colher de sopa de manteiga', 'granulado'],
        passos: ['Junte tudo numa panela em fogo baixo.', 'Mexa sem parar até desgrudar do fundo.', 'Espalhe num prato untado e deixe esfriar.', 'Enrole e passe no granulado.'],
        dica: 'O ponto é quando você inclina a panela e a massa desliza inteira.'
    },
    pudim: {
        nome: 'Pudim de leite', porcoes: 8, tempo: 90, dificuldade: 'média', tipo: 'doce',
        ingredientes: ['1 lata de leite condensado', '2 latas de leite', '3 ovos', '1 xíc. de açúcar para a calda'],
        passos: ['Derreta o açúcar até formar caramelo e forre a forma.', 'Bata leite condensado, leite e ovos.', 'Despeje na forma.', 'Asse em banho-maria a 180 °C por cerca de 1 hora.', 'Gele por 4 horas antes de desenformar.'],
        dica: 'Banho-maria não é opcional: sem ele o pudim vira omelete doce.'
    },
    pao: {
        nome: 'Pão caseiro', porcoes: 12, tempo: 180, dificuldade: 'média', tipo: 'pão',
        ingredientes: ['500 g de farinha', '300 ml de água morna', '10 g de fermento biológico seco', '10 g de sal', '1 colher de sopa de açúcar', '2 colheres de sopa de azeite'],
        passos: ['Dissolva fermento e açúcar na água morna e espere espumar.', 'Misture com a farinha e o sal.', 'Sove por 10 minutos até ficar liso.', 'Deixe crescer 1 hora coberto.', 'Modele, deixe crescer mais 40 minutos.', 'Asse a 200 °C por 30 minutos.'],
        dica: 'Água morna, nunca quente: acima de 50 °C o fermento morre.'
    },
    panqueca: {
        nome: 'Panqueca simples', porcoes: 8, tempo: 25, dificuldade: 'fácil', tipo: 'prato principal',
        ingredientes: ['1 xíc. de farinha', '1 xíc. de leite', '2 ovos', '1 colher de sopa de óleo', 'sal'],
        passos: ['Bata tudo no liquidificador.', 'Deixe a massa descansar 10 minutos.', 'Aqueça uma frigideira antiaderente untada.', 'Espalhe uma concha fina e vire quando soltar sozinha.'],
        dica: 'Descansar a massa hidrata a farinha e evita panqueca borrachuda.'
    },
    omelete: {
        nome: 'Omelete', porcoes: 1, tempo: 10, dificuldade: 'fácil', tipo: 'prato principal',
        ingredientes: ['3 ovos', '1 colher de sopa de manteiga', 'sal e pimenta', 'recheio a gosto'],
        passos: ['Bata os ovos com sal apenas até misturar.', 'Aqueça a frigideira em fogo médio-baixo com a manteiga.', 'Despeje e mexa devagar nos primeiros 20 segundos.', 'Pare de mexer, ponha o recheio e dobre.'],
        dica: 'Fogo alto resseca. Omelete boa sai de fogo médio-baixo.'
    },
    sopadelegumes: {
        nome: 'Sopa de legumes', porcoes: 4, tempo: 40, dificuldade: 'fácil', tipo: 'sopa',
        ingredientes: ['2 batatas', '2 cenouras', '1 abobrinha', '1 cebola', '2 dentes de alho', '1,5 l de caldo ou água', 'azeite e sal'],
        passos: ['Refogue cebola e alho no azeite.', 'Junte os legumes em cubos e refogue 3 minutos.', 'Cubra com o caldo e cozinhe 25 minutos.', 'Amasse parte dos legumes para engrossar.'],
        dica: 'Amassar parte dos legumes engrossa sem precisar de farinha.'
    },
    farofa: {
        nome: 'Farofa de cebola', porcoes: 6, tempo: 15, dificuldade: 'fácil', tipo: 'acompanhamento',
        ingredientes: ['2 xíc. de farinha de mandioca', '2 cebolas fatiadas', '3 colheres de sopa de manteiga', 'sal e cheiro-verde'],
        passos: ['Derreta a manteiga e doure bem a cebola.', 'Abaixe o fogo e junte a farinha aos poucos.', 'Mexa sem parar até dourar por igual.', 'Finalize com cheiro-verde fora do fogo.'],
        dica: 'Farinha aos poucos e fogo baixo: de uma vez só, ela queima em pontos.'
    },
    vinagrete: {
        nome: 'Vinagrete', porcoes: 8, tempo: 15, dificuldade: 'fácil', tipo: 'acompanhamento',
        ingredientes: ['3 tomates', '1 cebola', '1 pimentão', '½ xíc. de vinagre', '¼ xíc. de azeite', 'sal e cheiro-verde'],
        passos: ['Pique tudo em cubos pequenos e iguais.', 'Misture com vinagre, azeite e sal.', 'Deixe descansar 30 minutos na geladeira.'],
        dica: 'Cubos do mesmo tamanho mudam completamente o resultado na colher.'
    },
    cafegelado: {
        nome: 'Café gelado cremoso', porcoes: 2, tempo: 10, dificuldade: 'fácil', tipo: 'bebida',
        ingredientes: ['200 ml de café forte frio', '200 ml de leite', '2 colheres de sopa de açúcar', 'gelo'],
        passos: ['Bata o açúcar com 2 colheres de café até virar creme claro.', 'Encha o copo de gelo e leite.', 'Coloque o creme por cima e o restante do café.'],
        dica: 'Bater açúcar com café concentrado é o que forma o creme.'
    },
    limonada: {
        nome: 'Limonada suíça', porcoes: 4, tempo: 10, dificuldade: 'fácil', tipo: 'bebida',
        ingredientes: ['2 limões com casca', '1 l de água gelada', '6 colheres de sopa de açúcar', '3 colheres de sopa de leite condensado', 'gelo'],
        passos: ['Corte os limões em pedaços e retire o miolo branco.', 'Bata rapidamente com a água e o açúcar.', 'Coe na hora.', 'Junte o leite condensado e o gelo.'],
        dica: 'Bater demais extrai amargor da casca. Cinco segundos bastam.'
    }
}

/** Esportes com regra básica, duração e origem. */
const ESPORTES = {
    futebol: { nome: 'Futebol', jogadores: '11 por time', duracao: '2 tempos de 45 min', origem: 'Inglaterra, século XIX', regra: 'Marcar gol com qualquer parte do corpo, menos braços e mãos.', curiosidade: 'É o esporte mais praticado do mundo.' },
    basquete: { nome: 'Basquete', jogadores: '5 por time', duracao: '4 períodos de 10 ou 12 min', origem: 'Estados Unidos, 1891', regra: 'Encestar a bola no aro adversário; a cesta vale 2 ou 3 pontos.', curiosidade: 'Foi criado por James Naismith para exercício de inverno.' },
    volei: { nome: 'Vôlei', jogadores: '6 por time', duracao: 'melhor de 5 sets', origem: 'Estados Unidos, 1895', regra: 'Passar a bola por cima da rede em até três toques.', curiosidade: 'O rodízio obriga todo jogador a passar por todas as posições.' },
    tenis: { nome: 'Tênis', jogadores: '1 ou 2 por lado', duracao: 'melhor de 3 ou 5 sets', origem: 'Inglaterra, século XIX', regra: 'Rebater a bola de forma que o adversário não devolva.', curiosidade: 'A contagem 15-30-40 vem de um relógio medieval.' },
    natacao: { nome: 'Natação', jogadores: 'individual', duracao: 'por prova', origem: 'Antiguidade; esporte moderno no século XIX', regra: 'Percorrer a distância no estilo da prova, sem infrações de virada.', curiosidade: 'São quatro estilos oficiais: crawl, costas, peito e borboleta.' },
    atletismo: { nome: 'Atletismo', jogadores: 'individual ou revezamento', duracao: 'por prova', origem: 'Grécia antiga', regra: 'Correr, saltar ou arremessar conforme a prova.', curiosidade: 'É chamado de esporte-base por reunir as habilidades primárias.' },
    judo: { nome: 'Judô', jogadores: 'individual', duracao: '4 min (adulto)', origem: 'Japão, 1882', regra: 'Projetar, imobilizar ou finalizar o adversário.', curiosidade: 'O nome significa "caminho suave".' },
    boxe: { nome: 'Boxe', jogadores: 'individual', duracao: 'rounds de 3 min', origem: 'Antiguidade; regras modernas no século XIX', regra: 'Golpear com os punhos acima da linha da cintura.', curiosidade: 'As regras do Marquês de Queensberry criaram o boxe moderno.' },
    ciclismo: { nome: 'Ciclismo', jogadores: 'individual ou equipe', duracao: 'por prova', origem: 'Europa, século XIX', regra: 'Completar o percurso de bicicleta no menor tempo.', curiosidade: 'No pelotão, o ciclista atrás gasta bem menos energia.' },
    ginastica: { nome: 'Ginástica artística', jogadores: 'individual', duracao: 'por aparelho', origem: 'Alemanha, século XIX', regra: 'Executar séries em aparelhos, julgadas por dificuldade e execução.', curiosidade: 'A nota junta dificuldade da série e qualidade da execução.' },
    handebol: { nome: 'Handebol', jogadores: '7 por time', duracao: '2 tempos de 30 min', origem: 'Europa, início do século XX', regra: 'Marcar gol com as mãos, sem invadir a área do goleiro.', curiosidade: 'O jogador pode dar no máximo três passos com a bola.' },
    rugby: { nome: 'Rugby', jogadores: '15 por time', duracao: '2 tempos de 40 min', origem: 'Inglaterra, século XIX', regra: 'Levar a bola até a área adversária; o passe só vai para trás.', curiosidade: 'O passe para a frente é falta — o avanço é ganho no corpo.' },
    beisebol: { nome: 'Beisebol', jogadores: '9 por time', duracao: '9 entradas', origem: 'Estados Unidos, século XIX', regra: 'Rebater a bola e completar a volta pelas bases.', curiosidade: 'Não tem cronômetro: o jogo acaba quando as entradas acabam.' },
    surfe: { nome: 'Surfe', jogadores: 'individual', duracao: 'baterias de 20 a 35 min', origem: 'Polinésia', regra: 'Executar manobras na onda, julgadas por nota.', curiosidade: 'Contam as duas melhores ondas da bateria.' },
    skate: { nome: 'Skate', jogadores: 'individual', duracao: 'voltas e manobras', origem: 'Estados Unidos, anos 1950', regra: 'Executar manobras em pista ou rua, julgadas por nota.', curiosidade: 'Nasceu como alternativa ao surfe em dia sem onda.' },
    xadrezesporte: { nome: 'Xadrez', jogadores: '2', duracao: 'por controle de tempo', origem: 'Índia, século VI', regra: 'Dar xeque-mate no rei adversário.', curiosidade: 'É reconhecido como esporte pelo Comitê Olímpico Internacional.' },
    futsal: { nome: 'Futsal', jogadores: '5 por time', duracao: '2 tempos de 20 min', origem: 'Uruguai/Brasil, anos 1930', regra: 'Como o futebol, em quadra menor e com bola de quique baixo.', curiosidade: 'O cronômetro para a cada interrupção.' },
    formula1: { nome: 'Fórmula 1', jogadores: 'individual e equipe', duracao: 'cerca de 300 km', origem: 'Europa, 1950', regra: 'Completar as voltas no menor tempo respeitando o regulamento.', curiosidade: 'O tempo de parada nos boxes é medido em segundos únicos.' }
}

/** Exercícios com músculo trabalhado e o erro mais comum. */
const EXERCICIOS = {
    agachamento: { nome: 'Agachamento', grupo: 'Pernas e glúteos', nivel: 'todos', equipamento: 'nenhum ou barra', execucao: 'Pés na largura dos ombros, desça empurrando o quadril para trás, joelhos alinhados com os pés.', erro: 'Deixar o joelho colapsar para dentro e tirar o calcanhar do chão.' },
    flexao: { nome: 'Flexão de braço', grupo: 'Peito, ombro e tríceps', nivel: 'iniciante a avançado', equipamento: 'nenhum', execucao: 'Mãos um pouco além da largura dos ombros, corpo em linha reta, desça até o peito quase tocar o chão.', erro: 'Deixar o quadril cair ou subir, quebrando a linha do corpo.' },
    prancha: { nome: 'Prancha', grupo: 'Core', nivel: 'todos', equipamento: 'nenhum', execucao: 'Apoie antebraços e pontas dos pés, mantenha o corpo reto e o abdômen contraído.', erro: 'Elevar o quadril para descansar, o que tira o esforço do abdômen.' },
    barrafixa: { nome: 'Barra fixa', grupo: 'Costas e bíceps', nivel: 'intermediário', equipamento: 'barra', execucao: 'Pegada pronada, puxe até o queixo passar a barra, desça controlando.', erro: 'Usar impulso do quadril e descer soltando o corpo.' },
    afundo: { nome: 'Afundo', grupo: 'Pernas e glúteos', nivel: 'todos', equipamento: 'nenhum ou halteres', execucao: 'Passo à frente, desça até o joelho de trás quase tocar o chão, tronco ereto.', erro: 'Passo curto demais, que joga o joelho da frente além do pé.' },
    remada: { nome: 'Remada curvada', grupo: 'Costas', nivel: 'intermediário', equipamento: 'barra ou halteres', execucao: 'Tronco inclinado com coluna neutra, puxe o peso até o abdômen.', erro: 'Curvar a lombar — é a principal causa de lesão nesse exercício.' },
    desenvolvimento: { nome: 'Desenvolvimento de ombros', grupo: 'Ombros', nivel: 'todos', equipamento: 'halteres ou barra', execucao: 'Empurre o peso acima da cabeça sem travar o cotovelo no topo.', erro: 'Arquear a lombar para compensar falta de mobilidade do ombro.' },
    abdominal: { nome: 'Abdominal', grupo: 'Abdômen', nivel: 'todos', equipamento: 'nenhum', execucao: 'Suba contraindo o abdômen, sem puxar a cabeça com as mãos.', erro: 'Puxar o pescoço, transferindo o esforço para a cervical.' },
    burpee: { nome: 'Burpee', grupo: 'Corpo inteiro', nivel: 'intermediário', equipamento: 'nenhum', execucao: 'Agache, jogue os pés para trás, flexão, volte e salte.', erro: 'Perder a linha do corpo na flexão por causa do cansaço.' },
    corrida: { nome: 'Corrida', grupo: 'Cardiovascular', nivel: 'todos', equipamento: 'tênis adequado', execucao: 'Passada curta e cadência alta, pisada sob o corpo, tronco levemente à frente.', erro: 'Passada longa demais, que freia o corpo a cada passo.' },
    polichinelo: { nome: 'Polichinelo', grupo: 'Cardiovascular', nivel: 'iniciante', equipamento: 'nenhum', execucao: 'Salte abrindo pernas e braços ao mesmo tempo, aterrisse com joelho macio.', erro: 'Aterrissar com a perna rígida, o que castiga o joelho.' },
    elevacaopanturrilha: { nome: 'Elevação de panturrilha', grupo: 'Panturrilhas', nivel: 'todos', equipamento: 'nenhum ou peso', execucao: 'Suba na ponta dos pés lentamente e desça controlando toda a amplitude.', erro: 'Fazer rápido e curto, sem alongar embaixo.' },
    ponte: { nome: 'Ponte de glúteo', grupo: 'Glúteos e posterior', nivel: 'iniciante', equipamento: 'nenhum', execucao: 'Deitado, pés no chão, eleve o quadril contraindo o glúteo no topo.', erro: 'Empurrar com a lombar em vez do glúteo.' },
    supino: { nome: 'Supino', grupo: 'Peito', nivel: 'intermediário', equipamento: 'barra ou halteres', execucao: 'Escápulas retraídas, desça a barra até o peito e empurre.', erro: 'Quicar a barra no peito para ganhar impulso.' },
    alongamento: { nome: 'Alongamento', grupo: 'Mobilidade', nivel: 'todos', equipamento: 'nenhum', execucao: 'Leve a articulação até a tensão confortável e segure 30 segundos, respirando.', erro: 'Forçar até doer e prender a respiração.' }
}

/** Busca em todos os catálogos. */
function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [tipo, cat] of [['receita', RECEITAS], ['esporte', ESPORTES], ['exercício', EXERCICIOS]]) {
        for (const [chave, item] of Object.entries(cat)) {
            const alvo = `${chave} ${item.nome} ${item.tipo || ''} ${item.grupo || ''} ${(item.ingredientes || []).join(' ')}`.toLowerCase()
            if (alvo.includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

/** Receitas de um tipo (doce, bebida, prato principal…). */
function receitasPorTipo(tipo) {
    const t = String(tipo || '').toLowerCase()
    return Object.entries(RECEITAS)
        .filter(([, r]) => r.tipo.toLowerCase().includes(t))
        .map(([chave, r]) => ({ chave, ...r }))
        .sort((a, b) => a.tempo - b.tempo)
}

/** Exercícios de um grupo muscular. */
function exerciciosPorGrupo(grupo) {
    const g = String(grupo || '').toLowerCase()
    return Object.entries(EXERCICIOS)
        .filter(([, e]) => e.grupo.toLowerCase().includes(g))
        .map(([chave, e]) => ({ chave, ...e }))
}

module.exports = { RECEITAS, ESPORTES, EXERCICIOS, procurar, receitasPorTipo, exerciciosPorGrupo }
