/**
 * Comando .grimorio (Grimório de Magias e Habilidades)
 * Sistema de feitiços arcanos com habilidades ativas e passivas em combate
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

const SPELLS_DB = [
    { id: "chamas", name: "🔥 Chamas do Purgatório", minLevel: 5, cost: 2500, type: "Ofensiva", bonusAtk: 120, desc: "Incendeia o inimigo causando +120 de Dano Contínuo" },
    { id: "escudo", name: "🛡️ Escudo de Diamante", minLevel: 10, cost: 6000, type: "Defensiva", bonusDef: 95, desc: "Barreira impenetrável que adiciona +95 de DEF" },
    { id: "contraataquetotal", name: "⚡ Contra-ataque Total Espiritual", minLevel: 20, cost: 15000, type: "Reflexão", bonusCrit: 20, desc: "Reflete ataques mágicos com +20% de Chance Crítica" },
    { id: "solcruel", name: "☀️ Sol Cruel de Herói", minLevel: 35, cost: 40000, type: "Suprema", bonusAtk: 450, desc: "Explosão solar massiva que adiciona +450 de Dano Explosivo" },
    { id: "arcanjo", name: "🪽 Luz dos Quatro Arcanjos", minLevel: 50, cost: 100000, type: "Divina", bonusAtk: 900, bonusDef: 500, desc: "Bênção suprema com +900 ATK e +500 DEF em todas as batalhas" }
];

module.exports = {
    name: "grimorio",
    aliases: ["magias", "skills", "feiticos", "spellbook"],
    category: "rpg",
    description: "Exibe, aprende e equipa feitiços arcanos do Grimório Mágico",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        if (!Array.isArray(user.grimoireSpells)) {
            user.grimoireSpells = [];
        }

        const sub = (args[0] || "").toLowerCase();
        const spellId = (args[1] || "").toLowerCase();

        // 1. Aprender Feitiço
        if (sub === "aprender" || sub === "comprar" || sub === "desbloquear") {
            const spell = SPELLS_DB.find(s => s.id === spellId || s.name.toLowerCase().includes(spellId));
            if (!spell) {
                return reply(`❌ Feitiço não encontrado. Digite \`.grimorio\` para ver os feitiços disponíveis.`);
            }

            if (user.grimoireSpells.includes(spell.id)) {
                return reply(`⚠️ Você já domina o feitiço **${spell.name}**!`);
            }

            if ((user.level || 1) < spell.minLevel) {
                return reply(`🔒 Nível insuficiente: Você precisa ser **Nível ${spell.minLevel}** para aprender este feitiço (Seu nível: ${user.level || 1}).`);
            }

            if ((user.coins || 0) < spell.cost) {
                return reply(`🪙 Moedas insuficientes: O feitiço custa **${spell.cost.toLocaleString("pt-BR")} Coins** (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= spell.cost;
            user.grimoireSpells.push(spell.id);
            await dataService.saveXpData(xpData);

            return reply(`✨ *FEITIÇO ARCANO APRENDIDO COM SUCESSO!*\n\n📖 *Grimório Atualizado:* ${spell.name}\n📜 *Efeito Ativo:* ${spell.desc}\n💰 *Investimento:* -${spell.cost.toLocaleString("pt-BR")} Coins`);
        }

        // 2. Exibição Geral do Grimório
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    📜 *GRIMÓRIO DE MAGIAS ARCANAS* 📜  \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Mago / Guerreiro:* @${sender.split("@")[0]}\n`;
        doc += `⭐ *Nível:* ${user.level || 1}  |  ⚡ *Poder de Combate:* ${stats.cp} CP\n`;
        doc += `📖 *Magias Dominadas:* ${user.grimoireSpells.length} / ${SPELLS_DB.length}\n\n`;

        doc += `╭━〔 ✨ CATÁLOGO DE FEITIÇOS 〕━⬣\n`;
        SPELLS_DB.forEach(sp => {
            const unlocked = user.grimoireSpells.includes(sp.id);
            const canLearn = (user.level || 1) >= sp.minLevel;
            const icon = unlocked ? "🟢 [DOMINADO]" : (canLearn ? "🟡 [DISPONÍVEL]" : "🔒 [BLOQUEADO]");

            doc += `┃ ${sp.name} — ${icon}\n`;
            doc += `┃    📜 *Efeito:* ${sp.desc}\n`;
            doc += `┃    📌 *Requisito:* Nível ${sp.minLevel} | 💰 *Custo:* ${sp.cost.toLocaleString("pt-BR")} Coins\n`;
            if (!unlocked && canLearn) {
                doc += `┃    💡 *Aprender:* \`.grimorio aprender ${sp.id}\`\n`;
            }
            doc += `┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Para aprender uma magia:_ \`.grimorio aprender <nome>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
