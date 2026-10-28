/**
 * Comando .amaldicoaramigo — Lança uma maldição de brincadeira em alguém do grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "{alvo} vai soluçar a cada 10 segundos até o fim do dia.",
    "{alvo} agora só consegue falar rimando. Boa sorte!",
    "Toda caneca que {alvo} pegar vai estar vazia."
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
    name: "amaldicoaramigo",
    aliases: ["amaldicoaramigo-cmd","cmd-amaldicoaramigo"],
    category: "general",
    subcategory: "Magia",
    description: "Lança uma maldição de brincadeira em alguém do grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "GOAT — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "😈",
                titulo: "Maldição cômica",
                intro: "Uma maldição só de zoeira: nada de dano, só constrangimento. Escolha a vítima com carinho. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "amaldicoaramigo", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "amaldicoaramigo", 'GOAT')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "pedirdesculpas", args: "@pessoa", oque: "fazer as pazes" },
                { nome: "abencoaramigo", args: "@pessoa", oque: "desfazer com uma bênção" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "😈",
            titulo: "Maldição cômica",
            intro: `${autor} amaldiçoou ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Exagerou? Dá para pedir desculpas depois.",
            proximos: [
                { nome: "pedirdesculpas", args: "@pessoa", oque: "fazer as pazes" },
                { nome: "abencoaramigo", args: "@pessoa", oque: "desfazer com uma bênção" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
