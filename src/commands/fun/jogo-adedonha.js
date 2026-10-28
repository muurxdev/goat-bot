/**
 * .adedonha — Stop com letra sorteada e 4 ou 6 categorias
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 2 comandos antigos
 * (.jogo136, .jogo137), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "adedonha",
    "titulo": "Stop da taverna",
    "emoji": "🛑",
    "intro": "Escolha quantas categorias:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 categorias",
            "config": {
                "motor": "stop",
                "qtd": 4,
                "emoji": "🛑",
                "titulo": "Stop da taverna"
            }
        },
        {
            "palavras": [
                "6"
            ],
            "rotulo": "6 categorias",
            "config": {
                "motor": "stop",
                "qtd": 6,
                "emoji": "🛑",
                "titulo": "Stop da taverna"
            }
        }
    ],
    "atalhos": {
        "jogo136": 0,
        "jogo137": 1
    }
}

module.exports = {
    name: "adedonha",
    aliases: ["jogo136","jogo137"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Stop com letra sorteada e 4 ou 6 categorias",
    usage: "[opção] [jogada | parar]",
    examples: ["4 — começa: 4 categorias"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
