/**
 * .eleicao — Sorteia cargos para o grupo eleger
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 4 comandos antigos
 * (.jogo183, .jogo184, .jogo185, .jogo186), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "eleicao",
    "titulo": "Eleição do grupo",
    "emoji": "🗳️",
    "intro": "Escolha quantos cargos:",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 cargos",
            "config": {
                "motor": "eleicao",
                "titulo": "Eleição da taverna",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "2"
            ],
            "rotulo": "2 cargos",
            "config": {
                "motor": "eleicao",
                "titulo": "Eleição relâmpago",
                "qtd": 2
            }
        },
        {
            "palavras": [
                "5"
            ],
            "rotulo": "5 cargos",
            "config": {
                "motor": "eleicao",
                "titulo": "Eleição geral do grupo",
                "qtd": 5
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 cargos",
            "config": {
                "motor": "eleicao",
                "titulo": "Eleição com cargo novo",
                "qtd": 4
            }
        }
    ],
    "atalhos": {
        "jogo183": 0,
        "jogo184": 1,
        "jogo185": 2,
        "jogo186": 3
    }
}

module.exports = {
    name: "eleicao",
    aliases: ["jogo183","jogo184","jogo185","jogo186"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Sorteia cargos para o grupo eleger",
    usage: "[opção] [jogada | parar]",
    examples: ["3 — começa: 3 cargos"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
