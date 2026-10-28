/**
 * Comando .portaldemonio — Abre uma fenda para o Reino dos Demônios: .portaldemonio
 */
module.exports = {
    name: "portaldemonio",
    aliases: ["portaldemonio-cmd","cmd-portaldemonio"],
    category: "rpg",
    subcategory: "Exploração",
    description: "Abre uma fenda para o Reino dos Demônios: .portaldemonio",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const encontros = [
                "Um Demônio Vermelho surge cuspindo Chamas do Purgatório!",
                "Um Demônio Cinza sobrevoa a área entoando Dark Snow!",
                "Um Demônio Azul veloz avança com suas garras afiadas!",
                "Um Demônio Albino ruge abrindo crateras na terra!",
                "O silêncio do Purgatório ecoa... Você coletou 3 Fragmentos de Matéria Escura!"
            ];
            const e = encontros[Math.floor(Math.random() * encontros.length)];
            return reply(`🌑 *FENDA DO REINO DEMONÍACO*\n\nAs trevas se condensam no ar...\n⚠️ *Alerta:* ${e}`);
        }
};
