/**
 * Comando .analisartexto — Estatísticas e Análise Linguística Avançada de Texto (NLP + IA)
 */
const { analisarTexto } = require("../../services/aiService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "analisartexto",
    aliases: [
        "analisetexto", "textinfo", "analisar", "nlp", "iaresumo",
        "cmd_analisartexto", "alt_analisartexto", "atalho_analisartexto", "abrev_analisartexto"
    ],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Análise profunda de texto: estatísticas, contagem, tempo de leitura, sentimento e termos frequentes",
    cooldownMs: 2500,
    execute: async ({ text, quotedText, reply, prefix }) => {
        const p = prefix || ".";
        const botName = getBotName();
        const t = String(text || quotedText || '').trim();

        if (!t) {
            return reply(
                `📊 *COMO USAR O ANALISADOR DE TEXTO:*\n\n` +
                `• Digite: \`${p}analisartexto <seu texto aqui>\`\n` +
                `• Ou responda a qualquer mensagem no grupo/PV com \`${p}analisartexto\`!\n\n` +
                `O bot calcula palavras, caracteres, tempo de leitura, sentimento e tópicos principais.`
            );
        }

        const info = analisarTexto(t);
        if (!info) {
            return reply("❌ Não foi possível extrair dados desse texto.");
        }

        let card = `╔══════════════════════════════╗\n`;
        card += `║    📊 *ANÁLISE DE TEXTO & NLP* 📊   ║\n`;
        card += `╚══════════════════════════════╝\n\n`;

        card += `╭━〔 📝 MÉTRICAS E ESTRUTURA 〕━⬣\n`;
        card += `┃ 📝 *Total de Palavras:* ${info.palavras}\n`;
        card += `┃ 🔤 *Caracteres:* ${info.totalChars} (${info.charsSemEspaco} sem espaços)\n`;
        card += `┃ 📃 *Frases:* ${info.frases} | *Linhas:* ${info.linhas}\n`;
        card += `┃ 📏 *Média por Palavra:* ${info.mediaLetras} letras\n`;
        card += `┃ ⏱️ *Tempo Estimado de Leitura:* ~${info.tempoLeituraMin} min\n`;
        card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        card += `╭━〔 🧠 TONALIDADE & SENTIMENTO 〕━⬣\n`;
        card += `┃ 🎭 *Sentimento Dominante:* ${info.sentimento}\n`;
        card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        if (info.topPalavras && info.topPalavras.length > 0) {
            card += `╭━〔 🔝 TERMOS MAIS RELEVANTES 〕━⬣\n`;
            card += `┃ ${info.topPalavras.join(' • ')}\n`;
            card += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        }

        card += `👑 *${botName}*`;

        return reply(card);
    }
};
