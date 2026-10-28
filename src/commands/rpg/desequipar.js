/**
 * Comando .desequipar / .unequip / .tirarequip
 * Remove equipamento de um slot e retorna ao inventário
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateCharacterStats, getItem } = require("../../services/rpgEquipmentService");

module.exports = {
    name: "desequipar",
    aliases: ["unequip", "tirarequip", "removerarmadura", "desarmar"],
    category: "rpg",
    subcategory: "Combate",
    description: "Remove um equipamento de um slot e retorna ao inventário",
    cooldownMs: 1500,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const slotInput = (text || "").toLowerCase().trim();

        const validSlots = ["capacete", "peitoral", "calca", "botas", "arma", "escudo", "amuleto"];
        if (!validSlots.includes(slotInput)) {
            return reply(
                "❌ *Informe o slot que deseja desequipar!*\n\n" +
                "📌 *Slots disponíveis:*\n" +
                "• `capacete` | `peitoral` | `calca`\n" +
                "• `botas` | `arma` | `escudo` | `amuleto`\n\n" +
                "Exemplo: `.desequipar capacete`"
            );
        }

        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        if (!user.slots || !user.slots[slotInput]) {
            return reply(`❌ O seu slot *${slotInput.toUpperCase()}* já está vazio.`);
        }

        const removedItemRef = user.slots[slotInput];
        const removedItem = typeof removedItemRef === "object" ? removedItemRef : getItem(removedItemRef);
        const nomeItem = removedItem ? removedItem.nome : String(removedItemRef);

        // Retorna o item ao inventário
        if (!Array.isArray(user.inventario)) user.inventario = [];
        if (removedItem) {
            user.inventario.push({ ...removedItem });
        } else {
            user.inventario.push(nomeItem);
        }

        user.slots[slotInput] = null;
        if (slotInput === "arma") {
            user.arma = null;
        }

        await dataService.saveXpData(xpData);
        const stats = calculateCharacterStats(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *EQUIPAMENTO REMOVIDO* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Item removido:* *${nomeItem}*\n`;
        doc += `🏷️ *Slot:* *${slotInput.toUpperCase()}* agora está vazio.\n`;
        doc += `📦 *Retornado ao inventário:* ${user.inventario.length} itens\n`;
        doc += `⚡ *Poder Atual (CP):* *${stats.cp.toLocaleString("pt-BR")} CP*\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
