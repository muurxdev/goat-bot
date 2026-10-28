/**
 * Comando .ecoanimado — Faz um efeito de eco montanhoso com sua mensagem: .ecoanimado <palavra>
 */
module.exports = {
    name: "ecoanimado",
    aliases: ["ecoanimado-cmd","cmd-ecoanimado"],
    category: "fun",
    subcategory: "Texto",
    description: "Faz um efeito de eco montanhoso com sua mensagem: .ecoanimado <palavra>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const w = args.join(" ");
            if (!w) return reply("Uso: `.ecoanimado <palavra>`");
            return reply(`🏔️ *ECO DE TORRE*\n\n${w.toUpperCase()}!\n.. ${w}!\n.... ${w.toLowerCase()}...`);
        }
};
