/**
 * Comando .isleapyear — Verifica se um ano é bissexto: .isleapyear <ano>
 */
const F = require('../../utils/formato')

const ehBissexto = (a) => (a % 4 === 0 && a % 100 !== 0) || (a % 400 === 0)

module.exports = {
    name: "isleapyear",
    aliases: ["isleapyear-cmd","cmd-isleapyear","cmd_isleapyear","alt_isleapyear","atalho_isleapyear","abrev_isleapyear","call_isleapyear","func_isleapyear"],
    category: "dev",
    subcategory: "Data",
    description: "Diz se um ano é bissexto (sem ano, usa o atual)",
    usage: '[ano]',
    examples: [' — confere o ano atual', '2028 — confere 2028', '1900 — exemplo de exceção da regra'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const ano = parseInt(args[0]) || new Date().getFullYear();
            const isLeap = ehBissexto(ano);
            let proximo = ano + 1;
            while (!ehBissexto(proximo)) proximo++;
            const motivo = ano % 400 === 0 ? 'divisível por 400'
                : ano % 100 === 0 ? 'divisível por 100, mas não por 400'
                : ano % 4 === 0 ? 'divisível por 4 e não por 100'
                : 'não é divisível por 4';
            return reply(F.tela({
                emoji: isLeap ? '✅' : '📅',
                titulo: isLeap ? `${ano} é bissexto` : `${ano} não é bissexto`,
                intro: isLeap ? `O ano *${ano}* tem *366 dias*, com 29 de fevereiro.` : `O ano *${ano}* tem *365 dias*.`,
                secoes: [{
                    emoji: '📋', titulo: 'Por quê',
                    linhas: [
                        F.campo('Regra', motivo),
                        F.campo('Próximo bissexto', String(proximo))
                    ]
                }],
                dica: 'Regra completa: divisível por 4, exceto os divisíveis por 100 que não são divisíveis por 400.',
                proximos: [
                    { nome: 'isleapyear', args: String(proximo), oque: 'conferir outro ano' },
                    { nome: 'weekdayname', args: `${ano}-02-28`, oque: 'dia da semana de uma data' }
                ],
                prefix
            }));
        }
};
