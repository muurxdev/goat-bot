/**
 * Comando .bancoparceiros — COM QUEM VOCÊ NEGOCIA
 *
 * Quem mais aparece nas suas transferências.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancoparceiros',
    aliases: ["comquemtransaciono","cmd_bancoparceiros","alt_bancoparceiros","atalho_bancoparceiros","abrev_bancoparceiros","call_bancoparceiros","func_bancoparceiros"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Quem mais aparece nas suas transferências',
    examples: [' — com quem você mais troca moedas'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const p = B.parceiros(sender, 10)
        if (!p.length) {
            return reply(F.tela({
                emoji: '🤝',
                titulo: 'Com quem você negocia',
                intro: 'Você ainda não transferiu moedas para outro Cavaleiro. Quando transferir, eu mostro aqui com quem mais troca.',
                secoes: [{ emoji: '✍️', titulo: 'Para transferir', linhas: ['• ' + F.cmd(prefix, 'pay', '@pessoa 100') + ' — envia 100 moedas']}],
                proximos: [{ nome: 'bancorazao', oque: 'ver suas últimas movimentações' }],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '🤝',
            titulo: 'Com quem você negocia',
            intro: 'Você trocou moedas com *' + p.length + '* ' + (p.length === 1 ? 'Cavaleiro' : 'Cavaleiros') + '. Quem movimentou mais valor aparece primeiro.',
            secoes: [{ emoji: '📋', titulo: 'Parceiros', linhas: p.map((x, i) =>
                (i + 1) + 'º +' + String(x.jid).split('@')[0].slice(0, 6) + '**** — ' + x.quantidade + 'x · ' + B.moeda(x.valor)) }],
            dica: 'Os números aparecem mascarados para proteger quem negociou com você.',
            proximos: [{ nome: 'bancorazao', oque: 'ver suas últimas movimentações' }],
            prefix
        }))
    }
}
