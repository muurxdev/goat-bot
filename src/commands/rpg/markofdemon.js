/**
 * Comando .markofdemon — Ativa a Marca Negra Demoníaca: .markofdemon
 */
module.exports = {
    name: "markofdemon",
    aliases: ["markofdemon-cmd","cmd-markofdemon"],
    category: "rpg",
    subcategory: "Poder",
    description: "Ativa a Marca Negra Demoníaca: .markofdemon",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const poder = Math.floor(Math.random() * 20000) + 32000;
            return reply(`👿 *MARCA DO CLÃ DOS DEMÔNIOS ATIVADA*\n\nA marca espiral negra cobre a sua testa e os olhos tornam-se negros como a noite!\n🔥 *Nível de Poder saltou para:* *${poder.toLocaleString('pt-BR')}*\nA matéria escura agora forma asas e lâminas retráteis ao seu comando!`);
        }
};
