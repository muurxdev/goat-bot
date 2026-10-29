const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .moderacao / .seguranca / .modall
 * Painel Central e Controle Mestre de Moderação e Escudos do Grupo.
 * Permite ativar ou desativar todas as proteções simultaneamente:
 * .moderacao all on  -> Ativa Anti-Link (todas redes), Anti-Trava, Anti-Fake, Anti-Status, Anti-Spam, Anti-Capslock, Anti-Palavrão
 * .moderacao all off -> Desativa todas as proteções
 * .moderacao         -> Exibe o painel de status em tempo real de cada escudo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "moderacao",
    aliases: ["seguranca", "modall", "antidudo", "shields", "protecoes", "defesa", "cmd_moderacao", "modgrupo"],
    category: "admin",
    subcategory: "Moderação",
    description: "Controle mestre de segurança e moderação do grupo (.moderacao all on/off)",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, prefix = "." }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        const cfg = configs[from];

        const sub = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        const isAllOn = (sub === "all" && ["on", "1", "ativar", "sim"].includes(param)) || (["on", "1", "ativar", "sim"].includes(sub) && (param === "all" || !param));
        const isAllOff = (sub === "all" && ["off", "0", "desativar", "nao"].includes(param)) || (["off", "0", "desativar", "nao"].includes(sub) && (param === "all" || !param));

        // 1. ATIVAR TODOS OS ESCUDOS (ALL ON)
        if (isAllOn) {
            // Anti-Link com todas as redes
            cfg.antilink = true;
            if (!cfg.antilinkConfig) {
                cfg.antilinkConfig = { action: "delete", platforms: {} };
            }
            cfg.antilinkConfig.enabled = true;
            const validPlatforms = ["whatsapp", "canal", "telegram", "instagram", "tiktok", "discord", "youtube", "outros"];
            validPlatforms.forEach(p => { cfg.antilinkConfig.platforms[p] = true; });

            // Todos os filtros de segurança
            cfg.antitrava = true;
            cfg.antifake = true;
            cfg.antistatus = true;
            cfg.antispam = true;
            cfg.antiFlood = true;
            cfg.antiCapslock = true;
            cfg.antiProfanity = true;
            cfg.antiscam = true;
            cfg.antiraid = true;

            await dataService.saveConfigsData(configs);

            const card = renderCard({
                title: "ESCUDO DE SEGURANÇA TOTAL ATIVADO!",
                icon: "🛡️",
                subtitle: `👑 *Ativado por:* ${nomeDoMembro(sender)}`,
                sections: [
                    {
                        title: "PROTEÇÕES ATIVADAS (ALL ON)",
                        icon: "⚡",
                        fields: [
                            "🟢 *Anti-Link Geral:* Bloqueando links de todas as redes",
                            "🟢 *Anti-TravaZap:* Bloqueio de travas e mensagens pesadas",
                            "🟢 *Anti-Fake:* Expulsão de números estrangeiros fora do +55",
                            "🟢 *Anti-Status:* Apagamento e warn por marcação em status",
                            "🟢 *Anti-Spam / Flood:* Controle ativo de repetição de mensagens",
                            "🟢 *Anti-Capslock:* Filtro de mensagens em caixa alta",
                            "🟢 *Anti-Palavrão:* Bloqueio automático de palavras proibidas"
                        ]
                    },
                    {
                        title: "PERSONALIZAÇÃO SELETIVA",
                        icon: "⚙️",
                        fields: [
                            `• \`${prefix}antilink youtube off\` ➔ Libera apenas links do YouTube`,
                            `• \`${prefix}moderacao all off\` ➔ Desativa todas as proteções`,
                            `• \`${prefix}moderacao\` ➔ Painel de status em tempo real`
                        ]
                    }
                ],
                tip: "O grupo agora está com a barreira máxima de segurança ativa!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        // 2. DESATIVAR TODOS OS ESCUDOS (ALL OFF)
        if (isAllOff) {
            cfg.antilink = false;
            if (cfg.antilinkConfig) {
                cfg.antilinkConfig.enabled = false;
                const validPlatforms = ["whatsapp", "canal", "telegram", "instagram", "tiktok", "discord", "youtube", "outros"];
                validPlatforms.forEach(p => { cfg.antilinkConfig.platforms[p] = false; });
            }
            cfg.antitrava = false;
            cfg.antifake = false;
            cfg.antistatus = false;
            cfg.antispam = false;
            cfg.antiFlood = false;
            cfg.antiCapslock = false;
            cfg.antiProfanity = false;
            cfg.antiscam = false;
            cfg.antidelete = false;
            cfg.antiraid = false;
            cfg.slowmode = false;

            await dataService.saveConfigsData(configs);

            return reply(`🛡️ *TODAS AS PROTEÇÕES FORAM DESATIVADAS (ALL OFF)!*\n\n⚠️ O grupo está sem barreiras ativas de anti-link, trava, fake, spam ou palavrões.\n💡 _Para reativar tudo:_ \`${prefix}moderacao all on\``);
        }

        // 3. PAINEL DE STATUS GERAL
        const isAntilink = Boolean(cfg.antilink);
        const isAntitrava = Boolean(cfg.antitrava);
        const isAntifake = Boolean(cfg.antifake);
        const isAntistatus = Boolean(cfg.antistatus);
        const isAntispam = Boolean(cfg.antispam || cfg.antiFlood);
        const isCapslock = Boolean(cfg.antiCapslock);
        const isProfanity = Boolean(cfg.antiProfanity);

        const card = renderCard({
            title: "PAINEL MESTRE DE MODERAÇÃO",
            icon: "🛡️",
            subtitle: `⚙️ *Gerenciador de Escudos do Grupo*`,
            sections: [
                {
                    title: "STATUS DOS ESCUDOS DE SEGURANÇA",
                    icon: "📊",
                    fields: [
                        `${isAntilink ? "🟢" : "🔴"} *Anti-Link:* ${isAntilink ? "Ativado" : "Desativado"}`,
                        `${isAntitrava ? "🟢" : "🔴"} *Anti-Trava:* ${isAntitrava ? "Ativado" : "Desativado"}`,
                        `${isAntifake ? "🟢" : "🔴"} *Anti-Fake (+55):* ${isAntifake ? "Ativado" : "Desativado"}`,
                        `${isAntistatus ? "🟢" : "🔴"} *Anti-Status:* ${isAntistatus ? "Ativado" : "Desativado"}`,
                        `${isAntispam ? "🟢" : "🔴"} *Anti-Spam/Flood:* ${isAntispam ? "Ativado" : "Desativado"}`,
                        `${isCapslock ? "🟢" : "🔴"} *Anti-Capslock:* ${isCapslock ? "Ativado" : "Desativado"}`,
                        `${isProfanity ? "🟢" : "🔴"} *Anti-Palavrão:* ${isProfanity ? "Ativado" : "Desativado"}`
                    ]
                },
                {
                    title: "COMANDOS RÁPIDOS",
                    icon: "⚡",
                    fields: [
                        `👉 \`${prefix}moderacao all on\` ➔ Ativa TODAS as proteções`,
                        `👉 \`${prefix}moderacao all off\` ➔ Desativa TODAS as proteções`,
                        `👉 \`${prefix}antilink all on\` ➔ Ativa anti-link em todas as redes`,
                        `👉 \`${prefix}antilink <rede> off\` ➔ Desativa filtro para uma rede (ex: youtube)`
                    ]
                }
            ],
            tip: "Use .moderacao all on para proteger o grupo completamente com 1 comando!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};
