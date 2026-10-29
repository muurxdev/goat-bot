/**
 * Comando .abencoaramigo — Lança uma bênção protetora sobre alguém do grupo.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Uma aura dourada cobriu {alvo}, reforçando sua resistência mágica.",
    "As Deusas sorriram: {alvo} está protegido contra o próximo golpe.",
    "Um escudo de luz envolveu {alvo} e brilhou por toda a taverna."
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
    name: "abencoaramigo",
    aliases: ["abencoaramigo-cmd","cmd-abencoaramigo"],
    category: "general",
    subcategory: "Magia",
    description: "Lança uma bênção protetora sobre alguém do grupo",
    usage: "<@pessoa ou nome>",
    examples: ["@pessoa — marca alguém do grupo", "➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ — usa um nome qualquer"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], sender, mentionedJid, prefix = '.' }) => {
        const alvo = alvoDe(mentionedJid, args, sender)
        if (!alvo) {
            return reply(F.tela({
                emoji: "✨",
                titulo: "Bênção de proteção",
                intro: "Você ergue as mãos e cobre um aliado com uma aura dourada de proteção. É um gesto de carinho antes da batalha. Só falta dizer para quem.",
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, "abencoaramigo", '@pessoa')} — marca alguém do grupo`,
                    `• ${F.cmd(prefix, "abencoaramigo", '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')} — usa um nome qualquer`
                ] }],
                proximos: [
                { nome: "curaramigo", args: "@pessoa", oque: "curar as feridas de alguém" },
                { nome: "protegeramigo", args: "@pessoa", oque: "ficar na frente de um aliado" }
                ],
                prefix
            }))
        }
        const autor = '@' + String(sender).split('@')[0]
        const frase = sortear(FRASES).replace('{alvo}', alvo.texto)
        return reply(F.tela({
            emoji: "✨",
            titulo: "Bênção de proteção",
            intro: `${autor} abençoou ${alvo.texto}!`,
            secoes: [{ emoji: '📜', titulo: 'O que aconteceu', linhas: [frase] }],
            dica: "Bênçãos combinam com um brinde depois da batalha.",
            proximos: [
                { nome: "curaramigo", args: "@pessoa", oque: "curar as feridas de alguém" },
                { nome: "protegeramigo", args: "@pessoa", oque: "ficar na frente de um aliado" }
            ],
            prefix
        }), [sender, ...alvo.mencoes])
    }
};
