/**
 * .logica — Quebra-cabeça de lógica com tentativas contadas
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 7 comandos antigos
 * (.jogo229, .jogo230, .jogo231, .jogo232…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "logica",
    "titulo": "Quebra-cabeça lógico",
    "emoji": "🧩",
    "intro": "Escolha quantas tentativas:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "5"
            ],
            "rotulo": "5 tentativas",
            "config": {
                "motor": "logica",
                "tentativas": 5,
                "titulo": "Quebra-cabeça lógico com folga"
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 tentativas",
            "config": {
                "motor": "logica",
                "tentativas": 4,
                "titulo": "Quebra-cabeça lógico tranquilo"
            }
        },
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 tentativas",
            "config": {
                "motor": "logica",
                "tentativas": 3,
                "titulo": "Quebra-cabeça lógico padrão"
            }
        },
        {
            "palavras": [
                "2"
            ],
            "rotulo": "2 tentativas",
            "config": {
                "motor": "logica",
                "tentativas": 2,
                "titulo": "Quebra-cabeça lógico apertado"
            }
        },
        {
            "palavras": [
                "1"
            ],
            "rotulo": "1 tentativas",
            "config": {
                "motor": "logica",
                "tentativas": 1,
                "titulo": "Quebra-cabeça lógico tiro único"
            }
        }
    ],
    "atalhos": {
        "jogo229": 0,
        "jogo230": 1,
        "jogo231": 2,
        "jogo232": 2,
        "jogo233": 3,
        "jogo234": 3,
        "jogo235": 4
    }
}

module.exports = {
    name: "logica",
    aliases: ["jogo229","jogo230","jogo231","jogo232","jogo233","jogo234","jogo235"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Quebra-cabeça de lógica com tentativas contadas",
    usage: "[opção] [jogada | parar]",
    examples: ["5 — começa: 5 tentativas"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
