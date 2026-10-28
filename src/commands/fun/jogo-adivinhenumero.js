/**
 * .adivinhenumero — Adivinhe o número; eu digo se é maior ou menor
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 6 comandos antigos
 * (.jogo191, .jogo192, .jogo193, .jogo194…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "adivinhenumero",
    "titulo": "Adivinhe o número",
    "emoji": "🔢",
    "intro": "Escolha até onde vai o número:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "20"
            ],
            "rotulo": "de 1 a 20",
            "config": {
                "motor": "numero",
                "max": 20,
                "titulo": "Adivinhe o número de 1 a 20"
            }
        },
        {
            "palavras": [
                "50"
            ],
            "rotulo": "de 1 a 50",
            "config": {
                "motor": "numero",
                "max": 50,
                "titulo": "Adivinhe o número de 1 a 50"
            }
        },
        {
            "palavras": [
                "100"
            ],
            "rotulo": "de 1 a 100",
            "config": {
                "motor": "numero",
                "max": 100,
                "titulo": "Adivinhe o número de 1 a 100"
            }
        },
        {
            "palavras": [
                "500"
            ],
            "rotulo": "de 1 a 500",
            "config": {
                "motor": "numero",
                "max": 500,
                "titulo": "Adivinhe o número de 1 a 500"
            }
        },
        {
            "palavras": [
                "1000"
            ],
            "rotulo": "de 1 a 1000",
            "config": {
                "motor": "numero",
                "max": 1000,
                "titulo": "Adivinhe o número de 1 a 1000"
            }
        },
        {
            "palavras": [
                "10000"
            ],
            "rotulo": "de 1 a 10000",
            "config": {
                "motor": "numero",
                "max": 10000,
                "titulo": "Adivinhe o número de 1 a 10000"
            }
        }
    ],
    "atalhos": {
        "jogo191": 0,
        "jogo192": 1,
        "jogo193": 2,
        "jogo194": 3,
        "jogo195": 4,
        "jogo196": 5
    }
}

module.exports = {
    name: "adivinhenumero",
    aliases: ["jogo191","jogo192","jogo193","jogo194","jogo195","jogo196"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Adivinhe o número; eu digo se é maior ou menor",
    usage: "[opção] [jogada | parar]",
    examples: ["20 — começa: de 1 a 20"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
