/**
 * Comando .replacespaces — Substitui espaços por um caractere: .replacespaces <char> <texto>
 */
module.exports = {
    name: "replacespaces",
    aliases: ["replacespaces-cmd","cmd-replacespaces","cmd_replacespaces","alt_replacespaces","atalho_replacespaces","abrev_replacespaces","call_replacespaces","func_replacespaces"],
    category: "dev",
    subcategory: "String",
    description: "Substitui espaços por um caractere: .replacespaces <char> <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("Uso: `.replacespaces <char> <texto>`\nEx: `.replacespaces _ ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Pecado da Ira`");
            const ch = args[0];
            const text = args.slice(1).join(" ");
            return reply(`🔤 *Resultado:*\n${text.split(" ").join(ch)}`);
        }
};
