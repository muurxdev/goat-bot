/**
 * Comando .rankingrpg / .toprpg
 * Mural supremo dos maiores guerreiros de Reino por poder e nível
 */

const dataService = require("../../services/dataService");
const { formatNumber } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

module.exports = {
    name: "rankingrpg",
    aliases: [ "melhoresguerreiros", "hallfamarpg"],
    category: "rpg",
    subcategory: "Progressão",
    description: "Exibe o Hall da Fama dos guerreiros mais poderosos do RPG",
    examples: [" — mostra as 10 maiores lendas por nível e XP"],
    cooldownMs: 3000,
    execute: async ({ reply, sender, prefix = "." }) => {
        const sorted = dataService.userRepo.getTopRank(10);

        if (!sorted.length) {
            return reply(F.tela({
                emoji: "🏆",
                titulo: "Hall da fama do RPG",
                intro: "Ainda não há lendas no mural. Quando houver, aqui aparecem os 10 guerreiros de maior nível, com o XP de cada um.",
                secoes: [{ emoji: "🎯", titulo: "Como entrar no mural", linhas: [
                    `• ${F.cmd(prefix, "hunt")} — caçar monstros e subir de nível`,
                    `• ${F.cmd(prefix, "dungeon")} — descer a masmorra`
                ] }],
                prefix
            }));
        }

        const numero = jid => jid.split("@")[0].split(":")[0];
        const linhas = sorted.map(([jid, user], idx) => {
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`;
            return `${medal} @${numero(jid)} — Nv. ${formatNumber(user.level || 1)} · ${formatNumber(user.xp || 0)} XP`;
        });
        const minhaPos = sender ? sorted.findIndex(([jid]) => numero(jid) === numero(sender)) : -1;
        const lider = sorted[0];

        return reply(F.tela({
            emoji: "🏆",
            titulo: "Hall da fama do RPG",
            intro: `A maior lenda do Reino hoje é @${numero(lider[0])}, no nível *${formatNumber(lider[1].level || 1)}*.${minhaPos >= 0 ? ` Você está em *${minhaPos + 1}º*.` : ""}`,
            secoes: [{ emoji: "⚔️", titulo: "Top 10 maiores lendas", linhas }],
            dica: minhaPos >= 0 ? "Continue caçando para defender o seu lugar." : "Você ainda não está no top 10. Caçadas e masmorra são o caminho mais rápido.",
            proximos: [
                { nome: "hunt", oque: "caçar e subir de nível" },
                { nome: "rankslayer", oque: "ver o ranking por poder de combate" }
            ],
            prefix
        }), sorted.map(([jid]) => jid));
    }
};
