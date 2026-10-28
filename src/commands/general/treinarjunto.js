/**
 * Comando .treinarjunto — Convida alguém para treino conjunto de esgrima: .treinarjunto [nome]
 */
module.exports = {
    name: "treinarjunto",
    aliases: ["treinarjunto-cmd","cmd-treinarjunto"],
    category: "general",
    subcategory: "Treino",
    description: "Convida alguém para treino conjunto de esgrima: .treinarjunto [nome]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu parceiro de armas";
            return reply(`🤺 *SESSÃO DE TREINO INTENSO*\n\nVocê e *${alvo}* cruzaram espadas de madeira por horas nos campos de treino! Ambos subiram de habilidade!`);
        }
};
