/**
 * .mimica — Mímica com o tema escolhido
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 4 comandos antigos
 * (.jogo179, .jogo180, .jogo181, .jogo182), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "mimica",
    "titulo": "Mímica",
    "emoji": "🎭",
    "intro": "Escolha o tema:",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "filmes"
            ],
            "rotulo": "filmes",
            "config": {
                "motor": "mimica",
                "tema": "filmes",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "profissoes"
            ],
            "rotulo": "profissoes",
            "config": {
                "motor": "mimica",
                "tema": "profissoes",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "animais"
            ],
            "rotulo": "animais",
            "config": {
                "motor": "mimica",
                "tema": "animais",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "acoes"
            ],
            "rotulo": "acoes",
            "config": {
                "motor": "mimica",
                "tema": "acoes",
                "qtd": 3
            }
        }
    ],
    "atalhos": {
        "jogo179": 0,
        "jogo180": 1,
        "jogo181": 2,
        "jogo182": 3
    }
}

module.exports = {
    name: "mimica",
    aliases: ["jogo179","jogo180","jogo181","jogo182"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Mímica com o tema escolhido",
    usage: "[opção] [jogada | parar]",
    examples: ["filmes — começa: filmes"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
