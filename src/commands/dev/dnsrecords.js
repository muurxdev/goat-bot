/**
 * Comando .dnsrecords
 * Explica os tipos de registros DNS (A, AAAA, CNAME, MX, TXT, NS)
 */

const F = require("../../utils/formato");

module.exports = {
    name: "dnsrecords",
    aliases: ["registrosdns","consultatxt","consultamx","cmd_dnsrecords","alt_dnsrecords","atalho_dnsrecords","abrev_dnsrecords","call_dnsrecords","func_dnsrecords"],
    category: "dev",
    subcategory: "Rede",
    description: "Explica para que serve cada tipo de registro DNS (A, MX, TXT e outros)",
    examples: [' — mostra a lista de tipos com exemplos'],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
    return reply(F.tela({
        emoji: '📡',
        titulo: 'Tipos de registro DNS',
        intro: 'O DNS é a lista telefônica da internet: transforma nomes como google.com em endereços.',
        secoes: [
            {
                emoji: '📜', titulo: 'Tipos mais usados',
                linhas: [
                    F.campo('A', 'aponta o domínio para um endereço IPv4'),
                    F.campo('AAAA', 'aponta o domínio para um endereço IPv6'),
                    F.campo('CNAME', 'apelido: manda para outro domínio'),
                    F.campo('MX', 'servidores que recebem os e-mails'),
                    F.campo('TXT', 'textos de verificação, SPF, DKIM e DMARC'),
                    F.campo('NS', 'servidores responsáveis pelo domínio')
                ]
            }
        ],
        dica: 'Mudou um registro e nada aconteceu? A propagação pode levar de minutos a 48 horas.',
        proximos: [
            { nome: 'dns', args: 'google.com', oque: 'consultar registros A' },
            { nome: 'dns', args: 'github.com MX', oque: 'consultar registros MX' },
            { nome: 'whois', args: 'github.com', oque: 'resumo de um domínio' }
        ],
        prefix
    }));
}
};
