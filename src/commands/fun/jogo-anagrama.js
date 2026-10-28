/**
 * .anagrama — Anagrama do tema escolhido, com dica junto
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 7 comandos antigos
 * (.desembaralhar, .jogo105, .jogo106, .jogo107…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "anagrama",
    "titulo": "Anagrama",
    "emoji": "🔀",
    "intro": "Letras embaralhadas com a dica do tema por cima.",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "animais"
            ],
            "rotulo": "Bichos",
            "config": {
                "motor": "palavra",
                "modo": "anagrama",
                "tema": "animais",
                "tentativas": 4,
                "emoji": "🐾",
                "titulo": "Anagrama de Bichos"
            }
        },
        {
            "palavras": [
                "frutas"
            ],
            "rotulo": "Frutas",
            "config": {
                "motor": "palavra",
                "modo": "anagrama",
                "tema": "frutas",
                "tentativas": 4,
                "emoji": "🍉",
                "titulo": "Anagrama de Frutas"
            }
        },
        {
            "palavras": [
                "paises"
            ],
            "rotulo": "Países",
            "config": {
                "motor": "palavra",
                "modo": "anagrama",
                "tema": "paises",
                "tentativas": 4,
                "emoji": "🌎",
                "titulo": "Anagrama de Países"
            }
        },
        {
            "palavras": [
                "profissoes"
            ],
            "rotulo": "Profissões",
            "config": {
                "motor": "palavra",
                "modo": "anagrama",
                "tema": "profissoes",
                "tentativas": 4,
                "emoji": "🧰",
                "titulo": "Anagrama de Profissões"
            }
        },
        {
            "palavras": [
                "objetos"
            ],
            "rotulo": "Objetos de casa",
            "config": {
                "motor": "palavra",
                "modo": "anagrama",
                "tema": "objetos",
                "tentativas": 4,
                "emoji": "🪑",
                "titulo": "Anagrama de Objetos de casa"
            }
        },
        {
            "palavras": [
                "esportes"
            ],
            "rotulo": "Esportes",
            "config": {
                "motor": "palavra",
                "modo": "anagrama",
                "tema": "esportes",
                "tentativas": 4,
                "emoji": "🏐",
                "titulo": "Anagrama de Esportes"
            }
        }
    ],
    "atalhos": {
        "jogo105": 0,
        "jogo106": 1,
        "jogo107": 2,
        "jogo108": 3,
        "jogo109": 4,
        "jogo110": 5,
        "desembaralhar": 0
    }
}

module.exports = {
    name: "anagrama",
    aliases: ["desembaralhar","jogo105","jogo106","jogo107","jogo108","jogo109","jogo110"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Anagrama do tema escolhido, com dica junto",
    usage: "[opção] [jogada | parar]",
    examples: ["animais — começa: Bichos"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
