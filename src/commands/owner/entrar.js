/**
 * Comando .entrar
 * Faz o bot entrar em um grupo a partir de um link de convite do WhatsApp
 */

const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'entrar',
    aliases: ['join', 'entrargrupo', 'joinlink'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Me faz entrar em um grupo pelo link de convite',
    usage: '<link de convite do grupo>',
    examples: ['https://chat.whatsapp.com/ABCDEF1234567890ABCDEF — entro no grupo desse convite'],
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ text, client, reply, prefix = '.' }) => {
        const link = (text || '').trim()

        const exemplo = { nome: 'entrar', args: 'https://chat.whatsapp.com/ABCDEF1234567890ABCDEF', oque: 'entrar pelo link' }

        if (!link) {
            return reply(F.tela({
                prefix,
                emoji: '🚪',
                titulo: 'Entrar em um grupo',
                intro: 'Me mande o link de convite do grupo e eu entro sozinho.',
                secoes: [{
                    emoji: '✍️', titulo: 'Digite assim', linhas: [
                        F.cmd(prefix, 'entrar', 'https://chat.whatsapp.com/ABCDEF1234567890ABCDEF')
                    ]
                }],
                dica: 'O link fica em Dados do grupo › Convidar via link. Só o código do convite também serve.',
                proximos: [{ nome: 'grupos', oque: 'ver os grupos onde já estou' }]
            }))
        }

        const match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/)
        const inviteCode = match ? match[1] : link.replace(/https?:\/\/chat\.whatsapp\.com\//, '').trim()

        if (!inviteCode || inviteCode.length < 15) {
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Link de convite inválido',
                intro: 'Não reconheci um convite de grupo nesse texto. Copie o link inteiro, começando em https://chat.whatsapp.com/.',
                proximos: [exemplo]
            }))
        }

        try {
            await reply('⏳ *Entrando no grupo pelo convite...*')
            const response = await client.groupAcceptInvite(inviteCode)
            logger.info(`[GROUP JOIN] Bot entrou no grupo: ${response}`)

            let nome = ''
            try {
                const meta = response ? await client.groupMetadata(response) : null
                nome = meta?.subject || ''
            } catch (e) {
                logger.warn(`[ENTRAR] groupMetadata falhou após entrar em ${response}: ${e.message}`)
            }

            return reply(F.tela({
                prefix,
                emoji: '✅',
                titulo: nome ? `Entrei em ${nome}` : 'Entrei no grupo',
                intro: 'Já estou no grupo. Se ele exigir aprovação de entrada, apareço depois que um administrador aceitar.',
                dica: 'Confira se os módulos do grupo estão ligados, senão eu fico calado lá.',
                proximos: [
                    { nome: 'grupos', oque: 'ver módulos e aluguel de cada grupo' },
                    { nome: 'grupos', args: 'mudos', oque: 'ver só os grupos onde não respondo' }
                ]
            }))
        } catch (err) {
            // O Baileys lança "conflict" (HTTP 409) quando o bot JÁ é membro do grupo.
            // Isso não é falha — é o caso comum de reenviar o link. Resolvemos o nome
            // do grupo pelo próprio convite e respondemos de forma amigável.
            const reason = String(err?.message || '').toLowerCase()
            const status = err?.data || err?.output?.statusCode
            if (reason.includes('conflict') || status === 409) {
                let nome = ''
                try {
                    const infoConvite = await client.groupGetInviteInfo(inviteCode)
                    nome = infoConvite?.subject ? ` *${infoConvite.subject}*` : ''
                } catch (e) {
                    logger.warn(`[ENTRAR] groupGetInviteInfo falhou no conflito: ${e.message}`)
                }
                return reply(`ℹ️ *Eu já estou nesse grupo${nome}.*\n\nNão precisa me adicionar de novo.`)
            }
            if (reason.includes('gone') || status === 410) {
                return reply(F.tela({
                    prefix,
                    emoji: '❌',
                    titulo: 'Convite expirado',
                    intro: 'Esse link não vale mais. Peça um link novo a um administrador do grupo.',
                    proximos: [exemplo]
                }))
            }
            if (reason.includes('not-authorized') || reason.includes('forbidden') || status === 401 || status === 403) {
                return reply(F.tela({
                    prefix,
                    emoji: '❌',
                    titulo: 'Convite recusado',
                    intro: 'O link foi revogado ou não tenho permissão para entrar por ele. Peça um link novo.',
                    proximos: [exemplo]
                }))
            }
            logger.error(`[ENTRAR ERROR] convite=${inviteCode}`, err)
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui entrar no grupo',
                intro: 'O WhatsApp não aceitou o convite agora. Tente de novo em instantes.',
                dica: 'O motivo detalhado ficou no log do dia.',
                proximos: [exemplo]
            }))
        }
    }
}
