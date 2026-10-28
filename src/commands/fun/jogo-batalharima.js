/**
 * .batalharima — Batalha de rima com o tema escolhido
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 2 comandos antigos
 * (.jogo134, .jogo135), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "batalharima",
    "titulo": "Batalha de rima",
    "emoji": "🎤",
    "intro": "Escolha o tema da batalha:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "animais"
            ],
            "rotulo": "animais",
            "config": {
                "motor": "rima",
                "tema": "animais",
                "qtd": 3,
                "emoji": "🎤",
                "titulo": "Batalha de rima — animais"
            }
        },
        {
            "palavras": [
                "objetos"
            ],
            "rotulo": "objetos",
            "config": {
                "motor": "rima",
                "tema": "objetos",
                "qtd": 3,
                "emoji": "🎤",
                "titulo": "Batalha de rima — objetos"
            }
        }
    ],
    "atalhos": {
        "jogo134": 0,
        "jogo135": 1
    }
}

module.exports = {
    name: "batalharima",
    aliases: ["jogo134","jogo135"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Batalha de rima com o tema escolhido",
    usage: "[opção] [jogada | parar]",
    examples: ["animais — começa: animais"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
