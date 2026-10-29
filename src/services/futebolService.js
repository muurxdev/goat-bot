/**
 * Serviço de Futebol & Campeonatos em Tempo Real // Skycode & ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤
 * 
 * Integração aberta com feeds esportivos públicos (ESPN Open API):
 * - Tabelas de classificação INTEIRAS (todos os 20 times ou chave completa)
 * - Mapeamento e separação rígida entre UEFA Champions League e Copa Libertadores
 * - Apoio a grupos completos na Copa Libertadores (Grupos A ao H) e Fase de Liga na Champions (36 clubes)
 * - Jogos do dia, placares ao vivo e horários
 * - Cache dinâmico de 5 minutos em memória para consultas instantâneas e sem sobrecarga
 */

const axios = require('axios')
const logger = require('../core/logger')

const CACHE_TTL_MS = 5 * 60 * 1000

const _cache = {
    standings: {},
    scoreboard: {}
}

const LEAGUES = {
    'brasileirao': { id: 'bra.1', nome: 'Brasileirão Série A 🇧🇷', total: 20 },
    'seriea': { id: 'bra.1', nome: 'Brasileirão Série A 🇧🇷', total: 20 },
    'serieb': { id: 'bra.2', nome: 'Brasileirão Série B 🇧🇷', total: 20 },
    'brasileiraob': { id: 'bra.2', nome: 'Brasileirão Série B 🇧🇷', total: 20 },
    'champions': { id: 'uefa.champions', nome: 'UEFA Champions League 🏆', total: 36 },
    'championsleague': { id: 'uefa.champions', nome: 'UEFA Champions League 🏆', total: 36 },
    'ucl': { id: 'uefa.champions', nome: 'UEFA Champions League 🏆', total: 36 },
    'libertadores': { id: 'conmebol.libertadores', nome: 'Copa Libertadores 🌎', total: 32 },
    'copalibertadores': { id: 'conmebol.libertadores', nome: 'Copa Libertadores 🌎', total: 32 },
    'premier': { id: 'eng.1', nome: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿', total: 20 },
    'premierleague': { id: 'eng.1', nome: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿', total: 20 },
    'ingles': { id: 'eng.1', nome: 'Premier League 🏴󠁧󠁢󠁥󠁮󠁧󠁿', total: 20 },
    'laliga': { id: 'esp.1', nome: 'La Liga 🇪🇸', total: 20 },
    'espanhol': { id: 'esp.1', nome: 'La Liga 🇪🇸', total: 20 },
    'italiano': { id: 'ita.1', nome: 'Serie A Italiana 🇮🇹', total: 20 },
    'seriea_it': { id: 'ita.1', nome: 'Serie A Italiana 🇮🇹', total: 20 },
    'alemao': { id: 'ger.1', nome: 'Bundesliga Alemã 🇩🇪', total: 18 },
    'bundesliga': { id: 'ger.1', nome: 'Bundesliga Alemã 🇩🇪', total: 18 },
    'frances': { id: 'fra.1', nome: 'Ligue 1 Francesa 🇫🇷', total: 18 },
    'ligue1': { id: 'fra.1', nome: 'Ligue 1 Francesa 🇫🇷', total: 18 }
}

/**
 * Obtém tabela de classificação em tempo real
 * @param {string} leagueKey
 * @param {string|null} filterGroup
 * @returns {Promise<{ ok: boolean, leagueName: string, entries: Array, leagueKey: string, isGroupStage?: boolean, groups?: Array }>}
 */
async function getStandings(leagueKey = 'brasileirao', filterGroup = null) {
    const rawKey = String(leagueKey || 'brasileirao').toLowerCase().replace(/[^a-z0-9_]/g, '')
    const league = LEAGUES[rawKey] || LEAGUES['brasileirao']

    const now = Date.now()
    if (_cache.standings[league.id] && (now - _cache.standings[league.id].timestamp < CACHE_TTL_MS)) {
        return _cache.standings[league.id].data
    }

    try {
        const url = `https://site.api.espn.com/apis/v2/sports/soccer/${league.id}/standings`
        const res = await axios.get(url, {
            timeout: 7000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })

        const children = res.data?.children || []
        const isGroupTournament = league.id === 'conmebol.libertadores' || children.length > 1

        let result
        if (isGroupTournament) {
            const groups = children.map(child => {
                const rawEntries = child.standings?.entries || []
                const entries = rawEntries.map((e, idx) => {
                    const stats = e.stats || []
                    const getStat = name => {
                        const s = stats.find(item => item.name === name)
                        return s ? s.value : 0
                    }
                    return {
                        pos: idx + 1,
                        team: e.team?.displayName || e.team?.name || 'Clube',
                        shortName: e.team?.shortDisplayName || e.team?.abbreviation || e.team?.name || 'Clube',
                        points: getStat('points'),
                        played: getStat('gamesPlayed'),
                        wins: getStat('wins'),
                        draws: getStat('ties'),
                        losses: getStat('losses'),
                        goalDiff: getStat('pointDifferential')
                    }
                })
                const letterMatch = child.name ? child.name.match(/group\s+([a-h])/i) : null
                const letter = letterMatch ? letterMatch[1].toUpperCase() : (child.name || '')
                return {
                    groupName: child.name || `Grupo ${letter}`,
                    groupLetter: letter,
                    entries
                }
            })

            const allEntries = groups.flatMap(g => g.entries)
            result = {
                ok: true,
                leagueName: league.nome,
                leagueKey: rawKey,
                leagueId: league.id,
                isGroupStage: true,
                groups,
                entries: allEntries
            }
        } else {
            const rawEntries = children[0]?.standings?.entries || []
            const entries = rawEntries.map((e, idx) => {
                const stats = e.stats || []
                const getStat = name => {
                    const s = stats.find(item => item.name === name)
                    return s ? s.value : 0
                }
                return {
                    pos: idx + 1,
                    team: e.team?.displayName || e.team?.name || 'Clube',
                    shortName: e.team?.shortDisplayName || e.team?.abbreviation || e.team?.name || 'Clube',
                    points: getStat('points'),
                    played: getStat('gamesPlayed'),
                    wins: getStat('wins'),
                    draws: getStat('ties'),
                    losses: getStat('losses'),
                    goalDiff: getStat('pointDifferential')
                }
            })

            result = {
                ok: true,
                leagueName: league.nome,
                leagueKey: rawKey,
                leagueId: league.id,
                isGroupStage: false,
                entries
            }
        }

        _cache.standings[league.id] = { timestamp: now, data: result }
        return result
    } catch (err) {
        logger.warn(`[FUTEBOL SERVICE] Erro ao buscar tabela de ${league.id}: ${err.message}`)
        if (_cache.standings[league.id]) return _cache.standings[league.id].data
        return { ok: false, leagueName: league.nome, leagueKey: rawKey, leagueId: league.id, entries: [], error: err.message }
    }
}

/**
 * Obtém placar e jogos do dia
 * @param {string} leagueKey
 * @returns {Promise<{ ok: boolean, leagueName: string, leagueKey: string, leagueId: string, matches: Array }>}
 */
async function getScoreboard(leagueKey = 'brasileirao') {
    const rawKey = String(leagueKey || 'brasileirao').toLowerCase().replace(/[^a-z0-9_]/g, '')
    const league = LEAGUES[rawKey] || LEAGUES['brasileirao']

    const now = Date.now()
    if (_cache.scoreboard[league.id] && (now - _cache.scoreboard[league.id].timestamp < CACHE_TTL_MS)) {
        return _cache.scoreboard[league.id].data
    }

    try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard`
        const res = await axios.get(url, {
            timeout: 7000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })

        const events = res.data?.events || []
        const matches = events.map(ev => {
            const competition = ev.competitions?.[0] || {}
            const competitors = competition.competitors || []
            const home = competitors.find(c => c.homeAway === 'home') || competitors[0] || {}
            const away = competitors.find(c => c.homeAway === 'away') || competitors[1] || {}

            return {
                name: ev.name,
                date: ev.date,
                status: ev.status?.type?.detail || ev.status?.type?.description || 'Agendado',
                isLive: ev.status?.type?.state === 'in',
                isFinished: ev.status?.type?.completed === true,
                homeTeam: home.team?.displayName || 'Casa',
                homeScore: home.score || '0',
                awayTeam: away.team?.displayName || 'Fora',
                awayScore: away.score || '0'
            }
        })

        const result = {
            ok: true,
            leagueName: league.nome,
            leagueKey: rawKey,
            leagueId: league.id,
            matches
        }

        _cache.scoreboard[league.id] = { timestamp: now, data: result }
        return result
    } catch (err) {
        logger.warn(`[FUTEBOL SERVICE] Erro ao buscar jogos de ${league.id}: ${err.message}`)
        if (_cache.scoreboard[league.id]) return _cache.scoreboard[league.id].data
        return { ok: false, leagueName: league.nome, leagueKey: rawKey, leagueId: league.id, matches: [], error: err.message }
    }
}

/** 
 * Formata tabela INTEIRA para WhatsApp com separação de ligas e comandos de ajuda
 * @param {object} data
 * @param {number|object|null} options
 */
function formatarTabela(data, options = null) {
    if (!data.ok || (!data.entries?.length && !data.groups?.length)) {
        return `⚠️ Não foi possível carregar a tabela de *${data.leagueName || 'campeonato'}* no momento.\n\n🧭 *COMANDOS PARA AJUDAR:*\n• \`.brasileirao\` — Ver Brasileirão Série A\n• \`.champions\` — Ver UEFA Champions League\n• \`.libertadores\` — Ver Copa Libertadores\n• \`.jogos\` — Partidas de hoje`
    }

    let limite = null
    let groupFilter = null
    if (typeof options === 'number') {
        limite = options
    } else if (options && typeof options === 'object') {
        limite = options.limit || null
        groupFilter = options.group || null
    }

    const leagueId = data.leagueId || ''
    const leagueKey = data.leagueKey || ''

    let out = `╔══════════════════════════════════════╗\n`
    out += `║  ⚽  ${data.leagueName.toUpperCase().padEnd(30, ' ')} ║\n`
    out += `╚══════════════════════════════════════╝\n`
    out += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ CLUBE DOS CAMPEÕES\n\n`

    // ── CASO 1: COPA LIBERTADORES (Fase de Grupos) ──────────────────────
    if (leagueId === 'conmebol.libertadores' || leagueKey.includes('libertadores') || data.isGroupStage) {
        let groups = data.groups || []
        if (groupFilter) {
            const cleanF = String(groupFilter).replace(/[^a-z0-9]/gi, '').toLowerCase()
            const filtered = groups.filter(g => g.groupLetter.toLowerCase() === cleanF || g.groupName.toLowerCase().includes(cleanF))
            if (filtered.length > 0) groups = filtered
        }

        for (const g of groups) {
            out += `🏆 *${g.groupName.toUpperCase()}*\n`
            out += `POS  CLUBE             PTS  J   V   SG\n`
            out += `──────────────────────────────────────\n`
            for (const e of g.entries) {
                const posStr = String(e.pos).padStart(2, '0')
                let badge = '⚪'
                if (e.pos <= 2) badge = '🟢' // Oitavas de Final
                else if (e.pos === 3) badge = '🟡' // Sul-Americana
                else if (e.pos === 4) badge = '🔴' // Eliminado

                const namePad = String(e.shortName || e.team).slice(0, 15).padEnd(16, ' ')
                const ptsPad = String(e.points).padStart(3, ' ')
                const jPad = String(e.played).padStart(2, ' ')
                const vPad = String(e.wins).padStart(2, ' ')
                const sgPad = (e.goalDiff >= 0 ? `+${e.goalDiff}` : `${e.goalDiff}`).padStart(4, ' ')
                out += `${badge}${posStr} ${namePad} ${ptsPad}  ${jPad}  ${vPad} ${sgPad}\n`
            }
            out += `\n`
        }

        out += `──────────────────────────────────────\n`
        out += `🟢 1º e 2º: Oitavas de Final (Libertadores)\n`
        out += `🟡 3º: Repescagem Copa Sul-Americana\n`
        out += `🔴 4º: Eliminado da Libertadores\n\n`
        out += `🧭 *COMANDOS PARA AJUDAR:*\n`
        out += `• \`.libertadores <grupo>\` — Ver apenas 1 grupo (ex: \`.libertadores a\`)\n`
        out += `• \`.jogos libertadores\` — Ver jogos da Libertadores\n`
        out += `• \`.champions\` — Ver tabela da UEFA Champions League\n`
        out += `• \`.brasileirao\` — Ver tabela do Brasileirão Série A\n`
        out += `• \`.orientacao futebol\` — Manual completo do módulo esportivo`
        return out
    }

    // ── CASO 2: UEFA CHAMPIONS LEAGUE (Fase de Liga de 36 Clubes) ─────────
    if (leagueId === 'uefa.champions' || leagueKey.includes('champion') || leagueKey === 'ucl') {
        const list = (typeof limite === 'number' && limite > 0) ? data.entries.slice(0, limite) : data.entries
        out += `POS  CLUBE             PTS  J   V   SG\n`
        out += `──────────────────────────────────────\n`

        for (const e of list) {
            const posStr = String(e.pos).padStart(2, '0')
            let badge = '⚪'
            if (e.pos <= 8) badge = '🟢' // Oitavas de Final Direta
            else if (e.pos <= 24) badge = '🔵' // Playoffs / 16-avos
            else badge = '🔴' // Eliminados da Champions

            const namePad = String(e.shortName || e.team).slice(0, 15).padEnd(16, ' ')
            const ptsPad = String(e.points).padStart(3, ' ')
            const jPad = String(e.played).padStart(2, ' ')
            const vPad = String(e.wins).padStart(2, ' ')
            const sgPad = (e.goalDiff >= 0 ? `+${e.goalDiff}` : `${e.goalDiff}`).padStart(4, ' ')
            out += `${badge}${posStr} ${namePad} ${ptsPad}  ${jPad}  ${vPad} ${sgPad}\n`
        }

        out += `──────────────────────────────────────\n`
        out += `🟢 1º ao 8º: Vaga direta nas Oitavas de Final\n`
        out += `🔵 9º ao 24º: Playoffs da Champions (16-avos)\n`
        out += `🔴 25º ao 36º: Eliminados da Competição\n\n`
        out += `🧭 *COMANDOS PARA AJUDAR:*\n`
        out += `• \`.jogos champions\` — Ver partidas da Champions League\n`
        out += `• \`.libertadores\` — Ver grupos da Copa Libertadores\n`
        out += `• \`.premier\` — Ver tabela da Premier League\n`
        out += `• \`.brasileirao\` — Ver Brasileirão Série A\n`
        out += `• \`.orientacao futebol\` — Manual completo do módulo esportivo`
        return out
    }

    // ── CASO 3: BRASILEIRÃO SÉRIE A ─────────────────────────────────────
    if (leagueId === 'bra.1' || leagueKey === 'brasileirao' || leagueKey === 'seriea') {
        const list = (typeof limite === 'number' && limite > 0) ? data.entries.slice(0, limite) : data.entries
        out += `POS  CLUBE             PTS  J   V   SG\n`
        out += `──────────────────────────────────────\n`

        for (const e of list) {
            const posStr = String(e.pos).padStart(2, '0')
            let badge = '⚪'
            if (e.pos <= 4) badge = '🟢' // Libertadores G4
            else if (e.pos <= 6) badge = '🔵' // Pré-Libertadores
            else if (e.pos <= 12) badge = '🟡' // Sul-Americana
            else if (e.pos >= 17) badge = '🔴' // Z4 Rebaixamento

            const namePad = String(e.shortName || e.team).slice(0, 15).padEnd(16, ' ')
            const ptsPad = String(e.points).padStart(3, ' ')
            const jPad = String(e.played).padStart(2, ' ')
            const vPad = String(e.wins).padStart(2, ' ')
            const sgPad = (e.goalDiff >= 0 ? `+${e.goalDiff}` : `${e.goalDiff}`).padStart(4, ' ')
            out += `${badge}${posStr} ${namePad} ${ptsPad}  ${jPad}  ${vPad} ${sgPad}\n`
        }

        out += `──────────────────────────────────────\n`
        out += `🟢 1º-4º: Libertadores (G4) · 🔵 5º-6º: Pré-Libertadores\n`
        out += `🟡 7º-12º: Sul-Americana · 🔴 17º-20º: Rebaixamento (Z4)\n\n`
        out += `🧭 *COMANDOS PARA AJUDAR:*\n`
        out += `• \`.jogos brasileirao\` — Ver partidas de hoje\n`
        out += `• \`.serieb\` — Ver tabela da Série B\n`
        out += `• \`.libertadores\` — Ver Copa Libertadores\n`
        out += `• \`.champions\` — Ver UEFA Champions League\n`
        out += `• \`.orientacao futebol\` — Manual completo do módulo esportivo`
        return out
    }

    // ── CASO 4: BRASILEIRÃO SÉRIE B ─────────────────────────────────────
    if (leagueId === 'bra.2' || leagueKey === 'serieb' || leagueKey === 'brasileiraob') {
        const list = (typeof limite === 'number' && limite > 0) ? data.entries.slice(0, limite) : data.entries
        out += `POS  CLUBE             PTS  J   V   SG\n`
        out += `──────────────────────────────────────\n`

        for (const e of list) {
            const posStr = String(e.pos).padStart(2, '0')
            let badge = '⚪'
            if (e.pos <= 4) badge = '🟢' // Acesso à Série A
            else if (e.pos >= 17) badge = '🔴' // Z4 Rebaixamento Série C

            const namePad = String(e.shortName || e.team).slice(0, 15).padEnd(16, ' ')
            const ptsPad = String(e.points).padStart(3, ' ')
            const jPad = String(e.played).padStart(2, ' ')
            const vPad = String(e.wins).padStart(2, ' ')
            const sgPad = (e.goalDiff >= 0 ? `+${e.goalDiff}` : `${e.goalDiff}`).padStart(4, ' ')
            out += `${badge}${posStr} ${namePad} ${ptsPad}  ${jPad}  ${vPad} ${sgPad}\n`
        }

        out += `──────────────────────────────────────\n`
        out += `🟢 1º ao 4º: Acesso à Série A (G4)\n`
        out += `🔴 17º ao 20º: Rebaixamento à Série C (Z4)\n\n`
        out += `🧭 *COMANDOS PARA AJUDAR:*\n`
        out += `• \`.jogos serieb\` — Ver partidas da Série B\n`
        out += `• \`.brasileirao\` — Ver Brasileirão Série A\n`
        out += `• \`.champions\` — Ver UEFA Champions League\n`
        out += `• \`.orientacao futebol\` — Manual completo do módulo esportivo`
        return out
    }

    // ── CASO 5: LIGAS NACIONAIS EUROPEIAS (Premier, La Liga, etc.) ───────
    const list = (typeof limite === 'number' && limite > 0) ? data.entries.slice(0, limite) : data.entries
    const totalTimes = data.entries.length
    out += `POS  CLUBE             PTS  J   V   SG\n`
    out += `──────────────────────────────────────\n`

    for (const e of list) {
        const posStr = String(e.pos).padStart(2, '0')
        let badge = '⚪'
        if (e.pos <= 4) badge = '🟢' // Champions League
        else if (e.pos <= 6) badge = '🔵' // Europa / Conference League
        else if (e.pos > totalTimes - 3) badge = '🔴' // Rebaixamento

        const namePad = String(e.shortName || e.team).slice(0, 15).padEnd(16, ' ')
        const ptsPad = String(e.points).padStart(3, ' ')
        const jPad = String(e.played).padStart(2, ' ')
        const vPad = String(e.wins).padStart(2, ' ')
        const sgPad = (e.goalDiff >= 0 ? `+${e.goalDiff}` : `${e.goalDiff}`).padStart(4, ' ')
        out += `${badge}${posStr} ${namePad} ${ptsPad}  ${jPad}  ${vPad} ${sgPad}\n`
    }

    out += `──────────────────────────────────────\n`
    out += `🟢 1º ao 4º: UEFA Champions League\n`
    out += `🔵 5º e 6º: Europa League / Conference\n`
    out += `🔴 Rebaixamento\n\n`
    out += `🧭 *COMANDOS PARA AJUDAR:*\n`
    out += `• \`.champions\` — Ver UEFA Champions League\n`
    out += `• \`.brasileirao\` — Ver Brasileirão Série A\n`
    out += `• \`.jogos ${leagueKey}\` — Ver partidas de hoje desta liga\n`
    out += `• \`.orientacao futebol\` — Manual completo do módulo esportivo`
    return out
}

/** Formata rodada/jogos para WhatsApp com comandos de ajuda */
function formatarJogos(data, requestedLeague = 'brasileirao') {
    let out = `╔══════════════════════════════════════╗\n`
    out += `║  🏟️  JOGOS & PLACAR AO VIVO          ║\n`
    out += `╚══════════════════════════════════════╝\n`
    out += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ CLUBE DOS CAMPEÕES\n\n`

    if (!data.ok || !data.matches.length) {
        out += `⚠️ Não há partidas agendadas para hoje em *${data.leagueName || 'este campeonato'}*.\n\n`
        out += `──────────────────────────────────────\n`
        out += `🧭 *COMANDOS PARA AJUDAR:*\n`
        out += `• \`.champions\` — Classificação da Champions League\n`
        out += `• \`.libertadores\` — Grupos da Copa Libertadores\n`
        out += `• \`.brasileirao\` — Tabela do Brasileirão Série A\n`
        out += `• \`.jogos champions\` — Partidas da Champions League\n`
        out += `• \`.jogos libertadores\` — Partidas da Libertadores\n`
        out += `• \`.orientacao futebol\` — Guia completo de comandos esportivos`
        return out
    }

    out += `⚽ *${data.leagueName.toUpperCase()}*\n\n`
    for (const m of data.matches.slice(0, 10)) {
        const liveBadge = m.isLive ? '🔴 *AO VIVO*' : (m.isFinished ? '🏁 *ENCERRADO*' : '⏱️ *AGENDADO*')
        out += `${liveBadge} — ${m.status}\n`
        out += `  ⚽ *${m.homeTeam}* ${m.homeScore} ✖️ ${m.awayScore} *${m.awayTeam}*\n\n`
    }

    out += `──────────────────────────────────────\n`
    out += `🧭 *COMANDOS PARA AJUDAR:*\n`
    out += `• \`.tabela ${data.leagueKey || requestedLeague}\` — Ver classificação completa\n`
    out += `• \`.jogos champions\` — Jogos da Champions League\n`
    out += `• \`.jogos libertadores\` — Jogos da Copa Libertadores\n`
    out += `• \`.jogos brasileirao\` — Jogos do Brasileirão\n`
    out += `• \`.orientacao futebol\` — Guia completo de comandos esportivos`
    return out
}

module.exports = {
    LEAGUES,
    getStandings,
    getScoreboard,
    formatarTabela,
    formatarJogos
}
