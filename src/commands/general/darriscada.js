/**
 * Comando .darriscada — Solta uma gargalhada na taverna.
 */
const F = require('../../utils/formato')

const FRASES = [
    "\"Kkkkkkkkkk!\" Quase engasgou com a cerveja de tanto rir.",
    "Riu tão alto que o Guardião acordou assustado.",
    "A risada contagiou a mesa inteira."
]

module.exports = {
    name: "darriscada",
    aliases: ["darriscada-cmd","cmd-darriscada"],
    category: "general",
    subcategory: "Interação",
    description: "Solta uma gargalhada na taverna",
    examples: [" — solta uma gargalhada na taverna"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "🤣",
            titulo: "Gargalhada coletiva",
            intro: `${autor} caiu na gargalhada.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "bom humor espalhado")] }],
            dica: "Rir junto é melhor: marque alguém numa provocação.",
            proximos: [
                { nome: "provocacao", args: "@pessoa", oque: "provocar alguém na brincadeira" },
                { nome: "comemorar", args: "", oque: "transformar em festa" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
