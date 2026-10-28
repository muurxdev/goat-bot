/**
 * Comando .curiosidadenatureza — Fato curioso sobre o reino animal e vegetal: .curiosidadenatureza
 */
module.exports = {
    name: "curiosidadenatureza",
    aliases: ["curiosidadenatureza-cmd","cmd-curiosidadenatureza"],
    category: "general",
    subcategory: "Curiosidades",
    description: "Fato curioso sobre o reino animal e vegetal: .curiosidadenatureza",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const fatos = [
                "O polvo possui três corações e sangue azul à base de cobre!",
                "As árvores de uma mesma floresta se comunicam e trocam nutrientes através de redes subterrâneas de fungos chamadas micorrizas.",
                "O beija-flor é a única ave capaz de voar de marcha à ré e ficar imóvel no ar.",
                "O mel puro nunca estraga! Potes de mel encontrados em tumbas egípcias de 3.000 anos continuam perfeitamente comestíveis."
            ];
            return reply(`🌿🐾 *CURIOSIDADE DA NATUREZA*\n\n${fatos[Math.floor(Math.random() * fatos.length)]}`);
        }
};
