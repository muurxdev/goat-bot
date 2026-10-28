const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { formatNumber, moedas, marcar, linhasSubiuNivel } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

module.exports = {
    name: "labirinto",
    aliases: ["labirintodrole", "drolelabirinto", "desafiolabirinto"],
    category: "rpg",
    subcategory: "Exploração",
    description: "Navegue pelo Labirinto de Rochas de Drole em busca da saída",
    examples: [" — tenta achar o centro do labirinto (60% de chance) por XP e moedas"],
    cooldownMs: 5000,
    execute: async ({ sender, reply, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const achouSaida = Math.random() > 0.4;

        if (achouSaida) {
            const coins = 900;
            const { xpGanho: xp, lvlRes } = adicionarXp(user, 450, { source: "rpg" });
            user.coins = (user.coins || 0) + coins;
            dataService.saveUser(user);
            return reply(F.tela({
                emoji: "🏆",
                titulo: "Labirinto superado",
                intro: `${marcar(sender)} encontrou o centro do Labirinto de Drole e ganhou *+${formatNumber(xp)} XP* e *${moedas(coins)}*.`,
                secoes: [{ emoji: "🎁", titulo: "Recompensas", linhas: [
                    F.campo("XP", `+${formatNumber(xp)}`),
                    F.campo("Moedas", `+${moedas(coins)} (total ${moedas(user.coins)})`)
                ] }, { emoji: "🆙", titulo: "Subiu de nível", linhas: linhasSubiuNivel(user, lvlRes) }],
                dica: "As paredes mudam a cada tentativa: nenhuma rota vale duas vezes.",
                proximos: [
                    { nome: "labirinto", oque: "entrar de novo" },
                    { nome: "explorar", oque: "partir numa expedição" }
                ],
                prefix
            }), [sender]);
        } else {
            return reply(F.tela({
                emoji: "🧱",
                titulo: "Preso no labirinto",
                intro: `As paredes de rocha se moveram e fecharam a passagem de ${marcar(sender)}. Você saiu sem recompensa, mas também sem perder nada.`,
                dica: "Seis em cada dez tentativas chegam ao centro. Tente de novo em 5 segundos.",
                proximos: [
                    { nome: "labirinto", oque: "tentar de novo" },
                    { nome: "hunt", oque: "caçar monstros enquanto isso" }
                ],
                prefix
            }), [sender]);
        }
    }
};
