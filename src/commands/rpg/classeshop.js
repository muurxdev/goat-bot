/**
 * Comando .classeshop / .lojaclasses
 * Loja de Classes RPG — compra, visualização e informações
 */

const { getBotName } = require("../../config/botConfig");
const { classes, classesLendarias } = require("../../utils/constants");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

const precosClasses = {
    guerreiro: 800,
    mago: 800,
    arqueiro: 900,
    curandeiro: 1000,
    ladino: 1000,
    paladino: 1200,
    necromante: 1500,
    berserker: 1800
};

module.exports = {
    name: 'classeshop',
    aliases: ['lojaclasses', 'lojaclasse', 'escolherclasse'],
    category: 'rpg',
    subcategory: 'Classes',
    description: 'Loja de Classes RPG — compre e gerencie sua classe',
    cooldownMs: 2000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const sub = (args[0] || '').toLowerCase().trim();

        if (sub === 'info' || sub === 'ver') {
            const classeId = (args[1] || '').toLowerCase().trim();
            const c = classes[classeId] || classesLendarias[classeId];
            if (!c) {
                return reply(`❌ Classe não encontrada. Use \`.classeshop\` para ver a lista.`);
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📋 *INFORMAÇÕES DA CLASSE* 📋   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✨ *Nome:* ${c.nome}\n`;
            doc += `📜 *Descrição:* ${c.descricao || c.requisito}\n`;
            doc += `🌟 *Habilidade:* ${c.habilidade}\n\n`;

            if (precosClasses[classeId]) {
                doc += `💰 *Preço:* ${precosClasses[classeId].toLocaleString('pt-BR')} Coins\n`;
                doc += `🛒 *Comprar:* \`.comprarclasse ${classeId}\`\n`;
            } else if (c.requisito) {
                doc += `📌 *Requisito:* ${c.requisito}\n`;
                doc += `🛒 *Desbloquear:* \`.lendaria desbloquear ${classeId}\`\n`;
            }

            return reply(doc.trim());
        }

        const classeAtual = user.classe ? (classes[user.classe]?.nome || user.classe) : 'Nenhuma';
        const lendariaAtual = user.classeLendaria ? (classesLendarias[user.classeLendaria]?.nome || user.classeLendaria) : 'Nenhuma';

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚔️ *LOJA DE CLASSES DE REINO* ⚔️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Sua Classe:* *${classeAtual}*\n`;
        doc += `👑 *Classe Lendária:* *${lendariaAtual}*\n`;
        doc += `💰 *Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n\n`;

        doc += `╭━〔 🛡️ CLASSES BÁSICAS 〕━⬣\n`;
        Object.entries(classes).forEach(([id, c]) => {
            const preco = precosClasses[id];
            const isAtual = user.classe === id;
            doc += `┃ ${c.nome} ${isAtual ? '✅ *(SUA CLASSE)*' : ''}\n`;
            doc += `┃   🌟 ${c.habilidade}\n`;
            doc += `┃   💰 ${preco.toLocaleString('pt-BR')} Coins`;
            if (!isAtual) {
                doc += `  |  🛒 \`.comprarclasse ${id}\``;
            }
            doc += `\n┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `╭━〔 👑 CLASSES LENDÁRIAS 〕━⬣\n`;
        Object.entries(classesLendarias).forEach(([id, l]) => {
            doc += `┃ ${l.nome}\n`;
            doc += `┃   📌 Req: ${l.requisito}\n`;
            doc += `┃   🌟 ${l.habilidade}\n┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Comprar:_ \`.comprarclasse <id>\`\n`;
        doc += `💡 _Info:_ \`.classeshop info <id>\`\n`;
        doc += `💡 _Lendárias:_ \`.lendaria lista\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
