/**
 * Comando .baseconvert
 * Converte números entre Binário, Decimal, Octal e Hexadecimal
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "baseconvert",
    aliases: ["converterbase","hexdecbin","basesnumericas","cmd_baseconvert","alt_baseconvert","atalho_baseconvert","abrev_baseconvert","call_baseconvert","func_baseconvert"],
    category: "dev",
    description: "Converte números entre Binário, Decimal, Octal e Hexadecimal",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const num = parseInt(args[0], 10) || 255;
    const card = renderCard({
        title: "CONVERSOR DE BASES NUMÉRICAS",
        icon: "🔢",
        subtitle: "🧮 *Valor Decimal:* " + num,
        sections: [
            {
                title: "REPRESENTAÇÕES",
                icon: "📊",
                fields: [
                    { label: "Binário (Base 2)", value: num.toString(2), icon: "0️⃣" },
                    { label: "Octal (Base 8)", value: num.toString(8), icon: "8️⃣" },
                    { label: "Decimal (Base 10)", value: num.toString(10), icon: "🔟" },
                    { label: "Hexadecimal (Base 16)", value: "0x" + num.toString(16).toUpperCase(), icon: "🔤" }
                ]
            }
        ],
        tip: "Digite .baseconvert <numero> para converter qualquer inteiro!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
