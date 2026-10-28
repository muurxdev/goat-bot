/**
 * Jogos de mesa, cartas e brincadeiras.
 *
 * O campo decisivo de cada ficha é `discussao`: a regra que todo grupo disputa.
 * Quem procura as regras de truco às onze da noite não quer aprender a jogar —
 * quer resolver uma briga. Por isso ela vem separada, e por isso a ficha diz
 * quando a resposta honesta é "isso é regra de casa, combinem antes".
 *
 * As regras descritas são as mais correntes no Brasil. Truco tem variantes
 * regionais incompatíveis entre si, e a ficha assume isso em vez de escolher
 * uma e chamar de oficial.
 */

const JOGOS = {
    truco: {
        nome: 'Truco', tipo: 'cartas', jogadores: '2, 4 ou 6 (em duplas)', duracao: '20 a 60 min',
        material: 'Baralho de 40 cartas (sem 8, 9 e 10 no truco paulista)',
        objetivo: 'Fazer 12 pontos antes da dupla adversária.',
        comojoga: 'Cada um recebe 3 cartas. Vence a rodada quem joga a carta mais forte; vence a mão quem leva 2 das 3 rodadas. A qualquer momento dá para pedir truco e subir o valor da mão de 1 para 3, 6, 9 e 12.',
        discussao: 'A ordem das manilhas. No truco paulista a manilha é fixa (4♣, 7♥, A♠, 7♦, nessa ordem). No truco gaúcho e no mineiro ela é a carta seguinte à virada, e o naipe desempata na ordem paus, copas, espadas, ouros. São jogos diferentes com o mesmo nome.',
        combine: 'Antes da primeira mão, combinem: manilha fixa ou virada, se vale "mão de onze", se vale trucar de primeira e se pode falar com o parceiro.'
    },
    buraco: {
        nome: 'Buraco', tipo: 'cartas', jogadores: '4, em duplas', duracao: '40 a 90 min',
        material: 'Dois baralhos de 52 cartas com curingas',
        objetivo: 'Somar 3.000 pontos formando jogos de mesma carta ou sequências do mesmo naipe.',
        comojoga: 'Cada dupla recebe um "morto" de 11 cartas. Baixa-se jogos de 3 ou mais cartas; ao acabar as cartas da mão, a dupla pega o morto e continua. Bater encerra a rodada.',
        discussao: 'Se pode bater com canastra suja (com curinga) ou só com limpa. Também: se o 2 é curinga sempre ou só quando substitui carta.',
        combine: 'Pontuação da canastra limpa e suja, se vale bater sem canastra e quantos pontos encerram o jogo.'
    },
    canastra: {
        nome: 'Canastra', tipo: 'cartas', jogadores: '2 a 6', duracao: '40 a 90 min',
        material: 'Dois baralhos com curingas',
        objetivo: 'Formar canastras — conjuntos de 7 cartas ou mais — e somar mais pontos.',
        comojoga: 'Variante próxima do buraco, com regras de descarte e captura da pilha. Canastra limpa vale mais que suja.',
        discussao: 'Se a pilha de descarte pode ser pega inteira e sob que condição. É a regra que mais muda de mesa para mesa.',
        combine: 'Como se pega o lixo, valor das canastras e se existe morto.'
    },
    pife: {
        nome: 'Pife-pife', tipo: 'cartas', jogadores: '2 a 6', duracao: '10 a 30 min',
        material: 'Um ou dois baralhos',
        objetivo: 'Formar três trincas ou sequências e bater primeiro.',
        comojoga: 'Cada jogador recebe 9 cartas. Na sua vez, compra uma (do monte ou do descarte) e descarta uma. Quem fecha os três jogos bate.',
        discussao: 'Se pode bater comprando do descarte, e se o coringa vale em qualquer posição.',
        combine: 'Número de baralhos, se há coringa e se vale bater na primeira compra.'
    },
    sueca: {
        nome: 'Sueca', tipo: 'cartas', jogadores: '4, em duplas', duracao: '20 a 40 min',
        material: 'Baralho de 40 cartas',
        objetivo: 'Somar mais de 60 dos 120 pontos em jogo.',
        comojoga: 'Define-se um trunfo. É obrigatório assistir ao naipe puxado se tiver. Ás vale 11, sete vale 10, rei 4, valete 3, dama 2.',
        discussao: 'Se é obrigatório trunfar quando não tem o naipe, ou apenas facultativo. Muda completamente a estratégia.',
        combine: 'Se vale sinal para o parceiro e como se marca a "bisca de dez".'
    },
    bisca: {
        nome: 'Bisca', tipo: 'cartas', jogadores: '2 ou 4', duracao: '15 a 30 min',
        material: 'Baralho de 40 cartas',
        objetivo: 'Fazer mais pontos nas vazas, com o mesmo valor de cartas da sueca.',
        comojoga: 'Enquanto houver monte, compra-se uma carta após cada vaza. Não é obrigatório assistir ao naipe enquanto o monte existir.',
        discussao: 'Quando exatamente começa a obrigação de assistir. A maioria adota "depois que o monte acaba".',
        combine: 'Se joga com 3 ou 9 cartas na mão e o momento em que a assistência passa a ser obrigatória.'
    },
    poker: {
        nome: 'Pôquer (Texas Hold\'em)', tipo: 'cartas', jogadores: '2 a 10', duracao: 'indefinida',
        material: 'Baralho de 52 cartas e fichas',
        objetivo: 'Formar a melhor mão de cinco cartas, ou fazer todos desistirem.',
        comojoga: 'Cada um recebe 2 cartas fechadas; 5 comunitárias são abertas em três etapas (flop, turn, river), com rodada de apostas entre elas.',
        discussao: 'Se a mesa usa "all-in" com fichas descobertas e como se resolve empate no side pot.',
        combine: 'Valor do blind, se há ante e regra de recompra.'
    },
    domino: {
        nome: 'Dominó', tipo: 'peças', jogadores: '2 ou 4 (em duplas)', duracao: '15 a 40 min',
        material: '28 peças de 0-0 a 6-6',
        objetivo: 'Livrar-se de todas as peças ou fechar o jogo com menos pontos na mão.',
        comojoga: 'Encaixa-se peça com número igual a uma das pontas. Quem não tem, passa. Quem bate primeiro vence a partida.',
        discussao: 'Quanto vale a "carroça" (peça dupla) na batida, e se bater com carroça dobra os pontos.',
        combine: 'Pontuação de batida por carroça, cruzada e "lá e lô", e quantos pontos encerram a partida.'
    },
    uno: {
        nome: 'UNO', tipo: 'cartas', jogadores: '2 a 10', duracao: '15 a 30 min',
        material: 'Baralho UNO de 108 cartas',
        objetivo: 'Livrar-se de todas as cartas primeiro.',
        comojoga: 'Joga-se carta de mesma cor ou mesmo número. Cartas de ação invertem, pulam ou fazem comprar. Ao ficar com uma carta, é preciso gritar UNO.',
        discussao: 'Se +2 acumula em cima de +2. A regra oficial diz que NÃO acumula: quem recebe compra e perde a vez. Praticamente todo grupo joga acumulando.',
        combine: 'Se acumula +2 e +4, se pode jogar +4 tendo a cor, e a punição por esquecer o UNO.'
    },
    war: {
        nome: 'War', tipo: 'tabuleiro', jogadores: '3 a 6', duracao: '1 a 3 horas',
        material: 'Tabuleiro, exércitos e dados',
        objetivo: 'Cumprir o objetivo secreto sorteado no início.',
        comojoga: 'Distribuem-se territórios; a cada turno recebem-se exércitos, ataca-se com dados e trocam-se cartas por reforços.',
        discussao: 'Se o objetivo de "destruir o exército amarelo" vale quando outro jogador o destrói. A regra padrão manda trocar por conquistar 24 territórios.',
        combine: 'Se joga com objetivo secreto ou conquista total, e a progressão da troca de cartas.'
    },
    damas: {
        nome: 'Damas', tipo: 'tabuleiro', jogadores: '2', duracao: '15 a 40 min',
        material: 'Tabuleiro 8×8 e 24 peças',
        objetivo: 'Capturar todas as peças do adversário ou deixá-lo sem movimento.',
        comojoga: 'Peças andam na diagonal para frente e capturam saltando. Ao chegar à última linha, viram dama e andam quantas casas quiserem.',
        discussao: 'Se a captura é obrigatória e se existe "sopro" (perder a peça por não capturar). A regra brasileira oficial torna a captura obrigatória e ABOLIU o sopro.',
        combine: 'Se vale sopro, se a dama anda longe e se é obrigatório capturar o maior número de peças.'
    },
    xadrezjogo: {
        nome: 'Xadrez', tipo: 'tabuleiro', jogadores: '2', duracao: '10 min a várias horas',
        material: 'Tabuleiro 8×8 e 32 peças',
        objetivo: 'Dar xeque-mate no rei adversário.',
        comojoga: 'Cada peça tem um movimento próprio. Brancas começam. Empate por afogamento, repetição, material insuficiente ou acordo.',
        discussao: 'Peão que chega ao fim pode virar qualquer peça, inclusive uma segunda dama — muita gente acha que só pode voltar peça capturada. Pode virar dama sempre.',
        combine: 'Controle de tempo e se vale "peça tocada, peça jogada".'
    },
    jogodavelha: {
        nome: 'Jogo da velha', tipo: 'papel', jogadores: '2', duracao: '1 min',
        material: 'Papel e caneta',
        objetivo: 'Alinhar três símbolos.',
        comojoga: 'Alternam-se X e O numa grade 3×3.',
        discussao: 'Nenhuma: o jogo está matematicamente resolvido. Com os dois jogando bem, dá empate sempre.',
        combine: 'Nada a combinar. Se alguém ganha, alguém errou.'
    },
    forca: {
        nome: 'Forca', tipo: 'papel', jogadores: '2 ou mais', duracao: '5 min',
        material: 'Papel e caneta',
        objetivo: 'Descobrir a palavra antes de completar o desenho.',
        comojoga: 'Um pensa a palavra e marca os traços; os outros chutam letras.',
        discussao: 'Quantas partes tem o boneco e se letra repetida errada conta duas vezes.',
        combine: 'Número de erros permitidos e se acentos e espaços aparecem de graça.'
    },
    stop: {
        nome: 'Stop / Adedonha', tipo: 'papel', jogadores: '3 ou mais', duracao: '20 a 40 min',
        material: 'Papel e caneta',
        objetivo: 'Preencher categorias com palavras da letra sorteada antes de todos.',
        comojoga: 'Sorteia-se uma letra; todos preenchem as categorias e quem termina grita stop. Resposta única vale 10, repetida vale 5.',
        discussao: 'Se nome de marca, gíria e nome próprio valem. E se resposta que só uma pessoa colocou, mas errada, pontua.',
        combine: 'Categorias, se vale nome próprio e como se resolve resposta contestada — o ideal é voto da mesa.'
    },
    banco: {
        nome: 'Banco Imobiliário', tipo: 'tabuleiro', jogadores: '2 a 6', duracao: '1 a 3 horas',
        material: 'Tabuleiro, dinheiro, dados e peças',
        objetivo: 'Falir os demais jogadores.',
        comojoga: 'Anda-se pelo tabuleiro comprando propriedades e cobrando aluguel de quem cai nelas.',
        discussao: 'O dinheiro do "estacionamento livre". A regra oficial diz que ali NÃO se acumula nada — o prêmio na casa central é invenção caseira que faz a partida durar horas a mais.',
        combine: 'Se há prêmio no estacionamento, se leilão é obrigatório ao recusar compra e o limite de casas.'
    },
    dominoDeMesa: {
        nome: 'Cara a cara', tipo: 'tabuleiro', jogadores: '2', duracao: '10 min',
        material: 'Dois painéis de personagens',
        objetivo: 'Adivinhar o personagem do adversário fazendo perguntas de sim ou não.',
        comojoga: 'Cada pergunta elimina personagens. Vence quem descobre primeiro.',
        discussao: 'Se vale perguntar diretamente "é o fulano?" antes de eliminar os outros. Vale, mas gasta a vez.',
        combine: 'Se pergunta com "ou" é permitida — ela acelera demais o jogo.'
    },
    imagemeacao: {
        nome: 'Imagem e Ação', tipo: 'festa', jogadores: '4 ou mais, em times', duracao: '30 a 60 min',
        material: 'Cartas, papel, caneta e ampulheta',
        objetivo: 'Fazer o time adivinhar a palavra pelo desenho.',
        comojoga: 'Quem desenha não pode falar, escrever letra nem fazer gesto. O time chuta enquanto a ampulheta corre.',
        discussao: 'Se pode desenhar seta, número e símbolo. Em geral vale seta, não vale letra nem número.',
        combine: 'O que conta como "letra", tempo por rodada e se o time adversário pode roubar.'
    },
    mimica: {
        nome: 'Mímica', tipo: 'festa', jogadores: '4 ou mais, em times', duracao: '20 a 40 min',
        material: 'Papéis com palavras',
        objetivo: 'Fazer o time adivinhar sem emitir som.',
        comojoga: 'Sorteia-se a palavra e o jogador representa em silêncio, dentro do tempo.',
        discussao: 'Se vale apontar para objeto real da sala. A maioria proíbe, porque resolve rápido demais.',
        combine: 'Se vale apontar, se vale mostrar sílabas com os dedos e o tempo por rodada.'
    },
    verdadedesafio: {
        nome: 'Verdade ou Desafio', tipo: 'festa', jogadores: '3 ou mais', duracao: 'indefinida',
        material: 'Nenhum',
        objetivo: 'Não tem placar: o jogo é a conversa.',
        comojoga: 'Na sua vez, escolhe-se verdade (responder uma pergunta) ou desafio (cumprir uma tarefa).',
        discussao: 'Se pode recusar. A regra saudável é: sim, sempre — com uma prenda leve, nunca com pressão.',
        combine: 'Limites do grupo ANTES de começar, e o direito de passar sem justificar. Jogo de festa que constrange deixou de ser jogo.'
    }
}

const TIPOS = {
    cartas: { nome: 'Cartas', emoji: '🃏' },
    tabuleiro: { nome: 'Tabuleiro', emoji: '🎲' },
    pecas: { nome: 'Peças', emoji: '🁢' },
    papel: { nome: 'Papel e caneta', emoji: '📝' },
    festa: { nome: 'Festa e grupo', emoji: '🎉' }
}

/** Corrige o rótulo de tipo do dominó, que é "peças" no catálogo. */
const APELIDO_TIPO = { 'peças': 'pecas' }
const tipoDe = j => APELIDO_TIPO[j.tipo] || j.tipo

function porTipo(tipo) {
    const t = String(tipo || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    return Object.entries(JOGOS).filter(([, j]) => tipoDe(j) === t).map(([chave, j]) => ({ chave, ...j }))
}

/**
 * Quantos jogadores cada jogo aceita, de forma explícita.
 *
 * Deduzir isso do texto livre não funciona: "2, 4 ou 6 (em duplas)" tem menor 2
 * e maior 6, e um parser ingênuo aceitaria 3 e 5 — que não são partidas válidas
 * de truco. E "4 ou mais" recusaria 6. Lista fechada é mais chata de manter e
 * devolve a resposta certa.
 *
 * `exatos` quando só certos números servem; `min`/`max` quando é faixa contínua.
 */
const LOTACAO = {
    truco: { exatos: [2, 4, 6] },
    buraco: { exatos: [4] },
    canastra: { min: 2, max: 6 },
    pife: { min: 2, max: 6 },
    sueca: { exatos: [4] },
    bisca: { exatos: [2, 4] },
    poker: { min: 2, max: 10 },
    domino: { exatos: [2, 4] },
    uno: { min: 2, max: 10 },
    war: { min: 3, max: 6 },
    damas: { exatos: [2] },
    xadrezjogo: { exatos: [2] },
    jogodavelha: { exatos: [2] },
    forca: { min: 2, max: 20 },
    stop: { min: 3, max: 20 },
    banco: { min: 2, max: 6 },
    dominoDeMesa: { exatos: [2] },
    imagemeacao: { min: 4, max: 20 },
    mimica: { min: 4, max: 20 },
    verdadedesafio: { min: 3, max: 20 }
}

/** Jogos que cabem num número de pessoas. */
function paraJogadores(n) {
    const q = parseInt(n, 10)
    if (!Number.isFinite(q) || q < 1) return null
    return Object.entries(JOGOS).filter(([chave]) => {
        const l = LOTACAO[chave]
        if (!l) return false
        if (l.exatos) return l.exatos.includes(q)
        return q >= l.min && q <= l.max
    }).map(([chave, j]) => ({ chave, ...j, lotacao: LOTACAO[chave] }))
}

function procurar(termo) {
    const t = String(termo || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    if (!t) return []
    return Object.entries(JOGOS)
        .filter(([chave, j]) => (JSON.stringify(j) + chave).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(t))
        .map(([chave, j]) => ({ tipo: 'jogo', chave, nome: j.nome }))
}

module.exports = { JOGOS, TIPOS, LOTACAO, tipoDe, porTipo, paraJogadores, procurar }
