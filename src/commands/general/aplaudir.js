/**
 * Comando .aplaudir — Aplaude o feito de alguém do grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "A taverna inteira acompanhou as palmas!",
    "Até o Guardião bateu as patinhas.",
    "Palmas tão altas que as canecas tremeram no balcão."
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
    name: "aplaudir",
    aliases: ["aplaudir-cmd","cmd-aplaudir"],
    category: "general",
    subcategory: "Interação",
    description: "Aplaude o feito de alguém do grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — usa um nome qualquer"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "👏",
                titulo: "Aplausos de pé",
                intro: "Alguém mandou bem? Levante da cadeira e aplauda para a taverna inteira ver. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "aplaudir", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "aplaudir", '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "elogiaramigo", args: "@pessoa", oque: "fazer um elogio" },
                { nome: "comemorar", args: "", oque: "soltar a festa na taverna" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "👏",
            titulo: "Aplausos de pé",
            intro: `${autor} aplaudiu de pé ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Quer reconhecer com palavras? Mande um elogio também.",
            proximos: [
                { nome: "elogiaramigo", args: "@pessoa", oque: "fazer um elogio" },
                { nome: "comemorar", args: "", oque: "soltar a festa na taverna" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
