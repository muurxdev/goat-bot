/**
 * .memoria — Repita a sequência que cresce a cada rodada
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 7 comandos antigos
 * (.cartas-memoria, .jogo212, .jogo213, .jogo214…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "memoria",
    "titulo": "Sequência de memória",
    "emoji": "🧠",
    "intro": "Escolha os símbolos:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "numeros"
            ],
            "rotulo": "1 2 3 4 (até o nível 7)",
            "config": {
                "motor": "memoria",
                "simbolos": [
                    "1",
                    "2",
                    "3",
                    "4"
                ],
                "nivelMaximo": 7,
                "titulo": "Sequência de memória"
            }
        },
        {
            "palavras": [
                "numeros6"
            ],
            "rotulo": "1 2 3 4 5 6 (até o nível 9)",
            "config": {
                "motor": "memoria",
                "simbolos": [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6"
                ],
                "nivelMaximo": 9,
                "titulo": "Sequência de memória"
            }
        },
        {
            "palavras": [
                "letras"
            ],
            "rotulo": "A B C D (até o nível 8)",
            "config": {
                "motor": "memoria",
                "simbolos": [
                    "A",
                    "B",
                    "C",
                    "D"
                ],
                "nivelMaximo": 8,
                "titulo": "Sequência de memória"
            }
        },
        {
            "palavras": [
                "numeros8"
            ],
            "rotulo": "1 2 3 4 5 6 7 8 (até o nível 12)",
            "config": {
                "motor": "memoria",
                "simbolos": [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8"
                ],
                "nivelMaximo": 12,
                "titulo": "Sequência de memória"
            }
        }
    ],
    "atalhos": {
        "jogo212": 0,
        "jogo213": 1,
        "jogo214": 2,
        "jogo215": 3,
        "jogomemoria": 0,
        "memory": 0,
        "cartas-memoria": 0
    }
}

module.exports = {
    name: "memoria",
    aliases: ["cartas-memoria","jogo212","jogo213","jogo214","jogo215","jogomemoria","memory"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Repita a sequência que cresce a cada rodada",
    usage: "[opção] [jogada | parar]",
    examples: ["numeros — começa: 1 2 3 4 (até o nível 7)"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
