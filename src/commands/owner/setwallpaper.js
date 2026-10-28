/**
 * Comando .setwallpaper / .setvideo / .personalizacao
 * Permite aos Donos e Administradores personalizar todos os menus com vídeos (.mp4) ou imagens (.jpg)
 */

const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { saveWallpaper, saveMenuVideo, resetMenuMedia, getAllMenuMediaStatus } = require("../../utils/wallpapers");
const F = require("../../utils/formato");
const axios = require("axios");
const logger = require("../../core/logger");

const NOME_MODO = {
    video: "vídeo (MP4 em alta qualidade)",
    imagem: "imagem fixa (abre na hora, leve)",
    gif: "animação em loop (o WhatsApp pode reduzir a qualidade)"
};

function linhasModos(prefix) {
    return [
        `• ${F.cmd(prefix, "setwallpaper", "modo video")} — vídeo em alta qualidade`,
        `• ${F.cmd(prefix, "setwallpaper", "modo imagem")} — imagem fixa, mais rápida`,
        `• ${F.cmd(prefix, "setwallpaper", "modo gif")} — animação em loop`
    ];
}

/**
 * O nome digitado é de um menu que existe? Aceita apelidos ("eco", "dono") e
 * página ("cassino-2"). Antes qualquer palavra passava: reset/preview/salvar
 * de "rpgg" gravava ou apagava arquivo que nenhum menu lê.
 */
function menuExiste(nome) {
    const { normalizeCategory, CATEGORY_MAP } = require("../../utils/wallpapers");
    const chave = normalizeCategory(nome).replace(/-\d+$/, "");
    const validos = new Set([...getAllMenuMediaStatus().map(m => m.key), ...Object.values(CATEGORY_MAP)]);
    return validos.has(chave);
}

function telaMenuDesconhecido(prefix, nome) {
    return F.tela({
        emoji: "🔎",
        titulo: "Não conheço esse menu",
        intro: `"${String(nome).replace(/`/g, "'")}" não é o nome de nenhum menu. Não mudei nada.`,
        secoes: [{ emoji: "📜", titulo: "Menus que existem", linhas: [getAllMenuMediaStatus().map(m => m.key).join(", ")] }],
        dica: "Use um desses nomes (ex.: rpg, cassino, main) no lugar de <menu>.",
        proximos: [{ nome: "setwallpaper", oque: "ver a situação de cada menu" }],
        prefix
    });
}

module.exports = {
    name: "setwallpaper",
    aliases: ["setvideo", "wallpaper", "mudarwallpaper", "definirwallpaper", "personalizacao", "setmedia", "menumedia", "wallpapers"],
    category: "owner",
    subcategory: "Personalização",
    description: "Troca o vídeo ou a foto de fundo dos menus, um por um ou todos de uma vez",
    usage: "[status | modo <video|imagem|gif> | preview <menu> | reset <menu|all> | <menu> [página]]",
    examples: [
        " — mostra a situação de cada menu e as opções",
        "rpg — responda a uma foto ou vídeo para usar no menu RPG",
        "cassino 2 — define a mídia só da página 2 do menu do cassino",
        "modo imagem — os menus passam a abrir com imagem fixa",
        "reset rpg — volta o menu RPG para a mídia padrão"
    ],
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ text, info, type, reply, args, isOwner, userRole, commandName, client, from, sender, prefix = "." }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 4);
        if (!isUserOwner) {
            return reply(F.tela({
                emoji: "⛔",
                titulo: "Só para donos",
                intro: "Trocar a mídia dos menus é coisa dos donos e administradores gerais, então não posso fazer isso a seu pedido."
            }));
        }

        const quoted = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const isDirectImage = type === "imageMessage";
        const isDirectVideo = type === "videoMessage";
        const isQuotedImage = Boolean(quoted?.imageMessage);
        const isQuotedVideo = Boolean(quoted?.videoMessage);

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. CONFIGURAÇÃO DE MODO DE EXIBIÇÃO (.setwallpaper modo <video|imagem|gif>)
        if (sub === "modo" || sub === "formato" || sub === "mode" || sub === "qualidade") {
            const { getWallpaperMode, setWallpaperMode } = require("../../utils/wallpapers");
            const currentMode = getWallpaperMode(from);
            const targetMode = (args[1] || "").toLowerCase().trim();

            if (!targetMode) {
                return reply(F.tela({
                    emoji: "🎛️",
                    titulo: "Como os menus aparecem",
                    intro: `Hoje os menus abrem com *${NOME_MODO[currentMode] || currentMode}*.`,
                    secoes: [{ emoji: "🔧", titulo: "Para trocar", linhas: linhasModos(prefix) }],
                    dica: "Todos os menus têm versão em vídeo e em imagem, então qualquer modo funciona em todos.",
                    prefix
                }), [sender]);
            }

            const updated = setWallpaperMode(targetMode, "global");
            if (!updated) {
                return reply(F.tela({
                    emoji: "❌",
                    titulo: "Modo não reconhecido",
                    intro: `Não conheço o modo "${targetMode}". Escolha um destes:`,
                    secoes: [{ emoji: "🔧", titulo: "Modos", linhas: linhasModos(prefix) }],
                    prefix
                }));
            }

            return reply(F.tela({
                emoji: "✅",
                titulo: "Modo dos menus trocado",
                intro: `Agora os menus abrem com *${NOME_MODO[updated] || updated}*.`,
                proximos: [{ nome: "menu", oque: "conferir como ficou" }],
                prefix
            }));
        }

        // 2. PREVIEW DE MÍDIA (.setwallpaper preview <categoria> [modo])
        if (sub === "preview" || sub === "ver" || sub === "teste") {
            const targetCat = args[1] || "main";
            if (!menuExiste(targetCat)) return reply(telaMenuDesconhecido(prefix, targetCat));
            const forceMode = args[2] ? args[2].toLowerCase().trim() : null;
            const { getMenuMedia, sendMenuMediaMessage, getWallpaperMode } = require("../../utils/wallpapers");
            const effectiveMode = forceMode || getWallpaperMode(from);
            const media = getMenuMedia(targetCat, effectiveMode === "imagem" ? "image" : "video");

            if (!media || !media.buffer) {
                return reply(F.tela({
                    emoji: "❌",
                    titulo: "Menu sem mídia",
                    intro: `Não achei vídeo nem foto para o menu "${targetCat}". Pode ser um nome que não existe.`,
                    proximos: [
                        { nome: "setwallpaper", oque: "ver os nomes dos menus" },
                        { nome: "setwallpaper", args: "preview main", oque: "ver a prévia do menu principal" }
                    ],
                    prefix
                }));
            }

            const caption = F.tela({
                emoji: "🎬",
                titulo: `Prévia do menu ${targetCat}`,
                secoes: [{ emoji: "📜", titulo: "Detalhes", linhas: [
                    F.campo("Formato", media.type === "video" ? (effectiveMode === "gif" ? "animação em loop" : "vídeo") : "imagem fixa"),
                    F.campo("Tamanho", require("../../utils/tamanho").formatarTamanho(media.buffer.length)),
                    F.campo("Tipo do arquivo", media.mimetype)
                ] }],
                dica: `Troque o formato com ${prefix}setwallpaper modo video, imagem ou gif`
            });

            try {
                return await sendMenuMediaMessage(client, from, {
                    category: targetCat,
                    text: caption,
                    quoted: info,
                    mentions: [sender],
                    mode: effectiveMode
                });
            } catch (err) {
                logger.warn("[SETWALLPAPER] falha ao enviar prévia", { targetCat, effectiveMode, erro: err?.message });
                return reply(F.tela({
                    emoji: "❌",
                    titulo: "Não consegui mandar a prévia",
                    intro: "A mídia existe, mas o envio falhou agora. Tente de novo em instantes.",
                    proximos: [{ nome: "setwallpaper", args: `preview ${targetCat} imagem`, oque: "tentar com a imagem, que é mais leve" }],
                    prefix
                }));
            }
        }

        // 3. LISTAGEM & GUIA GERAL DE PERSONALIZAÇÃO DE TODOS OS MENUS
        if (!isDirectImage && !isDirectVideo && !isQuotedImage && !isQuotedVideo && (!sub || sub === "list" || sub === "listar" || sub === "help" || sub === "status")) {
            const { getWallpaperMode } = require("../../utils/wallpapers");
            const currentMode = getWallpaperMode(from);
            const list = getAllMenuMediaStatus();

            return reply(F.tela({
                emoji: "🎬",
                titulo: "Mídia dos menus",
                intro: `Cada menu abre com um vídeo ou uma foto. Hoje estou usando *${NOME_MODO[currentMode] || currentMode}* em todos.`,
                secoes: [
                    { emoji: "🛠️", titulo: "Como trocar", linhas: [
                        `• Responda a uma foto ou vídeo com ${F.cmd(prefix, "setwallpaper", "<menu>")}`,
                        `• ${F.cmd(prefix, "setwallpaper", "<menu> 2")} — só a página 2 daquele menu`,
                        `• ${F.cmd(prefix, "setwallpaper", "all")} — a mesma mídia em todos os menus`,
                        `• ${F.cmd(prefix, "setwallpaper", "preview <menu>")} — manda uma prévia`,
                        `• ${F.cmd(prefix, "setwallpaper", "reset <menu|all>")} — volta ao padrão`,
                        `• ${F.cmd(prefix, "setwallpaper", "modo <video|imagem|gif>")} — muda o formato`
                    ] },
                    { emoji: "📊", titulo: `Situação dos ${list.length} menus`, linhas: [
                        ["🎞️ Vídeo e foto", list.filter(m => m.hasVideo && m.hasImage)],
                        ["🎬 Só vídeo", list.filter(m => m.hasVideo && !m.hasImage)],
                        ["🖼️ Só foto", list.filter(m => !m.hasVideo && m.hasImage)],
                        ["📌 Mídia padrão", list.filter(m => !m.hasVideo && !m.hasImage)]
                    ].filter(([, ms]) => ms.length).map(([rotulo, ms]) => `*${rotulo} (${ms.length}):* ${ms.map(m => m.key).join(", ")}`) }
                ],
                dica: "Use um desses nomes (ex.: rpg, cassino, main) no lugar de <menu>.",
                prefix
            }), [sender]);
        }

        // 3. RESET DE MÍDIA (.setwallpaper reset <categoria>)
        if (sub === "reset" || sub === "padrao" || sub === "restaurar") {
            const targetCat = args[1] || "main";
            if (targetCat === "all" || targetCat === "todos") {
                const list = getAllMenuMediaStatus();
                list.forEach(m => resetMenuMedia(m.key));
                return reply(F.tela({
                    emoji: "🔄",
                    titulo: "Todos os menus voltaram ao padrão",
                    intro: `Restaurei a mídia original de Saga Épica nos ${list.length} menus.`,
                    proximos: [{ nome: "menu", oque: "conferir como ficou" }],
                    prefix
                }));
            }

            if (!menuExiste(targetCat)) return reply(telaMenuDesconhecido(prefix, targetCat));
            resetMenuMedia(targetCat);
            return reply(F.tela({
                emoji: "🔄",
                titulo: "Menu voltou ao padrão",
                intro: `O menu *${targetCat}* voltou a usar a mídia original de Saga Épica.`,
                proximos: [{ nome: "setwallpaper", args: `preview ${targetCat}`, oque: "ver a prévia" }],
                prefix
            }));
        }

        // 4. EXTRAÇÃO E SALVAMENTO DE MÍDIA (FOTO OU VÍDEO)
        // Página opcional: ".setwallpaper cassino 2" grava a variante "cassino-2",
        // usada pelo MENU 2 daquela categoria. Sem número, grava a da categoria
        // (que continua servindo de fallback para toda página sem variante).
        const categoriaBase = (sub || "main").toLowerCase().trim();
        const paginaArg = /^\d{1,2}$/.test(String(args[1] || "").trim()) ? String(args[1]).trim() : null;
        const categoria = (paginaArg && Number(paginaArg) > 1) ? `${categoriaBase}-${paginaArg}` : categoriaBase;
        const isVideoMedia = isDirectVideo || isQuotedVideo;

        if (categoriaBase !== "all" && categoriaBase !== "todos" && !menuExiste(categoriaBase)) {
            return reply(telaMenuDesconhecido(prefix, categoriaBase));
        }

        const mediaMsg = isDirectImage ? info?.message?.imageMessage :
                        (isDirectVideo ? info?.message?.videoMessage :
                        (isQuotedImage ? quoted?.imageMessage :
                        (isQuotedVideo ? quoted?.videoMessage : null)));

        if (!mediaMsg && args[1] && (args[1].startsWith("http://") || args[1].startsWith("https://"))) {
            // Download via URL direta
            try {
                await reply(`⏳ Baixando a mídia do link para o menu *${categoria}*...`);
                const res = await axios.get(args[1], { responseType: "arraybuffer", timeout: 20000 });
                const buf = Buffer.from(res.data);
                const isUrlVideo = args[1].includes(".mp4") || res.headers["content-type"]?.includes("video");

                if (isUrlVideo) {
                    await saveMenuVideo(categoria, buf);
                } else {
                    await saveWallpaper(categoria, buf);
                }
                return reply(F.tela({
                    emoji: isUrlVideo ? "🎬" : "🖼️",
                    titulo: isUrlVideo ? "Vídeo do menu trocado" : "Foto do menu trocada",
                    intro: `O menu *${categoria}* agora abre com ${isUrlVideo ? "o vídeo" : "a foto"} do link.`,
                    proximos: [{ nome: "setwallpaper", args: `preview ${categoria}`, oque: "ver a prévia" }],
                    prefix
                }));
            } catch (err) {
                logger.warn("[SETWALLPAPER] falha ao baixar mídia do link", { categoria, url: args[1], erro: err?.message });
                return reply(F.tela({
                    emoji: "❌",
                    titulo: "Não consegui baixar do link",
                    intro: "O link não respondeu ou não é uma foto/vídeo direto. Confira se ele abre sozinho no navegador, ou mande a mídia aqui e responda a ela com o comando.",
                    proximos: [{ nome: "setwallpaper", args: categoriaBase, oque: "responda a uma foto ou vídeo com isto" }],
                    prefix
                }));
            }
        }

        if (!mediaMsg) {
            return reply(F.tela({
                emoji: "🖼️",
                titulo: "Falta a foto ou o vídeo",
                intro: `Para trocar a mídia do menu *${categoriaBase}*, responda a uma foto ou vídeo com o comando (ou envie a mídia com o comando na legenda).`,
                secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [
                    `• ${F.cmd(prefix, "setwallpaper", categoriaBase)} — respondendo à mídia`,
                    `• ${F.cmd(prefix, "setwallpaper", `${categoriaBase} 2`)} — só a página 2 desse menu`,
                    `• ${F.cmd(prefix, "setwallpaper", `${categoriaBase} https://site.com/video.mp4`)} — direto de um link`
                ] }],
                proximos: [{ nome: "setwallpaper", oque: "ver os nomes de todos os menus" }],
                prefix
            }));
        }

        try {
            const mediaType = isVideoMedia ? "video" : "image";
            await reply(`⏳ Preparando ${isVideoMedia ? "o vídeo" : "a imagem"} para o menu *${categoria}*...`);

            const stream = await downloadContentFromMessage(mediaMsg, mediaType);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const allCats = getAllMenuMediaStatus().map(m => m.key);

            if (categoria === "all" || categoria === "todos") {
                for (const cat of allCats) {
                    if (isVideoMedia) {
                        await saveMenuVideo(cat, buffer);
                    } else {
                        await saveWallpaper(cat, buffer);
                    }
                }
                return reply(F.tela({
                    emoji: "🎉",
                    titulo: isVideoMedia ? "Vídeo aplicado em todos os menus" : "Foto aplicada em todos os menus",
                    intro: `Os ${allCats.length} menus agora abrem com ${isVideoMedia ? "esse vídeo" : "essa foto"}.`,
                    proximos: [{ nome: "menu", oque: "conferir como ficou" }],
                    prefix
                }));
            }

            if (isVideoMedia) {
                await saveMenuVideo(categoria, buffer);
            } else {
                await saveWallpaper(categoria, buffer);
            }
            return reply(F.tela({
                emoji: isVideoMedia ? "🎬" : "🖼️",
                titulo: isVideoMedia ? "Vídeo do menu trocado" : "Foto do menu trocada",
                intro: `O menu *${categoria}* agora abre com ${isVideoMedia ? "esse vídeo, tocando em loop" : "essa foto"}.`,
                proximos: [
                    { nome: "menu", args: categoriaBase, oque: "abrir o menu" },
                    isVideoMedia ? { nome: "setwallpaper", args: `preview ${categoria}`, oque: "ver a prévia" } : null
                ].filter(Boolean),
                prefix
            }));
        } catch (err) {
            logger.error("[SETWALLPAPER ERROR]", { categoria, erro: err?.message, stack: err?.stack });
            return reply(F.tela({
                emoji: "❌",
                titulo: "Não consegui salvar a mídia",
                intro: "Baixar ou guardar o arquivo falhou. Tente de novo; se a mídia for muito grande, mande uma versão menor.",
                prefix
            }));
        }
    }
};
