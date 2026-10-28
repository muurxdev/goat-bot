/**
 * Comando .comerassado — Pede uma porção de carne assada na taverna.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Costeleta suculenta servida no espeto de carvalho.",
    "Assado no ponto, com batatas douradas do lado.",
    "O cheiro do assado fez a taverna inteira olhar para sua mesa."
]

module.exports = {
    name: "comerassado",
    aliases: ["comerassado-cmd","cmd-comerassado"],
    category: "general",
    subcategory: "Taverna",
    description: "Pede uma porção de carne assada na taverna",
    examples: [" — pede uma porção de carne assada na taverna"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "🍖",
            titulo: "Nhac! Carne assada",
            intro: `${autor} pediu uma carne assada.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "energia recarregada")] }],
            dica: "Nada melhor que uma cerveja para acompanhar.",
            proximos: [
                { nome: "bebercerveja", args: "", oque: "pedir uma cerveja" },
                { nome: "banquetereal", args: "", oque: "pedir o banquete completo" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
