/**
 * Comando .restringir / .onlyadmin / .admonly
 * Restringe a utilização de comandos no grupo exclusivamente para Administradores do grupo e Donos do bot
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const groupAuthService = require("../../services/groupAuthService");

module.exports = {
    name: "restringir",
    aliases: ["onlyadmin","admonly","restringircmd","limitarcomandos","modorestrito","cmd_restringir","alt_restringir","atalho_restringir","abrev_restringir","call_restringir","func_restringir"],
    category: "admin",
    description: "Deixa só administradores e donos usarem meus comandos neste grupo",
    usage: "[on|off]",
    examples: [" — mostra se está restrito", "on — só administradores usam os comandos", "off — libera para todos"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, client }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        let groupName = "Grupo de WhatsApp";
        try {
            if (client && typeof client.groupMetadata === "function") {
                // getGroupData devolve { data, participants, ... }: o nome fica em data.subject.
                const meta = await groupAuthService.getGroupData(from);
                const nome = meta?.data?.subject || meta?.subject;
                if (nome) groupName = nome;
            }
        } catch (err) {
            logger.warn(`[RESTRINGIR] Nome do grupo ${from} indisponível: ${err.message}`);
        }

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        const isEnable = ["on", "1", "ativar", "sim", "adm", "admin", "fechar"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao", "liberar", "todos", "abrir"].includes(opt);

        if (!isEnable && !isDisable) {
            const current = Boolean(configs[from].restrictedToAdmins);
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODO RESTRITO DE GRUPO* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👥 *Grupo:* *${groupName}*\n`;
            doc += `📌 *Status de Acesso:* ${current ? "🔒 *RESTRITO A APENAS ADMINISTRADORES*" : "🔓 *LIBERADO PARA TODOS OS MEMBROS*"}\n\n`;
            doc += `╭━〔 ⚙️ COMANDOS DISPONÍVEIS 〕━⬣\n`;
            doc += `┃ • \`.restringir on\` ➔ Ativar restrição (Apenas Admins & Donos)\n`;
            doc += `┃ • \`.restringir off\` ➔ Desativar restrição (Liberar para Todos)\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Ideal para conter flood e manter o grupo organizado durante eventos._\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        if (isEnable) {
            configs[from].restrictedToAdmins = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[RESTRINGIR] Modo restrito ativado em ${from} (${groupName}) por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔒 *MODO RESTRITO ATIVADO* 🔒   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👥 *Grupo:* *${groupName}*\n`;
            doc += `╭━〔 🛡️ CONTROLE DE ACESSO 〕━⬣\n`;
            doc += `┃ 🔴 *Status:* *RESTRITO A ADMINISTRADORES & DONOS*\n`;
            doc += `┃ 👥 *Membros Comuns:* Comandos temporariamente bloqueados\n`;
            doc += `┃ 👤 *Ativado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para liberar meus comandos para todos de novo:_ \`.restringir off\`\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        } else {
            configs[from].restrictedToAdmins = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[RESTRINGIR] Modo restrito desativado em ${from} (${groupName}) por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔓 *MODO RESTRITO DESATIVADO* 🔓   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👥 *Grupo:* *${groupName}*\n`;
            doc += `╭━〔 🛡️ CONTROLE DE ACESSO 〕━⬣\n`;
            doc += `┃ 🟢 *Status:* *LIBERADO PARA TODOS OS MEMBROS*\n`;
            doc += `┃ 👥 *Membros Comuns:* Todos os comandos desbloqueados\n`;
            doc += `┃ 👤 *Desativado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para restringir novamente:_ \`.restringir on\`\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }
    }
};
