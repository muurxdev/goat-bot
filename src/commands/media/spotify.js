/**
 * Comando .spotify / .sp
 * Download direto de faixas, álbuns e playlists do Spotify em MP3 de alta fidelidade
 */

const fs = require("fs");
const { searchAndDownloadAudio, resolvePlaylistTracks } = require("../../services/audioStreamService");
const { mediaQueue } = require("../../services/mediaQueue");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const { enviarAudio } = require('../../services/media/audioSender');
const { falaDeErro } = require('../../services/media/mediaErrors');
const F = require("../../utils/formato");

const valorReal = v => {
    const t = String(v || "").trim();
    return (!t || t === "—" || t === "00:00" || /^(desconhecido|artista|spotify|youtube|cache)$/i.test(t)) ? "" : t;
};

/**
 * Legenda de uma faixa: título, artista, duração, arquivo, link e próximos passos.
 * Sempre dentro do limite de 1024 caracteres de legenda do WhatsApp.
 */
function legendaFaixa({ prefix = ".", title, author, durationFormatted, url, filePath, posicao = null, uploadDate = null, year = null }) {
    const {
        probeMedia, formatDuration, formatBytes, rotuloTaxa, parseMediaDateAndYear
    } = require("../../services/media/formatResolver");
    const ficheiro = require("../../services/media/fichaDaMidia");
    const probe = filePath ? probeMedia(filePath) : null;
    const titulo = String(title || "").trim().slice(0, 100) || "Sua música";
    const duracao = probe && probe.durationSec > 0 ? formatDuration(probe.durationSec) : valorReal(durationFormatted);
    // Ficha do que chegou: formato, taxa, amostragem, canais e tamanho, medidos
    // no arquivo. Antes só saíam bitrate e tamanho.
    const arquivo = probe ? [
        probe.container || null,
        rotuloTaxa(probe.bitrateKbps),
        formatBytes(probe.sizeBytes)
    ].filter(Boolean).join(" · ") : "";

    // Toda mídia diz o tipo, de onde veio e quando foi postada (pedido do dono, 2026-10-15). A faixa
    // vem do casamento com o YouTube — o arquivo e o link são de lá —, então a origem diz as duas coisas.
    const { formattedDate, year: ano } = parseMediaDateAndYear(uploadDate, year, probe?.tags);
    const dados = [
        posicao ? F.campo("Faixa", posicao) : null,
        F.campo("Tipo", "Áudio"),
        valorReal(ficheiro.limparArtista(author)) ? F.campo("Artista", ficheiro.limparArtista(author)) : null,
        duracao ? F.campo("Duração", duracao) : null,
        arquivo ? F.campo("Arquivo", arquivo) : null,
        (formattedDate || ano) ? F.campo("Publicado em", formattedDate || ano) : null,
        F.campo("Origem", "Spotify (áudio pelo YouTube)")
    ].filter(Boolean);
    const passos = ficheiro.proximosDe({ tipo: "áudio", plataforma: "Spotify", titulo: titulo.slice(0, 60), emLista: Boolean(posicao) });

    const montar = (comProximos) => F.tela({
        emoji: "🎧",
        titulo,
        intro: dados.join("\n"),
        secoes: url ? [String(url)] : [],
        // Na playlist, repetir próximos passos em toda faixa vira ruído (proximosDe devolve [] em lista)
        proximos: comProximos ? passos : [],
        prefix
    });

    let legenda = montar(true);
    if (legenda.length > 1024) legenda = montar(false);
    return legenda.length > 1024 ? legenda.slice(0, 1020) + "…" : legenda;
}

module.exports = {
    name: "spotify",
    aliases: ["sp", "spot", "spotifydl", "spotifyplaylist", "spotifyalbum"],
    category: "media",
    subcategory: "Downloads & Mídia",
    description: "Baixa músicas, álbuns e playlists completas do Spotify em MP3 com capa oficial",
    usage: "<nome da música ou link do Spotify>",
    examples: [
        "Blinding Lights The Weeknd — busco e mando o áudio",
        "https://open.spotify.com/track/... — mando a faixa do link",
        "https://open.spotify.com/playlist/... — mando a playlist (até 25 faixas)"
    ],
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender, prefix = "." }) => {
        const botName = getBotName();
        const rawInput = (text || "").trim();

        if (!rawInput) {
            return reply(F.tela({
                emoji: "🎧",
                titulo: "Baixar do Spotify",
                intro: "Me mande o nome da música ou um link do Spotify e eu entrego o áudio aqui, com a capa.",
                secoes: [
                    { emoji: "✍️", titulo: "Digite assim", linhas: [
                        `• ${F.cmd(prefix, "spotify", "<nome da música>")} — busco e mando o áudio`,
                        `• ${F.cmd(prefix, "spotify", "<link da faixa>")} — mando a faixa do link`,
                        `• ${F.cmd(prefix, "spotify", "<link de playlist ou álbum>")} — mando até 25 faixas, uma por vez`
                    ] },
                    { emoji: "📌", titulo: "Exemplos", linhas: [
                        `• ${F.cmd(prefix, "spotify", "Blinding Lights The Weeknd")}`,
                        `• ${F.cmd(prefix, "spotify", "Evidências Chitãozinho e Xororó")}`
                    ] }
                ],
                dica: "Para copiar o link no app do Spotify: toque nos três pontinhos da música, depois em Compartilhar e Copiar link.",
                proximos: [
                    { nome: "play", args: "<nome da música>", oque: "buscar no YouTube" },
                    { nome: "play", args: "mp4 <nome>", oque: "baixar o clipe em vídeo" }
                ],
                prefix
            }));
        }

        const urlMatch = rawInput.match(/https?:\/\/[^\s"'<>]+/i);
        const cleanUrl = urlMatch ? urlMatch[0].trim() : "";

        // 1. SUPORTE A PLAYLISTS OU ÁLBUNS COMPLETOS
        if (cleanUrl && /open\.spotify\.com\/(playlist|album)/i.test(cleanUrl)) {
            const playlistInfo = await resolvePlaylistTracks(cleanUrl);
            if (playlistInfo && playlistInfo.isPlaylist && playlistInfo.tracks.length > 0) {
                const totalTracks = playlistInfo.tracks.length;
                const limit = Math.min(totalTracks, 25);
                const tipoLista = /album/i.test(playlistInfo.type || "") ? "Álbum" : "Playlist";

                const playlistDoc = F.tela({
                    emoji: "📂",
                    titulo: playlistInfo.title || tipoLista,
                    intro: limit < totalTracks
                        ? `Vou mandar as primeiras *${limit} de ${totalTracks}* faixas, uma de cada vez.`
                        : `Vou mandar as *${totalTracks}* faixas, uma de cada vez.`,
                    secoes: [{ emoji: "📋", titulo: "Sobre", linhas: [
                        F.campo("Tipo", `${tipoLista} do Spotify`),
                        F.campo("Faixas", totalTracks),
                        F.campo("Vou enviar", limit)
                    ] }],
                    dica: "Cada faixa leva alguns segundos. Pode continuar conversando enquanto eu mando.",
                    prefix
                });
                await reply(playlistDoc);
                let enviadas = 0;
                const falhas = [];
                for (let i = 0; i < limit; i++) {
                    const track = playlistInfo.tracks[i];
                    try {
                        const mediaData = await mediaQueue.enqueue({
                            url: track.searchTerm,
                            format: "mp3",
                            user: sender,
                            runFn: () => searchAndDownloadAudio(track.searchTerm)
                        });

                        const caption = legendaFaixa({
                            prefix,
                            filePath: mediaData.filePath,
                            title: mediaData.title,
                            author: mediaData.author,
                            durationFormatted: mediaData.durationFormatted,
                            url: track.url || mediaData.url,
                            posicao: `${i + 1} de ${limit}`,
                            uploadDate: mediaData.uploadDate,
                            year: mediaData.year
                        });

                        if (fs.existsSync(mediaData.filePath)) {
                            try {
                                // Ficha em texto e capa anexada à faixa: uma foto por
                                // faixa deixava a playlist inteira em dobro.
                                await enviarAudio({
                                    client, from, info, caption,
                                    filePath: mediaData.filePath,
                                    fileName: `${mediaData.title.slice(0, 30)}.mp3`,
                                    thumbnail: mediaData.thumbnail, title: mediaData.title, author: mediaData.author, url: track.url || mediaData.url,
                                    preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                                });
                            } finally {
                                try { fs.unlinkSync(mediaData.filePath); } catch (rmErr) { logger.warn(`[SPOTIFY] Não apaguei o áudio temporário ${mediaData.filePath}: ${rmErr.message}`); }
                            }
                            enviadas++;
                        }
                    } catch (tErr) {
                        logger.warn(`[SPOTIFY TRACK WARN] Faixa ${i + 1}: ${tErr.message}`);
                        falhas.push(track.title || track.searchTerm || `faixa ${i + 1}`);
                    }
                }
                logger.info(`[SPOTIFY] Playlist/Álbum para ${sender}: ${enviadas}/${limit} enviadas`);
                return reply(F.tela({
                    emoji: enviadas === limit ? "✅" : "📂",
                    titulo: enviadas === limit ? "Playlist entregue" : "Terminei a playlist",
                    intro: `Mandei *${enviadas} de ${limit}* faixas de *${playlistInfo.title || tipoLista}*.`,
                    secoes: [{
                        emoji: "⚠️",
                        titulo: `Não consegui baixar (${falhas.length})`,
                        linhas: falhas.slice(0, 10).map(f => `• ${String(f).slice(0, 60)}`)
                    }],
                    dica: falhas.length ? "Peça as que faltaram pelo nome, uma por vez." : (limit < totalTracks ? `A lista tem ${totalTracks} faixas; mando no máximo 25 por vez.` : ""),
                    proximos: falhas.length ? [{ nome: "spotify", args: String(falhas[0]).slice(0, 60), oque: "tentar a primeira que faltou" }] : [],
                    prefix
                }));
            }
        }

        // 2. FAIXA SOLO DO SPOTIFY (POR LINK OU BUSCA)
        if (cleanUrl) await require('../../services/media/avisoDownload').avisarDownload({ client, from, info, reply, url: cleanUrl, isAudio: true, tipo: "áudio", plataforma: "Spotify", textoSimples: "⏳ Baixando a faixa do Spotify…", userJid: sender });
        // O aviso diz a plataforma PEDIDA (.spotify → Spotify), não de onde o áudio sai por baixo:
        // a faixa do Spotify é protegida e o arquivo vem do casamento no YouTube.
        else await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: 'áudio', plataforma: 'Spotify' })

        try {
            const mediaData = await mediaQueue.enqueue({
                url: rawInput,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(rawInput)
            });

            const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, "").slice(0, 35);
            const caption = legendaFaixa({
                prefix,
                filePath: mediaData.filePath,
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                uploadDate: mediaData.uploadDate,
                year: mediaData.year
            });

            if (fs.existsSync(mediaData.filePath)) {
                try {
                    // A ficha sai em texto e a capa oficial vai anexada à faixa.
                    await enviarAudio({
                        client, from, info, caption,
                        filePath: mediaData.filePath,
                        fileName: `${cleanFileName}.mp3`,
                        thumbnail: mediaData.thumbnail, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } finally {
                    try { fs.unlinkSync(mediaData.filePath); } catch (rmErr) { logger.warn(`[SPOTIFY] Não apaguei o áudio temporário ${mediaData.filePath}: ${rmErr.message}`); }
                }
            }

            logger.info(`[SPOTIFY] Música enviada para ${sender}: ${mediaData.title}`);
        } catch (err) {
            logger.error("[SPOTIFY ERROR] " + rawInput, err);
            if (/Sign in to confirm|not a bot|Anti-Bot|barrou meu acesso/i.test(String(err?.message || ""))) {
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: "O YouTube não liberou agora",
                    intro: "Encontro as músicas do Spotify e baixo o áudio de outros sites, e um deles, o YouTube, recusou meu pedido por achar que sou um robô. Não tem nada de errado com o que você pediu.",
                    dica: "Espere alguns minutos e tente de novo.",
                    proximos: [{ nome: "spotify", args: rawInput.slice(0, 60), oque: "tentar de novo" }],
                    prefix
                }));
            }
            const semLink = cleanUrl ? "<nome da música>" : rawInput.slice(0, 60);
            return reply([
                falaDeErro(err, { alvo: rawInput }),
                F.proximos(prefix, [
                    { nome: "play", args: semLink, oque: "tentar pelo YouTube" },
                    { nome: "play", args: "search " + semLink, oque: "ver opções e escolher pelo número" }
                ])
            ].join("\n\n"));
        }
    }
};


// Para os testes: o cartão de informações, sem precisar rodar o comando inteiro.
Object.defineProperty(module.exports, "_legenda", { value: legendaFaixa, enumerable: false });
