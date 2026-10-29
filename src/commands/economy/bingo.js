const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .bingo / .jogobingo / .cartelabingo
 * Rodada de bingo no grupo com cartela gerada aleatoriamente
 */

const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "bingo",
    aliases: ["jogobingo","cartelabingo","sorteiobingo","cmd_bingo","alt_bingo","atalho_bingo","abrev_bingo","call_bingo","func_bingo"],
    category: "economy",
    description: "Gera sua cartela de bingo da sorte com números de 1 a 75",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        function randNumbers(min, max, count) {
            const arr = [];
            while (arr.length < count) {
                const n = Math.floor(Math.random() * (max - min + 1)) + min;
                if (!arr.includes(n)) arr.push(n);
            }
            return arr.sort((a, b) => a - b);
        }

        const b = randNumbers(1, 15, 5);
        const i = randNumbers(16, 30, 5);
        const n = randNumbers(31, 45, 5);
        const g = randNumbers(46, 60, 5);
        const o = randNumbers(61, 75, 5);

        const card = renderCard({
            title: "CARTELA OFICIAL DE BINGO",
            icon: "🎱",
            subtitle: `👤 *Jogador:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "B   I   N   G   O",
                    icon: "🎟️",
                    fields: [
                        `• [ ${b[0]} ][ ${i[0]} ][ ${n[0]} ][ ${g[0]} ][ ${o[0]} ]`,
                        `• [ ${b[1]} ][ ${i[1]} ][ ${n[1]} ][ ${g[1]} ][ ${o[1]} ]`,
                        `• [ ${b[2]} ][ ${i[2]} ][ ⭐ ][ ${g[2]} ][ ${o[2]} ]`,
                        `• [ ${b[3]} ][ ${i[3]} ][ ${n[3]} ][ ${g[3]} ][ ${o[3]} ]`,
                        `• [ ${b[4]} ][ ${i[4]} ][ ${n[4]} ][ ${g[4]} ][ ${o[4]} ]`
                    ]
                }
            ],
            tip: "Marque os números conforme os sorteios nos eventos comunitários!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

