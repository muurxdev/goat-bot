/**
 * Comando .antispamstatus
 * Mostra quais proteções automáticas estão ligadas NESTE grupo, com os limites
 * de verdade.
 *
 * Até 2026-09-21 respondia um cartão fixo — "Proteção Ativa 24/7", "5 msgs / 3
 * segundos", "OPERACIONAL" — mesmo com tudo desligado; e o flood real conta
 * mensagens numa janela de 60 s, não de 3. Agora lê a configuração do grupo,
 * a mesma que o groupProtectionService usa para agir.
 */

const dataService = require("../../services/dataService");
const F = require("../../utils/formato");

// Janela do flood no groupProtectionService (JANELA_FLOOD_MS).
const JANELA_FLOOD_S = 60;

module.exports = {
    name: "antispamstatus",
    aliases: ["statusantispam","floodstatus","detectorflood","cmd_antispamstatus","alt_antispamstatus","atalho_antispamstatus","abrev_antispamstatus","call_antispamstatus","func_antispamstatus"],
    category: "admin",
    description: "Mostra quais proteções automáticas (flood, links, palavrões…) estão ligadas neste grupo",
    cooldownMs: 2000,
    execute: async ({ from, isGroup, reply, prefix = "." }) => {
        if (!isGroup) return reply("🛡️ As proteções automáticas são por grupo. Use este comando dentro do grupo.");

        const cfg = dataService.getConfigsData()[from] || {};
        const liga = v => (v ? "🟢 ligado" : "🔴 desligado");
        const n = (v, padrao) => { const x = parseInt(v, 10); return Number.isFinite(x) && x > 0 ? x : padrao; };

        const linhas = [
            F.campo("Excesso de mensagens", liga(cfg.antiFlood) + (cfg.antiFlood ? ` — mais de ${n(cfg.floodLimit, 5)} em ${JANELA_FLOOD_S} s` : "")),
            F.campo("Modo lento", liga(cfg.slowmode) + (cfg.slowmode ? ` — 1 mensagem a cada ${n(cfg.slowmodeSeconds, 5)} s` : "")),
            F.campo("Links de spam", liga(cfg.antispamlink)),
            F.campo("Palavrões", liga(cfg.antiProfanity)),
            F.campo("Só maiúsculas", liga(cfg.antiCapslock)),
            F.campo("Grupo no status", liga(cfg.antistatus)),
            F.campo("Números de fora", liga(cfg.antifake)),
            F.campo("Nome do grupo travado", liga(cfg.locknick))
        ];
        const ligadas = [cfg.antiFlood, cfg.slowmode, cfg.antispamlink, cfg.antiProfanity, cfg.antiCapslock, cfg.antistatus, cfg.antifake, cfg.locknick].filter(Boolean).length;

        return reply(F.tela({
            emoji: "🛡️",
            titulo: "Proteções do grupo",
            intro: ligadas ? `${ligadas} de 8 proteções ligadas aqui.` : "Nenhuma proteção automática está ligada neste grupo.",
            secoes: [{ emoji: "⚙️", titulo: "Estado atual", linhas }],
            dica: cfg.strictModeration ? "Moderação rígida ligada: vale também para administradores." : "Administradores não são afetados pelas proteções.",
            proximos: [
                { nome: "flood", oque: "ligar ou ajustar o limite de mensagens" },
                { nome: "antispamlink", oque: "barrar links de spam" },
                { nome: "slowmode", oque: "ligar o modo lento" }
            ],
            prefix
        }));
    }
};
