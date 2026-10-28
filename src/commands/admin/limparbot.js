const logger = require("../../core/logger");
const { getBotName } = require("../../config/botConfig");
const botMessageStore = require("../../services/botMessageStore");

module.exports = {
    name: "limparbot",
    aliases: ["clearbot","apagarbot","deletebot","cmd_limparbot","alt_limparbot","atalho_limparbot","abrev_limparbot","call_limparbot","func_limparbot"],
    category: "admin",
    subcategory: "Moderação",
    description: "Apaga as minhas últimas mensagens neste grupo",
    usage: "[quantidade]",
    examples: [" — apaga as minhas últimas mensagens", "20 — apaga as últimas 20"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 10000,
    execute: async ({ from, args, reply, sender, client, info }) => {
        const botName = getBotName();
        const senderNum = sender.split("@")[0].split(":")[0];
        let count = parseInt(args[0], 10);
        if (!count || count < 1) count = 10;
        if (count > 50) count = 50;

        try {
            // O Baileys 7 não tem mais store embutido — `client.store` era sempre
            // undefined e este comando quebrava 100% das vezes. Usamos o registro
            // próprio das mensagens que o bot enviou (botMessageStore).
            const botMessages = botMessageStore.recent(from, count).map(key => ({ key }));

            if (botMessages.length === 0) {
                return reply("🧹 *Nada para limpar*\n\nNão tenho mensagens minhas guardadas deste grupo para apagar.\n\n💡 _Só consigo apagar o que mandei desde a última vez que fui reiniciado._");
            }

            if (botMessages.length === 0) {
                return reply("🧹 Não encontrei mensagens minhas para apagar neste grupo.");
            }

            let deleted = 0;
            for (const msg of botMessages) {
                try {
                    await client.sendMessage(from, { delete: msg.key });
                    deleted++;
                } catch (e) {
                    logger.warn(`[LIMPARBOT] Falha ao apagar mensagem: ${e.message}`);
                }
            }

            logger.info(`[LIMPARBOT] ${deleted} mensagens apagadas em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🧹 *LIMPEZA DO BOT* 🧹   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ RESULTADO 〕━⬣\n`;
            doc += `┃ 🧹 *Ação:* Minhas mensagens apagadas\n`;
            doc += `┃ 📊 *Removidas:* ${deleted}/${botMessages.length}\n`;
            doc += `┃ 👤 *Solicitado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        } catch (err) {
            logger.error("[LIMPARBOT ERROR]", err);
            return reply("❌ Não consegui apagar as mensagens agora. Tente de novo em instantes.");
        }
    }
};
