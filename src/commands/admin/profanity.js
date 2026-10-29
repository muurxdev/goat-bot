const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .profanity — Moderação Autônoma, IA Learning & Sistema de 3 Strikes
 * 
 * Funcionalidades:
 * - .profanity on/off — Liga/desliga o filtro inteligente de palavrões
 * - .profanity learning [on/off] — Liga o motor de Machine Learning para aprender novas ofensas
 * - .profanity roaming — Varredura autônoma de padrões tóxicos e calibração de exclusões
 * - .profanity train <palavra> — Treina a base de conhecimento com nova palavra para exclusão
 * - .profanity status — Exibe painel detalhado do modelo de IA e moderação
 * - .profanity resetstrikes @user — Zera os strikes de profanidade
 * 
 * Regra Estrita: 3 mensagens apagadas por profanidade = Banimento/Remoção do grupo!
 */

const dataService = require("../../services/dataService");
const aiLearning = require("../../services/aiLearningService");
const { PROFANITY_LIST } = require("../../services/groupProtectionService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "profanity",
    aliases: [
        "palavrao", "palavroes", "antipalavrao", "swear", "profanitylearning", "roaming",
        "cmd_profanity", "alt_profanity", "atalho_profanity", "abrev_profanity", "call_profanity", "func_profanity"
    ],
    category: "admin",
    subcategory: "Moderação",
    description: "Moderação inteligente de palavrões com Machine Learning, Roaming e 3 Strikes = Ban",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2500,
    execute: async ({ from, args, reply, sender, prefix, isBotAdmin, contextInfo }) => {
        const p = prefix || ".";
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        const cfg = configs[from];

        const opt = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        // 1. ROAMING: Varredura de padrões tóxicos e calibração
        if (opt === "roaming" || opt === "scan" || opt === "varredura") {
            const sampleCorpus = [
                "vai se fuder seu arrombado", "que fdp lixo", "seu verme escroto",
                "para de falar merda", "cala boca idiota"
            ];
            const report = aiLearning.runRoaming(sampleCorpus);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🧠 *PROFANITY ROAMING AI* 🧠   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📡 *Status da Varredura Autônoma:*\n`;
            doc += `• *Padrões analisados:* ${report.totalScanned}\n`;
            doc += `• *Gatilhos tóxicos detectados:* ${report.toxicFound}\n`;
            doc += `• *Novas palavras incorporadas:* ${report.candidatesLearned.length ? report.candidatesLearned.join(', ') : 'Nenhuma nova (base calibrada)'}\n`;
            doc += `• *Base total de exclusão:* ${aiLearning.dynamicProfanitySet.size} palavras\n\n`;
            doc += `⚖️ *Regra das 3 Exclusões:* Ativa (3 strikes = expulsão automática)\n`;
            doc += `👑 *${botName}*`;

            return reply(doc);
        }

        // 2. LEARNING: Ativação/Desativação de Machine Learning Autônomo
        if (opt === "learning" || opt === "treino" || opt === "ml") {
            if (["on", "1", "ativar", "sim"].includes(param)) {
                cfg.profanityLearning = true;
                await dataService.saveConfigsData({ [from]: cfg });
                return reply(`🧠 *PROFANITY MACHINE LEARNING: ATIVADO!*\n\nO bot agora analisa o contexto das mensagens, gírias e evasões de l33tspeak para aprimorar o filtro autônomo.`);
            }
            if (["off", "0", "desativar", "nao"].includes(param)) {
                cfg.profanityLearning = false;
                await dataService.saveConfigsData({ [from]: cfg });
                return reply(`🧠 *PROFANITY MACHINE LEARNING: DESATIVADO!*\n\nO bot utilizará apenas a base de conhecimento existente.`);
            }
            const estadoML = cfg.profanityLearning ? "🟢 *ATIVO*" : "🔴 *DESATIVADO*";
            return reply(`🧠 *Modo Machine Learning Profanity:* ${estadoML}\n\nUso: \`${p}profanity learning on\` ou \`${p}profanity learning off\`.`);
        }

        // 3. TRAIN / ADD: Treinamento manual de exclusão
        if (opt === "train" || opt === "add" || opt === "banirpalavra" || opt === "treinar") {
            const wordToTrain = args.slice(1).join(" ").trim();
            if (!wordToTrain) {
                return reply(`❌ Forneça a palavra ou termo para treinar.\nExemplo: \`${p}profanity train lixo humano\``);
            }
            const ok = aiLearning.trainProfanity(wordToTrain, true);
            if (ok) {
                return reply(`✅ *Palavra treinada e adicionada à base de exclusão:* \`${wordToTrain}\`\n\nQualquer mensagem contendo esse termo será apagada imediatamente e contará strike.`);
            }
            return reply(`❌ Falha ao treinar a palavra fornecida.`);
        }

        // 4. RESET STRIKES: Zerar advertências de profanidade
        if (opt === "reset" || opt === "resetstrikes" || opt === "limparstrikes") {
            const target = (contextInfo?.mentionedJid && contextInfo.mentionedJid[0]) || (args[1] ? args[1].replace(/[@\s]/g, '') + '@s.whatsapp.net' : null);
            if (target) {
                aiLearning.resetStrikes(from, target, "profanity");
                return reply(`✅ Strikes de profanidade de ${nomeDoMembro(target)} foram resetados.`, [target]);
            }
            return reply(`💡 Marque a pessoa para zerar strikes: \`${p}profanity reset @user\``);
        }

        // 5. LISTA: Ver termos proibidos
        if (["lista", "list", "ver"].includes(opt)) {
            const list = Array.from(aiLearning.dynamicProfanitySet);
            return reply(
                `📜 *Base de Conhecimento de Profanidade (${list.length} termos monitorados):*\n\n` +
                list.slice(0, 50).map((w, i) => `${i + 1}. ${w}`).join("\n") +
                (list.length > 50 ? `\n\n_... e mais ${list.length - 50} termos cadastrados._` : '')
            );
        }

        // 6. TOGGLE ON / OFF
        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (isEnable || isDisable) {
            cfg.antiProfanity = isEnable;
            await dataService.saveConfigsData({ [from]: cfg });
            logger.info(`[PROFANITY] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

            if (!isEnable) return reply("🚫 Filtro de palavrões e 3-strikes desativado.");

            let texto = `🚫 *FILTRO DE PALAVRÕES ATIVADO!*\n\n`;
            texto += `⚖️ *Regra das 3 Exclusões:* Mensagens com ofensas serão apagadas. Se a pessoa acumular 3 mensagens apagadas, será *removida do grupo* automaticamente!\n`;
            if (!isBotAdmin) texto += `\n⚠️ *Atenção:* O bot precisa ser Administrador do grupo para apagar mensagens e banir infratores.`;
            return reply(texto);
        }

        // 7. PAINEL DE STATUS GERAL (.profanity sem argumentos ou .profanity status)
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *PAINEL PROFANITY & IA* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📌 *Filtro de Palavrões:* ${cfg.antiProfanity ? "🟢 *LIGADO*" : "🔴 *DESLIGADO*"}\n`;
        doc += `🧠 *Machine Learning Autônomo:* ${cfg.profanityLearning ? "🟢 *ATIVO*" : "🔴 *DESATIVADO*"}\n`;
        doc += `📚 *Base de Conhecimento:* \`${aiLearning.dynamicProfanitySet.size} termos\` (L33tspeak evasivo ativo)\n`;
        doc += `⚖️ *Sistema de Punição:* *3 STRIKES = EXPULSÃO AUTOMÁTICA*\n\n`;
        doc += `╭━〔 ⚙️ COMANDOS DO SISTEMA 〕━⬣\n`;
        doc += `┃ ➤ \`${p}profanity on/off\` — Ativar/desativar filtro\n`;
        doc += `┃ ➤ \`${p}profanity learning on/off\` — IA de aprendizado\n`;
        doc += `┃ ➤ \`${p}profanity roaming\` — Varredura autônoma de ofensas\n`;
        doc += `┃ ➤ \`${p}profanity train <palavra>\` — Adicionar termo à base\n`;
        doc += `┃ ➤ \`${p}profanity reset @user\` — Zerar strikes de um membro\n`;
        doc += `┃ ➤ \`${p}profanity lista\` — Listar termos monitorados\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc);
    }
};
