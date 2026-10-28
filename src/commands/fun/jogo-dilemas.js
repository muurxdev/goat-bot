/**
 * .dilemas — Dilemas "você prefere" para o grupo votar
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 13 comandos antigos
 * (.dilema, .dilemaetico, .dilemamoral, .jogo175…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "dilemas",
    "titulo": "Você prefere",
    "emoji": "🤔",
    "intro": "Escolha quantos dilemas de uma vez:",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "1"
            ],
            "rotulo": "1 dilema(s)",
            "config": {
                "motor": "vocePrefere",
                "titulo": "Você prefere",
                "qtd": 1
            }
        },
        {
            "palavras": [
                "2"
            ],
            "rotulo": "2 dilema(s)",
            "config": {
                "motor": "vocePrefere",
                "titulo": "Você prefere em dose dupla",
                "qtd": 2
            }
        },
        {
            "palavras": [
                "3"
            ],
            "rotulo": "3 dilema(s)",
            "config": {
                "motor": "vocePrefere",
                "titulo": "Você prefere em trio",
                "qtd": 3
            }
        },
        {
            "palavras": [
                "4"
            ],
            "rotulo": "4 dilema(s)",
            "config": {
                "motor": "vocePrefere",
                "titulo": "Você prefere sem trégua",
                "qtd": 4
            }
        },
        {
            "palavras": [
                "programacao"
            ],
            "rotulo": "Programação",
            "config": {
                "motor": "vocePrefere",
                "titulo": "Você prefere — programação",
                "qtd": 1,
                "banco": "programacao"
            }
        },
        {
            "palavras": [
                "moral"
            ],
            "rotulo": "Dilemas morais",
            "config": {
                "motor": "vocePrefere",
                "titulo": "Dilema do grupo",
                "qtd": 1,
                "banco": "moral"
            }
        }
    ],
    "atalhos": {
        "jogo175": 0,
        "jogo176": 1,
        "jogo177": 2,
        "jogo178": 3,
        "voceprefere": 4,
        "prefere": 4,
        "vcprefere": 4,
        "wouldyourather": 4,
        "ououdilema": 4,
        "dilema": 5,
        "dilemamoral": 5,
        "oquefazer": 5,
        "dilemaetico": 5
    }
}

module.exports = {
    name: "dilemas",
    aliases: ["dilema","dilemaetico","dilemamoral","jogo175","jogo176","jogo177","jogo178","oquefazer","ououdilema","prefere","vcprefere","voceprefere","wouldyourather"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Dilemas \"você prefere\" para o grupo votar",
    usage: "[opção] [jogada | parar]",
    examples: ["1 — começa: 1 dilema(s)"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
