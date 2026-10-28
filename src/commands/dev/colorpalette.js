/**
 * Comando .colorpalette / .paleta / .gerarpaleta
 * Gerador de paletas de cores harmônicas para designers e desenvolvedores
 */

const { renderCard } = require("../../utils/uiEngine");

const PALETAS = [
    { nome: "GOAT Dragon Wrath", cores: ["#FF2A2A", "#1A1A1A", "#8B0000", "#FFD700", "#FFFFFF"] },
    { nome: "Cyberpunk Neon Night", cores: ["#FF007F", "#00F0FF", "#7928CA", "#FFE600", "#121212"] },
    { nome: "Forest Fairy King", cores: ["#2E7D32", "#81C784", "#A5D6A7", "#4E342E", "#F1F8E9"] },
    { nome: "Celestial Goddess", cores: ["#E0F7FA", "#80DEEA", "#4DD0E1", "#FFF9C4", "#FFFFFF"] }
];

module.exports = {
    name: "colorpalette",
    aliases: ["paleta","gerarpaleta","cores","paletadecores","cmd_colorpalette","alt_colorpalette","atalho_colorpalette","abrev_colorpalette","call_colorpalette","func_colorpalette"],
    category: "dev",
    description: "Gera paletas de cores harmônicas com códigos Hexadecimais",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const paleta = PALETAS[Math.floor(Math.random() * PALETAS.length)];

        const fields = paleta.cores.map((c, i) => `🎨 *Cor ${i + 1}:* \`${c}\``);

        const card = renderCard({
            title: "PALETA DE CORES HARMÔNICA",
            icon: "🎨",
            subtitle: `✨ *Tema:* ${paleta.nome}`,
            sections: [
                {
                    title: "CÓDIGOS HEXADECIMAIS",
                    icon: "🖌️",
                    fields: fields
                }
            ],
            tip: "Copie os códigos Hex para usar em seus designs, sites ou aplicativos!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

