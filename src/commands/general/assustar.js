/**
 * Comando .assustar — Dá um susto de brincadeira em alguém do grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "{alvo} deu um pulo de dois metros e derrubou a caneca.",
    "{alvo} gritou tão alto que acordou o Guardião.",
    "{alvo} fingiu que não se assustou, mas todo mundo viu."
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
    name: "assustar",
    aliases: ["assustar-cmd","cmd-assustar"],
    category: "general",
    subcategory: "Interação",
    description: "Dá um susto de brincadeira em alguém do grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "👻",
                titulo: "Buuuuh!",
                intro: "Chegue de fininho por trás de alguém distraído e dê um susto. Só brincadeira! Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "assustar", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "assustar", '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "darcutucao", args: "@pessoa", oque: "cutucar alguém distraído" },
                { nome: "pedirdesculpas", args: "@pessoa", oque: "pedir desculpas pelo susto" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "👻",
            titulo: "Buuuuh!",
            intro: `${autor} pulou por trás de ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Cuidado: quem leva susto costuma devolver.",
            proximos: [
                { nome: "darcutucao", args: "@pessoa", oque: "cutucar alguém distraído" },
                { nome: "pedirdesculpas", args: "@pessoa", oque: "pedir desculpas pelo susto" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
