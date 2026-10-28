/**
 * Group Protection Service
 * Proteções automáticas de grupo que os admins ligam por comando:
 *   .antispamlink (antispamlink)   .profanity (antiProfanity)
 *   .capslock (antiCapslock)       .flood (antiFlood / floodLimit)
 *   .slowmode (slowmode / slowmodeSeconds)
 *   .antistatus (antistatus)       .antifake (antifake)
 *   .locknick (locknick / locknickNome)
 * e o acúmulo do .tesourocoletivo por mensagem.
 *
 * Antes cada comando só gravava a chave e respondia "ativado" — nada lia.
 * Aqui fica a regra; o messageHandler, o groupEventsHandler e o evento
 * groups.update só chamam.
 *
 * Roda para TODA mensagem de grupo: nada de ler tabela inteira. O estado de
 * flood, modo lento, avisos e tesouro vive em Maps em memória com poda por
 * validade e limite de tamanho.
 */

const logger = require('../core/logger')
const env = require('../config/env')
const dataService = require('./dataService')
const groupAuthService = require('./groupAuthService')
const groupRemovalService = require('./groupRemovalService')

// ══════════════════════════════════════════════════════════════
// ESTADO EM MEMÓRIA
// ══════════════════════════════════════════════════════════════

const LIMITE_ENTRADAS = 5000

/** Poda um Map cujos valores têm `ate` (instante em que deixam de valer). */
function podar(mapa, agora) {
    if (mapa.size <= LIMITE_ENTRADAS) return
    for (const [chave, valor] of mapa) {
        if (!valor || valor.ate <= agora) mapa.delete(chave)
    }
    while (mapa.size > LIMITE_ENTRADAS) mapa.delete(mapa.keys().next().value)
}

const _flood = new Map()          // grupo|pessoa -> { marcas: number[], ate }
const _slowmode = new Map()       // grupo|pessoa -> { ultima, ate }
const _avisos = new Map()         // grupo|pessoa|regra -> { ate }
const _tesouroCooldown = new Map() // grupo|pessoa -> { ate }
const _tesouroPendente = new Map() // grupo -> moedas ainda não gravadas

const JANELA_FLOOD_MS = 60 * 1000
const AVISO_PESSOA_MS = 60 * 1000
const AVISO_SEM_ADMIN_MS = 6 * 60 * 60 * 1000

/** true se ainda não avisou esta chave dentro do intervalo (e marca o aviso). */
function podeAvisar(chave, intervaloMs, agora = Date.now()) {
    const reg = _avisos.get(chave)
    if (reg && reg.ate > agora) return false
    _avisos.set(chave, { ate: agora + intervaloMs })
    podar(_avisos, agora)
    return true
}

function tag(jid) {
    return '@' + String(jid || '').split('@')[0].split(':')[0]
}

// ══════════════════════════════════════════════════════════════
// DETECTORES (puros)
// ══════════════════════════════════════════════════════════════

/** Lista do .profanity (o comando mostra esta mesma lista). */
const PROFANITY_LIST = [
    'porra', 'caralho', 'puta', 'merda', 'foda', 'fodase', 'fodasse',
    'buceta', 'arrombado', 'arrombada', 'cuzao', 'cuzão', 'piranha',
    'vagabundo', 'vagabunda', 'desgraçado', 'desgraçada', 'otario',
    'otário', 'idiota', 'imbecil', 'filho da puta', 'fdp',
    'cornudo', 'cornuda', 'bosta', 'viado', 'viada'
]

function semAcento(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

// Bordas Unicode: \b quebra em letra acentuada ("desgraçado").
const PALAVROES_RE = new RegExp(
    '(?<![\\p{L}\\p{N}])(?:' +
    [...new Set(PROFANITY_LIST.map(semAcento))]
        .sort((a, b) => b.length - a.length)
        .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'))
        .join('|') +
    ')(?![\\p{L}\\p{N}])',
    'u'
)

function temPalavrao(texto) {
    return Boolean(texto) && PALAVROES_RE.test(semAcento(texto))
}

/**
 * Maiúsculas demais: pelo menos 10 letras e mais de 70% delas maiúsculas.
 * Links, menções e risada ("KKKKK") não entram na conta.
 */
function ehCapslock(texto) {
    const limpo = String(texto || '')
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/@\S+/g, '')
        .replace(/k{3,}/gi, '')
    const letras = limpo.match(/\p{L}/gu)
    if (!letras || letras.length < 10) return false
    const maiusculas = limpo.match(/\p{Lu}/gu) || []
    return maiusculas.length / letras.length > 0.7
}

const LINKS_SPAM = [
    { tipo: 'Telegram', re: /\b(?:t\.me|telegram\.me|telegram\.dog)\/|\btg:\/\//i },
    { tipo: 'convite de outro grupo', re: /\bchat\.whatsapp\.com\//i },
    { tipo: 'canal do WhatsApp', re: /\bwhatsapp\.com\/channel\//i },
    { tipo: 'link encurtado', re: /\b(?:bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|goo\.gl|ow\.ly|shorturl\.at|rebrand\.ly|encurtador\.com\.br|tiny\.cc|rb\.gy|abre\.ai|encurta\.net)\//i }
]

const GOLPES_RE = [
    // Renda extra / tarefas diárias / shopee / tiktok / avaliações falsas
    /(?:ganhe|ganhar|lucrar|renda\s+extra)\s*(?:de\s*)?(?:r\$|\$)?\s*\d{2,4}.*(?:dia|di[aá]rios?|semana|hora)/i,
    /(?:trabalh[eo]\s*(?:em|de)\s*casa|home\s*office).*(?:ganhe|receba|ganhando)\s*(?:r\$|\$)?\s*\d{2,4}/i,
    /(?:avaliar|curtir|assistir)\s*(?:produtos?|v[ií]deos?|an[uú]ncios?|lojas?).*(?:shopee|tiktok|kwai|mercado\s*livre|amazon).*(?:r\$|\$)?/i,
    // Urubu do pix / robô do pix / retorno garantido
    /(?:urubu|rob[oô]|multiplicador|tabela|retorno\s*garantido)\s*(?:do|de)?\s*pix/i,
    /(?:invest(?:imento|a)?\s*(?:de|com)?\s*r\$?\s*\d+).*(?:receba|volta|retorno\s*de\s*r\$?\s*\d+)/i,
    // Plataforma de apostas com bônus falso / cadastro pagando
    /(?:plataforma|casa\s*de\s*aposta|tigrinho).*(?:pagando|cadastr(?:ou|e)\s*ganh(?:ou|e))\s*(?:r\$|\$)?\s*\d+/i
]

function ehGolpe(texto) {
    if (!texto || typeof texto !== 'string') return false
    const limpo = semAcento(texto)
    return GOLPES_RE.some(re => re.test(limpo))
}

/** @returns {string|null} o tipo de link proibido encontrado */
function linkDeSpam(texto) {
    if (!texto) return null
    const achado = LINKS_SPAM.find(l => l.re.test(texto))
    return achado ? achado.tipo : null
}

// ══════════════════════════════════════════════════════════════
// RITMO: FLOOD E MODO LENTO
// ══════════════════════════════════════════════════════════════

/** Conta a mensagem na janela de 1 minuto. true se passou do limite. */
function registrarFlood(grupo, pessoa, limite, agora = Date.now()) {
    const chave = grupo + '|' + pessoa
    const reg = _flood.get(chave) || { marcas: [], ate: 0 }
    reg.marcas = reg.marcas.filter(t => agora - t < JANELA_FLOOD_MS)
    reg.marcas.push(agora)
    // Guarda no máximo limite+1 marcas: o bastante para saber se passou.
    if (reg.marcas.length > limite + 1) reg.marcas.splice(0, reg.marcas.length - (limite + 1))
    reg.ate = agora + JANELA_FLOOD_MS
    _flood.set(chave, reg)
    podar(_flood, agora)
    return reg.marcas.length > limite
}

/**
 * Modo lento: só a mensagem que respeita o intervalo desde a última aceita
 * passa. A barrada não reinicia a contagem.
 * @returns {{ bloqueada: boolean, faltaMs: number }}
 */
function registrarSlowmode(grupo, pessoa, segundos, agora = Date.now()) {
    const chave = grupo + '|' + pessoa
    const intervalo = segundos * 1000
    const reg = _slowmode.get(chave)
    if (reg && agora - reg.ultima < intervalo) {
        return { bloqueada: true, faltaMs: intervalo - (agora - reg.ultima) }
    }
    _slowmode.set(chave, { ultima: agora, ate: agora + intervalo })
    podar(_slowmode, agora)
    return { bloqueada: false, faltaMs: 0 }
}

// ══════════════════════════════════════════════════════════════
// MENSAGENS DE GRUPO
// ══════════════════════════════════════════════════════════════

function estaIsento(cfg, { isAdmin, isOwner }) {
    if (isOwner) return true
    return Boolean(isAdmin) && !cfg?.strictModeration
}

function segundosSlowmode(cfg) {
    const s = parseInt(cfg?.slowmodeSeconds, 10)
    return Number.isFinite(s) && s > 0 ? s : 5
}

function limiteFlood(cfg) {
    const n = parseInt(cfg?.floodLimit, 10)
    return Number.isFinite(n) && n > 0 ? n : 25
}

/**
 * Decide o que fazer com a mensagem, sem efeito colateral além do estado de
 * ritmo. Ordem: conteúdo proibido primeiro, ritmo por último.
 * @returns {null | { regra: string, acao: 'apagar'|'remover', detalhe?: any }}
 */
function avaliarMensagem({ grupo, pessoa, texto, tipo, cfg, isAdmin, isOwner, agora = Date.now() }) {
    if (!cfg || estaIsento(cfg, { isAdmin, isOwner })) return null

    // Anti-Golpe Heurístico Zero-Day (ativo se antiscam=true, ou no preset vendas)
    if (Boolean(cfg.antiscam || cfg.preset === 'vendas') && ehGolpe(texto)) {
        return { regra: 'antiscam', acao: 'remover', detalhe: 'tentativa de golpe/fraude financeira' }
    }

    if (cfg.antistatus && tipo === 'groupStatusMentionMessage') {
        return { regra: 'antistatus', acao: 'apagar' }
    }
    if (cfg.antispamlink) {
        const tipoLink = linkDeSpam(texto)
        if (tipoLink) return { regra: 'antispamlink', acao: 'remover', detalhe: tipoLink }
    }
    if (cfg.antiProfanity) {
        const aiLearning = require('./aiLearningService')
        const profCheck = aiLearning.detectProfanity(texto)
        if (profCheck.isProfane || temPalavrao(texto)) {
            return { regra: 'palavrao', acao: 'apagar', detalhe: profCheck.word || 'palavrao' }
        }
    }
    if (cfg.antiCapslock && ehCapslock(texto)) {
        return { regra: 'capslock', acao: 'apagar' }
    }
    if (cfg.antiFlood && cfg.antispam !== false && registrarFlood(grupo, pessoa, limiteFlood(cfg), agora)) {
        return { regra: 'flood', acao: 'apagar', detalhe: limiteFlood(cfg) }
    }
    if (cfg.slowmode) {
        const s = segundosSlowmode(cfg)
        const r = registrarSlowmode(grupo, pessoa, s, agora)
        if (r.bloqueada) return { regra: 'slowmode', acao: 'apagar', detalhe: { segundos: s, faltaMs: r.faltaMs } }
    }
    return null
}

const NOME_REGRA = {
    antiscam: 'golpes e fraudes financeiras',
    antistatus: 'divulgação do grupo no status',
    palavrao: 'palavrões',
    capslock: 'maiúsculas',
    flood: 'excesso de mensagens',
    slowmode: 'modo lento',
    antispamlink: 'links proibidos'
}

function textoApagada(regra, pessoa, detalhe) {
    const t = tag(pessoa)
    switch (regra) {
        case 'antistatus':
            return `📢 ${t}, não é permitido divulgar o grupo no status, então apaguei o aviso.`
        case 'palavrao':
            return `🚫 ${t}, palavrões não são permitidos por aqui, então apaguei a sua mensagem.`
        case 'capslock':
            return `🔠 ${t}, sem mensagens todas em maiúsculas por aqui, então apaguei a sua.`
        case 'flood':
            return `🌊 ${t}, o limite aqui é de ${detalhe} mensagens por minuto, então apaguei as que passaram. Espere um pouco para voltar a escrever.`
        case 'slowmode': {
            const falta = Math.max(1, Math.ceil((detalhe?.faltaMs || 0) / 1000))
            return `⏳ ${t}, o modo lento está ligado: uma mensagem a cada ${detalhe?.segundos} segundos. Apaguei a que veio antes da hora; faltam ${falta}s.`
        }
        default:
            return `🛡️ ${t}, apaguei a sua mensagem por quebrar uma regra do grupo.`
    }
}

async function enviar(client, grupo, conteudo, contexto) {
    try {
        await client.sendMessage(grupo, conteudo)
    } catch (err) {
        logger.warn(`[PROTECAO] Falha ao enviar aviso (${contexto}) em ${grupo}: ${err.message}`)
    }
}

async function apagar(client, grupo, key, contexto) {
    try {
        await client.sendMessage(grupo, { delete: key })
        return true
    } catch (err) {
        logger.warn(`[PROTECAO] Falha ao apagar mensagem (${contexto}) em ${grupo}: ${err.message}`)
        return false
    }
}

/**
 * Aplica as proteções a uma mensagem de grupo.
 * @returns {Promise<boolean>} true se a mensagem foi barrada (o handler para aqui)
 */
async function processarMensagem(client, { grupo, pessoa, texto, tipo, info, cfg, isAdmin, isOwner, isBotAdmin, agora = Date.now() }) {
    const veredito = avaliarMensagem({ grupo, pessoa, texto, tipo, cfg, isAdmin, isOwner, agora })
    if (!veredito) return false

    const { regra, acao, detalhe } = veredito
    logger.info(`[PROTECAO:${regra}] ${pessoa} em ${grupo} -> ${acao}`)

    if (acao === 'remover') {
        const apagou = isBotAdmin && info?.key ? await apagar(client, grupo, info.key, regra) : false
        const resultado = await groupRemovalService.removerMembro(client, grupo, pessoa, { origem: regra })
        const t = tag(pessoa)
        const texto = resultado.ok
            ? `🚫 ${t} mandou ${detalhe === 'link encurtado' ? 'um link encurtado' : `link de ${detalhe}`}, o que não é permitido aqui, então ${apagou ? 'apaguei a mensagem e ' : ''}removi do grupo.`
            : `🚫 ${t}, ${detalhe === 'link encurtado' ? 'links encurtados' : `links de ${detalhe}`} não são permitidos aqui${apagou ? ', então apaguei sua mensagem' : ''}.\n\n${groupRemovalService.mensagemFalha(resultado.motivo, pessoa)}`
        await enviar(client, grupo, { text: texto, mentions: [pessoa] }, regra)
        return true
    }

    // acao === 'apagar'
    if (!isBotAdmin || !info?.key) {
        // Sem admin não dá para apagar: avisa a administração de vez em quando
        // e deixa a mensagem seguir — nunca dizer que apagou.
        if (podeAvisar(`${grupo}|sem-admin|${regra}`, AVISO_SEM_ADMIN_MS, agora)) {
            await enviar(client, grupo, {
                text: `⚠️ A proteção contra ${NOME_REGRA[regra]} está ligada, mas preciso ser administrador do grupo para apagar mensagens. Me promova a admin para ela funcionar.`
            }, `${regra}-sem-admin`)
        }
        return false
    }

    const apagou = await apagar(client, grupo, info.key, regra)
    if (!apagou) return false

    // Regra especial das 3 exclusões para palavrão (3 Strikes = Ban)
    if (regra === 'palavrao') {
        const aiLearning = require('./aiLearningService')
        const strikeResult = aiLearning.recordStrike(grupo, pessoa, 'profanity')
        const t = tag(pessoa)

        if (strikeResult.shouldBan) {
            const resultado = await groupRemovalService.removerMembro(client, grupo, pessoa, { origem: 'palavrao-3strikes' })
            const banMsg = resultado.ok
                ? `🚫 ${t} acumulou 3 mensagens apagadas por linguajar proibido/palavrões e foi removido do grupo pelo sistema autônomo!`
                : `🚫 ${t} chegou ao limite de 3 mensagens apagadas por palavrões.\n\n${groupRemovalService.mensagemFalha(resultado.motivo, pessoa)}`
            await enviar(client, grupo, { text: banMsg, mentions: [pessoa] }, regra)
            return true
        }

        const warnMsg = `🚫 ${t}, palavrões e linguajar tóxico não são permitidos por aqui${apagou ? ', então apaguei a sua mensagem' : ''}.\n⚠️ *Advertência:* [${strikeResult.strikes}/3] exclusões por profanidade. No 3º strike você será removido do grupo!`
        await enviar(client, grupo, { text: warnMsg, mentions: [pessoa] }, regra)
        return true
    }

    if (podeAvisar(`${grupo}|${pessoa}|${regra}`, AVISO_PESSOA_MS, agora)) {
        await enviar(client, grupo, { text: textoApagada(regra, pessoa, detalhe), mentions: [pessoa] }, regra)
    }
    return true
}

// ══════════════════════════════════════════════════════════════
// ANTIFAKE (entrada no grupo)
// ══════════════════════════════════════════════════════════════

const DDIS_PERMITIDOS = ['55']

/**
 * Número de telefone (só dígitos) de quem entrou. Em grupo LID o id vem como
 * @lid: usa o phoneNumber do evento ou o mapeamento do Baileys.
 * @returns {Promise<string|null>} null quando não dá para saber
 */
async function numeroDoParticipante(client, participante) {
    const id = typeof participante === 'string' ? participante : (participante?.id || participante?.jid || '')
    const candidatos = [id, typeof participante === 'object' ? participante?.phoneNumber : null]
    for (const c of candidatos) {
        const n = groupAuthService.normalizeJid(c || '')
        if (n.endsWith('@s.whatsapp.net')) return n.split('@')[0].replace(/\D/g, '') || null
    }
    if (id) {
        const real = await groupAuthService.resolveRealJid(client, id)
        if (real && real.endsWith('@s.whatsapp.net')) return real.split('@')[0].replace(/\D/g, '') || null
    }
    return null
}

function textoAntifake(pessoa, resultado) {
    const t = tag(pessoa)
    if (!resultado || resultado.ok) {
        return `🛡️ ${t} entrou com um número de fora do Brasil, e este grupo só aceita números +55, então removi.`
    }
    return `🛡️ ${t} entrou com um número de fora do Brasil, e este grupo só aceita números +55.\n\n${groupRemovalService.mensagemFalha(resultado.motivo, pessoa)}`
}

/**
 * Confere quem acabou de entrar. Remove se o número não for +55.
 * @returns {Promise<boolean>} true se a entrada foi tratada (não dar boas-vindas)
 */
async function aplicarAntifake(client, grupo, participante, cfg) {
    if (!cfg?.antifake) return false
    const id = typeof participante === 'string' ? participante : (participante?.id || participante?.jid || '')
    if (!id || groupAuthService.isBotJid(id, client)) return false

    const numero = await numeroDoParticipante(client, participante)
    if (!numero) {
        logger.warn(`[ANTIFAKE] Não consegui descobrir o número de ${id} em ${grupo}; não removi.`)
        return false
    }
    if (env.isOwnerJid(`${numero}@s.whatsapp.net`)) return false
    if (DDIS_PERMITIDOS.some(d => numero.startsWith(d))) return false

    logger.info(`[ANTIFAKE] ${id} (+${numero.slice(0, 3)}...) entrou em ${grupo} com número estrangeiro`)
    const resultado = await groupRemovalService.removerMembro(client, grupo, id, { origem: 'antifake' })
    await enviar(client, grupo, { text: textoAntifake(id, resultado), mentions: [id] }, 'antifake')
    return true
}

// ══════════════════════════════════════════════════════════════
// LOCKNICK (nome do grupo travado)
// ══════════════════════════════════════════════════════════════

/** Liga/desliga a trava guardando o nome atual. @returns {Promise<string|null>} nome travado */
async function definirTravaNome(grupo, ligar) {
    const configs = dataService.getConfigsData()
    const cfg = configs[grupo] || {}
    cfg.locknick = Boolean(ligar)
    let nome = null
    if (ligar) {
        try {
            const dados = await groupAuthService.getGroupData(grupo, { refresh: true })
            nome = dados?.data?.subject || null
        } catch (err) {
            logger.warn(`[LOCKNICK] Não consegui ler o nome atual de ${grupo}: ${err.message}`)
        }
        if (nome) cfg.locknickNome = nome
    }
    await dataService.saveConfigsData({ [grupo]: cfg })
    return nome || cfg.locknickNome || null
}

/**
 * Evento groups.update: se o nome mudou com a trava ligada e quem mudou não
 * pode, volta para o nome travado. Admin (fora do modo estrito) e dono do bot
 * podem renomear — o nome novo passa a ser o travado.
 */
async function tratarAtualizacaoGrupo(client, update) {
    const grupo = update?.id
    if (!grupo || typeof update.subject !== 'string') return

    const configs = dataService.getConfigsData()
    const cfg = configs[grupo]
    if (!cfg?.locknick) return

    const novo = update.subject
    const autores = [update.author, update.authorPn].filter(a => typeof a === 'string' && a)

    if (!cfg.locknickNome) {
        cfg.locknickNome = novo
        await dataService.saveConfigsData({ [grupo]: cfg })
        return
    }
    if (novo === cfg.locknickNome) return
    if (autores.some(a => groupAuthService.isBotJid(a, client))) return
    if (autores.length === 0) {
        logger.warn(`[LOCKNICK] Nome de ${grupo} mudou para "${novo}" sem autor conhecido; não reverti.`)
        return
    }

    let dados
    try {
        dados = await groupAuthService.getGroupData(grupo, { refresh: true })
    } catch (err) {
        logger.warn(`[LOCKNICK] Não consegui ler ${grupo} para conferir quem trocou o nome: ${err.message}`)
        return
    }
    const autor = autores[0]
    const isAdmin = autores.some(a => dados.admins.has(groupAuthService.normalizeJid(a)))
    const isOwner = autores.some(a => env.isOwnerJid(a))

    if (estaIsento(cfg, { isAdmin, isOwner })) {
        cfg.locknickNome = novo
        await dataService.saveConfigsData({ [grupo]: cfg })
        logger.info(`[LOCKNICK] ${autor} renomeou ${grupo} para "${novo}"; nome travado atualizado.`)
        return
    }

    const nome = cfg.locknickNome
    if (!dados.isBotAdmin) {
        if (podeAvisar(`${grupo}|sem-admin|locknick`, AVISO_SEM_ADMIN_MS)) {
            await enviar(client, grupo, {
                text: `⚠️ ${tag(autor)} trocou o nome do grupo, que está travado em *${nome}*. Preciso ser administrador para voltar ao nome certo.`,
                mentions: [autor]
            }, 'locknick-sem-admin')
        }
        return
    }

    try {
        await client.groupUpdateSubject(grupo, nome)
        logger.info(`[LOCKNICK] ${autor} trocou o nome de ${grupo} para "${novo}"; voltei para "${nome}".`)
        await enviar(client, grupo, {
            text: `🔒 ${tag(autor)}, o nome do grupo está travado, então voltei para *${nome}*.`,
            mentions: [autor]
        }, 'locknick')
    } catch (err) {
        logger.warn(`[LOCKNICK] WhatsApp recusou voltar o nome de ${grupo}: ${err.message}`)
        await enviar(client, grupo, {
            text: `⚠️ ${tag(autor)} trocou o nome do grupo, que está travado em *${nome}*, e o WhatsApp não me deixou voltar. Tente de novo em alguns minutos.`,
            mentions: [autor]
        }, 'locknick-falha')
    }
}

// ══════════════════════════════════════════════════════════════
// TESOURO COLETIVO
// ══════════════════════════════════════════════════════════════

const TESOURO_MOEDAS_POR_MENSAGEM = 10
const TESOURO_COOLDOWN_MS = 60 * 1000
const TESOURO_GRAVAR_A_CADA_MS = 30 * 1000
let _tesouroTimer = null

/**
 * Soma moedas ao pote do grupo pela mensagem, no máximo uma vez por pessoa a
 * cada minuto. Só vale para grupos que já abriram o baú (.tesourocoletivo).
 * A gravação é agrupada (a cada 30s ou no próximo uso do comando) para não
 * gravar configs a cada mensagem.
 * @returns {number} moedas somadas agora (0 se em espera ou sem baú)
 */
function registrarMensagemTesouro(grupo, pessoa, cfg, agora = Date.now()) {
    if (!grupo || !pessoa || !cfg?.tesouro) return 0
    const chave = grupo + '|' + pessoa
    const reg = _tesouroCooldown.get(chave)
    if (reg && reg.ate > agora) return 0
    _tesouroCooldown.set(chave, { ate: agora + TESOURO_COOLDOWN_MS })
    podar(_tesouroCooldown, agora)

    _tesouroPendente.set(grupo, (_tesouroPendente.get(grupo) || 0) + TESOURO_MOEDAS_POR_MENSAGEM)
    if (!_tesouroTimer) {
        _tesouroTimer = setTimeout(() => {
            _tesouroTimer = null
            gravarTesouro().catch(err => logger.error('[TESOURO] Falha ao gravar o pote acumulado:', err))
        }, TESOURO_GRAVAR_A_CADA_MS)
        if (typeof _tesouroTimer.unref === 'function') _tesouroTimer.unref()
    }
    return TESOURO_MOEDAS_POR_MENSAGEM
}

/**
 * Grava no baú as moedas acumuladas por mensagem.
 * @param {string} [grupo] - só este grupo; sem argumento, todos
 */
async function gravarTesouro(grupo) {
    const alvos = grupo ? [grupo] : [..._tesouroPendente.keys()]
    for (const g of alvos) {
        const valor = _tesouroPendente.get(g)
        if (!valor) continue
        _tesouroPendente.delete(g)
        const configs = dataService.getConfigsData()
        const cfg = configs[g]
        if (!cfg?.tesouro) continue
        cfg.tesouro.saldo = (Number(cfg.tesouro.saldo) || 0) + valor
        await dataService.saveConfigsData({ [g]: cfg })
    }
}

function _resetarEstado() {
    _flood.clear(); _slowmode.clear(); _avisos.clear()
    _tesouroCooldown.clear(); _tesouroPendente.clear()
    if (_tesouroTimer) { clearTimeout(_tesouroTimer); _tesouroTimer = null }
}

module.exports = {
    PROFANITY_LIST,
    TESOURO_MOEDAS_POR_MENSAGEM,
    TESOURO_COOLDOWN_MS,
    temPalavrao,
    ehCapslock,
    ehGolpe,
    linkDeSpam,
    avaliarMensagem,
    processarMensagem,
    numeroDoParticipante,
    aplicarAntifake,
    textoAntifake,
    definirTravaNome,
    tratarAtualizacaoGrupo,
    registrarMensagemTesouro,
    gravarTesouro,
    _resetarEstado
}
