/**
 * .roda — Verdade, desafio, eu nunca e outras rodas
 *
 * Arquivo gerado por scripts/gen-jogos.js. Junta 34 comandos antigos
 * (.jogo141, .jogo142, .jogo143, .jogo144…), que seguem como atalhos.
 * A regra mora em src/services/partyGamesService.js e a escolha de variante em
 * src/services/jogoUnificadoService.js; aqui só há dados.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-jogos.js` apaga.
 */

const F = require('../../utils/formato')
const J = require('../../services/jogoUnificadoService')

const JOGO = {
    "nome": "roda",
    "titulo": "Brincadeiras de roda",
    "emoji": "🎡",
    "intro": "Escolha a brincadeira. Um número depois sorteia vários de uma vez.",
    "comEstado": false,
    "variantes": [
        {
            "palavras": [
                "verdades"
            ],
            "rotulo": "Verdade sorteada",
            "config": {
                "motor": "sorteio",
                "banco": "verdades",
                "titulo": "Verdade sorteada",
                "emoji": "🫣",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Quem foi sorteado responde na hora.",
                    "Mentira descoberta paga prenda.",
                    "Ninguém é obrigado: pode passar uma vez."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "verdades",
                "3"
            ],
            "rotulo": "Roda de verdades",
            "config": {
                "motor": "sorteio",
                "banco": "verdades",
                "titulo": "Roda de verdades",
                "emoji": "🫣",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Quem foi sorteado responde na hora.",
                    "Mentira descoberta paga prenda.",
                    "Ninguém é obrigado: pode passar uma vez."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "verdades",
                "5"
            ],
            "rotulo": "Sessão de verdades",
            "config": {
                "motor": "sorteio",
                "banco": "verdades",
                "titulo": "Sessão de verdades",
                "emoji": "🫣",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Quem foi sorteado responde na hora.",
                    "Mentira descoberta paga prenda.",
                    "Ninguém é obrigado: pode passar uma vez."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "desafios"
            ],
            "rotulo": "Desafio sorteado",
            "config": {
                "motor": "sorteio",
                "banco": "desafios",
                "titulo": "Desafio sorteado",
                "emoji": "😈",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Cumpra o desafio antes da próxima mensagem do grupo.",
                    "Não cumpriu, cumpre dois na próxima.",
                    "Nada que machuque ninguém."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "desafios",
                "3"
            ],
            "rotulo": "Roda de desafios",
            "config": {
                "motor": "sorteio",
                "banco": "desafios",
                "titulo": "Roda de desafios",
                "emoji": "😈",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Cumpra o desafio antes da próxima mensagem do grupo.",
                    "Não cumpriu, cumpre dois na próxima.",
                    "Nada que machuque ninguém."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "desafios",
                "5"
            ],
            "rotulo": "Maratona de desafios",
            "config": {
                "motor": "sorteio",
                "banco": "desafios",
                "titulo": "Maratona de desafios",
                "emoji": "😈",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Cumpra o desafio antes da próxima mensagem do grupo.",
                    "Não cumpriu, cumpre dois na próxima.",
                    "Nada que machuque ninguém."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "verdadeoudesafio"
            ],
            "rotulo": "Verdade ou desafio",
            "config": {
                "motor": "sorteio",
                "banco": "verdadeoudesafio",
                "titulo": "Verdade ou desafio",
                "emoji": "🎭",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Escolha verdade ou desafio antes de ler.",
                    "Escolheu, não pode trocar.",
                    "Quem responde sorteia o próximo."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "verdadeoudesafio",
                "3"
            ],
            "rotulo": "Verdade ou desafio em trio",
            "config": {
                "motor": "sorteio",
                "banco": "verdadeoudesafio",
                "titulo": "Verdade ou desafio em trio",
                "emoji": "🎭",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Escolha verdade ou desafio antes de ler.",
                    "Escolheu, não pode trocar.",
                    "Quem responde sorteia o próximo."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "verdadeoudesafio",
                "5"
            ],
            "rotulo": "Verdade ou desafio sem dó",
            "config": {
                "motor": "sorteio",
                "banco": "verdadeoudesafio",
                "titulo": "Verdade ou desafio sem dó",
                "emoji": "🎭",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Escolha verdade ou desafio antes de ler.",
                    "Escolheu, não pode trocar.",
                    "Quem responde sorteia o próximo."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "eununca"
            ],
            "rotulo": "Eu nunca",
            "config": {
                "motor": "sorteio",
                "banco": "eununca",
                "titulo": "Eu nunca",
                "emoji": "🙈",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Quem já fez, conta a história.",
                    "Quem nunca fez, fica quieto e escuta.",
                    "Vale contestar quem mentir."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "eununca",
                "3"
            ],
            "rotulo": "Eu nunca em roda",
            "config": {
                "motor": "sorteio",
                "banco": "eununca",
                "titulo": "Eu nunca em roda",
                "emoji": "🙈",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Quem já fez, conta a história.",
                    "Quem nunca fez, fica quieto e escuta.",
                    "Vale contestar quem mentir."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "eununca",
                "5"
            ],
            "rotulo": "Eu nunca sem filtro",
            "config": {
                "motor": "sorteio",
                "banco": "eununca",
                "titulo": "Eu nunca sem filtro",
                "emoji": "🙈",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Quem já fez, conta a história.",
                    "Quem nunca fez, fica quieto e escuta.",
                    "Vale contestar quem mentir."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "duasverdades"
            ],
            "rotulo": "Duas verdades e uma mentira",
            "config": {
                "motor": "sorteio",
                "banco": "duasverdades",
                "titulo": "Duas verdades e uma mentira",
                "emoji": "🃏",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Conte três coisas sobre o tema: duas verdades e uma mentira.",
                    "O grupo vota em qual é a mentira.",
                    "Quem enganar a maioria ganha a rodada."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "duasverdades",
                "3"
            ],
            "rotulo": "Duas verdades com tema triplo",
            "config": {
                "motor": "sorteio",
                "banco": "duasverdades",
                "titulo": "Duas verdades com tema triplo",
                "emoji": "🃏",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Conte três coisas sobre o tema: duas verdades e uma mentira.",
                    "O grupo vota em qual é a mentira.",
                    "Quem enganar a maioria ganha a rodada."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "duasverdades",
                "5"
            ],
            "rotulo": "Duas verdades no modo difícil",
            "config": {
                "motor": "sorteio",
                "banco": "duasverdades",
                "titulo": "Duas verdades no modo difícil",
                "emoji": "🃏",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Conte três coisas sobre o tema: duas verdades e uma mentira.",
                    "O grupo vota em qual é a mentira.",
                    "Quem enganar a maioria ganha a rodada."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "relampago"
            ],
            "rotulo": "Desafio relâmpago",
            "config": {
                "motor": "sorteio",
                "banco": "relampago",
                "titulo": "Desafio relâmpago",
                "emoji": "⚡",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Dez segundos para responder.",
                    "Repetiu, perdeu.",
                    "Quem travar passa a vez."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "relampago",
                "3"
            ],
            "rotulo": "Relâmpago triplo",
            "config": {
                "motor": "sorteio",
                "banco": "relampago",
                "titulo": "Relâmpago triplo",
                "emoji": "⚡",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Dez segundos para responder.",
                    "Repetiu, perdeu.",
                    "Quem travar passa a vez."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "relampago",
                "5"
            ],
            "rotulo": "Relâmpago em série",
            "config": {
                "motor": "sorteio",
                "banco": "relampago",
                "titulo": "Relâmpago em série",
                "emoji": "⚡",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Dez segundos para responder.",
                    "Repetiu, perdeu.",
                    "Quem travar passa a vez."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "maisprovavel"
            ],
            "rotulo": "Quem é mais provável",
            "config": {
                "motor": "sorteio",
                "banco": "maisprovavel",
                "titulo": "Quem é mais provável",
                "emoji": "👉",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Todo mundo aponta uma pessoa ao mesmo tempo.",
                    "Quem receber mais apontamentos explica.",
                    "Vale mandar figurinha em vez de nome."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "maisprovavel",
                "3"
            ],
            "rotulo": "Quem é mais provável em trio",
            "config": {
                "motor": "sorteio",
                "banco": "maisprovavel",
                "titulo": "Quem é mais provável em trio",
                "emoji": "👉",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Todo mundo aponta uma pessoa ao mesmo tempo.",
                    "Quem receber mais apontamentos explica.",
                    "Vale mandar figurinha em vez de nome."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "maisprovavel",
                "4"
            ],
            "rotulo": "Rodada de quem é mais provável",
            "config": {
                "motor": "sorteio",
                "banco": "maisprovavel",
                "titulo": "Rodada de quem é mais provável",
                "emoji": "👉",
                "qtd": 4,
                "intro": "Sorteei 4 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Todo mundo aponta uma pessoa ao mesmo tempo.",
                    "Quem receber mais apontamentos explica.",
                    "Vale mandar figurinha em vez de nome."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "maisprovavel",
                "6"
            ],
            "rotulo": "Quem é mais provável sem parar",
            "config": {
                "motor": "sorteio",
                "banco": "maisprovavel",
                "titulo": "Quem é mais provável sem parar",
                "emoji": "👉",
                "qtd": 6,
                "intro": "Sorteei 6 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Todo mundo aponta uma pessoa ao mesmo tempo.",
                    "Quem receber mais apontamentos explica.",
                    "Vale mandar figurinha em vez de nome."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "sussurro"
            ],
            "rotulo": "Telefone sem fio",
            "config": {
                "motor": "sorteio",
                "banco": "sussurro",
                "titulo": "Telefone sem fio",
                "emoji": "🤫",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "A primeira pessoa lê a frase e passa no ouvido ou no privado.",
                    "A última fala em voz alta o que entendeu.",
                    "Comparem com o original e riam."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "sussurro",
                "3"
            ],
            "rotulo": "Telefone sem fio em série",
            "config": {
                "motor": "sorteio",
                "banco": "sussurro",
                "titulo": "Telefone sem fio em série",
                "emoji": "🤫",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "A primeira pessoa lê a frase e passa no ouvido ou no privado.",
                    "A última fala em voz alta o que entendeu.",
                    "Comparem com o original e riam."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "historia"
            ],
            "rotulo": "História coletiva",
            "config": {
                "motor": "sorteio",
                "banco": "historia",
                "titulo": "História coletiva",
                "emoji": "📖",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Cada pessoa acrescenta uma frase à história.",
                    "Não vale repetir personagem que já morreu.",
                    "A história acaba quando alguém fecha com final feliz."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "historia",
                "3"
            ],
            "rotulo": "História coletiva com três começos",
            "config": {
                "motor": "sorteio",
                "banco": "historia",
                "titulo": "História coletiva com três começos",
                "emoji": "📖",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Cada pessoa acrescenta uma frase à história.",
                    "Não vale repetir personagem que já morreu.",
                    "A história acaba quando alguém fecha com final feliz."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "historia",
                "5"
            ],
            "rotulo": "História coletiva embolada",
            "config": {
                "motor": "sorteio",
                "banco": "historia",
                "titulo": "História coletiva embolada",
                "emoji": "📖",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Cada pessoa acrescenta uma frase à história.",
                    "Não vale repetir personagem que já morreu.",
                    "A história acaba quando alguém fecha com final feliz."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "confissoes"
            ],
            "rotulo": "Confissão anônima",
            "config": {
                "motor": "sorteio",
                "banco": "confissoes",
                "titulo": "Confissão anônima",
                "emoji": "🕯️",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Responda no privado de quem chamou.",
                    "Quem recebeu lê tudo embaralhado no grupo.",
                    "O grupo adivinha de quem é cada confissão."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "confissoes",
                "3"
            ],
            "rotulo": "Confissões em série",
            "config": {
                "motor": "sorteio",
                "banco": "confissoes",
                "titulo": "Confissões em série",
                "emoji": "🕯️",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Responda no privado de quem chamou.",
                    "Quem recebeu lê tudo embaralhado no grupo.",
                    "O grupo adivinha de quem é cada confissão."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "juri"
            ],
            "rotulo": "Júri do grupo",
            "config": {
                "motor": "sorteio",
                "banco": "juri",
                "titulo": "Júri do grupo",
                "emoji": "⚖️",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Metade defende, metade acusa.",
                    "Cada lado tem duas frases.",
                    "O grupo vota culpado ou inocente."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "juri",
                "3"
            ],
            "rotulo": "Júri com três casos",
            "config": {
                "motor": "sorteio",
                "banco": "juri",
                "titulo": "Júri com três casos",
                "emoji": "⚖️",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Metade defende, metade acusa.",
                    "Cada lado tem duas frases.",
                    "O grupo vota culpado ou inocente."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "juri",
                "5"
            ],
            "rotulo": "Sessão de julgamento",
            "config": {
                "motor": "sorteio",
                "banco": "juri",
                "titulo": "Sessão de julgamento",
                "emoji": "⚖️",
                "qtd": 5,
                "intro": "Sorteei 5 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Metade defende, metade acusa.",
                    "Cada lado tem duas frases.",
                    "O grupo vota culpado ou inocente."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "travalinguas"
            ],
            "rotulo": "Duelo de trava-língua",
            "config": {
                "motor": "sorteio",
                "banco": "travalinguas",
                "titulo": "Duelo de trava-língua",
                "emoji": "👅",
                "qtd": 1,
                "intro": "Sorteei um para a roda começar.",
                "rotulo": "A vez é sua",
                "regras": [
                    "Grave um áudio dizendo três vezes seguidas.",
                    "Errou, começa de novo.",
                    "Quem fizer mais rápido escolhe o próximo."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        },
        {
            "palavras": [
                "travalinguas",
                "3"
            ],
            "rotulo": "Trava-língua em série",
            "config": {
                "motor": "sorteio",
                "banco": "travalinguas",
                "titulo": "Trava-língua em série",
                "emoji": "👅",
                "qtd": 3,
                "intro": "Sorteei 3 de uma vez para a roda não parar.",
                "rotulo": "Sorteados agora",
                "regras": [
                    "Grave um áudio dizendo três vezes seguidas.",
                    "Errou, começa de novo.",
                    "Quem fizer mais rápido escolhe o próximo."
                ],
                "dica": "Marque quem vai responder para a roda não travar."
            }
        }
    ],
    "atalhos": {
        "jogo141": 0,
        "jogo142": 1,
        "jogo143": 2,
        "jogo144": 3,
        "jogo145": 4,
        "jogo146": 5,
        "jogo147": 6,
        "jogo148": 7,
        "jogo149": 8,
        "jogo150": 9,
        "jogo151": 10,
        "jogo152": 11,
        "jogo153": 12,
        "jogo154": 13,
        "jogo155": 14,
        "jogo156": 15,
        "jogo157": 16,
        "jogo158": 17,
        "jogo159": 18,
        "jogo160": 19,
        "jogo161": 20,
        "jogo162": 21,
        "jogo163": 22,
        "jogo164": 23,
        "jogo165": 24,
        "jogo166": 25,
        "jogo167": 26,
        "jogo168": 27,
        "jogo169": 28,
        "jogo170": 29,
        "jogo171": 30,
        "jogo172": 31,
        "jogo173": 32,
        "jogo174": 33
    }
}

module.exports = {
    name: "roda",
    aliases: ["jogo141","jogo142","jogo143","jogo144","jogo145","jogo146","jogo147","jogo148","jogo149","jogo150","jogo151","jogo152","jogo153","jogo154","jogo155","jogo156","jogo157","jogo158","jogo159","jogo160","jogo161","jogo162","jogo163","jogo164","jogo165","jogo166","jogo167","jogo168","jogo169","jogo170","jogo171","jogo172","jogo173","jogo174"],
    category: 'fun',
    subcategory: "Jogos & Quizzes",
    description: "Verdade, desafio, eu nunca e outras rodas",
    usage: "[opção] [jogada | parar]",
    examples: ["verdades — começa: Verdade sorteada"," — mostra as opções"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], commandName = '', prefix = '.', from, sender }) => {
        const tela = J.rodar(JOGO, { commandName, args, from, sender, prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
