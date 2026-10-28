/**
 * Comando .setcargo / .setpatente / .titulodono
 * Permite alterar dinamicamente o título/nome de exibição dos cargos da hierarquia de donos
 */

const { updateRankTitle, resetRankTitle, canModifyOwner, getOwnerRank } = require("../../services/ownerService");
const F = require("../../utils/formato");

const PATENTES = "Capitão, Tenente, Sargento, Cabo, Soldado, Guardião, Cavaleiro, Escudeiro, Aprendiz, Recruta";

/** Resposta de recusa vinda da hierarquia, com o caminho para seguir. */
function recusa(reason, prefix) {
    return F.tela({
        emoji: "⛔",
        titulo: "Não posso mudar esse cargo",
        intro: String(reason || "").trim(),
        secoes: [{ emoji: "🎖️", titulo: "Patentes", linhas: [PATENTES] }],
        dica: "O Capitão muda qualquer título; o Tenente muda os abaixo dele; cada dono pode mudar o próprio com meucargo.",
        proximos: [
            { nome: "setcargo", args: "meucargo Novo título", oque: "muda o título do seu cargo" },
            { nome: "dono", oque: "vê a hierarquia atual" }
        ],
        prefix
    });
}

module.exports = {
    name: "setcargo",
    aliases: ["setpatente", "titulodono", "nomearcargo", "customcargo", "resetcargo"],
    category: "owner",
    subcategory: "Gestão do Bot",
    description: "Dá um título personalizado a uma patente da lista de donos",
    usage: "<patente | meucargo | reset> <novo título>",
    examples: [
        "meucargo General de Guerra — muda o título do seu cargo",
        "sargento Mestre das Sombras — muda o título do Sargento",
        "reset tenente — volta o Tenente ao título padrão"
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ args, reply, sender, senderReal, roleJid, prefix = "." }) => {
        const candidates = [roleJid, senderReal, sender].filter(Boolean);
        const myRank = getOwnerRank(sender, candidates);

        if (!myRank) {
            return reply(F.tela({
                emoji: "⛔",
                titulo: "Você não está na lista de donos",
                intro: "Só quem tem uma patente cadastrada (Capitão, Tenente, Sargento…) pode mudar títulos de cargos. Seu número não aparece nessa lista.",
                secoes: [{
                    emoji: "🧭",
                    titulo: "Como resolver",
                    linhas: [
                        `• Peça ao Capitão ou a um Tenente para te cadastrar com ${F.cmd(prefix, "setdono", "Sargento @você")}`,
                        "• Se você já é dono, confira se está usando o mesmo número que foi cadastrado"
                    ]
                }],
                proximos: [{ nome: "dono", oque: "vê quem está na hierarquia" }],
                prefix
            }));
        }

        if (args.length < 1) {
            return reply(F.tela({
                emoji: "👑",
                titulo: "Títulos dos cargos",
                intro: `Dê um nome próprio a uma patente. Seu cargo hoje: *${myRank.customTitle || myRank.rank}*.`,
                secoes: [
                    {
                        emoji: "✍️",
                        titulo: "Digite assim",
                        linhas: [
                            `• ${F.cmd(prefix, "setcargo", "meucargo General de Guerra")} — seu próprio cargo`,
                            `• ${F.cmd(prefix, "setcargo", "sargento Mestre das Sombras")} — outra patente`,
                            `• ${F.cmd(prefix, "setcargo", "reset tenente")} — volta ao título padrão`
                        ]
                    },
                    { emoji: "🎖️", titulo: "Patentes", linhas: [PATENTES] }
                ],
                dica: "O título muda só o nome exibido; a patente e as permissões continuam as mesmas.",
                proximos: [{ nome: "dono", oque: "vê a hierarquia com os títulos" }],
                prefix
            }));
        }

        let targetRank = args[0].toLowerCase();
        let newTitle = args.slice(1).join(" ").trim();

        // 1. Atalho "meucargo"
        if (targetRank === "meucargo" || targetRank === "meu" || targetRank === "meutitulo") {
            targetRank = myRank.rank.toLowerCase();
        }

        // 2. Modo Reset
        if (targetRank === "reset" || targetRank === "restaurar" || targetRank === "padrao") {
            const resetTarget = (args[1] || "").toLowerCase();
            if (!resetTarget) {
                return reply(F.tela({
                    emoji: "❓",
                    titulo: "Qual patente?",
                    intro: "Diga qual patente deve voltar ao título padrão.",
                    secoes: [{ emoji: "✍️", titulo: "Exemplo", linhas: [`• ${F.cmd(prefix, "setcargo", "reset tenente")}`] }],
                    prefix
                }));
            }
            const check = canModifyOwner(sender, resetTarget, candidates);
            if (!check.allowed && !(myRank.rank.toLowerCase() === resetTarget)) {
                return reply(recusa(check.reason, prefix));
            }
            const restored = resetRankTitle(resetTarget);
            if (!restored) {
                return reply(F.tela({
                    emoji: "🔎",
                    titulo: "Patente não encontrada",
                    intro: `Não existe patente chamada *${resetTarget}*.`,
                    secoes: [{ emoji: "🎖️", titulo: "Patentes", linhas: [PATENTES] }],
                    prefix
                }));
            }
            return reply(F.tela({
                emoji: "✅",
                titulo: "Título restaurado",
                intro: `A patente *${restored.rank}* voltou ao título padrão.`,
                proximos: [{ nome: "dono", oque: "vê a hierarquia atualizada" }],
                prefix
            }));
        }

        // 3. Validação de Hierarquia
        const check = canModifyOwner(sender, targetRank, candidates);
        // Permite ao Tenente alterar o próprio título
        const isSelf = myRank.rank.toLowerCase() === targetRank;
        if (!check.allowed && !isSelf) {
            return reply(recusa(check.reason, prefix));
        }

        if (!newTitle) {
            return reply(F.tela({
                emoji: "✍️",
                titulo: "Falta o título",
                intro: `Escreva o novo título para o cargo *${targetRank}* depois do nome da patente.`,
                secoes: [{ emoji: "📌", titulo: "Exemplo", linhas: [`• ${F.cmd(prefix, "setcargo", `${args[0].toLowerCase()} General dos Pecados`)}`] }],
                prefix
            }));
        }

        const updated = updateRankTitle(targetRank, newTitle);
        if (!updated) {
            return reply(F.tela({
                emoji: "⚠️",
                titulo: "Não consegui mudar o título",
                intro: `A patente *${targetRank}* não foi encontrada ou não pôde ser salva agora. Confira o nome e tente de novo.`,
                secoes: [{ emoji: "🎖️", titulo: "Patentes", linhas: [PATENTES] }],
                prefix
            }));
        }

        return reply(F.tela({
            emoji: "👑",
            titulo: "Título do cargo atualizado",
            intro: `A patente *${updated.rank}* agora se chama *${updated.customTitle}*.`,
            secoes: [{
                emoji: "📋",
                titulo: "Detalhes",
                linhas: [
                    F.campo("Patente", `${updated.rank} (nível ${updated.level})`),
                    F.campo("Quem ocupa", updated.name || "vago"),
                    F.campo("Alterado por", `${myRank.customTitle || myRank.rank}${myRank.name ? ` (${myRank.name})` : ""}`)
                ]
            }],
            proximos: [
                { nome: "dono", oque: "vê a hierarquia com o novo título" },
                { nome: "setcargo", args: `reset ${updated.rank.toLowerCase()}`, oque: "desfaz" }
            ],
            prefix
        }));
    }
};
