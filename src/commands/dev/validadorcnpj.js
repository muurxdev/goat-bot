/**
 * Comando .validadorcnpj — Valida os dígitos verificadores de um CNPJ: .validadorcnpj <cnpj>
 */
const F = require('../../utils/formato')

module.exports = {
    name: "validadorcnpj",
    aliases: ["validadorcnpj-cmd","cmd-validadorcnpj","cmd_validadorcnpj","alt_validadorcnpj","atalho_validadorcnpj","abrev_validadorcnpj","call_validadorcnpj","func_validadorcnpj"],
    category: "dev",
    subcategory: "Validação",
    description: "Confere se os dígitos verificadores de um CNPJ estão certos",
    usage: '<cnpj>',
    examples: ['11.222.333/0001-81 — com pontuação', '11222333000181 — só números'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const bruto = args.join('');
            const cnpj = bruto.replace(/\D/g, "");
            if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return reply(F.tela({
                emoji: '🏢',
                titulo: bruto ? 'CNPJ com formato errado' : 'Validar CNPJ',
                intro: bruto
                    ? (cnpj.length !== 14 ? `Um CNPJ tem 14 dígitos e o seu tem ${cnpj.length}.` : 'Todos os dígitos iguais não formam um CNPJ válido.')
                    : 'Confere se os dois últimos dígitos do CNPJ batem com a regra oficial.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'validadorcnpj', '<cnpj>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'validadorcnpj', '11.222.333/0001-81'), F.cmd(prefix, 'validadorcnpj', '11222333000181')]) }
                ],
                proximos: [{ nome: 'cnpjgen', oque: 'gerar um CNPJ de teste' }],
                prefix
            }));
            const calc = (slice, pesos) => {
                let soma = 0;
                for (let i = 0; i < slice.length; i++) soma += parseInt(slice[i]) * pesos[i];
                const rest = soma % 11;
                return rest < 2 ? 0 : 11 - rest;
            };
            const d1 = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
            const d2 = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
            const valido = d1 === parseInt(cnpj[12]) && d2 === parseInt(cnpj[13]);
            const fmt = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            return reply(F.tela({
                emoji: valido ? '✅' : '❌',
                titulo: valido ? 'CNPJ válido' : 'CNPJ inválido',
                intro: valido ? `Os dígitos verificadores de *${fmt}* estão corretos.` : `Os dígitos verificadores de *${fmt}* não batem.`,
                secoes: [{
                    emoji: '📋', titulo: 'Conferência',
                    linhas: [
                        F.campo('Dígitos informados', cnpj.slice(12)),
                        F.campo('Dígitos esperados', `${d1}${d2}`)
                    ]
                }],
                dica: 'Isto só confere a conta dos dígitos. Para saber se a empresa existe e está ativa, consulte a Receita Federal.',
                proximos: [
                    { nome: 'cnpjgen', oque: 'gerar um CNPJ de teste' },
                    { nome: 'validador', args: cnpj, oque: 'validador de CPF e CNPJ' }
                ],
                prefix
            }));
        }
};
