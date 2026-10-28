/**
 * .embaralhada — Palavra embaralhada sem dica: a versão difícil
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 3 comandos antigos
 * (.jogo111, .jogo112, .jogo113), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "embaralhada",
    "titulo": "Palavra embaralhada",
    "emoji": "🌀",
    "intro": "Só as letras fora de ordem, sem dica.",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "comidas"
            ],
            "rotulo": "Comidas",
            "config": {
                "motor": "palavra",
                "modo": "embaralhada",
                "tema": "comidas",
                "tentativas": 3,
                "emoji": "🍛",
                "titulo": "Palavra embaralhada: Comidas"
            }
        },
        {
            "palavras": [
                "cores"
            ],
            "rotulo": "Cores e tons",
            "config": {
                "motor": "palavra",
                "modo": "embaralhada",
                "tema": "cores",
                "tentativas": 3,
                "emoji": "🎨",
                "titulo": "Palavra embaralhada: Cores e tons"
            }
        },
        {
            "palavras": [
                "corpo"
            ],
            "rotulo": "Corpo humano",
            "config": {
                "motor": "palavra",
                "modo": "embaralhada",
                "tema": "corpo",
                "tentativas": 3,
                "emoji": "🫁",
                "titulo": "Palavra embaralhada: Corpo humano"
            }
        }
    ],
    "atalhos": {
        "jogo111": 0,
        "jogo112": 1,
        "jogo113": 2
    }
}

module.exports = {
    name: "embaralhada",
    aliases: ["jogo111","jogo112","jogo113"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Palavra embaralhada sem dica: a versão difícil",
    usage: "[opção] [jogada | parar]",
    examples: ["comidas — começa: Comidas"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
