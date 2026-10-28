/**
 * Comando .bancoautomatico — DEPÓSITO AUTOMÁTICO
 *
 * Percentual dos ganhos que vai direto ao banco.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancoautomatico',
    aliases: ["depositoautomatico","cmd_bancoautomatico","alt_bancoautomatico","atalho_bancoautomatico","abrev_bancoautomatico","call_bancoautomatico","func_bancoautomatico"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Percentual dos ganhos que vai direto ao banco',
    usage: '[percentual]',
    examples: [' — mostra se está ligado', '30 — anota 30% dos ganhos para o banco', '0 — desliga'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const prefs = B.lerPreferencias(user)
        if (!args[0]) {
            return reply(F.tela({
                emoji: '🔄',
                titulo: 'Depósito automático',
                intro: prefs.automatico ? 'Ligado em *' + prefs.automatico + '%* dos seus ganhos.' : 'Está *desligado*.',
                secoes: [
                    { emoji: '📌', titulo: 'Para que serve', linhas: ['Separa uma parte do que você ganha para o banco, onde rende e fica longe de ladrões.'] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'bancoautomatico', '30') + ' — 30% dos ganhos',
                        '• ' + F.cmd(prefix, 'bancoautomatico', '0') + ' — desliga'
                    ] }
                ],
                dica: 'Entre 20% e 30% costuma sobrar o bastante para o dia a dia.',
                proximos: [{ nome: 'bancoguardar', args: '30', oque: 'calcular quanto guardar agora' }],
                prefix
            }))
        }
        const pct = parseInt(String(args[0]).replace(/\D/g, ''), 10)
        if (isNaN(pct) || pct < 0 || pct > 100) {
            return reply(F.tela({
                emoji: '🔢',
                titulo: 'Percentual inválido',
                intro: 'Use um número de 0 a 100.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    '• ' + F.cmd(prefix, 'bancoautomatico', '30'),
                    '• ' + F.cmd(prefix, 'bancoautomatico', '0') + ' — desliga'
                ] }],
                prefix
            }))
        }
        B.salvarPreferencia(user, 'bancoAutomatico', pct)
        return reply(F.tela({
            emoji: '🔄',
            titulo: pct === 0 ? 'Depósito automático desligado' : 'Depósito automático ligado',
            intro: pct === 0
                ? 'Seus ganhos ficam inteiros na carteira.'
                : 'A partir de agora, *' + pct + '%* do que você ganhar vai direto para o banco.',
            secoes: [prefs.automatico ? F.campo('Antes', prefs.automatico + '%') : ''],
            proximos: [{ nome: 'bancoresumo', oque: 'ver carteira, banco e cofre' }],
            prefix
        }))
    }
}
