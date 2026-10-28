/**
 * .rolardados — Rola dados de 6, 12, 20 ou 100 faces
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 5 comandos antigos
 * (.jogo203, .jogo204, .jogo205, .jogo206…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "rolardados",
    "titulo": "Rolar dados",
    "emoji": "🎲",
    "intro": "Escolha o dado:",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "d6"
            ],
            "rotulo": "Rolar um dado",
            "config": {
                "motor": "dados",
                "faces": 6,
                "qtd": 1,
                "titulo": "Rolar um dado"
            }
        },
        {
            "palavras": [
                "2d6"
            ],
            "rotulo": "Rolar dois dados",
            "config": {
                "motor": "dados",
                "faces": 6,
                "qtd": 2,
                "titulo": "Rolar dois dados"
            }
        },
        {
            "palavras": [
                "d12"
            ],
            "rotulo": "Dado de doze faces",
            "config": {
                "motor": "dados",
                "faces": 12,
                "qtd": 1,
                "titulo": "Dado de doze faces"
            }
        },
        {
            "palavras": [
                "d20"
            ],
            "rotulo": "Dado de vinte faces",
            "config": {
                "motor": "dados",
                "faces": 20,
                "qtd": 1,
                "titulo": "Dado de vinte faces"
            }
        },
        {
            "palavras": [
                "d100"
            ],
            "rotulo": "Dado de cem faces",
            "config": {
                "motor": "dados",
                "faces": 100,
                "qtd": 1,
                "titulo": "Dado de cem faces"
            }
        }
    ],
    "atalhos": {
        "jogo203": 0,
        "jogo204": 1,
        "jogo205": 2,
        "jogo206": 3,
        "jogo207": 4
    }
}

module.exports = {
    name: "rolardados",
    aliases: ["jogo203","jogo204","jogo205","jogo206","jogo207"],
    category: 'fun',
    subcategory: "Jogos de Mesa",
    description: "Rola dados de 6, 12, 20 ou 100 faces",
    usage: "[opção] [jogada | parar]",
    examples: ["d6 — começa: Rolar um dado"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
