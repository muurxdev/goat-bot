/**
 * Comando .speedtest / .velocidade / .testevel
 * Mede o tempo de resposta real da minha rede até alguns destinos.
 *
 * Antes mostrava download, upload e jitter sorteados com Math.random e uma
 * "VPS dedicada 1 Gbps" fixa. Agora só aparece o que foi medido de verdade;
 * teste de banda não é feito para não gastar a conexão da máquina.
 */

const D = require("../../services/diagnosticsService");
const F = require("../../utils/formato");
const logger = require("../../core/logger");

const ALVOS = [
    ["WhatsApp", "https://web.whatsapp.com"],
    ["Google", "https://www.google.com"],
    ["Cloudflare", "https://www.cloudflare.com"]
];

module.exports = {
    name: "speedtest",
    aliases: ["velocidade","testevel","netspeed","ping-speed","cmd_speedtest","alt_speedtest","atalho_speedtest","abrev_speedtest","call_speedtest","func_speedtest"],
    category: "dev",
    subcategory: "Rede",
    description: "Mede quanto tempo eu levo para alcançar WhatsApp, Google e Cloudflare",
    examples: [' — mede o tempo até os destinos'],
    cooldownMs: 5000,
    execute: async ({ reply, prefix = '.' }) => {
        const start = Date.now();
        await reply("⚡ Medindo minha conexão, só um instante…");
        const envio = Date.now() - start;

        let res = [];
        try {
            res = await Promise.all(ALVOS.map(([, u]) => D.alcancarHost(u, 6000)));
        } catch (err) {
            logger.warn(`[SPEEDTEST] Falha ao medir destinos: ${err.message}`);
        }
        for (const r of res) if (r && r.erro) logger.warn(`[SPEEDTEST] ${r.url} falhou: ${r.erro}`);

        const okMs = res.filter(r => r && r.ok !== false && !r.erro).map(r => r.ms);
        const media = okMs.length ? Math.round(okMs.reduce((a, b) => a + b, 0) / okMs.length) : null;
        const veredito = media === null ? "🔴 Sem saída para a internet" : media < 300 ? "🟢 Rápida" : media < 1000 ? "🟡 Normal" : "🔴 Lenta";

        return reply(F.tela({
            emoji: "🚀",
            titulo: "Teste de conexão",
            intro: media === null ? "Não consegui alcançar nenhum destino." : `${veredito} · média de *${media} ms* até os destinos.`,
            secoes: [
                {
                    emoji: "📡", titulo: "Tempo até cada destino",
                    linhas: ALVOS.map(([nome], i) => {
                        const r = res[i];
                        return F.campo(nome, r && !r.erro ? `${r.ok ? "🟢" : "🟡"} ${r.ms} ms` : "🔴 falhou");
                    })
                },
                { emoji: "📨", titulo: "WhatsApp", linhas: [F.campo("Envio da mensagem de aviso", `${envio} ms`)] }
            ],
            dica: "Velocidade de download e upload não é medida aqui, para não ocupar a banda da máquina enquanto atendo o grupo.",
            proximos: [
                { nome: "diaglatencia", oque: "mais destinos, incluindo YouTube e Spotify" },
                { nome: "diagrede", oque: "teste simples de saída para a internet" }
            ],
            prefix
        }));
    }
};
