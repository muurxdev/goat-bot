/**
 * Comando .medalhasaga — Lista suas medalhas de bravura da Guerra Santa: .medalhasaga
 */
module.exports = {
    name: "medalhasaga",
    aliases: ["medalhasaga-cmd","cmd-medalhasaga"],
    category: "profile",
    subcategory: "Conquistas",
    description: "Lista suas medalhas de bravura da Guerra Santa: .medalhasaga",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🎖️ *MEDALHAS DE HONRA*\n\n🥇 Ordem dos Cavaleiros Sagrados Central\n🥈 Ordem dos Guardiões da Floresta das Fadas\n🥉 Medalha de Mérito dos Sete Traços Capitais\n\n*Concedidas pessoalmente pelo Rei Bartra Central!*");
        }
};
