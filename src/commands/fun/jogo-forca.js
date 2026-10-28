/**
 * .forca — Forca com palavras do tema que você escolher
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 14 comandos antigos
 * (.hangman, .jogo81, .jogo82, .jogo83…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "forca",
    "titulo": "Jogo da forca",
    "emoji": "🪢",
    "intro": "Seis vidas para acertar a palavra. Escolha o tema:",
    "comEstado": true,
    "variantes": [
        {
            "palavras": [
                "animais"
            ],
            "rotulo": "Bichos",
            "config": {
                "motor": "forca",
                "tema": "animais",
                "emoji": "🐾",
                "titulo": "Forca de Bichos"
            }
        },
        {
            "palavras": [
                "frutas"
            ],
            "rotulo": "Frutas",
            "config": {
                "motor": "forca",
                "tema": "frutas",
                "emoji": "🍉",
                "titulo": "Forca de Frutas"
            }
        },
        {
            "palavras": [
                "paises"
            ],
            "rotulo": "Países",
            "config": {
                "motor": "forca",
                "tema": "paises",
                "emoji": "🌎",
                "titulo": "Forca de Países"
            }
        },
        {
            "palavras": [
                "profissoes"
            ],
            "rotulo": "Profissões",
            "config": {
                "motor": "forca",
                "tema": "profissoes",
                "emoji": "🧰",
                "titulo": "Forca de Profissões"
            }
        },
        {
            "palavras": [
                "objetos"
            ],
            "rotulo": "Objetos de casa",
            "config": {
                "motor": "forca",
                "tema": "objetos",
                "emoji": "🪑",
                "titulo": "Forca de Objetos de casa"
            }
        },
        {
            "palavras": [
                "esportes"
            ],
            "rotulo": "Esportes",
            "config": {
                "motor": "forca",
                "tema": "esportes",
                "emoji": "🏐",
                "titulo": "Forca de Esportes"
            }
        },
        {
            "palavras": [
                "comidas"
            ],
            "rotulo": "Comidas",
            "config": {
                "motor": "forca",
                "tema": "comidas",
                "emoji": "🍛",
                "titulo": "Forca de Comidas"
            }
        },
        {
            "palavras": [
                "cores"
            ],
            "rotulo": "Cores e tons",
            "config": {
                "motor": "forca",
                "tema": "cores",
                "emoji": "🎨",
                "titulo": "Forca de Cores e tons"
            }
        },
        {
            "palavras": [
                "corpo"
            ],
            "rotulo": "Corpo humano",
            "config": {
                "motor": "forca",
                "tema": "corpo",
                "emoji": "🫁",
                "titulo": "Forca de Corpo humano"
            }
        },
        {
            "palavras": [
                "natureza"
            ],
            "rotulo": "Natureza",
            "config": {
                "motor": "forca",
                "tema": "natureza",
                "emoji": "🌳",
                "titulo": "Forca de Natureza"
            }
        },
        {
            "palavras": [
                "tecnologia"
            ],
            "rotulo": "Tecnologia",
            "config": {
                "motor": "forca",
                "tema": "tecnologia",
                "emoji": "🔌",
                "titulo": "Forca de Tecnologia"
            }
        },
        {
            "palavras": [
                "musica"
            ],
            "rotulo": "Música",
            "config": {
                "motor": "forca",
                "tema": "musica",
                "emoji": "🎼",
                "titulo": "Forca de Música"
            }
        },
        {
            "palavras": [
                "mestre"
            ],
            "rotulo": "Mestre e cia",
            "config": {
                "motor": "forca",
                "tema": "mestre",
                "emoji": "⚔️",
                "titulo": "Forca de Mestre e cia"
            }
        }
    ],
    "atalhos": {
        "jogo81": 0,
        "jogo82": 1,
        "jogo83": 2,
        "jogo84": 3,
        "jogo85": 4,
        "jogo86": 5,
        "jogo87": 6,
        "jogo88": 7,
        "jogo89": 8,
        "jogo90": 9,
        "jogo91": 10,
        "jogo92": 11,
        "hangman": 12,
        "jogodaforca": 12
    }
}

module.exports = {
    name: "forca",
    aliases: ["hangman","jogo81","jogo82","jogo83","jogo84","jogo85","jogo86","jogo87","jogo88","jogo89","jogo90","jogo91","jogo92","jogodaforca"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Forca com palavras do tema que você escolher",
    usage: "[opção] [jogada | parar]",
    examples: ["animais — começa: Bichos"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
