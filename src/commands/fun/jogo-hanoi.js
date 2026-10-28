/**
 * .hanoi — Torre de Hanói com 3 a 6 discos
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 4 comandos antigos
 * (.jogo221, .jogo222, .jogo223, .jogo224), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "hanoi",
    "titulo": "Torre de Hanói",
    "emoji": "🗼",
    "intro": "Escolha quantos discos:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 discos",
            "config": {
                "motor": "hanoi",
                "discos": 3,
                "titulo": "Torre de Hanói com 3 discos"
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 discos",
            "config": {
                "motor": "hanoi",
                "discos": 4,
                "titulo": "Torre de Hanói com 4 discos"
            }
        },
        {
            "palavras": [
                "5"
            ],
            "rotulo": "5 discos",
            "config": {
                "motor": "hanoi",
                "discos": 5,
                "titulo": "Torre de Hanói com 5 discos"
            }
        },
        {
            "palavras": [
                "6"
            ],
            "rotulo": "6 discos",
            "config": {
                "motor": "hanoi",
                "discos": 6,
                "titulo": "Torre de Hanói com 6 discos"
            }
        }
    ],
    "atalhos": {
        "jogo221": 0,
        "jogo222": 1,
        "jogo223": 2,
        "jogo224": 3
    }
}

module.exports = {
    name: "hanoi",
    aliases: ["jogo221","jogo222","jogo223","jogo224"],
    category: 'fun',
    subcategory: "Jogos de Mesa",
    description: "Torre de Hanói com 3 a 6 discos",
    usage: "[opção] [jogada | parar]",
    examples: ["3 — começa: 3 discos"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
