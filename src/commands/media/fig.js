/**
 * Comando .fig / .sticker / .s
 * Converte imagens ou vídeos curtos em figurinhas do WhatsApp
 */

const { downloadWhatsAppMedia, criarFigurinha } = require('../../services/mediaService');
const { getBotName } = require('../../config/botConfig');
const stickerService = require('../../services/stickerService');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

module.exports = {
    name: 'fig',
    aliases: ['s', 'figurinha', 'f'],
    category: 'media',
    subcategory: 'Figurinhas',
    description: 'Converte imagens ou vídeos curtos em figurinhas do WhatsApp com metadados',
    usage: '(na legenda de uma imagem ou vídeo, ou respondendo a um)',
    examples: [
        ' — na legenda de uma foto: vira figurinha',
        ' — respondendo a um vídeo de até 15 segundos: vira figurinha animada'
    ],
    cooldownMs: 2000,
    execute: async ({ info, type, from, sender, client, reply, prefix = '.' }) => {
        const botName = getBotName();
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        const isImage = type === 'imageMessage';
        const isVideo = type === 'videoMessage';
        const isQuotedImage = !!quoted?.imageMessage;
        const isQuotedVideo = !!quoted?.videoMessage;

        if (!isImage && !isVideo && !isQuotedImage && !isQuotedVideo) {
            return reply(F.tela({
                emoji: '🎨',
                titulo: 'Fazer figurinha',
                intro: 'Transformo fotos e vídeos curtos em figurinhas. Só preciso que você me mostre qual.',
                secoes: [{ emoji: '✍️', titulo: 'Faça assim', linhas: [
                    `• Envie uma foto com a legenda ${F.cmd(prefix, 'fig')}`,
                    `• Ou responda a uma foto já enviada com ${F.cmd(prefix, 'fig')}`,
                    `• Vídeo ou GIF de até 15 segundos vira figurinha animada`
                ] }],
                dica: 'Imagens quadradas ficam melhores: o que sobra nas laterais aparece transparente.',
                proximos: [
                    { nome: 'toimg', oque: 'responder a uma figurinha para virar imagem' }
                ],
                prefix
            }));
        }

        const isAnimated = isVideo || isQuotedVideo;
        const mediaMsg = isImage ? info.message.imageMessage : isVideo ? info.message.videoMessage : isQuotedImage ? quoted.imageMessage : quoted.videoMessage;

        // Se for vídeo, limita a 15 segundos
        if (isAnimated && mediaMsg?.seconds && mediaMsg.seconds > 15) {
            return reply(F.tela({
                emoji: '⚠️',
                titulo: 'Vídeo longo demais',
                intro: `Esse vídeo tem *${mediaMsg.seconds} segundos*. Para virar figurinha animada, ele precisa ter até *15 segundos*.`,
                dica: 'Corte o trecho que você quer no próprio editor do WhatsApp (na hora de enviar) e mande de novo com a legenda .fig.',
                prefix
            }));
        }

        try {
            await reply(isAnimated ? '⏳ Fazendo sua figurinha animada… vídeos levam alguns segundos a mais.' : '⏳ Fazendo sua figurinha…');

            const targetWrapper = (isImage || isVideo) ? info : {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const buffer = await downloadWhatsAppMedia(targetWrapper, isAnimated ? 'video' : 'image', client);
            // Pacote e autor definidos com .packnome/.packautor; sem eles, o nome do bot.
            const pacote = stickerService.pacote(sender);
            const stickerBuffer = await criarFigurinha(buffer, isAnimated, pacote.nome || botName, pacote.autor || botName);

            await client.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: info });

            // Conta só o que foi entregue: alimenta .figcontador, .fighistorico e .figestatisticas.
            stickerService.registrar(sender);
        } catch (err) {
            logger.error('[FIG COMMAND ERROR]', err);
            await reply(F.tela({
                emoji: '❌',
                titulo: 'Não consegui fazer a figurinha',
                intro: isAnimated
                    ? 'Esse vídeo não quis virar figurinha. Às vezes o arquivo é pesado ou está num formato que não consigo abrir.'
                    : 'Essa imagem não quis virar figurinha. Às vezes ela já expirou no WhatsApp ou está num formato que não consigo abrir.',
                dica: isAnimated ? 'Tente um trecho mais curto (5 a 10 segundos costuma dar certo).' : 'Reenvie a foto e use a legenda .fig direto nela.',
                prefix
            }));
        }
    }
};