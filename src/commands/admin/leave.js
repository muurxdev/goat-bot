const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .leave / .adeus / .despedida / .saiu
 * Ativa, desativa, personaliza ou testa (preview) as mensagens de saída/despedida de membros do grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "leave",
    aliases: ["adeus","despedida","saiu","leave-msg","leavemsg","leaveon","leaveoff","saidagrupo","desativarleave","ativarleave","adeusoff","adeuson","saiuoff","saiuon","cmd_leave","alt_leave","atalho_leave","abrev_leave","call_leave","func_leave"],
    category: "admin",
    description: "Ativa, desativa, personaliza e testa (preview) as mensagens de despedida quando membros saem do grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, text, client, info, commandName }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        let opt = (args[0] || "").toLowerCase().trim();
        const cmdName = (commandName || "").toLowerCase();
        if (cmdName.endsWith("off") || cmdName === "leaveoff" || cmdName === "adeusoff" || cmdName === "saiuoff" || cmdName === "desativarleave") {
            opt = "off";
        } else if (cmdName.endsWith("on") || cmdName === "leaveon" || cmdName === "adeuson" || cmdName === "saiuon" || cmdName === "ativarleave") {
            opt = "on";
        }

        const senderNum = sender.split("@")[0].split(":")[0];

        // 1. -CONFIG: painel completo com dados REAIS do grupo/usuário + o processo de configuração
        if (opt === "-config" || opt === "config" || opt === "preview" || opt === "teste" || opt === "test" || opt === "ver") {
            const groupConfig = configs[from] || {};
            const { getGreetingVars, buildLeaveMessage, variableGuide } = require("../../services/groupGreetingService");
            const vars = await getGreetingVars(client, from, sender);
            const previewText = buildLeaveMessage(groupConfig, vars).trim();

            const isActive = groupConfig.leave === true || groupConfig.leaveEnabled === true;
            let head = `╔══════════════════════════════╗\n`;
            head += `║ ⚙️ *CONFIG: DESPEDIDA* ⚙️ ║\n`;
            head += `╚══════════════════════════════╝\n\n`;
            head += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.leaveMessage ? "Personalizado" : "Padrão"}\n`;
            head += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            head += variableGuide("leave") + "\n\n";
            head += `━━━━━ [ COMO SERÁ ENVIADO AGORA ] ━━━━━\n\n`;

            const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👑 *${botName}*`;
            const fullText = head + previewText + footer;

            if (process.env.NODE_ENV !== "test") {
                const { sendMenuMediaMessage } = require("../../utils/wallpapers");
                return await sendMenuMediaMessage(client, from, {
                    category: "leave",
                    text: fullText,
                    mentions: [sender],
                    quoted: info
                });
            }
            return reply(fullText, [sender]);
        }

        // 2. RESETAR: Volta para a mensagem padrão
        if (opt === "reset" || opt === "padrao" || opt === "default") {
            delete configs[from].leaveMessage;
            configs[from].leave = true;
            configs[from].leaveEnabled = true;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *Mensagem de despedida redefinida para o modelo padrão oficial!*\n\n💡 _Para testar, use:_ \`.leave -config\``);
        }

        // 3. MSG / SET: Define mensagem personalizada de despedida
        if (opt === "msg" || opt === "mensagem" || opt === "set" || opt === "texto") {
            const customMsg = args.slice(1).join(" ").trim();
            if (!customMsg) {
                let guide = `📜 *COMO PERSONALIZAR A DESPEDIDA:*\n\n`;
                guide += `📌 *Uso:* \`.leave msg <sua mensagem>\`\n\n`;
                guide += `╭━〔 🔤 VARIÁVEIS SUPORTADAS 〕━⬣\n`;
                guide += `┃ • \`{user}\` ➔ Marca o participante que saiu (@user)\n`;
                guide += `┃ • \`{grupo}\` ➔ Nome do grupo\n`;
                guide += `┃ • \`{membros}\` ➔ Total de membros restantes\n`;
                guide += `┃ • \`{hora}\` ➔ Horário da saída\n`;
                guide += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                guide += `💡 *Exemplo:* \`.leave msg O membro {user} saiu do grupo {grupo}. Restam {membros} membros!\``;
                return reply(guide.trim());
            }

            configs[from].leaveMessage = customMsg;
            configs[from].leave = true;
            configs[from].leaveEnabled = true;
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   👋 *DESPEDIDA SALVA!* 👋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ MENSAGEM CONFIGURADA 〕━⬣\n`;
            doc += `┃ 📝 *Texto:* ${customMsg.slice(0, 200)}${customMsg.length > 200 ? "..." : ""}\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Digite_ \`.leave -config\` _para ver a simulação completa!_\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 4. ON: Ativa mensagens de despedida
        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim" || opt === "true" || opt === "enable" || opt === "enabled") {
            configs[from].leave = true;
            configs[from].leaveEnabled = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[LEAVE] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   👋 *EVENTOS DE DESPEDIDA* 👋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 👋 *Recurso:* Mensagens de Saída / Despedida\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.leave off\` | _Para testar:_ \`.leave -config\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 5. OFF: Desativa mensagens de despedida
        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "desativa" || opt === "nao" || opt === "não" || opt === "false" || opt === "disable" || opt === "disabled" || opt === "del" || opt === "remover") {
            configs[from].leave = false;
            configs[from].leaveEnabled = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[LEAVE] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   👋 *EVENTOS DE DESPEDIDA* 👋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 👋 *Recurso:* Mensagens de Saída / Despedida\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar quando desejar:_ \`.leave on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 6. PAINEL DE STATUS
        const isEnabled = configs[from].leave === true || configs[from].leaveEnabled === true;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   👋 *EVENTOS DE DESPEDIDA* 👋   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 👋 *Recurso:* Mensagens de Saída / Despedida\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📝 *Modelo:* ${configs[from].leaveMessage ? "Personalizado" : "Padrão Oficial"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.leave on\` ➔ Ativar avisos de saída\n`;
        doc += `• \`.leave off\` ➔ Desativar avisos de saída\n`;
        doc += `• \`.leave -config\` ➔ Ver simulação da mensagem\n`;
        doc += `• \`.leave msg <texto>\` ➔ Personalizar mensagem\n`;
        doc += `• \`.leave reset\` ➔ Restaurar modelo padrão\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
