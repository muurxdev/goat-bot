const logger = require('../core/logger')

const migrations = [
    {
        id: '001_initial_schema',
        description: 'Criação inicial das tabelas do sistema',
        up: (db) => {
            // Tabela de Usuários / Jogadores
            db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    jid TEXT PRIMARY KEY,
                    xp INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    messages INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    rep INTEGER DEFAULT 0,
                    streak INTEGER DEFAULT 0,
                    hp INTEGER DEFAULT 100,
                    hp_max INTEGER DEFAULT 100,
                    mundo TEXT DEFAULT 'floresta',
                    mochila INTEGER DEFAULT 20,
                    classe TEXT,
                    classe_lendaria TEXT,
                    bug_power INTEGER DEFAULT 0,
                    pet TEXT,
                    equipado TEXT,
                    arma TEXT,
                    guilda TEXT,
                    wins INTEGER DEFAULT 0,
                    losses INTEGER DEFAULT 0,
                    bosses_mortos INTEGER DEFAULT 0,
                    arena_pontos INTEGER DEFAULT 0,
                    arena_atual INTEGER DEFAULT 1,
                    last_daily INTEGER DEFAULT 0,
                    weekly_xp INTEGER DEFAULT 0,
                    weekly_coins INTEGER DEFAULT 0,
                    pocao_ativa_tipo TEXT,
                    pocao_ativa_expira INTEGER,
                    inventario TEXT DEFAULT '[]',
                    conquistas TEXT DEFAULT '[]',
                    pets TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Índices para consultas de rankings rápidas
            db.exec(`
                CREATE INDEX IF NOT EXISTS idx_users_xp_level ON users (level DESC, xp DESC);
                CREATE INDEX IF NOT EXISTS idx_users_coins ON users (coins DESC);
                CREATE INDEX IF NOT EXISTS idx_users_weekly_xp ON users (weekly_xp DESC);
                CREATE INDEX IF NOT EXISTS idx_users_arena_pontos ON users (arena_pontos DESC);
            `)

            // Tabela de Guildas
            db.exec(`
                CREATE TABLE IF NOT EXISTS guilds (
                    nome TEXT PRIMARY KEY,
                    dono TEXT NOT NULL,
                    level INTEGER DEFAULT 1,
                    xp INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    membros TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Advertências
            db.exec(`
                CREATE TABLE IF NOT EXISTS warns (
                    jid TEXT PRIMARY KEY,
                    count INTEGER DEFAULT 0,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Configurações de Grupos
            db.exec(`
                CREATE TABLE IF NOT EXISTS configs (
                    group_jid TEXT PRIMARY KEY,
                    antilink INTEGER DEFAULT 0,
                    settings TEXT DEFAULT '{}',
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Missões Diárias
            db.exec(`
                CREATE TABLE IF NOT EXISTS missions (
                    jid TEXT PRIMARY KEY,
                    dia TEXT NOT NULL,
                    tipo TEXT,
                    titulo TEXT,
                    descricao TEXT,
                    meta INTEGER DEFAULT 0,
                    xp INTEGER DEFAULT 0,
                    coins INTEGER DEFAULT 0,
                    progresso INTEGER DEFAULT 0,
                    concluida INTEGER DEFAULT 0,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Lutas de Boss
            db.exec(`
                CREATE TABLE IF NOT EXISTS boss_fights (
                    id TEXT PRIMARY KEY,
                    dono TEXT NOT NULL,
                    boss_id TEXT NOT NULL,
                    nome TEXT NOT NULL,
                    tipo TEXT NOT NULL,
                    raridade TEXT NOT NULL,
                    vida INTEGER NOT NULL,
                    vida_max INTEGER NOT NULL,
                    multiplicador REAL DEFAULT 1.0,
                    efeito TEXT,
                    ativo INTEGER DEFAULT 1,
                    dano_map TEXT DEFAULT '{}',
                    loot_list TEXT DEFAULT '[]',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Equipamentos Craftados
            db.exec(`
                CREATE TABLE IF NOT EXISTS crafts (
                    jid TEXT NOT NULL,
                    item_nome TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (jid, item_nome)
                );
            `)
        }
    },
    {
        id: '002_security_schema',
        description: 'Criação de tabelas de segurança, blacklist e configurações de sistema',
        up: (db) => {
            // Tabela de Blacklist Global (Usuários Banidos)
            db.exec(`
                CREATE TABLE IF NOT EXISTS blacklist (
                    jid TEXT PRIMARY KEY,
                    motivo TEXT,
                    autor TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Configurações Globais do Sistema (ex: maintenanceMode)
            db.exec(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    chave TEXT PRIMARY KEY,
                    valor TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)
        }
    },
    {
        id: '003_owner_security_hierarchy',
        description: 'Criação de tabelas de hierarquia de cargos (roles), restrições de DM, status e lista trust',
        up: (db) => {
            // Tabela de Cargos e Permissões (OWNER, BOT_ADMIN, TRUSTED)
            db.exec(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    jid TEXT PRIMARY KEY,
                    role TEXT NOT NULL,
                    assigned_by TEXT,
                    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Restrições de Interação via DM (.bandm)
            db.exec(`
                CREATE TABLE IF NOT EXISTS dm_restrictions (
                    jid TEXT PRIMARY KEY,
                    blocked INTEGER DEFAULT 1,
                    reason TEXT,
                    blocked_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Restrições de Marcação em Status (.banstatus)
            db.exec(`
                CREATE TABLE IF NOT EXISTS status_restrictions (
                    jid TEXT PRIMARY KEY,
                    blocked INTEGER DEFAULT 1,
                    reason TEXT,
                    blocked_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Usuários Confiáveis (.trust)
            db.exec(`
                CREATE TABLE IF NOT EXISTS trust_list (
                    jid TEXT PRIMARY KEY,
                    added_by TEXT,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)
        }
    },
    {
        id: '004_bot_lifecycle_schedules',
        description: 'Tabelas persistentes de agendamento de ciclo de vida e estado operacional do bot',
        up: (db) => {
            // Tabela de Agendamentos do Ciclo de Vida
            db.exec(`
                CREATE TABLE IF NOT EXISTS bot_schedules (
                    id TEXT PRIMARY KEY,
                    action TEXT NOT NULL,
                    execute_at INTEGER,
                    reopen_at INTEGER,
                    mode TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    created_by TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Tabela de Estado Operacional Atual (ONLINE, OFFLINE, MAINTENANCE, etc)
            db.exec(`
                CREATE TABLE IF NOT EXISTS bot_state (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Inicializa estado padrão ONLINE se não existir
            db.exec(`
                INSERT OR IGNORE INTO bot_state (key, value) VALUES ('operational_state', 'ONLINE');
            `)
        }
    },
    {
        id: '005_rentals_schema',
        description: 'Tabela de gerenciamento de aluguel de grupos com limites de tempo e pagamento',
        up: (db) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS rentals (
                    group_jid TEXT PRIMARY KEY,
                    group_name TEXT,
                    renter_jid TEXT,
                    rented_by TEXT,
                    starts_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    price REAL DEFAULT 0,
                    payment_method TEXT DEFAULT 'Pix',
                    pix_key TEXT,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_rentals_expires ON rentals (expires_at);
                CREATE INDEX IF NOT EXISTS idx_rentals_active ON rentals (is_active);
            `)
        }
    },
    {
        id: '006_user_stats_breakdown',
        description: 'Colunas de estatísticas detalhadas de mensagens, comandos e XP em PV vs Grupo',
        up: (db) => {
            const columnsToAdd = [
                'messages_group INTEGER DEFAULT 0',
                'messages_pv INTEGER DEFAULT 0',
                'commands_group INTEGER DEFAULT 0',
                'commands_pv INTEGER DEFAULT 0',
                'xp_group INTEGER DEFAULT 0',
                'xp_pv INTEGER DEFAULT 0'
            ]
            for (const col of columnsToAdd) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${col};`)
                } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:280: ${errIgnorado.message}`) }
            }
        }
    },
    {
        id: '007_user_real_telemetry_and_profile',
        description: 'Colunas de dados reais persistentes de telemetria, dispositivo, rede, banco e vinculação LID/PN',
        up: (db) => {
            const columns = [
                'bank INTEGER DEFAULT 0',
                'name TEXT',
                'last_device TEXT',
                'last_ping_ms INTEGER DEFAULT 0',
                'net_type TEXT',
                'last_seen INTEGER DEFAULT 0',
                'phone TEXT',
                'lid TEXT'
            ]
            for (const col of columns) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${col};`)
                } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:301: ${errIgnorado.message}`) }
            }
            try {
                db.exec(`CREATE INDEX IF NOT EXISTS idx_users_bank ON users (bank DESC);`)
                db.exec(`CREATE INDEX IF NOT EXISTS idx_users_lid ON users (lid);`)
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:306: ${errIgnorado.message}`) }
        }
    },
    {
        id: '008_user_profile_name',
        description: 'Coluna para armazenar o nome de perfil/pushName real do usuário',
        up: (db) => {
            try {
                db.exec(`ALTER TABLE users ADD COLUMN name TEXT;`)
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:315: ${errIgnorado.message}`) }
        }
    },
    {
        id: '009_rpg_slots_and_forge_persistence',
        description: 'Colunas de slots de equipamento, nível de forja e atributos persistentes de RPG',
        up: (db) => {
            const columns = [
                'slots TEXT DEFAULT \'{"capacete":null,"peitoral":null,"calca":null,"botas":null,"arma":null,"escudo":null,"amuleto":null}\'',
                'forge_level INTEGER DEFAULT 0',
                'nickname_rpg TEXT',
                'atk INTEGER DEFAULT 10',
                'def INTEGER DEFAULT 5'
            ]
            for (const col of columns) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${col};`)
                } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:332: ${errIgnorado.message}`) }
            }
        }
    },
    {
        id: '010_advanced_economy_and_achievements',
        description: 'Tabelas de histórico de transações financeiras, telemetria de comandos, títulos e conquistas RPG',
        up: (db) => {
            // Histórico de transações financeiras
            db.exec(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    user_jid TEXT NOT NULL,
                    target_jid TEXT,
                    type TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    balance_after INTEGER,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_trans_user ON transactions (user_jid, created_at DESC);
            `)

            // Telemetria de Comandos
            db.exec(`
                CREATE TABLE IF NOT EXISTS command_analytics (
                    command_name TEXT PRIMARY KEY,
                    category TEXT,
                    execution_count INTEGER DEFAULT 0,
                    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `)

            // Catálogo de Títulos RPG
            db.exec(`
                CREATE TABLE IF NOT EXISTS titles (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    rarity TEXT NOT NULL,
                    bonus_atk INTEGER DEFAULT 0,
                    bonus_def INTEGER DEFAULT 0,
                    bonus_cp INTEGER DEFAULT 0,
                    requirement TEXT
                );
            `)

            // Títulos desbloqueados por usuários
            db.exec(`
                CREATE TABLE IF NOT EXISTS user_titles (
                    user_jid TEXT NOT NULL,
                    title_id TEXT NOT NULL,
                    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_jid, title_id)
                );
                CREATE INDEX IF NOT EXISTS idx_user_titles ON user_titles (user_jid);
            `)
        }
    },
    {
        id: '011_rpg_master_overhaul_vault_and_stats',
        description: 'Tabela de Baú persistente (vault_items) e colunas de rebirth, runas, grimório e farm PV vs Grupo',
        up: (db) => {
            // Tabela de Baú de Retaguarda
            db.exec(`
                CREATE TABLE IF NOT EXISTS vault_items (
                    id TEXT PRIMARY KEY,
                    user_jid TEXT NOT NULL,
                    item_id TEXT NOT NULL,
                    item_name TEXT NOT NULL,
                    quantity INTEGER DEFAULT 1,
                    item_type TEXT DEFAULT 'equipment',
                    metadata TEXT DEFAULT '{}',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_vault_user ON vault_items (user_jid);
            `);

            const cols = [
                'vault_coins INTEGER DEFAULT 0',
                'rebirth_count INTEGER DEFAULT 0',
                'grimoire_spells TEXT DEFAULT \'[]\'',
                'active_runes TEXT DEFAULT \'[]\'',
                'character_race TEXT DEFAULT \'humano\'',
                'character_element TEXT DEFAULT \'fogo\'',
                'fogueira_buff_expira INTEGER DEFAULT 0',
                'pv_farm_count INTEGER DEFAULT 0',
                'group_farm_count INTEGER DEFAULT 0',
                'coins_pv INTEGER DEFAULT 0',
                'coins_group INTEGER DEFAULT 0'
            ];
            for (const c of cols) {
                try {
                    db.exec(`ALTER TABLE users ADD COLUMN ${c};`);
                } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:426: ${errIgnorado.message}`) }
            }
        }
    },
    {
        id: '012_repair_created_at_and_indexes',
        description: 'Repara created_at destruído pelo antigo INSERT OR REPLACE, adiciona índices reais e purga schedules cancelados',
        up: (db) => {
            // created_at foi reescrito com CURRENT_TIMESTAMP a cada save no modelo
            // antigo. A data exata é irrecuperável; a melhor aproximação é o menor
            // timestamp conhecido da linha (created_at nunca deve ser > updated_at).
            try {
                db.exec(`
                    UPDATE users
                    SET created_at = updated_at
                    WHERE updated_at IS NOT NULL AND created_at > updated_at;
                `);
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:443: ${errIgnorado.message}`) }

            // Índices para consultas que hoje fazem full scan.
            db.exec(`CREATE INDEX IF NOT EXISTS idx_schedules_status ON bot_schedules (status, execute_at);`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_analytics_category ON command_analytics (category);`);

            // bot_schedules acumulava sem retenção (todas as linhas CANCELLED).
            try {
                db.exec(`DELETE FROM bot_schedules WHERE status = 'CANCELLED';`);
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:452: ${errIgnorado.message}`) }
        }
    },
    {
        id: '013_user_identities',
        description: 'Tabela de reconciliação de identidade LID↔JID↔telefone (fundação para merge futuro)',
        up: (db) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS user_identities (
                    jid TEXT PRIMARY KEY,
                    lid TEXT,
                    phone_digits TEXT,
                    linked_jid TEXT,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_identities_lid ON user_identities (lid);
                CREATE INDEX IF NOT EXISTS idx_identities_phone ON user_identities (phone_digits);
                CREATE INDEX IF NOT EXISTS idx_identities_linked ON user_identities (linked_jid);
            `);
        }
    },
    {
        id: '014_user_login_profile',
        description: 'Perfil de login: registro, nick de exibição, opt-in de RPG e categoria de foco',
        up: (db) => {
            const cols = [
                'registered INTEGER DEFAULT 0',
                'display_nick TEXT',
                'rpg_enabled INTEGER DEFAULT 1',
                'foco_categoria TEXT',
                'registered_at DATETIME'
            ]
            for (const c of cols) {
                try { db.exec(`ALTER TABLE users ADD COLUMN ${c};`) } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:485: ${errIgnorado.message}`) }
            }
            // Grandfathering: usuários que já têm atividade entram como registrados
            // (não são obrigados a re-logar), herdando o nome como nick.
            try {
                db.exec(`
                    UPDATE users
                    SET registered = 1,
                        display_nick = COALESCE(display_nick, name),
                        registered_at = COALESCE(registered_at, created_at)
                    WHERE (messages > 0 OR level > 1 OR xp > 0 OR coins > 0)
                `)
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:497: ${errIgnorado.message}`) }
        }
    },
    {
        id: '016_user_extra',
        description: 'Coluna extra (JSON): guarda campos sem coluna própria. Sem isto, 37 campos gravados pelos comandos (cooldowns, banco, cofre, badges, títulos, montaria...) eram descartados silenciosamente no saveUser.',
        up: (db) => {
            try { db.exec('ALTER TABLE users ADD COLUMN extra TEXT;') } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:504: ${errIgnorado.message}`) }
        }
    },
    {
        id: '015_user_skills',
        description: 'Coluna skills (árvore de habilidades). Sem ela o .arvorehabilidades dizia "SKILL DESBLOQUEADA" e o valor era descartado no saveUser.',
        up: (db) => {
            try { db.exec('ALTER TABLE users ADD COLUMN skills TEXT;') } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:511: ${errIgnorado.message}`) }
        }
    },
    {
        id: '017_rentals_scope_and_trials',
        description: 'Divisão de aluguel por escopo (grupo, pv, combo), flag de vitalício e controle de teste único (trial)',
        up: (db) => {
            try { db.exec("ALTER TABLE rentals ADD COLUMN target_type TEXT DEFAULT 'group';") } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:518: ${errIgnorado.message}`) }
            try { db.exec('ALTER TABLE rentals ADD COLUMN is_trial INTEGER DEFAULT 0;') } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:519: ${errIgnorado.message}`) }
            try { db.exec('ALTER TABLE rentals ADD COLUMN is_lifetime INTEGER DEFAULT 0;') } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:520: ${errIgnorado.message}`) }
            try { db.exec('CREATE INDEX IF NOT EXISTS idx_rentals_target_type ON rentals (target_type);') } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:521: ${errIgnorado.message}`) }

            db.exec(`
                CREATE TABLE IF NOT EXISTS rental_trials (
                    target_jid TEXT PRIMARY KEY,
                    target_type TEXT NOT NULL,
                    used_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_rental_trials_type ON rental_trials (target_type);
            `);
        }
    },
    {
        id: '018_virtual_numbers',
        description: 'Tabela de números virtuais descartáveis para ativação de SMS no WhatsApp com DDD inteligente',
        up: (db) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS virtual_numbers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_jid TEXT NOT NULL,
                    activation_id TEXT NOT NULL,
                    phone_number TEXT NOT NULL,
                    ddd TEXT NOT NULL,
                    country_code TEXT NOT NULL,
                    region_name TEXT NOT NULL,
                    service TEXT DEFAULT 'wa',
                    cost_credits INTEGER DEFAULT 0,
                    is_owner INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'PENDING',
                    sms_code TEXT,
                    created_at INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_virtual_numbers_user ON virtual_numbers (user_jid, status);
                CREATE INDEX IF NOT EXISTS idx_virtual_numbers_act ON virtual_numbers (activation_id);
            `);
        }
    },
    {
        id: '019_split_levels_and_cleanup_unregistered',
        description: 'Separação de níveis por escopo (level_group, level_pv, level_rpg), índices de ranking e saneamento de registros não criados via .login',
        up: (db) => {
            const cols = [
                'level_group INTEGER DEFAULT 1',
                'level_pv INTEGER DEFAULT 1',
                'level_rpg INTEGER DEFAULT 1',
                'xp_rpg INTEGER DEFAULT 0'
            ];
            for (const c of cols) {
                try { db.exec(`ALTER TABLE users ADD COLUMN ${c};`); } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:570: ${errIgnorado.message}`) }
            }

            // Cria índices para os rankings divididos e velozes
            try {
                db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_users_reg_group ON users (registered, level_group DESC, xp_group DESC);
                    CREATE INDEX IF NOT EXISTS idx_users_reg_pv ON users (registered, level_pv DESC, xp_pv DESC);
                    CREATE INDEX IF NOT EXISTS idx_users_reg_rpg ON users (registered, level_rpg DESC, xp_rpg DESC);
                `);
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:580: ${errIgnorado.message}`) }

            // SANEAMENTO ESTRITO:
            // Remove a marcação de 'registered' de usuários que não criaram conta com .login (sem display_nick)
            try {
                db.exec(`
                    UPDATE users
                    SET registered = 0
                    WHERE display_nick IS NULL OR trim(display_nick) = '';
                `);
            } catch (errIgnorado) { logger.warn(`[MIGRATOR] Falha ignorada em src/database/migrator.js:590: ${errIgnorado.message}`) }

            // BACKFILL: calcula level_group, level_pv e level_rpg para usuários com XP acumulado
            try {
                const rows = db.prepare('SELECT jid, xp, level, xp_group, xp_pv, xp_rpg FROM users').all();
                const calcLevel = (totalXp) => {
                    let xpRest = Math.max(0, Math.floor(Number(totalXp) || 0));
                    let lvl = 1;
                    let req = Math.floor(100 * Math.pow(lvl, 1.5));
                    while (xpRest >= req && lvl < 5000) {
                        xpRest -= req;
                        lvl++;
                        req = Math.floor(100 * Math.pow(lvl, 1.5));
                    }
                    return lvl;
                };

                const updateStmt = db.prepare(`
                    UPDATE users
                    SET level_group = ?,
                        level_pv = ?,
                        level_rpg = ?,
                        xp_rpg = ?
                    WHERE jid = ?
                `);

                for (const r of rows) {
                    const lGroup = calcLevel(r.xp_group || 0);
                    const lPv = calcLevel(r.xp_pv || 0);
                    const curXpRpg = (r.xp_rpg && r.xp_rpg > 0) ? r.xp_rpg : (r.xp || 0);
                    const lRpg = Math.max(r.level || 1, calcLevel(curXpRpg));
                    updateStmt.run(lGroup, lPv, lRpg, curXpRpg, r.jid);
                }
            } catch (err) {
                logger.warn('[MIGRATION 019] Aviso no backfill de níveis:', err.message);
            }
        }

    },
    {
        id: '020_profile_scoped_data',
        description: 'Tabela de dados isolados por PERFIL de atuação (rpg, divulgacao, skycode, completo) sem fragmentar a identidade do jogador',
        up: (db) => {
            // Isolamento por perfil vive AQUI, não em bancos separados: `users`
            // (level, xp, coins, forja, pet) continua único, então um jogador
            // tem uma progressão só, um ranking só e um backup só. O que varia
            // por perfil fica nesta tabela, chaveada por (perfil, ambiente).
            db.exec(`
                CREATE TABLE IF NOT EXISTS profile_data (
                    profile    TEXT NOT NULL,
                    scope      TEXT NOT NULL,
                    chave      TEXT NOT NULL,
                    valor      TEXT,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (profile, scope, chave)
                );
            `);
            db.exec(`
                CREATE INDEX IF NOT EXISTS idx_profile_data_lookup
                ON profile_data (profile, scope);
            `);
        }
    },
    {
        id: '021_command_analytics_failures',
        description: 'Falhas persistidas por comando (error_count, last_error, last_error_at) para o .falhas — antes só existiam em memória e zeravam no restart',
        up: (db) => {
            // Confere antes de alterar: ALTER em coluna existente lança, e
            // engolir esse erro esconderia qualquer outra falha real do ALTER.
            const existentes = new Set(
                db.prepare('PRAGMA table_info(command_analytics)').all().map(c => c.name)
            );
            const colunas = [
                ['error_count', 'INTEGER DEFAULT 0'],
                ['last_error', 'TEXT'],
                // epoch em ms (Date.now()), como virtual_numbers.created_at
                ['last_error_at', 'INTEGER']
            ];
            for (const [nome, tipo] of colunas) {
                if (!existentes.has(nome)) {
                    db.exec(`ALTER TABLE command_analytics ADD COLUMN ${nome} ${tipo};`);
                }
            }
            db.exec('CREATE INDEX IF NOT EXISTS idx_analytics_errors ON command_analytics (error_count DESC, last_error_at DESC);');
        }
    },
    {
        id: '022_persistent_timers_and_rental_warnings',
        description: 'Tabela persistente de timers, alarmes e lembretes com recuperação pós-restart, e colunas de aviso de aluguel (24h/1h)',
        up: (db) => {
            // Tabela de timers e lembretes persistentes
            db.exec(`
                CREATE TABLE IF NOT EXISTS persistent_timers (
                    id TEXT PRIMARY KEY,
                    scope_jid TEXT NOT NULL,
                    sender_jid TEXT NOT NULL,
                    type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    trigger_at INTEGER NOT NULL,
                    created_at INTEGER NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING',
                    metadata TEXT DEFAULT '{}'
                );
                CREATE INDEX IF NOT EXISTS idx_persistent_timers_status ON persistent_timers (status, trigger_at);
                CREATE INDEX IF NOT EXISTS idx_persistent_timers_scope ON persistent_timers (scope_jid);
            `);

            // Colunas de avisos prévios de expiração na tabela rentals
            const rentalCols = new Set(
                db.prepare('PRAGMA table_info(rentals)').all().map(c => c.name)
            );
            if (!rentalCols.has('warned_24h')) {
                db.exec('ALTER TABLE rentals ADD COLUMN warned_24h INTEGER DEFAULT 0;');
            }
            if (!rentalCols.has('warned_1h')) {
                db.exec('ALTER TABLE rentals ADD COLUMN warned_1h INTEGER DEFAULT 0;');
            }
        }
    },
    {
        id: '023_economy_expanded_systems',
        description: 'Tabelas persistentes da Fase 2 de Economia: Bolsa de Ações, Empresas, Imóveis, Banco/CDB/Score e Jogos Ativos',
        up: (db) => {
            db.exec(`
                -- Carteira de Ações
                CREATE TABLE IF NOT EXISTS stocks_portfolio (
                    jid TEXT NOT NULL,
                    ticker TEXT NOT NULL,
                    shares INTEGER NOT NULL DEFAULT 0,
                    avg_price REAL NOT NULL DEFAULT 0,
                    updated_at INTEGER NOT NULL,
                    PRIMARY KEY (jid, ticker)
                );
                CREATE INDEX IF NOT EXISTS idx_stocks_portfolio_jid ON stocks_portfolio (jid);

                -- Histórico de Ordens da Bolsa
                CREATE TABLE IF NOT EXISTS stocks_history (
                    id TEXT PRIMARY KEY,
                    jid TEXT NOT NULL,
                    ticker TEXT NOT NULL,
                    type TEXT NOT NULL,
                    shares INTEGER NOT NULL,
                    price REAL NOT NULL,
                    total INTEGER NOT NULL,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_stocks_history_jid ON stocks_history (jid, created_at DESC);

                -- Empresas e Corporações (Magnata)
                CREATE TABLE IF NOT EXISTS companies (
                    id TEXT PRIMARY KEY,
                    owner_jid TEXT NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    level INTEGER DEFAULT 1,
                    employees INTEGER DEFAULT 1,
                    marketing INTEGER DEFAULT 1,
                    vault INTEGER DEFAULT 0,
                    last_collection INTEGER DEFAULT 0,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies (owner_jid);

                -- Propriedades e Imóveis
                CREATE TABLE IF NOT EXISTS properties (
                    id TEXT PRIMARY KEY,
                    owner_jid TEXT NOT NULL,
                    property_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    purchase_price INTEGER NOT NULL,
                    rent_value INTEGER NOT NULL,
                    condition INTEGER DEFAULT 100,
                    last_rent_collected INTEGER DEFAULT 0,
                    insured INTEGER DEFAULT 0,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties (owner_jid);

                -- Contas Bancárias Avançadas, Poupança e Crédito
                CREATE TABLE IF NOT EXISTS bank_accounts (
                    jid TEXT PRIMARY KEY,
                    savings_balance INTEGER DEFAULT 0,
                    last_savings_interest INTEGER DEFAULT 0,
                    credit_score INTEGER DEFAULT 500,
                    credit_limit INTEGER DEFAULT 1000,
                    credit_used INTEGER DEFAULT 0,
                    loan_amount INTEGER DEFAULT 0,
                    loan_due INTEGER DEFAULT 0,
                    loan_installments INTEGER DEFAULT 0,
                    updated_at INTEGER NOT NULL
                );

                -- Investimentos Bancários em Renda Fixa (CDBs)
                CREATE TABLE IF NOT EXISTS bank_investments (
                    id TEXT PRIMARY KEY,
                    jid TEXT NOT NULL,
                    type TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    yield_rate REAL NOT NULL,
                    matures_at INTEGER NOT NULL,
                    created_at INTEGER NOT NULL,
                    claimed INTEGER DEFAULT 0
                );
                CREATE INDEX IF NOT EXISTS idx_bank_investments_jid ON bank_investments (jid, claimed);

                -- Sessões de Jogos Ativos (Blackjack, Roleta com turnos, etc.)
                CREATE TABLE IF NOT EXISTS active_games (
                    id TEXT PRIMARY KEY,
                    jid TEXT NOT NULL,
                    game_type TEXT NOT NULL,
                    state TEXT NOT NULL,
                    bet INTEGER NOT NULL,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_active_games_user ON active_games (jid, game_type);
            `);
        }
    },
    {
        id: '024_rpg_expanded_systems',
        description: 'Tabelas da Fase 3 de RPG: Territórios de Clãs, Árvores de Talentos, Alquimia/Forja, Raids Comunitárias e Montarias',
        up: (db) => {
            db.exec(`
                -- Territórios e Guerras de Clãs
                CREATE TABLE IF NOT EXISTS clan_territories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    clan_name TEXT,
                    bonus_xp REAL DEFAULT 0.10,
                    bonus_coins REAL DEFAULT 0.10,
                    defense_power INTEGER DEFAULT 1000,
                    captured_at INTEGER
                );
                CREATE INDEX IF NOT EXISTS idx_clan_territories_clan ON clan_territories (clan_name);

                -- Árvores de Habilidades e Talentos dos Jogadores
                CREATE TABLE IF NOT EXISTS user_talents (
                    jid TEXT PRIMARY KEY,
                    talent_points INTEGER DEFAULT 0,
                    tree_type TEXT DEFAULT 'guerreiro',
                    skills_allocated TEXT DEFAULT '{}',
                    resets_used INTEGER DEFAULT 0,
                    updated_at INTEGER
                );

                -- Receitas de Forja, Alquimia e Encantamentos
                CREATE TABLE IF NOT EXISTS alchemy_recipes (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    level_required INTEGER DEFAULT 1,
                    materials_needed TEXT NOT NULL,
                    result_item TEXT NOT NULL,
                    effect_description TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_alchemy_recipes_cat ON alchemy_recipes (category, level_required);

                -- Raids Comunitárias em Grupo com Fases
                CREATE TABLE IF NOT EXISTS group_raids (
                    id TEXT PRIMARY KEY,
                    group_jid TEXT NOT NULL,
                    boss_id TEXT NOT NULL,
                    boss_name TEXT NOT NULL,
                    phase INTEGER DEFAULT 1,
                    hp_current INTEGER NOT NULL,
                    hp_max INTEGER NOT NULL,
                    participants TEXT DEFAULT '[]',
                    status TEXT DEFAULT 'ACTIVE',
                    expires_at INTEGER NOT NULL,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_group_raids_group ON group_raids (group_jid, status);

                -- Montarias e Mascotes de Combate
                CREATE TABLE IF NOT EXISTS user_mounts (
                    id TEXT PRIMARY KEY,
                    owner_jid TEXT NOT NULL,
                    mount_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    level INTEGER DEFAULT 1,
                    stamina INTEGER DEFAULT 100,
                    speed_bonus REAL DEFAULT 0.15,
                    equipped INTEGER DEFAULT 0,
                    created_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_user_mounts_owner ON user_mounts (owner_jid, equipped);
            `);
        }
    },
    {
        id: '025_trivia_and_fun_systems',
        description: 'Tabelas para estatísticas de trivias, quizzes e histórico de minigames',
        up: (db) => {
            db.exec(`
                -- Estatísticas de Trivias & Quizzes
                CREATE TABLE IF NOT EXISTS user_trivia_stats (
                    user_jid TEXT PRIMARY KEY,
                    total_played INTEGER DEFAULT 0,
                    total_correct INTEGER DEFAULT 0,
                    streak INTEGER DEFAULT 0,
                    max_streak INTEGER DEFAULT 0,
                    total_coins_won INTEGER DEFAULT 0,
                    total_xp_won INTEGER DEFAULT 0,
                    last_played_at INTEGER DEFAULT 0,
                    category_stats TEXT DEFAULT '{}'
                );
                CREATE INDEX IF NOT EXISTS idx_user_trivia_stats_correct ON user_trivia_stats (total_correct DESC);

                -- Estatísticas de Minigames por Modalidade
                CREATE TABLE IF NOT EXISTS user_game_stats (
                    id TEXT PRIMARY KEY,
                    user_jid TEXT NOT NULL,
                    game_type TEXT NOT NULL,
                    wins INTEGER DEFAULT 0,
                    losses INTEGER DEFAULT 0,
                    draws INTEGER DEFAULT 0,
                    high_score INTEGER DEFAULT 0,
                    updated_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_user_game_stats_user ON user_game_stats (user_jid, game_type);
                CREATE INDEX IF NOT EXISTS idx_user_game_stats_leaderboard ON user_game_stats (game_type, wins DESC, high_score DESC);
            `);
        }
    },
    {
        id: '026_ai_learning_and_moderation',
        description: 'Tabelas para perfis linguisticos de usuarios, vocabulario aprendido e strikes de moderacao',
        up: (db) => {
            db.exec(`
                -- Perfis Linguísticos de Usuários (Machine Learning)
                CREATE TABLE IF NOT EXISTS user_linguistic_profiles (
                    user_jid TEXT PRIMARY KEY,
                    slang_count INTEGER DEFAULT 0,
                    code_count INTEGER DEFAULT 0,
                    profanity_count INTEGER DEFAULT 0,
                    messages_count INTEGER DEFAULT 0,
                    style TEXT DEFAULT 'misto',
                    top_words TEXT DEFAULT '{}',
                    updated_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_user_ling_style ON user_linguistic_profiles (style);

                -- Vocabulário & Padrões Aprendidos (Knowledge Base)
                CREATE TABLE IF NOT EXISTS learned_vocabulary (
                    word TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    frequency INTEGER DEFAULT 1,
                    confidence REAL DEFAULT 0.5,
                    is_banned INTEGER DEFAULT 0,
                    updated_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_learned_vocab_cat ON learned_vocabulary (category, is_banned);

                -- Registro de Strikes de Moderação (3 Strikes = Ban)
                CREATE TABLE IF NOT EXISTS moderation_strikes (
                    id TEXT PRIMARY KEY,
                    group_jid TEXT NOT NULL,
                    user_jid TEXT NOT NULL,
                    strike_type TEXT NOT NULL,
                    strikes INTEGER DEFAULT 0,
                    updated_at INTEGER NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_mod_strikes_lookup ON moderation_strikes (group_jid, user_jid, strike_type);
            `);
        }
    }
]

function runMigrations(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `)

    const appliedRows = db.prepare('SELECT id FROM schema_migrations').all()
    const appliedIds = new Set(appliedRows.map(r => r.id))

    for (const migration of migrations) {
        if (!appliedIds.has(migration.id)) {
            logger.info(`🔄 Executando migration: ${migration.id} — ${migration.description}...`)
            try {
                migration.up(db)
                db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(migration.id)
                logger.info(`✅ Migration aplicada com sucesso: ${migration.id}`)
            } catch (err) {
                logger.error(`❌ Falha ao aplicar migration ${migration.id}:`, err)
                throw err
            }
        }
    }
}

module.exports = {
    runMigrations,
    migrations
}
