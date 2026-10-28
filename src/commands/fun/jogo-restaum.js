/**
 * .restaum — Resta-um: pule as peças até sobrar uma
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 2 comandos antigos
 * (.jogo219, .jogo220), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "restaum",
    "titulo": "Resta-um",
    "emoji": "⚪",
    "intro": "Escolha onde começa o buraco:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "topo"
            ],
            "rotulo": "Resta-um com topo vazio",
            "config": {
                "motor": "restaum",
                "vazio": 1,
                "titulo": "Resta-um com topo vazio"
            }
        },
        {
            "palavras": [
                "meio"
            ],
            "rotulo": "Resta-um com meio vazio",
            "config": {
                "motor": "restaum",
                "vazio": 5,
                "titulo": "Resta-um com meio vazio"
            }
        }
    ],
    "atalhos": {
        "jogo219": 0,
        "jogo220": 1
    }
}

module.exports = {
    name: "restaum",
    aliases: ["jogo219","jogo220"],
    category: 'fun',
    subcategory: "Jogos de Mesa",
    description: "Resta-um: pule as peças até sobrar uma",
    usage: "[opção] [jogada | parar]",
    examples: ["topo — começa: Resta-um com topo vazio"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
