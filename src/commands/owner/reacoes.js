/**
 * Liga/desliga as reações de ciclo de vida dos comandos.
 *
 *   .reacoes            → estado atual
 *   .reacoes on|off     → liga/desliga aqui
 *   .reacoes on global  → em todo lugar
 */

const reaction = require('../../services/reactionService')
const { resolveGroupName } = require('../../utils/groupLabel')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'reacoes',
    aliases: ['reacao', 'emojis', 'reactions'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga ou desliga os emojis que eu coloco na mensagem de quem usa um comando',
    usage: '[on | off] [global]',
    examples: [
        ' — mostra se as reações estão ligadas aqui',
        'off — paro de reagir neste grupo',
        'on global — reajo em todos os grupos e no privado'
    ],
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup }) => {
        const sub = (args[0] || '').toLowerCase().trim()
        const alvoGlobal = ['global', 'geral', 'tudo'].includes((args[1] || '').toLowerCase().trim())
        const scope = alvoGlobal ? null : (isGroup ? from : null)
        const nome = await resolveGroupName(scope, 'REACOES')
        const onde = alvoGlobal ? '🌐 todos os ambientes' : (isGroup ? (nome ? `👥 *${nome}*` : '👥 este grupo') : '💬 o privado')

        const legenda = {
            emoji: '🎭',
            titulo: 'O que cada emoji quer dizer',
            linhas: [
                '⚡ *Recebido* — emoji da categoria do comando',
                '⏳ *Processando* — só se passar de 2,5 s',
                '✅ *Concluído* — deu certo',
                '❌ *Erro* — falhou',
                '🔒 *Bloqueado* — categoria desligada aqui',
                '❓ *Desconhecido* — o comando não existe'
            ]
        }

        try {
            if (!sub || ['status', 'ver'].includes(sub)) {
                const ativo = reaction.reactionsEnabled(isGroup ? from : null, isGroup)
                return reply(F.tela({
                    emoji: '🎭',
                    titulo: ativo ? 'Reações: ligadas' : 'Reações: desligadas',
                    intro: ativo
                        ? 'Marco a mensagem de quem usa um comando com um emoji mostrando o andamento.'
                        : 'Os comandos funcionam normalmente, só não marco emoji nas mensagens.',
                    secoes: [
                        { emoji: '📍', titulo: 'Ambiente', linhas: [F.campo('Onde', onde)] },
                        legenda
                    ],
                    proximos: [
                        { nome: 'reacoes', args: ativo ? 'off' : 'on', oque: ativo ? 'desliga aqui' : 'liga aqui' },
                        { nome: 'reacoes', args: `${ativo ? 'off' : 'on'} global`, oque: 'vale para todos os lugares' }
                    ],
                    prefix
                }))
            }

            const ligar = ['on', 'ligar', 'ativar', '1', 'sim'].includes(sub)
            const desligar = ['off', 'desligar', 'desativar', '0', 'nao', 'não'].includes(sub)
            if (!ligar && !desligar) {
                return reply(F.tela({
                    emoji: '❓',
                    titulo: `Não entendi "${sub}"`,
                    intro: 'Use on para ligar ou off para desligar. Acrescente global para valer em todo lugar.',
                    proximos: [
                        { nome: 'reacoes', args: 'on', oque: 'liga aqui' },
                        { nome: 'reacoes', args: 'off', oque: 'desliga aqui' }
                    ],
                    prefix
                }))
            }

            await reaction.setReactions(ligar, scope)
            logger.info(`[REACOES] ${ligar ? 'Ligadas' : 'Desligadas'} em ${scope || 'GLOBAL'}`)

            if (ligar) {
                return reply(F.tela({
                    emoji: '🟢',
                    titulo: 'Reações ligadas',
                    intro: 'Todo comando passa a marcar a própria mensagem com o andamento.',
                    secoes: [
                        { emoji: '📍', titulo: 'Ambiente', linhas: [F.campo('Onde', onde)] },
                        legenda
                    ],
                    proximos: [{ nome: 'reacoes', args: alvoGlobal ? 'off global' : 'off', oque: 'desfaz' }],
                    prefix
                }))
            }

            return reply(F.tela({
                emoji: '🔴',
                titulo: 'Reações desligadas',
                intro: 'Os comandos continuam funcionando igual, só param de marcar emoji na mensagem.',
                secoes: [{ emoji: '📍', titulo: 'Ambiente', linhas: [F.campo('Onde', onde)] }],
                proximos: [{ nome: 'reacoes', args: alvoGlobal ? 'on global' : 'on', oque: 'desfaz' }],
                prefix
            }))
        } catch (err) {
            logger.error('[REACOES ERROR]', err)
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não consegui mudar as reações',
                intro: 'Algo falhou ao salvar o ajuste, então nada mudou. Tente de novo em instantes; se repetir, confira os registros do servidor.',
                proximos: [{ nome: 'reacoes', oque: 'confere como está agora' }],
                prefix
            }))
        }
    }
}
