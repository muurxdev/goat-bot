/**
 * Comando .bencaovitalidade — Bênção de vitalidade e purificação, graus 1 a 11.
 * Categoria: rpg | Subcategoria: Magia das Deusas
 *
 * Junta os antigos .bencao1 … .bencao11 (onze arquivos iguais, só com o grau
 * trocado; unificado em 2026-09-18). Os nomes antigos continuam como atalhos:
 * ".bencao7" invoca o grau 7. O efeito é real e temporário (blessingService).
 */

const dataService = require("../../services/dataService");
const blessing = require("../../services/blessingService");
const { formatNumber, marcar } = require("../../utils/textoRpg");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

/** Grau pedido: pelo argumento (".bencaovitalidade 7") ou pelo atalho digitado (".bencao7"). */
function grauPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "bencaovitalidade",
    aliases: ["benc-1","benc-2","benc-3","benc-4","benc-5","benc-6","benc-7","benc-8","benc-9","benc-10","benc-11","benc1","benc2","benc3","benc4","benc5","benc6","benc7","benc8","benc9","benc10","benc11","bencao1","bencao2","bencao3","bencao4","bencao5","bencao6","bencao7","bencao8","bencao9","bencao10","bencao11"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Invoca a Bênção de Vitalidade, do grau 1 ao 11 (+150 CP temporário por grau)",
    usage: "<grau de 1 a 11>",
    examples: ["3 — recebe a bênção de grau 3 por um tempo (não substitui uma de grau maior)", " — mostra os graus e o que cada um dá"],
    cooldownMs: 1500,
    execute: async ({ reply, sender, args = [], commandName = '', prefix = '.' }) => {
        const GRAU = grauPedido(args, commandName);
        if (GRAU === null || GRAU < 1 || GRAU > blessing.GRAU_MAX) {
            return reply(F.tela({
                emoji: "🌟",
                titulo: "Bênção de vitalidade",
                intro: GRAU === null ? "Escolha o grau da bênção. Quanto maior, mais poder e mais tempo." : `O grau vai de 1 a ${blessing.GRAU_MAX}.`,
                secoes: [{ emoji: "📊", titulo: "Graus", linhas: Array.from({ length: blessing.GRAU_MAX }, (_, i) => {
                    const b = blessing.getBlessing(i + 1);
                    return `• *Grau ${b.grau}:* +${formatNumber(b.cp)} de poder por ${blessing.formatRestante(b.duracaoMs)}`;
                }) }],
                proximos: [{ nome: "bencaovitalidade", args: "3", oque: "invocar a bênção de grau 3" }],
                prefix
            }));
        }
        try {
            const user = dataService.getUser(sender) || dataService.initializeUser(sender, {});
            if (!user.jid) user.jid = sender;

            const res = blessing.grantBlessing(user, GRAU);

            if (!res.ok) {
                const ativa = res.bencao || {};
                return reply(F.tela({
                    emoji: "⛔",
                    titulo: "Bênção recusada",
                    intro: `${res.motivo} Ela continua valendo por *${blessing.formatRestante(res.restanteMs || 0)}*.`,
                    secoes: [{ emoji: "✨", titulo: "Bênção ativa", linhas: [
                        F.campo("Grau", ativa.grau),
                        ativa.cp ? F.campo("Poder de combate", `+${formatNumber(ativa.cp)}`) : null,
                        F.campo("Termina em", blessing.formatRestante(res.restanteMs || 0))
                    ] }],
                    dica: "Uma bênção só é trocada por outra de grau igual ou maior. Espere a atual terminar para usar esta.",
                    proximos: [
                        ativa.grau ? { nome: "bencaovitalidade", args: String(ativa.grau), oque: "renovar a bênção que você já tem" } : null,
                        { nome: "boneco", oque: "ver seus atributos com a bênção" }
                    ].filter(Boolean),
                    prefix
                }), [sender]);
            }

            dataService.saveUser(user);
            const b = res.bencao;

            return reply(F.tela({
                emoji: "🌟",
                titulo: `Bênção de vitalidade grau ${b.grau}`,
                intro: `As Deusas abençoaram ${marcar(sender)}: *+${formatNumber(b.cp)} de poder* por *${blessing.formatRestante(b.duracaoMs)}*.`,
                secoes: [{ emoji: "✨", titulo: "O que a bênção dá", linhas: [
                    F.campo("Poder de combate", `+${formatNumber(b.cp)}`),
                    F.campo("Ataque", `+${formatNumber(b.atk)}`),
                    F.campo("Defesa", `+${formatNumber(b.def)}`),
                    F.campo("Vida", `+${formatNumber(b.hp)}`),
                    F.campo("Duração", blessing.formatRestante(b.duracaoMs))
                ] }],
                dica: "O bônus já entra em caçadas, masmorra e chefes. Graus maiores dão mais poder e duram mais.",
                proximos: [
                    { nome: "boneco", oque: "ver seus atributos com a bênção" },
                    { nome: "dungeon", oque: "aproveitar o poder na masmorra" },
                    b.grau < blessing.GRAU_MAX ? { nome: "bencaovitalidade", args: String(b.grau + 1), oque: `a bênção de grau ${b.grau + 1}` } : null
                ].filter(Boolean),
                prefix
            }), [sender]);
        } catch (err) {
            logger.error(`[BENCAO VITALIDADE ERROR] grau ${GRAU}`, err);
            return reply(F.tela({
                emoji: "❌",
                titulo: "A bênção não chegou",
                intro: "Não consegui invocar a bênção agora. Nada mudou no seu personagem.",
                dica: "Tente de novo em instantes.",
                proximos: [{ nome: "bencaovitalidade", args: String(GRAU), oque: "tentar de novo" }],
                prefix
            }));
        }
    }
};
