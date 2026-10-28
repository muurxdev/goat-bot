/**
 * Literatura brasileira: escolas, autores e obras.
 *
 * O campo que justifica cada ficha é o `entrada`: por onde começar naquele
 * autor ou naquela escola. Lista de nomes e datas qualquer busca entrega;
 * o que falta a quem quer ler é saber qual livro abrir primeiro sem desistir
 * na página vinte.
 *
 * Datas de escola são aproximadas por natureza — movimento literário não
 * começa numa terça-feira. Onde a periodização é disputada, a ficha diz.
 */

const ESCOLAS = {
    barroco: { nome: 'Barroco', inicio: 1601, fim: 1768, marco: 'Prosopopeia, de Bento Teixeira',
        traco: 'Tensão entre o sagrado e o profano, entre a carne e o espírito. Linguagem rebuscada, cheia de antíteses e paradoxos.',
        contexto: 'Contrarreforma e sociedade colonial açucareira. A dúvida religiosa era o tema porque era o conflito real da época.',
        autores: 'Gregório de Matos, Padre Antônio Vieira',
        entrada: 'Os sermões de Vieira, especialmente o Sermão de Santo Antônio aos Peixes: é retórica de altíssimo nível e ainda por cima uma crítica social afiada.' },
    arcadismo: { nome: 'Arcadismo', inicio: 1768, fim: 1836, marco: 'Obras Poéticas, de Cláudio Manuel da Costa',
        traco: 'Reação ao excesso barroco: simplicidade, natureza idealizada, vida pastoril. O lema era fugir da cidade.',
        contexto: 'Iluminismo e ciclo do ouro em Minas. Vários árcades participaram da Inconfidência Mineira.',
        autores: 'Tomás Antônio Gonzaga, Cláudio Manuel da Costa, Basílio da Gama',
        entrada: 'Marília de Dirceu, de Gonzaga: poemas de amor escritos em parte na prisão, o que dá outra camada ao pastoril.' },
    romantismo: { nome: 'Romantismo', inicio: 1836, fim: 1881, marco: 'Suspiros Poéticos e Saudades, de Gonçalves de Magalhães',
        traco: 'Subjetividade, idealização, nacionalismo. Em três gerações: indianista, ultrarromântica ("mal do século") e condoreira (social).',
        contexto: 'Brasil recém-independente construindo uma identidade nacional — daí o índio como herói fundador.',
        autores: 'José de Alencar, Gonçalves Dias, Álvares de Azevedo, Castro Alves',
        entrada: 'Iracema, de Alencar: curto, e a prosa poética mostra o projeto do movimento inteiro em cem páginas.' },
    realismo: { nome: 'Realismo e Naturalismo', inicio: 1881, fim: 1902, marco: 'Memórias Póstumas de Brás Cubas e O Mulato',
        traco: 'Oposto do Romantismo: objetividade, análise, crítica social. O Naturalismo radicaliza com determinismo biológico.',
        contexto: 'Fim do Império, crise da escravidão, positivismo e cientificismo em alta.',
        autores: 'Machado de Assis, Aluísio Azevedo, Raul Pompeia',
        entrada: 'Memórias Póstumas de Brás Cubas: capítulos curtíssimos, narrador defunto e ironia moderna. Não parece de 1881.' },
    parnasianismo: { nome: 'Parnasianismo', inicio: 1882, fim: 1893, marco: 'Fanfarras, de Teófilo Dias',
        traco: 'Culto à forma: soneto perfeito, rima rica, vocabulário raro. "Arte pela arte", sem confissão pessoal.',
        contexto: 'Contemporâneo do Realismo, com o mesmo apreço pela objetividade — mas na poesia.',
        autores: 'Olavo Bilac, Alberto de Oliveira, Raimundo Correia',
        entrada: 'Via Láctea, de Bilac, e o soneto "Profissão de fé", que é o manifesto do movimento em forma de poema.' },
    simbolismo: { nome: 'Simbolismo', inicio: 1893, fim: 1910, marco: 'Missal e Broquéis, de Cruz e Sousa',
        traco: 'Musicalidade, sinestesia, mistério. Volta ao subjetivo, mas sem o sentimentalismo romântico.',
        contexto: 'Ficou à margem no Brasil, ofuscado pelo Parnasianismo, e só foi reconhecido depois pelos modernistas.',
        autores: 'Cruz e Sousa, Alphonsus de Guimaraens',
        entrada: 'Broquéis, de Cruz e Sousa: filho de escravizados alforriados, escreveu a poesia mais musical da língua no período.' },
    premodernismo: { nome: 'Pré-Modernismo', inicio: 1902, fim: 1922, marco: 'Os Sertões, de Euclides da Cunha',
        traco: 'Não é uma escola, é um período de transição. O que une os autores é olhar para o Brasil real, fora do salão.',
        contexto: 'República Velha, Canudos, Revolta da Vacina. O país que a literatura oficial não via.',
        autores: 'Euclides da Cunha, Lima Barreto, Monteiro Lobato, Augusto dos Anjos',
        entrada: 'Triste Fim de Policarpo Quaresma, de Lima Barreto: sátira do nacionalismo ingênuo, e uma leitura muito mais fácil que Os Sertões.' },
    modernismo1: { nome: 'Modernismo — 1ª fase', inicio: 1922, fim: 1930, marco: 'Semana de Arte Moderna',
        traco: 'Fase heroica e destruidora: verso livre, linguagem coloquial, humor, ruptura com o academicismo.',
        contexto: 'Manifestos, revistas e polêmica. Antropofagia: engolir a cultura estrangeira e devolvê-la brasileira.',
        autores: 'Mário de Andrade, Oswald de Andrade, Manuel Bandeira',
        entrada: 'Macunaíma, de Mário de Andrade: caótico de propósito, engraçado, e o retrato mais ambicioso do país já tentado.' },
    modernismo2: { nome: 'Modernismo — 2ª fase', inicio: 1930, fim: 1945, marco: 'A Bagaceira, de José Américo',
        traco: 'Fase de construção: romance social e regionalista, poesia madura. Menos manifesto, mais obra.',
        contexto: 'Era Vargas, crise de 1929, seca no Nordeste. A literatura vira documento e denúncia.',
        autores: 'Graciliano Ramos, Rachel de Queiroz, Jorge Amado, Carlos Drummond de Andrade, Cecília Meireles',
        entrada: 'Vidas Secas, de Graciliano: prosa seca como o assunto, capítulos independentes, e o cachorro Baleia — um dos personagens mais lembrados da literatura brasileira.' },
    modernismo3: { nome: 'Modernismo — 3ª fase', inicio: 1945, fim: 1960, marco: 'Geração de 45',
        traco: 'Rigor formal na poesia e experimentação radical na prosa. Reação ao coloquialismo da primeira fase.',
        contexto: 'Pós-guerra e redemocratização. Universidade e crítica literária se profissionalizam.',
        autores: 'João Cabral de Melo Neto, Guimarães Rosa, Clarice Lispector',
        entrada: 'Morte e Vida Severina, de João Cabral: peça em versos, curta, e das poucas obras difíceis que se lê de uma sentada.' },
    contemporanea: { nome: 'Literatura contemporânea', inicio: 1960, fim: null, marco: 'sem marco único',
        traco: 'Pluralidade sem escola dominante: crônica, conto urbano, literatura marginal, autoficção, vozes antes ausentes do cânone.',
        contexto: 'Ditadura e censura, redemocratização, internet. O acesso à publicação mudou quem escreve.',
        autores: 'Rubem Fonseca, Conceição Evaristo, Ferréz, Milton Hatoum, Ana Maria Machado',
        entrada: 'Olhos d\'Água, de Conceição Evaristo: contos curtos e certeiros, e um lugar de fala que a literatura brasileira demorou um século para abrir.' }
}

const AUTORES = {
    machado: { nome: 'Machado de Assis', viveu: '1839-1908', escola: 'realismo',
        oquefez: 'Escreveu nove romances e mais de duzentos contos. Fundou e presidiu a Academia Brasileira de Letras.',
        estilo: 'Ironia, narrador não confiável e digressão. Fala com o leitor no meio da história e o acusa de não estar prestando atenção.',
        comece: 'Memórias Póstumas de Brás Cubas. Se achar denso, comece pelos contos: "A Cartomante" e "Missa do Galo".',
        curiosidade: 'Neto de escravizados alforriados, epilético e gago. Virou o maior nome da literatura brasileira num país que o excluía por origem.' },
    alencar: { nome: 'José de Alencar', viveu: '1829-1877', escola: 'romantismo',
        oquefez: 'Criou o romance brasileiro em várias frentes: indianista, urbano, regional e histórico.',
        estilo: 'Prosa poética, natureza como personagem, projeto declarado de fundar uma literatura nacional.',
        comece: 'Iracema, pela extensão e pela prosa. Senhora, se preferir crítica social urbana.',
        curiosidade: 'Foi ministro da Justiça e defendeu a escravidão em textos políticos — contradição que a crítica moderna não deixa passar em branco.' },
    castroalves: { nome: 'Castro Alves', viveu: '1847-1871', escola: 'romantismo',
        oquefez: 'Poeta condoreiro, chamado "o poeta dos escravos" pela poesia abolicionista.',
        estilo: 'Poesia de tribuna, feita para ser declamada em praça. Imagens grandiosas e ritmo de discurso.',
        comece: '"O Navio Negreiro". É longo, mas foi escrito para ser ouvido — leia em voz alta.',
        curiosidade: 'Morreu aos 24 anos, de tuberculose, depois de perder um pé num acidente com arma.' },
    aluisio: { nome: 'Aluísio Azevedo', viveu: '1857-1913', escola: 'realismo',
        oquefez: 'Trouxe o Naturalismo ao Brasil com O Mulato e escreveu O Cortiço.',
        estilo: 'Determinismo: o meio molda o indivíduo. O cortiço é quase um personagem coletivo.',
        comece: 'O Cortiço. É o romance que mostra melhor o método naturalista, e lê rápido.',
        curiosidade: 'Abandonou a literatura em 1895 para ser diplomata e nunca mais publicou ficção.' },
    euclides: { nome: 'Euclides da Cunha', viveu: '1866-1909', escola: 'premodernismo',
        oquefez: 'Escreveu Os Sertões, sobre a Guerra de Canudos, que ele cobriu como correspondente.',
        estilo: 'Vocabulário científico e sintaxe difícil. Livro dividido em terra, homem e luta.',
        comece: 'A terceira parte, "A Luta", se as duas primeiras travarem. É o relato da guerra e prende mais.',
        curiosidade: 'Foi para Canudos convencido de que os sertanejos eram monarquistas fanáticos. Voltou denunciando um crime do Estado.' },
    limabarreto: { nome: 'Lima Barreto', viveu: '1881-1922', escola: 'premodernismo',
        oquefez: 'Escreveu sobre os subúrbios cariocas e o racismo da República, décadas antes de isso ser tema aceito.',
        estilo: 'Linguagem simples e direta por escolha política, contra o rebuscamento da elite letrada.',
        comece: 'Triste Fim de Policarpo Quaresma. Engraçado e devastador ao mesmo tempo.',
        curiosidade: 'Negro, pobre e alcoolista, foi rejeitado três vezes pela Academia Brasileira de Letras. Hoje é leitura obrigatória em vestibular.' },
    marioandrade: { nome: 'Mário de Andrade', viveu: '1893-1945', escola: 'modernismo1',
        oquefez: 'Organizou a Semana de 22, escreveu Macunaíma e Paulicéia Desvairada, e fundou a política de patrimônio cultural do país.',
        estilo: 'Português brasileiro assumido, incorporação de folclore e fala popular.',
        comece: 'Paulicéia Desvairada, se quiser poesia. Macunaíma exige paciência com o caos, mas recompensa.',
        curiosidade: 'Percorreu o país registrando música e cultura popular; boa parte do que se sabe hoje sobre folclore brasileiro passou pelas fichas dele.' },
    oswald: { nome: 'Oswald de Andrade', viveu: '1890-1954', escola: 'modernismo1',
        oquefez: 'Escreveu o Manifesto Antropófago e o Manifesto da Poesia Pau-Brasil.',
        estilo: 'Poema-piada, síntese extrema, montagem. Poesia de quatro versos que derruba um monumento.',
        comece: 'Os manifestos, que são curtos e ainda hoje provocam. Depois, Memórias Sentimentais de João Miramar.',
        curiosidade: 'A frase "Tupi or not tupi, that is the question" resume o projeto antropofágico: engolir o europeu e devolvê-lo brasileiro.' },
    drummond: { nome: 'Carlos Drummond de Andrade', viveu: '1902-1987', escola: 'modernismo2',
        oquefez: 'O poeta brasileiro mais lido do século XX, com mais de vinte livros de poesia e milhares de crônicas.',
        estilo: 'Ironia contida, cotidiano e uma melancolia sem drama. O "gauche" que observa de lado.',
        comece: '"No meio do caminho" e "José". Depois, a antologia Reunião ou Alguma Poesia.',
        curiosidade: 'Trabalhou trinta anos como funcionário público no Ministério da Educação, escrevendo poesia nas horas vagas.' },
    bandeira: { nome: 'Manuel Bandeira', viveu: '1886-1968', escola: 'modernismo1',
        oquefez: 'Ponte entre o Parnasianismo e o Modernismo. Escreveu Libertinagem e Estrela da Manhã.',
        estilo: 'Simplicidade trabalhada, humor e a morte tratada sem solenidade.',
        comece: '"Vou-me embora pra Pasárgada" e "Poética". Poemas curtos, entrada fácil no Modernismo.',
        curiosidade: 'Diagnosticado com tuberculose aos 18 anos, foi mandado para casa para morrer. Viveu mais 64 anos.' },
    cecilia: { nome: 'Cecília Meireles', viveu: '1901-1964', escola: 'modernismo2',
        oquefez: 'Poeta, professora e jornalista. Escreveu Romanceiro da Inconfidência e obra infantil pioneira.',
        estilo: 'Musicalidade quase simbolista, temas do tempo e da transitoriedade.',
        comece: '"Motivo" e "Retrato". Para fôlego maior, o Romanceiro da Inconfidência.',
        curiosidade: 'Foi das primeiras a levar a sério a literatura infantil no Brasil, num tempo em que o gênero era desprezado.' },
    graciliano: { nome: 'Graciliano Ramos', viveu: '1892-1953', escola: 'modernismo2',
        oquefez: 'Escreveu Vidas Secas, São Bernardo, Angústia e Memórias do Cárcere.',
        estilo: 'A prosa mais econômica da língua. Cortava adjetivo como quem corta gordura.',
        comece: 'Vidas Secas. Capítulos independentes, cada um lê como conto.',
        curiosidade: 'Foi preso pela ditadura Vargas sem acusação formal. Memórias do Cárcere, escrito depois, é dos maiores relatos de prisão da língua portuguesa.' },
    jorgeamado: { nome: 'Jorge Amado', viveu: '1912-2001', escola: 'modernismo2',
        oquefez: 'O autor brasileiro mais traduzido do mundo, com Gabriela, Dona Flor e Capitães da Areia.',
        estilo: 'Sensualidade, humor e a Bahia popular. Fase inicial de denúncia social, depois mais festiva.',
        comece: 'Capitães da Areia, se quiser o Amado social. Gabriela, se quiser o Amado do prazer.',
        curiosidade: 'Teve livros queimados em praça pública em 1937 e exílio por militância comunista.' },
    guimaraes: { nome: 'Guimarães Rosa', viveu: '1908-1967', escola: 'modernismo3',
        oquefez: 'Escreveu Grande Sertão: Veredas e Sagarana, reinventando a língua a partir do falar sertanejo.',
        estilo: 'Cria palavras, inverte sintaxe, mistura erudito e popular. Exige entrega, devolve outra língua.',
        comece: 'NÃO comece por Grande Sertão. Comece pelos contos de Sagarana ou Primeiras Estórias — "A Terceira Margem do Rio" tem cinco páginas.',
        curiosidade: 'Era médico e diplomata. Falava e estudava dezenas de idiomas, e anotava vocabulário sertanejo em cadernos durante viagens a cavalo.' },
    clarice: { nome: 'Clarice Lispector', viveu: '1920-1977', escola: 'modernismo3',
        oquefez: 'Escreveu A Paixão Segundo G.H., A Hora da Estrela, Laços de Família e crônicas.',
        estilo: 'Fluxo de consciência, epifania no banal. O enredo importa menos que o instante de percepção.',
        comece: 'A Hora da Estrela, que é curto e tem enredo. Ou os contos de Laços de Família.',
        curiosidade: 'Nasceu na Ucrânia e chegou ao Brasil com menos de dois anos. Dizia que o sotaque era da língua presa, não da origem.' },
    joaocabral: { nome: 'João Cabral de Melo Neto', viveu: '1920-1999', escola: 'modernismo3',
        oquefez: 'Escreveu Morte e Vida Severina e A Educação pela Pedra.',
        estilo: 'Antilírico e rigoroso. Chamado de "o engenheiro" pela construção geométrica do verso.',
        comece: 'Morte e Vida Severina: auto de Natal pernambucano, em versos, que lê como narrativa.',
        curiosidade: 'Dizia detestar música e não sentir emoção ao escrever. Fez a poesia mais rigorosamente construída da língua.' },
    rachel: { nome: 'Rachel de Queiroz', viveu: '1910-2003', escola: 'modernismo2',
        oquefez: 'Publicou O Quinze aos 19 anos e foi a primeira mulher na Academia Brasileira de Letras.',
        estilo: 'Prosa direta sobre a seca e o papel da mulher no Nordeste, sem sentimentalismo.',
        comece: 'O Quinze. Curto e é o romance que abriu o regionalismo de 30.',
        curiosidade: 'A crítica da época não acreditou que uma jovem de 19 anos tivesse escrito o livro sozinha.' },
    carolina: { nome: 'Carolina Maria de Jesus', viveu: '1914-1977', escola: 'contemporanea',
        oquefez: 'Escreveu Quarto de Despejo, diário da vida na favela do Canindé, traduzido para dezenas de idiomas.',
        estilo: 'Diário cru, sem mediação. A gramática irregular é parte do documento, não defeito.',
        comece: 'Quarto de Despejo. Não há preparação possível: é para ser lido como foi escrito.',
        curiosidade: 'Catadora de papel com dois anos de escola. Vendeu quase um milhão de exemplares e morreu na pobreza.' },
    conceicao: { nome: 'Conceição Evaristo', viveu: '1946-', escola: 'contemporanea',
        oquefez: 'Escreveu Becos da Memória, Ponciá Vicêncio e Olhos d\'Água. Cunhou o conceito de "escrevivência".',
        estilo: 'Memória, oralidade e experiência negra e feminina como matéria e como método.',
        comece: 'Olhos d\'Água: contos curtos, e cada um encerra sozinho.',
        curiosidade: 'Foi empregada doméstica, formou-se professora aos 25 e doutora aos 65. Publicou o primeiro romance depois dos 50.' },
    rubemfonseca: { nome: 'Rubem Fonseca', viveu: '1925-2020', escola: 'contemporanea',
        oquefez: 'Escreveu Feliz Ano Novo e A Grande Arte, criando o conto urbano violento no Brasil.',
        estilo: 'Frase curta, diálogo seco, violência sem estetização. Vinha do cinema e da polícia.',
        comece: 'Os contos de Feliz Ano Novo — livro proibido pela censura em 1976, o que diz bastante sobre o impacto.',
        curiosidade: 'Foi comissário de polícia antes de escrever, o que explica a precisão do vocabulário e do procedimento nos contos.' }
}

const OBRAS = {
    brascubas: { titulo: 'Memórias Póstumas de Brás Cubas', autor: 'machado', ano: 1881, paginas: 200, dificuldade: 'média',
        oquee: 'Um defunto conta a própria vida, sem compromisso com a reputação porque já morreu.',
        porque: 'Inaugura o Realismo brasileiro e antecipa recursos que o modernismo europeu só usaria décadas depois.',
        dica: 'São 160 capítulos em 200 páginas: leia em blocos curtos. O narrador provoca o leitor de propósito.' },
    domcasmurro: { titulo: 'Dom Casmurro', autor: 'machado', ano: 1899, paginas: 220, dificuldade: 'média',
        oquee: 'Bentinho conta como perdeu Capitu. A questão é se ele é confiável.',
        porque: 'A traição de Capitu nunca é provada no texto: é o narrador ciumento que a afirma. Isso muda tudo.',
        dica: 'Repare em quem está contando. O livro não é sobre traição, é sobre a versão de quem narra.' },
    ocortico: { titulo: 'O Cortiço', autor: 'aluisio', ano: 1890, paginas: 250, dificuldade: 'fácil',
        oquee: 'A vida de um cortiço carioca e a ascensão de um português explorador.',
        porque: 'É o retrato mais completo do método naturalista no Brasil.',
        dica: 'O cortiço cresce como um organismo. Repare que o ambiente é tratado como personagem.' },
    ossertoes: { titulo: 'Os Sertões', autor: 'euclides', ano: 1902, paginas: 600, dificuldade: 'difícil',
        oquee: 'Relato da Guerra de Canudos em três partes: a terra, o homem e a luta.',
        porque: 'Documento e denúncia. Mudou a forma como o Brasil se enxergava.',
        dica: 'Se travar nas duas primeiras partes, vá direto para "A Luta" e volte depois.' },
    policarpo: { titulo: 'Triste Fim de Policarpo Quaresma', autor: 'limabarreto', ano: 1915, paginas: 200, dificuldade: 'fácil',
        oquee: 'Um patriota fanático tenta salvar o Brasil e é destruído pelo país que ama.',
        porque: 'Sátira do nacionalismo vazio da República Velha, ainda atual em cada página.',
        dica: 'É engraçado até deixar de ser. O final justifica o título.' },
    macunaima: { titulo: 'Macunaíma', autor: 'marioandrade', ano: 1928, paginas: 200, dificuldade: 'difícil',
        oquee: 'A rapsódia de um herói sem nenhum caráter que atravessa o Brasil inteiro.',
        porque: 'Tentativa mais ambiciosa de sintetizar o país num personagem só.',
        dica: 'Não procure enredo linear: é colagem de lendas de vários povos. Leia como quem ouve causo.' },
    vidassecas: { titulo: 'Vidas Secas', autor: 'graciliano', ano: 1938, paginas: 130, dificuldade: 'fácil',
        oquee: 'Uma família de retirantes atravessa a seca do sertão.',
        porque: 'A prosa mais econômica da literatura brasileira, e o retrato definitivo da seca.',
        dica: 'Os capítulos são independentes e podem ser lidos fora de ordem. O da cachorra Baleia costuma marcar quem lê.' },
    capitaesareia: { titulo: 'Capitães da Areia', autor: 'jorgeamado', ano: 1937, paginas: 280, dificuldade: 'fácil',
        oquee: 'Um grupo de meninos abandonados sobrevive nas ruas de Salvador.',
        porque: 'Denúncia social que continua sendo o Amado mais lido por jovens.',
        dica: 'Cada capítulo se concentra num menino. É a porta de entrada mais fácil no autor.' },
    grandesertao: { titulo: 'Grande Sertão: Veredas', autor: 'guimaraes', ano: 1956, paginas: 600, dificuldade: 'muito difícil',
        oquee: 'Riobaldo narra sua vida de jagunço, o pacto com o diabo e o amor por Diadorim.',
        porque: 'Considerado o maior romance da literatura brasileira. Reinventa a língua.',
        dica: 'Leia em voz alta quando travar: a sintaxe é oral e faz sentido no ouvido antes de fazer no olho. E não comece por ele.' },
    horadaestrela: { titulo: 'A Hora da Estrela', autor: 'clarice', ano: 1977, paginas: 90, dificuldade: 'média',
        oquee: 'Um narrador escritor conta a história de Macabéa, migrante nordestina invisível no Rio.',
        porque: 'Último livro de Clarice e o mais acessível: tem enredo, o que é raro nela.',
        dica: 'Repare no narrador se metendo na narrativa. Ele é parte do assunto.' },
    morteevida: { titulo: 'Morte e Vida Severina', autor: 'joaocabral', ano: 1955, paginas: 70, dificuldade: 'média',
        oquee: 'Um retirante desce o rio Capibaribe fugindo da seca, encontrando morte a cada parada.',
        porque: 'Auto de Natal pernambucano em versos, que virou peça, disco e filme.',
        dica: 'Curto e narrativo. Uma das poucas obras difíceis que se lê de uma sentada.' },
    quartodespejo: { titulo: 'Quarto de Despejo', autor: 'carolina', ano: 1960, paginas: 180, dificuldade: 'fácil',
        oquee: 'Diário real de uma catadora de papel na favela do Canindé, em São Paulo.',
        porque: 'Documento de primeira mão sobre a fome, escrito por quem a vivia.',
        dica: 'A gramática irregular é parte do documento. Corrigi-la seria apagar quem escreveu.' },
    iracema: { titulo: 'Iracema', autor: 'alencar', ano: 1865, paginas: 130, dificuldade: 'fácil',
        oquee: 'A lenda da índia tabajara e do colonizador português, fundando o Ceará.',
        porque: 'Mostra o projeto indianista inteiro em pouca página, com prosa quase poética.',
        dica: 'Iracema é anagrama de América. O livro está cheio desses jogos.' },
    olhosdagua: { titulo: 'Olhos d\'Água', autor: 'conceicao', ano: 2014, paginas: 120, dificuldade: 'fácil',
        oquee: 'Quinze contos sobre mulheres negras, violência e memória.',
        porque: 'Ganhou o Prêmio Jabuti e ajudou a mudar o cânone escolar brasileiro.',
        dica: 'Contos curtos e independentes. Leia um por dia — cada um pede um tempo depois.' },
    saobernardo: { titulo: 'São Bernardo', autor: 'graciliano', ano: 1934, paginas: 180, dificuldade: 'média',
        oquee: 'Paulo Honório conta como construiu uma fazenda e destruiu o próprio casamento.',
        porque: 'Estudo de um homem que trata tudo, inclusive a esposa, como propriedade.',
        dica: 'O narrador é seco porque o personagem é seco. A forma É o conteúdo aqui.' },
    navionegreiro: { titulo: 'O Navio Negreiro', autor: 'castroalves', ano: 1869, paginas: 20, dificuldade: 'fácil',
        oquee: 'Poema sobre um tumbeiro atravessando o Atlântico com pessoas escravizadas no porão.',
        porque: 'O texto abolicionista mais conhecido da literatura brasileira.',
        dica: 'Leia em voz alta. Foi escrito para ser declamado, e o ritmo muda tudo.' }
}

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Autores de uma escola. */
function autoresDe(escola) {
    return Object.entries(AUTORES).filter(([, a]) => a.escola === escola).map(([chave, a]) => ({ chave, ...a }))
}

/** Obras de um autor. */
function obrasDe(autor) {
    return Object.entries(OBRAS).filter(([, o]) => o.autor === autor).map(([chave, o]) => ({ chave, ...o }))
}

/** Escola literária de um ano. */
function escolaDoAno(ano) {
    const a = Number(ano)
    if (!Number.isFinite(a)) return null
    const achadas = Object.entries(ESCOLAS)
        .filter(([, e]) => a >= e.inicio && (e.fim === null || a <= e.fim))
        .map(([chave, e]) => ({ chave, ...e }))
    return achadas.length ? achadas : null
}

/** Roteiro de leitura por tempo disponível e coragem. */
function roteiro(nivel = 'comecando') {
    const n = norm(nivel)
    const trilhas = {
        comecando: {
            nome: 'Começando do zero',
            criterio: 'Curtas, com enredo claro e sem exigir contexto histórico.',
            obras: ['vidassecas', 'policarpo', 'iracema', 'olhosdagua', 'quartodespejo']
        },
        vestibular: {
            nome: 'Foco em vestibular',
            criterio: 'As mais cobradas, com o que costuma cair de cada uma.',
            obras: ['brascubas', 'domcasmurro', 'ocortico', 'vidassecas', 'macunaima', 'iracema']
        },
        desafio: {
            nome: 'Para encarar coisa difícil',
            criterio: 'Obras que exigem entrega e devolvem na mesma medida.',
            obras: ['grandesertao', 'ossertoes', 'macunaima', 'horadaestrela', 'saobernardo']
        },
        curtas: {
            nome: 'Menos de 150 páginas',
            criterio: 'Para quem tem pouco tempo e quer terminar o que começa.',
            obras: ['morteevida', 'horadaestrela', 'vidassecas', 'iracema', 'olhosdagua', 'navionegreiro']
        }
    }
    const t = trilhas[n] || trilhas.comecando
    return { ...t, chave: trilhas[n] ? n : 'comecando', lista: t.obras.map(k => ({ chave: k, ...OBRAS[k] })), disponiveis: Object.keys(trilhas) }
}

function procurar(termo) {
    const t = norm(termo)
    if (!t) return []
    const achados = []
    for (const [chave, e] of Object.entries(ESCOLAS)) if (norm(JSON.stringify(e) + chave).includes(t)) achados.push({ tipo: 'escola', chave, nome: e.nome })
    for (const [chave, a] of Object.entries(AUTORES)) if (norm(JSON.stringify(a) + chave).includes(t)) achados.push({ tipo: 'autor', chave, nome: a.nome })
    for (const [chave, o] of Object.entries(OBRAS)) if (norm(JSON.stringify(o) + chave).includes(t)) achados.push({ tipo: 'obra', chave, nome: o.titulo })
    return achados
}

module.exports = { ESCOLAS, AUTORES, OBRAS, autoresDe, obrasDe, escolaDoAno, roteiro, procurar }
