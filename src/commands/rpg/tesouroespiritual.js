/**
 * Comando .tesouroespiritual — Libera a forma primordial do seu Tesouro Espiritual: .tesouroespiritual
 */
module.exports = {
    name: "tesouroespiritual",
    aliases: ["tesouroespiritual-cmd","cmd-tesouroespiritual"],
    category: "rpg",
    subcategory: "Combate",
    description: "Libera a forma primordial do seu Tesouro Espiritual: .tesouroespiritual",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const formas = [
                "Forma Um: Espiritual (Lança Perfurante da Floresta)",
                "Forma Dois: Guardian (Besta Musgosa Amortecedora)",
                "Forma Três: Fossilization (Glaive de Petrificação)",
                "Forma Quatro: Sunflowers (Luz Solar Destrutiva)",
                "Forma Cinco: Increase (Milhares de lâminas teleguiadas)",
                "Forma Sete: Luminosity (Orbe de Iluminação e Campo Magnético)",
                "Forma Oito: Pollen Garden (Barreira impenetrável e Cura celular)"
            ];
            const f = formas[Math.floor(Math.random() * formas.length)];
            return reply(`🌿 *LIBERAÇÃO DO TESOURO SAGRADO!*\n\nHarlequin comanda os movimentos da sua mente...\n✨ *Ativação:* ${f}`);
        }
};
