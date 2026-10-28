/**
 * Comando .familiar / .guardiao / .espirito
 * Invocação e gestão de familiares guardiões místicos de Reino
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

const FAMILIARES = {
    dragao: { nome: "Falcão Dracônico de Vilarejo", bonus: "+300 CP / +15 ATK", custo: 15000, emoji: "🐉" },
    fada: { nome: "Espírito da Floresta do Rei Fada", bonus: "+250 CP / Regeneração Contínua", custo: 12000, emoji: "🧚" },
    golem: { nome: "Golem de Diamante de Dolor", bonus: "+400 CP / +30 DEF", custo: 20000, emoji: "🗿" },
    sombra: { nome: "Corvo Negro do Purgatório", bonus: "+350 CP / Esquiva +15%", custo: 18000, emoji: "🦅" }
};

module.exports = {
    name: "familiar",
    aliases: ["guardiao", "espirito", "meufamiliar", "invocar-familiar"],
    category: "rpg",
    description: "Invoque e cuide de um Familiar Guardião que concede bônus permanentes",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};

        const sub = (args[0] || "").toLowerCase().trim();

        if (!sub || sub === "status" || sub === "meu") {
            const familiarAtivo = user.rpg.familiar;
            if (!familiarAtivo || !FAMILIARES[familiarAtivo]) {
                const fields = Object.entries(FAMILIARES).map(([key, info]) => {
                    return `${info.emoji} *${info.nome}*\n   ├ 🌟 *Poder:* ${info.bonus}\n   └ 💰 *Custo:* ${formatCoins(info.custo)} (\`.familiar invocar ${key}\`)`;
                });

                const card = renderCard({
                    title: "SANTUÁRIO DE FAMILIARES GUARDIÕES",
                    icon: "🐾",
                    subtitle: `👤 *Aventureiro:* @${sender.split("@")[0]}`,
                    sections: [
                        {
                            title: "STATUS ATUAL",
                            icon: "🔮",
                            fields: ["_Você ainda não possui um familiar guardião vinculado à sua alma._"]
                        },
                        {
                            title: "FAMILIARES DISPONÍVEIS PARA INVOCAÇÃO",
                            icon: "📜",
                            fields: fields
                        }
                    ],
                    tip: "Digite .familiar invocar <dragao|fada|golem|sombra> para invocar!",
                    mentions: [sender]
                });

                return reply(card, [sender]);
            }

            const info = FAMILIARES[familiarAtivo];
            const nivelFamiliar = user.rpg.familiarLevel || 1;

            const card = renderCard({
                title: "SEU FAMILIAR GUARDIÃO",
                icon: "🐾",
                subtitle: `👤 *Guardião:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "FICHA DO FAMILIAR",
                        icon: info.emoji,
                        fields: [
                            { label: "Nome Místico", value: info.nome, icon: "🏷️" },
                            { label: "Nível de Sincronia", value: `Nível ${nivelFamiliar} ⭐`, icon: "📈" },
                            { label: "Bônus Concedido", value: info.bonus, icon: "💥" }
                        ]
                    }
                ],
                tip: "Seu familiar combate ao seu lado em todas as dungeons, caçadas e raids!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (sub === "invocar" || sub === "comprar") {
            const fKey = (args[1] || "").toLowerCase().trim();
            const info = FAMILIARES[fKey];

            if (!info) {
                return reply("❌ *Familiar inválido!* Escolha entre: `dragao`, `fada`, `golem` ou `sombra`.");
            }

            if ((user.coins || 0) < info.custo) {
                return reply(`❌ *Saldo insuficiente!* Você precisa de *${formatCoins(info.custo)}* para invocar este guardião.`);
            }

            user.coins -= info.custo;
            user.rpg.familiar = fKey;
            user.rpg.familiarLevel = 1;
            user.rpg.cp = (user.rpg.cp || 1000) + 300;

            await dataService.saveXpData(xpData);

            return reply(`🎉 *${info.emoji} FAMILIAR INVOCADO COM SUCESSO!*\n\n✨ *${info.nome}* agora é seu leal companheiro de aventuras!\n💥 *Bônus Aplicado:* ${info.bonus}\n💰 *Custo:* ${formatCoins(info.custo)}`);
        }
    }
};

