const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { marcar, formatNumber, moedas } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

module.exports = {
    name: "domar",
    aliases: ["domarfera", "capturarmonstro", "domaranimal"],
    category: "rpg",
    subcategory: "Exploração",
    description: "Tente capturar e domar feras mágicas pelas florestas de Reino",
    examples: [" — sai atrás de uma fera e tenta domá-la (dá XP se conseguir)"],
    cooldownMs: 5000,
    execute: async ({ sender, reply, prefix }) => {
        const p = prefix || ".";
        const xpData = dataService.getXpData();
        // Antes usava xpData[sender] com um perfil avulso de reserva: para quem ainda
        // não estava na lista, o XP ia para um objeto fora do xpData e nunca era salvo.
        const user = initializeUser(sender, xpData);
        const feras = ["Grifo das Montanhas", "Lobo Demoníaco Vermelho", "Pégaso Celestial", "Falcão Místico"];
        const fera = feras[Math.floor(Math.random() * feras.length)];
        const sucesso = Math.random() > 0.45;

        if (sucesso) {
            // adicionarXp aplica reencarnação/pet e sobe de nível; somar em user.xp
            // direto deixava o XP acumulado sem nunca virar nível.
            const { xpGanho, lvlRes } = adicionarXp(user, 400, { source: "rpg" });
            await dataService.saveXpData(xpData);
            return reply(F.tela({
                emoji: "🐾",
                titulo: "Fera domada",
                intro: `${marcar(sender)} acalmou e domou um *${fera}* e ganhou *+${formatNumber(xpGanho)} XP*.`,
                secoes: [{ emoji: "📜", titulo: "Relatório", linhas: [
                    F.campo("Fera", fera),
                    F.campo("XP", `+${formatNumber(xpGanho)}`),
                    F.campo("XP total", formatNumber(user.xp || 0))
                ] }, { emoji: "🆙", titulo: "Subiu de nível", linhas: (lvlRes && lvlRes.subiu)
                    ? [`Agora você está no *nível ${formatNumber(user.level)}*`, `+${formatNumber(lvlRes.ganhoHp)} HP de vida máxima · +${moedas(lvlRes.ganhoCoins)}`]
                    : [] }],
                dica: "A fera domada volta para a natureza depois do treino: o que fica com você é a experiência. Mais da metade das tentativas dá certo.",
                prefix: p,
                proximos: [
                    { nome: "domar", oque: "procurar outra fera" },
                    { nome: "hunt", oque: "caçar monstros" }
                ]
            }), [sender]);
        }

        return reply(F.tela({
            emoji: "💨",
            titulo: "A fera escapou",
            intro: `O *${fera}* se assustou e fugiu pela floresta. Você não perdeu nada além do susto.`,
            dica: "Quase metade das feras foge na primeira tentativa. Insista.",
            prefix: p,
            proximos: [
                { nome: "domar", oque: "tentar de novo" },
                { nome: "hunt", oque: "caçar monstros no lugar" }
            ]
        }), [sender]);
    }
};
