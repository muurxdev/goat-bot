/**
 * Comando .unitconverter
 * Conversor de unidades de armazenamento digital (Bytes, MB, GB, TB)
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "unitconverter",
    aliases: ["convertebytes","bytesparagb","dadosconverter","cmd_unitconverter","alt_unitconverter","atalho_unitconverter","abrev_unitconverter","call_unitconverter","func_unitconverter"],
    category: "dev",
    description: "Conversor de unidades de armazenamento digital (Bytes, MB, GB, TB)",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const gb = parseInt(args[0], 10) || 16;
    const card = renderCard({
        title: "CONVERSOR DE DADOS DIGITAIS",
        icon: "💾",
        subtitle: "📊 *Base de Cálculo:* " + gb + " GB",
        sections: [
            {
                title: "EQUIVALÊNCIAS",
                icon: "🔢",
                fields: [
                    { label: "MegaBytes (MB)", value: (gb * 1024) + " MB", icon: "📦" },
                    { label: "KiloBytes (KB)", value: (gb * 1024 * 1024) + " KB", icon: "📑" },
                    { label: "Bytes (B)", value: (gb * 1024 * 1024 * 1024) + " Bytes", icon: "🗂️" }
                ]
            }
        ],
        tip: "1 GB equivale a exatamente 1.024 MB em base binária!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
