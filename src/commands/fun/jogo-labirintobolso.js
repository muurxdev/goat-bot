/**
 * .labirintobolso — Ache a saída do labirinto
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 4 comandos antigos
 * (.jogo225, .jogo226, .jogo227, .jogo228), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "labirintobolso",
    "titulo": "Labirinto de bolso",
    "emoji": "🧭",
    "intro": "Escolha o tamanho:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "3"
            ],
            "rotulo": "Labirinto de bolso",
            "config": {
                "motor": "labirinto",
                "celulas": 3,
                "titulo": "Labirinto de bolso"
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "Labirinto normal",
            "config": {
                "motor": "labirinto",
                "celulas": 4,
                "titulo": "Labirinto normal"
            }
        },
        {
            "palavras": [
                "5"
            ],
            "rotulo": "Labirinto grande",
            "config": {
                "motor": "labirinto",
                "celulas": 5,
                "titulo": "Labirinto grande"
            }
        },
        {
            "palavras": [
                "6"
            ],
            "rotulo": "Labirinto enorme",
            "config": {
                "motor": "labirinto",
                "celulas": 6,
                "titulo": "Labirinto enorme"
            }
        }
    ],
    "atalhos": {
        "jogo225": 0,
        "jogo226": 1,
        "jogo227": 2,
        "jogo228": 3
    }
}

module.exports = {
    name: "labirintobolso",
    aliases: ["jogo225","jogo226","jogo227","jogo228"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Ache a saída do labirinto",
    usage: "[opção] [jogada | parar]",
    examples: ["3 — começa: Labirinto de bolso"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
