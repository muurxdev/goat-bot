const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .farmpv / .xppv
 * Permite que os donos ativem ou desativem o ganho de XP e farm no PV (privado)
 */

const dataService = require("../../services/dataService");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

module.exports = {
    name: "farmpv",
    aliases: [ "pvfarm", "farmxp", "pvxp"],
    category: "owner",
    subcategory: "Privado",
    description: "Liga ou desliga o ganho de XP para quem usa comandos comigo no privado",
    usage: "[on | off]",
    examples: [
        " — mostra se o XP no privado está ligado",
        "on — passa a dar XP no privado",
        "off — XP só nos grupos"
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args, isOwner, userRole, sender, prefix = "." }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        if (!isUserOwner) {
            return reply(F.tela({
                emoji: "⛔",
                titulo: "Só para os donos",
                intro: "Ligar ou desligar o XP no privado é só para os meus donos. Se você deveria ter acesso, peça a um dono para te cadastrar.",
                proximos: [{ nome: "dono", oque: "vê quem são os donos" }],
                prefix
            }));
        }

        const configs = dataService.getConfigsData();
        if (!configs["global"]) configs["global"] = {};

        const action = (args[0] || "").toLowerCase().trim();
        const current = configs["global"].allowPvXpFarm === true;
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Dono";

        if (!action) {
            return reply(F.tela({
                emoji: current ? "🟢" : "🔴",
                titulo: current ? "XP no privado: ligado" : "XP no privado: desligado",
                intro: current
                    ? "Quem usa comandos comigo no privado ganha XP normalmente."
                    : "No privado ninguém ganha XP: só nos grupos.",
                proximos: [
                    current
                        ? { nome: "farmpv", args: "off", oque: "deixa o XP só nos grupos" }
                        : { nome: "farmpv", args: "on", oque: "libera o XP no privado" }
                ],
                prefix
            }));
        }

        if (action === "on" || action === "ativar" || action === "1" || action === "sim") {
            configs["global"].allowPvXpFarm = true;
            await dataService.saveConfigsData(configs);
            logger.info("[FARM PV] Dono ativou ganho de XP no PV.");

            return reply(F.tela({
                emoji: "🟢",
                titulo: "XP no privado ligado",
                intro: "A partir de agora, quem usa comandos comigo no privado também ganha XP.",
                secoes: [{ emoji: "📋", titulo: "Detalhes", linhas: [F.campo("Alterado por", `${nomeDoMembro(sender)}`)] }],
                proximos: [{ nome: "farmpv", args: "off", oque: "desliga de novo" }],
                prefix
            }), sender ? [sender] : []);
        } else if (action === "off" || action === "desativar" || action === "0" || action === "nao") {
            configs["global"].allowPvXpFarm = false;
            await dataService.saveConfigsData(configs);
            logger.info("[FARM PV] Dono desativou ganho de XP no PV.");

            return reply(F.tela({
                emoji: "🔴",
                titulo: "XP no privado desligado",
                intro: "No privado ninguém ganha mais XP. Nos grupos continua tudo igual.",
                secoes: [{ emoji: "📋", titulo: "Detalhes", linhas: [F.campo("Alterado por", `${nomeDoMembro(sender)}`)] }],
                proximos: [{ nome: "farmpv", args: "on", oque: "liga de novo" }],
                prefix
            }), sender ? [sender] : []);
        } else {
            return reply(F.tela({
                emoji: "❓",
                titulo: `Não entendi "${action}"`,
                intro: "Use on para ligar ou off para desligar o XP no privado.",
                proximos: [
                    { nome: "farmpv", args: "on", oque: "liga" },
                    { nome: "farmpv", args: "off", oque: "desliga" }
                ],
                prefix
            }));
        }
    }
};
