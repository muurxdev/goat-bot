/**
 * Segurança digital: hábitos, conceitos e o que fazer quando já aconteceu.
 *
 * Complementa o catálogo de golpes (civicService): lá está como reconhecer a
 * armadilha, aqui está como não cair e o que fazer depois que caiu.
 *
 * Nota de escrita: nada aqui usa "backup", "hacker" ou vocabulário de bastidor.
 * Não é preciosismo — o público lê "cópia de segurança" e entende na hora, e o
 * tradutor de lore do bot troca "backup" por um termo do Reino que atrapalharia
 * uma instrução de emergência.
 */

const CONCEITOS = {
    duasetapas: { nome: 'Verificação em duas etapas', dificuldade: 'fácil', impacto: 'altíssimo',
        oquee: 'Além da senha, exige um segundo fator: um código, um aplicativo autenticador ou uma chave física.',
        porque: 'Mesmo que descubram sua senha, sem o segundo fator não entram. É a medida isolada que mais protege uma conta.',
        como: 'Ative em tudo que tem: aplicativo de mensagem, e-mail, banco, redes sociais. Prefira aplicativo autenticador a código por mensagem de texto.',
        pegadinha: 'Código por SMS pode ser interceptado por troca de chip. Aplicativo autenticador não depende da operadora.' },
    senhaforte: { nome: 'Senha forte', dificuldade: 'fácil', impacto: 'alto',
        oquee: 'Tamanho importa mais que símbolo esquisito. Uma frase longa vence uma sequência curta e complicada.',
        porque: 'Ataques testam bilhões de combinações por segundo. Cada caractere a mais multiplica o tempo necessário.',
        como: 'Use uma frase de quatro ou cinco palavras sem relação entre si. "cavalo-janela-forno-azul" é mais forte e mais fácil de lembrar que "P@ss1234".',
        pegadinha: 'Trocar "a" por "@" e "o" por "0" não engana nada: os programas de quebra testam essas substituições primeiro.' },
    senharepetida: { nome: 'Senha repetida', dificuldade: 'fácil', impacto: 'altíssimo',
        oquee: 'Usar a mesma senha em vários lugares.',
        porque: 'Quando um site vaza, quem tem a lista testa aquele e-mail e aquela senha em todos os outros serviços. É automático e leva segundos.',
        como: 'Senha única para cada serviço, guardada num cofre de senhas. As críticas — e-mail principal e banco — nunca se repetem em lugar nenhum.',
        pegadinha: 'O e-mail principal é a chave-mestra: com ele se recupera a senha de todo o resto. Ele merece a senha mais forte e as duas etapas.' },
    cofresenhas: { nome: 'Cofre de senhas', dificuldade: 'média', impacto: 'alto',
        oquee: 'Programa que guarda todas as suas senhas cifradas atrás de uma senha-mestra.',
        porque: 'Resolve o problema real: ninguém consegue memorizar dezenas de senhas diferentes, então acaba repetindo.',
        como: 'Escolha um cofre conhecido, crie uma senha-mestra longa e ative as duas etapas nele também.',
        pegadinha: 'Perder a senha-mestra costuma significar perder tudo. Guarde o código de recuperação em papel, fora do computador.' },
    phishing: { nome: 'Phishing (pesca de dados)', dificuldade: 'fácil', impacto: 'alto',
        oquee: 'Mensagem que finge ser de uma empresa conhecida para você digitar senha ou dados em página falsa.',
        porque: 'É a porta de entrada da maioria dos ataques a pessoas comuns. Não depende de falha técnica, e sim de pressa.',
        como: 'Nunca entre por link recebido. Abra o aplicativo ou digite o endereço você mesmo. Confira o remetente inteiro, não só o nome exibido.',
        pegadinha: 'Urgência é a assinatura do golpe: "sua conta será encerrada hoje". Empresa séria não resolve nada com prazo de duas horas.' },
    engenhariasocial: { nome: 'Engenharia social', dificuldade: 'média', impacto: 'alto',
        oquee: 'Manipular a pessoa em vez de atacar o sistema. O alvo é a confiança, não o programa.',
        porque: 'É mais barato convencer alguém a abrir a porta do que arrombá-la, e funciona muito melhor.',
        como: 'Desconfie de qualquer contato que combine autoridade, urgência e sigilo. Confirme por um canal que VOCÊ escolheu.',
        pegadinha: 'O golpista muitas vezes já sabe seu nome, CPF e onde você comprou. Saber seus dados não prova que ele é quem diz ser.' },
    criptografia: { nome: 'Criptografia de ponta a ponta', dificuldade: 'conceito', impacto: 'alto',
        oquee: 'A mensagem é embaralhada no seu aparelho e só desembaralhada no aparelho de quem recebe.',
        porque: 'Nem o serviço que transporta consegue ler o conteúdo.',
        como: 'Vem ligada por padrão nos principais aplicativos de mensagem. Confira o código de segurança da conversa com quem importa.',
        pegadinha: 'Protege o transporte, não as pontas. Quem tem seu celular desbloqueado lê tudo, e a cópia na nuvem pode não ter a mesma proteção.' },
    vazamento: { nome: 'Vazamento de dados', dificuldade: 'conceito', impacto: 'variável',
        oquee: 'Quando uma empresa perde o controle da base e os dados dos clientes vão parar em mãos alheias.',
        porque: 'Você não tem culpa e não tem controle. O que dá para controlar é o estrago: senha única e duas etapas.',
        como: 'Ao saber de um vazamento, troque a senha daquele serviço e de qualquer outro onde ela se repetia.',
        pegadinha: 'Dado vazado não expira. CPF, nome da mãe e endereço servem para golpe anos depois.' },
    redepublica: { nome: 'Wi-Fi público', dificuldade: 'fácil', impacto: 'médio',
        oquee: 'Rede aberta de aeroporto, café ou shopping, compartilhada com desconhecidos.',
        porque: 'Quem controla a rede vê para onde você vai, e uma rede falsa com nome parecido é trivial de montar.',
        como: 'Evite banco e compra em rede pública. Usar os dados do próprio celular é mais seguro que qualquer Wi-Fi aberto.',
        pegadinha: 'Rede sem senha nenhuma que aparece com o nome do estabelecimento pode ter sido criada por qualquer pessoa sentada ali.' },
    permissoes: { nome: 'Permissões de aplicativo', dificuldade: 'fácil', impacto: 'médio',
        oquee: 'O acesso que cada aplicativo pede a câmera, microfone, contatos, localização e arquivos.',
        porque: 'Aplicativo de lanterna não precisa dos seus contatos. Permissão demais é coleta de dados, não funcionalidade.',
        como: 'Revise as permissões nas configurações do celular. Prefira "permitir só ao usar" em localização e câmera.',
        pegadinha: 'Permissão concedida uma vez fica valendo para sempre até você revogar. Vale revisar a lista uma vez por ano.' },
    atualizacao: { nome: 'Atualizar o sistema', dificuldade: 'fácil', impacto: 'alto',
        oquee: 'As atualizações fecham falhas já conhecidas e já publicadas.',
        porque: 'A maioria dos ataques usa falha antiga, com correção disponível há meses. Quem atualiza sai da lista fácil.',
        como: 'Deixe a atualização automática ligada no celular e no computador.',
        pegadinha: 'Aparelho que parou de receber atualização do fabricante não fica igual: fica cada vez mais exposto com o tempo.' },
    dispositivosconectados: { nome: 'Sessões e aparelhos conectados', dificuldade: 'fácil', impacto: 'alto',
        oquee: 'A lista de aparelhos logados na sua conta agora.',
        porque: 'É onde aparece o intruso. Um aparelho desconhecido na lista é sinal claro de conta comprometida.',
        como: 'Revise em aplicativos de mensagem, e-mail e redes sociais. Desconecte o que não reconhecer e troque a senha em seguida.',
        pegadinha: 'Desconectar sem trocar a senha resolve por pouco tempo: quem tem a senha entra de novo.' },
    copiaseguranca: { nome: 'Cópia de segurança', dificuldade: 'fácil', impacto: 'alto',
        oquee: 'Uma segunda via dos seus arquivos, guardada em outro lugar.',
        porque: 'Protege do que a senha não protege: celular roubado, aparelho quebrado, arquivo sequestrado.',
        como: 'Regra dos três: duas cópias em lugares diferentes e uma fora de casa (nuvem ou disco na casa de alguém).',
        pegadinha: 'Cópia que nunca foi testada não é cópia. Restaure um arquivo de vez em quando para saber se funciona.' },
    biometria: { nome: 'Biometria', dificuldade: 'fácil', impacto: 'médio',
        oquee: 'Desbloqueio por digital ou rosto.',
        porque: 'Mais prático que senha e, na prática, faz a pessoa proteger o aparelho — o que ela não faria com senha longa.',
        como: 'Use, mas mantenha uma senha ou PIN forte por trás: a biometria é atalho, e a senha é o que realmente tranca.',
        pegadinha: 'Você pode trocar uma senha vazada. Não pode trocar sua digital.' }
}

const SITUACOES = {
    contaroubada: { nome: 'Roubaram sua conta de mensagem', urgencia: 'máxima', janela: 'os primeiros minutos decidem',
        passos: ['Tente entrar de novo: o aplicativo envia um novo código por mensagem para o seu número.', 'Se conseguir entrar, o invasor cai automaticamente.', 'Ative a verificação em duas etapas com PIN imediatamente.', 'Avise seus contatos por outro canal: o golpista vai pedir dinheiro para eles agora.', 'Registre boletim de ocorrência.'],
        evitar: 'Ter as duas etapas ligadas antes torna esse golpe quase impossível — o código sozinho não basta para entrar.' },
    celularroubado: { nome: 'Celular roubado ou perdido', urgencia: 'máxima', janela: 'primeiras horas',
        passos: ['De outro aparelho, use o serviço de localização do fabricante para bloquear e apagar remotamente.', 'Ligue para a operadora e bloqueie o chip e o aparelho pelo IMEI.', 'Troque a senha do e-mail principal primeiro — é ele que recupera todo o resto.', 'Desconecte o aparelho das suas contas nas listas de sessões ativas.', 'Avise o banco e registre boletim de ocorrência.'],
        evitar: 'Anote o IMEI hoje (disque *#06#) e guarde fora do celular. Sem ele, o bloqueio na operadora demora.' },
    perfilclonado: { nome: 'Clonaram seu perfil', urgencia: 'alta', janela: 'horas',
        passos: ['Denuncie o perfil falso dentro da própria rede social.', 'Avise publicamente seus contatos que existe um perfil falso.', 'Guarde prints do perfil e das mensagens enviadas por ele.', 'Se houve pedido de dinheiro, registre boletim de ocorrência.'],
        evitar: 'Perfil fechado e lista de amigos oculta reduzem muito a matéria-prima do clone: foto e lista de contatos.' },
    senhavazada: { nome: 'Sua senha vazou', urgencia: 'alta', janela: 'no mesmo dia',
        passos: ['Troque a senha daquele serviço.', 'Troque em TODOS os outros onde você usava a mesma.', 'Ative a verificação em duas etapas.', 'Revise a lista de aparelhos conectados e desconecte o que não reconhecer.'],
        evitar: 'Senha única por serviço transforma um vazamento num problema pequeno em vez de uma reação em cadeia.' },
    emailinvadido: { nome: 'Invadiram seu e-mail', urgencia: 'máxima', janela: 'imediata',
        passos: ['Troque a senha e encerre todas as sessões ativas.', 'Ative a verificação em duas etapas.', 'Confira as regras de encaminhamento: o invasor costuma deixar uma cópia sendo enviada a ele.', 'Verifique o endereço de recuperação — ele pode ter trocado pelo dele.', 'Avise contatos e revise as contas que usam esse e-mail.'],
        evitar: 'O e-mail principal é a chave-mestra da vida digital. Merece a senha mais forte e as duas etapas antes de qualquer outro serviço.' },
    cartaoclonado: { nome: 'Cartão clonado', urgencia: 'alta', janela: 'assim que perceber',
        passos: ['Bloqueie o cartão pelo aplicativo do banco, na hora.', 'Conteste as compras não reconhecidas por escrito e guarde o protocolo.', 'Peça a segunda via com número novo.', 'Registre boletim de ocorrência se o valor for alto.'],
        evitar: 'Use cartão virtual para compra na internet e ative aviso de compra por mensagem: você descobre em segundos, não no fim do mês.' },
    sextorsao: { nome: 'Chantagem com foto íntima', urgencia: 'alta', janela: 'não pague nunca',
        passos: ['Não pague. Pagar não encerra a chantagem, confirma que você paga.', 'Não apague as conversas: são prova.', 'Faça prints de tudo, incluindo perfil e dados do chantagista.', 'Registre boletim e procure a delegacia de crimes cibernéticos.', 'Denuncie o perfil na plataforma e peça a remoção do conteúdo.'],
        evitar: 'É crime de extorsão, e a vítima não fez nada de errado. Vergonha é a arma principal do chantagista.' },
    contafalsa: { nome: 'Criaram uma conta com seu nome', urgencia: 'média', janela: 'dias',
        passos: ['Denuncie por falsidade de identidade na plataforma; costuma haver um formulário próprio.', 'Envie documento com foto se a plataforma pedir.', 'Avise seus contatos.', 'Guarde prints com data.'],
        evitar: 'Contas verificadas e perfis com menos exposição pública são alvos menos convenientes.' },
    criancaonline: { nome: 'Criança ou adolescente na internet', urgencia: 'contínua', janela: 'prevenção',
        passos: ['Converse antes de bloquear: filtro sem conversa só empurra para o celular do amigo.', 'Combine que nenhum adulto desconhecido pede segredo — segredo com adulto é o sinal de alerta.', 'Configure controles parentais e mantenha o aparelho em área comum da casa.', 'Denuncie abuso ao 100 (Direitos Humanos) e à polícia.'],
        evitar: 'O aliciamento começa com amizade e elogio, não com ameaça. Ensinar a reconhecer isso vale mais que qualquer filtro.' },
    pixerrado: { nome: 'Transferência para a pessoa errada', urgencia: 'alta', janela: 'o quanto antes',
        passos: ['Abra chamado no aplicativo do banco imediatamente.', 'Se houve fraude, peça o mecanismo especial de devolução.', 'Registre boletim de ocorrência em caso de golpe.', 'Guarde comprovante e protocolos.'],
        evitar: 'Confira sempre o NOME do recebedor na tela de confirmação. É o último ponto em que dá para voltar atrás.' }
}

/** Avalia uma senha sem nunca guardá-la nem exibi-la de volta. */
function avaliarSenha(senha) {
    const s = String(senha || '')
    if (!s) return null
    const tem = {
        minuscula: /[a-z]/.test(s),
        maiuscula: /[A-Z]/.test(s),
        numero: /[0-9]/.test(s),
        simbolo: /[^A-Za-z0-9]/.test(s)
    }
    const alfabeto = (tem.minuscula ? 26 : 0) + (tem.maiuscula ? 26 : 0) + (tem.numero ? 10 : 0) + (tem.simbolo ? 33 : 0)
    // Entropia em bits: log2(alfabeto^tamanho)
    const bits = alfabeto > 1 ? s.length * (Math.log(alfabeto) / Math.log(2)) : 0

    // Padrões que derrubam a força real muito abaixo do que a entropia sugere.
    const fraquezas = []
    if (s.length < 12) fraquezas.push('Curta demais: menos de 12 caracteres')
    if (/^[0-9]+$/.test(s)) fraquezas.push('Só números')
    if (/(.)\1{2,}/.test(s)) fraquezas.push('Caractere repetido em sequência')
    if (/(012|123|234|345|456|567|678|789|890)/.test(s)) fraquezas.push('Sequência numérica previsível')
    if (/(abc|qwer|asdf|zxcv)/i.test(s)) fraquezas.push('Sequência de teclado')
    if (/(senha|password|admin|1234|amor|deus|brasil)/i.test(s)) fraquezas.push('Contém palavra muito comum em listas de ataque')
    if (/^\d{2}[\/\-.]?\d{2}[\/\-.]?\d{2,4}$/.test(s)) fraquezas.push('Parece uma data')

    const penalidade = fraquezas.length * 12
    const efetivo = Math.max(0, bits - penalidade)

    // 100 bilhões de tentativas por segundo é a ordem de grandeza de um ataque
    // moderno com hardware dedicado contra hash rápido.
    const combinacoes = Math.pow(2, efetivo)
    const segundos = combinacoes / 1e11

    // O nível sai do TEMPO, não dos bits. Classificar por entropia e mostrar o
    // tempo ao lado produzia contradição visível: "161 horas — Forte". Quem lê
    // acredita no número, e o número dizia uma semana.
    const HORA = 3600, DIA = 86400, ANO = 31536000
    const faixas = [
        [HORA, 'Muito fraca', '🔴'],
        [30 * DIA, 'Fraca', '🟠'],
        [10 * ANO, 'Razoável', '🟡'],
        [1000 * ANO, 'Forte', '🟢'],
        [Infinity, 'Muito forte', '💚']
    ]
    const [, nivel, emoji] = faixas.find(([lim]) => segundos < lim)

    return { tamanho: s.length, tem, alfabeto, bits, efetivo, fraquezas, nivel, emoji, segundos }
}

/** Tempo legível a partir de segundos. */
function tempoLegivel(segundos) {
    const s = Number(segundos)
    if (!Number.isFinite(s)) return '—'
    if (s < 1) return 'menos de um segundo'
    // Acima da idade do universo, o número exato não informa nada a ninguém.
    // "10^21 milênios" e "10^30 milênios" são a mesma frase na cabeça de quem lê.
    if (s > 4.35e17) return 'mais que a idade do universo'
    const unidades = [
        [60, 'segundo'], [60, 'minuto'], [24, 'hora'], [365, 'dia'], [100, 'ano'], [10, 'século'], [1000, 'milênio']
    ]
    let valor = s, nome = 'segundo'
    for (const [fator, prox] of unidades) {
        if (valor < fator) break
        valor /= fator
        nome = prox
    }
    const n = valor >= 100 ? Math.round(valor) : Math.round(valor * 10) / 10
    const plural = n === 1 ? '' : (nome === 'mês' ? 'es' : 's')
    return n.toLocaleString('pt-BR') + ' ' + nome + plural
}

/** Gera uma frase-senha memorizável a partir de palavras sorteadas. */
const PALAVRAS = [
    'cavalo', 'janela', 'forno', 'nuvem', 'pedra', 'faca', 'tigre', 'porta', 'chuva', 'barco',
    'sino', 'vento', 'folha', 'lampada', 'ponte', 'sabao', 'cacto', 'moeda', 'trilho', 'vidro',
    'raiz', 'panela', 'cofre', 'agulha', 'bussola', 'martelo', 'espelho', 'lanterna', 'corda', 'telhado',
    'bambu', 'carvao', 'peneira', 'balde', 'gaveta', 'tijolo', 'prego', 'colher', 'cinzeiro', 'tapete'
]

function fraseSenha(palavras = 4, comNumero = true) {
    const n = Math.max(3, Math.min(8, Math.floor(Number(palavras) || 4)))
    const escolhidas = []
    const disponiveis = [...PALAVRAS]
    for (let i = 0; i < n; i++) {
        const k = Math.floor(Math.random() * disponiveis.length)
        escolhidas.push(disponiveis.splice(k, 1)[0])
    }
    let frase = escolhidas.join('-')
    if (comNumero) frase += '-' + (Math.floor(Math.random() * 90) + 10)
    return { frase, palavras: n, avaliacao: avaliarSenha(frase) }
}

function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    for (const [tipo, cat] of [['pratica', CONCEITOS], ['emergencia', SITUACOES]]) {
        for (const [chave, item] of Object.entries(cat)) {
            if ((JSON.stringify(item) + chave).toLowerCase().includes(t)) achados.push({ tipo, chave, nome: item.nome })
        }
    }
    return achados
}

module.exports = { CONCEITOS, SITUACOES, avaliarSenha, tempoLegivel, fraseSenha, procurar }
