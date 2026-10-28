/**
 * Comando .paraphrase / .parafrasear / .reescrever
 * Parafraseia um texto de forma fluida e diferente
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

function parafrasearLocal(texto) {
    let t = String(texto || '').trim();
    const substituicoes = [
        [/\balém disso\b/gi, 'outrossim'],
        [/\bporém\b/gi, 'no entanto'],
        [/\bcontudo\b/gi, 'todavia'],
        [/\bportanto\b/gi, 'dessa forma'],
        [/\butiliza\b/gi, 'faz uso de'],
        [/\bpermite\b/gi, 'possibilita'],
        [/\bcom muita atenção\b/gi, 'de forma atenta e minuciosa'],
        [/\brapidamente\b/gi, 'com agilidade'],
        [/\bimportante\b/gi, 'essencial'],
        [/\bmuito bom\b/gi, 'excelente'],
        [/\bgrande\b/gi, 'expressivo'],
        [/\bcom certeza\b/gi, 'indubitavelmente']
    ];

    for (const [re, sub] of substituicoes) {
        t = t.replace(re, sub);
    }
    return t;
}

module.exports = {
    name: "paraphrase",
    aliases: ["parafrasear", "reescrever", "reescrver", "reformular"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Parafraseia um texto mantendo o sentido de forma diferente",
    cooldownMs: 4000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para parafrasear!*\n\n📌 *Exemplo:* `.paraphrase [texto]`");
        }

        try {
            await reply("🔄 *Parafraseando...*");

            const llm = require("../../services/llmService");
            let response = null;

            if (llm.hasProvider()) {
                const prompt = `Reescreva o texto abaixo de forma natural, diferente e fluida, mantendo exatamente o mesmo sentido original:\n\n${text}`;
                response = await askAI(prompt);
            }

            if (!response) {
                response = parafrasearLocal(text);
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║    🔄 *PARAFRASEADO* 🔄    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `╭━〔 ✨ NOVO TEXTO 〕━⬣\n`;
            doc += `${response}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[PARAPHRASE] Erro ao parafrasear:", err);
            return reply("😕 *Não consegui reescrever o texto agora.*\n\nTente de novo em instantes.");
        }
    }
};
