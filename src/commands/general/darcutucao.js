/**
 * Comando .darcutucao — Cutuca alguém distraído no grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "\"Acorda, guerreiro, hora de lutar!\"",
    "\"Ei, sua cerveja está esquentando!\"",
    "\"Psiu, o chefe da masmorra apareceu!\""
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
    name: "darcutucao",
    aliases: ["darcutucao-cmd","cmd-darcutucao"],
    category: "general",
    subcategory: "Interação",
    description: "Cutuca alguém distraído no grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "👉",
                titulo: "Cutucada",
                intro: "Aquela cutucada nas costelas para acordar quem está no mundo da lua. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "darcutucao", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "darcutucao", '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "assustar", args: "@pessoa", oque: "dar um susto de verdade" },
                { nome: "comprimentar", args: "@pessoa", oque: "dar boas-vindas" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "👉",
            titulo: "Cutucada",
            intro: `${autor} cutucou ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Útil para chamar quem sumiu da conversa.",
            proximos: [
                { nome: "assustar", args: "@pessoa", oque: "dar um susto de verdade" },
                { nome: "comprimentar", args: "@pessoa", oque: "dar boas-vindas" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
