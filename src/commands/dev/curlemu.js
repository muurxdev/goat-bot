/**
 * Comando .curlemu / .requester / .httptest
 * Faz uma requisição HTTP rápida para testar status e tempo de resposta.
 *
 * Endereços de rede interna são recusados (validateUrl), para ninguém usar o
 * comando para sondar a máquina onde eu rodo.
 */

const axios = require("axios");
const { validateUrl } = require("../../services/media/mediaResolver");
const F = require("../../utils/formato");
const logger = require("../../core/logger");

function motivo(err) {
    const m = String(err && (err.code || err.message) || "");
    if (/ECONNABORTED|timeout/i.test(m)) return "O site demorou mais de 8 segundos para responder.";
    if (/ENOTFOUND|EAI_AGAIN/.test(m)) return "Não encontrei esse domínio. Confira se está escrito certo.";
    if (/ECONNREFUSED/.test(m)) return "O servidor recusou a conexão.";
    if (/CERT|SSL|TLS/i.test(m)) return "O certificado de segurança do site tem problema.";
    return "Não consegui falar com esse endereço agora. Tente de novo em instantes.";
}

module.exports = {
    name: "curlemu",
    aliases: ["requester","httptest","curl","testapi","cmd_curlemu","alt_curlemu","atalho_curlemu","abrev_curlemu","call_curlemu","func_curlemu"],
    category: "dev",
    subcategory: "Rede",
    description: "Faz uma requisição rápida a um site para ver o status e o tempo de resposta",
    usage: '<url>',
    examples: ['https://api.github.com — testa a API do GitHub', 'google.com — funciona sem https'],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const bruto = (args[0] || "").trim();
        let targetUrl = bruto;
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        if (!bruto || !targetUrl.includes(".")) {
            return reply(F.tela({
                emoji: "🌐",
                titulo: "Testar um endereço",
                intro: "Faço um GET no endereço e mostro o status, o tempo de resposta e o tipo de conteúdo.",
                secoes: [
                    { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "curlemu", "<url>")] },
                    { emoji: "📝", titulo: "Exemplos", linhas: F.lista([F.cmd(prefix, "curlemu", "https://api.github.com"), F.cmd(prefix, "curlemu", "google.com")]) }
                ],
                dica: "Serve para ver rápido se uma API ou webhook está no ar.",
                proximos: [{ nome: "headers", args: "https://api.github.com", oque: "ver todos os cabeçalhos" }],
                prefix
            }));
        }

        // Conferência com DNS: nome público apontando para IP interno também é
        // barrado (a validação só por texto deixava passar).
        const { urlSeguraResolvida } = require("../../services/media/urlSeguro");
        if (!validateUrl(targetUrl) || !(await urlSeguraResolvida(targetUrl))) {
            return reply(F.tela({
                emoji: "🌐",
                titulo: "Endereço não permitido",
                intro: "Esse endereço é inválido ou aponta para uma rede interna, que eu não acesso por segurança.",
                secoes: [{ emoji: "📝", titulo: "Exemplo", linhas: [F.cmd(prefix, "curlemu", "https://api.github.com")] }],
                prefix
            }));
        }

        try {
            const start = Date.now();
            // maxRedirects: 0 — o axios seguia até 5 redirecionamentos sozinho, então um
            // link público que redirecionasse para dentro da VPS devolvia aqui o
            // conteúdo interno. O redirecionamento aparece como resposta 3xx.
            const res = await axios.get(targetUrl, { timeout: 8000, validateStatus: () => true, maxContentLength: 5 * 1024 * 1024, maxRedirects: 0 });
            const duracao = Date.now() - start;
            const ok = res.status >= 200 && res.status < 400;
            const velocidade = duracao < 300 ? "🟢 rápido" : duracao < 1500 ? "🟡 normal" : "🔴 lento";

            return reply(F.tela({
                emoji: "🌐",
                titulo: "Resposta do servidor",
                intro: `${ok ? "🟢" : "🔴"} *HTTP ${[res.status, res.statusText].filter(Boolean).join(" ")}* em *${duracao} ms*`,
                secoes: [{
                    emoji: "📡", titulo: "Detalhes",
                    linhas: [
                        F.campo("URL", targetUrl),
                        F.campo("Tempo de resposta", `${duracao} ms (${velocidade})`),
                        F.campo("Tipo de conteúdo", res.headers["content-type"] || "desconhecido"),
                        res.headers["content-length"] ? F.campo("Tamanho", `${res.headers["content-length"]} bytes`) : null
                    ]
                }],
                dica: "O tempo inclui achar o domínio, conectar e baixar a resposta a partir da minha máquina.",
                proximos: [
                    { nome: "headers", args: targetUrl, oque: "ver todos os cabeçalhos" },
                    { nome: "httpstatus", args: String(res.status), oque: "o que significa esse status" }
                ],
                prefix
            }));
        } catch (err) {
            logger.warn(`[CURLEMU] Falha em "${targetUrl}": ${err.code || ""} ${err.message}`);
            return reply(F.tela({
                emoji: "🌐",
                titulo: "Não consegui acessar",
                intro: motivo(err),
                secoes: [{ emoji: "📋", titulo: "O que tentei", linhas: [F.campo("URL", targetUrl)] }],
                proximos: [{ nome: "dns", args: targetUrl.replace(/^https?:\/\//, "").split("/")[0], oque: "ver se o domínio existe" }],
                prefix
            }));
        }
    }
};
