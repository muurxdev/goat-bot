/**
 * Panteões e criaturas — o material de origem da lore do Reino.
 *
 * Cada ficha traz domínio, símbolo, parentesco e o mito que define a figura.
 * O campo `mito` é sempre uma história curta, não uma definição: é o que
 * diferencia uma ficha de um verbete.
 *
 * As equivalências entre panteões (`equivale`) são aproximações culturais
 * clássicas, não identidades — Ares e Marte não são o mesmo deus.
 */

const PANTEOES = {
    grego: { nome: 'Panteão Grego', emoji: '🏛️', local: 'Monte Olimpo', fonte: 'Hesíodo e Homero' },
    nordico: { nome: 'Panteão Nórdico', emoji: '⚡', local: 'Asgard', fonte: 'Eddas islandesas' },
    egipcio: { nome: 'Panteão Egípcio', emoji: '☥', local: 'Duat e o Nilo', fonte: 'Textos das Pirâmides' },
    japones: { nome: 'Panteão Japonês', emoji: '⛩️', local: 'Takamagahara', fonte: 'Kojiki e Nihon Shoki' }
}

const DEUSES = {
    // ── Grego ──
    zeus: { nome: 'Zeus', panteao: 'grego', dominio: 'Céu, trovão e realeza', simbolo: 'Raio, águia, carvalho', familia: 'Filho de Cronos e Reia', equivale: 'Júpiter (romano)',
        mito: 'Foi escondido numa caverna em Creta para escapar do pai, que engolia os próprios filhos. Adulto, obrigou Cronos a vomitar os irmãos e liderou a guerra de dez anos que derrubou os titãs.' },
    hera: { nome: 'Hera', panteao: 'grego', dominio: 'Casamento e família', simbolo: 'Pavão, romã, diadema', familia: 'Irmã e esposa de Zeus', equivale: 'Juno (romana)',
        mito: 'Sua vingança contra as amantes de Zeus move metade dos mitos gregos. Foi ela quem enviou as serpentes ao berço de Héracles e quem prolongou por dez anos a volta de heróis para casa.' },
    poseidon: { nome: 'Poseidon', panteao: 'grego', dominio: 'Mar, terremotos e cavalos', simbolo: 'Tridente, golfinho, cavalo', familia: 'Irmão de Zeus', equivale: 'Netuno (romano)',
        mito: 'Disputou Atenas com Atena: ele fez brotar uma fonte de água salgada, ela ofereceu a oliveira. A cidade escolheu a oliveira e o nome dela.' },
    atena: { nome: 'Atena', panteao: 'grego', dominio: 'Sabedoria, estratégia e artesanato', simbolo: 'Coruja, oliveira, escudo com a Górgona', familia: 'Filha de Zeus', equivale: 'Minerva (romana)',
        mito: 'Nasceu adulta e armada da cabeça de Zeus, depois que ele engoliu a mãe dela por medo de uma profecia. É a guerra como cálculo, oposta a Ares, que é a guerra como fúria.' },
    ares: { nome: 'Ares', panteao: 'grego', dominio: 'Guerra e violência', simbolo: 'Lança, cão, abutre', familia: 'Filho de Zeus e Hera', equivale: 'Marte (romano)',
        mito: 'Era pouco amado até entre os deuses. Na Ilíada, é ferido por um mortal com a ajuda de Atena e volta ao Olimpo se queixando ao pai, que o chama de o mais odioso dos filhos.' },
    apolo: { nome: 'Apolo', panteao: 'grego', dominio: 'Sol, música, profecia e cura', simbolo: 'Lira, arco, loureiro', familia: 'Filho de Zeus e Leto', equivale: 'Apolo (romano)',
        mito: 'Matou a serpente Píton e fundou o oráculo de Delfos sobre a fenda de onde saía o vapor profético. Perseguiu Dafne, que virou loureiro para escapar — desde então a folha é seu emblema.' },
    artemis: { nome: 'Ártemis', panteao: 'grego', dominio: 'Caça, lua e animais selvagens', simbolo: 'Arco prateado, cerva, lua crescente', familia: 'Irmã gêmea de Apolo', equivale: 'Diana (romana)',
        mito: 'Transformou o caçador Actéon em cervo por tê-la visto banhando-se, e os próprios cães dele o despedaçaram sem reconhecê-lo.' },
    hades: { nome: 'Hades', panteao: 'grego', dominio: 'Mundo dos mortos e riquezas do subsolo', simbolo: 'Elmo da invisibilidade, cão de três cabeças', familia: 'Irmão de Zeus', equivale: 'Plutão (romano)',
        mito: 'Raptou Perséfone e a fez comer seis sementes de romã. Por isso ela passa parte do ano no subterrâneo — e a mãe dela, Deméter, deixa a terra estéril nesses meses. É a explicação grega do inverno.' },
    afrodite: { nome: 'Afrodite', panteao: 'grego', dominio: 'Amor, beleza e desejo', simbolo: 'Concha, rosa, pomba', familia: 'Nascida da espuma do mar', equivale: 'Vênus (romana)',
        mito: 'Prometeu a mulher mais bela do mundo a Páris em troca do pomo de ouro. A mulher era Helena, casada com o rei de Esparta — e a promessa cumprida acendeu a Guerra de Troia.' },
    hermes: { nome: 'Hermes', panteao: 'grego', dominio: 'Viagem, comércio, ladrões e mensagens', simbolo: 'Sandálias aladas, caduceu', familia: 'Filho de Zeus e Maia', equivale: 'Mercúrio (romano)',
        mito: 'No primeiro dia de vida saiu do berço, roubou o gado de Apolo, apagou os rastros fazendo os bois andarem de costas e inventou a lira com um casco de tartaruga para comprar o perdão.' },
    dionisio: { nome: 'Dionísio', panteao: 'grego', dominio: 'Vinho, êxtase e teatro', simbolo: 'Hera, tirso, pantera', familia: 'Filho de Zeus e Sêmele', equivale: 'Baco (romano)',
        mito: 'Nasceu duas vezes: a mãe mortal morreu ao ver Zeus em sua forma verdadeira, e o feto foi costurado na coxa do pai até completar o tempo.' },
    hefesto: { nome: 'Hefesto', panteao: 'grego', dominio: 'Forja, fogo e artesãos', simbolo: 'Martelo, bigorna, tenaz', familia: 'Filho de Hera', equivale: 'Vulcano (romano)',
        mito: 'Foi lançado do Olimpo e ficou coxo. Vingou-se enviando à mãe um trono de ouro que a prendeu — só a soltou depois de negociar seu lugar de volta entre os deuses.' },
    demeter: { nome: 'Deméter', panteao: 'grego', dominio: 'Agricultura e colheita', simbolo: 'Espiga de trigo, tocha', familia: 'Irmã de Zeus, mãe de Perséfone', equivale: 'Ceres (romana)',
        mito: 'Ao perder a filha para Hades, vagou com tochas pelo mundo e deixou a terra morrer. Os deuses tiveram que negociar porque a humanidade inteira estava morrendo de fome junto.' },
    hestia: { nome: 'Héstia', panteao: 'grego', dominio: 'Lar e fogo sagrado', simbolo: 'Lareira, chama', familia: 'Irmã mais velha de Zeus', equivale: 'Vesta (romana)',
        mito: 'Recusou pretendentes e pediu para permanecer virgem, guardando o fogo do Olimpo. Toda cidade grega mantinha uma chama sua acesa; apagá-la era desgraça pública.' },
    perséfone: { nome: 'Perséfone', panteao: 'grego', dominio: 'Primavera e rainha dos mortos', simbolo: 'Romã, narciso, tocha', familia: 'Filha de Deméter, esposa de Hades', equivale: 'Prosérpina (romana)',
        mito: 'Divide o ano entre os dois mundos. É temida no submundo como rainha e celebrada na superfície como o retorno da estação — a mesma figura em dois papéis opostos.' },

    // ── Nórdico ──
    odin: { nome: 'Odin', panteao: 'nordico', dominio: 'Sabedoria, guerra, poesia e morte', simbolo: 'Lança Gungnir, corvos, oito patas de Sleipnir', familia: 'Pai de Thor e Baldr', equivale: 'Wotan (germânico)',
        mito: 'Arrancou o próprio olho para beber da fonte do saber e ficou nove noites pendurado na Yggdrasil, ferido pela própria lança, para arrancar as runas do abismo.' },
    thor: { nome: 'Thor', panteao: 'nordico', dominio: 'Trovão, força e proteção', simbolo: 'Martelo Mjölnir, cinto de força, bodes', familia: 'Filho de Odin', equivale: 'Donar (germânico)',
        mito: 'Vestiu-se de noiva para recuperar o martelo roubado pelo gigante Thrym. Entregou-se ao disfarce até o martelo ser posto em seu colo como bênção nupcial — e então matou a sala inteira.' },
    loki: { nome: 'Loki', panteao: 'nordico', dominio: 'Astúcia, mudança de forma e caos', simbolo: 'Fogo, serpente, redes', familia: 'Irmão de sangue de Odin', equivale: '—',
        mito: 'Causou a morte de Baldr guiando a mão de um deus cego. Amarrado com as tripas do próprio filho sob uma serpente que goteja veneno, é o tremor dele que os nórdicos diziam ser o terremoto.' },
    freya: { nome: 'Freyja', panteao: 'nordico', dominio: 'Amor, fertilidade, guerra e magia', simbolo: 'Colar Brísingamen, gatos, falcão', familia: 'Irmã de Freyr', equivale: 'Vênus (aproximação)',
        mito: 'Fica com metade dos guerreiros mortos em batalha — Odin só recebe a outra metade. Ensinou aos ases a magia seidr, que os guerreiros consideravam arte de mulher e ainda assim temiam.' },
    baldr: { nome: 'Baldr', panteao: 'nordico', dominio: 'Luz, pureza e beleza', simbolo: 'Visco, luz branca', familia: 'Filho de Odin e Frigg', equivale: '—',
        mito: 'A mãe fez todas as coisas jurarem não feri-lo, menos o visco, que julgou inofensivo. Loki descobriu a falha e o mundo perdeu sua luz por causa de um único ramo esquecido.' },
    tyr: { nome: 'Týr', panteao: 'nordico', dominio: 'Justiça, lei e coragem', simbolo: 'Espada, mão decepada', familia: 'Filho de Odin', equivale: 'Marte (aproximação)',
        mito: 'Foi o único que aceitou pôr a mão na boca do lobo Fenrir como garantia enquanto os deuses o acorrentavam. A corrente segurou; a mão, não.' },
    heimdall: { nome: 'Heimdall', panteao: 'nordico', dominio: 'Vigília e fronteiras', simbolo: 'Trompa Gjallarhorn, ponte Bifröst', familia: 'Filho de nove mães', equivale: '—',
        mito: 'Vê a cem léguas e ouve a grama crescer. Vai soprar a trompa que anuncia o Ragnarök e morrerá matando Loki, cada um levando o outro.' },
    frigg: { nome: 'Frigg', panteao: 'nordico', dominio: 'Matrimônio, lar e destino', simbolo: 'Roca de fiar, falcão', familia: 'Esposa de Odin', equivale: 'Juno (aproximação)',
        mito: 'Conhece o destino de todos e não o revela a ninguém. Sabia como Baldr morreria e mesmo assim tentou impedir — o único mito em que alguém tenta driblar o destino nórdico.' },
    freyr: { nome: 'Freyr', panteao: 'nordico', dominio: 'Colheita, paz e prosperidade', simbolo: 'Javali dourado, navio Skidbladnir', familia: 'Irmão de Freyja', equivale: '—',
        mito: 'Deu a própria espada para conquistar a giganta Gerd. No Ragnarök enfrenta o gigante de fogo Surtr desarmado, e é por isso que perde.' },
    hel: { nome: 'Hel', panteao: 'nordico', dominio: 'Reino dos mortos comuns', simbolo: 'Meio corpo vivo, meio morto', familia: 'Filha de Loki', equivale: '—',
        mito: 'Aceitou devolver Baldr se o mundo inteiro chorasse por ele. Uma única giganta se recusou — provavelmente Loki disfarçado — e o acordo caiu.' },
    skadi: { nome: 'Skadi', panteao: 'nordico', dominio: 'Inverno, montanha e caça', simbolo: 'Esquis, arco', familia: 'Filha de um gigante', equivale: '—',
        mito: 'Exigiu reparação pela morte do pai e escolheu marido vendo apenas os pés dos deuses. Escolheu os mais bonitos achando que eram de Baldr; eram de Njörd, deus do mar, e o casamento não durou.' },
    vidar: { nome: 'Vídar', panteao: 'nordico', dominio: 'Vingança e silêncio', simbolo: 'Bota reforçada', familia: 'Filho de Odin', equivale: '—',
        mito: 'Quase não fala em mito nenhum. Guarda uma bota feita de todas as sobras de couro do mundo, e é com ela que vai pisar na mandíbula do lobo que matar seu pai.' },

    // ── Egípcio ──
    ra: { nome: 'Rá', panteao: 'egipcio', dominio: 'Sol e criação', simbolo: 'Disco solar, falcão, escaravelho', familia: 'Pai dos deuses', equivale: 'Hélio (aproximação)',
        mito: 'Atravessa o céu de dia na barca solar e o submundo à noite, onde enfrenta a serpente Apófis. Cada amanhecer é uma batalha vencida, nunca uma garantia.' },
    osiris: { nome: 'Osíris', panteao: 'egipcio', dominio: 'Morte, ressurreição e vegetação', simbolo: 'Cajado e mangual, pele verde', familia: 'Marido de Ísis', equivale: 'Dionísio (aproximação)',
        mito: 'Foi morto e esquartejado pelo irmão Set. Ísis reuniu os pedaços e o reanimou tempo bastante para conceber Hórus — desde então ele julga os mortos em vez de reinar sobre os vivos.' },
    isis: { nome: 'Ísis', panteao: 'egipcio', dominio: 'Magia, maternidade e cura', simbolo: 'Trono na cabeça, asas', familia: 'Irmã e esposa de Osíris', equivale: 'Deméter (aproximação)',
        mito: 'Descobriu o nome secreto de Rá envenenando-o com uma serpente feita do próprio cuspe dele e só o curando em troca do nome. No Egito, saber o nome verdadeiro é ter poder sobre a coisa.' },
    horus: { nome: 'Hórus', panteao: 'egipcio', dominio: 'Realeza, céu e proteção', simbolo: 'Falcão, olho de Hórus', familia: 'Filho de Ísis e Osíris', equivale: 'Apolo (aproximação)',
        mito: 'Disputou o trono com Set por oitenta anos, em julgamento divino. Perdeu um olho na luta; o olho restaurado virou o amuleto de proteção mais usado do Egito.' },
    set: { nome: 'Set', panteao: 'egipcio', dominio: 'Deserto, tempestade e desordem', simbolo: 'Animal de Set, cetro was', familia: 'Irmão de Osíris', equivale: 'Tifão (aproximação)',
        mito: 'É o assassino do irmão e, ao mesmo tempo, o único capaz de matar Apófis na proa da barca solar. O Egito precisava do caos para conter um caos maior.' },
    anubis: { nome: 'Anúbis', panteao: 'egipcio', dominio: 'Embalsamamento e passagem', simbolo: 'Cabeça de chacal, balança', familia: 'Filho de Néftis', equivale: 'Hermes psicopompo (aproximação)',
        mito: 'Pesa o coração do morto contra a pena da verdade. Se o coração for mais pesado, é devorado por Ammit e a pessoa deixa de existir — não há inferno, há apagamento.' },
    thoth: { nome: 'Tot', panteao: 'egipcio', dominio: 'Escrita, saber e tempo', simbolo: 'Cabeça de íbis, papiro, lua', familia: 'Escriba dos deuses', equivale: 'Hermes (aproximação)',
        mito: 'Registra o veredito do julgamento dos mortos. Ganhou cinco dias extras do ano jogando com a lua, e são justamente esses dias em que os cinco grandes deuses puderam nascer.' },
    bastet: { nome: 'Bastet', panteao: 'egipcio', dominio: 'Lar, gatos e proteção', simbolo: 'Gata, sistro', familia: 'Filha de Rá', equivale: 'Ártemis (aproximação)',
        mito: 'Começou leoa de guerra e virou gata protetora do lar. Matar um gato no Egito era crime capital, e famílias raspavam as sobrancelhas em luto quando o gato da casa morria.' },
    hathor: { nome: 'Hathor', panteao: 'egipcio', dominio: 'Amor, música e alegria', simbolo: 'Chifres de vaca com disco solar, sistro', familia: 'Ligada a Rá e a Hórus', equivale: 'Afrodite (aproximação)',
        mito: 'Enviada para punir a humanidade, virou a leoa Sekhmet e não parava de matar. Os deuses tingiram cerveja de vermelho para parecer sangue; ela bebeu, dormiu e acordou gentil de novo.' },
    sekhmet: { nome: 'Sekhmet', panteao: 'egipcio', dominio: 'Guerra, peste e cura', simbolo: 'Cabeça de leoa, disco solar', familia: 'Filha de Rá', equivale: 'Ares e Apolo curador ao mesmo tempo',
        mito: 'A mesma deusa que traz a peste é invocada para afastá-la. Seus sacerdotes eram, na prática, o corpo médico do Egito.' },
    ptah: { nome: 'Ptah', panteao: 'egipcio', dominio: 'Criação, artesãos e arquitetura', simbolo: 'Cetro was, barba reta', familia: 'Esposo de Sekhmet', equivale: 'Hefesto (aproximação)',
        mito: 'Criou o mundo pensando as coisas e dizendo os nomes delas — uma criação pela palavra, séculos antes de a ideia aparecer em outros textos do Oriente Médio.' },
    maat: { nome: 'Maat', panteao: 'egipcio', dominio: 'Verdade, ordem e equilíbrio', simbolo: 'Pena de avestruz, balança', familia: 'Filha de Rá', equivale: 'Têmis (aproximação)',
        mito: 'Não é só deusa, é o princípio que mantém o cosmo funcionando. O faraó governava para sustentar Maat; injustiça no trono significava desordem no rio e na colheita.' },

    // ── Japonês ──
    amaterasu: { nome: 'Amaterasu', panteao: 'japones', dominio: 'Sol e ancestralidade imperial', simbolo: 'Espelho Yata no Kagami, galo', familia: 'Filha de Izanagi', equivale: 'Rá (aproximação)',
        mito: 'Ofendida pelo irmão, trancou-se numa caverna e o mundo escureceu. Os deuses só a fizeram sair com uma festa barulhenta e um espelho: ela saiu curiosa com o próprio brilho refletido.' },
    susanoo: { nome: 'Susanoo', panteao: 'japones', dominio: 'Tempestade e mar', simbolo: 'Espada Kusanagi, serpente de oito cabeças', familia: 'Irmão de Amaterasu', equivale: 'Poseidon (aproximação)',
        mito: 'Expulso do céu, matou a serpente Yamata no Orochi embebedando-a com oito tinas de saquê. Na cauda dela achou a espada que virou insígnia imperial.' },
    tsukuyomi: { nome: 'Tsukuyomi', panteao: 'japones', dominio: 'Lua e noite', simbolo: 'Lua, espelho', familia: 'Irmão de Amaterasu', equivale: 'Selene (aproximação)',
        mito: 'Matou a deusa da comida por achar nojento o modo como ela servia o banquete. Amaterasu nunca mais quis vê-lo — é por isso que o sol e a lua não dividem o mesmo céu.' },
    izanagi: { nome: 'Izanagi', panteao: 'japones', dominio: 'Criação e vida', simbolo: 'Lança Amenonuhoko', familia: 'Marido de Izanami', equivale: 'Urano (aproximação)',
        mito: 'Desceu ao mundo dos mortos para buscar a esposa e olhou para ela antes da hora, contrariando a única condição. Fugiu selando a passagem com uma pedra — o mito da separação entre vivos e mortos.' },
    izanami: { nome: 'Izanami', panteao: 'japones', dominio: 'Criação e morte', simbolo: 'Yomi, o mundo inferior', familia: 'Esposa de Izanagi', equivale: 'Perséfone (aproximação)',
        mito: 'Ao ser vista em decomposição, jurou matar mil pessoas por dia. Izanagi respondeu que faria nascer mil e quinhentas — e é assim que a população cresce apesar da morte.' },
    inari: { nome: 'Inari', panteao: 'japones', dominio: 'Arroz, fertilidade e prosperidade', simbolo: 'Raposa kitsune, portais torii vermelhos', familia: 'Ligada aos kami da terra', equivale: '—',
        mito: 'Tem mais de trinta mil santuários no Japão, mais que qualquer outro kami. Aparece como homem, mulher ou raposa, conforme quem está olhando.' },
    raijin: { nome: 'Raijin', panteao: 'japones', dominio: 'Trovão e relâmpago', simbolo: 'Círculo de tambores', familia: 'Irmão de Fujin', equivale: 'Thor (aproximação)',
        mito: 'Bate nos tambores que formam o trovão. As mães japonesas diziam às crianças para esconder o umbigo na tempestade, porque Raijin gosta de comê-los.' },
    fujin: { nome: 'Fujin', panteao: 'japones', dominio: 'Vento', simbolo: 'Saco de ventos nas costas', familia: 'Irmão de Raijin', equivale: 'Éolo (aproximação)',
        mito: 'Carrega os ventos num saco às costas. Diz-se que o vento divino que afundou duas frotas mongóis a caminho do Japão saiu dali.' },
    hachiman: { nome: 'Hachiman', panteao: 'japones', dominio: 'Guerra e proteção dos guerreiros', simbolo: 'Pomba, arco', familia: 'Divinizado a partir de um imperador', equivale: 'Ares (aproximação)',
        mito: 'Padroeiro dos samurais e do clã Minamoto. A pomba, símbolo de paz em quase todo lugar, é justamente o mensageiro do deus da guerra japonês.' },
    benzaiten: { nome: 'Benzaiten', panteao: 'japones', dominio: 'Música, eloquência e água', simbolo: 'Alaúde biwa, serpente branca', familia: 'Uma das Sete Divindades da Sorte', equivale: 'Saraswati (indiana)',
        mito: 'Veio do hinduísmo pelo budismo e virou kami. Casais que visitam juntos seus santuários são separados por ciúme dela, segundo a crença popular.' },
    ebisu: { nome: 'Ebisu', panteao: 'japones', dominio: 'Pesca, comércio e sorte', simbolo: 'Vara de pescar, peixe dourado', familia: 'Uma das Sete Divindades da Sorte', equivale: '—',
        mito: 'É o único das Sete Divindades da Sorte de origem puramente japonesa. Nasceu sem ossos e foi lançado ao mar; voltou, cresceu e virou o deus surdo que ri sozinho.' },
    kagutsuchi: { nome: 'Kagutsuchi', panteao: 'japones', dominio: 'Fogo', simbolo: 'Chama, forja', familia: 'Filho de Izanagi e Izanami', equivale: 'Hefesto (aproximação)',
        mito: 'Matou a mãe ao nascer, porque nasceu em chamas. O pai o decapitou de dor, e do sangue derramado nasceram oito novos deuses das montanhas.' }
}

const CRIATURAS = {
    dragao: { nome: 'Dragão', origem: 'Universal', tipo: 'Réptil colossal', perigo: 'extremo', ponto: 'Escamas do peito costumam ser o ponto fraco nas versões europeias', historia: 'No ocidente guarda tesouros e é morto por cavaleiros; no oriente traz chuva e é reverenciado. A mesma silhueta, dois papéis opostos.' },
    fenix: { nome: 'Fênix', origem: 'Grega e egípcia', tipo: 'Ave de fogo', perigo: 'baixo', ponto: 'Não tem ponto fraco — tem ciclo', historia: 'Vive séculos, queima no próprio ninho e renasce das cinzas. O egípcio Bennu, sua origem provável, era ligado ao nascer do sol e à cheia do Nilo.' },
    minotauro: { nome: 'Minotauro', origem: 'Grega', tipo: 'Híbrido de homem e touro', perigo: 'alto', ponto: 'Preso no labirinto; a saída é o problema, não ele', historia: 'Fruto da maldição de Poseidon sobre o rei Minos, foi trancado no labirinto de Dédalo e morto por Teseu, que voltou seguindo o fio de Ariadne.' },
    medusa: { nome: 'Medusa', origem: 'Grega', tipo: 'Górgona', perigo: 'extremo', ponto: 'O olhar; combate-se pelo reflexo', historia: 'Era uma sacerdotisa de Atena punida com cabelos de serpente. Perseu a decapitou olhando o escudo polido, e do sangue dela nasceu o cavalo alado Pégaso.' },
    kraken: { nome: 'Kraken', origem: 'Nórdica', tipo: 'Cefalópode gigante', perigo: 'extremo', ponto: 'Não emerge em águas rasas', historia: 'Relatos nórdicos de um monstro capaz de afundar navios provavelmente nasceram de encontros reais com lulas-gigantes, que existem e chegam a 13 metros.' },
    fenrir: { nome: 'Fenrir', origem: 'Nórdica', tipo: 'Lobo monstruoso', perigo: 'extremo', ponto: 'Só uma corrente feita do impossível o segura', historia: 'Filho de Loki, foi preso com Gleipnir, corrente tecida de som de passo de gato, barba de mulher e raiz de montanha. Vai se soltar no Ragnarök e devorar Odin.' },
    jormungandr: { nome: 'Jörmungandr', origem: 'Nórdica', tipo: 'Serpente do mundo', perigo: 'extremo', ponto: 'Thor o mata e morre nove passos depois', historia: 'É tão grande que circunda a Terra e morde a própria cauda. Quando soltar a cauda, o Ragnarök começa.' },
    kitsune: { nome: 'Kitsune', origem: 'Japonesa', tipo: 'Raposa espiritual', perigo: 'variável', ponto: 'Perde o disfarce se a sombra mostrar a cauda', historia: 'Ganha uma cauda a cada século e sabedoria com ela. Com nove caudas fica dourada ou branca e enxerga tudo que acontece no mundo.' },
    tengu: { nome: 'Tengu', origem: 'Japonesa', tipo: 'Espírito das montanhas', perigo: 'médio', ponto: 'Orgulho: aceita desafios que não devia', historia: 'De demônio das montanhas virou mestre de espada. Vários guerreiros lendários japoneses teriam aprendido esgrima com um tengu na floresta.' },
    orochi: { nome: 'Yamata no Orochi', origem: 'Japonesa', tipo: 'Serpente de oito cabeças', perigo: 'extremo', ponto: 'Bebe demais', historia: 'Exigia uma donzela por ano até Susanoo lhe oferecer oito tinas de saquê, uma para cada cabeça, e cortá-lo enquanto dormia.' },
    ammit: { nome: 'Ammit', origem: 'Egípcia', tipo: 'Devoradora dos mortos', perigo: 'absoluto', ponto: 'Só age depois do julgamento', historia: 'Crocodilo, leão e hipopótamo — os três animais mais temidos do Nilo num corpo só. Devora o coração pesado demais e apaga a pessoa da existência.' },
    esfinge: { nome: 'Esfinge', origem: 'Egípcia e grega', tipo: 'Híbrido de leão e humano', perigo: 'alto', ponto: 'A charada: responder certo a destrói', historia: 'A egípcia é guardiã silenciosa; a grega devora quem erra o enigma. Édipo respondeu "o homem" e ela se atirou do rochedo.' },
    grifo: { nome: 'Grifo', origem: 'Grega e persa', tipo: 'Águia e leão', perigo: 'alto', ponto: 'Defende ninho: atrai-se e evita-se pelo mesmo motivo', historia: 'Guardião do ouro nas montanhas do norte. Como junta o rei dos céus e o rei da terra, virou emblema de nobreza na heráldica europeia.' },
    centauro: { nome: 'Centauro', origem: 'Grega', tipo: 'Metade homem, metade cavalo', perigo: 'médio', ponto: 'Vinho: a fama de descontrole vem daí', historia: 'Quase todos eram selvagens, mas Quíron era sábio e mestre de Aquiles e Asclépio. Ferido por engano com veneno da Hidra, trocou a imortalidade pela morte para escapar da dor.' },
    hidra: { nome: 'Hidra de Lerna', origem: 'Grega', tipo: 'Serpente de muitas cabeças', perigo: 'extremo', ponto: 'Cauterizar o corte impede a rebrota', historia: 'Cada cabeça cortada virava duas. Héracles só venceu com ajuda do sobrinho, que queimava o coto a cada golpe — o segundo dos doze trabalhos.' },
    cerbero: { nome: 'Cérbero', origem: 'Grega', tipo: 'Cão de três cabeças', perigo: 'alto', ponto: 'Música o adormece', historia: 'Guarda a saída do submundo, não a entrada: entrar é fácil. Orfeu passou tocando lira, e Héracles o levou à superfície com as próprias mãos.' },
    banshee: { nome: 'Banshee', origem: 'Irlandesa', tipo: 'Espírito anunciador', perigo: 'nenhum, direto', ponto: 'Não mata; avisa', historia: 'O lamento dela anuncia uma morte na família. Não causa a morte, o que a torna mais assustadora: já está decidido quando ela aparece.' },
    golem: { nome: 'Golem', origem: 'Judaica', tipo: 'Autômato de barro', perigo: 'alto', ponto: 'A palavra na testa: apagar uma letra o desliga', historia: 'Feito de barro e animado por uma palavra sagrada. A lenda de Praga conta que o golem protegeu o gueto até crescer demais e ter que ser desativado pelo criador.' },
    yeti: { nome: 'Yeti', origem: 'Himalaia', tipo: 'Hominídeo das neves', perigo: 'médio', ponto: 'Evita altitudes baixas', historia: 'Sherpas relatam pegadas há séculos. Análises genéticas de amostras atribuídas ao yeti apontaram, na maioria, ursos da região.' },
    curupira: { nome: 'Curupira', origem: 'Brasileira', tipo: 'Guardião da mata', perigo: 'médio', ponto: 'Confunde-se com nós amarrados em cipós', historia: 'Tem os pés virados para trás para que o caçador siga a pegada no sentido errado. Persegue quem mata mais do que precisa comer.' },
    saci: { nome: 'Saci-Pererê', origem: 'Brasileira', tipo: 'Trapaceiro de uma perna só', perigo: 'baixo', ponto: 'Preso pelo capuz vermelho ou dentro de garrafa', historia: 'Anda em redemoinhos, azeda o leite e some com objetos. Quem toma seu capuz manda nele — mas quem devolve costuma se arrepender menos.' },
    boitata: { nome: 'Boitatá', origem: 'Brasileira', tipo: 'Serpente de fogo', perigo: 'alto', ponto: 'Ataca quem põe fogo na mata', historia: 'Cobra luminosa que protege os campos do incêndio. O nome vem do tupi e significa, mais ou menos, "cobra de fogo".' },
    iara: { nome: 'Iara', origem: 'Brasileira', tipo: 'Mãe-d\'água', perigo: 'alto', ponto: 'O canto: tapar os ouvidos', historia: 'Atrai homens ao fundo do rio com o canto. É a versão amazônica de um motivo que aparece em quase toda cultura ribeirinha do mundo.' },
    boto: { nome: 'Boto-cor-de-rosa', origem: 'Brasileira', tipo: 'Encantado', perigo: 'baixo', ponto: 'Nunca tira o chapéu — esconde o respiradouro', historia: 'Vira rapaz elegante nas festas junto ao rio e some antes do amanhecer. A lenda explicava gravidezes sem pai declarado em comunidades ribeirinhas.' }
}

/** Deuses de um panteão. */
function deusesDe(panteao) {
    return Object.entries(DEUSES)
        .filter(([, d]) => d.panteao === panteao)
        .map(([chave, d]) => ({ chave, ...d }))
}

/** Busca por nome, domínio ou trecho do mito. */
function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [chave, d] of Object.entries(DEUSES)) {
        if ((JSON.stringify(d) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'deus', chave, nome: d.nome, extra: PANTEOES[d.panteao].nome })
    }
    for (const [chave, c] of Object.entries(CRIATURAS)) {
        if ((JSON.stringify(c) + chave).toLowerCase().includes(t)) achados.push({ tipo: 'criatura', chave, nome: c.nome, extra: c.origem })
    }
    return achados
}

module.exports = { PANTEOES, DEUSES, CRIATURAS, deusesDe, procurar }
