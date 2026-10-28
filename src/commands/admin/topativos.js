/**
 * Comando .topativos / .maisativos
 * Ranking dos participantes mais ativos, escopado ao grupo (o global foi
 * removido de propósito: ninguém compete com quem não está no grupo).
 */

const { resolverEscopo, montarRanking } = require("../../services/rankingService");

module.exports = {
    name: "topativos",
    aliases: ["maisativos","rankmensagens","topchat","ativos","cmd_topativos","alt_topativos","atalho_topativos","abrev_topativos","call_topativos","func_topativos"],
    category: "admin",
    description: "Mostra quem mais participa deste grupo, pelo XP acumulado",
    examples: [" — ranking dos 10 mais ativos do grupo"],
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, isGroup, sender, reply }) => {
        const escopo = await resolverEscopo({ from, isGroup });
        return reply(montarRanking({
            coluna: "xp",
            titulo: "Mais ativos",
            emoji: "🏆",
            unidade: "XP",
            escopo,
            senderJid: sender,
            detalhe: "XP vem de conversar e usar comandos. Quem participa mais sobe mais."
        }));
    }
};
