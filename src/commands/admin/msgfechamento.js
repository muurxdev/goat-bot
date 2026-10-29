const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .msgfechamento / .fechamentomsg / .fechamento
 * Ativa, desativa, personaliza e testa (preview) as mensagens de fechamento do grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "msgfechamento",
    aliases: ["fechamentomsg","configfechamento","setfechamento","closemsg","msggrupofechado","fechamentoon","fechamentooff","desativarfechamento","ativarfechamento","cmd_msgfechamento","alt_msgfechamento","atalho_msgfechamento","abrev_msgfechamento","call_msgfechamento","func_msgfechamento"],
    category: "admin",
    description: "Ativa, desativa, personaliza e testa (preview) a notificação de fechamento do grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, text, client, info, isGroup, commandName }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        let opt = (args[0] || "").toLowerCase().trim();
        const cmdName = (commandName || "").toLowerCase();
        if (cmdName.endsWith("off") || cmdName === "fechamentooff" || cmdName === "desativarfechamento") {
            opt = "off";
        } else if (cmdName.endsWith("on") || cmdName === "fechamentoon" || cmdName === "ativarfechamento") {
            opt = "on";
        }

        const senderNum = sender.split("@")[0].split(":")[0];

        // 1. -CONFIG: painel completo com dados REAIS do grupo/usuário + o processo de configuração
        if (opt === "-config" || opt === "config" || opt === "preview" || opt === "teste" || opt === "test" || opt === "ver") {
            const groupConfig = configs[from] || {};
            const { getGreetingVars, buildCloseMessage, variableGuide } = require("../../services/groupGreetingService");
            const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Fechamento Manual / Programado" });
            const previewText = buildCloseMessage(groupConfig, vars).trim();

            const isActive = groupConfig.fechamento !== false && groupConfig.fechamentoEnabled !== false;
            let head = `╔══════════════════════════════╗\n`;
            head += `║ ⚙️ *CONFIG: FECHAMENTO DE GRUPO* ⚙️ ║\n`;
            head += `╚══════════════════════════════╝\n\n`;
            head += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.fechamentoMsg ? "Personalizado" : "Padrão Oficial"}\n`;
            head += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            head += variableGuide("fechamento") + "\n\n";
            head += `━━━━━ [ COMO O GRUPO VERÁ AGORA ] ━━━━━\n\n`;

            const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👑 *${botName}*`;
            const fullText = head + previewText + footer;

            if (process.env.NODE_ENV !== "test") {
                const { sendMenuMediaMessage } = require("../../utils/wallpapers");
                return await sendMenuMediaMessage(client, from, {
                    category: "fechamento",
                    text: fullText,
                    mentions: [sender],
                    quoted: info
                });
            }
            return reply(fullText, [sender]);
        }

        // 2. RESETAR: Volta para a mensagem padrão do bot
        if (opt === "reset" || opt === "padrao" || opt === "default") {
            delete configs[from].fechamentoMsg;
            delete configs[from].closeMessage;
            configs[from].fechamento = true;
            configs[from].fechamentoEnabled = true;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *Mensagem de fechamento redefinida para o modelo padrão oficial!*\n\n💡 _Para testar, use:_ \`.msgfechamento -config\``);
        }

        // 3. MSG / SET: Define mensagem personalizada
        if (opt === "msg" || opt === "mensagem" || opt === "set" || opt === "texto") {
            const customMsg = args.slice(1).join(" ").trim();
            if (!customMsg) {
                let guide = `📜 *COMO PERSONALIZAR A NOTIFICAÇÃO DE FECHAMENTO:*\n\n`;
                guide += `📌 *Uso:* \`.msgfechamento msg <sua mensagem>\`\n\n`;
                guide += `╭━〔 🔤 VARIÁVEIS SUPORTADAS 〕━⬣\n`;
                guide += `┃ • \`{grupo}\` ➔ Nome do grupo\n`;
                guide += `┃ • \`{dono}\` / \`{criador}\` ➔ Marca o dono/criador do grupo\n`;
                guide += `┃ • \`{subdono}\` / \`{segundo_adm}\` ➔ Marca o 2º administrador na hierarquia\n`;
                guide += `┃ • \`{adms}\` ➔ Marca todos os administradores atuais\n`;
                guide += `┃ • \`{lista_admins}\` ➔ Lista numerada com todos os admins\n`;
                guide += `┃ • \`{admin}\` ➔ Marca o administrador que fechou o grupo\n`;
                guide += `┃ • \`{membros}\` ➔ Total de membros atual\n`;
                guide += `┃ • \`{hora}\` ➔ Horário do fechamento (Brasília)\n`;
                guide += `┃ • \`{data}\` ➔ Data do fechamento\n`;
                guide += `┃ • \`{saudacao}\` ➔ Bom dia / Boa tarde / Boa noite\n`;
                guide += `┃ • \`{dia}\` ➔ Dia da semana\n`;
                guide += `┃ • \`{desc}\` ➔ Regras / Descrição do grupo\n`;
                guide += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                guide += `💡 *Exemplo:* \`.msgfechamento msg 🔒 Grupo {grupo} fechado para descanso. Dono: {dono}. Voltamos amanhã!\``;
                return reply(guide.trim());
            }

            configs[from].fechamentoMsg = customMsg;
            configs[from].closeMessage = customMsg;
            configs[from].fechamento = true;
            configs[from].fechamentoEnabled = true;
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔒 *FECHAMENTO CONFIGURADO!* 🔒 ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ MENSAGEM CONFIGURADA 〕━⬣\n`;
            doc += `┃ 📝 *Texto:* ${customMsg.slice(0, 200)}${customMsg.length > 200 ? "..." : ""}\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Digite_ \`.msgfechamento -config\` _para ver uma simulação completa!_\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 4. ON: Ativa mensagens de fechamento
        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim" || opt === "true" || opt === "enable" || opt === "enabled") {
            configs[from].fechamento = true;
            configs[from].fechamentoEnabled = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[FECHAMENTO MSG] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔒 *NOTIFICAÇÃO DE FECHAMENTO* 🔒 ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🔒 *Recurso:* Aviso de Fechamento do Grupo\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.msgfechamento off\` | _Para testar:_ \`.msgfechamento -config\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 5. OFF: Desativa mensagens de fechamento
        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "desativa" || opt === "nao" || opt === "não" || opt === "false" || opt === "disable" || opt === "disabled" || opt === "del" || opt === "remover") {
            configs[from].fechamento = false;
            configs[from].fechamentoEnabled = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[FECHAMENTO MSG] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔒 *NOTIFICAÇÃO DE FECHAMENTO* 🔒 ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🔒 *Recurso:* Aviso de Fechamento do Grupo\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar quando desejar:_ \`.msgfechamento on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 6. PAINEL DE STATUS
        const isEnabled = configs[from].fechamento !== false && configs[from].fechamentoEnabled !== false;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔒 *NOTIFICAÇÃO DE FECHAMENTO* 🔒 ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🔒 *Recurso:* Notificação de Fechamento do Grupo\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📝 *Modelo:* ${configs[from].fechamentoMsg ? "Personalizado" : "Padrão Oficial"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.msgfechamento on\` ➔ Ativar notificação de fechamento\n`;
        doc += `• \`.msgfechamento off\` ➔ Desativar notificação de fechamento\n`;
        doc += `• \`.msgfechamento -config\` ➔ Ver simulação da mensagem\n`;
        doc += `• \`.msgfechamento msg <texto>\` ➔ Personalizar mensagem\n`;
        doc += `• \`.msgfechamento reset\` ➔ Restaurar modelo padrão\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
