/**
 * .cacaantonimos — Liste os antônimos que eu aceito para a palavra
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 3 comandos antigos
 * (.jogo117, .jogo118, .jogo119), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "cacaantonimos",
    "titulo": "Caça-antônimos",
    "emoji": "↔️",
    "intro": "",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [],
            "rotulo": "Caça-antônimos",
            "config": {
                "motor": "sinonimo",
                "modo": "antonimo",
                "emoji": "↔️",
                "titulo": "Caça-antônimos"
            }
        }
    ],
    "atalhos": {
        "jogo117": 0,
        "jogo118": 0,
        "jogo119": 0
    }
}

module.exports = {
    name: "cacaantonimos",
    aliases: ["jogo117","jogo118","jogo119"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Liste os antônimos que eu aceito para a palavra",
    usage: "[jogada | parar]",
    examples: [" — começa uma rodada"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
