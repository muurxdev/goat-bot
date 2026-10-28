/**
 * Comando .titulos / .titulo / .conquistas
 * Consulta, desbloqueio e equipamento de títulos de honra com persistência SQLite
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getAllTitles, getUserTitles, getTitleById, unlockUserTitle } = require("../../database/repositories/titleRepository");
const { formatNumber, marcar } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

/** Bônus de um título em uma linha. */
const bonusLinha = t => `ATK +${formatNumber(t.bonus_atk)} · DEF +${formatNumber(t.bonus_def)} · poder +${formatNumber(t.bonus_cp)}`;

module.exports = {
    name: "titulos",
    aliases: ["titulo", "tituloshonra", "conquistasrpg", "titulosgloria", "titulosperfil", "meustitulos"],
    category: "rpg",
    subcategory: "Progressão",
    description: "Consulta, desbloqueia e equipa títulos lendários de honra no seu perfil",
    usage: "[meus | equipar <id>]",
    examples: [
        " — mostra todos os títulos, requisitos e bônus",
        "meus — mostra só os títulos que você já conquistou",
        "equipar iniciante — usa o título O Desbravador Novato no perfil"
    ],
    cooldownMs: 2000,
    execute: async ({ sender, args, reply, prefix }) => {
        const p = prefix || ".";
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sub = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        // 1. Auto-verificação de títulos por nível e progresso
        const userLvl = user.level || 1;
        if (userLvl >= 5) unlockUserTitle(sender, 'iniciante');
        if (userLvl >= 50) unlockUserTitle(sender, 'senhor_pecados');
        if (userLvl >= 100) unlockUserTitle(sender, 'mandamento_supremo');
        if ((user.forgeLevel || 0) >= 5) unlockUserTitle(sender, 'mestre_forjador');

        const unlocked = getUserTitles(sender);
        const unlockedIds = new Set(unlocked.map(t => t.id));

        // 2. EQUIPAR UM TÍTULO DESBLOQUEADO
        if (sub === "equipar" || sub === "usar" || sub === "set") {
            if (!param) {
                return reply(F.tela({
                    emoji: "🎖️",
                    titulo: "Equipar título",
                    intro: "Escolha um título que você já conquistou para aparecer no seu perfil e somar os bônus dele.",
                    secoes: [{ emoji: "📜", titulo: "Seus títulos", linhas: unlocked.length
                        ? unlocked.map(t => `• ${F.cmd(p, "titulo", "equipar " + t.id)} — ${t.name}`)
                        : ["Você ainda não conquistou nenhum. O primeiro chega no nível 5."] }],
                    dica: `Digite assim: ${p}titulo equipar <id>. O id aparece na lista de títulos.`,
                    prefix: p,
                    proximos: [
                        { nome: "titulos", oque: "ver todos os títulos e ids" }
                    ]
                }));
            }

            const targetTitle = getTitleById(param);
            if (!targetTitle) {
                return reply(F.tela({
                    emoji: "❓",
                    titulo: "Título não encontrado",
                    intro: `Não conheço nenhum título com o id "${args[1]}".`,
                    secoes: [{ emoji: "📜", titulo: "Ids que existem", linhas: getAllTitles().map(t => `• ${t.id} — ${t.name}`) }],
                    prefix: p,
                    proximos: [
                        { nome: "titulo", args: "equipar iniciante", oque: "exemplo pronto" },
                        { nome: "titulos", oque: "ver requisitos e bônus" }
                    ]
                }));
            }

            if (!unlockedIds.has(param)) {
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: "Título ainda não conquistado",
                    intro: `Você ainda não conquistou *${targetTitle.name}*.`,
                    secoes: [{ emoji: "📜", titulo: "Como conquistar", linhas: [
                        F.campo("Requisito", targetTitle.requirement),
                        F.campo("Raridade", targetTitle.rarity),
                        F.campo("Bônus", bonusLinha(targetTitle))
                    ] }],
                    dica: "Títulos de nível e de forja chegam sozinhos: basta abrir esta lista depois de cumprir o requisito.",
                    prefix: p,
                    proximos: [
                        { nome: "titulos", args: "meus", oque: "ver o que você já pode equipar" }
                    ]
                }));
            }

            user.equippedTitle = targetTitle.name;
            user.titulo = targetTitle.name;
            dataService.saveUser(user);

            return reply(F.tela({
                emoji: "🎖️",
                titulo: "Título equipado",
                intro: `${marcar(sender)} agora ostenta *${targetTitle.name}*.`,
                secoes: [{ emoji: "⚔️", titulo: "Bônus do título", linhas: [
                    F.campo("Raridade", targetTitle.rarity),
                    F.campo("Ataque", `+${formatNumber(targetTitle.bonus_atk)}`),
                    F.campo("Defesa", `+${formatNumber(targetTitle.bonus_def)}`),
                    F.campo("Poder", `+${formatNumber(targetTitle.bonus_cp)}`)
                ] }],
                dica: "O título aparece em destaque no seu perfil.",
                prefix: p,
                proximos: [
                    { nome: "perfil", oque: "ver como ficou" },
                    { nome: "titulos", args: "meus", oque: "trocar por outro título" }
                ]
            }), [sender]);
        }

        // 3. MEUS TÍTULOS DESBLOQUEADOS
        if (sub === "meus" || sub === "desbloqueados") {
            const linhas = unlocked.map(t => {
                const isEquipped = user.equippedTitle === t.name;
                return `${isEquipped ? "👑" : "•"} *${t.name}* (${t.rarity})${isEquipped ? " · em uso" : ""}\n   ${bonusLinha(t)}${isEquipped ? "" : `\n   ${F.cmd(p, "titulo", "equipar " + t.id)}`}`;
            });

            return reply(F.tela({
                emoji: "🎖️",
                titulo: "Meus títulos",
                intro: unlocked.length
                    ? `${marcar(sender)}, você conquistou *${unlocked.length}* ${unlocked.length === 1 ? "título" : "títulos"}.${user.equippedTitle ? ` Em uso: *${user.equippedTitle}*.` : " Nenhum está em uso."}`
                    : `${marcar(sender)}, você ainda não conquistou nenhum título. O primeiro chega no nível 5.`,
                secoes: [
                    { emoji: "📜", titulo: "Conquistados", linhas }
                ],
                dica: unlocked.length
                    ? "Só um título fica em uso por vez. Prefira o de maior raridade: os bônus são bem maiores."
                    : "Suba de nível ou forje até +5 para ganhar os primeiros títulos.",
                prefix: p,
                proximos: [
                    { nome: "titulos", oque: "ver todos os títulos" },
                    unlocked.length ? null : { nome: "hunt", oque: "subir de nível caçando" }
                ].filter(Boolean)
            }), [sender]);
        }

        // 4. CATÁLOGO GERAL DE TÍTULOS
        const all = getAllTitles();
        const linhas = all.map(t => {
            const hasIt = unlockedIds.has(t.id);
            return `${hasIt ? "🟢" : "🔒"} *${t.name}* (${t.rarity})\n   ${F.campo("Requisito", t.requirement)}\n   ${bonusLinha(t)} · id ${t.id}`;
        });

        const opcaoInvalida = sub && !["lista", "todos", "ver"].includes(sub);

        return reply(F.tela({
            emoji: "🎖️",
            titulo: "Títulos de honra",
            intro: (opcaoInvalida ? `Não conheço a opção "${args[0]}", então mostrei a lista.\n\n` : "") +
                `Você conquistou *${unlocked.length} de ${all.length}* títulos. Cada título equipado soma ataque, defesa e poder.`,
            secoes: [
                { emoji: "📜", titulo: "Todos os títulos", linhas }
            ],
            dica: "Títulos de nível e de forja são liberados sozinhos quando você abre esta lista.",
            prefix: p,
            proximos: [
                { nome: "titulo", args: "equipar <id>", oque: "usar um título conquistado" },
                { nome: "titulos", args: "meus", oque: "ver só os seus" }
            ]
        }), [sender]);
    }
};
