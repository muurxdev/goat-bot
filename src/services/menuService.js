/**
 * Gerador de menu a partir do registro de comandos.
 *
 * Todo comando com `category` aparece automaticamente, agrupado por subcategoria
 * (taxonomyService), com paginação para caber no WhatsApp.
 *
 * Visual (decisão do dono em 2026-09-18, desfazendo a de 2026-09-17): caixas de
 * utils/moldura.js, "📊 *Total:*" no topo e cada comando como
 * "┃ ➤ `.nome` [`.a`, `.b`, `.c`] — o que faz", com até 3 atalhos.
 *
 * Organização (2026-09-17):
 *  - subcategorias iguais escritas de jeitos diferentes ("🎲 DIVERSÃO & JOGOS" e
 *    "Diversão e Jogos") viram uma só, e seções de um comando só vão para "Outros";
 *  - categoria longa abre com um índice das seções e a página de cada uma;
 *  - a página 2 do painel mostra os comandos MAIS USADOS de verdade.
 *
 * Visibilidade por cargo: esconde comandos acima do nível do usuário (ownerOnly=5,
 * adminOnly=3, minRole=N). Não filtra por groupOnly/botAdminOnly — o menu é um
 * catálogo estável.
 */

const { CATEGORIES, BY_KEY } = require('../config/categories')
const { resolveSubcategory } = require('./taxonomyService')
const { resolveModuleKey } = require('../config/modules')
const { tituloEmFrase } = require('./vozService')
const M = require('../utils/moldura')
const logger = require('../core/logger')

const ATALHOS_POR_LINHA = 3

const CAPTION_BUDGET = 1000
const FOOTER_RESERVE = 150   // espaço p/ navegação anexada após a paginação
const TEXT_BUDGET = 3500      // páginas seguintes vão como texto
const PAGINAS_PARA_INDICE = 4 // a partir daqui a página 1 vira índice das seções

const ROLE_OWNER = 5
const ROLE_ADMIN = 3

const EMOJIS = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*️?/gu

/** Resolve a categoria estratégica canônica de qualquer comando. */
function getCmdCategoryKey(cmd) {
    if (!cmd) return 'utilidades'
    const mod = resolveModuleKey(cmd)
    if (mod === 'xp') return 'perfil'
    if (mod === 'skycode' || mod === 'divulgacao') return 'owner'
    return mod || cmd.category || 'utilidades'
}

/** Nível de cargo mínimo para VER o comando no menu. */
function requiredLevel(cmd) {
    if (cmd.ownerOnly) return ROLE_OWNER
    if (cmd.adminOnly) return ROLE_ADMIN
    if (typeof cmd.minRole === 'number') return cmd.minRole
    return 1
}

function canSeeInMenu(cmd, userLevel) {
    if (cmd.hidden) return false
    return userLevel >= requiredLevel(cmd)
}

/** "🎲 DIVERSÃO & JOGOS" → "Diversão & Jogos" */
function limparTitulo(sub) {
    const t = String(sub || '').replace(EMOJIS, '').replace(/\s{2,}/g, ' ').trim()
    return t ? tituloEmFrase(t) : 'Outros'
}

/** Chave de comparação: ignora emoji, acento, caixa e "&" versus "e". */
function chaveDeSub(sub) {
    return limparTitulo(sub).normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/&/g, ' e ').replace(/[^a-z0-9]+/g, ' ').trim() || 'outros'
}

/** Agrupa comandos visíveis de uma categoria por subcategoria. Map<título, cmd[]>. */
function groupByCategory(registry, categoryKey, userLevel) {
    const porChave = new Map()   // chave -> { titulo, cmds }
    const seen = new Set()
    for (const cmd of registry.values()) {
        if (!cmd || seen.has(cmd)) continue
        seen.add(cmd)
        if (getCmdCategoryKey(cmd) !== categoryKey) continue
        if (!canSeeInMenu(cmd, userLevel)) continue
        const bruto = resolveSubcategory(cmd)
        const chave = chaveDeSub(bruto)
        if (!porChave.has(chave)) porChave.set(chave, { titulo: limparTitulo(bruto), emoji: '', cmds: [] })
        const grupo = porChave.get(chave)
        // O emoji da subcategoria ("🎖️ SERVIDOR VPS…") vira o ícone da caixa.
        if (!grupo.emoji) grupo.emoji = (String(bruto || '').match(EMOJIS) || [''])[0]
        grupo.cmds.push(cmd)
    }

    // Seções de um comando só viram "Outros" quando há várias delas: uma página
    // com dez títulos de um item cada é mais difícil de ler do que uma lista.
    const soltas = [...porChave.entries()].filter(([, g]) => g.cmds.length === 1)
    if (porChave.size > 3 && soltas.length >= 2) {
        const outros = porChave.get('outros') || { titulo: 'Outros', emoji: '📦', cmds: [] }
        for (const [chave, g] of soltas) {
            if (chave === 'outros') continue
            outros.cmds.push(...g.cmds)
            porChave.delete(chave)
        }
        porChave.set('outros', outros)
    }

    const groups = new Map()
    for (const g of porChave.values()) {
        g.cmds.sort((a, b) => a.name.localeCompare(b.name))
        groups.set(g.titulo, { cmds: g.cmds, emoji: g.emoji || '🔹' })
    }
    return groups
}

/** Descrição curta de uma linha. */
function descCurta(cmd, max = 70) {
    let d = String(cmd.description || 'Comando do bot').replace(/\s*\(\.[^)]*\)\s*$/, '').trim()
    if (d.length > max) d = d.slice(0, max).replace(/\s+\S*$/, '') + '…'
    return d.replace(/\.$/, '')
}

/** Linha de um comando: "┃ ➤ `.nome` [`.a`, `.b`] — o que faz". */
function cmdLine(cmd, prefix) {
    const atalhos = (Array.isArray(cmd.aliases) ? cmd.aliases : []).slice(0, ATALHOS_POR_LINHA)
    const lista = atalhos.length ? ` [${atalhos.map(a => `\`${prefix}${a}\``).join(', ')}]` : ''
    return `┃ ➤ \`${prefix}${cmd.name}\`${lista} — ${descCurta(cmd)}\n`
}

const tituloSecao = (emoji, t) => `\n${M.abreSecao(emoji, t)}\n`

/** Quantos atalhos existem entre os comandos. */
function contarAtalhos(cmds) {
    return cmds.reduce((n, c) => n + (Array.isArray(c.aliases) ? c.aliases.length : 0), 0)
}

/**
 * Compõe páginas a partir de unidades (divisores de categoria e seções com linhas),
 * paginando no nível da LINHA. Uma seção que cruza a fronteira de página continua
 * na seguinte com "(continuação)". Devolve também a página onde cada seção começa.
 *
 * Toda caixa aberta é fechada na mesma página: se a quebra cai no meio de uma
 * seção, ela fecha ali e reabre na página seguinte.
 *
 * @param {Array} units - [{type:'divider', text} | {type:'section', title, emoji, lines:string[]}]
 */
function composePages(units, firstBudget, restBudget) {
    const pages = []
    const inicio = new Map()
    const fecha = M.FECHA + '\n'
    let cur = ''
    let budget = firstBudget
    let secaoAberta = false

    const quebra = () => {
        if (secaoAberta) cur += fecha
        if (cur.trim()) pages.push(cur)
        cur = ''
        budget = restBudget
    }

    for (const unit of units) {
        if (unit.type === 'divider') {
            if (cur.length + unit.text.length + 2 > budget) quebra()
            cur += unit.text + '\n'
            continue
        }
        const head = tituloSecao(unit.emoji, unit.title)
        if (cur.length + head.length + fecha.length + 40 > budget) quebra()
        if (!inicio.has(unit.title)) inicio.set(unit.title, pages.length)
        cur += head
        secaoAberta = true
        for (const line of unit.lines) {
            if (cur.length + line.length + fecha.length > budget) {
                quebra()
                cur += tituloSecao(unit.emoji, `${unit.title} (continuação)`)
            }
            cur += line
        }
        cur += fecha
        secaoAberta = false
    }
    if (cur.trim()) pages.push(cur)
    return { pages: pages.length ? pages : [''], inicio }
}

function header(emoji, title) {
    return `${M.cabecalho(emoji, title)}\n\n`
}

/** Comandos mais usados de verdade, visíveis para o cargo. Vazio se não houver dado. */
function maisUsados(registry, userLevel, limite = 14) {
    try {
        const analytics = require('../database/repositories/analyticsRepository')
        const top = analytics.getTopCommands(80) || []
        const saida = []
        for (const row of top) {
            const cmd = registry.get(String(row.command_name || '').toLowerCase())
            if (!cmd || !canSeeInMenu(cmd, userLevel)) continue
            if (!row.execution_count) continue
            saida.push(cmd)
            if (saida.length >= limite) break
        }
        return saida
    } catch (err) {
        logger.warn(`[MENU] Não consegui ler os mais usados: ${err.message}`)
        return []
    }
}

/**
 * Constrói o menu.
 * @param {object} o
 * @param {string|null} o.category  key/atalho de categoria; null = painel principal
 * @param {number} o.page           página (1-based)
 * @param {string} o.prefix
 * @param {number} o.userLevel      nível de cargo do usuário
 * @param {string} o.botName
 * @param {Map} o.registry          dispatcher.getCommands()
 * @param {number} o.totalAliases
 * @returns {{pages: string[], page: number, totalPages: number, mediaKey: string, total: number}}
 */
function buildMenu({ category = null, requestedCategory = null, page = 1, prefix = '.', userLevel = 1, botName = 'Bot', registry, totalAliases = 0 }) {
    const isAll = category === 'all' || category === 'todos'
    const catKey = isAll ? null : (BY_KEY[category] ? category : null)

    // ── Painel principal ──
    if (!catKey && !isAll) {
        const uniqueCmds = [...new Set(registry.values())].filter(Boolean)

        const categoryLabels = {
            rpg: 'RPG', economia: 'Economia', cassino: 'Cassino', downloads: 'Downloads',
            figurinhas: 'Figurinhas', jogos: 'Jogos & Quiz', diversao: 'Diversão',
            moderacao: 'Moderação', 'mensagens-grupo': 'Grupos & Avisos', ia: 'IA & Pesquisa',
            livros: 'Livros', utilidades: 'Utilidades', perfil: 'Perfil & XP', dev: 'Dev Hub',
            owner: 'Donos & Aluguel', adicional: 'Extras',
            escola: 'Escola', ferramentas: 'Ferramentas', curiosidades: 'Curiosidades', texto: 'Texto'
        }

        const linhasCategorias = []
        let totalVisivel = 0
        let atalhosVisiveis = 0
        for (const c of CATEGORIES) {
            let count = 0
            for (const cmd of uniqueCmds) {
                if (getCmdCategoryKey(cmd) !== c.key || !canSeeInMenu(cmd, userLevel)) continue
                count++
                atalhosVisiveis += Array.isArray(cmd.aliases) ? cmd.aliases.length : 0
            }
            if (count === 0) continue
            totalVisivel += count
            linhasCategorias.push(`${c.emoji} \`${prefix}menu ${c.key}\` ${categoryLabels[c.key] || c.label} (${count})`)
        }
        const totalLinha = (n, a) => `📊 *Total:* ${n} Comandos · ${a} Aliases Ativos`

        // Página 1: todas as categorias. Vai como legenda da imagem do menu, que
        // o WhatsApp corta em 1024 caracteres: por isso a navegação é uma linha só.
        const doc1 = [
            M.cabecalho('📜', `Menu — ${botName}`),
            totalLinha(totalVisivel, atalhosVisiveis),
            M.secao('📂', 'Áreas do bot', linhasCategorias),
            `🔥 \`${prefix}menu 2\` mais usados · ❓ \`${prefix}help .cmd\` guia`
        ].join('\n\n')

        // Página 2: os mais usados de verdade (ou atalhos, se ainda não há uso).
        const top = maisUsados(registry, userLevel)
        let linhasTop
        if (top.length >= 5) {
            linhasTop = []
            let usado = 0
            for (const cmd of top) {
                const linha = `\`${prefix}${cmd.name}\` — ${descCurta(cmd, 48)}`
                if (usado + linha.length + 400 > CAPTION_BUDGET) break
                usado += linha.length + 5
                linhasTop.push(`• ${linha}`)
            }
        } else {
            linhasTop = [
                `⚔️ \`${prefix}rpg\` — arena de combate, heróis e clãs`,
                `💰 \`${prefix}eco\` — moedas, banco e transferências`,
                `🛡️ \`${prefix}adm\` — moderação e segurança do grupo`,
                `🏆 \`${prefix}perfil\` — seu perfil, nível e conquistas`,
                `❓ \`${prefix}help\` — central de ajuda`
            ]
        }
        const doc2 = [
            M.cabecalho('🔥', `Mais usados — ${botName}`),
            M.secao('🏆', top.length >= 5 ? 'O que o pessoal mais usa' : 'Para começar', linhasTop),
            M.secao('⚡', 'Atalhos Rápidos', [
                `• \`${prefix}hierarquia\` — Cargos e permissões`,
                `• \`${prefix}meualuguel\` — Tempo da locação`,
                `• \`${prefix}menugrupo\` — Gestão do grupo`,
                `• \`${prefix}config\` — Configurações`,
                `• \`${prefix}orientacao\` — Manuais passo a passo`
            ]),
            `🔙 \`${prefix}menu 1\` — todas as áreas`
        ].join('\n\n')

        const pages = [doc1.trim(), doc2.trim()]
        const safePage = Math.min(Math.max(1, page), 2)
        return { pages, page: safePage, totalPages: 2, mediaKey: 'main', total: totalVisivel }
    }

    // ── Catálogo completo ou categoria específica ──
    const keys = isAll ? CATEGORIES.map(c => c.key) : [catKey]
    const units = []
    const secoesEmOrdem = []
    let total = 0
    let atalhos = 0
    for (const key of keys) {
        const groups = groupByCategory(registry, key, userLevel)
        if (groups.size === 0) continue
        if (isAll) {
            const meta = BY_KEY[key]
            units.push({ type: 'divider', text: `\n${meta.emoji} *${M.maiusculas(meta.label)}* ${meta.emoji}` })
        }
        const sortedGroups = [...groups.entries()].sort((a, b) => {
            const isBatchA = a[1].cmds.every(c => /\d+$/.test(c.name))
            const isBatchB = b[1].cmds.every(c => /\d+$/.test(c.name))
            if (isBatchA !== isBatchB) return isBatchA ? 1 : -1
            if ((a[0] === 'Outros') !== (b[0] === 'Outros')) return a[0] === 'Outros' ? 1 : -1
            return a[0].localeCompare(b[0])
        })
        for (const [sub, { cmds, emoji }] of sortedGroups) {
            total += cmds.length
            atalhos += contarAtalhos(cmds)
            secoesEmOrdem.push({ titulo: sub, n: cmds.length })
            units.push({ type: 'section', title: sub, emoji, lines: cmds.map(c => cmdLine(c, prefix)) })
        }
    }

    const meta = catKey ? BY_KEY[catKey] : null
    const tituloEmoji = isAll ? '🌟' : meta.emoji
    const tituloTexto = isAll ? 'Catálogo completo' : meta.label
    const statsSub = `📊 *Total:* ${total} Comandos · ${atalhos} Aliases Ativos\n`
    const head = header(tituloEmoji, tituloTexto) + statsSub
    const navTarget = isAll ? 'all' : (requestedCategory || catKey)

    let { pages: bodyPages, inicio } = composePages(units, CAPTION_BUDGET - head.length - FOOTER_RESERVE, TEXT_BUDGET - FOOTER_RESERVE)

    // Categoria longa: a página 1 vira índice, e o conteúdo começa na página 2.
    if (!isAll && bodyPages.length >= PAGINAS_PARA_INDICE) {
        const composto = composePages(units, TEXT_BUDGET - FOOTER_RESERVE, TEXT_BUDGET - FOOTER_RESERVE)
        const orcamento = CAPTION_BUDGET - head.length - FOOTER_RESERVE
        let indice = `\n${M.abreSecao('📑', 'Seções — digite a página ao lado')}\n`
        let cabem = 0
        for (const s of secoesEmOrdem) {
            const pag = (composto.inicio.get(s.titulo) ?? 0) + 2
            const linha = `┃ ➤ ${s.titulo} (${s.n}) — \`${prefix}menu ${navTarget} ${pag}\`\n`
            if (indice.length + linha.length + 60 > orcamento) break
            indice += linha
            cabem++
        }
        if (cabem < secoesEmOrdem.length) indice += `┃ _…e mais ${secoesEmOrdem.length - cabem} seções nas páginas seguintes._\n`
        indice += M.FECHA + '\n'
        bodyPages = [indice, ...composto.pages]
    }

    const totalPages = bodyPages.length
    const safePage = Math.min(Math.max(1, page), totalPages)

    const pages = bodyPages.map((body, i) => {
        let doc = (i === 0 ? head : header(tituloEmoji, tituloTexto)) + body
        if (totalPages > 1 && i + 1 < totalPages) {
            doc += `\n▸ _Página ${i + 1}/${totalPages} — \`${prefix}menu ${navTarget} ${i + 2}\` para continuar_`
        } else if (totalPages > 1) {
            doc += `\n▸ _Página ${i + 1}/${totalPages} — fim da lista_`
        }
        doc += `\n🔙 \`${prefix}menu\``
        return doc.replace(/\n{3,}/g, '\n\n').trim()
    })

    return { pages, page: safePage, totalPages, mediaKey: catKey || 'main', total }
}

module.exports = { buildMenu, canSeeInMenu, requiredLevel }
