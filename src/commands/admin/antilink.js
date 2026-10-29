const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .antilink Avançado & Granular por Plataforma
 * Suporte a bloqueio geral ou seletivo: whatsapp, canal, telegram, instagram, tiktok, discord, youtube
 * Ações configuráveis: ban, kick, warn, delete
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const { dominioDoLink, plataformaBloqueada, ROTULO_PLATAFORMA } = require("../../utils/linkDetector");
const { textoListaParceiros } = require("../../utils/parceriaLista");

module.exports = {
    name: "antilink",
    aliases: ["bloquearlinks","linkblock","antigrupos","antilinks","cmd_antilink","alt_antilink","atalho_antilink","abrev_antilink","call_antilink","func_antilink"],
    category: "admin",
    description: "Configura proteção anti-link avançada com filtros por plataforma (telegram, whatsapp, instagram, etc.)",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, contextInfo }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        if (!configs[from].antilinkConfig) {
            configs[from].antilinkConfig = {
                enabled: Boolean(configs[from].antilink),
                action: "ban", // ban, kick, warn, delete
                platforms: {
                    whatsapp: true,
                    canal: true,
                    whatsapp_dm: false,
                    telegram: true,
                    instagram: false,
                    tiktok: false,
                    discord: true,
                    youtube: false,
                    outros: false
                }
            };
        }

        const sub = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        // 0. PREVIEW: Simular alerta de anti-link
        if (sub === "preview" || sub === "teste" || sub === "test" || sub === "ver") {
            const { renderCard } = require("../../utils/uiEngine");
            const senderNum = sender.split("@")[0].split(":")[0];
            const cfg = configs[from].antilinkConfig;

            const card = renderCard({
                title: "ALERTA: LINK INTERCEPTADO!",
                icon: "🚫",
                subtitle: `🛡️ *Infrator Simulado:* ${nomeDoMembro(sender)}`,
                sections: [
                    {
                        title: "DETALHES DA INFRAÇÃO",
                        icon: "🔗",
                        fields: [
                            { label: "Link Detectado", value: dominioDoLink("https://chat.whatsapp.com/ExemploConvite123"), icon: "🌐" },
                            { label: "Ação Aplicada", value: `⚡ *${cfg.action.toUpperCase()}*`, icon: "⚖️" },
                            { label: "Regra Violada", value: "Proibido envio de links não autorizados", icon: "📜" }
                        ]
                    }
                ],
                tip: "Links de convites, canais e sites externos são monitorados 24/7!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        const validPlatforms = ["whatsapp", "canal", "whatsapp_dm", "telegram", "instagram", "tiktok", "discord", "youtube", "outros"];
        // Atalhos dos tipos do WhatsApp: .antilink grupo on, .antilink dm off…
        const ALIAS_PLATAFORMA = { grupo: "whatsapp", grupos: "whatsapp", canais: "canal", dm: "whatsapp_dm", privado: "whatsapp_dm", pv: "whatsapp_dm" };

        // 1. Toggle Geral com suporte a ALL ON e ALL OFF
        const isAllOn = (sub === "all" && ["on", "1", "ativar", "sim"].includes(param)) || (["on", "1", "ativar", "sim"].includes(sub) && param === "all");
        const isAllOff = (sub === "all" && ["off", "0", "desativar", "nao"].includes(param)) || (["off", "0", "desativar", "nao"].includes(sub) && param === "all");

        if (isAllOn) {
            configs[from].antilink = true;
            configs[from].antilinkConfig.enabled = true;
            validPlatforms.forEach(p => { configs[from].antilinkConfig.platforms[p] = true; });
            await dataService.saveConfigsData(configs);
            let msg = `🛡️ *ANTI-LINK TOTAL ATIVADO (ALL ON)!*\n\n`;
            msg += `🌐 *Todas as plataformas foram bloqueadas:* WhatsApp (grupo), Canal, DM, Telegram, Instagram, TikTok, Discord, YouTube e Outros links da web.\n`;
            msg += `⚖️ *Punição ativa:* *${configs[from].antilinkConfig.action.toUpperCase()}*\n\n`;
            msg += `💡 _Dica: Para permitir uma rede específica (ex: YouTube), use:_ \`.antilink youtube off\``;
            return reply(msg);
        }

        if (isAllOff) {
            configs[from].antilink = false;
            configs[from].antilinkConfig.enabled = false;
            validPlatforms.forEach(p => { configs[from].antilinkConfig.platforms[p] = false; });
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *ANTI-LINK TOTAL DESATIVADO (ALL OFF)!* Envio de links de todas as plataformas liberado.`);
        }

        if (sub === "on" || sub === "ativar" || sub === "1") {
            configs[from].antilink = true;
            configs[from].antilinkConfig.enabled = true;
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *ANTI-LINK ATIVADO!* Links suspeitos serão filtrados no grupo.\nAção configurada: *${configs[from].antilinkConfig.action.toUpperCase()}*\n💡 _Para ativar bloqueio em TODAS as redes de uma vez:_ \`.antilink all on\``);
        }
        if (sub === "off" || sub === "desativar" || sub === "0") {
            configs[from].antilink = false;
            configs[from].antilinkConfig.enabled = false;
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *ANTI-LINK DESATIVADO!* Envio de links liberado.`);
        }

        // 2. Configurar Ação (.antilink acao <delete|warn|kick|ban>)
        if (sub === "acao" || sub === "action" || sub === "punicao") {
            if (["delete", "apagar", "warn", "advertir", "kick", "expulsar", "ban", "banir"].includes(param)) {
                let normalized = "delete";
                if (param.startsWith("ban")) normalized = "ban";
                else if (param.startsWith("kick") || param.startsWith("exp")) normalized = "kick";
                else if (param.startsWith("warn") || param.startsWith("adv")) normalized = "warn";

                configs[from].antilinkConfig.action = normalized;
                await dataService.saveConfigsData(configs);
                return reply(`⚙️ *Ação do Anti-Link definida como:* *${normalized.toUpperCase()}*`);
            }
            return reply("❌ *Ações disponíveis:* `delete` (apenas apagar), `warn` (advertir), `kick` (expulsar) ou `ban` (banir).");
        }

        // 2.1 Permissão de Links (Whitelist / Parceiros / Afiliados)
        if (sub === "allow" || sub === "permitir" || sub === "liberar") {
            const aiLearning = require("../../services/aiLearningService");
            const target = (contextInfo?.mentionedJid && contextInfo.mentionedJid[0]) || (args[1] ? args[1].replace(/[@\s]/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`💡 Marque o usuário para conceder permissão de link: \`.antilink allow @user\``);
            await aiLearning.allowLinkUser(from, target);
            return reply(`🤝 ${nomeDoMembro(target)} agora é um parceiro/afiliado autorizado e tem permissão para postar links neste grupo!`, [target]);
        }

        if (sub === "disallow" || sub === "revogar" || sub === "bloquearuser") {
            const aiLearning = require("../../services/aiLearningService");
            const target = (contextInfo?.mentionedJid && contextInfo.mentionedJid[0]) || (args[1] ? args[1].replace(/[@\s]/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`💡 Marque o usuário para revogar permissão: \`.antilink disallow @user\``);
            await aiLearning.disallowLinkUser(from, target);
            return reply(`🚫 Permissão de envio de links revogada para ${nomeDoMembro(target)}.`, [target]);
        }

        if (sub === "allowed" || sub === "parceiros" || sub === "whitelist") {
            const { texto, mentions } = textoListaParceiros(configs[from]?.allowedLinkUsers || []);
            return reply(texto, mentions);
        }

        // 3. Configurar Plataformas Individuais (.antilink whatsapp|canal|dm|telegram on/off, etc.)
        const plataforma = ALIAS_PLATAFORMA[sub] || sub;
        if (validPlatforms.includes(plataforma)) {
            const isEnable = ["on", "1", "ativar", "sim"].includes(param);
            const isDisable = ["off", "0", "desativar", "nao"].includes(param);
            if (isEnable || isDisable) {
                configs[from].antilinkConfig.platforms[plataforma] = isEnable;
                if (isEnable && !configs[from].antilink) {
                    configs[from].antilink = true;
                    configs[from].antilinkConfig.enabled = true;
                }
                await dataService.saveConfigsData(configs);
                const rotulo = ROTULO_PLATAFORMA[plataforma] || plataforma.toUpperCase();
                return reply(`⚙️ *Filtro para [${rotulo}]:* ${isEnable ? "🟢 *BLOQUEADO (Proibido)*" : "🔴 *LIBERADO (Permitido)*"}\n💡 _Demais redes continuam conforme configuradas._`);
            }
        }

        // Painel de Status
        const cfg = configs[from].antilinkConfig;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *PAINEL ANTI-LINK AVANÇADO* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📌 *Status Geral:* ${cfg.enabled ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"}\n`;
        doc += `⚖️ *Punição Definida:* \`${cfg.action.toUpperCase()}\`\n\n`;
        doc += `╭━〔 🌐 FILTROS POR PLATAFORMA 〕━⬣\n`;
        for (const plat of validPlatforms) {
            const bloqueada = plataformaBloqueada(cfg.platforms, plat);
            doc += `┃ ${bloqueada ? "🟢" : "🔴"} *${ROTULO_PLATAFORMA[plat] || plat.toUpperCase()}:* ${bloqueada ? "Bloqueado" : "Permitido"}\n`;
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 *Comandos de Configuração:*\n`;
        doc += `• \`.antilink all on\` — Bloquear TODAS as redes de uma vez\n`;
        doc += `• \`.antilink all off\` — Liberar TODAS as redes\n`;
        doc += `• \`.antilink whatsapp on/off\` — Convite de grupo (chat.whatsapp.com)\n`;
        doc += `• \`.antilink canal on/off\` — Canal do WhatsApp\n`;
        doc += `• \`.antilink dm on/off\` — Conversa privada (wa.me, api.whatsapp.com)\n`;
        doc += `• \`.antilink <rede> on/off\` — Alternar outra rede (ex: \`.antilink youtube off\`)\n`;
        doc += `• \`.antilink acao <delete|warn|kick|ban>\` — Definir punição\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
