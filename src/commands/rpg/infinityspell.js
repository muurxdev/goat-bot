/**
 * Comando .infinityspell — Canaliza a benção de magia infinita de Mago: .infinityspell
 */
module.exports = {
    name: "infinityspell",
    aliases: ["infinityspell-cmd","cmd-infinityspell"],
    category: "rpg",
    subcategory: "Magia",
    description: "Canaliza a benção de magia infinita de Mago: .infinityspell",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply(`🔮 *INFINITY (Magia Infinita de Mago)*\n\n▫️ *Usuária:* Mago, a Filha de Belialuin\n▫️ *Efeito:* Uma vez conjurado, qualquer feitiço dura para sempre até ser cancelado pela própria maga.\n▫️ O gelo não derrete, o fogo não se apaga, o tempo para os aliados permanece congelado!`);
        }
};
