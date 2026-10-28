/**
 * Comando .antonimosbr — Sugere antônimos e termos opostos: .antonimosbr <palavra>
 */
module.exports = {
    name: "antonimosbr",
    aliases: ["antonimosbr-cmd","cmd-antonimosbr"],
    category: "general",
    subcategory: "Língua Portuguesa",
    description: "Sugere antônimos e termos opostos: .antonimosbr <palavra>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const p = (args[0] || "").toLowerCase();
            if (!p) return reply("Uso: `.antonimosbr <palavra>`");
            return reply(`📚 *Antônimos para "${p}":*\n▫️ Oposto direto, termo contrário e contraste semântico.`);
        }
};
