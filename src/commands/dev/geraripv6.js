/**
 * Comando .geraripv6 — Gera um endereço IPv6 válido aleatório
 */
const F = require('../../utils/formato')

module.exports = {
    name: "geraripv6",
    aliases: ["ipv6random","cmd_geraripv6","alt_geraripv6","atalho_geraripv6","abrev_geraripv6","call_geraripv6","func_geraripv6"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um endereço IPv6 aleatório da faixa reservada para documentação",
    examples: [' — gera um IPv6 de exemplo'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
            const hex = () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
            const ipv6 = `2001:0db8:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
            const curto = ipv6.split(':').map(g => g.replace(/^0+(?=.)/, '')).join(':');
            return reply(F.tela({
                emoji: '🌐',
                titulo: 'IPv6 gerado',
                intro: '`' + ipv6 + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Forma curta', '`' + curto + '`'),
                        F.campo('Faixa', '2001:db8::/32 (documentação)'),
                        F.campo('Grupos', '8 de 16 bits cada')
                    ]
                }],
                dica: 'A faixa 2001:db8 nunca é usada na internet real, então é segura para exemplos e testes.',
                proximos: [
                    { nome: 'gerarmac', oque: 'gerar um endereço MAC' },
                    { nome: 'ipsubnetcalc', args: '24', oque: 'calcular uma sub-rede' },
                    { nome: 'geraripv6', oque: 'gerar outro IPv6' }
                ],
                prefix
            }));
        }
};
