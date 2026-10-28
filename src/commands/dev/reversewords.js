/**
 * Comando .reversewords — Inverte a ordem das palavras de uma frase: .reversewords <texto>
 */
module.exports = {
    name: "reversewords",
    aliases: ["reversewords-cmd","cmd-reversewords","cmd_reversewords","alt_reversewords","atalho_reversewords","abrev_reversewords","call_reversewords","func_reversewords"],
    category: "dev",
    subcategory: "String",
    description: "Inverte a ordem das palavras de uma frase: .reversewords <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.reversewords <texto>`");
            return reply(`🔄 *Palavras invertidas:*\n${t.split(/\s+/).reverse().join(" ")}`);
        }
};
