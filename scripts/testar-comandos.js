/**
 * Auditoria completa dos comandos: executa TODOS e classifica a resposta.
 *
 * Diferença para scripts/audit-commands.js (que só vê se lançou erro):
 *   - detecta MUDO (executa sem erro e não responde nada) e OCO (responde lixo)
 *   - isola rede/binarios antes de carregar qualquer comando (o .env tem uma
 *     chave rk_live_ da Stripe; sem isto a auditoria pode cobrar de verdade)
 *   - separa "quebrou sozinho" de "quebrou porque a rede era falsa"
 *   - roda os dois caminhos: execute() direto e dispatch() completo
 *
 * Uso:
 *   node scripts/testar-comandos.js                 # passe execute, tudo
 *   node scripts/testar-comandos.js --passe=dispatch
 *   node scripts/testar-comandos.js --cat=media --citada=imagem
 */
process.env.NODE_ENV = 'test'

const path = require('path')
const fs = require('fs')
const os = require('os')

// Banco descartavel: nem o database.test.sqlite e tocado.
const BANCO_TEMP = path.join(os.tmpdir(), 'goat-auditoria-' + Date.now() + '.sqlite')
process.env.DB_PATH = BANCO_TEMP

// O isolamento entra ANTES de qualquer require de comando/servico.
const stub = require('../tests/helpers/stubExterno')
const { criarCtx, lerFixture } = require('../tests/helpers/ctxFalso')

const FIXTURE_IMAGEM = lerFixture('imagem')
stub.instalar({
    permitirFfmpeg: true,
    baileys: FIXTURE_IMAGEM
        ? {
            downloadMediaMessage: async () => FIXTURE_IMAGEM,
            downloadContentFromMessage: async function * () { yield FIXTURE_IMAGEM }
        }
        : null
})
const { molduraQuebrada } = require('../tests/helpers/moldura')

// Pega a ÚLTIMA ocorrência: assim `--passe=execute ... --passe=dispatch` vale o
// dispatch, como todo mundo espera de linha de comando. Com `find` (primeira),
// um passe pedido no fim era silenciosamente ignorado.
const arg = (nome, padrao) => {
    const achados = process.argv.filter(x => x.startsWith('--' + nome + '='))
    // slice em vez de split('=')[1]: senão `--args=a=b` virava só "a".
    return achados.length ? achados[achados.length - 1].slice(nome.length + 3) : padrao
}

const PASSE = arg('passe', 'execute')
const CATEGORIA = arg('cat', null)
const CITADA = arg('citada', null)
const ARGS = arg('args', 'vazio')
const PAPEL = arg('papel', 'dono')
const ESCOPO = arg('escopo', 'grupo')
const EXEMPLO = parseInt(arg('exemplo', '0'), 10)
const LIMITE = parseInt(arg('limite', '0'), 10)
const TEMPO_LIMITE = parseInt(arg('timeout', '5000'), 10)

// Comandos que nao podem rodar nem com stub: matam o processo do harness.
const NUNCA_RODAR = new Set(['shutdown', 'desligar', 'restart', 'reiniciar'])

// Marcadores FORTES de comando inacabado. Nada de "ainda não" ou "placeholder"
// soltos: "você ainda não tem saldo" e a lista com JSONPlaceholder sao respostas
// legitimas, e a primeira versao deste script marcou 73 delas como defeito.
// "em desenvolvimento" e "todo:" sairam: colidem com portugues legitimo
// ("TypeScript, usada em desenvolvimento web"; "todo:" dentro de frase).
const PLACEHOLDERS = [
    'nao implementado', 'não implementado', 'em construcao', 'em construção',
    'funcionalidade futura', 'fixme', 'wip:', 'comando incompleto'
]
// "em breve" so conta se a resposta inteira for curta (aviso de coisa que falta,
// nao "nova rodada em breve" no fim de um texto legitimo).
const PLACEHOLDER_SE_CURTO = ['em breve', 'aguarde a proxima versao', 'aguarde a próxima versão']
// Interpolacao vazada. Vira classe propria ("suspeito") porque comandos de
// programacao falam de `undefined`/`NaN` legitimamente.
// '{{' e '}}' sairam: .gerarsenha produz senha aleatoria que cai nisso por acaso.
const LIXO = ['undefined', 'NaN', '[object Object]']

const dispatcher = require('../src/handlers/commandDispatcher')

function prepararBanco () {
    // getDatabase() ja aplica as migrations do migrator.js ao abrir a conexao.
    const { getDatabase } = require('../src/database/connection')
    return getDatabase()
}

/**
 * O logger escreve direto no console e nao tem nivel configuravel. Silenciar e
 * necessario para ler o relatorio, mas o que foi logado e sinal: um comando que
 * responde bonito e loga ERROR por baixo esta falhando escondido.
 */
function capturarConsole () {
    const real = { log: console.log, warn: console.warn, error: console.error }
    let linhas = []
    console.log = (...a) => linhas.push(['log', a.join(' ')])
    console.warn = (...a) => linhas.push(['warn', a.join(' ')])
    console.error = (...a) => linhas.push(['error', a.join(' ')])
    return {
        colher () { const l = linhas; linhas = []; return l },
        restaurar () { console.log = real.log; console.warn = real.warn; console.error = real.error },
        real
    }
}

/**
 * Sao DUAS costuras de download, nao uma:
 *   1. mediaService.downloadWhatsAppMedia — usada por .fig/.sticker
 *   2. downloadMediaMessage do proprio Baileys — 19 comandos chamam direto
 * Sem a segunda, os 12 filtros de imagem (.blur, .sepia, .nobg...) falham no
 * teste com "nao consegui aplicar", e o sharp nunca chega a rodar.
 */
function stubarDownloadDeMidia () {
    if (!FIXTURE_IMAGEM) return false
    // O download do Baileys ja foi trocado na instalacao do stub (Module._load).
    // Falta a outra costura: o mediaService, usado por .fig/.sticker.
    try {
        const mediaService = require('../src/services/mediaService')
        if (typeof mediaService.downloadWhatsAppMedia === 'function') {
            mediaService.downloadWhatsAppMedia = async () => FIXTURE_IMAGEM
        }
    } catch (err) {
        console.error('[AUDITORIA] nao consegui stubar mediaService: ' + err.message)
    }
    return true
}

function textoDasRespostas (respostas, envios) {
    const partes = respostas.map(r => r.texto)
    for (const e of envios) {
        const c = e.conteudo || {}
        if (typeof c.text === 'string') partes.push(c.text)
        else if (typeof c.caption === 'string') partes.push(c.caption)
        else if (c.poll) partes.push('[ENQUETE] ' + (c.poll.name || ''))
        else if (c.contacts || c.location) partes.push('[CARTAO]')
        else if (c.image || c.video || c.audio || c.sticker || c.document) partes.push('[MIDIA]')
        else if (c.forward || c.delete || c.react) partes.push('[ACAO]')
    }
    return partes
}

function classificar (resultado) {
    const { erro, tempoEsgotado, respostas, envios, reacoes } = resultado
    if (tempoEsgotado) return { classe: 'travado', motivo: 'nao retornou em ' + TEMPO_LIMITE + 'ms' }
    if (erro) return { classe: 'quebrado', motivo: erro }

    const partes = textoDasRespostas(respostas, envios)
    if (partes.length === 0) {
        if (reacoes.length > 0) return { classe: 'mudo', motivo: 'so reagiu com emoji, sem mensagem' }
        return { classe: 'mudo', motivo: 'executou sem erro e nao respondeu nada' }
    }

    const juntos = partes.join('\n')
    const baixo = juntos.toLowerCase()

    // Respostas do dispatcher que NAO sao o comando trabalhando: para o usuario
    // final o comando "nao fez nada", mesmo tendo respondido alguma coisa.
    if (baixo.includes('está desligado aqui') || baixo.includes('esta desligado aqui')) {
        return { classe: 'desligado', motivo: 'camada opt-in: comando desligado no escopo' }
    }
    // Só conta como barrado se a resposta INTEIRA for o aviso. Um painel de
    // grupo que explica "só a administração pode mandar mensagem" é resposta
    // legítima, e a primeira versão marcou 14 dessas como barradas.
    // 'sem permiss' saiu: as regras de grupo dizem "sem divulgação sem permissão".
    if (juntos.length < 260 && /(apenas|somente|só)\s+(os?\s+)?(dono|admin|administrador)|você não pode usar|voce nao pode usar|não é admin|nao e admin|só funciona em grupo|somente em grupo|use em um grupo|reservado aos donos|precisa do cargo/.test(baixo)) {
        return { classe: 'barrado', motivo: 'barrado por permissao/escopo' }
    }

    if (juntos.trim() === '') return { classe: 'oco', motivo: 'resposta vazia' }

    for (const p of PLACEHOLDERS) {
        if (baixo.includes(p)) return { classe: 'oco', motivo: 'inacabado: "' + p + '"' }
    }
    if (juntos.length < 160) {
        for (const p of PLACEHOLDER_SE_CURTO) {
            if (baixo.includes(p)) return { classe: 'oco', motivo: 'inacabado (resposta curta): "' + p + '"' }
        }
    }
    for (const l of LIXO) {
        if (juntos.includes(l)) return { classe: 'suspeito', motivo: 'possivel interpolacao vazada: "' + l + '"' }
    }
    const defeito = molduraQuebrada(juntos)
    if (defeito) return { classe: 'suspeito', motivo: 'moldura: ' + defeito }

    return { classe: 'ok', motivo: partes.length + ' resposta(s), ' + juntos.length + ' chars' }
}

/**
 * Argumentos vindos do que o PRÓPRIO comando documenta.
 * Com args vazios a auditoria só exercita a guarda de entrada ("uso: ..."),
 * nunca o trabalho. `examples` tem a forma "base64 Olá Mundo — codifica...",
 * então o que vem antes do travessão é entrada real de usuário.
 */
function argsDoExemplo (cmd) {
    if (Array.isArray(cmd.examples) && cmd.examples.length) {
        // --exemplo=1 roda a SEGUNDA forma documentada: variar a entrada pega
        // caminho que o primeiro exemplo não toca (ex.: .sorteardata com faixa).
        const indice = Math.min(EXEMPLO, cmd.examples.length - 1)
        const bruto = String(cmd.examples[indice] || '')
        // Só travessão (— –), nunca hífen: "2x² - 5x + 3 = 0 — duas raízes"
        // virava args=['2x²'] e o comando era auditado com entrada inventada.
        const antes = bruto.split(/\s[—–]\s/)[0].trim()
        return antes ? antes.split(/\s+/) : []
    }
    if (typeof cmd.usage === 'string' && cmd.usage.trim()) {
        return argsDoUso(cmd.usage)
    }
    return []
}

/** Sintetiza entrada a partir de "<tipo> <texto>" / "[quantidade]d<faces>". */
function argsDoUso (uso) {
    const obrigatorios = String(uso).match(/<[^>]+>/g) || []
    const saida = []
    for (const campo of obrigatorios) {
        const nome = campo.slice(1, -1).toLowerCase()
        if (/link|url|site/.test(nome)) saida.push('https://exemplo.com/pagina')
        else if (/numero|quantidade|qtd|valor|n$|faces/.test(nome)) saida.push('5')
        else if (/@|usuario|membro|alvo/.test(nome)) saida.push('5511999990002')
        else if (/texto|frase|mensagem|palavra|termo|busca|nome|titulo/.test(nome)) saida.push('teste')
        else saida.push('teste')
    }
    return saida
}

function pedeMidiaCitada (partes) {
    const t = partes.join(' ').toLowerCase()
    return /marque|responda|cite|mencione|envie uma (imagem|foto|figurinha)|marcando/.test(t)
}

function semChave (partes) {
    const t = partes.join(' ').toLowerCase()
    return /chave|api key|api_key|nao configurad|não configurad|indisponivel no momento|sem provedor/.test(t)
}

async function comTempoLimite (fn, ms) {
    let timer
    const corrida = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('__TEMPO__')), ms) })
    try {
        return await Promise.race([Promise.resolve().then(fn), corrida])
    } finally {
        clearTimeout(timer)
    }
}

async function rodar () {
    console.log('[AUDITORIA] banco descartavel: ' + BANCO_TEMP)
    prepararBanco()
    // O grupo/PV do teste entram como em produção (provisionIfNew na primeira mensagem). Sem isso,
    // num banco virgem TODO comando responde "está desligado aqui" para quem não é dono e a
    // auditoria do papel `comum` não diz nada. --modulos=desligados volta ao banco virgem.
    if (arg('modulos', 'padrao') !== 'desligados') {
        const moduleState = require('../src/services/moduleStateService')
        moduleState.provisionIfNew(moduleState.PV_SCOPE)
        moduleState.provisionIfNew('120363000000000000@g.us')
    }
    // Modo Aluguel liga por padrão: num banco virgem o grupo está "sem plano ativo" e TODO comando de
    // quem não é dono responde só o aviso de assinatura (4.399 de 4.569 na primeira auditoria do papel
    // `comum`). Para auditar o comando em si, o aluguel fica desligado; --aluguel=padrao mantém.
    if (arg('aluguel', 'desligado') !== 'padrao') {
        try {
            await require('../src/services/rentalService').setRentalMode(false)
        } catch (err) {
            console.error('[AUDITORIA] nao desliguei o Modo Aluguel: ' + err.message)
        }
    }
    const temFixture = stubarDownloadDeMidia()
    console.log('[AUDITORIA] fixture de imagem: ' + (temFixture ? 'carregada' : 'AUSENTE'))

    dispatcher.loadCommands()
    const comandos = dispatcher.getCommands()

    // process.exit blindado: um comando que chame exit nao derruba a auditoria.
    const exitReal = process.exit.bind(process)
    process.exit = (codigo) => { throw new Error('process.exit(' + codigo + ') chamado pelo comando') }

    const vistos = new Set()
    const alvos = []
    for (const [nome, cmd] of comandos) {
        if (vistos.has(cmd)) continue
        vistos.add(cmd)
        if (CATEGORIA && cmd.category !== CATEGORIA) continue
        alvos.push({ nome, cmd })
    }
    const lista = LIMITE > 0 ? alvos.slice(0, LIMITE) : alvos

    console.log('[AUDITORIA] passe=' + PASSE + ' | args=' + ARGS + ' | comandos=' + lista.length + ' | citada=' + (CITADA || 'nenhuma'))

    const registros = []
    const inicio = Date.now()
    let feitos = 0

    // Erro assincrono sem tratador (ex.: spawn que emite 'error' e ninguem ouve)
    // derruba o processo inteiro. Em producao isso mata o bot; aqui a gente
    // registra de quem foi e segue.
    // A atribuição é por APROXIMAÇÃO, e o relatório diz isso: um comando
    // abandonado no timeout pode estourar depois, enquanto outro roda, e o erro
    // seria creditado ao inocente. Por isso guardamos também os que ainda estão
    // pendentes no momento do erro, em vez de apontar um culpado só.
    const naoCapturados = []
    let emExecucao = null
    const pendentes = new Set()
    const anotar = (tipo) => (e) => {
        naoCapturados.push({
            executandoNoMomento: emExecucao,
            abandonadosAindaVivos: [...pendentes],
            erro: String(e && e.message ? e.message : e).slice(0, 200),
            tipo
        })
    }
    process.on('uncaughtException', anotar('uncaughtException'))
    process.on('unhandledRejection', anotar('unhandledRejection'))

    const consola = capturarConsole()

    for (const { nome, cmd } of lista) {
        emExecucao = nome
        feitos++
        if (feitos % 500 === 0) {
            const seg = ((Date.now() - inicio) / 1000).toFixed(0)
            consola.real.log('  ... ' + feitos + '/' + lista.length + ' (' + seg + 's)')
        }

        if (NUNCA_RODAR.has(String(cmd.name).toLowerCase())) {
            registros.push({ nome, arquivo: null, categoria: cmd.category, classe: 'pulado', motivo: 'derruba o processo' })
            continue
        }

        stub.marcarComando(nome)
        consola.colher()
        const httpAntes = stub.chamadas.http.length
        const binAntes = stub.chamadas.bin.length

        const args = ARGS === 'exemplos' ? argsDoExemplo(cmd) : []
        const comum = PAPEL === 'comum'
        const { ctx, respostas, reacoes, envios } = criarCtx({
            cmd,
            args,
            // Um remetente por comando: o limite de flood (securityService) é por pessoa, e 4.500 comandos
            // do MESMO usuário em 2 s só devolviam "Foram muitos comandos seguidos" ao papel `comum`.
            // O dono é isento do limite e fica com o remetente padrão.
            sender: comum ? `5511988${String(feitos).padStart(6, '0')}@s.whatsapp.net` : undefined,
            citada: CITADA,
            isGroup: ESCOPO !== 'pv',
            isOwner: !comum,
            isAdmin: !comum,
            isBotAdmin: !comum
        })

        let erro = null
        let tempoEsgotado = false
        try {
            if (PASSE === 'dispatch') {
                await comTempoLimite(() => dispatcher.dispatch(ctx), TEMPO_LIMITE)
            } else {
                await comTempoLimite(() => cmd.execute(ctx), TEMPO_LIMITE)
            }
        } catch (e) {
            const msg = (e && e.message) || String(e)
            if (msg === '__TEMPO__') {
                tempoEsgotado = true
                // Continua rodando por baixo; se estourar depois, o relatório
                // precisa saber que este era candidato.
                pendentes.add(nome)
            } else {
                erro = msg.slice(0, 200)
            }
        }

        const logs = consola.colher()
        const errosLogados = logs.filter(l => l[0] === 'error' || /\[ERROR\]/.test(l[1]))
        const resultado = classificar({ erro, tempoEsgotado, respostas, envios, reacoes })
        const partes = textoDasRespostas(respostas, envios)

        registros.push({
            nome,
            categoria: cmd.category,
            argsUsados: args,
            classe: resultado.classe,
            motivo: resultado.motivo,
            tocouRede: stub.chamadas.http.length > httpAntes,
            tocouBinario: stub.chamadas.bin.length > binAntes,
            pedeCitada: partes.length > 0 && pedeMidiaCitada(partes),
            semChave: partes.length > 0 && semChave(partes),
            errosLogados: errosLogados.length,
            primeiroErroLogado: errosLogados.length ? errosLogados[0][1].slice(0, 160) : null,
            amostra: partes.join(' | ').replace(/\s+/g, ' ').slice(0, 160)
        })
    }

    consola.restaurar()
    process.exit = exitReal

    const dur = ((Date.now() - inicio) / 1000).toFixed(1)
    const porClasse = {}
    for (const r of registros) porClasse[r.classe] = (porClasse[r.classe] || 0) + 1

    console.log('\n══════ RESULTADO (' + PASSE + ', ' + dur + 's) ══════')
    for (const [c, n] of Object.entries(porClasse).sort((a, b) => b[1] - a[1])) {
        console.log('  ' + c.padEnd(10) + ' ' + String(n).padStart(5))
    }

    if (naoCapturados.length) {
        console.log('\n⚠ ERROS ASSINCRONOS SEM TRATADOR (derrubariam o bot): ' + naoCapturados.length)
        for (const n of naoCapturados.slice(0, 10)) {
            const suspeitos = n.abandonadosAindaVivos.length ? ' | abandonados ainda vivos: ' + n.abandonadosAindaVivos.join(', ') : ''
            console.log('   rodando: ' + n.executandoNoMomento + suspeitos + ' -> ' + n.erro)
        }
    }

    const saida = {
        gerado: new Date().toISOString(),
        passe: PASSE,
        args: ARGS,
        citada: CITADA,
        total: registros.length,
        duracaoSegundos: Number(dur),
        porClasse,
        naoCapturados,
        registros
    }
    const base = 'relatorio-comandos-' + PASSE + '-' + PAPEL + '-' + ESCOPO + '-' + ARGS + (EXEMPLO ? '-ex' + EXEMPLO : '') + (CITADA ? '-' + CITADA : '')
    const arquivoJson = path.join(__dirname, '..', base + '.json')
    stub.gravarSemProtecao(arquivoJson, JSON.stringify(saida, null, 2))
    console.log('\nJSON: ' + path.basename(arquivoJson))

    // Resumo por causa raiz: com 64% dos comandos sendo casca de família, a lista
    // por arquivo repete a mesma linha centenas de vezes. O agrupamento é o que
    // se lê; o JSON acima é a linha de base de regressão.
    const problemas = registros.filter(r => ['quebrado', 'mudo', 'travado', 'oco', 'suspeito'].includes(r.classe))
    const porCausa = {}
    for (const p of problemas) {
        const chave = p.classe + ' :: ' + p.motivo.replace(/['"`][^'"`]*['"`]/g, '…').slice(0, 70)
        ;(porCausa[chave] = porCausa[chave] || []).push(p)
    }

    const md = []
    md.push('# Auditoria de comandos — ' + PASSE + ' / ' + PAPEL + ' / args=' + ARGS + (CITADA ? ' / citada=' + CITADA : ''))
    md.push('')
    md.push('Gerado em ' + new Date().toISOString() + ' · ' + registros.length + ' comandos · ' + dur + 's')
    md.push('')
    md.push('| classe | qtd |')
    md.push('|---|---:|')
    for (const [c, n] of Object.entries(porClasse).sort((a, b) => b[1] - a[1])) md.push('| ' + c + ' | ' + n + ' |')
    md.push('')
    if (naoCapturados.length) {
        md.push('## Erros assíncronos sem tratador')
        md.push('')
        md.push('A atribuição é aproximada: um comando abandonado no timeout pode estourar depois, enquanto outro roda.')
        md.push('')
        for (const n of naoCapturados) {
            const suspeitos = n.abandonadosAindaVivos.length
                ? ' (abandonados ainda vivos: ' + n.abandonadosAindaVivos.map(x => '`.' + x + '`').join(', ') + ')'
                : ''
            md.push('- rodando `.' + n.executandoNoMomento + '`' + suspeitos + ' — ' + n.erro)
        }
        md.push('')
    }
    md.push('## Problemas agrupados por causa')
    md.push('')
    if (!problemas.length) {
        md.push('Nenhum comando quebrado, mudo, travado ou oco neste passe.')
    } else {
        for (const [causa, lista] of Object.entries(porCausa).sort((a, b) => b[1].length - a[1].length)) {
            md.push('### [' + lista.length + '] ' + causa)
            md.push('')
            md.push(lista.slice(0, 20).map(x => '`.' + x.nome + '` (' + x.categoria + ')').join(', ') + (lista.length > 20 ? ' … +' + (lista.length - 20) : ''))
            md.push('')
            md.push('Exemplo de saída: `' + (lista[0].amostra || '(nada)').slice(0, 200) + '`')
            md.push('')
        }
    }
    md.push('## Sinais laterais')
    md.push('')
    md.push('- tocaram rede (stubada): ' + registros.filter(r => r.tocouRede).length)
    md.push('- tocaram binário externo: ' + registros.filter(r => r.tocouBinario).length)
    md.push('- pediram mídia citada: ' + registros.filter(r => r.pedeCitada).length)
    md.push('- responderam falta de chave de API: ' + registros.filter(r => r.semChave).length)
    md.push('- logaram ERROR por baixo respondendo normal: ' + registros.filter(r => r.errosLogados > 0).length)
    md.push('- gravações em disco bloqueadas (fora de temp/data): ' + stub.chamadas.disco.length)
    if (stub.chamadas.disco.length) {
        md.push('')
        for (const d of stub.chamadas.disco.slice(0, 15)) md.push('  - `.' + d.comando + '` → ' + d.detalhe)
    }

    const arquivoMd = path.join(__dirname, '..', base + '.md')
    stub.gravarSemProtecao(arquivoMd, md.join('\n') + '\n')
    console.log('Resumo: ' + path.basename(arquivoMd))

    try {
        fs.unlinkSync(BANCO_TEMP)
    } catch (err) {
        console.warn('[AUDITORIA] nao removi o banco temporario ' + BANCO_TEMP + ': ' + err.message)
    }
}

rodar().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
