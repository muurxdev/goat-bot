/**
 * Comando .apostapausa — SITUAÇÃO DA PAUSA
 *
 * Confere se você está em pausa e por quanto tempo.
 */

const A = require('../../services/bettingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'apostapausa',
    aliases: ["minhapausa","cmd_apostapausa","alt_apostapausa","atalho_apostapausa","abrev_apostapausa","call_apostapausa","func_apostapausa"],
    category: 'economy',
    subcategory: 'Mesa de Apostas',
    description: 'Confere se você está em pausa e por quanto tempo',
    examples: [' — diz se você está em pausa e quando libera'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const p = A.emPausa(user)
        if (!p.pausado) {
            return reply(F.tela({
                emoji: '🟢',
                titulo: 'Sem pausa',
                intro: 'Você não está em pausa de apostas.',
                secoes: [{ emoji: '📌', titulo: 'Como funciona', linhas: [
                    'Você mesmo pode se afastar das mesas por um tempo, de 1 hora a 30 dias.'
                ] }],
                dica: 'Pausar depois de uma sequência ruim evita correr atrás do prejuízo.',
                proximos: [
                    { nome: 'apostaparar', args: '24', oque: 'pausar por 24 horas' },
                    { nome: 'apostaalerta', oque: 'ver se passou de algum limite' }
                ],
                prefix
            }))
        }
        return reply(F.tela({
            emoji: '⏸️',
            titulo: 'Você está em pausa',
            intro: 'Faltam *' + A.duracao(p.restanteMs) + '* para a pausa terminar.',
            secoes: [{ emoji: '📋', titulo: 'Pausa', linhas: [
                F.campo('Falta', A.duracao(p.restanteMs)),
                F.campo('Libera em', F.dataHora(p.ate))
            ] }],
            dica: 'Você mesmo pediu essa pausa. Vale respeitar a decisão que tomou com a cabeça fria.',
            proximos: [
                { nome: 'apostaresumo', oque: 'rever como foram suas apostas' },
                { nome: 'apostavoltar', oque: 'encerrar a pausa antes do prazo' }
            ],
            prefix
        }))
    }
}
