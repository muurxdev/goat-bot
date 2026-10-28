/**
 * Comando .countwords — Conta palavras de um texto: .countwords <texto>
 */
module.exports = {
    name: "countwords",
    aliases: ["countwords-cmd","cmd-countwords","cmd_countwords","alt_countwords","atalho_countwords","abrev_countwords","call_countwords","func_countwords"],
    category: "dev",
    subcategory: "String",
    description: "Conta palavras de um texto: .countwords <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ").trim();
            if (!t) return reply("Uso: `.countwords <texto>`");
            const count = t.split(/\s+/).filter(Boolean).length;
            return reply(`📝 *Contagem:* O texto contém *${count}* palavras.`);
        }
};
