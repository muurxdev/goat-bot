/**
 * .tabu — Descreva a palavra sem usar as proibidas
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 1 comandos antigos
 * (.jogo138), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "tabu",
    "titulo": "Palavra proibida",
    "emoji": "🤐",
    "intro": "",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [],
            "rotulo": "Palavra proibida",
            "config": {
                "motor": "proibida",
                "qtd": 2,
                "titulo": "Palavra proibida"
            }
        }
    ],
    "atalhos": {
        "jogo138": 0
    }
}

module.exports = {
    name: "tabu",
    aliases: ["jogo138"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Descreva a palavra sem usar as proibidas",
    usage: "[jogada | parar]",
    examples: [" — começa uma rodada"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
