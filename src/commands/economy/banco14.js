/**
 * Comando .bancoprojecao — PROJEÇÃO DO BANCO
 *
 * Quanto seu dinheiro guardado vira com o tempo.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancoprojecao',
    aliases: ["projecaosaldo","cmd_bancoprojecao","alt_bancoprojecao","atalho_bancoprojecao","abrev_bancoprojecao","call_bancoprojecao","func_bancoprojecao"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto seu dinheiro guardado vira com o tempo',
    examples: [' — quanto o dinheiro guardado no banco vira em 7, 30, 90 e 365 dias'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const p = B.patrimonio(user)
        const taxa = (B.RENDIMENTO_DIARIO * 100).toFixed(1).replace('.', ',') + '%'
        if (p.banco <= 0) {
            const exemplo = p.carteira > 0 ? B.jurosCompostos(p.carteira, 30) : null
            return reply(F.tela({
                emoji: '🔮',
                titulo: 'Projeção do banco',
                intro: 'Você não tem nada guardado no banco, então não há o que projetar. O banco rende ' + taxa + ' ao dia.',
                secoes: [exemplo ? { emoji: '💡', titulo: 'Se guardar a carteira', linhas: [
                    F.campo('Carteira hoje', B.moeda(p.carteira)),
                    F.campo('Em 30 dias', B.moeda(exemplo.montante) + ' (+' + B.moeda(exemplo.rendimento) + ')')
                ] } : null],
                proximos: [
                    { nome: 'banco', args: 'depositar tudo', oque: 'guardar a carteira no banco' },
                    { nome: 'bancosimularjuros', args: '10000 30', oque: 'simular com outro valor' }
                ],
                prefix
            }))
        }
        const linhas = [7, 30, 90, 365].map(d => {
            const r = B.jurosCompostos(p.banco, d)
            return F.campo('Em ' + d + ' dias', B.moeda(r.montante) + ' (+' + B.moeda(r.rendimento) + ')')
        })
        return reply(F.tela({
            emoji: '🔮',
            titulo: 'Projeção do banco',
            intro: 'Seus *' + B.moeda(p.banco) + '* guardados rendem ' + taxa + ' ao dia, com juros sobre juros.',
            secoes: [{ emoji: '📈', titulo: 'Projeção', linhas }],
            dica: 'A conta supõe que nada é sacado nem depositado no período.',
            proximos: [
                p.carteira > 0 ? { nome: 'banco', args: 'depositar tudo', oque: 'guardar a carteira também' } : null,
                { nome: 'bancorendimentohoje', oque: 'quanto rende hoje' }
            ].filter(Boolean),
            prefix
        }))
    }
}
