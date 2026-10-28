/**
 * Comando .genpasspin — Gera PIN numérico: .genpasspin [digitos=6]
 */
const F = require('../../utils/formato')

module.exports = {
    name: "genpasspin",
    aliases: ["genpasspin-cmd","cmd-genpasspin","cmd_genpasspin","alt_genpasspin","atalho_genpasspin","abrev_genpasspin","call_genpasspin","func_genpasspin"],
    category: "dev",
    subcategory: "Segurança",
    description: "Gera um PIN numérico aleatório de 4 a 12 dígitos",
    usage: '[dígitos]',
    examples: [' — PIN de 6 dígitos', '4 — PIN de 4 dígitos', '12 — PIN de 12 dígitos'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const len = Math.min(12, Math.max(4, parseInt(args[0]) || 6));
            let pin = "";
            for (let i = 0; i < len; i++) pin += Math.floor(Math.random() * 10).toString();
            return reply(F.tela({
                emoji: '🔢',
                titulo: 'PIN gerado',
                intro: '`' + pin + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Dígitos', `${len} (aceito de 4 a 12)`),
                        F.campo('Combinações possíveis', (10 ** len).toLocaleString('pt-BR'))
                    ]
                }],
                dica: 'Evite datas de aniversário e sequências. Esta mensagem fica no grupo: para algo sério, gere em conversa privada.',
                proximos: [
                    { nome: 'genpasspin', args: '8', oque: 'PIN com mais dígitos' },
                    { nome: 'senhaforte', args: '20', oque: 'senha com letras e símbolos' }
                ],
                prefix
            }));
        }
};
