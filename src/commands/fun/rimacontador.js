/**
 * Comando .rimacontador — Estima contagem de sílabas poéticas: .rimacontador <verso>
 */
module.exports = {
    name: "rimacontador",
    aliases: ["rimacontador-cmd","cmd-rimacontador"],
    category: "fun",
    subcategory: "Poesia",
    description: "Estima contagem de sílabas poéticas: .rimacontador <verso>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const verso = args.join(" ");
            if (!verso) return reply("Uso: `.rimacontador <verso>`");
            const vogais = (verso.match(/[aeiouáéíóúãõâêîôû]/gi) || []).length;
            return reply(`📜 *Métrica Poética Aproximada:*\n"${verso}"\n▫️ ~${vogais} sílabas poéticas estimadas.`);
        }
};
