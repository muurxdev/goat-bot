const { nomeDoMembro } = require('../../utils/nomeMembro');
const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

const EVENT_TYPES = {
    bemvindo: { label: "Mensagem de Boas-Vindas", key: "welcome", icon: "🎉" },
    despedida: { label: "Mensagem de Despedida", key: "leave", icon: "👋" },
    abertura: { label: "Mensagem de Abertura", key: "abertura", icon: "🔓" },
    fechamento: { label: "Mensagem de Fechamento", key: "fechamento", icon: "🔒" },
    antilink: { label: "Proteção Anti-Link", key: "antilink", icon: "🔗" },
    antiflood: { label: "Proteção Anti-Flood", key: "antiFlood", icon: "🌊" },
    antispam: { label: "Proteção Anti-Spam", key: "antispam", icon: "🛡️" }
};

module.exports = {
    name: "event",
    aliases: ["events","evento","eventos","cmd_event","alt_event","atalho_event","abrev_event","call_event","func_event"],
    category: "admin",
    subcategory: "Moderação",
    description: "Gerencia eventos e proteções do grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (!opt) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📋 *EVENTOS DO GRUPO* 📋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ STATUS DOS EVENTOS 〕━⬣\n`;

            for (const [type, info] of Object.entries(EVENT_TYPES)) {
                const isEnabled = Boolean(configs[from][info.key]);
                doc += `┃ ${info.icon} *${info.label}:* ${isEnabled ? "🟢 Ativado" : "🔴 Desativado"}\n`;
            }

            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Como usar:*\n`;
            doc += `• \`.event <tipo> on/off\` — Ativar/Desativar evento\n\n`;
            doc += `📌 *Tipos disponíveis:*\n`;

            for (const [type, info] of Object.entries(EVENT_TYPES)) {
                doc += `• \`${type}\` — ${info.label}\n`;
            }

            doc += `\n💡 *Exemplo:* \`.event bemvindo on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        if (opt === "all" || opt === "todos") {
            const isEnable = ["on", "1", "ativar", "sim"].includes(param);
            if (!isEnable && param !== "off" && param !== "0" && param !== "desativar") {
                return reply("❌ Informe `on` ou `off`.\n\n📌 *Exemplo:* `.event all on`");
            }

            for (const [type, info] of Object.entries(EVENT_TYPES)) {
                configs[from][info.key] = isEnable;
            }
            await dataService.saveConfigsData(configs);
            logger.info(`[EVENT] Todos os eventos ${isEnable ? "ativados" : "desativados"} em ${from} por ${sender}`);

            return reply(`✅ *Todos os eventos foram ${isEnable ? "ativados" : "desativados"} com sucesso!*`);
        }

        const eventType = EVENT_TYPES[opt];
        if (!eventType) {
            return reply(`❌ *Tipo de evento inválido.*\n\n📌 *Tipos disponíveis:* ${Object.keys(EVENT_TYPES).join(", ")}`);
        }

        if (["on", "1", "ativar", "sim"].includes(param)) {
            configs[from][eventType.key] = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[EVENT] ${eventType.label} ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📋 *EVENTO CONFIGURADO* 📋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO 〕━⬣\n`;
            doc += `┃ ${eventType.icon} *Evento:* ${eventType.label}\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.event ${opt} off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (["off", "0", "desativar", "nao"].includes(param)) {
            configs[from][eventType.key] = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[EVENT] ${eventType.label} desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📋 *EVENTO CONFIGURADO* 📋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO 〕━⬣\n`;
            doc += `┃ ${eventType.icon} *Evento:* ${eventType.label}\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar:_ \`.event ${opt} on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        const isEnabled = Boolean(configs[from][eventType.key]);
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📋 *EVENTO CONFIGURADO* 📋   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ STATUS 〕━⬣\n`;
        doc += `┃ ${eventType.icon} *Evento:* ${eventType.label}\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Como alterar:*\n`;
        doc += `• \`.event ${opt} on\` — Ativar\n`;
        doc += `• \`.event ${opt} off\` — Desativar\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
