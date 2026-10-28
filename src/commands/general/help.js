/**
 * Dynamic Command Discovery & Help System
 * Guia de comandos categorizado e documentação detalhada com previews e variáveis (.help <categoria|comando>)
 */

const env = require('../../config/env')
const { getWallpaperBuffer } = require('../../utils/wallpapers')
const { getBotName } = require('../../config/botConfig')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')
const { permissaoDe, ondeFuncionaDe } = require('../../services/usoService')
const { resolveSubcategory } = require('../../services/taxonomyService')

const CATEGORY_NAMES = {
    media: '📥 Mídia & Downloads',
    dev: '👨‍💻 Dev Hub & Utilitários',
    rpg: '⚔️ RPG & Combates',
    economy: '🎰 Economia & Perfil',
    admin: '🛡️ Administração de Grupos',
    config: '⚙️ Configurações do Grupo',
    owner: '👑 Donos & Aluguel',
    aluguel: '💎 Aluguel de Grupos & Pix',
    calc: '🧮 Calculadora & Matemática',
    pesquisa: '🔍 Pesquisa, IA & Visão',
    rede: '🌐 Rede, Pings & Telemetria',
    fun: '🎲 Diversão & Jogos',
    interacao: '💞 Interação Social & Afeto',
    general: '📚 Informações & Geral'
}

const CATEGORY_ALIASES = {
    'downloads': 'media', 'midia': 'media', 'midias': 'media',
    'eco': 'economy', 'economia': 'economy', 'perfil': 'economy',
    'configs': 'config', 'configuracao': 'config', 'configuracoes': 'config',
    'dono': 'owner', 'donos': 'owner', 'vps': 'owner',
    'rent': 'aluguel', 'planos': 'aluguel',
    'calculadora': 'calc', 'math': 'calc', 'matematica': 'calc',
    'ia': 'pesquisa', 'busca': 'pesquisa', 'google': 'pesquisa',
    'net': 'rede', 'telemetria': 'rede', 'pings': 'rede',
    'jogos': 'fun', 'diversao': 'fun',
    'social': 'interacao', 'afeto': 'interacao', 'acoes': 'interacao',
    'geral': 'general', 'info': 'general'
}

// Exemplos detalhados e previews interativos para comandos chave
const COMMAND_HELP_EXTRAS = {
    'welcome': {
        usage: '.welcome <on|off|msg|preview|reset>',
        examples: [
            '.welcome on — Ativa avisos de entrada',
            '.welcome off — Desativa avisos de entrada',
            '.welcome preview — Visualiza simulação da mensagem',
            '.welcome msg Olá {user}, seja bem-vindo ao {grupo}! Regras: {desc}'
        ],
        variables: ['{user}', '{grupo}', '{desc}', '{membros}', '{hora}']
    },
    'leave': {
        usage: '.leave <on|off|msg|preview|reset>',
        examples: [
            '.leave on — Ativa mensagens de despedida',
            '.leave off — Desativa mensagens de despedida',
            '.leave preview — Visualiza simulação da mensagem',
            '.leave msg O membro {user} saiu do {grupo}. Restam {membros} membros!'
        ],
        variables: ['{user}', '{grupo}', '{desc}', '{membros}', '{hora}']
    },
    'solicitacoes': {
        usage: '.solicitacoes [list] | .aceitar [todos/@user] | .rejeitar [todos/@user]',
        examples: [
            '.solicitacoes — Lista todos os pedidos pendentes',
            '.aceitar todos — Aceita todos com intervalo seguro anti-ban (5 a 10s)',
            '.aceitar @user — Aceita usuário específico',
            '.rejeitar todos — Rejeita todas as solicitações'
        ],
        variables: []
    },
    'setnomegrupo': {
        usage: '.setnomegrupo <novo nome>',
        examples: [
            '.setnomegrupo 🐉 Clã Saga Épica 🐉'
        ],
        variables: ['Máximo de 100 caracteres suportados']
    },
    'setdesc': {
        usage: '.setdesc <texto da bio ou regras>',
        examples: [
            '.setdesc Regras do Grupo:\n1. Respeite os membros\n2. Sem spam/links'
        ],
        variables: ['Pode responder a uma mensagem com .setdesc']
    },
    'setfotogrupo': {
        usage: '.setfotogrupo (respondendo a uma foto)',
        examples: [
            'Envie ou responda uma imagem com .setfotogrupo'
        ],
        variables: ['Corte automático para foto de perfil do grupo']
    },
    'gruposettings': {
        usage: '.gruposettings <info|aprovacao> <admin|todos|on|off>',
        examples: [
            '.gruposettings info admin — Apenas admins alteram dados do grupo',
            '.gruposettings info todos — Todos participantes alteram dados',
            '.gruposettings aprovacao on — Liga modo de aprovação para entrar',
            '.gruposettings aprovacao off — Entrada livre por link direto'
        ],
        variables: []
    },
    'restringir': {
        usage: '.restringir <on|adm|off>',
        examples: [
            '.restringir adm — Só administradores e donos me usam no grupo',
            '.restringir off — Libera comandos para todos os membros'
        ],
        variables: []
    },
    'bancmd': {
        usage: '.bancmd <categoria|comando|all> [motivo]',
        examples: [
            '.bancmd rpg — Bane todos os 30 comandos de RPG',
            '.bancmd media — Bane todos os downloads e mídias',
            '.bancmd ytmp4 — Bane o download de vídeo do YouTube',
            '.bancmd all Manutenção Geral — Bane todos os comandos públicos',
            '.unbancmd all — Reativa todos os comandos globalmente'
        ],
        variables: []
    },
    'youtube': {
        usage: '.youtube <link|busca> [--mp3]',
        examples: [
            '.youtube https://youtu.be/cBpUZJ0qxqs — Baixa vídeo em MP4 HD',
            '.youtube https://youtu.be/cBpUZJ0qxqs --mp3 — Baixa áudio em MP3',
            '.youtube Linkin Park Numb — Pesquisa e baixa vídeo'
        ],
        variables: ['Compatível com WhatsApp Mobile e Web até 2GB']
    },
    'ia': {
        usage: '.ia <pergunta ou termo de pesquisa>',
        examples: [
            '.ia quem descobriu o Brasil?',
            '.ia últimas notícias de astronomia',
            '.ia como funciona a relatividade geral?'
        ],
        variables: ['Pesquisa na Web em tempo real com fontes verificadas']
    }
}

/** Descrição curta, sem a sintaxe entre parênteses que algumas carregam. */
function descCurta(c, max = 70) {
    let d = String(c.description || '').replace(/\s*\(\.[^)]*\)\s*$/, '').trim()
    if (d.length > max) d = d.slice(0, max).replace(/\s+\S*$/, '') + '…'
    return d.replace(/\.$/, '')
}

/** Comando visível para quem pediu. */
function visivel(c, isUserAdmin, isUserOwner) {
    if (c.hidden) return false
    if (c.ownerOnly && !isUserOwner) return false
    if (c.adminOnly && !isUserAdmin) return false
    return true
}

/** Guia completo de um comando. */
function guiaDoComando(cmd, { p, allCommands, isUserAdmin, isUserOwner }) {
    const extra = COMMAND_HELP_EXTRAS[cmd.name] || null
    const catName = CATEGORY_NAMES[cmd.category] || cmd.category || 'Geral'
    const atalhos = Array.from(new Set((cmd.aliases || []).filter(a => a && a !== cmd.name)))
    const espera = F.tempo(cmd.cooldownMs ?? env.defaultCooldownMs ?? 2000)

    const detalhes = [
        F.campo('Área', catName),
        F.campo('Quem pode usar', permissaoDe(cmd)),
        F.campo('Onde funciona', ondeFuncionaDe(cmd)),
        F.campo('Espera entre usos', espera)
    ]
    if (cmd.botAdminOnly) detalhes.push(F.campo('Requisito', 'eu preciso ser administrador do grupo'))
    if (atalhos.length) {
        const mostrados = atalhos.slice(0, 6).map(a => F.cmd(p, a)).join(', ')
        detalhes.push(F.campo('Também funciona como', mostrados + (atalhos.length > 6 ? ` e mais ${atalhos.length - 6}` : '')))
    }

    // Sintaxe: schema do comando, depois o guia manual antigo, depois só o nome.
    let sintaxe = F.cmd(p, cmd.name)
    if (cmd.usage) sintaxe = F.cmd(p, cmd.name, String(cmd.usage).trim())
    else if (extra && extra.usage) sintaxe = '`' + extra.usage.replace(/^\./, p) + '`'

    const exemplos = []
    if (Array.isArray(cmd.examples) && cmd.examples.length) {
        for (const ex of cmd.examples.slice(0, 6)) {
            const [args, explicacao] = String(ex).split(/\s+—\s+/)
            const a = String(args || '').trim().replace(new RegExp(`^[.!#/]?${cmd.name}\\s*`, 'i'), '')
            exemplos.push(`• ${F.cmd(p, cmd.name, a)}${explicacao ? ' — ' + explicacao.trim() : ''}`)
        }
    } else if (extra && extra.examples) {
        for (const ex of extra.examples) {
            const [comando, explicacao] = String(ex).split(/\s+—\s+/)
            exemplos.push(`• \`${comando.replace(/^\./, p)}\`${explicacao ? ' — ' + explicacao : ''}`)
        }
    }

    const notas = extra && Array.isArray(extra.variables) ? extra.variables.map(v => `• ${v}`) : []

    // Relacionados: mesma subcategoria, visíveis para quem pediu.
    const sub = resolveSubcategory(cmd)
    const vistos = new Set([cmd])
    const relacionados = []
    for (const c of allCommands.values()) {
        if (relacionados.length >= 4) break
        if (!c || vistos.has(c)) continue
        vistos.add(c)
        if (c.category !== cmd.category || resolveSubcategory(c) !== sub) continue
        if (!visivel(c, isUserAdmin, isUserOwner)) continue
        relacionados.push(`• ${F.cmd(p, c.name)} — ${descCurta(c, 55)}`)
    }

    const descricao = descCurta(cmd, 400) || 'Sem descrição cadastrada'
    return F.tela({
        emoji: '📖',
        titulo: `Guia do ${p}${cmd.name}`,
        intro: descricao + '.',
        secoes: [
            { emoji: '📋', titulo: 'Detalhes', linhas: detalhes },
            { emoji: '⌨️', titulo: 'Como usar', linhas: [sintaxe] },
            { emoji: '🧪', titulo: 'Exemplos', linhas: exemplos },
            { emoji: '📝', titulo: 'Observações', linhas: notas },
            { emoji: '🔗', titulo: 'Comandos parecidos', linhas: relacionados }
        ],
        dica: `Para ver a área inteira: ${F.cmd(p, 'menu')}`,
        prefix: p
    })
}

module.exports = {
    name: 'help',
    aliases: ['ajuda', 'socorro', 'comandos'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Central de ajuda: minhas áreas e o guia de cada comando',
    usage: '[área ou comando]',
    examples: ['— visão geral das áreas', 'media — comandos de download', '.play — guia completo do .play'],
    cooldownMs: 2000,
    execute: async ({ text, reply, client, from, info, isAdmin, isOwner, userRole }) => {
        const dispatcher = require('../../handlers/commandDispatcher')
        const allCommands = dispatcher.getCommands()
        const configs = dataService.getConfigsData()
        const p = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'
        const botName = getBotName()

        const isUserAdmin = isAdmin || isOwner || (userRole && userRole.level >= 3)
        const isUserOwner = isOwner || (userRole && userRole.level >= 5)

        const query = (text || '').trim().toLowerCase()

        const enviar = async (doc, categoria) => {
            if (process.env.NODE_ENV === 'test' || !client) return reply(doc.trim())
            const { sendMenuMediaMessage } = require('../../utils/wallpapers')
            return sendMenuMediaMessage(client, from, { category: categoria, text: doc, quoted: info })
        }

        if (query) {
            const hasDot = /^[.!#\/]/.test(query)
            let cleanQuery = query.replace(/^[.!#\/]/, '').trim()
            if (CATEGORY_ALIASES[cleanQuery]) cleanQuery = CATEGORY_ALIASES[cleanQuery]

            // 1. Área inteira (.help media)
            const isCategory = !hasDot && Object.keys(CATEGORY_NAMES).find(c => c === cleanQuery)
            if (isCategory) {
                if ((isCategory === 'admin' || isCategory === 'config') && !isUserAdmin) {
                    return reply('🔒 Essa área é dos administradores do grupo.\n\nPara ver o que você pode usar: `' + p + 'help`')
                }
                if ((isCategory === 'owner' || isCategory === 'aluguel') && !isUserOwner) {
                    return reply('🔒 Essa área é só dos meus donos.\n\nPara ver o que você pode usar: `' + p + 'help`')
                }

                const cmds = Array.from(new Set(allCommands.values()))
                    .filter(c => c.category === isCategory && visivel(c, isUserAdmin, isUserOwner))
                    .sort((a, b) => a.name.localeCompare(b.name))

                const doc = F.tela({
                    emoji: '',
                    titulo: CATEGORY_NAMES[isCategory],
                    intro: `Você tem *${cmds.length} comandos* nesta área. Para o guia de qualquer um, use ${F.cmd(p, 'help', '.' + (cmds[0]?.name || 'comando'))}.`,
                    secoes: [{ emoji: '📂', titulo: 'Comandos', linhas: cmds.map(c => `• ${F.cmd(p, c.name)} — ${descCurta(c)}`) }],
                    dica: `Menu organizado por seções: ${F.cmd(p, 'menu', isCategory)}`,
                    prefix: p
                })
                return enviar(doc, isCategory)
            }

            // 2. Um comando (.help .play)
            const targetCmd = dispatcher.findCommand(cleanQuery)
            if (targetCmd) {
                if (targetCmd.ownerOnly && !isUserOwner) {
                    return reply('🔒 O `' + p + targetCmd.name + '` é só para os meus donos.')
                }
                if (targetCmd.adminOnly && !isUserAdmin) {
                    return reply('🔒 O `' + p + targetCmd.name + '` é só para administradores do grupo.')
                }
                return reply(guiaDoComando(targetCmd, { p, allCommands, isUserAdmin, isUserOwner }))
            }

            return reply(
                `🤔 Não achei nenhuma área ou comando chamado *${query}*.\n\n` +
                `• Para ver as áreas: ${F.cmd(p, 'help')}\n` +
                `• Para procurar no menu: ${F.cmd(p, 'menu')}`
            )
        }

        // 3. Visão geral das áreas (.help)
        const porArea = new Map()
        let totalVisivel = 0
        for (const c of new Set(allCommands.values())) {
            const cat = c.category || 'general'
            if (!CATEGORY_NAMES[cat] || !visivel(c, isUserAdmin, isUserOwner)) continue
            // Mesma regra da consulta por área: quem não tem o cargo nem vê a área.
            if ((cat === 'admin' || cat === 'config') && !isUserAdmin) continue
            if ((cat === 'owner' || cat === 'aluguel') && !isUserOwner) continue
            porArea.set(cat, (porArea.get(cat) || 0) + 1)
            totalVisivel++
        }

        const areas = []
        for (const [catKey, label] of Object.entries(CATEGORY_NAMES)) {
            const n = porArea.get(catKey) || 0
            if (n > 0) areas.push(`• ${label} — ${n} · ${F.cmd(p, 'help', catKey)}`)
        }

        const mainDoc = F.tela({
            emoji: '❓',
            titulo: `Central de ajuda — ${botName}`,
            intro: `Você tem acesso a *${totalVisivel} comandos*. Escolha uma área para ver os comandos dela, ou peça o guia completo de um comando.`,
            secoes: [
                { emoji: '📂', titulo: 'Áreas', linhas: areas },
                { emoji: '🧪', titulo: 'Exemplos', linhas: [
                    `• ${F.cmd(p, 'help', '.play')} — guia completo de um comando`,
                    `• ${F.cmd(p, 'help', 'media')} — todos os comandos de uma área`,
                    `• ${F.cmd(p, 'menu')} — menu com os mais usados`,
                    `• ${F.cmd(p, 'play', '-help')} — o mesmo guia, direto no comando`
                ] }
            ],
            prefix: p
        })
        return enviar(mainDoc, isUserOwner ? 'owner' : (isUserAdmin ? 'admin' : 'help'))
    }
}
