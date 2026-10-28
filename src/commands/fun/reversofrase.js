/**
 * Comando .reversofrase — Inverte as letras de qualquer frase: .reversofrase <texto>
 */
module.exports = {
    name: "reversofrase",
    aliases: ["reversofrase-cmd","cmd-reversofrase"],
    category: "fun",
    subcategory: "Texto",
    description: "Inverte as letras de qualquer frase: .reversofrase <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.reversofrase <texto>`");
            return reply(`🔄 *Texto invertido:*\n${t.split("").reverse().join("")}`);
        }
};
