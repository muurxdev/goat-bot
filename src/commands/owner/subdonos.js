/**
 * Comando .subdonos / .listasubdonos
 * Lista todos os subdonos ativos (usuários com plano de aluguel do bot ativo)
 */

const rentalService = require('../../services/rentalService');
const F = require('../../utils/formato');

module.exports = {
    name: 'subdonos',
    aliases: ['listasubdonos', 'subowners', 'alugueisbot'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Lista quem tem o plano de subdono ativo e quanto tempo falta',
    examples: [' — mostra os subdonos ativos com o prazo de cada um'],
    ownerOnly: false,
    execute: async ({ client, from, reply, prefix = '.' }) => {
        const subdonos = rentalService.getAllSubowners();

        if (!subdonos || subdonos.length === 0) {
            return reply(F.tela({
                prefix,
                emoji: '👑',
                titulo: 'Nenhum subdono ativo',
                intro: 'Quando alguém tiver o plano de subdono ativo, aparece aqui com o prazo que falta.',
                secoes: [{
                    emoji: '🎖️', titulo: 'O que o subdono ganha', linhas: [
                        '• Uso liberado comigo no privado',
                        '• Comandos de gerência, como me colocar e tirar de grupos'
                    ]
                }],
                dica: 'Os planos de subdono aparecem na tabela de preços; para contratar, fale com um dos meus donos.',
                proximos: [
                    { nome: 'aluguel', args: 'planos', oque: 'ver os preços dos planos' },
                    { nome: 'dono', oque: 'falar com os donos' }
                ]
            }));
        }

        const mentions = [];
        const linhas = [];

        subdonos.forEach((s, idx) => {
            const jid = s.targetJid || s.groupJid;
            const num = jid.split('@')[0].split(':')[0];
            mentions.push(jid);

            linhas.push(`*${idx + 1}.* @${num}`);
            linhas.push(F.campo('Tempo restante', s.remainingText));
            linhas.push(F.campo('Vence em', s.expiresAtFormatted));
            if (s.notes) linhas.push(F.campo('Obs', s.notes));
            linhas.push('');
        });
        while (linhas.length && linhas[linhas.length - 1] === '') linhas.pop();

        const doc = F.tela({
            prefix,
            emoji: '👑',
            titulo: `Subdonos ativos (${subdonos.length})`,
            intro: 'Quem tem o plano de subdono ativo agora.',
            secoes: [linhas.join('\n')],
            dica: 'Subdonos usam o privado comigo e têm comandos de gerência liberados.',
            proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver os planos de subdono' }]
        });

        await client.sendMessage(from, {
            text: doc,
            mentions
        });
    }
};
