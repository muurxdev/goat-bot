/**
 * .quiztema — Quiz de múltipla escolha: escolha tema e tamanho
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 80 comandos antigos
 * (.jogo1, .jogo2, .jogo3, .jogo4…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "quiztema",
    "titulo": "Quiz por tema",
    "emoji": "❓",
    "intro": "Escolha o tema. Cada rodada tem 5 perguntas; some \"10\" para a maratona.",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "bandeiras"
            ],
            "rotulo": "Bandeiras do mundo",
            "config": {
                "motor": "quiz",
                "tema": "bandeiras",
                "qtd": 5,
                "emoji": "🚩",
                "titulo": "Quiz de Bandeiras do mundo"
            }
        },
        {
            "palavras": [
                "bandeiras",
                "10"
            ],
            "rotulo": "Bandeiras do mundo, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "bandeiras",
                "qtd": 10,
                "emoji": "🚩",
                "titulo": "Quiz de Bandeiras do mundo"
            }
        },
        {
            "palavras": [
                "capitais"
            ],
            "rotulo": "Capitais do mundo",
            "config": {
                "motor": "quiz",
                "tema": "capitais",
                "qtd": 5,
                "emoji": "🌍",
                "titulo": "Quiz de Capitais do mundo"
            }
        },
        {
            "palavras": [
                "capitais",
                "10"
            ],
            "rotulo": "Capitais do mundo, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "capitais",
                "qtd": 10,
                "emoji": "🌍",
                "titulo": "Quiz de Capitais do mundo"
            }
        },
        {
            "palavras": [
                "capitaisbrasil"
            ],
            "rotulo": "Capitais do Brasil",
            "config": {
                "motor": "quiz",
                "tema": "capitaisbrasil",
                "qtd": 5,
                "emoji": "🇧🇷",
                "titulo": "Quiz de Capitais do Brasil"
            }
        },
        {
            "palavras": [
                "capitaisbrasil",
                "10"
            ],
            "rotulo": "Capitais do Brasil, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "capitaisbrasil",
                "qtd": 10,
                "emoji": "🇧🇷",
                "titulo": "Quiz de Capitais do Brasil"
            }
        },
        {
            "palavras": [
                "historiabrasil"
            ],
            "rotulo": "História do Brasil",
            "config": {
                "motor": "quiz",
                "tema": "historiabrasil",
                "qtd": 5,
                "emoji": "📜",
                "titulo": "Quiz de História do Brasil"
            }
        },
        {
            "palavras": [
                "historiabrasil",
                "10"
            ],
            "rotulo": "História do Brasil, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "historiabrasil",
                "qtd": 10,
                "emoji": "📜",
                "titulo": "Quiz de História do Brasil"
            }
        },
        {
            "palavras": [
                "historiamundial"
            ],
            "rotulo": "História mundial",
            "config": {
                "motor": "quiz",
                "tema": "historiamundial",
                "qtd": 5,
                "emoji": "🏛️",
                "titulo": "Quiz de História mundial"
            }
        },
        {
            "palavras": [
                "historiamundial",
                "10"
            ],
            "rotulo": "História mundial, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "historiamundial",
                "qtd": 10,
                "emoji": "🏛️",
                "titulo": "Quiz de História mundial"
            }
        },
        {
            "palavras": [
                "ciencia"
            ],
            "rotulo": "Ciência geral",
            "config": {
                "motor": "quiz",
                "tema": "ciencia",
                "qtd": 5,
                "emoji": "🔬",
                "titulo": "Quiz de Ciência geral"
            }
        },
        {
            "palavras": [
                "ciencia",
                "10"
            ],
            "rotulo": "Ciência geral, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "ciencia",
                "qtd": 10,
                "emoji": "🔬",
                "titulo": "Quiz de Ciência geral"
            }
        },
        {
            "palavras": [
                "corpohumano"
            ],
            "rotulo": "Corpo humano",
            "config": {
                "motor": "quiz",
                "tema": "corpohumano",
                "qtd": 5,
                "emoji": "🫀",
                "titulo": "Quiz de Corpo humano"
            }
        },
        {
            "palavras": [
                "corpohumano",
                "10"
            ],
            "rotulo": "Corpo humano, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "corpohumano",
                "qtd": 10,
                "emoji": "🫀",
                "titulo": "Quiz de Corpo humano"
            }
        },
        {
            "palavras": [
                "animais"
            ],
            "rotulo": "Reino animal",
            "config": {
                "motor": "quiz",
                "tema": "animais",
                "qtd": 5,
                "emoji": "🦁",
                "titulo": "Quiz de Reino animal"
            }
        },
        {
            "palavras": [
                "animais",
                "10"
            ],
            "rotulo": "Reino animal, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "animais",
                "qtd": 10,
                "emoji": "🦁",
                "titulo": "Quiz de Reino animal"
            }
        },
        {
            "palavras": [
                "futebol"
            ],
            "rotulo": "Futebol mundial",
            "config": {
                "motor": "quiz",
                "tema": "futebol",
                "qtd": 5,
                "emoji": "⚽",
                "titulo": "Quiz de Futebol mundial"
            }
        },
        {
            "palavras": [
                "futebol",
                "10"
            ],
            "rotulo": "Futebol mundial, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "futebol",
                "qtd": 10,
                "emoji": "⚽",
                "titulo": "Quiz de Futebol mundial"
            }
        },
        {
            "palavras": [
                "futebolbrasil"
            ],
            "rotulo": "Futebol brasileiro",
            "config": {
                "motor": "quiz",
                "tema": "futebolbrasil",
                "qtd": 5,
                "emoji": "🏆",
                "titulo": "Quiz de Futebol brasileiro"
            }
        },
        {
            "palavras": [
                "futebolbrasil",
                "10"
            ],
            "rotulo": "Futebol brasileiro, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "futebolbrasil",
                "qtd": 10,
                "emoji": "🏆",
                "titulo": "Quiz de Futebol brasileiro"
            }
        },
        {
            "palavras": [
                "cinema"
            ],
            "rotulo": "Cinema",
            "config": {
                "motor": "quiz",
                "tema": "cinema",
                "qtd": 5,
                "emoji": "🎬",
                "titulo": "Quiz de Cinema"
            }
        },
        {
            "palavras": [
                "cinema",
                "10"
            ],
            "rotulo": "Cinema, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "cinema",
                "qtd": 10,
                "emoji": "🎬",
                "titulo": "Quiz de Cinema"
            }
        },
        {
            "palavras": [
                "musicabrasileira"
            ],
            "rotulo": "Música brasileira",
            "config": {
                "motor": "quiz",
                "tema": "musicabrasileira",
                "qtd": 5,
                "emoji": "🎶",
                "titulo": "Quiz de Música brasileira"
            }
        },
        {
            "palavras": [
                "musicabrasileira",
                "10"
            ],
            "rotulo": "Música brasileira, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "musicabrasileira",
                "qtd": 10,
                "emoji": "🎶",
                "titulo": "Quiz de Música brasileira"
            }
        },
        {
            "palavras": [
                "musicainternacional"
            ],
            "rotulo": "Música internacional",
            "config": {
                "motor": "quiz",
                "tema": "musicainternacional",
                "qtd": 5,
                "emoji": "🎸",
                "titulo": "Quiz de Música internacional"
            }
        },
        {
            "palavras": [
                "musicainternacional",
                "10"
            ],
            "rotulo": "Música internacional, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "musicainternacional",
                "qtd": 10,
                "emoji": "🎸",
                "titulo": "Quiz de Música internacional"
            }
        },
        {
            "palavras": [
                "games"
            ],
            "rotulo": "Videogames",
            "config": {
                "motor": "quiz",
                "tema": "games",
                "qtd": 5,
                "emoji": "🎮",
                "titulo": "Quiz de Videogames"
            }
        },
        {
            "palavras": [
                "games",
                "10"
            ],
            "rotulo": "Videogames, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "games",
                "qtd": 10,
                "emoji": "🎮",
                "titulo": "Quiz de Videogames"
            }
        },
        {
            "palavras": [
                "literatura"
            ],
            "rotulo": "Literatura",
            "config": {
                "motor": "quiz",
                "tema": "literatura",
                "qtd": 5,
                "emoji": "📚",
                "titulo": "Quiz de Literatura"
            }
        },
        {
            "palavras": [
                "literatura",
                "10"
            ],
            "rotulo": "Literatura, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "literatura",
                "qtd": 10,
                "emoji": "📚",
                "titulo": "Quiz de Literatura"
            }
        },
        {
            "palavras": [
                "matematica"
            ],
            "rotulo": "Matemática",
            "config": {
                "motor": "quiz",
                "tema": "matematica",
                "qtd": 5,
                "emoji": "➗",
                "titulo": "Quiz de Matemática"
            }
        },
        {
            "palavras": [
                "matematica",
                "10"
            ],
            "rotulo": "Matemática, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "matematica",
                "qtd": 10,
                "emoji": "➗",
                "titulo": "Quiz de Matemática"
            }
        },
        {
            "palavras": [
                "portugues"
            ],
            "rotulo": "Língua portuguesa",
            "config": {
                "motor": "quiz",
                "tema": "portugues",
                "qtd": 5,
                "emoji": "✍️",
                "titulo": "Quiz de Língua portuguesa"
            }
        },
        {
            "palavras": [
                "portugues",
                "10"
            ],
            "rotulo": "Língua portuguesa, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "portugues",
                "qtd": 10,
                "emoji": "✍️",
                "titulo": "Quiz de Língua portuguesa"
            }
        },
        {
            "palavras": [
                "geografia"
            ],
            "rotulo": "Geografia mundial",
            "config": {
                "motor": "quiz",
                "tema": "geografia",
                "qtd": 5,
                "emoji": "🗺️",
                "titulo": "Quiz de Geografia mundial"
            }
        },
        {
            "palavras": [
                "geografia",
                "10"
            ],
            "rotulo": "Geografia mundial, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "geografia",
                "qtd": 10,
                "emoji": "🗺️",
                "titulo": "Quiz de Geografia mundial"
            }
        },
        {
            "palavras": [
                "geografiabrasil"
            ],
            "rotulo": "Geografia do Brasil",
            "config": {
                "motor": "quiz",
                "tema": "geografiabrasil",
                "qtd": 5,
                "emoji": "🧭",
                "titulo": "Quiz de Geografia do Brasil"
            }
        },
        {
            "palavras": [
                "geografiabrasil",
                "10"
            ],
            "rotulo": "Geografia do Brasil, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "geografiabrasil",
                "qtd": 10,
                "emoji": "🧭",
                "titulo": "Quiz de Geografia do Brasil"
            }
        },
        {
            "palavras": [
                "tecnologia"
            ],
            "rotulo": "Tecnologia",
            "config": {
                "motor": "quiz",
                "tema": "tecnologia",
                "qtd": 5,
                "emoji": "💻",
                "titulo": "Quiz de Tecnologia"
            }
        },
        {
            "palavras": [
                "tecnologia",
                "10"
            ],
            "rotulo": "Tecnologia, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "tecnologia",
                "qtd": 10,
                "emoji": "💻",
                "titulo": "Quiz de Tecnologia"
            }
        },
        {
            "palavras": [
                "internet"
            ],
            "rotulo": "Internet e redes",
            "config": {
                "motor": "quiz",
                "tema": "internet",
                "qtd": 5,
                "emoji": "🌐",
                "titulo": "Quiz de Internet e redes"
            }
        },
        {
            "palavras": [
                "internet",
                "10"
            ],
            "rotulo": "Internet e redes, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "internet",
                "qtd": 10,
                "emoji": "🌐",
                "titulo": "Quiz de Internet e redes"
            }
        },
        {
            "palavras": [
                "culinaria"
            ],
            "rotulo": "Culinária do mundo",
            "config": {
                "motor": "quiz",
                "tema": "culinaria",
                "qtd": 5,
                "emoji": "🍳",
                "titulo": "Quiz de Culinária do mundo"
            }
        },
        {
            "palavras": [
                "culinaria",
                "10"
            ],
            "rotulo": "Culinária do mundo, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "culinaria",
                "qtd": 10,
                "emoji": "🍳",
                "titulo": "Quiz de Culinária do mundo"
            }
        },
        {
            "palavras": [
                "culinariabrasil"
            ],
            "rotulo": "Comida brasileira",
            "config": {
                "motor": "quiz",
                "tema": "culinariabrasil",
                "qtd": 5,
                "emoji": "🍲",
                "titulo": "Quiz de Comida brasileira"
            }
        },
        {
            "palavras": [
                "culinariabrasil",
                "10"
            ],
            "rotulo": "Comida brasileira, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "culinariabrasil",
                "qtd": 10,
                "emoji": "🍲",
                "titulo": "Quiz de Comida brasileira"
            }
        },
        {
            "palavras": [
                "novela"
            ],
            "rotulo": "Novelas brasileiras",
            "config": {
                "motor": "quiz",
                "tema": "novela",
                "qtd": 5,
                "emoji": "📺",
                "titulo": "Quiz de Novelas brasileiras"
            }
        },
        {
            "palavras": [
                "novela",
                "10"
            ],
            "rotulo": "Novelas brasileiras, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "novela",
                "qtd": 10,
                "emoji": "📺",
                "titulo": "Quiz de Novelas brasileiras"
            }
        },
        {
            "palavras": [
                "desenhoantigo"
            ],
            "rotulo": "Desenhos antigos",
            "config": {
                "motor": "quiz",
                "tema": "desenhoantigo",
                "qtd": 5,
                "emoji": "📼",
                "titulo": "Quiz de Desenhos antigos"
            }
        },
        {
            "palavras": [
                "desenhoantigo",
                "10"
            ],
            "rotulo": "Desenhos antigos, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "desenhoantigo",
                "qtd": 10,
                "emoji": "📼",
                "titulo": "Quiz de Desenhos antigos"
            }
        },
        {
            "palavras": [
                "religiao"
            ],
            "rotulo": "Religiões do mundo",
            "config": {
                "motor": "quiz",
                "tema": "religiao",
                "qtd": 5,
                "emoji": "🕊️",
                "titulo": "Quiz de Religiões do mundo"
            }
        },
        {
            "palavras": [
                "religiao",
                "10"
            ],
            "rotulo": "Religiões do mundo, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "religiao",
                "qtd": 10,
                "emoji": "🕊️",
                "titulo": "Quiz de Religiões do mundo"
            }
        },
        {
            "palavras": [
                "mitologiagrega"
            ],
            "rotulo": "Mitologia grega",
            "config": {
                "motor": "quiz",
                "tema": "mitologiagrega",
                "qtd": 5,
                "emoji": "⚡",
                "titulo": "Quiz de Mitologia grega"
            }
        },
        {
            "palavras": [
                "mitologiagrega",
                "10"
            ],
            "rotulo": "Mitologia grega, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "mitologiagrega",
                "qtd": 10,
                "emoji": "⚡",
                "titulo": "Quiz de Mitologia grega"
            }
        },
        {
            "palavras": [
                "mitologianordica"
            ],
            "rotulo": "Mitologia nórdica",
            "config": {
                "motor": "quiz",
                "tema": "mitologianordica",
                "qtd": 5,
                "emoji": "🔨",
                "titulo": "Quiz de Mitologia nórdica"
            }
        },
        {
            "palavras": [
                "mitologianordica",
                "10"
            ],
            "rotulo": "Mitologia nórdica, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "mitologianordica",
                "qtd": 10,
                "emoji": "🔨",
                "titulo": "Quiz de Mitologia nórdica"
            }
        },
        {
            "palavras": [
                "folclore"
            ],
            "rotulo": "Folclore brasileiro",
            "config": {
                "motor": "quiz",
                "tema": "folclore",
                "qtd": 5,
                "emoji": "🪘",
                "titulo": "Quiz de Folclore brasileiro"
            }
        },
        {
            "palavras": [
                "folclore",
                "10"
            ],
            "rotulo": "Folclore brasileiro, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "folclore",
                "qtd": 10,
                "emoji": "🪘",
                "titulo": "Quiz de Folclore brasileiro"
            }
        },
        {
            "palavras": [
                "espaco"
            ],
            "rotulo": "Espaço e astronomia",
            "config": {
                "motor": "quiz",
                "tema": "espaco",
                "qtd": 5,
                "emoji": "🚀",
                "titulo": "Quiz de Espaço e astronomia"
            }
        },
        {
            "palavras": [
                "espaco",
                "10"
            ],
            "rotulo": "Espaço e astronomia, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "espaco",
                "qtd": 10,
                "emoji": "🚀",
                "titulo": "Quiz de Espaço e astronomia"
            }
        },
        {
            "palavras": [
                "quimica"
            ],
            "rotulo": "Química",
            "config": {
                "motor": "quiz",
                "tema": "quimica",
                "qtd": 5,
                "emoji": "⚗️",
                "titulo": "Quiz de Química"
            }
        },
        {
            "palavras": [
                "quimica",
                "10"
            ],
            "rotulo": "Química, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "quimica",
                "qtd": 10,
                "emoji": "⚗️",
                "titulo": "Quiz de Química"
            }
        },
        {
            "palavras": [
                "fisica"
            ],
            "rotulo": "Física",
            "config": {
                "motor": "quiz",
                "tema": "fisica",
                "qtd": 5,
                "emoji": "🧲",
                "titulo": "Quiz de Física"
            }
        },
        {
            "palavras": [
                "fisica",
                "10"
            ],
            "rotulo": "Física, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "fisica",
                "qtd": 10,
                "emoji": "🧲",
                "titulo": "Quiz de Física"
            }
        },
        {
            "palavras": [
                "biologia"
            ],
            "rotulo": "Biologia",
            "config": {
                "motor": "quiz",
                "tema": "biologia",
                "qtd": 5,
                "emoji": "🧬",
                "titulo": "Quiz de Biologia"
            }
        },
        {
            "palavras": [
                "biologia",
                "10"
            ],
            "rotulo": "Biologia, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "biologia",
                "qtd": 10,
                "emoji": "🧬",
                "titulo": "Quiz de Biologia"
            }
        },
        {
            "palavras": [
                "carros"
            ],
            "rotulo": "Carros e automobilismo",
            "config": {
                "motor": "quiz",
                "tema": "carros",
                "qtd": 5,
                "emoji": "🏎️",
                "titulo": "Quiz de Carros e automobilismo"
            }
        },
        {
            "palavras": [
                "carros",
                "10"
            ],
            "rotulo": "Carros e automobilismo, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "carros",
                "qtd": 10,
                "emoji": "🏎️",
                "titulo": "Quiz de Carros e automobilismo"
            }
        },
        {
            "palavras": [
                "esportes"
            ],
            "rotulo": "Esportes variados",
            "config": {
                "motor": "quiz",
                "tema": "esportes",
                "qtd": 5,
                "emoji": "🏅",
                "titulo": "Quiz de Esportes variados"
            }
        },
        {
            "palavras": [
                "esportes",
                "10"
            ],
            "rotulo": "Esportes variados, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "esportes",
                "qtd": 10,
                "emoji": "🏅",
                "titulo": "Quiz de Esportes variados"
            }
        },
        {
            "palavras": [
                "olimpiadas"
            ],
            "rotulo": "Jogos Olímpicos",
            "config": {
                "motor": "quiz",
                "tema": "olimpiadas",
                "qtd": 5,
                "emoji": "🔥",
                "titulo": "Quiz de Jogos Olímpicos"
            }
        },
        {
            "palavras": [
                "olimpiadas",
                "10"
            ],
            "rotulo": "Jogos Olímpicos, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "olimpiadas",
                "qtd": 10,
                "emoji": "🔥",
                "titulo": "Quiz de Jogos Olímpicos"
            }
        },
        {
            "palavras": [
                "series"
            ],
            "rotulo": "Séries de TV",
            "config": {
                "motor": "quiz",
                "tema": "series",
                "qtd": 5,
                "emoji": "🍿",
                "titulo": "Quiz de Séries de TV"
            }
        },
        {
            "palavras": [
                "series",
                "10"
            ],
            "rotulo": "Séries de TV, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "series",
                "qtd": 10,
                "emoji": "🍿",
                "titulo": "Quiz de Séries de TV"
            }
        },
        {
            "palavras": [
                "disney"
            ],
            "rotulo": "Mundo Disney",
            "config": {
                "motor": "quiz",
                "tema": "disney",
                "qtd": 5,
                "emoji": "🏰",
                "titulo": "Quiz de Mundo Disney"
            }
        },
        {
            "palavras": [
                "disney",
                "10"
            ],
            "rotulo": "Mundo Disney, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "disney",
                "qtd": 10,
                "emoji": "🏰",
                "titulo": "Quiz de Mundo Disney"
            }
        },
        {
            "palavras": [
                "marvel"
            ],
            "rotulo": "Universo Marvel",
            "config": {
                "motor": "quiz",
                "tema": "marvel",
                "qtd": 5,
                "emoji": "🦸",
                "titulo": "Quiz de Universo Marvel"
            }
        },
        {
            "palavras": [
                "marvel",
                "10"
            ],
            "rotulo": "Universo Marvel, 10 perguntas",
            "config": {
                "motor": "quiz",
                "tema": "marvel",
                "qtd": 10,
                "emoji": "🦸",
                "titulo": "Quiz de Universo Marvel"
            }
        }
    ],
    "atalhos": {
        "jogo1": 0,
        "jogo2": 1,
        "jogo3": 2,
        "jogo4": 3,
        "jogo5": 4,
        "jogo6": 5,
        "jogo7": 6,
        "jogo8": 7,
        "jogo9": 8,
        "jogo10": 9,
        "jogo11": 10,
        "jogo12": 11,
        "jogo13": 12,
        "jogo14": 13,
        "jogo15": 14,
        "jogo16": 15,
        "jogo17": 16,
        "jogo18": 17,
        "jogo19": 18,
        "jogo20": 19,
        "jogo21": 20,
        "jogo22": 21,
        "jogo23": 22,
        "jogo24": 23,
        "jogo25": 24,
        "jogo26": 25,
        "jogo27": 26,
        "jogo28": 27,
        "jogo29": 28,
        "jogo30": 29,
        "jogo31": 30,
        "jogo32": 31,
        "jogo33": 32,
        "jogo34": 33,
        "jogo35": 34,
        "jogo36": 35,
        "jogo37": 36,
        "jogo38": 37,
        "jogo39": 38,
        "jogo40": 39,
        "jogo41": 40,
        "jogo42": 41,
        "jogo43": 42,
        "jogo44": 43,
        "jogo45": 44,
        "jogo46": 45,
        "jogo47": 46,
        "jogo48": 47,
        "jogo49": 48,
        "jogo50": 49,
        "jogo51": 50,
        "jogo52": 51,
        "jogo53": 52,
        "jogo54": 53,
        "jogo55": 54,
        "jogo56": 55,
        "jogo57": 56,
        "jogo58": 57,
        "jogo59": 58,
        "jogo60": 59,
        "jogo61": 60,
        "jogo62": 61,
        "jogo63": 62,
        "jogo64": 63,
        "jogo65": 64,
        "jogo66": 65,
        "jogo67": 66,
        "jogo68": 67,
        "jogo69": 68,
        "jogo70": 69,
        "jogo71": 70,
        "jogo72": 71,
        "jogo73": 72,
        "jogo74": 73,
        "jogo75": 74,
        "jogo76": 75,
        "jogo77": 76,
        "jogo78": 77,
        "jogo79": 78,
        "jogo80": 79
    }
}

module.exports = {
    name: "quiztema",
    aliases: ["jogo1","jogo2","jogo3","jogo4","jogo5","jogo6","jogo7","jogo8","jogo9","jogo10","jogo11","jogo12","jogo13","jogo14","jogo15","jogo16","jogo17","jogo18","jogo19","jogo20","jogo21","jogo22","jogo23","jogo24","jogo25","jogo26","jogo27","jogo28","jogo29","jogo30","jogo31","jogo32","jogo33","jogo34","jogo35","jogo36","jogo37","jogo38","jogo39","jogo40","jogo41","jogo42","jogo43","jogo44","jogo45","jogo46","jogo47","jogo48","jogo49","jogo50","jogo51","jogo52","jogo53","jogo54","jogo55","jogo56","jogo57","jogo58","jogo59","jogo60","jogo61","jogo62","jogo63","jogo64","jogo65","jogo66","jogo67","jogo68","jogo69","jogo70","jogo71","jogo72","jogo73","jogo74","jogo75","jogo76","jogo77","jogo78","jogo79","jogo80"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Quiz de múltipla escolha: escolha tema e tamanho",
    usage: "[opção] [jogada | parar]",
    examples: ["bandeiras — começa: Bandeiras do mundo"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
