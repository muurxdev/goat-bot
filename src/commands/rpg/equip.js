/**
 * Comando .equip / .use
 * Wrapper para o sistema de slots — direciona para .equipar (slot-based)
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const { getItem } = require('../../services/rpgEquipmentService');
const logger = require('../../core/logger');

module.exports = {
    name: 'equip',
    aliases: ['use'],
    category: 'rpg',
    subcategory: 'Combate',
    description: 'Equipa um item do inventário — usa o sistema de slots do boneco',
    cooldownMs: 1500,
    execute: async ({ sender, text, reply }) => {
        if (!text) {
            return reply(
                '❌ *Informe o nome do equipamento que deseja equipar!*\n\n' +
                '📌 *Exemplo:* `.equip Espada de Ferro`\n\n' +
                '💡 _Este comando agora usa o sistema de slots._\n' +
                'Comando completo: `.equipar <nome>`'
            );
        }

        const itemName = text.trim();
        const item = getItem(itemName);

        if (!item) {
            return reply(`❌ Equipamento *"${itemName}"* não encontrado nos registros de Reino.`);
        }

        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        if (!user.slots) {
            user.slots = { capacete: null, peitoral: null, calca: null, botas: null, arma: null, escudo: null, amuleto: null };
        }

        // Verifica posse no inventário — suporta AMBOS os formatos
        const inventario = Array.isArray(user.inventario) ? user.inventario : [];
        const hasItem = inventario.some(i => {
            if (typeof i === 'object' && i !== null) {
                return i.id === item.id || (i.nome && i.nome.toLowerCase().includes(item.nome.toLowerCase()));
            }
            if (typeof i === 'string') {
                return i.toLowerCase().includes(item.nome.toLowerCase());
            }
            return false;
        });

        const env = require('../../config/env');
        const isOwner = Boolean(user.isOwner || env.isOwnerJid(sender));
        if (!hasItem && !isOwner && item.preco > 500) {
            return reply(`❌ Você não possui *${item.nome}* no seu inventário. Adquira na loja com \`.shoparmas\` ou \`.shoparmaduras\`.`);
        }

        // Equipa no slot correto
        const targetSlot = item.slot;
        const previousItem = user.slots[targetSlot];

        user.slots[targetSlot] = item.id;
        if (targetSlot === 'arma') {
            user.arma = item.id;
        }

        await dataService.saveXpData(xpData);
        logger.info(`[EQUIP] ${sender} equipou ${item.nome} no slot ${targetSlot}`);

        const stats = require('../../services/characterEngine').calculateFullCharacterStats(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚔️ *EQUIPAMENTO EQUIPADO* ⚔️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Você equipou:* *${item.nome}*\n`;
        doc += `🏷️ *Slot:* *${targetSlot.toUpperCase()}*\n`;
        doc += `💎 *Raridade:* ${item.raridade}\n\n`;
        doc += `⚡ *Poder de Combate (CP):* **${stats.cp.toLocaleString("pt-BR")} CP**\n\n`;
        doc += `💡 _Veja todos os slots com_ \`.boneco\` _ou_\n`;
        doc += `_veja os itens com_ \`.inv\``;

        return reply(doc.trim());
    }
};
