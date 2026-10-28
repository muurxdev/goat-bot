/**
 * Comando .comparar / .compare / .comparartexto
 * Compara dois textos e mostra semelhanças e diferenças
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

function compararLocal(t1, t2) {
    const len1 = t1.length;
    const len2 = t2.length;
    const words1 = t1.split(/\s+/).filter(Boolean);
    const words2 = t2.split(/\s+/).filter(Boolean);

    const w1Set = new Set(words1.map(w => w.toLowerCase().replace(/[^\wÀ-ÿ]/g, '')));
    const w2Set = new Set(words2.map(w => w.toLowerCase().replace(/[^\wÀ-ÿ]/g, '')));
    const emComum = [...w1Set].filter(w => w2Set.has(w) && w.length > 3);

    let rel = '';
    if (Math.abs(len1 - len2) < 20) {
        rel = 'Ambos os textos possuem extensão e densidade de palavras muito semelhantes.';
    } else if (len1 > len2) {
        rel = `O Texto 1 é mais extenso e detalhado (${words1.length} palavras vs ${words2.length} palavras no Texto 2).`;
    } else {
        rel = `O Texto 2 é mais extenso e detalhado (${words2.length} palavras vs ${words1.length} palavras no Texto 1).`;
    }

    let out = `📌 *Comparativo de Volume:*\n• Texto 1: ${words1.length} palavras (${len1} caracteres)\n• Texto 2: ${words2.length} palavras (${len2} caracteres)\n\n`;
    out += `🔍 *Observações:*\n${rel}`;
    if (emComum.length > 0) {
        out += `\n\n🔗 *Conceitos em comum:* ${emComum.slice(0, 8).join(', ')}`;
    }
    return out;
}

module.exports = {
    name: "comparartexto",
    aliases: ["diftexto", "diferencas"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Compara dois textos e mostra semelhanças e diferenças",
    usage: "<texto 1> | <texto 2>",
    examples: ["Prefiro café | Gosto de chá — semelhanças e diferenças explicadas"],
    cooldownMs: 4000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text || !text.includes("|")) {
            return reply("⚖️ *Comparar textos*\n\n" +
                "Eu comparo dois textos e explico as semelhanças, as diferenças e uma conclusão.\n\n" +
                "✍️ *Digite assim*\n" +
                "• `.comparartexto texto 1 | texto 2`\n" +
                "• `.comparartexto Prefiro café pela manhã | Gosto de chá à tarde`\n\n" +
                "💡 _A barra | separa um texto do outro._\n\n" +
                "👉 *Próximos passos*\n" +
                "• `.compararetextos texto 1 | texto 2` — só a porcentagem de semelhança");
        }

        const [text1, text2] = text.split("|").map(t => t.trim());

        if (!text1 || !text2) {
            return reply("❌ *Falta um dos textos*\n\nEscreva um texto antes e outro depois da barra |.\n\n📌 *Exemplo:* `.comparartexto Prefiro café | Gosto de chá`");
        }

        try {
            await reply("🔄 *Comparando textos...*");

            const llm = require("../../services/llmService");
            let response = null;

            if (llm.hasProvider()) {
                const prompt = `Compare os dois textos abaixo. Mostre semelhanças, diferenças e uma conclusão prática:\n\nTexto 1: ${text1}\n\nTexto 2: ${text2}`;
                response = await askAI(prompt);
            }

            if (!response) {
                response = compararLocal(text1, text2);
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║     🔄 *COMPARAÇÃO* 🔄     ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `╭━〔 📊 ANÁLISE 〕━⬣\n`;
            doc += `${String(response).split('\n').map(l => '┃ ' + l).join('\n')}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[COMPARAR] Erro ao comparar:", err);
            return reply("😕 *Não consegui comparar os textos agora.*\n\nTente de novo em instantes.");
        }
    }
};
