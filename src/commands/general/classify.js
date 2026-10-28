/**
 * Comando .classify / .classificar / .categoriartexto
 * Classifica um texto em categorias
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

function classificarLocal(texto) {
    const t = String(texto || '').trim();
    const limpo = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const cats = [];

    if (/\b(noticia|hoje|governo|brasil|mundo|presidente|ministro|policia|acidente|informa)\b/.test(limpo)) {
        cats.push('📰 Notícia / Atualidades');
    }
    if (/\b(acho|penso|minha opiniao|para mim|acredito|sinto|gosto|adorei)\b/.test(limpo)) {
        cats.push('💬 Opinião / Pessoal');
    }
    if (/\b(const|function|var|let|class|import|def|return|<html|SELECT|WHERE)\b/.test(t) || /\b(codigo|software|node|javascript|python|api|bug|backend)\b/.test(limpo)) {
        cats.push('💻 Tecnologia & Programação');
    }
    if (/\b(estudo|pesquisa|ciencia|cientistas|teoria|dados|universo|quimica|fisica)\b/.test(limpo)) {
        cats.push('🔬 Científico & Acadêmico');
    }
    if (/\b(\d+%|\d+\s*(mil|milhoes|bilhoes)|r\$|\$)\b/.test(limpo)) {
        cats.push('📊 Estatística & Finanças');
    }
    if (!cats.length) {
        cats.push('📝 Geral / Informativo');
    }

    return `*Categorias Identificadas:*\n${cats.map(c => '• ' + c).join('\n')}\n\n*Análise:* O texto apresenta conteúdo classificado principalmente como ${cats[0].replace(/^[^\w]+/g, '').trim().toLowerCase()}.`;
}

module.exports = {
    name: "classify",
    aliases: ["classificar", "categoriartexto", "tagtext"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Classifica um texto em categorias (notícia, opinião, fato, etc)",
    cooldownMs: 4000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para classificar!*\n\n📌 *Exemplo:* `.classify [texto]`");
        }

        try {
            await reply("🔄 *Classificando texto...*");

            const llm = require("../../services/llmService");
            let response = null;

            if (llm.hasProvider()) {
                const prompt = `Classifique o texto abaixo em categorias objetivas (ex: notícia, opinião, informativo, científico, humor, etc) e dê uma breve explicação:\n\n${text}`;
                response = await askAI(prompt);
            }

            if (!response) {
                response = classificarLocal(text);
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║    🏷️ *CLASSIFICAÇÃO* 🏷️    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `╭━〔 📋 CATEGORIAS 〕━⬣\n`;
            doc += `${response}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[CLASSIFY] Erro ao classificar:", err);
            return reply("😕 *Não consegui classificar o texto agora.*\n\nTente de novo em instantes. Se o texto for muito longo, mande um trecho menor.");
        }
    }
};
