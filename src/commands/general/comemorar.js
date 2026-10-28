/**
 * Comando .comemorar — Solta a comemoração na taverna.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Canecas para o alto, música celta e risadas pela taverna inteira!",
    "O bardo tocou a música da vitória e todo mundo cantou junto.",
    "Confete de pétalas caiu do teto: hoje é dia de festa!"
]

module.exports = {
    name: "comemorar",
    aliases: ["comemorar-cmd","cmd-comemorar"],
    category: "general",
    subcategory: "Interação",
    description: "Solta a comemoração na taverna",
    examples: [" — solta a comemoração na taverna"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "🎉",
            titulo: "Festa da vitória",
            intro: `${autor} puxou a comemoração.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "moral do grupo lá em cima")] }],
            dica: "Festa boa tem brinde e banquete.",
            proximos: [
                { nome: "brindebarbeer", args: "", oque: "fazer um brinde" },
                { nome: "banquetereal", args: "", oque: "servir um banquete" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
