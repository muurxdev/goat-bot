/**
 * .rankingzoeira — Sorteia categorias para o grupo votar
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 4 comandos antigos
 * (.jogo187, .jogo188, .jogo189, .jogo190), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "rankingzoeira",
    "titulo": "Ranking da zoeira",
    "emoji": "🏅",
    "intro": "Escolha quantas categorias:",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 categorias",
            "config": {
                "motor": "ranking",
                "titulo": "Ranking do grupo",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "2"
            ],
            "rotulo": "2 categorias",
            "config": {
                "motor": "ranking",
                "titulo": "Ranking relâmpago",
                "qtd": 2
            }
        },
        {
            "palavras": [
                "5"
            ],
            "rotulo": "5 categorias",
            "config": {
                "motor": "ranking",
                "titulo": "Ranking completo do grupo",
                "qtd": 5
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 categorias",
            "config": {
                "motor": "ranking",
                "titulo": "Ranking da zoeira",
                "qtd": 4
            }
        }
    ],
    "atalhos": {
        "jogo187": 0,
        "jogo188": 1,
        "jogo189": 2,
        "jogo190": 3
    }
}

module.exports = {
    name: "rankingzoeira",
    aliases: ["jogo187","jogo188","jogo189","jogo190"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Sorteia categorias para o grupo votar",
    usage: "[opção] [jogada | parar]",
    examples: ["3 — começa: 3 categorias"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
