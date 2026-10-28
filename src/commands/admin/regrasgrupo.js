/**
 * Comando .regrasgrupo — Exibe o painel de regras solenes da guilda: .regrasgrupo
 */
module.exports = {
    name: "regrasgrupo",
    aliases: ["regrasgrupo-cmd","cmd-regrasgrupo","cmd_regrasgrupo","alt_regrasgrupo","atalho_regrasgrupo","abrev_regrasgrupo","call_regrasgrupo","func_regrasgrupo"],
    category: "admin",
    subcategory: "Regras",
    description: "Exibe o painel de regras solenes da guilda: .regrasgrupo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("📜⚖️ *CÓDIGO DE CONDUTA DO REINO*\n\n1️⃣ Respeito mútuo entre todos os membros e clãs.\n2️⃣ Proibido spam, links suspeitos e travazap.\n3️⃣ Manter o clima agradável como na Taverna do Javali.\n4️⃣ Seguir as diretrizes dos líderes e administradores.\n\nO não cumprimento pode resultar em punições ou expulsão!");
        }
};
