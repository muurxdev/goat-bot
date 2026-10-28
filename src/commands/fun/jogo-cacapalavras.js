/**
 * .cacapalavras — Caça-palavras em grade, com o tema escolhido
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 2 comandos antigos
 * (.jogo139, .jogo140), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "cacapalavras",
    "titulo": "Caça-palavras",
    "emoji": "🔎",
    "intro": "Escolha o tema da grade:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "frutas"
            ],
            "rotulo": "Frutas (grade 9x9)",
            "config": {
                "motor": "caca",
                "tema": "frutas",
                "lado": 9,
                "qtd": 4,
                "emoji": "🔎",
                "titulo": "Caça-palavras de Frutas"
            }
        },
        {
            "palavras": [
                "profissoes"
            ],
            "rotulo": "Profissões (grade 10x10)",
            "config": {
                "motor": "caca",
                "tema": "profissoes",
                "lado": 10,
                "qtd": 4,
                "emoji": "🔎",
                "titulo": "Caça-palavras de Profissões"
            }
        }
    ],
    "atalhos": {
        "jogo139": 0,
        "jogo140": 1
    }
}

module.exports = {
    name: "cacapalavras",
    aliases: ["jogo139","jogo140"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Caça-palavras em grade, com o tema escolhido",
    usage: "[opção] [jogada | parar]",
    examples: ["frutas — começa: Frutas (grade 9x9)"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
