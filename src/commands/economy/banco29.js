/**
 * Comando .bancopercentil — SUA POSIÇÃO
 *
 * Percentual de jogadores com menos que você.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancopercentil',
    aliases: ["minhaposicao","cmd_bancopercentil","alt_bancopercentil","atalho_bancopercentil","abrev_bancopercentil","call_bancopercentil","func_bancopercentil"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Percentual de jogadores com menos que você',
    examples: [' — quantos jogadores têm menos dinheiro que você'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const p = B.patrimonio(user)
        const r = B.percentil(p.total)
        if (!r) {
            return reply(F.tela({
                emoji: '📍',
                titulo: 'Sua posição',
                intro: 'Ainda não há jogadores cadastrados suficientes para comparar.',
                secoes: [{ emoji: '💳', titulo: 'Você', linhas: [F.campo('Patrimônio', B.moeda(p.total))] }],
                proximos: [{ nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' }],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '📍',
            titulo: 'Sua posição',
            intro: 'Você tem mais dinheiro que *' + r.percentil.toFixed(1).replace('.', ',') + '%* dos Cavaleiros.',
            secoes: [{ emoji: '📋', titulo: 'Números', linhas: [
                F.campo('Patrimônio', B.moeda(p.total)),
                F.campo('Você tem mais que', r.abaixo + ' de ' + r.todos + ' Cavaleiros'),
                F.barra(r.percentil / 100)
            ] }],
            dica: 'Patrimônio soma carteira, banco e cofre.',
            proximos: [{ nome: 'bancocomparar', oque: 'comparar com a média' }],
            prefix
        }))
    }
}
