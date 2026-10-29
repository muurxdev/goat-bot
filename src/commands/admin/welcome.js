const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .welcome / .bv / .boasvindas
 * Ativa, desativa, personaliza ou testa (preview) as mensagens de boas-vindas do grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "welcome",
    aliases: ["bv","boasvindas","bemvindo","welcome-msg","welcomeon","welcomeoff","desativarbv","ativarbv","bvoff","bvon","cmd_welcome","alt_welcome","atalho_welcome","abrev_welcome","call_welcome","func_welcome"],
    category: "admin",
    description: "Ativa, desativa, personaliza e testa (preview) as mensagens de boas-vindas do grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, text, client, info, isGroup, commandName }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        let opt = (args[0] || "").toLowerCase().trim();
        const cmdName = (commandName || "").toLowerCase();
        if (cmdName.endsWith("off") || cmdName === "welcomeoff" || cmdName === "bvoff" || cmdName === "desativarbv") {
            opt = "off";
        } else if (cmdName.endsWith("on") || cmdName === "welcomeon" || cmdName === "bvon" || cmdName === "ativarbv") {
            opt = "on";
        }

        const senderNum = sender.split("@")[0].split(":")[0];

        // 1. -CONFIG: painel completo com dados REAIS do grupo/usuário + o processo de configuração
        if (opt === "-config" || opt === "config" || opt === "preview" || opt === "teste" || opt === "test" || opt === "ver") {
            const groupConfig = configs[from] || {};
            const { getGreetingVars, buildWelcomeMessage, variableGuide } = require("../../services/groupGreetingService");
            // Dados reais: grupo (subject/desc/membros) e o próprio admin como usuário de exemplo
            const vars = await getGreetingVars(client, from, sender);
            const previewText = buildWelcomeMessage(groupConfig, vars).trim();

            const isActive = groupConfig.welcome === true || groupConfig.welcomeEnabled === true;
            let head = `╔══════════════════════════════╗\n`;
            head += `║ ⚙️ *CONFIG: BOAS-VINDAS* ⚙️ ║\n`;
            head += `╚══════════════════════════════╝\n\n`;
            head += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.welcomeMessage ? "Personalizado" : "Padrão"}\n`;
            head += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            head += variableGuide("welcome") + "\n\n";
            head += `━━━━━ [ COMO O MEMBRO VERÁ AGORA ] ━━━━━\n\n`;

            const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👑 *${botName}*`;
            const fullText = head + previewText + footer;

            // Envia com o MESMO wallpaper Full HD que o evento real usaria
            if (process.env.NODE_ENV !== "test") {
                const { sendMenuMediaMessage } = require("../../utils/wallpapers");
                return await sendMenuMediaMessage(client, from, {
                    category: "welcome",
                    text: fullText,
                    mentions: [sender],
                    quoted: info
                });
            }
            return reply(fullText, [sender]);
        }

        // 2. RESETAR: Volta para a mensagem padrão do bot
        if (opt === "reset" || opt === "padrao" || opt === "default") {
            delete configs[from].welcomeMessage;
            configs[from].welcome = true;
            configs[from].welcomeEnabled = true;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *Boas-vindas redefinidas para o modelo padrão oficial!*\n\n💡 _Para testar, use:_ \`.welcome -config\``);
        }

        // 3. MSG / SET: Define mensagem personalizada
        if (opt === "msg" || opt === "mensagem" || opt === "set" || opt === "texto") {
            const customMsg = args.slice(1).join(" ").trim();
            if (!customMsg) {
                let guide = `📜 *COMO PERSONALIZAR AS BOAS-VINDAS:*\n\n`;
                guide += `📌 *Uso:* \`.welcome msg <sua mensagem>\`\n\n`;
                guide += `╭━〔 🔤 VARIÁVEIS SUPORTADAS 〕━⬣\n`;
                guide += `┃ • \`{user}\` ➔ Marca o novo participante (@user)\n`;
                guide += `┃ • \`{dono}\` / \`{criador}\` ➔ Marca o dono/criador do grupo\n`;
                guide += `┃ • \`{subdono}\` / \`{segundo_adm}\` ➔ Marca o 2º administrador na hierarquia (sucessor)\n`;
                guide += `┃ • \`{adms}\` ➔ Marca todos os administradores atuais\n`;
                guide += `┃ • \`{lista_admins}\` ➔ Lista numerada com todos os admins\n`;
                guide += `┃ • \`{grupo}\` ➔ Nome do grupo\n`;
                guide += `┃ • \`{desc}\` ➔ Descrição / Regras do grupo\n`;
                guide += `┃ • \`{membros}\` ➔ Total de membros atual\n`;
                guide += `┃ • \`{hora}\` ➔ Horário da entrada (Brasília)\n`;
                guide += `┃ • \`{data}\` ➔ Data da entrada\n`;
                guide += `┃ • \`{saudacao}\` ➔ Bom dia / Boa tarde / Boa noite\n`;
                guide += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                guide += `💡 *Exemplo:* \`.welcome msg Olá {user}, bem-vindo ao {grupo}! Fale com o dono {dono} ou com os admins {adms}. Regras: {desc}\``;
                return reply(guide.trim());
            }

            configs[from].welcomeMessage = customMsg;
            configs[from].welcome = true;
            configs[from].welcomeEnabled = true;
            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🎉 *BOAS-VINDAS SALVA!* 🎉   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ MENSAGEM CONFIGURADA 〕━⬣\n`;
            doc += `┃ 📝 *Texto:* ${customMsg.slice(0, 200)}${customMsg.length > 200 ? "..." : ""}\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Digite_ \`.welcome -config\` _para ver uma simulação completa!_\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 4. ON: Ativa mensagens de boas-vindas
        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim" || opt === "true" || opt === "enable" || opt === "enabled") {
            configs[from].welcome = true;
            configs[from].welcomeEnabled = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[WELCOME] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🎉 *EVENTOS DE BOAS-VINDAS* 🎉   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🎉 *Recurso:* Mensagens de Boas-Vindas (Entrada)\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.welcome off\` | _Para testar:_ \`.welcome -config\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 5. OFF: Desativa mensagens de boas-vindas
        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "desativa" || opt === "nao" || opt === "não" || opt === "false" || opt === "disable" || opt === "disabled" || opt === "del" || opt === "remover") {
            configs[from].welcome = false;
            configs[from].welcomeEnabled = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[WELCOME] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🎉 *EVENTOS DE BOAS-VINDAS* 🎉   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🎉 *Recurso:* Mensagens de Boas-Vindas (Entrada)\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* ${nomeDoMembro(sender)}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar quando desejar:_ \`.welcome on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 6. PAINEL DE STATUS
        const isEnabled = configs[from].welcome === true || configs[from].welcomeEnabled === true;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🎉 *EVENTOS DE BOAS-VINDAS* 🎉   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🎉 *Recurso:* Mensagens de Boas-Vindas\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📝 *Modelo:* ${configs[from].welcomeMessage ? "Personalizado" : "Padrão Oficial"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.welcome on\` ➔ Ativar boas-vindas\n`;
        doc += `• \`.welcome off\` ➔ Desativar boas-vindas\n`;
        doc += `• \`.welcome -config\` ➔ Ver simulação da mensagem\n`;
        doc += `• \`.welcome msg <texto>\` ➔ Personalizar mensagem\n`;
        doc += `• \`.welcome reset\` ➔ Restaurar modelo padrão\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
