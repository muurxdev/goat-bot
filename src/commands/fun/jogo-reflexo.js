/**
 * .reflexo — Mede o seu tempo de resposta
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 2 comandos antigos
 * (.jogo242, .jogo243), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "reflexo",
    "titulo": "Teste de reflexo",
    "emoji": "⚡",
    "intro": "",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [],
            "rotulo": "Teste de reflexo",
            "config": {
                "motor": "reflexo",
                "titulo": "Teste de reflexo simples"
            }
        }
    ],
    "atalhos": {
        "jogo242": 0,
        "jogo243": 0
    }
}

module.exports = {
    name: "reflexo",
    aliases: ["jogo242","jogo243"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Mede o seu tempo de resposta",
    usage: "[jogada | parar]",
    examples: [" — começa uma rodada"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
