/**
 * Comando .solardispersion — Conjura explosão Cruel Sun do Sol Escaniano: .solardispersion
 */
module.exports = {
    name: "solardispersion",
    aliases: ["solardispersion-cmd","cmd-solardispersion"],
    category: "rpg",
    subcategory: "Combate",
    description: "Conjura explosão Cruel Sun do Sol Escaniano: .solardispersion",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const calor = Math.floor(Math.random() * 1500) + 1000;
            return reply(`☀️ *CRUEL SUN (Sol Cruel)*\n\n"E quem decidiu isso?"\nUma esfera solar em miniatura paira na ponta do seu indicador!\n🌡️ *Temperatura emitida:* *${calor}°C*\n🌋 A armadura dos oponentes começa a derreter instantaneamente!`);
        }
};
