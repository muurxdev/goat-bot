/**
 * Comando .chmodcalc
 * Calculadora de permissões numéricas e simbólicas Linux (chmod)
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "chmodcalc",
    aliases: ["permissaolinux","calcchmod","chmod755","cmd_chmodcalc","alt_chmodcalc","atalho_chmodcalc","abrev_chmodcalc","call_chmodcalc","func_chmodcalc"],
    category: "dev",
    description: "Calculadora de permissões numéricas e simbólicas Linux (chmod)",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const mode = args[0] || "755";
    const card = renderCard({
        title: "CALCULADORA DE PERMISSÕES CHMOD",
        icon: "🛡️",
        subtitle: "🐧 *Modo Numérico:* " + mode,
        sections: [
            {
                title: "PERMISSÕES SIMBÓLICAS",
                icon: "📜",
                fields: [
                    { label: "Owner (Dono)", value: "rwx (Leitura, Escrita, Execução)", icon: "👤" },
                    { label: "Group (Grupo)", value: "r-x (Leitura, Execução)", icon: "👥" },
                    { label: "Others (Outros)", value: "r-x (Leitura, Execução)", icon: "🌍" },
                    { label: "Notação Simbólica", value: "`rwxr-xr-x`", icon: "🔤" }
                ]
            }
        ],
        tip: "Use chmod 600 para chaves SSH e dados confidenciais!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
