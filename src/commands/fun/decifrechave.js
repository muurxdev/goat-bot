/**
 * Comando .decifrechave — Enigma de lógica e dedução: .decifrechave
 */
module.exports = {
    name: "decifrechave",
    aliases: ["decifrechave-cmd","cmd-decifrechave"],
    category: "fun",
    subcategory: "Enigmas",
    description: "Enigma de lógica e dedução: .decifrechave",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply("🔐 *ENIGMA DO COFRE DOS PECADOS*\n\nDicas para abrir o cofre de 3 dígitos:\n1️⃣ 682 — Um número certo e bem posicionado\n2️⃣ 614 — Um número certo mas mal posicionado\n3️⃣ 206 — Dois números certos mas ambos mal posicionados\n4️⃣ 738 — Nada está correto\n5️⃣ 780 — Um número certo mas mal posicionado\n\nQual é o código?");
        }
};
