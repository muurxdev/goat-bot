/**
 * Comando .gerarnomefake — Gera um nome completo fictício brasileiro para testes
 */
const F = require('../../utils/formato')

module.exports = {
    name: "gerarnomefake",
    aliases: ["nomealeatorio","cmd_gerarnomefake","alt_gerarnomefake","atalho_gerarnomefake","abrev_gerarnomefake","call_gerarnomefake","func_gerarnomefake"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Gera um nome completo brasileiro fictício para testes",
    examples: [' — gera um nome fictício'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
            const first = ['Arthur', 'Bernardo', 'Cauã', 'Davi', 'Enzo', 'Gabriel', 'Heitor', 'Lucas', 'Mateus', 'Nicolas', 'Alice', 'Beatriz', 'Camila', 'Daniele', 'Eduarda', 'Fernanda', 'Giovanna', 'Heloísa', 'Isabela', 'Júlia'];
            const middle = ['Henrique', 'Eduardo', 'Augusto', 'Felipe', 'Vinícius', 'Alexandre', 'Rodrigues', 'Barbosa', 'Ribeiro', 'Carvalho'];
            const last = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro'];
            const f = first[Math.floor(Math.random() * first.length)];
            const m = middle[Math.floor(Math.random() * middle.length)];
            const l = last[Math.floor(Math.random() * last.length)];
            const semAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
            return reply(F.tela({
                emoji: '👤',
                titulo: 'Nome fictício gerado',
                intro: `*${f} ${m} ${l}*`,
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes',
                    linhas: [
                        F.campo('Nome', f),
                        F.campo('Sobrenomes', `${m} ${l}`),
                        F.campo('Usuário sugerido', '`' + semAcento(f) + '.' + semAcento(l) + '`')
                    ]
                }],
                dica: 'Os nomes são sorteados de listas comuns; qualquer semelhança com pessoa real é coincidência.',
                proximos: [
                    { nome: 'geraremail', oque: 'e-mail fictício' },
                    { nome: 'cpfgen', oque: 'CPF de teste' },
                    { nome: 'fakeuser', oque: 'usuário fictício completo' }
                ],
                prefix
            }));
        }
};
