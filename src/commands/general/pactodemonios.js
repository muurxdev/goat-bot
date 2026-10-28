/**
 * Comando .pactodemonios — Ouve os sussurros do Clã dos Demônios.
 */
const F = require('../../utils/formato')

const FRASES = [
    "\"O poder da escuridão não julga, apenas devora.\"",
    "\"Todo mandamento cobra seu preço, cavaleiro.\"",
    "\"A luz das Deusas não alcança onde nós estamos.\""
]

module.exports = {
    name: "pactodemonios",
    aliases: ["pactodemonios-cmd","cmd-pactodemonios"],
    category: "general",
    subcategory: "Roleplay",
    description: "Ouve os sussurros do Clã dos Demônios",
    examples: [" — ouve os sussurros do Clã dos Demônios"],
    cooldownMs: 2000,
    execute: async ({ reply, sender, prefix = '.' }) => {
        const autor = '@' + String(sender || '').split('@')[0]
        const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
        return reply(F.tela({
            emoji: "🌑",
            titulo: "Murmúrio do submundo",
            intro: `${autor} acendeu as chamas roxas.`,
            secoes: [{ emoji: '📜', titulo: 'Na taverna', linhas: [frase, F.campo('Efeito', "um arrepio na espinha")] }],
            dica: "Precisa se purificar depois? Faça uma oração às Deusas.",
            proximos: [
                { nome: "oracaodeusas", args: "", oque: "buscar a luz das Deusas" },
                { nome: "abencoaramigo", args: "@pessoa", oque: "proteger um aliado" }
            ],
            prefix
        }), sender ? [sender] : [])
    }
};
