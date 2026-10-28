/**
 * Comando .bebercerveja — Toma um gole da famosa cerveja de Bernia.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Cerveja gelada e encorpada de Bernia: amarga, fresca e revigorante.",
    "A espuma escorreu pela caneca e o GOAT encheu de novo.",
    "Um gole tão bom que você bateu a caneca no balcão."
]

module.exports = {
    name: "bebercerveja",
    aliases: ["bebercerveja-cmd","cmd-bebercerveja"],
    category: "general",
    subcategory: "Taverna",
    description: "Toma um gole da famosa cerveja de Bernia",
    examples: [" — toma um gole da famosa cerveja de Bernia"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "🍺",
            titulo: "Glup, glup... aah!",
            intro: `${autor} pediu uma caneca no balcão.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "força de vontade renovada")] }],
            dica: "Cerveja boa é dividida: chame alguém para um brinde.",
            proximos: [
                { nome: "brindebarbeer", args: "", oque: "fazer um brinde com o grupo" },
                { nome: "comerassado", args: "", oque: "pedir algo para acompanhar" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
