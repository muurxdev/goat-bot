/**
 * .sudokubolso — Sudoku 4x4 em três níveis
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 3 comandos antigos
 * (.jogo216, .jogo217, .jogo218), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "sudokubolso",
    "titulo": "Sudoku de bolso",
    "emoji": "🔢",
    "intro": "Escolha a dificuldade:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "facil"
            ],
            "rotulo": "fácil",
            "config": {
                "motor": "sudoku",
                "buracos": 4,
                "titulo": "Sudoku de bolso fácil"
            }
        },
        {
            "palavras": [
                "medio"
            ],
            "rotulo": "médio",
            "config": {
                "motor": "sudoku",
                "buracos": 6,
                "titulo": "Sudoku de bolso médio"
            }
        },
        {
            "palavras": [
                "dificil"
            ],
            "rotulo": "difícil",
            "config": {
                "motor": "sudoku",
                "buracos": 8,
                "titulo": "Sudoku de bolso difícil"
            }
        }
    ],
    "atalhos": {
        "jogo216": 0,
        "jogo217": 1,
        "jogo218": 2
    }
}

module.exports = {
    name: "sudokubolso",
    aliases: ["jogo216","jogo217","jogo218"],
    category: 'fun',
    subcategory: "Jogos de Mesa",
    description: "Sudoku 4x4 em três níveis",
    usage: "[opção] [jogada | parar]",
    examples: ["facil — começa: fácil"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
