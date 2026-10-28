/**
 * .contas — Contas de cabeça no cronômetro, em 5 níveis
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 7 comandos antigos
 * (.jogo244, .jogo245, .jogo246, .jogo247…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "contas",
    "titulo": "Contas de cabeça",
    "emoji": "➗",
    "intro": "Escolha o tipo de conta. Um número depois muda quantas.",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "somas"
            ],
            "rotulo": "somas",
            "config": {
                "motor": "contas",
                "nivel": 1,
                "qtd": 5,
                "titulo": "Contas de cabeça — somas"
            }
        },
        {
            "palavras": [
                "multiplicacoes"
            ],
            "rotulo": "multiplicações",
            "config": {
                "motor": "contas",
                "nivel": 2,
                "qtd": 5,
                "titulo": "Contas de cabeça — multiplicações"
            }
        },
        {
            "palavras": [
                "subtracoes"
            ],
            "rotulo": "somas e subtrações",
            "config": {
                "motor": "contas",
                "nivel": 3,
                "qtd": 5,
                "titulo": "Contas de cabeça — somas e subtrações"
            }
        },
        {
            "palavras": [
                "divisoes"
            ],
            "rotulo": "divisões exatas",
            "config": {
                "motor": "contas",
                "nivel": 4,
                "qtd": 5,
                "titulo": "Contas de cabeça — divisões exatas"
            }
        },
        {
            "palavras": [
                "mistas"
            ],
            "rotulo": "contas mistas",
            "config": {
                "motor": "contas",
                "nivel": 5,
                "qtd": 5,
                "titulo": "Contas de cabeça — contas mistas"
            }
        },
        {
            "palavras": [
                "multiplicacoes",
                "3"
            ],
            "rotulo": "multiplicações, 3 contas",
            "config": {
                "motor": "contas",
                "nivel": 2,
                "qtd": 3,
                "titulo": "Contas de cabeça — multiplicações, rodada curta"
            }
        },
        {
            "palavras": [
                "mistas",
                "10"
            ],
            "rotulo": "contas mistas, 10 contas",
            "config": {
                "motor": "contas",
                "nivel": 5,
                "qtd": 10,
                "titulo": "Contas de cabeça — contas mistas, maratona"
            }
        }
    ],
    "atalhos": {
        "jogo244": 0,
        "jogo245": 1,
        "jogo246": 2,
        "jogo247": 3,
        "jogo248": 4,
        "jogo249": 5,
        "jogo250": 6
    }
}

module.exports = {
    name: "contas",
    aliases: ["jogo244","jogo245","jogo246","jogo247","jogo248","jogo249","jogo250"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Contas de cabeça no cronômetro, em 5 níveis",
    usage: "[opção] [jogada | parar]",
    examples: ["somas — começa: somas"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
