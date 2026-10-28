/**
 * Comando .curiosidadepaises — Fato interessante sobre nações e culturas: .curiosidadepaises
 */
module.exports = {
    name: "curiosidadepaises",
    aliases: ["curiosidadepaises-cmd","cmd-curiosidadepaises"],
    category: "general",
    subcategory: "Curiosidades",
    description: "Fato interessante sobre nações e culturas: .curiosidadepaises",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const fatos = [
                "O Canadá possui mais lagos naturais do que o restante do mundo inteiro somado!",
                "A bandeira do Nepal é a única bandeira nacional do mundo que não possui formato retangular.",
                "A Islândia não tem mosquitos, graças às suas rápidas mudanças cíclicas de congelamento e degelo.",
                "A Rússia abrange 11 fusos horários diferentes simultaneamente."
            ];
            return reply(`🌍🚩 *CURIOSIDADE DO MUNDO*\n\n${fatos[Math.floor(Math.random() * fatos.length)]}`);
        }
};
