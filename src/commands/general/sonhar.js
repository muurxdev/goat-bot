/**
 * Comando .sonhar — Tem um sonho com as terras do Reino.
 */
const F = require('../../utils/formato')

const FRASES = [
    "O gramado iluminado do estádio na final de um campeonato mundial.",
    "O drible perfeito nos acréscimos levantando a torcida inteira de pé.",
    "O estádio lotado com mais de 80 mil vozes comemorando o gol do título."
]

module.exports = {
    name: "sonhar",
    aliases: ["sonhar-cmd","cmd-sonhar"],
    category: "general",
    subcategory: "Descanso",
    description: "Tem um sonho com as terras do Reino",
    examples: [" — tem um sonho com as terras do Reino"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "🌙",
            titulo: "Visão em sonho",
            intro: `${autor} fechou os olhos e sonhou.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "mente descansada")] }],
            dica: "Sonhos vêm melhor depois de um cochilo.",
            proximos: [
                { nome: "cochilar", args: "", oque: "tirar uma soneca" },
                { nome: "pactodemonios", args: "", oque: "ouvir o lado sombrio" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
