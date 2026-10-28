/**
 * Comando .tempoestudo — Recomenda ciclo Pomodoro de foco e pausas: .tempoestudo [horas]
 */
module.exports = {
    name: "tempoestudo",
    aliases: ["tempoestudo-cmd","cmd-tempoestudo"],
    category: "general",
    subcategory: "Produtividade",
    description: "Recomenda ciclo Pomodoro de foco e pausas: .tempoestudo [horas]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const h = parseFloat(args[0]) || 2;
            const blocos = Math.round(h * 60 / 30);
            return reply(`⏱️🍅 *CRONOGRAMA POMODORO (${h}h de foco)*\n\n▫️ ${blocos} ciclos de 25 min de estudo + 5 min de descanso\n▫️ A cada 4 ciclos: Pausa longa de 20 minutos!\nFoco total, sem distrações no celular!`);
        }
};
