/**
 * Comando .duelogrupo — Simula chaveamento de duelo de dois combatentes: .duelogrupo <nome1> <nome2>
 */
module.exports = {
    name: "duelogrupo",
    aliases: ["duelogrupo-cmd","cmd-duelogrupo"],
    category: "fun",
    subcategory: "Jogos",
    description: "Simula chaveamento de duelo de dois combatentes: .duelogrupo <nome1> <nome2>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const n1 = args[0] || "Combatente 1", n2 = args[1] || "Combatente 2";
            const vencedor = Math.random() > 0.5 ? n1 : n2;
            return reply(`⚔️ *DUELO DE REINO*\n\n[${n1}] ⚡ VS ⚡ [${n2}]\nApós troca intensa de golpes de espada...\n🏆 *VENCEDOR:* *${vencedor}* com golpe decisivo!`);
        }
};
