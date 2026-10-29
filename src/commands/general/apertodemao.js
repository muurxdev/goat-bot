/**
 * Comando .apertodemao — Troca um aperto de mão de respeito com alguém.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Aperto firme e olhar nos olhos. Aliança confirmada!",
    "Os dois assentiram com a cabeça: palavra de cavaleiro vale ouro.",
    "A taverna inteira viu: daqui para frente, lutam lado a lado."
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
    name: "apertodemao",
    aliases: ["apertodemao-cmd","cmd-apertodemao"],
    category: "general",
    subcategory: "Interação",
    description: "Troca um aperto de mão de respeito com alguém",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "🤝",
                titulo: "Aperto de mão",
                intro: "Um aperto de mão firme entre cavaleiros: sinal de respeito e de aliança. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "apertodemao", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "apertodemao", '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "selaralianca", args: "@pessoa", oque: "selar uma aliança oficial" },
                { nome: "treinarjunto", args: "@pessoa", oque: "treinar com esse aliado" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "🤝",
            titulo: "Aperto de mão",
            intro: `${autor} apertou a mão de ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Para selar de vez, use o juramento de aliança.",
            proximos: [
                { nome: "selaralianca", args: "@pessoa", oque: "selar uma aliança oficial" },
                { nome: "treinarjunto", args: "@pessoa", oque: "treinar com esse aliado" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
