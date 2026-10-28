/**
 * Motor de RANKINGS.
 *
 * Existe por dois motivos:
 *
 * 1. Os ~43 comandos de ranking passam a ser só configuração — que coluna
 *    ordenar, como formatar — em vez de 43 cópias da mesma consulta e do mesmo
 *    desenho de tabela. Mudar o pódio vira um lugar só.
 *
 * 2. Ranking aqui é ESCOPADO. Dentro de um grupo, só entra quem está naquele
 *    grupo. Listar para o grupo A os jogadores do grupo B é ruído: ninguém
 *    compete com quem não conhece. Só no PV, onde não existe um grupo de
 *    referência, a lista abre para todos os cadastrados — e o rótulo diz isso.
 *
 * Só entra quem tem valor acima de zero: dez pessoas com "0 vitórias" não é um
 * ranking.
 */

const { q } = require('../database/connection')
const groupAuthService = require('./groupAuthService')
const logger = require('../core/logger')
const F = require('../utils/formato')

/** Colunas ordenáveis. Lista fechada: o nome é interpolado no SQL. */
const COLUNAS_VALIDAS = new Set([
    'xp', 'level', 'coins', 'rep', 'streak', 'wins', 'losses', 'bosses_mortos',
    'arena_pontos', 'weekly_xp', 'weekly_coins', 'messages', 'messages_group',
    'messages_pv', 'commands_group', 'commands_pv', 'xp_group', 'xp_pv', 'bank',
    'forge_level', 'vault_coins', 'rebirth_count', 'level_group', 'level_pv',
    'level_rpg', 'xp_rpg', 'hp_max', 'atk', 'def', 'bug_power', 'pv_farm_count',
    'group_farm_count', 'coins_pv', 'coins_group'
])

/** Colunas de texto que podem virar agrupamento. Lista fechada. */
const COLUNAS_AGRUPAVEIS = new Set([
    'guilda', 'classe', 'classe_lendaria', 'character_race', 'character_element',
    'pet', 'mundo', 'foco_categoria'
])

/** Campos JSON tratados como coleção contável. Lista fechada. */
const COLECOES_VALIDAS = new Set([
    'conquistas', 'pets', 'inventario', 'grimoire_spells', 'active_runes', 'skills'
])

const MEDALHAS = ['🥇', '🥈', '🥉']

/** Teto de linhas lidas antes do filtro de escopo. */
const TETO_LEITURA = 500

const CAMPOS_IDENTIDADE = 'jid, lid, name, display_nick, nickname_rpg'

/**
 * Reduz um JID ao número puro.
 * Necessário porque o mesmo usuário aparece como `55...@s.whatsapp.net`, como
 * `55...:12@s.whatsapp.net` (sufixo de dispositivo) e como LID — comparar as
 * strings inteiras perderia membros do grupo.
 */
function numeroDe(jid) {
    return String(jid || '').split('@')[0].split(':')[0]
}

/** Nome de exibição, com o número mascarado como último recurso. */
function nomeDe(row) {
    const bruto = row.display_nick || row.nickname_rpg || row.name
    if (bruto && String(bruto).trim()) return String(bruto).trim().slice(0, 20)
    const num = numeroDe(row.jid)
    return num ? `+${num.slice(0, 6)}****` : 'Anônimo'
}

/** Formata o valor conforme o tipo do ranking. */
function formatar(valor, tipo) {
    const n = Number(valor) || 0
    if (tipo === 'coins') return `${n.toLocaleString('pt-BR')} 🪙`
    if (tipo === 'nivel') return `Nv. ${n.toLocaleString('pt-BR')}`
    if (tipo === 'forja') return `+${n}`
    return n.toLocaleString('pt-BR')
}

/** Concorda o rótulo com o número: "1 conquista", "12 conquistas". */
function concordar(n, rotulo) {
    if (Number(n) !== 1) return rotulo
    return rotulo.replace(/(ns|s)$/, m => (m === 'ns' ? 'm' : ''))
}

/**
 * Descobre o universo do ranking a partir do contexto da mensagem.
 *
 * Em grupo: os participantes daquele grupo. No PV: todos os cadastrados.
 * Se a consulta ao grupo falhar, abre para todos em vez de devolver lista
 * vazia — um ranking amplo demais é melhor que um ranking vazio, e o aviso
 * fica no log.
 *
 * @returns {Promise<{numeros: Set<string>|null, rotulo: string}>}
 */
async function resolverEscopo({ from, isGroup } = {}) {
    if (!isGroup || !from) {
        return { numeros: null, rotulo: 'entre todos os cadastrados' }
    }
    try {
        const dados = await groupAuthService.getGroupData(from)
        const participantes = dados?.participants || []
        if (!participantes.length) {
            logger.warn(`[RANKING] Grupo ${from} veio sem participantes — abrindo escopo.`)
            return { numeros: null, rotulo: 'entre todos os cadastrados' }
        }
        const numeros = new Set()
        for (const p of participantes) {
            if (p?.id) numeros.add(numeroDe(p.id))
            if (p?.lid) numeros.add(numeroDe(p.lid))
            if (p?.jid) numeros.add(numeroDe(p.jid))
        }
        return { numeros, rotulo: 'neste grupo' }
    } catch (err) {
        logger.warn(`[RANKING] Não consegui ler o grupo ${from}: ${err.message} — abrindo escopo.`)
        return { numeros: null, rotulo: 'entre todos os cadastrados' }
    }
}

/** Mantém só quem pertence ao escopo, casando por número (JID ou LID). */
function dentroDoEscopo(row, escopo) {
    if (!escopo?.numeros) return true
    return escopo.numeros.has(numeroDe(row.jid)) || (row.lid && escopo.numeros.has(numeroDe(row.lid)))
}

/** Siglas que continuam em maiúsculas quando o título vem todo em caixa alta. */
const SIGLAS = new Set(['XP', 'RPG', 'PV', 'HP', 'ATK', 'DEF', 'VIP', 'PVP'])

/**
 * Título sem moldura: "🏆 *Mais ricos*".
 * Os comandos de ranking ainda passam títulos em caixa alta ("MAIS RICOS");
 * aqui eles viram frase normal, mantendo as siglas.
 */
function cabecalho(emoji, titulo) {
    let t = String(titulo || '').trim()
    if (t && t === t.toUpperCase() && /[A-ZÀ-Ý]/.test(t)) {
        t = t.split(/\s+/).map((p, i) => {
            if (SIGLAS.has(p)) return p
            const baixo = p.toLocaleLowerCase('pt-BR')
            return i === 0 ? baixo.charAt(0).toLocaleUpperCase('pt-BR') + baixo.slice(1) : baixo
        }).join(' ')
    }
    return `${emoji ? emoji + ' ' : ''}*${t}*\n\n`
}

/**
 * Como pontuar em cada ranking. Vira "Próximos passos" no pódio e "Como entrar
 * na lista" no ranking vazio — um ranking vazio sem dizer o que fazer era só
 * uma frase seca. Chave: a coluna, ou o prefixo do tipo de ranking.
 */
const JOGAR = [{ nome: 'hunt', oque: 'caçar monstros por XP e moedas' }, { nome: 'daily', oque: 'pegar a recompensa diária' }]
const CONVERSAR = [{ texto: 'Conversar no grupo já conta: cada mensagem soma' }, { nome: 'rank', oque: 'ver o seu nível e quanto falta' }]
const CONVERSAR_PV = [{ texto: 'Conversar comigo no privado já conta: cada mensagem soma' }, { nome: 'rank', oque: 'ver o seu nível e quanto falta' }]
const PODER = [{ nome: 'forjar', oque: 'fortalecer seus equipamentos' }, { nome: 'shoparmaduras', oque: 'comprar armaduras' }]
const COMO_PONTUAR = {
    xp: JOGAR, level: JOGAR, weekly_xp: JOGAR,
    xp_rpg: [{ nome: 'hunt', oque: 'caçar monstros' }, { nome: 'dungeon', oque: 'descer a masmorra' }],
    level_rpg: [{ nome: 'hunt', oque: 'caçar monstros' }, { nome: 'dungeon', oque: 'descer a masmorra' }],
    messages: CONVERSAR, messages_group: CONVERSAR, messages_pv: CONVERSAR_PV,
    xp_group: CONVERSAR, xp_pv: CONVERSAR_PV, level_group: CONVERSAR, level_pv: CONVERSAR_PV,
    commands_group: [{ nome: 'menu', oque: 'ver tudo o que eu sei fazer' }],
    commands_pv: [{ nome: 'menu', oque: 'ver tudo o que eu sei fazer' }],
    'commands_group+commands_pv': [{ nome: 'menu', oque: 'ver tudo o que eu sei fazer' }],
    rep: [{ nome: 'rep', args: '@pessoa', oque: 'dar reputação a alguém' }],
    streak: [{ nome: 'daily', oque: 'resgatar hoje e somar um dia seguido' }],
    wins: [{ nome: 'hunt', oque: 'vencer um monstro' }, { nome: 'duelo', args: '@pessoa', oque: 'desafiar alguém' }],
    losses: [{ nome: 'duelo', args: '@pessoa', oque: 'desafiar alguém (e torcer para não entrar aqui)' }],
    'taxa:wins': [{ nome: 'duelo', args: '@pessoa', oque: 'desafiar alguém' }, { nome: 'stats', oque: 'ver suas vitórias e derrotas' }],
    bosses_mortos: [{ nome: 'boss', args: 'lista', oque: 'ver os chefes que dá para enfrentar' }, { nome: 'dungeon', oque: 'enfrentar os chefes da masmorra' }],
    arena_pontos: [{ nome: 'arena', oque: 'ver as arenas e disputar' }],
    weekly_coins: [{ nome: 'trabalhar', oque: 'ganhar moedas trabalhando' }, { nome: 'daily', oque: 'pegar as moedas do dia' }],
    coins: [{ nome: 'trabalhar', oque: 'ganhar moedas trabalhando' }, { nome: 'hunt', oque: 'caçar por moedas' }],
    coins_pv: [{ nome: 'trabalhar', oque: 'ganhar moedas trabalhando' }],
    coins_group: [{ nome: 'trabalhar', oque: 'ganhar moedas trabalhando' }],
    'coins+bank+vault_coins': [{ nome: 'trabalhar', oque: 'ganhar moedas' }, { nome: 'banco', args: 'depositar 500', oque: 'guardar moedas no banco' }],
    bank: [{ nome: 'banco', args: 'depositar 500', oque: 'guardar 500 moedas no banco' }],
    vault_coins: [{ nome: 'cofre', args: 'guardar 1000', oque: 'guardar moedas no cofre' }],
    forge_level: [{ nome: 'forjar', oque: 'subir o nível de forja' }],
    rebirth_count: [{ nome: 'reencarnar', oque: 'ver o que pede para reencarnar' }],
    hp_max: PODER, atk: PODER, def: PODER,
    'grupo:guilda': [{ nome: 'guilda', oque: 'entrar ou criar uma guilda' }],
    'grupo:classe': [{ nome: 'classe', oque: 'escolher sua classe' }],
    'grupo:character_race': [{ nome: 'boneco', args: 'raca', oque: 'escolher sua raça' }],
    'grupo:pet': [{ nome: 'pet', oque: 'ver a loja de pets' }],
    'colecao:conquistas': [{ nome: 'conquistas', oque: 'ver as conquistas e o que cada uma pede' }]
}

/** Próximos passos de um ranking: como pontuar, mais o próprio perfil. */
function passosDe(chave) {
    const base = (COMO_PONTUAR[chave] || []).filter(p => p.nome)
    return [...base, ...(base.some(p => p.nome === 'perfil') ? [] : [{ nome: 'perfil', oque: 'ver seu perfil' }])].slice(0, 3)
}

function rodape(escopo, detalhe, chave) {
    let txt = `\n\n📍 _Ranking ${escopo?.rotulo || 'entre todos os cadastrados'}._`
    if (detalhe) txt += `\n\n💡 _${detalhe}_`
    const passos = F.proximos('.', passosDe(chave))
    if (passos) txt += `\n\n${passos}`
    return txt
}

/** Desenha o pódio a partir de linhas já filtradas e ordenadas, sem moldura. */
function desenharPodio(linhas, formatarLinha) {
    const itens = linhas.map((r, i) => `${MEDALHAS[i] || `${i + 1}º`} ${formatarLinha(r, i)}`)
    return ['🏅 *Pódio*', ...itens].join('\n')
}

/**
 * Ranking sem ninguém: diz o motivo, o que a tela mostraria e como entrar nela.
 */
function vazio(emoji, titulo, motivo, escopo, chave, detalhe) {
    const rotulo = escopo?.rotulo || 'entre todos os cadastrados'
    const comoEntrar = (COMO_PONTUAR[chave] || []).map(p => p.nome ? `• ${F.cmd('.', p.nome, p.args)} — ${p.oque}` : `• ${p.texto}`)
    return cabecalho(emoji, titulo)
        + `${motivo} Assim que houver alguém, aqui aparece o top 10 com o valor de cada um e a sua posição.`
        + (comoEntrar.length ? `\n\n🎯 *Como entrar na lista*\n${comoEntrar.join('\n')}` : '')
        + (detalhe ? `\n\n💡 _${detalhe}_` : '')
        + `\n\n📍 _Ranking ${rotulo}._`
        + `\n\n${F.proximos('.', comoEntrar.length ? [{ nome: 'perfil', oque: 'ver seu perfil' }] : passosDe(chave))}`
}

/**
 * Ranking por uma coluna numérica.
 *
 * @param {object} opts
 * @param {string} opts.coluna coluna de users (deve estar em COLUNAS_VALIDAS)
 * @param {string} opts.titulo
 * @param {string} [opts.emoji]
 * @param {string} [opts.tipo] 'numero' | 'coins' | 'nivel' | 'forja'
 * @param {string} [opts.unidade] rótulo do valor (ex.: 'XP')
 * @param {object} [opts.escopo] resultado de resolverEscopo()
 * @param {string} [opts.senderJid] destaca a posição de quem pediu
 */
function montarRanking({ coluna, titulo, emoji = '🏆', tipo = 'numero', unidade = '', escopo = null, senderJid = null, limite = 10, detalhe = null }) {
    if (!COLUNAS_VALIDAS.has(coluna)) {
        logger.error(`[RANKING] Coluna "${coluna}" não permitida — ranking abortado.`)
        return `❌ Ranking indisponível: coluna \`${coluna}\` não é válida.`
    }

    let brutas
    try {
        brutas = q(`SELECT ${CAMPOS_IDENTIDADE}, COALESCE("${coluna}", 0) AS valor
                    FROM users
                    WHERE registered = 1 AND COALESCE("${coluna}", 0) > 0
                    ORDER BY valor DESC
                    LIMIT ${TETO_LEITURA}`).all()
    } catch (err) {
        logger.error(`[RANKING] Falha ao consultar "${coluna}": ${err.message}`)
        return '❌ Não consegui montar o ranking agora. Tente de novo em instantes.'
    }

    const elegiveis = brutas.filter(r => dentroDoEscopo(r, escopo))
    if (!elegiveis.length) {
        return vazio(emoji, titulo, 'Ninguém pontuou neste ranking ainda.', escopo, coluna, detalhe)
    }

    const sufixo = unidade ? ' ' + unidade : ''
    let doc = cabecalho(emoji, titulo)
    doc += desenharPodio(elegiveis.slice(0, limite), r => `*${nomeDe(r)}* — ${formatar(r.valor, tipo)}${sufixo}`)

    // A posição de quem pediu é o que a pessoa realmente quer saber quando não
    // aparece no pódio. Calculada dentro do mesmo escopo, senão mente.
    if (senderJid) {
        const idx = elegiveis.findIndex(r => numeroDe(r.jid) === numeroDe(senderJid) || (r.lid && numeroDe(r.lid) === numeroDe(senderJid)))
        if (idx >= limite) {
            doc += `\n\n🎯 *Sua posição:* ${idx + 1}º — ${formatar(elegiveis[idx].valor, tipo)}${sufixo}`
        }
    }

    return doc + rodape(escopo, detalhe, coluna)
}

/**
 * Ranking por soma ponderada de colunas — para recortes que nenhuma coluna
 * isolada expressa, como patrimônio total (carteira + banco + cofre).
 *
 * @param {Array<{coluna: string, peso?: number}>} partes
 */
function montarRankingComposto({ partes, titulo, emoji = '🏆', tipo = 'numero', unidade = '', escopo = null, senderJid = null, limite = 10, detalhe = null }) {
    const invalida = partes.find(p => !COLUNAS_VALIDAS.has(p.coluna))
    if (invalida) {
        logger.error(`[RANKING] Coluna composta "${invalida.coluna}" não permitida — ranking abortado.`)
        return `❌ Ranking indisponível: coluna \`${invalida.coluna}\` não é válida.`
    }

    const expr = partes.map(p => `COALESCE("${p.coluna}", 0) * ${Number(p.peso) || 1}`).join(' + ')
    const chaveComposta = partes.map(p => p.coluna).join('+')

    let brutas
    try {
        brutas = q(`SELECT ${CAMPOS_IDENTIDADE}, (${expr}) AS valor
                    FROM users WHERE registered = 1 AND (${expr}) > 0
                    ORDER BY valor DESC LIMIT ${TETO_LEITURA}`).all()
    } catch (err) {
        logger.error(`[RANKING] Falha no ranking composto "${titulo}": ${err.message}`)
        return '❌ Não consegui montar o ranking agora. Tente de novo em instantes.'
    }

    const elegiveis = brutas.filter(r => dentroDoEscopo(r, escopo))
    if (!elegiveis.length) return vazio(emoji, titulo, 'Ninguém pontuou neste ranking ainda.', escopo, chaveComposta, detalhe)

    const sufixo = unidade ? ' ' + unidade : ''
    let doc = cabecalho(emoji, titulo)
    doc += desenharPodio(elegiveis.slice(0, limite), r => `*${nomeDe(r)}* — ${formatar(r.valor, tipo)}${sufixo}`)

    if (senderJid) {
        const idx = elegiveis.findIndex(r => numeroDe(r.jid) === numeroDe(senderJid) || (r.lid && numeroDe(r.lid) === numeroDe(senderJid)))
        if (idx >= limite) doc += `\n\n🎯 *Sua posição:* ${idx + 1}º — ${formatar(elegiveis[idx].valor, tipo)}${sufixo}`
    }

    return doc + rodape(escopo, detalhe, chaveComposta)
}

/**
 * Ranking por taxa (ex.: aproveitamento = vitórias / partidas).
 *
 * Exige um mínimo de amostras: quem tem 1 vitória e 0 derrotas ficaria com 100%
 * e lideraria para sempre sobre quem jogou 500 partidas — isso não mede nada.
 */
function montarRankingTaxa({ numerador, denominadores, minimo = 5, titulo, emoji = '📊', escopo = null, senderJid = null, limite = 10, detalhe = null }) {
    const invalida = [numerador, ...denominadores].find(c => !COLUNAS_VALIDAS.has(c))
    if (invalida) {
        logger.error(`[RANKING] Coluna de taxa "${invalida}" não permitida — ranking abortado.`)
        return `❌ Ranking indisponível: coluna \`${invalida}\` não é válida.`
    }

    const total = denominadores.map(c => `COALESCE("${c}", 0)`).join(' + ')
    const num = `COALESCE("${numerador}", 0)`

    let brutas
    try {
        brutas = q(`SELECT ${CAMPOS_IDENTIDADE},
                           (${num} * 100.0 / NULLIF(${total}, 0)) AS valor,
                           (${total}) AS amostras
                    FROM users WHERE registered = 1 AND (${total}) >= ?
                    ORDER BY valor DESC LIMIT ${TETO_LEITURA}`).all(minimo)
    } catch (err) {
        logger.error(`[RANKING] Falha no ranking de taxa "${titulo}": ${err.message}`)
        return '❌ Não consegui montar o ranking agora. Tente de novo em instantes.'
    }

    const elegiveis = brutas.filter(r => dentroDoEscopo(r, escopo))
    if (!elegiveis.length) return vazio(emoji, titulo, `Ninguém atingiu o mínimo de ${minimo} partidas ainda.`, escopo, 'taxa:' + numerador, detalhe)

    let doc = cabecalho(emoji, titulo)
    doc += desenharPodio(elegiveis.slice(0, limite), r => `*${nomeDe(r)}* — ${(Number(r.valor) || 0).toFixed(1)}% _(${r.amostras})_`)
    doc += `\n\n📌 _Mínimo de ${minimo} partidas para entrar na lista._`

    if (senderJid) {
        const idx = elegiveis.findIndex(r => numeroDe(r.jid) === numeroDe(senderJid) || (r.lid && numeroDe(r.lid) === numeroDe(senderJid)))
        if (idx >= limite) doc += `\n🎯 *Sua posição:* ${idx + 1}º — ${(Number(elegiveis[idx].valor) || 0).toFixed(1)}%`
    }

    return doc + rodape(escopo, detalhe, 'taxa:' + numerador)
}

/**
 * Ranking agregado por atributo de texto — quais guildas, classes, raças ou
 * pets dominam. A agregação é feita em JS, não com GROUP BY, porque o escopo
 * do grupo só é conhecido depois de comparar os números dos participantes.
 */
function montarRankingAgrupado({ coluna, titulo, emoji = '📛', rotulo = 'membros', escopo = null, senderJid = null, limite = 10, detalhe = null }) {
    if (!COLUNAS_AGRUPAVEIS.has(coluna)) {
        logger.error(`[RANKING] Coluna de agrupamento "${coluna}" não permitida — ranking abortado.`)
        return `❌ Ranking indisponível: \`${coluna}\` não é agrupável.`
    }

    let brutas
    try {
        brutas = q(`SELECT jid, lid, "${coluna}" AS chave, COALESCE(xp, 0) AS xp
                    FROM users
                    WHERE registered = 1 AND "${coluna}" IS NOT NULL AND TRIM("${coluna}") <> ''
                    LIMIT ${TETO_LEITURA}`).all()
    } catch (err) {
        logger.error(`[RANKING] Falha no agrupamento "${coluna}": ${err.message}`)
        return '❌ Não consegui montar o ranking agora. Tente de novo em instantes.'
    }

    const grupos = new Map()
    for (const r of brutas) {
        if (!dentroDoEscopo(r, escopo)) continue
        const chave = String(r.chave).trim()
        const atual = grupos.get(chave) || { chave, total: 0, xp: 0 }
        atual.total += 1
        atual.xp += Number(r.xp) || 0
        grupos.set(chave, atual)
    }

    const ordenados = [...grupos.values()].sort((a, b) => b.total - a.total || b.xp - a.xp)
    if (!ordenados.length) return vazio(emoji, titulo, 'Ninguém escolheu isso ainda.', escopo, 'grupo:' + coluna, detalhe)

    let doc = cabecalho(emoji, titulo)
    doc += desenharPodio(ordenados.slice(0, limite),
        g => `*${g.chave.slice(0, 24)}* — ${g.total} ${concordar(g.total, rotulo)} · ${g.xp.toLocaleString('pt-BR')} XP`)

    if (senderJid) {
        try {
            const meu = q(`SELECT "${coluna}" AS chave FROM users WHERE jid = ?`).get(senderJid)
            if (meu?.chave) doc += `\n\n🎯 *Você pertence a:* ${String(meu.chave).slice(0, 24)}`
        } catch (err) {
            logger.warn(`[RANKING] Facção de ${senderJid} falhou: ${err.message}`)
        }
    }

    return doc + rodape(escopo, detalhe, 'grupo:' + coluna)
}

/** Ranking por quantidade de itens num campo JSON (conquistas, pets, runas). */
function montarRankingColecao({ coluna, titulo, emoji = '🎖️', rotulo = 'itens', escopo = null, senderJid = null, limite = 10, detalhe = null }) {
    if (!COLECOES_VALIDAS.has(coluna)) {
        logger.error(`[RANKING] Coleção "${coluna}" não permitida — ranking abortado.`)
        return `❌ Ranking indisponível: \`${coluna}\` não é uma coleção conhecida.`
    }

    let brutas
    try {
        // json_valid protege contra linhas antigas gravadas como texto solto.
        brutas = q(`SELECT ${CAMPOS_IDENTIDADE}, json_array_length("${coluna}") AS valor
                    FROM users
                    WHERE registered = 1 AND json_valid("${coluna}")
                      AND json_type("${coluna}") = 'array' AND json_array_length("${coluna}") > 0
                    ORDER BY valor DESC LIMIT ${TETO_LEITURA}`).all()
    } catch (err) {
        logger.error(`[RANKING] Falha na coleção "${coluna}": ${err.message}`)
        return '❌ Não consegui montar o ranking agora. Tente de novo em instantes.'
    }

    const elegiveis = brutas.filter(r => dentroDoEscopo(r, escopo))
    if (!elegiveis.length) return vazio(emoji, titulo, `Ninguém colecionou ${rotulo} ainda.`, escopo, 'colecao:' + coluna, detalhe)

    let doc = cabecalho(emoji, titulo)
    doc += desenharPodio(elegiveis.slice(0, limite), r => `*${nomeDe(r)}* — ${r.valor} ${concordar(r.valor, rotulo)}`)

    if (senderJid) {
        const idx = elegiveis.findIndex(r => numeroDe(r.jid) === numeroDe(senderJid) || (r.lid && numeroDe(r.lid) === numeroDe(senderJid)))
        if (idx >= limite) doc += `\n\n🎯 *Sua posição:* ${idx + 1}º — ${elegiveis[idx].valor} ${concordar(elegiveis[idx].valor, rotulo)}`
    }

    return doc + rodape(escopo, detalhe, 'colecao:' + coluna)
}

/** Ranking de antiguidade: quem chegou primeiro. Ordena por data crescente. */
function montarRankingVeteranos({ titulo = 'VETERANOS DA CASA', emoji = '🏛️', escopo = null, senderJid = null, limite = 10, detalhe = null } = {}) {
    let brutas
    try {
        brutas = q(`SELECT ${CAMPOS_IDENTIDADE}, COALESCE(registered_at, created_at) AS entrada
                    FROM users
                    WHERE registered = 1 AND COALESCE(registered_at, created_at) IS NOT NULL
                    ORDER BY entrada ASC LIMIT ${TETO_LEITURA}`).all()
    } catch (err) {
        logger.error(`[RANKING] Falha no ranking de veteranos: ${err.message}`)
        return '❌ Não consegui montar o ranking agora. Tente de novo em instantes.'
    }

    const elegiveis = brutas.filter(r => dentroDoEscopo(r, escopo))
    if (!elegiveis.length) return vazio(emoji, titulo, 'Nenhum cadastro com data registrada ainda.', escopo, 'veteranos', detalhe)

    const agora = Date.now()
    const descrever = (r) => {
        // CURRENT_TIMESTAMP do SQLite vem em UTC sem fuso ("2026-09-17 14:30:00");
        // lido como hora local, o cadastro de hoje aparecia com "-1d".
        const bruto = String(r.entrada)
        const ts = new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(bruto) ? bruto.replace(' ', 'T') + 'Z' : r.entrada)
        if (!Number.isFinite(ts.getTime())) return '—'
        const dias = Math.max(0, Math.floor((agora - ts.getTime()) / 86400000))
        return `${ts.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} _(${dias === 0 ? 'hoje' : dias + 'd'})_`
    }

    let doc = cabecalho(emoji, titulo)
    doc += desenharPodio(elegiveis.slice(0, limite), r => `*${nomeDe(r)}* — ${descrever(r)}`)

    if (senderJid) {
        const idx = elegiveis.findIndex(r => numeroDe(r.jid) === numeroDe(senderJid) || (r.lid && numeroDe(r.lid) === numeroDe(senderJid)))
        if (idx >= limite) doc += `\n\n🎯 *Sua posição:* ${idx + 1}º — ${descrever(elegiveis[idx])}`
    }

    return doc + rodape(escopo, detalhe, 'veteranos')
}

module.exports = {
    resolverEscopo,
    montarRanking,
    montarRankingComposto,
    montarRankingTaxa,
    montarRankingAgrupado,
    montarRankingColecao,
    montarRankingVeteranos,
    COLUNAS_VALIDAS,
    COLUNAS_AGRUPAVEIS,
    COLECOES_VALIDAS,
    nomeDe,
    numeroDe,
    formatar
}
