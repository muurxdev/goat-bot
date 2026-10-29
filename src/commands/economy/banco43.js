/**
 * Comando .bancorendimentohoje — RENDIMENTO DE HOJE
 *
 * Quanto seu dinheiro guardado rende hoje.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancorendimentohoje',
    aliases: ["renderahoje","cmd_bancorendimentohoje","alt_bancorendimentohoje","atalho_bancorendimentohoje","abrev_bancorendimentohoje","call_bancorendimentohoje","func_bancorendimentohoje"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quanto seu dinheiro guardado rende hoje',
    examples: [' — quanto o dinheiro guardado no banco rende hoje'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const p = B.patrimonio(user)
        const taxa = (B.RENDIMENTO_DIARIO * 100).toFixed(1).replace('.', ',') + '%'
        if (p.banco <= 0) {
            return reply(F.tela({
                emoji: '🌅',
                titulo: 'Rendimento de hoje',
                intro: 'Você não tem nada guardado no banco, então nada rende hoje. O banco paga ' + taxa + ' ao dia.',
                secoes: [p.carteira > 0 ? { emoji: '💡', titulo: 'Se guardar a carteira', linhas: [
                    F.campo('Carteira', B.moeda(p.carteira)),
                    F.campo('Renderia hoje', B.moeda(p.carteira * B.RENDIMENTO_DIARIO))
                ] } : null],
                proximos: [{ nome: 'banco', args: 'depositar tudo', oque: 'guardar a carteira no banco' }],
                prefix
            }))
        }
        const hoje = p.banco * B.RENDIMENTO_DIARIO
        return reply(F.tela({
            emoji: '🌅',
            titulo: 'Rendimento de hoje',
            intro: 'Hoje seu dinheiro guardado rende *' + B.moeda(hoje) + '*.',
            secoes: [{ emoji: '📈', titulo: 'Rendimento', linhas: [
                F.campo('Guardado', B.moeda(p.banco)),
                F.campo('Taxa', taxa + ' ao dia'),
                F.campo('Hoje', B.moeda(hoje)),
                F.campo('No mês', B.moeda(B.jurosCompostos(p.banco, 30).rendimento)),
                F.campo('No ano', B.moeda(B.jurosCompostos(p.banco, 365).rendimento))
            ] }],
            dica: 'Mês e ano somam juros sobre juros, supondo que nada seja sacado.',
            proximos: [{ nome: 'bancoprojecao', oque: 'projeção em vários prazos' }],
            prefix
        }))
    }
}
