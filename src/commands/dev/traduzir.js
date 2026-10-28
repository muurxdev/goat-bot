/**
 * Comando .traduzir / .translate / .tradutor
 * Tradutor universal multilíngue com auto-detecção de idioma e UI elegante
 */

const { traduzirTexto } = require('../../services/apiService');
const { renderCard } = require('../../utils/uiEngine');

module.exports = {
    name: "traduzir",
    aliases: ["tr","translate","traducao","tradutor","trans","cmd_traduzir","alt_traduzir","atalho_traduzir","abrev_traduzir","call_traduzir","func_traduzir"],
    category: "dev",
    description: "Traduz textos para português ou qualquer idioma desejado",
    cooldownMs: 2000,
    execute: async ({ args, text, info, reply, sender }) => {
        let targetLang = "pt";2
        let contentToTranslate = text || "";

        // Se houver mensagem citada, traduz o texto citado
        const quotedText = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                           info?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

        if (quotedText) {
            contentToTranslate = quotedText;
            if (args && args[0] && args[0].length === 2) {
                targetLang = args[0].toLowerCase();
            }
        } else {
            if (args && args[0] && args[0].length === 2 && args.length > 1) {
                targetLang = args[0].toLowerCase();
                contentToTranslate = args.slice(1).join(" ");
            }
        }

        if (!contentToTranslate || !contentToTranslate.trim()) {
            return reply("🌐 *Uso:* `.traduzir <texto>` ou `.traduzir en <texto>` (ou responda a uma mensagem com `.traduzir`)");
        }

        let result = null;

        // Com uma IA configurada, ela traduz melhor: pega gíria, contexto e tom,
        // onde o endpoint literal erra. Sem chave, segue o tradutor de sempre.
        try {
            const llm = require("../../services/llmService");
            if (llm.hasProvider()) {
                const NOMES = { pt: "português do Brasil", en: "inglês", es: "espanhol", fr: "francês", de: "alemão", it: "italiano", ja: "japonês", ko: "coreano", zh: "chinês", ru: "russo", ar: "árabe" };
                const traducao = await llm.traduzir(contentToTranslate, NOMES[targetLang] || targetLang);
                if (traducao) result = { traducao, origem: "IA", idioma: targetLang };
            }
        } catch (e) {
            /* cai no tradutor padrão abaixo */
        }

        if (!result) result = await traduzirTexto(contentToTranslate, targetLang);

        if (!result || !result.traducao) {
            return reply("❌ *Erro ao traduzir texto:* Falha nos provedores de tradução. Tente novamente.");
        }

        const doc = renderCard({
            title: "TRADUTOR MULTILÍNGUE",
            icon: "🌐",
            sections: [
                {
                    title: "TEXTO ORIGINAL",
                    icon: "📝",
                    fields: [contentToTranslate.trim()]
                },
                {
                    title: `TRADUÇÃO (${targetLang.toUpperCase()})`,
                    icon: "✨",
                    fields: [result.traducao.trim()]
                }
            ],
            tip: "Você pode traduzir para outros idiomas usando .traduzir <sigla_idioma> (ex: .traduzir en, .traduzir es, .traduzir ja)",
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};
