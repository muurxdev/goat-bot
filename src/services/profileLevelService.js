/**
 * Níveis por PERFIL — cada tema com progressão própria.
 *
 * Antes existia um nível só, e o card do perfil era idêntico em todo ambiente:
 * um grupo de divulgação via "bosses derrotados" e um grupo de código via
 * "moedas no cassino". Números que não dizem nada sobre o que aquele grupo faz.
 *
 * Agora cada perfil tem:
 *   - sua própria FONTE de XP (colunas diferentes, progressões independentes)
 *   - suas próprias PATENTES (nada de Cavaleiro Sagrado num painel de código)
 *   - suas próprias ESTATÍSTICAS (o que importa naquele tema)
 *
 * Nenhum tema é cópia de outro: as escadas, os títulos e as métricas são
 * diferentes de propósito. Subir no RPG não sobe no Skycode.
 */

const dataService = require('./dataService')
const logger = require('../core/logger')

/** Quanto XP o próximo nível custa. Curva suave: o tema não é grind. */
function xpDoNivel(nivel) {
    const n = Math.max(1, Number(nivel) || 1)
    return Math.floor(100 * Math.pow(n, 1.6))
}

/** Converte XP acumulado em nível, sobra e quanto falta. */
function nivelPorXp(xpTotal) {
    let xp = Math.max(0, Number(xpTotal) || 0)
    let nivel = 1
    while (xp >= xpDoNivel(nivel) && nivel < 9999) {
        xp -= xpDoNivel(nivel)
        nivel++
    }
    const custo = xpDoNivel(nivel)
    return { nivel, xpNoNivel: xp, xpParaProximo: custo, progresso: custo ? xp / custo : 0 }
}

/**
 * Os quatro temas.
 *
 * `fonte` diz de onde vem o XP daquele tema. `patentes` é a escada de títulos.
 * `stats` monta as linhas do card a partir do usuário — cada tema escolhe o que
 * mostrar, e é isso que impede um card de virar cópia do outro.
 */
const TEMAS = {
    rpg: {
        emoji: '⚔️',
        titulo: 'CAVALEIRO',
        unidade: 'XP de combate',
        fonte: (u) => Number(u.xpRpg ?? u.xp_rpg) || 0,
        patentes: [
            [0, '🍺 Andarilho'], [5, '🗡️ Aprendiz de Cavaleiro'], [12, '🛡️ Cavaleiro Sagrado'],
            [25, '⚡ Cavaleiro de Elite'], [40, '🔥 Grande Cavaleiro'], [60, '👑 Grão-Mestre'],
            [85, '💎 Traço Marcante'], [120, '⚔️ Portador de Mandamento'], [180, '🐲 Demônio Superior'],
            [260, '👹 Rei dos Demônios']
        ],
        stats: (u) => [
            ['Chefes derrubados', Number(u.bossesMortos ?? u.bosses_mortos) || 0],
            ['Vitórias em duelo', Number(u.wins) || 0],
            ['Derrotas', Number(u.losses) || 0],
            ['Pontos de arena', Number(u.arenaPontos ?? u.arena_pontos) || 0],
            ['Nível de forja', Number(u.forgeLevel ?? u.forge_level) || 0],
            ['Renascimentos', Number(u.rebirthCount ?? u.rebirth_count) || 0],
            ['Classe', u.classe || 'sem classe'],
            ['Companheiro', u.pet ? String(u.pet).replace(/[{}"']/g, '').slice(0, 20) : 'nenhum']
        ]
    },

    skycode: {
        emoji: '🛰️',
        titulo: 'OPERADOR',
        unidade: 'XP de estudo',
        // Estudo e uso de ferramenta: comandos disparados + leitura registrada.
        fonte: (u) => (Number(u.xpSkycode) || 0)
            + (Number(u.commandsGroup ?? u.commands_group) || 0) * 3
            + (Number(u.commandsPv ?? u.commands_pv) || 0) * 5,
        patentes: [
            [0, '📗 Curioso'], [5, '🔧 Aprendiz de Ofício'], [12, '⚙️ Operador'],
            [25, '🧭 Cartógrafo de Sistemas'], [40, '🔬 Pesquisador'], [60, '📐 Arquiteto do Protocolo'],
            [85, '🛰️ Guardião do Skycode'], [120, '🌌 Mente do Terminal'], [180, '♾️ Oráculo']
        ],
        stats: (u) => [
            ['Comandos no privado', Number(u.commandsPv ?? u.commands_pv) || 0],
            ['Comandos em grupo', Number(u.commandsGroup ?? u.commands_group) || 0],
            ['Sequência de dias', Number(u.streak) || 0],
            ['Reputação', Number(u.rep) || 0],
            ['Elemento', u.characterElement ?? u.character_element ?? 'não definido'],
            ['Membro desde', u.registeredAt || u.registered_at || u.createdAt || u.created_at || '—']
        ]
    },

    divulgacao: {
        emoji: '📢',
        titulo: 'ARAUTO',
        unidade: 'XP de alcance',
        // Alcance: mensagem que chega a gente é o que conta aqui.
        fonte: (u) => (Number(u.xpDivulgacao) || 0)
            + (Number(u.messagesGroup ?? u.messages_group) || 0) * 2
            + (Number(u.rep) || 0) * 10,
        patentes: [
            [0, '📄 Panfletário'], [5, '📣 Pregoeiro'], [12, '📢 Arauto'],
            [25, '🎪 Mestre de Cerimônias'], [40, '🌐 Emissário'], [60, '🏛️ Embaixador'],
            [85, '👑 Voz do Reino'], [120, '🌟 Lenda Falada']
        ],
        stats: (u) => [
            ['Mensagens em grupo', Number(u.messagesGroup ?? u.messages_group) || 0],
            ['Mensagens no privado', Number(u.messagesPv ?? u.messages_pv) || 0],
            ['Reputação', Number(u.rep) || 0],
            ['Sequência de dias', Number(u.streak) || 0],
            ['Guilda', u.guilda || 'sem guilda'],
            ['Nível de grupo', Number(u.levelGroup ?? u.level_group) || 1]
        ]
    },

    goat: {
        emoji: '🌙',
        titulo: 'ANDARILHO',
        unidade: 'XP total',
        // O completo: soma tudo, porque a proposta é justamente ser o panorama.
        fonte: (u) => Number(u.xp) || 0,
        patentes: [
            [0, '🍺 Andarilho do Reino'], [10, '🗡️ Aventureiro'], [25, '🛡️ Veterano'],
            [45, '⚡ Renomado'], [70, '🔥 Lendário'], [100, '👑 Herói do Reino'],
            [150, '💎 Nome Eterno'], [220, '🌌 Divindade Suprema']
        ],
        stats: (u) => [
            ['XP total', Number(u.xp) || 0],
            ['Mensagens', Number(u.messages) || 0],
            ['Moedas', Number(u.coins) || 0],
            ['Chefes derrubados', Number(u.bossesMortos ?? u.bosses_mortos) || 0],
            ['Comandos usados', (Number(u.commandsGroup ?? u.commands_group) || 0) + (Number(u.commandsPv ?? u.commands_pv) || 0)],
            ['Sequência de dias', Number(u.streak) || 0],
            ['Renascimentos', Number(u.rebirthCount ?? u.rebirth_count) || 0]
        ]
    }
}

// Suporte ao perfil canônico Liberado
TEMAS.liberado = TEMAS.goat

/** Patente do tema para um nível. */
function patenteDe(tema, nivel) {
    const t = TEMAS[tema]
    if (!t) return '—'
    const n = Number(nivel) || 1
    let atual = t.patentes[0][1]
    for (const [min, nome] of t.patentes) if (n >= min) atual = nome
    return atual
}

/** Próxima patente e quantos níveis faltam. */
function proximaPatente(tema, nivel) {
    const t = TEMAS[tema]
    if (!t) return null
    const n = Number(nivel) || 1
    const proxima = t.patentes.find(([min]) => min > n)
    return proxima ? { nome: proxima[1], faltam: proxima[0] - n } : null
}

/** Progressão de um usuário dentro de um tema. */
function progressoDe(user, tema) {
    const t = TEMAS[tema]
    if (!t) {
        logger.warn(`[NIVEL] Tema "${tema}" não existe — usando goat.`)
        return progressoDe(user, 'goat')
    }
    const xp = t.fonte(user)
    const n = nivelPorXp(xp)
    return {
        tema,
        emoji: t.emoji,
        titulo: t.titulo,
        unidade: t.unidade,
        xpTotal: xp,
        ...n,
        patente: patenteDe(tema, n.nivel),
        proxima: proximaPatente(tema, n.nivel),
        stats: t.stats(user)
    }
}

/** Progressão do usuário em todos os temas, para comparar. */
function todosOsTemas(user) {
    return Object.keys(TEMAS).map(t => progressoDe(user, t))
}

/**
 * Soma XP num tema que não tem coluna própria.
 * `extra` do usuário absorve campos sem coluna, então não precisa de migração.
 */
function somarXp(jid, tema, quantidade) {
    const campos = { skycode: 'xpSkycode', divulgacao: 'xpDivulgacao' }
    const campo = campos[tema]
    if (!campo) {
        logger.warn(`[NIVEL] Tema "${tema}" não acumula XP próprio — ignorado.`)
        return null
    }
    try {
        const user = dataService.initializeUser(jid)
        user[campo] = (Number(user[campo]) || 0) + Math.max(0, Number(quantidade) || 0)
        dataService.saveUser(user)
        return user[campo]
    } catch (err) {
        logger.warn(`[NIVEL] Falha ao somar XP de ${tema} para ${jid}: ${err.message}`)
        return null
    }
}

module.exports = {
    TEMAS,
    xpDoNivel,
    nivelPorXp,
    patenteDe,
    proximaPatente,
    progressoDe,
    todosOsTemas,
    somarXp
}
