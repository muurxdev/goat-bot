/**
 * Por que as coisas acontecem: fenômenos do dia a dia explicados.
 *
 * A regra de escrita aqui é uma só: a explicação tem que caber em três frases e
 * usar coisa que a pessoa já conhece. Se precisar de fórmula, é porque o autor
 * não entendeu bem o bastante para explicar.
 *
 * Cada ficha tem `engano`, que é a explicação errada mais repetida — quase
 * sempre a que a pessoa já ouviu e acredita. Corrigir isso vale mais que
 * apresentar a certa do zero.
 */

const FENOMENOS = {
    // ── Corpo ──
    bocejo: { nome: 'Por que a gente boceja', area: 'corpo',
        resposta: 'A hipótese com mais apoio hoje é resfriamento do cérebro: a inspiração profunda e o alongamento da mandíbula aumentam o fluxo de sangue e ar frio na cabeça.',
        detalhe: 'Bocejar é contagioso e a força do contágio acompanha a proximidade afetiva — a gente boceja mais junto de quem gosta.',
        engano: 'A explicação de "falta de oxigênio" foi testada e reprovada: respirar ar com mais oxigênio não reduz o bocejo.' },
    solucos: { nome: 'Por que dá soluço', area: 'corpo',
        resposta: 'É uma contração involuntária e brusca do diafragma, seguida do fechamento repentino das cordas vocais — o "hic" é esse fechamento.',
        detalhe: 'Comer rápido, bebida gaseificada e mudança brusca de temperatura no estômago são gatilhos comuns.',
        engano: 'Levar susto não "corta" o soluço por magia: o que ajuda é qualquer coisa que segure a respiração e acumule gás carbônico, e o susto faz isso por acidente.' },
    arrepio: { nome: 'Por que a gente se arrepia', area: 'corpo',
        resposta: 'Pequenos músculos na base de cada pelo se contraem e levantam o fio. Em animais peludos isso cria uma camada de ar que aquece, ou faz o bicho parecer maior.',
        detalhe: 'Em humanos não serve para quase nada: é herança de quando tínhamos pelo o bastante para a manobra funcionar.',
        engano: 'Arrepio de música ou emoção não é "coisa da cabeça" desligada do corpo: é a mesma resposta de adrenalina, disparada por outro motivo.' },
    dordecabecagelo: { nome: 'Por que sorvete gelado dói na cabeça', area: 'corpo',
        resposta: 'O frio súbito no céu da boca contrai e depois dilata rapidamente uma artéria ali perto. O cérebro interpreta esse sinal como dor na testa.',
        detalhe: 'É dor referida: o problema está na boca, a dor aparece na testa, porque os nervos compartilham a via.',
        engano: 'Não é "congelamento do cérebro". O cérebro não muda de temperatura nem perto disso.' },
    ouvidoaviao: { nome: 'Por que dói o ouvido no avião', area: 'corpo',
        resposta: 'A pressão dentro do ouvido médio e a da cabine deixam de ser iguais, e a diferença empurra o tímpano.',
        detalhe: 'Bocejar, engolir ou mascar chiclete abre a trompa de Eustáquio e iguala as pressões — daí o alívio com o "estalo".',
        engano: 'Não é a altitude em si: é a VARIAÇÃO. Por isso dói na subida e na descida, e não durante o voo estabilizado.' },
    peleenruga: { nome: 'Por que a pele enruga na água', area: 'corpo',
        resposta: 'Não é a pele absorvendo água. O sistema nervoso contrai vasos sanguíneos sob a pele dos dedos, e a superfície enruga por cima.',
        detalhe: 'A prova: nervo danificado no dedo faz a pele daquele dedo parar de enrugar na água.',
        engano: '"A pele incha de água" é a explicação corrente e está errada — é uma resposta ativa do corpo, não passiva.' },
    espirro: { nome: 'Por que a gente espirra olhando para o sol', area: 'corpo',
        resposta: 'Cerca de uma em cada quatro pessoas tem os nervos da pupila e do nariz muito próximos. A luz forte contrai a pupila e o sinal "vaza" para a via do espirro.',
        detalhe: 'É hereditário e tem nome: reflexo fótico do espirro.',
        engano: 'Não é alergia à luz nem sensibilidade dos olhos: é cruzamento de sinal nervoso.' },
    memoriacheiro: { nome: 'Por que cheiro traz lembrança tão forte', area: 'corpo',
        resposta: 'O olfato é o único sentido que chega ao cérebro sem passar pela estação de triagem que os outros usam. Ele entra direto perto das áreas de emoção e memória.',
        detalhe: 'Por isso a lembrança por cheiro vem com emoção junto, e costuma ser mais antiga que a puxada por foto ou som.',
        engano: 'Não é que o cheiro seja "mais marcante": é que ele tem um atalho anatômico que os outros sentidos não têm.' },

    // ── Cozinha ──
    cebolachora: { nome: 'Por que cebola faz chorar', area: 'cozinha',
        resposta: 'Cortar rompe células que liberam enzimas; elas produzem um gás com enxofre que, ao encontrar a água do olho, vira ácido sulfúrico em quantidade minúscula.',
        detalhe: 'O olho lacrimeja para diluir e expulsar o ácido. Gelar a cebola antes reduz a evaporação do gás.',
        engano: 'Faca afiada ajuda de verdade — não por superstição: ela rompe menos células que uma faca cega esmagando.' },
    maionesedesanda: { nome: 'Por que a maionese desanda', area: 'cozinha',
        resposta: 'Maionese é óleo suspenso em gotas minúsculas dentro de água, seguradas pela lecitina da gema. Óleo demais de uma vez satisfaz a lecitina disponível e as gotas se juntam de volta.',
        detalhe: 'Para recuperar: comece uma gema nova e vá acrescentando a maionese desandada aos poucos, como se fosse o óleo.',
        engano: 'Não é "a mão errada" nem fase da lua: é proporção e velocidade de adição.' },
    aguafervesal: { nome: 'Por que sal na água muda o cozimento', area: 'cozinha',
        resposta: 'O sal eleva o ponto de ebulição, mas tão pouco que não muda o tempo de cozimento em nada perceptível.',
        detalhe: 'A razão real de salgar a água é sabor: o alimento absorve sal por dentro, o que nenhuma salgada no fim reproduz.',
        engano: 'Dizer que "sal faz ferver mais rápido" é o contrário do que acontece — o efeito, embora ínfimo, é de atrasar.' },
    carnedourada: { nome: 'Por que carne dourada é mais saborosa', area: 'cozinha',
        resposta: 'Acima de cerca de 140 °C, açúcares e proteínas reagem entre si e criam centenas de compostos novos de aroma e sabor. É a reação de Maillard.',
        detalhe: 'Ela só acontece em superfície seca: enquanto houver água, a temperatura fica presa em 100 °C e a carne cozinha em vez de dourar.',
        engano: '"Selar a carne prende o suco" é falso e já foi medido. Selar dá sabor, não retém líquido.' },
    paocresce: { nome: 'Por que o pão cresce', area: 'cozinha',
        resposta: 'O fermento come açúcar e libera gás carbônico. As bolhas ficam presas na rede de glúten formada ao sovar, e a massa infla.',
        detalhe: 'O forno mata o fermento cedo, mas o gás já preso expande com o calor — por isso o pão ainda cresce ao assar.',
        engano: 'Sovar não "mistura": sovar organiza as proteínas numa rede elástica. Sem sova, o gás escapa e o pão fica denso.' },
    batatafritacrocante: { nome: 'Por que fritar duas vezes deixa crocante', area: 'cozinha',
        resposta: 'A primeira fritura, em óleo mais frio, cozinha o interior e seca a superfície. A segunda, mais quente, forma a casca rápido, antes que a umidade de dentro volte a amolecê-la.',
        detalhe: 'Crocância é uma casca seca e rígida. Ela é inimiga da água, e toda batata tem água dentro.',
        engano: 'Óleo mais quente do começo ao fim não resolve: doura por fora antes de cozinhar por dentro.' },
    macaescurece: { nome: 'Por que a maçã escurece cortada', area: 'cozinha',
        resposta: 'Uma enzima da fruta encontra o oxigênio do ar e produz pigmentos escuros. É o mesmo processo que escurece batata e abacate.',
        detalhe: 'Limão atrasa porque o ácido desativa a enzima, e a vitamina C reage com o oxigênio antes da fruta.',
        engano: 'A fruta escura não está estragada nem perdeu valor nutritivo relevante: mudou de cor.' },

    // ── Natureza ──
    ceuazul: { nome: 'Por que o céu é azul', area: 'natureza',
        resposta: 'A luz do sol tem todas as cores. As moléculas do ar espalham muito mais as ondas curtas — azul e violeta — do que as longas. O azul espalhado vem de todas as direções do céu.',
        detalhe: 'O violeta é espalhado ainda mais, mas o sol emite menos violeta e nosso olho é menos sensível a ele.',
        engano: 'O céu não é azul por refletir o mar. Em pleno deserto, sem uma gota d\'água por perto, ele é igualmente azul.' },
    porsolvermelho: { nome: 'Por que o pôr do sol é vermelho', area: 'natureza',
        resposta: 'No horizonte, a luz atravessa muito mais atmosfera. O azul se espalha e se perde no caminho, e o que chega ao seu olho é o que sobrou: vermelho e laranja.',
        detalhe: 'É o mesmo fenômeno que faz o céu azul, visto pelo lado oposto. Poeira e fumaça deixam o pôr do sol mais intenso.',
        engano: 'Não é a poluição que "cria" a cor: ela apenas realça. Pôr do sol vermelho existe em ar limpo.' },
    arcoiris: { nome: 'Por que o arco-íris aparece', area: 'natureza',
        resposta: 'Cada gota de chuva funciona como um prisma: a luz entra, se separa em cores porque cada cor entorta um pouco diferente, reflete no fundo da gota e sai.',
        detalhe: 'O arco sempre aparece a 42° do ponto oposto ao sol. Por isso ele fica atrás de você quando o sol está na sua frente — e nunca ao meio-dia com sol alto.',
        engano: 'Não existe "pote no fim do arco-íris" nem fim algum: o arco é um círculo completo, e o chão esconde a metade de baixo. De avião dá para ver o círculo inteiro.' },
    luadedia: { nome: 'Por que a lua aparece de dia', area: 'natureza',
        resposta: 'A lua não brilha sozinha: ela reflete o sol. Ela está no céu de dia em boa parte do mês, e fica visível sempre que estiver acima do horizonte e refletindo luz suficiente.',
        detalhe: 'Só a lua cheia nasce ao pôr do sol e se põe ao amanhecer — por isso ela é a única que nunca aparece em pleno dia.',
        engano: 'Não é "erro" nem coisa rara: lua de dia é o normal, a maioria das pessoas é que só olha para o céu à noite.' },
    maresluas: { nome: 'Por que existem marés', area: 'natureza',
        resposta: 'A gravidade da lua puxa a água do lado da Terra voltado para ela. Do lado oposto a água também se acumula, porque ali a Terra é puxada mais que a água.',
        detalhe: 'Por isso há duas marés altas por dia, e não uma. O sol contribui com cerca de metade da força da lua.',
        engano: 'A lua não "puxa a água só de um lado". As duas marés altas simultâneas são a parte que a explicação simples costuma esconder.' },
    trovaodepois: { nome: 'Por que o trovão vem depois do raio', area: 'natureza',
        resposta: 'Luz e som saem no mesmo instante, mas a luz viaja cerca de um milhão de vezes mais rápido.',
        detalhe: 'Conte os segundos entre o clarão e o estouro e divida por 3: o resultado é a distância em quilômetros.',
        engano: 'O trovão não é o barulho "do raio batendo": é o ar aquecido a mais de 25 mil graus se expandindo de forma explosiva.' },
    neveebranca: { nome: 'Por que a neve é branca se o gelo é transparente', area: 'natureza',
        resposta: 'Neve é um amontoado de cristais minúsculos com ar entre eles. A luz bate em milhões de superfícies e é espalhada em todas as direções e em todas as cores — e todas as cores juntas dão branco.',
        detalhe: 'A mesma coisa acontece com açúcar, sal e vidro moído: o material é transparente, o pó é branco.',
        engano: 'Não é a temperatura nem a "pureza" da água: é a quantidade de superfícies espalhando luz.' },
    marsalgado: { nome: 'Por que o mar é salgado', area: 'natureza',
        resposta: 'A chuva dissolve sais das rochas, os rios carregam esses sais até o mar, e a água evapora deixando o sal para trás. Isso há bilhões de anos.',
        detalhe: 'O rio também é salgado, só que quase nada: a diferença é que no rio a água não fica parada evaporando.',
        engano: 'Não é o mar que "produz" sal. É acúmulo, e é por isso que ele não fica mais salgado indefinidamente: parte do sal se deposita no fundo.' },
    ventoexiste: { nome: 'Por que venta', area: 'natureza',
        resposta: 'O sol aquece a superfície de forma desigual. Ar quente sobe, deixa uma região de pressão menor, e o ar de onde está mais frio corre para ocupar o lugar. Esse deslocamento é o vento.',
        detalhe: 'A brisa do mar durante o dia e a brisa da terra à noite são o exemplo mais direto: a areia esquenta e esfria mais rápido que a água.',
        engano: 'Vento não é o ar "empurrado" por nada: é ar caindo de onde a pressão é maior para onde é menor.' },

    // ── Casa e coisas ──
    espelhoinverte: { nome: 'Por que o espelho inverte esquerda e direita, mas não em cima e embaixo', area: 'casa',
        resposta: 'Ele não inverte esquerda e direita. O espelho inverte frente e trás. Quem inverte esquerda e direita é você, ao se imaginar girando para ficar de frente para a imagem.',
        detalhe: 'A prova: deite-se de lado diante do espelho. O que "inverte" acompanha o seu giro, não o espelho.',
        engano: 'A pergunta em si já vem com o erro embutido, e é por isso que ela nunca tem resposta satisfatória.' },
    portageladeira: { nome: 'Por que a porta da geladeira gruda', area: 'casa',
        resposta: 'Tem um ímã na borracha da porta. Mas a resistência maior ao reabrir logo depois é outra: ao fechar, entra ar quente que esfria rápido e encolhe, criando pressão menor lá dentro.',
        detalhe: 'Por isso reabrir imediatamente é mais difícil, e alguns segundos depois volta ao normal.',
        engano: 'Não é "vácuo". É uma diferença de pressão pequena, causada pela contração do ar ao esfriar.' },
    roupasecasombra: { nome: 'Por que roupa seca até na sombra', area: 'casa',
        resposta: 'Secar não é ferver: as moléculas de água mais agitadas escapam da superfície mesmo em temperatura ambiente. Vento acelera porque leva embora o ar já úmido.',
        detalhe: 'Por isso dia seco e ventoso seca melhor que dia quente e abafado.',
        engano: 'Não é o calor do sol que "arranca" a água: o sol ajuda, mas quem determina é a umidade do ar e o vento.' },
    microondasaquece: { nome: 'Por que o micro-ondas aquece por dentro', area: 'casa',
        resposta: 'As ondas fazem as moléculas de água do alimento girarem rapidamente. Esse atrito gera calor no lugar onde a água está — que é dentro do alimento, não só na superfície.',
        detalhe: 'Por isso ele não doura: sem superfície seca acima de 140 °C, não há reação de Maillard.',
        engano: 'Não "cozinha de dentro para fora". As ondas penetram poucos centímetros; o centro de peças grandes cozinha por condução, como em qualquer forno.' },
    geloflutua: { nome: 'Por que o gelo flutua', area: 'casa',
        resposta: 'Ao congelar, as moléculas de água se arrumam numa estrutura com mais espaço vazio. O gelo ocupa cerca de 9% mais volume que a água líquida — logo, é menos denso.',
        detalhe: 'Quase toda substância faz o contrário: sólida, afunda na própria versão líquida. A água é a exceção rara.',
        engano: 'Não é "ar preso no gelo". Gelo transparente, sem bolha nenhuma, flutua igual.' },
    panelaqueima: { nome: 'Por que o cabo de metal queima e o de madeira não', area: 'casa',
        resposta: 'Metal conduz calor muito rápido; madeira e plástico, muito devagar. Os dois estão na mesma temperatura, mas o metal entrega o calor à sua mão numa fração do tempo.',
        detalhe: 'É o mesmo motivo pelo qual piso frio "parece" mais gelado que o tapete ao lado, estando ambos na temperatura do quarto.',
        engano: 'Não é que o metal esteja "mais quente": temperatura é igual, a velocidade de transferência é que muda.' },

    // ── Animais ──
    catoscaem: { nome: 'Por que o gato cai sempre de pé', area: 'animais',
        resposta: 'O gato tem uma coluna muito flexível e nenhuma clavícula rígida. Ele gira a frente do corpo para um lado e a traseira para o outro, e depois inverte — sem precisar de apoio externo.',
        detalhe: 'Precisa de mais ou menos meio metro de queda para completar a manobra.',
        engano: 'Cair de pé não significa cair ileso: queda de altura quebra patas e mandíbula com frequência. Tela em janela existe por isso.' },
    caoabana: { nome: 'Por que o cachorro abana o rabo', area: 'animais',
        resposta: 'É comunicação, não emoção automática. Rabo alto e rígido é tensão; baixo e solto é submissão; movimento amplo e frouxo com corpo relaxado é o que costuma significar alegria.',
        detalhe: 'Estudos indicam que a abanada puxa mais para a direita em situações positivas e para a esquerda nas negativas.',
        engano: '"Abanando o rabo" não é sinônimo de "pode fazer carinho". Muita mordida acontece exatamente aí.' },
    passarofio: { nome: 'Por que passarinho não leva choque no fio', area: 'animais',
        resposta: 'Corrente elétrica precisa de uma diferença de potencial para atravessar algo. Com as duas patas no mesmo fio, o passarinho tem o mesmo potencial dos dois lados — não há por onde a corrente passar.',
        detalhe: 'Se ele encostar num segundo fio, ou num poste aterrado, aí sim leva o choque. É o que mata aves de asa grande.',
        engano: 'Não é a pena que isola nem o tamanho do bicho: é a ausência de diferença de potencial entre os pés.' },
    baratacostas: { nome: 'Por que barata morre de costas', area: 'animais',
        resposta: 'Inseticida ataca o sistema nervoso e provoca espasmos que a viram. Com o corpo redondo, patas curtas e sem controle muscular, ela não consegue se desvirar.',
        detalhe: 'Barata saudável cai de costas e se vira em um segundo.',
        engano: 'Não é "posição de morte" nem instinto: é efeito colateral do veneno, e por isso barata morta de causa natural nem sempre está de costas.' },
    peixedorme: { nome: 'Por que peixe não fecha o olho', area: 'animais',
        resposta: 'Peixe não tem pálpebra: vivendo dentro d\'água, não precisa de nada para manter o olho úmido nem para tirar poeira.',
        detalhe: 'Eles descansam, sim — reduzem atividade e metabolismo — mas de olho aberto.',
        engano: 'Olho aberto não quer dizer acordado. Peixe parado num canto do aquário provavelmente está descansando.' },
    mosquitoprefere: { nome: 'Por que o mosquito prefere algumas pessoas', area: 'animais',
        resposta: 'Ele localiza pelo gás carbônico exalado, pelo calor do corpo e por compostos do suor e das bactérias da pele. Tudo isso varia de pessoa para pessoa.',
        detalhe: 'Tipo sanguíneo, grávidas e quem bebeu cerveja aparecem em estudos como mais atrativos. Roupa escura ajuda o mosquito a te achar.',
        engano: '"Sangue doce" não existe: açúcar no sangue não é o que ele detecta, e nem a picada chega a "provar" antes de escolher.' }
}

const AREAS = {
    corpo: { nome: 'O corpo', emoji: '🧍' },
    cozinha: { nome: 'A cozinha', emoji: '🍳' },
    natureza: { nome: 'A natureza', emoji: '🌍' },
    casa: { nome: 'A casa e as coisas', emoji: '🏠' },
    animais: { nome: 'Os animais', emoji: '🐾' }
}

function porArea(area) {
    const a = String(area || '').toLowerCase()
    return Object.entries(FENOMENOS).filter(([, f]) => f.area === a).map(([chave, f]) => ({ chave, ...f }))
}

function sortear() {
    const chaves = Object.keys(FENOMENOS)
    const k = chaves[Math.floor(Math.random() * chaves.length)]
    return { chave: k, ...FENOMENOS[k] }
}

function procurar(termo) {
    const t = String(termo || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    if (!t) return []
    return Object.entries(FENOMENOS)
        .filter(([chave, f]) => (JSON.stringify(f) + chave).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(t))
        .map(([chave, f]) => ({ tipo: 'porque', chave, nome: f.nome }))
}

module.exports = { FENOMENOS, AREAS, porArea, sortear, procurar }
