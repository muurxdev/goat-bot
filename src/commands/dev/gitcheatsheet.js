/**
 * Comando .gitcheatsheet
 * Guia rápido de comandos Git e controle de versão
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "gitcheatsheet",
    aliases: ["comandosgit","gitguide","cheatsheetgit","cmd_gitcheatsheet","alt_gitcheatsheet","atalho_gitcheatsheet","abrev_gitcheatsheet","call_gitcheatsheet","func_gitcheatsheet"],
    category: "dev",
    description: "Guia rápido de comandos Git e controle de versão",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "GUIA PRÁTICO DE COMANDOS GIT",
        icon: "🐙",
        subtitle: "🌱 *Controle de Versão*",
        sections: [
            {
                title: "FLUXO DIÁRIO",
                icon: "📜",
                fields: [
                    "• `git status` & `git diff` ➔ Ver alterações pendentes",
                    "• `git add . && git commit -m 'msg'` ➔ Gravar commits",
                    "• `git pull --rebase` & `git push` ➔ Sincronizar repositório",
                    "• `git stash` & `git stash pop` ➔ Guardar alterações temporárias",
                    "• `git log --oneline -n 10` ➔ Histórico resumido"
                ]
            }
        ],
        tip: "Use conventional commits (feat, fix, refactor, docs)!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
