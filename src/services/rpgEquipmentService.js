/**
 * RPG Equipment & Character Engine (Sandbox / MMORPG 2.0)
 * Gerenciamento de slots, armas, armaduras, poder de combate (CP) e cálculo de dano
 */

const ITEMS_DB = {
    // 🗡️ ARMAS (Mão Principal)
    "espada_madeira": { id: "espada_madeira", nome: "Espada de Madeira", slot: "arma", tipo: "Arma", atk: 15, def: 0, hp: 0, crit: 2, preco: 150, raridade: "⚪ Comum", cp: 25 },
    "espada_ferro": { id: "espada_ferro", nome: "Espada de Ferro Britânico", slot: "arma", tipo: "Arma", atk: 55, def: 5, hp: 20, crit: 5, preco: 600, raridade: "🔵 Raro", cp: 110 },
    "lamina_aco": { id: "lamina_aco", nome: "Lâmina de Aço Real", slot: "arma", tipo: "Arma", atk: 140, def: 15, hp: 50, crit: 10, preco: 2500, raridade: "🟣 Épico", cp: 290 },
    "machado_guerra": { id: "machado_guerra", nome: "Machado de Guerra de Vilarejo", slot: "arma", tipo: "Arma", atk: 280, def: 30, hp: 120, crit: 15, preco: 7500, raridade: "🟣 Épico", cp: 580 },
    "espiritual": { id: "espiritual", nome: "Lança Espiritual Espiritual", slot: "arma", tipo: "Arma", atk: 550, def: 80, hp: 300, crit: 20, preco: 20000, raridade: "🟠 Lendário", cp: 1250 },
    "sombria": { id: "sombria", nome: "Espada Demoníaca Sombria", slot: "arma", tipo: "Arma", atk: 1100, def: 150, hp: 600, crit: 30, preco: 60000, raridade: "👑 Mítico", cp: 2600 },
    "sagrado": { id: "sagrado", nome: "Martelo Sagrado", slot: "arma", tipo: "Arma", atk: 1800, def: 350, hp: 1200, crit: 25, preco: 150000, raridade: "👑 Mítico", cp: 4200 },
    "rhitta": { id: "rhitta", nome: "Machado Divino Rhitta", slot: "arma", tipo: "Arma", atk: 4200, def: 800, hp: 3000, crit: 45, preco: 500000, raridade: "🌟 Divino", cp: 9800 },

    // 👑 CAPACETES (Cabeça)
    "capacete_couro": { id: "capacete_couro", nome: "Capacete de Couro", slot: "capacete", tipo: "Elmo", atk: 0, def: 12, hp: 35, preco: 120, raridade: "⚪ Comum", cp: 25 },
    "capacete_ferro": { id: "capacete_ferro", nome: "Capacete de Ferro Forjado", slot: "capacete", tipo: "Elmo", atk: 5, def: 45, hp: 110, preco: 550, raridade: "🔵 Raro", cp: 100 },
    "elmo_cavaleiro": { id: "elmo_cavaleiro", nome: "Elmo do Cavaleiro Sagrado", slot: "capacete", tipo: "Elmo", atk: 15, def: 110, hp: 320, preco: 2200, raridade: "🟣 Épico", cp: 280 },
    "coroa_trevas": { id: "coroa_trevas", nome: "Coroa do Rei Demônio", slot: "capacete", tipo: "Elmo", atk: 80, def: 320, hp: 900, preco: 45000, raridade: "👑 Mítico", cp: 1250 },
    "elmo_arcanjos": { id: "elmo_arcanjos", nome: "Elmo Sagrado dos Arcanjos", slot: "capacete", tipo: "Elmo", atk: 250, def: 850, hp: 2500, preco: 350000, raridade: "🌟 Divino", cp: 4200 },

    // 🛡️ PEITORAIS (Tronco)
    "peitoral_couro": { id: "peitoral_couro", nome: "Túnica de Couro Reforçado", slot: "peitoral", tipo: "Armadura", atk: 0, def: 18, hp: 60, preco: 180, raridade: "⚪ Comum", cp: 35 },
    "peitoral_ferro": { id: "peitoral_ferro", nome: "Peitoral de Ferro Britânico", slot: "peitoral", tipo: "Armadura", atk: 5, def: 75, hp: 200, preco: 800, raridade: "🔵 Raro", cp: 160 },
    "armadura_dourada": { id: "armadura_dourada", nome: "Armadura do Leão Dourado", slot: "peitoral", tipo: "Armadura", atk: 25, def: 220, hp: 650, preco: 4500, raridade: "🟣 Épico", cp: 490 },
    "cota_purgatorio": { id: "cota_purgatorio", nome: "Cota Dracônica do Purgatório", slot: "peitoral", tipo: "Armadura", atk: 120, def: 600, hp: 1800, preco: 65000, raridade: "👑 Mítico", cp: 2100 },
    "manto_divindade": { id: "manto_divindade", nome: "Manto da Divindade Suprema", slot: "peitoral", tipo: "Armadura", atk: 400, def: 1600, hp: 5000, preco: 450000, raridade: "🌟 Divino", cp: 6800 },

    // 👖 CALÇAS (Pernas)
    "calca_couro": { id: "calca_couro", nome: "Calças de Couro Rústico", slot: "calca", tipo: "Perneira", atk: 0, def: 10, hp: 30, preco: 100, raridade: "⚪ Comum", cp: 20 },
    "perneiras_ferro": { id: "perneiras_ferro", nome: "Perneiras de Ferro Maciço", slot: "calca", tipo: "Perneira", atk: 2, def: 40, hp: 120, preco: 500, raridade: "🔵 Raro", cp: 90 },
    "grevas_prata": { id: "grevas_prata", nome: "Grevas de Prata Britânica", slot: "calca", tipo: "Perneira", atk: 15, def: 130, hp: 380, preco: 2400, raridade: "🟣 Épico", cp: 310 },
    "calcas_purgatorio": { id: "calcas_purgatorio", nome: "Perneiras do Purgatório", slot: "calca", tipo: "Perneira", atk: 70, def: 380, hp: 1100, preco: 42000, raridade: "👑 Mítico", cp: 1400 },
    "grevas_luz": { id: "grevas_luz", nome: "Grevas de Luz Arcangélica", slot: "calca", tipo: "Perneira", atk: 220, def: 950, hp: 3000, preco: 320000, raridade: "🌟 Divino", cp: 4500 },

    // 👢 BOTAS (Pés)
    "botas_couro": { id: "botas_couro", nome: "Botas de Couro Simples", slot: "botas", tipo: "Botas", atk: 0, def: 8, hp: 20, esq: 3, preco: 90, raridade: "⚪ Comum", cp: 15 },
    "botas_ferro": { id: "botas_ferro", nome: "Botas de Ferro Pesadas", slot: "botas", tipo: "Botas", atk: 0, def: 30, hp: 70, esq: 5, preco: 450, raridade: "🔵 Raro", cp: 75 },
    "botas_hermes": { id: "botas_hermes", nome: "Botas Aladas de Hermes", slot: "botas", tipo: "Botas", atk: 10, def: 90, hp: 250, esq: 15, preco: 2800, raridade: "🟣 Épico", cp: 290 },
    "botas_sombras": { id: "botas_sombras", nome: "Passos da Sombra Noturna", slot: "botas", tipo: "Botas", atk: 60, def: 250, hp: 750, esq: 28, preco: 38000, raridade: "👑 Mítico", cp: 1200 },
    "passos_celestiais": { id: "passos_celestiais", nome: "Passos Celestiais da Luz", slot: "botas", tipo: "Botas", atk: 180, def: 650, hp: 2000, esq: 45, preco: 290000, raridade: "🌟 Divino", cp: 3800 },

    // 🛡️ ESCUDOS (Mão Secundária)
    "escudo_madeira": { id: "escudo_madeira", nome: "Escudo de Madeira Reforçado", slot: "escudo", tipo: "Escudo", atk: 0, def: 20, hp: 50, bloq: 8, preco: 140, raridade: "⚪ Comum", cp: 30 },
    "escudo_ferro": { id: "escudo_ferro", nome: "Escudo de Ferro Cruzado", slot: "escudo", tipo: "Escudo", atk: 5, def: 70, hp: 180, bloq: 18, preco: 700, raridade: "🔵 Raro", cp: 150 },
    "escudo_fenix": { id: "escudo_fenix", nome: "Broquel da Fênix Imortal", slot: "escudo", tipo: "Escudo", atk: 30, def: 240, hp: 700, bloq: 32, preco: 5000, raridade: "🟣 Épico", cp: 550 },
    "espelho_divino": { id: "espelho_divino", nome: "Escudo Espelho da Deusa", slot: "escudo", tipo: "Escudo", atk: 150, def: 750, hp: 2200, bloq: 55, preco: 70000, raridade: "👑 Mítico", cp: 2500 },

    // 💍 AMULETOS (Acessório)
    "amuleto_cobre": { id: "amuleto_cobre", nome: "Amuleto de Cobre Antigo", slot: "amuleto", tipo: "Acessório", atk: 8, def: 8, hp: 25, preco: 110, raridade: "⚪ Comum", cp: 20 },
    "anel_safira": { id: "anel_safira", nome: "Anel de Safira Mágica", slot: "amuleto", tipo: "Acessório", atk: 35, def: 35, hp: 120, preco: 650, raridade: "🔵 Raro", cp: 120 },
    "colar_dragao": { id: "colar_dragao", nome: "Colar do Dragão da Ira", slot: "amuleto", tipo: "Acessório", atk: 140, def: 140, hp: 450, preco: 4800, raridade: "🟣 Épico", cp: 480 },
    "anel_eternidade": { id: "anel_eternidade", nome: "Anel da Eternidade Mágica", slot: "amuleto", tipo: "Acessório", atk: 450, def: 450, hp: 1600, preco: 85000, raridade: "👑 Mítico", cp: 2200 },
    "orbe_divina": { id: "orbe_divina", nome: "Orbe Celestial da Criação", slot: "amuleto", tipo: "Acessório", atk: 1200, def: 1200, hp: 4500, preco: 500000, raridade: "🌟 Divino", cp: 7500 },

    // ═══════════════════════════════════════════════════════════════
    // 🟠 LENDÁRIO — preenche a lacuna entre Épico e Mítico.
    // Só a arma (Espiritual) tinha esse tier; agora todos os 7 slots têm.
    // ═══════════════════════════════════════════════════════════════
    "elmo_dragao": { id: "elmo_dragao", nome: "Elmo do Dragão de Vilarejo", slot: "capacete", tipo: "Elmo", atk: 35, def: 190, hp: 550, preco: 12000, raridade: "🟠 Lendário", cp: 600 },
    "peitoral_fenix": { id: "peitoral_fenix", nome: "Peitoral das Cinzas da Fênix", slot: "peitoral", tipo: "Armadura", atk: 60, def: 380, hp: 1100, preco: 18000, raridade: "🟠 Lendário", cp: 1100 },
    "perneiras_tempestade": { id: "perneiras_tempestade", nome: "Perneiras da Tempestade Eterna", slot: "calca", tipo: "Perneira", atk: 40, def: 230, hp: 650, preco: 11000, raridade: "🟠 Lendário", cp: 700 },
    "botas_relampago": { id: "botas_relampago", nome: "Botas do Relâmpago Divino", slot: "botas", tipo: "Botas", atk: 30, def: 160, hp: 460, esq: 21, preco: 10000, raridade: "🟠 Lendário", cp: 620 },
    "escudo_titan": { id: "escudo_titan", nome: "Égide do Titã Ancestral", slot: "escudo", tipo: "Escudo", atk: 70, def: 450, hp: 1300, bloq: 43, preco: 20000, raridade: "🟠 Lendário", cp: 1300 },
    "talisma_pecados": { id: "talisma_pecados", nome: "Talismã dos Sete Traços", slot: "amuleto", tipo: "Acessório", atk: 260, def: 260, hp: 900, preco: 16000, raridade: "🟠 Lendário", cp: 1100 },
    "gelda": { id: "gelda", nome: "Sabre de Sangue Carmesim", slot: "arma", tipo: "Arma", atk: 700, def: 100, hp: 400, crit: 24, preco: 30000, raridade: "🟠 Lendário", cp: 1600 },

    // 🌟 DIVINO que faltava (o escudo parava no Mítico)
    "barreira_perfeita": { id: "barreira_perfeita", nome: "Barreira Perfeita de Mago", slot: "escudo", tipo: "Escudo", atk: 380, def: 1400, hp: 4200, bloq: 70, preco: 400000, raridade: "🌟 Divino", cp: 5500 },

    // ═══════════════════════════════════════════════════════════════
    // 🔥 TRANSCENDENTE — tier de endgame, acima do Divino. Dá objetivo
    // de longo prazo para quem já fechou o equipamento Divino.
    // ═══════════════════════════════════════════════════════════════
    "espada_caos": { id: "espada_caos", nome: "Lâmina Lendária do Camisa 10", slot: "arma", tipo: "Arma", atk: 8500, def: 1800, hp: 6000, crit: 60, preco: 1500000, raridade: "🔥 Transcendente", cp: 20000 },
    "coroa_caos": { id: "coroa_caos", nome: "Diadema do Caos Primordial", slot: "capacete", tipo: "Elmo", atk: 600, def: 1900, hp: 5500, preco: 900000, raridade: "🔥 Transcendente", cp: 9000 },
    "armadura_caos": { id: "armadura_caos", nome: "Égide do Caos Absoluto", slot: "peitoral", tipo: "Armadura", atk: 900, def: 3400, hp: 11000, preco: 1200000, raridade: "🔥 Transcendente", cp: 14000 },
    "grevas_caos": { id: "grevas_caos", nome: "Grevas do Vazio Primordial", slot: "calca", tipo: "Perneira", atk: 500, def: 2100, hp: 6500, preco: 850000, raridade: "🔥 Transcendente", cp: 9500 },
    "passos_caos": { id: "passos_caos", nome: "Passos Além do Tempo", slot: "botas", tipo: "Botas", atk: 400, def: 1500, hp: 4500, esq: 65, preco: 800000, raridade: "🔥 Transcendente", cp: 8200 },
    "escudo_caos": { id: "escudo_caos", nome: "Muralha do Caos Eterno", slot: "escudo", tipo: "Escudo", atk: 800, def: 3000, hp: 9000, bloq: 85, preco: 1100000, raridade: "🔥 Transcendente", cp: 12000 },
    "coracao_caos": { id: "coracao_caos", nome: "Coração do Caos", slot: "amuleto", tipo: "Acessório", atk: 2600, def: 2600, hp: 9500, preco: 1400000, raridade: "🔥 Transcendente", cp: 16000 },

    // ═══════════════════════════════════════════════════════════════
    // Variedade extra nos tiers baixos/médios (builds alternativas):
    // ofensiva (mais atk/crit) x defensiva (mais def/hp) no mesmo preço.
    // ═══════════════════════════════════════════════════════════════
    "adaga_gemea": { id: "adaga_gemea", nome: "Adagas Gêmeas do Ladrão", slot: "arma", tipo: "Arma", atk: 45, def: 0, hp: 0, crit: 14, preco: 580, raridade: "🔵 Raro", cp: 105 },
    "arco_caca": { id: "arco_caca", nome: "Arco Longo do Caçador", slot: "arma", tipo: "Arma", atk: 125, def: 5, hp: 20, crit: 18, preco: 2400, raridade: "🟣 Épico", cp: 280 },
    "cajado_mago": { id: "cajado_mago", nome: "Cajado Arcano de Belialuin", slot: "arma", tipo: "Arma", atk: 260, def: 60, hp: 220, crit: 12, preco: 7200, raridade: "🟣 Épico", cp: 575 },
    "capuz_sombrio": { id: "capuz_sombrio", nome: "Capuz do Assassino Sombrio", slot: "capacete", tipo: "Elmo", atk: 30, def: 70, hp: 180, preco: 2100, raridade: "🟣 Épico", cp: 265 },
    "tiara_feiticeira": { id: "tiara_feiticeira", nome: "Tiara da Feiticeira", slot: "capacete", tipo: "Elmo", atk: 12, def: 40, hp: 130, preco: 540, raridade: "🔵 Raro", cp: 98 },
    "manto_viajante": { id: "manto_viajante", nome: "Manto do Viajante", slot: "peitoral", tipo: "Armadura", atk: 15, def: 60, hp: 240, preco: 780, raridade: "🔵 Raro", cp: 155 },
    "cota_malha": { id: "cota_malha", nome: "Cota de Malha do Vigia", slot: "peitoral", tipo: "Armadura", atk: 0, def: 95, hp: 260, preco: 820, raridade: "🔵 Raro", cp: 165 },
    "calca_couro_cravejado": { id: "calca_couro_cravejado", nome: "Calças Cravejadas de Aço", slot: "calca", tipo: "Perneira", atk: 8, def: 35, hp: 140, preco: 480, raridade: "🔵 Raro", cp: 88 },
    "botas_batedor": { id: "botas_batedor", nome: "Botas Leves do Batedor", slot: "botas", tipo: "Botas", atk: 5, def: 22, hp: 55, esq: 9, preco: 430, raridade: "🔵 Raro", cp: 72 },
    "broquel_aco": { id: "broquel_aco", nome: "Broquel de Aço Temperado", slot: "escudo", tipo: "Escudo", atk: 8, def: 62, hp: 165, bloq: 22, preco: 680, raridade: "🔵 Raro", cp: 148 },
    "pingente_rubi": { id: "pingente_rubi", nome: "Pingente de Rubi Flamejante", slot: "amuleto", tipo: "Acessório", atk: 55, def: 18, hp: 90, preco: 640, raridade: "🔵 Raro", cp: 118 },
    "bracelete_ferro": { id: "bracelete_ferro", nome: "Bracelete de Ferro Rúnico", slot: "amuleto", tipo: "Acessório", atk: 14, def: 14, hp: 40, preco: 130, raridade: "⚪ Comum", cp: 24 },
    "porrete_madeira": { id: "porrete_madeira", nome: "Porrete de Carvalho", slot: "arma", tipo: "Arma", atk: 20, def: 2, hp: 10, crit: 1, preco: 160, raridade: "⚪ Comum", cp: 27 }
};

// ═══════════════════════════════════════════════════════════════
// 🌌 SUBUNIVERSAL e ♾️ UNIVERSAL — tiers acima do Transcendente.
//
// As peças são DERIVADAS das Transcendentes por um fator, não digitadas à
// mão: assim a relação "Subuniversal = Transcendente reforçado" fica explícita
// no código e um zero a mais em 14 entradas manuais não passa despercebido.
//
// Universal ainda carrega `buffs` percentuais, aplicados sobre o total já
// formado (ver characterEngine) — é o "e mais um pouco" do tier.
// ═══════════════════════════════════════════════════════════════
const BASES_TRANSCENDENTES = [
    'espada_caos', 'coroa_caos', 'armadura_caos', 'grevas_caos',
    'passos_caos', 'escudo_caos', 'coracao_caos'
];

const TIERS_SUPERIORES = [
    {
        chave: 'subuniversal',
        raridade: '🌌 Subuniversal',
        preco: 100000000000,          // 100 bilhões por peça
        mult: 4,                      // aumenta TUDO sobre a base transcendente
        critBonus: 40,
        nomes: {
            arma:     'Chuteira de Ouro do Camisa 10',
            capacete: 'Diadema Subuniversal do Cosmos',
            peitoral: 'Égide Subuniversal do Infinito',
            calca:    'Grevas Subuniversais do Vazio',
            botas:    'Passos Subuniversais do Éter',
            escudo:   'Muralha Subuniversal Absoluta',
            amuleto:  'Núcleo Subuniversal do Caos'
        }
    },
    {
        chave: 'universal',
        raridade: '♾️ Universal',
        preco: 1000000000000,         // 1 trilhão por peça
        mult: 12,
        critBonus: 80,
        buffs: { danoPct: 25, defPct: 25, xpPct: 30, critPct: 10 },
        nomes: {
            arma:     'Lâmina Universal do Criador',
            capacete: 'Coroa Universal da Origem',
            peitoral: 'Manto Universal da Existência',
            calca:    'Grevas Universais do Absoluto',
            botas:    'Passos Universais Além do Fim',
            escudo:   'Barreira Universal Inquebrável',
            amuleto:  'Coração Universal de Tudo'
        }
    }
];

for (const tier of TIERS_SUPERIORES) {
    for (const baseId of BASES_TRANSCENDENTES) {
        const base = ITEMS_DB[baseId];
        if (!base) continue;

        const id = `${baseId.replace('_caos', '')}_${tier.chave}`;
        const escala = (v) => (v ? Math.floor(v * tier.mult) : 0);

        const item = {
            id,
            nome: tier.nomes[base.slot] || `${base.nome} ${tier.raridade}`,
            slot: base.slot,
            tipo: base.tipo,
            atk: escala(base.atk),
            def: escala(base.def),
            hp: escala(base.hp),
            preco: tier.preco,
            raridade: tier.raridade,
            cp: escala(base.cp)
        };
        // Stats opcionais só existem em alguns slots (crit/esq/bloq).
        if (base.crit) item.crit = base.crit + tier.critBonus;
        if (base.esq) item.esq = escala(base.esq);
        if (base.bloq) item.bloq = escala(base.bloq);
        if (tier.buffs) item.buffs = { ...tier.buffs };

        ITEMS_DB[id] = item;
    }
}

function getItem(itemIdOrName) {
    if (!itemIdOrName) return null;
    const clean = String(itemIdOrName).toLowerCase().replace(/[\s_-]/g, "");
    for (const key of Object.keys(ITEMS_DB)) {
        const item = ITEMS_DB[key];
        const cleanKey = key.replace(/[\s_-]/g, "");
        const cleanName = item.nome.toLowerCase().replace(/[\s_-]/g, "");
        if (cleanKey === clean || cleanName.includes(clean) || clean.includes(cleanKey)) {
            return item;
        }
    }
    return null;
}

function calculateCharacterStats(user) {
    const { calculateFullCharacterStats } = require('./characterEngine');
    return calculateFullCharacterStats(user);
}


/**
 * Sorteia um equipamento do catálogo como DROP, adequado ao nível do jogador.
 *
 * Antes, os 65 itens do catálogo só eram obtidos comprando na loja — os drops de
 * caçada/boss devolviam apenas nomes soltos (strings), sem ligação com o
 * equipamento real. Isto conecta as duas coisas.
 *
 * A faixa de CP considerada acompanha o nível, e raridades altas são mais raras.
 * @param {number} level
 * @returns {object|null} item do catálogo (cópia) ou null
 */
function sortearEquipamentoDrop(level = 1) {
    const nivel = Math.max(1, Number(level) || 1)
    // Teto de CP que faz sentido para o nível (cresce ~quadraticamente, como o CP dos itens).
    const tetoCp = 60 + Math.pow(nivel, 1.9) * 1.6
    const candidatos = Object.values(ITEMS_DB).filter(i => i.cp <= tetoCp)
    if (!candidatos.length) return null

    // Quanto mais raro, menor o peso — o topo da faixa continua sendo prêmio.
    const PESO = {
        '⚪ Comum': 100, '🔵 Raro': 55, '🟣 Épico': 22,
        '🟠 Lendário': 9, '👑 Mítico': 4, '🌟 Divino': 1.5, '🔥 Transcendente': 0.5,
        // Sem peso próprio estes cairiam no fallback `|| 1` e dropariam DOBRO
        // do Transcendente — o inverso do esperado para o topo do jogo.
        '🌌 Subuniversal': 0.05, '♾️ Universal': 0.005
    }
    const total = candidatos.reduce((acc, i) => acc + (PESO[i.raridade] || 1), 0)
    let sorte = Math.random() * total
    for (const item of candidatos) {
        sorte -= (PESO[item.raridade] || 1)
        if (sorte <= 0) return { ...item }
    }
    return { ...candidatos[candidatos.length - 1] }
}

/**
 * Sorteia equipamento de alto calibre para vitoriosos de Boss Raid Titânico.
 * Raids são o conteúdo supremo em grupo — drops garantidos e com chance de itens
 * Épicos, Lendários, Míticos e Divinos do catálogo!
 */
function sortearEquipamentoRaid(level = 1, rank = 0, bossKey = '') {
    const bKey = String(bossKey || '').toLowerCase();

    // Chances temáticas diretas de itens sagrados/míticos do Boss da Raid para MVP / Top ranks
    if (rank === 0 && Math.random() < 0.35) {
        if (bKey.includes('sombria') && ITEMS_DB['sombria']) return { ...ITEMS_DB['sombria'] };
        if (bKey.includes('reidemonio') && ITEMS_DB['coroa_trevas']) return { ...ITEMS_DB['coroa_trevas'] };
        if (bKey.includes('deusasuprema') && ITEMS_DB['manto_divindade']) return { ...ITEMS_DB['manto_divindade'] };
        if (bKey.includes('ardente') && ITEMS_DB['elmo_arcanjos']) return { ...ITEMS_DB['elmo_arcanjos'] };
    }

    // Nível efetivo elevado para raids (mínimo nível 40)
    const bonusRank = rank === 0 ? 35 : (rank === 1 ? 25 : (rank === 2 ? 18 : 10));
    const nivelEfetivo = Math.max(40, (Number(level) || 1) + bonusRank);

    // Teto de CP ampliado
    const tetoCp = 350 + Math.pow(nivelEfetivo, 1.95) * 1.8;
    // Exclui comuns e foca em Raro ou superior
    const candidatos = Object.values(ITEMS_DB).filter(i => i.cp <= tetoCp && i.raridade !== '⚪ Comum');
    if (!candidatos.length) {
        return { ...ITEMS_DB['lamina_aco'] };
    }

    const PESO_RAID = {
        '🔵 Raro': 20,
        '🟣 Épico': 35,
        '🟠 Lendário': 25,
        '👑 Mítico': 14,
        '🌟 Divino': 5,
        '🔥 Transcendente': 1
    };

    const total = candidatos.reduce((acc, i) => acc + (PESO_RAID[i.raridade] || 5), 0);
    let sorte = Math.random() * total;
    for (const item of candidatos) {
        sorte -= (PESO_RAID[item.raridade] || 5);
        if (sorte <= 0) return { ...item };
    }
    return { ...candidatos[candidatos.length - 1] };
}

module.exports = {
    sortearEquipamentoDrop,
    sortearEquipamentoRaid,
    ITEMS_DB,
    getItem,
    calculateCharacterStats
};

