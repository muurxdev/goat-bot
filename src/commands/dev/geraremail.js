/**
 * Comando .geraremail — Gera endereços de email fictícios formatados para testes
 */
const F = require('../../utils/formato')

module.exports = {
    name: "geraremail",
    aliases: ["fakeemail","cmd_geraremail","alt_geraremail","atalho_geraremail","abrev_geraremail","call_geraremail","func_geraremail"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um endereço de e-mail fictício para testes",
    examples: [' — gera um e-mail fictício'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
            const names = ['alex', 'bruno', 'carla', 'diego', 'elena', 'felipe', 'gabriel', 'helena', 'igor', 'juliana', 'lucas', 'mariana'];
            const lasts = ['silva', 'santos', 'oliveira', 'souza', 'lima', 'pereira', 'ferreira', 'costa', 'rodrigues', 'almeida'];
            const domains = ['exemplo.com', 'testemail.org', 'devmail.net', 'sandbox.io', 'mailmock.dev'];
            const n = names[Math.floor(Math.random() * names.length)];
            const l = lasts[Math.floor(Math.random() * lasts.length)];
            const num = Math.floor(Math.random() * 900) + 100;
            const d = domains[Math.floor(Math.random() * domains.length)];
            const email = `${n}.${l}${num}@${d}`;
            return reply(F.tela({
                emoji: '📧',
                titulo: 'E-mail fictício gerado',
                intro: '`' + email + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Usuário', '`' + `${n}.${l}${num}` + '`'),
                        F.campo('Domínio', d)
                    ]
                }],
                dica: 'Não mande mensagens para esse endereço: alguns desses domínios podem existir de verdade. Use só para preencher formulários de teste.',
                proximos: [
                    { nome: 'maskemail', args: email, oque: 'mascarar o e-mail' },
                    { nome: 'gerarnomefake', oque: 'nome fictício' },
                    { nome: 'geraremail', oque: 'gerar outro' }
                ],
                prefix
            }));
        }
};
