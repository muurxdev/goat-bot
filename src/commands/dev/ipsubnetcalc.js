/**
 * Comando .ipsubnetcalc — Calcula hosts úteis de máscara CIDR: .ipsubnetcalc <8-32>
 */
const F = require('../../utils/formato')

/** Prefixo CIDR para máscara decimal (ex.: 24 -> 255.255.255.0). */
function mascara(cidr) {
    const bits = '1'.repeat(cidr).padEnd(32, '0')
    return (bits.match(/.{8}/g) || []).map(b => parseInt(b, 2)).join('.')
}

module.exports = {
    name: "ipsubnetcalc",
    aliases: ["ipsubnetcalc-cmd","cmd-ipsubnetcalc","cmd_ipsubnetcalc","alt_ipsubnetcalc","atalho_ipsubnetcalc","abrev_ipsubnetcalc","call_ipsubnetcalc","func_ipsubnetcalc"],
    category: "dev",
    subcategory: "Rede",
    description: "Calcula máscara e quantidade de IPs de um prefixo CIDR (/8 a /32)",
    usage: '[prefixo]',
    examples: [' — calcula /24', '26 — calcula /26', '16 — calcula /16'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const cidr = parseInt(String(args[0] || '').replace('/', '')) || 24;
            if (cidr < 8 || cidr > 32) return reply(F.tela({
                emoji: '🌐',
                titulo: 'Prefixo fora da faixa',
                intro: `O prefixo */${cidr}* não é aceito. Use um número de 8 a 32.`,
                secoes: [{ emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'ipsubnetcalc', '24'), F.cmd(prefix, 'ipsubnetcalc', '/28')]) }],
                prefix
            }));
            const total = Math.pow(2, 32 - cidr);
            const uteis = cidr >= 31 ? total : Math.max(0, total - 2);
            return reply(F.tela({
                emoji: '🌐',
                titulo: `Sub-rede /${cidr}`,
                intro: `Uma rede */${cidr}* comporta *${uteis.toLocaleString('pt-BR')}* dispositivos.`,
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Máscara', '`' + mascara(cidr) + '`'),
                        F.campo('Total de IPs', total.toLocaleString('pt-BR')),
                        F.campo('IPs utilizáveis', uteis.toLocaleString('pt-BR')),
                        cidr < 31 ? F.campo('Reservados', '2 (rede e broadcast)') : F.campo('Reservados', 'nenhum (link ponto a ponto)')
                    ]
                }],
                dica: 'Cada número a mais no prefixo divide a rede pela metade.',
                proximos: [
                    { nome: 'ipsubnetcalc', args: String(Math.min(32, cidr + 1)), oque: 'metade desta rede' },
                    { nome: 'subnetcalc', oque: 'calculadora de sub-rede completa' }
                ],
                prefix
            }));
        }
};
