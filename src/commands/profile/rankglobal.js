const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .rankglobal
 * Exibe o Ranking Global de Nível e XP unificado de todos os grupos (Top 50)
 */

const dataService = require("../../services/dataService");
const { formatNumber, moedas } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

module.exports = {
    name: "rankglobal",
    aliases: [ "rankingglobal", "globalrank", "top50"],
    category: "profile",
    subcategory: "Perfil & Ranking",
    description: "Exibe os 50 jogadores de maior nível e XP somando todos os grupos",
    examples: [" — mostra o top 50 de nível de todos os grupos"],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = "." }) => {
        const ranking = dataService.userRepo.getTopRank(50);

        if (ranking.length === 0) {
            return reply(F.tela({
                emoji: "🌍",
                titulo: "Top 50 do Reino",
                intro: "Ainda não há aventureiros no ranking. Quando houver, esta lista mostra os 50 de maior nível de todos os grupos, com XP e moedas de cada um.",
                secoes: [{ emoji: "🎯", titulo: "Como entrar na lista", linhas: [
                    `• ${F.cmd(prefix, "daily")} — pegar a recompensa diária de XP`,
                    `• ${F.cmd(prefix, "hunt")} — caçar monstros e subir de nível`
                ] }],
                dica: "O nível sobe com XP, e XP vem de conversar, caçar e completar desafios.",
                proximos: [
                    { nome: "rank", oque: "ver o seu nível" },
                    { nome: "rankxp", oque: "ver o ranking deste grupo" }
                ],
                prefix
            }));
        }

        const mentions = [];
        const linhas = ranking.map((user, i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`;
            mentions.push(user[0]);
            return `${medalha} ${nomeDoMembro(user[0])} — *Nv. ${formatNumber(user[1].level)}* · ${formatNumber(user[1].xp || 0)} XP · ${moedas(user[1].coins || 0)}`;
        });

        await reply(F.tela({
            emoji: "🌍",
            titulo: "Top 50 do Reino",
            intro: `Os ${formatNumber(ranking.length)} aventureiros de maior nível, somando todos os grupos.`,
            secoes: [{ emoji: "🏅", titulo: "Pódio", linhas }],
            dica: "Para ver só quem está neste grupo, use o ranking de XP do grupo.",
            proximos: [
                { nome: "rankxp", oque: "ranking de XP deste grupo" },
                { nome: "dossie", oque: "ver seu dossiê individual" }
            ],
            prefix
        }), mentions);
    }
};
