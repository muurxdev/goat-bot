/**
 * Comando .batalhamagica — Simula duelo de magias aleatórias: .batalhamagica [oponente]
 */
module.exports = {
    name: "batalhamagica",
    aliases: ["batalhamagica-cmd","cmd-batalhamagica"],
    category: "fun",
    subcategory: "Jogos",
    description: "Simula duelo de magias aleatórias: .batalhamagica [oponente]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const op = args.join(" ") || "Cavaleiro Misterioso";
            const ataques = [
                "disparou um raio teleguiado no peito de",
                "abriu uma fenda dimensional sob os pés de",
                "conjurou estacas de gelo afiadas contra",
                "refletiu a bola de fogo mágica direto em"
            ];
            const atq = ataques[Math.floor(Math.random() * ataques.length)];
            return reply(`✨⚔️ *ARENA DE BATALHA MÁGICA*\n\nVocê ${atq} *${op}*!\nO impacto ecoou por todo o vale Central!`);
        }
};
