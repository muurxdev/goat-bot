/**
 * Comando .soundcloud / .sc
 * Download de faixas e áudios do SoundCloud em MP3 de alta fidelidade
 */

const fs = require("fs");
const { searchAndDownloadAudio } = require("../../services/audioStreamService");
const { mediaQueue } = require("../../services/mediaQueue");
const { formatMediaCaption, calcularTempoComando } = require("../../services/media/formatResolver");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const { enviarAudio } = require('../../services/media/audioSender');
const { falaDeErro } = require('../../services/media/mediaErrors');

module.exports = {
    name: "soundcloud",
    aliases: ["sc", "sound", "soundcloudmusic", "scdl"],
    category: "media",
    description: "Baixa músicas e sets do SoundCloud",
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender }) => {
        const inicioDownload = Date.now();
        const botName = getBotName();
        const rawInput = (text || "").trim();

        if (!rawInput) {
            let doc = "🎧 *Como baixar do SoundCloud*\n";
            doc += "• `.soundcloud <nome da música>` — busco e mando o áudio\n";
            doc += "• `.soundcloud <link>` — mando a faixa do link\n\n";
            doc += "Exemplo: `.soundcloud Alan Walker Faded`";
            return reply(doc);
        }

        // Link: aviso com plataforma e tipo. Nome: avisa que está buscando.
        if (/^https?:\/\//i.test(rawInput)) await require('../../services/media/avisoDownload').avisarDownload({ client, from, info, reply, url: rawInput, isAudio: true, tipo: "áudio", plataforma: "SoundCloud", textoSimples: "⏳ Baixando do SoundCloud…", userJid: sender });
        else await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: 'áudio', plataforma: "SoundCloud" })

        try {
            const mediaData = await mediaQueue.enqueue({
                url: rawInput,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(rawInput)
            });

            const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, "").slice(0, 35);
            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: calcularTempoComando(info, inicioDownload),
                platform: "SoundCloud",
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                uploadDate: mediaData.uploadDate,
                year: mediaData.year,
                isAudio: true
            });

            if (fs.existsSync(mediaData.filePath)) {
                try {
                    // A capa vai anexada ao áudio, não como foto antes dele.
                    await enviarAudio({
                        client, from, info, caption,
                        filePath: mediaData.filePath,
                        fileName: `${cleanFileName}.mp3`,
                        thumbnail: mediaData.thumbnail, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } finally {
                    try { fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[SOUNDCLOUD] Falha ignorada em src/commands/media/soundcloud.js:70: ${errIgnorado.message}`) }
                }
            }

            logger.info(`[SOUNDCLOUD] Áudio enviado para ${sender}: ${mediaData.title}`);
        } catch (err) {
            logger.error("[SOUNDCLOUD ERROR] " + rawInput, err);
            return reply(falaDeErro(err, { alvo: rawInput }));
        }
    }
};

