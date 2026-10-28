/**
 * Comando .protegeramigo — Fica à frente de um aliado para receber o golpe: .protegeramigo [nome]
 */
module.exports = {
    name: "protegeramigo",
    aliases: ["protegeramigo-cmd","cmd-protegeramigo"],
    category: "general",
    subcategory: "Defesa",
    description: "Fica à frente de um aliado para receber o golpe: .protegeramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu companheiro";
            return reply(`🛡️ *ESCUDO HUMANO!*\n\nVocê se colocou na frente de *${alvo}*, bloqueando a flecha inimiga com seu escudo de aço!`);
        }
};
