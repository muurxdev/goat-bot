/**
 * .velhabot — Jogo da velha contra o bot, em três níveis
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 3 comandos antigos
 * (.jogo197, .jogo198, .jogo199), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "velhabot",
    "titulo": "Jogo da velha contra mim",
    "emoji": "⭕",
    "intro": "Escolha a dificuldade:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "facil"
            ],
            "rotulo": "moleza",
            "config": {
                "motor": "velha",
                "dificuldade": "facil",
                "titulo": "Jogo da velha moleza"
            }
        },
        {
            "palavras": [
                "medio"
            ],
            "rotulo": "na medida",
            "config": {
                "motor": "velha",
                "dificuldade": "medio",
                "titulo": "Jogo da velha na medida"
            }
        },
        {
            "palavras": [
                "impossivel"
            ],
            "rotulo": "impossível",
            "config": {
                "motor": "velha",
                "dificuldade": "impossivel",
                "titulo": "Jogo da velha impossível"
            }
        }
    ],
    "atalhos": {
        "jogo197": 0,
        "jogo198": 1,
        "jogo199": 2
    }
}

module.exports = {
    name: "velhabot",
    aliases: ["jogo197","jogo198","jogo199"],
    category: 'fun',
    subcategory: "Jogos de Mesa",
    description: "Jogo da velha contra o bot, em três níveis",
    usage: "[opção] [jogada | parar]",
    examples: ["facil — começa: moleza"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
