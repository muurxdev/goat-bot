/**
 * Comando .enviarcartareal — Envia uma carta selada com cera real para um destinatário: .enviarcartareal <mensagem>
 */
module.exports = {
    name: "enviarcartareal",
    aliases: ["enviarcartareal-cmd","cmd-enviarcartareal"],
    category: "general",
    subcategory: "Social",
    description: "Envia uma carta selada com cera real para um destinatário: .enviarcartareal <mensagem>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const m = args.join(" ");
            if (!m) return reply("Uso: `.enviarcartareal <mensagem>`");
            return reply(`✉️📜 *CARTA REAL SELADA COM CERA*\n\nUma coruja imperial partiu levando sua mensagem:\n\"${m}\"\nO selo do Dragão garante a entrega imediata!`);
        }
};
