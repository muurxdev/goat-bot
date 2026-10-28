/**
 * Comando .linuxcommands
 * Dicionário de comandos Linux essenciais
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "linuxcommands",
    aliases: ["comandoslinux","linuxcheatsheet","terminalcommands","cmd_linuxcommands","alt_linuxcommands","atalho_linuxcommands","abrev_linuxcommands","call_linuxcommands","func_linuxcommands"],
    category: "dev",
    description: "Dicionário de comandos Linux essenciais",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "GUIA DE COMANDOS LINUX (BASH)",
        icon: "🐧",
        subtitle: "💻 *Comandos Administrativos*",
        sections: [
            {
                title: "COMANDOS MAIS USADOS",
                icon: "📜",
                fields: [
                    "• `ls -la` ➔ Listar arquivos com detalhes e ocultos",
                    "• `grep -rn 'termo' .` ➔ Buscar texto em arquivos",
                    "• `df -h` & `free -h` ➔ Checar disco e memória RAM",
                    "• `systemctl status <serviço>` ➔ Status de daemons",
                    "• `htop` / `top` ➔ Monitoramento de CPU em tempo real"
                ]
            }
        ],
        tip: "Use pipes (|) para encadear filtros e comandos!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
