/**
 * .cacasinonimos — Liste os sinônimos que eu aceito para a palavra
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 3 comandos antigos
 * (.jogo114, .jogo115, .jogo116), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "cacasinonimos",
    "titulo": "Caça-sinônimos",
    "emoji": "🟰",
    "intro": "",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [],
            "rotulo": "Caça-sinônimos",
            "config": {
                "motor": "sinonimo",
                "modo": "sinonimo",
                "emoji": "🟰",
                "titulo": "Caça-sinônimos"
            }
        }
    ],
    "atalhos": {
        "jogo114": 0,
        "jogo115": 0,
        "jogo116": 0
    }
}

module.exports = {
    name: "cacasinonimos",
    aliases: ["jogo114","jogo115","jogo116"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Liste os sinônimos que eu aceito para a palavra",
    usage: "[jogada | parar]",
    examples: [" — começa uma rodada"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
