/**
 * .enigmas — Charada, enigma, provérbio e outros desafios
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 14 comandos antigos
 * (.jogo120, .jogo121, .jogo122, .jogo123…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "enigmas",
    "titulo": "Charadas e enigmas",
    "emoji": "🧩",
    "intro": "Escolha o tipo de desafio. Um número depois muda as tentativas.",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "charada"
            ],
            "rotulo": "Charada",
            "config": {
                "motor": "texto",
                "modo": "charada",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "Charada"
            }
        },
        {
            "palavras": [
                "charada",
                "2"
            ],
            "rotulo": "Charada",
            "config": {
                "motor": "texto",
                "modo": "charada",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "Charada"
            }
        },
        {
            "palavras": [
                "enigma"
            ],
            "rotulo": "Enigma",
            "config": {
                "motor": "texto",
                "modo": "enigma",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "Enigma"
            }
        },
        {
            "palavras": [
                "enigma",
                "2"
            ],
            "rotulo": "Enigma",
            "config": {
                "motor": "texto",
                "modo": "enigma",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "Enigma"
            }
        },
        {
            "palavras": [
                "oqueeoquee"
            ],
            "rotulo": "O que é, o que é",
            "config": {
                "motor": "texto",
                "modo": "oqueeoquee",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "O que é, o que é"
            }
        },
        {
            "palavras": [
                "oqueeoquee",
                "2"
            ],
            "rotulo": "O que é, o que é",
            "config": {
                "motor": "texto",
                "modo": "oqueeoquee",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "O que é, o que é"
            }
        },
        {
            "palavras": [
                "frase"
            ],
            "rotulo": "Complete a frase",
            "config": {
                "motor": "texto",
                "modo": "frase",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "Complete a frase"
            }
        },
        {
            "palavras": [
                "frase",
                "2"
            ],
            "rotulo": "Complete a frase",
            "config": {
                "motor": "texto",
                "modo": "frase",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "Complete a frase"
            }
        },
        {
            "palavras": [
                "proverbio"
            ],
            "rotulo": "Complete o provérbio",
            "config": {
                "motor": "texto",
                "modo": "proverbio",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "Provérbio partido"
            }
        },
        {
            "palavras": [
                "proverbio",
                "2"
            ],
            "rotulo": "Complete o provérbio",
            "config": {
                "motor": "texto",
                "modo": "proverbio",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "Provérbio partido"
            }
        },
        {
            "palavras": [
                "soletrar"
            ],
            "rotulo": "Soletrar",
            "config": {
                "motor": "texto",
                "modo": "soletrar",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "Soletrando"
            }
        },
        {
            "palavras": [
                "soletrar",
                "2"
            ],
            "rotulo": "Soletrar",
            "config": {
                "motor": "texto",
                "modo": "soletrar",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "Soletrando"
            }
        },
        {
            "palavras": [
                "travalingua"
            ],
            "rotulo": "Trava-língua",
            "config": {
                "motor": "texto",
                "modo": "travalingua",
                "tentativas": 3,
                "emoji": "🔤",
                "titulo": "Trava-língua"
            }
        },
        {
            "palavras": [
                "travalingua",
                "2"
            ],
            "rotulo": "Trava-língua",
            "config": {
                "motor": "texto",
                "modo": "travalingua",
                "tentativas": 2,
                "emoji": "🔤",
                "titulo": "Trava-língua"
            }
        }
    ],
    "atalhos": {
        "jogo120": 0,
        "jogo121": 1,
        "jogo122": 2,
        "jogo123": 3,
        "jogo124": 4,
        "jogo125": 5,
        "jogo126": 6,
        "jogo127": 7,
        "jogo128": 8,
        "jogo129": 9,
        "jogo130": 10,
        "jogo131": 11,
        "jogo132": 12,
        "jogo133": 13
    }
}

module.exports = {
    name: "enigmas",
    aliases: ["jogo120","jogo121","jogo122","jogo123","jogo124","jogo125","jogo126","jogo127","jogo128","jogo129","jogo130","jogo131","jogo132","jogo133"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Charada, enigma, provérbio e outros desafios",
    usage: "[opção] [jogada | parar]",
    examples: ["charada — começa: Charada"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
