/**
 * Comando .avisogrupo — Formata e dispara um comunicado solene no grupo: .avisogrupo <mensagem>
 */
module.exports = {
    name: "avisogrupo",
    aliases: ["avisogrupo-cmd","cmd-avisogrupo","cmd_avisogrupo","alt_avisogrupo","atalho_avisogrupo","abrev_avisogrupo","call_avisogrupo","func_avisogrupo"],
    category: "admin",
    subcategory: "Avisos",
    description: "Formata e dispara um comunicado solene no grupo: .avisogrupo <mensagem>",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const m = args.join(" ");
            if (!m) return reply("📢 Uso: `.avisogrupo <mensagem>`");
            return reply(`🛡️📜 *COMUNICADO OFICIAL DA ADMINISTRAÇÃO*\n\n"Atenção a todos os membros do Reino:\n\n${m}\n\n— *Ordem dos Cavaleiros Sagrados*"`);
        }
};
