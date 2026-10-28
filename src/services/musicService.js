/**
 * Música: instrumentos, gêneros brasileiros, teoria e as ferramentas de quem toca.
 *
 * A parte que precisa estar certa é a teoria: transposição, campo harmônico e
 * círculo das quintas são regras fechadas, e um erro ali estraga um ensaio
 * inteiro. Tudo isso vive aqui e é testado com casos conhecidos.
 *
 * A escolha de sustenido ou bemol na saída segue a armadura do tom, não o gosto:
 * em Fá se escreve Sib, nunca Lá#.
 */

// Índice cromático. A grafia de saída é escolhida depois, pelo tom.
const CROMATICA_SUSTENIDO = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const CROMATICA_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

/** Tons cuja armadura usa bemol. Fora daqui, sustenido. */
const TONS_COM_BEMOL = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'])

const NOTAS_PT = { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' }

/** Converte nome de nota em índice cromático (0-11). */
function indiceDaNota(nota) {
    const n = String(nota || '').trim()
    const m = n.match(/^([A-Ga-g])([#b]*)/)
    if (!m) return null
    const base = CROMATICA_SUSTENIDO.indexOf(m[1].toUpperCase())
    if (base < 0) return null
    let i = base
    for (const acidente of m[2]) i += acidente === '#' ? 1 : -1
    return ((i % 12) + 12) % 12
}

/** Escreve o índice como nota, na grafia adequada ao tom. */
function notaDoIndice(indice, usarBemol = false) {
    const i = ((indice % 12) + 12) % 12
    return (usarBemol ? CROMATICA_BEMOL : CROMATICA_SUSTENIDO)[i]
}

/**
 * Transpõe uma cifra inteira, preservando sufixo (m, 7, maj7, sus4…) e baixo
 * invertido (C/E vira D/F# ao subir um tom).
 */
function transpor(cifra, semitons, tomDestino = null) {
    const passo = Number(semitons)
    if (!Number.isFinite(passo)) return null

    // Sem tom de destino informado, deduz do primeiro acorde — que numa cifra é
    // quase sempre a tônica. Sem isso, descer G D Em C um tom devolvia
    // "F C Dm A#": tecnicamente a nota certa, escrita de um jeito que ninguém
    // usa em Fá. A grafia segue a armadura, não o índice cromático.
    let destino = tomDestino
    if (!destino) {
        const primeiro = String(cifra).trim().split(/\s+/)[0] || ''
        const m = primeiro.match(/^([A-Ga-g][#b]*)(m(?![a-z]))?/)
        if (m) {
            const i = indiceDaNota(m[1])
            if (i !== null) {
                // Testa as duas grafias do destino e fica com a que for tom de bemol.
                const comSustenido = notaDoIndice(i + passo, false) + (m[2] ? 'm' : '')
                const comBemol = notaDoIndice(i + passo, true) + (m[2] ? 'm' : '')
                destino = TONS_COM_BEMOL.has(comBemol) ? comBemol : comSustenido
            }
        }
    }
    const usarBemol = destino ? TONS_COM_BEMOL.has(destino) : false

    const mover = (acorde) => {
        const m = String(acorde).match(/^([A-Ga-g][#b]*)(.*)$/)
        if (!m) return acorde
        const i = indiceDaNota(m[1])
        if (i === null) return acorde
        const raiz = notaDoIndice(i + passo, usarBemol)
        // O baixo depois da barra também sobe.
        const resto = m[2].replace(/\/([A-Ga-g][#b]*)/, (_, baixo) => {
            const ib = indiceDaNota(baixo)
            return ib === null ? '/' + baixo : '/' + notaDoIndice(ib + passo, usarBemol)
        })
        return raiz + resto
    }

    const acordes = String(cifra).trim().split(/\s+/).filter(Boolean)
    return {
        original: acordes,
        transposta: acordes.map(mover),
        semitons: passo,
        usouBemol: usarBemol,
        tomDestino: destino || null
    }
}

/** Campo harmônico maior de um tom. */
function campoHarmonico(tonica) {
    const i = indiceDaNota(tonica)
    if (i === null) return null
    const tom = String(tonica).trim().toUpperCase().replace(/^(.)(.*)$/, (_, a, b) => a + b.toLowerCase())
    const usarBemol = TONS_COM_BEMOL.has(tom)
    const INTERVALOS = [0, 2, 4, 5, 7, 9, 11]
    const QUALIDADES = ['', 'm', 'm', '', '', 'm', 'm(b5)']
    const GRAUS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    const FUNCOES = ['Tônica', 'Subdominante', 'Tônica', 'Subdominante', 'Dominante', 'Tônica', 'Dominante']
    return {
        tonica: notaDoIndice(i, usarBemol),
        graus: INTERVALOS.map((iv, k) => ({
            grau: GRAUS[k],
            acorde: notaDoIndice(i + iv, usarBemol) + QUALIDADES[k],
            funcao: FUNCOES[k]
        })),
        usouBemol: usarBemol
    }
}

/** Círculo das quintas a partir de um tom. */
function circuloQuintas(tonica) {
    const i = indiceDaNota(tonica)
    if (i === null) return null
    const horario = [], antihorario = []
    for (let k = 1; k <= 4; k++) {
        horario.push(notaDoIndice(i + 7 * k, false))
        antihorario.push(notaDoIndice(i - 7 * k, true))
    }
    return { tonica: notaDoIndice(i, TONS_COM_BEMOL.has(String(tonica).toUpperCase())), horario, antihorario }
}

const INSTRUMENTOS = {
    violao: { nome: 'Violão', familia: 'Cordas dedilhadas', afinacao: 'E A D G B E (Mi Lá Ré Sol Si Mi)', dificuldade: 'acessível',
        comofunciona: 'A corda vibra e o corpo oco amplifica. Pressionar num traste encurta a corda e sobe a nota.',
        primeiros: 'Em, C, G e D abrem centenas de músicas. A pestana costuma ser a primeira barreira real.',
        curiosidade: 'Nylon é para violão clássico; aço, para folk. Trocar um pelo outro pode entortar o braço do instrumento.' },
    guitarra: { nome: 'Guitarra elétrica', familia: 'Cordas dedilhadas', afinacao: 'E A D G B E', dificuldade: 'acessível',
        comofunciona: 'Captadores transformam a vibração da corda em sinal elétrico, amplificado depois.',
        primeiros: 'Power chords de duas notas já tocam quase todo o rock.',
        curiosidade: 'A distorção nasceu de defeito: amplificadores forçados além do limite, som que os músicos passaram a procurar de propósito.' },
    baixo: { nome: 'Baixo elétrico', familia: 'Cordas dedilhadas', afinacao: 'E A D G', dificuldade: 'acessível',
        comofunciona: 'Mesmo princípio da guitarra, uma oitava abaixo e com cordas mais grossas.',
        primeiros: 'Tocar a tônica de cada acorde no tempo já sustenta a banda inteira.',
        curiosidade: 'Numa mistura, o baixo é mais sentido do que ouvido — some ele e a música desaba, mesmo sem ninguém saber apontar o que faltou.' },
    piano: { nome: 'Piano', familia: 'Teclas / percussão de cordas', afinacao: 'temperamento igual, 88 teclas', dificuldade: 'média',
        comofunciona: 'A tecla aciona um martelo que percute a corda. Tecnicamente é um instrumento de percussão.',
        primeiros: 'A visão do teclado torna a teoria musical concreta: intervalos viram distância física.',
        curiosidade: 'O nome completo é pianoforte, porque era o primeiro teclado que tocava fraco e forte conforme a força do dedo.' },
    cavaquinho: { nome: 'Cavaquinho', familia: 'Cordas dedilhadas', afinacao: 'D G B D (Ré Sol Si Ré)', dificuldade: 'acessível',
        comofunciona: 'Quatro cordas de aço num corpo pequeno, som agudo e marcado.',
        primeiros: 'O ritmo do samba vem mais da mão direita que dos acordes.',
        curiosidade: 'É o instrumento que dá a levada do samba e do choro; o pandeiro marca o tempo, mas o cavaco marca o balanço.' },
    pandeiro: { nome: 'Pandeiro', familia: 'Percussão', afinacao: 'pele tensionada', dificuldade: 'difícil',
        comofunciona: 'Uma mão segura e gira; a outra alterna polegar, dedos, palma e ponta em sequência.',
        primeiros: 'Parece simples e é dos mais difíceis: exige independência total entre as mãos.',
        curiosidade: 'O pandeiro brasileiro tem afinação regulável, o que o separa do tamborim e do pandeiro europeu.' },
    bateria: { nome: 'Bateria', familia: 'Percussão', afinacao: 'peles afinadas por relação', dificuldade: 'média',
        comofunciona: 'Conjunto de tambores e pratos tocados pelos quatro membros ao mesmo tempo.',
        primeiros: 'Bumbo no 1 e 3, caixa no 2 e 4, chimbal em colcheias: essa é a base de metade da música popular.',
        curiosidade: 'Só existe porque um baterista precisou tocar sozinho o que antes era feito por vários percussionistas.' },
    flauta: { nome: 'Flauta transversal', familia: 'Sopro de madeira', afinacao: 'Dó, temperamento igual', dificuldade: 'média',
        comofunciona: 'O ar dividido na borda do bocal cria a vibração; as chaves mudam o comprimento do tubo.',
        primeiros: 'Produzir o primeiro som limpo leva dias. Depois disso, a curva fica rápida.',
        curiosidade: 'É classificada como madeira mesmo sendo de metal: a família se define pelo modo de produzir o som.' },
    saxofone: { nome: 'Saxofone', familia: 'Sopro de madeira', afinacao: 'Sib ou Mib, conforme o tipo', dificuldade: 'média',
        comofunciona: 'Uma palheta de madeira vibra contra a boquilha e faz a coluna de ar oscilar.',
        primeiros: 'A embocadura define tudo: nota estável vem do controle do lábio, não do sopro forte.',
        curiosidade: 'Foi inventado por Adolphe Sax em 1840 para unir a potência do metal à agilidade da madeira.' },
    trompete: { nome: 'Trompete', familia: 'Metais', afinacao: 'Sib', dificuldade: 'difícil',
        comofunciona: 'O som vem da vibração dos lábios; os pistões apenas mudam o comprimento do tubo.',
        primeiros: 'As primeiras semanas são de resistência labial, não de música.',
        curiosidade: 'Tem só três pistões e cobre todas as notas cromáticas — o resto é feito pela série harmônica dos lábios.' },
    violino: { nome: 'Violino', familia: 'Cordas friccionadas', afinacao: 'G D A E (Sol Ré Lá Mi)', dificuldade: 'difícil',
        comofunciona: 'O arco com breu atrita a corda e a mantém vibrando continuamente.',
        primeiros: 'Não tem trastes: a afinação de cada nota depende do ouvido e da memória do dedo.',
        curiosidade: 'O breu é resina de pinheiro. Sem ele o arco desliza e não produz som nenhum.' },
    ukulele: { nome: 'Ukulele', familia: 'Cordas dedilhadas', afinacao: 'G C E A', dificuldade: 'muito acessível',
        comofunciona: 'Quatro cordas de nylon num corpo pequeno.',
        primeiros: 'É o instrumento de harmonia mais rápido de começar: quatro acordes na primeira semana.',
        curiosidade: 'A afinação padrão é reentrante: a primeira corda é mais aguda que a segunda, o que dá o timbre característico.' },
    berimbau: { nome: 'Berimbau', familia: 'Corda percutida', afinacao: 'duas alturas mais o som abafado', dificuldade: 'média',
        comofunciona: 'Um arco com arame e cabaça; a vareta percute e a moeda muda a tensão.',
        primeiros: 'Manter a cabaça no lugar e o toque estável é o desafio inicial.',
        curiosidade: 'É o berimbau que comanda a roda de capoeira: o toque define se o jogo é lento, rápido ou de conflito.' },
    acordeon: { nome: 'Acordeon / sanfona', familia: 'Palhetas livres', afinacao: 'temperamento igual', dificuldade: 'média',
        comofunciona: 'O fole empurra ar por palhetas metálicas; teclado de um lado, baixos do outro.',
        primeiros: 'A mão esquerda toca sem ver os botões, guiada só pelo tato.',
        curiosidade: 'É o instrumento central do forró, do sertanejo raiz e do gaúcho — três músicas muito diferentes com o mesmo fole.' },
    atabaque: { nome: 'Atabaque', familia: 'Percussão', afinacao: 'pele natural tensionada', dificuldade: 'média',
        comofunciona: 'Tambor cônico tocado com as mãos, com sons grave, médio e agudo conforme a região da pele.',
        primeiros: 'A diferença entre grave e agudo está em qual parte da mão toca e onde.',
        curiosidade: 'Central em religiões de matriz africana e na capoeira, com nomes e toques específicos para cada função.' },
    voz: { nome: 'Voz', familia: 'O instrumento de todo mundo', afinacao: 'depende do cantor', dificuldade: 'variável',
        comofunciona: 'O ar dos pulmões faz as pregas vocais vibrarem; boca e garganta moldam o timbre.',
        primeiros: 'Respiração diafragmática e aquecimento. Cantar forçando a garganta machuca de verdade.',
        curiosidade: 'A extensão vocal se amplia com treino, mas o timbre é anatômico — é por isso que ninguém soa igual a outra pessoa.' }
}

const GENEROS = {
    samba: { nome: 'Samba', origem: 'Rio de Janeiro, início do século XX', compasso: '2/4', bpm: '70 a 100',
        marca: 'Síncope, ou seja, acento fora do tempo forte. É o que faz o corpo se mexer antes de a cabeça entender.',
        instrumentos: 'Cavaquinho, pandeiro, surdo, tantã, violão de sete cordas',
        nomes: 'Pixinguinha, Cartola, Noel Rosa, Clementina de Jesus, Paulinho da Viola' },
    bossanova: { nome: 'Bossa nova', origem: 'Rio de Janeiro, anos 1950', compasso: '2/4', bpm: '60 a 90',
        marca: 'Samba com harmonia de jazz e voz quase falada. A batida do violão de João Gilberto é a assinatura.',
        instrumentos: 'Violão, piano, bateria com vassourinhas, sax',
        nomes: 'João Gilberto, Tom Jobim, Vinicius de Moraes, Elis Regina, Nara Leão' },
    choro: { nome: 'Choro', origem: 'Rio de Janeiro, 1870', compasso: '2/4', bpm: '100 a 160',
        marca: 'Primeiro gênero urbano brasileiro. Virtuose, com solista improvisando sobre base rítmica firme.',
        instrumentos: 'Flauta, cavaquinho, violão de sete cordas, pandeiro, bandolim',
        nomes: 'Pixinguinha, Jacob do Bandolim, Waldir Azevedo, Altamiro Carrilho' },
    forro: { nome: 'Forró', origem: 'Nordeste, primeira metade do século XX', compasso: '2/4', bpm: '110 a 150',
        marca: 'Trio de sanfona, zabumba e triângulo. O baião é a matriz rítmica.',
        instrumentos: 'Acordeon, zabumba, triângulo',
        nomes: 'Luiz Gonzaga, Jackson do Pandeiro, Dominguinhos, Elba Ramalho' },
    mpb: { nome: 'MPB', origem: 'Brasil, anos 1960', compasso: 'variável', bpm: 'variável',
        marca: 'Menos um ritmo que um guarda-chuva: canção brasileira com letra elaborada e liberdade harmônica.',
        instrumentos: 'Violão, piano, banda completa',
        nomes: 'Chico Buarque, Caetano Veloso, Gal Costa, Milton Nascimento, Gilberto Gil' },
    tropicalia: { nome: 'Tropicália', origem: 'Brasil, 1967-68', compasso: 'variável', bpm: 'variável',
        marca: 'Mistura deliberada de música brasileira com rock, pop e vanguarda. Movimento tanto estético quanto político.',
        instrumentos: 'Guitarra elétrica, orquestra, percussão brasileira',
        nomes: 'Caetano Veloso, Gilberto Gil, Os Mutantes, Tom Zé, Gal Costa' },
    maracatu: { nome: 'Maracatu', origem: 'Pernambuco, século XVIII', compasso: '2/4', bpm: '100 a 120',
        marca: 'Percussão pesada em cortejo, ligada à coroação de reis do Congo. Nação e rural são vertentes distintas.',
        instrumentos: 'Alfaia, caixa, gonguê, agbê',
        nomes: 'Nação Estrela Brilhante, Chico Science, Nação Zumbi' },
    frevo: { nome: 'Frevo', origem: 'Recife, início do século XX', compasso: '2/4', bpm: '120 a 160',
        marca: 'Marcha acelerada com metais em contraponto. O passo, dança com sombrinha, nasceu junto.',
        instrumentos: 'Metais, saxofones, percussão',
        nomes: 'Capiba, Nelson Ferreira, Spok Frevo Orquestra' },
    axe: { nome: 'Axé', origem: 'Bahia, anos 1980', compasso: '4/4', bpm: '120 a 140',
        marca: 'Fusão de frevo, ijexá, reggae e pop feita para o carnaval de rua e o trio elétrico.',
        instrumentos: 'Guitarra baiana, percussão, metais',
        nomes: 'Ivete Sangalo, Daniela Mercury, Timbalada, Olodum' },
    sertanejo: { nome: 'Sertanejo', origem: 'Interior de São Paulo, Minas e Goiás', compasso: '2/4 e 4/4', bpm: '80 a 140',
        marca: 'Da moda de viola em duplas de terça paralela ao universitário com pegada pop.',
        instrumentos: 'Viola caipira, violão, acordeon, banda pop',
        nomes: 'Tonico e Tinoco, Chitãozinho e Xororó, Almir Sater, Marília Mendonça' },
    funkcarioca: { nome: 'Funk carioca', origem: 'Rio de Janeiro, anos 1980', compasso: '4/4', bpm: '125 a 150',
        marca: 'Construído sobre a batida Volt Mix, do Miami bass, com letra em português e produção local.',
        instrumentos: 'Bateria eletrônica, sampler, voz',
        nomes: 'DJ Marlboro, MC Bin Laden, Anitta, Ludmilla' },
    pagode: { nome: 'Pagode', origem: 'Rio de Janeiro, anos 1980', compasso: '2/4', bpm: '80 a 100',
        marca: 'Samba de roda levado para o disco, com tantã e banjo substituindo instrumentos tradicionais.',
        instrumentos: 'Tantã, banjo, repique de mão, cavaquinho',
        nomes: 'Fundo de Quintal, Zeca Pagodinho, Jorge Aragão, Beth Carvalho' },
    rockbr: { nome: 'Rock brasileiro', origem: 'Brasil, anos 1980', compasso: '4/4', bpm: '100 a 160',
        marca: 'Rock com letra em português, muito ligado ao contexto político da redemocratização.',
        instrumentos: 'Guitarra, baixo, bateria, teclado',
        nomes: 'Legião Urbana, Titãs, Paralamas, Cássia Eller, Raul Seixas' },
    reggae: { nome: 'Reggae', origem: 'Jamaica, anos 1960', compasso: '4/4', bpm: '60 a 90',
        marca: 'O acento cai no contratempo — o famoso "skank" da guitarra nos tempos 2 e 4.',
        instrumentos: 'Guitarra, baixo, bateria one drop, órgão',
        nomes: 'Bob Marley, Toots, Cidade Negra, Natiruts' },
    jazz: { nome: 'Jazz', origem: 'Nova Orleans, início do século XX', compasso: '4/4', bpm: 'variável',
        marca: 'Improvisação sobre harmonia complexa, com swing na subdivisão do tempo.',
        instrumentos: 'Sax, trompete, piano, contrabaixo, bateria',
        nomes: 'Louis Armstrong, Miles Davis, John Coltrane, Ella Fitzgerald' },
    blues: { nome: 'Blues', origem: 'Sul dos Estados Unidos, século XIX', compasso: '4/4', bpm: '60 a 120',
        marca: 'Forma de 12 compassos e a escala com as blue notes — a base de onde saiu quase toda a música popular do século XX.',
        instrumentos: 'Guitarra, gaita, voz, piano',
        nomes: 'Robert Johnson, B.B. King, Muddy Waters' },
    classica: { nome: 'Música erudita', origem: 'Europa, séculos de tradição', compasso: 'variável', bpm: 'variável',
        marca: 'Notação escrita detalhada, formas longas e desenvolvimento temático.',
        instrumentos: 'Orquestra sinfônica, coro, instrumentos solistas',
        nomes: 'Bach, Beethoven, Villa-Lobos, Chiquinha Gonzaga' },
    eletronica: { nome: 'Música eletrônica', origem: 'Europa e EUA, anos 1970-80', compasso: '4/4', bpm: '120 a 150',
        marca: 'Som gerado ou manipulado por máquina, com estrutura pensada para a pista.',
        instrumentos: 'Sintetizador, bateria eletrônica, sampler',
        nomes: 'Kraftwerk, Daft Punk, Alok' }
}

const TEORIA = {
    nota: { nome: 'Nota', oquee: 'Um som de altura definida. São sete nomes que se repetem em oitavas: dó, ré, mi, fá, sol, lá, si.',
        detalhe: 'Entre elas cabem os semitons: dó# / réb, ré# / mib e assim por diante. O total é 12 sons por oitava.',
        exemplo: 'A mesma nota uma oitava acima tem o dobro da frequência: lá 440 Hz e lá 880 Hz.' },
    intervalo: { nome: 'Intervalo', oquee: 'A distância entre duas notas, medida em graus e qualidade.',
        detalhe: 'Terça maior tem 4 semitons; terça menor, 3. Essa diferença de um semitom é o que separa alegre de triste na harmonia ocidental.',
        exemplo: 'Dó a mi é terça maior. Dó a mib é terça menor.' },
    escala: { nome: 'Escala', oquee: 'Sequência ordenada de notas dentro de uma oitava.',
        detalhe: 'A maior segue tom-tom-semitom-tom-tom-tom-semitom. Mudar essa fórmula muda o caráter inteiro.',
        exemplo: 'Dó maior não tem acidente nenhum: é só tocar as teclas brancas do dó ao dó.' },
    acorde: { nome: 'Acorde', oquee: 'Três ou mais notas soando juntas.',
        detalhe: 'A tríade maior é tônica, terça maior e quinta justa. Baixar a terça em um semitom faz o acorde menor.',
        exemplo: 'Dó maior é dó-mi-sol. Dó menor é dó-mib-sol.' },
    tom: { nome: 'Tonalidade', oquee: 'O centro gravitacional de uma música: a nota para onde tudo parece querer voltar.',
        detalhe: 'A armadura de clave indica o tom pelos sustenidos ou bemóis fixos.',
        exemplo: 'Uma música em sol maior tem fá# na armadura e termina, quase sempre, em sol.' },
    campoharmonico: { nome: 'Campo harmônico', oquee: 'Os sete acordes formados sobre os graus de uma escala.',
        detalhe: 'No modo maior a sequência é: maior, menor, menor, maior, maior, menor, meio-diminuto.',
        exemplo: 'Em dó: C, Dm, Em, F, G, Am, Bm(b5). É por isso que essas combinações soam naturais juntas.' },
    cadencia: { nome: 'Cadência', oquee: 'A forma como uma frase musical se encerra.',
        detalhe: 'A cadência perfeita (V–I) soa conclusiva; a suspensiva (termina no V) deixa a frase no ar de propósito.',
        exemplo: 'G7 indo para C é a resolução mais usada da música ocidental.' },
    compasso: { nome: 'Compasso', oquee: 'A divisão do tempo em grupos regulares.',
        detalhe: 'O número de cima diz quantos tempos há; o de baixo, qual figura vale um tempo.',
        exemplo: '4/4 é a valsa do pop; 3/4 é a valsa mesmo; 2/4 é a marcha e a base do samba.' },
    andamento: { nome: 'Andamento (BPM)', oquee: 'A velocidade da música, em batidas por minuto.',
        detalhe: 'Adagio fica perto de 70, allegro perto de 130. No popular se fala direto em BPM.',
        exemplo: 'Bossa nova costuma ficar entre 60 e 90 BPM; forró, entre 110 e 150.' },
    cifra: { nome: 'Cifra', oquee: 'Notação por letras que indica o acorde sem escrever cada nota.',
        detalhe: 'A = lá, B = si, C = dó, D = ré, E = mi, F = fá, G = sol. O "m" minúsculo indica menor.',
        exemplo: 'Am7 é lá menor com sétima. C/E é dó maior com mi no baixo.' },
    tablatura: { nome: 'Tablatura', oquee: 'Notação que mostra onde pôr o dedo, não qual nota sai.',
        detalhe: 'Seis linhas para as seis cordas; o número é a casa. Não indica duração, então depende de já conhecer a música.',
        exemplo: 'Um 3 na sexta linha significa terceira casa da corda mais grave: um sol.' },
    dinamica: { nome: 'Dinâmica', oquee: 'A variação de intensidade ao longo da música.',
        detalhe: 'De pianissimo a fortissimo. É o que separa uma execução mecânica de uma interpretação.',
        exemplo: 'Um crescendo bem construído emociona mais que qualquer nota difícil.' }
}

/** BPM típico por gênero, para acertar o metrônomo. */
function bpmDe(genero) {
    const g = GENEROS[String(genero || '').toLowerCase()]
    return g ? { nome: g.nome, bpm: g.bpm, compasso: g.compasso } : null
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [tipo, cat] of [['instrumento', INSTRUMENTOS], ['genero', GENEROS], ['teoria', TEORIA]]) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = {
    INSTRUMENTOS, GENEROS, TEORIA, NOTAS_PT,
    transpor, campoHarmonico, circuloQuintas, indiceDaNota, notaDoIndice, bpmDe, procurar
}
