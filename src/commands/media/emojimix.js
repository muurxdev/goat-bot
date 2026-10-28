/**
 * Comando .emojimix
 * Combina dois emojis em uma imagem ou sticker único usando a API do Google Kitchen
 */

const { criarFigurinha } = require("../../services/mediaService");
const logger = require("../../core/logger");
const { getBotName } = require("../../config/botConfig");
const F = require("../../utils/formato");

module.exports = {
    name: "emojimix",
    aliases: ["mixemoji", "emojikitchen", "mix"],
    category: "media",
    subcategory: "Figurinhas",
    description: "Combina dois emojis em uma figurinha divertida e personalizada",
    usage: "<emoji> <emoji>",
    examples: ["😎 🤠 — mistura os dois numa figurinha", "🐱 🐶 — gato com cachorro"],
    execute: async ({ text, from, client, info, reply, prefix = "." }) => {
        const parts = (text || "").replace(/\s+/g, "").match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu);

        if (!parts || parts.length < 2) {
            return reply(F.tela({
                emoji: "🎨",
                titulo: parts && parts.length === 1 ? "Faltou o segundo emoji" : "Misturar emojis",
                intro: "Mande dois emojis e eu junto os dois numa figurinha só.",
                secoes: [
                    { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "emojimix", "<emoji> <emoji>")] },
                    { emoji: "📝", titulo: "Exemplos", linhas: F.lista([F.cmd(prefix, "emojimix", "😎 🤠"), F.cmd(prefix, "emojimix", "🐱 🐶"), F.cmd(prefix, "emojimix", "🔥 💀")]) }
                ],
                dica: "Nem toda dupla existe: as de rostos e animais costumam funcionar melhor.",
                proximos: [{ nome: "fig", oque: "responda a uma imagem para virar figurinha" }],
                prefix
            }));
        }

        const e1 = parts[0];
        const e2 = parts[1];

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            // Fallback Google Kitchen endpoint
            const kitchenUrl = `https://emojik.vercel.app/s/${encodeURIComponent(e1)}_${encodeURIComponent(e2)}?size=512`;

            const res = await fetch(kitchenUrl, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) {
                throw new Error("Essa combinação de emojis não está disponível no catálogo.");
            }

            const arrayBuffer = await res.arrayBuffer();
            const imgBuffer = Buffer.from(arrayBuffer);

            const stickerBuffer = await criarFigurinha(imgBuffer, false, getBotName(), `EmojiMix ${e1}+${e2}`);

            await client.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: info });
        } catch (err) {
            logger.warn(`[EMOJIMIX] Falha ao misturar ${e1}+${e2}: ${err.message}`);
            return reply(F.tela({
                emoji: "🎨",
                titulo: "Essa mistura não saiu",
                intro: `Não consegui misturar ${e1} com ${e2}. Essa dupla pode não existir no catálogo de misturas.`,
                secoes: [{ emoji: "📝", titulo: "Tente uma destas", linhas: F.lista([F.cmd(prefix, "emojimix", "😎 🤠"), F.cmd(prefix, "emojimix", "🐱 🐶")]) }],
                prefix
            }));
        }
    }
};

