/**
 * .adivinhe — Adivinhe a palavra do tema pela dica
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 12 comandos antigos
 * (.jogo93, .jogo94, .jogo95, .jogo96…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "adivinhe",
    "titulo": "Adivinhe a palavra",
    "emoji": "💬",
    "intro": "Uma dica e quatro tentativas; a cada erro eu revelo uma letra.",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "animais"
            ],
            "rotulo": "Bichos",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "animais",
                "tentativas": 4,
                "emoji": "🐾",
                "titulo": "Adivinhe: Bichos"
            }
        },
        {
            "palavras": [
                "frutas"
            ],
            "rotulo": "Frutas",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "frutas",
                "tentativas": 4,
                "emoji": "🍉",
                "titulo": "Adivinhe: Frutas"
            }
        },
        {
            "palavras": [
                "paises"
            ],
            "rotulo": "Países",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "paises",
                "tentativas": 4,
                "emoji": "🌎",
                "titulo": "Adivinhe: Países"
            }
        },
        {
            "palavras": [
                "profissoes"
            ],
            "rotulo": "Profissões",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "profissoes",
                "tentativas": 4,
                "emoji": "🧰",
                "titulo": "Adivinhe: Profissões"
            }
        },
        {
            "palavras": [
                "objetos"
            ],
            "rotulo": "Objetos de casa",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "objetos",
                "tentativas": 4,
                "emoji": "🪑",
                "titulo": "Adivinhe: Objetos de casa"
            }
        },
        {
            "palavras": [
                "esportes"
            ],
            "rotulo": "Esportes",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "esportes",
                "tentativas": 4,
                "emoji": "🏐",
                "titulo": "Adivinhe: Esportes"
            }
        },
        {
            "palavras": [
                "comidas"
            ],
            "rotulo": "Comidas",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "comidas",
                "tentativas": 4,
                "emoji": "🍛",
                "titulo": "Adivinhe: Comidas"
            }
        },
        {
            "palavras": [
                "cores"
            ],
            "rotulo": "Cores e tons",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "cores",
                "tentativas": 4,
                "emoji": "🎨",
                "titulo": "Adivinhe: Cores e tons"
            }
        },
        {
            "palavras": [
                "corpo"
            ],
            "rotulo": "Corpo humano",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "corpo",
                "tentativas": 4,
                "emoji": "🫁",
                "titulo": "Adivinhe: Corpo humano"
            }
        },
        {
            "palavras": [
                "natureza"
            ],
            "rotulo": "Natureza",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "natureza",
                "tentativas": 4,
                "emoji": "🌳",
                "titulo": "Adivinhe: Natureza"
            }
        },
        {
            "palavras": [
                "tecnologia"
            ],
            "rotulo": "Tecnologia",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "tecnologia",
                "tentativas": 4,
                "emoji": "🔌",
                "titulo": "Adivinhe: Tecnologia"
            }
        },
        {
            "palavras": [
                "musica"
            ],
            "rotulo": "Música",
            "config": {
                "motor": "palavra",
                "modo": "dica",
                "tema": "musica",
                "tentativas": 4,
                "emoji": "🎼",
                "titulo": "Adivinhe: Música"
            }
        }
    ],
    "atalhos": {
        "jogo93": 0,
        "jogo94": 1,
        "jogo95": 2,
        "jogo96": 3,
        "jogo97": 4,
        "jogo98": 5,
        "jogo99": 6,
        "jogo100": 7,
        "jogo101": 8,
        "jogo102": 9,
        "jogo103": 10,
        "jogo104": 11
    }
}

module.exports = {
    name: "adivinhe",
    aliases: ["jogo93","jogo94","jogo95","jogo96","jogo97","jogo98","jogo99","jogo100","jogo101","jogo102","jogo103","jogo104"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Adivinhe a palavra do tema pela dica",
    usage: "[opção] [jogada | parar]",
    examples: ["animais — começa: Bichos"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
