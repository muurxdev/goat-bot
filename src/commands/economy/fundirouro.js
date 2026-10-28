/**
 * Comando .fundirouro — Funde pepitas de ouro em barras puras: .fundirouro
 */
module.exports = {
    name: "fundirouro",
    aliases: ["fundirouro-cmd","cmd-fundirouro","cmd_fundirouro","alt_fundirouro","atalho_fundirouro","abrev_fundirouro","call_fundirouro","func_fundirouro"],
    category: "economy",
    subcategory: "Forja",
    description: "Funde pepitas de ouro em barras puras: .fundirouro",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const barras = Math.floor(Math.random() * 3) + 1;
            return reply(`🔥 *FORNO DE FUNDIÇÃO REAL*\n\nO fogo derreteu as impurezas do minério!\nVocê forjou *${barras} Barra(s) de Ouro Puro* com o selo do leão!`);
        }
};
