const dataService = require("../../services/dataService");
const F = require('../../utils/formato');
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "setrules",
    aliases: ["definirregras","editrules","cmd_setrules","alt_setrules","atalho_setrules","abrev_setrules","call_setrules","func_setrules"],
    category: "admin",
    subcategory: "Moderação",
    description: "Define, exibe ou remove as regras do grupo",
    usage: "[regras | limpar]",
    examples: [" — mostra as regras atuais", "1. Respeite todos 2. Sem spam — define as regras", "limpar — remove as regras"],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 10000,
    execute: async ({ from, args, reply, sender, prefix = "." }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (opt === "limpar" || opt === "clear" || opt === "delete" || opt === "remover") {
            configs[from].rules = "";
            await dataService.saveConfigsData(configs);
            logger.info(`[SETRULES] Regras removidas em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📜 *REGRAS DO GRUPO* 📜   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO 〕━⬣\n`;
            doc += `┃ 📜 *Ação:* Regras removidas\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para definir novas regras:_ \`.setrules <regras>\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (!opt || opt === "ver" || opt === "listar" || opt === "status") {
            const rules = configs[from].rules;
            if (!rules) {
                return reply(F.tela({
                    emoji: "📜", titulo: "Regras do grupo", prefix,
                    intro: "Este grupo ainda não tem regras definidas. Escreva as regras depois do comando; pode usar várias linhas na mesma mensagem.",
                    secoes: [{ emoji: "✍️", titulo: "Digite assim", linhas: [F.cmd(prefix, "setrules", "1. Respeite todos") ] }],
                    dica: "Regras curtas e numeradas são lidas; textão ninguém lê. Três a seis itens bastam.",
                    proximos: [
                        { nome: "setrules", args: "1. Respeito 2. Sem spam 3. Sem links", oque: "define as regras" },
                        { nome: "listaregras", oque: "mostra as regras para os membros" }
                    ]
                }));
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📜 *REGRAS DO GRUPO* 📜   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 📋 REGRAS ATUAIS 〕━⬣\n`;
            doc += `┃\n`;
            rules.split("\n").forEach(line => {
                doc += `┃ ${line}\n`;
            });
            doc += `┃\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `📌 *Comandos:*\n`;
            doc += `• \`.setrules <regras>\` — Atualizar regras\n`;
            doc += `• \`.setrules limpar\` — Remover regras\n`;
            doc += `• \`.setrules\` — Ver regras atuais\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        const newRules = args.join(" ").trim();
        if (!newRules) {
            return reply("❌ Informe as regras do grupo.\n\n📌 *Exemplo:* `.setrules 1. Respeite todos\\n2. Sem spam\\n3. Sem links`");
        }

        configs[from].rules = newRules;
        await dataService.saveConfigsData(configs);
        logger.info(`[SETRULES] Regras atualizadas em ${from} por ${sender}`);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📜 *REGRAS DO GRUPO* 📜   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ REGISTRO 〕━⬣\n`;
        doc += `┃ ✅ *Ação:* Regras atualizadas com sucesso\n`;
        doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `━━━━━ [ REGRAS SALVAS ] ━━━━━\n\n`;
        doc += newRules + "\n\n";
        doc += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        doc += `💡 _Para ver as regras:_ \`.setrules\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
