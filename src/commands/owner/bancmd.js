/**
 * Comando .bancmd / .unbancmd
 * Permite que os Donos do bot suspendam ou reativem comandos globalmente
 * Suporta: por categoria (.bancmd rpg), por nome (.bancmd ytmp4) ou todos (.bancmd all)
 * Duração padrão: Indeterminada (permanente até o dono desbanir)
 */

const dataService = require("../../services/dataService");
const F = require("../../utils/formato");
const logger = require("../../core/logger");

const VALID_CATEGORIES = [
    "rpg", "media", "economy", "dev", "rede", "admin", "fun", "general", "calc", "pesquisa", "interacao", "aluguel", "config"
];

module.exports = {
    name: "bancmd",
    aliases: ["banircomando", "unbancmd", "desbanircmd", "bloquearcmdglobal", "bancmdlist"],
    category: "owner",
    subcategory: "Gestão do Bot",
    description: "Suspende ou libera comandos em todos os grupos: por categoria, por nome ou todos",
    usage: "[list | <comando|categoria|all> [motivo] | unban <comando|categoria|all>]",
    examples: [
        " — mostra o que está suspenso agora",
        "rpg — suspende a categoria RPG inteira",
        "ytmp4 Manutenção no download — suspende um comando com motivo",
        "unban rpg — libera a categoria de novo"
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ sender, reply, args, isOwner, userRole, commandName, prefix = "." }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        if (!isUserOwner) {
            return reply(F.tela({
                emoji: "⛔",
                titulo: "Só para os donos",
                intro: "Suspender comandos para todo mundo é uma decisão dos donos, então não posso fazer isso a seu pedido."
            }));
        }

        const configs = dataService.getConfigsData();
        if (!configs["global"]) configs["global"] = {};
        if (!configs["global"].bannedCommands) configs["global"].bannedCommands = {};

        const bannedMap = configs["global"].bannedCommands;
        const isUnban = commandName === "unbancmd" || commandName === "desbanircmd" || args[0]?.toLowerCase() === "unban" || args[0]?.toLowerCase() === "remover";
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Dono";

        // 1. LISTAR COMANDOS E CATEGORIAS BANIDAS
        if (args.length === 0 || args[0]?.toLowerCase() === "list" || args[0]?.toLowerCase() === "listar") {
            const list = Object.entries(bannedMap);
            if (list.length === 0) {
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Nenhum comando suspenso",
                    intro: "Todos os comandos estão liberados. Quando você suspender algum, ele aparece aqui com o motivo e a data.",
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "bancmd", "rpg")} — suspende a categoria inteira`,
                        `• ${F.cmd(prefix, "bancmd", "ytmp4 Manutenção")} — suspende um comando (e os apelidos dele)`,
                        `• ${F.cmd(prefix, "bancmd", "all")} — suspende todos os comandos públicos`
                    ] }],
                    dica: "A suspensão não tem prazo: vale até você liberar."
                }));
            }

            const linhas = [];
            list.forEach(([cName, info], idx) => {
                const isCat = VALID_CATEGORIES.includes(cName);
                const tag = cName === "all" ? " _(todos os comandos)_" : (isCat ? " _(categoria inteira)_" : "");
                linhas.push(`*${idx + 1}.* \`${prefix}${cName}\`${tag}`);
                linhas.push(`   ${F.campo("Motivo", info.reason || "não informado")}`);
                linhas.push(`   ${F.campo("Data", info.date || "recente")}`);
            });

            return reply(F.tela({
                emoji: "🚫",
                titulo: "Comandos suspensos",
                intro: `*${list.length}* suspensão(ões) valendo em todos os grupos.`,
                secoes: [{ emoji: "🔒", titulo: "Lista", linhas }],
                proximos: [
                    { nome: "unbancmd", args: list[0][0], oque: "liberar o primeiro da lista" },
                    { nome: "unbancmd", args: "all", oque: "liberar tudo de uma vez" }
                ],
                prefix
            }));
        }

        const unbanPorPalavra = isUnban && ["unban", "remover"].includes(args[0]?.toLowerCase());
        const digitado = (unbanPorPalavra ? args[1] : args[0])?.replace(/^[.!#\/]/, "").toLowerCase();
        let target = digitado === "todos" ? "all" : digitado;
        if (!target) {
            return reply(F.tela({
                emoji: "❓",
                titulo: "Diga o que liberar",
                intro: "Informe o nome do comando, da categoria ou `all`.",
                proximos: [
                    { nome: "unbancmd", args: "rpg", oque: "libera a categoria RPG" },
                    { nome: "bancmd", oque: "ver o que está suspenso" }
                ],
                prefix
            }));
        }

        // Só aceita comando que existe ou categoria conhecida, e guarda pelo nome
        // principal: "bancmd ytmp4x" gravava uma suspensão que não pegava nada, e
        // um apelido suspenso não bloqueava quem usava o nome principal.
        if (target !== "all") {
            const { findCommand, commands } = require("../../handlers/commandDispatcher");
            const categorias = new Set(VALID_CATEGORIES);
            for (const c of commands.values()) if (c.category) categorias.add(String(c.category).toLowerCase());
            const cmdAchado = findCommand(target);
            const principal = cmdAchado ? String(cmdAchado.name).toLowerCase() : null;

            if (isUnban && bannedMap[target]) {
                // suspensão antiga gravada por apelido: libera pela chave que está lá
            } else if (categorias.has(target)) {
                // categoria: a chave é o próprio nome
            } else if (principal) {
                target = principal;
            } else {
                return reply(F.tela({
                    emoji: "🔎",
                    titulo: "Não conheço esse comando",
                    intro: `\`${prefix}${target}\` não é um comando meu nem uma categoria. Não mudei nada.`,
                    secoes: [{ emoji: "📂", titulo: "Categorias", linhas: [[...categorias].sort().join(", ")] }],
                    dica: "Confira o nome no menu. Apelidos também valem: eu guardo pelo nome principal.",
                    proximos: [
                        { nome: "menu", oque: "ver os nomes dos comandos" },
                        { nome: "bancmd", oque: "ver o que está suspenso" }
                    ],
                    prefix
                }));
            }
        }

        // Protege comandos essenciais do Dono contra auto-banimento
        const immuneCommands = ["bancmd", "unbancmd", "dono", "setdono", "botopen", "botclose", "eval", "shutdown", "restart", "menu", "help"];
        if (immuneCommands.includes(target)) {
            return reply(F.tela({
                emoji: "🛡️",
                titulo: "Esse não pode ser suspenso",
                intro: `Preciso do ${F.cmd(prefix, target)} para você continuar me controlando, então ele fica sempre liberado.`
            }));
        }

        // 2. DESBANIR (ALL, CATEGORIA OU COMANDO INDIVIDUAL)
        if (isUnban) {
            if (target === "all" || target === "todos") {
                const count = Object.keys(bannedMap).length;
                configs["global"].bannedCommands = {};
                await dataService.saveConfigsData(configs);
                logger.info(`[BANCMD] Dono ${sender} desbaniu TODOS os comandos e categorias globalmente.`);

                return reply(F.tela({
                    emoji: "🔓",
                    titulo: "Todos os comandos liberados",
                    intro: `Limpei *${count}* suspensão(ões). Tudo volta a funcionar em todos os grupos.`,
                    secoes: [{ emoji: "📋", titulo: "Registro", linhas: [F.campo("Liberado por", `@${senderNum}`)] }]
                }), sender ? [sender] : []);
            }

            if (!bannedMap[target]) {
                return reply(F.tela({
                    emoji: "⚠️",
                    titulo: "Não estava suspenso",
                    intro: `\`${prefix}${target}\` já está liberado.`,
                    proximos: [{ nome: "bancmd", oque: "ver o que está suspenso" }],
                    prefix
                }));
            }

            delete bannedMap[target];
            await dataService.saveConfigsData(configs);
            logger.info(`[BANCMD] Dono ${sender} desbaniu ${target}`);

            const isCat = VALID_CATEGORIES.includes(target);
            return reply(F.tela({
                emoji: "🔓",
                titulo: isCat ? "Categoria liberada" : "Comando liberado",
                intro: `\`${prefix}${target}\`${isCat ? " (a categoria inteira)" : ""} volta a funcionar em todos os grupos.`,
                secoes: [{ emoji: "📋", titulo: "Registro", linhas: [F.campo("Liberado por", `@${senderNum}`)] }]
            }), sender ? [sender] : []);
        }

        // 3. BANIR (ALL, CATEGORIA OU COMANDO INDIVIDUAL)
        const reason = args.slice(1).join(" ").trim() || "Suspensão por tempo indeterminado pela administração";
        const date = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

        bannedMap[target] = {
            reason,
            by: sender.split("@")[0],
            date
        };

        await dataService.saveConfigsData(configs);
        logger.info(`[BANCMD] Dono ${sender} baniu ${target} (Motivo: ${reason})`);

        const isCat = VALID_CATEGORIES.includes(target);
        const titulo = target === "all" ? "Todos os comandos suspensos" : (isCat ? "Categoria suspensa" : "Comando suspenso");
        const alcance = target === "all" ? "todos os comandos públicos" : (isCat ? "a categoria inteira" : "o comando e os apelidos dele");

        return reply(F.tela({
            emoji: "🔒",
            titulo,
            intro: `Bloqueei ${alcance} (\`${prefix}${target}\`) em todos os grupos, até você liberar.`,
            secoes: [{ emoji: "📋", titulo: "Registro", linhas: [
                F.campo("Motivo", reason),
                F.campo("Suspenso por", `@${senderNum}`),
                F.campo("Data", date)
            ] }],
            proximos: [{ nome: "unbancmd", args: target, oque: "liberar de novo" }],
            prefix
        }), sender ? [sender] : []);
    }
};
