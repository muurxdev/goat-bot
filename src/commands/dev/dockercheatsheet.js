/**
 * Comando .dockercheatsheet
 * Guia rápido de comandos Docker e Docker Compose
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "dockercheatsheet",
    aliases: ["comandosdocker","dockerguide","cheatsheetdocker","cmd_dockercheatsheet","alt_dockercheatsheet","atalho_dockercheatsheet","abrev_dockercheatsheet","call_dockercheatsheet","func_dockercheatsheet"],
    category: "dev",
    description: "Guia rápido de comandos Docker e Docker Compose",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "DOCKER & COMPOSE CHEATSHEET",
        icon: "🐳",
        subtitle: "📦 *Gestão de Containers*",
        sections: [
            {
                title: "COMANDOS CHAVE",
                icon: "⚙️",
                fields: [
                    "• `docker compose up -d` ➔ Subir containers em background",
                    "• `docker logs -f <nome>` ➔ Acompanhar logs ao vivo",
                    "• `docker ps -a` ➔ Listar todos os containers",
                    "• `docker exec -it <nome> bash` ➔ Abrir terminal no container",
                    "• `docker system prune -a` ➔ Limpeza geral de imagens e cache"
                ]
            }
        ],
        tip: "Mantenha seus volumes mapeados para persistir seus dados!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
