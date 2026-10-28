const { getDatabase, q } = require('../connection')
const logger = require('../../core/logger')
const { ITENS_RENOMEADOS } = require('../../utils/constants')


// Chaves que JÁ têm coluna própria (ou são derivadas/efêmeras). Tudo fora desta
// lista vai para a coluna `extra` em JSON — foi assim que 37 campos gravados
// pelos comandos (cooldowns de trabalhar/crime/roubar, banco, cofre, badges,
// títulos, montaria, andar da torre...) deixaram de ser descartados no save.
const COLUMN_BACKED = new Set([
    'jid','xp','level','messages','coins','rep','streak','hp','hpMax','hp_max','mundo','mochila',
    'classe','classeLendaria','classe_lendaria','bugPower','bug_power','pet','equipado','arma','guilda',
    'wins','losses','bossesMortos','bosses_mortos','arenaPontos','arena_pontos','arenaAtual','arena_atual',
    'lastDaily','last_daily','weeklyXp','weekly_xp','weeklyCoins','weekly_coins',
    'messagesGroup','messages_group','messagesPv','messages_pv','commandsGroup','commands_group',
    'commandsPv','commands_pv','xpGroup','xp_group','xpPv','xp_pv','forgeLevel','forge_level',
    'nicknameRpg','nickname_rpg','atk','def','slots','pocaoAtiva','pocao_ativa_tipo','pocao_ativa_expira',
    'bank','name','lastDevice','last_device','lastPingMs','last_ping_ms','netType','net_type',
    'lastSeen','last_seen','phone','lid','inventario','inventory','conquistas','pets',
    'vaultCoins','vault_coins','rebirthCount','rebirth_count','grimoireSpells','grimoire_spells',
    'activeRunes','active_runes','skills','characterRace','character_race','characterElement','character_element',
    'fogueiraBuffExpira','fogueira_buff_expira','pvFarmCount','pv_farm_count','groupFarmCount','group_farm_count',
    'coinsPv','coins_pv','coinsGroup','coins_group','registered','displayNick','display_nick',
    'rpgEnabled','rpg_enabled','focoCategoria','foco_categoria','registeredAt','registered_at',
    'created_at','updated_at','extra'
])

/** Extrai os campos que não têm coluna própria, para serem salvos em `extra`. */
function extraOf(user) {
    const out = {}
    if (!user || typeof user !== 'object') return out
    for (const k of Object.keys(user)) {
        if (COLUMN_BACKED.has(k)) continue
        const v = user[k]
        if (v === undefined || typeof v === 'function') continue
        out[k] = v
    }
    return Object.keys(out).length ? out : null
}

function rowToUser(row) {
    if (!row) return null

    let parsedSlots = {
        capacete: null,
        peitoral: null,
        calca: null,
        botas: null,
        arma: null,
        escudo: null,
        amuleto: null
    }

    try {
        if (row.slots) {
            const parsed = typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots
            parsedSlots = { ...parsedSlots, ...parsed }
        }
    } catch (err) {
        // getUser é caminho quente: avisa uma vez por usuário, depois só debug.
        logger.warnOnce(`slots:${row.jid}`, `[USER REPO] getUser: slots corrompidos de ${row.jid}, uso slots vazios: ${err.message}`)
    }

    const parseJsonArray = (val) => {
        if (!val) return []
        try {
            return typeof val === 'string' ? JSON.parse(val) : val
        } catch (_) {
            return []
        }
    }

    // Itens que trocaram de nome exibido continuam valendo nas receitas.
    const invBruto = parseJsonArray(row.inventario)
    const parsedInv = Array.isArray(invBruto) ? invBruto.map(i => (typeof i === 'string' && ITENS_RENOMEADOS[i]) || i) : invBruto
    const parsedConquistas = parseJsonArray(row.conquistas)
    const parsedPets = parseJsonArray(row.pets)
    const parsedGrimoire = parseJsonArray(row.grimoire_spells)
    const parsedRunes = parseJsonArray(row.active_runes)
    // skills chegou a ser gravado codificado duas vezes (JSON de JSON): desembrulha
    // até virar lista para ninguém receber texto no lugar da lista.
    const parsedSkills = listaDesembrulhada(row.skills, row.jid)
    // Campos sem coluna própria (cooldowns, banco, cofre, badges, títulos...).
    // Entram primeiro para que qualquer coluna real prevaleça sobre eles.
    let parsedExtra = {}
    try {
        if (row.extra) parsedExtra = typeof row.extra === 'string' ? JSON.parse(row.extra) : row.extra
    } catch (err) {
        logger.warnOnce(`extra:${row.jid}`, `[USER REPO] getUser: campo extra corrompido de ${row.jid}, ignoro (cooldowns/banco/badges somem): ${err.message}`)
    }

    const usuario = {
        ...parsedExtra,
        jid: row.jid,
        xp: Number(row.xp || 0),
        level: Number(row.level || 1),
        messages: Number(row.messages || 0),
        coins: Number(row.coins || 0),
        rep: Number(row.rep || 0),
        streak: Number(row.streak || 0),
        hp: Number(row.hp || 100),
        hpMax: Number(row.hp_max || 100),
        mundo: row.mundo || 'floresta',
        mochila: Number(row.mochila || 20),
        classe: row.classe || null,
        classeLendaria: row.classe_lendaria || null,
        bugPower: Number(row.bug_power || 0),
        pet: row.pet || null,
        equipado: row.equipado || null,
        arma: row.arma || null,
        guilda: row.guilda || null,
        wins: Number(row.wins || 0),
        losses: Number(row.losses || 0),
        bossesMortos: Number(row.bosses_mortos || 0),
        arenaPontos: Number(row.arena_pontos || 0),
        arenaAtual: Number(row.arena_atual || 1),
        lastDaily: Number(row.last_daily || 0),
        weeklyXp: Number(row.weekly_xp || 0),
        weeklyCoins: Number(row.weekly_coins || 0),
        messagesGroup: Number(row.messages_group || 0),
        messagesPv: Number(row.messages_pv || 0),
        commandsGroup: Number(row.commands_group || 0),
        commandsPv: Number(row.commands_pv || 0),
        xpGroup: Number(row.xp_group || 0),
        xpPv: Number(row.xp_pv || 0),
        forgeLevel: Number(row.forge_level || 0),
        nicknameRpg: row.nickname_rpg || null,
        atk: Number(row.atk || 10),
        def: Number(row.def || 5),
        slots: parsedSlots,
        pocaoAtiva: row.pocao_ativa_tipo ? {
            tipo: row.pocao_ativa_tipo,
            expira: Number(row.pocao_ativa_expira)
        } : null,
        bank: Number(row.bank || 0),
        name: row.name || null,
        lastDevice: row.last_device || null,
        lastPingMs: Number(row.last_ping_ms || 0),
        netType: row.net_type || null,
        lastSeen: Number(row.last_seen || 0),
        phone: row.phone || null,
        lid: row.lid || null,
        inventario: parsedInv,
        inventory: parsedInv,
        conquistas: parsedConquistas,
        pets: parsedPets,
        // Colunas que existiam no schema mas nunca eram lidas nem persistidas.
        // Expostas em ambas as grafias porque os comandos usam camelCase e snake_case.
        vaultCoins: Number(row.vault_coins || 0),
        vault_coins: Number(row.vault_coins || 0),
        rebirthCount: Number(row.rebirth_count || 0),
        rebirth_count: Number(row.rebirth_count || 0),
        grimoireSpells: parsedGrimoire,
        grimoire_spells: parsedGrimoire,
        activeRunes: parsedRunes,
        active_runes: parsedRunes,
        skills: parsedSkills,
        characterRace: row.character_race || 'humano',
        character_race: row.character_race || 'humano',
        characterElement: row.character_element || 'fogo',
        character_element: row.character_element || 'fogo',
        fogueiraBuffExpira: Number(row.fogueira_buff_expira || 0),
        fogueira_buff_expira: Number(row.fogueira_buff_expira || 0),
        pvFarmCount: Number(row.pv_farm_count || 0),
        pv_farm_count: Number(row.pv_farm_count || 0),
        groupFarmCount: Number(row.group_farm_count || 0),
        group_farm_count: Number(row.group_farm_count || 0),
        coinsPv: Number(row.coins_pv || 0),
        coins_pv: Number(row.coins_pv || 0),
        coinsGroup: Number(row.coins_group || 0),
        coins_group: Number(row.coins_group || 0),
        levelGroup: Math.max(1, Number(row.level_group || 1)),
        level_group: Math.max(1, Number(row.level_group || 1)),
        levelPv: Math.max(1, Number(row.level_pv || 1)),
        level_pv: Math.max(1, Number(row.level_pv || 1)),
        levelRpg: Math.max(1, Number(row.level_rpg || row.level || 1)),
        level_rpg: Math.max(1, Number(row.level_rpg || row.level || 1)),
        xpRpg: Math.max(0, Number(row.xp_rpg || row.xp || 0)),
        xp_rpg: Math.max(0, Number(row.xp_rpg || row.xp || 0)),
        // Perfil de login (Fase B)
        registered: !!row.registered,
        displayNick: row.display_nick || null,
        display_nick: row.display_nick || null,
        rpgEnabled: row.rpg_enabled === undefined || row.rpg_enabled === null ? true : row.rpg_enabled !== 0,
        rpg_enabled: row.rpg_enabled === undefined || row.rpg_enabled === null ? 1 : row.rpg_enabled,
        focoCategoria: row.foco_categoria || null,
        foco_categoria: row.foco_categoria || null,
        registeredAt: row.registered_at || null,
        registered_at: row.registered_at || null
    }
    // Marca invisível: só um perfil lido do banco pode gravar a mochila vazia.
    // Um objeto montado do zero (ex.: initializeUser depois de uma falha de
    // leitura) com inventario [] não pode apagar a mochila gravada.
    Object.defineProperty(usuario, '__lidoDoBanco', { value: true, enumerable: false })
    return usuario
}

/**
 * Persiste o mapeamento de identidade (jid ↔ lid ↔ número) em `user_identities`,
 * tornando a unificação de perfil DURÁVEL — mesmo quando o Baileys não resolve o
 * número do @lid numa interação futura. Write-only, tolerante a falha.
 * @param {string} jid   jid canônico observado (ex.: número@s.whatsapp.net ou @lid)
 * @param {{lid?:string, phoneDigits?:string, linkedJid?:string}} info
 */
function linkIdentity(jid, info = {}) {
    if (!jid || jid.endsWith('@g.us') || jid.endsWith('@broadcast')) return
    const { lid = null, phoneDigits = null, linkedJid = null } = info
    if (!lid && !phoneDigits && !linkedJid) return
    try {
        q(`INSERT INTO user_identities (jid, lid, phone_digits, linked_jid, updated_at)
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(jid) DO UPDATE SET
             lid          = COALESCE(excluded.lid, user_identities.lid),
             phone_digits = COALESCE(excluded.phone_digits, user_identities.phone_digits),
             linked_jid   = COALESCE(excluded.linked_jid, user_identities.linked_jid),
             updated_at   = CURRENT_TIMESTAMP`
        ).run(jid, lid, phoneDigits, linkedJid)
    } catch (e) {
        try { require('../../core/logger').warn(`[IDENTITY] linkIdentity falhou (${e.message})`) } catch (errIgnorado) { logger.warn(`[USERREPOSITORY] Falha ignorada em src/database/repositories/userRepository.js:219: ${errIgnorado.message}`) }
    }
}

/**
 * Expande um conjunto de candidatos consultando `user_identities`: dado qualquer
 * jid/lid/número conhecido, retorna todos os jids relacionados. Assim um @lid
 * resolve para o perfil canônico do número (e vice-versa) de forma persistente.
 */
function resolveLinkedJids(candidates = []) {
    const set = new Set(candidates.filter(Boolean))
    if (!set.size) return []
    try {
        for (const c of Array.from(set)) {
            const digits = String(c).replace(/[@].*$/, '').replace(/\D/g, '') || null
            const rows = q(
                `SELECT jid, lid, phone_digits, linked_jid FROM user_identities
                 WHERE jid = ? OR lid = ? OR linked_jid = ? OR (phone_digits IS NOT NULL AND phone_digits = ?)`
            ).all(c, c, c, digits)
            for (const r of rows) {
                if (r.jid) set.add(r.jid)
                if (r.lid) set.add(r.lid)
                if (r.linked_jid) set.add(r.linked_jid)
            }
        }
    } catch (e) {
        try { require('../../core/logger').warn(`[IDENTITY] resolveLinkedJids falhou (${e.message})`) } catch (errIgnorado) { logger.warn(`[USERREPOSITORY] Falha ignorada em src/database/repositories/userRepository.js:245: ${errIgnorado.message}`) }
    }
    return Array.from(set)
}

function getUser(jid, alternativeJids = []) {
    const direct = [jid, ...(Array.isArray(alternativeJids) ? alternativeJids : [alternativeJids])].filter(Boolean)
    // Expande com identidades persistidas (lid↔número) para unificação durável.
    const allCandidates = resolveLinkedJids(direct)

    // 1. Registro ativo entre os candidatos diretos (usa índice em jid/lid)
    for (const c of allCandidates) {
        const row = q('SELECT * FROM users WHERE jid = ? OR lid = ? ORDER BY level DESC, xp DESC, messages DESC LIMIT 1').get(c, c)
        if (row && (row.xp > 0 || row.messages > 0 || row.coins > 0 || row.level > 1 || row.registered > 0 || row.display_nick)) {
            return rowToUser(row)
        }
    }

    // 2. Fallback: qualquer correspondência direta
    for (const c of allCandidates) {
        const row = q('SELECT * FROM users WHERE jid = ? OR lid = ?').get(c, c)
        if (row) return rowToUser(row)
    }

    return null
}

// ---------------------------------------------------------------------------
// Definição única das colunas de `users`, usada para gerar INSERT, placeholders,
// cláusula ON CONFLICT e a lista de valores a partir da MESMA fonte.
// Isso torna impossível dessincronizar `?` de valores (bug clássico de INSERT
// com ~60 colunas escrito à mão).
//
//   val : (user) => valor a bindar. Ausente = coluna literal, sem placeholder.
//   ins : expressão de INSERT (default '?'). Ex.: "COALESCE(?, 'humano')" ou "CURRENT_TIMESTAMP".
//   set : estratégia da cláusula ON CONFLICT DO UPDATE:
//         'skip'     -> não aparece no SET (preservada em updates)
//         'direct'   -> col = excluded.col
//         'max'      -> col = MAX(users.col, excluded.col)   (não regride)
//         'coalesce' -> col = COALESCE(excluded.col, users.col)  (não sobrescreve com null)
//         'now'      -> col = CURRENT_TIMESTAMP
//         <string>   -> expressão bruta usada como lado direito de `col = ...`
// ---------------------------------------------------------------------------
const j = (v) => JSON.stringify(v || [])

/**
 * Lista gravada como JSON, aceitando JSON de JSON (formato antigo de skills).
 * @param {*} v - lista, texto JSON ou texto JSON de JSON
 * @param {string} [jid] - só para o log
 * @returns {Array}
 */
function listaDesembrulhada(v, jid) {
    let lista = v
    try {
        for (let i = 0; i < 5 && typeof lista === 'string'; i++) lista = JSON.parse(lista)
    } catch (err) {
        logger.warnOnce(`lista:${jid}`, `[USER REPO] lista JSON ilegível de ${jid}, tratando como vazia: ${err.message}`)
        return []
    }
    return Array.isArray(lista) ? lista : []
}
const COLUMNS = [
    { name: 'jid',                val: u => u.jid,                                              set: 'skip' },
    { name: 'xp',                 val: u => u.xp ?? 0,                                          set: 'CASE WHEN excluded.level > users.level THEN excluded.xp ELSE MAX(users.xp, excluded.xp) END' },
    { name: 'level',              val: u => u.level ?? 1,                                       set: 'max' },
    { name: 'messages',          val: u => u.messages ?? 0,                                     set: 'max' },
    { name: 'coins',             val: u => u.coins ?? 0,                                        set: 'direct' },
    { name: 'rep',               val: u => u.rep ?? 0,                                          set: 'direct' },
    { name: 'streak',            val: u => u.streak ?? 0,                                       set: 'direct' },
    { name: 'hp',                val: u => u.hp ?? 100,                                         set: 'direct' },
    { name: 'hp_max',            val: u => u.hpMax ?? u.hp_max ?? 100,                          set: 'direct' },
    { name: 'mundo',             val: u => u.mundo || 'floresta',                               set: 'direct' },
    { name: 'mochila',           val: u => u.mochila ?? 20,                                     set: 'max' },
    { name: 'classe',            val: u => u.classe || null,                                    set: 'coalesce' },
    { name: 'classe_lendaria',   val: u => u.classeLendaria ?? u.classe_lendaria ?? null,       set: 'coalesce' },
    { name: 'bug_power',         val: u => u.bugPower ?? u.bug_power ?? 0,                       set: 'direct' },
    // `pet` é coluna TEXT: um objeto quebra o bind do SQLite com
    // "Provided value cannot be bound" e a gravação inteira do usuário falha.
    // Historicamente `.petshop equipar` gravava { name, type, level }, então o
    // pet nunca era persistido. Normaliza para a chave antes de salvar.
    { name: 'pet',               val: u => petParaTexto(u.pet),                                 set: 'direct' },
    { name: 'equipado',          val: u => u.equipado || null,                                  set: 'coalesce' },
    { name: 'arma',              val: u => u.arma || null,                                      set: 'coalesce' },
    { name: 'guilda',            val: u => u.guilda || null,                                    set: 'coalesce' },
    { name: 'wins',              val: u => u.wins ?? 0,                                         set: 'max' },
    { name: 'losses',            val: u => u.losses ?? 0,                                       set: 'max' },
    { name: 'bosses_mortos',     val: u => u.bossesMortos ?? u.bosses_mortos ?? 0,              set: 'max' },
    { name: 'arena_pontos',      val: u => u.arenaPontos ?? u.arena_pontos ?? 0,                set: 'direct' },
    { name: 'arena_atual',       val: u => u.arenaAtual ?? u.arena_atual ?? 1,                  set: 'direct' },
    { name: 'last_daily',        val: u => u.lastDaily ?? u.last_daily ?? 0,                    set: 'direct' },
    { name: 'weekly_xp',         val: u => u.weeklyXp ?? u.weekly_xp ?? 0,                      set: 'direct' },
    { name: 'weekly_coins',      val: u => u.weeklyCoins ?? u.weekly_coins ?? 0,                set: 'direct' },
    { name: 'pocao_ativa_tipo',  val: u => u.pocaoAtiva?.tipo || null,                          set: 'direct' },
    { name: 'pocao_ativa_expira', val: u => u.pocaoAtiva?.expira || null,                       set: 'direct' },
    // Inventário é gravado como veio. Quem chama saveUser com um objeto parcial
    // (sem inventario/inventory) usa a variante SQL_SAVE_KEEP_INV, que não toca
    // na coluna. Antes a guarda era "'[]' mantém o antigo", o que ressuscitava o
    // último item de quem esvaziou a mochila de propósito.
    { name: 'inventario',        val: u => j(u.inventario),                                     set: 'direct' },
    { name: 'conquistas',        val: u => j(u.conquistas),                                     set: 'direct' },
    { name: 'pets',              val: u => j(u.pets),                                           set: 'direct' },
    { name: 'created_at',        ins: 'CURRENT_TIMESTAMP',                                      set: 'skip' },
    { name: 'updated_at',        ins: 'CURRENT_TIMESTAMP',                                      set: 'now' },
    { name: 'messages_group',    val: u => u.messagesGroup ?? u.messages_group ?? 0,            set: 'direct' },
    { name: 'messages_pv',       val: u => u.messagesPv ?? u.messages_pv ?? 0,                  set: 'direct' },
    { name: 'commands_group',    val: u => u.commandsGroup ?? u.commands_group ?? 0,            set: 'max' },
    { name: 'commands_pv',       val: u => u.commandsPv ?? u.commands_pv ?? 0,                  set: 'max' },
    { name: 'xp_group',          val: u => u.xpGroup ?? u.xp_group ?? 0,                        set: 'direct' },
    { name: 'xp_pv',             val: u => u.xpPv ?? u.xp_pv ?? 0,                              set: 'direct' },
    { name: 'bank',              val: u => u.bank ?? 0,                                         set: 'direct' },
    { name: 'last_device',       val: u => u.lastDevice ?? u.last_device ?? null,               set: 'direct' },
    { name: 'last_ping_ms',      val: u => u.lastPingMs ?? u.last_ping_ms ?? 0,                 set: 'direct' },
    { name: 'net_type',          val: u => u.netType ?? u.net_type ?? null,                     set: 'direct' },
    { name: 'last_seen',         val: u => u.lastSeen ?? u.last_seen ?? Date.now(),             set: 'direct' },
    { name: 'phone',             val: u => u.phone || null,                                     set: 'coalesce' },
    { name: 'lid',               val: u => u.lid || null,                                       set: 'coalesce' },
    { name: 'name',              val: u => u.name || null,                                      set: 'coalesce' },
    { name: 'slots',             val: u => JSON.stringify(u.slots || {}),                       set: 'direct' },
    { name: 'forge_level',       val: u => u.forgeLevel ?? u.forge_level ?? 0,                  set: 'max' },
    { name: 'nickname_rpg',      val: u => u.nicknameRpg ?? u.nickname_rpg ?? null,             set: 'direct' },
    { name: 'atk',               val: u => u.atk ?? 10,                                         set: 'direct' },
    { name: 'def',               val: u => u.def ?? 5,                                          set: 'direct' },
    // vault_coins é gerido exclusivamente pelo vaultRepository (ON CONFLICT próprio).
    // Entra no INSERT (linha nova = 0) mas nunca no SET, para não ser destruído por saveUser.
    { name: 'vault_coins',       val: u => u.vaultCoins ?? u.vault_coins ?? 0,                  set: 'skip' },
    { name: 'rebirth_count',     val: u => u.rebirthCount ?? u.rebirth_count ?? 0,              set: 'max' },
    { name: 'grimoire_spells',   val: u => j(u.grimoireSpells ?? u.grimoire_spells),           set: 'direct' },
    { name: 'active_runes',      val: u => j(u.activeRunes ?? u.active_runes),                  set: 'direct' },
    { name: 'skills',            val: u => j(listaDesembrulhada(u.skills, u.jid)),             set: 'direct' },
    { name: 'extra',             val: u => j(extraOf(u)),                                      set: 'direct' },
    { name: 'character_race',    val: u => u.characterRace ?? u.character_race ?? null,     ins: "COALESCE(?, 'humano')", set: 'coalesce' },
    { name: 'character_element', val: u => u.characterElement ?? u.character_element ?? null, ins: "COALESCE(?, 'fogo')",  set: 'coalesce' },
    { name: 'fogueira_buff_expira', val: u => u.fogueiraBuffExpira ?? u.fogueira_buff_expira ?? 0, set: 'direct' },
    { name: 'pv_farm_count',     val: u => u.pvFarmCount ?? u.pv_farm_count ?? 0,               set: 'direct' },
    { name: 'group_farm_count',  val: u => u.groupFarmCount ?? u.group_farm_count ?? 0,         set: 'direct' },
    { name: 'coins_pv',          val: u => u.coinsPv ?? u.coins_pv ?? 0,                        set: 'direct' },
    { name: 'coins_group',       val: u => u.coinsGroup ?? u.coins_group ?? 0,                  set: 'direct' },
    { name: 'level_group',       val: u => u.levelGroup ?? u.level_group ?? 1,                  set: 'max' },
    { name: 'level_pv',          val: u => u.levelPv ?? u.level_pv ?? 1,                        set: 'max' },
    { name: 'level_rpg',         val: u => u.levelRpg ?? u.level_rpg ?? u.level ?? 1,           set: 'max' },
    { name: 'xp_rpg',            val: u => u.xpRpg ?? u.xp_rpg ?? u.xp ?? 0,                    set: 'direct' },
    // Perfil de login (Fase B)
    { name: 'registered',        val: u => (u.registered ? 1 : 0),                              set: 'max' },
    { name: 'display_nick',      val: u => u.displayNick ?? u.display_nick ?? null,             set: 'direct' },
    { name: 'rpg_enabled',       val: u => (u.rpgEnabled === false || u.rpg_enabled === 0 ? 0 : 1), set: 'direct' },
    { name: 'foco_categoria',    val: u => u.focoCategoria ?? u.foco_categoria ?? null,         set: 'coalesce' },
    { name: 'registered_at',     val: u => u.registeredAt ?? u.registered_at ?? null,           set: 'coalesce' }
]

function setClause(c) {
    switch (c.set) {
        case 'skip':     return null
        case 'direct':   return `${c.name} = excluded.${c.name}`
        case 'max':      return `${c.name} = MAX(users.${c.name}, excluded.${c.name})`
        case 'coalesce': return `${c.name} = COALESCE(excluded.${c.name}, users.${c.name})`
        case 'now':      return `${c.name} = CURRENT_TIMESTAMP`
        default:         return `${c.name} = ${c.set}`   // expressão bruta
    }
}

// SQL montado uma vez, a partir de COLUMNS.
/**
 * Reduz qualquer formato histórico de `user.pet` a uma string (ou null).
 * Aceita chave crua, objeto { name, type } e nome de exibição.
 * @param {string|object|null} pet
 * @returns {string|null}
 */
function petParaTexto(pet) {
    if (!pet) return null
    if (typeof pet === 'string') return pet
    if (typeof pet === 'object') return pet.type || pet.name || pet.tipo || pet.nome || null
    return null
}

const _bound = COLUMNS.filter(c => c.val)                       // colunas com placeholder
const _insCols = COLUMNS.map(c => c.name).join(', ')
const _insVals = COLUMNS.map(c => c.ins || '?').join(', ')
const _setNormal = COLUMNS.map(setClause).filter(Boolean).join(',\n            ')
// Variante "force": sobrescreve tudo direto (sem MAX/COALESCE), para rebirth/reset/penalidade.
const _setForce = COLUMNS
    .filter(c => c.set !== 'skip' && c.set !== 'now')
    .map(c => `${c.name} = excluded.${c.name}`)
    .concat(['updated_at = CURRENT_TIMESTAMP'])
    .join(',\n            ')

const SQL_SAVE = `
        INSERT INTO users (${_insCols})
        VALUES (${_insVals})
        ON CONFLICT(jid) DO UPDATE SET
            ${_setNormal}
    `
// Igual a SQL_SAVE, mas preserva a coluna inventario: usada quando o objeto
// passado não trouxe inventário nenhum (objeto parcial, não "mochila vazia").
const SQL_SAVE_KEEP_INV = `
        INSERT INTO users (${_insCols})
        VALUES (${_insVals})
        ON CONFLICT(jid) DO UPDATE SET
            ${COLUMNS.filter(c => c.name !== 'inventario').map(setClause).filter(Boolean).join(',\n            ')}
    `
const SQL_SAVE_FORCE = `
        INSERT INTO users (${_insCols})
        VALUES (${_insVals})
        ON CONFLICT(jid) DO UPDATE SET
            ${_setForce}
    `

/**
 * Persiste um usuário. Colunas fora do SET (created_at, vault_coins) são
 * preservadas de propósito. Por padrão aplica guardas anti-regressão em
 * level/xp/messages/mochila/forge_level via SQL.
 * @param {object} user
 * @param {{force?: boolean}} [opts] - force:true ignora as guardas (rebirth/reset/penalidade).
 */
function saveUser(user, opts = {}) {
    if (!user || !user.jid) return
    // Grupos (@g.us) e broadcast nunca são perfis de usuário.
    if (user.jid.endsWith('@g.us') || user.jid.endsWith('@broadcast')) return

    // Objeto sem inventário nenhum = inventário não carregado: preserva o gravado.
    // Array vazio = mochila esvaziada de propósito: grava vazio.
    const inventarioInformado = Array.isArray(user.inventario) || Array.isArray(user.inventory)
    const invAtual = Array.isArray(user.inventario) ? user.inventario : user.inventory
    // Mochila vazia só é gravada se o perfil veio do banco (esvaziada de propósito).
    const vazioDeObjetoNovo = Array.isArray(invAtual) && invAtual.length === 0 && user.__lidoDoBanco !== true

    // Normaliza inventário (aceita inventory como origem alternativa)
    if (!Array.isArray(user.inventario)) {
        user.inventario = Array.isArray(user.inventory) ? user.inventory : []
    }
    user.inventory = user.inventario

    // Merge de slots: preserva slots equipados no banco quando o objeto em
    // memória está incompleto. Só lê o banco (coluna única, indexada por PK)
    // quando o objeto passado não traz as 7 chaves — no caminho quente, o
    // usuário vem completo de getUser e nenhuma leitura ocorre.
    const slotKeys = user.slots ? Object.keys(user.slots) : []
    if (slotKeys.length < 7) {
        const prev = q('SELECT slots FROM users WHERE jid = ?').get(user.jid)
        if (prev && prev.slots && prev.slots !== '{}') {
            try {
                const existingSlots = JSON.parse(prev.slots)
                if (!user.slots) user.slots = existingSlots
                else {
                    for (const k of Object.keys(existingSlots)) {
                        if (!user.slots[k] && existingSlots[k]) user.slots[k] = existingSlots[k]
                    }
                }
            } catch (err) {
                logger.warnOnce(`saveslots:${user.jid}`, `[USER REPO] saveUser: slots gravados de ${user.jid} estão corrompidos, não dá para mesclar: ${err.message}`)
            }
        }
    }

    // Merge de bossesResumo / bossesDerrotados: preserva histórico do RPG se ausente no objeto em memória
    if (!user.bossesResumo || !user.bossesDerrotados) {
        const prevExtra = q('SELECT extra FROM users WHERE jid = ?').get(user.jid)
        if (prevExtra && prevExtra.extra) {
            try {
                const parsed = JSON.parse(prevExtra.extra)
                if (!user.bossesResumo && parsed.bossesResumo) user.bossesResumo = parsed.bossesResumo
                if (!user.bossesDerrotados && parsed.bossesDerrotados) user.bossesDerrotados = parsed.bossesDerrotados
            } catch (err) {
                logger.warnOnce(`saveextra:${user.jid}`, `[USER REPO] saveUser: extra gravado de ${user.jid} está corrompido, histórico de bosses não mesclado: ${err.message}`)
            }
        }
    }

    const values = _bound.map(c => c.val(user))
    let sql = SQL_SAVE
    if (opts.force) sql = SQL_SAVE_FORCE
    else if (!inventarioInformado || vazioDeObjetoNovo) sql = SQL_SAVE_KEEP_INV
    q(sql).run(...values)
}

function getAllUsers() {
    const rows = q('SELECT * FROM users').all()
    const result = {}
    for (const row of rows) {
        result[row.jid] = rowToUser(row)
    }
    return result
}

/** Incrementa o contador de comandos sem ler/reescrever a linha inteira. */
function incrementCommandCount(jid, isGroup) {
    if (!jid) return
    const col = isGroup ? 'commands_group' : 'commands_pv'
    q(`UPDATE users SET ${col} = COALESCE(${col}, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE jid = ?`).run(jid)
}

function getTopRank(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY level DESC, xp DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopCoins(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY coins DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopWeekly(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY weekly_xp DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopArena(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY arena_pontos DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopXp(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY xp DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopGroup(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY level_group DESC, xp_group DESC, messages DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopPv(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY level_pv DESC, xp_pv DESC, commands_pv DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopRpg(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' AND (rpg_enabled = 1 OR rpg_enabled IS NULL) ORDER BY level_rpg DESC, xp_rpg DESC, bosses_mortos DESC, wins DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getTopSkycode(limit = 10) {
    const rows = q("SELECT * FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != '' ORDER BY created_at ASC, (messages + COALESCE(commands_group, 0) + COALESCE(commands_pv, 0)) DESC LIMIT ?").all(limit)
    return rows.map(r => [r.jid, rowToUser(r)])
}

function getRegisteredCount() {
    const row = q("SELECT count(*) as total FROM users WHERE registered = 1 AND display_nick IS NOT NULL AND trim(display_nick) != ''").get()
    return row?.total || 0
}

module.exports = {
    getUser,
    saveUser,
    getAllUsers,
    linkIdentity,
    resolveLinkedJids,
    incrementCommandCount,
    getTopRank,
    getTopCoins,
    getTopWeekly,
    getTopArena,
    getTopXp,
    getTopGroup,
    getTopPv,
    getTopRpg,
    getTopSkycode,
    getRegisteredCount,
    rowToUser
}
