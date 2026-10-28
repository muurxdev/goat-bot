/**
 * Conhecimento geral — catálogos factuais para consulta.
 *
 * Tudo aqui é local e estático: responde na hora, sem depender de rede, e não
 * inventa. Os dados escolhidos são os ESTÁVEIS — capital, símbolo químico,
 * número atômico, moeda. População muda todo ano, então aparece arredondada e
 * marcada como aproximada, em vez de fingir precisão que o catálogo não tem.
 */

/**
 * Países, com os dados que não mudam de um ano para o outro.
 * `pop` é em milhões e APROXIMADA — serve para ordem de grandeza, não para
 * citar em trabalho escolar.
 */
const PAISES = {
    brasil: { nome: 'Brasil', capital: 'Brasília', continente: 'América do Sul', idioma: 'Português', moeda: 'Real (BRL)', pop: 215, area: 8515767, iso: 'BR' },
    argentina: { nome: 'Argentina', capital: 'Buenos Aires', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Peso argentino (ARS)', pop: 46, area: 2780400, iso: 'AR' },
    chile: { nome: 'Chile', capital: 'Santiago', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Peso chileno (CLP)', pop: 19, area: 756102, iso: 'CL' },
    uruguai: { nome: 'Uruguai', capital: 'Montevidéu', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Peso uruguaio (UYU)', pop: 3, area: 176215, iso: 'UY' },
    paraguai: { nome: 'Paraguai', capital: 'Assunção', continente: 'América do Sul', idioma: 'Espanhol e Guarani', moeda: 'Guarani (PYG)', pop: 7, area: 406752, iso: 'PY' },
    bolivia: { nome: 'Bolívia', capital: 'Sucre (constitucional) e La Paz (sede)', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Boliviano (BOB)', pop: 12, area: 1098581, iso: 'BO' },
    peru: { nome: 'Peru', capital: 'Lima', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Sol (PEN)', pop: 34, area: 1285216, iso: 'PE' },
    colombia: { nome: 'Colômbia', capital: 'Bogotá', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Peso colombiano (COP)', pop: 52, area: 1141748, iso: 'CO' },
    venezuela: { nome: 'Venezuela', capital: 'Caracas', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Bolívar (VES)', pop: 28, area: 916445, iso: 'VE' },
    equador: { nome: 'Equador', capital: 'Quito', continente: 'América do Sul', idioma: 'Espanhol', moeda: 'Dólar americano (USD)', pop: 18, area: 283561, iso: 'EC' },

    eua: { nome: 'Estados Unidos', capital: 'Washington, D.C.', continente: 'América do Norte', idioma: 'Inglês', moeda: 'Dólar (USD)', pop: 335, area: 9833520, iso: 'US' },
    canada: { nome: 'Canadá', capital: 'Ottawa', continente: 'América do Norte', idioma: 'Inglês e Francês', moeda: 'Dólar canadense (CAD)', pop: 39, area: 9984670, iso: 'CA' },
    mexico: { nome: 'México', capital: 'Cidade do México', continente: 'América do Norte', idioma: 'Espanhol', moeda: 'Peso mexicano (MXN)', pop: 128, area: 1964375, iso: 'MX' },
    cuba: { nome: 'Cuba', capital: 'Havana', continente: 'América Central', idioma: 'Espanhol', moeda: 'Peso cubano (CUP)', pop: 11, area: 109884, iso: 'CU' },

    portugal: { nome: 'Portugal', capital: 'Lisboa', continente: 'Europa', idioma: 'Português', moeda: 'Euro (EUR)', pop: 10, area: 92212, iso: 'PT' },
    espanha: { nome: 'Espanha', capital: 'Madri', continente: 'Europa', idioma: 'Espanhol', moeda: 'Euro (EUR)', pop: 48, area: 505992, iso: 'ES' },
    franca: { nome: 'França', capital: 'Paris', continente: 'Europa', idioma: 'Francês', moeda: 'Euro (EUR)', pop: 68, area: 551695, iso: 'FR' },
    italia: { nome: 'Itália', capital: 'Roma', continente: 'Europa', idioma: 'Italiano', moeda: 'Euro (EUR)', pop: 59, area: 301340, iso: 'IT' },
    alemanha: { nome: 'Alemanha', capital: 'Berlim', continente: 'Europa', idioma: 'Alemão', moeda: 'Euro (EUR)', pop: 83, area: 357588, iso: 'DE' },
    reinounido: { nome: 'Reino Unido', capital: 'Londres', continente: 'Europa', idioma: 'Inglês', moeda: 'Libra esterlina (GBP)', pop: 67, area: 243610, iso: 'GB' },
    irlanda: { nome: 'Irlanda', capital: 'Dublin', continente: 'Europa', idioma: 'Inglês e Irlandês', moeda: 'Euro (EUR)', pop: 5, area: 70273, iso: 'IE' },
    holanda: { nome: 'Países Baixos', capital: 'Amsterdã', continente: 'Europa', idioma: 'Neerlandês', moeda: 'Euro (EUR)', pop: 18, area: 41850, iso: 'NL' },
    belgica: { nome: 'Bélgica', capital: 'Bruxelas', continente: 'Europa', idioma: 'Neerlandês, Francês e Alemão', moeda: 'Euro (EUR)', pop: 12, area: 30528, iso: 'BE' },
    suica: { nome: 'Suíça', capital: 'Berna', continente: 'Europa', idioma: 'Alemão, Francês, Italiano e Romanche', moeda: 'Franco suíço (CHF)', pop: 9, area: 41285, iso: 'CH' },
    austria: { nome: 'Áustria', capital: 'Viena', continente: 'Europa', idioma: 'Alemão', moeda: 'Euro (EUR)', pop: 9, area: 83879, iso: 'AT' },
    suecia: { nome: 'Suécia', capital: 'Estocolmo', continente: 'Europa', idioma: 'Sueco', moeda: 'Coroa sueca (SEK)', pop: 10, area: 450295, iso: 'SE' },
    noruega: { nome: 'Noruega', capital: 'Oslo', continente: 'Europa', idioma: 'Norueguês', moeda: 'Coroa norueguesa (NOK)', pop: 5, area: 385207, iso: 'NO' },
    dinamarca: { nome: 'Dinamarca', capital: 'Copenhague', continente: 'Europa', idioma: 'Dinamarquês', moeda: 'Coroa dinamarquesa (DKK)', pop: 6, area: 42933, iso: 'DK' },
    finlandia: { nome: 'Finlândia', capital: 'Helsinque', continente: 'Europa', idioma: 'Finlandês e Sueco', moeda: 'Euro (EUR)', pop: 6, area: 338455, iso: 'FI' },
    polonia: { nome: 'Polônia', capital: 'Varsóvia', continente: 'Europa', idioma: 'Polonês', moeda: 'Zloty (PLN)', pop: 37, area: 312696, iso: 'PL' },
    grecia: { nome: 'Grécia', capital: 'Atenas', continente: 'Europa', idioma: 'Grego', moeda: 'Euro (EUR)', pop: 10, area: 131957, iso: 'GR' },
    russia: { nome: 'Rússia', capital: 'Moscou', continente: 'Europa e Ásia', idioma: 'Russo', moeda: 'Rublo (RUB)', pop: 144, area: 17098246, iso: 'RU' },
    ucrania: { nome: 'Ucrânia', capital: 'Kiev', continente: 'Europa', idioma: 'Ucraniano', moeda: 'Hryvnia (UAH)', pop: 38, area: 603550, iso: 'UA' },

    japao: { nome: 'Japão', capital: 'Tóquio', continente: 'Ásia', idioma: 'Japonês', moeda: 'Iene (JPY)', pop: 124, area: 377975, iso: 'JP' },
    china: { nome: 'China', capital: 'Pequim', continente: 'Ásia', idioma: 'Mandarim', moeda: 'Yuan (CNY)', pop: 1410, area: 9596961, iso: 'CN' },
    india: { nome: 'Índia', capital: 'Nova Délhi', continente: 'Ásia', idioma: 'Hindi e Inglês', moeda: 'Rupia (INR)', pop: 1430, area: 3287263, iso: 'IN' },
    coreiadosul: { nome: 'Coreia do Sul', capital: 'Seul', continente: 'Ásia', idioma: 'Coreano', moeda: 'Won (KRW)', pop: 52, area: 100210, iso: 'KR' },
    indonesia: { nome: 'Indonésia', capital: 'Jacarta', continente: 'Ásia', idioma: 'Indonésio', moeda: 'Rupia indonésia (IDR)', pop: 278, area: 1904569, iso: 'ID' },
    tailandia: { nome: 'Tailândia', capital: 'Bangkok', continente: 'Ásia', idioma: 'Tailandês', moeda: 'Baht (THB)', pop: 72, area: 513120, iso: 'TH' },
    vietna: { nome: 'Vietnã', capital: 'Hanói', continente: 'Ásia', idioma: 'Vietnamita', moeda: 'Dong (VND)', pop: 99, area: 331212, iso: 'VN' },
    filipinas: { nome: 'Filipinas', capital: 'Manila', continente: 'Ásia', idioma: 'Filipino e Inglês', moeda: 'Peso filipino (PHP)', pop: 117, area: 300000, iso: 'PH' },
    turquia: { nome: 'Turquia', capital: 'Ancara', continente: 'Europa e Ásia', idioma: 'Turco', moeda: 'Lira turca (TRY)', pop: 85, area: 783562, iso: 'TR' },
    israel: { nome: 'Israel', capital: 'Jerusalém (declarada)', continente: 'Ásia', idioma: 'Hebraico e Árabe', moeda: 'Shekel (ILS)', pop: 9, area: 22072, iso: 'IL' },
    arabiasaudita: { nome: 'Arábia Saudita', capital: 'Riade', continente: 'Ásia', idioma: 'Árabe', moeda: 'Rial saudita (SAR)', pop: 36, area: 2149690, iso: 'SA' },

    egito: { nome: 'Egito', capital: 'Cairo', continente: 'África', idioma: 'Árabe', moeda: 'Libra egípcia (EGP)', pop: 111, area: 1001449, iso: 'EG' },
    africadosul: { nome: 'África do Sul', capital: 'Pretória, Cidade do Cabo e Bloemfontein', continente: 'África', idioma: '11 oficiais, incluindo Zulu e Inglês', moeda: 'Rand (ZAR)', pop: 60, area: 1221037, iso: 'ZA' },
    nigeria: { nome: 'Nigéria', capital: 'Abuja', continente: 'África', idioma: 'Inglês', moeda: 'Naira (NGN)', pop: 223, area: 923768, iso: 'NG' },
    marrocos: { nome: 'Marrocos', capital: 'Rabat', continente: 'África', idioma: 'Árabe e Berbere', moeda: 'Dirham (MAD)', pop: 37, area: 446550, iso: 'MA' },
    angola: { nome: 'Angola', capital: 'Luanda', continente: 'África', idioma: 'Português', moeda: 'Kwanza (AOA)', pop: 36, area: 1246700, iso: 'AO' },
    mocambique: { nome: 'Moçambique', capital: 'Maputo', continente: 'África', idioma: 'Português', moeda: 'Metical (MZN)', pop: 33, area: 801590, iso: 'MZ' },
    quenia: { nome: 'Quênia', capital: 'Nairóbi', continente: 'África', idioma: 'Suaíli e Inglês', moeda: 'Xelim queniano (KES)', pop: 55, area: 580367, iso: 'KE' },

    australia: { nome: 'Austrália', capital: 'Camberra', continente: 'Oceania', idioma: 'Inglês', moeda: 'Dólar australiano (AUD)', pop: 27, area: 7692024, iso: 'AU' },
    novazelandia: { nome: 'Nova Zelândia', capital: 'Wellington', continente: 'Oceania', idioma: 'Inglês, Maori', moeda: 'Dólar neozelandês (NZD)', pop: 5, area: 268021, iso: 'NZ' }
}

/**
 * Elementos químicos.
 * Número atômico e símbolo são fatos fixos; a massa aparece arredondada.
 */
const ELEMENTOS = {
    h: { z: 1, simbolo: 'H', nome: 'Hidrogênio', massa: 1.008, categoria: 'Não metal', estado: 'Gasoso', curiosidade: 'O elemento mais abundante do universo.' },
    he: { z: 2, simbolo: 'He', nome: 'Hélio', massa: 4.003, categoria: 'Gás nobre', estado: 'Gasoso', curiosidade: 'Foi descoberto no Sol antes de ser achado na Terra.' },
    li: { z: 3, simbolo: 'Li', nome: 'Lítio', massa: 6.94, categoria: 'Metal alcalino', estado: 'Sólido', curiosidade: 'Base das baterias recarregáveis.' },
    be: { z: 4, simbolo: 'Be', nome: 'Berílio', massa: 9.012, categoria: 'Metal alcalinoterroso', estado: 'Sólido', curiosidade: 'Leve e rígido, usado em aeroespacial.' },
    b: { z: 5, simbolo: 'B', nome: 'Boro', massa: 10.81, categoria: 'Semimetal', estado: 'Sólido', curiosidade: 'Entra no vidro resistente a choque térmico.' },
    c: { z: 6, simbolo: 'C', nome: 'Carbono', massa: 12.011, categoria: 'Não metal', estado: 'Sólido', curiosidade: 'Grafite e diamante são o mesmo elemento em arranjos diferentes.' },
    n: { z: 7, simbolo: 'N', nome: 'Nitrogênio', massa: 14.007, categoria: 'Não metal', estado: 'Gasoso', curiosidade: 'Compõe 78% do ar que você respira.' },
    o: { z: 8, simbolo: 'O', nome: 'Oxigênio', massa: 15.999, categoria: 'Não metal', estado: 'Gasoso', curiosidade: 'Elemento mais abundante da crosta terrestre.' },
    f: { z: 9, simbolo: 'F', nome: 'Flúor', massa: 18.998, categoria: 'Halogênio', estado: 'Gasoso', curiosidade: 'O elemento mais reativo da tabela.' },
    ne: { z: 10, simbolo: 'Ne', nome: 'Neônio', massa: 20.18, categoria: 'Gás nobre', estado: 'Gasoso', curiosidade: 'Dá o brilho alaranjado dos letreiros.' },
    na: { z: 11, simbolo: 'Na', nome: 'Sódio', massa: 22.99, categoria: 'Metal alcalino', estado: 'Sólido', curiosidade: 'Metade do sal de cozinha.' },
    mg: { z: 12, simbolo: 'Mg', nome: 'Magnésio', massa: 24.305, categoria: 'Metal alcalinoterroso', estado: 'Sólido', curiosidade: 'Está no centro da clorofila.' },
    al: { z: 13, simbolo: 'Al', nome: 'Alumínio', massa: 26.982, categoria: 'Metal', estado: 'Sólido', curiosidade: 'Metal mais abundante da crosta.' },
    si: { z: 14, simbolo: 'Si', nome: 'Silício', massa: 28.085, categoria: 'Semimetal', estado: 'Sólido', curiosidade: 'Base de todo chip eletrônico.' },
    p: { z: 15, simbolo: 'P', nome: 'Fósforo', massa: 30.974, categoria: 'Não metal', estado: 'Sólido', curiosidade: 'Essencial no DNA e nos ossos.' },
    s: { z: 16, simbolo: 'S', nome: 'Enxofre', massa: 32.06, categoria: 'Não metal', estado: 'Sólido', curiosidade: 'Responsável pelo cheiro de ovo podre.' },
    cl: { z: 17, simbolo: 'Cl', nome: 'Cloro', massa: 35.45, categoria: 'Halogênio', estado: 'Gasoso', curiosidade: 'A outra metade do sal de cozinha.' },
    ar: { z: 18, simbolo: 'Ar', nome: 'Argônio', massa: 39.948, categoria: 'Gás nobre', estado: 'Gasoso', curiosidade: 'Terceiro gás mais comum no ar.' },
    k: { z: 19, simbolo: 'K', nome: 'Potássio', massa: 39.098, categoria: 'Metal alcalino', estado: 'Sólido', curiosidade: 'O símbolo vem de kalium, do latim.' },
    ca: { z: 20, simbolo: 'Ca', nome: 'Cálcio', massa: 40.078, categoria: 'Metal alcalinoterroso', estado: 'Sólido', curiosidade: 'Estrutura de ossos e dentes.' },
    ti: { z: 22, simbolo: 'Ti', nome: 'Titânio', massa: 47.867, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Resistente como aço e quase metade do peso.' },
    cr: { z: 24, simbolo: 'Cr', nome: 'Cromo', massa: 51.996, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'É o que deixa o aço inoxidável.' },
    mn: { z: 25, simbolo: 'Mn', nome: 'Manganês', massa: 54.938, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Endurece o aço em ligas.' },
    fe: { z: 26, simbolo: 'Fe', nome: 'Ferro', massa: 55.845, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Forma o núcleo da Terra e carrega o oxigênio no sangue.' },
    co: { z: 27, simbolo: 'Co', nome: 'Cobalto', massa: 58.933, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Dá o azul dos vidros e cerâmicas antigas.' },
    ni: { z: 28, simbolo: 'Ni', nome: 'Níquel', massa: 58.693, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Presente em moedas e em baterias.' },
    cu: { z: 29, simbolo: 'Cu', nome: 'Cobre', massa: 63.546, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Um dos primeiros metais trabalhados pelo ser humano.' },
    zn: { z: 30, simbolo: 'Zn', nome: 'Zinco', massa: 65.38, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Protege o ferro da ferrugem na galvanização.' },
    br: { z: 35, simbolo: 'Br', nome: 'Bromo', massa: 79.904, categoria: 'Halogênio', estado: 'Líquido', curiosidade: 'Um dos dois únicos elementos líquidos à temperatura ambiente.' },
    ag: { z: 47, simbolo: 'Ag', nome: 'Prata', massa: 107.868, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'O melhor condutor elétrico que existe.' },
    sn: { z: 50, simbolo: 'Sn', nome: 'Estanho', massa: 118.71, categoria: 'Metal', estado: 'Sólido', curiosidade: 'Com cobre forma o bronze — e uma era inteira.' },
    i: { z: 53, simbolo: 'I', nome: 'Iodo', massa: 126.904, categoria: 'Halogênio', estado: 'Sólido', curiosidade: 'Sublima direto de sólido para vapor violeta.' },
    xe: { z: 54, simbolo: 'Xe', nome: 'Xenônio', massa: 131.293, categoria: 'Gás nobre', estado: 'Gasoso', curiosidade: 'Usado em faróis de alta intensidade.' },
    w: { z: 74, simbolo: 'W', nome: 'Tungstênio', massa: 183.84, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'O maior ponto de fusão entre os metais.' },
    pt: { z: 78, simbolo: 'Pt', nome: 'Platina', massa: 195.084, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Catalisador em escapamentos de carro.' },
    au: { z: 79, simbolo: 'Au', nome: 'Ouro', massa: 196.967, categoria: 'Metal de transição', estado: 'Sólido', curiosidade: 'Não oxida: por isso atravessa milênios intacto.' },
    hg: { z: 80, simbolo: 'Hg', nome: 'Mercúrio', massa: 200.592, categoria: 'Metal de transição', estado: 'Líquido', curiosidade: 'O único metal líquido à temperatura ambiente.' },
    pb: { z: 82, simbolo: 'Pb', nome: 'Chumbo', massa: 207.2, categoria: 'Metal', estado: 'Sólido', curiosidade: 'Barra radiação — e é tóxico para o corpo.' },
    u: { z: 92, simbolo: 'U', nome: 'Urânio', massa: 238.029, categoria: 'Actinídeo', estado: 'Sólido', curiosidade: 'Combustível das usinas nucleares.' }
}

/** Constantes e grandezas que aparecem em toda conta de física. */
const CONSTANTES = {
    luz: { nome: 'Velocidade da luz no vácuo', simbolo: 'c', valor: '299.792.458 m/s', nota: 'Nada com massa alcança essa velocidade.' },
    gravidade: { nome: 'Gravidade na superfície da Terra', simbolo: 'g', valor: '9,80665 m/s²', nota: 'Varia um pouco conforme a latitude e a altitude.' },
    planck: { nome: 'Constante de Planck', simbolo: 'h', valor: '6,626×10⁻³⁴ J·s', nota: 'Define o menor pacote de energia possível.' },
    avogadro: { nome: 'Número de Avogadro', simbolo: 'Nₐ', valor: '6,022×10²³ /mol', nota: 'Quantas partículas cabem em um mol.' },
    gasideal: { nome: 'Constante dos gases', simbolo: 'R', valor: '8,314 J/(mol·K)', nota: 'A do PV = nRT.' },
    zeroabsoluto: { nome: 'Zero absoluto', simbolo: '0 K', valor: '−273,15 °C', nota: 'O limite inferior de temperatura.' },
    som: { nome: 'Velocidade do som no ar', simbolo: '—', valor: '~343 m/s a 20 °C', nota: 'Depende bastante da temperatura.' },
    terra: { nome: 'Raio médio da Terra', simbolo: 'R⊕', valor: '6.371 km', nota: 'A Terra é levemente achatada nos polos.' }
}

/** Sistemas do corpo humano. */
const CORPO = {
    circulatorio: { nome: 'Sistema circulatório', orgaos: 'Coração, artérias, veias e capilares', funcao: 'Levar oxigênio e nutrientes a cada célula e recolher resíduos.', dado: 'O coração bate cerca de 100 mil vezes por dia.' },
    respiratorio: { nome: 'Sistema respiratório', orgaos: 'Nariz, traqueia, brônquios e pulmões', funcao: 'Trocar oxigênio por gás carbônico.', dado: 'Os alvéolos somam uma área comparável à de uma quadra.' },
    digestorio: { nome: 'Sistema digestório', orgaos: 'Boca, esôfago, estômago, intestinos, fígado e pâncreas', funcao: 'Quebrar o alimento em nutrientes absorvíveis.', dado: 'O intestino delgado tem cerca de 6 metros.' },
    nervoso: { nome: 'Sistema nervoso', orgaos: 'Cérebro, medula espinhal e nervos', funcao: 'Captar estímulos, decidir e comandar o corpo.', dado: 'O cérebro consome cerca de 20% da energia do corpo.' },
    esqueletico: { nome: 'Sistema esquelético', orgaos: '206 ossos, cartilagens e ligamentos', funcao: 'Sustentar, proteger órgãos e produzir células do sangue.', dado: 'O bebê nasce com cerca de 300 ossos, que se fundem.' },
    muscular: { nome: 'Sistema muscular', orgaos: 'Mais de 600 músculos', funcao: 'Mover o corpo e manter a postura.', dado: 'O músculo mais forte pelo tamanho é o da mandíbula.' },
    imunologico: { nome: 'Sistema imunológico', orgaos: 'Medula óssea, timo, baço e linfonodos', funcao: 'Reconhecer e neutralizar invasores.', dado: 'Guarda memória: por isso a vacina funciona.' },
    endocrino: { nome: 'Sistema endócrino', orgaos: 'Hipófise, tireoide, suprarrenais e pâncreas', funcao: 'Regular o corpo por hormônios.', dado: 'A hipófise comanda quase todas as outras glândulas.' },
    excretor: { nome: 'Sistema excretor', orgaos: 'Rins, ureteres, bexiga e uretra', funcao: 'Filtrar o sangue e eliminar resíduos.', dado: 'Os rins filtram cerca de 180 litros de sangue por dia.' },
    tegumentar: { nome: 'Sistema tegumentar', orgaos: 'Pele, pelos e unhas', funcao: 'Proteger, regular temperatura e sentir o ambiente.', dado: 'A pele é o maior órgão do corpo.' }
}

/** Busca em todos os catálogos. */
function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    const catalogos = [['país', PAISES], ['elemento', ELEMENTOS], ['constante', CONSTANTES], ['corpo', CORPO]]
    for (const [tipo, cat] of catalogos) {
        for (const [chave, item] of Object.entries(cat)) {
            const alvo = `${chave} ${item.nome} ${item.simbolo || ''} ${item.capital || ''}`.toLowerCase()
            if (alvo.includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

/** Países de um continente. */
function porContinente(continente) {
    const c = String(continente || '').toLowerCase()
    return Object.entries(PAISES)
        .filter(([, p]) => p.continente.toLowerCase().includes(c))
        .map(([chave, p]) => ({ chave, ...p }))
        .sort((a, b) => b.pop - a.pop)
}

module.exports = { PAISES, ELEMENTOS, CONSTANTES, CORPO, procurar, porContinente }
