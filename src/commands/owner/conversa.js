/**
 * Liga/desliga a CONVERSA NATURAL — o bot responder sem prefixo.
 *
 *   .conversa            → estado atual deste ambiente
 *   .conversa on|off     → liga/desliga aqui
 *   .conversa on global  → liga/desliga em todo lugar
 *
 * Separado do .modulo e do .perfilbot de propósito: isto não é um bloco de
 * comandos, é o comportamento do bot quando NINGUÉM digitou comando nenhum.
 */

const natural = require('../../services/naturalReplyService')
const { resolveGroupName } = require('../../utils/groupLabel')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'conversa',
    aliases: ['conversanatural', 'papo', 'respostanatural'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Liga ou desliga minhas respostas a perguntas feitas sem comando',
    usage: '[on | off] [global]',
    examples: [
        ' — mostra se a conversa está ligada aqui',
        'on — respondo perguntas sem comando neste grupo',
        'off global — só respondo a comandos em todo lugar'
    ],
    ownerOnly: true,
    cooldownMs: 1500,
    execute: async ({ args, reply, prefix = '.', from, isGroup }) => {
        const sub = (args[0] || '').toLowerCase().trim()
        const alvoGlobal = ['global', 'geral', 'tudo'].includes((args[1] || '').toLowerCase().trim())
        const scope = alvoGlobal ? null : (isGroup ? from : null)
        const nome = await resolveGroupName(scope, 'CONVERSA')
        const ondeTxt = alvoGlobal ? '🌐 todos os ambientes' : (isGroup ? (nome ? `👥 *${nome}*` : `👥 este grupo`) : '💬 o privado')
        const onde = F.campo('Onde', ondeTxt)

        try {
            if (!sub || ['status', 'ver'].includes(sub)) {
                const ativo = natural.isNaturalReplyEnabled(isGroup ? from : null, isGroup)
                return reply(F.tela({
                    emoji: '💬',
                    titulo: ativo ? 'Conversa natural: ligada' : 'Conversa natural: desligada',
                    intro: ativo
                        ? 'Respondo *sem precisar de comando* quando alguém pergunta sobre mim (como usar, quais comandos, quanto custa) ou faz uma pergunta de verdade me marcando. Fora isso fico calado.'
                        : `Só respondo a comandos começando com ${prefix}. Mensagens soltas são ignoradas.`,
                    secoes: [{ emoji: '📍', titulo: 'Ambiente', linhas: [onde] }],
                    proximos: [
                        ativo
                            ? { nome: 'conversa', args: 'off', oque: 'só responde a comandos aqui' }
                            : { nome: 'conversa', args: 'on', oque: 'responde perguntas sem comando aqui' },
                        { nome: 'conversa', args: `${ativo ? 'off' : 'on'} global`, oque: 'vale para todos os grupos e o privado' }
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
                        { nome: 'conversa', args: 'on', oque: 'liga aqui' },
                        { nome: 'conversa', args: 'off', oque: 'desliga aqui' }
                    ],
                    prefix
                }))
            }

            await natural.setNaturalReply(ligar, scope)
            logger.info(`[CONVERSA] ${ligar ? 'Ligada' : 'Desligada'} em ${scope || 'GLOBAL'}`)

            if (ligar) {
                return reply(F.tela({
                    emoji: '🟢',
                    titulo: 'Conversa natural ligada',
                    intro: 'Passo a responder algumas mensagens mesmo sem comando.',
                    secoes: [
                        { emoji: '📍', titulo: 'Ambiente', linhas: [onde] },
                        {
                            emoji: '✅',
                            titulo: 'O que passo a fazer',
                            linhas: [
                                '• Respondo quem perguntar como me usar, quais comandos tenho ou quanto custo',
                                '• Respondo perguntas de verdade quando me marcam ou me chamam no privado'
                            ]
                        },
                        {
                            emoji: '🔇',
                            titulo: 'O que continuo sem fazer',
                            linhas: [
                                '• Não comento conversa entre as pessoas',
                                '• Não respondo "oi", "kkkk", desabafo ou mensagem curta'
                            ]
                        }
                    ],
                    proximos: [{ nome: 'conversa', args: alvoGlobal ? 'off global' : 'off', oque: 'desfaz' }],
                    prefix
                }))
            }

            return reply(F.tela({
                emoji: '🔴',
                titulo: 'Conversa natural desligada',
                intro: `A partir de agora só respondo a comandos começando com ${prefix}. Mensagem sem comando é ignorada por completo.`,
                secoes: [{ emoji: '📍', titulo: 'Ambiente', linhas: [onde] }],
                proximos: [{ nome: 'conversa', args: alvoGlobal ? 'on global' : 'on', oque: 'desfaz' }],
                prefix
            }))
        } catch (err) {
            logger.error('[CONVERSA ERROR]', err)
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não consegui mudar a conversa natural',
                intro: 'Algo falhou ao salvar o ajuste, então nada mudou. Tente de novo em instantes; se repetir, confira os registros do servidor.',
                proximos: [{ nome: 'conversa', oque: 'confere como está agora' }],
                prefix
            }))
        }
    }
}
