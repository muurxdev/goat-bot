/**
 * Comando .medidapressao — Converte Bar para PSI e Atmosferas (atm): .medidapressao <bar>
 */
module.exports = {
    name: "medidapressao",
    aliases: ["medidapressao-cmd","cmd-medidapressao"],
    category: "general",
    subcategory: "Conversão",
    description: "Converte Bar para PSI e Atmosferas (atm): .medidapressao <bar>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const bar = parseFloat(args[0]);
            if (isNaN(bar) || bar < 0) return reply("Uso: `.medidapressao <bar>`");
            const psi = bar * 14.5038;
            const atm = bar * 0.986923;
            return reply(`💨 *Pressão:* ${bar} bar\n▫️ PSI: *${psi.toFixed(2)} psi*\n▫️ Atmosferas: *${atm.toFixed(3)} atm*`);
        }
};
