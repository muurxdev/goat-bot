/**
 * Comando .chancede — Calcula a porcentagem mística de probabilidade para qualquer acontecimento
 */
module.exports = {
    name: "chancede",
    aliases: ["chancede-cmd","cmd-chancede"],
    category: "fun",
    subcategory: "Jogos",
    description: "Calcula a porcentagem mística de probabilidade para qualquer acontecimento",
    cooldownMs: 1500,
    execute: async ({ text, reply }) => {
            const raw = String(text || '').trim();
            if (!raw) return reply('📌 Uso: `.chancede eu ficar milionário este ano`');
            const percent = Math.floor(Math.random() * 101);
            let bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
            return reply(`🔮 *ORÁCULO DE PROBABILIDADES*\n\n*Pergunta:* "${raw}"\n*Probabilidade:* *${percent}%*\n\`[${bar}]\``);
        }
};
