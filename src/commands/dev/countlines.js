/**
 * Comando .countlines — Conta quantas linhas tem um texto: .countlines <texto>
 */
module.exports = {
    name: "countlines",
    aliases: ["countlines-cmd","cmd-countlines","cmd_countlines","alt_countlines","atalho_countlines","abrev_countlines","call_countlines","func_countlines"],
    category: "dev",
    subcategory: "String",
    description: "Conta quantas linhas tem um texto: .countlines <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.countlines <texto>`");
            const lines = t.split(/\r\n|\r|\n/).length;
            return reply(`📄 *Linhas:* O texto possui *${lines}* linha(s).`);
        }
};
