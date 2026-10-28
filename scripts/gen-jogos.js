/**
 * Gerador da família JOGOS DE GRUPO — um comando por brincadeira (.quiztema,
 * .forca, .roda, .dilemas…), com a variante como argumento.
 *
 * A TABELA abaixo descreve as 250 variantes que antes eram .jogo1 … .jogo250.
 * O SPEC no fim diz como cada motor vira um jogo; variantes com a mesma
 * configuração viram uma só, e cada .jogoN antigo vira atalho da sua variante.
 * O comando gerado não contém regra: entrega a configuração ao
 * src/services/jogoUnificadoService.js, que chama o partyGamesService.
 *
 * Uso:
 *   node scripts/gen-jogos.js            grava os arquivos e o manifesto
 *   node scripts/gen-jogos.js --dry      só confere a tabela e conta
 *
 * Saída extra: scripts/manifests/jogo_arquivos.json — a lista do que foi gerado.
 */

const fs = require('fs')
const path = require('path')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

const D = require('../src/services/partyGamesData')

const RAIZ = path.resolve(__dirname, '..')
const DESTINO = path.join(RAIZ, 'src', 'commands', 'fun')
const MANIFESTO = path.join(RAIZ, 'scripts', 'manifests', 'jogo_arquivos.json')
const DRY = process.argv.includes('--dry')

const SUB_QUIZ = 'Jogos & Quizzes'
const SUB_MESA = 'Jogos de Mesa'

// ─── Blocos de exemplos reaproveitados ──────────────────────────────────────

const EX_RODADA = ['parar — encerra a rodada e mostra a resposta']
const USO_RODADA = '[jogada | parar]'
const USO_SEM_ESTADO = '(sem argumento)'

/** @type {Array<object>} tabela declarativa: cada item vira um arquivo. */
const TABELA = []

function add(item) { TABELA.push(item) }

// ─── 80 quizzes: 40 temas × 2 modos ─────────────────────────────────────────

for (const tema of Object.keys(D.QUIZZES)) {
    const nome = D.QUIZZES[tema].nome
    for (const [qtd, rotulo] of [[5, 'rodada curta'], [10, 'maratona']]) {
        add({
            grupo: 'quiz', sub: SUB_QUIZ,
            config: { motor: 'quiz', tema, qtd, emoji: D.QUIZZES[tema].emoji, titulo: `Quiz de ${nome}` },
            description: `Quiz de ${nome} em ${qtd} perguntas`,
            usage: USO_RODADA,
            examples: ['a — responde a alternativa A', ...EX_RODADA],
            comentario: `Quiz de ${nome} (${rotulo}, ${qtd} perguntas sorteadas de ${D.QUIZZES[tema].perguntas.length}).`
        })
    }
}

// ─── 60 jogos de palavra ────────────────────────────────────────────────────

// Temas extras (ex.: saga, da forca antiga) ficam fora: a ordem daqui numera os .jogoN.
const TEMAS_FORCA = Object.keys(D.FORCA).filter(t => !D.TEMAS_FORCA_EXTRAS.includes(t))

for (const tema of TEMAS_FORCA) {
    const b = D.FORCA[tema]
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'forca', tema, emoji: b.emoji, titulo: `Forca de ${b.nome}` },
        description: `Forca com palavras de ${b.nome.toLowerCase()}`,
        usage: '[letra | palavra | parar]',
        examples: ['a — chuta a letra A', 'girafa — arrisca a palavra inteira', ...EX_RODADA],
        comentario: `Forca clássica, seis vidas, palavras do tema ${b.nome}.`
    })
}

for (const tema of TEMAS_FORCA) {
    const b = D.FORCA[tema]
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'palavra', modo: 'dica', tema, tentativas: 4, emoji: b.emoji, titulo: `Adivinhe: ${b.nome}` },
        description: `Adivinhe a palavra de ${b.nome.toLowerCase()} pela dica`,
        usage: USO_RODADA,
        examples: ['girafa — manda seu palpite', ...EX_RODADA],
        comentario: `Uma dica, quatro tentativas e uma letra a mais revelada a cada erro.`
    })
}

for (const tema of TEMAS_FORCA.slice(0, 6)) {
    const b = D.FORCA[tema]
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'palavra', modo: 'anagrama', tema, tentativas: 4, emoji: b.emoji, titulo: `Anagrama de ${b.nome}` },
        description: `Anagrama de ${b.nome.toLowerCase()} com dica junto`,
        usage: USO_RODADA,
        examples: ['girafa — manda seu palpite', ...EX_RODADA],
        comentario: 'Letras embaralhadas com a dica do tema por cima.'
    })
}

for (const tema of TEMAS_FORCA.slice(6, 9)) {
    const b = D.FORCA[tema]
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'palavra', modo: 'embaralhada', tema, tentativas: 3, emoji: b.emoji, titulo: `Palavra embaralhada: ${b.nome}` },
        description: `Palavra embaralhada de ${b.nome.toLowerCase()}, sem dica`,
        usage: USO_RODADA,
        examples: ['girafa — manda seu palpite', ...EX_RODADA],
        comentario: 'Só as letras fora de ordem: versão difícil, sem dica de tema.'
    })
}

for (const [i, tentativas] of [[1, 6], [2, 4], [3, 3]]) {
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'sinonimo', modo: 'sinonimo', emoji: '🟰', titulo: 'Caça-sinônimos' },
        description: i === 1 ? 'Sinônimos: liste todos os que eu aceito' : `Sinônimos, rodada ${i === 2 ? 'média' : 'apertada'}`,
        usage: USO_RODADA,
        examples: ['feliz — manda um sinônimo', ...EX_RODADA],
        comentario: `Lista de sinônimos aceitos; a rodada só fecha quando todos aparecem (limite informal de ${tentativas} erros).`
    })
}

for (const [i] of [[1], [2], [3]]) {
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'sinonimo', modo: 'antonimo', emoji: '↔️', titulo: 'Caça-antônimos' },
        description: i === 1 ? 'Antônimos: liste todos os que eu aceito' : `Antônimos, rodada ${i === 2 ? 'média' : 'apertada'}`,
        usage: USO_RODADA,
        examples: ['triste — manda um antônimo', ...EX_RODADA],
        comentario: 'Mesma mecânica do caça-sinônimos, com a lista invertida.'
    })
}

const TEXTOS = [
    ['charada', 'Charada', 2, ['batata — manda sua resposta']],
    ['enigma', 'Enigma', 2, ['espelho — manda sua resposta']],
    ['oqueeoquee', 'O que é, o que é', 2, ['chuva — manda sua resposta']],
    ['frase', 'Complete a frase', 2, ['perfeicao — completa a lacuna']],
    ['proverbio', 'Provérbio partido', 2, ['caca com gato — completa o ditado']],
    ['soletrar', 'Soletrando', 2, ['excecao — soletra a palavra']],
    ['travalingua', 'Trava-língua', 2, ['o rato roeu a roupa — digita igualzinho']]
]
for (const [modo, titulo, quantos, exemplos] of TEXTOS) {
    for (let i = 0; i < quantos; i++) {
        const tentativas = i === 0 ? 3 : 2
        add({
            grupo: 'palavra', sub: SUB_QUIZ,
            config: { motor: 'texto', modo, tentativas, emoji: '🔤', titulo },
            description: i === 0 ? `${titulo}: três tentativas por rodada` : `${titulo} difícil: duas tentativas`,
            usage: USO_RODADA,
            examples: [...exemplos, ...EX_RODADA],
            comentario: `${titulo} com ${tentativas} tentativas; a ajuda aparece depois do primeiro erro.`
        })
    }
}

for (const [tema, qtd] of [['animais', 3], ['objetos', 3]]) {
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        // O tema entra na descrição: os dois usam qtd 3 e, sem ele, os dois
        // comandos ficavam com a mesma frase no menu.
        config: { motor: 'rima', tema, qtd, emoji: '🎤', titulo: `Batalha de rima — ${tema}` },
        description: `Batalha de rima com ${tema}: ${qtd} rimas`,
        usage: USO_RODADA,
        examples: ['coracao — manda uma rima', ...EX_RODADA],
        comentario: 'Confere a rima pelo final do som, ignorando acento.'
    })
}

for (const qtd of [4, 6]) {
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'stop', qtd, emoji: '🛑', titulo: 'Stop da taverna' },
        description: `Stop com ${qtd} categorias e letra sorteada`,
        usage: '[respostas separadas por vírgula | parar]',
        examples: ['ana, arara, aracaju, arroz — responde tudo de uma vez', 'parar — cancela a rodada'],
        comentario: `Adedonha de uma pessoa: sorteia a letra e ${qtd} categorias, depois confere e pontua.`
    })
}

add({
    grupo: 'palavra', sub: SUB_QUIZ,
    config: { motor: 'proibida', qtd: 2, titulo: 'Palavra proibida' },
    description: 'Explique a palavra sem usar nenhuma das proibidas',
    usage: USO_SEM_ESTADO,
    examples: ['— sorteia duas palavras com a lista de proibidas'],
    comentario: 'Brincadeira de mesa: o bot sorteia o alvo e as palavras que não podem ser ditas.'
})

for (const [tema, lado, qtd] of [['frutas', 9, 4], ['profissoes', 10, 4]]) {
    const b = D.FORCA[tema]
    add({
        grupo: 'palavra', sub: SUB_QUIZ,
        config: { motor: 'caca', tema, lado, qtd, emoji: '🔎', titulo: `Caça-palavras de ${b.nome}` },
        description: `Caça-palavras de ${b.nome.toLowerCase()} em grade ${lado} por ${lado}`,
        usage: USO_RODADA,
        examples: ['caju — diz uma palavra que achou', ...EX_RODADA],
        comentario: `Grade ${lado}x${lado} com ${qtd} palavras na horizontal e na vertical.`
    })
}

// ─── 50 brincadeiras de grupo sem rodada ────────────────────────────────────

const REGRAS = {
    verdades: ['Quem foi sorteado responde na hora.', 'Mentira descoberta paga prenda.', 'Ninguém é obrigado: pode passar uma vez.'],
    desafios: ['Cumpra o desafio antes da próxima mensagem do grupo.', 'Não cumpriu, cumpre dois na próxima.', 'Nada que machuque ninguém.'],
    verdadeoudesafio: ['Escolha verdade ou desafio antes de ler.', 'Escolheu, não pode trocar.', 'Quem responde sorteia o próximo.'],
    eununca: ['Quem já fez, conta a história.', 'Quem nunca fez, fica quieto e escuta.', 'Vale contestar quem mentir.'],
    duasverdades: ['Conte três coisas sobre o tema: duas verdades e uma mentira.', 'O grupo vota em qual é a mentira.', 'Quem enganar a maioria ganha a rodada.'],
    relampago: ['Dez segundos para responder.', 'Repetiu, perdeu.', 'Quem travar passa a vez.'],
    sussurro: ['A primeira pessoa lê a frase e passa no ouvido ou no privado.', 'A última fala em voz alta o que entendeu.', 'Comparem com o original e riam.'],
    historia: ['Cada pessoa acrescenta uma frase à história.', 'Não vale repetir personagem que já morreu.', 'A história acaba quando alguém fecha com final feliz.'],
    confissoes: ['Responda no privado de quem chamou.', 'Quem recebeu lê tudo embaralhado no grupo.', 'O grupo adivinha de quem é cada confissão.'],
    juri: ['Metade defende, metade acusa.', 'Cada lado tem duas frases.', 'O grupo vota culpado ou inocente.'],
    maisprovavel: ['Todo mundo aponta uma pessoa ao mesmo tempo.', 'Quem receber mais apontamentos explica.', 'Vale mandar figurinha em vez de nome.'],
    travalinguas: ['Grave um áudio dizendo três vezes seguidas.', 'Errou, começa de novo.', 'Quem fizer mais rápido escolhe o próximo.']
}

const GRUPO_SORTEIO = [
    ['verdades', 'Verdade sorteada', '🫣', 1], ['verdades', 'Roda de verdades', '🫣', 3], ['verdades', 'Sessão de verdades', '🫣', 5],
    ['desafios', 'Desafio sorteado', '😈', 1], ['desafios', 'Roda de desafios', '😈', 3], ['desafios', 'Maratona de desafios', '😈', 5],
    ['verdadeoudesafio', 'Verdade ou desafio', '🎭', 1], ['verdadeoudesafio', 'Verdade ou desafio em trio', '🎭', 3], ['verdadeoudesafio', 'Verdade ou desafio sem dó', '🎭', 5],
    ['eununca', 'Eu nunca', '🙈', 1], ['eununca', 'Eu nunca em roda', '🙈', 3], ['eununca', 'Eu nunca sem filtro', '🙈', 5],
    ['duasverdades', 'Duas verdades e uma mentira', '🃏', 1], ['duasverdades', 'Duas verdades com tema triplo', '🃏', 3], ['duasverdades', 'Duas verdades no modo difícil', '🃏', 5],
    ['relampago', 'Desafio relâmpago', '⚡', 1], ['relampago', 'Relâmpago triplo', '⚡', 3], ['relampago', 'Relâmpago em série', '⚡', 5],
    ['maisprovavel', 'Quem é mais provável', '👉', 1], ['maisprovavel', 'Quem é mais provável em trio', '👉', 3],
    ['maisprovavel', 'Rodada de quem é mais provável', '👉', 4], ['maisprovavel', 'Quem é mais provável sem parar', '👉', 6],
    ['sussurro', 'Telefone sem fio', '🤫', 1], ['sussurro', 'Telefone sem fio em série', '🤫', 3],
    ['historia', 'História coletiva', '📖', 1], ['historia', 'História coletiva com três começos', '📖', 3], ['historia', 'História coletiva embolada', '📖', 5],
    ['confissoes', 'Confissão anônima', '🕯️', 1], ['confissoes', 'Confissões em série', '🕯️', 3],
    ['juri', 'Júri do grupo', '⚖️', 1], ['juri', 'Júri com três casos', '⚖️', 3], ['juri', 'Sessão de julgamento', '⚖️', 5],
    ['travalinguas', 'Duelo de trava-língua', '👅', 1], ['travalinguas', 'Trava-língua em série', '👅', 3]
]

for (const [banco, titulo, emoji, qtd] of GRUPO_SORTEIO) {
    add({
        grupo: 'grupo', sub: SUB_QUIZ,
        config: {
            motor: 'sorteio', banco, titulo, emoji, qtd,
            intro: qtd === 1 ? 'Sorteei um para a roda começar.' : `Sorteei ${qtd} de uma vez para a roda não parar.`,
            rotulo: qtd === 1 ? 'A vez é sua' : 'Sorteados agora',
            regras: REGRAS[banco],
            dica: 'Marque quem vai responder para a roda não travar.'
        },
        description: `${titulo}${qtd > 1 ? `, ${qtd} de uma vez` : ''}`.slice(0, 55),
        usage: USO_SEM_ESTADO,
        examples: [`— sorteia ${qtd === 1 ? 'um item' : qtd + ' itens'} para o grupo`],
        comentario: `Brincadeira de roda sem estado: sorteia ${qtd} item(ns) do banco ${banco}.`
    })
}

for (const [titulo, qtd] of [['Você prefere', 1], ['Você prefere em dose dupla', 2], ['Você prefere em trio', 3], ['Você prefere sem trégua', 4]]) {
    add({
        grupo: 'grupo', sub: SUB_QUIZ,
        config: { motor: 'vocePrefere', titulo, qtd },
        description: `${titulo}: escolha impossível para o grupo`.slice(0, 55),
        usage: USO_SEM_ESTADO,
        examples: [`— sorteia ${qtd} dilema(s) para votar`],
        comentario: 'Dilema sem resposta certa; serve para o grupo brigar em paz.'
    })
}

for (const tema of Object.keys(D.MIMICA)) {
    const b = D.MIMICA[tema]
    add({
        grupo: 'grupo', sub: SUB_QUIZ,
        config: { motor: 'mimica', tema, qtd: 3 },
        description: `Mímica de ${b.nome.toLowerCase()}: três itens sorteados`,
        usage: USO_SEM_ESTADO,
        examples: ['— sorteia três itens para representar'],
        comentario: `Sorteia o que mimicar dentro do tema ${b.nome}.`
    })
}

for (const [titulo, qtd] of [['Eleição da taverna', 3], ['Eleição relâmpago', 2], ['Eleição geral do grupo', 5], ['Eleição com cargo novo', 4]]) {
    add({
        grupo: 'grupo', sub: SUB_QUIZ,
        config: { motor: 'eleicao', titulo, qtd },
        description: `${titulo}: cargos sorteados para votação`.slice(0, 55),
        usage: USO_SEM_ESTADO,
        examples: [`— sorteia ${qtd} cargos para o grupo eleger`],
        comentario: 'Urna de brincadeira: cargos sorteados e votação aberta no grupo.'
    })
}

for (const [titulo, qtd] of [['Ranking do grupo', 3], ['Ranking relâmpago', 2], ['Ranking completo do grupo', 5], ['Ranking da zoeira', 4]]) {
    add({
        grupo: 'grupo', sub: SUB_QUIZ,
        config: { motor: 'ranking', titulo, qtd },
        description: `${titulo}: categorias de brincadeira`.slice(0, 55),
        usage: USO_SEM_ESTADO,
        examples: [`— sorteia ${qtd} categorias para votar`],
        comentario: 'Ranking escopado neste grupo, como manda a casa. Nada de comparação global.'
    })
}

// ─── 60 jogos de sorte e raciocínio ─────────────────────────────────────────

for (const [max, rotulo] of [[20, 'relâmpago'], [50, 'curto'], [100, 'clássico'], [500, 'longo'], [1000, 'difícil'], [10000, 'maratona']]) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'numero', max, titulo: `Adivinhe o número de 1 a ${max}` },
        // Cabe nos 55 caracteres do menu até com o maior teto (10000).
        description: `Adivinhe o número de 1 a ${max}: digo maior ou menor`,
        usage: '[número | parar]',
        examples: ['50 — chuta esse número', ...EX_RODADA],
        comentario: `Faixa ${rotulo}: 1 a ${max}, com faixa restante mostrada a cada palpite.`
    })
}

for (const [dificuldade, rotulo] of [['facil', 'moleza'], ['medio', 'na medida'], ['impossivel', 'impossível']]) {
    add({
        grupo: 'sorte', sub: SUB_MESA,
        config: { motor: 'velha', dificuldade, titulo: `Jogo da velha ${rotulo}` },
        description: `Jogo da velha contra o bot no modo ${rotulo}`,
        usage: '[casa de 1 a 9 | parar]',
        examples: ['5 — marca o centro', 'parar — abandona a partida'],
        comentario: dificuldade === 'impossivel'
            ? 'O bot joga minimax completo: o melhor resultado possível é empate.'
            : `Bot no modo ${rotulo}; erra de propósito parte das jogadas.`
    })
}

for (const [vitorias, rotulo] of [[1, 'rodada única'], [3, 'melhor de cinco'], [5, 'melhor de nove']]) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'jokenpo', vitorias, titulo: `Pedra, papel e tesoura — ${rotulo}` },
        description: `Pedra, papel e tesoura contra o bot, ${rotulo}`,
        usage: '[pedra | papel | tesoura | parar]',
        examples: ['pedra — joga pedra', 'parar — encerra a disputa'],
        comentario: `Disputa até ${vitorias} vitória(s); o placar fica guardado entre as jogadas.`
    })
}

for (const [faces, qtd, titulo] of [[6, 1, 'Rolar um dado'], [6, 2, 'Rolar dois dados'], [12, 1, 'Dado de doze faces'], [20, 1, 'Dado de vinte faces'], [100, 1, 'Dado de cem faces']]) {
    add({
        grupo: 'sorte', sub: SUB_MESA,
        config: { motor: 'dados', faces, qtd, titulo },
        description: `${titulo} para decidir a vez ou a prenda`.slice(0, 55),
        usage: '[quantos dados]',
        examples: ['3 — rola três dados de uma vez'],
        comentario: `Rolagem de ${faces} faces; aceita de 1 a 10 dados por chamada.`
    })
}

for (const [titulo, qtd] of [['Roleta de prendas', 3], ['Roleta relâmpago', 2], ['Roleta cheia', 5], ['Roleta da taverna', 4]]) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'roleta', titulo, qtd },
        description: `${titulo}: sorteia a prenda da rodada`.slice(0, 55),
        usage: USO_SEM_ESTADO,
        examples: ['— gira a roleta e mostra a prenda sorteada'],
        comentario: 'Prenda é brincadeira: nada que envolva moeda do jogo entra aqui.'
    })
}

const MEMORIA = [
    [['1', '2', '3', '4'], 7, 'números de 1 a 4'],
    [['1', '2', '3', '4', '5', '6'], 9, 'números de 1 a 6'],
    [['A', 'B', 'C', 'D'], 8, 'letras de A a D'],
    [['1', '2', '3', '4', '5', '6', '7', '8'], 12, 'números de 1 a 8']
]
for (const [simbolos, nivelMaximo, rotulo] of MEMORIA) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'memoria', simbolos, nivelMaximo, titulo: 'Sequência de memória' },
        description: `Sequência de memória com ${rotulo}`,
        usage: USO_RODADA,
        examples: ['1 2 3 — repete a sequência', 'parar — encerra a sequência'],
        comentario: `Cresce um símbolo por acerto, até o nível ${nivelMaximo}.`
    })
}

for (const [buracos, rotulo] of [[4, 'fácil'], [6, 'médio'], [8, 'difícil']]) {
    add({
        grupo: 'sorte', sub: SUB_MESA,
        config: { motor: 'sudoku', buracos, titulo: `Sudoku de bolso ${rotulo}` },
        description: `Sudoku 4 por 4 no modo ${rotulo}, com solução conferida`,
        usage: '[linha coluna valor | parar]',
        examples: ['2 3 4 — põe o 4 na linha 2, coluna 3', 'parar — desiste e vê a solução'],
        comentario: `Grade 4x4 gerada de um quadrado latino embaralhado, com ${buracos} casas vazias.`
    })
}

for (const [vazio, rotulo] of [[1, 'topo vazio'], [5, 'meio vazio']]) {
    add({
        grupo: 'sorte', sub: SUB_MESA,
        config: { motor: 'restaum', vazio, titulo: `Resta-um com ${rotulo}` },
        description: `Resta-um triangular de 15 casas, ${rotulo}`,
        usage: '[de para | parar]',
        examples: ['4 1 — salta da casa 4 para a 1', 'parar — encerra o tabuleiro'],
        comentario: `Tabuleiro triangular clássico; começa com a casa ${vazio} vazia.`
    })
}

for (const discos of [3, 4, 5, 6]) {
    add({
        grupo: 'sorte', sub: SUB_MESA,
        config: { motor: 'hanoi', discos, titulo: `Torre de Hanói com ${discos} discos` },
        description: `Torre de Hanói com ${discos} discos, mínimo ${Math.pow(2, discos) - 1} jogadas`,
        usage: '[torre de origem e destino | parar]',
        examples: ['1 3 — move o disco do topo da torre 1 para a 3', 'parar — encerra'],
        comentario: `Valida cada movimento e compara com o mínimo teórico de ${Math.pow(2, discos) - 1}.`
    })
}

for (const [celulas, rotulo] of [[3, 'de bolso'], [4, 'normal'], [5, 'grande'], [6, 'enorme']]) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'labirinto', celulas, titulo: `Labirinto ${rotulo}` },
        description: `Labirinto ${rotulo} em texto, ande com n, s, l e o`,
        usage: '[rumos | parar]',
        examples: ['ssll — anda duas para o sul e duas para leste', 'parar — sai do labirinto'],
        comentario: `Labirinto ${celulas}x${celulas} gerado por busca em profundidade; sempre tem caminho.`
    })
}

for (const [tentativas, rotulo] of [[5, 'com folga'], [4, 'tranquilo'], [3, 'padrão'], [3, 'de mesa'], [2, 'apertado'], [2, 'cruel'], [1, 'tiro único']]) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'logica', tentativas, titulo: `Quebra-cabeça lógico ${rotulo}` },
        description: `Quebra-cabeça lógico ${rotulo}: ${tentativas} tentativa(s)`,
        usage: USO_RODADA,
        examples: ['2 — manda sua resposta', ...EX_RODADA],
        comentario: `Enigma de raciocínio com ${tentativas} tentativa(s); a explicação vem no fim.`
    })
}

for (const [tentativas, rotulo] of [[5, 'com folga'], [4, 'tranquila'], [3, 'padrão'], [3, 'de treino'], [2, 'apertada'], [1, 'tiro único']]) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'sequencia', tentativas, titulo: `Sequência lógica ${rotulo}` },
        description: `Sequência lógica ${rotulo}: descubra o próximo número`,
        usage: '[número | parar]',
        examples: ['13 — chuta o próximo termo', ...EX_RODADA],
        comentario: `Gera soma, produto, Fibonacci, quadrados ou diferença crescente. ${tentativas} tentativa(s).`
    })
}

for (const rotulo of ['simples', 'com senha sorteada']) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'reflexo', titulo: `Teste de reflexo ${rotulo}` },
        description: `Teste de reflexo ${rotulo}, cronometrado`,
        usage: '[senha | parar]',
        examples: ['ja — responde a senha sorteada', 'parar — cancela o teste'],
        comentario: 'Mede o tempo entre a mensagem do bot e a resposta com a senha certa.'
    })
}

const CONTAS = [
    [1, 5, 'somas'], [2, 5, 'multiplicações'], [3, 5, 'somas e subtrações'],
    [4, 5, 'divisões exatas'], [5, 5, 'contas mistas'], [2, 3, 'multiplicações, rodada curta'],
    [5, 10, 'contas mistas, maratona']
]
for (const [nivel, qtd, rotulo] of CONTAS) {
    add({
        grupo: 'sorte', sub: SUB_QUIZ,
        config: { motor: 'contas', nivel, qtd, titulo: `Contas de cabeça — ${rotulo}` },
        description: `Contas de cabeça: ${qtd} ${rotulo} no cronômetro`.slice(0, 55),
        usage: '[resultado | parar]',
        examples: ['12 — manda o resultado', 'parar — encerra a rodada'],
        comentario: `Nível ${nivel}, ${qtd} contas por rodada, com tempo total e média por conta.`
    })
}

// ─── Geração ────────────────────────────────────────────────────────────────
//
// Até 2026-09-18 cada item da TABELA virava um comando (.jogo1 … .jogo250).
// Eram cerca de 30 brincadeiras repetidas com a quantidade ou o tema fixos no
// nome. Agora cada brincadeira vira UM comando com nome de verdade, a variante
// entra como argumento e os .jogoN antigos seguem como atalhos, cada um com o
// ajuste exato de antes (src/services/jogoUnificadoService.js).

const ALVO_TABELA = 250
const PREFIXO_ARQUIVO = 'jogo-'

const NIVEIS_CONTAS = { 1: 'somas', 2: 'multiplicacoes', 3: 'subtracoes', 4: 'divisoes', 5: 'mistas' }
const ROTULO_CONTAS = { 1: 'somas', 2: 'multiplicações', 3: 'somas e subtrações', 4: 'divisões exatas', 5: 'contas mistas' }

/**
 * Como cada motor vira um jogo: nome do comando, textos e as palavras que
 * escolhem a variante. `chave(item)` separa motores que viram mais de um jogo
 * (a "palavra" tem três modos, cada um um jogo). Os nomes evitam colisão com
 * comandos antigos (.forca, .quiz, .anagrama, .charada, .voceprefere…).
 */
const SPEC = {
    quiz: { nome: 'quiztema', titulo: 'Quiz por tema', emoji: '❓', desc: 'Quiz de múltipla escolha: escolha tema e tamanho',
        intro: 'Escolha o tema. Cada rodada tem 5 perguntas; some "10" para a maratona.',
        palavras: c => c.qtd === 5 ? [c.tema] : [c.tema, String(c.qtd)], rotulo: c => `${D.QUIZZES[c.tema].nome}${c.qtd === 5 ? '' : `, ${c.qtd} perguntas`}` },
    forca: { nome: 'forca', titulo: 'Jogo da forca', emoji: '🪢', desc: 'Forca com palavras do tema que você escolher',
        intro: 'Seis vidas para acertar a palavra. Escolha o tema:', palavras: c => [c.tema], rotulo: c => D.FORCA[c.tema].nome },
    'palavra:dica': { nome: 'adivinhe', titulo: 'Adivinhe a palavra', emoji: '💬', desc: 'Adivinhe a palavra do tema pela dica',
        intro: 'Uma dica e quatro tentativas; a cada erro eu revelo uma letra.', palavras: c => [c.tema], rotulo: c => D.FORCA[c.tema].nome },
    'palavra:anagrama': { nome: 'anagrama', titulo: 'Anagrama', emoji: '🔀', desc: 'Anagrama do tema escolhido, com dica junto',
        intro: 'Letras embaralhadas com a dica do tema por cima.', palavras: c => [c.tema], rotulo: c => D.FORCA[c.tema].nome },
    'palavra:embaralhada': { nome: 'embaralhada', titulo: 'Palavra embaralhada', emoji: '🌀', desc: 'Palavra embaralhada sem dica: a versão difícil',
        intro: 'Só as letras fora de ordem, sem dica.', palavras: c => [c.tema], rotulo: c => D.FORCA[c.tema].nome },
    'sinonimo:sinonimo': { nome: 'cacasinonimos', titulo: 'Caça-sinônimos', emoji: '🟰', desc: 'Liste os sinônimos que eu aceito para a palavra',
        intro: '', palavras: () => [], rotulo: () => 'Caça-sinônimos' },
    'sinonimo:antonimo': { nome: 'cacaantonimos', titulo: 'Caça-antônimos', emoji: '↔️', desc: 'Liste os antônimos que eu aceito para a palavra',
        intro: '', palavras: () => [], rotulo: () => 'Caça-antônimos' },
    texto: { nome: 'enigmas', titulo: 'Charadas e enigmas', emoji: '🧩', desc: 'Charada, enigma, provérbio e outros desafios',
        intro: 'Escolha o tipo de desafio. Um número depois muda as tentativas.',
        palavras: (c, primeiro) => primeiro ? [c.modo] : [c.modo, String(c.tentativas)],
        rotulo: c => ({ charada: 'Charada', enigma: 'Enigma', oqueeoquee: 'O que é, o que é', frase: 'Complete a frase', proverbio: 'Complete o provérbio', soletrar: 'Soletrar', travalingua: 'Trava-língua' }[c.modo] || c.modo) },
    rima: { nome: 'batalharima', titulo: 'Batalha de rima', emoji: '🎤', desc: 'Batalha de rima com o tema escolhido',
        intro: 'Escolha o tema da batalha:', palavras: c => [c.tema], rotulo: c => c.tema },
    stop: { nome: 'adedonha', titulo: 'Stop da taverna', emoji: '🛑', desc: 'Stop com letra sorteada e 4 ou 6 categorias',
        intro: 'Escolha quantas categorias:', palavras: c => [String(c.qtd)], rotulo: c => `${c.qtd} categorias` },
    proibida: { nome: 'tabu', titulo: 'Palavra proibida', emoji: '🤐', desc: 'Descreva a palavra sem usar as proibidas',
        intro: '', palavras: () => [], rotulo: () => 'Palavra proibida' },
    caca: { nome: 'cacapalavras', titulo: 'Caça-palavras', emoji: '🔎', desc: 'Caça-palavras em grade, com o tema escolhido',
        intro: 'Escolha o tema da grade:', palavras: c => [c.tema], rotulo: c => `${c.titulo.replace(/^Caça-palavras de /, '')} (grade ${c.lado}x${c.lado})` },
    sorteio: { nome: 'roda', titulo: 'Brincadeiras de roda', emoji: '🎡', desc: 'Verdade, desafio, eu nunca e outras rodas',
        intro: 'Escolha a brincadeira. Um número depois sorteia vários de uma vez.',
        palavras: (c, primeiro) => primeiro ? [c.banco] : [c.banco, String(c.qtd)], rotulo: c => c.titulo },
    vocePrefere: { nome: 'dilemas', titulo: 'Você prefere', emoji: '🤔', desc: 'Dilemas "você prefere" para o grupo votar',
        intro: 'Escolha quantos dilemas de uma vez:', palavras: c => [String(c.qtd)], rotulo: c => `${c.qtd} dilema(s)` },
    mimica: { nome: 'mimica', titulo: 'Mímica', emoji: '🎭', desc: 'Mímica com o tema escolhido',
        intro: 'Escolha o tema:', palavras: c => [c.tema], rotulo: c => c.tema },
    eleicao: { nome: 'eleicao', titulo: 'Eleição do grupo', emoji: '🗳️', desc: 'Sorteia cargos para o grupo eleger',
        intro: 'Escolha quantos cargos:', palavras: c => [String(c.qtd)], rotulo: c => `${c.qtd} cargos` },
    ranking: { nome: 'rankingzoeira', titulo: 'Ranking da zoeira', emoji: '🏅', desc: 'Sorteia categorias para o grupo votar',
        intro: 'Escolha quantas categorias:', palavras: c => [String(c.qtd)], rotulo: c => `${c.qtd} categorias` },
    numero: { nome: 'adivinhenumero', titulo: 'Adivinhe o número', emoji: '🔢', desc: 'Adivinhe o número; eu digo se é maior ou menor',
        intro: 'Escolha até onde vai o número:', palavras: c => [String(c.max)], rotulo: c => `de 1 a ${c.max}` },
    velha: { nome: 'velhabot', titulo: 'Jogo da velha contra mim', emoji: '⭕', desc: 'Jogo da velha contra o bot, em três níveis',
        intro: 'Escolha a dificuldade:', palavras: c => [c.dificuldade], rotulo: c => ({ facil: 'moleza', medio: 'na medida', impossivel: 'impossível' }[c.dificuldade] || c.dificuldade) },
    jokenpo: { nome: 'jokenpobot', titulo: 'Pedra, papel e tesoura', emoji: '✊', desc: 'Pedra, papel e tesoura contra mim',
        intro: 'Escolha quantas vitórias fecham a partida:', palavras: c => [String(c.vitorias)], rotulo: c => c.titulo.replace(/^Pedra, papel e tesoura — /, '') },
    dados: { nome: 'rolardados', titulo: 'Rolar dados', emoji: '🎲', desc: 'Rola dados de 6, 12, 20 ou 100 faces',
        intro: 'Escolha o dado:', palavras: c => [`${c.qtd > 1 ? c.qtd : ''}d${c.faces}`], rotulo: c => c.titulo },
    roleta: { nome: 'roletaprendas', titulo: 'Roleta de prendas', emoji: '🎯', desc: 'Roleta de prendas para o grupo',
        intro: 'Escolha quantas prendas:', palavras: c => [String(c.qtd)], rotulo: c => `${c.qtd} prendas` },
    memoria: { nome: 'memoria', titulo: 'Sequência de memória', emoji: '🧠', desc: 'Repita a sequência que cresce a cada rodada',
        intro: 'Escolha os símbolos:', palavras: c => [/^[A-Z]$/.test(c.simbolos[0]) ? 'letras' : c.simbolos.length === 4 ? 'numeros' : `numeros${c.simbolos.length}`],
        rotulo: c => `${c.simbolos.join(' ')} (até o nível ${c.nivelMaximo})` },
    sudoku: { nome: 'sudokubolso', titulo: 'Sudoku de bolso', emoji: '🔢', desc: 'Sudoku 4x4 em três níveis',
        intro: 'Escolha a dificuldade:', palavras: c => [{ 4: 'facil', 6: 'medio', 8: 'dificil' }[c.buracos] || String(c.buracos)], rotulo: c => c.titulo.replace(/^Sudoku de bolso /, '') },
    restaum: { nome: 'restaum', titulo: 'Resta-um', emoji: '⚪', desc: 'Resta-um: pule as peças até sobrar uma',
        intro: 'Escolha onde começa o buraco:', palavras: c => [c.vazio === 1 ? 'topo' : 'meio'], rotulo: c => c.titulo },
    hanoi: { nome: 'hanoi', titulo: 'Torre de Hanói', emoji: '🗼', desc: 'Torre de Hanói com 3 a 6 discos',
        intro: 'Escolha quantos discos:', palavras: c => [String(c.discos)], rotulo: c => `${c.discos} discos` },
    labirinto: { nome: 'labirintobolso', titulo: 'Labirinto de bolso', emoji: '🧭', desc: 'Ache a saída do labirinto',
        intro: 'Escolha o tamanho:', palavras: c => [String(c.celulas)], rotulo: c => c.titulo },
    logica: { nome: 'logica', titulo: 'Quebra-cabeça lógico', emoji: '🧩', desc: 'Quebra-cabeça de lógica com tentativas contadas',
        intro: 'Escolha quantas tentativas:', palavras: c => [String(c.tentativas)], rotulo: c => `${c.tentativas} tentativas` },
    sequencia: { nome: 'sequencialogica', titulo: 'Sequência lógica', emoji: '🔗', desc: 'Descubra o próximo termo da sequência',
        intro: 'Escolha quantas tentativas:', palavras: c => [String(c.tentativas)], rotulo: c => `${c.tentativas} tentativas` },
    reflexo: { nome: 'reflexo', titulo: 'Teste de reflexo', emoji: '⚡', desc: 'Mede o seu tempo de resposta',
        intro: '', palavras: () => [], rotulo: () => 'Teste de reflexo' },
    contas: { nome: 'contas', titulo: 'Contas de cabeça', emoji: '➗', desc: 'Contas de cabeça no cronômetro, em 5 níveis',
        intro: 'Escolha o tipo de conta. Um número depois muda quantas.',
        palavras: (c, primeiro) => primeiro ? [NIVEIS_CONTAS[c.nivel]] : [NIVEIS_CONTAS[c.nivel], String(c.qtd)],
        rotulo: c => `${ROTULO_CONTAS[c.nivel]}${c.qtd === 5 ? '' : `, ${c.qtd} contas`}` }
}

/**
 * Jogos antigos que eram duplicata de uma brincadeira daqui (aprovado pelo dono
 * em 2026-09-18). O conteúdo deles virou variante e os nomes viraram atalhos:
 *  - .forca (palavras de Saga) → tema "saga" do .forca;
 *  - .voceprefere (tema dev) e .dilema (morais) → temas do .dilemas.
 */
const EXTRAS = [
    { spec: 'forca', palavras: ['saga'], rotulo: 'Saga e cia',
        config: { motor: 'forca', tema: 'saga', emoji: '⚔️', titulo: 'Forca de Saga e cia' },
        atalhos: ['hangman', 'jogodaforca'] },
    { spec: 'vocePrefere', palavras: ['programacao'], rotulo: 'Programação',
        config: { motor: 'vocePrefere', titulo: 'Você prefere — programação', qtd: 1, banco: 'programacao' },
        atalhos: ['voceprefere', 'prefere', 'vcprefere', 'wouldyourather', 'ououdilema'] },
    { spec: 'vocePrefere', palavras: ['moral'], rotulo: 'Dilemas morais',
        config: { motor: 'vocePrefere', titulo: 'Dilema do grupo', qtd: 1, banco: 'moral' },
        atalhos: ['dilema', 'dilemamoral', 'oquefazer', 'dilemaetico'] }
]

/** O .memoria (tabuleiro de enfeite) e o .anagrama antigos deram o nome a estes; os atalhos deles abrem a variante padrão. */
const ATALHOS_EXTRAS = {
    memoria: ['jogomemoria', 'memory', 'cartas-memoria'],
    'palavra:anagrama': ['desembaralhar']
}

function chaveDoSpec(config) {
    return SPEC[`${config.motor}:${config.modo}`] ? `${config.motor}:${config.modo}` : config.motor
}

/** Configuração sem os campos só de vitrine, para achar variantes iguais. */
function assinatura(config) {
    const { titulo, emoji, intro, rotulo, ...resto } = config
    return JSON.stringify(resto)
}

/** Agrupa a TABELA em jogos, deduplicando variantes de configuração idêntica. */
function montarJogos() {
    const P = require('../src/services/partyGamesService')
    const jogos = new Map()
    TABELA.forEach((item, i) => {
        const chave = chaveDoSpec(item.config)
        const spec = SPEC[chave]
        if (!spec) throw new Error(`motor sem SPEC: ${chave}`)
        if (!jogos.has(chave)) {
            jogos.set(chave, {
                spec, sub: item.sub, motor: item.config.motor,
                comEstado: P.MOTORES[item.config.motor].toString().includes('abrirPartida'),
                variantes: [], porAssinatura: new Map(), primeiroDaChave: new Set(), atalhos: {}
            })
        }
        const j = jogos.get(chave)
        const ass = assinatura(item.config)
        let idx = j.porAssinatura.get(ass)
        if (idx === undefined) {
            // Primeira variante de cada palavra principal fica com a palavra sozinha.
            const provisoria = spec.palavras(item.config, true)
            const primeiro = !j.primeiroDaChave.has(provisoria.join(' '))
            const palavras = spec.palavras(item.config, primeiro).map(w => P.norm(w).toLowerCase())
            if (primeiro) j.primeiroDaChave.add(provisoria.join(' '))
            idx = j.variantes.length
            j.variantes.push({ palavras, rotulo: spec.rotulo(item.config), config: item.config })
            j.porAssinatura.set(ass, idx)
        }
        j.atalhos[`jogo${i + 1}`] = idx
    })
    // Variantes que vieram de comandos antigos unificados em 2026-09-18. Ficam
    // fora da TABELA para não deslocar a numeração dos atalhos .jogoN.
    for (const extra of EXTRAS) {
        const j = jogos.get(extra.spec)
        if (!j) throw new Error(`EXTRAS: jogo ${extra.spec} não existe`)
        const idx = j.variantes.length
        j.variantes.push({ palavras: extra.palavras, rotulo: extra.rotulo, config: extra.config })
        for (const a of extra.atalhos) j.atalhos[a] = idx
    }
    // Atalhos de comandos antigos que agora abrem a variante padrão.
    for (const [chave, atalhos] of Object.entries(ATALHOS_EXTRAS)) {
        const j = jogos.get(chave)
        if (!j) throw new Error(`ATALHOS_EXTRAS: jogo ${chave} não existe`)
        for (const a of atalhos) j.atalhos[a] = 0
    }
    return [...jogos.values()]
}

function arquivoDe(j) {
    const s = j.spec
    const dados = {
        nome: s.nome, titulo: s.titulo, emoji: s.emoji, intro: s.intro, comEstado: j.comEstado,
        variantes: j.variantes, atalhos: j.atalhos
    }
    const atalhos = Object.keys(j.atalhos).sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }))
    const exemplo = j.variantes.find(v => v.palavras.length)
    const exemplos = exemplo
        ? [`${exemplo.palavras.join(' ')} — começa: ${exemplo.rotulo}`, ' — mostra as opções']
        : [' — começa uma rodada']
    return `/**
 * .${s.nome} — ${s.desc}
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta ${atalhos.length} comandos antigos
 * (${atalhos.slice(0, 4).map(a => '.' + a).join(', ')}${atalhos.length > 4 ? '…' : ''}), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo \`node scripts/gen-jogos.js\` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = ${JSON.stringify(dados, null, 4)}

module.exports = {
    name: ${JSON.stringify(s.nome)},
    aliases: ${JSON.stringify(atalhos)},
    category: 'fun',
    subcategory: ${JSON.stringify(j.sub)},
    description: ${JSON.stringify(s.desc)},
    usage: ${JSON.stringify(j.variantes.length > 1 ? '[opção] [jogada | parar]' : '[jogada | parar]')},
    examples: ${JSON.stringify(exemplos)},
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
`
}

function validar(jogos) {
    const problemas = []
    if (TABELA.length !== ALVO_TABELA) problemas.push(`tabela tem ${TABELA.length} itens, esperado ${ALVO_TABELA}`)
    const nomes = new Set()
    for (const j of jogos) {
        const s = j.spec
        if (nomes.has(s.nome)) problemas.push(`nome repetido: ${s.nome}`)
        nomes.add(s.nome)
        if (s.desc.length > 55) problemas.push(`${s.nome}: description com ${s.desc.length} caracteres`)
        const vistas = new Set()
        for (const v of j.variantes) {
            const k = v.palavras.join(' ')
            if (j.variantes.length > 1 && !k) problemas.push(`${s.nome}: variante sem palavra que a escolha (${v.rotulo})`)
            if (vistas.has(k)) problemas.push(`${s.nome}: duas variantes com as mesmas palavras "${k}"`)
            vistas.add(k)
        }
    }
    const cobertos = jogos.reduce((n, j) => n + Object.keys(j.atalhos).filter(a => /^jogo\d+$/.test(a)).length, 0)
    if (cobertos !== TABELA.length) problemas.push(`atalhos cobrem ${cobertos} de ${TABELA.length} itens`)
    return problemas
}

function main() {
    const jogos = montarJogos()
    const problemas = validar(jogos)
    console.log(`📋 Tabela: ${TABELA.length} itens → ${jogos.length} jogos, ${jogos.reduce((n, j) => n + j.variantes.length, 0)} variantes`)
    for (const j of jogos) console.log(`   .${j.spec.nome.padEnd(16)} ${String(j.variantes.length).padStart(2)} variante(s), ${Object.keys(j.atalhos).length} atalho(s)${j.comEstado ? '' : ' · sem estado'}`)

    if (problemas.length) {
        console.log('\n❌ Problemas:')
        problemas.slice(0, 20).forEach(p => console.log(`   • ${p}`))
        process.exit(1)
    }
    if (DRY) { console.log('\n✅ Tabela válida (modo --dry, nada gravado).'); return }

    // Nome e atalhos únicos no projeto inteiro, fora os arquivos desta família.
    const dispatcher = require('../src/handlers/commandDispatcher')
    dispatcher.loadCommands()
    const registro = dispatcher.getCommands()
    const nossos = new Set(fs.readdirSync(DESTINO).filter(f => /^jogo(\d+|-[a-z]+)\.js$/.test(f)).map(f => path.join(DESTINO, f)))
    // Nome OU atalho de outro comando conta como ocupado: em 2026-09-18 o .stop,
    // o .palavraproibida e outros viraram jogo e "roubaram" o atalho de comandos
    // existentes (o nome ganha do atalho), porque só os nomes eram conferidos.
    const ocupado = new Map()
    for (const cmd of new Set(registro.values())) {
        if (!cmd || nossos.has(path.join(DESTINO, `${PREFIXO_ARQUIVO}${cmd.name}.js`))) continue
        for (const n of [cmd.name, ...(cmd.aliases || [])]) if (!ocupado.has(n)) ocupado.set(n, cmd.name)
    }
    const colisoes = []
    for (const j of jogos) {
        for (const n of [j.spec.nome, ...Object.keys(j.atalhos)]) {
            const dono = ocupado.get(n)
            if (dono && !/^jogo\d+$/.test(dono) && !/^jogo\d+$/.test(n)) colisoes.push(`${n} (já é de .${dono})`)
        }
    }
    if (colisoes.length) {
        console.log(`\n❌ Nomes já usados por outro comando: ${colisoes.join(', ')}`)
        process.exit(1)
    }

    // Some com os arquivos da geração anterior (.jogoN e jogo-*.js) antes de gravar.
    for (const f of nossos) fs.unlinkSync(f)
    fs.mkdirSync(path.dirname(MANIFESTO), { recursive: true })

    const gerados = []
    for (const j of jogos) {
        const arquivo = path.join(DESTINO, `${PREFIXO_ARQUIVO}${j.spec.nome}.js`)
        fs.writeFileSync(arquivo, arquivoDe(j))
        gerados.push({
            nome: j.spec.nome, arquivo: path.relative(RAIZ, arquivo).split(path.sep).join('/'),
            motor: j.motor, subcategory: j.sub, description: j.spec.desc,
            variantes: j.variantes.length, atalhos: Object.keys(j.atalhos)
        })
    }

    fs.writeFileSync(MANIFESTO, JSON.stringify({
        familia: 'jogos de grupo', prefixoArquivo: PREFIXO_ARQUIVO, total: gerados.length,
        itensNaTabela: TABELA.length, geradoPor: 'scripts/gen-jogos.js', comandos: gerados
    }, null, 2) + '\n')

    console.log(`\n✅ ${gerados.length} jogos gravados em src/commands/fun/ (${PREFIXO_ARQUIVO}*.js)`)
    console.log(`📄 Manifesto: ${path.relative(RAIZ, MANIFESTO)}`)
}

main()
