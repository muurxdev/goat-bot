/**
 * Comando .compartilharmagia — Divide sua magia com um aliado do grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Um feixe azul atravessou a taverna e encheu as reservas de {alvo}.",
    "{alvo} sentiu a energia voltar das pontas dos dedos até o peito.",
    "As duas auras brilharam juntas por um instante."
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
    name: "compartilharmagia",
    aliases: ["compartilharmagia-cmd","cmd-compartilharmagia"],
    category: "general",
    subcategory: "Magia",
    description: "Divide sua magia com um aliado do grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "GOAT — usa um nome qualquer"],
    cooldownMs: 2500,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "🔮",
                titulo: "Mana compartilhada",
                intro: "Você canaliza parte da sua mana para recarregar a de um aliado cansado. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "compartilharmagia", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "compartilharmagia", 'GOAT')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "treinarjunto", args: "@pessoa", oque: "treinar com esse aliado" },
                { nome: "abencoaramigo", args: "@pessoa", oque: "proteger com uma bênção" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "🔮",
            titulo: "Mana compartilhada",
            intro: `${autor} dividiu a própria mana com ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Magia dividida rende mais em treino conjunto.",
            proximos: [
                { nome: "treinarjunto", args: "@pessoa", oque: "treinar com esse aliado" },
                { nome: "abencoaramigo", args: "@pessoa", oque: "proteger com uma bênção" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
