/**
 * Comando .figurinhaevento
 * O dono cadastra as figurinhas que acompanham banimento, promoção, boas-vindas
 * e outros eventos, respondendo a uma figurinha, imagem ou GIF.
 */

const figurinhaEventoService = require('../../services/figurinhaEventoService');
const { downloadWhatsAppMedia, criarFigurinha } = require('../../services/mediaService');
const { addExif } = require('../../utils/stickerUtils');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

const AUTOR_PACOTE = 'GOAT';
const TIPOS = ['stickerMessage', 'imageMessage', 'videoMessage'];

/** A mídia da própria mensagem ou da mensagem respondida. */
function acharMidia(info, type, from) {
    if (TIPOS.includes(type)) return { tipo: type, wrapper: info };
    const ctx = info?.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const tipo = TIPOS.find(t => quoted?.[t]);
    if (!tipo) return null;
    return {
        tipo,
        wrapper: { key: { remoteJid: from, id: ctx.stanzaId, participant: ctx.participant }, message: quoted }
    };
}

module.exports = {
    name: 'figurinhaevento',
    aliases: ['figevento', 'setfigurinha', 'figurinhasbot'],
    category: 'owner',
    subcategory: 'Personalização',
    description: 'Cadastra as figurinhas que acompanham banimento, promoção, boas-vindas e outros eventos',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ info, type, from, client, reply, args = [], prefix = '.' }) => {
        const { EVENTOS, MAX_POR_EVENTO } = figurinhaEventoService;

        if (!args[0]) {
            const linhas = figurinhaEventoService.contagem().map(c =>
                `${c.emoji} *${c.rotulo}* (\`${c.evento}\`): ${c.total ? `${c.total} ${c.total === 1 ? 'figurinha' : 'figurinhas'}` : 'nenhuma ainda'}`);
            return reply(
                `🎴 *Figurinhas dos eventos*\n\n${linhas.join('\n')}\n\n` +
                `Para cadastrar, responda a uma figurinha, imagem ou GIF com \`${prefix}figurinhaevento <evento>\`.\n` +
                `• \`${prefix}figurinhaevento banimento ver\` — mando uma de exemplo\n` +
                `• \`${prefix}figurinhaevento banimento limpar\` — apago as desse evento\n\n` +
                `Cada grupo pode desligar com \`${prefix}figurinhasgrupo off\`.`
            );
        }

        const evento = figurinhaEventoService.resolverEvento(args[0]);
        if (!evento) {
            return reply(`❓ Não conheço o evento *${args[0]}*. Os eventos são: ${Object.keys(EVENTOS).map(e => `\`${e}\``).join(', ')}.`);
        }
        const { rotulo } = EVENTOS[evento];
        const acao = (args[1] || '').toLowerCase();

        if (['ver', 'exemplo', 'preview'].includes(acao)) {
            const enviou = await figurinhaEventoService.enviar(client, from, evento, { forcar: true });
            if (!enviou) return reply(`🎴 Ainda não há figurinha de *${rotulo}*.`);
            return;
        }

        if (['limpar', 'apagar', 'reset'].includes(acao)) {
            const n = figurinhaEventoService.limpar(evento);
            return reply(n
                ? `🗑️ Apaguei ${n} ${n === 1 ? 'figurinha' : 'figurinhas'} de *${rotulo}*.`
                : `🎴 *${rotulo}* não tinha nenhuma figurinha.`);
        }

        const midia = acharMidia(info, type, from);
        if (!midia) {
            return reply(`❓ Responda a uma figurinha, imagem ou GIF com \`${prefix}figurinhaevento ${evento}\`.`);
        }

        const node = midia.wrapper.message?.[midia.tipo];
        if (midia.tipo === 'videoMessage' && node?.seconds > 8) {
            return reply('⚠️ Para figurinha animada, use um vídeo ou GIF de até 8 segundos.');
        }

        try {
            const mediaType = midia.tipo === 'stickerMessage' ? 'sticker' : midia.tipo === 'videoMessage' ? 'video' : 'image';
            const buffer = await downloadWhatsAppMedia(midia.wrapper, mediaType, client);
            const webp = midia.tipo === 'stickerMessage'
                ? await addExif(buffer, getBotName(), AUTOR_PACOTE)
                : await criarFigurinha(buffer, midia.tipo === 'videoMessage', getBotName(), AUTOR_PACOTE);

            const r = figurinhaEventoService.salvar(evento, webp);
            if (!r.ok) {
                return reply(r.motivo === 'repetida'
                    ? '🎴 Essa figurinha já está cadastrada nesse evento.'
                    : `⚠️ *${rotulo}* já tem ${MAX_POR_EVENTO} figurinhas. Apague com \`${prefix}figurinhaevento ${evento} limpar\` antes de cadastrar mais.`);
            }

            logger.info(`[FIGURINHA EVENTO] Nova figurinha em ${evento} (total ${r.total})`);
            return reply(`✅ Figurinha cadastrada em *${rotulo}*. Agora são ${r.total}, e eu sorteio uma a cada evento.`);
        } catch (err) {
            logger.error(`[FIGURINHA EVENTO] Falha ao cadastrar figurinha em ${evento}:`, err);
            return reply('❌ Não consegui usar essa mídia. Tente com outra figurinha ou imagem.');
        }
    }
};
