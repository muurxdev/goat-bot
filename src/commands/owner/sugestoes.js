/**
 * Leitura das sugestões enviadas com .sugerir.
 *
 *   .sugestoes            → sugestões deste ambiente
 *   .sugestoes todos      → agrega todos os ambientes do perfil ativo
 *   .sugestoes limpar     → apaga as deste ambiente
 *
 * Segue o isolamento por perfil: quem está num ambiente de RPG lê as sugestões
 * do RPG, não as de divulgação.
 */

const profileData = require('../../services/profileDataService')
const moduleState = require('../../services/moduleStateService')
const { resolveGroupName } = require('../../utils/groupLabel')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const CHAVE = 'sugestoes'
const POR_PAGINA = 12

/** Data no formato brasileiro, curta. */
function quando(iso) {
    try {
        const d = new Date(iso)
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    } catch (err) {
        logger.warn(`[SUGESTOES] Data inválida "${iso}": ${err.message}`)
        return '??'
    }
}

/** Identificação curta de quem sugeriu, sem despejar o JID inteiro. */
function autor(s) {
    if (s.nome) return s.nome
    const num = String(s.de || '').split('@')[0]
    return num ? `+${num}` : 'anônimo'
}

/**
 * Tela da lista paginada.
 * @param {Array} itens
 * @param {string[]} contexto linhas de "onde" (perfil e ambiente)
 * @param {number} pagina
 * @param {string} prefix
 * @param {boolean} todos lista agregada de todos os ambientes
 */
function renderLista(itens, contexto, pagina, prefix, todos = false) {
    const totalPaginas = Math.max(1, Math.ceil(itens.length / POR_PAGINA))
    const p = Math.min(Math.max(1, pagina), totalPaginas)
    const fatia = itens.slice((p - 1) * POR_PAGINA, p * POR_PAGINA)

    if (!fatia.length) {
        return F.tela({
            emoji: '💡',
            titulo: 'Nenhuma sugestão ainda',
            intro: todos
                ? 'Nenhum ambiente deste perfil recebeu sugestões até agora.'
                : 'Ninguém mandou sugestão aqui até agora. Quando mandarem, cada uma aparece com quem enviou, a data e o texto.',
            secoes: [{ emoji: '📍', titulo: 'Onde procurei', linhas: contexto }],
            dica: `As pessoas enviam ideias com ${F.cmd(prefix, 'sugerir', 'sua ideia')}. Vale divulgar no grupo.`,
            proximos: [
                todos ? null : { nome: 'sugestoes', args: 'todos', oque: 'procura em todos os ambientes' }
            ].filter(Boolean),
            prefix
        })
    }

    const base = (p - 1) * POR_PAGINA
    const linhas = []
    fatia.forEach((s, i) => {
        linhas.push(`*${base + i + 1}.* 👤 ${autor(s)} · 🕐 ${quando(s.quando)}`)
        const texto = String(s.texto || '')
        linhas.push(`   ${texto.length > 280 ? texto.slice(0, 280) + '…' : texto}`)
    })

    const proximos = []
    if (p < totalPaginas) proximos.push({ nome: 'sugestoes', args: todos ? `todos ${p + 1}` : `${p + 1}`, oque: 'próxima página' })
    if (!todos) proximos.push({ nome: 'sugestoes', args: 'todos', oque: 'junta as de todos os ambientes' })
    proximos.push({ nome: 'sugestoes', args: 'limpar', oque: 'apaga as sugestões deste ambiente' })

    return F.tela({
        emoji: '💡',
        titulo: `Sugestões: ${itens.length}`,
        intro: `Mais recentes primeiro. Página ${p} de ${totalPaginas}.`,
        secoes: [
            { emoji: '📍', titulo: 'Onde', linhas: contexto },
            { emoji: '📝', titulo: 'Lista', linhas }
        ],
        proximos,
        prefix
    })
}

module.exports = {
    name: 'sugestoes',
    aliases: ['versugestoes', 'listarsugestoes', 'ideias'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Lê as sugestões enviadas pelos usuários com .sugerir',
    usage: '[página | todos [página] | limpar]',
    examples: [
        ' — sugestões deste grupo',
        '2 — segunda página',
        'todos — junta as de todos os ambientes do mesmo perfil',
        'limpar — apaga as sugestões deste ambiente'
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args, from, isGroup, prefix = '.' }) => {
        const scope = moduleState.scopeOf(from, isGroup)
        const perfil = profileData.perfilDe(scope)
        const sub = (args[0] || '').toLowerCase().trim()

        try {
            if (sub === 'limpar' || sub === 'apagar') {
                const antes = profileData.getData(scope, CHAVE, []).length
                profileData.deleteData(scope, CHAVE)
                logger.info(`[SUGESTOES] ${antes} sugestão(ões) apagadas em ${scope} (perfil ${perfil})`)
                return reply(F.tela({
                    emoji: '🗑️',
                    titulo: antes ? `${antes} sugestão(ões) apagada(s)` : 'Não havia nada para apagar',
                    intro: antes
                        ? 'Limpei as sugestões deste ambiente. As dos outros ambientes continuam lá.'
                        : 'Este ambiente não tinha nenhuma sugestão guardada.',
                    secoes: [{ emoji: '📍', titulo: 'Onde', linhas: [F.campo('Perfil', perfil)] }],
                    proximos: [{ nome: 'sugestoes', args: 'todos', oque: 'vê as de outros ambientes' }],
                    prefix
                }))
            }

            if (sub === 'todos' || sub === 'tudo' || sub === 'geral') {
                const blocos = profileData.collectAcrossScopes(perfil, CHAVE)
                const todas = []
                for (const b of blocos) {
                    if (!Array.isArray(b.valor)) continue
                    for (const s of b.valor) todas.push({ ...s, scope: b.scope })
                }
                todas.sort((a, b) => String(b.quando).localeCompare(String(a.quando)))
                const pagina = parseInt(args[1], 10) || 1
                return reply(renderLista(todas, [
                    F.campo('Perfil', perfil),
                    F.campo('Ambientes', `todos (${blocos.length})`)
                ], pagina, prefix, true))
            }

            const nome = await resolveGroupName(scope, 'SUGESTOES')
            const ambiente = scope === moduleState.PV_SCOPE ? '💬 privado' : (nome ? `👥 *${nome}*` : '👥 este grupo')
            const itens = profileData.getData(scope, CHAVE, []).slice().reverse()
            const pagina = parseInt(sub, 10) || 1

            return reply(renderLista(itens, [
                F.campo('Perfil', perfil),
                F.campo('Ambiente', ambiente)
            ], pagina, prefix))
        } catch (err) {
            logger.error('[SUGESTOES ERROR]', err)
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não consegui ler as sugestões',
                intro: 'Algo falhou ao abrir as sugestões guardadas. Tente de novo em instantes; se repetir, confira os registros do servidor.',
                proximos: [{ nome: 'sugestoes', oque: 'tenta de novo' }],
                prefix
            }))
        }
    }
}
