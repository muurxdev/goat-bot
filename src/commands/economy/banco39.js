/**
 * Comando .bancolimite — LIMITE DIÁRIO
 *
 * Define um teto de saque por dia.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/tesourariaService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancolimite',
    aliases: ["limitediario","cmd_bancolimite","alt_bancolimite","atalho_bancolimite","abrev_bancolimite","call_bancolimite","func_bancolimite"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Define um teto de saque por dia',
    usage: '[valor]',
    examples: [' — mostra o limite atual', '50000 — anota um teto de 50.000 moedas de saque por dia'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const prefs = B.lerPreferencias(user)
        if (!args[0]) {
            return reply(F.tela({
                emoji: '🚧',
                titulo: 'Limite de saque por dia',
                intro: prefs.limiteDiario ? 'Seu limite é *' + B.moeda(prefs.limiteDiario) + '* por dia.' : 'Você não tem limite de saque definido.',
                secoes: [
                    { emoji: '📌', titulo: 'Para que serve', linhas: ['Um teto para o quanto sai do banco num dia, para o dinheiro guardado não sumir de uma vez.'] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'bancolimite', '50000') + ' — até 50.000 🪙 por dia',
                        '• ' + F.cmd(prefix, 'bancolimite', '10000') + ' — até 10.000 🪙 por dia'
                    ] }
                ],
                proximos: [{ nome: 'bancotrancar', args: '24', oque: 'trancar os saques por completo' }],
                prefix
            }))
        }
        const valor = parseInt(String(args[0]).replace(/\D/g, ''), 10)
        if (!valor || valor < 0) {
            return reply(F.tela({
                emoji: '🔢',
                titulo: 'Não entendi o valor',
                intro: '"' + String(args[0]).slice(0, 30) + '" não é um valor válido. Use um número maior que zero.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: ['• ' + F.cmd(prefix, 'bancolimite', '50000')] }],
                prefix
            }))
        }
        B.salvarPreferencia(user, 'bancoLimiteDiario', valor)
        return reply(F.tela({
            emoji: '🚧',
            titulo: 'Limite de saque definido',
            intro: 'Seu teto de saque agora é *' + B.moeda(valor) + '* por dia.',
            secoes: [prefs.limiteDiario ? F.campo('Antes', B.moeda(prefs.limiteDiario)) : ''],
            proximos: [{ nome: 'bancoconta', oque: 'ver a situação da conta' }],
            prefix
        }))
    }
}
