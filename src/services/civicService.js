/**
 * Vida prática: documentos, direitos, primeiros socorros e golpes.
 *
 * O critério de tudo o que está aqui é o mesmo: informação que a pessoa
 * precisa no momento em que precisa, sem ter que sair do grupo para procurar.
 * Cada ficha diz o que fazer, onde fazer e o que costuma dar errado.
 *
 * Nada aqui substitui advogado, médico ou o site oficial do órgão. Os blocos
 * que exigem esse aviso o trazem no próprio texto.
 */

/** Documentos brasileiros: onde tirar, o que levar, quanto custa. */
const DOCUMENTOS = {
    rg: {
        nome: 'RG / Carteira de Identidade', orgao: 'Instituto de Identificação do estado',
        prazo: 'de 5 a 30 dias', custo: 'primeira via gratuita',
        precisa: ['Certidão de nascimento ou casamento original', 'CPF', 'Comprovante de residência', 'Foto (alguns estados tiram no local)'],
        onde: 'Poupatempo, Detran ou postos de identificação do estado',
        atencao: 'A nova Carteira de Identidade Nacional usa o número do CPF como identificador único em todo o país.'
    },
    cpf: {
        nome: 'CPF', orgao: 'Receita Federal',
        prazo: 'na hora, pela internet', custo: 'gratuito no site oficial',
        precisa: ['Documento de identidade', 'Título de eleitor (se tiver)'],
        onde: 'Site da Receita Federal, Correios, Banco do Brasil ou Caixa',
        atencao: 'Site que cobra para emitir CPF é intermediário. O oficial é gratuito.'
    },
    cnh: {
        nome: 'CNH — Carteira de Motorista', orgao: 'Detran do estado',
        prazo: 'de 2 a 6 meses no processo completo', custo: 'varia por estado',
        precisa: ['RG e CPF', 'Comprovante de residência', 'Exame médico e psicológico', 'Curso teórico e prático'],
        onde: 'Detran do estado ou autoescola credenciada',
        atencao: 'A CNH digital tem a mesma validade da física e fica no app Carteira Digital de Trânsito.'
    },
    passaporte: {
        nome: 'Passaporte', orgao: 'Polícia Federal',
        prazo: 'cerca de 6 dias úteis', custo: 'taxa federal (GRU)',
        precisa: ['Documento de identidade original', 'CPF', 'Comprovante de pagamento da GRU', 'Certidão de quitação eleitoral'],
        onde: 'Postos da Polícia Federal, com agendamento pelo site',
        atencao: 'Menor de idade precisa de autorização dos dois responsáveis.'
    },
    titulo: {
        nome: 'Título de Eleitor', orgao: 'Justiça Eleitoral',
        prazo: 'alguns dias', custo: 'gratuito',
        precisa: ['Documento oficial com foto', 'Comprovante de residência', 'Comprovante de quitação do serviço militar (homens)'],
        onde: 'Site do TSE (Título Net) ou cartório eleitoral',
        atencao: 'O e-Título no celular substitui o documento de papel na hora de votar.'
    },
    ctps: {
        nome: 'Carteira de Trabalho', orgao: 'Ministério do Trabalho',
        prazo: 'imediato', custo: 'gratuito',
        precisa: ['CPF'],
        onde: 'App Carteira de Trabalho Digital ou site gov.br',
        atencao: 'A carteira é digital desde 2019; a de papel só vale para períodos antigos.'
    },
    certidaonascimento: {
        nome: 'Certidão de Nascimento', orgao: 'Cartório de Registro Civil',
        prazo: 'na hora ou poucos dias', custo: 'primeira via gratuita',
        precisa: ['Declaração de Nascido Vivo do hospital', 'Documento dos pais'],
        onde: 'Cartório de registro civil',
        atencao: 'Segunda via pode ser pedida em qualquer cartório do país, não só no de origem.'
    },
    inss: {
        nome: 'Cadastro no INSS / NIT', orgao: 'INSS',
        prazo: 'imediato', custo: 'gratuito',
        precisa: ['CPF', 'Data de nascimento', 'Nome da mãe'],
        onde: 'App ou site Meu INSS',
        atencao: 'Contribuinte individual precisa gerar a guia GPS todo mês para o tempo contar.'
    },
    antecedentes: {
        nome: 'Certidão de Antecedentes Criminais', orgao: 'Polícia Federal ou estadual',
        prazo: 'imediato online', custo: 'gratuito',
        precisa: ['RG e CPF'],
        onde: 'Site da Polícia Federal (federal) ou da polícia civil (estadual)',
        atencao: 'Empresas costumam pedir a estadual; confira qual foi solicitada.'
    },
    gov: {
        nome: 'Conta gov.br', orgao: 'Governo Federal',
        prazo: 'imediato', custo: 'gratuito',
        precisa: ['CPF', 'Dados pessoais para validação'],
        onde: 'App ou site gov.br',
        atencao: 'Nível prata ou ouro é exigido para assinar documentos e acessar serviços sensíveis.'
    }
}

/** Direitos do consumidor com o prazo e a base legal. */
const DIREITOS = {
    arrependimento: {
        nome: 'Direito de arrependimento', prazo: '7 dias corridos', base: 'CDC, art. 49',
        resumo: 'Compra feita fora do estabelecimento — internet, telefone, porta a porta — pode ser devolvida em 7 dias contados do recebimento, sem precisar justificar.',
        comofazer: 'Avise por escrito dentro do prazo e guarde o protocolo. O frete de devolução é do fornecedor.',
        armadilha: 'O prazo conta do recebimento, não da compra. Loja física não é obrigada a aceitar arrependimento.'
    },
    garantialegal: {
        nome: 'Garantia legal', prazo: '30 dias (não duráveis) ou 90 dias (duráveis)', base: 'CDC, art. 26',
        resumo: 'Todo produto tem garantia por lei, independente da garantia do fabricante. Ela é somada à contratual, não substituída.',
        comofazer: 'Reclame ao fornecedor; ele tem 30 dias para consertar. Passou disso, você escolhe entre troca, dinheiro de volta ou abatimento.',
        armadilha: 'Vício oculto conta do momento em que o defeito aparece, não da compra.'
    },
    filaBanco: {
        nome: 'Tempo de espera em banco', prazo: 'varia por lei municipal', base: 'leis municipais',
        resumo: 'A maioria das cidades limita o tempo de fila em banco, geralmente 15 a 30 minutos.',
        comofazer: 'Peça a senha com horário impresso e registre a reclamação no Procon com ela.',
        armadilha: 'Sem a senha carimbada com hora, fica difícil provar.'
    },
    cobrancaindevida: {
        nome: 'Cobrança indevida', prazo: 'até 5 anos', base: 'CDC, art. 42',
        resumo: 'Quem paga valor cobrado indevidamente tem direito a receber o dobro, corrigido, salvo engano justificável.',
        comofazer: 'Junte a fatura, o comprovante de pagamento e o protocolo da contestação.',
        armadilha: 'A devolução em dobro exige que você tenha efetivamente pago o valor.'
    },
    negativacao: {
        nome: 'Negativação indevida', prazo: 'aviso prévio de 10 dias', base: 'CDC, art. 43',
        resumo: 'Antes de negativar, o órgão de proteção ao crédito tem que comunicar por escrito. Dívida some do cadastro após 5 anos.',
        comofazer: 'Consulte gratuitamente seu CPF nos órgãos e peça a baixa com o comprovante de quitação.',
        armadilha: 'Pagar a dívida não tira o nome sozinho: o credor precisa dar baixa em até 5 dias úteis.'
    },
    passagemaerea: {
        nome: 'Voo atrasado ou cancelado', prazo: 'a partir de 1 hora de atraso', base: 'Resolução ANAC 400',
        resumo: 'Atraso de 1 h dá direito a comunicação; 2 h, a alimentação; 4 h, a hospedagem e transporte, além de reacomodação ou reembolso integral.',
        comofazer: 'Peça tudo por escrito no balcão e registre reclamação na ANAC e no consumidor.gov.br.',
        armadilha: 'Aceitar voucher não anula o direito ao reembolso — leia o que está assinando.'
    },
    trocapresente: {
        nome: 'Troca por arrependimento em loja física', prazo: 'política da loja', base: 'CDC (por analogia)',
        resumo: 'Loja física não é obrigada a trocar produto sem defeito. Se ela anuncia política de troca, é obrigada a cumprir a própria política.',
        comofazer: 'Guarde a nota e o anúncio da política de troca.',
        armadilha: 'Muita gente confunde isso com o direito de arrependimento, que só vale para compra a distância.'
    },
    servicoessencial: {
        nome: 'Corte de água ou luz', prazo: 'aviso prévio de 15 dias', base: 'Lei 8.987/95 e normas setoriais',
        resumo: 'O corte por falta de pagamento exige aviso prévio e não pode ocorrer em sexta-feira, véspera de feriado ou fim de semana em boa parte das normas.',
        comofazer: 'Guarde o aviso recebido e questione corte sem notificação.',
        armadilha: 'Débito em discussão judicial ou administrativa não autoriza corte.'
    },
    telemarketing: {
        nome: 'Bloqueio de telemarketing', prazo: 'imediato após cadastro', base: 'normas estaduais e Anatel',
        resumo: 'É possível bloquear chamadas de telemarketing cadastrando o número no serviço "Não me perturbe" e nos programas estaduais.',
        comofazer: 'Cadastre o número no site naomeperturbe.com.br das operadoras.',
        armadilha: 'O bloqueio vale para as empresas aderentes; golpista não respeita cadastro nenhum.'
    },
    pixdevolucao: {
        nome: 'Pix enviado por engano', prazo: 'o quanto antes', base: 'regras do Banco Central',
        resumo: 'Existe o Mecanismo Especial de Devolução para casos de fraude ou falha, acionado pelo banco.',
        comofazer: 'Abra chamado no app do seu banco imediatamente e registre boletim de ocorrência se houver fraude.',
        armadilha: 'Pix por engano simples depende da boa vontade de quem recebeu; a devolução automática é para fraude e falha operacional.'
    }
}

/** Primeiros socorros — passos de emergência. */
const SOCORROS = {
    engasgo: {
        nome: 'Engasgo (obstrução das vias aéreas)', urgencia: 'alta', telefone: 'SAMU 192',
        sinais: ['Não consegue falar nem tossir', 'Leva as mãos ao pescoço', 'Lábios azulados'],
        passos: ['Se a pessoa tosse com força, incentive a tossir e não interfira.', 'Se não consegue tossir nem falar, aplique a manobra de Heimlich: abrace por trás, punho acima do umbigo, compressões para dentro e para cima.', 'Em bebês, alterne 5 tapas nas costas com 5 compressões no peito.', 'Chame o SAMU se não desobstruir em poucos ciclos.'],
        naofaca: 'Não enfie o dedo na garganta às cegas: costuma empurrar o objeto mais fundo.'
    },
    queimadura: {
        nome: 'Queimadura', urgencia: 'média a alta', telefone: 'SAMU 192',
        sinais: ['Vermelhidão e dor', 'Bolhas', 'Pele esbranquiçada ou carbonizada nos casos graves'],
        passos: ['Resfrie em água corrente fria por 10 a 20 minutos.', 'Retire anéis e roupas soltas da região antes de inchar.', 'Cubra com pano limpo e seco.', 'Procure atendimento se a área for maior que a palma da mão, no rosto, mãos ou genitais.'],
        naofaca: 'Nada de pasta de dente, manteiga, borra de café ou gelo direto na pele.'
    },
    sangramento: {
        nome: 'Sangramento intenso', urgencia: 'alta', telefone: 'SAMU 192',
        sinais: ['Sangue saindo em jato ou não parando', 'Palidez e suor frio'],
        passos: ['Faça pressão direta e firme sobre o ferimento com pano limpo.', 'Não retire o pano encharcado — coloque outro por cima.', 'Eleve o membro, se possível.', 'Chame o SAMU e mantenha a pressão até a chegada.'],
        naofaca: 'Não use torniquete improvisado sem treinamento, salvo risco de morte iminente.'
    },
    desmaio: {
        nome: 'Desmaio', urgencia: 'média', telefone: 'SAMU 192',
        sinais: ['Perda súbita de consciência', 'Palidez antes de cair', 'Recuperação em segundos'],
        passos: ['Deite a pessoa de costas e eleve as pernas cerca de 30 cm.', 'Afrouxe roupas apertadas.', 'Vire de lado se houver vômito.', 'Se não acordar em 1 minuto, chame o SAMU.'],
        naofaca: 'Não dê água nem remédio a quem está inconsciente.'
    },
    parada: {
        nome: 'Parada cardíaca', urgencia: 'máxima', telefone: 'SAMU 192',
        sinais: ['Não responde ao chamado', 'Não respira ou respira em arquejos', 'Sem pulso'],
        passos: ['Chame ajuda e peça um desfibrilador (DEA).', 'Inicie compressões no centro do peito, 100 a 120 por minuto, 5 cm de profundidade.', 'Deixe o peito voltar totalmente entre as compressões.', 'Use o DEA assim que chegar e siga as instruções em voz.'],
        naofaca: 'Não interrompa as compressões para checar pulso repetidamente.'
    },
    convulsao: {
        nome: 'Convulsão', urgencia: 'média a alta', telefone: 'SAMU 192',
        sinais: ['Movimentos involuntários', 'Rigidez', 'Perda de consciência'],
        passos: ['Afaste objetos ao redor e proteja a cabeça com algo macio.', 'Não segure a pessoa.', 'Marque o horário de início.', 'Ao terminar, vire de lado e fique junto até a consciência voltar.', 'Chame o SAMU se durar mais de 5 minutos ou se for a primeira vez.'],
        naofaca: 'Nunca coloque nada na boca da pessoa — nem colher, nem os dedos.'
    },
    fratura: {
        nome: 'Fratura ou suspeita', urgencia: 'média', telefone: 'SAMU 192',
        sinais: ['Dor intensa', 'Deformidade', 'Incapacidade de mover'],
        passos: ['Imobilize na posição encontrada, com apoio dos dois lados.', 'Aplique frio na região por cima do pano.', 'Não tente alinhar o osso.', 'Leve ao pronto-socorro ou chame o SAMU se houver osso exposto.'],
        naofaca: 'Não movimente quem tem suspeita de lesão na coluna, exceto com risco de morte no local.'
    },
    intoxicacao: {
        nome: 'Intoxicação', urgencia: 'alta', telefone: 'CEATOX 0800 722 6001',
        sinais: ['Náusea e vômito', 'Confusão', 'Queimaduras ao redor da boca em produtos corrosivos'],
        passos: ['Identifique o produto e guarde a embalagem.', 'Ligue para o centro de intoxicações antes de qualquer medida.', 'Mantenha a pessoa acordada e de lado.', 'Leve a embalagem ao hospital.'],
        naofaca: 'Não provoque vômito por conta própria: com produto corrosivo, a volta queima duas vezes.'
    },
    afogamento: {
        nome: 'Afogamento', urgencia: 'máxima', telefone: 'SAMU 192 / Bombeiros 193',
        sinais: ['Pessoa submersa ou boiando sem reagir', 'Ausência de respiração após retirada'],
        passos: ['Tire da água com segurança — jogue um flutuador antes de entrar.', 'Chame o socorro.', 'Se não respirar, inicie a reanimação com 5 ventilações e siga com compressões.', 'Mantenha aquecida após a retirada.'],
        naofaca: 'Não entre na água sem flutuador: a maioria das mortes secundárias é de quem foi salvar.'
    },
    picada: {
        nome: 'Picada de animal peçonhento', urgencia: 'alta', telefone: 'SAMU 192',
        sinais: ['Dor e inchaço no local', 'Marcas de presas', 'Mal-estar geral'],
        passos: ['Mantenha a pessoa calma e o membro elevado.', 'Lave o local com água e sabão.', 'Fotografe o animal de longe, se for seguro.', 'Leve imediatamente ao hospital com soro antiveneno.'],
        naofaca: 'Nada de torniquete, corte, sucção ou querosene. Isso piora todos os casos.'
    }
}

/** Golpes comuns e como reconhecer. */
const GOLPES = {
    falsocentral: {
        nome: 'Falsa central do banco', canal: 'telefone',
        isca: 'Ligação dizendo que houve compra suspeita no seu cartão.',
        sinal: 'Pedem que você desligue e ligue para o número do cartão — mas mantêm a linha aberta.',
        defesa: 'Desligue, espere alguns minutos ou use outro telefone antes de retornar.'
    },
    whatsappclonado: {
        nome: 'Conta de WhatsApp roubada', canal: 'mensagem',
        isca: 'Alguém pede o código de 6 dígitos que chegou por SMS.',
        sinal: 'Nenhum serviço legítimo pede seu código de verificação.',
        defesa: 'Ative a verificação em duas etapas com PIN no próprio WhatsApp.'
    },
    parentenovonumero: {
        nome: 'Parente com número novo', canal: 'mensagem',
        isca: '"Oi, mudei de número, preciso de uma ajuda urgente."',
        sinal: 'Urgência, valor por Pix e recusa em fazer chamada de voz.',
        defesa: 'Ligue para o número antigo. Combine uma pergunta de segurança em família.'
    },
    pixqrfalso: {
        nome: 'QR Code de Pix adulterado', canal: 'presencial ou boleto',
        isca: 'QR colado por cima do original em maquininha, cartaz ou boleto.',
        sinal: 'O nome do recebedor na tela não bate com o do estabelecimento.',
        defesa: 'Leia sempre o nome do recebedor antes de confirmar.'
    },
    emprestimofacil: {
        nome: 'Empréstimo com taxa antecipada', canal: 'anúncio',
        isca: 'Crédito aprovado sem consulta, mediante taxa de liberação.',
        sinal: 'Instituição legítima não cobra antecipado para liberar crédito.',
        defesa: 'Consulte se a instituição é autorizada pelo Banco Central.'
    },
    vagaemprego: {
        nome: 'Vaga de emprego falsa', canal: 'anúncio',
        isca: 'Vaga com salário alto pedindo taxa de cadastro ou exame pago.',
        sinal: 'Cobrança de qualquer valor do candidato.',
        defesa: 'Processo seletivo sério não cobra do candidato, em hipótese alguma.'
    },
    premiacao: {
        nome: 'Prêmio de sorteio que você não fez', canal: 'mensagem',
        isca: 'Você ganhou, basta pagar o frete ou o imposto.',
        sinal: 'Prêmio de sorteio do qual você nunca participou.',
        defesa: 'Ignore. Prêmio legítimo não pede pagamento para ser entregue.'
    },
    lojafantasma: {
        nome: 'Loja virtual fantasma', canal: 'site',
        isca: 'Preço muito abaixo do mercado e pagamento só por Pix.',
        sinal: 'Site novo, sem CNPJ visível e sem outra forma de pagamento.',
        defesa: 'Cheque o CNPJ, a data de criação do domínio e busque reclamações antes.'
    },
    motoboyCartao: {
        nome: 'Golpe do motoboy', canal: 'telefone e presencial',
        isca: 'Banco liga dizendo que vai buscar o cartão para destruir.',
        sinal: 'Alguém indo até sua casa buscar cartão ou documento.',
        defesa: 'Nenhum banco envia funcionário para recolher cartão. Corte o cartão você mesmo.'
    },
    investimentomilagre: {
        nome: 'Investimento com retorno garantido', canal: 'rede social',
        isca: 'Rendimento fixo altíssimo, indicação de amigos e prints de lucro.',
        sinal: 'Retorno garantido acima do mercado é o sinal clássico de pirâmide.',
        defesa: 'Verifique se a corretora tem registro na CVM antes de pôr um centavo.'
    }
}

/** Telefones úteis nacionais. */
const TELEFONES = [
    { numero: '190', servico: 'Polícia Militar', quando: 'Crime em andamento, perigo imediato' },
    { numero: '192', servico: 'SAMU', quando: 'Emergência médica' },
    { numero: '193', servico: 'Corpo de Bombeiros', quando: 'Incêndio, resgate, afogamento' },
    { numero: '180', servico: 'Central de Atendimento à Mulher', quando: 'Violência contra a mulher' },
    { numero: '100', servico: 'Direitos Humanos', quando: 'Violação de direitos, denúncia de abuso' },
    { numero: '181', servico: 'Disque Denúncia', quando: 'Denúncia anônima' },
    { numero: '188', servico: 'CVV', quando: 'Apoio emocional e prevenção do suicídio, 24 h' },
    { numero: '191', servico: 'Polícia Rodoviária Federal', quando: 'Ocorrência em rodovia federal' },
    { numero: '199', servico: 'Defesa Civil', quando: 'Enchente, deslizamento, desastre' },
    { numero: '0800 722 6001', servico: 'CEATOX', quando: 'Intoxicação e envenenamento' },
    { numero: '151', servico: 'Procon', quando: 'Reclamação de consumidor (varia por estado)' },
    { numero: '156', servico: 'Prefeitura', quando: 'Serviços municipais (varia por cidade)' }
]

/** Busca em todos os catálogos cívicos. */
function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    const fontes = [['documento', DOCUMENTOS], ['direito', DIREITOS], ['socorro', SOCORROS], ['golpe', GOLPES]]
    for (const [tipo, cat] of fontes) {
        for (const [chave, item] of Object.entries(cat)) {
            const alvo = JSON.stringify(item).toLowerCase() + ' ' + chave
            if (alvo.includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = { DOCUMENTOS, DIREITOS, SOCORROS, GOLPES, TELEFONES, procurar }
