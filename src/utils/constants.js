// ═══════════════════════════════════════
// 🧪 POÇÕES
// ═══════════════════════════════════════
const pocoes = {
    forca: {
        nome: '🧪 Poção de Força',
        descricao: 'Aumenta o dano causado.',
        duracao: 30 * 60 * 1000,
        dano: 0.25,
        xp: 0,
        coins: 0
    },
    experiencia: {
        nome: '🧪 Poção de Experiência',
        descricao: 'Aumenta o XP recebido.',
        duracao: 30 * 60 * 1000,
        dano: 0,
        xp: 0.50,
        coins: 0
    },
    fortuna: {
        nome: '🧪 Poção da Fortuna',
        descricao: 'Aumenta as recompensas em moedas.',
        duracao: 30 * 60 * 1000,
        dano: 0,
        xp: 0,
        coins: 0.50
    },
    lendaria: {
        nome: '🧪 Poção Lendária',
        descricao: 'Aumenta dano, XP e moedas.',
        duracao: 30 * 60 * 1000,
        dano: 0.50,
        xp: 0.50,
        coins: 0.50
    }
}

const receitasPocao = {
    forca: {
        '🟣 Cristal de Bug': 2,
        '🟢 Chip Comum': 2
    },
    experiencia: {
        '🟣 Cristal de Bug': 1,
        '📡 Sinal Perdido': 2
    },
    fortuna: {
        '💎 Núcleo Instável': 1,
        '🟣 Cristal de Bug': 2
    },
    lendaria: {
        '💎 Núcleo Instável': 2,
        '🌟 Chama do Purgatório': 1,
        '💎 Núcleo do Servidor': 1
    }
}

// ═══════════════════════════════════════
// 🏟️ ARENAS & CARTAS
// ═══════════════════════════════════════
const arenas = {
    1: { nome: '🏟️ Arena 1 — Campo dos Goblins', pontos: 0 },
    2: { nome: '🏟️ Arena 2 — Floresta dos Scripts', pontos: 100 },
    3: { nome: '🏟️ Arena 3 — Vale dos Algoritmos', pontos: 250 },
    4: { nome: '🏟️ Arena 4 — Torre de Cidade Dourada', pontos: 500 },
    5: { nome: '🏟️ Arena 5 — Reino do CSS', pontos: 800 },
    6: { nome: '🏟️ Arena 6 — Cidade JavaScript', pontos: 1200 },
    7: { nome: '🏟️ Arena 7 — Servidor Perdido', pontos: 1700 },
    8: { nome: '🏟️ Arena 8 — Fortaleza Firewall', pontos: 2300 },
    9: { nome: '🏟️ Arena 9 — Centro de Dados', pontos: 3000 },
    10: { nome: '🏟️ Arena 10 — Cidade Cyber', pontos: 3800 },
    11: { nome: '🏟️ Arena 11 — Domínio Hacker', pontos: 4700 },
    12: { nome: '🏟️ Arena 12 — Laboratório de IA', pontos: 5700 },
    13: { nome: '🏟️ Arena 13 — Nexus Neural', pontos: 6800 },
    14: { nome: '🏟️ Arena 14 — Reino Ancestral', pontos: 8000 },
    15: { nome: '🏟️ Arena 15 — Fortaleza Dracônica', pontos: 9300 },
    16: { nome: '🏟️ Arena 16 — Portal Dimensional', pontos: 10700 },
    17: { nome: '🏟️ Arena 17 — Void Digital', pontos: 12200 },
    18: { nome: '🏟️ Arena 18 — Trono do Void', pontos: 13800 },
    19: { nome: '🏟️ Arena 19 — Abismo Infinito', pontos: 15500 },
    20: { nome: '🏟️ Arena 20 — Trono das Deusas', pontos: 17500 }
}

const cartasArena = {
    1: ['🐛 Bug Aprendiz', '🪲 Besouro Binário', '🌿 Slime de Código'],
    2: ['🌲 Script Selvagem', '🦟 Mosquito do Código', '🍃 Guardião da Floresta'],
    3: ['📜 Algoritmo Vivo', '🔢 Golem Matemático', '🧠 Lógica Perdida'],
    4: ['🌐 Cavaleiro HTML', '🏷️ Tag Fantasma', '📄 Documento Vivo'],
    5: ['🎨 Mago CSS', '🧱 Box Model', '📐 Grid Sombrio'],
    6: ['⚡ Guerreiro JavaScript', '🌀 Callback Perdido', '🔥 Promise Flamejante'],
    7: ['🔥 Erro 500', '💾 Cache Corrompido', '📡 Ping Fantasma'],
    8: ['🛡️ Firewall Vivo', '🧯 Defensor de Rede', '🔐 Guardião Criptografado'],
    9: ['💾 Banco de Dados', '🗄️ SQL Sombrio', '📊 Query Fantasma'],
    10: ['🕷️ Spyware Selvagem', '🔓 Botnet Perdida', '👁️ Scanner Sombrio'],
    11: ['🕶️ Hacker Fantasma', '💀 Exploit Perdido', '🔑 Invasor Root'],
    12: ['🤖 Robô Neural', '🧠 IA Instável', '⚙️ Máquina Pensante'],
    13: ['🧬 Vírus Neural', '🌌 Núcleo Neural', '🔮 Entidade Mental'],
    14: ['🐉 Lagarto Binário', '👁️ Guardião Ancestral', '🗿 Golem de Script'],
    15: ['🐉 Dragão Menor', '⚔️ Cavaleiro Algoritmo', '🛡️ Sentinela Dracônica'],
    16: ['🌌 Viajante Dimensional', '🌀 Portal Vivo', '⚫ Sombra Cósmica'],
    17: ['👁️ Observador do Void', '🕳️ Devorador de Dados', '☠️ Fantasma do Sistema'],
    18: ['🌑 Rei Sombrio', '⚫ Guardião do Vazio', '🌌 Titã Fragmentado'],
    19: ['🕳️ Monstro Abissal', '💀 Código Profundo', '🧠 Entidade Perdida'],
    20: ['👑 Dev Supremo', '⚡ Deus do Código', '🌟 Guardião do Olimpo']
}

// ═══════════════════════════════════════
// 👹 BOSSES
// ═══════════════════════════════════════
const bosses = {
    bug: {
        nome: '🐛 Bug Gigante',
        tipo: 'Bug',
        vidaBase: 5000,
        efeito: 'normal',
        loot: [
            { nome: '🟢 Chip Comum', chance: 40 },
            { nome: '🟣 Cristal de Bug', chance: 15 },
            { nome: '💎 Núcleo Instável', chance: 5 }
        ]
    },
    erro500: {
        nome: '🔥 Erro 500 Infernal',
        tipo: 'Servidor',
        vidaBase: 7000,
        efeito: 'queimadura',
        loot: [
            { nome: '🔥 Fragmento Infernal', chance: 30 },
            { nome: '💎 Núcleo do Servidor', chance: 15 },
            { nome: '🌟 Chama do Purgatório', chance: 5 }
        ]
    },
    malware: {
        nome: '🕷️ Malware Sombrio',
        tipo: 'Hacker',
        vidaBase: 8000,
        efeito: 'roubo',
        loot: [
            { nome: '🕷️ Código Infectado', chance: 30 },
            { nome: '🔓 Chave Root', chance: 12 },
            { nome: '💀 Exploit Perdido', chance: 4 }
        ]
    },
    ia: {
        nome: '🤖 IA Corrompida',
        tipo: 'Inteligência Artificial',
        vidaBase: 10000,
        efeito: 'duplicar',
        loot: [
            { nome: '🤖 Processador Neural', chance: 25 },
            { nome: '🧠 Memória Quântica', chance: 10 },
            { nome: '🌌 Núcleo de IA Corrompida', chance: 3 }
        ]
    },
    dragao: {
        nome: '🐉 Dragão do Código Antigo',
        tipo: 'Código Ancestral',
        vidaBase: 12000,
        efeito: 'defesa',
        loot: [
            { nome: '🐉 Escama de Código', chance: 25 },
            { nome: '💎 Núcleo Dracônico', chance: 10 },
            { nome: '🫀 Coração do Dragão', chance: 2 }
        ]
    },
    titanvoid: {
        nome: '🌌 Titã do Void',
        tipo: 'Dimensional',
        vidaBase: 25000,
        efeito: 'void',
        loot: [
            { nome: '🌌 Coração do Void', chance: 20 },
            { nome: '👑 Coroa Dimensional', chance: 8 },
            { nome: '⚫ Núcleo Absoluto', chance: 1 }
        ]
    },
    abissal: {
        nome: '🕳️ Deus Abissal do Código',
        tipo: 'Abissal',
        vidaBase: 1000000,
        efeito: 'abismo',
        loot: [
            { nome: '🕳️ Coração Abissal', chance: 15 },
            { nome: '💀 Núcleo do Abismo', chance: 5 },
            { nome: '🌟 Relíquia do Deus Abissal', chance: 1 }
        ]
    },
    fenix: {
        nome: '🐦‍🔥 Fênix Criptografada',
        tipo: 'Celestial',
        vidaBase: 7000000,
        danoBase: 8500,
        efeito: 'renascimento',
        loot: [
            { nome: '🐦‍🔥 Pluma de Fênix', chance: 25 },
            { nome: '🔥 Chama Criptografada', chance: 10 },
            { nome: '💎 Coração Fênix', chance: 3 }
        ]
    },
    fenixtempo: {
        nome: '⏳ Fênix Temporal Criptografada',
        tipo: 'Celestial Temporal',
        vidaBase: 12000000,
        danoBase: 14000,
        efeito: 'distorção temporal',
        loot: [
            { nome: '⏳ Pluma Temporal', chance: 22 },
            { nome: '⌛ Areia Criptografada', chance: 8 },
            { nome: '🌌 Essência Temporal', chance: 2 }
        ]
    },
    indura: {
        nome: '🩸 Besta Indura do Purgatório',
        tipo: 'Demônio Ancestral',
        vidaBase: 25000000,
        danoBase: 22000,
        efeito: 'devoração demoníaca',
        loot: [
            { nome: '🩸 Sangue Puro de Indura', chance: 20 },
            { nome: '🔥 Chifre de Fogo Negro', chance: 8 },
            { nome: '👑 Coração da Besta Indura', chance: 2 }
        ]
    },
    reidemonio: {
        nome: '👑 Avatar do Rei Demônio',
        tipo: 'Soberano do Purgatório',
        vidaBase: 50000000,
        danoBase: 45000,
        efeito: 'inversão absoluta',
        loot: [
            { nome: '👑 Coroa do Rei Demônio', chance: 18 },
            { nome: '🌑 Fragmento de Trevas Puras', chance: 7 },
            { nome: '⚡ Mandamento da Morte', chance: 1 }
        ]
    },
    supremadeusa: {
        nome: '✨ Suprema Deusa Celestial',
        tipo: 'Divindade Astral',
        vidaBase: 100000000,
        danoBase: 85000,
        efeito: 'luz purificadora',
        loot: [
            { nome: '✨ Graça Divina Celestial', chance: 15 },
            { nome: '🪽 Asa de Ouro Celestial', chance: 6 },
            { nome: '🌟 Centelha da Imortalidade', chance: 1 }
        ]
    },
    caosinfinito: {
        nome: '🌌 Entidade do Caos Primordial',
        tipo: 'Caos Infinito',
        vidaBase: 250000000,
        danoBase: 150000,
        efeito: 'vórtice entrópico',
        loot: [
            { nome: '🌌 Fragmento do Caos Primordial', chance: 12 },
            { nome: '🔮 Olho da Realidade Perdida', chance: 4 },
            { nome: '🪐 Núcleo do Universo Inicial', chance: 1 }
        ]
    },
    cronos: {
        nome: '⏳ Cronos, Soberano do Espaço-Tempo',
        tipo: 'Deus Primordial do Tempo',
        vidaBase: 500000000,
        danoBase: 280000,
        efeito: 'dilatação quântica',
        loot: [
            { nome: '⌛ Ampulheta do Fim dos Tempos', chance: 10 },
            { nome: '🌌 Relíquia da Onipotência', chance: 3 },
            { nome: '♾️ Coroa da Eternidade Cósmica', chance: 1 }
        ]
    }
}

// ═══════════════════════════════════════
// 🌍 MUNDOS & MOBS
// ═══════════════════════════════════════
const mundos = {
    floresta: {
        nome: '🌲 Floresta dos Bugs',
        minLevel: 1,
        monstros: [
            {
                nome: '🐛 Bug Pequeno',
                hp: 300,
                dano: 15,
                xp: 30,
                coins: 40,
                loot: [
                    { nome: '🟢 Fragmento de Bug', chance: 60 },
                    { nome: '🔵 Antena de Bug', chance: 25 },
                    { nome: '🟣 Núcleo Pequeno', chance: 8 }
                ]
            },
            {
                nome: '🦟 Mosquito do Código',
                hp: 400,
                dano: 20,
                xp: 40,
                coins: 50,
                loot: [
                    { nome: '🟢 Asa Corrompida', chance: 55 },
                    { nome: '🟡 Olho Digital', chance: 20 },
                    { nome: '🟣 Essência de Código', chance: 5 }
                ]
            },
            {
                nome: '🪲 Besouro Binário',
                hp: 500,
                dano: 25,
                xp: 55,
                coins: 65,
                loot: [
                    { nome: '🪲 Casca Binária', chance: 50 },
                    { nome: '⚙️ Circuito Antigo', chance: 18 },
                    { nome: '💎 Núcleo Binário', chance: 4 }
                ]
            },
            {
                nome: '🌿 Slime de Código',
                hp: 650,
                dano: 30,
                xp: 70,
                coins: 80,
                loot: [
                    { nome: '🌿 Gosma de Código', chance: 50 },
                    { nome: '🟢 Fragmento Verde', chance: 20 },
                    { nome: '💎 Núcleo Gelatinoso', chance: 5 }
                ]
            }
        ],
        bosses: ['bug', 'erro500']
    },
    servidor: {
        nome: '🔥 Servidor Infernal',
        minLevel: 10,
        monstros: [
            {
                nome: '🔥 Erro 404 Vivo',
                hp: 800,
                dano: 35,
                xp: 80,
                coins: 100,
                loot: [
                    { nome: '🔥 Log Perdido', chance: 55 },
                    { nome: '📜 Página Quebrada', chance: 25 },
                    { nome: '💎 Fragmento 404', chance: 6 }
                ]
            },
            {
                nome: '💾 Cache Corrompido',
                hp: 1000,
                dano: 45,
                xp: 100,
                coins: 120,
                loot: [
                    { nome: '💾 Arquivo Quebrado', chance: 50 },
                    { nome: '🧩 Cache Instável', chance: 20 },
                    { nome: '💎 Núcleo Corrompido', chance: 5 }
                ]
            },
            {
                nome: '📡 Ping Fantasma',
                hp: 1200,
                dano: 55,
                xp: 130,
                coins: 150,
                loot: [
                    { nome: '📡 Sinal Perdido', chance: 50 },
                    { nome: '📶 Eco de Rede', chance: 18 },
                    { nome: '💎 Cristal de Latência', chance: 4 }
                ]
            },
            {
                nome: '🧯 Firewall Rebelde',
                hp: 1400,
                dano: 65,
                xp: 150,
                coins: 180,
                loot: [
                    { nome: '🧯 Fragmento de Firewall', chance: 45 },
                    { nome: '🛡️ Escudo Digital', chance: 15 },
                    { nome: '💎 Núcleo de Proteção', chance: 3 }
                ]
            }
        ],
        bosses: ['erro500', 'malware']
    },
    cyber: {
        nome: '🕷️ Cidade Cyber',
        minLevel: 20,
        monstros: [
            {
                nome: '🕷️ Spyware Selvagem',
                hp: 1500,
                dano: 60,
                xp: 150,
                coins: 180,
                loot: [
                    { nome: '🕷️ Dados Roubados', chance: 45 },
                    { nome: '📁 Pasta Infectada', chance: 18 },
                    { nome: '💎 Núcleo Spyware', chance: 4 }
                ]
            },
            {
                nome: '🔓 Botnet Perdida',
                hp: 1800,
                dano: 75,
                xp: 180,
                coins: 220,
                loot: [
                    { nome: '🔓 Chave Digital', chance: 42 },
                    { nome: '🤖 Fragmento Botnet', chance: 16 },
                    { nome: '💎 Token Sombrio', chance: 3 }
                ]
            },
            {
                nome: '👁️ Scanner Sombrio',
                hp: 2100,
                dano: 90,
                xp: 220,
                coins: 260,
                loot: [
                    { nome: '👁️ Lente Sombria', chance: 38 },
                    { nome: '📡 Radar Quebrado', chance: 14 },
                    { nome: '💎 Olho Digital', chance: 2 }
                ]
            },
            {
                nome: '🧬 Vírus Neural',
                hp: 2500,
                dano: 110,
                xp: 260,
                coins: 320,
                loot: [
                    { nome: '🧬 Gene Corrompido', chance: 35 },
                    { nome: '🧠 Sinapse Infectada', chance: 12 },
                    { nome: '🌌 Núcleo Neural', chance: 2 }
                ]
            }
        ],
        bosses: ['malware', 'ia']
    },
    ancestral: {
        nome: '🐉 Reino do Código Antigo',
        minLevel: 35,
        monstros: [
            {
                nome: '🐉 Lagarto Binário',
                hp: 2500,
                dano: 100,
                xp: 250,
                coins: 300,
                loot: [
                    { nome: '🐉 Escama Binária', chance: 30 },
                    { nome: '🔥 Garra Ancestral', chance: 10 },
                    { nome: '💎 Núcleo Dracônico', chance: 2 }
                ]
            },
            {
                nome: '👁️ Guardião Ancestral',
                hp: 3000,
                dano: 120,
                xp: 300,
                coins: 350,
                loot: [
                    { nome: '👁️ Olho Ancestral', chance: 28 },
                    { nome: '📜 Pergaminho Perdido', chance: 9 },
                    { nome: '💎 Relíquia Antiga', chance: 2 }
                ]
            },
            {
                nome: '🗿 Golem de Script',
                hp: 3500,
                dano: 140,
                xp: 380,
                coins: 450,
                loot: [
                    { nome: '🗿 Pedra de Script', chance: 25 },
                    { nome: '⚙️ Fragmento de Runa', chance: 8 },
                    { nome: '💎 Coração de Pedra', chance: 2 }
                ]
            },
            {
                nome: '⚔️ Cavaleiro do Algoritmo',
                hp: 4200,
                dano: 170,
                xp: 500,
                coins: 600,
                loot: [
                    { nome: '⚔️ Lâmina Algorítmica', chance: 22 },
                    { nome: '🛡️ Armadura Antiga', chance: 7 },
                    { nome: '🌟 Relíquia Lendária', chance: 1 }
                ]
            }
        ],
        bosses: ['dragao']
    },
    void: {
        nome: '🌌 Void Digital',
        minLevel: 50,
        monstros: [
            {
                nome: '👁️ Observador do Void',
                hp: 6000,
                dano: 220,
                xp: 700,
                coins: 900,
                loot: [
                    { nome: '🌌 Fragmento do Void', chance: 30 },
                    { nome: '👁️ Olho do Abismo', chance: 10 },
                    { nome: '💎 Núcleo Dimensional', chance: 2 }
                ]
            },
            {
                nome: '🕳️ Devorador de Dados',
                hp: 7000,
                dano: 260,
                xp: 850,
                coins: 1100,
                loot: [
                    { nome: '🕳️ Dados Perdidos', chance: 28 },
                    { nome: '⚫ Matéria Escura', chance: 8 },
                    { nome: '🌟 Essência do Void', chance: 2 }
                ]
            },
            {
                nome: '☠️ Fantasma do Sistema',
                hp: 8000,
                dano: 300,
                xp: 1000,
                coins: 1300,
                loot: [
                    { nome: '☠️ Alma Digital', chance: 25 },
                    { nome: '👻 Código Fantasma', chance: 8 },
                    { nome: '💎 Relíquia Espectral', chance: 1 }
                ]
            }
        ],
        bosses: ['titanvoid']
    },
    abissal: {
        nome: '🕳️ Abismo Digital',
        minLevel: 80,
        monstros: [
            {
                nome: '👾 Devorador de Dados',
                hp: 12000,
                dano: 350,
                xp: 1200,
                coins: 1500,
                loot: [
                    { nome: '🕳️ Fragmento Abissal', chance: 25 },
                    { nome: '💀 Código Profundo', chance: 8 },
                    { nome: '🌌 Essência do Abismo', chance: 2 }
                ]
            },
            {
                nome: '🧠 Entidade Perdida',
                hp: 18000,
                dano: 500,
                xp: 1800,
                coins: 2200,
                loot: [
                    { nome: '🧠 Núcleo Perdido', chance: 20 },
                    { nome: '🔮 Memória Abissal', chance: 6 },
                    { nome: '🌟 Alma Digital', chance: 1 }
                ]
            }
        ],
        bosses: ['abissal']
    },
    ceucripto: {
        nome: '🐦‍🔥 Céu Criptografado',
        minLevel: 105,
        monstros: [
            {
                nome: '⚡ Guardião Encriptado',
                hp: 25000,
                dano: 450,
                xp: 2000,
                coins: 2500,
                loot: [
                    { nome: '🔐 Fragmento Criptografado', chance: 35 },
                    { nome: '🔑 Chave Quantica', chance: 12 },
                    { nome: '✨ Essência Criptográfica', chance: 3 }
                ]
            },
            {
                nome: '🌩️ Tempestade Digital',
                hp: 30000,
                dano: 550,
                xp: 2400,
                coins: 3000,
                loot: [
                    { nome: '⚡ Raio Criptografado', chance: 33 },
                    { nome: '🌪️ Vórtex Digital', chance: 10 },
                    { nome: '💎 Núcleo Tempestuoso', chance: 2 }
                ]
            },
            {
                nome: '🛡️ Sentinela Quântica',
                hp: 35000,
                dano: 600,
                xp: 2800,
                coins: 3500,
                loot: [
                    { nome: '🛡️ Proteção Quântica', chance: 30 },
                    { nome: '⚙️ Engrenagem Quântica', chance: 9 },
                    { nome: '🌟 Relíquia Quântica', chance: 2 }
                ]
            },
            {
                nome: '👑 Soberana do Éter',
                hp: 40000,
                dano: 700,
                xp: 3200,
                coins: 4000,
                loot: [
                    { nome: '👑 Coroa Criptografada', chance: 28 },
                    { nome: '💫 Luz Etérea', chance: 8 },
                    { nome: '🌌 Gema Suprema', chance: 1 }
                ]
            }
        ],
        bosses: ['fenix', 'fenixtempo']
    },
    purgatorio: {
        nome: '🔥 Purgatório Demoníaco',
        minLevel: 150,
        monstros: [
            {
                nome: '👹 Indura Selvagem',
                hp: 120000,
                dano: 1800,
                xp: 6000,
                coins: 8000,
                loot: [
                    { nome: '🩸 Sangue de Indura', chance: 30 },
                    { nome: '🔥 Fragmento Purgatorial', chance: 12 },
                    { nome: '💎 Coração Sombrio', chance: 2 }
                ]
            },
            {
                nome: '🔥 Demônio Carmesim Ancestral',
                hp: 180000,
                dano: 2400,
                xp: 8500,
                coins: 11000,
                loot: [
                    { nome: '🔥 Chamas do Purgatório', chance: 28 },
                    { nome: '💀 Chifre Demoníaco', chance: 10 },
                    { nome: '🌟 Cinza Imperial', chance: 2 }
                ]
            },
            {
                nome: '⚔️ Cavaleiro Negro de Belialuin',
                hp: 250000,
                dano: 3200,
                xp: 12000,
                coins: 15000,
                loot: [
                    { nome: '🗡️ Lâmina Sombria Antiga', chance: 25 },
                    { nome: '🛡️ Placa do Rei Demônio', chance: 8 },
                    { nome: '🌌 Fragmento de Belialuin', chance: 1 }
                ]
            }
        ],
        bosses: ['indura', 'reidemonio']
    },
    santuariocelestial: {
        nome: '🪽 Santuário Celestial Supremo',
        minLevel: 200,
        monstros: [
            {
                nome: '🪽 Serafim de Seis Asas',
                hp: 400000,
                dano: 4500,
                xp: 20000,
                coins: 25000,
                loot: [
                    { nome: '🪽 Pluma Sagrada de Serafim', chance: 28 },
                    { nome: '✨ Auréola Divina', chance: 10 },
                    { nome: '💎 Lágrima Celestial', chance: 2 }
                ]
            },
            {
                nome: '👼 Arcanjo da Graça Divina',
                hp: 650000,
                dano: 6500,
                xp: 32000,
                coins: 40000,
                loot: [
                    { nome: '✨ Graça Divina Radiante', chance: 25 },
                    { nome: '🔱 Lança Arcangélica', chance: 8 },
                    { nome: '🌟 Relíquia da Suprema Deusa', chance: 1 }
                ]
            },
            {
                nome: '☀️ Guardião Solar Primordial',
                hp: 900000,
                dano: 8500,
                xp: 45000,
                coins: 55000,
                loot: [
                    { nome: '☀️ Centelha do Sol Supremo', chance: 22 },
                    { nome: '🛡️ Escudo Radiante de Ardente', chance: 7 },
                    { nome: '🌌 Núcleo da Luz Imortal', chance: 1 }
                ]
            }
        ],
        bosses: ['supremadeusa']
    },
    caosprimordial: {
        nome: '🌌 Fenda do Caos Primordial',
        minLevel: 300,
        monstros: [
            {
                nome: '🌌 Espectro do Vórtice Infinito',
                hp: 1500000,
                dano: 15000,
                xp: 80000,
                coins: 90000,
                loot: [
                    { nome: '🌌 Partícula do Vórtice', chance: 25 },
                    { nome: '🔮 Prisma da Não-Existência', chance: 8 },
                    { nome: '💎 Cristal da Singularidade', chance: 1 }
                ]
            },
            {
                nome: '🪐 Titã do Caos Cósmico',
                hp: 3000000,
                dano: 28000,
                xp: 150000,
                coins: 180000,
                loot: [
                    { nome: '🪐 Fragmento Planetário', chance: 22 },
                    { nome: '👑 Coroa do Caos Infinito', chance: 6 },
                    { nome: '🌟 Centelha Onipotente', chance: 1 }
                ]
            },
            {
                nome: '♾️ Devorador do Espaço-Tempo',
                hp: 6000000,
                dano: 45000,
                xp: 300000,
                coins: 350000,
                loot: [
                    { nome: '⏳ Fragmento Temporal Perdido', chance: 20 },
                    { nome: '🌌 Tecido do Universo', chance: 5 },
                    { nome: '♾️ Orbe do Criador Supremo', chance: 1 }
                ]
            }
        ],
        bosses: ['caosinfinito', 'cronos']
    }
}

// ═══════════════════════════════════════
// 🎓 CLASSES & CLASSES LENDÁRIAS
// ═══════════════════════════════════════
const classes = {
    guerreiro: {
        nome: '⚔️ Guerreiro de Reino',
        descricao: 'Guerreiro corpo a corpo com alta vida e força bruta.',
        habilidade: '+30 ATK e +50 HP máximo.'
    },
    mago: {
        nome: '🔮 Mago Arcano',
        descricao: 'Mestre das artes arcanas e feitiçaria destrutiva.',
        habilidade: '25% de chance de causar 3x dano mágico.'
    },
    arqueiro: {
        nome: '🏹 Arqueiro Élfico',
        descricao: 'Atirador de elite com precisão letal à distância.',
        habilidade: '+15% chance de crítico e +20 ATK.'
    },
    curandeiro: {
        nome: '💚 Sacerdote Curandeiro',
        descricao: 'Canaliza luz divina para restaurar e proteger aliados.',
        habilidade: 'Cura 30% do HP a cada 3 turnos em batalha.'
    },
    ladino: {
        nome: '🗡️ Ladino das Sombras',
        descricao: 'Especialista em emboscadas, esquiva e golpes fatais.',
        habilidade: '+20% esquiva e +25% chance de crítico.'
    },
    paladino: {
        nome: '🛡️ Paladino Sagrado',
        descricao: 'Guerreiro sagrado com defesa e ataque equilibrados.',
        habilidade: '+40 DEF e +20 ATK. Absorve 10% do dano dos aliados.'
    },
    necromante: {
        nome: '💀 Necromante das Trevas',
        descricao: 'Invoca mortos-vivos e drena a vida dos inimigos.',
        habilidade: 'Drena 15% do dano causado como HP.'
    },
    berserker: {
        nome: '🪓 Berserker Furioso',
        descricao: 'Entra em fúria e causa dano massivo, mas perde defesa.',
        habilidade: '+60 ATK e -20 DEF. Dano aumenta conforme HP diminui.'
    }
}

const classesLendarias = {
    dragonite: {
        nome: '🐉 Cavaleiro Dracônico',
        requisito: 'Nível 60, 30 chefes derrotados',
        habilidade: '+200 ATK e +150 DEF. Respiração de dragão causa dano em área.',
        loots: ['🐉 Escama de Dragão', '💎 Núcleo Dracônico', '🫀 Coração do Dragão']
    },
    lordesombras: {
        nome: '🌑 Lorde das Sombras',
        requisito: 'Nível 50, 1000+ dano causado',
        habilidade: 'Golpes invisíveis ignoram 50% da defesa inimiga.',
        loots: ['🌌 Fragmento do Void', '⚫ Matéria Escura', '☠️ Alma Sombria']
    },
    arcanosupremo: {
        nome: '✨ Arcano Supremo',
        requisito: 'Nível 80, derrotar 50 chefes',
        habilidade: 'Magia suprema: 40% de chance de causar 5x dano.',
        loots: ['🌟 Chama Arcana', '💎 Gema Suprema', '📜 Pergaminho Ancestral']
    },
    sentinela: {
        nome: '🛡️ Sentinelas Eternos',
        requisito: 'Nível 70, 200 defesa acumulada',
        habilidade: 'Escudo impossível: bloqueia 40% de todo dano recebido.',
        loots: ['🛡️ Escudo Ancestral', '👑 Coroa Sagrada', '💫 Luz Divina']
    },
    pecado_ira: {
        nome: '🐉 Pecado da Ira do Dragão',
        requisito: 'Nível 60, 30 chefes e espólios dracônicos',
        habilidade: '+500 de dano e 40% de chance de ataque triplo.',
        loots: ['🐉 Escama de Dragão', '💎 Núcleo Dracônico']
    },
    goat_assault: {
        nome: '👑 Camisa 10 — Modo Lendário (GOAT Campeão)',
        requisito: 'Nível 80, 100 chefes, 50 vitórias e espólios supremos',
        habilidade: 'Contra-ataque Total: reflete o dobro do dano recebido. +800 ATK, +300 moedas e +200 HP.',
        loots: ['🫀 Coração do Dragão', '⚫ Núcleo Absoluto', '🌟 Chama Arcana']
    }
}

// ═══════════════════════════════════════
// 🐾 PETS & ⚒️ EQUIPAMENTOS
// ═══════════════════════════════════════
const petsDisponiveis = {
    cachorro: {
        nome: '🐶 Cachorro Dev',
        bonus: '+20 dano em Boss',
        tipo: 'dano',
        valor: 20
    },
    gato: {
        nome: '🐱 Gato Programador',
        bonus: '+10 XP em Boss',
        tipo: 'xp',
        valor: 10
    },
    raposa: {
        nome: '🦊 Raposa Hacker',
        bonus: '10% de chance de +200 dano',
        tipo: 'critico',
        valor: 200
    },
    lobo: {
        nome: '🐺 Lobo Full Stack',
        bonus: '+50 dano em Boss',
        tipo: 'dano',
        valor: 50
    },
    aguia: {
        nome: '🦅 Águia da Cloud',
        bonus: '+30 coins por ataque ao Boss',
        tipo: 'coins',
        valor: 30
    },
    robo: {
        nome: '🤖 Robô Companion',
        bonus: '20% de chance de dobrar o dano',
        tipo: 'dobro',
        valor: 2
    },
    falcao: {
        nome: '🦅 Falcão',
        bonus: '+10 Ataque',
        tipo: 'dano',
        valor: 10
    },
    dragao: {
        nome: '🐲 Dragão',
        bonus: '+20 Ataque',
        tipo: 'dano',
        valor: 20
    },
    hydra: {
        nome: '🐉 Hydra',
        bonus: '+70% XP | +50% Dano | +50% Crítico',
        tipo: 'lendario',
        valor: 0,
        preco: 100000000,
        // Buffs PERCENTUAIS. Os pets antigos somam valores fixos (`valor`); a
        // Hydra multiplica, por isso vive em `buffs` e é lida à parte no
        // characterEngine — misturar as duas escalas quebraria os pets antigos.
        buffs: { xpPct: 70, danoPct: 50, critPct: 50 }
    }
}

/**
 * Resolve a CHAVE canônica de um pet a partir do que está salvo no usuário.
 *
 * `user.pet` foi gravado historicamente em três formatos diferentes:
 *   - chave crua ................ 'cachorro'            (pet.js)
 *   - objeto .................... { name, type, level } (petshop.js)
 *   - nome de exibição .......... '🐶 Cachorro Dev'     (evoluirpet.js)
 *
 * O engine indexava `petsDisponiveis[user.pet]` direto, então só o primeiro
 * formato aplicava bônus — nos outros dois o pet ficava decorativo. Este
 * resolvedor aceita os três e devolve sempre a chave.
 *
 * @param {string|object|null} pet valor bruto de `user.pet`
 * @returns {string|null} chave em petsDisponiveis, ou null
 */
function resolvePetKey(pet) {
    if (!pet) return null;

    const candidatos = [];
    if (typeof pet === 'string') {
        candidatos.push(pet);
    } else if (typeof pet === 'object') {
        candidatos.push(pet.type, pet.tipo, pet.key, pet.name, pet.nome);
    }

    for (const bruto of candidatos) {
        if (!bruto || typeof bruto !== 'string') continue;
        const limpo = bruto.trim().toLowerCase();
        if (petsDisponiveis[limpo]) return limpo;
        // Nome de exibição ('🐶 Cachorro Dev') → procura pela chave correspondente
        const achado = Object.keys(petsDisponiveis).find(
            k => petsDisponiveis[k].nome.trim().toLowerCase() === limpo
        );
        if (achado) return achado;
    }
    return null;
}

const equipamentos = {
    espada_bug: {
        nome: '⚔️ Espada de Bug',
        tipo: 'arma',
        bonus: '+150 dano em Boss',
        receita: {
            '🟢 Fragmento de Bug': 3,
            '🪲 Casca Binária': 2
        }
    },
    armadura_firewall: {
        nome: '🛡️ Armadura de Firewall',
        tipo: 'armadura',
        bonus: '-10 dano recebido de Boss',
        receita: {
            '🧯 Fragmento de Firewall': 3,
            '🔥 Log Perdido': 2
        }
    },
    anel_neural: {
        nome: '💍 Anel Neural',
        tipo: 'anel',
        bonus: '+50 XP ao atacar Boss',
        receita: {
            '🧬 Gene Corrompido': 2,
            '👁️ Lente Sombria': 2
        }
    },
    lanca_void: {
        nome: '🔱 Lança do Void',
        tipo: 'arma',
        bonus: '+300 dano em Boss',
        receita: {
            '🌌 Fragmento do Void': 4,
            '⚫ Matéria Escura': 3,
            '💎 Núcleo Dimensional': 1
        }
    },
    armadura_cripto: {
        nome: '🔐 Armadura Criptografada',
        tipo: 'armadura',
        bonus: '+100 defesa',
        receita: {
            '🔐 Fragmento Criptografado': 5,
            '🔑 Chave Quantica': 2,
            '✨ Essência Criptográfica': 1
        }
    },
    botas_velocidade: {
        nome: '⚡ Botas da Velocidade',
        tipo: 'acessório',
        bonus: '+25% chance de esquivar',
        receita: {
            '⚡ Raio Criptografado': 3,
            '💾 Arquivo Quebrado': 2
        }
    },
    coroa_poder: {
        nome: '👑 Coroa do Poder Supremo',
        tipo: 'acessório',
        bonus: '+500 dano e +200 coins',
        receita: {
            '👑 Coroa Criptografada': 1,
            '💫 Luz Etérea': 3,
            '🌌 Gema Suprema': 1
        }
    },
    manto_sombrio: {
        nome: '🌑 Manto das Sombras',
        tipo: 'armadura',
        bonus: '+200 dano invisível',
        receita: {
            '🌌 Fragmento do Void': 3,
            '☠️ Alma Digital': 2
        }
    },
    anular_cripto: {
        nome: '💎 Anel Criptográfico',
        tipo: 'acessório',
        bonus: '+150 XP de Boss e +100 coins',
        receita: {
            '🛡️ Proteção Quântica': 2,
            '⚙️ Engrenagem Quântica': 2,
            '🌟 Relíquia Quântica': 1
        }
    },
    espada_fogo: {
        nome: '🔥 Espada Flamejante',
        tipo: 'arma',
        bonus: '+250 dano com efeito queimadura',
        receita: {
            '🔥 Fragmento Infernal': 4,
            '💎 Núcleo do Servidor': 2,
            '🌟 Chama do Purgatório': 1
        }
    },
    brazalete_dragao: {
        nome: '🐉 Pulseira Dracônica',
        tipo: 'acessório',
        bonus: '+400 dano contra bosses',
        receita: {
            '🐉 Escama de Código': 3,
            '💎 Núcleo Dracônico': 2,
            '🫀 Coração do Dragão': 1
        }
    },
    escudo_temporal: {
        nome: '⏳ Escudo Temporal',
        tipo: 'armadura',
        bonus: '+150 defesa contra dano temporal',
        receita: {
            '⏳ Pluma Temporal': 3,
            '⌛ Areia Criptografada': 2,
            '🌌 Essência Temporal': 1
        }
    }
}

const desafios = [
    '💻 JavaScript:\nComo declarar uma variável constante?',
    '🐍 Python:\nQual comando imprime algo na tela?',
    '🌐 HTML:\nQual tag cria um link?',
    '🎨 CSS:\nQual propriedade muda a cor do texto?',
    '⚡ Node.js:\nQual comando instala um pacote npm?',
    '🧠 Lógica:\nO que é um loop infinito?',
    '📦 Git:\nQual comando envia commits para o GitHub?',
    '🔍 Qual a saída?\n\nconsole.log(typeof null)',
    '💻 Qual operador verifica igualdade estrita no JS?',
    '🌐 O que significa API?',
    '⚛️ React:\nO que é um componente?',
    '🟢 Node.js:\nO que o Express faz?',
    '🗄 SQL:\nQual comando seleciona dados?',
    '🐙 Git:\nQual comando clona um repositório?',
    '🔒 Segurança:\nO que significa SQL Injection?',
    '📱 Mobile:\nO que é React Native?',
    '☁️ Cloud:\nO que é deploy?',
    '⚡ JavaScript:\nDiferença entre let e var?',
    '🎨 CSS:\nO que o display:flex faz?',
    '🌐 HTML:\nPara que serve o div?',
    '🧠 Lógica:\nO que é uma variável?',
    '⚛️ React:\nO que é useState?',
    '🟢 Backend:\nO que é uma API REST?',
    '📦 NPM:\nPara que serve package.json?',
    '🐍 Python:\nComo criar uma função?',
    '🔐 Segurança:\nO que é autenticação JWT?',
    '🗄 Banco de dados:\nDiferença entre SQL e NoSQL?',
    '🚀 DevOps:\nO que Docker faz?',
    '🐳 Docker:\nO que é um container?'
]

/**
 * Itens que mudaram de nome exibido. O nome é gravado na mochila, então quem
 * já tinha o item antigo é convertido na leitura (userRepository.rowToUser).
 */
const ITENS_RENOMEADOS = {
    '🌟 Chama do Backend': '🌟 Chama do Purgatório'
}

module.exports = {
    ITENS_RENOMEADOS,
    pocoes,
    receitasPocao,
    arenas,
    cartasArena,
    bosses,
    mundos,
    classes,
    classesLendarias,
    petsDisponiveis,
    resolvePetKey,
    equipamentos,
    desafios
}

