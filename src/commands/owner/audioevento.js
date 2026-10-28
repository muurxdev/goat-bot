/**
 * Comando .audioevento
 * O dono cadastra as notas de voz que acompanham banimento, promoção,
 * boas-vindas e outros eventos, respondendo a um áudio.
 *
 * Cada evento já vem com uma frase padrão gravada em voz sintética comum. Ela
 * não imita o dublador do anime de propósito — clonar a voz de uma pessoa real
 * sem autorização não é algo que se ponha num bot de grupo.
 */

const audioEventoService = require('../../services/audioEventoService');
const figurinhaEventoService = require('../../services/figurinhaEventoService');
const { downloadWhatsAppMedia } = require('../../services/mediaService');
const logger = require('../../core/logger');

const TIPOS = ['audioMessage', 'videoMessage'];

function acharAudio(info, type, from) {
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
    name: 'audioevento',
    aliases: ['audevento', 'setaudio', 'audiosbot'],
    category: 'owner',
    subcategory: 'Personalização',
    description: 'Cadastra as notas de voz que acompanham banimento, promoção, boas-vindas e outros eventos',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ info, type, from, client, reply, args = [], prefix = '.' }) => {
        const { EVENTOS } = figurinhaEventoService;

        if (!args[0]) {
            const linhas = audioEventoService.contagem().map(c =>
                `${c.emoji} *${c.rotulo}* (\`${c.evento}\`): ${c.total} ${c.total === 1 ? 'áudio' : 'áudios'}`);
            return reply(
                `🔊 *Áudios dos eventos*\n\n${linhas.join('\n')}\n\n` +
                `Cada evento já tem uma frase minha gravada. Para trocar, responda a um áudio com \`${prefix}audioevento <evento>\`.\n` +
                `• \`${prefix}audioevento banimento ouvir\` — mando um de exemplo\n` +
                `• \`${prefix}audioevento banimento limpar\` — apago os que você gravou\n\n` +
                `Os áudios vêm *desligados*. Cada grupo liga com \`${prefix}audiosgrupo on\`.`
            );
        }

        const evento = figurinhaEventoService.resolverEvento(args[0]);
        if (!evento) {
            return reply(`❓ Não conheço o evento *${args[0]}*. Os eventos são: ${Object.keys(EVENTOS).map(e => `\`${e}\``).join(', ')}.`);
        }
        const { rotulo } = EVENTOS[evento];
        const acao = (args[1] || '').toLowerCase();

        if (['ouvir', 'ver', 'exemplo', 'preview'].includes(acao)) {
            const enviou = await audioEventoService.enviar(client, from, evento, { forcar: true });
            if (!enviou) return reply(`🔊 Ainda não há áudio de *${rotulo}*.`);
            return;
        }

        if (['limpar', 'apagar', 'reset'].includes(acao)) {
            const n = audioEventoService.limpar(evento);
            return reply(n
                ? `🗑️ Apaguei ${n} ${n === 1 ? 'áudio gravado' : 'áudios gravados'} de *${rotulo}*. A frase padrão continua.`
                : `🔊 *${rotulo}* só tem a frase padrão.`);
        }

        const midia = acharAudio(info, type, from);
        if (!midia) {
            return reply(`❓ Responda a um áudio ou nota de voz com \`${prefix}audioevento ${evento}\`.`);
        }

        const node = midia.wrapper.message?.[midia.tipo];
        if (node?.seconds > 12) {
            return reply('⚠️ Use um áudio de até 12 segundos: é um aviso curto, não um recado.');
        }

        try {
            const buffer = await downloadWhatsAppMedia(midia.wrapper, midia.tipo === 'videoMessage' ? 'video' : 'audio', client);
            const r = audioEventoService.salvar(evento, buffer, 'mp3');
            if (!r.ok) {
                return reply(r.motivo === 'repetido'
                    ? '🔊 Esse áudio já está cadastrado nesse evento.'
                    : `⚠️ *${rotulo}* já tem ${audioEventoService.MAX_POR_EVENTO} áudios. Apague com \`${prefix}audioevento ${evento} limpar\`.`);
            }

            logger.info(`[AUDIO EVENTO] Novo áudio em ${evento} (total ${r.total})`);
            return reply(`✅ Áudio cadastrado em *${rotulo}*. Agora são ${r.total}, e eu sorteio um a cada evento.`);
        } catch (err) {
            logger.error(`[AUDIO EVENTO] Falha ao cadastrar áudio em ${evento}:`, err);
            return reply('❌ Não consegui usar esse áudio. Tente com outro, mais curto.');
        }
    }
};
