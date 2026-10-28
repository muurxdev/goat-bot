/**
 * Comando .cmd / .cmd all
 * Permite que administradores ativem/desativem comandos específicos no grupo
 * e permite aos Donos realizarem auditoria completa de comandos em grupos ou no privado (.cmd all)
 */

const dataService = require("../../services/dataService");
const moduleState = require("../../services/moduleStateService");
const F = require("../../utils/formato");
const { marcar } = require("../../utils/textoRpg");

// Rótulos das categorias na auditoria
const CATEGORIAS = {
    rpg: "⚔️ RPG e aventura",
    economy: "🎰 Economia e cassino",
    media: "📥 Músicas, vídeos e figurinhas",
    general: "🧮 Utilidades gerais",
    dev: "👨‍💻 Programação",
    rede: "🌐 Rede e conexão",
    admin: "🛡️ Administração do grupo",
    owner: "👑 Donos",
    profile: "👤 Perfil e rankings",
    fun: "🎲 Diversão e jogos",
    livros: "📚 Livros",
    adicional: "⚡ Comandos adicionais"
};

// Comandos que nunca podem ser desligados
const PROTEGIDOS = ["cmd", "adm", "setprefix", "fechargrupo", "abrirgrupo", "menu", "help"];

module.exports = {
    name: "cmd",
    aliases: ["togglecmd","bloquearcmd","desativarcmd","ativarcmd","cmdtoggle","cmd_cmd","alt_cmd","atalho_cmd","abrev_cmd","call_cmd","func_cmd"],
    category: "admin",
    subcategory: "Moderação",
    description: "Liga ou desliga comandos no grupo; os donos também veem o resumo de todos os comandos (.cmd all)",
    usage: "<comando> on/off | all on/off",
    examples: [
        " — mostra quais comandos estão desligados no grupo",
        "cassino off — desliga o .cassino para os membros",
        "cassino on — liga o .cassino de novo",
        "all off — só administradores podem usar comandos no grupo"
    ],
    adminOnly: true,
    groupOnly: false,
    cooldownMs: 2500,
    execute: async ({ args, from, reply, isOwner, userRole, isGroup, sender, prefix = "." }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        const sub = (args[0] || "").toLowerCase();
        const P = prefix;

        // 1. RESUMO EXCLUSIVO DOS DONOS: .cmd all / .cmd todos (funciona no PV e em grupos)
        if ((sub === "all" || sub === "todos" || sub === "list" || sub === "listar") && !args[1] && (!isGroup || isUserOwner)) {
            if (!isUserOwner) {
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: "Só para donos",
                    intro: `O resumo de todos os comandos (${F.cmd(P, "cmd", "all")}) é exclusivo dos donos do bot.`,
                    dica: "Administradores de grupo podem ligar e desligar comandos dentro do próprio grupo.",
                    proximos: [
                        { nome: "cmd", args: "<comando> off", oque: "desligar um comando (dentro do grupo)" },
                        { nome: "dono", oque: "ver quem são os donos" }
                    ],
                    prefix: P
                }));
            }

            const dispatcher = require("../../handlers/commandDispatcher");
            const allCmds = Array.from(dispatcher.getCommands().values());
            const allAliases = dispatcher.getAliases();

            const porCategoria = {};
            const roleGroups = { owner: [], admin: [], member: [] };

            for (const cmd of allCmds) {
                const cat = cmd.category || "general";
                porCategoria[cat] = (porCategoria[cat] || 0) + 1;

                if (cmd.ownerOnly || cat === "owner") roleGroups.owner.push(cmd.name);
                else if (cmd.adminOnly || cat === "admin") roleGroups.admin.push(cmd.name);
                else roleGroups.member.push(cmd.name);
            }

            const linhasCategorias = Object.entries(porCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, n]) => F.campo(CATEGORIAS[cat] || "📦 " + cat, n));

            const nomes = (lista) => lista.sort().map(c => P + c).join(", ");

            const doc = F.tela({
                emoji: "👑",
                titulo: "Resumo de todos os comandos",
                intro: `Tenho *${allCmds.length} comandos* e *${allAliases.size} nomes alternativos* carregados agora.`,
                secoes: [
                    {
                        emoji: "👥",
                        titulo: "Quem pode usar",
                        linhas: [
                            F.campo("Todos os membros", roleGroups.member.length),
                            F.campo("Administradores", roleGroups.admin.length),
                            F.campo("Só donos", roleGroups.owner.length)
                        ]
                    },
                    { emoji: "📂", titulo: "Por categoria", linhas: linhasCategorias },
                    { emoji: "👑", titulo: `Só donos (${roleGroups.owner.length})`, linhas: [nomes(roleGroups.owner)] }
                ],
                dica: "Os comandos de administradores e de membros não são listados aqui porque não caberiam numa mensagem; veja-os no menu.",
                proximos: [
                    { nome: "menu", oque: "ver os comandos por categoria" },
                    { nome: "modulo", oque: "ligar ou desligar categorias inteiras" }
                ],
                prefix: P
            });

            return reply(doc);
        }

        // Ligar/desligar comando só faz sentido dentro de um grupo
        if (!isGroup) {
            return reply(F.tela({
                emoji: "👥",
                titulo: "Use dentro de um grupo",
                intro: "Ligar e desligar comandos vale para um grupo específico, então preciso que você mande isso lá.",
                secoes: [{ emoji: "✍️", titulo: "No grupo, digite assim", linhas: [
                    `• ${F.cmd(P, "cmd", "cassino off")} — desliga um comando`,
                    `• ${F.cmd(P, "cmd", "cassino on")} — liga de novo`,
                    `• ${F.cmd(P, "cmd")} — mostra o que está desligado`
                ] }],
                proximos: [
                    isUserOwner ? { nome: "cmd", args: "all", oque: "ver o resumo de todos os comandos (donos)" } : null
                ].filter(Boolean),
                prefix: P
            }));
        }

        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        if (!Array.isArray(configs[from].disabledCommands)) {
            configs[from].disabledCommands = [];
        }

        const disabledList = configs[from].disabledCommands;

        if (args.length === 0) {
            if (disabledList.length === 0) {
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Todos os comandos estão ligados",
                    intro: "Nenhum comando está desligado neste grupo: todos os membros podem usar tudo o que o grupo permite.",
                    secoes: [{ emoji: "⚙️", titulo: "O que dá para fazer", linhas: [
                        `• ${F.cmd(P, "cmd", "<comando> off")} — desliga um comando para os membros`,
                        `• ${F.cmd(P, "cmd", "<comando> on")} — liga de novo`,
                        `• ${F.cmd(P, "cmd", "all off")} — só administradores usam comandos`,
                        `• ${F.cmd(P, "cmd", "all on")} — libera tudo de novo`
                    ] }],
                    dica: "Administradores e donos continuam podendo usar comandos desligados.",
                    proximos: [
                        { nome: "cmd", args: "cassino off", oque: "exemplo: desligar o cassino" }
                    ],
                    prefix: P
                }));
            }
            const tudo = disabledList.includes("all");
            const soltos = disabledList.filter(c => c !== "all");
            return reply(F.tela({
                emoji: "🔒",
                titulo: tudo ? "Comandos travados para membros" : `${soltos.length} ${soltos.length === 1 ? "comando desligado" : "comandos desligados"}`,
                intro: tudo
                    ? "Neste grupo, só administradores e donos podem usar comandos agora."
                    : "Estes comandos não respondem aos membros deste grupo:",
                secoes: [
                    { emoji: "🔴", titulo: "Desligados", linhas: soltos.map(c => `• ${P}${c}`) }
                ],
                dica: "Administradores e donos continuam podendo usar comandos desligados.",
                proximos: [
                    soltos.length ? { nome: "cmd", args: `${soltos[0]} on`, oque: `ligar o ${P}${soltos[0]} de novo` } : null,
                    { nome: "cmd", args: "all on", oque: "ligar tudo de novo" }
                ].filter(Boolean),
                prefix: P
            }));
        }

        const targetCmd = args[0].replace(/^[.!#\/]/, "").toLowerCase();
        const action = args[1]?.toLowerCase();
        const quem = sender ? marcar(sender) : "um administrador";
        const mencoes = sender ? [sender] : [];

        // Caso especial: .cmd all off / .cmd all on no grupo
        if (targetCmd === "all" || targetCmd === "todos") {
            if (action === "off" || action === "desativar") {
                if (!disabledList.includes("all")) {
                    disabledList.push("all");
                }
                moduleState.disableAll(from);
                await dataService.saveConfigsData(configs);

                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Comandos travados para membros",
                    intro: `${quem} desligou os comandos neste grupo. A partir de agora, só administradores e donos podem usá-los.`,
                    dica: "Os membros que tentarem usar um comando vão receber um aviso de que ele está desligado.",
                    proximos: [
                        { nome: "cmd", args: "all on", oque: "liberar tudo de novo" },
                        { nome: "cmd", oque: "ver o que está desligado" }
                    ],
                    prefix: P
                }), mencoes);
            }

            configs[from].disabledCommands = [];
            moduleState.enableAll(from);
            await dataService.saveConfigsData(configs);

            return reply(F.tela({
                emoji: "🟢",
                titulo: "Comandos liberados",
                intro: `${quem} ligou todos os comandos de novo. Os membros já podem usar tudo o que o grupo permite.`,
                dica: "Isto também religou os comandos que tinham sido desligados um por um.",
                proximos: [
                    { nome: "cmd", args: "<comando> off", oque: "desligar só um comando" },
                    { nome: "cmd", args: "all off", oque: "travar os comandos de novo" }
                ],
                prefix: P
            }), mencoes);
        }

        // Protege comandos vitais de administração contra desativação
        if (PROTEGIDOS.includes(targetCmd)) {
            return reply(F.tela({
                emoji: "🛡️",
                titulo: "Esse comando não pode ser desligado",
                intro: `O ${P}${targetCmd} é necessário para administrar o grupo, então ele fica sempre ligado.`,
                secoes: [{ emoji: "🔐", titulo: "Sempre ligados", linhas: [PROTEGIDOS.map(c => P + c).join(", ")] }],
                proximos: [
                    { nome: "cmd", oque: "ver o que está desligado" }
                ],
                prefix: P
            }));
        }

        // O comando precisa existir; aceita também um nome alternativo
        const dispatcher = require("../../handlers/commandDispatcher");
        const encontrado = dispatcher.findCommand(targetCmd);
        // Guarda e compara pelo nome principal: o messageHandler bloqueia todos os
        // apelidos do mesmo comando a partir dele.
        const principalDe = n => dispatcher.findCommand(n)?.name || n;
        const nomeAlvo = encontrado ? encontrado.name : targetCmd;
        const jaDesligado = disabledList.some(c => principalDe(c) === nomeAlvo);
        if (!encontrado && !jaDesligado) {
            return reply(F.tela({
                emoji: "🔍",
                titulo: "Não conheço esse comando",
                intro: `Não achei nenhum comando chamado *${P}${targetCmd}*. Confira se o nome está certo, sem o ponto na frente.`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(P, "cmd", "cassino off")}`,
                    `• ${F.cmd(P, "cmd", "play on")}`
                ] }],
                proximos: [
                    { nome: "menu", oque: "ver o nome certo dos comandos" }
                ],
                prefix: P
            }));
        }

        const apelidos = encontrado ? (encontrado.aliases || []) : [];
        const dicaNomes = apelidos.length
            ? `Vale para todos os nomes do comando: ${[nomeAlvo, ...apelidos].slice(0, 6).map(n => P + n).join(", ")}. Administradores e donos continuam podendo usar.`
            : "Administradores e donos continuam podendo usar comandos desligados.";

        if (action === "off" || action === "desativar" || (!action && !jaDesligado)) {
            if (!jaDesligado) {
                disabledList.push(nomeAlvo);
            }
            moduleState.setCommand(nomeAlvo, false, from);
            await dataService.saveConfigsData(configs);

            return reply(F.tela({
                emoji: "🔴",
                titulo: `${P}${nomeAlvo} desligado`,
                intro: `${quem} desligou o ${P}${nomeAlvo} neste grupo. Os membros não conseguem mais usá-lo.`,
                secoes: [{ emoji: "📋", titulo: "Situação", linhas: [
                    F.campo("Comando", `${P}${nomeAlvo}`),
                    F.campo("Estado", "🔴 desligado para membros"),
                    F.campo("Desligados no grupo", disabledList.filter(c => c !== "all").length)
                ] }],
                dica: dicaNomes,
                proximos: [
                    { nome: "cmd", args: `${nomeAlvo} on`, oque: "ligar de novo" },
                    { nome: "cmd", oque: "ver tudo o que está desligado" }
                ],
                prefix: P
            }), mencoes);
        }

        for (let k = disabledList.length - 1; k >= 0; k--) {
            if (principalDe(disabledList[k]) === nomeAlvo) disabledList.splice(k, 1);
        }
        moduleState.setCommand(nomeAlvo, true, from);
        await dataService.saveConfigsData(configs);

        return reply(F.tela({
            emoji: "🟢",
            titulo: `${P}${nomeAlvo} ligado`,
            intro: jaDesligado
                ? `${quem} ligou o ${P}${nomeAlvo} de novo. Os membros já podem usá-lo.`
                : `O ${P}${nomeAlvo} já estava ligado neste grupo; nada mudou.`,
            secoes: [{ emoji: "📋", titulo: "Situação", linhas: [
                F.campo("Comando", `${P}${nomeAlvo}`),
                F.campo("Estado", "🟢 ligado"),
                disabledList.includes("all") ? F.campo("Atenção", "os comandos do grupo continuam travados para membros") : null
            ] }],
            dica: disabledList.includes("all") ? `Para liberar tudo, use ${P}cmd all on.` : "",
            proximos: [
                { nome: "cmd", args: `${nomeAlvo} off`, oque: "desligar de novo" },
                { nome: "cmd", oque: "ver tudo o que está desligado" }
            ],
            prefix: P
        }), mencoes);
    }
};
