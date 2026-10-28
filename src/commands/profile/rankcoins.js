/**
 * Comando .rankcoins — quem tem mais moedas na carteira.
 *
 * Passou a usar o motor compartilhado (services/rankingService.js) para herdar
 * o escopo por grupo: dentro de um grupo lista só quem está ali. Antes rankeava
 * o banco inteiro, mostrando estranhos de outros grupos.
 *
 * Para o patrimônio completo (carteira + banco + cofre) veja .rankpatrimonio.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcoins',
    aliases: ['ricos'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Exibe o top 10 mais ricos em moedas na carteira',
    examples: [' — mostra o top 10 de magnatas neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: 'coins',
            titulo: 'TOP MAGNATAS',
            emoji: '💰',
            tipo: 'coins',
            escopo,
            senderJid: sender,
            detalhe: 'Só a carteira. Para carteira + banco + cofre, use .rankpatrimonio.'
        }))
    }
}
