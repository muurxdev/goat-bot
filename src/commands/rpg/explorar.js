/**
 * Comando .explorar
 * Expedição em biomas desconhecidos para coleta de gemas e artefatos
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { formatNumber, moedas, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const BIOMAS = [
    { name: "Floresta dos Sonhos Brancos", drop: "🍃 Erva de Fada", xp: 180, coins: 120 },
    { name: "Ruínas Antigas de Vilarejo", drop: "🏛️ Fragmento de Relíquia", xp: 320, coins: 210 },
    { name: "Vulcão de Cinzas Negras", drop: "🌋 Pedra Ígnea", xp: 480, coins: 340 },
    { name: "Vale dos Mortos Silenciosos", drop: "💎 Diamante Sombrio", xp: 750, coins: 500 }
];

module.exports = {
    name: "explorar",
    aliases: ["bioma", "viajante", "desbravar"],
    category: "rpg",
    subcategory: "Exploração",
    description: "Parta numa expedição pelas terras do Reino e volte com achados",
    examples: [" — parte para uma terra sorteada e volta com XP, moedas e um achado"],
    cooldownMs: 20000,
    execute: async ({ sender, reply, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const bioma = BIOMAS[Math.floor(Math.random() * BIOMAS.length)];

        // adicionarXp aplica reencarnação/pet e sobe de nível; somar em user.xp
        // direto deixava o XP acumulado sem nunca virar nível.
        const { xpGanho, lvlRes } = adicionarXp(user, bioma.xp, { source: "rpg" });
        user.coins = (user.coins || 0) + bioma.coins;
        if (!Array.isArray(user.inventario)) user.inventario = [];
        const limiteMochila = user.mochila || 20;
        let itemAdicionado = false;
        if (user.inventario.length < limiteMochila) {
            user.inventario.push(bioma.drop);
            itemAdicionado = true;
        }
        user.inventory = user.inventario;

        dataService.saveUser(user);

        const ocupado = user.inventario.length;
        const cheiaAgora = ocupado >= limiteMochila;

        return reply(F.tela({
            emoji: "🧭",
            titulo: "Expedição concluída",
            intro: itemAdicionado
                ? `${marcar(sender)}, você voltou de *${bioma.name}* com *${moedas(bioma.coins)}*, *+${formatNumber(xpGanho)} XP* e *${bioma.drop}*.`
                : `${marcar(sender)}, você voltou de *${bioma.name}* com *${moedas(bioma.coins)}* e *+${formatNumber(xpGanho)} XP*, mas o achado ficou para trás: a mochila está cheia.`,
            secoes: [{ emoji: "📜", titulo: "Relatório da expedição", linhas: [
                F.campo("Destino", bioma.name),
                F.campo("XP", `+${formatNumber(xpGanho)}`),
                F.campo("Moedas", `+${moedas(bioma.coins)} (total ${moedas(user.coins)})`),
                F.campo("Achado", itemAdicionado ? bioma.drop : `${bioma.drop}, perdido por falta de espaço`),
                F.campo("Mochila", `${F.barra(ocupado / limiteMochila)} (${formatNumber(ocupado)} de ${formatNumber(limiteMochila)})`)
            ] }, { emoji: "🆙", titulo: "Subiu de nível", linhas: (lvlRes && lvlRes.subiu)
                ? [`Agora você está no *nível ${formatNumber(user.level)}*`, `+${formatNumber(lvlRes.ganhoHp)} HP de vida máxima · +${moedas(lvlRes.ganhoCoins)}`]
                : [] }],
            dica: cheiaAgora
                ? "Com a mochila cheia, os próximos achados também vão se perder. Abra espaço antes de explorar de novo."
                : "Cada expedição sorteia uma terra. O Vale dos Mortos Silenciosos é a que rende mais.",
            proximos: [
                cheiaAgora ? { nome: "mochila", args: "up", oque: "aumentar a mochila" } : { nome: "inv", oque: "ver o que você carrega" },
                cheiaAgora ? { nome: "vender", args: "loot", oque: "vender espólios para liberar espaço" } : null,
                { nome: "explorar", oque: "partir de novo daqui a 20 segundos" },
                { nome: "hunt", oque: "caçar monstros do seu mundo" }
            ].filter(Boolean),
            prefix
        }), [sender]);
    }
};
