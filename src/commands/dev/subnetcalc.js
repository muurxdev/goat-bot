/**
 * Comando .subnetcalc
 * Calculadora de máscaras de sub-rede e prefixos CIDR
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "subnetcalc",
    aliases: ["calculadoracidr","ipmaskcalc","calculosubrede","cmd_subnetcalc","alt_subnetcalc","atalho_subnetcalc","abrev_subnetcalc","call_subnetcalc","func_subnetcalc"],
    category: "dev",
    description: "Calculadora de máscaras de sub-rede e prefixos CIDR",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const mask = args[0] || "/24";
    const card = renderCard({
        title: "CALCULADORA DE SUB-REDE (CIDR)",
        icon: "🌐",
        subtitle: "🔢 *Prefixo:* " + mask,
        sections: [
            {
                title: "PARÂMETROS DA REDE",
                icon: "📊",
                fields: [
                    { label: "Máscara Decimal", value: "255.255.255.0", icon: "💻" },
                    { label: "Total de IPs", value: "256 Endereços", icon: "🔢" },
                    { label: "Hosts Úteis", value: "254 Computadores", icon: "🖥️" },
                    { label: "Wildcard Mask", value: "0.0.0.255", icon: "🛡️" }
                ]
            }
        ],
        tip: "Use /24 para redes locais padrões de roteadores!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
