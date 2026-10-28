/**
 * Comando .ipinfo
 * Consulta dados geográficos, ISP e ASN de endereços IP ou domínios
 */

const F = require("../../utils/formato");
const logger = require("../../core/logger");

/** Traduz a recusa do ip-api para uma frase simples. */
function motivoRecusa(msg) {
    const m = String(msg || "");
    if (/private range/i.test(m)) return "Esse é um endereço de rede privada (de casa ou empresa) e não tem localização pública.";
    if (/reserved range/i.test(m)) return "Esse endereço é reservado e não tem localização pública.";
    if (/invalid query/i.test(m)) return "Não reconheci esse IP ou domínio. Confira se está escrito certo.";
    return "Não achei informações para esse endereço.";
}

module.exports = {
    name: "ipinfo",
    aliases: ["lookupip","ip","rastrearip","cmd_ipinfo","alt_ipinfo","atalho_ipinfo","abrev_ipinfo","call_ipinfo","func_ipinfo"],
    category: "dev",
    subcategory: "Rede",
    description: "Mostra país, cidade e provedor de um IP ou domínio",
    usage: '<ip ou domínio>',
    examples: ['1.1.1.1 — IP da Cloudflare', 'google.com — funciona com domínio'],
    execute: async ({ args, reply, prefix = '.' }) => {
        const query = (args && args[0]) ? args[0].trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "") : "";

        if (!query) {
            return reply(F.tela({
                emoji: "🌐",
                titulo: "Consulta de IP",
                intro: "Mostra a localização aproximada e o provedor de um IP ou domínio.",
                secoes: [
                    { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "ipinfo", "<ip ou domínio>")] },
                    { emoji: "📝", titulo: "Exemplos", linhas: F.lista([F.cmd(prefix, "ipinfo", "1.1.1.1"), F.cmd(prefix, "ipinfo", "google.com")]) }
                ],
                dica: "A localização de IP é aproximada: costuma mostrar a cidade do provedor, não a casa da pessoa.",
                proximos: [{ nome: "dns", args: "google.com", oque: "registros DNS de um domínio" }],
                prefix
            }));
        }

        try {
            const url = `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
            const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
            const data = await res.json();

            if (data.status !== "success") {
                logger.warn(`[IPINFO] Consulta recusada para "${query}": ${data.message}`);
                return reply(F.tela({
                    emoji: "🌐",
                    titulo: "Consulta sem resultado",
                    intro: motivoRecusa(data.message),
                    secoes: [{ emoji: "📝", titulo: "Exemplos", linhas: F.lista([F.cmd(prefix, "ipinfo", "1.1.1.1"), F.cmd(prefix, "ipinfo", "google.com")]) }],
                    prefix
                }));
            }

            return reply(F.tela({
                emoji: "🌐",
                titulo: `IP ${data.query}`,
                intro: `Fica em *${[data.city, data.regionName, data.country].filter(Boolean).join(", ")}*, pela *${data.isp || "operadora desconhecida"}*.`,
                secoes: [
                    {
                        emoji: "📍", titulo: "Localização",
                        linhas: [
                            F.campo("País", data.country),
                            F.campo("Cidade / região", `${data.city}, ${data.regionName}`),
                            F.campo("CEP", data.zip || "—"),
                            F.campo("Coordenadas", `${data.lat}, ${data.lon}`),
                            F.campo("Fuso horário", data.timezone)
                        ]
                    },
                    {
                        emoji: "🏢", titulo: "Rede",
                        linhas: [
                            F.campo("Provedor", data.isp),
                            data.org && data.org !== data.isp ? F.campo("Organização", data.org) : null,
                            F.campo("ASN", data.as || "—")
                        ]
                    }
                ],
                dica: "A localização é aproximada: normalmente é onde o provedor registrou o bloco de IPs.",
                proximos: [
                    { nome: "whois", args: query.includes(".") && !/^\d+\.\d+\.\d+\.\d+$/.test(query) ? query : "google.com", oque: "resumo de um domínio" },
                    { nome: "dns", args: "google.com", oque: "registros DNS" }
                ],
                prefix
            }));
        } catch (err) {
            logger.warn(`[IPINFO] Falha ao consultar "${query}": ${err.message}`);
            return reply(F.tela({
                emoji: "🌐",
                titulo: "Não consegui consultar",
                intro: "O serviço de localização de IP não respondeu. Tente de novo em instantes.",
                secoes: [{ emoji: "📋", titulo: "O que tentei", linhas: [F.campo("Endereço", query)] }],
                prefix
            }));
        }
    }
};
