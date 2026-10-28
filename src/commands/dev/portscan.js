/**
 * Comando .portscan
 * Consulta portas de rede padrão de serviços e protocolos
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "portscan",
    aliases: ["portaspadrao","portasrede","networkingports","cmd_portscan","alt_portscan","atalho_portscan","abrev_portscan","call_portscan","func_portscan"],
    category: "dev",
    description: "Consulta portas de rede padrão de serviços e protocolos",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "TABELA DE PORTAS DE REDE (TCP/UDP)",
        icon: "🔌",
        subtitle: "🌐 *Portas Oficiais IANA*",
        sections: [
            {
                title: "SERVIÇOS ESSENCIAIS",
                icon: "📡",
                fields: [
                    "• HTTP ➔ 80 | HTTPS ➔ 443",
                    "• SSH ➔ 22 | FTP ➔ 21",
                    "• DNS ➔ 53 | DHCP ➔ 67/68",
                    "• MySQL ➔ 3306 | PostgreSQL ➔ 5432",
                    "• Redis ➔ 6379 | MongoDB ➔ 27017"
                ]
            }
        ],
        tip: "Proteja sempre as portas administrativas com firewall!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
