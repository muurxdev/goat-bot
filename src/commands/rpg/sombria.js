/**
 * Comando .sombria
 * Tesouro Sagrado do Capitão GOAT: Cria 4 clones físicos e multiplica o dano em 3x a 5x
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "sombria",
    aliases: ["tesourosombria", "clonessombria", "espada-sombria"],
    category: "rpg",
    description: "Libera o poder do Tesouro Sagrado Sombria criando clones com dano multiplicado",
    cooldownMs: 10000,
    execute: async ({ sender, reply, args }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const numClones = Math.floor(Math.random() * 3) + 2; // 2 a 4 clones
        const mult = (numClones * 1.1 + 1.2).toFixed(1); // 3.4x a 5.6x
        const totalDmg = Math.floor(stats.atk * parseFloat(mult));

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🗡️ *LIBERAÇÃO: TESOURO SAGRADO SOMBRIA* 🗡️   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *O Selo do Dragão foi rompido! A Lâmina Demoníaca Sombria divide seu poder em múltiplos clones físicos!*\n\n`;
        doc += `╭━〔 👥 TÉCNICA DOS CLONES FÍSICOS (Jitsuzō Bunshin) 〕━⬣\n`;
        doc += `┃ 👤 *Portador:* @${sender.split("@")[0]}\n`;
        doc += `┃ 👥 *Clones Gerados:* *${numClones} Clones de Combate*\n`;
        doc += `┃ 💥 *Multiplicador de Dano:* *${mult}x Multiplier*\n`;
        doc += `┃ ⚔️ *Ataque Combinado:* *-${totalDmg.toLocaleString("pt-BR")} de Dano Real*\n`;
        doc += `┃ 🐉 *Efeito Adicional:* Todos os clones atacam simultaneamente ignorando 30% da armadura!\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Equipe a Sombria no seu inventário com \`.equipar sombria\` para manter este poder ativo!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};

