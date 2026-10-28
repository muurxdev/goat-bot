/**
 * Comando .listaregras / .regras / .rules
 * Exibe e permite customizar as regras oficiais do grupo
 */

const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

const REGRAS_PADRAO = [
    "1️⃣ Respeite todos os membros e administradores do grupo.",
    "2️⃣ Proibido envio de conteúdo adulto (NSFW), gore ou violência.",
    "3️⃣ Proibido divulgação de links de outros grupos sem autorização.",
    "4️⃣ Proibido flood, spam de caracteres, áudios e figurinhas travadoras.",
    "5️⃣ Evite brigas e discussões tóxicas — mantenha a harmonia do clã."
];

module.exports = {
    name: "listaregras",
    aliases: ["regras","rules","regrasdogrupo","setregras","cmd_listaregras","alt_listaregras","atalho_listaregras","abrev_listaregras","call_listaregras","func_listaregras"],
    category: "admin",
    description: "Exibe ou atualiza as regras oficiais do grupo",
    groupOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, sender, reply, args, isAdmin, isOwner }) => {
        const configs = dataService.getConfigsData();
        configs[from] = configs[from] || {};

        if (args[0]?.toLowerCase() === "set" && (isAdmin || isOwner)) {
            const novasRegras = args.slice(1).join(" ").trim();
            if (!novasRegras) return reply("❌ Informe as novas regras do grupo após `.setregras`.");

            configs[from].customRegras = novasRegras;
            await dataService.saveConfigsData(configs);
            return reply("✅ *Regras do grupo atualizadas com sucesso!*");
        }

        const regrasAtuais = configs[from].customRegras 
            ? [configs[from].customRegras] 
            : REGRAS_PADRAO;

        const card = renderCard({
            title: "REGRAS OFICIAIS DO GRUPO",
            icon: "📜",
            subtitle: `🛡️ *Grupo:* ${from.split("@")[0]}`,
            sections: [
                {
                    title: "DIRETRIZES & NORMAS DE CONVIVÊNCIA",
                    icon: "⚖️",
                    fields: regrasAtuais
                }
            ],
            tip: "O descumprimento das regras pode resultar em advertência (.warn) ou banimento!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

