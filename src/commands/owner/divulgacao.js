/**
 * Comando .divulgacao / .divulgar / .anunciar
 * Central oficial de comunicação, avisos e divulgação em massa para grupos e contatos
 * Substitui o protocolo legado e implementa taxa segura de envio com anti-ban.
 */

const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'divulgacao',
    aliases: ['divulgar', 'avisoglobal', 'anunciar'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Manda um comunicado para todos os grupos em que estou agora',
    usage: '[grupos <mensagem> | status]',
    examples: [
        ' — explica como funciona',
        'status — mostra em quantos grupos estou',
        'grupos Novidades no ar! — envia para todos os grupos'
    ],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ client, args, reply, prefix = '.' }) => {
        const botName = getBotName()
        const sub = (args[0] || '').toLowerCase()
        const texto = args.slice(1).join(' ').trim()

        if (!sub || ['ajuda', 'help', 'menu'].includes(sub)) {
            return reply(F.tela({
                emoji: '📢',
                titulo: 'Central de divulgação',
                intro: 'Escreva o comunicado e eu mando para todos os grupos em que estou agora, um de cada vez.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [
                        `• ${F.cmd(prefix, 'divulgacao', 'grupos Novidades da versão 2.0!')} — envia para todos os grupos`,
                        `• ${F.cmd(prefix, 'divulgacao', 'status')} — mostra quantos grupos vão receber`
                    ]
                }],
                dica: 'Espero 1,8 s entre um grupo e outro para o WhatsApp não bloquear o número.',
                proximos: [{ nome: 'divulgacao', args: 'status', oque: 'confere o alcance antes de enviar' }],
                prefix
            }))
        }

        // ══════════════════════════════════════════════════
        // STATUS DA CENTRAL DE DIVULGAÇÃO
        // ══════════════════════════════════════════════════
        if (sub === 'status') {
            let chats = []
            let falhou = false
            try {
                if (client?.groupFetchAllParticipating) {
                    const groups = await client.groupFetchAllParticipating()
                    chats = Object.keys(groups)
                }
            } catch (err) {
                falhou = true
                logger.warn(`[DIVULGACAO] Não foi possível listar os grupos no status: ${err.message}`)
            }

            if (falhou) {
                return reply(F.tela({
                    emoji: '⚠️',
                    titulo: 'Não consegui contar os grupos',
                    intro: 'Não consegui falar com o WhatsApp agora. Tente de novo em instantes.',
                    prefix
                }))
            }

            return reply(F.tela({
                emoji: '📊',
                titulo: `Alcance: ${chats.length} grupos`,
                intro: chats.length
                    ? `Um comunicado agora chegaria a ${chats.length} grupos.`
                    : 'Não estou em nenhum grupo agora, então um comunicado não chegaria a ninguém.',
                secoes: [{
                    emoji: '📋',
                    titulo: 'Detalhes',
                    linhas: [
                        F.campo('Assinado como', botName),
                        F.campo('Intervalo entre envios', '1,8 s'),
                        chats.length ? F.campo('Tempo estimado', F.tempo(chats.length * 1800)) : null
                    ]
                }],
                proximos: [{ nome: 'divulgacao', args: 'grupos sua mensagem', oque: 'envia o comunicado' }],
                prefix
            }))
        }

        // ══════════════════════════════════════════════════
        // DISPARO DE TRANSMISSÃO
        // ══════════════════════════════════════════════════
        const isGrupos = sub === 'grupos' || sub === 'grupo' || sub === 'all'
        const isPv = sub === 'pv' || sub === 'privado'

        let mensagemFinal = texto
        if (!isGrupos && !isPv) {
            mensagemFinal = args.join(' ').trim()
        }

        if (!mensagemFinal) {
            return reply(F.tela({
                emoji: '✍️',
                titulo: 'Falta a mensagem',
                intro: 'Escreva o comunicado depois do comando.',
                secoes: [{ emoji: '📌', titulo: 'Exemplo', linhas: [`• ${F.cmd(prefix, 'divulgacao', 'grupos Novidades da versão 2.0 disponíveis!')}`] }],
                prefix
            }))
        }

        // Busca grupos participantes
        let targetChats = []
        try {
            if (client?.groupFetchAllParticipating) {
                const groups = await client.groupFetchAllParticipating()
                targetChats = Object.keys(groups)
            }
        } catch (err) {
            logger.error(`[DIVULGACAO] Falha ao listar os grupos para envio: ${err.message}`)
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Não enviei o comunicado',
                intro: 'Não consegui buscar a lista de grupos no WhatsApp agora, então nada foi enviado. Tente de novo em instantes.',
                proximos: [{ nome: 'divulgacao', args: 'status', oque: 'confere se já voltou' }],
                prefix
            }))
        }

        if (targetChats.length === 0) {
            return reply(F.tela({
                emoji: '📭',
                titulo: 'Nenhum grupo para enviar',
                intro: 'Não estou participando de nenhum grupo agora. Me adicione a um grupo e tente de novo.',
                prefix
            }))
        }

        await reply(`⏳ *Enviando o comunicado para ${targetChats.length} grupos…*\nIsso leva uns ${F.tempo(targetChats.length * 1800)}. Aviso aqui quando terminar.`)

        const cardAnuncio = `📢 *Comunicado de ${botName}*\n\n${mensagemFinal}`

        let enviados = 0
        let falhas = 0

        for (const chatJid of targetChats) {
            try {
                await client.sendMessage(chatJid, { text: cardAnuncio })
                enviados++
                // Intervalo de segurança anti-ban do WhatsApp (1.8s)
                await new Promise(r => setTimeout(r, 1800))
            } catch (err) {
                falhas++
                logger.warn(`[DIVULGACAO] Erro ao enviar para ${chatJid}: ${err.message}`)
            }
        }

        logger.info(`[DIVULGACAO COMPLETA] ${enviados} enviados com sucesso, ${falhas} falhas.`)

        return reply(F.tela({
            emoji: enviados ? '✅' : '⚠️',
            titulo: 'Comunicado enviado',
            intro: `Entreguei em ${enviados} de ${targetChats.length} grupos.`,
            secoes: [{
                emoji: '📋',
                titulo: 'Resultado',
                linhas: [
                    F.campo('Entregues', enviados),
                    F.campo('Não chegou', falhas),
                    falhas ? '_Falhas costumam ser grupos fechados só para administradores ou de onde já saí._' : null
                ]
            }],
            prefix
        }))
    }
}
