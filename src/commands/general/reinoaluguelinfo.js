/**
 * Comando .reinoaluguelinfo — resumo dos planos para levar o bot a um grupo.
 */
const { getBotName } = require('../../config/botConfig')
const F = require('../../utils/formato')

module.exports = {
    name: "reinoaluguelinfo",
    aliases: ["reinoaluguelinfo-cmd","cmd-reinoaluguelinfo"],
    category: "general",
    subcategory: "Aluguel",
    description: "Resumo dos planos para me levar ao seu grupo",
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        const nome = getBotName()
        return reply(F.tela({
            emoji: '👑',
            titulo: `Leve ${nome} para o seu grupo`,
            intro: 'Eu cuido do grupo, do RPG e da economia enquanto vocês conversam. Veja como me contratar:',
            secoes: [
                { emoji: '📅', titulo: 'Planos', linhas: [
                    F.campo('Semanal', '7 dias de proteção do grupo e RPG'),
                    F.campo('Mensal', '30 dias com atendimento dos meus donos')
                ] },
                { emoji: '⚔️', titulo: 'O que vem junto', linhas: [
                    '• Bloqueio de links e proteção contra bagunça',
                    '• Economia, cassino e RPG completos',
                    '• Mais de mil comandos para o grupo'
                ] }
            ],
            dica: 'Quer experimentar antes? O teste grátis libera tudo por 2 horas.',
            proximos: [
                { nome: 'aluguel', args: 'planos', oque: 'ver valores e detalhes dos planos' },
                { nome: 'aluguel', args: 'teste', oque: 'experimentar por 2 horas grátis' },
                { nome: 'dono', oque: 'falar com os meus donos para contratar' }
            ],
            prefix
        }))
    }
};
