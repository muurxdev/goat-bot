/**
 * Comando .whois / .dominio / .consultadominio
 * Consulta de resolução DNS de domínios (endereços e servidores de nome)
 */

const dns = require("dns").promises;
const F = require("../../utils/formato");
const logger = require("../../core/logger");

module.exports = {
    name: "whois",
    aliases: ["dominio","consultadominio","whois-domain","cmd_whois","alt_whois","atalho_whois","abrev_whois","call_whois","func_whois"],
    category: "dev",
    subcategory: "Rede",
    description: "Mostra se um domínio está no ar, para qual IP aponta e seus servidores de nome",
    usage: '<domínio>',
    examples: ['google.com — resumo do domínio do Google', 'github.com — resumo do GitHub'],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        let domain = (args[0] || "").toLowerCase().trim();
        domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

        if (!domain || !domain.includes(".")) {
            return reply(F.tela({
                emoji: "🌐",
                titulo: domain ? "Domínio incompleto" : "Consulta de domínio",
                intro: domain ? `*${domain}* não parece um domínio: falta a parte depois do ponto.` : "Mostra se um domínio responde, para qual IP aponta e quem cuida dele.",
                secoes: [
                    { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "whois", "<domínio>")] },
                    { emoji: "📝", titulo: "Exemplos", linhas: F.lista([F.cmd(prefix, "whois", "google.com"), F.cmd(prefix, "whois", "github.com")]) }
                ],
                proximos: [{ nome: "dns", args: "google.com MX", oque: "consulta DNS completa" }],
                prefix
            }));
        }

        try {
            const [aRecords, nsRecords] = await Promise.allSettled([
                dns.resolve4(domain),
                dns.resolveNs(domain)
            ]);
            if (aRecords.status !== "fulfilled") logger.warn(`[WHOIS] Registro A de "${domain}" falhou: ${aRecords.reason && aRecords.reason.code}`);

            const ativo = aRecords.status === "fulfilled";
            const ips = ativo ? aRecords.value.slice(0, 5).join(", ") : "não resolvido";
            const ns = nsRecords.status === "fulfilled" ? nsRecords.value.slice(0, 3).join(", ") : "desconhecido";

            return reply(F.tela({
                emoji: "🌐",
                titulo: `Domínio ${domain}`,
                intro: ativo ? "🟢 O domínio responde e aponta para um endereço." : "🔴 O domínio não aponta para nenhum endereço IPv4 (pode não existir ou estar fora do ar).",
                secoes: [{
                    emoji: "📡", titulo: "Registros principais",
                    linhas: [
                        F.campo("Endereço IP (A)", ips),
                        F.campo("Servidores de nome (NS)", ns)
                    ]
                }],
                dica: "Dados de dono e data de registro não aparecem aqui: esta consulta usa só o DNS público.",
                proximos: [
                    { nome: "dns", args: `${domain} MX`, oque: "servidores de e-mail" },
                    { nome: "dns", args: `${domain} TXT`, oque: "registros de texto" },
                    ativo ? { nome: "sslcheck", args: domain, oque: "conferir o certificado" } : null
                ].filter(Boolean),
                prefix
            }));
        } catch (err) {
            logger.warn(`[WHOIS] Falha ao consultar "${domain}": ${err.message}`);
            return reply(F.tela({
                emoji: "🌐",
                titulo: "Não consegui consultar",
                intro: "O servidor de nomes não respondeu. Tente de novo em instantes.",
                secoes: [{ emoji: "📋", titulo: "O que tentei", linhas: [F.campo("Domínio", domain)] }],
                prefix
            }));
        }
    }
};
