/**
 * Comando .forjareliquia — Forja uma relíquia sagrada ancestral do Reino: .forjareliquia
 */
module.exports = {
    name: "forjareliquia",
    aliases: ["forjareliquia-cmd","cmd-forjareliquia"],
    category: "rpg",
    subcategory: "Forja",
    description: "Forja uma relíquia sagrada ancestral do Reino: .forjareliquia",
    cooldownMs: 3000,
    execute: async ({ reply, sender }) => {
            const reliquias = [
                { nome: "Espada de Liz", tipo: "Espada Curta", bonus: "+120 ATQ", raridade: "Rara 🔵" },
                { nome: "Tesouro Sagrado Espiritual", tipo: "Lança Espiritual", bonus: "+350 MAG", raridade: "Lendária 🟡" },
                { nome: "Tesouro Sagrado", tipo: "Martelo de Guerra", bonus: "+300 DEF", raridade: "Épica 🟣" },
                { nome: "Arco Gêmeo Duplo", tipo: "Arco de Energia", bonus: "+280 VEL", raridade: "Épica 🟣" },
                { nome: "Machado Sagrado Rhitta", tipo: "Machado de Uma Mão", bonus: "+500 FOR", raridade: "Mítica 🔴" },
                { nome: "Espada Sombria", tipo: "Espada Curva", bonus: "+450 ATQ", raridade: "Mítica 🔴" },
                { nome: "Bastão Courechouse", tipo: "Nunchaku Quádruplo", bonus: "+220 VEL", raridade: "Rara 🔵" },
                { nome: "Orbe Aldan", tipo: "Orbe Mágico", bonus: "+480 MAG", raridade: "Mítica 🔴" }
            ];
            const r = reliquias[Math.floor(Math.random() * reliquias.length)];
            const custoOuro = Math.floor(Math.random() * 500) + 150;
            return reply(`⚔️ *FORJA ANCESTRAL DE REINO*\n\nO mestre ferreiro golpeou a bigorna mágica!\n✨ *Item:* ${r.nome}\n🗡️ *Tipo:* ${r.tipo}\n💎 *Raridade:* ${r.raridade}\n🔥 *Bônus:* ${r.bonus}\n💰 *Custo avaliado:* ${custoOuro} Moedas de Ouro\n\n🛡️ *A bênção dos Sete Traços repousa nesta arma!*`);
        }
};
