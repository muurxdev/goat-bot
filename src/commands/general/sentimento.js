/**
 * Comando .sentimento / .sentiment / .analisarsentimento
 * Analisa o sentimento de um texto
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

const PALAVRAS_POSITIVAS = [
    'incrivel', 'excelente', 'maravilhoso', 'otimo', 'bom', 'boa', 'feliz', 'alegria',
    'adorei', 'amei', 'sucesso', 'parabens', 'top', 'perfeito', 'ganhei', 'vitoria',
    'positivo', 'amor', 'melhor', 'legal', 'massa', 'show', 'bater', 'consegui', 'meta'
]
const PALAVRAS_NEGATIVAS = [
    'pessimo', 'ruim', 'triste', 'chateado', 'odeio', 'odiei', 'falha', 'defeito',
    'problema', 'raiva', 'odio', 'horrivel', 'droga', 'perdi', 'derrota', 'negativo',
    'dor', 'lamentavel', 'horrendo', 'lixo', 'bosta', 'merda', 'decepcionado', 'pior'
]

function analisarSentimentoLocal(texto) {
    const limpo = String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const palavras = limpo.split(/\W+/).filter(Boolean)
    let scorePos = 0
    let scoreNeg = 0

    for (const p of palavras) {
        if (PALAVRAS_POSITIVAS.includes(p)) scorePos++
        if (PALAVRAS_NEGATIVAS.includes(p)) scoreNeg++
    }

    if (scorePos > scoreNeg) {
        return '😊 *Positivo*\n\nO texto transmite um tom animado, otimista e positivo, demonstrando entusiasmo ou satisfação.'
    } else if (scoreNeg > scorePos) {
        return '😔 *Negativo*\n\nO texto expressa insatisfação, queixa ou desconforto em relação ao que foi abordado.'
    } else {
        return '😐 *Neutro*\n\nO texto mantém um tom informativo e descritivo equilibrado, sem forte carga emocional.'
    }
}

module.exports = {
    name: "sentimento",
    aliases: ["sentiment", "analisarsentimento", "emoçao"],
    category: "general",
    // Resposta de IA: explicar "API" ou "servidor" é o conteúdo, não jargão a traduzir.
    loreExempt: true,
    subcategory: "IA & Pesquisa",
    description: "Analisa o sentimento de um texto (positivo, negativo, neutro)",
    cooldownMs: 4000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para analisar!*\n\n📌 *Exemplo:* `.sentimento [texto]`");
        }

        try {
            await reply("🔄 *Analisando sentimento...*");

            const llm = require("../../services/llmService");
            let response = null;

            if (llm.hasProvider()) {
                const prompt = `Analise o tom e o sentimento do texto abaixo. Responda com um emoji e a classificação (positivo/negativo/neutro), seguido de uma breve explicação amigável em português:\n\nTexto: ${text}`;
                response = await askAI(prompt);
            }

            if (!response) {
                response = analisarSentimentoLocal(text);
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║ 💭 *ANÁLISE DE SENTIMENTO* 💭 ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `╭━〔 🎭 RESULTADO 〕━⬣\n`;
            doc += `${response}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[SENTIMENTO] Erro ao analisar:", err);
            return reply("😕 *Não consegui analisar o tom do texto agora.*\n\nTente de novo em instantes.");
        }
    }
};
