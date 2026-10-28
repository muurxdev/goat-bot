/**
 * Comando .machine / .ml / .machinelearning / .chatgpt
 * Painel de Inteligência Artificial, Machine Learning, Treinamento e Conversação 24h
 */

const aiLearning = require("../../services/aiLearningService");
const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "machine",
    aliases: [
        "mlearning", "ml", "machinelearning", "aprendizado", "ialearning", "chatgpt",
        "aprender", "treinamentoia", "roaming", "meuestilo", "perfilia", "mlstatus", "profanitylearning",
        "cmd_machine", "alt_machine", "atalho_machine", "abrev_machine", "call_machine", "func_machine"
    ],
    category: "general",
    subcategory: "Inteligência Artificial",
    description: "Painel de Machine Learning, perfil linguístico, treinamento autônomo e modo ChatGPT 24h",
    groupOnly: false,
    adminOnly: false,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, isGroup, prefix, contextInfo }) => {
        const p = prefix || ".";
        const botName = getBotName();
        const sub = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        // 1. Alternar Modo Conversacional Estilo ChatGPT (.machine on / .machine off)
        if (sub === "on" || sub === "off" || sub === "chat" || sub === "chatgpt" || sub === "conversa" || sub === "ativar" || sub === "desativar") {
            const isEnable = ["on", "1", "ativar", "sim"].includes(sub === "on" || sub === "ativar" ? "on" : param);
            const isDisable = ["off", "0", "desativar", "nao"].includes(sub === "off" || sub === "desativar" ? "off" : param);

            if (isEnable || isDisable) {
                configs[from].conversaNatural = isEnable;
                await dataService.saveConfigsData(configs);
                return reply(
                    `🤖 *MODO CHATGPT CONVERSACIONAL:* ${isEnable ? "🟢 *ATIVADO 24H*" : "🔴 *DESATIVADO*"}\n\n` +
                    (isEnable
                        ? `Agora você pode enviar mensagens normalmente sem prefixo \`${p}\`, e o bot responderá adaptando-se ao seu estilo de conversa e aprendizado!`
                        : `O bot responderá apenas a comandos oficiais iniciados com o prefixo \`${p}\`.`)
                );
            }
        }

        // 2. Subcomando TRAIN / TREINAR (.machine train <termo>)
        if (sub === "train" || sub === "treinar" || sub === "aprender" || sub === "add") {
            const termo = args.slice(1).join(" ").trim();
            if (!termo) {
                return reply(`❌ *Como treinar o bot:*\n\`${p}machine train <palavra ou expressão>\`\n\n📌 Exemplo: \`${p}machine train termo ofensivo\``);
            }

            const ok = aiLearning.trainProfanity(termo, true);
            if (ok) {
                return reply(
                    `🧠 *MACHINE LEARNING — APRENDIZADO CONCLUÍDO!*\n\n` +
                    `✅ *Termo incorporado à base de moderação:* \`${termo}\`\n` +
                    `📚 *Tamanho atual da Knowledge Base:* ${aiLearning.dynamicProfanitySet.size} termos monitorados.\n\n` +
                    `Mensagens com esse padrão serão filtradas conforme as diretrizes do grupo.`
                );
            }
            return reply(`❌ Falha ao gravar termo no aprendizado de máquina.`);
        }

        // 3. Subcomando ROAMING (.machine roaming)
        if (sub === "roaming" || sub === "scan" || sub === "varredura") {
            const corpus = [
                "vai se fuder seu arrombado", "que fdp lixo", "seu verme escroto",
                "para de falar merda", "cala boca idiota"
            ];
            const report = aiLearning.runRoaming(corpus);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🧠 *MACHINE LEARNING ROAMING* ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📡 *Varredura e Calibração Autônoma:*\n`;
            doc += `• *Padrões analisados:* ${report.totalScanned}\n`;
            doc += `• *Padrões tóxicos mapeados:* ${report.toxicFound}\n`;
            doc += `• *Novas palavras incorporadas:* ${report.candidatesLearned.length ? report.candidatesLearned.join(', ') : 'Base calibrada'}\n`;
            doc += `• *Vocabulário monitorado:* ${aiLearning.dynamicProfanitySet.size} termos ativos\n\n`;
            doc += `⚖️ *Regra das 3 Exclusões:* Ativa (3 strikes = advertência/banimento)\n`;
            doc += `👑 *${botName}*`;

            return reply(doc);
        }

        // 4. Subcomando STATUS (.machine status)
        if (sub === "status" || sub === "info" || sub === "metricas") {
            const modoChat = configs[from]?.conversaNatural ? "🟢 *ATIVADO (Livre 24h)*" : "🔴 *DESATIVADO (Apenas comandos)*";
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ⚙️ *STATUS DO MOTOR MACHINE*  ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `🧠 *Motor de IA:* Ativo e aprendendo em tempo real\n`;
            doc += `💬 *Modo Conversacional no Chat:* ${modoChat}\n`;
            doc += `📚 *Base de Vocabulário Dinâmico:* ${aiLearning.dynamicProfanitySet.size} termos\n`;
            doc += `🛡️ *Proteção Anti-Link Inteligente:* Ativa com Parcerias e DM\n`;
            doc += `⚖️ *Sistema de Moderação:* 3 Strikes = Banimento Automático\n\n`;
            doc += `💡 _Digite_ \`${p}machine\` _para ver o seu perfil linguístico._\n`;
            doc += `👑 *${botName}*`;
            return reply(doc);
        }

        // 5. Perfil de Aprendizado do Usuário (Alvo ou Remetente)
        const target = (contextInfo?.mentionedJid && contextInfo.mentionedJid[0]) || sender;
        const profile = aiLearning.getUserProfile(target);
        const topWordsKeys = Object.keys(profile.top_words || {}).slice(0, 8);
        const modoChatAtual = configs[from]?.conversaNatural ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*";

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🧠 *PERFIL DE MACHINE LEARNING* 🧠   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Usuário Analisado:* @${target.split('@')[0]}\n`;
        doc += `🎭 *Estilo Dominante:* *${(profile.style || 'misto').toUpperCase()}*\n`;
        doc += `💬 *Total de Mensagens Analisadas:* ${profile.messages_count || 0}\n`;
        doc += `🤖 *Modo ChatGPT 24h:* ${modoChatAtual}\n\n`;

        doc += `╭━〔 📊 PADRÕES DETECTADOS PELA IA 〕━⬣\n`;
        doc += `┃ 👨‍💻 *Interações com Código/Tech:* ${profile.code_count || 0}\n`;
        doc += `┃ 😂 *Gírias & Expressões Resenha:* ${profile.slang_count || 0}\n`;
        doc += `┃ 🛡️ *Toxicidade/Palavrões:* ${profile.profanity_count || 0}\n`;
        doc += `┃ 📚 *Base Global de Palavras:* ${aiLearning.dynamicProfanitySet.size}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        if (topWordsKeys.length > 0) {
            doc += `╭━〔 🔤 VOCABULÁRIO MAIS FREQUENTE 〕━⬣\n`;
            doc += `┃ ${topWordsKeys.map(w => `\`${w}\``).join(', ')}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        }

        doc += `💡 *Comandos do Machine Learning:*\n`;
        doc += `• \`${p}machine on\` / \`off\` — Liga/desliga respostas sem comando\n`;
        doc += `• \`${p}machine train <palavra>\` — Treina novos termos no filtro\n`;
        doc += `• \`${p}machine roaming\` — Executa varredura profunda de padrões\n`;
        doc += `• \`${p}machine status\` — Estatísticas globais do motor\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc, [target]);
    }
};
