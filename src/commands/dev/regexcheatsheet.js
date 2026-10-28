/**
 * Comando .regexcheatsheet
 * Guia prático e rápido de Expressões Regulares (Regex)
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "regexcheatsheet",
    aliases: ["guiaregex","expressoesregulares","regexguide","cmd_regexcheatsheet","alt_regexcheatsheet","atalho_regexcheatsheet","abrev_regexcheatsheet","call_regexcheatsheet","func_regexcheatsheet"],
    category: "dev",
    description: "Guia prático e rápido de Expressões Regulares (Regex)",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "GUIA PRÁTICO DE REGEX",
        icon: "🔤",
        subtitle: "🔍 *Padrões de Correspondência*",
        sections: [
            {
                title: "SÍMBOLOS MAIS USADOS",
                icon: "📜",
                fields: [
                    "• `^` ➔ Início da linha | `$` ➔ Fim da linha",
                    "• `\\d` ➔ Qualquer dígito (0-9) | `\\w` ➔ Qualquer caractere",
                    "• `+` ➔ 1 ou mais ocorrências | `*` ➔ 0 ou mais",
                    "• `[a-z]` ➔ Intervalo | `(?:...)` ➔ Grupo não-capturador"
                ]
            }
        ],
        tip: "Use .regex <pattern> <texto> para testar na prática!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
