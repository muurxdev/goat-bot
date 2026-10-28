/**
 * Comando .rank / .top / .ranking
 * Rankings divididos por Grupo, Privado (PV), RPG, Veteranos e Moedas.
 * O ranking GLOBAL foi removido de propósito: comparar jogadores de grupos
 * diferentes numa lista só não informa nada a ninguém. Dentro de um grupo,
 * todo recorte lista só os participantes daquele grupo; no PV, onde não há
 * grupo de referência, abre para todos os cadastrados (e a tela diz isso).
 * Só entra quem se cadastrou com .login.
 */

const dataService = require("../../services/dataService");
const { getCargo } = require("../../utils/helpers");
const rankingService = require("../../services/rankingService");
const logger = require("../../core/logger");
const F = require("../../utils/formato");
const cartao = require("../../services/cartaoService");

const { numeroDe } = rankingService;
const LIMITE = 10;
// Quantos cadastrados leio antes de aplicar o recorte do grupo.
const TETO_LEITURA = 500;
const MEDALHAS = ["🥇", "🥈", "🥉"];

const fmt = n => (Number(n) || 0).toLocaleString("pt-BR");
const posicao = i => MEDALHAS[i] || `${i + 1}º`;
const nickDe = (jid, u) => u.displayNick || u.display_nick || u.name || `@${numeroDe(jid)}`;

function noEscopo(jid, u, escopo) {
    if (!escopo?.numeros) return true;
    return escopo.numeros.has(numeroDe(jid)) || (u.lid && escopo.numeros.has(numeroDe(u.lid)));
}

function ehQuemPediu(jid, u, sender) {
    const n = numeroDe(sender);
    return numeroDe(jid) === n || (u.lid && numeroDe(u.lid) === n);
}

/**
 * Monta a tela de um ranking já ordenado e recortado.
 * @param {object} o
 * @param {Array<[string, object]>} o.elegiveis  todos do recorte, em ordem
 * @param {(jid:string, u:object) => string} o.resumo  valor curto da pessoa
 * @param {(jid:string, u:object) => string} [o.detalhe] segunda linha opcional
 */
function telaRanking({ emoji, titulo, oque, elegiveis, resumo, detalhe, escopo, sender, dica, proximos, prefix }) {
    const top = elegiveis.slice(0, LIMITE);
    const idx = elegiveis.findIndex(([jid, u]) => ehQuemPediu(jid, u, sender));
    const mentions = top.map(([jid]) => jid);

    const linhas = top.map(([jid, u], i) => {
        const voce = idx === i ? " ← *você*" : "";
        const extra = detalhe ? `\n   ${detalhe(jid, u)}` : "";
        return `${posicao(i)} *${nickDe(jid, u)}* (@${numeroDe(jid)}) — ${resumo(jid, u)}${voce}${extra}`;
    });

    let linhasVoce;
    if (idx >= 0) {
        const [jid, u] = elegiveis[idx];
        linhasVoce = [
            F.campo("Posição", `${idx + 1}º de ${fmt(elegiveis.length)}`),
            F.campo("Você tem", resumo(jid, u)),
            idx > 0 ? F.campo("À sua frente", `${nickDe(...elegiveis[idx - 1])} — ${resumo(...elegiveis[idx - 1])}`) : "Você lidera este ranking. 👑"
        ];
    } else {
        const cad = dataService.userRepo.getUser ? dataService.userRepo.getUser(sender) : null;
        linhasVoce = cad && cad.registered && (cad.displayNick || cad.display_nick)
            ? ["Você ainda não pontuou neste ranking."]
            : [`Você ainda não tem cadastro. Use ${F.cmd(prefix, "login", "<seu nick>")} para entrar.`];
    }

    const linhasCartao = elegiveis.slice(0, 10).map(([jid, u], i) => {
        const partes = String(resumo(jid, u)).split(" · ");
        return {
            pos: i + 1,
            nome: nickDe(jid, u),
            valor: partes.length > 1 ? partes.pop() : partes[0],
            detalhe: partes.length ? partes.join(" · ") : "",
            destaque: i === idx
        };
    });

    return {
        cartao: {
            titulo,
            subtitulo: escopo.rotulo,
            linhas: linhasCartao,
            rodape: idx >= 0 ? `você está em ${idx + 1}º de ${fmt(elegiveis.length)}` : `${fmt(elegiveis.length)} no ranking`
        },
        texto: F.tela({
            emoji,
            titulo,
            intro: `Top ${top.length} ${oque}, ${escopo.rotulo}.` + (idx >= 0 ? ` Você está em *${idx + 1}º*.` : ""),
            secoes: [
                { emoji: "🏅", titulo: "Classificação", linhas: [linhas.join("\n")] },
                { emoji: "🎯", titulo: "Sua posição", linhas: linhasVoce }
            ],
            dica,
            proximos,
            prefix
        }),
        mentions
    };
}

function telaVazia({ emoji, titulo, motivo, escopo, prefix }) {
    return F.tela({
        emoji,
        titulo,
        intro: `${motivo} (${escopo.rotulo}).`,
        dica: "Só aparece no ranking quem se cadastrou comigo.",
        proximos: [
            { nome: "login", args: "<seu nick>", oque: "criar seu cadastro e entrar nos rankings" },
            { nome: "rank", oque: "ver os outros rankings" }
        ],
        prefix
    });
}

/** Lê o top do repositório e aplica o recorte do grupo, sem cortar em 10 antes. */
function lerRecortado(fn, escopo) {
    const repo = dataService.userRepo;
    if (typeof repo[fn] !== "function") {
        logger.warn(`[RANK] userRepo.${fn} não existe — ranking vazio.`);
        return [];
    }
    return repo[fn](TETO_LEITURA).filter(([jid, u]) => noEscopo(jid, u, escopo));
}

module.exports = {
    name: "rank",
    aliases: [
        "top", "leaderboard",
        "rankgrupo", "topgrupo", "rankgp",
        "rankpv", "toppv", "rankdm",
        "rankrpg", "toprpg",
        "rankskycode", "topskycode", "ranksky", "topcoins"
    ],
    category: "profile",
    subcategory: "Perfil & Ranking",
    description: "Exibe os rankings do grupo: atividade, privado, RPG, veteranos ou moedas",
    usage: "[grupo|pv|rpg|coins|skycode]",
    examples: [
        " — mostra os rankings disponíveis",
        "grupo — quem é mais ativo neste grupo",
        "rpg — os guerreiros mais fortes do grupo",
        "coins — quem tem mais moedas no grupo"
    ],
    cooldownMs: 2500,
    execute: async ({ reply, from, isGroup, args, sender, client, info, commandName = "rank", prefix = "." }) => {
        const enviarRanking = r => cartao.enviarComCartao({
            ctx: { client, from, info, reply },
            texto: r.texto,
            mentions: r.mentions,
            gerar: () => cartao.cartaoRanking(r.cartao)
        });
        let mode = (args[0] || "").toLowerCase().trim();

        // Atalhos diretos por alias. O contexto traz commandName; o campo
        // command nunca existiu, então os atalhos sempre caíam no menu.
        const cmdName = String(commandName).toLowerCase();
        if (["rankgrupo", "topgrupo", "rankgp"].includes(cmdName)) mode = "grupo";
        if (["rankpv", "toppv", "rankdm"].includes(cmdName)) mode = "pv";
        if (["rankrpg", "toprpg"].includes(cmdName)) mode = "rpg";
        if (["rankskycode", "topskycode", "ranksky"].includes(cmdName)) mode = "skycode";
        if (["rankcoins", "topcoins"].includes(cmdName)) mode = "coins";

        const outros = (exceto) => [
            { m: "grupo", nome: "rank", args: "grupo", oque: "mais ativos do grupo" },
            { m: "rpg", nome: "rank", args: "rpg", oque: "guerreiros mais fortes" },
            { m: "coins", nome: "rank", args: "coins", oque: "quem tem mais moedas" },
            { m: "pv", nome: "rank", args: "pv", oque: "mais ativos comigo no privado" }
        ].filter(o => o.m !== exceto).slice(0, 3);

        // 0. MENU PRINCIPAL DE SELEÇÃO DE RANKINGS
        if (!mode || mode === "menu" || mode === "ajuda" || mode === "help") {
            const regCount = dataService.userRepo.getRegisteredCount ? dataService.userRepo.getRegisteredCount() : 0;
            const cad = dataService.userRepo.getUser ? dataService.userRepo.getUser(sender) : null;
            const cadastrado = !!(cad && cad.registered && (cad.displayNick || cad.display_nick));
            return reply(F.tela({
                emoji: "🏆",
                titulo: "Rankings",
                intro: isGroup
                    ? "Escolha um ranking. Todos comparam só quem está neste grupo."
                    : "Escolha um ranking. Aqui no privado, a comparação é entre todos os cadastrados.",
                secoes: [
                    { emoji: "📂", titulo: "Rankings disponíveis", linhas: [
                        `• ${F.cmd(prefix, "rank", "grupo")} — mais ativos do grupo (nível e XP de grupo)`,
                        `• ${F.cmd(prefix, "rank", "rpg")} — guerreiros mais fortes (nível, chefes e vitórias)`,
                        `• ${F.cmd(prefix, "rank", "coins")} — quem tem mais moedas na carteira`,
                        `• ${F.cmd(prefix, "rank", "pv")} — mais ativos comigo no privado`,
                        `• ${F.cmd(prefix, "rank", "skycode")} — cadastrados mais antigos`
                    ] },
                    { emoji: "👤", titulo: "Você", linhas: [
                        F.campo("Cadastro", cadastrado ? `feito, como *${cad.displayNick || cad.display_nick}*` : "ainda não feito"),
                        F.campo("Pessoas cadastradas", fmt(regCount))
                    ] }
                ],
                dica: cadastrado
                    ? "Cada ranking mostra também a sua posição, mesmo fora do top 10."
                    : "Só entra nos rankings quem se cadastrou. Leva um segundo.",
                proximos: cadastrado
                    ? [{ nome: "rank", args: "grupo", oque: "ver sua posição no grupo" }, { nome: "perfil", oque: "ver seu perfil completo" }]
                    : [{ nome: "login", args: "<seu nick>", oque: "criar seu cadastro" }, { nome: "rank", args: "grupo", oque: "ver quem já está no ranking" }],
                prefix
            }));
        }

        // RANKING GERAL / GLOBAL — REMOVIDO
        // Misturava jogadores de todos os grupos numa lista só: quem estava no
        // grupo A via desconhecidos do grupo B liderando. Ninguém compete com
        // quem não conhece, então a comparação não dizia nada. Os rankings
        // agora são escopados no grupo onde o comando foi usado.
        if (mode === "geral" || mode === "global") {
            return reply(F.tela({
                emoji: "👑",
                titulo: "O ranking geral foi aposentado",
                intro: "Ele juntava gente de todos os grupos numa lista só, e você acabava competindo com quem nunca viu.",
                secoes: [{ emoji: "📂", titulo: "Use no lugar", linhas: [
                    `• ${F.cmd(prefix, "rank", "grupo")} — mais ativos deste grupo`,
                    `• ${F.cmd(prefix, "rank", "rpg")} — guerreiros mais fortes`,
                    `• ${F.cmd(prefix, "rankpatrimonio")} — quem tem mais, somando tudo`,
                    `• ${F.cmd(prefix, "rankxp")} — mais XP deste grupo`
                ] }],
                dica: "Todos os rankings comparam só as pessoas do grupo em que você está.",
                prefix
            }));
        }

        const escopo = await rankingService.resolverEscopo({ from, isGroup });

        // 1. RANKING DO PRIVADO (PV)
        if (mode === "pv" || mode === "dm" || mode === "privado") {
            const elegiveis = lerRecortado("getTopPv", escopo);
            if (!elegiveis.length) {
                return reply(telaVazia({ emoji: "💬", titulo: "Ranking do privado vazio", motivo: "Ninguém cadastrado conversou comigo no privado ainda", escopo, prefix }));
            }
            const r = telaRanking({
                emoji: "💬",
                titulo: "Ranking do privado",
                oque: "mais ativos comigo no privado",
                elegiveis,
                resumo: (jid, u) => `Nv. ${fmt(u.levelPv || u.level_pv || 1)} · ${fmt(u.xpPv || u.xp_pv || 0)} XP`,
                detalhe: (jid, u) => {
                    const coinsPv = u.coinsPv || u.coins_pv || 0;
                    return `${fmt(u.commandsPv || u.commands_pv || 0)} comandos${coinsPv > 0 ? ` · ${fmt(coinsPv)} moedas no privado` : ""}`;
                },
                escopo, sender,
                dica: "Nível e XP do privado são contados à parte do grupo e do RPG.",
                proximos: outros("pv"),
                prefix
            });
            return enviarRanking(r);
        }

        // 2. RANKING DE RPG & COMBATE
        if (mode === "rpg" || mode === "combate" || mode === "batalha" || mode === "hunt") {
            const elegiveis = lerRecortado("getTopRpg", escopo);
            if (!elegiveis.length) {
                return reply(telaVazia({ emoji: "⚔️", titulo: "Ranking do RPG vazio", motivo: "Nenhum guerreiro cadastrado ainda", escopo, prefix }));
            }
            const r = telaRanking({
                emoji: "⚔️",
                titulo: "Guerreiros mais fortes",
                oque: "guerreiros do RPG",
                elegiveis,
                resumo: (jid, u) => {
                    const rebirths = u.rebirthCount || u.rebirth_count || 0;
                    return `Nv. ${fmt(u.levelRpg || u.level_rpg || u.level || 1)}${rebirths > 0 ? ` · 🌀 ${rebirths}x` : ""}`;
                },
                detalhe: (jid, u) => {
                    const lvl = u.levelRpg || u.level_rpg || u.level || 1;
                    return `${getCargo(lvl)} · ${fmt(u.xpRpg || u.xp_rpg || u.xp || 0)} XP · ${fmt(u.bossesMortos || u.bosses_mortos || 0)} chefes · ${fmt(u.wins || 0)} vitórias`;
                },
                escopo, sender,
                dica: "Caçar, encarar masmorras e derrotar chefes é o jeito mais rápido de subir.",
                proximos: [
                    { nome: "hunt", oque: "caçar e ganhar XP" },
                    { nome: "boss", oque: "enfrentar um chefe" },
                    ...outros("rpg").slice(0, 1)
                ],
                prefix
            });
            return enviarRanking(r);
        }

        // 3. RANKING SKYCODE (VETERANOS CADASTRADOS)
        if (mode === "skycode" || mode === "sky" || mode === "terminal") {
            const elegiveis = lerRecortado("getTopSkycode", escopo);
            if (!elegiveis.length) {
                return reply(telaVazia({ emoji: "🛰️", titulo: "Nenhum cadastrado ainda", motivo: "Ninguém se cadastrou comigo ainda", escopo, prefix }));
            }
            const r = telaRanking({
                emoji: "🛰️",
                titulo: "Cadastrados mais antigos",
                oque: "cadastrados mais antigos",
                elegiveis,
                resumo: (jid, u) => {
                    const regDate = u.registeredAt || u.registered_at || u.createdAt || u.created_at;
                    return regDate ? `desde ${new Date(regDate).toLocaleDateString("pt-BR")}` : "cadastro recente";
                },
                detalhe: (jid, u) => `Grupo Nv. ${fmt(u.levelGroup || u.level_group || 1)} · Privado Nv. ${fmt(u.levelPv || u.level_pv || 1)} · RPG Nv. ${fmt(u.levelRpg || u.level_rpg || u.level || 1)} · ${fmt(u.messages || 0)} mensagens`,
                escopo, sender,
                dica: "A ordem é pela data do cadastro: quem chegou primeiro aparece no topo.",
                proximos: outros("skycode"),
                prefix
            });
            return enviarRanking(r);
        }

        // 4. RANKING DE COINS & ECONOMIA
        if (mode === "coins" || mode === "rico" || mode === "riqueza" || mode === "economia") {
            const elegiveis = lerRecortado("getTopCoins", escopo);
            if (!elegiveis.length) {
                return reply(telaVazia({ emoji: "💰", titulo: "Ranking de moedas vazio", motivo: "Nenhum cadastrado com moedas ainda", escopo, prefix }));
            }
            const r = telaRanking({
                emoji: "💰",
                titulo: "Quem tem mais moedas",
                oque: "carteiras mais cheias",
                elegiveis,
                resumo: (jid, u) => `${fmt(u.coins || 0)} moedas na carteira`,
                detalhe: (jid, u) => `🏦 ${fmt(u.bank || 0)} no banco`,
                escopo, sender,
                dica: "A ordem é pela carteira. Para somar banco e cofre, use .rankpatrimonio.",
                proximos: [
                    { nome: "trabalhar", oque: "ganhar moedas" },
                    { nome: "rankpatrimonio", oque: "ranking somando tudo o que cada um tem" },
                    ...outros("coins").slice(0, 1)
                ],
                prefix
            });
            return enviarRanking(r);
        }

        // No PV não existe grupo de referência: sem esse desvio, qualquer modo
        // desconhecido cairia no ranking abaixo sem lista de participantes —
        // ou seja, voltaria a ser o ranking global que acabou de ser removido.
        if (!isGroup) {
            return reply(F.tela({
                emoji: "💬",
                titulo: "Este ranking é por grupo",
                intro: "No privado não há um grupo para comparar. Use este ranking dentro de um grupo ou escolha um que funciona aqui.",
                secoes: [{ emoji: "📂", titulo: "Funcionam no privado", linhas: [
                    `• ${F.cmd(prefix, "rank", "rpg")} — guerreiros mais fortes`,
                    `• ${F.cmd(prefix, "rank", "coins")} — quem tem mais moedas`,
                    `• ${F.cmd(prefix, "rank", "pv")} — mais ativos comigo no privado`,
                    `• ${F.cmd(prefix, "rank", "skycode")} — cadastrados mais antigos`
                ] }],
                prefix
            }));
        }

        // 6. RANKING EXCLUSIVO DO GRUPO ATUAL
        const modoDesconhecido = mode && !["grupo", "group", "gp"].includes(mode);
        const xpData = dataService.getXpData();
        const elegiveis = Object.entries(xpData)
            .filter(([jid, u]) => {
                // FILTRO ESTRITO: Apenas quem possui conta real criada
                if (!u.registered || !u.displayNick) return false;
                return noEscopo(jid, u, escopo);
            })
            .sort((a, b) => {
                const lvlA = a[1].levelGroup || a[1].level_group || 1;
                const lvlB = b[1].levelGroup || b[1].level_group || 1;
                const xpA = a[1].xpGroup || a[1].xp_group || 0;
                const xpB = b[1].xpGroup || b[1].xp_group || 0;
                const scoreA = (lvlA * 1000000) + xpA;
                const scoreB = (lvlB * 1000000) + xpB;
                return scoreB - scoreA;
            });

        if (elegiveis.length === 0) {
            return reply(telaVazia({ emoji: "👥", titulo: "Ranking do grupo vazio", motivo: "Ninguém deste grupo se cadastrou comigo ainda", escopo, prefix }));
        }

        const r = telaRanking({
            emoji: "👥",
            titulo: "Mais ativos do grupo",
            oque: "mais ativos",
            elegiveis,
            resumo: (jid, u) => `Nv. ${fmt(u.levelGroup || u.level_group || 1)} · ${fmt(u.xpGroup || u.xp_group || 0)} XP`,
            detalhe: (jid, u) => `${fmt(u.messages || 0)} mensagens`,
            escopo, sender,
            dica: modoDesconhecido
                ? `Não conheço o ranking "${args[0]}", então mostrei o do grupo. Veja as opções com .rank.`
                : "Conversar no grupo dá XP de grupo. Quanto mais participa, mais sobe.",
            proximos: [
                ...outros("grupo").slice(0, 2),
                { nome: "rankxp", oque: "mais XP deste grupo" }
            ],
            prefix
        });
        return enviarRanking(r);
    }
};
