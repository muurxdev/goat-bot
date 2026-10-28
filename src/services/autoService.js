/**
 * Carro: luzes do painel, manutenção, trânsito e as contas de combustível.
 *
 * ─── VALORES QUE ENVELHECEM ───
 * Multas e pontos ficam em INFRACOES com o campo `vigencia` no topo. Valores do
 * CTB são reajustados por resolução; todo comando imprime a vigência junto do
 * resultado para o usuário saber de quando é o número.
 *
 * A regra das luzes do painel segue a convenção internacional de cores:
 * vermelho manda parar, amarelo manda providenciar, verde e azul são só aviso
 * de que algo está ligado. É o que organiza o catálogo.
 */

const VIGENCIA_CTB = '2025'

/** Luzes do painel: cor, gravidade e o que fazer AGORA. */
const LUZES = {
    freio: { nome: 'Luz de freio', cor: 'vermelha', gravidade: 'pare',
        significa: 'Freio de mão puxado, nível baixo do fluido de freio ou falha no sistema.',
        agora: 'Confira primeiro se o freio de mão está solto. Se estiver e a luz continuar, pare em local seguro e não siga dirigindo.',
        risco: 'Fluido baixo pode significar vazamento ou pastilha no fim. Perder freio em movimento não dá segunda chance.' },
    oleo: { nome: 'Luz de pressão do óleo', cor: 'vermelha', gravidade: 'pare',
        significa: 'A pressão do óleo do motor caiu abaixo do mínimo.',
        agora: 'Desligue o motor imediatamente e pare. Não é aviso de nível baixo — é falta de pressão.',
        risco: 'Rodar segundos sem pressão de óleo funde o motor. É a luz mais cara de ignorar do painel.' },
    temperatura: { nome: 'Luz de temperatura', cor: 'vermelha', gravidade: 'pare',
        significa: 'O motor está superaquecendo.',
        agora: 'Encoste, desligue e espere esfriar. Nunca abra o radiador quente.',
        risco: 'Superaquecimento empena o cabeçote e queima a junta. Abrir o radiador quente causa queimadura grave.' },
    bateria: { nome: 'Luz da bateria', cor: 'vermelha', gravidade: 'atenção imediata',
        significa: 'O alternador parou de carregar. O carro está rodando com a energia guardada.',
        agora: 'Desligue ar-condicionado, som e o que puder. Vá direto a uma oficina enquanto ainda há carga.',
        risco: 'Quando a bateria acaba, o carro morre onde estiver — inclusive no meio da pista.' },
    injecao: { nome: 'Luz da injeção (motor)', cor: 'amarela', gravidade: 'providencie',
        significa: 'A central detectou falha em algum sensor ou na combustão.',
        agora: 'Se está piscando, reduza a velocidade e procure oficina hoje. Se está acesa fixa, pode seguir com cuidado.',
        risco: 'Piscando indica falha de ignição que destrói o catalisador — a peça mais cara da linha de escape.' },
    abs: { nome: 'Luz do ABS', cor: 'amarela', gravidade: 'providencie',
        significa: 'O sistema antibloqueio saiu do ar.',
        agora: 'O freio comum continua funcionando. Aumente a distância do carro da frente e evite frenagem brusca.',
        risco: 'Sem ABS, frenagem forte trava as rodas e o carro perde a direção justamente na emergência.' },
    airbag: { nome: 'Luz do airbag', cor: 'vermelha ou amarela', gravidade: 'providencie',
        significa: 'Falha no sistema de retenção suplementar.',
        agora: 'O carro anda normalmente, mas o airbag pode não abrir numa batida. Agende a revisão.',
        risco: 'Também é possível que ele dispare sozinho, o que é perigoso por si só.' },
    estabilidade: { nome: 'Controle de estabilidade (ESP)', cor: 'amarela', gravidade: 'observe',
        significa: 'Piscando: o sistema está atuando agora. Acesa fixa: o sistema falhou ou foi desligado.',
        agora: 'Piscando em curva ou chuva é o carro trabalhando a seu favor — alivie o acelerador.',
        risco: 'Fixa significa que você está sem a rede de segurança em piso molhado.' },
    pneu: { nome: 'Sensor de pressão (TPMS)', cor: 'amarela', gravidade: 'providencie',
        significa: 'A pressão de pelo menos um pneu caiu.',
        agora: 'Calibre na primeira oportunidade e procure prego ou corte.',
        risco: 'Pneu murcho esquenta, consome mais e pode estourar em velocidade.' },
    direcao: { nome: 'Direção elétrica', cor: 'amarela', gravidade: 'atenção imediata',
        significa: 'Falha na assistência da direção.',
        agora: 'O volante fica muito mais pesado. Reduza a velocidade e evite manobras.',
        risco: 'A perda de assistência é súbita e surpreende em curva ou estacionamento.' },
    combustivelluz: { nome: 'Reserva de combustível', cor: 'amarela', gravidade: 'observe',
        significa: 'O tanque entrou na reserva.',
        agora: 'Abasteça. A reserva típica dá de 50 a 80 km, mas varia muito.',
        risco: 'Rodar seco puxa a borra do fundo do tanque e castiga a bomba de combustível, que trabalha refrigerada pelo próprio combustível.' },
    catalisador: { nome: 'Catalisador / emissões', cor: 'amarela', gravidade: 'providencie',
        significa: 'O sistema de escape está fora dos limites de emissão.',
        agora: 'Agende diagnóstico. Muitas vezes é sonda lambda, não o catalisador em si.',
        risco: 'Reprova na inspeção onde ela existe e o consumo sobe.' },
    farolalto: { nome: 'Farol alto', cor: 'azul', gravidade: 'informação',
        significa: 'O farol alto está ligado.',
        agora: 'Baixe ao cruzar com outro veículo ou ao seguir alguém — ofuscar é infração.',
        risco: 'Nenhum para o carro. Para quem vem na contramão, muito.' },
    neblina: { nome: 'Farol de neblina', cor: 'verde ou amarela', gravidade: 'informação',
        significa: 'O farol de neblina está ligado (verde: dianteiro, amarelo: traseiro).',
        agora: 'Use só com visibilidade ruim. O traseiro ligado em pista limpa cega quem vem atrás.',
        risco: 'Uso indevido é infração e atrapalha os outros.' },
    cinto: { nome: 'Cinto de segurança', cor: 'vermelha', gravidade: 'atenção imediata',
        significa: 'Alguém está sem cinto.',
        agora: 'Coloque o cinto antes de sair do lugar.',
        risco: 'É a medida isolada que mais salva vida em acidente, e infração grave no CTB.' },
    porta: { nome: 'Porta aberta', cor: 'vermelha', gravidade: 'observe',
        significa: 'Uma porta, o capô ou o porta-malas não fechou direito.',
        agora: 'Pare em local seguro e feche. Não tente fechar em movimento.',
        risco: 'Porta que abre em curva ou capô que levanta em velocidade tira a visão inteira.' },
    imobilizador: { nome: 'Imobilizador / chave', cor: 'amarela', gravidade: 'observe',
        significa: 'O sistema não reconheceu a chave.',
        agora: 'Tente a chave reserva. Bateria fraca do controle é a causa mais comum.',
        risco: 'O carro pode não dar partida na próxima vez que você desligar.' },
    dpf: { nome: 'Filtro de partículas (diesel)', cor: 'amarela', gravidade: 'providencie',
        significa: 'O filtro de partículas está saturado e precisa regenerar.',
        agora: 'Rode 20 minutos em rodovia acima de 60 km/h para a regeneração acontecer.',
        risco: 'Só uso urbano curto entope o filtro de vez, e a troca é cara.' }
}

/** Manutenção preventiva: quando trocar e o sinal de que está na hora. */
const MANUTENCAO = {
    oleomotor: { nome: 'Óleo do motor', prazo: '10.000 km ou 1 ano', custo: 'baixo',
        porque: 'Lubrifica, refrigera e limpa o motor. Perde as propriedades com o tempo, mesmo parado.',
        sinal: 'Óleo escuro e ralo na vareta, motor mais barulhento a frio.',
        seignorar: 'Desgaste acelerado e, no limite, motor fundido. É a manutenção mais barata e a mais cara de pular.' },
    filtrooleo: { nome: 'Filtro de óleo', prazo: 'junto com o óleo', custo: 'muito baixo',
        porque: 'Retém as partículas metálicas do desgaste normal.',
        sinal: 'Não dá sinal — por isso troca junto com o óleo, sempre.',
        seignorar: 'Filtro saturado abre a válvula de alívio e o óleo passa sem ser filtrado.' },
    filtroar: { nome: 'Filtro de ar', prazo: '10.000 a 15.000 km', custo: 'muito baixo',
        porque: 'Impede que poeira entre no motor junto com o ar.',
        sinal: 'Perda de força, consumo maior, filtro visivelmente escuro.',
        seignorar: 'Motor sufocado gasta mais combustível e desgasta cilindro.' },
    filtrocombustivel: { nome: 'Filtro de combustível', prazo: '20.000 a 40.000 km', custo: 'baixo',
        porque: 'Retém impureza e água do combustível antes dos bicos.',
        sinal: 'Falha em aceleração, engasgo em subida, partida difícil.',
        seignorar: 'Entope bico injetor e força a bomba, que custa muito mais que o filtro.' },
    velas: { nome: 'Velas de ignição', prazo: '20.000 a 60.000 km conforme o tipo', custo: 'baixo',
        porque: 'Geram a faísca que queima a mistura.',
        sinal: 'Motor trepidando na marcha lenta, consumo alto, luz da injeção piscando.',
        seignorar: 'Falha de ignição joga combustível não queimado no escape e mata o catalisador.' },
    correiadentada: { nome: 'Correia dentada', prazo: '50.000 a 80.000 km ou 5 anos', custo: 'médio',
        porque: 'Sincroniza virabrequim e comando de válvulas.',
        sinal: 'Muitas vezes nenhum. Trincas e ressecamento só aparecem na inspeção visual.',
        seignorar: 'Se arrebentar em movimento, pistão e válvula se encontram. É motor aberto na hora.' },
    pastilhas: { nome: 'Pastilhas de freio', prazo: '30.000 a 50.000 km', custo: 'baixo',
        porque: 'São o material de atrito que para o carro.',
        sinal: 'Chiado agudo ao frear (indicador metálico), pedal mais baixo, distância maior para parar.',
        seignorar: 'Pastilha no fim risca o disco, e aí troca disco também.' },
    discos: { nome: 'Discos de freio', prazo: 'a cada 2 trocas de pastilha', custo: 'médio',
        porque: 'É a superfície onde a pastilha atua.',
        sinal: 'Volante trepidando ao frear, sulcos visíveis no disco.',
        seignorar: 'Disco empenado alonga a frenagem justamente quando ela é urgente.' },
    amortecedores: { nome: 'Amortecedores', prazo: '60.000 a 80.000 km', custo: 'médio',
        porque: 'Mantêm o pneu grudado no chão.',
        sinal: 'Carro balança demais em lombada, pneu com desgaste irregular, traseira "flutuando".',
        seignorar: 'Aumenta a distância de frenagem e desgasta pneu e suspensão inteira.' },
    fluidofreio: { nome: 'Fluido de freio', prazo: '2 anos', custo: 'baixo',
        porque: 'É higroscópico: absorve água do ar com o tempo.',
        sinal: 'Pedal esponjoso, principalmente depois de descida longa.',
        seignorar: 'Água no fluido ferve na frenagem forte e o pedal vai ao fundo sem frear.' },
    arrefecimento: { nome: 'Fluido de arrefecimento', prazo: '2 a 5 anos', custo: 'baixo',
        porque: 'Troca calor e protege contra corrosão interna.',
        sinal: 'Cor turva ou enferrujada no reservatório, temperatura subindo no trânsito.',
        seignorar: 'Corrosão interna e superaquecimento. Nunca complete com água comum de forma permanente.' },
    bateriacarro: { nome: 'Bateria', prazo: '2 a 4 anos', custo: 'médio',
        porque: 'Dá a partida e alimenta a eletrônica com o motor desligado.',
        sinal: 'Partida lenta, farol fraco com motor desligado, luzes do painel piscando na partida.',
        seignorar: 'Deixa você na mão sem aviso, geralmente no dia mais frio ou mais corrido.' },
    pneus: { nome: 'Pneus', prazo: '40.000 km ou 5 anos', custo: 'alto',
        porque: 'São os únicos quatro pontos de contato do carro com o chão.',
        sinal: 'Sulco abaixo de 1,6 mm (use o indicador TWI), rachaduras, bolha na lateral.',
        seignorar: 'Aquaplanagem em chuva e risco real de estouro. Pneu velho endurece mesmo sem rodar.' },
    alinhamento: { nome: 'Alinhamento e balanceamento', prazo: '10.000 km ou após buraco forte', custo: 'muito baixo',
        porque: 'Mantém as rodas na geometria correta e sem vibração.',
        sinal: 'Carro puxando para um lado, volante torto na reta, volante vibrando em certa velocidade.',
        seignorar: 'Come um lado do pneu em poucos milhares de quilômetros.' }
}

/** Principais infrações do CTB. */
const INFRACOES = {
    velocidade20: { nome: 'Velocidade até 20% acima', gravidade: 'média', pontos: 4, valor: 130.16,
        artigo: 'CTB art. 218, I', detalhe: 'A tolerância do radar já está descontada antes disso.' },
    velocidade50: { nome: 'Velocidade de 20% a 50% acima', gravidade: 'grave', pontos: 5, valor: 195.23,
        artigo: 'CTB art. 218, II', detalhe: 'É a faixa mais comum em rodovia.' },
    velocidade50mais: { nome: 'Velocidade acima de 50%', gravidade: 'gravíssima ×3', pontos: 7, valor: 880.41,
        artigo: 'CTB art. 218, III', detalhe: 'Suspensão imediata do direito de dirigir, além da multa.' },
    celular: { nome: 'Usar celular ao dirigir', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 252, VI', detalhe: 'Segurar o aparelho já configura a infração, mesmo parado no semáforo.' },
    cintoinfracao: { nome: 'Sem cinto de segurança', gravidade: 'grave', pontos: 5, valor: 195.23,
        artigo: 'CTB art. 167', detalhe: 'Vale para todos os ocupantes; o condutor responde pelos passageiros.' },
    alcool: { nome: 'Dirigir sob influência de álcool', gravidade: 'gravíssima ×10', pontos: 7, valor: 2934.70,
        artigo: 'CTB art. 165', detalhe: 'Suspensão por 12 meses e retenção do veículo. Reincidência em 12 meses dobra a multa.' },
    recusarbafometro: { nome: 'Recusar o teste do bafômetro', gravidade: 'gravíssima ×10', pontos: 7, valor: 2934.70,
        artigo: 'CTB art. 165-A', detalhe: 'A recusa tem a mesma penalidade de quem soprou e deu positivo.' },
    avancarsinal: { nome: 'Avançar o sinal vermelho', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 208', detalhe: 'Parar sobre a faixa de pedestres é infração separada.' },
    estacionarproibido: { nome: 'Estacionar em local proibido', gravidade: 'média', pontos: 4, valor: 130.16,
        artigo: 'CTB art. 181', detalhe: 'Em vaga de idoso ou PcD sem direito, sobe para grave ou gravíssima.' },
    cadeirinha: { nome: 'Criança sem cadeirinha', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 168', detalhe: 'Também gera retenção do veículo até a irregularidade ser sanada.' },
    licenciamento: { nome: 'Dirigir com licenciamento vencido', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 230, V', detalhe: 'Remoção do veículo ao depósito.' },
    cnhvencida: { nome: 'CNH vencida há mais de 30 dias', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 162, V', detalhe: 'O veículo é retido até a apresentação de condutor habilitado.' },
    semhabilitacao: { nome: 'Dirigir sem habilitação', gravidade: 'gravíssima ×3', pontos: 7, valor: 880.41,
        artigo: 'CTB art. 162, I', detalhe: 'Pode configurar crime de trânsito se gerar perigo de dano.' },
    ultrapassagem: { nome: 'Ultrapassar pela contramão em faixa contínua', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 203', detalhe: 'Em curva, aclive ou ponte a penalidade é agravada.' },
    faixapedestre: { nome: 'Não dar preferência ao pedestre', gravidade: 'gravíssima', pontos: 7, valor: 293.47,
        artigo: 'CTB art. 214', detalhe: 'A preferência do pedestre na faixa não depende de semáforo.' },
    farolapagado: { nome: 'Farol apagado em rodovia', gravidade: 'média', pontos: 4, valor: 130.16,
        artigo: 'CTB art. 250', detalhe: 'Luz baixa é obrigatória em rodovia de dia; em túnel, em qualquer via.' }
}

/** Emergências na estrada. */
const EMERGENCIAS = {
    acidente: { nome: 'Acidente de trânsito', prioridade: 'máxima',
        passos: ['Sinalize: pisca-alerta e triângulo a cerca de 30 passos atrás.', 'Não mova ferido, salvo risco de incêndio ou novo impacto.', 'Chame 192 (SAMU) e 190 (polícia); em rodovia federal, 191.', 'Fotografe posição dos veículos, placas e danos antes de tirar da pista.', 'Troque dados e preencha o boletim; sem vítimas, dá para fazer online em muitos estados.'],
        erro: 'Tirar os carros da pista antes de fotografar destrói a prova de quem causou.' },
    paneseca: { nome: 'Ficou sem combustível', prioridade: 'média',
        passos: ['Encoste o máximo possível no acostamento.', 'Pisca-alerta ligado e triângulo posicionado.', 'Saia pelo lado do acostamento e espere atrás da defensa, nunca dentro do carro.', 'Acione guincho ou seguro.'],
        erro: 'Esperar sentado dentro do carro parado no acostamento é onde acontecem os atropelamentos em rodovia.' },
    pneufurado: { nome: 'Pneu furado', prioridade: 'média',
        passos: ['Reduza sem frear bruscamente e encoste em piso firme e plano.', 'Pisca-alerta, freio de mão e triângulo.', 'Afrouxe os parafusos ANTES de levantar o carro.', 'Nunca fique embaixo do carro apoiado só no macaco.', 'Confira o torque e a pressão do estepe no primeiro posto.'],
        erro: 'Levantar o carro antes de afrouxar os parafusos: a roda gira e não dá para soltar.' },
    superaqueceu: { nome: 'Motor superaquecendo', prioridade: 'alta',
        passos: ['Desligue o ar e ligue o aquecedor no máximo: ele tira calor do motor.', 'Encoste e desligue o motor.', 'Espere esfriar por pelo menos 30 minutos.', 'NUNCA abra a tampa do radiador quente.'],
        erro: 'Jogar água fria no motor quente trinca o bloco. Abrir o radiador quente causa queimadura grave.' },
    blitz: { nome: 'Abordagem policial ou blitz', prioridade: 'baixa',
        passos: ['Reduza, ligue a luz interna se for de noite e mantenha as mãos visíveis.', 'Apresente CNH e documento do veículo (a versão digital vale).', 'Você pode se recusar ao bafômetro, mas a recusa tem a mesma penalidade do teste positivo.', 'Discordou da autuação? Assine e recorra depois — discutir no local não muda nada.'],
        erro: 'Sair do carro sem ser solicitado ou discutir a multa na hora só piora a situação.' },
    alagamento: { nome: 'Água na via', prioridade: 'alta',
        passos: ['Não entre em água que cubra mais da metade da roda.', 'Se já estiver dentro e o motor morrer, NÃO tente dar partida.', 'Saia pela janela se a porta não abrir pela pressão da água.', 'Abandone o carro se a água estiver subindo — ele é substituível.'],
        erro: 'Dar partida com água aspirada faz calço hidráulico e entorta a biela. Prejuízo de motor inteiro.' },
    multaindevida: { nome: 'Multa que você acha indevida', prioridade: 'baixa',
        passos: ['Confira placa, data, hora e local na notificação — erro formal anula a autuação.', 'Primeiro recurso: defesa prévia, no prazo da notificação de autuação.', 'Depois: JARI e, em último caso, CETRAN.', 'Junte prova: foto, nota fiscal com horário, comprovante de que estava em outro lugar.'],
        erro: 'Deixar passar o prazo da defesa prévia. Cada etapa tem prazo próprio e perdê-lo fecha a porta.' }
}

/** Álcool ou gasolina: a regra dos 70%. */
function alcoolOuGasolina(precoAlcool, precoGasolina) {
    const a = Number(precoAlcool), g = Number(precoGasolina)
    if (!Number.isFinite(a) || !Number.isFinite(g) || a <= 0 || g <= 0) return null
    const razao = a / g
    const limite = 0.70
    return {
        precoAlcool: a, precoGasolina: g, razao, limite,
        vale: razao <= limite ? 'alcool' : 'gasolina',
        margem: Math.abs(razao - limite) * 100,
        precoJusto: Math.round(g * limite * 100) / 100,
        economiaPct: Math.abs(razao - limite) / limite * 100
    }
}

/** Consumo médio e custo por quilômetro. */
function consumo({ km, litros, precoLitro = 0 }) {
    const k = Number(km), l = Number(litros)
    if (!Number.isFinite(k) || !Number.isFinite(l) || k <= 0 || l <= 0) return null
    const kml = k / l
    const p = Number(precoLitro) || 0
    return {
        km: k, litros: l, kml,
        custoPorKm: p ? p / kml : null,
        custo100km: p ? (p / kml) * 100 : null,
        precoLitro: p
    }
}

/** Custo de uma viagem. */
function custoViagem({ distancia, kml, precoLitro, pedagio = 0, pessoas = 1, idaEVolta = false }) {
    const d = Number(distancia) * (idaEVolta ? 2 : 1)
    const c = Number(kml), p = Number(precoLitro)
    if (![d, c, p].every(Number.isFinite) || d <= 0 || c <= 0 || p <= 0) return null
    const litros = d / c
    const combustivel = litros * p
    const ped = Math.max(0, Number(pedagio) || 0) * (idaEVolta ? 2 : 1)
    const total = combustivel + ped
    const n = Math.max(1, Math.floor(Number(pessoas) || 1))
    return {
        distancia: d, litros, combustivel, pedagio: ped, total,
        porPessoa: total / n, pessoas: n, idaEVolta,
        custoPorKm: total / d
    }
}

/** Próxima troca de óleo. */
function proximaTroca({ kmAtual, kmUltimaTroca, intervalo = 10000 }) {
    const atual = Number(kmAtual), ultima = Number(kmUltimaTroca)
    const inter = Number(intervalo) || 10000
    if (!Number.isFinite(atual) || !Number.isFinite(ultima) || atual < ultima) return null
    const rodados = atual - ultima
    const faltam = ultima + inter - atual
    return {
        rodados, faltam, intervalo: inter,
        proxima: ultima + inter,
        vencido: faltam < 0,
        fracao: Math.min(1, rodados / inter)
    }
}

/** Total de uma multa com desconto ou agravante. */
function multaComFatores(chave, { desconto20 = false, reincidente = false } = {}) {
    const inf = INFRACOES[chave]
    if (!inf) return null
    let valor = inf.valor
    if (reincidente && /alcool|bafometro/i.test(chave)) valor *= 2
    const comDesconto = desconto20 ? valor * 0.8 : valor
    return {
        infracao: inf, valorBase: inf.valor, valor,
        valorFinal: Math.round(comDesconto * 100) / 100,
        desconto20, reincidente
    }
}

/** Luzes agrupadas por cor. */
function luzesPorCor(cor) {
    const c = String(cor || '').toLowerCase()
    return Object.entries(LUZES).filter(([, l]) => l.cor.includes(c)).map(([chave, l]) => ({ chave, ...l }))
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

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [tipo, cat] of [['luz', LUZES], ['peca', MANUTENCAO], ['infracao', INFRACOES], ['emergencia', EMERGENCIAS]]) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = {
    VIGENCIA_CTB, LUZES, MANUTENCAO, INFRACOES, EMERGENCIAS,
    alcoolOuGasolina, consumo, custoViagem, proximaTroca, multaComFatores, luzesPorCor,
    moeda, num, lerNumero, procurar
}
