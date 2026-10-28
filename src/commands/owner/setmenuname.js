/**
 * Comando .setmenuname / .menuname
 * Permite que os Donos alterem os títulos e cabeçalhos dos menus do bot
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

/**
 * Palavra digitada para a chave guardada em customMenuNames. O set e o reset
 * usam a mesma tradução: antes o reset apagava "economia"/"dono", chaves que
 * nunca existem (o set grava "economy"/"owner"), e o título não voltava.
 */
function chaveDoMenu(palavra) {
    return String(palavra || "").toLowerCase().trim()
        .replace("calculadora", "calc")
        .replace("midia", "media")
        .replace("economia", "economy")
        .replace("donos", "owner")
        .replace("dono", "owner")
        .replace("principal", "global")
        .replace("menu", "global");
}

module.exports = {
    name: "setmenuname",
    aliases: ["menuname", "titulomenu", "nomedomenu", "alterarmenu"],
    category: "owner",
    subcategory: "Personalização",
    description: "Muda o título que aparece no topo de cada menu",
    usage: "<global | rpg | media | economia | calc | dono | reset> <título>",
    examples: [
        " — mostra os títulos atuais",
        "rpg Taverna das Aventuras — muda o título do menu de RPG",
        "reset rpg — volta o título do RPG ao padrão"
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args, isOwner, userRole, prefix = "." }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        if (!isUserOwner) {
            return reply(F.tela({
                emoji: "⛔",
                titulo: "Só para os donos",
                intro: "Mudar os títulos dos menus é só para os meus donos. Se você deveria ter acesso, peça a um dono para te cadastrar.",
                proximos: [{ nome: "dono", oque: "vê quem são os donos" }],
                prefix
            }));
        }

        const configs = dataService.getConfigsData();
        if (!configs["global"]) configs["global"] = {};
        if (!configs["global"].customMenuNames) configs["global"].customMenuNames = {};

        const customNames = configs["global"].customMenuNames;

        if (args.length === 0) {
            return reply(F.tela({
                emoji: "🎨",
                titulo: "Títulos dos menus",
                intro: "Estes são os títulos que aparecem no topo de cada menu agora.",
                secoes: [
                    {
                        emoji: "📜",
                        titulo: "Títulos atuais",
                        linhas: [
                            F.campo("Principal (global)", customNames["global"] || getBotName(), "🌐"),
                            F.campo("RPG (rpg)", customNames["rpg"] || "MENU RPG & COMBATES", "⚔️"),
                            F.campo("Mídia (media)", customNames["media"] || "MENU DOWNLOADS & MÍDIAS", "📥"),
                            F.campo("Economia (economia)", customNames["economy"] || "MENU PERFIL & ECONOMIA", "🏆"),
                            F.campo("Calculadora (calc)", customNames["calc"] || "MENU CALCULADORA REAL", "🧮"),
                            F.campo("Donos (dono)", customNames["owner"] || "MENU DONOS & VPS", "👑")
                        ]
                    },
                    {
                        emoji: "✍️",
                        titulo: "Digite assim",
                        linhas: [
                            `• ${F.cmd(prefix, "setmenuname", "global Taverna do GOAT")} — título principal`,
                            `• ${F.cmd(prefix, "setmenuname", "rpg Aventuras no Reino")} — menu de RPG`,
                            `• ${F.cmd(prefix, "setmenuname", "reset rpg")} — volta ao padrão`
                        ]
                    }
                ],
                dica: "Use a palavra entre parênteses para escolher o menu.",
                proximos: [{ nome: "setname", oque: "muda o meu nome em todo lugar" }],
                prefix
            }));
        }

        const targetCat = chaveDoMenu(args[0]);

        if (targetCat === "reset" || targetCat === "padrao") {
            const resetCat = chaveDoMenu(args[1] || "global");
            delete customNames[resetCat];
            await dataService.saveConfigsData(configs);
            return reply(F.tela({
                emoji: "🔄",
                titulo: "Título restaurado",
                intro: `O menu *${resetCat}* voltou a usar o título padrão.`,
                proximos: [{ nome: "setmenuname", oque: "confere os títulos atuais" }],
                prefix
            }));
        }

        const newTitle = args.slice(1).join(" ").trim();
        if (!newTitle) {
            return reply(F.tela({
                emoji: "✍️",
                titulo: "Falta o título",
                intro: `Escreva o novo título depois de *${args[0]}*.`,
                secoes: [{
                    emoji: "📌",
                    titulo: "Exemplo",
                    linhas: [`• ${F.cmd(prefix, "setmenuname", `${args[0]} ᶜᴿᴬᶻᵞ𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨✖️‿✖️•`)}`]
                }],
                prefix
            }));
        }

        customNames[targetCat] = newTitle;
        await dataService.saveConfigsData(configs);
        logger.info("[MENU NAME UPDATED] Dono alterou título de " + targetCat + " para: " + newTitle);

        return reply(F.tela({
            emoji: "✅",
            titulo: "Título do menu atualizado",
            intro: `O menu *${targetCat}* agora tem o título *${newTitle}*.`,
            proximos: [
                { nome: "menu", oque: "vê o resultado" },
                { nome: "setmenuname", args: `reset ${targetCat}`, oque: "desfaz a mudança" }
            ],
            prefix
        }));
    }
};
