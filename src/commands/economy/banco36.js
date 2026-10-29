/**
 * Comando .bancoapelido — APELIDO DA CONTA
 *
 * Dá um nome à sua conta na tesouraria.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancoapelido',
    aliases: ["nomearconta","cmd_bancoapelido","alt_bancoapelido","atalho_bancoapelido","abrev_bancoapelido","call_bancoapelido","func_bancoapelido"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Dá um nome à sua conta na tesouraria',
    usage: '[apelido]',
    examples: [' — mostra o apelido atual', 'Cofre do Dragão — dá esse nome à sua conta'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const prefs = B.lerPreferencias(user)
        const apelido = args.join(' ').trim()
        if (!apelido) {
            return reply(F.tela({
                emoji: '🏷️',
                titulo: 'Apelido da conta',
                intro: prefs.apelido ? 'Sua conta se chama *' + prefs.apelido + '*.' : 'Sua conta ainda não tem apelido.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    '• ' + F.cmd(prefix, 'bancoapelido', 'Cofre do Dragão') + ' — dá esse nome à conta',
                    '• ' + F.cmd(prefix, 'bancoapelido', 'Reserva de Guerra') + ' — troca por outro'
                ] }],
                dica: 'Até 30 letras. O apelido aparece na identificação da sua conta.',
                proximos: [{ nome: 'bancoconta', oque: 'ver a identificação da conta' }],
                prefix
            }))
        }
        if (apelido.length > 30) {
            return reply(F.tela({
                emoji: '🏷️',
                titulo: 'Apelido longo demais',
                intro: 'O apelido pode ter até *30* letras, e esse tem ' + apelido.length + '.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: ['• ' + F.cmd(prefix, 'bancoapelido', 'Cofre do Dragão')] }],
                prefix
            }))
        }
        B.salvarPreferencia(user, 'bancoApelido', apelido)
        return reply(F.tela({
            emoji: '🏷️',
            titulo: 'Apelido salvo',
            intro: 'Sua conta agora se chama *' + apelido + '*.',
            secoes: [prefs.apelido ? F.campo('Antes', prefs.apelido) : ''],
            proximos: [{ nome: 'bancoconta', oque: 'ver a identificação da conta' }],
            prefix
        }))
    }
}
