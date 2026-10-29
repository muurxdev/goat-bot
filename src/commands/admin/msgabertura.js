const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .msgabertura / .aberturamsg / .abertura
 * Ativa, desativa, personaliza e testa (preview) as mensagens de abertura do grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "msgabertura",
    aliases: ["aberturamsg","configabertura","setabertura","openmsg","msggrupoaberto","aberturaon","aberturaoff","desativarabertura","ativarabertura","cmd_msgabertura","alt_msgabertura","atalho_msgabertura","abrev_msgabertura","call_msgabertura","func_msgabertura"],
    category: "admin",
    description: "Ativa, desativa, personaliza e testa (preview) a notificação de abertura do grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, text, client, info, isGroup, commandName }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        let opt = (args[0] || "").toLowerCase().trim();
        const cmdName = (commandName || "").toLowerCase();
        if (cmdName.endsWith("off") || cmdName === "aberturaoff" || cmdName === "desativarabertura") {
            opt = "off";
        } else if (cmdName.endsWith("on") || cmdName === "aberturaon" || cmdName === "ativarabertura") {
            opt = "on";
        }

        const senderNum = sender.split("@")[0].split(":")[0];

        // 1. -CONFIG: painel completo com dados REAIS do grupo/usuário + o processo de configuração
        if (opt === "-config" || opt === "config" || opt === "preview" || opt === "teste" || opt === "test" || opt === "ver") {
            const groupConfig = configs[from] || {};
            const { getGreetingVars, buildOpenMessage, variableGuide } = require("../../services/groupGreetingService");
            const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Abertura Manual / Programada" });
            const previewText = buildOpenMessage(groupConfig, vars).trim();

            const isActive = groupConfig.abertura !== false && groupConfig.aberturaEnabled !== false;
            let head = `╔══════════════════════════════╗\n`;
            head += `║ ⚙️ *CONFIG: ABERTURA DE GRUPO* ⚙️ ║\n`;
            head += `╚══════════════════════════════╝\n\n`;
            head += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.aberturaMsg ? "Personalizado" : "Padrão Oficial"}\n`;
            head += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            head += variableGuide("abertura") + "\n\n";
            head += `━━━━━ [ COMO O GRUPO VERÁ AGORA ] ━━━━━\n\n`;

            const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👑 *${botName}*`;
            const fullText = head + previewText + footer;

            if (process.env.NODE_ENV !== "test") {
                const { sendMenuMediaMessage } = require("../../utils/wallpapers");
                return await sendMenuMediaMessage(client, from, {
                    category: "abertura",
                    text: fullText,
                    mentions: [sender],
                    quoted: info
                });
            }
            return reply(fullText, [sender]);
        }

        // 2. RESETAR: Volta para a mensagem padrão do bot
        if (opt === "reset" || opt === "padrao" || opt === "default") {
            delete configs[from].aberturaMsg;
            delete configs[from].openMessage;
            configs[from].abertura = true;
            configs[from].aberturaEnabled = true;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *Mensagem de abertura redefinida para o modelo padrão oficial!*\n\n💡 _Para testar, use:_ \`.msgabertura -config\``);
        }

        // 3. MSG / SET: Define mensagem personalizada
        if (opt === "msg" || opt === "mensagem" || opt === "set" || opt === "texto") {
            const customMsg = args.slice(1).join(" ").trim();
            if (!customMsg) {
                let guide = `📜 *COMO PERSONALIZAR A NOTIFICAÇÃO DE ABERTURA:*\n\n`;
                guide += `📌 *Uso:* \`.msgabertura msg <sua mensagem>\`\n\n`;
                guide += `╭━〔 🔤 VARIÁVEIS SUPORTADAS 〕━⬣\n`;
                guide += `┃ • \`{grupo}\` ➔ Nome do grupo\n`;
                guide += `┃ • \`{dono}\` / \`{criador}\` ➔ Marca o dono/criador do grupo\n`;
                guide += `┃ • \`{subdono}\` / \`{segundo_adm}\` ➔ Marca o 2º administrador na hierarquia\n`;
                guide += `┃ • \`{adms}\` ➔ Marca todos os administradores atuais\n`;
                guide += `┃ • \`{lista_admins}\` ➔ Lista numerada com todos os admins\n`;
                guide += `┃ • \`{admin}\` ➔ Marca o administrador que abriu o grupo\n`;
                guide += `┃ • \`{membros}\` ➔ Total de membros atual\n`;
                guide += `┃ • \`{hora}\` ➔ Horário da abertura (Brasília)\n`;
                guide += `┃ • \`{data}\` ➔ Data da abertura\n`;
                guide += `┃ • \`{saudacao}\` ➔ Bom dia / Boa tarde / Boa noite\n`;
                guide += `┃ • \`{dia}\` ➔ Dia da semana\n`;
                guide += `┃ • \`{desc}\` ➔ Regras / Descrição do grupo\n`;
                guide += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                guide += `💡 *Exemplo:* \`.msgabertura msg 🔓 Grupo {grupo} aberto! Sejam bem-vindos de volta. Dono: {dono} | Horário: {hora}\``;
                return reply(guide.trim());
            }

            configs[from].aberturaMsg = customMsg;
            configs[from].openMessage = customMsg;
            configs[from].abertura = true;
            configs[from].aberturaEnabled = true;
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔓 *ABERTURA CONFIGURADA!* 🔓 ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ MENSAGEM CONFIGURADA 〕━⬣\n`;
            doc += `┃ 📝 *Texto:* ${customMsg.slice(0, 200)}${customMsg.length > 200 ? "..." : ""}\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Digite_ \`.msgabertura -config\` _para ver uma simulação completa!_\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 4. ON: Ativa mensagens de abertura
        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim" || opt === "true" || opt === "enable" || opt === "enabled") {
            configs[from].abertura = true;
            configs[from].aberturaEnabled = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[ABERTURA MSG] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔓 *NOTIFICAÇÃO DE ABERTURA* 🔓   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🔓 *Recurso:* Aviso de Abertura do Grupo\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.msgabertura off\` | _Para testar:_ \`.msgabertura -config\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 5. OFF: Desativa mensagens de abertura
        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "desativa" || opt === "nao" || opt === "não" || opt === "false" || opt === "disable" || opt === "disabled" || opt === "del" || opt === "remover") {
            configs[from].abertura = false;
            configs[from].aberturaEnabled = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[ABERTURA MSG] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔓 *NOTIFICAÇÃO DE ABERTURA* 🔓   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🔓 *Recurso:* Aviso de Abertura do Grupo\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar quando desejar:_ \`.msgabertura on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 6. PAINEL DE STATUS
        const isEnabled = configs[from].abertura !== false && configs[from].aberturaEnabled !== false;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔓 *NOTIFICAÇÃO DE ABERTURA* 🔓   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🔓 *Recurso:* Notificação de Abertura do Grupo\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📝 *Modelo:* ${configs[from].aberturaMsg ? "Personalizado" : "Padrão Oficial"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.msgabertura on\` ➔ Ativar notificação de abertura\n`;
        doc += `• \`.msgabertura off\` ➔ Desativar notificação de abertura\n`;
        doc += `• \`.msgabertura -config\` ➔ Ver simulação da mensagem\n`;
        doc += `• \`.msgabertura msg <texto>\` ➔ Personalizar mensagem\n`;
        doc += `• \`.msgabertura reset\` ➔ Restaurar modelo padrão\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
