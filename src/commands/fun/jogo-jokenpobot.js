/**
 * .jokenpobot — Pedra, papel e tesoura contra mim
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 3 comandos antigos
 * (.jogo200, .jogo201, .jogo202), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "jokenpobot",
    "titulo": "Pedra, papel e tesoura",
    "emoji": "✊",
    "intro": "Escolha quantas vitórias fecham a partida:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "1"
            ],
            "rotulo": "rodada única",
            "config": {
                "motor": "jokenpo",
                "vitorias": 1,
                "titulo": "Pedra, papel e tesoura — rodada única"
            }
        },
        {
            "palavras": [
                "3"
            ],
            "rotulo": "melhor de cinco",
            "config": {
                "motor": "jokenpo",
                "vitorias": 3,
                "titulo": "Pedra, papel e tesoura — melhor de cinco"
            }
        },
        {
            "palavras": [
                "5"
            ],
            "rotulo": "melhor de nove",
            "config": {
                "motor": "jokenpo",
                "vitorias": 5,
                "titulo": "Pedra, papel e tesoura — melhor de nove"
            }
        }
    ],
    "atalhos": {
        "jogo200": 0,
        "jogo201": 1,
        "jogo202": 2
    }
}

module.exports = {
    name: "jokenpobot",
    aliases: ["jogo200","jogo201","jogo202"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Pedra, papel e tesoura contra mim",
    usage: "[opção] [jogada | parar]",
    examples: ["1 — começa: rodada única"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
