/**
 * Comando .sslcheck
 * Confere o certificado HTTPS de um domínio: emissor, validade e protocolo.
 *
 * Antes respondia sempre "válido e seguro" com dados inventados, sem consultar
 * o domínio; agora abre uma conexão TLS de verdade.
 */

const tls = require("tls");
const { validateUrl } = require("../../services/media/mediaResolver");
const F = require("../../utils/formato");
const logger = require("../../core/logger");

/** Abre uma conexão TLS e devolve os dados do certificado. */
function lerCertificado(host, msLimite = 6000) {
    return new Promise((resolve, reject) => {
        const inicio = Date.now();
        const sock = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: msLimite }, () => {
            const cert = sock.getPeerCertificate();
            const dados = {
                autorizado: sock.authorized,
                erroAutorizacao: sock.authorizationError,
                protocolo: sock.getProtocol(),
                cert,
                ms: Date.now() - inicio
            };
            sock.end();
            resolve(dados);
        });
        sock.on("timeout", () => { sock.destroy(); reject(new Error("TIMEOUT")); });
        sock.on("error", reject);
    });
}

function motivo(err) {
    const m = String(err && (err.code || err.message) || "");
    if (/ENOTFOUND|EAI_AGAIN/.test(m)) return "Não encontrei esse domínio. Confira se está escrito certo.";
    if (/TIMEOUT|ETIMEDOUT/.test(m)) return "O site demorou demais para responder.";
    if (/ECONNREFUSED/.test(m)) return "O site não aceita conexões seguras (porta 443 fechada).";
    return "Não consegui conferir o certificado agora. Tente de novo em instantes.";
}

module.exports = {
    name: "sslcheck",
    aliases: ["certificadossl","validarhttps","sslstatus","cmd_sslcheck","alt_sslcheck","atalho_sslcheck","abrev_sslcheck","call_sslcheck","func_sslcheck"],
    category: "dev",
    subcategory: "Rede",
    description: "Confere o certificado HTTPS de um site: emissor, validade e protocolo",
    usage: '<domínio>',
    examples: ['google.com — confere o certificado do Google', 'github.com — confere o certificado do GitHub'],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const dom = String(args[0] || "").trim().replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
    if (!dom || !dom.includes(".")) {
        return reply(F.tela({
            emoji: "🔒",
            titulo: "Conferir certificado HTTPS",
            intro: "Mostro quem emitiu o certificado de um site, até quando ele vale e se o navegador confia nele.",
            secoes: [
                { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "sslcheck", "<domínio>")] },
                { emoji: "📝", titulo: "Exemplos", linhas: F.lista([F.cmd(prefix, "sslcheck", "google.com"), F.cmd(prefix, "sslcheck", "github.com")]) }
            ],
            proximos: [{ nome: "headers", args: "https://google.com", oque: "ver os cabeçalhos do site" }],
            prefix
        }));
    }
    if (!validateUrl("https://" + dom)) {
        return reply(F.tela({
            emoji: "🔒",
            titulo: "Domínio não permitido",
            intro: `*${dom}* é inválido ou aponta para uma rede interna, que eu não consulto por segurança.`,
            secoes: [{ emoji: "📝", titulo: "Exemplo", linhas: [F.cmd(prefix, "sslcheck", "google.com")] }],
            prefix
        }));
    }

    try {
        const r = await lerCertificado(dom);
        const c = r.cert || {};
        if (!c.valid_to) throw new Error("SEM_CERTIFICADO");
        const fim = new Date(c.valid_to);
        const dias = Math.floor((fim.getTime() - Date.now()) / 86400000);
        const emissor = (c.issuer && (c.issuer.O || c.issuer.CN)) || "desconhecido";
        const situacao = !r.autorizado ? "🔴 Não confiável" : dias < 0 ? "🔴 Expirado" : dias <= 14 ? "🟡 Válido, mas vence logo" : "🟢 Válido";
        return reply(F.tela({
            emoji: "🔒",
            titulo: `Certificado de ${dom}`,
            intro: `${situacao}${dias >= 0 ? ` · vence em *${dias} dia(s)*` : ""}`,
            secoes: [{
                emoji: "📜", titulo: "Detalhes",
                linhas: [
                    F.campo("Emitido para", (c.subject && c.subject.CN) || dom),
                    F.campo("Emissor", emissor),
                    F.campo("Válido de", new Date(c.valid_from).toLocaleDateString("pt-BR")),
                    F.campo("Válido até", fim.toLocaleDateString("pt-BR")),
                    F.campo("Protocolo", r.protocolo || "—"),
                    F.campo("Tempo de conexão", `${r.ms} ms`),
                    !r.autorizado && r.erroAutorizacao ? F.campo("Motivo", "o navegador não reconhece a cadeia do certificado") : null
                ]
            }],
            dica: "Certificados gratuitos (como Let's Encrypt) duram 90 dias e costumam renovar sozinhos perto do fim.",
            proximos: [
                { nome: "headers", args: "https://" + dom, oque: "ver os cabeçalhos do site" },
                { nome: "whois", args: dom, oque: "resumo do domínio" }
            ],
            prefix
        }));
    } catch (err) {
        logger.warn(`[SSLCHECK] Falha ao conferir "${dom}": ${err.code || ''} ${err.message}`);
        return reply(F.tela({
            emoji: "🔒",
            titulo: "Não consegui conferir o certificado",
            intro: motivo(err),
            secoes: [{ emoji: "📋", titulo: "O que tentei", linhas: [F.campo("Domínio", dom), F.campo("Porta", "443")] }],
            proximos: [{ nome: "dns", args: dom, oque: "ver se o domínio existe" }],
            prefix
        }));
    }
}
};
