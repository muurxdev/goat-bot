const fs = require('fs')
const path = require('path')
const logger = require('../core/logger')
const env = require('../config/env')
const securityService = require('../services/securityService')
const botScheduler = require('../services/botScheduler')
const { resolveUserRole, canExecuteCommand, mensagemSoGrupo, ROLES, ROLE_NAMES, permissionRepo } = require('../services/permissionService')
const telemetryService = require('../services/telemetryService')
const dataService = require('../services/dataService')
const userRepo = require('../database/repositories/userRepository')
const analyticsRepo = require('../database/repositories/analyticsRepository')
const { validateRegistry, formatReport } = require('./commandValidator')
const aliasOwners = require('../config/aliasOwners')
const { semLore } = require('../services/loreService')
const usoService = require('../services/usoService')
const { resolveCategoryKey } = require('../config/categories')
const { getBotName } = require('../config/botConfig')
const moduleState = require('../services/moduleStateService')
const { resolveModuleKey, BY_KEY: MODULE_BY_KEY } = require('../config/modules')

const commands = new Map()
const aliases = new Map()
const cooldowns = new Map()
let lastValidationReport = null
let _allTriggersCache = null

function getAllTriggers() {
    if (!_allTriggersCache || _allTriggersCache.length === 0) {
        _allTriggersCache = Array.from(new Set([...commands.keys(), ...aliases.keys()]))
    }
    return _allTriggersCache
}

const COMMAND_REACTIONS = {
    // RPG & Combate
    batalhar: '⚔️',
    duelo: '⚔️',
    cacar: '🏹',
    boss: '👹',
    minerar: '⛏️',
    forjar: '🔨',
    craft: '🔨',
    inventario: '🎒',
    skills: '✨',
    curar: '🧪',
    dungeon: '🏰',
    treinar: '🥋',
    status: '📊',
    ranking: '🏆',
    rank: '🏆',
    perfil: '👤',
    dossie: '📁',
    top: '🥇',

    // Cassino & Economia
    roleta: '🎰',
    cassino: '🎰',
    slots: '🎰',
    apostar: '🎲',
    dado: '🎲',
    coinflip: '🪙',
    saldo: '💰',
    banco: '🏦',
    daily: '🎁',
    resgatar: '🎁',
    pix: '💸',
    transferir: '💸',
    roubar: '🥷',
    trabalhar: '💼',
    loja: '🏪',
    comprar: '🛒',

    // IA & Conhecimento
    ia: '🧠',
    gpt: '🧠',
    perguntar: '🧠',
    pesquisa: '🔍',
    google: '🔍',
    wiki: '📖',
    definir: '📚',
    explicar: '💡',
    resumo: '📝',
    traduzir: '🌐',
    sentimento: '💭',
    comparar: '⚖️',
    classify: '🏷️',
    paraphrase: '🔄',

    // Mídia, Áudio & Vídeo — DOWNLOADS: uma reação só do começo ao fim (⏳ → ✅).
    // Antes cada comando abria com o emoji do seu tipo (🎬 cinema para um áudio do Spotify, 🎵,
    // 📱…) e o aviso de download trocava para ⏳ um instante depois: a mensagem piscava um emoji
    // errado e outro. O tipo e a plataforma já estão na frase "Baixando áudio do Spotify…".
    play: '⏳',
    ytmp3: '⏳',
    ytmp4: '⏳',
    youtube: '⏳',
    musica: '⏳',
    audio: '⏳',
    video: '⏳',
    mp3: '⏳',
    mp4: '⏳',
    spotify: '⏳',
    sp: '⏳',
    soundcloud: '⏳',
    tiktok: '⏳',
    insta: '⏳',
    instagram: '⏳',
    twitter: '⏳',
    kwai: '⏳',
    reddit: '⏳',
    pinterest: '⏳',
    media: '⏳',
    baixar: '⏳',
    download: '⏳',
    dl: '⏳',
    letra: '📜',

    // Livros & Documentos
    livro: '📚',
    pdf: '📚',
    ebook: '📚',
    ler: '📖',
    buscarlivro: '🔍',

    // Figurinhas & Edição
    s: '🎨',
    sticker: '🎨',
    fig: '🎨',
    gif: '🎞️',
    attp: '✨',
    ttp: '✍️',
    toimg: '🖼️',
    tovideo: '📹',
    tomp3: '🎵',
    wallpaper: '🌄',
    wallpapers: '🌄',
    meme: '🎭',

    // Moderação & Grupo
    ban: '⚡',
    kick: '🥾',
    mute: '🔇',
    unmute: '🔊',
    warn: '⚠️',
    advertencia: '⚠️',
    limpar: '🧹',
    limparbot: '🧹',
    fechargrupo: '🔒',
    abrirgrupo: '🔓',
    promover: '⭐',
    rebaixar: '⬇️',
    link: '🔗',
    marcar: '📢',
    hidetag: '📢',

    // Sistema & Utilidades
    ping: '🏓',
    clima: '🌤️',
    tempo: '🌤️',
    qrcode: '📱',
    calc: '🧮',
    info: 'ℹ️',
    menu: '📜',
    help: '🧭',
    comandos: '📋',
    dono: '👑',
    login: '🔐',
    registrar: '📝'
}

/**
 * Reações do CICLO DE VIDA de um comando.
 *
 * A de início já existia (emoji do comando/categoria). Estas fecham o ciclo:
 * o usuário vê que foi recebido, que ainda está trabalhando, e como terminou —
 * sem o bot precisar mandar mensagem para isso.
 */
const { reactionsEnabled } = require('../services/reactionService')

const CICLO_REACOES = {
    processando: '⏳',   // ainda trabalhando (só em comando demorado)
    sucesso: '✅',
    erro: '❌',
    bloqueado: '🔒',     // existe, mas você não pode usar aqui/agora
    desconhecido: '❌'   // comando que não existe
}

/**
 * Detecta se uma mensagem de resposta representa erro, falha de validação ou comando inválido.
 * Garante que a reação final seja ❌ e nunca ✅.
 */
function ehMensagemDeErro(texto) {
    if (typeof texto !== 'string') return false
    const t = texto.trim()
    if (t.startsWith('❌') || t.startsWith('🚫') || t.startsWith('⚠️') || t.startsWith('🤔 Não conheço') || t.startsWith('❓ Subcomando') || t.startsWith('❓')) {
        return true
    }
    // Moldura com emoji de erro ou aviso no cabeçalho
    if (t.includes('╔') && (t.includes('⚠️') || t.includes('❌') || t.includes('🚫'))) {
        if (/inválid|invalida|incorreto|falha|erro|não permitido|proibido/i.test(t)) {
            return true
        }
    }
    if (/^([\[\(\{]?\s*)?(erro|falha|invalid|inválid|parâmetro incorreto|parametro incorreto)/i.test(t)) {
        return true
    }
    return false
}

/**
 * Só reage "processando" se o comando passar disto.
 *
 * Sem esse atraso, um comando instantâneo piscaria ⏳ e ✅ no mesmo instante —
 * três reações em cima da mesma mensagem viram poluição, não informação.
 */
const MS_ATE_PROCESSANDO = 2500

const CATEGORY_REACTIONS = {
    rpg: '⚔️',
    cassino: '🎰',
    economia: '💰',
    jogos: '🎮',
    // A categoria "media" é, na prática, download: ⏳ (nada de 🎬 para áudio) — ver COMMAND_REACTIONS.
    media: '⏳',
    downloads: '⏳',
    livros: '📚',
    ia: '🧠',
    figurinhas: '🎨',
    admin: '🛡️',
    moderacao: '🔨',
    dono: '👑',
    utilitarios: '⚙️',
    geral: '✨'
}

function createLazyCommand(meta, commandsDir) {
    let realModule = null
    return new Proxy(meta, {
        get(target, prop, receiver) {
            if (prop === 'execute') {
                if (!realModule) {
                    realModule = require(path.join(commandsDir, target.file))
                }
                return realModule.execute
            }
            if (prop in target) {
                return target[prop]
            }
            if (!realModule) {
                realModule = require(path.join(commandsDir, target.file))
            }
            return Reflect.get(realModule, prop, receiver)
        }
    })
}

function loadCommands(commandsDir = path.join(__dirname, '..', 'commands')) {
    // Quanto custa abrir a taverna. Ninguém media isso, e o bot passou de 3.473
    // para mais de 5.000 comandos em 2026-09-17 — se um dia o boot começar a
    // demorar ou a memória apertar na VPS (1 vCPU, 4 GB), o número está aqui.
    const comecou = Date.now()
    const memoriaAntes = process.memoryUsage().rss

    commands.clear()
    aliases.clear()

    if (!fs.existsSync(commandsDir)) {
        logger.warn(`Diretório de comandos não encontrado: ${commandsDir}`)
        return
    }

    // 0. Modo Ultra-Rápido: Carrega o índice pré-compilado (commandIndex.json) via Lazy-Loading JIT
    const indexPath = path.join(__dirname, '..', 'config', 'commandIndex.json')
    const useIndex = !process.env.RELOAD_COMMANDS && fs.existsSync(indexPath)

    if (useIndex) {
        try {
            const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
            const rawReport = indexData.validationReport || {}
            lastValidationReport = {
                duplicateNames: rawReport.duplicateNames || [],
                missingFields: rawReport.missingFields || [],
                unknownKeys: rawReport.unknownKeys || [],
                aliasShadowedByName: rawReport.aliasShadowedByName || [],
                aliasConflicts: rawReport.aliasConflicts || [],
                errors: rawReport.errors || [],
                warnings: rawReport.warnings || []
            }

            for (const [cmdName, meta] of Object.entries(indexData.commands)) {
                commands.set(cmdName, createLazyCommand(meta, commandsDir))
            }

            for (const [alias, ownerName] of Object.entries(indexData.aliases)) {
                const targetCmd = commands.get(ownerName)
                if (targetCmd) {
                    aliases.set(alias, targetCmd)
                }
            }

            const levou = Date.now() - comecou
            const memoriaMb = Math.max(0, Math.round((process.memoryUsage().rss - memoriaAntes) / 1048576))
            logger.info(`⚡ [JIT INDEX] Total de comandos carregados: ${commands.size} (+ ${aliases.size} aliases) em ${levou} ms, ${memoriaMb} MB`)
            return
        } catch (errIndex) {
            logger.warn(`[COMMAND INDEX] Falha ao carregar índice pré-compilado, caindo para varredura em disco: ${errIndex.message}`)
        }
    }

    // 1. Coleta todos os módulos (na ordem de varredura) antes de registrar,
    //    para permitir validação de colisões e política de resolução explícita.
    const entries = []
    function scanDir(dir) {
        const dirEntries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of dirEntries) {
            const fullPath = path.resolve(dir, entry.name)
            if (entry.isDirectory()) {
                scanDir(fullPath)
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                const relPath = path.relative(commandsDir, fullPath)
                try {
                    delete require.cache[require.resolve(fullPath)]
                    const cmd = require(fullPath)
                    entries.push({ file: relPath, cmd })
                } catch (err) {
                    logger.error(`Erro ao carregar comando ${relPath}:`, err)
                    entries.push({ file: relPath, cmd: null, loadError: err })
                }
            }
        }
    }
    scanDir(commandsDir)

    // 2. Valida o registro e reporta (sempre loga; só aborta em modo estrito).
    const report = validateRegistry(entries.filter(e => !e.loadError))
    lastValidationReport = report
    if (report.errors.length || report.warnings.length) {
        logger.warn(formatReport(report))
    }
    if (report.errors.length && process.env.STRICT_COMMANDS === '1') {
        throw new Error(`Registro de comandos inválido: ${report.errors.length} erro(s). Veja o relatório acima.`)
    }

    // 3. Registra aplicando a política:
    //    - nome: first-wins (o primeiro arquivo na ordem alfabética mantém o nome)
    //    - alias que colide com nome: descartado (nome sempre ganha na resolução)
    //    - alias em conflito: first-wins, salvo dono explícito em aliasOwners
    for (const { cmd, loadError } of entries) {
        if (loadError || !cmd || !cmd.name || typeof cmd.execute !== 'function') continue

        const cmdName = cmd.name.toLowerCase()
        if (!commands.has(cmdName)) {
            commands.set(cmdName, cmd)
        }
    }

    for (const { cmd, loadError } of entries) {
        if (loadError || !cmd || !cmd.name || typeof cmd.execute !== 'function') continue
        if (!Array.isArray(cmd.aliases)) continue

        for (const rawAlias of cmd.aliases) {
            const alias = String(rawAlias).toLowerCase()
            if (commands.has(alias)) continue                 // alias morto: nome ganha
            const owner = aliasOwners[alias]
            if (aliases.has(alias)) {
                if (owner && owner === cmd.name) aliases.set(alias, cmd)  // dono explícito vence
                continue                                       // senão: first-wins
            }
            if (owner && owner !== cmd.name && commands.has(owner)) {
                // Há dono explícito e não é este comando: reserva para o dono.
                continue
            }
            aliases.set(alias, cmd)
        }
    }

    _allTriggersCache = null
    const levou = Date.now() - comecou
    const memoriaMb = Math.max(0, Math.round((process.memoryUsage().rss - memoriaAntes) / 1048576))
    logger.info(`✅ Total de comandos carregados: ${commands.size} (+ ${aliases.size} aliases) em ${levou} ms, ${memoriaMb} MB`)
}

function getValidationReport() {
    return lastValidationReport
}

const MSG_PRIVADO_FECHADO = '🔒 No momento não estou atendendo no privado. Me chame em um grupo onde eu esteja.'

/** "1 segundo", "3 segundos" — sempre inteiro, arredondado para cima. */
function formatarSegundos(seg) {
    const n = Math.max(1, Math.ceil(Number(seg) || 0))
    return `${n} ${n === 1 ? 'segundo' : 'segundos'}`
}

/**
 * Aviso de taverna fechada. Se houver reabertura agendada, diz o horário;
 * se o fechamento for por tempo indeterminado, não promete hora.
 */
function mensagemFechado() {
    const base = '🌙 A taverna está fechada agora.'
    try {
        const scheduleRepo = require('../database/repositories/scheduleRepository')
        const agora = Date.now()
        const reabertura = scheduleRepo.getActiveSchedules()
            .map(s => s.reopen_at)
            .filter(t => t && t > agora)
            .sort((a, b) => a - b)[0]
        if (reabertura) {
            // Fuso do bot (BOT_TIMEZONE): a VPS roda em UTC
            const { timezone: timeZone } = require('../services/botScheduler')
            const d = new Date(reabertura)
            const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone })
            const dia = t => new Date(t).toLocaleDateString('pt-BR', { timeZone })
            const mesmoDia = dia(reabertura) === dia(agora)
            const quando = mesmoDia ? `às ${hora}` : `em ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone })} às ${hora}`
            return `${base} Volto ${quando}.`
        }
    } catch (err) {
        logger.warn(`[DISPATCH] não consegui ler o horário de reabertura: ${err.message}`)
    }
    return `${base} Volto no próximo horário de abertura.`
}

/**
 * Um comando fica isento da tradução do Reino quando o jargão técnico é o
 * próprio conteúdo dele. Vale para a categoria `dev` inteira (só habilitada na
 * seção Skycode) e para qualquer comando que declare `loreExempt: true`.
 */
function ehIsentoDeLore(cmd) {
    if (!cmd) return false
    if (cmd.loreExempt === true) return true
    return String(cmd.category || '').toLowerCase() === 'dev'
}

/**
 * O "comando" digitado é na verdade um link de mídia colado depois do prefixo?
 *
 * Exige que pareça link (tem esquema http/https ou barra no meio do domínio) —
 * a checagem antiga aceitava qualquer palavra que contivesse "youtu", então
 * `.youtube`, `.youtuber` e até `.youtu` viravam download.
 * @param {string} nome
 * @returns {boolean}
 */
function ehLinkColado(nome) {
    const t = String(nome || '').trim()
    if (/^https?:\/\//i.test(t)) return true
    return /^(?:www\.)?(?:youtu\.be|youtube\.com|m\.youtube\.com|music\.youtube\.com|vt\.tiktok\.com|vm\.tiktok\.com|tiktok\.com|twitter\.com|x\.com|instagram\.com|kwai\.com|pin\.it|pinterest\.[\w.]+)\//i.test(t)
}

/**
 * Estado de uma mensagem que está sendo despachada. Os portões leem daqui e
 * escrevem o que descobrem (cmd, papel, configs). `context` é o objeto original
 * recebido do handler: os comandos recebem ele mesmo, não uma cópia.
 */
function prepararEstado(context) {
    const { commandName, sender, senderReal, from, isGroup, isAdmin, isBotAdmin, isOwner, args, prefix = '.' } = context

    // Identidade canônica do usuário: em grupos com LID, o key.participant é um @lid;
    // senderReal é o JID real (@s.whatsapp.net) resolvido via signalRepository.lidMapping.
    const roleJid = senderReal || sender
    context.roleJid = roleJid

    if (context.text === undefined && Array.isArray(args)) {
        context.text = args.join(' ')
    }

    if (!commandName) return null

    // Link colado logo depois do prefixo (ex.: .https://vt.tiktok.com/...) vira um
    // pedido normal de `.media`.
    //
    // Antes este trecho chamava `mediaCmd.execute(context)` na hora e voltava. Como
    // ele fica ANTES de tudo, pulava banimento global, permissões, módulo desligado,
    // aluguel do grupo, manutenção, limite de uso e espera entre comandos — e a
    // condição é frouxa (`inclui "youtu"`), então bastava alguém banido mandar
    // `.youtu musica` para continuar baixando à vontade. Agora só reescreve o
    // pedido e deixa o fluxo normal decidir.
    let nomeResolvido = commandName
    if (ehLinkColado(commandName) && commands.has('media')) {
        context.text = `${commandName} ${context.text || ''}`.trim()
        context.args = context.text.split(/\s+/).filter(Boolean)
        context.commandName = 'media'
        nomeResolvido = 'media'
    }

    return {
        context,
        reply: context.reply,
        commandName,
        sender,
        senderReal,
        from,
        isGroup,
        isAdmin,
        isBotAdmin,
        isOwner,
        args,
        prefix,
        roleJid,
        cmdLower: nomeResolvido.toLowerCase(),
        // Preenchidos pelos portões, na ordem em que rodam
        cmd: null,
        catKeyForToggle: '',
        configs: null,
        userRole: null,
        isOwnerOrBotAdmin: false,
        isUserOwner: false
    }
}

// Portões do despacho, na ordem em que rodam. Cada um devolve `undefined` para
// seguir ou `{ fim: valor }` para parar; `valor` vira o retorno de dispatch().
// A ordem importa: módulo (8.1) antes do aluguel (9), e o limite de uso (11)
// depois do aluguel. Não reordenar sem rodar os testes de hierarquia e aluguel.

// 0. Reconhecimento automático de Categorias (ex: .rpg, .eco, .admin, .dono, .ia, .dev)
//    Fonte única em config/categories.js — sem lista hardcoded divergente aqui.
async function portaoComando(estado) {
    const { context, reply, commandName, sender, from, isGroup, isAdmin, isBotAdmin, isOwner, roleJid, prefix, cmdLower } = estado
    if (!commands.has(cmdLower) && !aliases.has(cmdLower)) {
        const catKey = (cmdLower === 'all' || cmdLower === 'completo' || cmdLower === 'total')
            ? 'all'
            : resolveCategoryKey(cmdLower)
        if (catKey) {
            const menuCmd = commands.get('menu')
            if (menuCmd) {
                context.args = [catKey]
                context.commandName = 'menu'
                return { fim: await menuCmd.execute(context) }
            }
        }
    }

    const cmd = commands.get(cmdLower) || aliases.get(cmdLower)
    if (!cmd) {
        // Comando errado também merece resposta visual imediata (❌).
        if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
            Promise.resolve(context.react(CICLO_REACOES.desconhecido)).catch(err => logger.debug(`[DISPATCH] reação "desconhecido" falhou (.${cmdLower} em ${from}): ${err && err.message}`))
        }
        // Resolve o cargo antes para filtrar sugestões pela permissão do usuário
        // (não expõe comandos de owner/admin a membros comuns).
        const suggestRole = resolveUserRole(roleJid, isAdmin, isOwner, { from, isGroup })
        const suggestions = findClosestCommands(cmdLower, 5, { userRole: suggestRole, isGroup, isBotAdmin })

        let doc = `🤔 Não conheço o comando \`${prefix}${commandName}\`.\n`

        if (suggestions.length > 0) {
            // Marca o que está REALMENTE disponível aqui. Sugerir um comando
            // bloqueado só troca uma frustração por outra.
            const escopoSugestao = moduleState.scopeOf(from, isGroup)
            doc += `\n🎯 *Comandos recomendados para você:*\n`
            suggestions.forEach((s) => {
                const disponivel = isOwner || moduleState.isCommandEnabled(s, escopoSugestao)
                const descricao = s.description ? ` — ${s.description}` : ''
                const aviso = disponivel ? '' : ' _(desligado aqui)_'
                doc += `• \`${prefix}${s.name}\`${descricao}${aviso}\n`
            })
        }

        doc += `\n🧭 *Comandos para Ajudar:*\n`
        doc += `• \`${prefix}menu\` — Ver todas as categorias e comandos\n`
        doc += `• \`${prefix}orientacao\` — Central de guias e orientação\n`
        doc += `• \`${prefix}sugestao <assunto>\` — Encontrar comandos por intenção`

        await reply(doc.trim(), [sender])
        return { fim: true }
    }

    estado.cmd = cmd
    estado.catKeyForToggle = (cmd.category || '').toLowerCase()
    return undefined
}

// 1. Verificação de Blacklist Global
async function portaoBlacklist(estado) {
    const { context, reply, from, isGroup, roleJid } = estado
    if (securityService.isUserBanned(roleJid)) {
        if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
            Promise.resolve(context.react(CICLO_REACOES.erro)).catch(() => {})
        }
        await reply('🚫 Você não pode mais usar meus comandos. Se achar que foi engano, fale com um dono do bot.')
        return { fim: true }
    }
    return undefined
}

// 2. Resolução do Cargo na Hierarquia (6 Níveis: OWNER, BOT_ADMIN, RENTAL_OWNER, GROUP_ADMIN, TRUSTED, USER)
//    Não para o despacho: só calcula o que os portões seguintes leem.
function resolverPapel(estado) {
    const { context, roleJid, isAdmin, isOwner, from, isGroup } = estado
    const userRole = resolveUserRole(roleJid, isAdmin, isOwner, { from, isGroup })
    context.userRole = userRole
    estado.userRole = userRole
    estado.isOwnerOrBotAdmin = userRole.level >= ROLES.BOT_ADMIN
    estado.isUserOwner = isOwner || userRole.level >= ROLES.OWNER
    return undefined
}

// 3. Interceptação Universal de Ajuda/Dicas (-help, --help, -h, help, ajuda)
async function portaoAjudaUniversal(estado) {
    const { context, cmd, args } = estado
    const helpFlags = ['-help', '--help', '-h', 'help', 'ajuda', '-ajuda', '-dica', '-dicas']
    const hasHelpFlag = Array.isArray(args) && args.some(a => helpFlags.includes(a.toLowerCase()))
    if (hasHelpFlag) {
        const nonHelpArgs = args.filter(a => !helpFlags.includes(a.toLowerCase()))
        const targetQuery = nonHelpArgs.length > 0 ? nonHelpArgs.join(' ') : cmd.name
        const helpCmd = commands.get('help')
        if (helpCmd) {
            context.text = targetQuery
            return { fim: await helpCmd.execute(context) }
        }
    }
    return undefined
}

// 3.1 Verificação de Comandos e Categorias Banidas Globalmente (.bancmd - Donos são imunes)
async function portaoComandoBanido(estado) {
    const { context, reply, cmd, prefix, isUserOwner } = estado
    const configs = dataService.getConfigsData()
    estado.configs = configs
    const globalBanned = configs['global']?.bannedCommands
    const immuneCommands = ['bancmd', 'unbancmd', 'dono', 'setdono', 'botopen', 'botclose', 'eval', 'shutdown', 'restart', 'menu', 'help']

    if (globalBanned && !isUserOwner && !immuneCommands.includes(cmd.name.toLowerCase())) {
        const cmdCategory = (cmd.category || '').toLowerCase()
        const bannedInfo = globalBanned['all'] || globalBanned[cmd.name.toLowerCase()] || (context.commandName && globalBanned[context.commandName.toLowerCase()]) || (cmdCategory && globalBanned[cmdCategory])
        if (bannedInfo) {
            const porCategoria = cmdCategory && globalBanned[cmdCategory]
            let banMsg = porCategoria
                ? `⏸️ O \`.${cmd.name}\` e os outros comandos de *${cmdCategory}* estão suspensos por enquanto.\n`
                : `⏸️ O \`.${cmd.name}\` está suspenso por enquanto.\n`
            banMsg += `*Motivo:* ${bannedInfo.reason || 'sem prazo definido'}\n`
            if (bannedInfo.date) banMsg += `*Desde:* ${bannedInfo.date}\n`
            banMsg += `Ele volta a funcionar quando um dono do bot liberar.`
            await reply(banMsg.trim())
            return { fim: true }
        }
    }
    return undefined
}

// 3.1.3 Comandos Desligados no Grupo (.cmd off <comando> ou .cmd all off)
// Se desligar, FICA DESLIGADO!
async function portaoComandoDesligadoNoGrupo(estado) {
    const { context, reply, cmd, from, isGroup, prefix, configs } = estado
    if (isGroup && configs[from]?.disabledCommands && Array.isArray(configs[from].disabledCommands)) {
        const disabledList = configs[from].disabledCommands
        const immuneFromGroupLock = ['cmd', 'categoria', 'modulo', 'config', 'menu', 'help', 'dono', 'donos', 'ping', 'orientacao', 'menugrupo']
        const cmdNameLower = cmd.name.toLowerCase()

        if (!immuneFromGroupLock.includes(cmdNameLower)) {
            // Trava total de comandos no grupo: .cmd all off
            if (disabledList.includes('all')) {
                if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
                    Promise.resolve(context.react(CICLO_REACOES.erro)).catch(() => {})
                }
                const msgAll = `🔒 Os comandos estão temporariamente travados para membros neste grupo.\nUm administrador pode religar com \`${prefix}cmd all on\`.`
                await reply(msgAll)
                return { fim: true }
            }

            // Trava de comando individual: .cmd <comando> off
            const estaDesligadoNoGrupo = disabledList.includes(cmdNameLower) ||
                (Array.isArray(cmd.aliases) && cmd.aliases.some(a => disabledList.includes(a.toLowerCase())))
            if (estaDesligadoNoGrupo) {
                if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
                    Promise.resolve(context.react(CICLO_REACOES.erro)).catch(() => {})
                }
                const msgCmd = `⏸️ O comando \`${prefix}${cmd.name}\` foi desligado neste grupo com \`.cmd ${cmd.name} off\`.\nUm administrador pode religar com \`${prefix}cmd ${cmd.name} on\`.`
                await reply(msgCmd)
                return { fim: true }
            }
        }
    }
    return undefined
}

// 3.1.5 Categoria desativada no grupo (.categoria off <cat>) — bloqueia toda a categoria
async function portaoCategoriaDesligada(estado) {
    const { context, reply, cmd, from, isGroup, configs, catKeyForToggle } = estado
    if (isGroup && catKeyForToggle) {
        const disabledCats = configs[from]?.disabledCategories || []
        const canonicalCat = resolveCategoryKey(catKeyForToggle) || catKeyForToggle
        const isCatDisabled = disabledCats.includes(catKeyForToggle) || disabledCats.includes(canonicalCat)
        const alwaysAllowed = ['cmd', 'categoria', 'modulo', 'config', 'menu', 'help', 'dono', 'donos', 'ping', 'orientacao', 'menugrupo']
        if (isCatDisabled && !alwaysAllowed.includes(cmd.name.toLowerCase())) {
            if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
                Promise.resolve(context.react(CICLO_REACOES.erro)).catch(() => {})
            }
            const displayCat = canonicalCat || catKeyForToggle
            const catDoc = `⏸️ Os comandos da categoria *${displayCat}* estão desligados neste grupo.\n` +
                `Um administrador pode religar com \`.categoria on ${displayCat}\`.`
            await reply(catDoc)
            return { fim: true }
        }
    }
    return undefined
}

// 3.1.6 Opt-in de RPG (Fase B): quem desativou RPG no perfil é convidado a reativar
async function portaoRpgOptIn(estado) {
    const { context, reply, prefix, catKeyForToggle } = estado
    if (catKeyForToggle === 'rpg' && context.user && context.user.registered && context.user.rpgEnabled === false) {
        await reply(`⏸️ O RPG está desligado no seu perfil.\nPara jogar, ligue com \`${prefix}login rpg on\`.`)
        return { fim: true }
    }
    return undefined
}

// 3.2 Verificação de Modo Restrito no Grupo (.restringir adm - ADMs, Locatários e Donos)
async function portaoModoRestrito(estado) {
    const { reply, cmd, from, isGroup, isAdmin, isUserOwner, userRole, configs } = estado
    if (isGroup && configs[from]?.restrictedToAdmins && !isAdmin && !isUserOwner && userRole.level < ROLES.RENTAL_OWNER) {
        const allowedInRestricted = ['menu', 'help', 'dossie', 'ping']
        if (!allowedInRestricted.includes(cmd.name.toLowerCase())) {
            await reply('🔒 Neste grupo, só administradores estão usando comandos no momento.')
            return { fim: true }
        }
    }
    return undefined
}

// 4. Verificação de Comandos Exclusivos de Grupo (groupOnly)
async function portaoSoGrupo(estado) {
    const { context, reply, cmd, from, isGroup } = estado
    if (cmd.groupOnly && !isGroup) {
        if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
            Promise.resolve(context.react(CICLO_REACOES.erro)).catch(() => {})
        }
        await reply(mensagemSoGrupo(cmd.name))
        return { fim: true }
    }
    return undefined
}

// 5 e 6. Restrições de DM: bloqueio individual (.bandm) e bloqueio global (.bandm on)
async function portaoPrivado(estado) {
    const { reply, cmd, isGroup, roleJid, isUserOwner, configs } = estado
    // 5. Verificação de Restrição de DM (.bandm individual)
    if (!isGroup && permissionRepo.isDmBlocked(roleJid) && !isUserOwner) {
        await reply(MSG_PRIVADO_FECHADO)
        return { fim: true }
    }

    // 6. Verificação de Bloqueio Global de DM (.bandm on)
    const dmAllowedWhenGlobalClosed = ['dono', 'donos', 'menu', 'help', 'login', 'registrar', 'aluguel', 'planos', 'assinar']
    if (!isGroup && configs['global']?.blockAllDMs && !isUserOwner && !dmAllowedWhenGlobalClosed.includes(cmd.name.toLowerCase())) {
        await reply(MSG_PRIVADO_FECHADO)
        return { fim: true }
    }
    return undefined
}

// 7. Verificação de Modo Manutenção
async function portaoManutencao(estado) {
    const { reply, userRole } = estado
    if (securityService.isMaintenanceActive() && userRole.level < ROLES.OWNER) {
        await reply('🔧 Estou em manutenção rapidinho. Volto a responder em breve.')
        return { fim: true }
    }
    return undefined
}

// 8. Validação Centralizada de Permissões (5-Tier Role System)
async function portaoPermissao(estado) {
    const { context, reply, cmd, from, isGroup, isBotAdmin, userRole } = estado
    const permCheck = canExecuteCommand(userRole, cmd, { isGroup, isBotAdmin })
    if (!permCheck.allowed) {
        if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
            Promise.resolve(context.react(CICLO_REACOES.erro)).catch(() => {})
        }
        await reply(permCheck.reason)
        return { fim: true }
    }
    return undefined
}

// 8.1 Camada de Ativação / Opt-in e Estado de Módulos (se desligar fica desligado!)
async function portaoModulo(estado) {
    const { context, reply, cmd, from, isGroup, prefix } = estado
    const optInScope = moduleState.scopeOf(from, isGroup)
    const optInAllowed = ['cmd', 'modulo', 'categoria', 'config', 'menu', 'help', 'dono', 'donos', 'ping', 'orientacao', 'menugrupo',
        'login', 'registrar', 'cadastrar', 'registro', 'perfilconfig', 'entrarbot', 'comandos', 'eval', 'shutdown', 'restart']
    if (!optInAllowed.includes(cmd.name.toLowerCase()) && !moduleState.isCommandEnabled(cmd, optInScope)) {
        if (typeof context.react === 'function' && reactionsEnabled(from, isGroup)) {
            Promise.resolve(context.react(CICLO_REACOES.erro)).catch(err => logger.debug(`[DISPATCH] reação "bloqueado" falhou (.${cmd.name} em ${from}): ${err && err.message}`))
        }
        const mk = resolveModuleKey(cmd)
        const mLabel = (MODULE_BY_KEY[mk] && MODULE_BY_KEY[mk].label) || mk
        const { secaoDoModulo } = require('../config/botProfiles')
        const sec = secaoDoModulo(mk)

        let offDoc = `⏸️ O comando \`${prefix}${cmd.name}\` está desligado neste ambiente.\n`
        offDoc += `*Módulo:* ${mLabel}\n`
        offDoc += `*Seção:* ${sec.secao}\n\n`
        offDoc += `Para ligar este comando ou seu módulo:\n`
        if (sec.perfil) {
            offDoc += `• \`${prefix}perfilbot ${sec.perfil}\` — liga a seção inteira\n`
        }
        offDoc += `• \`${prefix}modulo on ${mk}\` — liga o módulo\n`
        offDoc += `• \`${prefix}cmd ${cmd.name} on\` — liga o comando no grupo\n`
        offDoc += `• \`${prefix}modulo status\` — mostra o que já está ligado`
        await reply(offDoc)
        return { fim: true }
    }
    return undefined
}

// 9. Verificação do Modo Aluguel (Grupos & PV)
async function portaoAluguel(estado) {
    const { reply, cmd, from, isGroup, prefix, roleJid, sender, senderReal, userRole } = estado
    if (userRole.level < ROLES.OWNER) {
        const rentalService = require('../services/rentalService')
        const bypassCmds = [
            'aluguel', 'rent', 'vitalicio', 'vitalício', 'dono', 'donos', 'ping',
            'planos', 'assinar', 'comprarcreditos', 'creditos', 'reativar',
            'login', 'registrar', 'cadastrar', 'registro'
        ]

        if (!bypassCmds.includes(cmd.name.toLowerCase())) {
            // 9.1 Verificação em Grupos
            if (isGroup && rentalService.isRentalModeEnabled(from, true)) {
                const groupRental = rentalService.hasActiveRental(from, 'group')
                if (!groupRental.active) {
                    let doc = `🔒 Este grupo está sem plano ativo, então meus comandos estão pausados aqui.\n\n`
                    doc += `Para liberar:\n`
                    doc += `• \`${prefix}aluguel planos\` — ver planos e valores\n`
                    doc += `• \`${prefix}aluguel teste\` — 2 horas grátis para experimentar\n`
                    doc += `• \`${prefix}dono\` — falar com os donos do bot\n\n`
                    doc += `_Se você é dono do bot, \`${prefix}aluguel vitalicio grupo\` libera este grupo._`
                    await reply(doc)
                    return { fim: true }
                }
            }

            // 9.2 Verificação no Privado (PV / DM)
            if (!isGroup && rentalService.isRentalModeEnabled(roleJid, false)) {
                const candidateJids = [roleJid, sender, senderReal].filter(Boolean)
                const pvRental = rentalService.hasActiveRental(roleJid, 'pv', candidateJids)
                if (!pvRental.active) {
                    let doc = `🔒 No privado, eu atendo quem tem o plano *Privado* ou o *Combo* (grupo + privado).\n\n`
                    doc += `Para liberar:\n`
                    doc += `• \`${prefix}aluguel planos\` — ver os planos Privado e Combo\n`
                    doc += `• \`${prefix}aluguel teste\` — 2 horas grátis para experimentar\n`
                    doc += `• \`${prefix}dono\` — falar com os donos do bot`
                    await reply(doc)
                    return { fim: true }
                }
            }
        }
    }
    return undefined
}

// 10. Verificação de Estado Operacional (Bot Lifecycle Scheduler)
async function portaoTaverna(estado) {
    const { reply, userRole } = estado
    let botState = botScheduler.getBotState()
    if (botState === botScheduler.BOT_STATES.OFFLINE && userRole.level < ROLES.BOT_ADMIN) {
        const scheduleRepo = require('../database/repositories/scheduleRepository')
        const active = scheduleRepo.getActiveSchedules()
        const agora = Date.now()
        // Se houver agendamentos cuja reabertura já passou, destrava automaticamente
        if (active.length > 0 && active.every(s => s.reopen_at && s.reopen_at <= agora)) {
            try {
                require('../services/selfHealService').destravarAgendamentos(agora)
                botState = botScheduler.getBotState()
            } catch (err) { logger.warn('[COMMANDDISPATCHER] falha ignorada: ' + (err && err.message)) }
        }
        if (botState === botScheduler.BOT_STATES.OFFLINE) {
            await reply(mensagemFechado())
            return { fim: true }
        }
    }
    return undefined
}

// 11. Verificação de Rate Limit / Anti-Spam com Tolerância Escalonada
async function portaoLimiteDeUso(estado) {
    const { reply, roleJid, isOwnerOrBotAdmin, userRole } = estado
    const isTrusted = userRole.level >= ROLES.TRUSTED
    const rateCheck = securityService.checkRateLimit(roleJid, isOwnerOrBotAdmin, isTrusted)
    if (rateCheck.blocked) {
        await reply(rateCheck.reason)
        return { fim: true }
    }
    return undefined
}

// 8. Cooldown Global por Usuário (mínimo 1.5s entre comandos diferentes para evitar flood)
async function portaoCooldownGlobal(estado) {
    const { reply, roleJid, userRole } = estado
    if (userRole.level < ROLES.BOT_ADMIN && process.env.NODE_ENV !== 'test') {
        const userCooldownKey = `user_global:${roleJid}`
        const now = Date.now()
        const lastUserCmd = cooldowns.get(userCooldownKey) || 0
        const globalCooldown = 1500

        if (now - lastUserCmd < globalCooldown) {
            const segundosRestantes = Math.ceil((globalCooldown - (now - lastUserCmd)) / 1000)
            await reply(`⏳ Calma, um comando de cada vez. Tente de novo em ${formatarSegundos(segundosRestantes)}.`)
            return { fim: true }
        }
        cooldowns.set(userCooldownKey, now)
    }
    return undefined
}

// 9. Cooldown Individual do Comando
async function portaoCooldownComando(estado) {
    const { reply, cmd, roleJid, userRole } = estado
    const cooldownDuration = cmd.cooldownMs !== undefined ? cmd.cooldownMs : (env.defaultCooldownMs || 2000)
    if (cooldownDuration > 0 && userRole.level < ROLES.TRUSTED) {
        const cooldownKey = `${roleJid}:${cmd.name}`
        const now = Date.now()
        const lastExecuted = cooldowns.get(cooldownKey) || 0

        if (now - lastExecuted < cooldownDuration) {
            const segundosRestantes = Math.ceil((cooldownDuration - (now - lastExecuted)) / 1000)
            await reply(`⏳ O \`.${cmd.name}\` fica disponível de novo em ${formatarSegundos(segundosRestantes)}.`)
            return { fim: true }
        }
        cooldowns.set(cooldownKey, now)
    }
    return undefined
}

const PORTOES = [
    portaoComando,                 // 0 categoria, resolução do comando
    portaoBlacklist,               // 1
    resolverPapel,                 // 2 (não para)
    portaoAjudaUniversal,          // 3
    portaoComandoBanido,           // 3.1
    portaoComandoDesligadoNoGrupo, // 3.1.3
    portaoCategoriaDesligada,      // 3.1.5
    portaoRpgOptIn,                // 3.1.6
    portaoModoRestrito,            // 3.2
    portaoSoGrupo,                 // 4
    portaoPrivado,                 // 5, 6
    portaoManutencao,              // 7
    portaoPermissao,               // 8
    portaoModulo,                  // 8.1
    portaoAluguel,                 // 9
    portaoTaverna,                 // 10
    portaoLimiteDeUso,             // 11
    portaoCooldownGlobal,          // 8 (cooldown global)
    portaoCooldownComando          // 9 (cooldown do comando)
]

async function dispatch(context) {
    const estado = prepararEstado(context)
    if (!estado) return false

    for (const portao of PORTOES) {
        const parada = await portao(estado)
        if (parada) return parada.fim
    }

    return executarComando(estado)
}

/**
 * Execução do comando depois dos portões: reações, timer de "processando",
 * resposta inteligente (uso seco e ajuda) e telemetria. Sempre devolve o
 * resultado final (true/false) ou true depois de tratar uma exceção.
 */
async function executarComando(estado) {
    const { context, sender, from, isGroup, roleJid, cmd, userRole } = estado
    let reply = context.reply

    const startTime = Date.now()

    // Disparo dinâmico e não-bloqueante de reação contextual por comando ou categoria
    const reacoesLigadas = reactionsEnabled(from, isGroup)

    if (typeof context.react === 'function' && reacoesLigadas) {
        const reactionEmoji = COMMAND_REACTIONS[cmd.name] ||
            (cmd.category && CATEGORY_REACTIONS[cmd.category.toLowerCase()]) ||
            '⚡'
        if (reactionEmoji) {
            Promise.resolve(context.react(reactionEmoji)).catch(err => logger.debug(`[DISPATCH] reação de início falhou (.${cmd.name} em ${from}): ${err && err.message}`))
        }
    }

    // Marca "ainda trabalhando" se o comando demorar. O timer é cancelado nos
    // dois desfechos (sucesso e erro), senão a reação chegaria depois do fim.
    let timerProcessando = null
    if (typeof context.react === 'function' && reacoesLigadas) {
        timerProcessando = setTimeout(() => {
            Promise.resolve(context.react(CICLO_REACOES.processando)).catch(err => logger.debug(`[DISPATCH] reação "processando" falhou (.${cmd.name} em ${from}): ${err && err.message}`))
        }, MS_ATE_PROCESSANDO)
    }
    const encerrarTimer = () => { if (timerProcessando) { clearTimeout(timerProcessando); timerProcessando = null } }

    // A seção Dev/Skycode fala a língua técnica de propósito: um comando que
    // explica códigos de status ou formata consulta de banco fica inútil se
    // "HTTP" e "SQL" forem traduzidos. A isenção acompanha toda a cadeia
    // assíncrona da execução, então vale para qualquer envio que ela fizer.
    // Pedido de uso seco vira ajuda completa. 617 comandos respondem ao uso
    // incompleto com mensagem própria, em seis formatos e quase sempre de uma
    // linha; em vez de reescrever um por um, a PRIMEIRA resposta de cada execução
    // passa pelo usoService, que só age quando reconhece esse caso.
    let teveErro = false

    if (typeof context.reply === 'function' || typeof reply === 'function') {
        const responderOriginal = context.reply || reply
        let primeira = true
        const smartReply = async (texto, ...resto) => {
            if (ehMensagemDeErro(texto)) {
                teveErro = true
            }

            if (primeira && cmd.name !== 'help') {
                primeira = false
                try {
                    const semArgumentos = !Array.isArray(context.args) || context.args.length === 0
                    if (usoService.ehPedidoDeUso(texto, { semArgumentos })) {
                        teveErro = true
                        texto = usoService.enriquecerPedidoDeUso(cmd, texto, {
                            prefix: context.prefix || '.',
                            digitado: context.commandName
                        })
                    }
                } catch (errUso) {
                    logger.warn(`[DISPATCH] não consegui enriquecer o pedido de uso de .${cmd.name}: ${errUso.message}`)
                }

                // Mapeamento universal: todo comando respondido possui comandos para ajudar
                try {
                    if (typeof texto === 'string' && texto.trim()) {
                        const jaTemAjuda = /🧭|Comandos para Ajudar|Comando de Ajuda|Próximos passos/i.test(texto)
                        const ehMensagemCurtaOuSistema = texto.startsWith('⏳') || texto.startsWith('🚫') || texto.startsWith('⏸️') || texto.startsWith('❌')
                        if (!jaTemAjuda && !ehMensagemCurtaOuSistema) {
                            const recService = require('../services/smartRecommendationService')
                            const helperLine = recService.formatHelperLine(cmd.name, cmd.category, context.prefix || '.')
                            if (helperLine) {
                                texto = `${texto.trim()}\n\n${helperLine}`
                            }
                        }
                    }
                } catch (errHelp) {
                    logger.debug(`[DISPATCH] falha ao anexar comandos de ajuda em .${cmd.name}: ${errHelp.message}`)
                }
            }
            return responderOriginal(texto, ...resto)
        }
        context.reply = smartReply
        reply = smartReply
    }

    const executar = () => cmd.execute(context)

    try {
        const resultadoExec = await (ehIsentoDeLore(cmd) ? semLore(executar) : executar())
        encerrarTimer()

        const falhou = teveErro || resultadoExec === false || (resultadoExec && resultadoExec.success === false)

        if (typeof context.react === 'function' && reacoesLigadas) {
            const reacaoFinal = falhou ? CICLO_REACOES.erro : CICLO_REACOES.sucesso
            Promise.resolve(context.react(reacaoFinal)).catch(err => logger.debug(`[DISPATCH] reação final falhou (.${cmd.name} em ${from}): ${err && err.message}`))
        }

        const latencyMs = Date.now() - startTime
        telemetryService.recordExecution(cmd.name, latencyMs, !falhou)

        if (falhou) {
            return false
        }

        analyticsRepo.recordCommandUsage(cmd.name, cmd.category || 'geral')

        if (context.sender) {
            try {
                // Incremento atômico: não lê nem reescreve a linha inteira (antes
                // custava um SELECT * de todos os usuários por comando e ainda
                // sobrescrevia o que o próprio comando acabara de gravar).
                userRepo.incrementCommandCount(context.sender, context.isGroup)
            } catch (e) {
                logger.warn(`[CMD COUNTER] falha ao incrementar contador de ${context.sender}: ${e.message}`)
            }
        }

        return true
    } catch (err) {
        encerrarTimer()
        if (typeof context.react === 'function' && reacoesLigadas) {
            Promise.resolve(context.react(CICLO_REACOES.erro)).catch(reactErr => logger.debug(`[DISPATCH] reação "erro" falhou (.${cmd.name} em ${from}): ${reactErr && reactErr.message}`))
        }
        const latencyMs = Date.now() - startTime
        telemetryService.recordExecution(cmd.name, latencyMs, false, err)
        logger.error(`[COMMAND ERROR] Falha ao executar ${cmd.name} de ${sender}:`, err)
        // Falha persistida (o telemetryService é só memória e zera no restart).
        // Gravar a métrica nunca pode impedir a resposta ao usuário.
        try {
            analyticsRepo.recordCommandFailure(cmd.name, cmd.category || 'geral', err)
        } catch (metricErr) {
            logger.warn(`[DISPATCH] não consegui registrar a falha de .${cmd.name}: ${metricErr.message}`)
        }
        await reply(`❌ Algo deu errado com o \`.${cmd.name}\` agora. Tente de novo em instantes. Se continuar, avise um administrador.`)
        return true
    }
}

function getCommands() {
    return commands
}

function getAliases() {
    return aliases
}

function levenshteinDistance(s1, s2) {
    s1 = s1.toLowerCase()
    s2 = s2.toLowerCase()
    const costs = []
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j
            else {
                if (j > 0) {
                    let newValue = costs[j - 1]
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
                    }
                    costs[j - 1] = lastValue
                    lastValue = newValue
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue
    }
    return costs[s2.length]
}

function findCommand(nameOrAlias) {
    if (!nameOrAlias) return null
    if (commands.size === 0) {
        loadCommands()
    }
    const clean = nameOrAlias.toLowerCase().replace(/^[.!#\/]/, '').trim()
    return commands.get(clean) || aliases.get(clean) || null
}

function findClosestCommand(input) {
    if (!input || typeof input !== 'string') return null
    const clean = input.toLowerCase().replace(/^[.!#\/]/, '').trim()
    const allNames = Array.from(new Set([...commands.keys(), ...aliases.keys()]))
    let bestMatch = null
    let minDistance = Infinity

    for (const name of allNames) {
        const dist = levenshteinDistance(clean, name)
        if (dist < minDistance && dist <= (clean.length <= 4 ? 1 : 3)) {
            minDistance = dist
            bestMatch = name
        }
    }
    return bestMatch ? (commands.get(bestMatch) || aliases.get(bestMatch)) : null
}

function findClosestCommands(input, limit = 5, ctx = null) {
    if (!input || typeof input !== 'string') return []
    const query = input.toLowerCase().replace(/^[.!#\/]/, '').trim()
    if (!query) return []

    // Não sugere comandos que o usuário não poderia executar (evita expor
    // comandos de owner/admin a membros comuns). Sem ctx, não filtra.
    const canSee = (cmdObj) => {
        if (!ctx || !ctx.userRole) return true
        try {
            return canExecuteCommand(ctx.userRole, cmdObj, { isGroup: ctx.isGroup, isBotAdmin: ctx.isBotAdmin }).allowed
        } catch (err) {
            logger.debug(`[DISPATCH] sugestão: checagem de permissão de .${cmdObj && cmdObj.name} falhou, mantenho visível: ${err.message}`)
            return true
        }
    }

    const allNames = getAllTriggers()
    const scored = []
    const seenCmdNames = new Set()

    // 1. Prefix Match (Comandos ou aliases que começam com a query digitada)
    for (const name of allNames) {
        if (name.startsWith(query)) {
            const cmdObj = commands.get(name) || aliases.get(name)
            if (cmdObj && !seenCmdNames.has(cmdObj.name) && canSee(cmdObj)) {
                seenCmdNames.add(cmdObj.name)
                scored.push({ cmd: cmdObj, priority: 1, score: query.length / name.length })
            }
        }
    }

    // 2. Substring Match (Comandos ou aliases que contêm a query)
    if (query.length >= 3) {
        for (const name of allNames) {
            if (name.includes(query)) {
                const cmdObj = commands.get(name) || aliases.get(name)
                if (cmdObj && !seenCmdNames.has(cmdObj.name) && canSee(cmdObj)) {
                    seenCmdNames.add(cmdObj.name)
                    scored.push({ cmd: cmdObj, priority: 2, score: query.length / name.length })
                }
            }
        }
    }

    // 3. Levenshtein com filtro estrito de relevância e poda por comprimento
    if (scored.length < limit) {
        for (const name of allNames) {
            if (Math.abs(name.length - query.length) > 3) continue
            const cmdObj = commands.get(name) || aliases.get(name)
            if (!cmdObj || seenCmdNames.has(cmdObj.name) || !canSee(cmdObj)) continue

            const dist = levenshteinDistance(query, name)
            let isRelevant = false

            if (query.length <= 3) {
                // Para palavras curtas (ex: 'rpg'), apenas aceita se compartilhar a 1ª letra e tiver distância 1
                isRelevant = dist === 1 && name[0] === query[0]
            } else if (query.length <= 5) {
                isRelevant = dist <= 2 && (name.slice(0, 2) === query.slice(0, 2) || name.includes(query.slice(0, 3)))
            } else {
                isRelevant = dist <= 3 && (name.slice(0, 2) === query.slice(0, 2) || name.slice(-2) === query.slice(-2))
            }

            if (isRelevant) {
                seenCmdNames.add(cmdObj.name)
                scored.push({ cmd: cmdObj, priority: 3, score: 1 / (dist + 1) })
            }
        }
    }

    // 4. Fallback Inteligente por Intenção (se nenhuma grafia parecida for encontrada)
    if (scored.length === 0) {
        try {
            const { suggestByIntent } = require('../services/smartRecommendationService')
            const intentRes = suggestByIntent(query, limit)
            if (intentRes && intentRes.commands) {
                for (const item of intentRes.commands) {
                    const cmdObj = commands.get(item.cmd) || aliases.get(item.cmd)
                    if (cmdObj && !seenCmdNames.has(cmdObj.name) && canSee(cmdObj)) {
                        seenCmdNames.add(cmdObj.name)
                        scored.push({ cmd: cmdObj, priority: 4, score: 0.5 })
                    }
                }
            }
        } catch (err) { logger.warn('[COMMANDDISPATCHER] falha ignorada: ' + (err && err.message)) }
    }

    scored.sort((a, b) => (a.priority - b.priority) || (b.score - a.score))
    return scored.slice(0, limit).map(item => item.cmd).filter(Boolean)
}

module.exports = {
    loadCommands,
    dispatch,
    getCommands,
    getAliases,
    getValidationReport,
    findCommand,
    findClosestCommand,
    findClosestCommands,
    commands,
    aliases,
    cooldowns,
    CICLO_REACOES,
    ehMensagemDeErro,
    // Para os testes: os emojis de início de comando.
    reacoesDeInicio: { COMMAND_REACTIONS, CATEGORY_REACTIONS }
}
