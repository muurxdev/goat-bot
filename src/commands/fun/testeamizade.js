/**
 * Comando .testeamizade — Testa a força da amizade com outro participante: .testeamizade [nome]
 */
module.exports = {
    name: "testeamizade",
    aliases: ["testeamizade-cmd","cmd-testeamizade"],
    category: "fun",
    subcategory: "Brincadeiras",
    description: "Testa a força da amizade com outro participante: .testeamizade [nome]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const amigo = args.join(" ") || "Seu Parceiro";
            const nivel = Math.floor(Math.random() * 50) + 50;
            return reply(`🤝 *PROVAÇÃO DA LEALDADE*\nAmizade com: *${amigo}*\n▫️ Vínculo de alma: *${nivel}%*\n▫️ Status: Companheiros prontos para encarar o Rei Demônio lado a lado!`);
        }
};
