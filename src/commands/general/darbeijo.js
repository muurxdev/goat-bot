/**
 * Comando .darbeijo — Dá um beijo carinhoso na bochecha de alguém.
 */
const F = require('../../utils/formato')

const FRASES = [
    "{alvo} ficou vermelho igual a um tomate.",
    "O clima ficou todo romântico por aqui.",
    "Até o bardo parou a música para suspirar."
]

/** Quem recebe o gesto: a pessoa marcada ou o nome digitado. */
function alvoDe(mentionedJid, args, sender) {
    const marcado = Array.isArray(mentionedJid) ? mentionedJid[0] : mentionedJid
    if (marcado && marcado !== sender) return { texto: '@' + String(marcado).split('@')[0], mencoes: [marcado] }
    const nome = (args || []).filter(a => !String(a).startsWith('@')).join(' ').trim()
    return nome ? { texto: '*' + nome + '*', mencoes: [] } : null
}

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)]

module.exports = {
    name: "darbeijo",
    aliases: ["darbeijo-cmd","cmd-darbeijo"],
    category: "general",
    subcategory: "Interação",
    description: "Dá um beijo carinhoso na bochecha de alguém",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "GOAT — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "💋",
                titulo: "Beijo de afeto",
                intro: "Um beijinho na bochecha, daqueles de carinho. O clima da taverna agradece. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "darbeijo", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "darbeijo", 'GOAT')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "testeafinidade", args: "@pessoa", oque: "medir a sintonia do casal" },
                { nome: "darcafune", args: "@pessoa", oque: "fazer um cafuné" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "💋",
            titulo: "Beijo de afeto",
            intro: `${autor} deu um beijo na bochecha de ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Quer saber se combinam? Faça o teste de afinidade.",
            proximos: [
                { nome: "testeafinidade", args: "@pessoa", oque: "medir a sintonia do casal" },
                { nome: "darcafune", args: "@pessoa", oque: "fazer um cafuné" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
