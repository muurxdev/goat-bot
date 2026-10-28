/**
 * Comando .device / .conexao / .pinguser / .netinfo
 * Diagnóstico avançado de conexão, tipo de rede, latência, DNS, provedor e modelo de hardware
 */

const { getBotName } = require("../../config/botConfig");
const { getAdvancedNetworkTelemetry } = require("../../services/telemetryDeviceService");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const crypto = require("crypto");

module.exports = {
    name: "device",
    aliases: ["pingdevice", "conexao", "pinguser", "rede", "meudevice"],
    category: "general",
    description: "Analisa e exibe o modelo do dispositivo, latência de rede, tipo de internet (Wi-Fi/5G/Cabo) e telemetria",
    cooldownMs: 2000,
    execute: async ({ sender, reply, info }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const tele = getAdvancedNetworkTelemetry(info, sender, sender, user);
        const cleanNumber = sender.split("@")[0].split(":")[0];

        const keyId = info?.key?.id || "";
        const serialTag = keyId ? ("SN-" + keyId) : ("SN-" + crypto.createHash("md5").update(sender).digest("hex").slice(0, 16).toUpperCase());

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📡 *DIAGNÓSTICO DE REDE & HARDWARE* 📡   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;

        doc += `👤 *Usuário:* @${cleanNumber}\n\n`;

        doc += `╭━〔 💻 HARDWARE & APARELHO 〕━⬣\n`;
        doc += `┃ 📱 *Modelo:* ${tele.device.model}\n`;
        doc += `┃ 🖥️ *Form Factor:* ${tele.device.type}\n`;
        doc += `┃ ⚙️ *Sistema Operacional:* ${tele.device.os}\n`;
        doc += `┃ 🔢 *Serial / HWID:* \`${serialTag}\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        // "mobileOrWifi" nunca existiu no serviço (saía "undefined"), e ping/jitter
        // vêm null quando não há como medir — mostrar "null ms" é pior que dizer.
        const medido = v => (v === null || v === undefined) ? "não medido" : `${v} ms`;
        doc += `╭━〔 🌐 TELEMETRIA DE CONEXÃO 〕━⬣\n`;
        doc += `┃ 🏢 *Provedor (ISP):* ${tele.isp}\n`;
        doc += `┃ 🔌 *Interface de Rede:* ${tele.connType}\n`;
        doc += `┃ 📶 *Plataforma:* ${tele.device.platform || "❔ Não detectável"}\n`;
        doc += `┃ ⚡ *Atraso de entrega:* *${medido(tele.pingMs)}*\n`;
        doc += `┃ 📊 *Jitter:* *${medido(tele.jitter)}* | 📦 *Perda:* ${tele.packetLoss}\n`;
        doc += `┃ 🛡️ *Servidores DNS:* ${tele.dns}\n`;
        doc += `┃ 🟢 *Status:* ${tele.status}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Para definir seu aparelho manualmente:_ \`.setdevice <modelo>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
