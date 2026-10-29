const { nomeDoMembro } = require('../../utils/nomeMembro');
const F = require('../../utils/formato')
const logger = require('../../core/logger')

function getPeriodo() {
    const h = new Date().getHours()
    if (h >= 5 && h < 12) return { periodo: 'Bom dia', emoji: '☀️' }
    if (h >= 12 && h < 18) return { periodo: 'Boa tarde', emoji: '🌤️' }
    return { periodo: 'Boa noite', emoji: '🌙' }
}

module.exports = {
    name: 'cumprimentar',
    aliases: ['oi', 'olá', 'hello'],
    category: 'fun',
    subcategory: 'Interação',
    description: 'Cumprimente alguém com bom dia/boa tarde/boa noite',
    usage: '[@pessoa]',
    examples: [' — recebe um cumprimento', '@pessoa — cumprimenta alguém do grupo'],
    cooldownMs: 3000,
    execute: async ({ sender, reply, mentionedJid: _mencoes, prefix = '.' }) => {
        // mentionedJid chega como ARRAY; usar direto quebrava com
        // "mentionedJid.split is not a function".
        const mentionedJid = Array.isArray(_mencoes) ? _mencoes[0] : _mencoes
        const { periodo, emoji } = getPeriodo()

        if (!mentionedJid || mentionedJid === sender) {
            return reply(F.tela({
                emoji,
                titulo: periodo + '!',
                intro: `${periodo}, ${nomeDoMembro(sender)}! Como vai você? 😊`,
                dica: 'Marque alguém para mandar o cumprimento para outra pessoa.',
                proximos: [
                    { nome: 'cumprimentar', args: '@pessoa', oque: 'cumprimentar alguém do grupo' },
                    { nome: 'elogio', args: '@pessoa', oque: 'mandar um elogio' }
                ],
                prefix
            }), [sender])
        }

        const mentions = [sender, mentionedJid]
        return reply(
            `${emoji} *${periodo},* ${nomeDoMembro(mentionedJid)}!\n\n` +
            `Enviado com carinho por ${nomeDoMembro(sender)} 💕`,
            mentions
        )
    }
}
