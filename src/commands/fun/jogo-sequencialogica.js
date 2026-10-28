/**
 * .sequencialogica — Descubra o próximo termo da sequência
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 6 comandos antigos
 * (.jogo236, .jogo237, .jogo238, .jogo239…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "sequencialogica",
    "titulo": "Sequência lógica",
    "emoji": "🔗",
    "intro": "Escolha quantas tentativas:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "5"
            ],
            "rotulo": "5 tentativas",
            "config": {
                "motor": "sequencia",
                "tentativas": 5,
                "titulo": "Sequência lógica com folga"
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 tentativas",
            "config": {
                "motor": "sequencia",
                "tentativas": 4,
                "titulo": "Sequência lógica tranquila"
            }
        },
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 tentativas",
            "config": {
                "motor": "sequencia",
                "tentativas": 3,
                "titulo": "Sequência lógica padrão"
            }
        },
        {
            "palavras": [
                "2"
            ],
            "rotulo": "2 tentativas",
            "config": {
                "motor": "sequencia",
                "tentativas": 2,
                "titulo": "Sequência lógica apertada"
            }
        },
        {
            "palavras": [
                "1"
            ],
            "rotulo": "1 tentativas",
            "config": {
                "motor": "sequencia",
                "tentativas": 1,
                "titulo": "Sequência lógica tiro único"
            }
        }
    ],
    "atalhos": {
        "jogo236": 0,
        "jogo237": 1,
        "jogo238": 2,
        "jogo239": 2,
        "jogo240": 3,
        "jogo241": 4
    }
}

module.exports = {
    name: "sequencialogica",
    aliases: ["jogo236","jogo237","jogo238","jogo239","jogo240","jogo241"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Descubra o próximo termo da sequência",
    usage: "[opção] [jogada | parar]",
    examples: ["5 — começa: 5 tentativas"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
