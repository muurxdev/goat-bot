/**
 * Comando .bancocomparar — COMPARAÇÃO
 *
 * Seu patrimônio contra a média dos Cavaleiros.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancocomparar',
    aliases: ["compararpatrimonio","cmd_bancocomparar","alt_bancocomparar","atalho_bancocomparar","abrev_bancocomparar","call_bancocomparar","func_bancocomparar"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Seu patrimônio contra a média dos Cavaleiros',
    examples: [' — compara seu patrimônio com a média dos jogadores'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const p = B.patrimonio(user)
        const g = B.estatisticasGerais()
        if (!g || !g.jogadores) {
            return reply(F.tela({
                emoji: '⚖️',
                titulo: 'Comparação',
                intro: 'Ainda não há jogadores cadastrados suficientes para comparar.',
                secoes: [{ emoji: '💳', titulo: 'Você', linhas: [F.campo('Patrimônio', B.moeda(p.total))] }],
                proximos: [{ nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' }],
                prefix
            }))
        }
        const razao = g.media ? p.total / g.media : 0
        return reply(F.tela({
            emoji: '⚖️',
            titulo: 'Comparação',
            intro: 'Você tem *' + razao.toFixed(2).replace('.', ',') + 'x* a média dos Cavaleiros.',
            secoes: [{ emoji: '📋', titulo: 'Números', linhas: [
                F.campo('Você', B.moeda(p.total)),
                F.campo('Média do Reino', B.moeda(g.media)),
                F.campo('Maior fortuna', B.moeda(g.maior)),
                F.campo('Cavaleiros comparados', String(g.jogadores))
            ] }],
            dica: 'A média é puxada para cima pelas maiores fortunas; ficar abaixo dela é comum.',
            proximos: [
                { nome: 'bancopercentil', oque: 'quantos jogadores têm menos que você' },
                { nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' }
            ],
            prefix
        }))
    }
}
