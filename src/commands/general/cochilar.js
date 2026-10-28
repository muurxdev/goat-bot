/**
 * Comando .cochilar — Tira um cochilo rápido na taverna.
 */
const F = require('../../utils/formato')

const FRASES = [
    "Você deitou no travesseiro fofinho de Espiritual e dormiu 20 minutos.",
    "Um cochilo no canto da taverna, embalado pela música do bardo.",
    "Você cochilou sentado e acordou com a marca da mesa na testa."
]

module.exports = {
    name: "cochilar",
    aliases: ["cochilar-cmd","cmd-cochilar"],
    category: "general",
    subcategory: "Descanso",
    description: "Tira um cochilo rápido na taverna",
    examples: [" — tira um cochilo rápido na taverna"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "😴",
            titulo: "Soneca restauradora",
            intro: `${autor} encostou a cabeça e cochilou.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "cansaço espantado")] }],
            dica: "Depois de descansar, que tal sonhar com Reino?",
            proximos: [
                { nome: "sonhar", args: "", oque: "ter uma visão enquanto dorme" },
                { nome: "bebercerveja", args: "", oque: "acordar com uma cerveja" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
