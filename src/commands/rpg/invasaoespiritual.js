/**
 * Comando .invasaoespiritual — Projeta a invasão mental de Mago: .invasaoespiritual
 */
module.exports = {
    name: "invasaoespiritual",
    aliases: ["invasaoespiritual-cmd","cmd-invasaoespiritual"],
    category: "rpg",
    subcategory: "Magia",
    description: "Projeta a invasão mental de Mago: .invasaoespiritual",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const efeitos = [
                "Rewrite Light: Memórias do oponente alteradas temporariamente!",
                "Nightmare Teller: O inimigo revive seus maiores pesadelos!",
                "Broadcast: Pensamentos coordenados transmitidos a todos os aliados!",
                "Jack: Controle motor sobre os movimentos do alvo!"
            ];
            const ef = efeitos[Math.floor(Math.random() * efeitos.length)];
            return reply(`🏹 *INVASION (Invasão de Mago)*\n\nFagulhas de luz violeta atravessam a fronte do adversário...\n🧠 *Efeito Psíquico:* ${ef}`);
        }
};
