/**
 * Casa: ferramentas, reparos, segurança e as contas de obra.
 *
 * As contas aqui são as que a pessoa faz de pé no corredor da loja e erra:
 * quantos litros de tinta, quantas caixas de piso com a perda do corte, quanto
 * de cimento, quanto custa deixar o chuveiro ligado. Todas conservadoras — é
 * melhor sobrar meio litro de tinta do que faltar no fim da parede.
 *
 * ─── VALORES QUE ENVELHECEM ───
 * Só a tarifa de energia (`TARIFA_KWH_PADRAO`). Todo comando que a usa aceita
 * a tarifa real da conta como argumento e diz qual usou.
 */

const TARIFA_KWH_PADRAO = 0.95   // R$/kWh, média residencial com tributos

const FERRAMENTAS = {
    martelo: { nome: 'Martelo de unha', para: 'Pregar e arrancar prego', preco: 'baixo',
        como: 'Segure pelo fim do cabo, não pelo meio: o peso da cabeça faz o trabalho, não a força do braço.',
        erro: 'Bater com a lateral da cabeça. Ela não é temperada para isso e lasca.' },
    chavefenda: { nome: 'Chave de fenda e Phillips', para: 'Parafusos comuns', preco: 'muito baixo',
        como: 'A ponta tem que preencher a fenda inteira. Use a maior que couber.',
        erro: 'Usar uma ponta menor "que serve": espana a cabeça do parafuso e aí não sai mais.' },
    alicate: { nome: 'Alicate universal', para: 'Segurar, torcer e cortar arame', preco: 'baixo',
        como: 'A parte cortante fica junto ao eixo, onde a força é maior.',
        erro: 'Usar como chave de aperto em porca sextavada — arredonda a porca.' },
    trena: { nome: 'Trena', para: 'Medir', preco: 'muito baixo',
        como: 'A ponta metálica é solta de propósito: ela desliza a espessura dela para medir certo por dentro e por fora.',
        erro: 'Achar que a ponta solta é defeito e apertar o rebite.' },
    nivel: { nome: 'Nível de bolha', para: 'Conferir horizontal e vertical', preco: 'baixo',
        como: 'A bolha precisa ficar exatamente entre os dois traços.',
        erro: 'Confiar no nível do celular para instalação que vai ficar à vista.' },
    furadeira: { nome: 'Furadeira / parafusadeira', para: 'Furar e parafusar', preco: 'médio',
        como: 'Alvenaria pede função impacto e broca de vídea; madeira e metal, sem impacto.',
        erro: 'Furar parede sem localizar fiação. Nunca fure logo acima ou abaixo de tomada e interruptor.' },
    serrote: { nome: 'Serrote', para: 'Cortar madeira', preco: 'baixo',
        como: 'Corte no movimento de ida, com o serrote fazendo cerca de 45° com a peça.',
        erro: 'Forçar para baixo. Serrote corta pelo curso, não pela pressão.' },
    espatula: { nome: 'Espátula', para: 'Massa corrida, gesso e raspagem', preco: 'muito baixo',
        como: 'Aplique em camadas finas e cruzadas; deixe secar entre elas.',
        erro: 'Tentar tapar um buraco fundo de uma vez — a massa racha ao secar.' },
    chaveinglesa: { nome: 'Chave inglesa / ajustável', para: 'Porcas e conexões hidráulicas', preco: 'baixo',
        como: 'Ajuste bem apertado e puxe no sentido da mandíbula fixa.',
        erro: 'Deixar folga no ajuste: arredonda a porca em uma volta.' },
    fitaveda: { nome: 'Fita veda-rosca', para: 'Vedar rosca de água e gás', preco: 'muito baixo',
        como: 'Enrole no sentido da rosca, 8 a 10 voltas, apertando com o dedo.',
        erro: 'Enrolar no sentido contrário: a fita desenrola sozinha ao apertar a conexão.' },
    buchaparafuso: { nome: 'Buchas e parafusos', para: 'Fixar em alvenaria e gesso', preco: 'muito baixo',
        como: 'A bucha tem que ser do mesmo número da broca. S6 usa broca 6, S8 usa 8.',
        erro: 'Usar bucha comum em drywall. Ali só segura bucha própria, tipo borboleta ou rosca.' },
    lixadeira: { nome: 'Lixa e lixadeira', para: 'Preparar superfície', preco: 'baixo',
        como: 'Número baixo é lixa grossa (60-80, para desbastar), alto é fina (220+, para acabamento).',
        erro: 'Pular direto para a lixa fina numa superfície irregular: ela pule e não corrige nada.' },
    estilete: { nome: 'Estilete', para: 'Cortar papel, plástico e fita', preco: 'muito baixo',
        como: 'Quebre a ponta gasta em vez de forçar. Corte sempre para longe do corpo.',
        erro: 'Usar lâmina cega: exige mais força e é justamente aí que escapa.' },
    testadortensao: { nome: 'Chave-teste ou multímetro', para: 'Saber se o fio está energizado', preco: 'baixo',
        como: 'Teste antes e depois de desligar o disjuntor — o disjuntor certo nem sempre é o que diz na etiqueta.',
        erro: 'Confiar em "desliguei o disjuntor". Sempre confirme com o instrumento.' },
    desentupidor: { nome: 'Desentupidor e cabo de aço', para: 'Ralo e vaso entupidos', preco: 'baixo',
        como: 'Tampe o ladrão da pia para a pressão ir toda pelo cano.',
        erro: 'Usar soda cáustica antes do desentupidor: se não resolver, você agora tem cano entupido com produto corrosivo dentro.' }
}

const REPAROS = {
    torneirapingando: { nome: 'Torneira pingando', dificuldade: 'fácil', tempo: '20 min', custo: 'muito baixo',
        causa: 'Vedante (courinho) ressecado ou sede do registro gasta.',
        passos: ['Feche o registro geral.', 'Abra a torneira para aliviar a pressão.', 'Desmonte o castelo com chave inglesa.', 'Troque o vedante por um do mesmo diâmetro.', 'Monte, abra o registro e teste.'],
        atencao: 'Se continuar pingando com vedante novo, a sede está gasta e precisa de fresa ou troca da torneira.' },
    descargacorrendo: { nome: 'Caixa acoplada correndo', dificuldade: 'fácil', tempo: '30 min', custo: 'baixo',
        causa: 'Boia desregulada ou vedação da válvula de saída ressecada.',
        passos: ['Feche o registro da caixa.', 'Abra a tampa e observe onde a água escapa.', 'Se passa pela boia, ajuste a haste para fechar antes.', 'Se escapa pelo fundo, troque o anel de vedação.'],
        atencao: 'Uma caixa correndo desperdiça milhares de litros por mês. É o vazamento mais caro e mais silencioso da casa.' },
    raloentupido: { nome: 'Ralo entupido', dificuldade: 'fácil', tempo: '20 min', custo: 'muito baixo',
        causa: 'Cabelo e gordura acumulados no sifão.',
        passos: ['Retire a grelha e o que estiver visível.', 'Use desentupidor com o ladrão tampado.', 'Se não resolver, desrosqueie o sifão com um balde embaixo.', 'Água fervente com bicarbonato e vinagre ajuda em gordura.'],
        atencao: 'Soda cáustica é o último recurso e nunca depois de outro produto: a mistura libera gases.' },
    chuveiroesquentando: { nome: 'Chuveiro não esquenta', dificuldade: 'média', tempo: '30 min', custo: 'baixo',
        causa: 'Resistência queimada, chave na posição verão ou disjuntor específico desarmado.',
        passos: ['DESLIGUE o disjuntor do chuveiro e confirme com chave-teste.', 'Cheque a posição verão/inverno.', 'Abra o chuveiro e veja se a resistência está rompida.', 'Troque por uma da mesma tensão e potência.'],
        atencao: 'Chuveiro é o aparelho de maior corrente da casa. Fio subdimensionado esquenta e derrete. Na dúvida, chame eletricista.' },
    disjuntorcaindo: { nome: 'Disjuntor caindo toda hora', dificuldade: 'média', tempo: 'diagnóstico', custo: 'variável',
        causa: 'Sobrecarga no circuito, curto ou disjuntor no fim da vida.',
        passos: ['Desligue tudo daquele circuito e religue o disjuntor.', 'Ligue um aparelho por vez até identificar o culpado.', 'Se cai com tudo desligado, é curto na fiação — chame eletricista.', 'Se só cai com muitos aparelhos, é sobrecarga: redistribua.'],
        atencao: 'Nunca troque por um disjuntor de amperagem maior para "parar de cair". Ele protege o fio, não o aparelho.' },
    tomadanaofunciona: { nome: 'Tomada sem energia', dificuldade: 'média', tempo: '30 min', custo: 'baixo',
        causa: 'Fio solto no borne, tomada queimada ou circuito desarmado.',
        passos: ['Desligue o disjuntor do ambiente e confirme com chave-teste.', 'Abra a tomada e verifique se os fios estão firmes no borne.', 'Procure sinal de queimado ou derretido.', 'Reaperte ou troque a tomada.'],
        atencao: 'Marca escura em volta do pino indica mau contato, que é a principal causa de incêndio elétrico residencial.' },
    infiltracaoparede: { nome: 'Infiltração na parede', dificuldade: 'difícil', tempo: 'depende', custo: 'médio a alto',
        causa: 'Vazamento em cano embutido, rachadura externa, laje ou umidade ascendente.',
        passos: ['Identifique a origem antes de qualquer coisa: pintar por cima só esconde.', 'Feche o registro geral e leia o hidrômetro; se girar com tudo fechado, é vazamento.', 'Mancha que piora quando chove aponta para a fachada ou a laje.', 'Trate a causa, deixe secar por semanas e só então recupere a pintura.'],
        atencao: 'Massa e tinta sobre parede úmida descascam em meses. A pressa aqui custa a obra duas vezes.' },
    paredefurada: { nome: 'Tapar furo na parede', dificuldade: 'fácil', tempo: '1 h + secagem', custo: 'muito baixo',
        causa: 'Bucha antiga, prego retirado, quadro removido.',
        passos: ['Limpe o furo e remova o que estiver solto.', 'Umedeça levemente a borda.', 'Aplique massa em camadas finas, deixando secar entre elas.', 'Lixe com lixa fina e pinte.'],
        atencao: 'Furo fundo pede enchimento com gesso antes da massa corrida; só massa racha e afunda.' },
    portarangendo: { nome: 'Porta rangendo ou raspando', dificuldade: 'fácil', tempo: '20 min', custo: 'muito baixo',
        causa: 'Dobradiça seca, parafuso frouxo ou assentamento da casa.',
        passos: ['Lubrifique as dobradiças com óleo ou grafite em pó.', 'Reaperte os parafusos; se giram em falso, use um palito com cola no furo.', 'Se raspa embaixo, plane ou lixe a área que marca.'],
        atencao: 'Óleo comum atrai poeira e vira pasta. Grafite em pó dura muito mais em dobradiça.' },
    vazamentoescondido: { nome: 'Conta de água alta sem motivo', dificuldade: 'média', tempo: 'diagnóstico', custo: 'variável',
        causa: 'Vazamento em cano embutido, caixa d\'água ou boia.',
        passos: ['Feche todas as torneiras e aparelhos.', 'Anote o hidrômetro e espere 2 horas sem usar água.', 'Se o número mudou, há vazamento.', 'Feche o registro da caixa e repita: se parar, o vazamento está depois da caixa.'],
        atencao: 'Vaso sanitário correndo é o campeão. Pingue corante no reservatório: se aparecer cor no vaso sem dar descarga, é ele.' },
    lampadapiscando: { nome: 'Lâmpada piscando', dificuldade: 'fácil', tempo: '15 min', custo: 'baixo',
        causa: 'Mau contato no soquete, lâmpada incompatível com dimmer ou neutro solto.',
        passos: ['Desligue o disjuntor.', 'Reaperte a lâmpada e verifique o contato no fundo do soquete.', 'Teste outra lâmpada.', 'Se todas as lâmpadas da casa piscam, o problema é na entrada — chame a concessionária.'],
        atencao: 'LED comum em circuito com dimmer antigo pisca por incompatibilidade, não por defeito.' },
    mofonoarmario: { nome: 'Mofo em armário e parede', dificuldade: 'fácil', tempo: '1 h', custo: 'muito baixo',
        causa: 'Ventilação ruim somada a umidade.',
        passos: ['Limpe com água e vinagre ou solução de água sanitária diluída.', 'Deixe secar completamente com o armário aberto.', 'Afaste móveis 3 a 5 cm da parede para o ar circular.', 'Use desumidificador ou sílica em ambientes fechados.'],
        atencao: 'Mofo recorrente no mesmo ponto costuma ser infiltração, não falta de limpeza.' },
    fechaduratravada: { nome: 'Fechadura travando', dificuldade: 'fácil', tempo: '20 min', custo: 'baixo',
        causa: 'Segredo sujo, porta desalinhada ou chave desgastada.',
        passos: ['Aplique grafite em pó no segredo, nunca óleo.', 'Teste com a porta aberta: se gira fácil, o problema é alinhamento.', 'Ajuste a posição do testa ou da contra-chapa.'],
        atencao: 'Óleo no segredo empasta com a poeira e trava de vez em poucas semanas.' },
    piaentupidagordura: { nome: 'Pia da cozinha entupida', dificuldade: 'fácil', tempo: '30 min', custo: 'muito baixo',
        causa: 'Gordura solidificada no sifão e no cano.',
        passos: ['Despeje água fervente aos poucos.', 'Use bicarbonato seguido de vinagre e espere 20 minutos.', 'Repita a água fervente.', 'Se não resolver, abra o sifão com um balde embaixo.'],
        atencao: 'Nunca jogue óleo de fritura na pia. Guarde numa garrafa e descarte em ponto de coleta.' },
    goteiratelhado: { nome: 'Goteira no telhado', dificuldade: 'média', tempo: 'depende', custo: 'baixo a médio',
        causa: 'Telha trincada, deslocada ou calha entupida.',
        passos: ['Localize a origem em dia seco: a água escorre e a mancha aparece longe do furo.', 'Cheque calhas e rufos primeiro — entupimento é a causa mais comum.', 'Troque telhas trincadas.', 'Nunca pise no meio da telha: caminhe sobre as ripas.'],
        atencao: 'Telhado molhado é escorregadio e a queda é de altura. Se não tem segurança, contrate.' }
}

const SEGURANCA = {
    eletrica: { nome: 'Antes de mexer na elétrica', risco: 'alto',
        regras: ['Desligue o disjuntor do circuito e confirme com chave-teste ou multímetro.', 'Nunca trabalhe com piso ou mãos molhados.', 'Use ferramenta com cabo isolado.', 'Fotografe as ligações antes de desmontar.', 'Chuveiro, ar-condicionado e forno pedem circuito e fio próprios: isso é serviço de eletricista.'],
        limite: 'Trocar tomada, interruptor e lâmpada é doméstico. Mexer no quadro de distribuição, não.' },
    gas: { nome: 'Gás: vazamento e instalação', risco: 'máximo',
        regras: ['Cheiro de gás: NÃO acenda luz nem acione interruptor — a faísca basta.', 'Abra portas e janelas e feche o registro do botijão.', 'Saia e ligue para o Corpo de Bombeiros (193).', 'Teste conexões com espuma de sabão: bolha indica vazamento.', 'Mangueira e regulador têm validade impressa — troque no prazo.'],
        limite: 'Trocar botijão e mangueira é doméstico. Instalação embutida é de profissional credenciado.' },
    altura: { nome: 'Trabalho em altura', risco: 'alto',
        regras: ['Escada em ângulo de 75°: a base a um quarto da altura de distância da parede.', 'Nunca use os dois últimos degraus.', 'Alguém segurando a base muda tudo.', 'No telhado, pise sobre as ripas, nunca no meio da telha.'],
        limite: 'Queda de dois metros já é suficiente para lesão grave. Acima de um pé-direito, contrate.' },
    quimicos: { nome: 'Produtos químicos', risco: 'alto',
        regras: ['NUNCA misture água sanitária com amoníaco ou com produto ácido: libera gás tóxico.', 'Ventile o ambiente sempre.', 'Use luva e óculos com soda cáustica.', 'Guarde na embalagem original, longe de criança e de alimento.'],
        limite: 'Sentiu falta de ar ou ardência nos olhos: saia do ambiente imediatamente e ligue 0800 722 6001 (CEATOX).' },
    ferramentaseg: { nome: 'Ferramenta elétrica', risco: 'médio',
        regras: ['Óculos de proteção sempre — lasca no olho é irreversível.', 'Não use roupa larga, corrente nem cabelo solto perto de peça girando.', 'Desconecte da tomada antes de trocar broca ou disco.', 'Fixe a peça; segurar com a mão é como a maioria dos acidentes começa.'],
        limite: 'Ferramenta com cabo descascado ou pino quebrado vai para o lixo, não para a gambiarra.' },
    incendio: { nome: 'Prevenção de incêndio', risco: 'alto',
        regras: ['Tomada com marca escura ou que esquenta é mau contato: troque.', 'Um benjamim por tomada, no máximo — nunca em série.', 'Não passe fio por baixo de tapete nem preso com prego.', 'Extintor ABC em casa custa pouco e vale a pena.', 'Fogo em óleo de cozinha: abafe com tampa. NUNCA jogue água.'],
        limite: 'Fogo maior que uma lixeira: saia e ligue 193. Não tente heroísmo.' }
}

/** Tinta necessária para pintar um ambiente. */
function tinta({ largura, comprimento, peDireito = 2.7, demaos = 2, rendimento = 10, aberturas = 0 }) {
    const l = Number(largura), c = Number(comprimento), h = Number(peDireito)
    if (![l, c, h].every(Number.isFinite) || l <= 0 || c <= 0 || h <= 0) return null
    const perimetro = 2 * (l + c)
    const areaBruta = perimetro * h
    const areaAberturas = Math.max(0, Number(aberturas) || 0)
    const area = Math.max(0, areaBruta - areaAberturas)
    const d = Math.max(1, Math.floor(Number(demaos) || 2))
    const r = Math.max(1, Number(rendimento) || 10)
    const litros = (area * d) / r
    // Latas comerciais, da maior para a menor.
    const LATAS = [{ nome: 'lata de 18 L', litros: 18 }, { nome: 'galão de 3,6 L', litros: 3.6 }, { nome: 'lata de 0,9 L', litros: 0.9 }]
    let resto = Math.ceil(litros * 10) / 10
    const compra = []
    for (const lata of LATAS) {
        const n = Math.floor(resto / lata.litros)
        if (n > 0) { compra.push({ ...lata, quantidade: n }); resto -= n * lata.litros }
    }
    if (resto > 0.01) {
        const menor = LATAS[LATAS.length - 1]
        const existente = compra.find(x => x.nome === menor.nome)
        if (existente) existente.quantidade++
        else compra.push({ ...menor, quantidade: 1 })
    }

    // Consolida embalagem pequena em grande: 4 latas de 0,9 L são exatamente
    // um galão de 3,6 L, e ninguém sai da loja carregando quatro latinhas.
    for (let i = LATAS.length - 1; i > 0; i--) {
        const pequena = compra.find(x => x.nome === LATAS[i].nome)
        if (!pequena) continue
        const cabem = Math.floor(LATAS[i - 1].litros / LATAS[i].litros)
        const promover = Math.floor(pequena.quantidade / cabem)
        if (promover < 1) continue
        pequena.quantidade -= promover * cabem
        const grande = compra.find(x => x.nome === LATAS[i - 1].nome)
        if (grande) grande.quantidade += promover
        else compra.push({ ...LATAS[i - 1], quantidade: promover })
    }
    const consolidada = compra
        .filter(x => x.quantidade > 0)
        .sort((a, b) => b.litros - a.litros)
    compra.length = 0
    compra.push(...consolidada)

    const totalComprado = compra.reduce((a, x) => a + x.quantidade * x.litros, 0)
    return { perimetro, areaBruta, areaAberturas, area, demaos: d, rendimento: r, litros, compra, totalComprado, sobra: totalComprado - litros }
}

/** Piso ou azulejo: caixas necessárias com a perda do corte. */
function piso({ largura, comprimento, m2PorCaixa = 2, perdaPct = 10 }) {
    const l = Number(largura), c = Number(comprimento)
    if (![l, c].every(Number.isFinite) || l <= 0 || c <= 0) return null
    const area = l * c
    const perda = Math.max(0, Number(perdaPct) || 0)
    const comPerda = area * (1 + perda / 100)
    const porCaixa = Math.max(0.1, Number(m2PorCaixa) || 2)
    const caixas = Math.ceil(comPerda / porCaixa)
    return { area, perda, comPerda, porCaixa, caixas, m2Comprados: caixas * porCaixa, sobra: caixas * porCaixa - area }
}

/** Consumo de um aparelho: kWh e custo no mês. */
function consumoAparelho({ watts, horasPorDia, diasPorMes = 30, tarifa = TARIFA_KWH_PADRAO }) {
    const w = Number(watts), h = Number(horasPorDia), d = Number(diasPorMes)
    if (![w, h, d].every(Number.isFinite) || w <= 0 || h < 0 || d <= 0) return null
    const t = Number(tarifa) || TARIFA_KWH_PADRAO
    const kwhDia = (w * h) / 1000
    const kwhMes = kwhDia * d
    return { watts: w, horasPorDia: h, diasPorMes: d, tarifa: t, kwhDia, kwhMes, custoMes: kwhMes * t, custoAno: kwhMes * t * 12 }
}

/** Aparelhos comuns com potência típica. */
const APARELHOS = [
    { nome: 'Chuveiro elétrico', watts: 5500, horas: 0.5 },
    { nome: 'Ar-condicionado 9.000 BTU', watts: 900, horas: 8 },
    { nome: 'Geladeira frost free', watts: 150, horas: 24 },
    { nome: 'Máquina de lavar', watts: 500, horas: 1 },
    { nome: 'Ferro de passar', watts: 1200, horas: 0.5 },
    { nome: 'Micro-ondas', watts: 1400, horas: 0.3 },
    { nome: 'Televisão LED 50"', watts: 100, horas: 5 },
    { nome: 'Computador de mesa', watts: 250, horas: 6 },
    { nome: 'Lâmpada LED 9 W', watts: 9, horas: 6 },
    { nome: 'Lâmpada incandescente 60 W', watts: 60, horas: 6 },
    { nome: 'Ventilador de teto', watts: 120, horas: 8 },
    { nome: 'Secador de cabelo', watts: 1800, horas: 0.2 },
    { nome: 'Forno elétrico', watts: 1500, horas: 0.5 },
    { nome: 'Bomba d\'água', watts: 750, horas: 1 }
]

/** Argamassa e cimento para assentamento. */
function argamassa({ area, espessuraMm = 8 }) {
    const a = Number(area)
    if (!Number.isFinite(a) || a <= 0) return null
    const e = Math.max(1, Number(espessuraMm) || 8)
    // Regra prática: ~1,7 kg de argamassa por m² a cada 1 mm de espessura.
    const kg = a * e * 1.7
    const sacos20 = Math.ceil(kg / 20)
    return { area: a, espessuraMm: e, kg, sacos20, kgComprados: sacos20 * 20 }
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [tipo, cat] of [['ferramenta', FERRAMENTAS], ['reparo', REPAROS], ['seguranca', SEGURANCA]]) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

const moeda = v => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const num = (v, c = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c })

function lerNumero(txt) {
    if (txt === null || txt === undefined) return NaN
    let s = String(txt).trim().replace(/[R$\s]/gi, '')
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : NaN
}

module.exports = {
    TARIFA_KWH_PADRAO, FERRAMENTAS, REPAROS, SEGURANCA, APARELHOS,
    tinta, piso, consumoAparelho, argamassa, procurar, moeda, num, lerNumero
}
