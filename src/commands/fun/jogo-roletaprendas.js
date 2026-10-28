/**
 * .roletaprendas — Roleta de prendas para o grupo
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 4 comandos antigos
 * (.jogo208, .jogo209, .jogo210, .jogo211), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "roletaprendas",
    "titulo": "Roleta de prendas",
    "emoji": "🎯",
    "intro": "Escolha quantas prendas:",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 prendas",
            "config": {
                "motor": "roleta",
                "titulo": "Roleta de prendas",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "2"
            ],
            "rotulo": "2 prendas",
            "config": {
                "motor": "roleta",
                "titulo": "Roleta relâmpago",
                "qtd": 2
            }
        },
        {
            "palavras": [
                "5"
            ],
            "rotulo": "5 prendas",
            "config": {
                "motor": "roleta",
                "titulo": "Roleta cheia",
                "qtd": 5
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 prendas",
            "config": {
                "motor": "roleta",
                "titulo": "Roleta da taverna",
                "qtd": 4
            }
        }
    ],
    "atalhos": {
        "jogo208": 0,
        "jogo209": 1,
        "jogo210": 2,
        "jogo211": 3
    }
}

module.exports = {
    name: "roletaprendas",
    aliases: ["jogo208","jogo209","jogo210","jogo211"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Roleta de prendas para o grupo",
    usage: "[opção] [jogada | parar]",
    examples: ["3 — começa: 3 prendas"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
